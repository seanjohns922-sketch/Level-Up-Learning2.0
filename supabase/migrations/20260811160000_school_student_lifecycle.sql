begin;

create or replace function public.archive_school_student(
  p_school_id uuid,
  p_student_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student public.students%rowtype;
  v_archived_at timestamptz := now();
begin
  if auth.uid() is null or not public.can_manage_school(p_school_id) then
    raise exception 'School student management access denied'
      using errcode = '42501';
  end if;

  select student.*
  into v_student
  from public.students student
  where student.id = p_student_id
    and (
      student.school_id = p_school_id
      or exists (
        select 1
        from public.classes class
        where class.id = student.class_id
          and class.school_id = p_school_id
      )
      or exists (
        select 1
        from public.class_enrollments enrolment
        where enrolment.student_id = student.id
          and enrolment.school_id = p_school_id
      )
    )
  for update;

  if v_student.id is null then
    raise exception 'Student not found in this school'
      using errcode = 'P0002';
  end if;

  if v_student.archived_at is null then
    update public.students
    set archived_at = v_archived_at
    where id = v_student.id;

    perform public.write_school_audit(
      p_school_id,
      'student_archived',
      'student',
      v_student.id::text,
      jsonb_build_object(
        'name', v_student.display_name,
        'status', 'active',
        'class_id', v_student.class_id
      ),
      jsonb_build_object(
        'name', v_student.display_name,
        'status', 'archived',
        'archived_at', v_archived_at
      ),
      '{}'::jsonb
    );
  else
    v_archived_at := v_student.archived_at;
  end if;

  return jsonb_build_object(
    'studentId', v_student.id,
    'status', 'archived',
    'archivedAt', v_archived_at
  );
end;
$$;

create or replace function public.restore_school_student(
  p_school_id uuid,
  p_student_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student public.students%rowtype;
begin
  if auth.uid() is null or not public.can_manage_school(p_school_id) then
    raise exception 'School student management access denied'
      using errcode = '42501';
  end if;

  select student.*
  into v_student
  from public.students student
  where student.id = p_student_id
    and (
      student.school_id = p_school_id
      or exists (
        select 1
        from public.classes class
        where class.id = student.class_id
          and class.school_id = p_school_id
      )
      or exists (
        select 1
        from public.class_enrollments enrolment
        where enrolment.student_id = student.id
          and enrolment.school_id = p_school_id
      )
    )
  for update;

  if v_student.id is null then
    raise exception 'Student not found in this school'
      using errcode = 'P0002';
  end if;

  if v_student.archived_at is not null then
    update public.students
    set archived_at = null
    where id = v_student.id;

    perform public.write_school_audit(
      p_school_id,
      'student_restored',
      'student',
      v_student.id::text,
      jsonb_build_object(
        'name', v_student.display_name,
        'status', 'archived',
        'archived_at', v_student.archived_at
      ),
      jsonb_build_object(
        'name', v_student.display_name,
        'status', 'active',
        'class_id', v_student.class_id
      ),
      '{}'::jsonb
    );
  end if;

  return jsonb_build_object(
    'studentId', v_student.id,
    'status', 'active'
  );
end;
$$;

create or replace function public.delete_school_student(
  p_school_id uuid,
  p_student_id uuid,
  p_confirmation text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student public.students%rowtype;
  v_reason text := nullif(trim(coalesce(p_reason, '')), '');
  v_explorer_code record;
begin
  if auth.uid() is null or not public.can_manage_school(p_school_id) then
    raise exception 'School student management access denied'
      using errcode = '42501';
  end if;

  if p_confirmation is distinct from 'DELETE' then
    raise exception 'Type DELETE to confirm permanent deletion'
      using errcode = '22023';
  end if;

  if v_reason is null then
    raise exception 'A deletion reason is required'
      using errcode = '22023';
  end if;

  select student.*
  into v_student
  from public.students student
  where student.id = p_student_id
    and (
      student.school_id = p_school_id
      or exists (
        select 1
        from public.classes class
        where class.id = student.class_id
          and class.school_id = p_school_id
      )
      or exists (
        select 1
        from public.class_enrollments enrolment
        where enrolment.student_id = student.id
          and enrolment.school_id = p_school_id
      )
    )
  for update;

  if v_student.id is null then
    raise exception 'Student not found in this school'
      using errcode = 'P0002';
  end if;

  perform public.write_school_audit(
    p_school_id,
    'student_deleted',
    'student',
    v_student.id::text,
    jsonb_build_object(
      'name', v_student.display_name,
      'school_year_level', coalesce(
        v_student.school_year_level,
        v_student.year_level
      ),
      'username', v_student.username,
      'class_id', v_student.class_id,
      'status', case
        when v_student.archived_at is null then 'active'
        else 'archived'
      end
    ),
    null,
    jsonb_build_object('reason', v_reason)
  );

  -- Explorer-code history deliberately uses a restrictive foreign key.
  -- Remove this identity history first; all other student-owned rows cascade.
  for v_explorer_code in
    select explorer.id
    from public.student_explorer_codes explorer
    where explorer.student_id = v_student.id
    order by explorer.created_at, explorer.id
  loop
    delete from public.student_explorer_codes
    where id = v_explorer_code.id;
  end loop;

  delete from public.students
  where id = v_student.id;

  return jsonb_build_object(
    'studentId', v_student.id,
    'deleted', true
  );
end;
$$;

revoke all on function public.archive_school_student(uuid, uuid)
  from public, anon;
revoke all on function public.restore_school_student(uuid, uuid)
  from public, anon;
revoke all on function public.delete_school_student(uuid, uuid, text, text)
  from public, anon;

grant execute on function public.archive_school_student(uuid, uuid)
  to authenticated;
grant execute on function public.restore_school_student(uuid, uuid)
  to authenticated;
grant execute on function public.delete_school_student(uuid, uuid, text, text)
  to authenticated;

commit;
