begin;

-- Current class membership determines which students a teacher can inspect.
-- Attempt rows retain their historical class_id for audit, so class dashboards
-- must join through students instead of silently dropping canonical work after
-- a class transfer or an older write with missing class context.
create or replace function public.get_class_realm_progress(
  p_class_id uuid,
  p_realm_id text,
  p_working_level text default null
)
returns setof public.student_realm_progress
language sql
security invoker
set search_path = public
as $$
  select srp.*
  from public.student_realm_progress srp
  join public.students s on s.id = srp.student_id
  where s.class_id = p_class_id
    and srp.realm_id = p_realm_id
    and (p_working_level is null or srp.working_level = p_working_level)
  order by srp.updated_at desc;
$$;

create or replace function public.get_class_realm_lesson_attempts(
  p_class_id uuid,
  p_realm_id text,
  p_working_level text default null
)
returns setof public.student_lesson_attempts
language sql
security invoker
set search_path = public
as $$
  select sla.*
  from public.student_lesson_attempts sla
  join public.students s on s.id = sla.student_id
  where s.class_id = p_class_id
    and sla.realm_id = p_realm_id
    and (p_working_level is null or sla.working_level = p_working_level)
  order by sla.completed_at desc, sla.attempt_no desc;
$$;

create or replace function public.get_class_realm_weekly_quiz_attempts(
  p_class_id uuid,
  p_realm_id text,
  p_working_level text default null
)
returns setof public.student_weekly_quiz_attempts
language sql
security invoker
set search_path = public
as $$
  select swqa.*
  from public.student_weekly_quiz_attempts swqa
  join public.students s on s.id = swqa.student_id
  where s.class_id = p_class_id
    and swqa.realm_id = p_realm_id
    and (p_working_level is null or swqa.working_level = p_working_level)
  order by swqa.completed_at desc, swqa.attempt_no desc;
$$;

create or replace function public.get_class_realm_progress_compat(
  p_class_id uuid,
  p_realm_id text,
  p_working_level text default null
)
returns table (
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
language sql
security invoker
set search_path = public
as $$
  select
    srp.student_id,
    s.class_id,
    srp.realm_id,
    srp.program_key,
    srp.school_year_level,
    srp.working_level,
    srp.is_current,
    srp.status,
    srp.current_week,
    srp.assigned_week,
    srp.placement_complete,
    srp.pretest_score,
    srp.pretest_completed_at,
    srp.posttest_score,
    srp.posttest_completed_at,
    srp.required_weeks,
    srp.optional_weeks,
    srp.unlocked_legends,
    srp.updated_at
  from public.student_realm_progress srp
  join public.students s on s.id = srp.student_id
  where s.class_id = p_class_id
    and srp.realm_id = p_realm_id
    and (p_working_level is null or srp.working_level = p_working_level)
  order by srp.updated_at desc;
$$;

revoke execute on function public.get_class_realm_progress(uuid, text, text) from public, anon;
revoke execute on function public.get_class_realm_progress_compat(uuid, text, text) from public, anon;
revoke execute on function public.get_class_realm_lesson_attempts(uuid, text, text) from public, anon;
revoke execute on function public.get_class_realm_weekly_quiz_attempts(uuid, text, text) from public, anon;
grant execute on function public.get_class_realm_progress(uuid, text, text) to authenticated;
grant execute on function public.get_class_realm_progress_compat(uuid, text, text) to authenticated;
grant execute on function public.get_class_realm_lesson_attempts(uuid, text, text) to authenticated;
grant execute on function public.get_class_realm_weekly_quiz_attempts(uuid, text, text) to authenticated;

commit;
