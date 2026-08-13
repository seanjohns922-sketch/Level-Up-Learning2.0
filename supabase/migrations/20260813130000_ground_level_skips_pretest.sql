begin;

-- Ground Level has no pre-test in any realm. Normalise historical placement
-- intent before enforcing the invariant for every future write path.
update public.student_realm_placement
set assigned_entry_mode = case
      when assigned_start_level = 'Prep' then 'ground_week1'
      when assigned_entry_mode = 'ground_week1' then 'pretest'
      else assigned_entry_mode
    end,
    updated_at = now()
where (assigned_start_level = 'Prep' and assigned_entry_mode <> 'ground_week1')
   or (assigned_start_level <> 'Prep' and assigned_entry_mode = 'ground_week1');

alter table public.student_realm_placement
  drop constraint if exists student_realm_placement_ground_entry_check;

alter table public.student_realm_placement
  add constraint student_realm_placement_ground_entry_check
  check (
    (assigned_start_level = 'Prep' and assigned_entry_mode = 'ground_week1')
    or
    (assigned_start_level <> 'Prep' and assigned_entry_mode <> 'ground_week1')
  ) not valid;

alter table public.student_realm_placement
  validate constraint student_realm_placement_ground_entry_check;

-- Repair only empty canonical rows created by the invalid Prep/pre-test
-- combination. Any student with learning or assessment evidence is left alone.
update public.student_realm_progress progress
set current_week = 1,
    assigned_week = 1,
    placement_complete = true,
    status = 'ASSIGNED_PROGRAM',
    updated_at = now()
where progress.working_level = 'Prep'
  and (progress.current_week is null or progress.assigned_week is null or progress.placement_complete is not true)
  and progress.pretest_score is null
  and progress.posttest_score is null
  and progress.pretest_completed_at is null
  and progress.posttest_completed_at is null
  and coalesce(progress.required_weeks, '[]'::jsonb) = '[]'::jsonb
  and coalesce(progress.optional_weeks, '[]'::jsonb) = '[]'::jsonb
  and not exists (
    select 1 from public.student_lesson_attempts attempt
    where attempt.student_id = progress.student_id and attempt.realm_id = progress.realm_id
  )
  and not exists (
    select 1 from public.student_weekly_quiz_attempts attempt
    where attempt.student_id = progress.student_id and attempt.realm_id = progress.realm_id
  )
  and not exists (
    select 1 from public.student_realm_assessments assessment
    where assessment.student_id = progress.student_id and assessment.realm_id = progress.realm_id
  );

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

  if v_working_level = 'Prep' then
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

  delete from public.student_realm_assessments
  where student_id = p_student_id
    and realm_id = p_realm_id
    and assessment_type = 'pretest';

  insert into public.teacher_realm_actions (teacher_id, student_id, realm_id, action)
  values (v_teacher, p_student_id, p_realm_id, 'pretest_reset');
end;
$$;

revoke all on function public.teacher_reset_pretest(uuid, text) from public, anon;
grant execute on function public.teacher_reset_pretest(uuid, text) to authenticated;

commit;
