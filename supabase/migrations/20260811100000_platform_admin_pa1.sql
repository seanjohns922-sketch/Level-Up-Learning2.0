begin;

-- PA1 keeps identity, access and commercial classification separate. Students,
-- enrolments, parent links and Explorer Codes remain the existing sources of
-- identity and relationship truth.

create or replace function public.is_platform_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_roles role
    join public.user_profiles profile on profile.user_id = role.user_id
    where role.user_id = auth.uid()
      and role.role = 'platform_owner'
      and role.status = 'active'
      and profile.status = 'active'
  );
$$;

revoke all on function public.is_platform_owner() from public, anon;
grant execute on function public.is_platform_owner() to authenticated;

create table if not exists public.school_licence_entitlements (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete restrict,
  academic_year_id uuid not null references public.academic_years(id) on delete restrict,
  status text not null default 'active'
    check (status in ('trial', 'active', 'paused', 'archived', 'expired')),
  seat_limit integer not null default 0 check (seat_limit >= 0),
  start_date date not null,
  end_date date not null,
  billing_status text not null default 'free'
    check (billing_status in ('free', 'trial', 'paid', 'complimentary', 'expired')),
  price_per_seat numeric(12, 2),
  contract_value numeric(14, 2),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date),
  check (price_per_seat is null or price_per_seat >= 0),
  check (contract_value is null or contract_value >= 0),
  unique (school_id, academic_year_id)
);

create table if not exists public.student_access_entitlements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  access_source text not null check (access_source in ('school', 'home')),
  school_id uuid references public.schools(id) on delete restrict,
  academic_year_id uuid references public.academic_years(id) on delete restrict,
  status text not null default 'active'
    check (status in ('active', 'paused', 'expired', 'revoked')),
  billing_status text not null default 'free'
    check (billing_status in ('free', 'trial', 'paid', 'complimentary', 'expired')),
  billing_provider text,
  subscription_reference text,
  billing_started_at timestamptz,
  billing_ended_at timestamptz,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  notes text,
  source_enrolment_id uuid references public.class_enrollments(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (access_source = 'school' and school_id is not null and academic_year_id is not null)
    or (access_source = 'home' and school_id is null and academic_year_id is null)
  ),
  check (ends_at is null or ends_at >= starts_at),
  check (
    (billing_status in ('free', 'complimentary') and billing_provider is null and subscription_reference is null)
    or billing_status in ('trial', 'paid', 'expired')
  )
);

create unique index if not exists student_access_one_school_year_idx
  on public.student_access_entitlements (student_id, school_id, academic_year_id)
  where access_source = 'school';
create unique index if not exists student_access_one_home_idx
  on public.student_access_entitlements (student_id)
  where access_source = 'home';
create index if not exists student_access_segment_idx
  on public.student_access_entitlements (access_source, status, billing_status, student_id);
create index if not exists student_access_school_idx
  on public.student_access_entitlements (school_id, academic_year_id, status);

create table if not exists public.platform_admin_audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_state jsonb,
  after_state jsonb,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists platform_admin_audit_created_idx
  on public.platform_admin_audit_log (created_at desc);
create index if not exists platform_admin_audit_entity_idx
  on public.platform_admin_audit_log (entity_type, entity_id, created_at desc);

alter table public.school_licence_entitlements enable row level security;
alter table public.student_access_entitlements enable row level security;
alter table public.platform_admin_audit_log enable row level security;

revoke all on public.school_licence_entitlements from public, anon, authenticated;
revoke all on public.student_access_entitlements from public, anon, authenticated;
revoke all on public.platform_admin_audit_log from public, anon, authenticated;

create or replace function public.reject_platform_audit_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'Platform audit records are immutable' using errcode = '42501';
end;
$$;

drop trigger if exists platform_admin_audit_immutable
  on public.platform_admin_audit_log;
create trigger platform_admin_audit_immutable
before update or delete on public.platform_admin_audit_log
for each row execute function public.reject_platform_audit_mutation();

