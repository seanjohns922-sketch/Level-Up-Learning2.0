-- Teacher Insights: retain leadership's school-wide aggregate analytics while
-- limiting named student evidence to students the caller may already view.
-- Regenerated from 20260826150000_school_analytics_assessment_bands.sql.

create or replace function public.get_school_analytics_snapshot(
  p_school_id uuid,
  p_academic_year_id uuid,
  p_days integer default 30,
  p_year_level text default null,
  p_class_id uuid default null,
  p_realm_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_days integer := greatest(7, least(coalesce(p_days, 30), 90));
  v_since timestamptz;
  v_result jsonb;
  v_can_view_administration boolean;
begin
  v_can_view_administration := public.can_view_school_administration(p_school_id);

  if not (
    v_can_view_administration
    or public.has_school_role(p_school_id, array['teacher'])
  ) then
    raise exception 'School analytics access denied' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.academic_years ay
    where ay.id = p_academic_year_id
      and ay.school_id = p_school_id
  ) then
    raise exception 'Academic year does not belong to this school' using errcode = '22023';
  end if;

  v_since := now() - make_interval(days => v_days);

  with
  cohort as (
    select distinct on (s.id)
      s.id as student_id,
      coalesce(nullif(s.display_name, ''), nullif(concat_ws(' ', s.first_name, s.last_name), ''), s.username, 'Student') as student_name,
      coalesce(s.school_year_level, s.year_level) as year_level,
      ce.class_id,
      c.name as class_name
    from public.student_access_entitlements sae
    join public.students s on s.id = sae.student_id and s.archived_at is null
    left join lateral (
      select enrolment.class_id
      from public.class_enrollments enrolment
      where enrolment.student_id = s.id
        and enrolment.school_id = p_school_id
        and enrolment.academic_year_id = p_academic_year_id
        and enrolment.status = 'active'
        and enrolment.ended_at is null
      order by enrolment.is_primary desc, enrolment.enrolled_at desc
      limit 1
    ) ce on true
    left join public.classes c on c.id = ce.class_id
    where sae.access_source = 'school'
      and sae.school_id = p_school_id
      and sae.academic_year_id = p_academic_year_id
      and sae.status = 'active'
      and sae.starts_at <= now()
      and (sae.ends_at is null or sae.ends_at >= now())
      and (p_year_level is null or coalesce(s.school_year_level, s.year_level) = p_year_level)
      and (p_class_id is null or ce.class_id = p_class_id)
    order by s.id
  ),
  canonical_lessons as (
    select distinct on (a.student_id, a.realm_id, a.working_level, a.week, a.lesson)
      a.student_id, a.realm_id, a.working_level, a.week, a.lesson,
      a.topic_focus, a.accuracy_percent::numeric as accuracy_percent,
      a.completed_at as activity_at
    from public.student_lesson_attempts a
    join cohort co on co.student_id = a.student_id
    where a.completed
      and a.completed_at >= v_since
      and (p_realm_id is null or a.realm_id = p_realm_id)
    order by a.student_id, a.realm_id, a.working_level, a.week, a.lesson,
      a.completed_at desc, a.attempt_no desc
  ),
  canonical_quizzes as (
    select distinct on (a.student_id, a.realm_id, a.working_level, a.week)
      a.student_id, a.realm_id, a.working_level, a.week,
      a.accuracy_percent::numeric as accuracy_percent,
      a.completed_at as activity_at
    from public.student_weekly_quiz_attempts a
    join cohort co on co.student_id = a.student_id
    where a.completed_at >= v_since
      and (p_realm_id is null or a.realm_id = p_realm_id)
    order by a.student_id, a.realm_id, a.working_level, a.week,
      a.completed_at desc, a.attempt_no desc
  ),
  latest_assessments as (
    select distinct on (a.student_id, a.realm_id, a.working_level, lower(a.assessment_type))
      a.student_id, a.realm_id, a.working_level,
      lower(a.assessment_type) as assessment_type,
      a.score_percent::numeric as score_percent,
      a.completed_at
    from public.student_realm_assessments a
    join cohort co on co.student_id = a.student_id
    where (p_realm_id is null or a.realm_id = p_realm_id)
    order by a.student_id, a.realm_id, a.working_level, lower(a.assessment_type), a.completed_at desc
  ),
  realm_latest_assessment as (
    -- Most recent assessment per student x realm: the placement pre-test, then
    -- each level's post-test. This is the "where they are" signal for achievement
    -- bands (lesson practice accuracy is NOT used for banding).
    select distinct on (student_id, realm_id)
      student_id, realm_id, working_level, assessment_type, score_percent, completed_at
    from latest_assessments
    order by student_id, realm_id, completed_at desc
  ),
  paired_growth as (
    select pre.student_id, pre.realm_id, pre.working_level,
      pre.score_percent as pre_score, post.score_percent as post_score,
      post.score_percent - pre.score_percent as growth,
      post.completed_at
    from latest_assessments pre
    join latest_assessments post
      on post.student_id = pre.student_id
      and post.realm_id = pre.realm_id
      and post.working_level = pre.working_level
    where pre.assessment_type in ('pre', 'pretest', 'pre-test')
      and post.assessment_type in ('post', 'posttest', 'post-test')
      and post.completed_at >= v_since
  ),
  activity as (
    select student_id, realm_id, working_level, accuracy_percent, activity_at, 'lesson'::text as kind
    from canonical_lessons
    union all
    select student_id, realm_id, working_level, accuracy_percent, activity_at, 'quiz'::text
    from canonical_quizzes
    union all
    select student_id, realm_id, working_level, score_percent, completed_at, 'assessment'::text
    from latest_assessments
    where completed_at >= v_since
  ),
  recent_7d as (
    select * from activity where activity_at >= now() - interval '7 days'
  ),
  recent_14d as (
    select * from activity where activity_at >= now() - interval '14 days'
  ),
  lesson_7d as (
    select student_id, count(*) as lesson_count
    from canonical_lessons
    where activity_at >= now() - interval '7 days'
    group by student_id
  ),
  latest_evidence as (
    select distinct on (student_id) student_id, accuracy_percent, activity_at
    from recent_14d
    order by student_id, activity_at desc
  ),
  realm_summary as (
    select
      r.realm_id,
      count(distinct r.student_id) as active_students,
      round(avg(r.accuracy_percent), 1) as average_accuracy,
      count(*) filter (where r.kind = 'lesson') as lessons,
      count(*) filter (where r.kind = 'quiz') as quizzes
    from activity r
    group by r.realm_id
  ),
  student_activity_summary as (
    select
      a.student_id,
      max(a.activity_at) as last_active,
      round(avg(a.accuracy_percent), 1) as average_accuracy,
      count(distinct a.realm_id) as realms_used,
      count(distinct a.activity_at::date) as learning_days,
      bool_or(a.activity_at >= now() - interval '7 days') as active_this_week
    from activity a
    group by a.student_id
  ),
  student_growth_summary as (
    select
      pg.student_id,
      round(avg(pg.growth), 1) as average_growth
    from paired_growth pg
    group by pg.student_id
  ),
  current_progress as (
    select distinct on (srp.student_id, srp.realm_id)
      srp.student_id,
      srp.realm_id,
      srp.working_level,
      srp.current_week,
      srp.status,
      srp.pretest_score::numeric as pretest_score,
      srp.posttest_score::numeric as posttest_score
    from public.student_realm_progress srp
    join cohort co on co.student_id = srp.student_id
    where srp.is_current
      and (p_realm_id is null or srp.realm_id = p_realm_id)
    order by srp.student_id, srp.realm_id, srp.updated_at desc
  ),
  mastered_realms as (
    select la.student_id, la.realm_id, la.working_level, la.score_percent
    from latest_assessments la
    where la.assessment_type in ('post', 'posttest', 'post-test')
      and la.score_percent >= 85
  ),
  student_mastery_summary as (
    select student_id, count(*) as mastered_levels
    from mastered_realms
    group by student_id
  ),
  student_realm_keys as (
    select distinct student_id, realm_id from activity
    union
    select distinct student_id, realm_id from current_progress
  ),
  student_realm_activity as (
    select
      student_id,
      realm_id,
      round(avg(accuracy_percent), 1) as average_accuracy,
      count(*) as activities,
      max(working_level) as evidence_level
    from activity
    group by student_id, realm_id
  ),
  student_realm_summary as (
    select
      keys.student_id,
      jsonb_agg(jsonb_build_object(
        'realmId', keys.realm_id,
        'averageAccuracy', sra.average_accuracy,
        'activities', coalesce(sra.activities, 0),
        'currentLevel', coalesce(cp.working_level, sra.evidence_level),
        'currentWeek', cp.current_week,
        'pathwayStatus', cp.status,
        'pretestScore', cp.pretest_score,
        'posttestScore', cp.posttest_score,
        'assessmentScore', rla.score_percent,
        'assessmentLevel', rla.working_level,
        'assessmentType', rla.assessment_type,
        'mastered', exists (
          select 1 from mastered_realms mr
          where mr.student_id = keys.student_id and mr.realm_id = keys.realm_id
        ),
        'growth', (
          select round(avg(pg.growth), 1)
          from paired_growth pg
          where pg.student_id = keys.student_id and pg.realm_id = keys.realm_id
        )
      ) order by keys.realm_id) as realms
    from student_realm_keys keys
    left join student_realm_activity sra
      on sra.student_id = keys.student_id and sra.realm_id = keys.realm_id
    left join current_progress cp
      on cp.student_id = keys.student_id and cp.realm_id = keys.realm_id
    left join realm_latest_assessment rla
      on rla.student_id = keys.student_id and rla.realm_id = keys.realm_id
    group by keys.student_id
  ),
  class_summary as (
    select
      co.class_id,
      co.class_name,
      count(*) as students,
      count(*) filter (where sas.active_this_week) as active_students,
      count(*) filter (where coalesce(l7.lesson_count, 0) >= 3) as weekly_target_met,
      coalesce(sum(sms.mastered_levels), 0) as mastered_levels,
      round(avg(sas.average_accuracy), 1) as average_accuracy,
      round(avg(sgs.average_growth), 1) as average_growth
    from cohort co
    left join student_activity_summary sas on sas.student_id = co.student_id
    left join student_growth_summary sgs on sgs.student_id = co.student_id
    left join lesson_7d l7 on l7.student_id = co.student_id
    left join student_mastery_summary sms on sms.student_id = co.student_id
    group by co.class_id, co.class_name
  ),
  student_summary as (
    select
      co.student_id, co.student_name, co.year_level, co.class_id, co.class_name,
      sas.last_active,
      sas.average_accuracy,
      coalesce(sas.realms_used, 0) as realms_used,
      coalesce(sas.learning_days, 0) as learning_days,
      coalesce(sas.active_this_week, false) as active_this_week,
      coalesce(l7.lesson_count, 0) >= 3 as weekly_target_met,
      coalesce(sms.mastered_levels, 0) as mastered_levels,
      case
        when coalesce(sas.active_this_week, false) and coalesce(le.accuracy_percent, 0) >= 80 then 'on_track'
        when coalesce(sas.active_this_week, false) then 'active'
        else 'needs_attention'
      end as status,
      sgs.average_growth,
      coalesce(srs.realms, '[]'::jsonb) as realms
    from cohort co
    left join student_activity_summary sas on sas.student_id = co.student_id
    left join student_growth_summary sgs on sgs.student_id = co.student_id
    left join student_realm_summary srs on srs.student_id = co.student_id
    left join lesson_7d l7 on l7.student_id = co.student_id
    left join student_mastery_summary sms on sms.student_id = co.student_id
    left join latest_evidence le on le.student_id = co.student_id
  )
  select jsonb_build_object(
    'generatedAt', now(),
    'windowDays', v_days,
    'filters', jsonb_build_object(
      'yearLevel', p_year_level,
      'classId', p_class_id,
      'realmId', p_realm_id
    ),
    'overview', jsonb_build_object(
      'students', (select count(*) from cohort),
      'activeThisWeek', (select count(distinct student_id) from recent_7d),
      'weeklyTargetMet', (select count(*) from lesson_7d where lesson_count >= 3),
      'onTrack', (select count(*) from latest_evidence where accuracy_percent >= 80),
      'levelsMastered', (select count(*) from latest_assessments where score_percent >= 85 and assessment_type in ('post','posttest','post-test')),
      'averageGrowth', (select round(avg(growth), 1) from paired_growth),
      'matchedGrowthPairs', (select count(*) from paired_growth)
    ),
    'realms', coalesce((select jsonb_agg(jsonb_build_object(
      'realmId', realm_id,
      'activeStudents', active_students,
      'averageAccuracy', average_accuracy,
      'lessons', lessons,
      'quizzes', quizzes,
      'averageGrowth', (select round(avg(pg.growth), 1) from paired_growth pg where pg.realm_id = rs.realm_id)
    ) order by realm_id) from realm_summary rs), '[]'::jsonb),
    'growthTrend', coalesce((select jsonb_agg(jsonb_build_object(
      'date', day::date,
      'averageGrowth', average_growth,
      'matchedPairs', matched_pairs
    ) order by day) from (
      select date_trunc('day', completed_at) as day, round(avg(growth), 1) as average_growth, count(*) as matched_pairs
      from paired_growth group by date_trunc('day', completed_at)
    ) trend), '[]'::jsonb),
    'engagementTrend', coalesce((select jsonb_agg(jsonb_build_object(
      'date', day::date,
      'activeStudents', active_students,
      'activities', activities
    ) order by day) from (
      select activity_at::date as day, count(distinct student_id) as active_students, count(*) as activities
      from activity group by activity_at::date
    ) trend), '[]'::jsonb),
    'engagement', jsonb_build_object(
      'activeLearners', (select count(distinct student_id) from activity),
      'averageLearningDays', (select round(avg(days), 1) from (select count(distinct activity_at::date) days from activity group by student_id) d),
      'returningLearners', (select count(*) from (select student_id from activity group by student_id having count(distinct activity_at::date) >= 2) r),
      'lessonsCompleted', (select count(*) from canonical_lessons),
      'quizzesCompleted', (select count(*) from canonical_quizzes)
    ),
    'curriculum', coalesce((select jsonb_agg(jsonb_build_object(
      'topic', topic,
      'yearLevel', year_level,
      'realmId', realm_id,
      'students', students,
      'evidenceCount', evidence_count,
      'averageAccuracy', average_accuracy
    ) order by realm_id, year_level) from (
      select
        case la.working_level when 'Prep' then 'Ground post-test'
          else 'Level ' || replace(la.working_level, 'Year ', '') || ' post-test' end as topic,
        la.working_level as year_level, la.realm_id as realm_id,
        count(distinct la.student_id) as students, count(*) as evidence_count,
        round(avg(la.score_percent), 1) as average_accuracy
      from latest_assessments la
      where la.assessment_type in ('post', 'posttest', 'post-test')
      group by la.working_level, la.realm_id
    ) topics), '[]'::jsonb),
    'classes', coalesce((select jsonb_agg(jsonb_build_object(
      'id', class_id, 'name', coalesce(class_name, 'Not assigned'), 'students', students,
      'activeStudents', active_students, 'weeklyTargetMet', weekly_target_met,
      'masteredLevels', mastered_levels, 'averageAccuracy', average_accuracy, 'averageGrowth', average_growth
    ) order by class_name nulls last) from class_summary), '[]'::jsonb),
    -- Anonymous working-level evidence powers whole-school placement and
    -- intervention visuals without disclosing another class's students.
    'analysisStudents', coalesce((select jsonb_agg(jsonb_build_object(
      'yearLevel', summary.year_level,
      'realms', coalesce((
        select jsonb_agg(jsonb_build_object(
          'realmId', realm->>'realmId',
          'currentLevel', realm->>'currentLevel',
          'pretestScore', realm->'pretestScore'
        ))
        from jsonb_array_elements(summary.realms) realm
      ), '[]'::jsonb)
    )) from student_summary summary), '[]'::jsonb),
    'students', coalesce((select jsonb_agg(jsonb_build_object(
      'id', student_id, 'name', student_name, 'yearLevel', year_level,
      'classId', class_id, 'className', coalesce(class_name, 'Not assigned'),
      'lastActive', last_active, 'averageAccuracy', average_accuracy,
      'realmsUsed', realms_used, 'learningDays', learning_days,
      'activeThisWeek', active_this_week, 'weeklyTargetMet', weekly_target_met,
      'masteredLevels', mastered_levels, 'status', status,
      'averageGrowth', average_growth, 'realms', realms
    ) order by student_name)
      from student_summary
      where v_can_view_administration
        or public.can_view_student(student_id)
    ), '[]'::jsonb),
    'methodology', jsonb_build_object(
      'weeklyTarget', 'At least 3 unique completed lessons in the last 7 days.',
      'onTrack', 'Canonical activity in the last 14 days with latest lesson, quiz or assessment evidence at 80% or higher.',
      'mastery', 'Latest post-test score of 85% or higher.',
      'growth', 'Post-test score minus pre-test score for the same student, realm and working level.',
      'lessonDeduplication', '(student, realm, level, week, lesson)',
      'quizDeduplication', '(student, realm, level, week)'
    )
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_school_analytics_snapshot(uuid, uuid, integer, text, uuid, text) from public, anon;
grant execute on function public.get_school_analytics_snapshot(uuid, uuid, integer, text, uuid, text) to authenticated;

-- A teacher may open an individual journey only when the existing student
-- permission function confirms an active class or direct staff assignment.
create or replace function public.get_student_learning_journey(
  p_school_id uuid,
  p_student_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not (
    public.can_view_school_administration(p_school_id)
    or public.can_view_student(p_student_id)
  ) then
    raise exception 'School analytics access denied' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.student_access_entitlements sae
    where sae.student_id = p_student_id
      and sae.school_id = p_school_id
      and sae.access_source = 'school'
      and sae.status = 'active'
  ) then
    raise exception 'Student is not entitled at this school' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'student', (
      select jsonb_build_object(
        'id', s.id,
        'name', coalesce(nullif(s.display_name, ''), nullif(concat_ws(' ', s.first_name, s.last_name), ''), s.username, 'Student'),
        'yearLevel', coalesce(s.school_year_level, s.year_level),
        'className', coalesce((
          select c.name
          from public.class_enrollments ce
          join public.classes c on c.id = ce.class_id
          where ce.student_id = s.id
            and ce.school_id = p_school_id
            and ce.status = 'active'
            and ce.ended_at is null
          order by ce.is_primary desc, ce.enrolled_at desc
          limit 1
        ), 'Not assigned')
      )
      from public.students s
      where s.id = p_student_id
    ),
    'levels', coalesce((
      select jsonb_agg(jsonb_build_object(
        'realmId', srp.realm_id,
        'workingLevel', srp.working_level,
        'isCurrent', srp.is_current,
        'currentWeek', srp.current_week,
        'status', srp.status,
        'pretestScore', srp.pretest_score,
        'posttestScore', srp.posttest_score,
        'posttestCompletedAt', srp.posttest_completed_at
      ) order by srp.realm_id,
        case srp.working_level
          when 'Prep' then 0 when 'Year 1' then 1 when 'Year 2' then 2
          when 'Year 3' then 3 when 'Year 4' then 4 when 'Year 5' then 5
          when 'Year 6' then 6 else 99 end)
      from public.student_realm_progress srp
      where srp.student_id = p_student_id
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_student_learning_journey(uuid, uuid) from public, anon;
grant execute on function public.get_student_learning_journey(uuid, uuid) to authenticated;
