-- Preserve all existing assessment evidence when placement is reopened.
-- No student scores, lesson progress, or placement thresholds are changed.
begin;

create or replace function public.teacher_reset_pretest(
  p_student_id uuid,
  p_realm_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher uuid := auth.uid();
  v_working_level text;
begin
  if p_realm_id is null or length(trim(p_realm_id)) = 0 then
    raise exception 'realm_id is required';
  end if;
  if not public.teacher_owns_student(p_student_id) then
    raise exception 'not authorized for this student' using errcode = '42501';
  end if;

  select progress.working_level
  into v_working_level
  from public.student_realm_progress progress
  where progress.student_id = p_student_id
    and progress.realm_id = p_realm_id
    and progress.is_current
  limit 1;

  if v_working_level = 'Prep' and p_realm_id not in ('number','measurement','space') then
    raise exception 'Ground Level does not use a pre-test' using errcode = '22023';
  end if;

  update public.student_realm_progress
  set pretest_score = null,
      pretest_completed_at = null,
      required_weeks = '[]'::jsonb,
      optional_weeks = '[]'::jsonb,
      placement_complete = false,
      status = 'ASSIGNED_PROGRAM',
      updated_at = now()
  where student_id = p_student_id
    and realm_id = p_realm_id
    and is_current;

  -- Reopening placement must never erase the original growth baseline.

  insert into public.teacher_realm_actions (teacher_id, student_id, realm_id, action)
  values (v_teacher, p_student_id, p_realm_id, 'pretest_reset');
end;
$$;

create or replace function public.get_student_realm_assessments_secure(
  p_student_id uuid,
  p_realm_id text,
  p_working_level text default null
)
returns setof public.student_realm_assessments
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_student_read(p_student_id);
  return query
  select assessment.*
  from public.student_realm_assessments assessment
  where assessment.student_id = p_student_id
    and assessment.realm_id = p_realm_id
    and (p_working_level is null or assessment.working_level = p_working_level)
  order by assessment.completed_at desc;
end;
$$;


commit;
