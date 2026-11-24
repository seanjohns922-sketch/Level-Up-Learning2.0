-- Chronorok, finished (agreed with Sean 2026-11-25): cards kept for good, the first-100 catch-up, missed
-- grades bought with XP, best game scores saved on the server with a friends board, and the hand-over.
--
-- Chrono Crystals: one per learning day in the Melbourne calendar (school) year, counted here from rows only the
-- server writes: completed lesson attempts and weekly quiz attempts (their created_at). Not from
-- student_activity_daily, which the device can write.
-- Cards (one per grade: Prep = Spark ... Grade 6 and above = Eternal):
--   * 100 crystals in a year awakens the student's grade card (students.school_year_level), stamped with the year;
--   * a student's FIRST awakening also awakens every earlier grade's card ("catch_up");
--   * after that, an earlier grade the student never awakened can be bought for 5,000 XP ("bought");
--   * a parent (or the student's teacher) marks the physical card handed over.
-- Best scores: one per student per game (higher is better), with a per-game cap; the board shows the top 5
-- among the student and their accepted friends, first names only. Games give no XP (unchanged).
--
-- Schema (new): student_chronorok_cards, student_chronorok_bests (RLS on, no direct access; functions only).
-- Grants: claim/buy/submit/board need student write access (the student's own session or a teacher);
-- get_chronorok_secure needs read access (adds parents); handed-over needs a linked parent or a teacher (never the
-- student's own session). Helpers are not granted.
-- Data: none changed. Students already at 100 this year get their card on their next claim.
-- Rollback: drop the functions and both tables. XP spent on bought cards stays in the ledger (source_type
-- 'chronorok_card'); to refund, subtract it from student_economy_wallets.xp_spent and delete those rows.

begin;

create table if not exists public.student_chronorok_cards (
  student_id uuid not null references public.students(id) on delete cascade,
  card_id text not null check (card_id in ('chronorok-spark-y0', 'chronorok-ember-y1', 'chronorok-pulse-y2',
    'chronorok-current-y3', 'chronorok-rift-y4', 'chronorok-blaze-y5', 'chronorok-eternal-y6')),
  school_year integer not null,
  how text not null check (how in ('awakened', 'catch_up', 'bought')),
  awakened_at timestamptz not null default now(),
  handed_over_at timestamptz,
  primary key (student_id, card_id)
);
alter table public.student_chronorok_cards enable row level security;
revoke all on public.student_chronorok_cards from public, anon, authenticated;

create table if not exists public.student_chronorok_bests (
  student_id uuid not null references public.students(id) on delete cascade,
  game text not null check (game in ('chrono-run', 'time-slope', 'rune-blocks', 'relic-rider')),
  best integer not null check (best >= 0),
  updated_at timestamptz not null default now(),
  primary key (student_id, game)
);
alter table public.student_chronorok_bests enable row level security;
revoke all on public.student_chronorok_bests from public, anon, authenticated;

-- Helpers (not granted). ---------------------------------------------------------------------------

create or replace function public.chronorok_cards_in_order()
returns text[]
language sql
immutable
set search_path = public
as $$
  select array['chronorok-spark-y0', 'chronorok-ember-y1', 'chronorok-pulse-y2', 'chronorok-current-y3',
    'chronorok-rift-y4', 'chronorok-blaze-y5', 'chronorok-eternal-y6'];
$$;

/** 0 for Prep/Foundation, the year number up to 6 (Grade 6 and above share Eternal); null if unknown. */
create or replace function public.chronorok_grade_index(p_level text)
returns integer
language sql
immutable
set search_path = public
as $$
  select case
    when p_level is null then null
    when lower(trim(p_level)) in ('prep', 'foundation', 'f', 'ground', 'year 0') then 0
    when trim(p_level) ~* '^(year|grade) *[0-9]+$' then least(6, substring(trim(p_level) from '[0-9]+')::integer)
    else null end;
$$;

create or replace function public.chronorok_student_grade(p_student_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select public.chronorok_grade_index(coalesce(s.school_year_level, s.year_level)) from public.students s where s.id = p_student_id;
$$;

/** Learning days (Melbourne dates) from server-written lesson and quiz attempts. */
create or replace function public.chronorok_learning_days(p_student_id uuid)
returns setof date
language sql
stable
security definer
set search_path = public
as $$
  select distinct (timezone('Australia/Melbourne', a.created_at))::date from public.student_lesson_attempts a
  where a.student_id = p_student_id and a.completed
  union
  select distinct (timezone('Australia/Melbourne', q.created_at))::date from public.student_weekly_quiz_attempts q
  where q.student_id = p_student_id;
$$;

create or replace function public.chronorok_buy_xp()
returns integer
language sql
immutable
set search_path = public
as $$ select 5000; $$;

create or replace function public.chronorok_score_cap(p_game text)
returns integer
language sql
immutable
set search_path = public
as $$
  select case p_game when 'chrono-run' then 50000 when 'time-slope' then 50000 when 'rune-blocks' then 36 when 'relic-rider' then 24 else 0 end;
$$;

create or replace function public.chronorok_state(p_student_id uuid, p_newly text[] default '{}')
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_year integer := extract(year from timezone('Australia/Melbourne', now()))::integer;
  v_days integer;
  v_crystals integer;
begin
  select count(*), count(*) filter (where extract(year from d)::integer = v_year)
  into v_days, v_crystals from public.chronorok_learning_days(p_student_id) d;
  return jsonb_build_object(
    'year', v_year,
    'learningDays', v_days,
    'crystals', least(v_crystals, 100),
    'open', v_days >= 5,
    'gradeIndex', public.chronorok_student_grade(p_student_id),
    'buyXp', public.chronorok_buy_xp(),
    'cards', coalesce((select jsonb_agg(jsonb_build_object('cardId', c.card_id, 'year', c.school_year, 'how', c.how, 'handedOver', c.handed_over_at is not null)
      order by array_position(public.chronorok_cards_in_order(), c.card_id))
      from public.student_chronorok_cards c where c.student_id = p_student_id), '[]'::jsonb),
    'newly', to_jsonb(coalesce(p_newly, '{}'))
  );
end;
$$;

-- Student functions. -----------------------------------------------------------------------------

/** Counts this year's crystals and awakens the grade card (plus the first-time catch-up) when due. */
create or replace function public.claim_chronorok_secure(p_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state jsonb;
  v_grade integer := public.chronorok_student_grade(p_student_id);
  v_cards text[] := public.chronorok_cards_in_order();
  v_year integer;
  v_first boolean;
  v_newly text[] := '{}';
  v_inserted integer;
  i integer;
begin
  perform public.assert_student_write(p_student_id);
  perform pg_advisory_xact_lock(hashtext(p_student_id::text), hashtext('chronorok'));
  v_state := public.chronorok_state(p_student_id);
  v_year := (v_state->>'year')::integer;

  if (v_state->>'crystals')::integer >= 100 and v_grade is not null then
    v_first := not exists (select 1 from public.student_chronorok_cards c where c.student_id = p_student_id);
    insert into public.student_chronorok_cards(student_id, card_id, school_year, how)
    values (p_student_id, v_cards[v_grade + 1], v_year, 'awakened')
    on conflict do nothing;
    get diagnostics v_inserted = row_count;
    if v_inserted > 0 then
      v_newly := array[v_cards[v_grade + 1]];
      if v_first then
        for i in 0..v_grade - 1 loop
          insert into public.student_chronorok_cards(student_id, card_id, school_year, how)
          values (p_student_id, v_cards[i + 1], v_year, 'catch_up')
          on conflict do nothing;
          get diagnostics v_inserted = row_count;
          if v_inserted > 0 then v_newly := v_newly || v_cards[i + 1]; end if;
        end loop;
      end if;
    end if;
  end if;

  return public.chronorok_state(p_student_id, v_newly);
end;
$$;

/** An earlier grade's card the student never awakened, for 5,000 XP (only after their first awakening). */
create or replace function public.buy_chronorok_card_secure(p_student_id uuid, p_card_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_index integer := array_position(public.chronorok_cards_in_order(), p_card_id) - 1;
  v_grade integer := public.chronorok_student_grade(p_student_id);
  v_price integer := public.chronorok_buy_xp();
  v_balance integer;
begin
  perform public.assert_student_write(p_student_id);
  perform pg_advisory_xact_lock(hashtext(p_student_id::text), hashtext('chronorok'));
  if v_index is null or v_grade is null or v_index >= v_grade then
    raise exception 'Only an earlier grade''s Chronorok can be unlocked with XP' using errcode = '22023';
  end if;
  if not exists (select 1 from public.student_chronorok_cards c where c.student_id = p_student_id) then
    raise exception 'Awaken your first Chronorok first' using errcode = '22023';
  end if;
  if exists (select 1 from public.student_chronorok_cards c where c.student_id = p_student_id and c.card_id = p_card_id) then
    raise exception 'Already awakened' using errcode = '22023';
  end if;

  insert into public.student_economy_wallets(student_id) values (p_student_id) on conflict do nothing;
  select w.xp_earned - w.xp_spent into v_balance from public.student_economy_wallets w where w.student_id = p_student_id for update;
  if v_balance < v_price then raise exception 'Not enough XP' using errcode = '22023'; end if;

  insert into public.student_economy_transactions(student_id, transaction_type, xp_delta, source_type, source_key, metadata)
  values (p_student_id, 'purchase', -v_price, 'chronorok_card', 'chronorok:' || p_card_id, jsonb_build_object('cardId', p_card_id));
  update public.student_economy_wallets set xp_spent = xp_spent + v_price, updated_at = now() where student_id = p_student_id;
  insert into public.student_chronorok_cards(student_id, card_id, school_year, how)
  values (p_student_id, p_card_id, extract(year from timezone('Australia/Melbourne', now()))::integer, 'bought');

  return public.chronorok_state(p_student_id, array[p_card_id]);
end;
$$;

/** Saves a game score if it beats the student's best. Returns the best. */
create or replace function public.submit_chronorok_best_secure(p_student_id uuid, p_game text, p_score integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_best integer;
begin
  perform public.assert_student_write(p_student_id);
  if public.chronorok_score_cap(p_game) = 0 or p_score is null or p_score < 0 or p_score > public.chronorok_score_cap(p_game) then
    raise exception 'Score not accepted' using errcode = '22023';
  end if;
  insert into public.student_chronorok_bests(student_id, game, best) values (p_student_id, p_game, p_score)
  on conflict (student_id, game) do update set
    best = greatest(public.student_chronorok_bests.best, excluded.best),
    updated_at = case when excluded.best > public.student_chronorok_bests.best then now() else public.student_chronorok_bests.updated_at end
  returning best into v_best;
  return v_best;
end;
$$;

/** Top 5 for a game among the student and their friends (first names only), plus the student's own best. */
create or replace function public.get_chronorok_board_secure(p_student_id uuid, p_game text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.assert_student_write(p_student_id);
  return jsonb_build_object(
    'game', p_game,
    'myBest', (select b.best from public.student_chronorok_bests b where b.student_id = p_student_id and b.game = p_game),
    'top', coalesce((
      select jsonb_agg(jsonb_build_object('studentId', t.student_id, 'name', public.friend_label(t.student_id),
        'best', t.best, 'me', t.student_id = p_student_id, 'outfit', public.friend_outfit(t.student_id)) order by t.best desc, t.updated_at)
      from (
        select b.student_id, b.best, b.updated_at from public.student_chronorok_bests b
        where b.game = p_game and b.best > 0 and (b.student_id = p_student_id or b.student_id in (
          select case when f.student_low = p_student_id then f.student_high else f.student_low end
          from public.student_friendships f
          where f.status = 'accepted' and p_student_id in (f.student_low, f.student_high)))
        order by b.best desc, b.updated_at limit 5
      ) t), '[]'::jsonb)
  );
end;
$$;

-- Parents and teachers. ----------------------------------------------------------------------------

create or replace function public.get_chronorok_secure(p_student_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.assert_student_read(p_student_id);
  return public.chronorok_state(p_student_id);
end;
$$;

/** The physical card was given to the child: a linked parent, or the student's teacher (not the student). */
create or replace function public.set_chronorok_handed_over_secure(p_student_id uuid, p_card_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.parent_student_links l where l.parent_user_id = auth.uid() and l.student_id = p_student_id and l.status = 'active') then
    if public.request_student_session_token() is not null then
      raise exception 'Parent or teacher access required' using errcode = '42501';
    end if;
    perform public.assert_student_write(p_student_id);
  end if;
  update public.student_chronorok_cards set handed_over_at = coalesce(handed_over_at, now())
  where student_id = p_student_id and card_id = p_card_id;
  return found;
end;
$$;

revoke all on function public.chronorok_cards_in_order() from public, anon, authenticated;
revoke all on function public.chronorok_grade_index(text) from public, anon, authenticated;
revoke all on function public.chronorok_student_grade(uuid) from public, anon, authenticated;
revoke all on function public.chronorok_learning_days(uuid) from public, anon, authenticated;
revoke all on function public.chronorok_buy_xp() from public, anon, authenticated;
revoke all on function public.chronorok_score_cap(text) from public, anon, authenticated;
revoke all on function public.chronorok_state(uuid, text[]) from public, anon, authenticated;
revoke all on function public.claim_chronorok_secure(uuid) from public;
revoke all on function public.buy_chronorok_card_secure(uuid, text) from public;
revoke all on function public.submit_chronorok_best_secure(uuid, text, integer) from public;
revoke all on function public.get_chronorok_board_secure(uuid, text) from public;
revoke all on function public.get_chronorok_secure(uuid) from public;
revoke all on function public.set_chronorok_handed_over_secure(uuid, text) from public;
grant execute on function public.claim_chronorok_secure(uuid) to anon, authenticated;
grant execute on function public.buy_chronorok_card_secure(uuid, text) to anon, authenticated;
grant execute on function public.submit_chronorok_best_secure(uuid, text, integer) to anon, authenticated;
grant execute on function public.get_chronorok_board_secure(uuid, text) to anon, authenticated;
grant execute on function public.get_chronorok_secure(uuid) to anon, authenticated;
grant execute on function public.set_chronorok_handed_over_secure(uuid, text) to authenticated;

commit;
