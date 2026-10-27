-- Restores the previous matching behaviour (including its known false positives).
create or replace function public.preview_school_student_creation(
  p_school_id uuid,
  p_first_name text,
  p_last_name text,
  p_school_year_level text
)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_candidates jsonb; v_request_id uuid;
begin
  if auth.uid() is null or not public.can_manage_school(p_school_id) then
    raise exception 'School access denied' using errcode = '42501';
  end if;
  if nullif(trim(p_first_name), '') is null or nullif(trim(p_last_name), '') is null then
    return jsonb_build_object('potentialDuplicate', false, 'candidates', '[]'::jsonb);
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'studentId', student.id,
    'firstName', coalesce(nullif(student.first_name, ''), split_part(student.display_name, ' ', 1)),
    'lastInitial', left(coalesce(nullif(student.last_name, ''), split_part(student.display_name, ' ', 2)), 1) || '.',
    'yearLevel', coalesce(student.school_year_level, student.year_level),
    'schoolName', school.name,
    'hasHomeAccess', exists(select 1 from public.student_access_entitlements entitlement
      where entitlement.student_id = student.id and entitlement.access_source = 'home' and entitlement.status = 'active')
  ) order by student.created_at), '[]'::jsonb)
  into v_candidates
  from public.students student
  left join public.schools school on school.id = student.school_id
  where student.archived_at is null
    and coalesce(student.identity_status, 'active') = 'active'
    and lower(regexp_replace(coalesce(nullif(student.first_name, ''), split_part(student.display_name, ' ', 1)), '[^a-z0-9]', '', 'g'))
      = lower(regexp_replace(trim(p_first_name), '[^a-z0-9]', '', 'g'))
    and lower(regexp_replace(coalesce(nullif(student.last_name, ''), split_part(student.display_name, ' ', 2)), '[^a-z0-9]', '', 'g'))
      = lower(regexp_replace(trim(p_last_name), '[^a-z0-9]', '', 'g'));

  if jsonb_array_length(v_candidates) > 0 then
    insert into public.student_identity_link_requests(
      request_type, requested_by, school_id, status, reason, metadata
    ) values (
      'duplicate_review', auth.uid(), p_school_id, 'pending',
      'Potential duplicate detected before creating a school student',
      jsonb_build_object('firstName', trim(p_first_name), 'lastName', trim(p_last_name),
        'yearLevel', p_school_year_level, 'candidateIds',
        (select jsonb_agg(candidate->>'studentId') from jsonb_array_elements(v_candidates) candidate))
    ) returning id into v_request_id;
  end if;

  return jsonb_build_object(
    'potentialDuplicate', jsonb_array_length(v_candidates) > 0,
    'requestId', v_request_id,
    'candidates', v_candidates
  );
end;
$$;

