-- Level 7 release: teachers may place a student at Year 7 in any realm.
-- Only the allowed-level checks change; the rest of the function is unchanged from
-- 20260910170000_release_chance_hollow_live_realm.sql. The bulk function
-- teacher_change_starting_levels calls this one, so it needs no change.

create or replace function public.teacher_change_starting_level(
  p_student_id uuid,
  p_realm_id text,
  p_assigned_level text,
  p_entry_mode text default 'pretest'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher uuid := auth.uid();
  v_entry text := coalesce(nullif(trim(p_entry_mode), ''), 'pretest');
  v_old text;
  v_has_progress boolean;
  v_has_established_progress boolean;
  v_class_id uuid;
  v_school_year_level text;
begin
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then
    raise exception 'Invalid realm';
  end if;
  if p_assigned_level not in ('Prep', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7') then
    raise exception 'Invalid assigned level';
  end if;
  if p_realm_id = 'statistics' and p_assigned_level = 'Prep' then
    raise exception 'Statistica starts at Year 1';
  end if;
  if p_realm_id in ('pattern', 'chance')
    and p_assigned_level not in ('Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7') then
    raise exception 'This realm supports Year 3 to Year 7';
  end if;
  if v_entry not in ('pretest', 'full_level', 'ground_week1') then
    raise exception 'Invalid entry mode';
  end if;
  if not public.teacher_owns_student(p_student_id) then
    raise exception 'Not authorized for this student' using errcode = '42501';
  end if;

  select student.class_id, coalesce(student.school_year_level, student.year_level)
  into v_class_id, v_school_year_level
  from public.students student
  where student.id = p_student_id;

  if v_class_id is null then
    raise exception 'Student class context is missing';
  end if;

  select placement.assigned_start_level
  into v_old
  from public.student_realm_placement placement
  where placement.student_id = p_student_id
    and placement.realm_id = p_realm_id;

  insert into public.student_realm_placement (
    student_id, realm_id, assigned_start_level, assigned_entry_mode,
    placement_source, placement_assigned_by, placement_assigned_at, updated_at
  ) values (
    p_student_id, p_realm_id, p_assigned_level, v_entry,
    'teacher', v_teacher, now(), now()
  )
  on conflict (student_id, realm_id) do update set
    assigned_start_level = excluded.assigned_start_level,
    assigned_entry_mode = excluded.assigned_entry_mode,
    placement_source = 'teacher',
    placement_assigned_by = excluded.placement_assigned_by,
    placement_assigned_at = now(),
    updated_at = now();

  select exists (
    select 1
    from public.student_realm_progress progress
    where progress.student_id = p_student_id
      and progress.realm_id = p_realm_id
  ) into v_has_progress;

  select
    exists (
      select 1
      from public.student_realm_progress progress
      where progress.student_id = p_student_id
        and progress.realm_id = p_realm_id
        and (
          progress.pretest_score is not null
          or progress.posttest_score is not null
          or progress.pretest_completed_at is not null
          or progress.posttest_completed_at is not null
        )
    )
    or exists (
      select 1 from public.student_lesson_attempts attempt
      where attempt.student_id = p_student_id and attempt.realm_id = p_realm_id
    )
    or exists (
      select 1 from public.student_weekly_quiz_attempts attempt
      where attempt.student_id = p_student_id and attempt.realm_id = p_realm_id
    )
    or exists (
      select 1 from public.student_realm_assessments assessment
      where assessment.student_id = p_student_id and assessment.realm_id = p_realm_id
    )
  into v_has_established_progress;

  if not v_has_progress then
    insert into public.student_realm_progress (
      student_id, class_id, realm_id, program_key, school_year_level,
      working_level, is_current, status, current_week, assigned_week,
      placement_complete, required_weeks, optional_weeks
    ) values (
      p_student_id, v_class_id, p_realm_id,
      public.realm_program_key(p_assigned_level, p_realm_id),
      v_school_year_level, p_assigned_level, true, 'ASSIGNED_PROGRAM',
      case when v_entry = 'pretest' then null else 1 end,
      case when v_entry = 'pretest' then null else 1 end,
      v_entry <> 'pretest', '[]'::jsonb, '[]'::jsonb
    );
  elsif not v_has_established_progress then
    update public.student_realm_progress
    set is_current = false
    where student_id = p_student_id
      and realm_id = p_realm_id
      and working_level <> p_assigned_level
      and is_current;

    insert into public.student_realm_progress (
      student_id, class_id, realm_id, program_key, school_year_level,
      working_level, is_current, status, current_week, assigned_week,
      placement_complete, pretest_score, pretest_completed_at,
      posttest_score, posttest_completed_at, required_weeks, optional_weeks
    ) values (
      p_student_id, v_class_id, p_realm_id,
      public.realm_program_key(p_assigned_level, p_realm_id),
      v_school_year_level, p_assigned_level, true, 'ASSIGNED_PROGRAM',
      case when v_entry = 'pretest' then null else 1 end,
      case when v_entry = 'pretest' then null else 1 end,
      v_entry <> 'pretest', null, null, null, null, '[]'::jsonb, '[]'::jsonb
    )
    on conflict (student_id, realm_id, working_level) do update set
      class_id = excluded.class_id,
      program_key = excluded.program_key,
      school_year_level = excluded.school_year_level,
      is_current = true,
      status = excluded.status,
      current_week = excluded.current_week,
      assigned_week = excluded.assigned_week,
      placement_complete = excluded.placement_complete,
      pretest_score = null,
      pretest_completed_at = null,
      posttest_score = null,
      posttest_completed_at = null,
      required_weeks = '[]'::jsonb,
      optional_weeks = '[]'::jsonb,
      updated_at = now();
  end if;

  insert into public.teacher_realm_actions (
    teacher_id, student_id, realm_id, action, old_value, new_value
  ) values (
    v_teacher, p_student_id, p_realm_id, 'placement_changed', v_old, p_assigned_level
  );
end;
$$;

revoke all on function public.teacher_change_starting_level(uuid, text, text, text)
  from public, anon;
grant execute on function public.teacher_change_starting_level(uuid, text, text, text)
  to authenticated;
