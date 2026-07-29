begin;

-- Phase 2A establishes the school tenant boundary without removing the
-- compatibility columns still used by the current teacher dashboard.

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  status text not null default 'active'
    check (status in ('pending', 'active', 'suspended', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null
    check (role in ('platform_owner', 'platform_admin', 'platform_support')),
  status text not null default 'active'
    check (status in ('active', 'revoked')),
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (user_id, role)
);

insert into public.user_profiles (user_id, email, display_name)
select
  u.id,
  u.email,
  coalesce(nullif(trim(u.raw_user_meta_data->>'display_name'), ''), u.email)
from auth.users u
on conflict (user_id) do update set
  email = excluded.email,
  display_name = coalesce(public.user_profiles.display_name, excluded.display_name),
  updated_at = now();

-- Preserve the legacy teachers bootstrap while creating the canonical profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (
    user_id, email, display_name
  ) values (
    new.id,
    new.email,
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), new.email)
  )
  on conflict (user_id) do update set
    email = excluded.email,
    display_name = coalesce(public.user_profiles.display_name, excluded.display_name),
    updated_at = now();

  if coalesce(new.raw_user_meta_data->>'role', 'teacher') = 'teacher' then
    insert into public.teachers (id, email, display_name)
    values (
      new.id,
      new.email,
      coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), new.email)
    )
    on conflict (id) do update set
      email = excluded.email,
      display_name = coalesce(public.teachers.display_name, excluded.display_name);
  end if;

  return new;
end;
$$;

alter table public.schools
  drop constraint if exists schools_status_check;
alter table public.schools
  add constraint schools_status_check
  check (status in ('pending', 'active', 'suspended', 'archived'));

alter table public.schools
  add column if not exists activated_at timestamptz,
  add column if not exists activated_by uuid references auth.users(id) on delete set null;

update public.schools
set activated_at = coalesce(activated_at, created_at)
where status = 'active';

alter table public.school_memberships
  drop constraint if exists school_memberships_role_check;
alter table public.school_memberships
  drop constraint if exists school_memberships_status_check;
alter table public.school_memberships
  add constraint school_memberships_role_check
  check (role in ('school_admin', 'principal', 'teacher', 'support_staff')),
  add constraint school_memberships_status_check
  check (status in ('invited', 'active', 'inactive', 'revoked'));

alter table public.school_memberships
  add column if not exists permissions jsonb not null default '{}'::jsonb,
  add column if not exists invited_by uuid references auth.users(id) on delete set null,
  add column if not exists accepted_at timestamptz,
  add column if not exists ended_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

update public.school_memberships
set accepted_at = coalesce(accepted_at, created_at)
where status = 'active';

create table if not exists public.school_invitations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  email text not null,
  role text not null
    check (role in ('school_admin', 'principal', 'teacher', 'support_staff')),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'expired', 'revoked')),
  token_hash text not null unique,
  idempotency_key text,
  invited_by uuid not null references auth.users(id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (school_id, idempotency_key)
);