-- Ensure every existing school has a current academic year without changing
-- historical class or enrolment records.
insert into public.academic_years (
  school_id, name, calendar_year, starts_on, ends_on, status, created_by
)
select
  school.id,
  extract(year from current_date)::integer::text,
  extract(year from current_date)::integer,
  make_date(extract(year from current_date)::integer, 1, 1),
  make_date(extract(year from current_date)::integer, 12, 31),
  'active',
  school.created_by
from public.schools school
on conflict (school_id, calendar_year) do nothing;

-- Existing schools are explicitly free for the 2026 rollout. The initial
-- limit preserves access and leaves room for manual owner allocation.
insert into public.school_licence_entitlements (
  school_id,
  academic_year_id,
  status,
  seat_limit,
  start_date,
  end_date,
  billing_status,
  notes,
  created_by
)
select
  year.school_id,
  year.id,
  case school.status
    when 'pending' then 'trial'
    when 'suspended' then 'paused'
    when 'archived' then 'archived'
    else 'active'
  end,
  greatest(
    1,
    coalesce((
      select count(distinct student.id)::integer
      from public.students student
      where student.school_id = school.id and student.archived_at is null
    ), 0)
  ),
  year.starts_on,
  year.ends_on,
  'free',
  '2026 free-access rollout migration',
  school.created_by
from public.academic_years year
join public.schools school on school.id = year.school_id
where year.calendar_year = extract(year from current_date)::integer
on conflict (school_id, academic_year_id) do nothing;

-- Materialise existing canonical school access. Home access is intentionally
-- not fabricated; it only exists when an explicit home entitlement is added.
insert into public.student_access_entitlements (
  student_id,
  access_source,
  school_id,
  academic_year_id,
  status,
  billing_status,
  starts_at,
  source_enrolment_id,
  created_by
)
select distinct on (enrolment.student_id, enrolment.school_id, enrolment.academic_year_id)
  enrolment.student_id,
  'school',
  enrolment.school_id,
  enrolment.academic_year_id,
  'active',
  'free',
  enrolment.enrolled_at,
  enrolment.id,
  enrolment.created_by
from public.class_enrollments enrolment
join public.students student on student.id = enrolment.student_id
where enrolment.status = 'active'
  and enrolment.ended_at is null
  and enrolment.school_id is not null
  and enrolment.academic_year_id is not null
  and student.archived_at is null
order by enrolment.student_id, enrolment.school_id, enrolment.academic_year_id,
  enrolment.is_primary desc, enrolment.enrolled_at desc
on conflict do nothing;

create or replace function public.sync_school_access_entitlement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_archived_at timestamptz;
  v_has_active_school_enrolment boolean;
  v_has_active_old_enrolment boolean;
  v_has_current_access boolean;
  v_current_used integer;
  v_licence public.school_licence_entitlements%rowtype;
  v_scope_changed boolean := false;
