-- Friends, take two (agreed with Sean 2026-11-24): MY CLASS (tap a classmate to send a request, no codes),
-- each friend's real explorer (their outfit comes with the friends list), and a friend's own profile page
-- (battle record with them, how much they've built, who may build where).
--
-- Never sent: a friend's level, lesson or quiz results, or RELIQS (cards come from lesson progress, so a
-- count would show who is further through maths). Battle records are fine: everyone answers at their own
-- level, so winning says nothing about which level you're on.
--
-- Classmates are students with an active enrolment in one of my classes (or the same students.class_id),
-- not archived, with friends allowed. The class Friends switch also turns off MY CLASS (friends_allowed).
-- Requests still need the classmate to say yes.
--
-- Functions (students, own session or teacher; anon + authenticated): get_classmates_secure,
-- send_classmate_request_secure, get_friend_profile_secure. Replaced: get_friends_secure (adds outfit,
-- friendsSince, hasClass), send_friend_request_secure (same results, now shares friend_request_to).
-- Helpers (not granted): friend_outfit, student_class_ids, friend_request_to.
-- Needs 20261126130000_friends.sql and 20261126150000_battles.sql. Schema: none changed. Data: none changed.
-- Rollback: drop the three new functions and three helpers; re-run get_friends_secure and
-- send_friend_request_secure from 20261126130000_friends.sql.

begin;

-- Helpers (not granted). ---------------------------------------------------------------------------

/** What an explorer is wearing: their free base look and the item layers they have on, to draw their face. */
create or replace function public.friend_outfit(p_student_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'base', coalesce((select a.base from public.student_avatar_base a where a.student_id = p_student_id), '{}'::jsonb),
    'layers', coalesce((
      select jsonb_object_agg(e.slot, i.metadata)
      from public.student_equipped_items e join public.economy_items i on i.item_key = e.item_key
      where e.student_id = p_student_id and jsonb_typeof(i.metadata) = 'object'
        -- The avatar layers only (lib/economy.ts AVATAR_LAYER_SLOTS), not pets, homes or titles.
        and e.slot in ('avatar_outfit', 'top', 'bottom', 'footwear', 'avatar_hat', 'avatar_glasses', 'avatar_cape', 'avatar_backpack', 'avatar_hand')
    ), '{}'::jsonb)
  );
$$;
revoke all on function public.friend_outfit(uuid) from public, anon, authenticated;

/** The classes a student is in now. */
create or replace function public.student_class_ids(p_student_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select e.class_id from public.class_enrollments e
  where e.student_id = p_student_id and e.status = 'active' and e.ended_at is null
  union
  select s.class_id from public.students s where s.id = p_student_id and s.class_id is not null;
$$;
revoke all on function public.student_class_ids(uuid) from public, anon, authenticated;

/** Sends (or, if they asked first, accepts) a request to another explorer. sent | accepted | already | not_found | self | off. */
create or replace function public.friend_request_to(p_student_id uuid, p_other uuid)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  existing public.student_friendships;
begin
  if not public.friends_allowed(p_student_id) then return 'off'; end if;
  if p_other is null or not exists (select 1 from public.students where id = p_other and archived_at is null) then return 'not_found'; end if;
  if p_other = p_student_id then return 'self'; end if;
  if not public.friends_allowed(p_other) then return 'not_found'; end if;
  existing := public.friendship_between(p_student_id, p_other);
  if existing.id is not null then
    if existing.status = 'accepted' then return 'already'; end if;
    if existing.requested_by = p_other then
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
  values (least(p_student_id, p_other), greatest(p_student_id, p_other), p_student_id);
  return 'sent';
end;
$$;
revoke all on function public.friend_request_to(uuid, uuid) from public, anon, authenticated;

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
    'hasClass', exists (select 1 from public.student_class_ids(p_student_id)),
    'friends', coalesce((
      select jsonb_agg(jsonb_build_object(
        'friendshipId', f.id,
        'studentId', other.id,
        'name', public.friend_label(other.id),
        'status', case when f.status = 'accepted' then 'friend' when f.requested_by = p_student_id then 'outgoing' else 'incoming' end,
        'theyCanBuild', case when f.student_low = p_student_id then f.low_lets_high_build else f.high_lets_low_build end,
        'iCanBuild', case when f.student_low = p_student_id then f.high_lets_low_build else f.low_lets_high_build end,
        'friendsSince', f.accepted_at,
        'outfit', public.friend_outfit(other.id)
      ) order by f.status desc, public.friend_label(other.id))
      from public.student_friendships f
      join public.students other on other.id = case when f.student_low = p_student_id then f.student_high else f.student_low end
      where (f.student_low = p_student_id or f.student_high = p_student_id) and other.archived_at is null
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.send_friend_request_secure(p_student_id uuid, p_code text)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  other uuid;
begin
  perform public.assert_student_write(p_student_id);
  if not public.friends_allowed(p_student_id) then return 'off'; end if;
  select student_id into other from public.student_friend_codes
  where code = upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g'));
  return public.friend_request_to(p_student_id, other);
end;
$$;

/** Everyone in my class (first names and explorers), and where each of us is: none | friend | outgoing | incoming. */
create or replace function public.get_classmates_secure(p_student_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_student_write(p_student_id);
  if not public.friends_allowed(p_student_id) then return '[]'::jsonb; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'studentId', mate.id,
      'name', public.friend_label(mate.id),
      'outfit', public.friend_outfit(mate.id),
      'status', case
        when f.id is null then 'none'
        when f.status = 'accepted' then 'friend'
        when f.requested_by = p_student_id then 'outgoing'
        else 'incoming' end
    ) order by public.friend_label(mate.id))
    from (
      select distinct s.id from public.students s
      left join public.class_enrollments e on e.student_id = s.id and e.status = 'active' and e.ended_at is null
      where s.id <> p_student_id and s.archived_at is null
        and (e.class_id in (select public.student_class_ids(p_student_id)) or s.class_id in (select public.student_class_ids(p_student_id)))
    ) mates
    join public.students mate on mate.id = mates.id
    left join public.student_friendships f on f.student_low = least(p_student_id, mate.id) and f.student_high = greatest(p_student_id, mate.id)
    where public.friends_allowed(mate.id)
  ), '[]'::jsonb);
