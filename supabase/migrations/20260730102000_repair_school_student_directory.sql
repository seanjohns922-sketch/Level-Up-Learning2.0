begin;

-- School membership is canonical on students, but current class membership
-- and active enrolments are valid recovery paths for records created before
-- school tenancy was introduced. The administrator directory must not appear
-- empty while one of those links is already present.
create or replace function public.get_school_student_directory(
  p_school_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.can_manage_school(p_school_id) then
    raise exception 'School student directory access denied'
      using errcode = '42501';
  end if;

  return (
    with school_student_ids as (
      select student.id
      from public.students student
      where student.school_id = p_school_id

      union

      select student.id
      from public.students student
      join public.classes class on class.id = student.class_id
      where class.school_id = p_school_id
        and class.status = 'active'

      union

      select enrolment.student_id
      from public.class_enrollments enrolment
      join public.classes class on class.id = enrolment.class_id
      where enrolment.school_id = p_school_id
        and class.school_id = p_school_id
        and class.status = 'active'
        and enrolment.status = 'active'
        and enrolment.ended_at is null
    )
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', student.id,
          'name', student.display_name,
          'yearLevel', coalesce(
            student.school_year_level,
            student.year_level
          ),
          'username', student.username,
          'pinStatus', case
            when student.pin is not null
              or exists (
                select 1
                from public.student_access_credentials credential
                where credential.student_id = student.id
                  and credential.credential_type = 'pin'
                  and credential.revoked_at is null
              )
            then 'set'
            else 'not_set'
          end,
          'explorerCode', explorer.code,
          'classes', (
            select coalesce(
              jsonb_agg(distinct class.name order by class.name),
              '[]'::jsonb
            )
            from public.classes class
            where class.school_id = p_school_id
              and class.status = 'active'
              and (
                class.id = student.class_id
                or exists (
                  select 1
                  from public.class_enrollments enrolment
                  where enrolment.student_id = student.id
                    and enrolment.class_id = class.id
                    and enrolment.status = 'active'
                    and enrolment.ended_at is null
                )
              )
          ),
          'status', case
            when student.archived_at is null then 'active'
            else 'archived'
          end
        )
        order by student.display_name, student.id
      ),
      '[]'::jsonb
    )
    from school_student_ids school_student
    join public.students student on student.id = school_student.id
    join public.student_explorer_codes explorer
      on explorer.student_id = student.id
     and explorer.status = 'active'
  );
end;
$$;

revoke all on function public.get_school_student_directory(uuid)
  from public, anon;
grant execute on function public.get_school_student_directory(uuid)
  to authenticated;

commit;
