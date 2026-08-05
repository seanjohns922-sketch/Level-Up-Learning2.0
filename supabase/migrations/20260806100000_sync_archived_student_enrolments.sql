-- Archiving is a soft delete from active school operations. Preserve the
-- student's class_id for historical progress, but close active enrolments.

create or replace function public.sync_archived_student_enrolments()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class public.classes%rowtype;
begin
  if old.archived_at is null and new.archived_at is not null then
    update public.class_enrollments enrolment
    set
      status = 'ended',
      ended_at = coalesce(enrolment.ended_at, new.archived_at, now()),
      is_primary = false,
      updated_at = now()
    where enrolment.student_id = new.id
      and enrolment.status = 'active'
      and enrolment.ended_at is null;
  elsif old.archived_at is not null and new.archived_at is null then
    select class.*
    into v_class
    from public.classes class
    where class.id = new.class_id
      and class.status = 'active';

    if v_class.id is not null then
      update public.class_enrollments enrolment
      set
        status = 'ended',
        ended_at = coalesce(enrolment.ended_at, now()),
        is_primary = false,
        updated_at = now()
      where enrolment.student_id = new.id
        and enrolment.academic_year_id is not distinct from v_class.academic_year_id
        and enrolment.class_id <> v_class.id
        and enrolment.status = 'active'
        and enrolment.ended_at is null;

      insert into public.class_enrollments (
        student_id,
        class_id,
        school_id,
        academic_year_id,
        is_primary,
        status,
        created_by
      ) values (
        new.id,
        v_class.id,
        v_class.school_id,
        v_class.academic_year_id,
        true,
        'active',
        auth.uid()
      )
      on conflict (student_id, class_id) do update set
        school_id = excluded.school_id,
        academic_year_id = excluded.academic_year_id,
        is_primary = true,
        status = 'active',
        ended_at = null,
        updated_at = now();
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_archived_student_enrolments_trigger
  on public.students;
create trigger sync_archived_student_enrolments_trigger
after update of archived_at on public.students
for each row
when (old.archived_at is distinct from new.archived_at)
execute function public.sync_archived_student_enrolments();

-- Repair students archived before the lifecycle trigger existed.
update public.class_enrollments enrolment
set
  status = 'ended',
  ended_at = coalesce(enrolment.ended_at, student.archived_at, now()),
  is_primary = false,
  updated_at = now()
from public.students student
where student.id = enrolment.student_id
  and student.archived_at is not null
  and enrolment.status = 'active'
  and enrolment.ended_at is null;

-- Archived students remain in the school directory for restoration and
-- reporting, but no longer display a current class assignment.
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
  if auth.uid() is null or not public.can_view_school(p_school_id) then
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

      union

      select enrolment.student_id
      from public.class_enrollments enrolment
      join public.classes class on class.id = enrolment.class_id
      where class.school_id = p_school_id
        and enrolment.status = 'active'
        and enrolment.ended_at is null
    )
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', student.id,
          'name', student.display_name,
          'yearLevel', coalesce(student.school_year_level, student.year_level),
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
          'classIds', (
            select coalesce(
              jsonb_agg(distinct class.id order by class.id),
              '[]'::jsonb
            )
            from public.classes class
            where student.archived_at is null
              and class.school_id = p_school_id
              and class.status = 'active'
              and exists (
                select 1
                from public.class_enrollments enrolment
                where enrolment.student_id = student.id
                  and enrolment.class_id = class.id
                  and enrolment.status = 'active'
                  and enrolment.ended_at is null
              )
          ),
          'classes', (
            select coalesce(
              jsonb_agg(distinct class.name order by class.name),
              '[]'::jsonb
            )
            from public.classes class
            where student.archived_at is null
              and class.school_id = p_school_id
              and class.status = 'active'
              and exists (
                select 1
                from public.class_enrollments enrolment
                where enrolment.student_id = student.id
                  and enrolment.class_id = class.id
                  and enrolment.status = 'active'
                  and enrolment.ended_at is null
              )
          ),
          'status', case
            when student.archived_at is null then 'active'
            else 'archived'
          end
        )
        order by
          case coalesce(student.school_year_level, student.year_level)
            when 'Prep' then 0
            when 'Year 1' then 1
            when 'Year 2' then 2
            when 'Year 3' then 3
            when 'Year 4' then 4
            when 'Year 5' then 5
            when 'Year 6' then 6
            else 99
          end,
          student.display_name,
          student.id
      ),
      '[]'::jsonb
    )
    from school_student_ids school_student
    join public.students student on student.id = school_student.id
    left join lateral (
      select active_code.code
      from public.student_explorer_codes active_code
      where active_code.student_id = student.id
        and active_code.status = 'active'
      order by active_code.created_at desc
      limit 1
    ) explorer on true
  );
end;
$$;

revoke all on function public.sync_archived_student_enrolments()
  from public, anon, authenticated;