create table if not exists public.academic_years (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  calendar_year integer not null check (calendar_year between 2000 and 2100),
  starts_on date not null,
  ends_on date not null,
  status text not null default 'planned'
    check (status in ('planned', 'active', 'closed', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  unique (school_id, calendar_year)
);

insert into public.academic_years (
  school_id, name, calendar_year, starts_on, ends_on, status, created_by
)
select distinct
  c.school_id,
  coalesce(c.academic_year, extract(year from current_date)::integer)::text,
  coalesce(c.academic_year, extract(year from current_date)::integer),
  make_date(coalesce(c.academic_year, extract(year from current_date)::integer), 1, 1),
  make_date(coalesce(c.academic_year, extract(year from current_date)::integer), 12, 31),
  case
    when coalesce(c.academic_year, extract(year from current_date)::integer)
      = extract(year from current_date)::integer then 'active'
    else 'closed'
  end,
  c.created_by
from public.classes c
where c.school_id is not null
on conflict (school_id, calendar_year) do nothing;

alter table public.classes
  add column if not exists academic_year_id uuid
    references public.academic_years(id) on delete restrict;

update public.classes c
set academic_year_id = ay.id
from public.academic_years ay
where c.academic_year_id is null
  and ay.school_id = c.school_id
  and ay.calendar_year = coalesce(
    c.academic_year,
    extract(year from c.created_at)::integer,
    extract(year from current_date)::integer
  );

alter table public.students
  add column if not exists school_id uuid
    references public.schools(id) on delete restrict;

update public.students s
set school_id = c.school_id
from public.classes c
where s.school_id is null
  and c.id = s.class_id
  and c.school_id is not null;

create table if not exists public.class_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  ended_at timestamptz,
  status text not null default 'active',
  unique (student_id, class_id)
);

alter table public.class_enrollments
  add column if not exists school_id uuid
    references public.schools(id) on delete restrict,
  add column if not exists academic_year_id uuid
    references public.academic_years(id) on delete restrict,
  add column if not exists is_primary boolean not null default false,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

update public.class_enrollments ce
set
  school_id = c.school_id,
  academic_year_id = c.academic_year_id,
  is_primary = (s.class_id = ce.class_id),
  updated_at = now()
from public.classes c
cross join public.students s
where c.id = ce.class_id
  and s.id = ce.student_id
  and (
    ce.school_id is distinct from c.school_id
    or ce.academic_year_id is distinct from c.academic_year_id
    or (s.class_id = ce.class_id and not ce.is_primary)
  );

create unique index if not exists class_enrollments_one_primary_per_year_idx
on public.class_enrollments (student_id, academic_year_id)
where status = 'active' and ended_at is null and is_primary and academic_year_id is not null;

create table if not exists public.class_staff_memberships (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null
    check (role in ('lead_teacher', 'teacher', 'support_staff', 'viewer')),
  status text not null default 'active'
    check (status in ('active', 'inactive', 'revoked')),
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  ended_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (class_id, user_id)
);

insert into public.class_staff_memberships (
  class_id, school_id, user_id, role, status, assigned_by
)
select
  c.id,
  c.school_id,
  c.teacher_id,
  'lead_teacher',
  'active',
  coalesce(c.created_by, c.teacher_id)
from public.classes c
where c.school_id is not null
  and c.teacher_id is not null
on conflict (class_id, user_id) do update set
  school_id = excluded.school_id,
  role = case
    when public.class_staff_memberships.role = 'lead_teacher'
      then public.class_staff_memberships.role
    else excluded.role
  end,
  status = 'active',
  ended_at = null,
  updated_at = now();

create table if not exists public.student_staff_assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'support_staff'
    check (role in ('support_staff', 'viewer')),
  status text not null default 'active'
    check (status in ('active', 'inactive', 'revoked')),
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  ended_at timestamptz,
  unique (student_id, user_id)
);

