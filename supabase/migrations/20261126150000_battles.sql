-- Friend battles (agreed with Sean 2026-11-23): challenge a friend, pick a realm, and each answers 20 quick
-- questions at their own level. LIVE when both are online (the invite must be accepted within 2 minutes),
-- otherwise TAKE TURNS (the friend has 2 days). Most right wins. XP, set here: +15 each for playing and
-- +60 for the winner (tripled from the first design), within daily limits: school students 3 XP battles in
-- school hours (Mon-Fri 8:30-3:30 Melbourne) and 8 a day in all; home learners 10 a day. Past the limit
-- they can still battle for fun.
--
-- Schema (new): student_battles; columns classes.battles_enabled and students.battles_enabled (default
-- true). RLS on, no policies, no table grants: reached only through the functions below.
-- Functions (students, own session or teacher; anon + authenticated): create_battle_secure,
-- respond_battle_secure, get_battles_secure, submit_battle_score_secure. Adults (authenticated):
-- set_class_battles_secure, set_child_battles_secure; get_child_friends_secure now also returns 'battles'.
-- XP ledger rows: source_type 'battle', source_key 'battle:<id>:play:<student>' and 'battle:<id>:win'.
-- Needs 20261126130000_friends.sql (friendships). Data: none changed.
-- Rollback: drop the six functions, the battles_allowed and battle_xp_open helpers, table
-- student_battles and the two columns. XP already paid stays in the ledger (source_type 'battle').

begin;

alter table public.classes add column if not exists battles_enabled boolean not null default true;
alter table public.students add column if not exists battles_enabled boolean not null default true;

create table if not exists public.student_battles (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid not null references public.students(id) on delete cascade,
  opponent_id uuid not null references public.students(id) on delete cascade,
  realm text not null check (realm in ('number', 'measurement', 'pattern', 'statistics', 'space', 'chance')),
  mode text not null check (mode in ('live', 'turns')),
  status text not null default 'invited' check (status in ('invited', 'active', 'finished', 'declined', 'expired')),
  seed integer not null default floor(random() * 2000000000)::integer,
  challenger_score integer check (challenger_score between 0 and 20),
  opponent_score integer check (opponent_score between 0 and 20),
  challenger_level integer check (challenger_level between 0 and 8),
  opponent_level integer check (opponent_level between 0 and 8),
  winner_id uuid references public.students(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  finished_at timestamptz,
  check (challenger_id <> opponent_id)
);
create index if not exists student_battles_challenger_idx on public.student_battles(challenger_id, created_at desc);
create index if not exists student_battles_opponent_idx on public.student_battles(opponent_id, created_at desc);
alter table public.student_battles enable row level security;
revoke all on public.student_battles from public, anon, authenticated;

-- Helpers (not granted). ---------------------------------------------------------------------------

create or replace function public.battles_allowed(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select s.battles_enabled and coalesce(c.battles_enabled, true)
    from public.students s left join public.classes c on c.id = s.class_id
    where s.id = p_student_id and s.archived_at is null
  ), false);
$$;
revoke all on function public.battles_allowed(uuid) from public, anon, authenticated;

