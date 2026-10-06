begin;
-- Keep the Ground–6 programme contracts, and give Level 7 its own server-side lengths.
create or replace function public.realm_program_week_count(p_realm_id text, p_working_level text)
returns integer language sql immutable set search_path=public as $$
 select case when p_working_level='Year 7' then
   case p_realm_id when 'number' then 12 when 'measurement' then 12 when 'space' then 10
     when 'pattern' then 12 when 'statistics' then 10 when 'chance' then 8 else 0 end
 else case when p_realm_id='number' then 12
   when p_realm_id in ('measurement','space','pattern') then 8
   when p_realm_id in ('statistics','chance') then 6 else 0 end end;
$$;

-- realm_week_is_playable
CREATE OR REPLACE FUNCTION public.realm_week_is_playable(p_student_id uuid, p_realm_id text, p_working_level text, p_program_key text, p_week integer)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  progress public.student_realm_progress%rowtype;
  maximum_week integer;
  required_count integer := 0;
  completed_required_count integer := 0;
  first_incomplete_required integer;
  optional_count integer := 0;
begin
  maximum_week := public.realm_program_week_count(p_realm_id, p_working_level);
  if p_week < 1 or p_week > maximum_week then return false; end if;

  select * into progress
  from public.student_realm_progress candidate
  where candidate.student_id = p_student_id
    and candidate.realm_id = p_realm_id
    and candidate.working_level = p_working_level
    and candidate.is_current
  limit 1;

  if progress.id is null
    or progress.program_key is distinct from p_program_key
    or progress.status <> 'ASSIGNED_PROGRAM'
    or not progress.placement_complete then
    return false;
  end if;

  select count(distinct required_week.value::integer)
  into required_count
  from jsonb_array_elements_text(coalesce(progress.required_weeks, '[]'::jsonb)) as required_week(value)
  where required_week.value ~ '^[0-9]+$'
    and required_week.value::integer between 1 and maximum_week;

  if required_count > 0 then
    select count(distinct required_week.value::integer)
    into completed_required_count
    from jsonb_array_elements_text(coalesce(progress.required_weeks, '[]'::jsonb)) as required_week(value)
    where required_week.value ~ '^[0-9]+$'
      and required_week.value::integer between 1 and maximum_week
      and (exists (
        select 1
        from public.student_weekly_quiz_attempts quiz
        where quiz.student_id = p_student_id
          and quiz.realm_id = p_realm_id
          and quiz.working_level = p_working_level
          and quiz.week = required_week.value::integer
          and quiz.passed
          and quiz.accuracy_percent >= 80
      ) or (p_working_level='Year 7' and required_week.value::integer=maximum_week
        and (select count(distinct lesson.lesson) from public.student_lesson_attempts lesson
          where lesson.student_id=p_student_id and lesson.realm_id=p_realm_id
            and lesson.working_level=p_working_level and lesson.week=maximum_week
            and lesson.lesson between 1 and 3 and lesson.completed)=3));

    if completed_required_count = required_count then return true; end if;

    select min(required_week.value::integer)
    into first_incomplete_required
    from jsonb_array_elements_text(coalesce(progress.required_weeks, '[]'::jsonb)) as required_week(value)
    where required_week.value ~ '^[0-9]+$'
      and required_week.value::integer between 1 and maximum_week
      and not (exists (
        select 1
        from public.student_weekly_quiz_attempts quiz
        where quiz.student_id = p_student_id
          and quiz.realm_id = p_realm_id
          and quiz.working_level = p_working_level
          and quiz.week = required_week.value::integer
          and quiz.passed
          and quiz.accuracy_percent >= 80
      ) or (p_working_level='Year 7' and required_week.value::integer=maximum_week
        and (select count(distinct lesson.lesson) from public.student_lesson_attempts lesson
          where lesson.student_id=p_student_id and lesson.realm_id=p_realm_id
            and lesson.working_level=p_working_level and lesson.week=maximum_week
            and lesson.lesson between 1 and 3 and lesson.completed)=3));

    return exists (
      select 1
      from jsonb_array_elements_text(coalesce(progress.required_weeks, '[]'::jsonb)) as required_week(value)
      where required_week.value ~ '^[0-9]+$'
        and required_week.value::integer = p_week
        and (
          required_week.value::integer = first_incomplete_required
          or required_week.value::integer <= coalesce(progress.assigned_week, 1)
          or exists (
            select 1
            from public.student_weekly_quiz_attempts quiz
            where quiz.student_id = p_student_id
              and quiz.realm_id = p_realm_id
              and quiz.working_level = p_working_level
              and quiz.week = p_week
              and quiz.passed
              and quiz.accuracy_percent >= 80
          )
        )
    );
  end if;

  select count(distinct optional_week.value::integer)
  into optional_count
  from jsonb_array_elements_text(coalesce(progress.optional_weeks, '[]'::jsonb)) as optional_week(value)
  where optional_week.value ~ '^[0-9]+$'
    and optional_week.value::integer between 1 and maximum_week;

  if optional_count = maximum_week then return true; end if;
  return p_week = least(maximum_week, greatest(1, coalesce(progress.assigned_week, 1)));
