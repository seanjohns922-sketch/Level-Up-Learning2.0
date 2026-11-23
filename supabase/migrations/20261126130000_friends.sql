-- Friends (agreed with Sean 2026-11-23): explorers add each other with a friend code, visit each other's
-- worlds, and an owner can let a friend help build (full edit rights while in). No chat. Teachers can
-- switch friends (and friend building) off for a class; parents for their child.
--
-- Friend codes are separate from explorer codes on purpose: an explorer code plus PIN links a parent
-- account, so kids never share it. A friend code only sends friend requests and can be replaced.
--
-- Schema (new): student_friend_codes, student_friendships, student_world_visitor_changes; columns
-- classes.friends_enabled / classes.friend_building_enabled and students.friends_enabled /
-- students.friend_building_enabled (all default true). New tables have RLS on, no policies and no
-- table grants: they are reached only through the functions below.
-- Functions (students: own session or teacher, granted to anon + authenticated):
--   get_friends_secure, new_friend_code_secure, send_friend_request_secure, respond_friend_request_secure,
--   remove_friend_secure, set_friend_can_build_secure, get_friend_world_secure, save_friend_world_secure,
--   get_world_visitor_changes_secure, resolve_world_visitor_change_secure.
-- Adults (authenticated only): set_class_friends_secure (manages the class); set_child_friends_secure and
-- get_child_friends_secure (a parent linked to the child).
-- Data: none changed. Rollback: drop the functions above and the three tables, and the four columns.

begin;

alter table public.classes add column if not exists friends_enabled boolean not null default true;
alter table public.classes add column if not exists friend_building_enabled boolean not null default true;
alter table public.students add column if not exists friends_enabled boolean not null default true;
alter table public.students add column if not exists friend_building_enabled boolean not null default true;

create table if not exists public.student_friend_codes (
  student_id uuid primary key references public.students(id) on delete cascade,
  code text not null unique check (code ~ '^PAL-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$'),
  created_at timestamptz not null default now()
);

-- One row per pair (low id first). `*_lets_*_build` is each owner's switch for the other.
create table if not exists public.student_friendships (
  id uuid primary key default gen_random_uuid(),
  student_low uuid not null references public.students(id) on delete cascade,
  student_high uuid not null references public.students(id) on delete cascade,
  requested_by uuid not null references public.students(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  low_lets_high_build boolean not null default false,
  high_lets_low_build boolean not null default false,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  check (student_low < student_high),
  unique (student_low, student_high)
);
create index if not exists student_friendships_high_idx on public.student_friendships(student_high);

-- What a friend changed in someone's world, until the owner keeps or undoes it.
create table if not exists public.student_world_visitor_changes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.students(id) on delete cascade,
  helper_id uuid not null references public.students(id) on delete cascade,
  before_placements jsonb not null,
  before_ground_tiles jsonb not null,
  after_placements jsonb not null,
  after_ground_tiles jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);
create unique index if not exists student_world_visitor_changes_open on public.student_world_visitor_changes(owner_id, helper_id) where resolved_at is null;

alter table public.student_friend_codes enable row level security;
alter table public.student_friendships enable row level security;
alter table public.student_world_visitor_changes enable row level security;
revoke all on public.student_friend_codes, public.student_friendships, public.student_world_visitor_changes from public, anon, authenticated;

-- Helpers (not granted). ---------------------------------------------------------------------------

/** Friends are on for a student when their class (if any) and their own setting both allow it. */
create or replace function public.friends_allowed(p_student_id uuid, p_building boolean default false)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select s.friends_enabled and coalesce(c.friends_enabled, true)
      and (not p_building or (s.friend_building_enabled and coalesce(c.friend_building_enabled, true)))
    from public.students s left join public.classes c on c.id = s.class_id
    where s.id = p_student_id and s.archived_at is null
  ), false);
$$;
revoke all on function public.friends_allowed(uuid, boolean) from public, anon, authenticated;