end;
$$;

/** MY CLASS: a request to a classmate (only someone in one of my classes). */
create or replace function public.send_classmate_request_secure(p_student_id uuid, p_classmate_id uuid)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_student_write(p_student_id);
  if not exists (
    select 1 from public.student_class_ids(p_classmate_id) theirs
    where theirs in (select public.student_class_ids(p_student_id))
  ) then
    return 'not_found';
  end if;
  return public.friend_request_to(p_student_id, p_classmate_id);
end;
$$;

/** A friend's page: their explorer, our battles (all time), how much they've built, and who may build where. */
create or replace function public.get_friend_profile_secure(p_student_id uuid, p_friend_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  friendship public.student_friendships;
begin
  perform public.assert_student_write(p_student_id);
  friendship := public.friendship_between(p_student_id, p_friend_id);
  if friendship.status is distinct from 'accepted' or not public.friends_allowed(p_student_id) or not public.friends_allowed(p_friend_id) then
    raise exception 'Not friends' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'friendshipId', friendship.id,
    'studentId', p_friend_id,
    'name', public.friend_label(p_friend_id),
    'outfit', public.friend_outfit(p_friend_id),
    'friendsSince', friendship.accepted_at,
    'sameClass', exists (select 1 from public.student_class_ids(p_friend_id) theirs where theirs in (select public.student_class_ids(p_student_id))),
    'theyCanBuild', case when friendship.student_low = p_student_id then friendship.low_lets_high_build else friendship.high_lets_low_build end,
    'iCanBuild', public.friend_can_build(p_friend_id, p_student_id),
    'buildingEnabled', public.friends_allowed(p_student_id, true),
    'battlesEnabled', public.battles_allowed(p_student_id) and public.battles_allowed(p_friend_id),
    'worldItems', coalesce((select jsonb_array_length(l.placements) from public.student_world_layouts l where l.student_id = p_friend_id), 0),
    'record', (
      select jsonb_build_object(
        'won', count(*) filter (where b.winner_id = p_student_id),
        'lost', count(*) filter (where b.winner_id = p_friend_id),
        'drawn', count(*) filter (where b.winner_id is null))
      from public.student_battles b
      where b.status = 'finished'
        and ((b.challenger_id = p_student_id and b.opponent_id = p_friend_id) or (b.challenger_id = p_friend_id and b.opponent_id = p_student_id))
    ),
    'recent', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', b.id, 'realm', b.realm, 'at', b.finished_at,
        'myScore', case when b.challenger_id = p_student_id then b.challenger_score else b.opponent_score end,
        'friendScore', case when b.challenger_id = p_student_id then b.opponent_score else b.challenger_score end,
        'won', coalesce(b.winner_id = p_student_id, false), 'draw', b.winner_id is null
      ) order by b.finished_at desc)
      from (
        select * from public.student_battles b
        where b.status = 'finished'
          and ((b.challenger_id = p_student_id and b.opponent_id = p_friend_id) or (b.challenger_id = p_friend_id and b.opponent_id = p_student_id))
        order by b.finished_at desc limit 5
      ) b
    ), '[]'::jsonb)
  );
end;
$$;

do $$
declare
  fn text;
begin
  foreach fn in array array[
    'get_friends_secure(uuid)', 'send_friend_request_secure(uuid, text)', 'get_classmates_secure(uuid)',
    'send_classmate_request_secure(uuid, uuid)', 'get_friend_profile_secure(uuid, uuid)'
  ] loop
    execute format('revoke all on function public.%s from public', fn);
    -- Student sessions run as anon with the validated x-student-session header.
    execute format('grant execute on function public.%s to anon, authenticated', fn);
  end loop;
end $$;

commit;