end;
$function$
;

-- teacher_advance_student_week
CREATE OR REPLACE FUNCTION public.teacher_advance_student_week(p_student_id uuid, p_realm_id text, p_working_level text, p_week integer, p_reason text, p_notes text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  v_last_week := public.realm_program_week_count(p_realm_id, p_working_level);
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
$function$
;

-- complete_realm_assessment
CREATE OR REPLACE FUNCTION public.complete_realm_assessment(p_student_id uuid, p_class_id uuid, p_realm_id text, p_program_key text, p_school_year_level text, p_working_level text, p_assessment_type text, p_completion_key uuid, p_attempt jsonb DEFAULT '{}'::jsonb, p_progress jsonb DEFAULT '{}'::jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    select jsonb_agg(week order by week) into full_program_weeks
    from generate_series(1,public.realm_program_week_count(p_realm_id,p_working_level)) week;
    effective_progress := effective_progress || jsonb_build_object(
      'current_week', 1,
      'assigned_week', 1,
      'required_weeks', full_program_weeks,
      'optional_weeks', '[]'::jsonb
    );
  end if;

  -- Every Ground pre-test records a baseline and starts the full program.
  if p_realm_id in ('number','measurement','space') and p_working_level = 'Prep' and p_assessment_type = 'pretest' then
    effective_progress := effective_progress || jsonb_build_object(
      'status', 'ASSIGNED_PROGRAM', 'placement_complete', true,
      'current_week', 1, 'assigned_week', 1,
      'required_weeks', case when p_realm_id='number' then '[1,2,3,4,5,6,7,8,9,10,11,12]'::jsonb else '[1,2,3,4,5,6,7,8]'::jsonb end,
      'optional_weeks', '[]'::jsonb, 'next_working_level', null
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
$function$
;

-- refresh_student_live_maths_progression
CREATE OR REPLACE FUNCTION public.refresh_student_live_maths_progression(p_student_id uuid, p_realm_id text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_quiz_pass constant integer := 80;
  v_mastery constant integer := 85;
  v_floor constant integer := 40;
  v_lesson_week_credit constant numeric := 0.4;
  v_lessons_per_week constant integer := 3;
  v_max_confidence constant integer := 95;
  v_progress public.student_realm_progress%rowtype;
  v_working_number integer;
  v_total_weeks integer;
  v_official numeric;
  v_official_at timestamptz;
  v_checkpoint numeric;
  v_checkpoint_source text;
  v_checkpoint_at timestamptz;
  v_assessment_type text;
  v_assessment_level integer;
  v_assessment_score numeric;
  v_assessment_at timestamptz;
  v_passed_quiz_weeks integer := 0;
  v_unconfirmed_lessons integer := 0;
  v_week_equivalents numeric := 0;
  v_predicted numeric;
  v_confidence integer;
begin
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then return; end if;

  select progress.* into v_progress
  from public.student_realm_progress progress
  where progress.student_id = p_student_id
    and progress.realm_id = p_realm_id
    and progress.is_current
  order by progress.updated_at desc
  limit 1;

  if not found or v_progress.class_id is null then
    delete from public.student_live_maths_progression
    where student_id = p_student_id and realm_id = p_realm_id;
    return;
  end if;

  v_working_number := public.maths_progression_level_number(v_progress.working_level);
  if v_working_number is null then return; end if;
  v_total_weeks := public.realm_program_week_count(p_realm_id, v_progress.working_level);

  -- Only a completed Whole-Maths strand result is official. Realm assessments
  -- are verified checkpoints for the live estimate, never official results.
  select result.measured_level, result.completed_at
  into v_official, v_official_at
  from public.whole_math_diagnostic_strand_results result
  join public.whole_math_diagnostic_sittings sitting on sitting.id = result.sitting_id
  where result.student_id = p_student_id
    and result.realm_id = p_realm_id
    and result.status = 'completed'
    and result.measured_level is not null
    and sitting.status = 'completed'
    and sitting.checkpoint in ('start', 'mid', 'end')
    and (
      select count(distinct completed_result.strand)
      from public.whole_math_diagnostic_strand_results completed_result
      where completed_result.sitting_id = sitting.id
        and completed_result.status = 'completed'
        and completed_result.measured_level is not null
    ) = 6
  order by result.completed_at desc
  limit 1;

  -- Any completed strand diagnostic, including a teacher-triggered ad-hoc
  -- check, may be the latest verified realm checkpoint. Ad-hoc checks never
  -- populate official_level.
  select result.measured_level, result.completed_at
  into v_checkpoint, v_checkpoint_at
  from public.whole_math_diagnostic_strand_results result
  join public.whole_math_diagnostic_sittings sitting on sitting.id = result.sitting_id
  where result.student_id = p_student_id
    and result.realm_id = p_realm_id
    and result.status = 'completed'
    and result.measured_level is not null
    and sitting.status = 'completed'
  order by result.completed_at desc
  limit 1;
  if v_checkpoint is not null then
    v_checkpoint_source := 'diagnostic';
  end if;

  -- The newest realm pre/post-test is a verified live checkpoint. Mastery at
  -- 85% confirms the next level boundary; a non-passing score still
  -- recalibrates position within (or just below) the tested level.
  select
    lower(assessment.assessment_type),
    case when p_realm_id in ('number','measurement','space','statistics','pattern','chance') and assessment.working_level in ('Year 7','Year 8') then public.number_diagnostic_level_value(assessment.working_level) else public.maths_progression_level_number(assessment.working_level) end,
    assessment.score_percent,
    assessment.completed_at
  into v_assessment_type, v_assessment_level, v_assessment_score, v_assessment_at
  from public.student_realm_assessments assessment
  where assessment.student_id = p_student_id
    and assessment.realm_id = p_realm_id
    and lower(assessment.assessment_type) in ('pretest', 'posttest')
  order by assessment.completed_at desc
  limit 1;

  if not found then
    select historical.assessment_type, historical.assessment_level,
      historical.assessment_score, historical.assessment_at
    into v_assessment_type, v_assessment_level, v_assessment_score, v_assessment_at
    from (
      select 'pretest'::text as assessment_type,
        public.maths_progression_level_number(progress.working_level) as assessment_level,
        progress.pretest_score::numeric as assessment_score,
        progress.pretest_completed_at as assessment_at
      from public.student_realm_progress progress
      where progress.student_id = p_student_id and progress.realm_id = p_realm_id
        and progress.pretest_score is not null and progress.pretest_completed_at is not null
      union all
      select 'posttest'::text,
        public.maths_progression_level_number(progress.working_level),
        progress.posttest_score::numeric,
        progress.posttest_completed_at
      from public.student_realm_progress progress
      where progress.student_id = p_student_id and progress.realm_id = p_realm_id
        and progress.posttest_score is not null and progress.posttest_completed_at is not null
    ) historical
    order by historical.assessment_at desc
    limit 1;
  end if;

  if found and v_assessment_level is not null and v_assessment_score is not null
    and (v_checkpoint_at is null or v_assessment_at > v_checkpoint_at) then
    v_checkpoint := greatest(0, least(case when p_realm_id in ('number','measurement','space','statistics','pattern','chance') then 8 else 6 end, case
      when v_assessment_score >= v_mastery then v_assessment_level
      when v_assessment_score >= v_floor then v_assessment_level - 1 + ((v_assessment_score - v_floor) / (v_mastery - v_floor))
      else v_assessment_level - 1 - least(0.9, (v_floor - v_assessment_score) / v_floor)
    end));
    v_checkpoint_source := v_assessment_type;
    v_checkpoint_at := v_assessment_at;
  end if;

  -- A teacher placement is a transparent fallback, not verified evidence.
  if v_checkpoint is null then
    v_checkpoint := greatest(0, v_working_number - 1);
    v_checkpoint_source := 'placement';
    v_checkpoint_at := coalesce(v_progress.created_at, v_progress.updated_at, now());
  end if;

  select count(*) into v_passed_quiz_weeks
  from (
    select attempt.week
    from public.student_weekly_quiz_attempts attempt
    where attempt.student_id = p_student_id
      and attempt.realm_id = p_realm_id
      and attempt.working_level = v_progress.working_level
      and attempt.completed_at > v_checkpoint_at
    group by attempt.week
    having max(attempt.accuracy_percent) >= v_quiz_pass or bool_or(attempt.passed)
  ) passed_weeks;

  select count(*) into v_unconfirmed_lessons
  from (
    select attempt.week, attempt.lesson
    from public.student_lesson_attempts attempt
    where attempt.student_id = p_student_id
      and attempt.realm_id = p_realm_id
      and attempt.working_level = v_progress.working_level
      and attempt.completed
      and attempt.completed_at > v_checkpoint_at
      and not exists (
        select 1 from public.student_weekly_quiz_attempts quiz
        where quiz.student_id = attempt.student_id
          and quiz.realm_id = attempt.realm_id
          and quiz.working_level = attempt.working_level
          and quiz.week = attempt.week
          and quiz.completed_at > v_checkpoint_at
          and (quiz.accuracy_percent >= v_quiz_pass or quiz.passed)
      )
    group by attempt.week, attempt.lesson
  ) unconfirmed_lessons;

  v_week_equivalents := v_passed_quiz_weeks
    + (v_unconfirmed_lessons::numeric / v_lessons_per_week) * v_lesson_week_credit;
  v_predicted := least(case when p_realm_id in ('number','measurement','space','statistics','pattern','chance') then 8 else 6 end, round((v_checkpoint + v_week_equivalents / v_total_weeks)::numeric, 2));
  v_confidence := least(
    v_max_confidence,
    case v_checkpoint_source when 'diagnostic' then 70 when 'posttest' then 70 when 'pretest' then 60 else 25 end
      + least(25, v_passed_quiz_weeks * 4 + v_unconfirmed_lessons)
  );

  insert into public.student_live_maths_progression (
    student_id, class_id, realm_id, strand, current_working_level,
    official_level, official_at, checkpoint_level, checkpoint_source, checkpoint_at, predicted_level,
    prediction_confidence, evidence, updated_at
  ) values (
    p_student_id, v_progress.class_id, p_realm_id,
    case
      when p_realm_id = 'pattern' then 'algebra'
      when p_realm_id = 'chance' then 'probability'
      else p_realm_id
    end,
    v_progress.working_level,
    round(v_official, 2), v_official_at, round(v_checkpoint, 2), v_checkpoint_source, v_checkpoint_at, v_predicted,
    v_confidence,
    jsonb_build_object(
      'passedQuizWeeks', v_passed_quiz_weeks,
      'completedUnconfirmedLessons', v_unconfirmed_lessons,
      'confirmedWeekEquivalents', round(v_week_equivalents, 2),
      'totalWeeks', v_total_weeks,
      'quizPassPercent', v_quiz_pass,
      'lessonWeekCredit', v_lesson_week_credit
    ),
    now()
  ) on conflict (student_id, realm_id) do update set
    class_id = excluded.class_id,
    strand = excluded.strand,
    current_working_level = excluded.current_working_level,
    official_level = excluded.official_level,
    official_at = excluded.official_at,
    checkpoint_level = excluded.checkpoint_level,
    checkpoint_source = excluded.checkpoint_source,
    checkpoint_at = excluded.checkpoint_at,
    predicted_level = excluded.predicted_level,
    prediction_confidence = excluded.prediction_confidence,
    evidence = excluded.evidence,
    updated_at = now();
end;
$function$
;

-- maths_progression_level_number
CREATE OR REPLACE FUNCTION public.maths_progression_level_number(p_level text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  select case
    when lower(trim(coalesce(p_level, ''))) in ('prep', 'foundation', 'ground', 'ground level') then 0
    when substring(coalesce(p_level, '') from '[0-9]+')::integer between 1 and 8
      then substring(coalesce(p_level, '') from '[0-9]+')::integer
    else null
  end;
$function$
;

commit;
