-- Focus Mode: a teacher can pin a whole class to a single realm for a window
-- (e.g. "Number focus for 2 weeks") and flip a "Class in session" switch. The
-- lock only bites while the switch is engaged AND we are inside the window, so
-- at home in the evening students still roam every realm freely.
--
-- One active focus row per class. Placement/enforcement is server-computed here
-- (students never self-unlock): the student-facing RPC only READS the lock that
-- the teacher-controlled row implies. Same security posture as the rest of the
-- anonymous-student surface (SECURITY DEFINER + assert_student_read).

begin;

create table if not exists public.class_realm_focus (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  -- canonical realm id (e.g. 'number', 'measurement', 'space', 'statistics').
  focus_realm_id text not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,               -- window end (the "2 weeks"); null = open.
  engaged boolean not null default false, -- the teacher "Class in session" switch.
  engaged_at timestamptz,
  created_by uuid,                   -- teacher/staff auth user id.
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  released_at timestamptz            -- set when the focus is cleared/ended.
);

-- At most one live focus per class.
create unique index if not exists class_realm_focus_active_class_idx
  on public.class_realm_focus (class_id)
  where released_at is null;

alter table public.class_realm_focus enable row level security;

-- Authorised staff manage focus for classes they can manage; students never
-- touch the table directly (their reads go through the SECURITY DEFINER RPC).
drop policy if exists "Authorised staff can read class focus" on public.class_realm_focus;
create policy "Authorised staff can read class focus"
on public.class_realm_focus for select to authenticated
using (public.can_view_class(class_id));

drop policy if exists "Authorised staff can manage class focus" on public.class_realm_focus;
create policy "Authorised staff can manage class focus"
on public.class_realm_focus for all to authenticated
using (public.can_manage_class(class_id))
with check (public.can_manage_class(class_id));

revoke all on public.class_realm_focus from anon;
grant select, insert, update on public.class_realm_focus to authenticated;

-- Shape one focus row as jsonb for the RPCs below.
create or replace function public.class_realm_focus_json(rec public.class_realm_focus)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'class_id', rec.class_id,
    'focus_realm_id', rec.focus_realm_id,
    'starts_at', rec.starts_at,
    'ends_at', rec.ends_at,
    'engaged', rec.engaged,
    'engaged_at', rec.engaged_at,
    'updated_at', rec.updated_at
  );
$$;

-- Teacher: set (or change) the class focus realm + window. Keeps the current
-- "engaged" state so a teacher can swap the realm mid-lesson without unlocking.
create or replace function public.set_class_focus(
  p_class_id uuid,
  p_focus_realm_id text,
  p_ends_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.class_realm_focus;
begin
  if not public.can_manage_class(p_class_id) then
    raise exception 'Class management access denied' using errcode = '42501';
  end if;
  if coalesce(btrim(p_focus_realm_id), '') = '' then
    raise exception 'A focus realm is required' using errcode = '22023';
  end if;

  update public.class_realm_focus
  set focus_realm_id = p_focus_realm_id,
      ends_at = p_ends_at,
      updated_at = now()
  where class_id = p_class_id
    and released_at is null
  returning * into result;

  if not found then
    insert into public.class_realm_focus (class_id, focus_realm_id, ends_at, created_by)
    values (p_class_id, p_focus_realm_id, p_ends_at, public.get_teacher_id())
    returning * into result;
  end if;

  return public.class_realm_focus_json(result);
end;
$$;

-- Teacher: flip the "Class in session" switch. Requires a focus to be set.
create or replace function public.set_class_engaged(
  p_class_id uuid,
  p_engaged boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.class_realm_focus;
begin
  if not public.can_manage_class(p_class_id) then
    raise exception 'Class management access denied' using errcode = '42501';
  end if;

  update public.class_realm_focus
  set engaged = p_engaged,
      engaged_at = case when p_engaged then now() else engaged_at end,
      updated_at = now()
  where class_id = p_class_id
    and released_at is null
  returning * into result;

  if not found then
    raise exception 'No active class focus to engage' using errcode = 'P0002';
  end if;

  return public.class_realm_focus_json(result);
end;
$$;

-- Teacher: clear the focus entirely (unlocks the class).
create or replace function public.clear_class_focus(p_class_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_manage_class(p_class_id) then
    raise exception 'Class management access denied' using errcode = '42501';
  end if;

  update public.class_realm_focus
  set released_at = now(),
      engaged = false,
      updated_at = now()
  where class_id = p_class_id
    and released_at is null;

  return true;
end;
$$;

-- Teacher/staff: read the class's current focus config (any engaged state) so
-- the teacher UI can render the toggle and window.
create or replace function public.get_class_focus(p_class_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.class_realm_focus;
begin
  if not public.can_view_class(p_class_id) then
    raise exception 'Class view access denied' using errcode = '42501';
  end if;

  select * into result
  from public.class_realm_focus
  where class_id = p_class_id
    and released_at is null
  limit 1;

  if not found then
    return null;
  end if;

  return public.class_realm_focus_json(result);
end;
$$;

-- Student: resolve the ACTIVE lock only. Returns the focus realm just when the
-- teacher has engaged the switch AND we are inside the window; otherwise null
-- (free roam). Students cannot self-unlock: engaged/window are teacher-written.
create or replace function public.get_student_focus_lock(p_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
  result public.class_realm_focus;
begin
  perform public.assert_student_read(p_student_id);

  select class_id into v_class_id
  from public.students
  where id = p_student_id
    and archived_at is null;

  if v_class_id is null then
    return null;
  end if;

  select * into result
  from public.class_realm_focus
  where class_id = v_class_id
    and released_at is null
    and engaged = true
    and starts_at <= now()
    and (ends_at is null or ends_at >= now())
  limit 1;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'focus_realm_id', result.focus_realm_id,
    'ends_at', result.ends_at,
    'active', true
  );
end;
$$;

revoke all on function public.set_class_focus(uuid, text, timestamptz) from public, anon;
revoke all on function public.set_class_engaged(uuid, boolean) from public, anon;
revoke all on function public.clear_class_focus(uuid) from public, anon;
revoke all on function public.get_class_focus(uuid) from public, anon;
revoke all on function public.get_student_focus_lock(uuid) from public;

grant execute on function public.set_class_focus(uuid, text, timestamptz) to authenticated;
grant execute on function public.set_class_engaged(uuid, boolean) to authenticated;
grant execute on function public.clear_class_focus(uuid) to authenticated;
grant execute on function public.get_class_focus(uuid) to authenticated;
grant execute on function public.get_student_focus_lock(uuid) to anon, authenticated;

commit;
