begin;

-- Keep session-based usage visible, but expose the students and evidence behind
-- the aggregate so Platform Admin can reconcile it with canonical work totals.
do $$
begin
  if to_regprocedure('public.get_platform_admin_school_detail_active_drilldown_base(uuid)') is null then
    if to_regprocedure('public.get_platform_admin_school_detail(uuid)') is null then
      raise exception 'Platform Admin school detail function is missing';
    end if;

    alter function public.get_platform_admin_school_detail(uuid)
      rename to get_platform_admin_school_detail_active_drilldown_base;
  end if;
end;
$$;

revoke all on function public.get_platform_admin_school_detail_active_drilldown_base(uuid)
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
  v_students jsonb;
  v_submitted_work_today integer := 0;
  v_session_only_today integer := 0;
  v_now timestamptz := now();
  v_today_start timestamptz :=
    date_trunc('day', timezone('Australia/Melbourne', now())) at time zone 'Australia/Melbourne';
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access required' using errcode = '42501';
  end if;

  v_result := public.get_platform_admin_school_detail_active_drilldown_base(p_school_id);

  with activity_events as (
    select
      session.student_id,
      greatest(session.created_at, session.last_used_at) as occurred_at,
      'session'::text as event_type
    from public.student_access_sessions session
    join public.students student on student.id = session.student_id
    where student.school_id = p_school_id
       or public.student_belonged_to_school_at(
         session.student_id,
         p_school_id,
         greatest(session.created_at, session.last_used_at),
         null
       )

    union all

    select attempt.student_id, attempt.completed_at, 'lesson'::text
    from public.student_lesson_attempts attempt
    where attempt.completed = true
      and public.student_belonged_to_school_at(
        attempt.student_id, p_school_id, attempt.completed_at, attempt.class_id
      )

    union all

    select attempt.student_id, attempt.completed_at, 'quiz'::text
    from public.student_weekly_quiz_attempts attempt
    where public.student_belonged_to_school_at(
      attempt.student_id, p_school_id, attempt.completed_at, attempt.class_id
    )

    union all

    select assessment.student_id, assessment.completed_at, 'assessment'::text
    from public.student_realm_assessments assessment
    where public.student_belonged_to_school_at(
      assessment.student_id, p_school_id, assessment.completed_at, assessment.class_id
    )
  ), today_by_student as (
    select
      event.student_id,
      max(event.occurred_at) as last_active,
      bool_or(event.event_type = 'session') as used_session,
      bool_or(event.event_type <> 'session') as submitted_work,
      array_agg(distinct event.event_type order by event.event_type) as activity_types
    from activity_events event
    where event.occurred_at >= v_today_start
      and event.occurred_at <= v_now
    group by event.student_id
  ), student_rows as (
    select
      activity.student_id,
      coalesce(nullif(trim(student.display_name), ''), nullif(trim(student.username), ''), 'Student') as student_name,
      activity.last_active,
      activity.used_session,
      activity.submitted_work,
      activity.activity_types
    from today_by_student activity
    join public.students student on student.id = activity.student_id
  )
  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'studentId', row.student_id,
          'studentName', row.student_name,
          'lastActive', row.last_active,
          'usedSession', row.used_session,
          'submittedWork', row.submitted_work,
          'activityTypes', to_jsonb(row.activity_types)
        )
        order by row.last_active desc, lower(row.student_name)
      ),
      '[]'::jsonb
    ),
    count(*) filter (where row.submitted_work)::integer,
    count(*) filter (where row.used_session and not row.submitted_work)::integer
  into v_students, v_submitted_work_today, v_session_only_today
  from student_rows row;

  v_result := jsonb_set(v_result, '{activity,activeTodayStudents}', v_students, true);
  v_result := jsonb_set(v_result, '{activity,submittedWorkToday}', to_jsonb(v_submitted_work_today), true);
  v_result := jsonb_set(v_result, '{activity,sessionOnlyToday}', to_jsonb(v_session_only_today), true);
  return v_result;
end;
$$;

revoke all on function public.get_platform_admin_school_detail(uuid)
  from public, anon;
grant execute on function public.get_platform_admin_school_detail(uuid)
  to authenticated;

commit;
