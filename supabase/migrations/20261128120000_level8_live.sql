-- Level 8 goes live (Sean, 26 November 2026).
-- 1. Year 8 gets its own server-side programme lengths (it used the Ground–6 lengths).
-- 2. Its final week finishes on lessons, as at Level 7: the post-test replaces that week's quiz.
-- 3. Teachers and parents may choose a starting level up to Year 8 (docs/advanced-pathway-levels-7-8.md).
-- 4. The Whole-Maths diagnostic may place students up to Level 8 (it already measures Level 8).
-- 5. A pre-test under 50% assigns every week of that level's programme. It used the Ground–6
--    lengths, which cut Levels 7 and 8 short (e.g. Level 7 Statistics got 6 of its 10 weeks).
-- Every other line of each function is unchanged from its latest migration, noted above it.
-- Rollback: re-run those earlier definitions.
begin;

create or replace function public.realm_program_week_count(p_realm_id text, p_working_level text)
returns integer language sql immutable set search_path=public as $$
 select case when p_working_level='Year 7' then
   case p_realm_id when 'number' then 12 when 'measurement' then 12 when 'space' then 10
     when 'pattern' then 12 when 'statistics' then 10 when 'chance' then 8 else 0 end
 when p_working_level='Year 8' then
   case p_realm_id when 'number' then 12 when 'measurement' then 12 when 'space' then 10
     when 'pattern' then 12 when 'statistics' then 10 when 'chance' then 10 else 0 end
 else case when p_realm_id='number' then 12
   when p_realm_id in ('measurement','space','pattern') then 8
   when p_realm_id in ('statistics','chance') then 6 else 0 end end;
$$;

