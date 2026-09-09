begin;

-- Prepare Chance Hollow's canonical persistence and reporting contracts while
-- the student-facing realm remains in preview. Demo Mode stays read-only.

alter table public.student_completion_receipts
  drop constraint if exists student_completion_receipts_realm_id_check;
alter table public.student_completion_receipts
  add constraint student_completion_receipts_realm_id_check
  check (realm_id in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance'));

alter table public.student_progress_overrides
  drop constraint if exists student_progress_overrides_realm_id_check;
alter table public.student_progress_overrides
  add constraint student_progress_overrides_realm_id_check
  check (realm_id in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance'));

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
      when p_realm_id = 'pattern' then 'pattern-peaks'
      when p_realm_id = 'chance' then 'chance-hollow'
      else 'number'
    end;
$$;

create or replace function public.realm_first_level_pretest_enabled(
  p_realm_id text,
  p_level text
)
returns boolean
language sql
immutable
set search_path = public
as $$
  select (p_realm_id = 'statistics' and p_level = 'Year 1')
      or (p_realm_id = 'pattern' and p_level = 'Year 3')
      or (p_realm_id = 'chance' and p_level = 'Year 3');
$$;

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
  perform public.assert_student_read(p_student_id);
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then
    raise exception 'Invalid realm';
  end if;
  return query select * from public.get_student_realm_progress_compat(p_student_id, p_realm_id);
end;
$$;

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
  select student.class_id into actual_class_id
  from public.students student
  where student.id = p_student_id;
  if p_class_id is distinct from actual_class_id
    or p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then
    raise exception 'Student context does not match';
  end if;
  perform public.save_student_realm_progress(
    p_student_id, actual_class_id, p_realm_id, p_program_key,
    p_school_year_level, p_working_level, p_data
  );
end;
$$;

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
  reward_eligible boolean;
  questions_answered integer := greatest(coalesce(nullif(p_attempt->>'questionsAnswered', '')::integer, 0), 0);
  correct_answers integer := greatest(coalesce(nullif(p_attempt->>'correctAnswers', '')::integer, 0), 0);
begin
  perform public.assert_student_access(p_student_id);
  select student.class_id into actual_class_id
  from public.students student
  where student.id = p_student_id;
  if p_class_id is distinct from actual_class_id
    or p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then
    raise exception 'Student context does not match';
  end if;

  insert into public.student_completion_receipts(student_id, realm_id, activity_type, completion_key)
  values (p_student_id, p_realm_id, 'lesson', p_completion_key)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;

  perform pg_advisory_xact_lock(
    hashtext(p_student_id::text),
    hashtext(concat_ws(':', p_realm_id, p_working_level, p_week::text, p_lesson::text))
  );

  select not exists (
    select 1
    from public.student_lesson_attempts attempt
    where attempt.student_id = p_student_id
      and attempt.realm_id = p_realm_id
      and attempt.working_level = p_working_level
      and attempt.week = p_week
      and attempt.lesson = p_lesson
      and attempt.completed
  ) into reward_eligible;

  perform public.save_realm_lesson_attempt(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, p_week, p_lesson, p_lesson_id, p_attempt
  );

  if reward_eligible then
    perform public.apply_completion_xp(
      p_student_id,
      actual_class_id,
      questions_answered,
      least(correct_answers, questions_answered),
      1,
      0,
      p_xp,
      'lesson_completion',
      p_completion_key::text,
      jsonb_build_object(
        'realm_id', p_realm_id,
        'program_key', p_program_key,
        'working_level', p_working_level,
        'week', p_week,
        'lesson', p_lesson,
        'lesson_id', p_lesson_id,
        'reward_attempt', 1
      )
    );
  else
    perform public.upsert_student_activity_daily(
      p_student_id,
      actual_class_id,
      (timezone('Australia/Melbourne', now()))::date,
      questions_answered,
      least(correct_answers, questions_answered),
      0,
      0,
      0,
      0
    );
  end if;

  return reward_eligible;
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
  reward_eligible boolean;
  questions_answered integer := greatest(coalesce(nullif(p_attempt->>'total', '')::integer, 0), 0);
  correct_answers integer := greatest(coalesce(nullif(p_attempt->>'score', '')::integer, 0), 0);
begin
  perform public.assert_student_access(p_student_id);
  select student.class_id into actual_class_id
  from public.students student
  where student.id = p_student_id;
  if p_class_id is distinct from actual_class_id
    or p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then
    raise exception 'Student context does not match';
  end if;

  insert into public.student_completion_receipts(student_id, realm_id, activity_type, completion_key)
  values (p_student_id, p_realm_id, 'quiz', p_completion_key)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;

  perform pg_advisory_xact_lock(
    hashtext(p_student_id::text),
    hashtext(concat_ws(':', p_realm_id, p_working_level, p_week::text, p_quiz_id))
  );

  select not exists (
    select 1
    from public.student_weekly_quiz_attempts attempt
    where attempt.student_id = p_student_id
      and attempt.realm_id = p_realm_id
      and attempt.working_level = p_working_level
      and attempt.week = p_week
      and attempt.quiz_id = p_quiz_id
  ) into reward_eligible;

  perform public.save_realm_weekly_quiz_attempt(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, p_week, p_quiz_id, p_attempt
  );

  if reward_eligible then
    perform public.apply_completion_xp(
      p_student_id,
      actual_class_id,
      questions_answered,
      least(correct_answers, questions_answered),
      0,
      1,
      p_xp,
      'quiz_completion',
      p_completion_key::text,
      jsonb_build_object(
        'realm_id', p_realm_id,
        'program_key', p_program_key,
        'working_level', p_working_level,
        'week', p_week,
        'quiz_id', p_quiz_id,
        'reward_attempt', 1
      )
    );
  else
    perform public.upsert_student_activity_daily(
      p_student_id,
      actual_class_id,
      (timezone('Australia/Melbourne', now()))::date,
      questions_answered,
      least(correct_answers, questions_answered),
      0,
      0,
      0,
      0
    );
  end if;

  return reward_eligible;
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
  effective_progress jsonb := coalesce(p_progress, '{}'::jsonb);
  assessment_percent integer := coalesce(
    nullif(p_attempt->>'score_percent', '')::integer,
    nullif(p_attempt->>'percent', '')::integer,
    0
  );
  full_program_weeks jsonb;
begin
  perform public.assert_student_access(p_student_id);
  select student.class_id into actual_class_id
  from public.students student
  where student.id = p_student_id;

  if p_class_id is distinct from actual_class_id
    or p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance')
    or p_assessment_type not in ('pretest', 'posttest') then
    raise exception 'Student context does not match';
  end if;

  if p_realm_id = 'chance'
    and p_working_level not in ('Year 3', 'Year 4', 'Year 5', 'Year 6') then
    raise exception 'Chance Hollow supports Year 3 to Year 6';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      p_student_id::text || ':' || p_realm_id || ':' ||
      p_working_level || ':' || p_assessment_type,
      0
    )
  );

  if p_assessment_type = 'pretest'
    and assessment_percent < 50
    and nullif(effective_progress->>'next_working_level', '') is null then
    full_program_weeks := case
      when p_realm_id = 'number' then '[1,2,3,4,5,6,7,8,9,10,11,12]'::jsonb
      when p_realm_id = 'statistics' then '[1,2,3,4,5,6]'::jsonb
      when p_realm_id = 'chance' then '[1,2,3,4,5,6]'::jsonb
      when p_realm_id = 'pattern' then '[1,2,3,4,5,6,7,8]'::jsonb
      else '[1,2,3,4,5,6,7,8]'::jsonb
    end;
    effective_progress := effective_progress || jsonb_build_object(
      'current_week', 1,
      'assigned_week', 1,
      'required_weeks', full_program_weeks,
      'optional_weeks', '[]'::jsonb
    );
  end if;

  insert into public.student_completion_receipts(
    student_id, realm_id, activity_type, completion_key
  ) values (
    p_student_id, p_realm_id, p_assessment_type, p_completion_key
  )
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;

  perform public.save_realm_assessment(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, p_assessment_type, p_attempt
  );
  perform public.save_student_realm_progress(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, effective_progress
  );

  if p_assessment_type = 'pretest'
    and nullif(effective_progress->>'next_working_level', '') is not null then
    perform public.save_student_realm_progress(
      p_student_id,
      actual_class_id,
      p_realm_id,
      public.realm_program_key(effective_progress->>'next_working_level', p_realm_id),
      p_school_year_level,
      effective_progress->>'next_working_level',
      jsonb_build_object(
        'status', 'ASSIGNED_PROGRAM',
        'current_week', 1,
        'assigned_week', 1,
        'placement_complete', false,
        'required_weeks', '[]'::jsonb,
        'optional_weeks', '[]'::jsonb,
        'unlocked_legends', coalesce(effective_progress->'unlocked_legends', '[]'::jsonb)
      )
    );
  end if;

  return true;
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
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then
    raise exception 'Invalid realm';
  end if;
  if p_assigned_level not in ('Prep', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6') then
    raise exception 'Invalid assigned level';
  end if;
  if p_realm_id = 'statistics' and p_assigned_level = 'Prep' then
    raise exception 'Statistica starts at Year 1';
  end if;
  if p_realm_id in ('pattern', 'chance')
    and p_assigned_level not in ('Year 3', 'Year 4', 'Year 5', 'Year 6') then
    raise exception 'Pattern Peaks and Chance Hollow support Year 3 to Year 6';
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
    select 1 from public.student_realm_progress progress
    where progress.student_id = p_student_id and progress.realm_id = p_realm_id
  ) into v_has_progress;

  select
    exists (
      select 1 from public.student_realm_progress progress
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

create or replace function public.teacher_change_starting_levels(
  p_realm_id text,
  p_placements jsonb
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  placement jsonb;
  saved_count integer := 0;
begin
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then
    raise exception 'Invalid realm';
  end if;
  if jsonb_typeof(p_placements) <> 'array' then
    raise exception 'Placements must be an array';
  end if;

  for placement in select value from jsonb_array_elements(p_placements)
  loop
    perform public.teacher_change_starting_level(
      nullif(placement->>'student_id', '')::uuid,
      p_realm_id,
      placement->>'assigned_level',
      coalesce(placement->>'entry_mode', 'pretest')
    );
    saved_count := saved_count + 1;
  end loop;

  return saved_count;
end;
$$;

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
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then
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

  v_last_week := case
    when p_realm_id in ('statistics', 'chance') then 6
    when p_realm_id in ('measurement', 'space', 'pattern') then 8
    else 12
  end;
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
    jsonb_build_object('current_week', v_progress.current_week, 'assigned_week', v_progress.assigned_week, 'status', v_progress.status),
    jsonb_build_object('current_week', v_next_week, 'assigned_week', v_next_week, 'status', v_progress.status, 'advancement', 'teacher_override')
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
    jsonb_build_object('working_level', p_working_level, 'week', p_week, 'reason', p_reason, 'notes', nullif(trim(coalesce(p_notes, '')), ''))::text,
    jsonb_build_object('working_level', p_working_level, 'week', v_next_week, 'override_id', v_override_id)::text
  );

  return v_override_id;
end;
$$;

revoke all on function public.realm_first_level_pretest_enabled(text, text)
  from public, anon, authenticated;
revoke all on function public.get_student_realm_progress_compat_secure(uuid, text)
  from public, anon, authenticated;
grant execute on function public.get_student_realm_progress_compat_secure(uuid, text)
  to anon, authenticated;
revoke all on function public.save_student_realm_progress_secure(uuid, uuid, text, text, text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.save_student_realm_progress_secure(uuid, uuid, text, text, text, text, jsonb)
  to anon, authenticated;
revoke all on function public.complete_realm_assessment(uuid, uuid, text, text, text, text, text, uuid, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.complete_realm_assessment(uuid, uuid, text, text, text, text, text, uuid, jsonb, jsonb)
  to anon, authenticated;
revoke all on function public.complete_realm_lesson(uuid, uuid, text, text, text, text, integer, integer, text, uuid, jsonb, integer)
  from public, anon, authenticated;
grant execute on function public.complete_realm_lesson(uuid, uuid, text, text, text, text, integer, integer, text, uuid, jsonb, integer)
  to anon, authenticated;
revoke all on function public.complete_realm_quiz(uuid, uuid, text, text, text, text, integer, text, uuid, jsonb, integer)
  from public, anon, authenticated;
grant execute on function public.complete_realm_quiz(uuid, uuid, text, text, text, text, integer, text, uuid, jsonb, integer)
  to anon, authenticated;
revoke all on function public.teacher_change_starting_level(uuid, text, text, text)
  from public, anon;
grant execute on function public.teacher_change_starting_level(uuid, text, text, text)
  to authenticated;
revoke all on function public.teacher_change_starting_levels(text, jsonb)
  from public, anon;
grant execute on function public.teacher_change_starting_levels(text, jsonb)
  to authenticated;
revoke all on function public.teacher_advance_student_week(uuid, text, text, integer, text, text)
  from public, anon;
grant execute on function public.teacher_advance_student_week(uuid, text, text, integer, text, text)
  to authenticated;

commit;
