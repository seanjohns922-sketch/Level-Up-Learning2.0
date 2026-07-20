begin;

-- A teacher assignment is separate from earned learning history, but older
-- placeholder progress rows caused a new assignment to be recorded without
-- producing a usable realm entry. Treat a row as established progress only
-- when it contains placement results or canonical lesson/quiz/assessment work.
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
  v_has_established_progress boolean;
  v_class_id uuid;
  v_school_year_level text;
begin
  if p_realm_id not in ('number', 'measurement') then
    raise exception 'Invalid realm';
  end if;
  if p_assigned_level not in ('Prep', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6') then
    raise exception 'Invalid assigned level';
  end if;
  if v_entry not in ('pretest', 'full_level', 'ground_week1') then
    raise exception 'Invalid entry mode';
  end if;
  if not public.teacher_owns_student(p_student_id) then
    raise exception 'Not authorized for this student' using errcode = '42501';
  end if;

  select s.class_id, coalesce(s.school_year_level, s.year_level)
  into v_class_id, v_school_year_level
  from public.students s
  where s.id = p_student_id;

  select assigned_start_level into v_old
  from public.student_realm_placement
  where student_id = p_student_id and realm_id = p_realm_id;

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

  select
    exists (
      select 1
      from public.student_realm_progress srp
      where srp.student_id = p_student_id
        and srp.realm_id = p_realm_id
        and (
          srp.pretest_score is not null
          or srp.posttest_score is not null
          or srp.pretest_completed_at is not null
          or srp.posttest_completed_at is not null
        )
    )
    or exists (
      select 1 from public.student_lesson_attempts sla
      where sla.student_id = p_student_id and sla.realm_id = p_realm_id
    )
    or exists (
      select 1 from public.student_weekly_quiz_attempts swqa
      where swqa.student_id = p_student_id and swqa.realm_id = p_realm_id
    )
    or exists (
      select 1 from public.student_realm_assessments sra
      where sra.student_id = p_student_id and sra.realm_id = p_realm_id
    )
  into v_has_established_progress;

  if not v_has_established_progress then
    -- Placeholder rows carry no earned work, so it is safe to align them with
    -- the latest assignment. The partial unique index requires clearing the
    -- old current marker before the target row is inserted/upserted.
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

-- Repair existing assignments that are currently blocked only by empty legacy
-- rows. Students with any canonical work are deliberately excluded.
do $$
declare
  assignment record;
begin
  for assignment in
    select
      placement.student_id,
      placement.realm_id,
      placement.assigned_start_level,
      placement.assigned_entry_mode,
      s.class_id,
      coalesce(s.school_year_level, s.year_level) as school_year_level
    from public.student_realm_placement placement
    join public.students s on s.id = placement.student_id
    where placement.realm_id in ('number', 'measurement')
      and not exists (
        select 1 from public.student_realm_progress result
        where result.student_id = placement.student_id
          and result.realm_id = placement.realm_id
          and (
            result.pretest_score is not null
            or result.posttest_score is not null
            or result.pretest_completed_at is not null
            or result.posttest_completed_at is not null
          )
      )
      and not exists (
        select 1 from public.student_lesson_attempts work
        where work.student_id = placement.student_id
          and work.realm_id = placement.realm_id
      )
      and not exists (
        select 1 from public.student_weekly_quiz_attempts work
        where work.student_id = placement.student_id
          and work.realm_id = placement.realm_id
      )
      and not exists (
        select 1 from public.student_realm_assessments work
        where work.student_id = placement.student_id
          and work.realm_id = placement.realm_id
      )
  loop
    update public.student_realm_progress
    set is_current = false
    where student_id = assignment.student_id
      and realm_id = assignment.realm_id
      and working_level <> assignment.assigned_start_level
      and is_current;

    insert into public.student_realm_progress (
      student_id, class_id, realm_id, program_key, school_year_level,
      working_level, is_current, status, current_week, assigned_week,
      placement_complete, required_weeks, optional_weeks
    ) values (
      assignment.student_id,
      assignment.class_id,
      assignment.realm_id,
      public.realm_program_key(assignment.assigned_start_level, assignment.realm_id),
      assignment.school_year_level,
      assignment.assigned_start_level,
      true,
      'ASSIGNED_PROGRAM',
      case when assignment.assigned_entry_mode = 'pretest' then null else 1 end,
      case when assignment.assigned_entry_mode = 'pretest' then null else 1 end,
      assignment.assigned_entry_mode <> 'pretest',
      '[]'::jsonb,
      '[]'::jsonb
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
      required_weeks = '[]'::jsonb,
      optional_weeks = '[]'::jsonb,
      updated_at = now();
  end loop;
end;
$$;

commit;
