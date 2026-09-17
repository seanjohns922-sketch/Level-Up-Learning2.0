begin;

-- Parent dashboard: activity view and printable progress report.
--
-- Both functions are read-only and parent-scoped. Parents already satisfy
-- public.can_access_student_read through an active parent_student_links row,
-- so these keep the PA4 boundary (read relationships only) and add no write
-- path, no progression change and no reward change.
--
-- Everything is keyed on student_id alone, never class_id: home learners
-- created by a parent have no class, so class-scoped live telemetry
-- (live_student_activity) stays a school-only surface and would be empty for
-- exactly this audience. student_activity_daily.class_id is nullable and the
-- client writes null for home learners, so daily activity covers both.

create or replace function public.get_parent_child_activity(
  p_student_id uuid,
  p_days integer default 28
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_days integer := least(greatest(coalesce(p_days, 28), 1), 120);
  v_result jsonb;
begin
  perform public.assert_parent_role();

  if not exists (
    select 1
    from public.parent_student_links link
    where link.parent_user_id = auth.uid()
      and link.student_id = p_student_id
      and link.status = 'active'
  ) then
    raise exception 'Child access denied' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'days', coalesce((
      select jsonb_agg(jsonb_build_object(
        'date', to_char(activity.activity_date, 'YYYY-MM-DD'),
        'minutes', activity.minutes_active,
        'secondsActive', activity.seconds_active,
        'questions', activity.questions_answered,
        'correct', activity.correct_answers,
        'lessons', activity.lessons_completed,
        'quizzes', activity.quizzes_completed,
        'xp', activity.xp_earned
      ) order by activity.activity_date)
      from public.student_activity_daily activity
      where activity.student_id = p_student_id
        and activity.activity_date > (current_date - v_days)
    ), '[]'::jsonb),
    'feed', coalesce((
      select jsonb_agg(recent.item order by recent.sort_at desc)
      from (
        select item, sort_at
        from (
          select
            jsonb_build_object(
              'kind', 'lesson',
              'realmId', lesson.realm_id,
              'workingLevel', lesson.working_level,
              'label', coalesce(nullif(lesson.topic_focus, ''), 'Lesson ' || lesson.lesson),
              'week', lesson.week,
              'lesson', lesson.lesson,
              'correct', lesson.correct_count,
              'attempted', lesson.total_questions,
              'accuracy', lesson.accuracy_percent,
              'completedAt', lesson.completed_at
            ) item,
            lesson.completed_at sort_at
          from public.student_lesson_attempts lesson
          where lesson.student_id = p_student_id
            and lesson.completed
            and lesson.completed_at > (now() - make_interval(days => v_days))

          union all

          select
            jsonb_build_object(
              'kind', 'quiz',
              'realmId', quiz.realm_id,
              'workingLevel', quiz.working_level,
              'label', 'Week ' || quiz.week || ' Quiz',
              'week', quiz.week,
              'lesson', null,
              'correct', quiz.correct_count,
              'attempted', quiz.total_questions,
              'accuracy', quiz.accuracy_percent,
              'completedAt', quiz.completed_at
            ) item,
            quiz.completed_at sort_at
          from public.student_weekly_quiz_attempts quiz
          where quiz.student_id = p_student_id
            and quiz.completed_at > (now() - make_interval(days => v_days))

          union all

          select
            jsonb_build_object(
              'kind', 'assessment',
              'realmId', assessment.realm_id,
              'workingLevel', assessment.working_level,
              'label', case
                when assessment.assessment_type = 'posttest' then 'Post-Test'
                when assessment.assessment_type = 'pretest' then 'Pre-Test'
                else initcap(replace(assessment.assessment_type, '_', ' '))
              end,
              'week', null,
              'lesson', null,
              'correct', assessment.correct_count,
              'attempted', assessment.total_questions,
              'accuracy', assessment.score_percent,
              'completedAt', assessment.completed_at
            ) item,
            assessment.completed_at sort_at
          from public.student_realm_assessments assessment
          where assessment.student_id = p_student_id
            and assessment.completed_at > (now() - make_interval(days => v_days))
        ) all_activity
        order by sort_at desc
        limit 15
      ) recent
    ), '[]'::jsonb)
  ) into v_result;

  return coalesce(v_result, jsonb_build_object('days', '[]'::jsonb, 'feed', '[]'::jsonb));
end;
$$;

-- Printable progress report. Mirrors the shape the school Learning Journey
-- uses (get_student_learning_journey) so the parent document can show the same
-- Ground -> Level 6 ladder per realm, with pre/post evidence for growth.
create or replace function public.get_parent_child_progress_report(p_student_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  perform public.assert_parent_role();

  if not exists (
    select 1
    from public.parent_student_links link
    where link.parent_user_id = auth.uid()
      and link.student_id = p_student_id
      and link.status = 'active'
  ) then
    raise exception 'Child access denied' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'student', jsonb_build_object(
      'id', student.id,
      'name', coalesce(nullif(student.display_name, ''), student.username, 'Student'),
      'yearLevel', coalesce(student.school_year_level, student.year_level),
      'schoolName', school.name
    ),
    'levels', coalesce((
      select jsonb_agg(jsonb_build_object(
        'realmId', progress.realm_id,
        'workingLevel', progress.working_level,
        'isCurrent', progress.is_current,
        'currentWeek', progress.current_week,
        'status', progress.status,
        'pretestScore', progress.pretest_score,
        'posttestScore', progress.posttest_score,
        'posttestCompletedAt', progress.posttest_completed_at
      ) order by progress.realm_id,
        case progress.working_level
          when 'Prep' then 0 when 'Year 1' then 1 when 'Year 2' then 2
          when 'Year 3' then 3 when 'Year 4' then 4 when 'Year 5' then 5
          when 'Year 6' then 6 else 99 end)
      from public.student_realm_progress progress
      where progress.student_id = student.id
    ), '[]'::jsonb),
    'lessonsCompleted', (
      select count(*)
      from (
        select distinct attempt.realm_id, attempt.working_level, attempt.week, attempt.lesson
        from public.student_lesson_attempts attempt
        where attempt.student_id = student.id and attempt.completed
      ) completed_lessons
    ),
    'gemsEarned', (
      select count(*)
      from public.student_gems gem
      join public.gem_definitions definition on definition.id = gem.gem_id
      where gem.student_id = student.id and definition.is_active
    ),
    'learningDays', (
      select count(*)
      from public.student_activity_daily activity
      where activity.student_id = student.id
        and (activity.questions_answered > 0 or activity.lessons_completed > 0 or activity.quizzes_completed > 0)
    ),
    'minutesLearning', coalesce((
      select sum(activity.minutes_active)
      from public.student_activity_daily activity
      where activity.student_id = student.id
    ), 0),
    'passThreshold', 85
  ) into v_result
  from public.students student
  left join public.schools school on school.id = student.school_id
  where student.id = p_student_id
    and coalesce(student.identity_status, 'active') = 'active';

  return v_result;
end;
$$;

revoke all on function public.get_parent_child_activity(uuid, integer) from public, anon;
grant execute on function public.get_parent_child_activity(uuid, integer) to authenticated;

revoke all on function public.get_parent_child_progress_report(uuid) from public, anon;
grant execute on function public.get_parent_child_progress_report(uuid) to authenticated;

commit;