/** Whether a battle played now still earns XP for this student (the daily limits). */
create or replace function public.battle_xp_open(p_student_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  local_now timestamp := timezone('Australia/Melbourne', now());
  day_start timestamptz := date_trunc('day', local_now) at time zone 'Australia/Melbourne';
  school_start timestamptz := (date_trunc('day', local_now) + interval '8 hours 30 minutes') at time zone 'Australia/Melbourne';
  school_end timestamptz := (date_trunc('day', local_now) + interval '15 hours 30 minutes') at time zone 'Australia/Melbourne';
  in_school_hours boolean := extract(isodow from local_now) between 1 and 5 and now() >= school_start and now() < school_end;
  at_school boolean;
  today integer;
  in_hours integer;
begin
  select s.class_id is not null into at_school from public.students s where s.id = p_student_id;
  select count(*) into today from public.student_economy_transactions
  where student_id = p_student_id and source_type = 'battle' and source_key like 'battle:%:play:%' and created_at >= day_start;
  if not coalesce(at_school, false) then return today < 10; end if;
  if in_school_hours then
    select count(*) into in_hours from public.student_economy_transactions
    where student_id = p_student_id and source_type = 'battle' and source_key like 'battle:%:play:%' and created_at >= school_start and created_at < school_end;
    return in_hours < 3 and today < 8;
  end if;
  return today < 8;
end;
$$;
revoke all on function public.battle_xp_open(uuid) from public, anon, authenticated;

create or replace function public.pay_battle_xp(p_student_id uuid, p_xp integer, p_key text, p_battle_id uuid)
returns integer
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  inserted integer;
begin
  insert into public.student_economy_transactions(student_id, transaction_type, xp_delta, source_type, source_key, metadata)
  values (p_student_id, 'earn', p_xp, 'battle', p_key, jsonb_build_object('battle_id', p_battle_id))
  on conflict (student_id, source_type, source_key) do nothing;
  get diagnostics inserted = row_count;
  if inserted = 0 then return 0; end if;
  insert into public.student_economy_wallets(student_id, xp_earned) values (p_student_id, p_xp)
  on conflict (student_id) do update set xp_earned = public.student_economy_wallets.xp_earned + excluded.xp_earned, updated_at = now();
  return p_xp;
end;
$$;
revoke all on function public.pay_battle_xp(uuid, integer, text, uuid) from public, anon, authenticated;

-- Students. -----------------------------------------------------------------------------------------

create or replace function public.create_battle_secure(p_student_id uuid, p_friend_id uuid, p_realm text, p_mode text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  battle public.student_battles;
begin
  perform public.assert_student_write(p_student_id);
  if (public.friendship_between(p_student_id, p_friend_id)).status is distinct from 'accepted' then
    raise exception 'You can only battle friends' using errcode = '42501';
  end if;
  if not public.battles_allowed(p_student_id) or not public.battles_allowed(p_friend_id) then
    raise exception 'Battles are switched off' using errcode = '42501';
  end if;
  if (select count(*) from public.student_battles where challenger_id = p_student_id and status in ('invited', 'active')) >= 10 then
    raise exception 'Finish some battles first' using errcode = '22023';
  end if;
  insert into public.student_battles(challenger_id, opponent_id, realm, mode, status, expires_at)
  values (p_student_id, p_friend_id, p_realm, p_mode, case when p_mode = 'turns' then 'active' else 'invited' end,
          now() + case when p_mode = 'live' then interval '2 minutes' else interval '2 days' end)
  returning * into battle;
  return jsonb_build_object('id', battle.id, 'seed', battle.seed, 'status', battle.status);
end;
$$;

create or replace function public.respond_battle_secure(p_student_id uuid, p_battle_id uuid, p_accept boolean)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  battle public.student_battles;
begin
  perform public.assert_student_write(p_student_id);
  update public.student_battles
  set status = case when p_accept then 'active' else 'declined' end,
      expires_at = case when p_accept and mode = 'live' then now() + interval '10 minutes' else expires_at end
  where id = p_battle_id and opponent_id = p_student_id and status = 'invited' and expires_at > now()
  returning * into battle;
  if battle.id is null then return null; end if;
  return jsonb_build_object('id', battle.id, 'seed', battle.seed, 'status', battle.status);
end;
$$;

/** My battles: invites, ones waiting for me or my friend, and recent results. Old ones run out here. */
create or replace function public.get_battles_secure(p_student_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_student_write(p_student_id);
  update public.student_battles set status = 'expired'
  where (challenger_id = p_student_id or opponent_id = p_student_id) and status in ('invited', 'active') and expires_at <= now();
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', b.id, 'realm', b.realm, 'mode', b.mode, 'status', b.status, 'seed', b.seed,
      'iChallenged', b.challenger_id = p_student_id,
      'friendId', case when b.challenger_id = p_student_id then b.opponent_id else b.challenger_id end,
      'friendName', public.friend_label(case when b.challenger_id = p_student_id then b.opponent_id else b.challenger_id end),
      'myScore', case when b.challenger_id = p_student_id then b.challenger_score else b.opponent_score end,
      -- The friend's score only shows once the battle is over (or live, where both play at once).
      'friendScore', case when b.status = 'finished' then (case when b.challenger_id = p_student_id then b.opponent_score else b.challenger_score end) end,
      'won', case when b.status = 'finished' then (b.winner_id = p_student_id) end,
      'draw', b.status = 'finished' and b.winner_id is null,
      'expiresAt', b.expires_at, 'createdAt', b.created_at
    ) order by b.created_at desc)
    from (
      select * from public.student_battles
      where (challenger_id = p_student_id or opponent_id = p_student_id)
        and (status in ('invited', 'active') or created_at > now() - interval '7 days')
      order by created_at desc limit 30
    ) b
  ), '[]'::jsonb);
end;
$$;

/** A player finishes their 20 questions. Pays +15 for playing (within limits); when both are done, +60 to the winner. */
create or replace function public.submit_battle_score_secure(p_student_id uuid, p_battle_id uuid, p_correct integer, p_level integer)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  play_xp constant integer := 15;   -- lib/battles.ts shows the same
  win_xp constant integer := 60;
  battle public.student_battles;
  paid integer := 0;
  is_challenger boolean;
