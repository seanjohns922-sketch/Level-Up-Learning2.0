-- Student logins stop answering after too many wrong access codes. Both logins
-- are open to signed-out visitors and take a 4-digit code, so without a limit
-- anyone could try all 10,000 codes for a known class and name (school login)
-- or a guessable username (home login) in minutes.
--
-- Rule: 10 wrong tries for the same login name within 15 minutes pauses that
-- name for 15 minutes. A correct login clears the count. A school login name is
-- the class plus the typed name; a home login name is the typed username.
-- Names are compared trimmed and case-insensitive, the same way the lookups
-- match them. Other students and classes are unaffected.
--
-- The two existing lookups are kept exactly as they are live: each is renamed
-- to *_unthrottled (callable only by the database owner) and a guard function
-- takes its old name, signature, result columns and grants.
--
-- Schema: table public.student_login_throttles (RLS on, no policies, no client
-- grants), three helper functions, two guard functions. Data: none.
-- Rollback:
--   drop function public.student_login_lookup(uuid, text, text);
--   drop function public.home_student_login_lookup(text, text);
--   alter function public.student_login_lookup_unthrottled(uuid, text, text) rename to student_login_lookup;
--   alter function public.home_student_login_lookup_unthrottled(text, text) rename to home_student_login_lookup;
--   grant execute on both to anon, authenticated;
--   drop the three student_login_* helpers and the table.

begin;

do $check$
declare
  v_expected constant text := 'TABLE(student_id uuid, display_name text, first_name text, last_name text, '
    || 'username text, class_id uuid, school_year_level text, working_level text, year_level text, session_token text)';
begin
  if pg_get_function_result('public.student_login_lookup(uuid,text,text)'::regprocedure) <> v_expected
    or pg_get_function_result('public.home_student_login_lookup(text,text)'::regprocedure) <> v_expected then
    raise exception 'A live student login returns different columns than expected; nothing was changed';
  end if;
end;
$check$;

create table public.student_login_throttles (
  login_key text primary key,
  failed_count integer not null,
  window_started_at timestamptz not null,
  locked_until timestamptz
);
create index student_login_throttles_window_idx
  on public.student_login_throttles (window_started_at);
alter table public.student_login_throttles enable row level security;
revoke all on public.student_login_throttles from public, anon, authenticated;

create function public.student_login_assert_allowed(p_login_key text)
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.student_login_throttles throttle
    where throttle.login_key = p_login_key
      and throttle.locked_until > now()
  ) then
    raise exception 'Too many tries. Wait 15 minutes, or ask your teacher or parent to check your login.'
      using errcode = 'P0001', hint = 'student_login_locked';
  end if;
end;
$$;

create function public.student_login_record_failure(p_login_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  c_window constant interval := interval '15 minutes';
  c_max_failures constant integer := 10;
begin
  delete from public.student_login_throttles throttle
  where throttle.window_started_at < now() - interval '1 day'
    and (throttle.locked_until is null or throttle.locked_until < now());

  insert into public.student_login_throttles as throttle (login_key, failed_count, window_started_at)
  values (p_login_key, 1, now())
  on conflict (login_key) do update
  set failed_count = case
        when throttle.window_started_at < now() - c_window then 1
        else throttle.failed_count + 1
      end,
      window_started_at = case
        when throttle.window_started_at < now() - c_window then now()
        else throttle.window_started_at
      end,
      locked_until = null;

  update public.student_login_throttles throttle
  set locked_until = now() + c_window
  where throttle.login_key = p_login_key
    and throttle.failed_count >= c_max_failures;
end;
$$;

create function public.student_login_clear_failures(p_login_key text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.student_login_throttles where login_key = p_login_key;
$$;

alter function public.student_login_lookup(uuid, text, text)
  rename to student_login_lookup_unthrottled;
alter function public.home_student_login_lookup(text, text)
  rename to home_student_login_lookup_unthrottled;

create function public.student_login_lookup(
  p_class_id uuid,
  p_display_name text,
  p_pin text
)
returns table(
  student_id uuid,
  display_name text,
  first_name text,
  last_name text,
  username text,
  class_id uuid,
  school_year_level text,
  working_level text,
  year_level text,
  session_token text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_login_key constant text := 'school:' || coalesce(p_class_id::text, '') || ':'
    || lower(trim(coalesce(p_display_name, '')));
begin
  perform public.student_login_assert_allowed(v_login_key);
  return query select * from public.student_login_lookup_unthrottled(p_class_id, p_display_name, p_pin);
  if found then
    perform public.student_login_clear_failures(v_login_key);
  else
    perform public.student_login_record_failure(v_login_key);
  end if;
end;
$$;

create function public.home_student_login_lookup(
  p_username text,
  p_pin text
)
returns table(
  student_id uuid,
  display_name text,
  first_name text,
  last_name text,
  username text,
  class_id uuid,
  school_year_level text,
  working_level text,
  year_level text,
  session_token text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_login_key constant text := 'home:' || lower(trim(coalesce(p_username, '')));
begin
  perform public.student_login_assert_allowed(v_login_key);
  return query select * from public.home_student_login_lookup_unthrottled(p_username, p_pin);
  if found then
    perform public.student_login_clear_failures(v_login_key);
  else
    perform public.student_login_record_failure(v_login_key);
  end if;
end;
$$;

revoke all on function public.student_login_lookup_unthrottled(uuid, text, text) from public, anon, authenticated;
revoke all on function public.home_student_login_lookup_unthrottled(text, text) from public, anon, authenticated;
revoke all on function public.student_login_assert_allowed(text) from public, anon, authenticated;
revoke all on function public.student_login_record_failure(text) from public, anon, authenticated;
revoke all on function public.student_login_clear_failures(text) from public, anon, authenticated;
revoke all on function public.student_login_lookup(uuid, text, text) from public;
revoke all on function public.home_student_login_lookup(text, text) from public;
grant execute on function public.student_login_lookup(uuid, text, text) to anon, authenticated;
grant execute on function public.home_student_login_lookup(text, text) to anon, authenticated;

commit;
