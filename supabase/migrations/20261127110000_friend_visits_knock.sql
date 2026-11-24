-- Visiting, take three (agreed with Sean 2026-11-24): knock to come in. A friend can only enter your world
-- while you're in the hub and you let them in: LET IN TO LOOK, LET IN TO BUILD or NOT NOW, chosen at the door
-- for that visit only (the owner can switch LOOK/BUILD or send them home any time). Building only happens
-- while the owner is there. No limit on visitors. KEEP IT / UNDO afterwards works as before
-- (student_world_visitor_changes). The always-on "can help build" switch is retired.
--
-- "In the hub": the owner's hub sends host_heartbeat_secure every 15 seconds (and at once when someone
-- knocks). A visit ends when either side has been silent for 45 seconds; an unanswered knock after 60.
--
-- Schema (new): student_hub_presence, student_world_visits. RLS on, no policies, no table grants: reached
-- only through the functions below. The friendships' low_lets_high_build / high_lets_low_build columns stay
-- but no longer let anyone build.
-- Functions (students, own session or teacher; anon + authenticated): host_heartbeat_secure,
-- host_leave_secure, knock_secure, visit_status_secure, answer_knock_secure, set_visit_build_secure,
-- end_visit_secure. Replaced: get_friend_world_secure and save_friend_world_secure (now need a live visit
-- the owner allowed). Retired: set_friend_can_build_secure (execute revoked).
-- Helpers (not granted): close_stale_visits, live_visit.
-- Needs 20261126130000_friends.sql and 20261127090000_friends_my_class_and_profiles.sql (friend_outfit).
-- Data: none changed. Rollback: drop the seven new functions, the helpers and both tables; re-run
-- get_friend_world_secure, save_friend_world_secure and the grant for set_friend_can_build_secure from
-- 20261126130000_friends.sql.

begin;

create table if not exists public.student_hub_presence (
  student_id uuid primary key references public.students(id) on delete cascade,
  seen_at timestamptz not null default now()
);

create table if not exists public.student_world_visits (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.students(id) on delete cascade,
  visitor_id uuid not null references public.students(id) on delete cascade,
  status text not null default 'knocking' check (status in ('knocking', 'inside', 'declined', 'expired', 'ended')),
  can_build boolean not null default false,
  created_at timestamptz not null default now(),
  answered_at timestamptz,
  ended_at timestamptz,
  owner_seen_at timestamptz not null default now(),
  visitor_seen_at timestamptz not null default now(),
  check (owner_id <> visitor_id)
);
-- One open visit (knocking or inside) per visitor and world.
create unique index if not exists student_world_visits_open on public.student_world_visits(owner_id, visitor_id) where status in ('knocking', 'inside');
create index if not exists student_world_visits_visitor_idx on public.student_world_visits(visitor_id) where status in ('knocking', 'inside');

alter table public.student_hub_presence enable row level security;
alter table public.student_world_visits enable row level security;
revoke all on public.student_hub_presence, public.student_world_visits from public, anon, authenticated;

-- Helpers (not granted). ---------------------------------------------------------------------------

/** Ends this student's visits (either side) where someone has gone quiet, and knocks nobody answered. */
create or replace function public.close_stale_visits(p_student_id uuid)
returns void
language sql
volatile
security definer
set search_path = public
as $$
  update public.student_world_visits set status = 'expired', ended_at = now()
  where (owner_id = p_student_id or visitor_id = p_student_id) and status = 'knocking' and created_at < now() - interval '60 seconds';
  update public.student_world_visits set status = 'ended', ended_at = now()
  where (owner_id = p_student_id or visitor_id = p_student_id) and status = 'inside'
    and (owner_seen_at < now() - interval '45 seconds' or visitor_seen_at < now() - interval '45 seconds');
$$;
revoke all on function public.close_stale_visits(uuid) from public, anon, authenticated;

/** The visit that lets `p_visitor` into `p_owner`'s world right now, or null. */
create or replace function public.live_visit(p_owner uuid, p_visitor uuid)
returns public.student_world_visits
language sql
stable
security definer
set search_path = public
as $$
  select * from public.student_world_visits
  where owner_id = p_owner and visitor_id = p_visitor and status = 'inside'
    and owner_seen_at >= now() - interval '45 seconds' and visitor_seen_at >= now() - interval '45 seconds'
    and (public.friendship_between(p_owner, p_visitor)).status = 'accepted'
    and public.friends_allowed(p_owner) and public.friends_allowed(p_visitor);
