begin;

-- A school's current school year. Set by "Make <year> current" in Administration.
-- When it has never been set, the current year is this calendar year (Melbourne
-- time), else the next year the school has set up, else its latest year, so a
-- forgotten switch still turns over on 1 January.
-- Installation changes no data: no school has a current year set yet.
alter table public.schools
  add column if not exists current_academic_year_id uuid
    references public.academic_years(id) on delete set null;

create or replace function public.school_current_academic_year_id(p_school_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  with this_year as (select extract(year from now() at time zone 'Australia/Melbourne')::integer as y)
  select coalesce(
    (select s.current_academic_year_id from schools s
      join academic_years ay on ay.id = s.current_academic_year_id and ay.school_id = s.id
      where s.id = p_school_id),
    (select ay.id from academic_years ay, this_year where ay.school_id = p_school_id and ay.calendar_year = this_year.y and ay.status <> 'archived' limit 1),
    (select ay.id from academic_years ay, this_year where ay.school_id = p_school_id and ay.calendar_year > this_year.y and ay.status <> 'archived' order by ay.calendar_year limit 1),
    (select ay.id from academic_years ay where ay.school_id = p_school_id and ay.status <> 'archived' order by ay.calendar_year desc limit 1)
  );
$$;
revoke all on function public.school_current_academic_year_id(uuid) from public, anon, authenticated;

-- Every school year with whether it is current, open for new classes, licensed,
-- and how many classes and enrolled students it has.
create or replace function public.get_school_years(p_school_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_current uuid;
begin
  if auth.uid() is null or not public.can_view_school(p_school_id) then
    raise exception 'School access denied' using errcode = '42501';
  end if;
  v_current := public.school_current_academic_year_id(p_school_id);
  return jsonb_build_object(
    'currentYear', (select calendar_year from academic_years where id = v_current),
    'thisYear', extract(year from now() at time zone 'Australia/Melbourne')::integer,
    'years', coalesce((select jsonb_agg(jsonb_build_object(
      'id', ay.id,
      'calendarYear', ay.calendar_year,
      'status', ay.status,
      'current', ay.id = v_current,
      'hasLicence', exists (select 1 from school_licence_entitlements l where l.academic_year_id = ay.id and l.school_id = p_school_id and l.status in ('trial', 'active')),
      'classes', (select count(*) from classes c where c.academic_year_id = ay.id and c.school_id = p_school_id and c.status = 'active'),
      'students', (select count(distinct e.student_id) from class_enrollments e where e.academic_year_id = ay.id and e.school_id = p_school_id and e.status = 'active' and e.ended_at is null)
    ) order by ay.calendar_year) from academic_years ay where ay.school_id = p_school_id and ay.status <> 'archived'), '[]'::jsonb)
  );
end;
$$;

-- Makes one school year current. Earlier years close to new classes; later years
-- stay open for planning. Choosing an earlier year again undoes it. Nobody's access,
-- class places or results change.
create or replace function public.make_school_year_current(p_school_id uuid, p_calendar_year integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year academic_years%rowtype;
  v_previous integer;
begin
  if auth.uid() is null or not public.can_manage_school(p_school_id) then
    raise exception 'School management access denied' using errcode = '42501';
  end if;
  perform 1 from schools where id = p_school_id and status = 'active' for no key update;
  if not found then raise exception 'School is not active'; end if;
  select * into v_year from academic_years
  where school_id = p_school_id and calendar_year = p_calendar_year and status <> 'archived';
  if v_year.id is null then
    raise exception 'This school has no % school year yet. Ask RELIQ to add a % licence.', p_calendar_year, p_calendar_year;
  end if;
  if not exists (select 1 from school_licence_entitlements l where l.academic_year_id = v_year.id and l.school_id = p_school_id and l.status in ('trial', 'active')) then
    raise exception 'This school has no % licence yet. Ask RELIQ to add one first.', p_calendar_year;
  end if;
  select calendar_year into v_previous from academic_years where id = public.school_current_academic_year_id(p_school_id);

  update schools set current_academic_year_id = v_year.id where id = p_school_id;
  update academic_years set
    status = case when calendar_year < p_calendar_year then 'closed' when calendar_year = p_calendar_year then 'active' else 'planned' end,
    updated_at = now()
  where school_id = p_school_id and status in ('planned', 'active', 'closed');

  perform public.write_school_audit(p_school_id, 'school_year_made_current', 'school', p_school_id::text,
    jsonb_build_object('currentYear', v_previous), jsonb_build_object('currentYear', p_calendar_year), '{}'::jsonb);
  return public.get_school_years(p_school_id);
end;
$$;

revoke all on function public.get_school_years(uuid), public.make_school_year_current(uuid, integer) from public, anon;
grant execute on function public.get_school_years(uuid), public.make_school_year_current(uuid, integer) to authenticated;

commit;
