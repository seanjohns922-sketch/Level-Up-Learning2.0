-- Learning Journey: per-student progression through realms and levels for
-- school leaders/teachers. Reads student_realm_progress (one row per
-- student × realm × level, carrying post-test score + completion date +
-- current flag), scoped to a school the caller may administer.

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
  if not public.can_view_school_administration(p_school_id) then
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
