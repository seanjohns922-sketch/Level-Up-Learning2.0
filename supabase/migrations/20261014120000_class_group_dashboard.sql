-- Teacher home: one class compared with its class group.
--
-- get_class_group_dashboard returns, for the teacher's class and every class
-- it is compared with (its class group, or the whole school when the class is
-- in no group):
--   * students, active in the last 7 days, and at the weekly target
--     (3+ unique lessons in the last 7 days), as in school analytics;
--   * quiz and lesson averages over the last four completed school weeks,
--     as sums of per-student averages plus the number of students with
--     evidence, so class and group figures combine exactly;
--   * lesson + quiz accuracy and lessons completed per realm for the last two
--     completed school weeks ("recent") and the two before ("previous");
--   * accuracy per realm/level/week for the recent fortnight (topics).
-- School weeks are Monday to Friday in Australia/Melbourne; a week counts
-- once its Friday is over. Reads only; access needs can_view_class.
--
-- Rollback: drop function public.get_class_group_dashboard(uuid, uuid, uuid).
begin;

create or replace function public.get_class_group_dashboard(
  p_school_id uuid,
  p_academic_year_id uuid,
  p_class_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_tz constant text := 'Australia/Melbourne';
  v_today date := (now() at time zone 'Australia/Melbourne')::date;
  v_dow integer := extract(isodow from (now() at time zone 'Australia/Melbourne'))::integer;
  v_monday date;
  v_year_start date;
  v_since timestamptz;
  v_group_id uuid;
  v_group_name text;
  v_scope text;
  v_class_ids uuid[];
  v_result jsonb;
begin
  if not public.can_view_class(p_class_id) then
    raise exception 'Class access denied' using errcode = '42501';
  end if;

  select ay.starts_on into v_year_start
  from public.academic_years ay
  join public.classes c on c.academic_year_id = ay.id and c.school_id = ay.school_id
  where ay.id = p_academic_year_id
    and ay.school_id = p_school_id
    and c.id = p_class_id;
  if v_year_start is null then
    raise exception 'Class does not belong to this school year' using errcode = '22023';
  end if;

  select g.id, g.name into v_group_id, v_group_name
  from public.class_group_members m
  join public.class_groups g on g.id = m.group_id
  where m.class_id = p_class_id
    and g.academic_year_id = p_academic_year_id;

  if v_group_id is not null then
    v_scope := 'group';
    v_class_ids := array(
      select m.class_id
      from public.class_group_members m
      join public.classes c on c.id = m.class_id
      where m.group_id = v_group_id and c.status = 'active'
    );
  else
    v_scope := 'school';
    v_class_ids := array(
      select c.id from public.classes c
      where c.school_id = p_school_id
        and c.academic_year_id = p_academic_year_id
        and c.status = 'active'
    );
  end if;

  -- Monday of the latest school week whose Friday is over.
  v_monday := v_today - (v_dow - 1) - case when v_dow >= 6 then 0 else 7 end;
  v_since := greatest(
    least(((v_monday - 21)::timestamp at time zone v_tz), now() - interval '7 days'),
    (v_year_start::timestamp at time zone v_tz)
  );

  with
  cohort as (
    select distinct on (s.id) s.id as student_id, ce.class_id
    from public.student_access_entitlements sae
    join public.students s on s.id = sae.student_id and s.archived_at is null
    join lateral (
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
    where sae.access_source = 'school'
      and sae.school_id = p_school_id
      and sae.academic_year_id = p_academic_year_id
      and sae.status = 'active'
      and sae.starts_at <= now()
      and (sae.ends_at is null or sae.ends_at >= now())
      and ce.class_id = any(v_class_ids)
    order by s.id
  ),
  lessons as (
    select distinct on (a.student_id, a.realm_id, a.working_level, a.week, a.lesson)
      co.class_id, a.student_id, a.realm_id, a.working_level, a.week,
      a.accuracy_percent::numeric as accuracy, a.completed_at,
      (a.completed_at at time zone v_tz)::date as local_day
    from public.student_lesson_attempts a
    join cohort co on co.student_id = a.student_id
    where a.completed and a.completed_at >= v_since
    order by a.student_id, a.realm_id, a.working_level, a.week, a.lesson,
      a.completed_at desc, a.attempt_no desc
  ),
  quizzes as (
    select distinct on (a.student_id, a.realm_id, a.working_level, a.week)
      co.class_id, a.student_id, a.realm_id, a.working_level, a.week,
      a.accuracy_percent::numeric as accuracy, a.completed_at,
      (a.completed_at at time zone v_tz)::date as local_day
    from public.student_weekly_quiz_attempts a
    join cohort co on co.student_id = a.student_id
    where a.completed_at >= v_since
    order by a.student_id, a.realm_id, a.working_level, a.week,
      a.completed_at desc, a.attempt_no desc
  ),
  recent_activity as (
    select student_id from lessons where completed_at >= now() - interval '7 days'
    union
    select student_id from quizzes where completed_at >= now() - interval '7 days'
    union
    select a.student_id
    from public.student_realm_assessments a
    join cohort co on co.student_id = a.student_id
    where a.completed_at >= now() - interval '7 days'
  ),
  lessons_7d as (
    select student_id, count(*) as lesson_count
    from lessons where completed_at >= now() - interval '7 days'
    group by student_id
  ),
  -- Last four completed school weeks, any day (for the averages).
  four_weeks as (
    select 'quiz'::text as kind, class_id, student_id, accuracy from quizzes
    where local_day >= v_monday - 21 and local_day < v_monday + 7 and accuracy is not null
    union all
    select 'lesson', class_id, student_id, accuracy from lessons
    where local_day >= v_monday - 21 and local_day < v_monday + 7 and accuracy is not null
  ),
  student_averages as (
    select kind, class_id, student_id, avg(accuracy) as average
    from four_weeks group by kind, class_id, student_id
  ),
  -- Two completed school weeks (Mon–Fri) and the two before them.
  periodised as (
    select class_id, student_id, realm_id, working_level, week, accuracy, true as is_lesson,
      case when local_day >= v_monday - 7 and local_day < v_monday + 5 then 'recent'
           when local_day >= v_monday - 21 and local_day < v_monday - 7 then 'previous' end as period
    from lessons where extract(isodow from local_day) <= 5
    union all
    select class_id, student_id, realm_id, working_level, week, accuracy, false,
      case when local_day >= v_monday - 7 and local_day < v_monday + 5 then 'recent'
           when local_day >= v_monday - 21 and local_day < v_monday - 7 then 'previous' end
    from quizzes where extract(isodow from local_day) <= 5
  ),
  class_stats as (
    select co.class_id,
      count(*) as students,
      count(*) filter (where ra.student_id is not null) as active_7d,
      count(*) filter (where coalesce(l7.lesson_count, 0) >= 3) as at_target,
      coalesce((select sum(average) from student_averages sa where sa.kind = 'quiz' and sa.class_id = co.class_id), 0) as quiz_average_sum,
      (select count(*) from student_averages sa where sa.kind = 'quiz' and sa.class_id = co.class_id) as quiz_students,
      coalesce((select sum(average) from student_averages sa where sa.kind = 'lesson' and sa.class_id = co.class_id), 0) as lesson_average_sum,
      (select count(*) from student_averages sa where sa.kind = 'lesson' and sa.class_id = co.class_id) as lesson_students
    from cohort co
    left join (select distinct student_id from recent_activity) ra on ra.student_id = co.student_id
    left join lessons_7d l7 on l7.student_id = co.student_id
    group by co.class_id
  )
  select jsonb_build_object(
    'generatedAt', now(),
    'scope', v_scope,
    'group', case when v_group_id is null then null else jsonb_build_object('id', v_group_id, 'name', v_group_name) end,
    'classIds', to_jsonb(v_class_ids),
    'periods', jsonb_build_object(
      'recentStart', v_monday - 7, 'recentEnd', v_monday + 4,
      'previousStart', v_monday - 21, 'previousEnd', v_monday - 10
    ),
    'classes', coalesce((select jsonb_agg(jsonb_build_object(
      'classId', class_id, 'students', students, 'active7d', active_7d, 'atTarget', at_target,
      'quizAverageSum', round(quiz_average_sum, 2), 'quizStudents', quiz_students,
      'lessonAverageSum', round(lesson_average_sum, 2), 'lessonStudents', lesson_students
    )) from class_stats), '[]'::jsonb),
    'realmPeriods', coalesce((select jsonb_agg(row_to_json(r)) from (
      select class_id as "classId", realm_id as "realmId", period,
        round(sum(accuracy) filter (where accuracy is not null), 2) as "accuracySum",
        count(accuracy) as "accuracyCount",
        count(distinct student_id) as students,
        count(*) filter (where is_lesson) as lessons
      from periodised where period is not null
      group by class_id, realm_id, period
    ) r), '[]'::jsonb),
    'weekTopics', coalesce((select jsonb_agg(row_to_json(t)) from (
      select class_id as "classId", realm_id as "realmId", working_level as "workingLevel", week,
        round(sum(accuracy) filter (where accuracy is not null), 2) as "accuracySum",
        count(accuracy) as "accuracyCount",
        count(distinct student_id) as students
      from periodised where period = 'recent'
      group by class_id, realm_id, working_level, week
    ) t), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_class_group_dashboard(uuid, uuid, uuid) from public, anon;
grant execute on function public.get_class_group_dashboard(uuid, uuid, uuid) to authenticated;

commit;
