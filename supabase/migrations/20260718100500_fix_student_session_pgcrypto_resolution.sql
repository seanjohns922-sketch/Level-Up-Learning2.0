begin;

-- Supabase installs pgcrypto in the extensions schema. These security-definer
-- functions intentionally keep a restricted search_path, so pgcrypto calls
-- must be schema-qualified.
create or replace function public.can_access_student(target_student_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  supplied_token text := public.request_student_session_token();
  matched_session_id uuid;
begin
  if exists (
    select 1
    from public.students s
    where s.id = target_student_id
      and (
        s.user_id = auth.uid()
        or public.teacher_owns_class(s.class_id)
      )
  ) then
    return true;
  end if;

  if supplied_token is null then
    return false;
  end if;

  select sas.id into matched_session_id
  from public.student_access_sessions sas
  where sas.student_id = target_student_id
    and sas.token_hash = encode(extensions.digest(supplied_token, 'sha256'), 'hex')
    and sas.revoked_at is null
    and sas.expires_at > now()
  limit 1;

  if matched_session_id is null then
    return false;
  end if;

  update public.student_access_sessions
  set last_used_at = now()
  where id = matched_session_id
    and last_used_at < now() - interval '5 minutes';

  return true;
end;
$$;

revoke all on function public.can_access_student(uuid) from public, anon, authenticated;

create or replace function public.student_login_lookup(
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
  matched public.students%rowtype;
  issued_token text;
begin
  select s.* into matched
  from public.students s
  where s.class_id = p_class_id
    and s.archived_at is null
    and s.pin = trim(p_pin)
    and (
      lower(trim(coalesce(s.username, ''))) = lower(trim(p_display_name))
      or lower(trim(s.display_name)) = lower(trim(p_display_name))
    )
  limit 1;

  if matched.id is null then
    return;
  end if;

  issued_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.student_access_sessions(student_id, token_hash, expires_at)
  values (
    matched.id,
    encode(extensions.digest(issued_token, 'sha256'), 'hex'),
    now() + interval '30 days'
  );

  return query select
    matched.id,
    matched.display_name,
    matched.first_name,
    matched.last_name,
    matched.username,
    matched.class_id,
    matched.school_year_level,
    matched.working_level,
    matched.year_level,
    issued_token;
end;
$$;

revoke all on function public.student_login_lookup(uuid, text, text) from public;
grant execute on function public.student_login_lookup(uuid, text, text) to anon, authenticated;

commit;