begin
  perform public.assert_student_write(p_student_id);
  perform pg_advisory_xact_lock(hashtext(p_battle_id::text), hashtext('battle'));
  select * into battle from public.student_battles where id = p_battle_id for update;
  if battle.id is null or p_student_id not in (battle.challenger_id, battle.opponent_id) then
    raise exception 'Not your battle' using errcode = '42501';
  end if;
  if battle.status <> 'active' then return jsonb_build_object('status', battle.status, 'xp', 0); end if;
  is_challenger := battle.challenger_id = p_student_id;
  if (is_challenger and battle.challenger_score is not null) or (not is_challenger and battle.opponent_score is not null) then
    return jsonb_build_object('status', battle.status, 'xp', 0);
  end if;

  update public.student_battles
  set challenger_score = case when is_challenger then least(greatest(coalesce(p_correct, 0), 0), 20) else challenger_score end,
      challenger_level = case when is_challenger then least(greatest(coalesce(p_level, 0), 0), 8) else challenger_level end,
      opponent_score = case when not is_challenger then least(greatest(coalesce(p_correct, 0), 0), 20) else opponent_score end,
      opponent_level = case when not is_challenger then least(greatest(coalesce(p_level, 0), 0), 8) else opponent_level end
  where id = p_battle_id
  returning * into battle;

  if public.battle_xp_open(p_student_id) then
    paid := public.pay_battle_xp(p_student_id, play_xp, 'battle:' || p_battle_id || ':play:' || p_student_id, p_battle_id);
  end if;

  if battle.challenger_score is not null and battle.opponent_score is not null then
    update public.student_battles
    set status = 'finished', finished_at = now(),
        winner_id = case when challenger_score > opponent_score then challenger_id when opponent_score > challenger_score then opponent_id end
    where id = p_battle_id
    returning * into battle;
    -- The win pays only if the winner earned XP for playing this battle (so the daily limit holds).
    if battle.winner_id is not null and exists (
      select 1 from public.student_economy_transactions
      where student_id = battle.winner_id and source_type = 'battle' and source_key = 'battle:' || p_battle_id || ':play:' || battle.winner_id
    ) then
      if battle.winner_id = p_student_id then
        paid := paid + public.pay_battle_xp(battle.winner_id, win_xp, 'battle:' || p_battle_id || ':win', p_battle_id);
      else
        perform public.pay_battle_xp(battle.winner_id, win_xp, 'battle:' || p_battle_id || ':win', p_battle_id);
      end if;
    end if;
  end if;

  return jsonb_build_object(
    'status', battle.status, 'xp', paid,
    'myScore', case when is_challenger then battle.challenger_score else battle.opponent_score end,
    'friendScore', case when battle.status = 'finished' then (case when is_challenger then battle.opponent_score else battle.challenger_score end) end,
    'won', case when battle.status = 'finished' then battle.winner_id = p_student_id end,
    'draw', battle.status = 'finished' and battle.winner_id is null
  );
end;
$$;

-- Adults. -------------------------------------------------------------------------------------------

create or replace function public.set_class_battles_secure(p_class_id uuid, p_enabled boolean)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if not public.can_manage_class(p_class_id) then raise exception 'Class access required' using errcode = '42501'; end if;
  update public.classes set battles_enabled = p_enabled where id = p_class_id;
  return found;
end;
$$;

create or replace function public.set_child_battles_secure(p_student_id uuid, p_enabled boolean)
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
  update public.students set battles_enabled = p_enabled where id = p_student_id;
  return found;
end;
$$;

/** The parent's switches on the child's page now include battles (replaces the friends migration's version). */
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
  return (select jsonb_build_object('enabled', s.friends_enabled, 'building', s.friend_building_enabled, 'battles', s.battles_enabled, 'schoolManaged', s.class_id is not null)
          from public.students s where s.id = p_student_id);
end;
$$;

do $$
declare
  fn text;
begin
  foreach fn in array array['create_battle_secure(uuid, uuid, text, text)', 'respond_battle_secure(uuid, uuid, boolean)', 'get_battles_secure(uuid)', 'submit_battle_score_secure(uuid, uuid, integer, integer)'] loop
    execute format('revoke all on function public.%s from public', fn);
    -- Student sessions run as anon with the validated x-student-session header.
    execute format('grant execute on function public.%s to anon, authenticated', fn);
  end loop;
  foreach fn in array array['set_class_battles_secure(uuid, boolean)', 'set_child_battles_secure(uuid, boolean)'] loop
    execute format('revoke all on function public.%s from public, anon', fn);
    execute format('grant execute on function public.%s to authenticated', fn);
  end loop;
end $$;

commit;
