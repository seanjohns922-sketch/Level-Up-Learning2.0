begin;

-- Correct the level-band origin used by live progression. A Level N test
-- measures the interval from N-1 (prior level complete) to N (this level
-- complete). The former calculation plotted every assessment one year ahead.
create or replace function public.complete_whole_math_diagnostic_strand(
  p_student_id uuid,
  p_sitting_id uuid,
  p_strand text,
  p_probe_scores jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mastery constant integer := 85;
  v_floor constant integer := 40;
  v_result public.whole_math_diagnostic_strand_results%rowtype;
  v_sitting public.whole_math_diagnostic_sittings%rowtype;
  v_probe jsonb;
  v_normalized jsonb := '[]'::jsonb;
  v_codes jsonb := '[]'::jsonb;
  v_score integer;
  v_total integer;
  v_percent numeric;
  v_level integer;
  v_expected integer;
  v_current integer;
  v_last_mastered integer;
  v_recommended integer;
  v_terminal_level integer;
  v_terminal_percent numeric;
  v_flag text := null;
  v_placement boolean := false;
  v_pending integer;
  v_full_weeks jsonb;
  v_class_id uuid;
  v_school_year text;
begin
  perform public.assert_student_access(p_student_id);
  select * into v_sitting from public.whole_math_diagnostic_sittings
  where id = p_sitting_id and student_id = p_student_id for update;
  if not found or v_sitting.status = 'completed' then raise exception 'Diagnostic sitting is not active'; end if;

  select * into v_result from public.whole_math_diagnostic_strand_results
  where sitting_id = p_sitting_id and student_id = p_student_id and strand = p_strand for update;
  if not found or v_result.status <> 'pending' or v_result.realm_id is null then
    raise exception 'Diagnostic strand is not available';
  end if;
  if jsonb_typeof(p_probe_scores) <> 'array' or jsonb_array_length(p_probe_scores) < 1 or jsonb_array_length(p_probe_scores) > 7 then
    raise exception 'Invalid diagnostic probes';
  end if;

  v_current := substring(v_result.starting_level from '[0-9]+')::integer;
  v_expected := v_current;
  v_last_mastered := v_current;
  v_recommended := v_current;

  for v_probe in select value from jsonb_array_elements(p_probe_scores) probe(value) loop
    v_level := substring(coalesce(v_probe->>'level', '') from '[0-9]+')::integer;
    v_score := nullif(v_probe->>'score', '')::integer;
    v_total := nullif(v_probe->>'total', '')::integer;
    if v_level is null or v_level <> v_expected or v_total < 10 or v_total > 20 or v_score < 0 or v_score > v_total then
      raise exception 'Invalid diagnostic probe sequence';
    end if;
    v_percent := round((v_score::numeric * 100) / v_total, 2);
    v_terminal_level := v_level;
    v_terminal_percent := v_percent;
    v_normalized := v_normalized || jsonb_build_array(jsonb_build_object(
      'level', 'Year ' || v_level,
      'score', v_score,
      'total', v_total,
      'percent', v_percent,
      'questionIds', coalesce(v_probe->'questionIds', '[]'::jsonb),
      'curriculumCodes', coalesce(v_probe->'curriculumCodes', '[]'::jsonb)
    ));
    v_codes := v_codes || coalesce(v_probe->'curriculumCodes', '[]'::jsonb);

    if v_percent >= v_mastery then
      v_last_mastered := greatest(v_last_mastered, v_level);
      v_recommended := v_last_mastered;
      v_expected := v_level + 1;
    elsif v_percent >= v_floor then
      v_recommended := greatest(v_current, v_level);
      exit;
    else
      v_recommended := greatest(v_current, v_last_mastered);
      v_flag := case when v_level = v_current then 'review_support' else 'extension_ready_to_bridge' end;
      exit;
    end if;
  end loop;

  if v_terminal_percent >= v_mastery and v_terminal_level < 6 then
    raise exception 'A mastered level must probe the next level';
  end if;

  v_placement := v_recommended > v_current;
  update public.whole_math_diagnostic_strand_results
  set status = 'completed',
      measured_level = greatest(0, least(6,
        case
          when v_terminal_percent >= v_mastery then v_terminal_level
          when v_terminal_percent >= v_floor then v_terminal_level - 1 + ((v_terminal_percent - v_floor) / (v_mastery - v_floor))
          else v_terminal_level - 1 - least(0.9, (v_floor - v_terminal_percent) / v_floor)
        end
      )),
      recommended_level = 'Year ' || v_recommended,
      placement_applied = v_placement,
      flag = v_flag,
      probe_scores = v_normalized,
      curriculum_codes = (select coalesce(jsonb_agg(distinct code), '[]'::jsonb) from jsonb_array_elements_text(v_codes) code),
      completed_at = now()
  where id = v_result.id;

  if v_placement then
    select student.class_id, coalesce(student.school_year_level, student.year_level)
    into v_class_id, v_school_year from public.students student where student.id = p_student_id;
    v_full_weeks := case
      when v_result.realm_id = 'number' then '[1,2,3,4,5,6,7,8,9,10,11,12]'::jsonb
      when v_result.realm_id = 'statistics' then '[1,2,3,4,5,6]'::jsonb
      else '[1,2,3,4,5,6,7,8]'::jsonb
    end;

    update public.student_realm_progress set is_current = false
    where student_id = p_student_id and realm_id = v_result.realm_id and is_current;
    insert into public.student_realm_progress (
      student_id, class_id, realm_id, program_key, school_year_level, working_level,
      is_current, status, current_week, assigned_week, placement_complete, required_weeks, optional_weeks
    ) values (
      p_student_id, v_class_id, v_result.realm_id,
      public.realm_program_key('Year ' || v_recommended, v_result.realm_id),
      v_school_year, 'Year ' || v_recommended, true, 'ASSIGNED_PROGRAM', 1, 1, true,
      v_full_weeks, '[]'::jsonb
    ) on conflict (student_id, realm_id, working_level) do update set
      class_id = excluded.class_id,
      program_key = excluded.program_key,
      school_year_level = excluded.school_year_level,
      is_current = true,
      status = excluded.status,
      current_week = coalesce(public.student_realm_progress.current_week, 1),
      assigned_week = coalesce(public.student_realm_progress.assigned_week, 1),
      placement_complete = true,
      required_weeks = case when public.student_realm_progress.required_weeks = '[]'::jsonb then excluded.required_weeks else public.student_realm_progress.required_weeks end,
      updated_at = now();

    insert into public.student_realm_placement (
      student_id, realm_id, assigned_start_level, assigned_entry_mode, placement_source,
      placement_assigned_by, placement_assigned_at, updated_at
    ) values (
      p_student_id, v_result.realm_id, 'Year ' || v_recommended, 'full_level', 'diagnostic',
      v_sitting.initiated_by, now(), now()
    ) on conflict (student_id, realm_id) do update set
      assigned_start_level = excluded.assigned_start_level,
      assigned_entry_mode = excluded.assigned_entry_mode,
      placement_source = excluded.placement_source,
      placement_assigned_by = excluded.placement_assigned_by,
      placement_assigned_at = excluded.placement_assigned_at,
      updated_at = now();
  end if;

  update public.whole_math_diagnostic_sittings
  set status = 'in_progress', started_at = coalesce(started_at, now())
  where id = p_sitting_id;
  select count(*) into v_pending from public.whole_math_diagnostic_strand_results
  where sitting_id = p_sitting_id and status = 'pending';
  if v_pending = 0 then
    update public.whole_math_diagnostic_sittings
    set status = 'completed', completed_at = now(), overall_level = null
    where id = p_sitting_id;
  end if;

  return jsonb_build_object(
    'sitting_complete', v_pending = 0,
    'measured_level', greatest(0, least(6, case
      when v_terminal_percent >= v_mastery then v_terminal_level
      when v_terminal_percent >= v_floor then v_terminal_level - 1 + ((v_terminal_percent - v_floor) / (v_mastery - v_floor))
      else v_terminal_level - 1 - least(0.9, (v_floor - v_terminal_percent) / v_floor) end)),
    'recommended_level', 'Year ' || v_recommended,
    'placement_applied', v_placement,
    'flag', v_flag
  );
end;
$$;



-- Recalculate any staged diagnostic strand results created with the old origin.
update public.whole_math_diagnostic_strand_results result
set measured_level = greatest(0, least(6, case
  when nullif(result.probe_scores->(jsonb_array_length(result.probe_scores) - 1)->>'percent', '')::numeric >= 85
    then substring(result.probe_scores->(jsonb_array_length(result.probe_scores) - 1)->>'level' from '[0-9]+')::numeric
  when nullif(result.probe_scores->(jsonb_array_length(result.probe_scores) - 1)->>'percent', '')::numeric >= 40
    then substring(result.probe_scores->(jsonb_array_length(result.probe_scores) - 1)->>'level' from '[0-9]+')::numeric - 1
      + ((nullif(result.probe_scores->(jsonb_array_length(result.probe_scores) - 1)->>'percent', '')::numeric - 40) / 45)
  else substring(result.probe_scores->(jsonb_array_length(result.probe_scores) - 1)->>'level' from '[0-9]+')::numeric - 1
    - least(0.9, (40 - nullif(result.probe_scores->(jsonb_array_length(result.probe_scores) - 1)->>'percent', '')::numeric) / 40)
end))
where result.status = 'completed'
  and jsonb_typeof(result.probe_scores) = 'array'
  and jsonb_array_length(result.probe_scores) > 0;


create or replace function public.refresh_student_live_maths_progression(
  p_student_id uuid,
  p_realm_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
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
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics') then return; end if;

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
  v_total_weeks := case
    when p_realm_id = 'number' then 12
    when p_realm_id = 'statistics' then 6
    else 8
  end;

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
    public.maths_progression_level_number(assessment.working_level),
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
    v_checkpoint := greatest(0, least(6, case
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
  v_predicted := least(6, round((v_checkpoint + v_week_equivalents / v_total_weeks)::numeric, 2));
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
    p_student_id, v_progress.class_id, p_realm_id, p_realm_id, v_progress.working_level,
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
$$;

revoke all on function public.refresh_student_live_maths_progression(uuid, text) from public, anon, authenticated;

-- Recompute every current four-realm row with the corrected band semantics.
do $$
declare
  current_progress record;
begin
  for current_progress in
    select progress.student_id, progress.realm_id
    from public.student_realm_progress progress
    where progress.is_current
      and progress.realm_id in ('number', 'measurement', 'space', 'statistics')
  loop
    perform public.refresh_student_live_maths_progression(
      current_progress.student_id,
      current_progress.realm_id
    );
  end loop;
end;
$$;

commit;
