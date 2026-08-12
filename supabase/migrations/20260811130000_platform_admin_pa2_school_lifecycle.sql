begin;

-- PA2 adds explicit school lifecycle state without changing canonical identities.
alter table public.schools
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references auth.users(id) on delete set null,
  add column if not exists archive_reason text,
  add column if not exists paused_at timestamptz,
  add column if not exists paused_by uuid references auth.users(id) on delete set null,
  add column if not exists pause_reason text,
  add column if not exists lifecycle_previous_licence_status text;

alter table public.school_memberships
  add column if not exists lifecycle_held_at timestamptz,
  add column if not exists lifecycle_previous_status text;

alter table public.student_access_entitlements
  add column if not exists lifecycle_held_at timestamptz,
  add column if not exists lifecycle_previous_status text;

alter table public.class_staff_memberships
  add column if not exists lifecycle_held_at timestamptz,
  add column if not exists lifecycle_previous_status text;

-- A trial is commercially distinct from active access, but it is still an
-- operational school. Existing PA1 trial records are normalised accordingly.
update public.schools school
set status = 'active', updated_at = now()
where school.status = 'pending'
  and exists (
    select 1 from public.school_licence_entitlements licence
    where licence.school_id = school.id and licence.status = 'trial'
  );

with duplicate_pending as (
  select id, row_number() over (
    partition by school_id, lower(email), role order by created_at desc, id desc
  ) as duplicate_rank
  from public.school_invitations
  where status = 'pending'
)
update public.school_invitations invitation
set status = 'revoked', updated_at = now()
from duplicate_pending duplicate
where invitation.id = duplicate.id and duplicate.duplicate_rank > 1;

create unique index if not exists school_pending_admin_invitation_idx
  on public.school_invitations (school_id, lower(email), role)
  where status = 'pending';

create or replace function public.guard_school_enrolment_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'active' and not exists (
    select 1
    from public.schools school
    join public.school_licence_entitlements licence
      on licence.school_id = school.id
     and licence.academic_year_id = new.academic_year_id
    where school.id = new.school_id
      and school.status = 'active'
      and licence.status in ('trial', 'active')
      and licence.start_date <= current_date
      and licence.end_date >= current_date
  ) then
    raise exception 'This school is not currently accepting enrolments';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_school_enrolment_lifecycle on public.class_enrollments;
create trigger guard_school_enrolment_lifecycle
before insert or update of status, school_id, academic_year_id
on public.class_enrollments
for each row execute function public.guard_school_enrolment_lifecycle();

create or replace function public.guard_school_invitation_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'pending' and not exists (
    select 1
    from public.schools school
    join public.school_licence_entitlements licence on licence.school_id = school.id
    where school.id = new.school_id
      and school.status = 'active'
      and licence.status in ('trial', 'active')
      and licence.start_date <= current_date
      and licence.end_date >= current_date
  ) then
    raise exception 'This school is not currently accepting staff invitations';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_school_invitation_lifecycle on public.school_invitations;
create trigger guard_school_invitation_lifecycle
before insert or update of status, school_id
on public.school_invitations
for each row execute function public.guard_school_invitation_lifecycle();

