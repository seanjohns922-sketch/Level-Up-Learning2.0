begin;

-- School membership is canonical. A class is an optional, changeable
-- enrolment within that school, not the owner of the student record.
update public.students student
set school_id = class.school_id
from public.classes class
where class.id = student.class_id
  and class.school_id is not null
  and student.school_id is distinct from class.school_id;

insert into public.class_enrollments (
  student_id,
  class_id,
  school_id,
  academic_year_id,
  is_primary,
  status,
  created_by
)
select
  student.id,
  class.id,
  class.school_id,
  class.academic_year_id,
  true,
  'active',
  class.teacher_id
from public.students student
join public.classes class on class.id = student.class_id
where class.school_id is not null
  and class.status = 'active'
on conflict (student_id, class_id) do update set
  school_id = excluded.school_id,
  academic_year_id = excluded.academic_year_id,
  is_primary = true,
  status = 'active',
  ended_at = null,
  updated_at = now();

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
          'classIds', (
            select coalesce(
              jsonb_agg(distinct class.id order by class.id),
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

create or replace function public.create_school_student(
  p_school_id uuid,
  p_class_id uuid,
  p_first_name text,
  p_last_name text,
  p_school_year_level text,
  p_username text default null,
  p_pin text default null,
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_first_name text := nullif(trim(coalesce(p_first_name, '')), '');
  v_last_name text := nullif(trim(coalesce(p_last_name, '')), '');
  v_display_name text;
  v_year_level text := nullif(trim(coalesce(p_school_year_level, '')), '');
  v_username text := nullif(trim(coalesce(p_username, '')), '');
  v_pin text := nullif(regexp_replace(coalesce(p_pin, ''), '\D', '', 'g'), '');
  v_key text := nullif(trim(coalesce(p_idempotency_key, '')), '');
  v_class public.classes%rowtype;
  v_receipt public.school_command_receipts%rowtype;
  v_student_id uuid;
  v_claim_code text;
  v_qr_token text;
  v_explorer_code text;
  v_result jsonb;
begin
  if v_actor is null then
    raise exception 'Login required' using errcode = '42501';
  end if;
  if not public.can_manage_school(p_school_id) then
    raise exception 'School student management access denied'
      using errcode = '42501';
  end if;
  if v_first_name is null then
    raise exception 'First name is required';
  end if;
  if v_year_level not in (
    'Prep', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'
  ) then
    raise exception 'A valid school year level is required';
  end if;
  if v_key is null then
    raise exception 'An idempotency key is required';
  end if;

  if p_class_id is not null then
    select class.*
    into v_class
    from public.classes class
    where class.id = p_class_id
      and class.school_id = p_school_id
      and class.status = 'active';

    if v_class.id is null then
      raise exception 'The selected class is not active in this school';
    end if;
  end if;

  select *
  into v_receipt
  from public.school_command_receipts receipt
  where receipt.school_id = p_school_id
    and receipt.actor_user_id = v_actor
    and receipt.command_name = 'create_school_student'
    and receipt.idempotency_key = v_key;

  if v_receipt.id is not null then
    return v_receipt.result;
  end if;

  if v_pin is null then
    loop
      v_pin := lpad(floor(random() * 10000)::integer::text, 4, '0');
      exit when not exists (
        select 1
        from public.students student
        where student.school_id = p_school_id
          and student.pin = v_pin
      );
    end loop;
  elsif v_pin !~ '^\d{4}$' then
    raise exception 'Access code must be 4 digits';
  elsif exists (
    select 1
    from public.students student
    where student.school_id = p_school_id
      and student.pin = v_pin
  ) then
    raise exception 'That access code is already used in this school';
  end if;

  v_display_name := concat_ws(' ', v_first_name, v_last_name);
  if v_username is null then
    v_username := initcap(regexp_replace(v_first_name, '\s+', '', 'g'))
      || lower(left(coalesce(v_last_name, ''), 1));
  end if;

  loop
    v_claim_code := upper(substr(md5(
      random()::text || clock_timestamp()::text || gen_random_uuid()::text
    ), 1, 8));
    exit when not exists (
      select 1
      from public.student_access_credentials credential
      where credential.credential_type = 'claim_code'
        and credential.credential_secret = v_claim_code
        and credential.revoked_at is null
    );
  end loop;

  v_qr_token := md5(
    gen_random_uuid()::text || clock_timestamp()::text || random()::text
  );
  v_student_id := gen_random_uuid();

  insert into public.students (
    id, class_id, school_id, display_name, first_name, last_name,
    username, pin, qr_token, user_id, school_year_level, year_level
  ) values (
    v_student_id, p_class_id, p_school_id, v_display_name, v_first_name,
    v_last_name, v_username, v_pin, v_qr_token, null, v_year_level, v_year_level
  );

  if p_class_id is not null then
    insert into public.class_enrollments (
      student_id, class_id, school_id, academic_year_id, is_primary,
      status, created_by
    ) values (
      v_student_id, p_class_id, p_school_id, v_class.academic_year_id,
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

  insert into public.student_access_credentials (
    student_id, credential_type, credential_secret, created_by
  ) values
    (v_student_id, 'pin', v_pin, v_actor),
    (v_student_id, 'claim_code', v_claim_code, v_actor),
    (v_student_id, 'qr_token', v_qr_token, v_actor);

  v_explorer_code := public.ensure_student_explorer_code_internal(
    v_student_id,
    v_actor
  );

  v_result := jsonb_build_object(
    'studentId', v_student_id,
    'name', v_display_name,
    'username', v_username,
    'pin', v_pin,
    'explorerCode', v_explorer_code,
    'classId', p_class_id
  );

  insert into public.school_command_receipts (
    school_id, actor_user_id, command_name, idempotency_key, result
  ) values (
    p_school_id, v_actor, 'create_school_student', v_key, v_result
  );

  perform public.write_school_audit(
    p_school_id,
    'student_created',
    'student',
    v_student_id::text,
    null,
    jsonb_build_object(
      'name', v_display_name,
      'school_year_level', v_year_level,
      'class_id', p_class_id,
      'username', v_username
    ),
    jsonb_build_object('idempotency_key', v_key)
  );

  return v_result;
end;
$$;

create or replace function public.assign_school_student_to_class(
  p_school_id uuid,
  p_class_id uuid,
  p_student_id uuid,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_key text := nullif(trim(coalesce(p_idempotency_key, '')), '');
  v_class public.classes%rowtype;
  v_student public.students%rowtype;
  v_receipt public.school_command_receipts%rowtype;
  v_previous_class_id uuid;
  v_result jsonb;
begin
  if v_actor is null then
    raise exception 'Login required' using errcode = '42501';
  end if;
  if v_key is null then
    raise exception 'An idempotency key is required';
  end if;

  select class.*
  into v_class
  from public.classes class
  where class.id = p_class_id
    and class.school_id = p_school_id
    and class.status = 'active';

  if v_class.id is null or not public.can_manage_class(p_class_id) then
    raise exception 'Class management access denied' using errcode = '42501';
  end if;

  select student.*
  into v_student
  from public.students student
  where student.id = p_student_id
    and (
      student.school_id = p_school_id
      or exists (
        select 1
        from public.classes current_class
        where current_class.id = student.class_id
          and current_class.school_id = p_school_id
      )
    )
  for update;

  if v_student.id is null then
    raise exception 'Student is not in this school';
  end if;

  select *
  into v_receipt
  from public.school_command_receipts receipt
  where receipt.school_id = p_school_id
    and receipt.actor_user_id = v_actor
    and receipt.command_name = 'assign_school_student_to_class'
    and receipt.idempotency_key = v_key;

  if v_receipt.id is not null then
    return v_receipt.result;
  end if;

  v_previous_class_id := v_student.class_id;

  update public.class_enrollments enrolment
  set
    status = 'ended',
    ended_at = now(),
    is_primary = false,
    updated_at = now()
  where enrolment.student_id = p_student_id
    and enrolment.school_id = p_school_id
    and enrolment.academic_year_id is not distinct from v_class.academic_year_id
    and enrolment.class_id <> p_class_id
    and enrolment.status = 'active'
    and enrolment.ended_at is null;

  insert into public.class_enrollments (
    student_id, class_id, school_id, academic_year_id, is_primary,
    status, created_by
  ) values (
    p_student_id, p_class_id, p_school_id, v_class.academic_year_id,
    true, 'active', v_actor
  )
  on conflict (student_id, class_id) do update set
    school_id = excluded.school_id,
    academic_year_id = excluded.academic_year_id,
    is_primary = true,
    status = 'active',
    ended_at = null,
    updated_at = now();

  update public.students
  set
    school_id = p_school_id,
    class_id = p_class_id
  where id = p_student_id;

  v_result := jsonb_build_object(
    'studentId', p_student_id,
    'classId', p_class_id,
    'previousClassId', v_previous_class_id
  );

  insert into public.school_command_receipts (
    school_id, actor_user_id, command_name, idempotency_key, result
  ) values (
    p_school_id, v_actor, 'assign_school_student_to_class', v_key, v_result
  );

  perform public.write_school_audit(
    p_school_id,
    'student_class_assigned',
    'student',
    p_student_id::text,
    jsonb_build_object('class_id', v_previous_class_id),
    jsonb_build_object('class_id', p_class_id),
    jsonb_build_object('idempotency_key', v_key)
  );

  return v_result;
end;
$$;

revoke all on function public.get_school_student_directory(uuid)
  from public, anon;
grant execute on function public.get_school_student_directory(uuid)
  to authenticated;

revoke all on function public.create_school_student(
  uuid, uuid, text, text, text, text, text, text
) from public, anon;
grant execute on function public.create_school_student(
  uuid, uuid, text, text, text, text, text, text
) to authenticated;

revoke all on function public.assign_school_student_to_class(
  uuid, uuid, uuid, text
) from public, anon;
grant execute on function public.assign_school_student_to_class(
  uuid, uuid, uuid, text
) to authenticated;

commit;
