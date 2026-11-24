-- More XP (agreed with Sean 2026-11-24): daily quests, an accuracy bonus, and week and level bonuses.
--
-- Everything is worked out here from rows only the server writes, so nothing can be faked from the device:
--   * ledger rows (student_economy_transactions): lesson_completion, rex, purchase;
--   * student_lesson_attempts (attempt_no and created_at are set by the server);
--   * student_battles (finished battles) and student_realm_progress (posttest_completed_at).
--
-- Daily quests (a Melbourne day). Three a day, chosen from the student id and the date:
--   1. "Finish a lesson" (always) .................................................. +30
--   2. one of: finish 2 lessons / score 80%+ in a lesson / lessons in 2 realms ...... +30
--   3. one of: play a friend battle / answer Rex / unlock or upgrade something ...... +20
--      (in a class on a school day: battle or Rex only; battle only where battles are switched on)
--   All three done ................................................................. +50
-- Accuracy (first time through a lesson, at least 5 questions): every answer right first go +20, 80%+ +10.
--   The marks come from the device (as they always have); the bonus is small and first-time only.
-- Week cleared: all 3 lessons of a week in a realm and level ........................ +100
-- Level cleared: the end-of-level test of a realm and level finished ............... +1000
-- Accuracy, week and level bonuses are only paid for things done in the last 7 days, so launch
-- doesn't pay a lump for old work.
--
-- Schema: no new tables. A reward is a ledger row plus the wallet, as streaks are; the unique
-- (student_id, source_type, source_key) key pays each one once:
--   daily_quest   'quest:<day>:<quest>' and 'quest:<day>:all'
--   lesson_accuracy 'accuracy:<realm>:<level>:<week>:<lesson>'
--   week_cleared  'week:<realm>:<level>:<week>'
--   level_cleared 'level:<realm>:<level>'
-- Grants: claim_xp_rewards_secure needs student write access (the student's own session or a teacher)
-- and pays; get_daily_quests_secure needs read access (adds parents) and pays nothing. Helpers are not granted.
-- Data: none changed by this migration.
-- Rollback: drop the functions below. Rewards already paid stay in the ledger; to remove them, subtract
-- each student's rows of those four source types from student_economy_wallets.xp_earned, then delete them.

begin;

create or replace function public.xp_quest_reward(p_quest text)
returns integer
language sql
immutable
set search_path = public
as $$
  select case p_quest
    when 'lesson' then 30 when 'two_lessons' then 30 when 'sharp_lesson' then 30 when 'two_realms' then 30
    when 'battle' then 20 when 'rex' then 20 when 'build' then 20
    else 0 end;
$$;

create or replace function public.xp_quest_target(p_quest text)
returns integer
language sql
immutable
set search_path = public
as $$
  select case p_quest when 'two_lessons' then 2 when 'two_realms' then 2 else 1 end;
$$;

-- The day's three quests: always a lesson, one more learning quest, one fun quest.
create or replace function public.xp_daily_quest_list(p_student_id uuid, p_day date)
returns text[]
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_seed bigint := abs(hashtext(p_student_id::text || ':' || p_day::text)::bigint);
  v_learning constant text[] := array['two_lessons', 'sharp_lesson', 'two_realms'];
  v_in_class boolean;
  v_fun text[];
begin
  select s.class_id is not null into v_in_class from public.students s where s.id = p_student_id;
  -- In class on a school day the fun quest stays out of the world builder.
  v_fun := case when coalesce(v_in_class, false) and extract(isodow from p_day) <= 5
    then array['battle', 'rex'] else array['battle', 'rex', 'build'] end;
  if not public.battles_allowed(p_student_id) then
    v_fun := array_remove(v_fun, 'battle');
  end if;
  return array['lesson', v_learning[1 + v_seed % 3], v_fun[1 + (v_seed / 3) % cardinality(v_fun)]];
end;
$$;

-- First-time lesson attempts (attempt 1 of a lesson that was completed), saved in [p_from, p_to).
create or replace function public.xp_first_lesson_attempts(p_student_id uuid, p_from timestamptz, p_to timestamptz)
returns table(realm_id text, working_level text, week integer, lesson integer, correct integer, total integer, saved_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select distinct on (a.realm_id, a.working_level, a.week, a.lesson)
    a.realm_id, a.working_level, a.week, a.lesson, a.correct_count, a.total_questions, a.created_at
  from public.student_lesson_attempts a
  where a.student_id = p_student_id and a.completed
    and a.created_at >= p_from and a.created_at < p_to
    and not exists (
      select 1 from public.student_lesson_attempts earlier
      where earlier.student_id = a.student_id and earlier.realm_id = a.realm_id
        and earlier.working_level = a.working_level and earlier.week = a.week and earlier.lesson = a.lesson
        and earlier.completed and earlier.attempt_no < a.attempt_no
    )
  order by a.realm_id, a.working_level, a.week, a.lesson, a.attempt_no;
$$;

create or replace function public.xp_accuracy_bonus(p_correct integer, p_total integer)
returns integer
language sql
immutable
set search_path = public
as $$
  select case
    when coalesce(p_total, 0) < 5 then 0
    when p_correct >= p_total then 20
    when p_correct * 100 >= p_total * 80 then 10
    else 0 end;
$$;

-- How far a student is through one quest on a day.
create or replace function public.xp_quest_progress(p_student_id uuid, p_quest text, p_day date)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_from timestamptz := p_day::timestamp at time zone 'Australia/Melbourne';
  v_to timestamptz := (p_day + 1)::timestamp at time zone 'Australia/Melbourne';
  v_count integer;
begin
  if p_quest in ('lesson', 'two_lessons') then
    select count(*) into v_count from public.student_economy_transactions t
    where t.student_id = p_student_id and t.transaction_type = 'earn' and t.source_type = 'lesson_completion'
      and t.created_at >= v_from and t.created_at < v_to;
  elsif p_quest = 'two_realms' then
    select count(distinct t.metadata->>'realm_id') into v_count from public.student_economy_transactions t
    where t.student_id = p_student_id and t.transaction_type = 'earn' and t.source_type = 'lesson_completion'
      and t.created_at >= v_from and t.created_at < v_to;
  elsif p_quest = 'sharp_lesson' then
    select count(*) into v_count from public.xp_first_lesson_attempts(p_student_id, v_from, v_to) a
    where a.total >= 5 and a.correct * 100 >= a.total * 80;
  elsif p_quest = 'battle' then
    select count(*) into v_count from public.student_battles b
    where b.status = 'finished' and p_student_id in (b.challenger_id, b.opponent_id)
      and b.finished_at >= v_from and b.finished_at < v_to;
  elsif p_quest = 'rex' then
    select count(*) into v_count from public.student_economy_transactions t
    where t.student_id = p_student_id and t.transaction_type = 'earn' and t.source_type = 'rex'
      and t.created_at >= v_from and t.created_at < v_to;
  elsif p_quest = 'build' then
    select count(*) into v_count from public.student_economy_transactions t
    where t.student_id = p_student_id and t.transaction_type = 'purchase'
      and t.created_at >= v_from and t.created_at < v_to;
  end if;
  return least(coalesce(v_count, 0), public.xp_quest_target(p_quest));
end;
$$;

create or replace function public.xp_daily_quests(p_student_id uuid, p_day date)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', q.quest,
    'progress', public.xp_quest_progress(p_student_id, q.quest, p_day),
    'target', public.xp_quest_target(q.quest),
    'xp', public.xp_quest_reward(q.quest),
    'done', public.xp_quest_progress(p_student_id, q.quest, p_day) >= public.xp_quest_target(q.quest)
  ) order by q.n), '[]'::jsonb)
  from unnest(public.xp_daily_quest_list(p_student_id, p_day)) with ordinality as q(quest, n);