create or replace function public.platform_owner_provision_school(
  p_name text,
  p_school_code text,
  p_state text,
  p_sector text,
  p_calendar_year integer,
  p_seat_limit integer,
  p_status text,
  p_start_date date,
  p_end_date date,
  p_billing_status text,
  p_initial_admin_email text default null,
  p_notes text default null,
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_school_id uuid;
  v_year_id uuid;
  v_start date := coalesce(p_start_date, make_date(p_calendar_year, 1, 1));
  v_end date := coalesce(p_end_date, make_date(p_calendar_year, 12, 31));
  v_email text := lower(trim(coalesce(p_initial_admin_email, '')));
  v_admin_user_id uuid;
  v_admin_status text := 'not_provided';
  v_invitation_id uuid;
  v_similar jsonb := '[]'::jsonb;
  v_receipt public.platform_command_receipts%rowtype;
  v_result jsonb;
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access required' using errcode = '42501';
  end if;
  if nullif(trim(coalesce(p_name, '')), '') is null then raise exception 'School name is required'; end if;
  if upper(trim(coalesce(p_school_code, ''))) !~ '^[A-Z0-9]{5,16}$' then
    raise exception 'School code must contain 5 to 16 letters or numbers';
  end if;
  if p_state not in ('ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA', 'Other') then
    raise exception 'Select a valid state or territory';
  end if;
  if p_sector not in ('Government', 'Catholic', 'Independent', 'Other') then raise exception 'Select a valid sector'; end if;
  if p_calendar_year not between 2000 and 2100 then raise exception 'Academic year is invalid'; end if;
  if p_seat_limit < 0 then raise exception 'Seat limit cannot be negative'; end if;
  if p_status not in ('trial', 'active') then raise exception 'A new school must be Trial or Active'; end if;
  if p_billing_status not in ('free', 'trial', 'complimentary', 'paid', 'expired') then raise exception 'Invalid billing classification'; end if;
  if v_end < v_start then raise exception 'End date must follow start date'; end if;
  if v_email <> '' and v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'A valid administrator email is required'; end if;
  if nullif(trim(coalesce(p_idempotency_key, '')), '') is null then raise exception 'An idempotency key is required'; end if;

  select * into v_receipt
  from public.platform_command_receipts receipt
  where receipt.actor_user_id = v_actor
    and receipt.command_name = 'platform_owner_provision_school'
    and receipt.idempotency_key = trim(p_idempotency_key);
  if v_receipt.id is not null then return v_receipt.result; end if;

  if exists (select 1 from public.schools where upper(school_code) = upper(trim(p_school_code))) then
    raise exception 'School code is already in use';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'code', school_code)), '[]'::jsonb)
  into v_similar
  from public.schools
  where lower(name) = lower(trim(p_name)) or lower(name) like '%' || lower(trim(p_name)) || '%';

  insert into public.schools (
    name, school_code, state, sector, status, created_by, activated_at, activated_by
  ) values (
    trim(p_name), upper(trim(p_school_code)), p_state, p_sector, 'active', v_actor, now(), v_actor
  ) returning id into v_school_id;

  insert into public.academic_years (
    school_id, name, calendar_year, starts_on, ends_on, status, created_by
  ) values (
    v_school_id, p_calendar_year::text, p_calendar_year, v_start, v_end, 'active', v_actor
  ) returning id into v_year_id;

  insert into public.school_licence_entitlements (
    school_id, academic_year_id, status, seat_limit, start_date, end_date,
    billing_status, notes, created_by, updated_by
  ) values (
    v_school_id, v_year_id, p_status, p_seat_limit, v_start, v_end,
    p_billing_status, nullif(trim(coalesce(p_notes, '')), ''), v_actor, v_actor
  );

  if v_email <> '' then
    select profile.user_id into v_admin_user_id
    from public.user_profiles profile
    where lower(profile.email) = v_email and profile.status = 'active'
    limit 1;

    if v_admin_user_id is not null then
      insert into public.school_memberships (
        school_id, user_id, role, status, invited_by, accepted_at, ended_at, updated_at
      ) values (
        v_school_id, v_admin_user_id, 'school_admin', 'active', v_actor, now(), null, now()
      ) on conflict (school_id, user_id) do update set
        role = 'school_admin', status = 'active', invited_by = v_actor,
        accepted_at = coalesce(public.school_memberships.accepted_at, now()),
        ended_at = null, updated_at = now();
      v_admin_status := 'membership_added';
      perform public.write_platform_admin_audit(
        'school_admin_added', 'school_membership', v_school_id::text || ':' || v_admin_user_id::text,
        null, jsonb_build_object('schoolId', v_school_id, 'userId', v_admin_user_id, 'email', v_email, 'role', 'school_admin'),
        'Initial administrator assigned during school creation'
      );
    else
      insert into public.school_invitations (
        school_id, email, role, status, token_hash, idempotency_key, invited_by, expires_at
      ) values (
        v_school_id, v_email, 'school_admin', 'pending',
        encode(extensions.digest(encode(extensions.gen_random_bytes(24), 'hex'), 'sha256'), 'hex'),
        'platform:' || trim(p_idempotency_key), v_actor, now() + interval '7 days'
      ) returning id into v_invitation_id;
      v_admin_status := 'invitation_created';
      perform public.write_platform_admin_audit(
        'school_admin_invited', 'school_invitation', v_invitation_id::text,
        null, jsonb_build_object('schoolId', v_school_id, 'email', v_email, 'role', 'school_admin', 'status', 'pending'),
        'Initial administrator invited during school creation'
      );
    end if;
  end if;

  v_result := jsonb_build_object(
    'schoolId', v_school_id, 'name', trim(p_name), 'schoolCode', upper(trim(p_school_code)),
    'status', p_status, 'academicYear', p_calendar_year, 'seatLimit', p_seat_limit,
    'billingStatus', p_billing_status, 'initialAdminStatus', v_admin_status,
    'emailDelivery', case when v_admin_status = 'invitation_created' then 'unavailable' else 'not_required' end,
    'similarSchools', v_similar
  );

  insert into public.platform_command_receipts (actor_user_id, command_name, idempotency_key, result)
  values (v_actor, 'platform_owner_provision_school', trim(p_idempotency_key), v_result);

  perform public.write_platform_admin_audit(
    'school_created', 'school', v_school_id::text, null,
    jsonb_build_object(
      'name', trim(p_name), 'schoolCode', upper(trim(p_school_code)), 'state', p_state,
      'sector', p_sector, 'status', p_status, 'academicYear', p_calendar_year,
      'seatLimit', p_seat_limit, 'billingStatus', p_billing_status,
      'initialAdminStatus', v_admin_status
    ), 'Platform Admin PA2 school provisioning'
  );
  return v_result;
end;
$$;

