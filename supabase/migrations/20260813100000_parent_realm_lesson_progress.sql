begin;

create or replace function public.get_parent_home_snapshot()
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

  select jsonb_build_object(
    'children', coalesce(jsonb_agg(jsonb_build_object(
      'studentId', student.id,
      'displayName', student.display_name,
      'firstName', coalesce(nullif(student.first_name,''),split_part(student.display_name,' ',1)),
      'yearLevel', student.year_level,
      'explorerCode', code.code,
      'homeAccess', coalesce(home.status='active',false),
      'billingStatus', home.billing_status,
      'schoolName', school.name,
      'lastActiveAt', greatest(
        (select max(attempt.completed_at) from public.student_lesson_attempts attempt where attempt.student_id=student.id),
        (select max(attempt.completed_at) from public.student_weekly_quiz_attempts attempt where attempt.student_id=student.id),
        (select max(attempt.completed_at) from public.student_realm_assessments attempt where attempt.student_id=student.id)
      ),
      'realms', coalesce((select jsonb_agg(jsonb_build_object(
        'realmId', progress.realm_id,
        'workingLevel', progress.working_level,
        'currentWeek', progress.current_week,
        'requiredWeeks', progress.required_weeks,
        'optionalWeeks', progress.optional_weeks,
        'status', progress.status,
        'currentFocus', (select attempt.topic_focus from public.student_lesson_attempts attempt
          where attempt.student_id=student.id and attempt.realm_id=progress.realm_id
            and attempt.working_level=progress.working_level
          order by attempt.completed_at desc limit 1),
        'completedLessons', (select count(*) from (
          select distinct attempt.week, attempt.lesson
          from public.student_lesson_attempts attempt
          where attempt.student_id=student.id and attempt.realm_id=progress.realm_id
            and attempt.working_level=progress.working_level and attempt.completed=true
        ) completed_lessons)
      ) order by progress.realm_id) from public.student_realm_progress progress
        where progress.student_id=student.id and progress.is_current), '[]'::jsonb),
      'recentAchievements', coalesce((select jsonb_agg(item) from (
        select jsonb_build_object(
          'gemId', definition.id,
          'name', definition.name,
          'earnedAt', gem.earned_at,
          'rarity', definition.rarity
        ) item
        from public.student_gems gem
        join public.gem_definitions definition on definition.id=gem.gem_id
        where gem.student_id=student.id
        order by gem.earned_at desc
        limit 3
      ) recent), '[]'::jsonb)
    ) order by student.display_name), '[]'::jsonb)
  ) into v_result
  from public.parent_student_links link
  join public.students student on student.id=link.student_id
  left join public.schools school on school.id=student.school_id
  left join public.student_explorer_codes code on code.student_id=student.id and code.status='active'
  left join public.student_access_entitlements home on home.student_id=student.id and home.access_source='home'
  where link.parent_user_id=auth.uid() and link.status='active'
    and coalesce(student.identity_status,'active')='active';

  return coalesce(v_result,jsonb_build_object('children','[]'::jsonb));
end;
$$;

revoke all on function public.get_parent_home_snapshot() from public, anon;
grant execute on function public.get_parent_home_snapshot() to authenticated;

commit;
