-- Validate and lock the destination class before linking/transferring a student.
-- No table, data, RLS or grant changes. Existing identity/history is retained.
begin;

create or replace function public.link_existing_student_to_school(
  p_school_id uuid,
  p_student_id uuid,
  p_school_year_level text,
  p_class_id uuid default null,
  p_reason text default 'Linked existing Level Up Learning identity'
)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
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
  if p_school_year_level not in ('Prep','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6') then
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
$$;

commit;