$$;

create or replace function public.xp_reward_pay(p_student_id uuid, p_source_type text, p_source_key text, p_xp integer, p_metadata jsonb)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted integer;
begin
  insert into public.student_economy_transactions(student_id, transaction_type, xp_delta, source_type, source_key, metadata)
  values (p_student_id, 'earn', p_xp, p_source_type, p_source_key, p_metadata)
  on conflict (student_id, source_type, source_key) do nothing;
  get diagnostics v_inserted = row_count;
  return v_inserted > 0;
end;
$$;

create or replace function public.claim_xp_rewards_secure(p_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (timezone('Australia/Melbourne', now()))::date;
  v_quests jsonb;
  v_quest jsonb;
  v_row record;
  v_xp integer;
  v_total integer := 0;
  v_awarded jsonb := '[]'::jsonb;
begin
  perform public.assert_student_write(p_student_id);
  perform pg_advisory_xact_lock(hashtext(p_student_id::text), hashtext('xp_rewards'));

  -- Daily quests.
  v_quests := public.xp_daily_quests(p_student_id, v_today);
  for v_quest in select * from jsonb_array_elements(v_quests) loop
    continue when not (v_quest->>'done')::boolean;
    v_xp := (v_quest->>'xp')::integer;
    if public.xp_reward_pay(p_student_id, 'daily_quest', format('quest:%s:%s', v_today, v_quest->>'id'), v_xp, jsonb_build_object('day', v_today, 'quest', v_quest->>'id')) then
      v_total := v_total + v_xp;
      v_awarded := v_awarded || jsonb_build_array(jsonb_build_object('kind', 'quest', 'quest', v_quest->>'id', 'xp', v_xp));
    end if;
  end loop;
  if not exists (select 1 from jsonb_array_elements(v_quests) q where not (q->>'done')::boolean)
    and public.xp_reward_pay(p_student_id, 'daily_quest', format('quest:%s:all', v_today), 50, jsonb_build_object('day', v_today, 'quest', 'all')) then
    v_total := v_total + 50;
    v_awarded := v_awarded || jsonb_build_array(jsonb_build_object('kind', 'quests_all', 'xp', 50));
  end if;

  -- Accuracy on first-time lessons from the last 7 days.
  for v_row in select * from public.xp_first_lesson_attempts(p_student_id, now() - interval '7 days', now() + interval '1 minute') loop
    v_xp := public.xp_accuracy_bonus(v_row.correct, v_row.total);
    continue when v_xp = 0;
    if public.xp_reward_pay(p_student_id, 'lesson_accuracy', format('accuracy:%s:%s:%s:%s', v_row.realm_id, v_row.working_level, v_row.week, v_row.lesson), v_xp,
      jsonb_build_object('realm', v_row.realm_id, 'level', v_row.working_level, 'week', v_row.week, 'lesson', v_row.lesson, 'correct', v_row.correct, 'total', v_row.total)) then
      v_total := v_total + v_xp;
      v_awarded := v_awarded || jsonb_build_array(jsonb_build_object('kind', 'accuracy', 'xp', v_xp, 'perfect', v_row.correct >= v_row.total));
    end if;
  end loop;

  -- Weeks cleared: all 3 lessons done, the last of them in the last 7 days.
  for v_row in
    select a.realm_id, a.working_level, a.week
    from public.xp_first_lesson_attempts(p_student_id, '-infinity', now() + interval '1 minute') a
    group by a.realm_id, a.working_level, a.week
    having count(distinct a.lesson) >= 3 and max(a.saved_at) >= now() - interval '7 days'
  loop
    if public.xp_reward_pay(p_student_id, 'week_cleared', format('week:%s:%s:%s', v_row.realm_id, v_row.working_level, v_row.week), 100,
      jsonb_build_object('realm', v_row.realm_id, 'level', v_row.working_level, 'week', v_row.week)) then
      v_total := v_total + 100;
      v_awarded := v_awarded || jsonb_build_array(jsonb_build_object('kind', 'week', 'xp', 100, 'realm', v_row.realm_id, 'level', v_row.working_level, 'week', v_row.week));
    end if;
  end loop;

  -- Levels cleared: the end-of-level test finished in the last 7 days.
  for v_row in
    select p.realm_id, p.working_level from public.student_realm_progress p
    where p.student_id = p_student_id and p.posttest_completed_at >= now() - interval '7 days'
  loop
    if public.xp_reward_pay(p_student_id, 'level_cleared', format('level:%s:%s', v_row.realm_id, v_row.working_level), 1000,
      jsonb_build_object('realm', v_row.realm_id, 'level', v_row.working_level)) then
      v_total := v_total + 1000;
      v_awarded := v_awarded || jsonb_build_array(jsonb_build_object('kind', 'level', 'xp', 1000, 'realm', v_row.realm_id, 'level', v_row.working_level));
    end if;
  end loop;

  if v_total > 0 then
    insert into public.student_economy_wallets(student_id, xp_earned)
    values (p_student_id, v_total)
    on conflict (student_id) do update set
      xp_earned = public.student_economy_wallets.xp_earned + excluded.xp_earned,
      updated_at = now();
  end if;

  return jsonb_build_object('day', v_today, 'quests', v_quests, 'bonusXp', 50, 'awarded', v_awarded);
end;
$$;

create or replace function public.get_daily_quests_secure(p_student_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_today date := (timezone('Australia/Melbourne', now()))::date;
begin
  perform public.assert_student_read(p_student_id);
  return jsonb_build_object('day', v_today, 'quests', public.xp_daily_quests(p_student_id, v_today), 'bonusXp', 50, 'awarded', '[]'::jsonb);
end;
$$;

revoke all on function public.xp_quest_reward(text) from public, anon, authenticated;
revoke all on function public.xp_quest_target(text) from public, anon, authenticated;
revoke all on function public.xp_daily_quest_list(uuid, date) from public, anon, authenticated;
revoke all on function public.xp_first_lesson_attempts(uuid, timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function public.xp_accuracy_bonus(integer, integer) from public, anon, authenticated;
revoke all on function public.xp_quest_progress(uuid, text, date) from public, anon, authenticated;
revoke all on function public.xp_daily_quests(uuid, date) from public, anon, authenticated;
revoke all on function public.xp_reward_pay(uuid, text, text, integer, jsonb) from public, anon, authenticated;
revoke all on function public.claim_xp_rewards_secure(uuid) from public;
revoke all on function public.get_daily_quests_secure(uuid) from public;
grant execute on function public.claim_xp_rewards_secure(uuid) to anon, authenticated;
grant execute on function public.get_daily_quests_secure(uuid) to anon, authenticated;

commit;
