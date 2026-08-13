begin;

create or replace function public.get_platform_admin_home_users()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access required' using errcode='42501';
  end if;

  with home_students as (
    select
      student.id student_id,
      student.display_name student_name,
      student.username,
      coalesce(student.school_year_level, student.year_level) year_level,
      code.code explorer_code,
      school.name school_name,
      home.billing_status,
      home.starts_at home_started_at,
      home.ends_at home_ends_at,
      case
        when exists (
          select 1
          from public.student_access_entitlements school_entitlement
          where school_entitlement.student_id = student.id
            and school_entitlement.access_source = 'school'
            and school_entitlement.status = 'active'
            and school_entitlement.starts_at <= now()
            and (school_entitlement.ends_at is null or school_entitlement.ends_at >= now())
        ) then 'school_and_home'
        else 'home_only'
      end segment
    from public.student_access_entitlements home
    join public.students student on student.id = home.student_id
    left join public.schools school on school.id = student.school_id
    left join lateral (
      select explorer.code
      from public.student_explorer_codes explorer
      where explorer.student_id = student.id and explorer.status = 'active'
      order by explorer.created_at desc
      limit 1
    ) code on true
    where home.access_source = 'home'
      and home.status = 'active'
      and home.starts_at <= now()
      and (home.ends_at is null or home.ends_at >= now())
      and student.archived_at is null
      and coalesce(student.identity_status, 'active') = 'active'
  ),
  last_activity as (
    select student_id, max(completed_at) last_active_at
    from (
      select attempt.student_id, attempt.completed_at
      from public.student_lesson_attempts attempt
      where attempt.completed = true
      union all
      select attempt.student_id, attempt.completed_at
      from public.student_weekly_quiz_attempts attempt
      union all
      select assessment.student_id, assessment.completed_at
      from public.student_realm_assessments assessment
    ) events
    group by student_id
  ),
  rows as (
    select
      home_students.*,
      last_activity.last_active_at,
      coalesce((
        select jsonb_agg(jsonb_build_object(
          'parentUserId', profile.user_id,
          'parentName', profile.display_name,
          'parentEmail', profile.email,
          'relationship', link.relationship,
          'linkedAt', link.linked_at
        ) order by profile.display_name nulls last, profile.email nulls last)
        from public.parent_student_links link
        left join public.user_profiles profile on profile.user_id = link.parent_user_id
        where link.student_id = home_students.student_id
          and link.status = 'active'
      ), '[]'::jsonb) parents
    from home_students
    left join last_activity on last_activity.student_id = home_students.student_id
  )
  select jsonb_build_object(
    'generatedAt', now(),
    'timezone', 'Australia/Melbourne',
    'totals', jsonb_build_object(
      'homeUsers', count(*),
      'homeOnly', count(*) filter (where segment = 'home_only'),
      'schoolAndHome', count(*) filter (where segment = 'school_and_home'),
      'linkedParents', coalesce(sum(jsonb_array_length(parents)), 0),
      'parentEmails', coalesce(sum((
        select count(*)
        from jsonb_array_elements(parents) parent
        where nullif(parent->>'parentEmail', '') is not null
      )), 0),
      'withoutParentEmail', count(*) filter (
        where not exists (
          select 1
          from jsonb_array_elements(parents) parent
          where nullif(parent->>'parentEmail', '') is not null
        )
      )
    ),
    'students', coalesce(jsonb_agg(jsonb_build_object(
      'studentId', student_id,
      'studentName', student_name,
      'username', username,
      'yearLevel', year_level,
      'explorerCode', explorer_code,
      'segment', segment,
      'schoolName', school_name,
      'billingStatus', billing_status,
      'homeStartedAt', home_started_at,
      'homeEndsAt', home_ends_at,
      'lastActiveAt', last_active_at,
      'parents', parents
    ) order by student_name), '[]'::jsonb)
  ) into v_result
  from rows;

  return coalesce(v_result, jsonb_build_object(
    'generatedAt', now(),
    'timezone', 'Australia/Melbourne',
    'totals', jsonb_build_object('homeUsers', 0, 'homeOnly', 0, 'schoolAndHome', 0, 'linkedParents', 0, 'parentEmails', 0, 'withoutParentEmail', 0),
    'students', '[]'::jsonb
  ));
end;
$$;

revoke all on function public.get_platform_admin_home_users() from public, anon;
grant execute on function public.get_platform_admin_home_users() to authenticated;

commit;