begin
  if tg_op = 'DELETE' then
    v_scope_changed := true;
  elsif tg_op = 'UPDATE' then
    v_scope_changed := new.school_id is distinct from old.school_id
      or new.academic_year_id is distinct from old.academic_year_id
      or new.student_id is distinct from old.student_id;
  end if;

  if v_scope_changed and old.school_id is not null and old.academic_year_id is not null then
    select exists (
      select 1
      from public.class_enrollments enrolment
      where enrolment.student_id = old.student_id
        and enrolment.school_id = old.school_id
        and enrolment.academic_year_id = old.academic_year_id
        and enrolment.status = 'active'
        and enrolment.ended_at is null
    ) into v_has_active_old_enrolment;

    if not v_has_active_old_enrolment then
      update public.student_access_entitlements
      set status = 'revoked', ends_at = coalesce(ends_at, now()),
          updated_by = auth.uid(), updated_at = now()
      where student_id = old.student_id
        and school_id = old.school_id
        and academic_year_id = old.academic_year_id
        and access_source = 'school';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  if new.school_id is null or new.academic_year_id is null then
    return new;
  end if;

  select archived_at into v_student_archived_at
  from public.students where id = new.student_id;

  select exists (
    select 1
    from public.class_enrollments enrolment
    where enrolment.student_id = new.student_id
      and enrolment.school_id = new.school_id
      and enrolment.academic_year_id = new.academic_year_id
      and enrolment.status = 'active'
      and enrolment.ended_at is null
  ) into v_has_active_school_enrolment;

  if v_has_active_school_enrolment and v_student_archived_at is null then
    select * into v_licence
    from public.school_licence_entitlements licence
    where licence.school_id = new.school_id
      and licence.academic_year_id = new.academic_year_id
    for update;

    if v_licence.id is null then
      raise exception 'No school seat entitlement exists for this academic year';
    end if;

    select exists (
      select 1
      from public.student_access_entitlements entitlement
      where entitlement.student_id = new.student_id
        and entitlement.school_id = new.school_id
        and entitlement.academic_year_id = new.academic_year_id
        and entitlement.access_source = 'school'
        and entitlement.status = 'active'
    ) into v_has_current_access;

    if not v_has_current_access then
      select count(distinct entitlement.student_id)::integer into v_current_used
      from public.student_access_entitlements entitlement
      join public.students active_student
        on active_student.id = entitlement.student_id
       and active_student.archived_at is null
      where entitlement.school_id = new.school_id
        and entitlement.academic_year_id = new.academic_year_id
        and entitlement.access_source = 'school'
        and entitlement.status = 'active'
        and entitlement.starts_at <= now()
        and (entitlement.ends_at is null or entitlement.ends_at >= now());

      if v_current_used >= v_licence.seat_limit then
        raise exception 'School seat entitlement reached. % of % seats are currently in use.',
          v_current_used, v_licence.seat_limit;
      end if;
    end if;
  end if;

  insert into public.student_access_entitlements (
    student_id, access_source, school_id, academic_year_id, status,
    billing_status, starts_at, ends_at, source_enrolment_id, created_by, updated_by
  ) values (
    new.student_id,
    'school',
    new.school_id,
    new.academic_year_id,
    case when v_has_active_school_enrolment
                   and v_student_archived_at is null then 'active' else 'revoked' end,
    'free',
    new.enrolled_at,
    case when v_has_active_school_enrolment
                   and v_student_archived_at is null then null else coalesce(new.ended_at, now()) end,
    new.id,
    coalesce(new.created_by, auth.uid()),
    auth.uid()
  )
  on conflict (student_id, school_id, academic_year_id)
    where access_source = 'school'
  do update set
    status = excluded.status,
    ends_at = excluded.ends_at,
    source_enrolment_id = excluded.source_enrolment_id,
    updated_by = excluded.updated_by,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists sync_school_access_from_enrolment on public.class_enrollments;
create trigger sync_school_access_from_enrolment
after insert or update of status, ended_at, school_id, academic_year_id, student_id
on public.class_enrollments
for each row execute function public.sync_school_access_entitlement();

drop trigger if exists sync_school_access_from_deleted_enrolment on public.class_enrollments;
create trigger sync_school_access_from_deleted_enrolment
after delete on public.class_enrollments
for each row execute function public.sync_school_access_entitlement();

create or replace function public.revoke_archived_student_access()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.archived_at is null and new.archived_at is not null then
    update public.student_access_entitlements
    set status = 'revoked', ends_at = coalesce(ends_at, now()),
        updated_by = auth.uid(), updated_at = now()
    where student_id = new.id and status = 'active';
  end if;
  return new;
end;
$$;

drop trigger if exists revoke_access_when_student_archived on public.students;
create trigger revoke_access_when_student_archived
after update of archived_at on public.students
for each row execute function public.revoke_archived_student_access();

