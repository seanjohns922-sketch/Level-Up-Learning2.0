-- Learning streaks: XP for coming back to learn (agreed with Sean 2026-11-23).
--
-- A learning day is a Melbourne calendar day on which the server banked a first
-- lesson completion or a first weekly-quiz pass. Those ledger rows
-- (student_economy_transactions, source_type lesson_completion/quiz_completion)
-- are only written by the server, so a streak cannot be faked from the device.
--
-- Rules:
--   * each learning day adds one to the streak;
--   * Saturday, Sunday and today never break it (learning on them still counts);
--   * a missed weekday uses a streak shield if there is one, otherwise the streak ends;
--   * a shield is earned on every 5th day of a streak, up to 2 held;
--   * rewards: day 3 +100, day 5 +500, day 10 +750, day 20 +1000, day 30 +2000,
--     then +500 on every 5th day after 30. Each is paid once per streak, and only
--     if that streak day was within the last 7 days (no lump of old rewards at launch).
--
-- Schema: no new tables. A reward is a ledger row (source_type 'learning_streak',
-- source_key 'streak:<first day of the streak>:<day>') plus the wallet, as brain
-- breaks are. The unique (student_id, source_type, source_key) key makes paying idempotent.
-- Grants: claim_learning_streak_secure needs student write access (the student's
-- own session or a teacher); get_learning_streak_secure needs read access (adds
-- parents) and pays nothing. Both are granted to anon (student sessions run as anon
-- with the validated x-student-session header) and authenticated. The state and
-- milestone helpers are not granted.
-- Data: none changed by this migration.
-- Rollback: drop the four functions below. Rewards already paid stay in the ledger;
-- to remove them, subtract each student's learning_streak rows from
-- student_economy_wallets.xp_earned, then delete those rows.

begin;

create or replace function public.learning_streak_milestone_xp(p_day integer)
returns integer
language sql
immutable
set search_path = public
as $$
  select case
    when p_day = 3 then 100
    when p_day = 5 then 500
    when p_day = 10 then 750
    when p_day = 20 then 1000
    when p_day = 30 then 2000
    when p_day > 30 and p_day % 5 = 0 then 500
    else 0
  end;
$$;

-- run_days: the learning days of the current streak, oldest first, so run_days[n]
-- is the date the streak reached day n.
create or replace function public.learning_streak_state(
  p_student_id uuid,
  p_today date default (timezone('Australia/Melbourne', now()))::date
)
returns table(streak integer, shields integer, today_done boolean, run_days date[])
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_days date[];
  v_day date;
  v_run date[] := '{}';
  v_shields integer := 0;
begin
  select coalesce(array_agg(distinct learned.day order by learned.day), '{}')
  into v_days
  from (
    select (timezone('Australia/Melbourne', t.created_at))::date as day
    from public.student_economy_transactions t
    where t.student_id = p_student_id
      and t.transaction_type = 'earn'
      and t.source_type in ('lesson_completion', 'quiz_completion')
      and t.created_at >= ((p_today - 400)::timestamp at time zone 'Australia/Melbourne')
  ) learned
  where learned.day <= p_today;

  if cardinality(v_days) = 0 then
    return query select 0, 0, false, '{}'::date[];
    return;
  end if;

  v_day := v_days[1];
  while v_day <= p_today loop
    if v_day = any(v_days) then
      v_run := v_run || v_day;
      if cardinality(v_run) % 5 = 0 then
        v_shields := least(2, v_shields + 1);
      end if;
    elsif extract(isodow from v_day) in (6, 7) or v_day = p_today then
      null; -- weekends and today never break a streak
    elsif cardinality(v_run) > 0 then
      if v_shields > 0 then
        v_shields := v_shields - 1;
      else
        v_run := '{}';
      end if;
    end if;
    v_day := v_day + 1;
  end loop;

  return query select cardinality(v_run), case when cardinality(v_run) = 0 then 0 else v_shields end,
    p_today = any(v_days), v_run;
end;
$$;

create or replace function public.learning_streak_summary(
  p_streak integer,
  p_shields integer,
  p_today_done boolean,
  p_awarded jsonb
)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select jsonb_build_object(
    'streak', p_streak,
    'shields', p_shields,
    'todayDone', p_today_done,
    'nextDay', next.day,
    'nextXp', public.learning_streak_milestone_xp(next.day),
    'awarded', coalesce(p_awarded, '[]'::jsonb)
  )
  from (
    select min(day) as day
    from generate_series(p_streak + 1, p_streak + 10) as day
    where public.learning_streak_milestone_xp(day) > 0
  ) next;
$$;

create or replace function public.claim_learning_streak_secure(p_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state record;
  v_today date := (timezone('Australia/Melbourne', now()))::date;
  v_day integer;
  v_xp integer;
  v_inserted integer;
  v_total integer := 0;
  v_awarded jsonb := '[]'::jsonb;
begin
  perform public.assert_student_write(p_student_id);
  perform pg_advisory_xact_lock(hashtext(p_student_id::text), hashtext('learning_streak'));

  select * into v_state from public.learning_streak_state(p_student_id, v_today);

  for v_day in 3..greatest(v_state.streak, 2) loop
    v_xp := public.learning_streak_milestone_xp(v_day);
    continue when v_xp = 0 or v_state.run_days[v_day] < v_today - 7;

    insert into public.student_economy_transactions(
      student_id, transaction_type, xp_delta, source_type, source_key, metadata
    ) values (
      p_student_id, 'earn', v_xp, 'learning_streak',
      format('streak:%s:%s', v_state.run_days[1], v_day),
      jsonb_build_object('streakDay', v_day, 'reachedOn', v_state.run_days[v_day])
    ) on conflict (student_id, source_type, source_key) do nothing;
    get diagnostics v_inserted = row_count;

    if v_inserted > 0 then
      v_total := v_total + v_xp;
      v_awarded := v_awarded || jsonb_build_array(jsonb_build_object('day', v_day, 'xp', v_xp));
    end if;
  end loop;

  if v_total > 0 then
    insert into public.student_economy_wallets(student_id, xp_earned)
    values (p_student_id, v_total)
    on conflict (student_id) do update set
      xp_earned = public.student_economy_wallets.xp_earned + excluded.xp_earned,
      updated_at = now();
  end if;

  return public.learning_streak_summary(v_state.streak, v_state.shields, v_state.today_done, v_awarded);
end;
$$;

create or replace function public.get_learning_streak_secure(p_student_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_state record;
begin
  perform public.assert_student_read(p_student_id);
  select * into v_state from public.learning_streak_state(p_student_id);
  return public.learning_streak_summary(v_state.streak, v_state.shields, v_state.today_done, '[]'::jsonb);
end;
$$;

revoke all on function public.learning_streak_milestone_xp(integer) from public, anon, authenticated;
revoke all on function public.learning_streak_state(uuid, date) from public, anon, authenticated;
revoke all on function public.learning_streak_summary(integer, integer, boolean, jsonb) from public, anon, authenticated;
revoke all on function public.claim_learning_streak_secure(uuid) from public;
revoke all on function public.get_learning_streak_secure(uuid) from public;
grant execute on function public.claim_learning_streak_secure(uuid) to anon, authenticated;
grant execute on function public.get_learning_streak_secure(uuid) to anon, authenticated;

commit;
