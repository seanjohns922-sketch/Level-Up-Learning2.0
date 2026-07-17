begin;

create extension if not exists pgcrypto;

create table if not exists public.student_access_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists student_access_sessions_student_idx
  on public.student_access_sessions(student_id, expires_at desc);

alter table public.student_access_sessions enable row level security;

create table if not exists public.student_completion_receipts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  realm_id text not null check (realm_id in ('number', 'measurement')),
  activity_type text not null check (activity_type in ('lesson', 'quiz', 'pretest', 'posttest')),
  completion_key uuid not null,
  completed_at timestamptz not null default now(),
  unique(student_id, realm_id, activity_type, completion_key)
);

create index if not exists student_completion_receipts_student_idx
  on public.student_completion_receipts(student_id, realm_id, completed_at desc);

alter table public.student_completion_receipts enable row level security;

create or replace function public.request_student_session_token()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select nullif(
    coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb ->> 'x-student-session',
    ''
  );
$$;

revoke all on function public.request_student_session_token() from public, anon, authenticated;

create or replace function public.teacher_owns_class(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.classes c
    where c.id = target_class_id
      and public.teacher_belongs_to_auth(c.teacher_id)
  );
$$;

revoke all on function public.teacher_owns_class(uuid) from public, anon, authenticated;

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
    and sas.token_hash = encode(digest(supplied_token, 'sha256'), 'hex')
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