/** A short first-name-style label for a friend (never surnames or usernames). */
create or replace function public.friend_label(p_student_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(nullif(trim(s.first_name), ''), split_part(trim(coalesce(s.display_name, 'Explorer')), ' ', 1))
  from public.students s where s.id = p_student_id;
$$;
revoke all on function public.friend_label(uuid) from public, anon, authenticated;

create or replace function public.make_friend_code(p_student_id uuid)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  candidate text;
begin
  loop
    candidate := 'PAL-' || (select string_agg(substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1), '') from generate_series(1, 4));
    begin
      insert into public.student_friend_codes(student_id, code) values (p_student_id, candidate)
      on conflict (student_id) do update set code = excluded.code, created_at = now();
      return candidate;
    exception when unique_violation then
      -- someone else has that code: try another
    end;
  end loop;
end;
$$;
revoke all on function public.make_friend_code(uuid) from public, anon, authenticated;

/** The friendship between two students, or null. */
create or replace function public.friendship_between(p_a uuid, p_b uuid)
returns public.student_friendships
language sql
stable
security definer
set search_path = public
as $$
  select * from public.student_friendships where student_low = least(p_a, p_b) and student_high = greatest(p_a, p_b);
$$;
revoke all on function public.friendship_between(uuid, uuid) from public, anon, authenticated;

/** Whether `p_helper` may build in `p_owner`'s world right now. */
create or replace function public.friend_can_build(p_owner uuid, p_helper uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select f.status = 'accepted'
      and case when f.student_low = p_owner then f.low_lets_high_build else f.high_lets_low_build end
    from public.student_friendships f
    where f.student_low = least(p_owner, p_helper) and f.student_high = greatest(p_owner, p_helper)
  ), false) and public.friends_allowed(p_owner, true) and public.friends_allowed(p_helper, true);
$$;
revoke all on function public.friend_can_build(uuid, uuid) from public, anon, authenticated;

-- Students. -----------------------------------------------------------------------------------------