$$;
revoke all on function public.live_visit(uuid, uuid) from public, anon, authenticated;

-- Students. -----------------------------------------------------------------------------------------

/** The owner's hub, every 15 seconds: I'm here. Returns who's knocking and who's inside. */
create or replace function public.host_heartbeat_secure(p_student_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_student_write(p_student_id);
  insert into public.student_hub_presence(student_id, seen_at) values (p_student_id, now())
  on conflict (student_id) do update set seen_at = now();
  update public.student_world_visits set owner_seen_at = now() where owner_id = p_student_id and status = 'inside';
  perform public.close_stale_visits(p_student_id);
  return jsonb_build_object(
    'buildingEnabled', public.friends_allowed(p_student_id, true),
    'knocks', coalesce((
      select jsonb_agg(jsonb_build_object('visitId', v.id, 'studentId', v.visitor_id, 'name', public.friend_label(v.visitor_id),
        'outfit', public.friend_outfit(v.visitor_id), 'canBuild', public.friends_allowed(v.visitor_id, true)) order by v.created_at)
      from public.student_world_visits v where v.owner_id = p_student_id and v.status = 'knocking'
    ), '[]'::jsonb),
    'visitors', coalesce((
      select jsonb_agg(jsonb_build_object('visitId', v.id, 'studentId', v.visitor_id, 'name', public.friend_label(v.visitor_id),
        'outfit', public.friend_outfit(v.visitor_id), 'canBuild', v.can_build) order by v.answered_at)
      from public.student_world_visits v where v.owner_id = p_student_id and v.status = 'inside'
    ), '[]'::jsonb)
  );
end;
$$;

/** The owner left the hub: knocks and visits to their world end now. */
create or replace function public.host_leave_secure(p_student_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_student_write(p_student_id);
  delete from public.student_hub_presence where student_id = p_student_id;
  update public.student_world_visits set status = case when status = 'knocking' then 'expired' else 'ended' end, ended_at = now()
  where owner_id = p_student_id and status in ('knocking', 'inside');
end;
$$;

/** Knock on a friend's door. result: knocking | inside | offline | off. */
create or replace function public.knock_secure(p_student_id uuid, p_owner_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  visit public.student_world_visits;
begin
  perform public.assert_student_write(p_student_id);
  if (public.friendship_between(p_student_id, p_owner_id)).status is distinct from 'accepted'
    or not public.friends_allowed(p_student_id) or not public.friends_allowed(p_owner_id) then
    return jsonb_build_object('result', 'off');
  end if;
  perform public.close_stale_visits(p_owner_id);
  if not exists (select 1 from public.student_hub_presence where student_id = p_owner_id and seen_at >= now() - interval '45 seconds') then
    return jsonb_build_object('result', 'offline');
  end if;
  select * into visit from public.student_world_visits
  where owner_id = p_owner_id and visitor_id = p_student_id and status in ('knocking', 'inside');
  if visit.id is null then
    insert into public.student_world_visits(owner_id, visitor_id) values (p_owner_id, p_student_id) returning * into visit;
  end if;
  return jsonb_build_object('result', visit.status, 'visitId', visit.id);
end;
$$;

/** The visitor's side, every few seconds: still knocking, let in (and may I build?), or over. Keeps me "here". */
create or replace function public.visit_status_secure(p_student_id uuid, p_visit_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  visit public.student_world_visits;
begin
  perform public.assert_student_write(p_student_id);
  update public.student_world_visits set visitor_seen_at = now()
  where id = p_visit_id and visitor_id = p_student_id and status in ('knocking', 'inside');
  perform public.close_stale_visits(p_student_id);
  select * into visit from public.student_world_visits where id = p_visit_id and visitor_id = p_student_id;
  if visit.id is null then return jsonb_build_object('status', 'ended', 'canBuild', false); end if;
  return jsonb_build_object(
    'status', visit.status,
    'canBuild', visit.status = 'inside' and visit.can_build and public.friends_allowed(visit.owner_id, true) and public.friends_allowed(p_student_id, true)
  );
end;
$$;

/** The owner answers the door: look | build | no. BUILD falls back to LOOK where building together is switched off. */
create or replace function public.answer_knock_secure(p_student_id uuid, p_visit_id uuid, p_answer text)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_student_write(p_student_id);
  if p_answer not in ('look', 'build', 'no') then raise exception 'Unknown answer' using errcode = '22023'; end if;
  update public.student_world_visits v
  set status = case when p_answer = 'no' then 'declined' else 'inside' end,
      can_build = p_answer = 'build' and public.friends_allowed(p_student_id, true) and public.friends_allowed(v.visitor_id, true),
      answered_at = now(), owner_seen_at = now(), visitor_seen_at = now(),
      ended_at = case when p_answer = 'no' then now() end
  where v.id = p_visit_id and v.owner_id = p_student_id and v.status = 'knocking';
  return found;
end;
$$;

/** The owner switches a visitor between LOOK and BUILD. */
create or replace function public.set_visit_build_secure(p_student_id uuid, p_visit_id uuid, p_can_build boolean)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_student_write(p_student_id);
  update public.student_world_visits v
  set can_build = p_can_build and public.friends_allowed(p_student_id, true) and public.friends_allowed(v.visitor_id, true)
  where v.id = p_visit_id and v.owner_id = p_student_id and v.status = 'inside';
  return found;
end;
$$;

/** Either side ends a visit (GO HOME, SEND HOME, or CANCEL while knocking). */
create or replace function public.end_visit_secure(p_student_id uuid, p_visit_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_student_write(p_student_id);
  update public.student_world_visits set status = case when status = 'knocking' then 'expired' else 'ended' end, ended_at = now()
  where id = p_visit_id and (owner_id = p_student_id or visitor_id = p_student_id) and status in ('knocking', 'inside');
  return found;
end;
$$;

/** A friend's world, while they've let me in: their layout, the items they own, and whether I may build now. */
create or replace function public.get_friend_world_secure(p_student_id uuid, p_friend_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  layout public.student_world_layouts%rowtype;
  visit public.student_world_visits;
begin
  perform public.assert_student_write(p_student_id);
  visit := public.live_visit(p_friend_id, p_student_id);
  if visit.id is null then raise exception 'Not let in' using errcode = '42501'; end if;
  select * into layout from public.student_world_layouts where student_id = p_friend_id;
  return jsonb_build_object(
    'visitId', visit.id,
    'name', public.friend_label(p_friend_id),
    'outfit', public.friend_outfit(p_friend_id),
    'placements', coalesce(layout.placements, '[]'::jsonb),
    'groundTiles', coalesce(layout.ground_tiles, '[]'::jsonb),
    'revision', coalesce(layout.revision, 0),
    'canBuild', visit.can_build and public.friends_allowed(p_friend_id, true) and public.friends_allowed(p_student_id, true),
    'owned', coalesce((select jsonb_agg(item_key) from public.student_inventory where student_id = p_friend_id), '[]'::jsonb)
  );
end;
$$;

/** A friend let in to BUILD saves the world; the owner's change summary keeps the world as it was first. */
create or replace function public.save_friend_world_secure(p_student_id uuid, p_friend_id uuid, p_placements jsonb, p_ground_tiles jsonb)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  current_layout public.student_world_layouts%rowtype;
  visit public.student_world_visits;
begin
  perform public.assert_student_write(p_student_id);
  visit := public.live_visit(p_friend_id, p_student_id);
  if visit.id is null or not visit.can_build or not public.friends_allowed(p_friend_id, true) or not public.friends_allowed(p_student_id, true) then
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

-- The old always-on switch no longer lets anyone build; retire it.
revoke all on function public.set_friend_can_build_secure(uuid, uuid, boolean) from public, anon, authenticated;

do $$
declare
  fn text;
begin
  foreach fn in array array[
    'host_heartbeat_secure(uuid)', 'host_leave_secure(uuid)', 'knock_secure(uuid, uuid)', 'visit_status_secure(uuid, uuid)',
    'answer_knock_secure(uuid, uuid, text)', 'set_visit_build_secure(uuid, uuid, boolean)', 'end_visit_secure(uuid, uuid)',
    'get_friend_world_secure(uuid, uuid)', 'save_friend_world_secure(uuid, uuid, jsonb, jsonb)'
  ] loop
    execute format('revoke all on function public.%s from public', fn);
    -- Student sessions run as anon with the validated x-student-session header.
    execute format('grant execute on function public.%s to anon, authenticated', fn);
  end loop;
end $$;

commit;