create or replace function public.assert_student_access(target_student_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if not public.can_access_student(target_student_id) then
    raise exception 'Student session is invalid or does not own this record'
      using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.assert_student_access(uuid) from public, anon, authenticated;

-- Successful PIN login now issues an opaque, expiring credential. Only its hash
-- is retained in the database; subsequent RPCs receive it through a request header.
drop function if exists public.student_login_lookup(uuid, text, text);
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

  issued_token := encode(gen_random_bytes(32), 'hex');
  insert into public.student_access_sessions(student_id, token_hash, expires_at)
  values (matched.id, encode(digest(issued_token, 'sha256'), 'hex'), now() + interval '30 days');

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

create or replace function public.get_student_runtime_context_secure(p_student_id uuid)
returns table(
  class_id uuid,
  school_year_level text,
  has_seen_intro boolean,
  display_name text,
  first_name text,
  last_name text,
  brain_break_frequency text,
  class_brain_break_frequency text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  return query select * from public.get_student_runtime_context(p_student_id);
end;
$$;

grant execute on function public.get_student_runtime_context_secure(uuid) to anon, authenticated;
revoke execute on function public.get_student_runtime_context(uuid) from public, anon, authenticated;

create or replace function public.get_student_realm_progress_compat_secure(
  p_student_id uuid,
  p_realm_id text
)
returns table(
  student_id uuid,
  class_id uuid,
  realm_id text,
  program_key text,
  school_year_level text,
  working_level text,
  is_current boolean,
  status text,
  current_week integer,
  assigned_week integer,
  placement_complete boolean,
  pretest_score integer,
  pretest_completed_at timestamptz,
  posttest_score integer,
  posttest_completed_at timestamptz,
  required_weeks jsonb,
  optional_weeks jsonb,
  unlocked_legends jsonb,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  if p_realm_id not in ('number', 'measurement') then
    raise exception 'Invalid realm';
  end if;
  return query select * from public.get_student_realm_progress_compat(p_student_id, p_realm_id);
end;
$$;

grant execute on function public.get_student_realm_progress_compat_secure(uuid, text) to anon, authenticated;
revoke execute on function public.get_student_realm_progress_compat(uuid, text) from public, anon, authenticated;

create or replace function public.get_student_realm_lesson_attempts_secure(
  p_student_id uuid,
  p_realm_id text,
  p_working_level text default null
)
returns setof public.student_lesson_attempts
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  return query select * from public.get_student_realm_lesson_attempts(p_student_id, p_realm_id, p_working_level);
end;
$$;

create or replace function public.get_student_realm_weekly_quiz_attempts_secure(
  p_student_id uuid,
  p_realm_id text,
  p_working_level text default null
)
returns setof public.student_weekly_quiz_attempts
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  return query select * from public.get_student_realm_weekly_quiz_attempts(p_student_id, p_realm_id, p_working_level);
end;
$$;

create or replace function public.get_student_realm_assessments_secure(
  p_student_id uuid,
  p_realm_id text,
  p_working_level text default null
)
returns setof public.student_realm_assessments
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  return query select * from public.get_student_realm_assessments(p_student_id, p_realm_id, p_working_level);
end;
$$;

grant execute on function public.get_student_realm_lesson_attempts_secure(uuid, text, text) to anon, authenticated;
grant execute on function public.get_student_realm_weekly_quiz_attempts_secure(uuid, text, text) to anon, authenticated;
grant execute on function public.get_student_realm_assessments_secure(uuid, text, text) to anon, authenticated;

revoke execute on function public.get_student_realm_lesson_attempts(uuid, text, text) from public, anon, authenticated;
revoke execute on function public.get_student_realm_weekly_quiz_attempts(uuid, text, text) from public, anon, authenticated;
revoke execute on function public.get_student_realm_assessments(uuid, text, text) from public, anon, authenticated;

create or replace function public.save_student_realm_progress_secure(
  p_student_id uuid,
  p_class_id uuid,
  p_realm_id text,
  p_program_key text,
  p_school_year_level text,
  p_working_level text,
  p_data jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actual_class_id uuid;
begin
  perform public.assert_student_access(p_student_id);
  select s.class_id into actual_class_id from public.students s where s.id = p_student_id;
  if p_class_id is distinct from actual_class_id or p_realm_id not in ('number', 'measurement') then
    raise exception 'Student context does not match';
  end if;
  perform public.save_student_realm_progress(
    p_student_id, actual_class_id, p_realm_id, p_program_key,
    p_school_year_level, p_working_level, p_data
  );
end;
$$;

grant execute on function public.save_student_realm_progress_secure(uuid, uuid, text, text, text, text, jsonb) to anon, authenticated;
revoke execute on function public.save_student_realm_progress(uuid, uuid, text, text, text, text, jsonb) from public, anon, authenticated;

create or replace function public.mark_student_intro_seen_secure(p_student_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  perform public.mark_student_intro_seen(p_student_id);
end;
$$;

create or replace function public.upsert_student_activity_daily_secure(
  p_student_id uuid,
  p_class_id uuid default null,
  p_activity_date date default (timezone('Australia/Melbourne', now()))::date,
  p_questions_answered integer default 0,
  p_correct_answers integer default 0,
  p_lessons_completed integer default 0,
  p_quizzes_completed integer default 0,
  p_seconds_active integer default 0,
  p_xp_earned integer default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actual_class_id uuid;
begin
  perform public.assert_student_access(p_student_id);
  select s.class_id into actual_class_id from public.students s where s.id = p_student_id;
  if p_class_id is distinct from actual_class_id then
    raise exception 'Student context does not match';
  end if;
  perform public.upsert_student_activity_daily(
    p_student_id, actual_class_id, p_activity_date, p_questions_answered,
    p_correct_answers, p_lessons_completed, p_quizzes_completed,
    p_seconds_active, p_xp_earned
  );
end;
$$;

create or replace function public.get_student_activity_daily_secure(p_student_id uuid)
returns table(
  activity_date date,
  class_id uuid,
  questions_answered integer,
  correct_answers integer,
  lessons_completed integer,
  quizzes_completed integer,
  seconds_active integer,
  minutes_active integer,
  xp_earned integer,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  return query select * from public.get_student_activity_daily(p_student_id);
end;
$$;

create or replace function public.get_student_progress_snapshot_secure(p_student_id uuid)
returns table(
  year text,
  pretest_score integer,
  status text,
  week integer,
  placement_complete boolean,
  assigned_week integer,
  required_weeks jsonb,
  optional_weeks jsonb,
  unlocked_legends jsonb,
  completed_lesson_ids jsonb,
  quiz_scores jsonb,
  lesson_attempts jsonb,
  has_seen_intro boolean,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  return query select * from public.get_student_progress_snapshot(p_student_id);
end;
$$;

grant execute on function public.mark_student_intro_seen_secure(uuid) to anon, authenticated;
grant execute on function public.upsert_student_activity_daily_secure(uuid, uuid, date, integer, integer, integer, integer, integer, integer) to anon, authenticated;
grant execute on function public.get_student_activity_daily_secure(uuid) to anon, authenticated;
grant execute on function public.get_student_progress_snapshot_secure(uuid) to anon, authenticated;

create or replace function public.apply_completion_xp(
  p_student_id uuid,
  p_class_id uuid,
  p_questions integer,
  p_correct integer,
  p_lessons integer,
  p_quizzes integer,
  p_xp integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.upsert_student_activity_daily(
    p_student_id,
    p_class_id,
    (timezone('Australia/Melbourne', now()))::date,
    greatest(coalesce(p_questions, 0), 0),
    greatest(coalesce(p_correct, 0), 0),
    greatest(coalesce(p_lessons, 0), 0),
    greatest(coalesce(p_quizzes, 0), 0),
    0,
    greatest(coalesce(p_xp, 0), 0)
  );
end;
$$;

revoke all on function public.apply_completion_xp(uuid, uuid, integer, integer, integer, integer, integer) from public, anon, authenticated;

create or replace function public.complete_realm_lesson(
  p_student_id uuid,
  p_class_id uuid,
  p_realm_id text,
  p_program_key text,
  p_school_year_level text,
  p_working_level text,
  p_week integer,
  p_lesson integer,
  p_lesson_id text,
  p_completion_key uuid,
  p_attempt jsonb default '{}'::jsonb,
  p_xp integer default 40
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
  actual_class_id uuid;
begin
  perform public.assert_student_access(p_student_id);
  select s.class_id into actual_class_id from public.students s where s.id = p_student_id;
  if p_class_id is distinct from actual_class_id or p_realm_id not in ('number', 'measurement') then
    raise exception 'Student context does not match';
  end if;

  insert into public.student_completion_receipts(student_id, realm_id, activity_type, completion_key)
  values (p_student_id, p_realm_id, 'lesson', p_completion_key)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;

  perform public.save_realm_lesson_attempt(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, p_week, p_lesson, p_lesson_id, p_attempt
  );
  perform public.apply_completion_xp(
    p_student_id, actual_class_id,
    coalesce(nullif(p_attempt->>'questionsAnswered', '')::integer, 0),
    coalesce(nullif(p_attempt->>'correctAnswers', '')::integer, 0),
    1, 0, p_xp
  );
  return true;
end;
$$;

create or replace function public.complete_realm_quiz(
  p_student_id uuid,
  p_class_id uuid,
  p_realm_id text,
  p_program_key text,
  p_school_year_level text,
  p_working_level text,
  p_week integer,
  p_quiz_id text,
  p_completion_key uuid,
  p_attempt jsonb default '{}'::jsonb,
  p_xp integer default 0
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
  actual_class_id uuid;
begin
  perform public.assert_student_access(p_student_id);
  select s.class_id into actual_class_id from public.students s where s.id = p_student_id;
  if p_class_id is distinct from actual_class_id or p_realm_id not in ('number', 'measurement') then
    raise exception 'Student context does not match';
  end if;

  insert into public.student_completion_receipts(student_id, realm_id, activity_type, completion_key)
  values (p_student_id, p_realm_id, 'quiz', p_completion_key)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;

  perform public.save_realm_weekly_quiz_attempt(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, p_week, p_quiz_id, p_attempt
  );
  perform public.apply_completion_xp(
    p_student_id, actual_class_id,
    coalesce(nullif(p_attempt->>'total', '')::integer, 0),
    coalesce(nullif(p_attempt->>'score', '')::integer, 0),
    0, 1, p_xp
  );
  return true;
end;
$$;

create or replace function public.complete_realm_assessment(
  p_student_id uuid,
  p_class_id uuid,
  p_realm_id text,
  p_program_key text,
  p_school_year_level text,
  p_working_level text,
  p_assessment_type text,
  p_completion_key uuid,
  p_attempt jsonb default '{}'::jsonb,
  p_progress jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
  actual_class_id uuid;
begin
  perform public.assert_student_access(p_student_id);
  select s.class_id into actual_class_id from public.students s where s.id = p_student_id;
  if p_class_id is distinct from actual_class_id
    or p_realm_id not in ('number', 'measurement')
    or p_assessment_type not in ('pretest', 'posttest') then
    raise exception 'Student context does not match';
  end if;

  insert into public.student_completion_receipts(student_id, realm_id, activity_type, completion_key)
  values (p_student_id, p_realm_id, p_assessment_type, p_completion_key)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;

  perform public.save_realm_assessment(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, p_assessment_type, p_attempt
  );
  perform public.save_student_realm_progress(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, p_progress
  );
  if p_assessment_type = 'pretest'
    and nullif(p_progress->>'next_working_level', '') is not null then
    perform public.save_student_realm_progress(
      p_student_id,
      actual_class_id,
      p_realm_id,
      lower(replace(p_progress->>'next_working_level', ' ', '')) ||
        case when p_realm_id = 'measurement' then '-measurelands' else '-number' end,
      p_school_year_level,
      p_progress->>'next_working_level',
      jsonb_build_object(
        'status', 'ASSIGNED_PROGRAM',
        'current_week', 1,
        'assigned_week', 1,
        'placement_complete', false,
        'required_weeks', '[]'::jsonb,
        'optional_weeks', '[]'::jsonb,
        'unlocked_legends', coalesce(p_progress->'unlocked_legends', '[]'::jsonb)
      )
    );
  end if;
  return true;
end;
$$;

grant execute on function public.complete_realm_lesson(uuid, uuid, text, text, text, text, integer, integer, text, uuid, jsonb, integer) to anon, authenticated;
grant execute on function public.complete_realm_quiz(uuid, uuid, text, text, text, text, integer, text, uuid, jsonb, integer) to anon, authenticated;
grant execute on function public.complete_realm_assessment(uuid, uuid, text, text, text, text, text, uuid, jsonb, jsonb) to anon, authenticated;

revoke execute on function public.save_realm_lesson_attempt(uuid, uuid, text, text, text, text, integer, integer, text, jsonb) from public, anon, authenticated;
revoke execute on function public.save_realm_weekly_quiz_attempt(uuid, uuid, text, text, text, text, integer, text, jsonb) from public, anon, authenticated;
revoke execute on function public.save_realm_assessment(uuid, uuid, text, text, text, text, text, jsonb) from public, anon, authenticated;

-- Secured wrappers for live telemetry. The legacy implementations remain private
-- so this migration does not duplicate their large merge logic.
create or replace function public.get_live_student_activity_secure(p_student_id uuid, p_class_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  if not exists(select 1 from public.students s where s.id = p_student_id and s.class_id = p_class_id) then
    raise exception 'Student context does not match';
  end if;
  return public.get_live_student_activity(p_student_id, p_class_id);
end;
$$;

create or replace function public.upsert_live_student_activity_secure(p_student_id uuid, p_class_id uuid, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  if not exists(select 1 from public.students s where s.id = p_student_id and s.class_id = p_class_id) then
    raise exception 'Student context does not match';
  end if;
  perform public.upsert_live_student_activity(p_student_id, p_class_id, p_data);
end;
$$;

create or replace function public.insert_live_activity_event_secure(
  p_student_id uuid,
  p_class_id uuid,
  p_session_id uuid,
  p_event_type text,
  p_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  if not exists(select 1 from public.students s where s.id = p_student_id and s.class_id = p_class_id) then
    raise exception 'Student context does not match';
  end if;
  perform public.insert_live_activity_event(p_student_id, p_class_id, p_session_id, p_event_type, p_payload);
end;
$$;

grant execute on function public.get_live_student_activity_secure(uuid, uuid) to anon, authenticated;
grant execute on function public.upsert_live_student_activity_secure(uuid, uuid, jsonb) to anon, authenticated;
grant execute on function public.insert_live_activity_event_secure(uuid, uuid, uuid, text, jsonb) to anon, authenticated;

revoke execute on function public.get_live_student_activity(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.upsert_live_student_activity(uuid, uuid, jsonb) from public, anon, authenticated;
revoke execute on function public.insert_live_activity_event(uuid, uuid, uuid, text, jsonb) from public, anon, authenticated;

-- Class-wide reads are teacher-only and now execute under the caller's RLS.
revoke execute on function public.get_class_realm_progress(uuid, text, text) from public, anon;
revoke execute on function public.get_class_realm_progress_compat(uuid, text, text) from public, anon;
revoke execute on function public.get_class_realm_lesson_attempts(uuid, text, text) from public, anon;
revoke execute on function public.get_class_realm_weekly_quiz_attempts(uuid, text, text) from public, anon;
grant execute on function public.get_class_realm_progress(uuid, text, text) to authenticated;
grant execute on function public.get_class_realm_progress_compat(uuid, text, text) to authenticated;
grant execute on function public.get_class_realm_lesson_attempts(uuid, text, text) to authenticated;
grant execute on function public.get_class_realm_weekly_quiz_attempts(uuid, text, text) to authenticated;
alter function public.get_class_realm_progress(uuid, text, text) security invoker;
alter function public.get_class_realm_progress_compat(uuid, text, text) security invoker;
alter function public.get_class_realm_lesson_attempts(uuid, text, text) security invoker;
alter function public.get_class_realm_weekly_quiz_attempts(uuid, text, text) security invoker;

-- Disable every superseded anonymous student-data entry point. New application
-- code uses the guarded functions above.
revoke execute on function public.get_student_realm_progress(uuid, text) from public, anon, authenticated;
revoke execute on function public.set_current_student_realm_level(uuid, text, text) from public, anon, authenticated;
revoke execute on function public.get_student_progress_snapshot(uuid) from public, anon, authenticated;
revoke execute on function public.mark_student_intro_seen(uuid) from public, anon, authenticated;
revoke execute on function public.save_student_progress_state(uuid, text, jsonb) from public, anon, authenticated;
revoke execute on function public.save_lesson_progress(uuid, text, integer, text, jsonb) from public, anon, authenticated;
revoke execute on function public.save_weekly_quiz_progress(uuid, text, integer, jsonb, integer) from public, anon, authenticated;
revoke execute on function public.save_posttest_progress(uuid, text, jsonb, text, integer) from public, anon, authenticated;
revoke execute on function public.save_pretest_progress(uuid, text, integer, text, integer) from public, anon, authenticated;
revoke execute on function public.save_lesson_completion(uuid, text, integer, text) from public, anon, authenticated;
revoke execute on function public.backfill_progress_snapshot_from_live_events(uuid) from public, anon, authenticated;
revoke execute on function public.upsert_student_activity_daily(uuid, uuid, date, integer, integer, integer, integer, integer, integer) from public, anon, authenticated;
revoke execute on function public.get_student_activity_daily(uuid) from public, anon, authenticated;

commit;