create or replace function public.get_friends_secure(p_student_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  my_code text;
begin
  perform public.assert_student_write(p_student_id);
  select code into my_code from public.student_friend_codes where student_id = p_student_id;
  if my_code is null then my_code := public.make_friend_code(p_student_id); end if;
  return jsonb_build_object(
    'code', my_code,
    'enabled', public.friends_allowed(p_student_id),
    'buildingEnabled', public.friends_allowed(p_student_id, true),
    'friends', coalesce((
      select jsonb_agg(jsonb_build_object(
        'friendshipId', f.id,
        'studentId', other.id,
        'name', public.friend_label(other.id),
        'status', case when f.status = 'accepted' then 'friend' when f.requested_by = p_student_id then 'outgoing' else 'incoming' end,
        'theyCanBuild', case when f.student_low = p_student_id then f.low_lets_high_build else f.high_lets_low_build end,
        'iCanBuild', case when f.student_low = p_student_id then f.high_lets_low_build else f.low_lets_high_build end
      ) order by f.status desc, public.friend_label(other.id))
      from public.student_friendships f
      join public.students other on other.id = case when f.student_low = p_student_id then f.student_high else f.student_low end
      where (f.student_low = p_student_id or f.student_high = p_student_id) and other.archived_at is null
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.new_friend_code_secure(p_student_id uuid)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_student_write(p_student_id);
  return public.make_friend_code(p_student_id);
end;
$$;

/** Sends a request by friend code. Returns sent | accepted | already | not_found | self | off. */
create or replace function public.send_friend_request_secure(p_student_id uuid, p_code text)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  other uuid;
  existing public.student_friendships;
begin
  perform public.assert_student_write(p_student_id);
  if not public.friends_allowed(p_student_id) then return 'off'; end if;
  select student_id into other from public.student_friend_codes
  where code = upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g'));
  if other is null or not exists (select 1 from public.students where id = other and archived_at is null) then return 'not_found'; end if;
  if other = p_student_id then return 'self'; end if;
  if not public.friends_allowed(other) then return 'not_found'; end if;
  existing := public.friendship_between(p_student_id, other);
  if existing.id is not null then
    if existing.status = 'accepted' then return 'already'; end if;
    if existing.requested_by = other then
      -- They asked first: asking back is saying yes.
      update public.student_friendships set status = 'accepted', accepted_at = now() where id = existing.id;
      return 'accepted';
    end if;
    return 'already';
  end if;
  if (select count(*) from public.student_friendships where (student_low = p_student_id or student_high = p_student_id)) >= 100 then
    return 'off';
  end if;
  insert into public.student_friendships(student_low, student_high, requested_by)
  values (least(p_student_id, other), greatest(p_student_id, other), p_student_id);
  return 'sent';
end;
$$;

create or replace function public.respond_friend_request_secure(p_student_id uuid, p_friendship_id uuid, p_accept boolean)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_student_write(p_student_id);
  if p_accept then
    update public.student_friendships set status = 'accepted', accepted_at = now()
    where id = p_friendship_id and status = 'pending' and requested_by <> p_student_id
      and (student_low = p_student_id or student_high = p_student_id);
  else
    delete from public.student_friendships
    where id = p_friendship_id and status = 'pending' and (student_low = p_student_id or student_high = p_student_id);
  end if;
  return found;
end;
$$;

create or replace function public.remove_friend_secure(p_student_id uuid, p_friendship_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_student_write(p_student_id);
  delete from public.student_friendships where id = p_friendship_id and (student_low = p_student_id or student_high = p_student_id);
  return found;
end;
$$;

/** The owner's switch: may this friend help build in my world? */
create or replace function public.set_friend_can_build_secure(p_student_id uuid, p_friendship_id uuid, p_can_build boolean)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_student_write(p_student_id);
  update public.student_friendships
  set low_lets_high_build = case when student_low = p_student_id then p_can_build else low_lets_high_build end,
      high_lets_low_build = case when student_high = p_student_id then p_can_build else high_lets_low_build end
  where id = p_friendship_id and status = 'accepted' and (student_low = p_student_id or student_high = p_student_id);
  return found;
end;
$$;

/** A friend's world to visit: their layout, the items they own (for levels and building), and whether I may build. */
create or replace function public.get_friend_world_secure(p_student_id uuid, p_friend_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  layout public.student_world_layouts%rowtype;
begin
  perform public.assert_student_write(p_student_id);
  if (public.friendship_between(p_student_id, p_friend_id)).status is distinct from 'accepted'
    or not public.friends_allowed(p_student_id) or not public.friends_allowed(p_friend_id) then
    raise exception 'Not friends' using errcode = '42501';
  end if;
  select * into layout from public.student_world_layouts where student_id = p_friend_id;
  return jsonb_build_object(
    'name', public.friend_label(p_friend_id),
    'placements', coalesce(layout.placements, '[]'::jsonb),
    'groundTiles', coalesce(layout.ground_tiles, '[]'::jsonb),
    'revision', coalesce(layout.revision, 0),
    'canBuild', public.friend_can_build(p_friend_id, p_student_id),
    'owned', coalesce((select jsonb_agg(item_key) from public.student_inventory where student_id = p_friend_id), '[]'::jsonb)
  );
end;
$$;

/** A friend who may build saves the world; the owner's change summary keeps the world as it was first. */
create or replace function public.save_friend_world_secure(p_student_id uuid, p_friend_id uuid, p_placements jsonb, p_ground_tiles jsonb)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  current_layout public.student_world_layouts%rowtype;
begin
  perform public.assert_student_write(p_student_id);
  if not public.friend_can_build(p_friend_id, p_student_id) then
    raise exception 'Not allowed to build here' using errcode = '42501';
  end if;
  if jsonb_typeof(p_placements) is distinct from 'array' or jsonb_typeof(p_ground_tiles) is distinct from 'array'
    or jsonb_array_length(p_placements) > 3000 or jsonb_array_length(p_ground_tiles) > 5000
    or pg_column_size(p_placements) + pg_column_size(p_ground_tiles) > 1048576 then
    raise exception 'World layout is not valid' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtext(p_friend_id::text), hashtext('world'));
  select * into current_layout from public.student_world_layouts where student_id = p_friend_id;
  insert into public.student_world_visitor_changes(owner_id, helper_id, before_placements, before_ground_tiles, after_placements, after_ground_tiles)
  values (p_friend_id, p_student_id, coalesce(current_layout.placements, '[]'::jsonb), coalesce(current_layout.ground_tiles, '[]'::jsonb), p_placements, p_ground_tiles)
  on conflict (owner_id, helper_id) where resolved_at is null
  do update set after_placements = excluded.after_placements, after_ground_tiles = excluded.after_ground_tiles, updated_at = now();
  insert into public.student_world_layouts(student_id, placements, ground_tiles)
  values (p_friend_id, p_placements, p_ground_tiles)
  on conflict (student_id) do update
    set placements = excluded.placements, ground_tiles = excluded.ground_tiles,
        revision = public.student_world_layouts.revision + 1, updated_at = now();
  return true;
end;
$$;

/** What friends changed in my world that I haven't kept or undone yet. */
create or replace function public.get_world_visitor_changes_secure(p_student_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_student_write(p_student_id);
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', v.id, 'helperName', public.friend_label(v.helper_id), 'at', v.updated_at,
      'beforePlacements', v.before_placements, 'beforeGroundTiles', v.before_ground_tiles,
      'afterPlacements', v.after_placements, 'afterGroundTiles', v.after_ground_tiles
    ) order by v.updated_at)
    from public.student_world_visitor_changes v
    where v.owner_id = p_student_id and v.resolved_at is null
  ), '[]'::jsonb);
end;
$$;

/** The owner kept (or undid, by saving the reverted world themselves) a friend's changes. */
create or replace function public.resolve_world_visitor_change_secure(p_student_id uuid, p_change_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_student_write(p_student_id);
  update public.student_world_visitor_changes set resolved_at = now()
  where id = p_change_id and owner_id = p_student_id and resolved_at is null;
  return found;
end;
$$;

-- Adults. -------------------------------------------------------------------------------------------

create or replace function public.set_class_friends_secure(p_class_id uuid, p_enabled boolean, p_building boolean)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if not public.can_manage_class(p_class_id) then raise exception 'Class access required' using errcode = '42501'; end if;
  update public.classes set friends_enabled = p_enabled, friend_building_enabled = p_building where id = p_class_id;
  return found;
end;
$$;

create or replace function public.set_child_friends_secure(p_student_id uuid, p_enabled boolean, p_building boolean)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_parent_role();
  if not exists (select 1 from public.parent_student_links l where l.parent_user_id = auth.uid() and l.student_id = p_student_id and l.status = 'active') then
    raise exception 'Parent access required' using errcode = '42501';
  end if;
  update public.students set friends_enabled = p_enabled, friend_building_enabled = p_building where id = p_student_id;
  return found;
end;
$$;

/** A parent reads their child's friends settings (for the switches on the child's page). */
create or replace function public.get_child_friends_secure(p_student_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.assert_parent_role();
  if not exists (select 1 from public.parent_student_links l where l.parent_user_id = auth.uid() and l.student_id = p_student_id and l.status = 'active') then
    raise exception 'Parent access required' using errcode = '42501';
  end if;
  return (select jsonb_build_object('enabled', s.friends_enabled, 'building', s.friend_building_enabled, 'schoolManaged', s.class_id is not null)
          from public.students s where s.id = p_student_id);
end;
$$;

do $$
declare
  fn text;
begin
  foreach fn in array array[
    'get_friends_secure(uuid)', 'new_friend_code_secure(uuid)', 'send_friend_request_secure(uuid, text)',
    'respond_friend_request_secure(uuid, uuid, boolean)', 'remove_friend_secure(uuid, uuid)',
    'set_friend_can_build_secure(uuid, uuid, boolean)', 'get_friend_world_secure(uuid, uuid)',
    'save_friend_world_secure(uuid, uuid, jsonb, jsonb)', 'get_world_visitor_changes_secure(uuid)',
    'resolve_world_visitor_change_secure(uuid, uuid)'
  ] loop
    execute format('revoke all on function public.%s from public', fn);
    -- Student sessions run as anon with the validated x-student-session header.
    execute format('grant execute on function public.%s to anon, authenticated', fn);
  end loop;
  foreach fn in array array['set_class_friends_secure(uuid, boolean, boolean)', 'set_child_friends_secure(uuid, boolean, boolean)', 'get_child_friends_secure(uuid)'] loop
    execute format('revoke all on function public.%s from public, anon', fn);
    execute format('grant execute on function public.%s to authenticated', fn);
  end loop;
end $$;

commit;
