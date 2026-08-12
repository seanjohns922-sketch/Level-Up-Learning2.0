begin;

-- Preserve the PA2 school-detail implementation and replace only its activity
-- rollup. Active students are students with meaningful completed learning work.
do $$
begin
  if to_regprocedure('public.get_platform_admin_school_detail_activity_base(uuid)') is null then
    if to_regprocedure('public.get_platform_admin_school_detail(uuid)') is null then
      raise exception 'Platform Admin school detail function is missing';
    end if;

    alter function public.get_platform_admin_school_detail(uuid)
      rename to get_platform_admin_school_detail_activity_base;
  end if;
end;
$$;

revoke all on function public.get_platform_admin_school_detail_activity_base(uuid)
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

  v_result := public.get_platform_admin_school_detail_activity_base(p_school_id);

  with meaningful_activity as (
    select attempt.student_id, attempt.completed_at, 'lesson'::text as event_type
    from public.student_lesson_attempts attempt
    join public.students student on student.id = attempt.student_id
    where student.school_id = p_school_id
      and attempt.completed = true

    union all

    select attempt.student_id, attempt.completed_at, 'quiz'::text
    from public.student_weekly_quiz_attempts attempt
    join public.students student on student.id = attempt.student_id
    where student.school_id = p_school_id

    union all

    select assessment.student_id, assessment.completed_at, 'assessment'::text
    from public.student_realm_assessments assessment
    join public.students student on student.id = assessment.student_id
    where student.school_id = p_school_id
  )
  select jsonb_build_object(
    'activeToday', count(distinct event.student_id) filter (
      where event.completed_at >= v_today_start and event.completed_at < v_tomorrow_start
    ),
    'activeThisWeek', count(distinct event.student_id) filter (
      where event.completed_at >= v_week_start and event.completed_at < v_tomorrow_start
    ),
    'lessonsThisWeek', count(*) filter (
      where event.event_type = 'lesson'
        and event.completed_at >= v_week_start and event.completed_at < v_tomorrow_start
    ),
    'quizzesThisWeek', count(*) filter (
      where event.event_type = 'quiz'
        and event.completed_at >= v_week_start and event.completed_at < v_tomorrow_start
    ),
    'assessmentsThisWeek', count(*) filter (
      where event.event_type = 'assessment'
        and event.completed_at >= v_week_start and event.completed_at < v_tomorrow_start
    ),
    'lastActive', max(event.completed_at)
  )
  into v_activity
  from meaningful_activity event;

  return jsonb_set(v_result, '{activity}', coalesce(v_activity, '{}'::jsonb), true);
end;
$$;

revoke all on function public.get_platform_admin_school_detail(uuid)
  from public, anon;
grant execute on function public.get_platform_admin_school_detail(uuid)
  to authenticated;

commit;