create or replace function public.write_platform_admin_audit(
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_before_state jsonb default null,
  p_after_state jsonb default null,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access required' using errcode = '42501';
  end if;

  insert into public.platform_admin_audit_log (
    actor_user_id, action, entity_type, entity_id,
    before_state, after_state, reason
  ) values (
    auth.uid(), p_action, p_entity_type, p_entity_id,
    p_before_state, p_after_state, nullif(trim(coalesce(p_reason, '')), '')
  );
end;
$$;

revoke all on function public.write_platform_admin_audit(
  text, text, text, jsonb, jsonb, text
) from public, anon, authenticated;

create or replace function public.get_platform_admin_access_context()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case
    when public.is_platform_owner() then jsonb_build_object(
      'allowed', true,
      'userId', auth.uid(),
      'role', 'platform_owner',
      'displayName', coalesce(profile.display_name, profile.email, 'Platform Owner'),
      'email', profile.email
    )
    else jsonb_build_object('allowed', false)
  end
  from (select 1) seed
  left join public.user_profiles profile on profile.user_id = auth.uid();
$$;

revoke all on function public.get_platform_admin_access_context() from public, anon;
grant execute on function public.get_platform_admin_access_context() to authenticated;

create or replace function public.get_platform_admin_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access required' using errcode = '42501';
  end if;

  with active_access as (
    select
      entitlement.student_id,
      bool_or(entitlement.access_source = 'school') as school_access,
      bool_or(entitlement.access_source = 'home') as home_access,
      bool_or(entitlement.access_source = 'home' and entitlement.billing_status = 'free') as free_home
    from public.student_access_entitlements entitlement
    join public.students active_student
      on active_student.id = entitlement.student_id
     and active_student.archived_at is null
    left join public.school_licence_entitlements licence
      on licence.school_id = entitlement.school_id
     and licence.academic_year_id = entitlement.academic_year_id
    where entitlement.status = 'active'
      and entitlement.starts_at <= now()
      and (entitlement.ends_at is null or entitlement.ends_at >= now())
      and (
        entitlement.access_source = 'home'
        or (
          licence.status in ('trial', 'active')
          and licence.start_date <= current_date
          and licence.end_date >= current_date
        )
      )
    group by entitlement.student_id
  ),
  student_segments as (
    select
      student.id,
      coalesce(access.school_access, false) as school_access,
      coalesce(access.home_access, false) as home_access,
      coalesce(access.free_home, false) as free_home,
      exists (
        select 1 from public.parent_student_links link
        where link.student_id = student.id and link.status = 'active'
      ) as parent_linked
    from public.students student
    left join active_access access on access.student_id = student.id
  ),
  current_licences as (
    select licence.*
    from public.school_licence_entitlements licence
    join public.academic_years year on year.id = licence.academic_year_id
    where year.calendar_year = extract(year from current_date)::integer
  ),
  activity as (
    select count(distinct attempt.student_id)::integer as active_this_week
    from public.student_lesson_attempts attempt
    where attempt.completed_at >= date_trunc('week', now())
  )
  select jsonb_build_object(
    'schools', jsonb_build_object(
      'total', (select count(*) from public.schools),
      'active', (select count(*) from current_licences where status = 'active'),
      'trial', (select count(*) from current_licences where status = 'trial'),
      'paused', (select count(*) from current_licences where status = 'paused')
    ),
    'students', jsonb_build_object(
      'total', (select count(*) from student_segments),
      'schoolOnly', (select count(*) from student_segments where school_access and not home_access),
      'schoolAndHome', (select count(*) from student_segments where school_access and home_access),
      'homeOnly', (select count(*) from student_segments where home_access and not school_access),
      'inactive', (select count(*) from student_segments where not school_access and not home_access),
      'parentsLinked', (select count(*) from student_segments where parent_linked),
      'parentLinkedNoHome', (select count(*) from student_segments where parent_linked and not home_access),
      'freeHome', (select count(*) from student_segments where free_home)
    ),
    'people', jsonb_build_object(
      'educators', (select count(distinct membership.user_id) from public.school_memberships membership where membership.status = 'active'),
      'parents', (select count(distinct link.parent_user_id) from public.parent_student_links link where link.status = 'active')
    ),
    'seats', jsonb_build_object(
      'limit', (select coalesce(sum(seat_limit), 0) from current_licences where status in ('trial', 'active')),
      'used', (select count(*) from student_segments where school_access),
      'available', greatest(
        (select coalesce(sum(seat_limit), 0) from current_licences where status in ('trial', 'active'))
        - (select count(*) from student_segments where school_access), 0
      )
    ),
    'activity', jsonb_build_object(
      'activeThisWeek', (select active_this_week from activity)
    ),
    'generatedAt', now()
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_platform_admin_overview() from public, anon;
grant execute on function public.get_platform_admin_overview() to authenticated;

create or replace function public.get_platform_admin_school_summaries()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access required' using errcode = '42501';
  end if;

  with current_licence as (
    select distinct on (licence.school_id)
      licence.*, year.name as academic_year, year.calendar_year
    from public.school_licence_entitlements licence
    join public.academic_years year on year.id = licence.academic_year_id
    order by licence.school_id,
      (year.calendar_year = extract(year from current_date)::integer) desc,
      year.calendar_year desc
  ),
  school_students as (
    select entitlement.school_id, entitlement.student_id
    from public.student_access_entitlements entitlement
    join public.students active_student
      on active_student.id = entitlement.student_id
     and active_student.archived_at is null
    join current_licence licence
      on licence.school_id = entitlement.school_id
     and licence.academic_year_id = entitlement.academic_year_id
    where entitlement.access_source = 'school'
      and entitlement.status = 'active'
      and entitlement.starts_at <= now()
      and (entitlement.ends_at is null or entitlement.ends_at >= now())
      and licence.status in ('trial', 'active')
      and licence.start_date <= current_date
      and licence.end_date >= current_date
    group by entitlement.school_id, entitlement.student_id
  ),
  home_students as (
    select student_id
    from public.student_access_entitlements
    where access_source = 'home' and status = 'active'
      and starts_at <= now() and (ends_at is null or ends_at >= now())
  ),
  people as (
    select
      school.id as school_id,
      count(distinct school_student.student_id)::integer as students,
      count(distinct membership.user_id)::integer as educators,
      count(distinct link.parent_user_id)::integer as parents_linked,
      count(distinct home.student_id)::integer as home_users
    from public.schools school
    left join school_students school_student on school_student.school_id = school.id
    left join public.school_memberships membership
      on membership.school_id = school.id and membership.status = 'active'
    left join public.parent_student_links link
      on link.student_id = school_student.student_id and link.status = 'active'
    left join home_students home on home.student_id = school_student.student_id
    group by school.id
  ),
  activity as (
    select student.school_id, max(attempt.completed_at) as last_active
    from public.student_lesson_attempts attempt
    join public.students student on student.id = attempt.student_id
    group by student.school_id
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', school.id,
    'name', school.name,
    'code', school.school_code,
    'status', coalesce(licence.status, case school.status when 'pending' then 'trial' when 'suspended' then 'paused' else school.status end),
    'academicYear', licence.academic_year,
    'calendarYear', licence.calendar_year,
    'seatLimit', coalesce(licence.seat_limit, 0),
    'used', coalesce(people.students, 0),
    'available', greatest(coalesce(licence.seat_limit, 0) - coalesce(people.students, 0), 0),
    'students', coalesce(people.students, 0),
    'educators', coalesce(people.educators, 0),
    'parentsLinked', coalesce(people.parents_linked, 0),
    'homeUsers', coalesce(people.home_users, 0),
    'homeActivationPercent', case when coalesce(people.students, 0) = 0 then 0 else round(100.0 * people.home_users / people.students, 1) end,
    'utilisationPercent', case when coalesce(licence.seat_limit, 0) = 0 then 0 else round(100.0 * people.students / licence.seat_limit, 1) end,
    'lastActive', activity.last_active,
    'billingStatus', coalesce(licence.billing_status, 'free')
  ) order by school.name), '[]'::jsonb)
  into v_result
  from public.schools school
  left join current_licence licence on licence.school_id = school.id
  left join people on people.school_id = school.id
  left join activity on activity.school_id = school.id;

  return v_result;
