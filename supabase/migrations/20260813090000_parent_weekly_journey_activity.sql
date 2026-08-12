begin;

create or replace function public.get_parent_child_realm_snapshot(p_student_id uuid,p_realm_id text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_result jsonb; v_progress public.student_realm_progress%rowtype;
begin
  perform public.assert_parent_role();
  if not exists(select 1 from public.parent_student_links where parent_user_id=auth.uid()
    and student_id=p_student_id and status='active') then raise exception 'Child access denied' using errcode='42501'; end if;
  select * into v_progress from public.student_realm_progress progress
  where progress.student_id=p_student_id and progress.realm_id=p_realm_id and progress.is_current
  order by progress.updated_at desc limit 1;
  select jsonb_build_object(
    'studentId',student.id,'displayName',student.display_name,'realmId',p_realm_id,
    'placementStatus',case when v_progress.id is null then 'Not Placed' else 'Placed' end,
    'current',case when v_progress.id is null then null else jsonb_build_object(
      'workingLevel',v_progress.working_level,'currentWeek',v_progress.current_week,
      'status',v_progress.status,'requiredWeeks',v_progress.required_weeks,
      'optionalWeeks',v_progress.optional_weeks,
      'currentFocus',(select lesson.topic_focus from public.student_lesson_attempts lesson
        where lesson.student_id=student.id and lesson.realm_id=p_realm_id
          and lesson.working_level=v_progress.working_level
          and (v_progress.current_week is null or lesson.week=v_progress.current_week)
        order by lesson.completed_at desc limit 1)) end,
    'weeks',case when v_progress.id is null then '[]'::jsonb else coalesce((
      select jsonb_agg(jsonb_build_object(
        'week',week_number,
        'required',exists(
          select 1
          from jsonb_array_elements_text(v_progress.required_weeks) required_week(value)
          where required_week.value::integer = week_number
        ),
        'focus',(select lesson.topic_focus from public.student_lesson_attempts lesson
          where lesson.student_id=student.id and lesson.realm_id=p_realm_id
            and lesson.working_level=v_progress.working_level and lesson.week=week_number
          order by lesson.completed_at desc limit 1),
        'lessons',coalesce((select jsonb_agg(item order by lesson_number) from (
          select latest.lesson lesson_number, jsonb_build_object(
            'lesson',latest.lesson,'lessonName',coalesce(latest.topic_focus,'Lesson '||latest.lesson),
            'focus',latest.topic_focus,'correct',latest.correct_count,'attempted',latest.total_questions,
            'accuracy',latest.accuracy_percent,'attempts',(select count(*) from public.student_lesson_attempts all_attempts
              where all_attempts.student_id=student.id and all_attempts.realm_id=p_realm_id
                and all_attempts.working_level=v_progress.working_level and all_attempts.week=week_number
                and all_attempts.lesson=latest.lesson),
            'status',case when latest.completed then 'Completed' else 'Developing' end
          ) item from (
            select distinct on (lesson.lesson) lesson.* from public.student_lesson_attempts lesson
            where lesson.student_id=student.id and lesson.realm_id=p_realm_id
              and lesson.working_level=v_progress.working_level and lesson.week=week_number
            order by lesson.lesson, lesson.completed_at desc
          ) latest
        ) lesson_items),'[]'::jsonb),
        'quiz',(select jsonb_build_object(
          'correct',quiz.correct_count,'attempted',quiz.total_questions,'accuracy',quiz.accuracy_percent,
          'attempts',(select count(*) from public.student_weekly_quiz_attempts all_quizzes
            where all_quizzes.student_id=student.id and all_quizzes.realm_id=p_realm_id
              and all_quizzes.working_level=v_progress.working_level and all_quizzes.week=week_number),
          'status',case when quiz.passed then 'Completed' when quiz.accuracy_percent>=60 then 'Developing' else 'Needs More Practice' end)
          from public.student_weekly_quiz_attempts quiz where quiz.student_id=student.id and quiz.realm_id=p_realm_id
            and quiz.working_level=v_progress.working_level and quiz.week=week_number
          order by quiz.completed_at desc limit 1)
      ) order by week_number)
      from (
        select distinct week_number from (
          select value::integer week_number
          from jsonb_array_elements_text(v_progress.required_weeks||v_progress.optional_weeks)
          union all
          select lesson.week
          from public.student_lesson_attempts lesson
          where lesson.student_id=student.id and lesson.realm_id=p_realm_id
            and lesson.working_level=v_progress.working_level
          union all
          select quiz.week
          from public.student_weekly_quiz_attempts quiz
          where quiz.student_id=student.id and quiz.realm_id=p_realm_id
            and quiz.working_level=v_progress.working_level
        ) activity_weeks
      ) weeks
    ),'[]'::jsonb) end,
    'assessments',coalesce((select jsonb_agg(jsonb_build_object(
      'id',assessment.id,'type',assessment.assessment_type,'correct',assessment.correct_count,
      'attempted',assessment.total_questions,'score',assessment.score_percent,
      'status',case when assessment.score_percent>=85 then 'Mastered' when assessment.score_percent>=70 then 'On Track'
        when assessment.score_percent>=50 then 'Developing' else 'Needs More Practice' end,
      'completedAt',assessment.completed_at) order by assessment.completed_at desc)
      from public.student_realm_assessments assessment
      where assessment.student_id=student.id and assessment.realm_id=p_realm_id),'[]'::jsonb),
    'passThreshold',85
  ) into v_result from public.students student
  where student.id=p_student_id and coalesce(student.identity_status,'active')='active';
  return v_result;
end;
$$;

revoke all on function public.get_parent_child_realm_snapshot(uuid,text) from public, anon;
grant execute on function public.get_parent_child_realm_snapshot(uuid,text) to authenticated;

commit;
