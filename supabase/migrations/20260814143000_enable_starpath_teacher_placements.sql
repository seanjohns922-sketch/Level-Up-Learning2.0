begin;

-- Starpath is now a live maths realm in the teacher dashboard. Teacher
-- placement must accept realm_id='space' and materialise the same canonical
-- progress row that Number Nexus and Measurelands use, without fabricating
-- attempts, scores, XP, rewards or analytics.

create or replace function public.realm_program_key(p_level text, p_realm_id text)
returns text
language sql
immutable
as $$
  select lower(replace(coalesce(p_level, ''), ' ', ''))
    || '-'
    || case
      when p_realm_id = 'measurement' then 'measurelands'
      when p_realm_id = 'space' then 'starpath'
      when p_realm_id = 'statistics' then 'statistica'
      else 'number'
    end;
$$;

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
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics') then
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
  )
  into v_has_progress;

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
      select 1
      from public.student_lesson_attempts attempt
      where attempt.student_id = p_student_id
        and attempt.realm_id = p_realm_id
    )
    or exists (
      select 1
      from public.student_weekly_quiz_attempts attempt
      where attempt.student_id = p_student_id
        and attempt.realm_id = p_realm_id
    )
    or exists (
      select 1
      from public.student_realm_assessments assessment
      where assessment.student_id = p_student_id
        and assessment.realm_id = p_realm_id
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

insert into public.student_realm_progress (
  student_id, class_id, realm_id, program_key, school_year_level,
  working_level, is_current, status, current_week, assigned_week,
  placement_complete, required_weeks, optional_weeks
)
select
  placement.student_id,
  student.class_id,
  placement.realm_id,
  public.realm_program_key(placement.assigned_start_level, placement.realm_id),
  coalesce(student.school_year_level, student.year_level),
  placement.assigned_start_level,
  true,
  'ASSIGNED_PROGRAM',
  case when placement.assigned_entry_mode = 'pretest' then null else 1 end,
  case when placement.assigned_entry_mode = 'pretest' then null else 1 end,
  placement.assigned_entry_mode <> 'pretest',
  '[]'::jsonb,
  '[]'::jsonb
from public.student_realm_placement placement
join public.students student on student.id = placement.student_id
where placement.realm_id in ('number', 'measurement', 'space', 'statistics')
  and not exists (
    select 1
    from public.student_realm_progress progress
    where progress.student_id = placement.student_id
      and progress.realm_id = placement.realm_id
  );

update public.student_realm_progress
set
  program_key = public.realm_program_key(working_level, realm_id),
  updated_at = now()
where realm_id = 'space'
  and program_key not like '%-starpath';

alter table public.student_progress_overrides
  drop constraint if exists student_progress_overrides_realm_id_check;
alter table public.student_progress_overrides
  add constraint student_progress_overrides_realm_id_check
  check (realm_id in ('number', 'measurement', 'space', 'statistics'));

create or replace function public.teacher_advance_student_week(
  p_student_id uuid,
  p_realm_id text,
  p_working_level text,
  p_week integer,
  p_reason text,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher uuid := auth.uid();
  v_progress public.student_realm_progress%rowtype;
  v_override_id uuid;
  v_last_week integer;
  v_next_week integer;
begin
  if v_teacher is null or not public.can_manage_student_progress(p_student_id) then
    raise exception 'Not authorized for this student' using errcode = '42501';
  end if;
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics') then
    raise exception 'Invalid realm';
  end if;
  if p_reason not in (
    'additional_needs', 'iep', 'professional_judgement',
    'extended_absence', 'technical_issue', 'other'
  ) then
    raise exception 'A valid advancement reason is required';
  end if;

  select * into v_progress
  from public.student_realm_progress
  where student_id = p_student_id
    and realm_id = p_realm_id
    and working_level = p_working_level
    and is_current
  for update;

  if v_progress.id is null then
    raise exception 'Canonical student progress was not found';
  end if;
  if v_progress.status <> 'ASSIGNED_PROGRAM' or not v_progress.placement_complete then
    raise exception 'The student must have an active placed program before a week can be advanced';
  end if;
  if p_week is distinct from coalesce(v_progress.current_week, v_progress.assigned_week, 1) then
    raise exception 'Only the student current week can be advanced';
  end if;

  v_last_week := case when p_realm_id in ('measurement', 'space') then 8 else 12 end;
  if p_week < 1 or p_week >= v_last_week then
    raise exception 'This week cannot be advanced';
  end if;
  v_next_week := p_week + 1;

  insert into public.student_progress_overrides (
    student_id, realm_id, working_level, week, advanced_to_week,
    teacher_id, reason, notes, previous_state, new_state
  ) values (
    p_student_id, p_realm_id, p_working_level, p_week, v_next_week,
    v_teacher, p_reason, nullif(trim(coalesce(p_notes, '')), ''),
    jsonb_build_object(
      'current_week', v_progress.current_week,
      'assigned_week', v_progress.assigned_week,
      'status', v_progress.status
    ),
    jsonb_build_object(
      'current_week', v_next_week,
      'assigned_week', v_next_week,
      'status', v_progress.status,
      'advancement', 'teacher_override'
    )
  )
  returning id into v_override_id;

  update public.student_realm_progress
  set current_week = v_next_week,
      assigned_week = v_next_week,
      updated_at = now()
  where id = v_progress.id;

  insert into public.teacher_realm_actions (
    teacher_id, student_id, realm_id, action, old_value, new_value
  ) values (
    v_teacher, p_student_id, p_realm_id, 'week_advanced',
    jsonb_build_object(
      'working_level', p_working_level,
      'week', p_week,
      'reason', p_reason,
      'notes', nullif(trim(coalesce(p_notes, '')), '')
    )::text,
    jsonb_build_object(
      'working_level', p_working_level,
      'week', v_next_week,
      'override_id', v_override_id
    )::text
  );

  return v_override_id;
end;
$$;

revoke all on function public.teacher_advance_student_week(uuid, text, text, integer, text, text)
  from public, anon;
grant execute on function public.teacher_advance_student_week(uuid, text, text, integer, text, text)
  to authenticated;

commit;
