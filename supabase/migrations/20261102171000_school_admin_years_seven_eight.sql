-- Extend school-year labels only. Maths placement rules are separate.
begin;

CREATE OR REPLACE FUNCTION public.create_school_student(p_school_id uuid, p_class_id uuid, p_first_name text, p_last_name text, p_school_year_level text, p_username text DEFAULT NULL::text, p_pin text DEFAULT NULL::text, p_idempotency_key text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  if v_first_name is null then
    raise exception 'First name is required';
  end if;
  if v_year_level not in (
    'Prep', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8'
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
    if not (
      public.can_manage_school(p_school_id)
      or public.can_manage_class(p_class_id)
    ) then
      raise exception 'Class student management access denied'
        using errcode = '42501';
    end if;
  elsif not public.can_manage_school(p_school_id) then
    raise exception 'School student management access denied'
      using errcode = '42501';
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
    username, pin, qr_token, school_year_level, year_level
  ) values (
    v_student_id, p_class_id, p_school_id, v_display_name, v_first_name,
    v_last_name, v_username, v_pin, v_qr_token, v_year_level, v_year_level
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
$function$
;

CREATE OR REPLACE FUNCTION public.link_existing_student_to_school(p_school_id uuid, p_student_id uuid, p_school_year_level text, p_class_id uuid DEFAULT NULL::uuid, p_reason text DEFAULT 'Linked existing Level Up Learning identity'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_student public.students%rowtype;
  v_previous_school_id uuid;
  v_academic_year_id uuid;
  v_class public.classes%rowtype;
  v_enrolment_id uuid;
  v_explorer_code text;
begin
  if auth.uid() is null or not public.can_manage_school(p_school_id) then
    raise exception 'School access denied' using errcode = '42501';
  end if;
  if p_school_year_level not in ('Prep','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6','Year 7','Year 8') then
    raise exception 'A valid school year level is required';
  end if;

  select * into v_student from public.students
  where id = p_student_id and archived_at is null
    and coalesce(identity_status, 'active') = 'active'
  for update;
  if v_student.id is null then raise exception 'Student identity unavailable'; end if;
  v_previous_school_id := v_student.school_id;

  select id into v_academic_year_id from public.academic_years
  where school_id = p_school_id
  order by (calendar_year = extract(year from current_date)::integer) desc, calendar_year desc
  limit 1;
  if v_academic_year_id is null then raise exception 'School academic year unavailable'; end if;

  if p_class_id is not null then
    select * into v_class from public.classes
    where id = p_class_id and school_id = p_school_id and academic_year_id = v_academic_year_id
      and status = 'active'
    for share;
    if v_class.id is null then raise exception 'Class is not active or available for this school year'; end if;
  end if;

  update public.student_school_memberships set
    status = 'ended', ended_at = now()
  where student_id = p_student_id and status = 'active' and school_id <> p_school_id;
  insert into public.student_school_memberships(
    student_id, school_id, academic_year_id, status, link_method, created_by
  ) values (
    p_student_id, p_school_id, v_academic_year_id, 'active', 'explorer_code', auth.uid()
  ) on conflict (student_id) where status = 'active' do update set
    school_id = excluded.school_id,
    academic_year_id = excluded.academic_year_id,
    link_method = excluded.link_method,
    created_by = excluded.created_by;

  update public.class_enrollments set
    status = 'inactive', ended_at = now(), is_primary = false, updated_at = now()
  where student_id = p_student_id and status = 'active' and ended_at is null
    and school_id is distinct from p_school_id;

  if p_class_id is not null then
    update public.class_enrollments set is_primary = false, updated_at = now()
    where student_id = p_student_id and academic_year_id = v_academic_year_id
      and status = 'active' and ended_at is null;
    insert into public.class_enrollments(
      student_id, class_id, school_id, academic_year_id, status, ended_at,
      is_primary, created_by, updated_at
    ) values (
      p_student_id, p_class_id, p_school_id, v_academic_year_id, 'active', null,
      true, auth.uid(), now()
    ) on conflict (student_id, class_id) do update set
      school_id = excluded.school_id,
      academic_year_id = excluded.academic_year_id,
      status = 'active', ended_at = null, is_primary = true, updated_at = now();
    select id into v_enrolment_id from public.class_enrollments
    where student_id = p_student_id and class_id = p_class_id;
  end if;

  if v_previous_school_id is not null and v_previous_school_id <> p_school_id then
    update public.student_access_entitlements set
      status = 'expired', ends_at = coalesce(ends_at, now()), updated_by = auth.uid(), updated_at = now()
    where student_id = p_student_id and access_source = 'school'
      and school_id = v_previous_school_id and status = 'active';
  end if;
  insert into public.student_access_entitlements(
    student_id, access_source, school_id, academic_year_id, status,
    billing_status, starts_at, source_enrolment_id, notes, created_by, updated_by
  ) values (
    p_student_id, 'school', p_school_id, v_academic_year_id, 'active',
    'free', now(), v_enrolment_id, 'Existing identity linked to school', auth.uid(), auth.uid()
  ) on conflict (student_id, school_id, academic_year_id) where access_source = 'school' do update set
    status = 'active', ends_at = null, source_enrolment_id = excluded.source_enrolment_id,
    updated_by = auth.uid(), updated_at = now();

  update public.students set
    school_id = p_school_id,
    class_id = p_class_id,
    school_year_level = p_school_year_level,
    year_level = p_school_year_level
  where id = p_student_id;

  if v_previous_school_id is distinct from p_school_id then
    insert into public.student_school_transfer_events(
      student_id, from_school_id, to_school_id, requested_by, reason
    ) values (p_student_id, v_previous_school_id, p_school_id, auth.uid(), nullif(trim(p_reason), ''));
  end if;
  update public.student_identity_link_requests set
    status = 'approved', reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
  where id = (
    select id from public.student_identity_link_requests
    where request_type = 'school_link' and student_id = p_student_id
      and school_id = p_school_id and requested_by = auth.uid() and status = 'pending'
    order by created_at desc limit 1
  );
  insert into public.student_identity_audit_events(
    actor_user_id, action, student_id, school_id, before_state, after_state, reason
  ) values (
    auth.uid(), case when v_previous_school_id is null then 'home_student_linked_to_school' else 'student_transferred_school' end,
    p_student_id, p_school_id,
    jsonb_build_object('schoolId', v_previous_school_id),
    jsonb_build_object('schoolId', p_school_id, 'classId', p_class_id, 'academicYearId', v_academic_year_id),
    nullif(trim(p_reason), '')
  );
  perform public.write_school_audit(
    p_school_id, 'existing_student_linked', 'student', p_student_id::text,
    jsonb_build_object('schoolId', v_previous_school_id),
    jsonb_build_object('schoolId', p_school_id, 'classId', p_class_id),
    jsonb_build_object('reason', p_reason)
  );
  select code into v_explorer_code from public.student_explorer_codes
  where student_id = p_student_id and status = 'active' limit 1;
  return jsonb_build_object(
    'studentId', p_student_id, 'explorerCode', v_explorer_code,
    'schoolId', p_school_id, 'classId', p_class_id, 'transferred', v_previous_school_id is distinct from p_school_id
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_school_student(p_school_id uuid, p_student_id uuid, p_first_name text, p_last_name text, p_school_year_level text, p_username text, p_class_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    'Prep', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8'
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
$function$
;
commit;
