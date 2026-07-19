begin;

-- ── Global Gem Vault — Phase 4: milestone evaluator & award engine ──────────
-- One server-side engine reads canonical learning data, awards newly-satisfied
-- gems idempotently, and returns the newly-earned set for the reveal. Students
-- can never self-award: everything is derived from stored results, never trusted
-- client input. Canonical rules reused from the app:
--   explorer rank  = floor(sqrt(lifetime_xp / 75)) + 1   (EXPLORER_XP_LEVEL_BASE)
--   post-test pass = score >= 85    ·   weekly quiz pass = accuracy >= 80
--   realm level completed = a passed post-test in that realm
--   perfect lesson = 100% on the FIRST scored attempt (attempt_no = 1)

-- Current milestone totals for a student, from canonical tables only.
-- INTERNAL: no access check here; only the access-guarded wrappers below call
-- it, and execute is revoked from all client roles.
create or replace function public.gem_student_totals(p_student_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_lessons int; v_perfect int; v_wq_pass int; v_wq_perfect int;
  v_pre int; v_post int; v_streak int; v_xp int; v_rank int; v_legends int;
  v_realm jsonb; v_live int; v_live_expected int;
begin
  select count(distinct realm_id || '|' || working_level || '|' || week || '|' || lesson)
    into v_lessons
  from public.student_lesson_attempts
  where student_id = p_student_id and completed;

  select count(*) into v_perfect from (
    select 1
    from public.student_lesson_attempts
    where student_id = p_student_id and completed and attempt_no = 1 and accuracy_percent = 100
    group by realm_id, working_level, week, lesson
  ) t;

  select count(distinct quiz_id) into v_wq_pass
  from public.student_weekly_quiz_attempts
  where student_id = p_student_id and accuracy_percent >= 80;

  select count(distinct quiz_id) into v_wq_perfect
  from public.student_weekly_quiz_attempts
  where student_id = p_student_id and accuracy_percent = 100;

  select count(*) into v_pre from (
    select 1 from public.student_realm_progress
    where student_id = p_student_id and pretest_completed_at is not null
    group by realm_id, working_level
  ) t;

  select count(*) into v_post from (
    select 1 from public.student_realm_progress
    where student_id = p_student_id and posttest_score >= 85
    group by realm_id, working_level
  ) t;

  -- Longest consecutive-day streak (gaps & islands).
  select coalesce(max(cnt), 0) into v_streak from (
    select count(*) cnt from (
      select activity_date - (row_number() over (order by activity_date))::int as grp
      from public.student_activity_daily where student_id = p_student_id
    ) d group by grp
  ) s;

  select coalesce(xp_earned, 0) into v_xp
  from public.student_economy_wallets where student_id = p_student_id;
  v_xp := coalesce(v_xp, 0);
  v_rank := floor(sqrt(v_xp::numeric / 75)) + 1;

  select count(distinct l) into v_legends from (
    select jsonb_array_elements_text(unlocked_legends) l
    from public.student_realm_progress where student_id = p_student_id
  ) t;

  -- Per-realm levels completed + legends unlocked.
  select coalesce(jsonb_object_agg(realm_id, jsonb_build_object('levels', lv, 'legends', lg)), '{}'::jsonb)
    into v_realm
  from (
    select rp.realm_id,
      count(distinct case when rp.posttest_score >= 85 then rp.working_level end) as lv,
      count(distinct leg.l) as lg
    from public.student_realm_progress rp
    left join lateral jsonb_array_elements_text(rp.unlocked_legends) leg(l) on true
    where rp.student_id = p_student_id
    group by rp.realm_id
  ) r;

  -- "All live legends": expected total = sum of active realm-legend thresholds;
  -- actual = distinct legends unlocked across realms with active realm gems.
  select coalesce(sum(threshold), 0) into v_live_expected
  from public.gem_definitions
  where category = 'realm' and milestone_type = 'realm_legends_completed' and is_active;

  select count(distinct leg) into v_live from (
    select jsonb_array_elements_text(rp.unlocked_legends) leg
    from public.student_realm_progress rp
    where rp.student_id = p_student_id and rp.realm_id in (
      select distinct realm_id from public.gem_definitions
      where category = 'realm' and is_active and realm_id is not null)
  ) x;

  return jsonb_build_object(
    'lessons_completed', coalesce(v_lessons, 0),
    'perfect_lessons', coalesce(v_perfect, 0),
    'weekly_quizzes_passed', coalesce(v_wq_pass, 0),
    'perfect_weekly_quizzes', coalesce(v_wq_perfect, 0),
    'pretests_completed', coalesce(v_pre, 0),
    'posttests_passed', coalesce(v_post, 0),
    'streak_days', coalesce(v_streak, 0),
    'lifetime_xp', coalesce(v_xp, 0),
    'explorer_rank', coalesce(v_rank, 1),
    'legends_unlocked', coalesce(v_legends, 0),
    'all_live_legends', coalesce(v_live, 0),
    'all_live_expected', coalesce(v_live_expected, 0),
    'realm', coalesce(v_realm, '{}'::jsonb)
  );
end; $$;
revoke all on function public.gem_student_totals(uuid) from public, anon, authenticated;

-- The student's current value + target for one gem, given precomputed totals.
create or replace function public.gem_current_value(t jsonb, p_milestone text, p_realm text)
returns int
language sql immutable
as $$
  select case
    when p_realm is not null and p_milestone = 'realm_levels_completed'
      then coalesce((t->'realm'->p_realm->>'levels')::int, 0)
    when p_realm is not null and p_milestone = 'realm_legends_completed'
      then coalesce((t->'realm'->p_realm->>'legends')::int, 0)
    when p_milestone = 'all_live_legends' then coalesce((t->>'all_live_legends')::int, 0)
    else coalesce((t->>p_milestone)::int, 0)
  end;
$$;

-- Read the Gem Vault: active definitions (each with live progress) + owned +
-- favourite + totals. Replaces the Phase 3 version to add progress numbers.
create or replace function public.get_gem_vault_secure(p_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v jsonb; t jsonb;
begin
  perform public.assert_student_access(p_student_id);
  t := public.gem_student_totals(p_student_id);
  select jsonb_build_object(
    'definitions', coalesce((
      select jsonb_agg(
        to_jsonb(d)
        || jsonb_build_object('current', public.gem_current_value(t, d.milestone_type, d.realm_id))
        || jsonb_build_object('target', case when d.milestone_type = 'all_live_legends'
             then coalesce((t->>'all_live_expected')::int, 0) else d.threshold end)
        order by d.display_order, d.slug)
      from public.gem_definitions d where d.is_active
    ), '[]'::jsonb),
    'owned', coalesce((
      select jsonb_agg(jsonb_build_object(
        'gem_id', sg.gem_id, 'slug', gd.slug, 'earned_at', sg.earned_at, 'source_type', sg.source_type))
      from public.student_gems sg
      join public.gem_definitions gd on gd.id = sg.gem_id
      where sg.student_id = p_student_id
    ), '[]'::jsonb),
    'favourite_gem_id', (select favourite_gem_id from public.student_gem_display where student_id = p_student_id),
    'totals', t
  ) into v;
  return v;
end; $$;
revoke all on function public.get_gem_vault_secure(uuid) from public;
grant execute on function public.get_gem_vault_secure(uuid) to anon, authenticated;

-- Evaluate milestones and award any newly-satisfied gems (idempotent).
-- Returns { newly_awarded: [gem...], vault: {...} }.
create or replace function public.evaluate_gems_secure(
  p_student_id uuid,
  p_trigger text default 'manual',
  p_trigger_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  t jsonb; g record; cur int; target int; newly jsonb := '[]'::jsonb; ekey text;
begin
  perform public.assert_student_access(p_student_id);
  t := public.gem_student_totals(p_student_id);

  for g in
    select * from public.gem_definitions d
    where d.is_active
      and not exists (select 1 from public.student_gems sg
                      where sg.student_id = p_student_id and sg.gem_id = d.id)
  loop
    cur := public.gem_current_value(t, g.milestone_type, g.realm_id);
    target := case when g.milestone_type = 'all_live_legends'
                   then coalesce((t->>'all_live_expected')::int, 0) else g.threshold end;

    -- all_live requires at least one live realm (expected > 0) to be meaningful.
    if target > 0 and cur >= target then
      ekey := g.slug || ':' || coalesce(p_trigger_id, 'auto');
      insert into public.student_gems(student_id, gem_id, award_event_key, source_type, source_id)
      values (p_student_id, g.id, ekey, 'milestone', p_trigger_id)
      on conflict (student_id, gem_id) do nothing;
      if found then
        insert into public.gem_award_events(student_id, gem_id, event_key, trigger_type, trigger_id)
        values (p_student_id, g.id, ekey, p_trigger, p_trigger_id)
        on conflict (student_id, gem_id, event_key) do nothing;
        newly := newly || jsonb_build_array(to_jsonb(g));
      end if;
    end if;
  end loop;

  return jsonb_build_object('newly_awarded', newly, 'vault', public.get_gem_vault_secure(p_student_id));
end; $$;
revoke all on function public.evaluate_gems_secure(uuid, text, text) from public;
grant execute on function public.evaluate_gems_secure(uuid, text, text) to anon, authenticated;

commit;