-- From 20261007130000_level7_server_programme_lengths.sql.
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
      ) or (p_working_level in ('Year 7','Year 8') and required_week.value::integer=maximum_week
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
      ) or (p_working_level in ('Year 7','Year 8') and required_week.value::integer=maximum_week
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
$function$;

-- From 20261102150000_block_archived_student_placement.sql.
CREATE OR REPLACE FUNCTION public.teacher_change_starting_level(p_student_id uuid, p_realm_id text, p_assigned_level text, p_entry_mode text DEFAULT 'pretest'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  if p_assigned_level not in ('Prep', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8') then
    raise exception 'Invalid assigned level';
  end if;
  if p_realm_id = 'statistics' and p_assigned_level = 'Prep' then
    raise exception 'Statistica starts at Year 1';
  end if;
  if p_realm_id in ('pattern', 'chance')
    and p_assigned_level not in ('Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8') then
    raise exception 'This realm supports Year 3 to Year 8';
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
  where student.id = p_student_id
    and student.archived_at is null
  for update;

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
$function$;

-- From 20261014150000_parent_level7_starting_level.sql.
create or replace function public.parent_change_home_starting_level(
  p_student_id uuid,
  p_realm_id text,
  p_assigned_level text
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_school_year_level text;
  v_ground boolean;
begin
  perform public.assert_parent_role();
  if not public.parent_can_manage_home_student(p_student_id) then
    raise exception 'Home student management has transferred to the school' using errcode = '42501';
  end if;
  if p_realm_id not in ('number','measurement','space','statistics','pattern','chance') then
    raise exception 'Invalid realm';
  end if;
  if p_assigned_level not in ('Prep','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6','Year 7','Year 8') then
    raise exception 'Invalid working level';
  end if;
  if p_realm_id = 'statistics' and p_assigned_level = 'Prep' then
    raise exception 'Statistica starts at Year 1';
  end if;
  if p_realm_id in ('pattern', 'chance')
    and p_assigned_level not in ('Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8') then
    raise exception 'This realm supports Year 3 to Year 8';
  end if;
  if exists (
    select 1 from public.student_lesson_attempts attempt
    where attempt.student_id = p_student_id and attempt.realm_id = p_realm_id
    union all
    select 1 from public.student_weekly_quiz_attempts attempt
    where attempt.student_id = p_student_id and attempt.realm_id = p_realm_id
    union all
    select 1 from public.student_realm_assessments assessment
    where assessment.student_id = p_student_id and assessment.realm_id = p_realm_id
      and assessment.assessment_type = 'posttest'
  ) then
    raise exception 'Starting level cannot change after canonical learning has begun';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_student_id::text || ':' || p_realm_id, 0));
  select school_year_level into v_school_year_level from public.students where id = p_student_id;
  v_ground := p_assigned_level = 'Prep' and not public.realm_first_level_pretest_enabled(p_realm_id,p_assigned_level);

  update public.student_realm_progress
  set is_current = false, updated_at = now()
  where student_id = p_student_id and realm_id = p_realm_id and is_current;

  insert into public.student_realm_placement (
    student_id, realm_id, assigned_start_level, assigned_entry_mode,
    placement_source, placement_assigned_by, placement_assigned_at, updated_at
  ) values (
    p_student_id, p_realm_id, p_assigned_level,
    case when v_ground then 'ground_week1' else 'pretest' end,
    'parent_home', auth.uid(), now(), now()
  ) on conflict (student_id, realm_id) do update set
    assigned_start_level = excluded.assigned_start_level,
    assigned_entry_mode = excluded.assigned_entry_mode,
    placement_source = 'parent_home',
    placement_assigned_by = auth.uid(),
    placement_assigned_at = now(),
    updated_at = now();

  insert into public.student_realm_progress (
    student_id, class_id, realm_id, program_key, school_year_level,
    working_level, is_current, status, current_week, assigned_week,
    placement_complete, pretest_score, pretest_completed_at,
    required_weeks, optional_weeks
  ) values (
    p_student_id, null, p_realm_id,
    public.realm_program_key(p_assigned_level, p_realm_id),
    v_school_year_level, p_assigned_level, true, 'ASSIGNED_PROGRAM',
    case when v_ground then 1 else null end,
    case when v_ground then 1 else null end,
    v_ground, null, null, '[]'::jsonb, '[]'::jsonb
  ) on conflict (student_id, realm_id, working_level) do update set
    is_current = true,
    status = 'ASSIGNED_PROGRAM',
    current_week = excluded.current_week,
    assigned_week = excluded.assigned_week,
    placement_complete = excluded.placement_complete,
    pretest_score = null,
    pretest_completed_at = null,
    required_weeks = '[]'::jsonb,
    optional_weeks = '[]'::jsonb,
    updated_at = now();

  insert into public.student_identity_audit_events (
    actor_user_id, action, student_id, after_state
  ) values (
    auth.uid(), 'home_starting_level_changed', p_student_id,
    jsonb_build_object('realmId', p_realm_id, 'workingLevel', p_assigned_level)
  );
end;
$$;

-- From 20261007150000_diagnostic_level7_placement.sql.
CREATE OR REPLACE FUNCTION public.complete_whole_math_diagnostic_strand_upward_v1(p_student_id uuid, p_sitting_id uuid, p_strand text, p_probe_scores jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_mastery constant integer := 85;
  v_floor constant integer := 20;
  v_result public.whole_math_diagnostic_strand_results%rowtype;
  v_sitting public.whole_math_diagnostic_sittings%rowtype;
  v_probe jsonb; v_normalized jsonb := '[]'::jsonb; v_codes jsonb := '[]'::jsonb;
  v_score integer; v_total integer; v_percent numeric; v_level integer; v_expected integer;
  v_current integer; v_last_mastered integer; v_recommended integer;
  v_terminal_level integer; v_terminal_percent numeric; v_measured numeric;
  v_flag text := null; v_placement boolean := false; v_pending integer;
  v_full_weeks jsonb; v_class_id uuid; v_school_year text; v_overall numeric;
begin
  perform public.assert_student_access(p_student_id);
  select * into v_sitting from public.whole_math_diagnostic_sittings
  where id = p_sitting_id and student_id = p_student_id for update;
  if not found or v_sitting.status = 'completed' then raise exception 'Diagnostic sitting is not active'; end if;
  select * into v_result from public.whole_math_diagnostic_strand_results
  where sitting_id = p_sitting_id and student_id = p_student_id and strand = p_strand for update;
  if not found or v_result.status <> 'pending' or v_result.realm_id is null then raise exception 'Diagnostic strand is not available'; end if;
  if jsonb_typeof(p_probe_scores) <> 'array' or jsonb_array_length(p_probe_scores) < 1 or jsonb_array_length(p_probe_scores)>(case when p_strand='probability' and v_sitting.chance_release_version=1 then 8 when p_strand='algebra' and v_sitting.pattern_release_version=1 then 8 when p_strand='statistics' and v_sitting.statistics_release_version=1 then 8 when p_strand='space' and v_sitting.space_release_version=1 then 9 when p_strand='space' and v_sitting.space_ground_bank_version=3 then 7 when p_strand='number' and v_sitting.number_ground_bank_version=3 then v_sitting.number_maximum_level+1 when p_strand='measurement' and v_sitting.measurement_release_version=1 then 9 when p_strand='measurement' and v_sitting.measurement_ground_bank_version=4 then 7 else 6 end) then
    raise exception 'Invalid diagnostic probes';
  end if;

  v_current := public.number_diagnostic_level_value(v_result.starting_level);
  v_expected := v_current; v_last_mastered := v_current; v_recommended := v_current;
  for v_probe in select value from jsonb_array_elements(p_probe_scores) probe(value) loop
    v_level := public.number_diagnostic_level_value(coalesce(v_probe->>'level', ''));
    v_score := nullif(v_probe->>'score', '')::integer;
    v_total := nullif(v_probe->>'total', '')::integer;
    if v_level is null or v_level<(case when p_strand='space' and v_sitting.space_ground_bank_version=3 then 0 when p_strand='measurement' and v_sitting.measurement_ground_bank_version=4 then 0 when p_strand='number' and v_sitting.number_ground_bank_version=3 then 0 when p_strand in ('algebra','probability') then 3 else 1 end) or v_level>(case when p_strand='number' then v_sitting.number_maximum_level when p_strand='probability' and v_sitting.chance_release_version=1 then 8 when p_strand='algebra' and v_sitting.pattern_release_version=1 then 8 when p_strand='statistics' and v_sitting.statistics_release_version=1 then 8 when p_strand='space' and v_sitting.space_release_version=1 then 8 when p_strand='measurement' and v_sitting.measurement_release_version=1 then 8 else 6 end) or v_level <> v_expected or v_total <> (case when p_strand in ('number','measurement','space','statistics','algebra','probability') and v_level in (7,8) then 30 else 20 end)
      or v_score < 0 or v_score > v_total
      or jsonb_typeof(coalesce(v_probe->'questionIds','[]'::jsonb)) <> 'array'
      or jsonb_array_length(coalesce(v_probe->'questionIds','[]'::jsonb)) <> v_total then
      raise exception 'Invalid diagnostic probe sequence';
    end if;
    v_percent := round((v_score::numeric * 100) / v_total, 2);
    v_terminal_level := v_level; v_terminal_percent := v_percent;
    v_normalized := v_normalized || jsonb_build_array(jsonb_build_object(
      'level', public.number_diagnostic_level_label(v_level), 'score', v_score, 'total', v_total, 'percent', v_percent,
      'questionIds', v_probe->'questionIds',
      'curriculumCodes', coalesce(v_probe->'curriculumCodes', '[]'::jsonb)
    ));
    v_codes := v_codes || coalesce(v_probe->'curriculumCodes', '[]'::jsonb);
    if v_percent >= v_mastery then
      v_last_mastered := greatest(v_last_mastered, v_level); v_recommended := v_last_mastered; v_expected := v_level + 1;
    elsif v_percent >= v_floor then
      v_recommended := greatest(v_current, v_level); exit;
    else
      v_recommended := greatest(v_current, v_last_mastered);
      v_flag := case when v_level = v_current then 'review_support' else 'extension_ready_to_bridge' end; exit;
    end if;
  end loop;
  if v_terminal_percent >= v_mastery and v_terminal_level < (case when p_strand='number' then v_sitting.number_maximum_level when p_strand='probability' and v_sitting.chance_release_version=1 then 8 when p_strand='algebra' and v_sitting.pattern_release_version=1 then 8 when p_strand='statistics' and v_sitting.statistics_release_version=1 then 8 when p_strand='space' and v_sitting.space_release_version=1 then 8 when p_strand='measurement' and v_sitting.measurement_release_version=1 then 8 else 6 end) then raise exception 'A mastered level must probe the next level'; end if;

  v_measured := greatest(0, least((case when p_strand='number' then v_sitting.number_maximum_level when p_strand='probability' and v_sitting.chance_release_version=1 then 8 when p_strand='algebra' and v_sitting.pattern_release_version=1 then 8 when p_strand='statistics' and v_sitting.statistics_release_version=1 then 8 when p_strand='space' and v_sitting.space_release_version=1 then 8 when p_strand='measurement' and v_sitting.measurement_release_version=1 then 8 else 6 end), case
    when v_terminal_percent >= v_mastery then v_terminal_level
    when v_terminal_percent >= 40 then v_terminal_level - 1 + ((v_terminal_percent - 40) / (v_mastery - 40))
    else v_terminal_level - 1 - least(0.9, (40 - v_terminal_percent) / 40) end));
  if v_recommended>8 then v_recommended:=8; v_flag:='extension_ready_to_bridge'; end if;
  -- Existing placement protects against demotion, not earned upward progression.
  v_placement := v_sitting.checkpoint in ('start','mid','end') and v_recommended > v_current;
  update public.whole_math_diagnostic_strand_results
  set status='completed', measured_level=v_measured, recommended_level=public.number_diagnostic_level_label(v_recommended),
      placement_applied=v_placement, flag=v_flag, probe_scores=v_normalized,
      curriculum_codes=(select coalesce(jsonb_agg(distinct code),'[]'::jsonb) from jsonb_array_elements_text(v_codes) code),
      active_level=null, draft_answers='{}'::jsonb, draft_probe_scores='[]'::jsonb,
      draft_question_index=0, completed_at=now(), updated_at=now()
  where id=v_result.id;

  if v_placement then
    select student.class_id, coalesce(student.school_year_level, student.year_level)
    into v_class_id, v_school_year from public.students student where student.id=p_student_id;
    select jsonb_agg(week order by week) into v_full_weeks
    from generate_series(1, public.realm_program_week_count(v_result.realm_id, public.number_diagnostic_level_label(v_recommended))) week;
    update public.student_realm_progress set is_current=false where student_id=p_student_id and realm_id=v_result.realm_id and is_current;
    insert into public.student_realm_progress (
      student_id,class_id,realm_id,program_key,school_year_level,working_level,is_current,status,
      current_week,assigned_week,placement_complete,required_weeks,optional_weeks
    ) values (
      p_student_id,v_class_id,v_result.realm_id,public.realm_program_key(public.number_diagnostic_level_label(v_recommended),v_result.realm_id),
      v_school_year,public.number_diagnostic_level_label(v_recommended),true,'ASSIGNED_PROGRAM',1,1,true,v_full_weeks,'[]'::jsonb
    ) on conflict (student_id,realm_id,working_level) do update set
      class_id=excluded.class_id,program_key=excluded.program_key,school_year_level=excluded.school_year_level,
      is_current=true,status=excluded.status,current_week=coalesce(public.student_realm_progress.current_week,1),
      assigned_week=coalesce(public.student_realm_progress.assigned_week,1),placement_complete=true,
      required_weeks=case when public.student_realm_progress.required_weeks='[]'::jsonb then excluded.required_weeks else public.student_realm_progress.required_weeks end,
      updated_at=now();
    insert into public.student_realm_placement (
      student_id,realm_id,assigned_start_level,assigned_entry_mode,placement_source,
      placement_assigned_by,placement_assigned_at,updated_at
    ) values (
      p_student_id,v_result.realm_id,public.number_diagnostic_level_label(v_recommended),'full_level','diagnostic',v_sitting.initiated_by,now(),now()
    ) on conflict (student_id,realm_id) do update set
      assigned_start_level=excluded.assigned_start_level,assigned_entry_mode=excluded.assigned_entry_mode,
      placement_source=excluded.placement_source,placement_assigned_by=excluded.placement_assigned_by,
      placement_assigned_at=excluded.placement_assigned_at,updated_at=now();
  end if;

  update public.whole_math_diagnostic_sittings set status='in_progress',started_at=coalesce(started_at,now()) where id=p_sitting_id;
  select count(*) into v_pending from public.whole_math_diagnostic_strand_results where sitting_id=p_sitting_id and status='pending';
  if v_pending=0 then
    v_overall := public.whole_math_level_for_sitting(p_sitting_id);
    if v_sitting.checkpoint in ('start','mid','end') and v_overall is null then raise exception 'Official diagnostic requires all six completed strands'; end if;
    update public.whole_math_diagnostic_sittings set status='completed',completed_at=now(),overall_level=v_overall where id=p_sitting_id;
  end if;
  return jsonb_build_object('sitting_complete',v_pending=0,'measured_level',v_measured,
    'recommended_level',public.number_diagnostic_level_label(v_recommended),'placement_applied',v_placement,'flag',v_flag,'overall_level',v_overall);
end;
$function$;

-- From 20261007150000_diagnostic_level7_placement.sql.
CREATE OR REPLACE FUNCTION public.complete_whole_math_diagnostic_strand(p_student_id uuid, p_sitting_id uuid, p_strand text, p_probe_scores jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_result public.whole_math_diagnostic_strand_results%rowtype;
  v_sitting public.whole_math_diagnostic_sittings%rowtype;
  v_probe jsonb; v_previous_level integer; v_level integer; v_score integer; v_total integer;
  v_percent numeric; v_terminal_percent numeric; v_terminal_level integer;
  v_minimum integer; v_index integer:=0; v_pending integer; v_overall numeric; v_measured numeric;
  v_recommended text; v_placement boolean:=false; v_full_weeks jsonb;
  v_class_id uuid; v_school_year text;
begin
  perform public.assert_student_access(p_student_id);
  if not public.whole_math_diagnostic_session_is_open(p_student_id,p_sitting_id) then
    raise exception 'The supervised school diagnostic session is closed' using errcode='42501';
  end if;
  select * into v_result from public.whole_math_diagnostic_strand_results
  where sitting_id=p_sitting_id and student_id=p_student_id and strand=p_strand for update;
  if not found or v_result.status<>'pending' then raise exception 'Diagnostic strand is not active'; end if;
  select * into v_sitting from public.whole_math_diagnostic_sittings
  where id=p_sitting_id and student_id=p_student_id for update;
  if not found or v_sitting.status='completed' then raise exception 'Diagnostic sitting is not active'; end if;
  v_minimum:=case when p_strand='space' and v_sitting.space_ground_bank_version=3 then 0 when p_strand='measurement' and v_sitting.measurement_ground_bank_version=4 then 0 when p_strand='number' and v_sitting.number_ground_bank_version=3 then 0 when p_strand in ('algebra','probability') then 3 else 1 end;
  if jsonb_typeof(p_probe_scores)<>'array' or jsonb_array_length(p_probe_scores)<1 or jsonb_array_length(p_probe_scores)>(case when p_strand='probability' and v_sitting.chance_release_version=1 then 8 when p_strand='algebra' and v_sitting.pattern_release_version=1 then 8 when p_strand='statistics' and v_sitting.statistics_release_version=1 then 8 when p_strand='space' and v_sitting.space_release_version=1 then 9 when p_strand='space' and v_sitting.space_ground_bank_version=3 then 7 when p_strand='number' and v_sitting.number_ground_bank_version=3 then v_sitting.number_maximum_level+1 when p_strand='measurement' and v_sitting.measurement_release_version=1 then 9 when p_strand='measurement' and v_sitting.measurement_ground_bank_version=4 then 7 else 6 end) then
    raise exception 'Invalid diagnostic probes';
  end if;
  -- Validate every direction before delegating. No client can submit a shortened,
  -- duplicated or synthetic-count probe to the older upward completion routine.
  for v_probe in select value from jsonb_array_elements(p_probe_scores) probe(value) loop
    v_level:=public.number_diagnostic_level_value(coalesce(v_probe->>'level',''));
    v_score:=nullif(v_probe->>'score','')::integer;
    v_total:=nullif(v_probe->>'total','')::integer;
    if v_level is null or v_level<v_minimum or v_level>(case when p_strand='number' then v_sitting.number_maximum_level when p_strand='probability' and v_sitting.chance_release_version=1 then 8 when p_strand='algebra' and v_sitting.pattern_release_version=1 then 8 when p_strand='statistics' and v_sitting.statistics_release_version=1 then 8 when p_strand='space' and v_sitting.space_release_version=1 then 8 when p_strand='measurement' and v_sitting.measurement_release_version=1 then 8 else 6 end) or v_total<>(case when p_strand in ('number','measurement','space','statistics','algebra','probability') and v_level in (7,8) then 30 else 20 end) or v_score<0 or v_score>v_total
      or jsonb_typeof(coalesce(v_probe->'questionIds','[]'::jsonb))<>'array'
      or jsonb_array_length(coalesce(v_probe->'questionIds','[]'::jsonb))<>v_total
      or (select count(distinct question_id)
          from jsonb_array_elements_text(v_probe->'questionIds') question(question_id))<>v_total then
      raise exception 'Every diagnostic level requires its full set of distinct recorded questions';
    end if;
  end loop;
  if (
      jsonb_array_length(p_probe_scores)=1
      and (
        round(((p_probe_scores->0->>'score')::numeric*100)/(p_probe_scores->0->>'total')::numeric,2)>25
        or public.number_diagnostic_level_value(p_probe_scores->0->>'level')=v_minimum
      )
    ) or (
      jsonb_array_length(p_probe_scores)>1
      and public.number_diagnostic_level_value(p_probe_scores->1->>'level')
        > public.number_diagnostic_level_value(p_probe_scores->0->>'level')
    ) then
    return public.complete_whole_math_diagnostic_strand_upward_v1(p_student_id,p_sitting_id,p_strand,p_probe_scores);
  end if;
  for v_probe in select value from jsonb_array_elements(p_probe_scores) probe(value) loop
    v_index:=v_index+1; v_level:=public.number_diagnostic_level_value(coalesce(v_probe->>'level',''));
    v_score:=nullif(v_probe->>'score','')::integer; v_total:=nullif(v_probe->>'total','')::integer;
    v_percent:=round(v_score::numeric*100/v_total,2);
    if v_index=1 then
      if v_level<>public.number_diagnostic_level_value(v_result.starting_level) then raise exception 'Probe must begin at the assigned level'; end if;
    elsif v_level<>v_previous_level-1 then raise exception 'Invalid downward diagnostic sequence'; end if;
    if v_index>1 and v_terminal_percent>25 then raise exception 'A lower probe requires 25 percent or less on the preceding level'; end if;
    v_previous_level:=v_level; v_terminal_level:=v_level; v_terminal_percent:=v_percent;
  end loop;

  if v_terminal_percent<=25 and v_terminal_level>v_minimum then raise exception 'A result of 25 percent or less must probe the next lower level'; end if;

  v_measured:=greatest(0,least((case when p_strand='number' then v_sitting.number_maximum_level when p_strand='probability' and v_sitting.chance_release_version=1 then 8 when p_strand='algebra' and v_sitting.pattern_release_version=1 then 8 when p_strand='statistics' and v_sitting.statistics_release_version=1 then 8 when p_strand='space' and v_sitting.space_release_version=1 then 8 when p_strand='measurement' and v_sitting.measurement_release_version=1 then 8 else 6 end),case when v_terminal_percent>=85 then v_terminal_level
    when v_terminal_percent>=40 then v_terminal_level-1+((v_terminal_percent-40)/45)
    else v_terminal_level-1-least(0.9,(40-v_terminal_percent)/40) end));
  v_recommended:=case when v_result.placement_protected then v_result.starting_level else public.number_diagnostic_level_label(least(8,v_terminal_level)) end;
  v_placement:=not v_result.placement_protected and v_sitting.checkpoint in ('start','mid','end');
  update public.whole_math_diagnostic_strand_results set
    status='completed',measured_level=v_measured,recommended_level=v_recommended,
    placement_applied=v_placement,flag='review_support',probe_scores=p_probe_scores,probe_direction='down',
    curriculum_codes=(select coalesce(jsonb_agg(distinct code),'[]'::jsonb)
      from jsonb_array_elements(p_probe_scores) probe,
      jsonb_array_elements_text(coalesce(probe->'curriculumCodes','[]'::jsonb)) code),
    active_level=null,draft_answers='{}'::jsonb,draft_probe_scores='[]'::jsonb,
    draft_question_index=0,completed_at=now(),updated_at=now()
  where id=v_result.id;
  if v_placement then
    select student.class_id,coalesce(student.school_year_level,student.year_level)
    into v_class_id,v_school_year from public.students student where student.id=p_student_id;
    select jsonb_agg(week order by week) into v_full_weeks
    from generate_series(1, public.realm_program_week_count(v_result.realm_id, v_recommended)) week;
    update public.student_realm_progress set is_current=false
    where student_id=p_student_id and realm_id=v_result.realm_id and is_current;
    insert into public.student_realm_progress(
      student_id,class_id,realm_id,program_key,school_year_level,working_level,is_current,status,
      current_week,assigned_week,placement_complete,required_weeks,optional_weeks
    ) values (
      p_student_id,v_class_id,v_result.realm_id,public.realm_program_key(v_recommended,v_result.realm_id),
      v_school_year,v_recommended,true,'ASSIGNED_PROGRAM',1,1,true,v_full_weeks,'[]'::jsonb
    ) on conflict (student_id,realm_id,working_level) do update set
      class_id=excluded.class_id,program_key=excluded.program_key,school_year_level=excluded.school_year_level,
      is_current=true,status=excluded.status,current_week=coalesce(public.student_realm_progress.current_week,1),
      assigned_week=coalesce(public.student_realm_progress.assigned_week,1),placement_complete=true,
      required_weeks=case when public.student_realm_progress.required_weeks='[]'::jsonb then excluded.required_weeks else public.student_realm_progress.required_weeks end,
      updated_at=now();
    insert into public.student_realm_placement(
      student_id,realm_id,assigned_start_level,assigned_entry_mode,placement_source,
      placement_assigned_by,placement_assigned_at,updated_at
    ) values (
      p_student_id,v_result.realm_id,v_recommended,'full_level','diagnostic',v_sitting.initiated_by,now(),now()
    ) on conflict (student_id,realm_id) do update set
      assigned_start_level=excluded.assigned_start_level,assigned_entry_mode=excluded.assigned_entry_mode,
      placement_source=excluded.placement_source,placement_assigned_by=excluded.placement_assigned_by,
      placement_assigned_at=excluded.placement_assigned_at,updated_at=now();
  end if;
  update public.whole_math_diagnostic_sittings set status='in_progress',started_at=coalesce(started_at,now()) where id=p_sitting_id;
  select count(*) into v_pending from public.whole_math_diagnostic_strand_results where sitting_id=p_sitting_id and status='pending';
  if v_pending=0 then
    v_overall:=public.whole_math_level_for_sitting(p_sitting_id);
    update public.whole_math_diagnostic_sittings set status='completed',completed_at=now(),overall_level=v_overall where id=p_sitting_id;
  end if;
  return jsonb_build_object('sitting_complete',v_pending=0,'measured_level',v_measured,
    'recommended_level',v_recommended,'placement_applied',v_placement,'flag','review_support','overall_level',v_overall);
end;
$function$;

-- From 20260915100000_ground_number_measurement_baselines.sql.
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
    -- Every week of this level's programme (Levels 7 and 8 are longer than the Ground–6 lengths).
    select coalesce(jsonb_agg(week order by week), '[]'::jsonb) into full_program_weeks
    from generate_series(1, public.realm_program_week_count(p_realm_id, p_working_level)) week;
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
$$;

commit;