end;
$$;

revoke all on function public.get_platform_admin_school_summaries() from public, anon;
grant execute on function public.get_platform_admin_school_summaries() to authenticated;

create or replace function public.get_platform_admin_school_detail(p_school_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access required' using errcode = '42501';
  end if;

  with licence as (
    select entitlement.*, year.name as academic_year, year.calendar_year
    from public.school_licence_entitlements entitlement
    join public.academic_years year on year.id = entitlement.academic_year_id
    where entitlement.school_id = p_school_id
    order by (year.calendar_year = extract(year from current_date)::integer) desc,
      year.calendar_year desc
    limit 1
  ),
  school_students as (
    select distinct entitlement.student_id
    from public.student_access_entitlements entitlement
    join public.students active_student
      on active_student.id = entitlement.student_id
     and active_student.archived_at is null
    join licence on licence.academic_year_id = entitlement.academic_year_id
    where entitlement.school_id = p_school_id
      and entitlement.access_source = 'school'
      and entitlement.status = 'active'
      and entitlement.starts_at <= now()
      and (entitlement.ends_at is null or entitlement.ends_at >= now())
      and licence.status in ('trial', 'active')
  ),
  segments as (
    select
      student.student_id,
      exists (
        select 1 from public.student_access_entitlements home
        where home.student_id = student.student_id
          and home.access_source = 'home' and home.status = 'active'
          and home.starts_at <= now() and (home.ends_at is null or home.ends_at >= now())
      ) as home_access,
      exists (
        select 1 from public.parent_student_links link
        where link.student_id = student.student_id and link.status = 'active'
      ) as parent_linked
    from school_students student
  ),
  activity as (
    select
      count(distinct attempt.student_id) filter (where attempt.completed_at >= current_date)::integer as active_today,
      count(distinct attempt.student_id) filter (where attempt.completed_at >= date_trunc('week', now()))::integer as active_this_week,
      count(*) filter (where attempt.completed_at >= date_trunc('week', now()))::integer as lessons_this_week,
      max(attempt.completed_at) as last_active
    from public.student_lesson_attempts attempt
    join public.students student on student.id = attempt.student_id
    where student.school_id = p_school_id
  ),
  quiz_activity as (
    select count(*)::integer as quizzes_this_week
    from public.student_weekly_quiz_attempts attempt
    join public.students student on student.id = attempt.student_id
    where student.school_id = p_school_id
      and attempt.completed_at >= date_trunc('week', now())
  ),
  assessment_activity as (
    select count(*)::integer as assessments_this_week
    from public.student_realm_assessments assessment
    join public.students student on student.id = assessment.student_id
    where student.school_id = p_school_id
      and assessment.completed_at >= date_trunc('week', now())
  )
  select jsonb_build_object(
    'school', jsonb_build_object(
      'id', school.id, 'name', school.name, 'code', school.school_code,
      'state', school.state, 'sector', school.sector,
      'status', coalesce(licence.status, school.status)
    ),
    'licence', jsonb_build_object(
      'id', licence.id, 'academicYearId', licence.academic_year_id,
      'academicYear', licence.academic_year, 'calendarYear', licence.calendar_year,
      'status', licence.status, 'seatLimit', licence.seat_limit,
      'used', (select count(*) from segments),
      'available', greatest(licence.seat_limit - (select count(*) from segments), 0),
      'utilisationPercent', case when licence.seat_limit = 0 then 0 else round(100.0 * (select count(*) from segments) / licence.seat_limit, 1) end,
      'startDate', licence.start_date, 'endDate', licence.end_date,
      'billingStatus', licence.billing_status, 'pricePerSeat', licence.price_per_seat,
      'contractValue', licence.contract_value, 'notes', licence.notes
    ),
    'people', jsonb_build_object(
      'students', (select count(*) from segments),
      'educators', (select count(distinct user_id) from public.school_memberships where school_id = p_school_id and status = 'active'),
      'schoolAdmins', (select count(distinct user_id) from public.school_memberships where school_id = p_school_id and status = 'active' and role in ('school_admin', 'principal')),
      'parentsLinked', (select count(*) from segments where parent_linked)
    ),
    'home', jsonb_build_object(
      'schoolOnly', (select count(*) from segments where not home_access),
      'schoolAndHome', (select count(*) from segments where home_access),
      'parentLinkedNoHome', (select count(*) from segments where parent_linked and not home_access),
      'freeHomeAccess', (select count(*) from segments segment where home_access and exists (
        select 1 from public.student_access_entitlements home
        where home.student_id = segment.student_id and home.access_source = 'home'
          and home.status = 'active' and home.billing_status = 'free'
      ))
    ),
    'activity', jsonb_build_object(
      'activeToday', activity.active_today,
      'activeThisWeek', activity.active_this_week,
      'lessonsThisWeek', activity.lessons_this_week,
      'quizzesThisWeek', quiz_activity.quizzes_this_week,
      'assessmentsThisWeek', assessment_activity.assessments_this_week,
      'lastActive', activity.last_active
    )
  ) into v_result
  from public.schools school
  left join licence on true
  cross join activity
  cross join quiz_activity
  cross join assessment_activity
  where school.id = p_school_id;

  if v_result is null then raise exception 'School not found'; end if;
  return v_result;
end;
$$;

revoke all on function public.get_platform_admin_school_detail(uuid) from public, anon;
grant execute on function public.get_platform_admin_school_detail(uuid) to authenticated;

create or replace function public.platform_owner_update_school_licence(
  p_school_id uuid,
  p_academic_year_id uuid,
  p_seat_limit integer,
  p_status text,
  p_start_date date,
  p_end_date date,
  p_billing_status text default 'free',
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
  if not public.is_platform_owner() then
    raise exception 'Platform owner access required' using errcode = '42501';
  end if;
  if p_seat_limit < 0 then raise exception 'Seat limit cannot be negative'; end if;
  if p_status not in ('trial', 'active', 'paused', 'archived', 'expired') then
    raise exception 'Invalid school access status';
  end if;
  if p_billing_status not in ('free', 'trial', 'paid', 'complimentary', 'expired') then
    raise exception 'Invalid billing status';
  end if;
  if p_end_date < p_start_date then raise exception 'End date must follow start date'; end if;

  select * into v_before
  from public.school_licence_entitlements
  where school_id = p_school_id and academic_year_id = p_academic_year_id
  for update;
  if v_before.id is null then raise exception 'School licence not found'; end if;

  select count(distinct entitlement.student_id)::integer into v_used
  from public.student_access_entitlements entitlement
  join public.students active_student
    on active_student.id = entitlement.student_id
   and active_student.archived_at is null
  where entitlement.school_id = p_school_id
    and entitlement.academic_year_id = p_academic_year_id
    and entitlement.access_source = 'school'
    and entitlement.status = 'active'
    and entitlement.starts_at <= now()
    and (entitlement.ends_at is null or entitlement.ends_at >= now());

  if p_seat_limit < v_used then
    raise exception 'Cannot reduce this school''s seat entitlement to %. % active students currently use school access.', p_seat_limit, v_used;
  end if;

  update public.school_licence_entitlements
  set seat_limit = p_seat_limit,
      status = p_status,
      start_date = p_start_date,
      end_date = p_end_date,
      billing_status = p_billing_status,
      notes = nullif(trim(coalesce(p_notes, '')), ''),
      updated_by = auth.uid(),
      updated_at = now()
  where id = v_before.id
  returning * into v_after;

  update public.schools
  set status = case p_status
      when 'trial' then 'pending'
      when 'paused' then 'suspended'
      when 'expired' then 'suspended'
      else p_status
    end,
    updated_at = now()
  where id = p_school_id;

  perform public.write_platform_admin_audit(
    case
      when v_before.status is distinct from v_after.status and v_after.status = 'archived' then 'school_archived'
      when v_before.seat_limit is distinct from v_after.seat_limit then 'school_seat_limit_changed'
      when v_before.status is distinct from v_after.status then 'school_status_changed'
      when v_before.start_date is distinct from v_after.start_date
        or v_before.end_date is distinct from v_after.end_date then 'school_dates_changed'
      when v_before.billing_status is distinct from v_after.billing_status then 'school_billing_state_changed'
      else 'school_licence_updated'
    end,
    'school_licence', v_after.id::text,
    to_jsonb(v_before), to_jsonb(v_after), p_reason
  );

  return jsonb_build_object(
    'id', v_after.id, 'seatLimit', v_after.seat_limit,
    'status', v_after.status, 'billingStatus', v_after.billing_status,
    'used', v_used, 'available', v_after.seat_limit - v_used
  );
end;
$$;

revoke all on function public.platform_owner_update_school_licence(
  uuid, uuid, integer, text, date, date, text, text, text
) from public, anon;
grant execute on function public.platform_owner_update_school_licence(
  uuid, uuid, integer, text, date, date, text, text, text
) to authenticated;

create or replace function public.platform_owner_create_school(
  p_name text,
  p_school_code text,
  p_calendar_year integer,
  p_seat_limit integer,
  p_status text default 'trial',
  p_start_date date default null,
  p_end_date date default null,
  p_notes text default null,
  p_idempotency_key text default null
)
returns uuid
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
  v_receipt public.platform_command_receipts%rowtype;
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access required' using errcode = '42501';
  end if;
  if nullif(trim(coalesce(p_name, '')), '') is null then raise exception 'School name is required'; end if;
  if upper(trim(coalesce(p_school_code, ''))) !~ '^[A-Z0-9]{5,16}$' then
    raise exception 'School code must contain 5 to 16 letters or numbers';
  end if;
  if p_calendar_year not between 2000 and 2100 then raise exception 'Academic year is invalid'; end if;
  if p_seat_limit < 0 then raise exception 'Seat limit cannot be negative'; end if;
  if p_status not in ('trial', 'active', 'paused', 'archived') then raise exception 'Invalid school status'; end if;
  if nullif(trim(coalesce(p_idempotency_key, '')), '') is null then raise exception 'An idempotency key is required'; end if;

  select * into v_receipt from public.platform_command_receipts receipt
  where receipt.actor_user_id = v_actor
    and receipt.command_name = 'platform_owner_create_school'
    and receipt.idempotency_key = trim(p_idempotency_key);
  if v_receipt.id is not null then return (v_receipt.result->>'school_id')::uuid; end if;

  insert into public.schools (name, school_code, status, created_by, activated_at, activated_by)
  values (
    trim(p_name), upper(trim(p_school_code)),
    case p_status when 'trial' then 'pending' when 'paused' then 'suspended' else p_status end,
    v_actor,
    case when p_status = 'active' then now() else null end,
    case when p_status = 'active' then v_actor else null end
  ) returning id into v_school_id;

  insert into public.academic_years (
    school_id, name, calendar_year, starts_on, ends_on, status, created_by
  ) values (
    v_school_id, p_calendar_year::text, p_calendar_year, v_start, v_end,
    case when p_status in ('trial', 'active') then 'active' else 'planned' end,
    v_actor
  ) returning id into v_year_id;

  insert into public.school_licence_entitlements (
    school_id, academic_year_id, status, seat_limit, start_date, end_date,
    billing_status, notes, created_by, updated_by
  ) values (
    v_school_id, v_year_id, p_status, p_seat_limit, v_start, v_end,
    'free', nullif(trim(coalesce(p_notes, '')), ''), v_actor, v_actor
  );

  insert into public.platform_command_receipts (
    actor_user_id, command_name, idempotency_key, result
  ) values (
    v_actor, 'platform_owner_create_school', trim(p_idempotency_key),
    jsonb_build_object('school_id', v_school_id)
  );

  perform public.write_platform_admin_audit(
    'school_created', 'school', v_school_id::text, null,
    jsonb_build_object(
      'name', trim(p_name), 'schoolCode', upper(trim(p_school_code)),
      'status', p_status, 'academicYear', p_calendar_year,
      'seatLimit', p_seat_limit, 'billingStatus', 'free'
    ),
    'Platform Admin school creation'
  );

  return v_school_id;
end;
$$;

revoke all on function public.platform_owner_create_school(
  text, text, integer, integer, text, date, date, text, text
) from public, anon;
grant execute on function public.platform_owner_create_school(
  text, text, integer, integer, text, date, date, text, text
) to authenticated;

create or replace function public.get_platform_admin_audit(p_limit integer default 100)
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
  return (
    select coalesce(jsonb_agg(to_jsonb(entry) order by entry.created_at desc), '[]'::jsonb)
    from (
      select audit.id, audit.actor_user_id as "actorUserId", audit.action,
        audit.entity_type as "entityType", audit.entity_id as "entityId",
        audit.before_state as "beforeState", audit.after_state as "afterState",
        audit.reason, audit.created_at as "createdAt"
      from public.platform_admin_audit_log audit
      order by audit.created_at desc
      limit least(greatest(coalesce(p_limit, 100), 1), 500)
    ) entry
  );
end;
$$;

revoke all on function public.get_platform_admin_audit(integer) from public, anon;
grant execute on function public.get_platform_admin_audit(integer) to authenticated;

commit;
