begin;

-- Keep the full school-detail implementation intact, but replace the activity
-- rollup with semantics that match the admin screen: active students are
-- students who either used a real student session or submitted canonical work.
do $$
begin
  if to_regprocedure('public.get_platform_admin_school_detail_activity_usage_base(uuid)') is null then
    if to_regprocedure('public.get_platform_admin_school_detail(uuid)') is null then
      raise exception 'Platform Admin school detail function is missing';
    end if;

    alter function public.get_platform_admin_school_detail(uuid)
      rename to get_platform_admin_school_detail_activity_usage_base;
  end if;
end;
$$;

revoke all on function public.get_platform_admin_school_detail_activity_usage_base(uuid)
  from public, anon, authenticated;

create or replace function public.get_platform_admin_school_detail(p_school_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
  v_activity jsonb;
  v_today_start timestamptz :=
    date_trunc('day', timezone('Australia/Melbourne', now())) at time zone 'Australia/Melbourne';
  v_tomorrow_start timestamptz :=
    (date_trunc('day', timezone('Australia/Melbourne', now())) + interval '1 day') at time zone 'Australia/Melbourne';
  v_week_start timestamptz :=
    date_trunc('week', timezone('Australia/Melbourne', now())) at time zone 'Australia/Melbourne';
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access required' using errcode = '42501';
  end if;

  v_result := public.get_platform_admin_school_detail_activity_usage_base(p_school_id);

  with activity_events as (
    select session.student_id, greatest(session.created_at, session.last_used_at) as occurred_at, 'session'::text as event_type
    from public.student_access_sessions session
    join public.students student on student.id = session.student_id
    where (
        student.school_id = p_school_id
        or public.student_belonged_to_school_at(
          session.student_id,
          p_school_id,
          greatest(session.created_at, session.last_used_at),
          null
        )
      )

    union all

    select attempt.student_id, attempt.completed_at, 'lesson'::text
    from public.student_lesson_attempts attempt
    where attempt.completed = true
      and public.student_belonged_to_school_at(attempt.student_id, p_school_id, attempt.completed_at, attempt.class_id)

    union all

    select attempt.student_id, attempt.completed_at, 'quiz'::text
    from public.student_weekly_quiz_attempts attempt
    where public.student_belonged_to_school_at(attempt.student_id, p_school_id, attempt.completed_at, attempt.class_id)

    union all

    select assessment.student_id, assessment.completed_at, 'assessment'::text
    from public.student_realm_assessments assessment
    where public.student_belonged_to_school_at(assessment.student_id, p_school_id, assessment.completed_at, assessment.class_id)
  )
  select jsonb_build_object(
    'activeToday', count(distinct event.student_id) filter (
      where event.occurred_at >= v_today_start and event.occurred_at < v_tomorrow_start
    ),
    'activeThisWeek', count(distinct event.student_id) filter (
      where event.occurred_at >= v_week_start and event.occurred_at < v_tomorrow_start
    ),
    'lessonsThisWeek', count(*) filter (
      where event.event_type = 'lesson'
        and event.occurred_at >= v_week_start and event.occurred_at < v_tomorrow_start
    ),
    'quizzesThisWeek', count(*) filter (
      where event.event_type = 'quiz'
        and event.occurred_at >= v_week_start and event.occurred_at < v_tomorrow_start
    ),
    'assessmentsThisWeek', count(*) filter (
      where event.event_type = 'assessment'
        and event.occurred_at >= v_week_start and event.occurred_at < v_tomorrow_start
    ),
    'lastActive', max(event.occurred_at)
  )
  into v_activity
  from activity_events event;

  return jsonb_set(v_result, '{activity}', coalesce(v_activity, '{}'::jsonb), true);
end;
$$;

revoke all on function public.get_platform_admin_school_detail(uuid)
  from public, anon;
grant execute on function public.get_platform_admin_school_detail(uuid)
  to authenticated;

commit;
