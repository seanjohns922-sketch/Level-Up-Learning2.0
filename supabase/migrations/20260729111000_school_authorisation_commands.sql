begin;

create table if not exists public.school_command_receipts (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  command_name text not null,
  idempotency_key text not null,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (school_id, actor_user_id, command_name, idempotency_key)
);

create table if not exists public.platform_command_receipts (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  command_name text not null,
  idempotency_key text not null,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (actor_user_id, command_name, idempotency_key)
);

alter table public.school_command_receipts enable row level security;
alter table public.platform_command_receipts enable row level security;
revoke all on public.school_command_receipts from public, anon, authenticated;
revoke all on public.platform_command_receipts from public, anon, authenticated;

create or replace function public.write_school_audit(
  p_school_id uuid,
  p_action text,
  p_target_type text,
  p_target_id text,
  p_previous_state jsonb default null,
  p_new_state jsonb default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.school_audit_log (
    school_id,
    actor_user_id,
    action,
    target_type,
    target_id,
    previous_state,
    new_state,
    metadata
  ) values (
    p_school_id,
    auth.uid(),
    p_action,
    p_target_type,
    p_target_id,
    p_previous_state,
    p_new_state,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.write_school_audit(
  uuid, text, text, text, jsonb, jsonb, jsonb
) from public, anon, authenticated;

create or replace function public.get_school_access_context(p_school_id uuid)
returns table (
  school_id uuid,
  school_name text,
  school_status text,
  membership_role text,
  membership_status text,
  can_manage boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.id,
    s.name,
    s.status,
    coalesce(sm.role, 'platform_admin'),
    coalesce(sm.status, 'active'),
    public.can_manage_school(s.id)
  from public.schools s
  left join public.school_memberships sm
    on sm.school_id = s.id
   and sm.user_id = auth.uid()
   and sm.status = 'active'
  where s.id = p_school_id
    and s.status = 'active'
    and public.can_view_school(s.id)
  limit 1;
$$;

revoke all on function public.get_school_access_context(uuid)
  from public, anon;
grant execute on function public.get_school_access_context(uuid)
  to authenticated;

create or replace function public.record_school_access(
  p_school_id uuid,
  p_surface text
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_audit_id bigint;
begin
  if not public.can_view_school(p_school_id) then
    raise exception 'School access denied' using errcode = '42501';
  end if;
  if nullif(trim(coalesce(p_surface, '')), '') is null then
    raise exception 'Access surface is required';
  end if;

  insert into public.school_audit_log (
    school_id,
    actor_user_id,
    action,
    target_type,
    target_id,
    metadata
  ) values (
    p_school_id,
    auth.uid(),
    'school_accessed',
    'school',
    p_school_id::text,
    jsonb_build_object(
      'surface', trim(p_surface),
      'platform_admin', public.is_platform_admin()
    )
  )
  returning id into v_audit_id;

  return v_audit_id;
end;
$$;

create or replace function public.create_school(
  p_name text,
  p_school_code text,
  p_state text,
  p_sector text,
  p_idempotency_key text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_name text := nullif(trim(coalesce(p_name, '')), '');
  v_code text := upper(trim(coalesce(p_school_code, '')));
  v_key text := nullif(trim(coalesce(p_idempotency_key, '')), '');
  v_receipt public.platform_command_receipts%rowtype;
  v_school_id uuid;
begin
  if v_actor is null or not public.is_platform_admin() then
    raise exception 'Platform administrator access required' using errcode = '42501';
  end if;
  if v_name is null then
    raise exception 'School name is required';
  end if;
  if v_code !~ '^[A-Z0-9]{5,16}$' then
    raise exception 'School code must contain 5 to 16 letters or numbers';
  end if;
  if v_key is null then
    raise exception 'An idempotency key is required';
  end if;

  select *
  into v_receipt
  from public.platform_command_receipts pcr
  where pcr.actor_user_id = v_actor
    and pcr.command_name = 'create_school'
    and pcr.idempotency_key = v_key;

  if v_receipt.id is not null then
    return (v_receipt.result->>'school_id')::uuid;
  end if;

  insert into public.schools (
    name, school_code, state, sector, status, created_by
  ) values (
    v_name,
    v_code,
    nullif(trim(coalesce(p_state, '')), ''),
    nullif(trim(coalesce(p_sector, '')), ''),
    'pending',
    v_actor
  )
  returning id into v_school_id;

  insert into public.platform_command_receipts (
    actor_user_id, command_name, idempotency_key, result
  ) values (
    v_actor,
    'create_school',
    v_key,
    jsonb_build_object('school_id', v_school_id)
  );

  perform public.write_school_audit(
    v_school_id,
    'school_created',
    'school',
    v_school_id::text,
    null,
    jsonb_build_object('name', v_name, 'school_code', v_code, 'status', 'pending'),
    jsonb_build_object('idempotency_key', v_key)
  );

  return v_school_id;
end;
$$;

create or replace function public.activate_school(p_school_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_previous public.schools%rowtype;
begin
  if auth.uid() is null or not public.is_platform_admin() then
    raise exception 'Platform administrator access required' using errcode = '42501';
  end if;

  select *
  into v_previous
  from public.schools s
  where s.id = p_school_id
  for update;

  if v_previous.id is null then
    raise exception 'School not found';
  end if;
  if v_previous.status not in ('pending', 'suspended') then
    raise exception 'Only pending or suspended schools can be activated';
  end if;

  update public.schools
  set
    status = 'active',
    activated_by = auth.uid(),
    activated_at = now(),
    updated_at = now()
  where id = p_school_id;

  perform public.write_school_audit(
    p_school_id,
    'school_activated',
    'school',
    p_school_id::text,
    jsonb_build_object('status', v_previous.status),
    jsonb_build_object('status', 'active', 'activated_by', auth.uid())
  );
end;
$$;

create or replace function public.invite_school_staff(
  p_school_id uuid,
  p_email text,
  p_role text,
  p_idempotency_key text
)
returns table (
  invitation_id uuid,
  invitation_token text,
  repeated_request boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_email text := lower(trim(coalesce(p_email, '')));
  v_key text := nullif(trim(coalesce(p_idempotency_key, '')), '');
  v_token text;
  v_existing public.school_invitations%rowtype;
  v_invitation_id uuid;
begin
  if v_actor is null then
    raise exception 'Login required' using errcode = '42501';
  end if;
  if not public.can_manage_school(p_school_id) then
    raise exception 'School administrator access required' using errcode = '42501';
  end if;
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'A valid staff email is required';
  end if;
  if p_role not in ('school_admin', 'principal', 'teacher', 'support_staff') then
    raise exception 'Invalid school role';
  end if;
  if v_key is null then
    raise exception 'An idempotency key is required';
  end if;

  select *
  into v_existing
  from public.school_invitations si
  where si.school_id = p_school_id
    and si.idempotency_key = v_key;

  if v_existing.id is not null then
    if v_existing.email <> v_email or v_existing.role <> p_role then
      raise exception 'Idempotency key already used with different invitation details';
    end if;
    return query select v_existing.id, null::text, true;
    return;
  end if;

  if exists (
    select 1
    from public.user_profiles up
    join public.school_memberships sm on sm.user_id = up.user_id
    where lower(up.email) = v_email
      and sm.school_id = p_school_id
      and sm.status = 'active'
  ) then
    raise exception 'This person is already an active school member';
  end if;

  v_token := encode(extensions.gen_random_bytes(24), 'hex');

  insert into public.school_invitations (
    school_id,
    email,
    role,
    token_hash,
    idempotency_key,
    invited_by
  ) values (
    p_school_id,
    v_email,
    p_role,
    encode(extensions.digest(v_token, 'sha256'), 'hex'),
    v_key,
    v_actor
  )
  returning id into v_invitation_id;

  perform public.write_school_audit(
    p_school_id,
    'school_staff_invited',
    'school_invitation',
    v_invitation_id::text,
    null,
    jsonb_build_object('email', v_email, 'role', p_role, 'status', 'pending'),
    jsonb_build_object('idempotency_key', v_key)
  );

  return query select v_invitation_id, v_token, false;
end;
$$;

create or replace function public.accept_school_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_email text;
  v_invitation public.school_invitations%rowtype;
begin
  if v_actor is null then
    raise exception 'Login required' using errcode = '42501';
  end if;

  select lower(email)
  into v_email
  from auth.users
  where id = v_actor;

  select *
  into v_invitation
  from public.school_invitations si
  where si.token_hash = encode(
      extensions.digest(trim(coalesce(p_token, '')), 'sha256'),
      'hex'
    )
    and si.status = 'pending'
    and si.expires_at > now()
  for update;

  if v_invitation.id is null then
    raise exception 'Invitation is invalid or expired';
  end if;
  if v_email is distinct from lower(v_invitation.email) then
    raise exception 'Invitation email does not match the signed-in account'
      using errcode = '42501';
  end if;

  insert into public.school_memberships (
    school_id,
    user_id,
    role,
    status,
    invited_by,
    accepted_at
  ) values (
    v_invitation.school_id,
    v_actor,
    v_invitation.role,
    'active',
    v_invitation.invited_by,
    now()
  )
  on conflict (school_id, user_id) do update set
    role = excluded.role,
    status = 'active',
    invited_by = excluded.invited_by,
    accepted_at = now(),
    ended_at = null,
    updated_at = now();

  update public.school_invitations
  set
    status = 'accepted',
    accepted_by = v_actor,
    accepted_at = now()
  where id = v_invitation.id;

  perform public.write_school_audit(
    v_invitation.school_id,
    'school_invitation_accepted',
    'school_membership',
    v_actor::text,
    null,
    jsonb_build_object('role', v_invitation.role, 'status', 'active'),
    jsonb_build_object('invitation_id', v_invitation.id)
  );

  return v_invitation.school_id;
end;
$$;

create or replace function public.change_school_member_role(
  p_school_id uuid,
  p_user_id uuid,
  p_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_previous public.school_memberships%rowtype;
begin
  if not public.can_manage_school(p_school_id) then
    raise exception 'School administrator access required' using errcode = '42501';
  end if;
  if p_role not in ('school_admin', 'principal', 'teacher', 'support_staff') then
    raise exception 'Invalid school role';
  end if;

  select *
  into v_previous
  from public.school_memberships sm
  where sm.school_id = p_school_id
    and sm.user_id = p_user_id
    and sm.status = 'active'
  for update;

  if v_previous.user_id is null then
    raise exception 'Active school member not found';
  end if;

  if v_previous.role = 'school_admin'
    and p_role <> 'school_admin'
    and not exists (
      select 1
      from public.school_memberships sm
      where sm.school_id = p_school_id
        and sm.user_id <> p_user_id
        and sm.role = 'school_admin'
        and sm.status = 'active'
    )
  then
    raise exception 'A school must retain at least one active school administrator';
  end if;

  update public.school_memberships
  set role = p_role, updated_at = now()
  where school_id = p_school_id
    and user_id = p_user_id;

  perform public.write_school_audit(
    p_school_id,
    'school_member_role_changed',
    'school_membership',
    p_user_id::text,
    jsonb_build_object('role', v_previous.role, 'status', v_previous.status),
    jsonb_build_object('role', p_role, 'status', v_previous.status)
  );
end;
$$;

create or replace function public.create_class(
  p_school_id uuid,
  p_academic_year_id uuid,
  p_name text,
  p_class_code text,
  p_year_levels text[],
  p_idempotency_key text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_name text := nullif(trim(coalesce(p_name, '')), '');
  v_code text := upper(trim(coalesce(p_class_code, '')));
  v_key text := nullif(trim(coalesce(p_idempotency_key, '')), '');
  v_receipt public.school_command_receipts%rowtype;
  v_class_id uuid;
  v_year integer;
begin
  if v_actor is null then
    raise exception 'Login required' using errcode = '42501';
  end if;
  if not (
    public.can_manage_school(p_school_id)
    or public.has_school_role(p_school_id, array['teacher'])
  ) then
    raise exception 'Active teacher membership required' using errcode = '42501';
  end if;
  if v_name is null then
    raise exception 'Class name is required';
  end if;
  if v_code = '' then
    raise exception 'Class code is required';
  end if;
  if v_key is null then
    raise exception 'An idempotency key is required';
  end if;

  select *
  into v_receipt
  from public.school_command_receipts scr
  where scr.school_id = p_school_id
    and scr.actor_user_id = v_actor
    and scr.command_name = 'create_class'
    and scr.idempotency_key = v_key;

  if v_receipt.id is not null then
    return (v_receipt.result->>'class_id')::uuid;
  end if;

  select ay.calendar_year
  into v_year
  from public.academic_years ay
  where ay.id = p_academic_year_id
    and ay.school_id = p_school_id
    and ay.status in ('planned', 'active');

  if v_year is null then
    raise exception 'Academic year is not available for this school';
  end if;
  if exists (
    select 1 from public.classes c
    where upper(c.class_code) = v_code
      and c.status = 'active'
  ) then
    raise exception 'Class code is already in use';
  end if;

  insert into public.classes (
    name,
    class_code,
    teacher_id,
    year_levels,
    school_id,
    academic_year,
    academic_year_id,
    status,
    created_by
  ) values (
    v_name,
    v_code,
    v_actor,
    coalesce(p_year_levels, '{}'::text[]),
    p_school_id,
    v_year,
    p_academic_year_id,
    'active',
    v_actor
  )
  returning id into v_class_id;

  insert into public.class_staff_memberships (
    class_id,
    school_id,
    user_id,
    role,
    status,
    assigned_by
  ) values (
    v_class_id,
    p_school_id,
    v_actor,
    'lead_teacher',
    'active',
    v_actor
  );

  insert into public.school_command_receipts (
    school_id,
    actor_user_id,
    command_name,
    idempotency_key,
    result
  ) values (
    p_school_id,
    v_actor,
    'create_class',
    v_key,
    jsonb_build_object('class_id', v_class_id)
  );

  perform public.write_school_audit(
    p_school_id,
    'class_created',
    'class',
    v_class_id::text,
    null,
    jsonb_build_object(
      'name', v_name,
      'class_code', v_code,
      'academic_year_id', p_academic_year_id,
      'lead_teacher', v_actor
    ),
    jsonb_build_object('idempotency_key', v_key)
  );

  return v_class_id;
end;
$$;

create or replace function public.assign_class_staff(
  p_class_id uuid,
  p_user_id uuid,
  p_role text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_school_id uuid;
  v_membership_role text;
  v_staff_id uuid;
  v_previous jsonb;
begin
  if not public.can_manage_class(p_class_id) then
    raise exception 'Class manager access required' using errcode = '42501';
  end if;
  if p_role not in ('lead_teacher', 'teacher', 'support_staff', 'viewer') then
    raise exception 'Invalid class staff role';
  end if;

  select c.school_id
  into v_school_id
  from public.classes c
  where c.id = p_class_id
    and c.status = 'active';

  if v_school_id is null then
    raise exception 'Active school class not found';
  end if;

  select sm.role
  into v_membership_role
  from public.school_memberships sm
  where sm.school_id = v_school_id
    and sm.user_id = p_user_id
    and sm.status = 'active';

  if v_membership_role is null then
    raise exception 'Staff member must have an active school membership';
  end if;
  if p_role in ('lead_teacher', 'teacher')
    and v_membership_role not in ('school_admin', 'principal', 'teacher')
  then
    raise exception 'Only active educators can be assigned as class teachers';
  end if;
  if p_role in ('support_staff', 'viewer')
    and v_membership_role not in (
      'school_admin', 'principal', 'teacher', 'support_staff'
    )
  then
    raise exception 'Invalid school membership for this class role';
  end if;

  select to_jsonb(csm)
  into v_previous
  from public.class_staff_memberships csm
  where csm.class_id = p_class_id
    and csm.user_id = p_user_id;

  insert into public.class_staff_memberships (
    class_id,
    school_id,
    user_id,
    role,
    status,
    assigned_by
  ) values (
    p_class_id,
    v_school_id,
    p_user_id,
    p_role,
    'active',
    auth.uid()
  )
  on conflict (class_id, user_id) do update set
    role = excluded.role,
    status = 'active',
    assigned_by = excluded.assigned_by,
    assigned_at = now(),
    ended_at = null,
    updated_at = now()
  returning id into v_staff_id;

  if p_role = 'lead_teacher' then
    update public.classes
    set teacher_id = p_user_id
    where id = p_class_id;
  end if;

  perform public.write_school_audit(
    v_school_id,
    'class_staff_assigned',
    'class_staff_membership',
    v_staff_id::text,
    v_previous,
    jsonb_build_object(
      'class_id', p_class_id,
      'user_id', p_user_id,
      'role', p_role,
      'status', 'active'
    )
  );

  return v_staff_id;
end;
$$;

create or replace function public.revoke_class_staff(
  p_class_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_staff public.class_staff_memberships%rowtype;
begin
  if not public.can_manage_class(p_class_id) then
    raise exception 'Class manager access required' using errcode = '42501';
  end if;

  select *
  into v_staff
  from public.class_staff_memberships csm
  where csm.class_id = p_class_id
    and csm.user_id = p_user_id
    and csm.status = 'active'
  for update;

  if v_staff.id is null then
    raise exception 'Active class staff assignment not found';
  end if;

  if v_staff.role = 'lead_teacher'
    and not exists (
      select 1
      from public.class_staff_memberships csm
      where csm.class_id = p_class_id
        and csm.user_id <> p_user_id
        and csm.role = 'lead_teacher'
        and csm.status = 'active'
    )
  then
    raise exception 'An active class must retain a lead teacher';
  end if;

  update public.class_staff_memberships
  set status = 'revoked', ended_at = now(), updated_at = now()
  where id = v_staff.id;

  perform public.write_school_audit(
    v_staff.school_id,
    'class_staff_revoked',
    'class_staff_membership',
    v_staff.id::text,
    to_jsonb(v_staff),
    jsonb_build_object('status', 'revoked', 'ended_at', now())
  );
end;
$$;

-- Compatibility RPC: existing class creation screens may continue to call this
-- function, but unmatched school names are now rejected and never create a
-- tenant.
create or replace function public.create_class_for_teacher(
  p_name text,
  p_class_code text,
  p_year_levels text[],
  p_school_name text,
  p_academic_year integer
)
returns table(class_id uuid, school_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_school_id uuid;
  v_academic_year_id uuid;
  v_class_id uuid;
begin
  if v_actor is null then
    raise exception 'Login required' using errcode = '42501';
  end if;

  select s.id
  into v_school_id
  from public.schools s
  join public.school_memberships sm on sm.school_id = s.id
  where sm.user_id = v_actor
    and sm.status = 'active'
    and sm.role in ('school_admin', 'teacher')
    and s.status = 'active'
    and lower(trim(s.name)) = lower(trim(coalesce(p_school_name, '')))
  order by sm.created_at
  limit 1;

  if v_school_id is null then
    raise exception 'Your account is not an active member of that school. Contact a Level Up administrator.';
  end if;

  select ay.id
  into v_academic_year_id
  from public.academic_years ay
  where ay.school_id = v_school_id
    and ay.calendar_year = p_academic_year
    and ay.status in ('planned', 'active')
  limit 1;

  if v_academic_year_id is null then
    raise exception 'The selected academic year is not configured for this school';
  end if;

  v_class_id := public.create_class(
    v_school_id,
    v_academic_year_id,
    p_name,
    p_class_code,
    p_year_levels,
    'legacy-create-class:' || upper(trim(p_class_code))
  );

  return query select v_class_id, v_school_id;
end;
$$;

revoke all on function public.invite_school_staff(uuid, text, text, text)
  from public, anon;
revoke all on function public.accept_school_invitation(text)
  from public, anon;
revoke all on function public.change_school_member_role(uuid, uuid, text)
  from public, anon;
revoke all on function public.create_class(uuid, uuid, text, text, text[], text)
  from public, anon;
revoke all on function public.assign_class_staff(uuid, uuid, text)
  from public, anon;
revoke all on function public.revoke_class_staff(uuid, uuid)
  from public, anon;
revoke all on function public.create_class_for_teacher(
  text, text, text[], text, integer
) from public, anon;
revoke all on function public.record_school_access(uuid, text)
  from public, anon;
revoke all on function public.create_school(text, text, text, text, text)
  from public, anon;
revoke all on function public.activate_school(uuid)
  from public, anon;

grant execute on function public.invite_school_staff(uuid, text, text, text)
  to authenticated;
grant execute on function public.accept_school_invitation(text)
  to authenticated;
grant execute on function public.change_school_member_role(uuid, uuid, text)
  to authenticated;
grant execute on function public.create_class(
  uuid, uuid, text, text, text[], text
) to authenticated;
grant execute on function public.assign_class_staff(uuid, uuid, text)
  to authenticated;
grant execute on function public.revoke_class_staff(uuid, uuid)
  to authenticated;
grant execute on function public.create_class_for_teacher(
  text, text, text[], text, integer
) to authenticated;
grant execute on function public.record_school_access(uuid, text)
  to authenticated;
grant execute on function public.create_school(text, text, text, text, text)
  to authenticated;
grant execute on function public.activate_school(uuid)
  to authenticated;

commit;
