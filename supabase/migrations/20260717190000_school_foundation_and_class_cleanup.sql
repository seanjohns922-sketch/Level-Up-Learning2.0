begin;

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  school_code text not null unique,
  state text,
  sector text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.school_memberships (
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('school_admin', 'teacher', 'support_staff')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  primary key (school_id, user_id)
);

alter table public.classes
  add column if not exists school_id uuid references public.schools(id) on delete set null,
  add column if not exists academic_year integer,
  add column if not exists status text not null default 'active',
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists year_levels text[];

alter table public.students
  add column if not exists username text;

create index if not exists classes_school_id_idx on public.classes(school_id);
create index if not exists school_memberships_user_id_idx on public.school_memberships(user_id);

-- Give every existing teacher a stable default school, then attach their classes.
insert into public.schools (name, school_code, created_by)
select
  coalesce(nullif(trim(t.display_name), ''), split_part(t.email, '@', 1), 'Level Up') || ' School',
  'SCH' || upper(substr(md5(t.id::text), 1, 7)),
  t.id
from public.teachers t
where exists (select 1 from public.classes c where c.teacher_id = t.id)
on conflict (school_code) do nothing;

insert into public.school_memberships (school_id, user_id, role)
select s.id, t.id, 'school_admin'
from public.teachers t
join public.schools s on s.school_code = 'SCH' || upper(substr(md5(t.id::text), 1, 7))
where exists (select 1 from public.classes c where c.teacher_id = t.id)
on conflict (school_id, user_id) do update set status = 'active';

update public.classes c
set
  school_id = coalesce(c.school_id, s.id),
  academic_year = coalesce(c.academic_year, extract(year from current_date)::integer),
  status = case when c.archived_at is null then 'active' else 'archived' end,
  created_by = coalesce(c.created_by, c.teacher_id)
from public.schools s
where s.school_code = 'SCH' || upper(substr(md5(c.teacher_id::text), 1, 7));

alter table public.schools enable row level security;
alter table public.school_memberships enable row level security;

create or replace function public.is_school_member(target_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.school_memberships sm
    where sm.school_id = target_school_id
      and sm.user_id = auth.uid()
      and sm.status = 'active'
  );
$$;

drop policy if exists "School members can read schools" on public.schools;
create policy "School members can read schools"
on public.schools for select to authenticated
using (public.is_school_member(id));

drop policy if exists "Users can read own school memberships" on public.school_memberships;
create policy "Users can read own school memberships"
on public.school_memberships for select to authenticated
using (user_id = auth.uid());

grant select on public.schools to authenticated;
grant select on public.school_memberships to authenticated;

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
  teacher_id uuid := auth.uid();
  selected_school_id uuid;
  clean_school_name text := nullif(trim(p_school_name), '');
  generated_school_code text;
  new_class_id uuid;
begin
  if teacher_id is null then
    raise exception 'Login required';
  end if;
  if nullif(trim(p_name), '') is null then
    raise exception 'Class name is required';
  end if;
  if nullif(trim(p_class_code), '') is null then
    raise exception 'Class code is required';
  end if;
  if clean_school_name is null then
    raise exception 'School name is required';
  end if;
  if p_academic_year not between 2000 and 2100 then
    raise exception 'Academic year is invalid';
  end if;

  select s.id into selected_school_id
  from public.schools s
  join public.school_memberships sm on sm.school_id = s.id
  where sm.user_id = teacher_id
    and sm.status = 'active'
    and lower(trim(s.name)) = lower(clean_school_name)
  order by sm.created_at
  limit 1;

  if selected_school_id is null then
    loop
      generated_school_code := 'SCH' || upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 7));
      exit when not exists (select 1 from public.schools where school_code = generated_school_code);
    end loop;

    insert into public.schools (name, school_code, created_by)
    values (clean_school_name, generated_school_code, teacher_id)
    returning id into selected_school_id;

    insert into public.school_memberships (school_id, user_id, role)
    values (selected_school_id, teacher_id, 'school_admin');
  end if;

  insert into public.classes (
    name,
    class_code,
    teacher_id,
    year_levels,
    school_id,
    academic_year,
    status,
    created_by
  ) values (
    trim(p_name),
    upper(trim(p_class_code)),
    teacher_id,
    coalesce(p_year_levels, '{}'::text[]),
    selected_school_id,
    p_academic_year,
    'active',
    teacher_id
  ) returning id into new_class_id;

  return query select new_class_id, selected_school_id;
end;
$$;

grant execute on function public.create_class_for_teacher(text, text, text[], text, integer) to authenticated;

-- Student login accepts either the flexible Username / Student ID field or the
-- legacy display name, preserving existing accounts while enabling school IDs.
drop function if exists public.student_login_lookup(uuid, text, text);
create function public.student_login_lookup(
  p_class_id uuid,
  p_display_name text,
  p_pin text
)
returns table(
  student_id uuid,
  display_name text,
  first_name text,
  last_name text,
  username text,
  class_id uuid,
  school_year_level text,
  working_level text,
  year_level text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.id,
    s.display_name,
    s.first_name,
    s.last_name,
    s.username,
    s.class_id,
    s.school_year_level,
    s.working_level,
    s.year_level
  from public.students s
  where s.class_id = p_class_id
    and s.archived_at is null
    and s.pin = trim(p_pin)
    and (
      lower(trim(coalesce(s.username, ''))) = lower(trim(p_display_name))
      or lower(trim(s.display_name)) = lower(trim(p_display_name))
    )
  limit 1;
$$;

grant execute on function public.student_login_lookup(uuid, text, text) to anon, authenticated;

commit;
