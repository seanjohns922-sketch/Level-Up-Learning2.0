-- Platform Admin: licences by year, renewals for a new academic year, and licence pricing.
--
-- Adds three functions only; no tables, columns, policies or existing functions change.
-- * platform_owner_renew_school_licence  - creates a school's next academic year and its
--   licence (seats, dates, status, billing, price per seat, contract value), audited and
--   idempotent. Leaves earlier years, classes and history untouched.
-- * platform_owner_update_licence_pricing - sets price per seat and contract value on an
--   existing licence, audited.
-- * get_platform_admin_school_licences    - every licence a school holds, newest first, with
--   seats in use, so next year's licence is visible before it starts.
-- All three are security definer and refuse anyone who is not the platform owner.
-- Rollback: drop the three functions (statements at the end of this file).

begin;

create or replace function public.platform_owner_renew_school_licence(
  p_school_id uuid,
  p_calendar_year integer,
  p_seat_limit integer,
  p_status text,
  p_start_date date,
  p_end_date date,
  p_billing_status text,
  p_price_per_seat numeric default null,
  p_contract_value numeric default null,
  p_notes text default null,
  p_reason text default null,
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_school public.schools%rowtype;
  v_year_id uuid;
  v_licence public.school_licence_entitlements%rowtype;
  v_receipt public.platform_command_receipts%rowtype;
  v_result jsonb;
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access required' using errcode = '42501';
  end if;
  if p_calendar_year not between 2000 and 2100 then raise exception 'Academic year is invalid'; end if;
  if p_seat_limit is null or p_seat_limit < 0 then raise exception 'Seat limit cannot be negative'; end if;
  if p_status not in ('trial', 'active') then raise exception 'A licence must be Trial or Active'; end if;
  if p_billing_status not in ('free', 'trial', 'complimentary', 'paid', 'expired') then raise exception 'Invalid billing classification'; end if;
  if p_start_date is null or p_end_date is null then raise exception 'Start and end dates are required'; end if;
  if p_end_date < p_start_date then raise exception 'End date must follow start date'; end if;
  if p_price_per_seat is not null and p_price_per_seat < 0 then raise exception 'Price per seat cannot be negative'; end if;
  if p_contract_value is not null and p_contract_value < 0 then raise exception 'Contract value cannot be negative'; end if;
  if nullif(trim(coalesce(p_idempotency_key, '')), '') is null then raise exception 'An idempotency key is required'; end if;

  select * into v_receipt
  from public.platform_command_receipts receipt
  where receipt.actor_user_id = v_actor
    and receipt.command_name = 'platform_owner_renew_school_licence'
    and receipt.idempotency_key = trim(p_idempotency_key);
  if v_receipt.id is not null then return v_receipt.result; end if;

  select * into v_school from public.schools where id = p_school_id for update;
  if v_school.id is null then raise exception 'School not found'; end if;
  if v_school.status = 'archived' then raise exception 'Restore this school before adding a licence'; end if;

  select id into v_year_id
  from public.academic_years
  where school_id = p_school_id and calendar_year = p_calendar_year;

  if v_year_id is not null and exists (
    select 1 from public.school_licence_entitlements
    where school_id = p_school_id and academic_year_id = v_year_id
  ) then
    raise exception 'This school already has a % licence. Edit that licence instead.', p_calendar_year;
  end if;

  if v_year_id is null then
    insert into public.academic_years (school_id, name, calendar_year, starts_on, ends_on, status, created_by)
    values (p_school_id, p_calendar_year::text, p_calendar_year, p_start_date, p_end_date, 'active', v_actor)
    returning id into v_year_id;
  end if;

  insert into public.school_licence_entitlements (
    school_id, academic_year_id, status, seat_limit, start_date, end_date,
    billing_status, price_per_seat, contract_value, notes, created_by, updated_by
  ) values (
    p_school_id, v_year_id, p_status, p_seat_limit, p_start_date, p_end_date,
    p_billing_status, p_price_per_seat, p_contract_value,
    nullif(trim(coalesce(p_notes, '')), ''), v_actor, v_actor
  ) returning * into v_licence;

  v_result := jsonb_build_object(
    'schoolId', p_school_id, 'academicYearId', v_year_id, 'licenceId', v_licence.id,
    'calendarYear', p_calendar_year, 'seatLimit', p_seat_limit, 'status', p_status,
    'startDate', p_start_date, 'endDate', p_end_date, 'billingStatus', p_billing_status,
    'pricePerSeat', p_price_per_seat, 'contractValue', p_contract_value
  );

  insert into public.platform_command_receipts (actor_user_id, command_name, idempotency_key, result)
  values (v_actor, 'platform_owner_renew_school_licence', trim(p_idempotency_key), v_result);

  perform public.write_platform_admin_audit(
    'school_licence_renewed', 'school_licence', v_licence.id::text, null, to_jsonb(v_licence),
    coalesce(nullif(trim(coalesce(p_reason, '')), ''), format('Licence added for %s', p_calendar_year))
  );

  return v_result;
end;
$$;

create or replace function public.platform_owner_update_licence_pricing(
  p_school_id uuid,
  p_academic_year_id uuid,
  p_price_per_seat numeric,
  p_contract_value numeric,
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
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access required' using errcode = '42501';
  end if;
  if p_price_per_seat is not null and p_price_per_seat < 0 then raise exception 'Price per seat cannot be negative'; end if;
  if p_contract_value is not null and p_contract_value < 0 then raise exception 'Contract value cannot be negative'; end if;

  select * into v_before from public.school_licence_entitlements
  where school_id = p_school_id and academic_year_id = p_academic_year_id for update;
  if v_before.id is null then raise exception 'School licence not found'; end if;

  update public.school_licence_entitlements set
    price_per_seat = p_price_per_seat, contract_value = p_contract_value,
    updated_by = auth.uid(), updated_at = now()
  where id = v_before.id returning * into v_after;

  perform public.write_platform_admin_audit(
    'school_licence_pricing_changed', 'school_licence', v_after.id::text,
    to_jsonb(v_before), to_jsonb(v_after), nullif(trim(coalesce(p_reason, '')), '')
  );

  return jsonb_build_object('id', v_after.id, 'pricePerSeat', v_after.price_per_seat, 'contractValue', v_after.contract_value);
end;
$$;

create or replace function public.get_platform_admin_school_licences(p_school_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access required' using errcode = '42501';
  end if;

  return coalesce((
    select jsonb_agg(row_data order by (row_data->>'calendarYear')::integer desc)
    from (
      select jsonb_build_object(
        'licenceId', licence.id,
        'academicYearId', year.id,
        'academicYear', year.name,
        'calendarYear', year.calendar_year,
        'status', licence.status,
        'seatLimit', licence.seat_limit,
        'used', (
          select count(distinct entitlement.student_id)::integer
          from public.student_access_entitlements entitlement
          where entitlement.school_id = licence.school_id
            and entitlement.academic_year_id = licence.academic_year_id
            and entitlement.access_source = 'school'
            and entitlement.status = 'active'
        ),
        'startDate', licence.start_date,
        'endDate', licence.end_date,
        'billingStatus', licence.billing_status,
        'pricePerSeat', licence.price_per_seat,
        'contractValue', licence.contract_value,
        'notes', licence.notes
      ) as row_data
      from public.school_licence_entitlements licence
      join public.academic_years year on year.id = licence.academic_year_id
      where licence.school_id = p_school_id
    ) licences
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.platform_owner_renew_school_licence(uuid,integer,integer,text,date,date,text,numeric,numeric,text,text,text) from public, anon;
revoke all on function public.platform_owner_update_licence_pricing(uuid,uuid,numeric,numeric,text) from public, anon;
revoke all on function public.get_platform_admin_school_licences(uuid) from public, anon;
grant execute on function public.platform_owner_renew_school_licence(uuid,integer,integer,text,date,date,text,numeric,numeric,text,text,text) to authenticated;
grant execute on function public.platform_owner_update_licence_pricing(uuid,uuid,numeric,numeric,text) to authenticated;
grant execute on function public.get_platform_admin_school_licences(uuid) to authenticated;

commit;

-- Rollback:
-- drop function if exists public.platform_owner_renew_school_licence(uuid,integer,integer,text,date,date,text,numeric,numeric,text,text,text);
-- drop function if exists public.platform_owner_update_licence_pricing(uuid,uuid,numeric,numeric,text);
-- drop function if exists public.get_platform_admin_school_licences(uuid);