create or replace function public.platform_owner_update_school(
  p_school_id uuid,
  p_name text,
  p_school_code text,
  p_state text,
  p_sector text,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before public.schools%rowtype;
  v_after public.schools%rowtype;
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access required' using errcode = '42501'; end if;
  select * into v_before from public.schools where id = p_school_id for update;
  if v_before.id is null then raise exception 'School not found'; end if;
  if v_before.status = 'archived' then raise exception 'Restore this school before editing it'; end if;
  if nullif(trim(coalesce(p_name, '')), '') is null then raise exception 'School name is required'; end if;
  if upper(trim(coalesce(p_school_code, ''))) !~ '^[A-Z0-9]{5,16}$' then raise exception 'School code must contain 5 to 16 letters or numbers'; end if;
  if p_state not in ('ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA', 'Other') then raise exception 'Select a valid state or territory'; end if;
  if p_sector not in ('Government', 'Catholic', 'Independent', 'Other') then raise exception 'Select a valid sector'; end if;
  if upper(trim(p_school_code)) is distinct from v_before.school_code and nullif(trim(coalesce(p_reason, '')), '') is null then
    raise exception 'A reason is required to change a school code';
  end if;

  update public.schools set
    name = trim(p_name), school_code = upper(trim(p_school_code)), state = p_state,
    sector = p_sector, updated_at = now()
  where id = p_school_id returning * into v_after;

  perform public.write_platform_admin_audit(
    case when v_before.school_code is distinct from v_after.school_code then 'school_code_changed' else 'school_updated' end,
    'school', p_school_id::text, to_jsonb(v_before), to_jsonb(v_after), nullif(trim(coalesce(p_reason, '')), '')
  );
  return jsonb_build_object('schoolId', v_after.id, 'name', v_after.name, 'schoolCode', v_after.school_code);
end;
$$;

create or replace function public.platform_owner_update_school_access(
  p_school_id uuid,
  p_academic_year_id uuid,
  p_seat_limit integer,
  p_start_date date,
  p_end_date date,
  p_billing_status text,
  p_notes text default null,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before public.school_licence_entitlements%rowtype;
  v_after public.school_licence_entitlements%rowtype;
  v_used integer;
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access required' using errcode = '42501'; end if;
  if p_seat_limit < 0 then raise exception 'Seat limit cannot be negative'; end if;
  if p_billing_status not in ('free', 'trial', 'paid', 'complimentary', 'expired') then raise exception 'Invalid billing classification'; end if;
  if p_end_date < p_start_date then raise exception 'End date must follow start date'; end if;
  select * into v_before from public.school_licence_entitlements
  where school_id = p_school_id and academic_year_id = p_academic_year_id for update;
  if v_before.id is null then raise exception 'School licence not found'; end if;
  if exists (select 1 from public.schools where id = p_school_id and status = 'archived') then raise exception 'Restore this school before editing access'; end if;

  select count(distinct student_id)::integer into v_used
  from public.student_access_entitlements
  where school_id = p_school_id and academic_year_id = p_academic_year_id
    and access_source = 'school' and status = 'active';
  if p_seat_limit < v_used then
    raise exception 'Cannot reduce this school''s seat entitlement to %. % active students currently use school access.', p_seat_limit, v_used;
  end if;

  update public.school_licence_entitlements set
    seat_limit = p_seat_limit, start_date = p_start_date, end_date = p_end_date,
    billing_status = p_billing_status, notes = nullif(trim(coalesce(p_notes, '')), ''),
    updated_by = auth.uid(), updated_at = now()
  where id = v_before.id returning * into v_after;

  perform public.write_platform_admin_audit(
    case
      when v_before.seat_limit is distinct from v_after.seat_limit then 'seat_limit_changed'
      when v_before.start_date is distinct from v_after.start_date or v_before.end_date is distinct from v_after.end_date then 'school_dates_changed'
      when v_before.billing_status is distinct from v_after.billing_status then 'school_billing_state_changed'
      else 'school_licence_updated'
    end,
    'school_licence', v_after.id::text, to_jsonb(v_before), to_jsonb(v_after), nullif(trim(coalesce(p_reason, '')), '')
  );
  return jsonb_build_object('id', v_after.id, 'seatLimit', v_after.seat_limit, 'used', v_used, 'available', v_after.seat_limit - v_used);
end;
$$;

create or replace function public.platform_owner_transition_school(
  p_school_id uuid,
  p_transition text,
  p_reason text,
  p_restore_status text default null,
  p_start_date date default null,
  p_end_date date default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_school public.schools%rowtype;
  v_licence public.school_licence_entitlements%rowtype;
  v_target_licence text;
  v_used integer;
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access required' using errcode = '42501'; end if;
  if p_transition not in ('pause', 'reactivate', 'archive', 'restore') then raise exception 'Invalid school lifecycle transition'; end if;
  if nullif(trim(coalesce(p_reason, '')), '') is null then raise exception 'A reason is required'; end if;

  select * into v_school from public.schools where id = p_school_id for update;
  if v_school.id is null then raise exception 'School not found'; end if;
  select licence.* into v_licence
  from public.school_licence_entitlements licence
  join public.academic_years year on year.id = licence.academic_year_id
  where licence.school_id = p_school_id
  order by (year.calendar_year = extract(year from current_date)::integer) desc, year.calendar_year desc
  limit 1 for update of licence;
  if v_licence.id is null then raise exception 'School licence not found'; end if;

  if p_transition = 'pause' then
    if v_school.status <> 'active' or v_licence.status not in ('trial', 'active') then raise exception 'Only an operational school can be paused'; end if;
    update public.schools set status = 'suspended', paused_at = now(), paused_by = auth.uid(),
      pause_reason = trim(p_reason), lifecycle_previous_licence_status = v_licence.status, updated_at = now()
    where id = p_school_id;
    update public.school_licence_entitlements set status = 'paused', updated_by = auth.uid(), updated_at = now() where id = v_licence.id;
    update public.student_access_entitlements set
      lifecycle_previous_status = status, lifecycle_held_at = now(), status = 'paused', updated_by = auth.uid(), updated_at = now()
    where school_id = p_school_id and access_source = 'school' and status = 'active' and lifecycle_held_at is null;
    perform public.write_platform_admin_audit('school_paused', 'school', p_school_id::text,
      jsonb_build_object('schoolStatus', v_school.status, 'licenceStatus', v_licence.status),
      jsonb_build_object('schoolStatus', 'suspended', 'licenceStatus', 'paused'), trim(p_reason));

  elsif p_transition = 'reactivate' then
    if v_school.status <> 'suspended' or v_licence.status not in ('paused', 'expired') then raise exception 'Only a paused school can be reactivated'; end if;
    v_target_licence := coalesce(nullif(p_restore_status, ''), v_school.lifecycle_previous_licence_status, 'active');
    if v_target_licence not in ('trial', 'active') then raise exception 'Reactivation status must be Trial or Active'; end if;
    if coalesce(p_end_date, v_licence.end_date) < current_date then raise exception 'Configure a current licence end date before reactivation'; end if;
    select count(distinct student_id)::integer into v_used
    from public.student_access_entitlements where school_id = p_school_id and access_source = 'school' and lifecycle_held_at is not null;
    if v_used > v_licence.seat_limit then raise exception 'Seat limit is below the school''s held student access count'; end if;
    update public.schools set status = 'active', paused_at = null, paused_by = null, pause_reason = null,
      lifecycle_previous_licence_status = null, activated_at = coalesce(activated_at, now()), activated_by = coalesce(activated_by, auth.uid()), updated_at = now()
    where id = p_school_id;
    update public.school_licence_entitlements set status = v_target_licence,
      start_date = coalesce(p_start_date, start_date), end_date = coalesce(p_end_date, end_date), updated_by = auth.uid(), updated_at = now()
    where id = v_licence.id;
    update public.student_access_entitlements set status = coalesce(lifecycle_previous_status, 'active'),
      lifecycle_previous_status = null, lifecycle_held_at = null, updated_by = auth.uid(), updated_at = now()
    where school_id = p_school_id and access_source = 'school' and lifecycle_held_at is not null;
    perform public.write_platform_admin_audit('school_reactivated', 'school', p_school_id::text,
      jsonb_build_object('schoolStatus', v_school.status, 'licenceStatus', v_licence.status),
      jsonb_build_object('schoolStatus', 'active', 'licenceStatus', v_target_licence), trim(p_reason));

  elsif p_transition = 'archive' then
    if v_school.status = 'archived' then raise exception 'School is already archived'; end if;
    update public.schools set status = 'archived', archived_at = now(), archived_by = auth.uid(),
      archive_reason = trim(p_reason), lifecycle_previous_licence_status = coalesce(v_school.lifecycle_previous_licence_status, v_licence.status), updated_at = now()
    where id = p_school_id;
    update public.school_licence_entitlements set status = 'archived', updated_by = auth.uid(), updated_at = now() where id = v_licence.id;
    update public.student_access_entitlements set
      lifecycle_previous_status = coalesce(lifecycle_previous_status, status), lifecycle_held_at = coalesce(lifecycle_held_at, now()),
      status = 'revoked', updated_by = auth.uid(), updated_at = now()
    where school_id = p_school_id and access_source = 'school' and status in ('active', 'paused');
    update public.school_memberships set lifecycle_previous_status = status, lifecycle_held_at = now(),
      status = 'inactive', ended_at = now(), updated_at = now()
    where school_id = p_school_id and status = 'active' and lifecycle_held_at is null;
    update public.class_staff_memberships set lifecycle_previous_status = status, lifecycle_held_at = now(),
      status = 'inactive', ended_at = now(), updated_at = now()
    where school_id = p_school_id and status = 'active' and lifecycle_held_at is null;
    update public.school_invitations set status = 'revoked', updated_at = now()
    where school_id = p_school_id and status = 'pending';
    perform public.write_platform_admin_audit('school_archived', 'school', p_school_id::text,
      jsonb_build_object('schoolStatus', v_school.status, 'licenceStatus', v_licence.status),
      jsonb_build_object('schoolStatus', 'archived', 'licenceStatus', 'archived'), trim(p_reason));

  else
    if v_school.status <> 'archived' or v_licence.status <> 'archived' then raise exception 'Only an archived school can be restored'; end if;
    v_target_licence := coalesce(nullif(p_restore_status, ''), v_school.lifecycle_previous_licence_status);
    if v_target_licence not in ('trial', 'active') then raise exception 'Choose Trial or Active access for restoration'; end if;
    if p_start_date is null or p_end_date is null or p_end_date < current_date or p_end_date < p_start_date then
      raise exception 'Configure valid current licence dates before restoration';
    end if;
    select count(distinct student_id)::integer into v_used
    from public.student_access_entitlements where school_id = p_school_id and access_source = 'school' and lifecycle_held_at is not null;
    if v_used > v_licence.seat_limit then raise exception 'Seat limit is below the school''s held student access count'; end if;
    update public.schools set status = 'active', archived_at = null, archived_by = null, archive_reason = null,
      paused_at = null, paused_by = null, pause_reason = null, lifecycle_previous_licence_status = null,
      activated_at = coalesce(activated_at, now()), activated_by = coalesce(activated_by, auth.uid()), updated_at = now()
    where id = p_school_id;
    update public.school_licence_entitlements set status = v_target_licence, start_date = p_start_date,
      end_date = p_end_date, updated_by = auth.uid(), updated_at = now() where id = v_licence.id;
    update public.student_access_entitlements set status = coalesce(lifecycle_previous_status, 'active'),
      lifecycle_previous_status = null, lifecycle_held_at = null, updated_by = auth.uid(), updated_at = now()
    where school_id = p_school_id and access_source = 'school' and lifecycle_held_at is not null;
    update public.school_memberships set status = coalesce(lifecycle_previous_status, 'active'), ended_at = null,
      lifecycle_previous_status = null, lifecycle_held_at = null, updated_at = now()
    where school_id = p_school_id and lifecycle_held_at is not null;
    update public.class_staff_memberships staffing set status = coalesce(lifecycle_previous_status, 'active'),
      ended_at = null, lifecycle_previous_status = null, lifecycle_held_at = null, updated_at = now()
    where staffing.school_id = p_school_id and staffing.lifecycle_held_at is not null and exists (
      select 1 from public.school_memberships membership
      where membership.school_id = p_school_id and membership.user_id = staffing.user_id and membership.status = 'active'
    );
    perform public.write_platform_admin_audit('school_restored', 'school', p_school_id::text,
      jsonb_build_object('schoolStatus', 'archived', 'licenceStatus', 'archived'),
      jsonb_build_object('schoolStatus', 'active', 'licenceStatus', v_target_licence), trim(p_reason));
  end if;

  return jsonb_build_object('schoolId', p_school_id, 'transition', p_transition, 'status',
    case when p_transition in ('pause') then 'paused' when p_transition = 'archive' then 'archived' else coalesce(v_target_licence, 'active') end);
end;
$$;

create or replace function public.platform_owner_assign_school_admin(
  p_school_id uuid,
  p_email text,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_user_id uuid;
  v_invitation_id uuid;
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access required' using errcode = '42501'; end if;
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'A valid administrator email is required'; end if;
  if nullif(trim(coalesce(p_idempotency_key, '')), '') is null then raise exception 'An idempotency key is required'; end if;
  if not exists (
    select 1 from public.schools school join public.school_licence_entitlements licence on licence.school_id = school.id
    where school.id = p_school_id and school.status = 'active' and licence.status in ('trial', 'active')
  ) then raise exception 'School must be operational before adding an administrator'; end if;

  select user_id into v_user_id from public.user_profiles where lower(email) = v_email and status = 'active' limit 1;
  if v_user_id is not null then
    insert into public.school_memberships (school_id, user_id, role, status, invited_by, accepted_at, ended_at, updated_at)
    values (p_school_id, v_user_id, 'school_admin', 'active', auth.uid(), now(), null, now())
    on conflict (school_id, user_id) do update set role = 'school_admin', status = 'active', ended_at = null,
      accepted_at = coalesce(public.school_memberships.accepted_at, now()), updated_at = now();
    perform public.write_platform_admin_audit('school_admin_added', 'school_membership', p_school_id::text || ':' || v_user_id::text,
      null, jsonb_build_object('schoolId', p_school_id, 'userId', v_user_id, 'email', v_email, 'role', 'school_admin'), 'Platform Owner confirmed assignment');
    return jsonb_build_object('status', 'membership_added', 'userId', v_user_id, 'emailDelivery', 'not_required');
  end if;

  select id into v_invitation_id from public.school_invitations
  where school_id = p_school_id and lower(email) = v_email and role = 'school_admin' and status = 'pending';
  if v_invitation_id is null then
    insert into public.school_invitations (school_id, email, role, status, token_hash, idempotency_key, invited_by, expires_at)
    values (p_school_id, v_email, 'school_admin', 'pending',
      encode(extensions.digest(encode(extensions.gen_random_bytes(24), 'hex'), 'sha256'), 'hex'),
      'platform:' || trim(p_idempotency_key), auth.uid(), now() + interval '7 days') returning id into v_invitation_id;
    perform public.write_platform_admin_audit('school_admin_invited', 'school_invitation', v_invitation_id::text,
      null, jsonb_build_object('schoolId', p_school_id, 'email', v_email, 'status', 'pending'), 'Platform Owner invitation');
  end if;
  return jsonb_build_object('status', 'invitation_created', 'invitationId', v_invitation_id, 'emailDelivery', 'unavailable');
end;
$$;

create or replace function public.platform_owner_manage_school_admin(
  p_school_id uuid,
  p_action text,
  p_user_id uuid default null,
  p_invitation_id uuid default null,
  p_reason text default null,
  p_confirm_final_admin boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.school_memberships%rowtype;
  v_invitation public.school_invitations%rowtype;
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access required' using errcode = '42501'; end if;
  if p_action not in ('deactivate', 'restore', 'revoke_invitation', 'resend_invitation') then raise exception 'Invalid administrator action'; end if;
  if p_action in ('deactivate', 'restore') then
    select * into v_member from public.school_memberships
    where school_id = p_school_id and user_id = p_user_id and role in ('school_admin', 'principal') for update;
    if v_member.user_id is null then raise exception 'School administrator membership not found'; end if;
    if p_action = 'deactivate' then
      if v_member.status <> 'active' then raise exception 'Administrator is not active'; end if;
      if not p_confirm_final_admin and not exists (
        select 1 from public.school_memberships
        where school_id = p_school_id and user_id <> p_user_id and role in ('school_admin', 'principal') and status = 'active'
      ) then raise exception 'This is the school''s only active administrator. Confirm this action explicitly.'; end if;
      update public.school_memberships set status = 'inactive', ended_at = now(), updated_at = now()
      where school_id = p_school_id and user_id = p_user_id;
      perform public.write_platform_admin_audit('school_admin_deactivated', 'school_membership', p_school_id::text || ':' || p_user_id::text,
        to_jsonb(v_member), jsonb_build_object('schoolId', p_school_id, 'userId', p_user_id, 'status', 'inactive'), nullif(trim(coalesce(p_reason, '')), ''));
    else
      if exists (select 1 from public.schools where id = p_school_id and status <> 'active') then raise exception 'Restore the school before restoring its administrator'; end if;
      update public.school_memberships set status = 'active', ended_at = null, updated_at = now()
      where school_id = p_school_id and user_id = p_user_id;
      perform public.write_platform_admin_audit('school_admin_restored', 'school_membership', p_school_id::text || ':' || p_user_id::text,
        to_jsonb(v_member), jsonb_build_object('schoolId', p_school_id, 'userId', p_user_id, 'status', 'active'), nullif(trim(coalesce(p_reason, '')), ''));
    end if;
  else
    select * into v_invitation from public.school_invitations
    where id = p_invitation_id and school_id = p_school_id and status = 'pending' for update;
    if v_invitation.id is null then raise exception 'Pending administrator invitation not found'; end if;
    if p_action = 'revoke_invitation' then
      update public.school_invitations set status = 'revoked', updated_at = now() where id = p_invitation_id;
      perform public.write_platform_admin_audit('school_admin_invitation_revoked', 'school_invitation', p_invitation_id::text,
        to_jsonb(v_invitation), jsonb_build_object('schoolId', p_school_id, 'status', 'revoked'), nullif(trim(coalesce(p_reason, '')), ''));
    else
      update public.school_invitations set token_hash = encode(extensions.digest(encode(extensions.gen_random_bytes(24), 'hex'), 'sha256'), 'hex'),
        expires_at = now() + interval '7 days', updated_at = now() where id = p_invitation_id;
      perform public.write_platform_admin_audit('school_admin_invitation_resent', 'school_invitation', p_invitation_id::text,
        jsonb_build_object('expiresAt', v_invitation.expires_at), jsonb_build_object('schoolId', p_school_id, 'expiresAt', now() + interval '7 days'), null);
    end if;
  end if;
  return jsonb_build_object('schoolId', p_school_id, 'action', p_action, 'emailDelivery', case when p_action = 'resend_invitation' then 'unavailable' else 'not_required' end);
end;
$$;

-- Enrich PA1 detail without loading progression or attempt rows into the client.
create or replace function public.get_platform_admin_school_detail(p_school_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
  v_today_start timestamptz := date_trunc('day', timezone('Australia/Melbourne', now())) at time zone 'Australia/Melbourne';
  v_week_start timestamptz := date_trunc('week', timezone('Australia/Melbourne', now())) at time zone 'Australia/Melbourne';
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access required' using errcode = '42501'; end if;
  with licence as (
    select entitlement.*, year.name as academic_year, year.calendar_year
    from public.school_licence_entitlements entitlement
    join public.academic_years year on year.id = entitlement.academic_year_id
    where entitlement.school_id = p_school_id
    order by (year.calendar_year = extract(year from current_date)::integer) desc, year.calendar_year desc limit 1
  ),
  historical_students as (
    select distinct student.id from public.students student where student.school_id = p_school_id
    union select distinct entitlement.student_id from public.student_access_entitlements entitlement where entitlement.school_id = p_school_id
  ),
  current_students as (
    select distinct entitlement.student_id
    from public.student_access_entitlements entitlement join licence on licence.academic_year_id = entitlement.academic_year_id
    where entitlement.school_id = p_school_id and entitlement.access_source = 'school' and entitlement.status = 'active'
  ),
  segments as (
    select current_students.student_id,
      exists (select 1 from public.student_access_entitlements home where home.student_id = current_students.student_id and home.access_source = 'home' and home.status = 'active') as home_access,
      exists (select 1 from public.parent_student_links link where link.student_id = current_students.student_id and link.status = 'active') as parent_linked
    from current_students
  ),
  activity as (
    select count(distinct attempt.student_id) filter (where attempt.completed_at >= v_today_start)::integer as active_today,
      count(distinct attempt.student_id) filter (where attempt.completed_at >= v_week_start)::integer as active_this_week,
      count(*) filter (where attempt.completed_at >= v_week_start)::integer as lessons_this_week,
      max(attempt.completed_at) as last_active
    from public.student_lesson_attempts attempt join public.students student on student.id = attempt.student_id where student.school_id = p_school_id
  )
  select jsonb_build_object(
    'school', jsonb_build_object(
      'id', school.id, 'name', school.name, 'code', school.school_code, 'state', school.state, 'sector', school.sector,
      'status', coalesce(licence.status, case school.status when 'suspended' then 'paused' else school.status end),
      'operationalStatus', school.status, 'archivedAt', school.archived_at, 'archivedBy', school.archived_by,
      'archiveReason', school.archive_reason, 'pausedAt', school.paused_at, 'pauseReason', school.pause_reason,
      'previousLicenceStatus', school.lifecycle_previous_licence_status
    ),
    'licence', jsonb_build_object(
      'id', licence.id, 'academicYearId', licence.academic_year_id, 'academicYear', licence.academic_year,
      'calendarYear', licence.calendar_year, 'status', licence.status, 'seatLimit', licence.seat_limit,
      'used', (select count(*) from segments), 'available', greatest(licence.seat_limit - (select count(*) from segments), 0),
      'utilisationPercent', case when licence.seat_limit = 0 then 0 else round(100.0 * (select count(*) from segments) / licence.seat_limit, 1) end,
      'startDate', licence.start_date, 'endDate', licence.end_date, 'billingStatus', licence.billing_status,
      'pricePerSeat', licence.price_per_seat, 'contractValue', licence.contract_value, 'notes', licence.notes
    ),
    'people', jsonb_build_object(
      'students', (select count(*) from segments), 'historicalStudents', (select count(*) from historical_students),
      'educators', (select count(*) from public.school_memberships where school_id = p_school_id and status = 'active'),
      'historicalEducators', (select count(*) from public.school_memberships where school_id = p_school_id),
      'schoolAdmins', (select count(*) from public.school_memberships where school_id = p_school_id and status = 'active' and role in ('school_admin', 'principal')),
      'parentsLinked', (select count(*) from segments where parent_linked)
    ),
    'home', jsonb_build_object(
      'schoolOnly', (select count(*) from segments where not home_access), 'schoolAndHome', (select count(*) from segments where home_access),
      'parentLinkedNoHome', (select count(*) from segments where parent_linked and not home_access),
      'freeHomeAccess', (select count(*) from segments segment where home_access and exists (
        select 1 from public.student_access_entitlements home where home.student_id = segment.student_id and home.access_source = 'home' and home.status = 'active' and home.billing_status = 'free'
      ))
    ),
    'activity', jsonb_build_object(
      'activeToday', activity.active_today, 'activeThisWeek', activity.active_this_week, 'lessonsThisWeek', activity.lessons_this_week,
      'quizzesThisWeek', (select count(*) from public.student_weekly_quiz_attempts attempt join public.students student on student.id = attempt.student_id where student.school_id = p_school_id and attempt.completed_at >= v_week_start),
      'assessmentsThisWeek', (select count(*) from public.student_realm_assessments assessment join public.students student on student.id = assessment.student_id where student.school_id = p_school_id and assessment.completed_at >= v_week_start),
      'lastActive', activity.last_active
    ),
    'administrators', (select coalesce(jsonb_agg(jsonb_build_object(
      'userId', membership.user_id, 'name', coalesce(profile.display_name, profile.email, 'Administrator'), 'email', profile.email,
      'role', membership.role, 'status', membership.status, 'acceptedAt', membership.accepted_at, 'endedAt', membership.ended_at
    ) order by membership.status, coalesce(profile.display_name, profile.email)), '[]'::jsonb)
      from public.school_memberships membership left join public.user_profiles profile on profile.user_id = membership.user_id
      where membership.school_id = p_school_id and membership.role in ('school_admin', 'principal')),
    'adminInvitations', (select coalesce(jsonb_agg(jsonb_build_object(
      'id', invitation.id, 'email', invitation.email, 'role', invitation.role, 'status', invitation.status,
      'expiresAt', invitation.expires_at, 'createdAt', invitation.created_at
    ) order by invitation.created_at desc), '[]'::jsonb)
      from public.school_invitations invitation where invitation.school_id = p_school_id and invitation.role in ('school_admin', 'principal')),
    'audit', (select coalesce(jsonb_agg(to_jsonb(entry) order by entry."createdAt" desc), '[]'::jsonb) from (
      select audit.id, audit.action, audit.reason, audit.created_at as "createdAt", audit.actor_user_id as "actorUserId"
      from public.platform_admin_audit_log audit where audit.entity_id = p_school_id::text or audit.after_state->>'schoolId' = p_school_id::text
      order by audit.created_at desc limit 30
    ) entry)
  ) into v_result
  from public.schools school left join licence on true cross join activity where school.id = p_school_id;
  if v_result is null then raise exception 'School not found'; end if;
  return v_result;
end;
$$;

create or replace function public.get_platform_admin_school_summaries_pa2()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.is_platform_owner() then raise exception 'Platform owner access required' using errcode = '42501'; end if;
  with current_licence as (
    select distinct on (licence.school_id) licence.*, year.name as academic_year, year.calendar_year
    from public.school_licence_entitlements licence
    join public.academic_years year on year.id = licence.academic_year_id
    order by licence.school_id, (year.calendar_year = extract(year from current_date)::integer) desc, year.calendar_year desc
  ),
  school_students as (
    select entitlement.school_id, entitlement.student_id
    from public.student_access_entitlements entitlement
    join current_licence licence on licence.school_id = entitlement.school_id and licence.academic_year_id = entitlement.academic_year_id
    where entitlement.access_source = 'school' and entitlement.status = 'active'
    group by entitlement.school_id, entitlement.student_id
  ),
  people as (
    select school.id as school_id,
      count(distinct student.student_id)::integer as students,
      count(distinct membership.user_id) filter (where membership.status = 'active')::integer as educators,
      count(distinct membership.user_id) filter (where membership.status = 'active' and membership.role in ('school_admin', 'principal'))::integer as school_admins,
      count(distinct link.parent_user_id) filter (where link.status = 'active')::integer as parents_linked,
      count(distinct home.student_id) filter (where home.status = 'active')::integer as home_users
    from public.schools school
    left join school_students student on student.school_id = school.id
    left join public.school_memberships membership on membership.school_id = school.id
    left join public.parent_student_links link on link.student_id = student.student_id
    left join public.student_access_entitlements home on home.student_id = student.student_id and home.access_source = 'home'
    group by school.id
  ),
  activity as (
    select student.school_id, max(attempt.completed_at) as last_active
    from public.student_lesson_attempts attempt join public.students student on student.id = attempt.student_id
    group by student.school_id
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', school.id, 'name', school.name, 'code', school.school_code,
    'status', coalesce(licence.status, case school.status when 'suspended' then 'paused' else school.status end),
    'academicYear', licence.academic_year, 'calendarYear', licence.calendar_year,
    'seatLimit', coalesce(licence.seat_limit, 0), 'used', coalesce(people.students, 0),
    'available', greatest(coalesce(licence.seat_limit, 0) - coalesce(people.students, 0), 0),
    'students', coalesce(people.students, 0), 'educators', coalesce(people.educators, 0),
    'schoolAdmins', coalesce(people.school_admins, 0), 'parentsLinked', coalesce(people.parents_linked, 0),
    'homeUsers', coalesce(people.home_users, 0),
    'homeActivationPercent', case when coalesce(people.students, 0) = 0 then 0 else round(100.0 * people.home_users / people.students, 1) end,
    'utilisationPercent', case when coalesce(licence.seat_limit, 0) = 0 then 0 else round(100.0 * people.students / licence.seat_limit, 1) end,
    'lastActive', activity.last_active, 'billingStatus', coalesce(licence.billing_status, 'free'),
    'licenceEndDate', licence.end_date,
    'attention', to_jsonb(array_remove(array[
      case when coalesce(people.school_admins, 0) = 0 and school.status <> 'archived' then 'No School Admin' end,
      case when coalesce(licence.seat_limit, 0) > 0 and 100.0 * coalesce(people.students, 0) / licence.seat_limit >= 90 then 'Seat Limit Nearly Full' end,
      case when licence.status = 'trial' then 'Trial' end,
      case when licence.status = 'paused' then 'Paused' end,
      case when licence.status = 'archived' then 'Archived' end,
      case when licence.end_date between current_date and current_date + 30 then 'Licence Ending Soon' end
    ]::text[], null))
  ) order by school.name), '[]'::jsonb) into v_result
  from public.schools school
  left join current_licence licence on licence.school_id = school.id
  left join people on people.school_id = school.id
  left join activity on activity.school_id = school.id;
  return v_result;
end;
$$;

revoke all on function public.platform_owner_provision_school(text,text,text,text,integer,integer,text,date,date,text,text,text,text) from public, anon;
revoke all on function public.platform_owner_update_school(uuid,text,text,text,text,text) from public, anon;
revoke all on function public.platform_owner_update_school_access(uuid,uuid,integer,date,date,text,text,text) from public, anon;
revoke all on function public.platform_owner_transition_school(uuid,text,text,text,date,date) from public, anon;
revoke all on function public.platform_owner_assign_school_admin(uuid,text,text) from public, anon;
revoke all on function public.platform_owner_manage_school_admin(uuid,text,uuid,uuid,text,boolean) from public, anon;
revoke all on function public.get_platform_admin_school_summaries_pa2() from public, anon;

-- PA2 is the sole lifecycle mutation surface. PA1's broad licence editor can
-- remain defined for migration history, but authenticated callers must not be
-- able to use it to bypass pause/archive/restore preservation rules.
revoke all on function public.platform_owner_update_school_licence(
  uuid, uuid, integer, text, date, date, text, text, text
) from authenticated;

grant execute on function public.platform_owner_provision_school(text,text,text,text,integer,integer,text,date,date,text,text,text,text) to authenticated;
grant execute on function public.platform_owner_update_school(uuid,text,text,text,text,text) to authenticated;
grant execute on function public.platform_owner_update_school_access(uuid,uuid,integer,date,date,text,text,text) to authenticated;
grant execute on function public.platform_owner_transition_school(uuid,text,text,text,date,date) to authenticated;
grant execute on function public.platform_owner_assign_school_admin(uuid,text,text) to authenticated;
grant execute on function public.platform_owner_manage_school_admin(uuid,text,uuid,uuid,text,boolean) to authenticated;
grant execute on function public.get_platform_admin_school_summaries_pa2() to authenticated;

commit;
