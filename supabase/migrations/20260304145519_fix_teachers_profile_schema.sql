-- Align teachers table to auth.users-based profile shape for MVP
create table if not exists public.teachers (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.teachers add column if not exists email text;
alter table public.teachers add column if not exists display_name text;
alter table public.teachers add column if not exists created_at timestamptz not null default now();

-- Backfill display_name from legacy name column when present
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'teachers'
      and column_name = 'name'
  ) then
    execute '
      update public.teachers
      set display_name = coalesce(display_name, name)
      where display_name is null
    ';
  end if;
end
$$;

-- MVP/demo mode: disable RLS on teachers to avoid profile-read deadlocks
alter table public.teachers disable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.teachers to authenticated;

-- Backfill teachers rows from auth users
insert into public.teachers (id, email, display_name)
select id, email, coalesce(raw_user_meta_data->>'display_name', email)
from auth.users
on conflict (id) do update
set email = excluded.email,
    display_name = excluded.display_name;

-- Auto-create teacher profile rows for future auth users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.teachers (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
