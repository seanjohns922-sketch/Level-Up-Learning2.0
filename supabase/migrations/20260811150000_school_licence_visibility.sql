begin;

-- School administrators can inspect the same canonical seat entitlement used
-- by Platform Admin. Allocation changes remain owner-only.
create or replace function public.get_school_licence_summaries(p_school_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.can_view_school_administration(p_school_id) then
    raise exception 'School administration access required' using errcode = '42501';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', licence.id,
        'academicYearId', licence.academic_year_id,
        'academicYear', year.name,
        'calendarYear', year.calendar_year,
        'status', licence.status,
        'seatLimit', licence.seat_limit,
        'used', usage.used,
        'available', greatest(licence.seat_limit - usage.used, 0),
        'utilisationPercent', case
          when licence.seat_limit = 0 then 0
          else round(100.0 * usage.used / licence.seat_limit, 1)
        end,
        'startDate', licence.start_date,
        'endDate', licence.end_date,
        'billingStatus', licence.billing_status
      )
      order by year.calendar_year desc
    ),
    '[]'::jsonb
  )
  into v_result
  from public.school_licence_entitlements licence
  join public.academic_years year
    on year.id = licence.academic_year_id
  cross join lateral (
    select count(distinct entitlement.student_id)::integer as used
    from public.student_access_entitlements entitlement
    where entitlement.school_id = licence.school_id
      and entitlement.academic_year_id = licence.academic_year_id
      and entitlement.access_source = 'school'
      and entitlement.status = 'active'
  ) usage
  where licence.school_id = p_school_id;

  return v_result;
end;
$$;

revoke all on function public.get_school_licence_summaries(uuid)
  from public, anon;
grant execute on function public.get_school_licence_summaries(uuid)
  to authenticated;

commit;