create table if not exists public.school_audit_log (
  id bigint generated always as identity primary key,
  school_id uuid references public.schools(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  previous_state jsonb,
  new_state jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists platform_roles_user_idx
  on public.platform_roles(user_id) where status = 'active';
create index if not exists school_invitations_school_idx
  on public.school_invitations(school_id, status);
create index if not exists academic_years_school_idx
  on public.academic_years(school_id, status);
create index if not exists classes_academic_year_idx
  on public.classes(academic_year_id);
create index if not exists students_school_idx
  on public.students(school_id);
create index if not exists class_enrollments_school_idx
  on public.class_enrollments(school_id, status);
create index if not exists class_staff_user_idx
  on public.class_staff_memberships(user_id, status);
create index if not exists student_staff_user_idx
  on public.student_staff_assignments(user_id, status);
create index if not exists school_audit_school_idx
  on public.school_audit_log(school_id, created_at desc);

-- SECURITY DEFINER helpers deliberately query tenancy tables directly to avoid
-- policy recursion. Platform support is not an administrator and receives no
-- implicit school access.
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_roles pr
    where pr.user_id = auth.uid()
      and pr.status = 'active'
      and pr.role in ('platform_owner', 'platform_admin')
  );
$$;

create or replace function public.has_school_role(
  p_school_id uuid,
  p_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.school_memberships sm
    join public.schools s on s.id = sm.school_id
    where sm.school_id = p_school_id
      and sm.user_id = auth.uid()
      and sm.status = 'active'
      and sm.role = any(coalesce(p_roles, '{}'::text[]))
      and s.status = 'active'
  );
$$;

create or replace function public.can_view_school(p_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin()
    or public.has_school_role(
      p_school_id,
      array['school_admin', 'principal', 'teacher', 'support_staff']
    );
$$;

create or replace function public.can_manage_school(p_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin()
    or public.has_school_role(p_school_id, array['school_admin']);
$$;

create or replace function public.can_view_class(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.classes c
    where c.id = p_class_id
      and (
        public.is_platform_admin()
        or (
          c.school_id is not null
          and c.status = 'active'
          and (
            public.has_school_role(
              c.school_id,
              array['school_admin', 'principal', 'teacher']
            )
            or exists (
              select 1
              from public.class_staff_memberships csm
              join public.school_memberships sm
                on sm.school_id = csm.school_id
               and sm.user_id = csm.user_id
              where csm.class_id = c.id
                and csm.user_id = auth.uid()
                and csm.status = 'active'
                and sm.status = 'active'
            )
          )
        )
        or (
          c.school_id is null
          and c.teacher_id = auth.uid()
        )
      )
  );
$$;

create or replace function public.can_manage_class(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.classes c
    where c.id = p_class_id
      and (
        public.is_platform_admin()
        or (
          c.school_id is not null
          and public.can_manage_school(c.school_id)
        )
        or exists (
          select 1
          from public.class_staff_memberships csm
          join public.school_memberships sm
            on sm.school_id = csm.school_id
           and sm.user_id = csm.user_id
          where csm.class_id = c.id
            and csm.user_id = auth.uid()
            and csm.status = 'active'
            and csm.role in ('lead_teacher', 'teacher')
            and sm.status = 'active'
        )
        or (
          c.school_id is null
          and c.teacher_id = auth.uid()
        )
      )
  );
$$;

create or replace function public.can_view_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.students s
    where s.id = p_student_id
      and (
        public.is_platform_admin()
        or (
          s.school_id is not null
          and public.has_school_role(
            s.school_id,
            array['school_admin', 'principal']
          )
        )
        or exists (
          select 1
          from public.class_enrollments ce
          join public.class_staff_memberships csm
            on csm.class_id = ce.class_id
           and csm.user_id = auth.uid()
           and csm.status = 'active'
          join public.school_memberships sm
            on sm.school_id = csm.school_id
           and sm.user_id = csm.user_id
           and sm.status = 'active'
          where ce.student_id = s.id
            and ce.status = 'active'
            and ce.ended_at is null
        )
        or exists (
          select 1
          from public.student_staff_assignments ssa
          join public.school_memberships sm
            on sm.school_id = ssa.school_id
           and sm.user_id = ssa.user_id
           and sm.status = 'active'
          where ssa.student_id = s.id
            and ssa.user_id = auth.uid()
            and ssa.status = 'active'
        )
      )
  );
$$;

create or replace function public.can_manage_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.students s
    where s.id = p_student_id
      and (
        public.is_platform_admin()
        or (
          s.school_id is not null
          and public.can_manage_school(s.school_id)
        )
        or exists (
          select 1
          from public.class_enrollments ce
          where ce.student_id = s.id
            and ce.status = 'active'
            and ce.ended_at is null
            and public.can_manage_class(ce.class_id)
        )
      )
  );
$$;

create or replace function public.can_view_student_learning(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.can_view_student(p_student_id);
$$;

create or replace function public.can_override_student_progress(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.can_manage_student(p_student_id);
$$;

create or replace function public.can_create_school_student(p_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.can_manage_school(p_school_id)
    or exists (
      select 1
      from public.school_memberships sm
      where sm.school_id = p_school_id
        and sm.user_id = auth.uid()
        and sm.status = 'active'
        and sm.role = 'teacher'
        and coalesce((sm.permissions->>'can_create_students')::boolean, false)
    );
$$;

-- Keep legacy helper names aligned with the canonical checks.
create or replace function public.is_school_member(target_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.can_view_school(target_school_id);
$$;

create or replace function public.can_manage_student_progress(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.can_override_student_progress(p_student_id);
$$;

-- Parents may read linked legacy summaries, but may never write progression.
drop policy if exists "Parents can update linked progress" on public.progress;
drop policy if exists "Parents can insert linked progress" on public.progress;

-- Legacy profile/role tables remain as compatibility projections only. They
-- must not provide a second self-service authorisation path.
alter table public.teachers enable row level security;
drop policy if exists "Teachers can insert own data" on public.teachers;
drop policy if exists "Teachers can read own data" on public.teachers;
drop policy if exists "Teachers can update own data" on public.teachers;
create policy "Educators can insert own legacy profile"
on public.teachers for insert to authenticated
with check (id = auth.uid());
create policy "Educators can read own legacy profile"
on public.teachers for select to authenticated
using (id = auth.uid() or public.is_platform_admin());
create policy "Educators can update own legacy profile"
on public.teachers for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());
revoke delete on public.teachers from authenticated;

do $$
begin
  if to_regclass('public.user_roles') is not null then
    execute 'drop policy if exists "Users can insert own role" on public.user_roles';
    execute 'revoke insert, update, delete on public.user_roles from authenticated';
  end if;
end;
$$;

alter table public.user_profiles enable row level security;
alter table public.platform_roles enable row level security;
alter table public.school_invitations enable row level security;
alter table public.academic_years enable row level security;
alter table public.class_staff_memberships enable row level security;
alter table public.student_staff_assignments enable row level security;
alter table public.school_audit_log enable row level security;

drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
on public.user_profiles for select to authenticated
using (user_id = auth.uid() or public.is_platform_admin());

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
on public.user_profiles for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Platform admins can read platform roles" on public.platform_roles;
create policy "Platform admins can read platform roles"
on public.platform_roles for select to authenticated
using (user_id = auth.uid() or public.is_platform_admin());

drop policy if exists "School members can read schools" on public.schools;
create policy "School members can read schools"
on public.schools for select to authenticated
using (public.can_view_school(id));

drop policy if exists "Users can read own school memberships" on public.school_memberships;
create policy "School viewers can read memberships"
on public.school_memberships for select to authenticated
using (
  user_id = auth.uid()
  or public.has_school_role(school_id, array['school_admin', 'principal'])
  or public.is_platform_admin()
);

drop policy if exists "School managers can read invitations" on public.school_invitations;
create policy "School managers can read invitations"
on public.school_invitations for select to authenticated
using (public.can_manage_school(school_id));

drop policy if exists "School members can read academic years" on public.academic_years;
create policy "School members can read academic years"
on public.academic_years for select to authenticated
using (public.can_view_school(school_id));

drop policy if exists "School managers can manage academic years" on public.academic_years;
create policy "School managers can manage academic years"
on public.academic_years for all to authenticated
using (public.can_manage_school(school_id))
with check (public.can_manage_school(school_id));

drop policy if exists "Anyone can lookup class by code" on public.classes;
drop policy if exists "Teachers can read own classes" on public.classes;
drop policy if exists "Teachers can insert own classes" on public.classes;
drop policy if exists "Teachers can update own classes" on public.classes;
drop policy if exists "Students can read own class" on public.classes;

create policy "Authorised users can read classes"
on public.classes for select to authenticated
using (public.can_view_class(id));

create policy "Authorised users can insert classes"
on public.classes for insert to authenticated
with check (
  school_id is not null
  and (
    public.can_manage_school(school_id)
    or (
      teacher_id = auth.uid()
      and public.has_school_role(school_id, array['teacher'])
    )
  )
);

create policy "Class managers can update classes"
on public.classes for update to authenticated
using (public.can_manage_class(id))
with check (public.can_manage_class(id));

drop policy if exists "Teachers can manage class enrollments" on public.class_enrollments;
create policy "Authorised users can read class enrollments"
on public.class_enrollments for select to authenticated
using (
  public.can_view_class(class_id)
  or public.can_view_student(student_id)
);

create policy "Class managers can insert class enrollments"
on public.class_enrollments for insert to authenticated
with check (
  public.can_manage_class(class_id)
  and school_id = (select c.school_id from public.classes c where c.id = class_id)
  and school_id = (select s.school_id from public.students s where s.id = student_id)
);

create policy "Class managers can update class enrollments"
on public.class_enrollments for update to authenticated
using (public.can_manage_class(class_id))
with check (
  public.can_manage_class(class_id)
  and school_id = (select c.school_id from public.classes c where c.id = class_id)
);

drop policy if exists "School staff can read class staffing" on public.class_staff_memberships;
create policy "School staff can read class staffing"
on public.class_staff_memberships for select to authenticated
using (public.can_view_class(class_id));

drop policy if exists "School managers can read student staffing" on public.student_staff_assignments;
create policy "School managers can read student staffing"
on public.student_staff_assignments for select to authenticated
using (
  user_id = auth.uid()
  or public.can_manage_school(school_id)
  or public.can_view_student(student_id)
);

drop policy if exists "Teachers can read class students" on public.students;
drop policy if exists "Teachers can update class students" on public.students;
drop policy if exists "Teachers can insert class students" on public.students;
drop policy if exists "Students can insert own data" on public.students;

create policy "Authorised staff can read students"
on public.students for select to authenticated
using (public.can_view_student(id));

create policy "Authorised staff can create students"
on public.students for insert to authenticated
with check (
  school_id is not null
  and public.can_create_school_student(school_id)
);

create policy "Authorised staff can update students"
on public.students for update to authenticated
using (public.can_manage_student(id))
with check (public.can_manage_student(id));

drop policy if exists "School staff can read legacy progress" on public.progress;
create policy "School staff can read legacy progress"
on public.progress for select to authenticated
using (public.can_view_student_learning(student_id));

drop policy if exists "School staff can read realm progress"
  on public.student_realm_progress;
create policy "School staff can read realm progress"
on public.student_realm_progress for select to authenticated
using (public.can_view_student_learning(student_id));

drop policy if exists "School staff can read lesson attempts"
  on public.student_lesson_attempts;
create policy "School staff can read lesson attempts"
on public.student_lesson_attempts for select to authenticated
using (public.can_view_student_learning(student_id));

drop policy if exists "School staff can read weekly quiz attempts"
  on public.student_weekly_quiz_attempts;
create policy "School staff can read weekly quiz attempts"
on public.student_weekly_quiz_attempts for select to authenticated
using (public.can_view_student_learning(student_id));

drop policy if exists "School staff can read realm assessments"
  on public.student_realm_assessments;
create policy "School staff can read realm assessments"
on public.student_realm_assessments for select to authenticated
using (public.can_view_student_learning(student_id));

drop policy if exists "Teachers can read student progress overrides"
  on public.student_progress_overrides;
create policy "School staff can read student progress overrides"
on public.student_progress_overrides for select to authenticated
using (public.can_view_student_learning(student_id));

drop policy if exists "School staff can read teacher realm actions"
  on public.teacher_realm_actions;
create policy "School staff can read teacher realm actions"
on public.teacher_realm_actions for select to authenticated
using (public.can_view_student_learning(student_id));

drop policy if exists "School managers can read audit log" on public.school_audit_log;
create policy "School managers can read audit log"
on public.school_audit_log for select to authenticated
using (
  public.is_platform_admin()
  or (school_id is not null and public.can_manage_school(school_id))
);

revoke all on public.platform_roles from public, anon, authenticated;
revoke all on public.school_invitations from public, anon, authenticated;
revoke all on public.class_staff_memberships from public, anon, authenticated;
revoke all on public.student_staff_assignments from public, anon, authenticated;
revoke all on public.school_audit_log from public, anon, authenticated;

grant select on public.user_profiles to authenticated;
grant update (display_name) on public.user_profiles to authenticated;
grant select on public.platform_roles to authenticated;
grant select on public.school_invitations to authenticated;
grant select, insert, update on public.academic_years to authenticated;
grant select on public.class_staff_memberships to authenticated;
grant select on public.student_staff_assignments to authenticated;
grant select on public.school_audit_log to authenticated;
grant select, insert, update on public.class_enrollments to authenticated;
grant select on public.student_realm_progress to authenticated;
grant select on public.student_lesson_attempts to authenticated;
grant select on public.student_weekly_quiz_attempts to authenticated;
grant select on public.student_realm_assessments to authenticated;
grant select on public.student_progress_overrides to authenticated;
grant select on public.teacher_realm_actions to authenticated;

revoke all on function public.is_platform_admin() from public, anon;
revoke all on function public.has_school_role(uuid, text[]) from public, anon;
revoke all on function public.can_view_school(uuid) from public, anon;
revoke all on function public.can_manage_school(uuid) from public, anon;
revoke all on function public.can_view_class(uuid) from public, anon;
revoke all on function public.can_manage_class(uuid) from public, anon;
revoke all on function public.can_view_student(uuid) from public, anon;
revoke all on function public.can_manage_student(uuid) from public, anon;
revoke all on function public.can_view_student_learning(uuid) from public, anon;
revoke all on function public.can_override_student_progress(uuid) from public, anon;
revoke all on function public.can_create_school_student(uuid) from public, anon;
revoke all on function public.can_manage_student_progress(uuid) from public, anon;

grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.has_school_role(uuid, text[]) to authenticated;
grant execute on function public.can_view_school(uuid) to authenticated;
grant execute on function public.can_manage_school(uuid) to authenticated;
grant execute on function public.can_view_class(uuid) to authenticated;
grant execute on function public.can_manage_class(uuid) to authenticated;
grant execute on function public.can_view_student(uuid) to authenticated;
grant execute on function public.can_manage_student(uuid) to authenticated;
grant execute on function public.can_view_student_learning(uuid) to authenticated;
grant execute on function public.can_override_student_progress(uuid) to authenticated;
grant execute on function public.can_create_school_student(uuid) to authenticated;
grant execute on function public.can_manage_student_progress(uuid) to authenticated;

commit;
