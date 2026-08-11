begin;

create or replace function public.update_school_student(
  p_school_id uuid,
  p_student_id uuid,
  p_first_name text,
  p_last_name text,
  p_school_year_level text,
  p_username text,
  p_class_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_student public.students%rowtype;
  v_class public.classes%rowtype;
  v_first_name text := nullif(trim(coalesce(p_first_name, '')), '');
  v_last_name text := nullif(trim(coalesce(p_last_name, '')), '');
  v_year_level text := nullif(trim(coalesce(p_school_year_level, '')), '');
  v_username text := nullif(trim(coalesce(p_username, '')), '');
  v_display_name text;
begin
  if v_actor is null or not public.can_manage_school(p_school_id) then
    raise exception 'School student management access denied'
      using errcode = '42501';
  end if;

  if v_first_name is null then
    raise exception 'First name is required' using errcode = '22023';
  end if;
  if v_year_level not in (
    'Prep', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'
  ) then
    raise exception 'A valid school year level is required'
      using errcode = '22023';
  end if;

  select student.*
  into v_student
  from public.students student
  where student.id = p_student_id
    and student.school_id = p_school_id
  for update;

  if v_student.id is null then
    raise exception 'Student not found in this school'
      using errcode = 'P0002';
  end if;

  v_username := coalesce(v_username, v_student.username);

  if p_class_id is not null then
    select class.*
    into v_class
    from public.classes class
    where class.id = p_class_id
      and class.school_id = p_school_id
      and class.status = 'active';

    if v_class.id is null then
      raise exception 'The selected class is not active in this school'
        using errcode = '22023';
    end if;
    if cardinality(v_class.year_levels) > 0
      and not (v_year_level = any(v_class.year_levels)) then
      raise exception 'The selected class does not include this year level'
        using errcode = '22023';
    end if;
  end if;

  v_display_name := concat_ws(' ', v_first_name, v_last_name);

  update public.students
  set
    display_name = v_display_name,
    first_name = v_first_name,
    last_name = v_last_name,
    username = v_username,
    school_year_level = v_year_level,
    year_level = v_year_level,
    class_id = p_class_id
  where id = v_student.id;

  update public.class_enrollments enrolment
  set
    status = 'ended',
    ended_at = now(),
    is_primary = false,
    updated_at = now()
  where enrolment.student_id = v_student.id
    and enrolment.school_id = p_school_id
    and enrolment.status = 'active'
    and enrolment.ended_at is null
    and (p_class_id is null or enrolment.class_id <> p_class_id);

  if p_class_id is not null then
    insert into public.class_enrollments (
      student_id, class_id, school_id, academic_year_id, is_primary,
      status, created_by
    ) values (
      v_student.id, p_class_id, p_school_id, v_class.academic_year_id,
      true, 'active', v_actor
    )
    on conflict (student_id, class_id) do update set
      school_id = excluded.school_id,
      academic_year_id = excluded.academic_year_id,
      is_primary = true,
      status = 'active',
      ended_at = null,
      updated_at = now();
  end if;

  perform public.write_school_audit(
    p_school_id,
    'student_updated',
    'student',
    v_student.id::text,
    jsonb_build_object(
      'name', v_student.display_name,
      'school_year_level', coalesce(v_student.school_year_level, v_student.year_level),
      'username', v_student.username,
      'class_id', v_student.class_id
    ),
    jsonb_build_object(
      'name', v_display_name,
      'school_year_level', v_year_level,
      'username', v_username,
      'class_id', p_class_id
    ),
    '{}'::jsonb
  );

  return jsonb_build_object(
    'studentId', v_student.id,
    'name', v_display_name,
    'schoolYearLevel', v_year_level,
    'username', v_username,
    'classId', p_class_id,
    'updated', true
  );
end;
$$;

revoke all on function public.update_school_student(
  uuid, uuid, text, text, text, text, uuid
) from public, anon;
grant execute on function public.update_school_student(
  uuid, uuid, text, text, text, text, uuid
) to authenticated;

commit;
