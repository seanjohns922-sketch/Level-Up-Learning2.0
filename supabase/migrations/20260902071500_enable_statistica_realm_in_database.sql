begin;

-- Enable the 'statistics' realm (Statistica) in the database.
--
-- WHY THIS FILE EXISTS: commit 419b1d0b added 'statistics' by editing three
-- migrations that Supabase had already applied weeks earlier
-- (20260724100000, 20260731103000, 20260814143000). Applied migrations are
-- never re-run, so those edits never reached the database: the live functions
-- still raise 'Invalid realm' for 'statistics', which is why teacher
-- placements, lesson completion, rewards and Realmies all fail for Statistica
-- while the UI shows the realm as live.
--
-- This migration re-applies exactly the objects those three files changed,
-- taken verbatim from their current (statistics-aware) definitions. Every
-- statement is idempotent: create-or-replace functions, drop-if-exists then
-- add constraints, and a backfill insert guarded by NOT EXISTS.
--
-- Do not edit an applied migration again. Add a new one.


-- ══ 1. From 20260724100000_enable_starpath_space_realm.sql ══════════════════
-- Completion receipts + economy constraints, and the five functions that gate
-- lesson/quiz completion, collectible discovery and progress reads/writes.

-- ── Table constraints ───────────────────────────────────────────────────────
alter table public.student_completion_receipts
  drop constraint if exists student_completion_receipts_realm_id_check;
alter table public.student_completion_receipts
  add constraint student_completion_receipts_realm_id_check
  check (realm_id in ('number', 'measurement', 'space', 'statistics'));

alter table public.economy_items
  drop constraint if exists economy_items_realm_id_check;
alter table public.economy_items
  add constraint economy_items_realm_id_check
  check (realm_id in ('number', 'measurement', 'space', 'statistics'));

-- ── complete_realm_lesson (widen realm guard to include 'space') ─────────────
create or replace function public.complete_realm_lesson(
  p_student_id uuid,
  p_class_id uuid,
  p_realm_id text,
  p_program_key text,
  p_school_year_level text,
  p_working_level text,
  p_week integer,
  p_lesson integer,
  p_lesson_id text,
  p_completion_key uuid,
  p_attempt jsonb default '{}'::jsonb,
  p_xp integer default 40
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
  actual_class_id uuid;
  reward_eligible boolean;
  questions_answered integer := greatest(coalesce(nullif(p_attempt->>'questionsAnswered', '')::integer, 0), 0);
  correct_answers integer := greatest(coalesce(nullif(p_attempt->>'correctAnswers', '')::integer, 0), 0);
begin
  perform public.assert_student_access(p_student_id);
  select s.class_id into actual_class_id from public.students s where s.id = p_student_id;
  if p_class_id is distinct from actual_class_id or p_realm_id not in ('number', 'measurement', 'space', 'statistics') then
    raise exception 'Student context does not match';
  end if;

  insert into public.student_completion_receipts(student_id, realm_id, activity_type, completion_key)
  values (p_student_id, p_realm_id, 'lesson', p_completion_key)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;

  -- Serialize different browser/session keys for the same logical lesson.
  perform pg_advisory_xact_lock(
    hashtext(p_student_id::text),
    hashtext(concat_ws(':', p_realm_id, p_working_level, p_week::text, p_lesson::text))
  );

  select not exists (
    select 1
    from public.student_lesson_attempts sla
    where sla.student_id = p_student_id
      and sla.realm_id = p_realm_id
      and sla.working_level = p_working_level
      and sla.week = p_week
      and sla.lesson = p_lesson
      and sla.completed
  ) into reward_eligible;

  perform public.save_realm_lesson_attempt(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, p_week, p_lesson, p_lesson_id, p_attempt
  );

  if reward_eligible then
    perform public.apply_completion_xp(
      p_student_id,
      actual_class_id,
      questions_answered,
      least(correct_answers, questions_answered),
      1,
      0,
      p_xp,
      'lesson_completion',
      p_completion_key::text,
      jsonb_build_object(
        'realm_id', p_realm_id,
        'program_key', p_program_key,
        'working_level', p_working_level,
        'week', p_week,
        'lesson', p_lesson,
        'lesson_id', p_lesson_id,
        'reward_attempt', 1
      )
    );
  else
    perform public.upsert_student_activity_daily(
      p_student_id,
      actual_class_id,
      (timezone('Australia/Melbourne', now()))::date,
      questions_answered,
      least(correct_answers, questions_answered),
      0,
      0,
      0,
      0
    );
  end if;

  return reward_eligible;
end;
$$;

-- ── complete_realm_quiz (widen realm guard to include 'space') ───────────────
create or replace function public.complete_realm_quiz(
  p_student_id uuid,
  p_class_id uuid,
  p_realm_id text,
  p_program_key text,
  p_school_year_level text,
  p_working_level text,
  p_week integer,
  p_quiz_id text,
  p_completion_key uuid,
  p_attempt jsonb default '{}'::jsonb,
  p_xp integer default 0
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
  actual_class_id uuid;
  reward_eligible boolean;
  questions_answered integer := greatest(coalesce(nullif(p_attempt->>'total', '')::integer, 0), 0);
  correct_answers integer := greatest(coalesce(nullif(p_attempt->>'score', '')::integer, 0), 0);
begin
  perform public.assert_student_access(p_student_id);
  select s.class_id into actual_class_id from public.students s where s.id = p_student_id;
  if p_class_id is distinct from actual_class_id or p_realm_id not in ('number', 'measurement', 'space', 'statistics') then
    raise exception 'Student context does not match';
  end if;

  insert into public.student_completion_receipts(student_id, realm_id, activity_type, completion_key)
  values (p_student_id, p_realm_id, 'quiz', p_completion_key)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;

  perform pg_advisory_xact_lock(
    hashtext(p_student_id::text),
    hashtext(concat_ws(':', p_realm_id, p_working_level, p_week::text, p_quiz_id))
  );

  select not exists (
    select 1
    from public.student_weekly_quiz_attempts swqa
    where swqa.student_id = p_student_id
      and swqa.realm_id = p_realm_id
      and swqa.working_level = p_working_level
      and swqa.week = p_week
      and swqa.quiz_id = p_quiz_id
  ) into reward_eligible;

  perform public.save_realm_weekly_quiz_attempt(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, p_week, p_quiz_id, p_attempt
  );

  if reward_eligible then
    perform public.apply_completion_xp(
      p_student_id,
      actual_class_id,
      questions_answered,
      least(correct_answers, questions_answered),
      0,
      1,
      p_xp,
      'quiz_completion',
      p_completion_key::text,
      jsonb_build_object(
        'realm_id', p_realm_id,
        'program_key', p_program_key,
        'working_level', p_working_level,
        'week', p_week,
        'quiz_id', p_quiz_id,
        'reward_attempt', 1
      )
    );
  else
    perform public.upsert_student_activity_daily(
      p_student_id,
      actual_class_id,
      (timezone('Australia/Melbourne', now()))::date,
      questions_answered,
      least(correct_answers, questions_answered),
      0,
      0,
      0,
      0
    );
  end if;

  return reward_eligible;
end;
$$;

-- ── discover_realm_collectible_secure (widen realm guard) ────────────────────
-- Space has no discoverable catalog items yet, so this simply returns null for
-- 'space' until items exist — but it must not raise 'Invalid realm'.
create or replace function public.discover_realm_collectible_secure(
  p_student_id uuid,
  p_realm_id text,
  p_completion_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  desired_rarity text;
  discovered public.economy_items%rowtype;
  duplicate_item boolean;
  essence_award integer := 0;
  inserted_count integer;
  roll double precision := random();
begin
  perform public.assert_student_access(p_student_id);
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics') then raise exception 'Invalid realm'; end if;
  if not exists (
    select 1 from public.student_completion_receipts scr
    where scr.student_id = p_student_id
      and scr.realm_id = p_realm_id
      and scr.activity_type = 'lesson'
      and scr.completion_key = p_completion_key
  ) then
    raise exception 'A completed lesson is required';
  end if;

  desired_rarity := case
    when roll < 0.02 then 'legendary'
    when roll < 0.10 then 'epic'
    when roll < 0.30 then 'rare'
    when roll < 0.60 then 'uncommon'
    else 'common'
  end;

  select * into discovered
  from public.economy_items i
  where i.active and i.discoverable and i.realm_id = p_realm_id
  order by
    case when i.rarity = desired_rarity then 0 else 1 end,
    case i.rarity when 'common' then 1 when 'uncommon' then 2 when 'rare' then 3 when 'epic' then 4 else 5 end,
    random()
  limit 1;
  if discovered.item_key is null then return null; end if;

  duplicate_item := exists(
    select 1 from public.student_inventory
    where student_id = p_student_id and item_key = discovered.item_key
  );
  essence_award := case when duplicate_item then
    case discovered.rarity when 'common' then 5 when 'uncommon' then 10 when 'rare' then 20 when 'epic' then 35 else 60 end
    else 0 end;

  insert into public.student_economy_transactions(
    student_id, transaction_type, essence_delta, source_type, source_key, item_key,
    metadata
  ) values (
    p_student_id,
    case when duplicate_item then 'duplicate' else 'discovery' end,
    essence_award,
    'lesson_discovery',
    p_completion_key::text,
    discovered.item_key,
    jsonb_build_object('realm_id', p_realm_id, 'rarity', discovered.rarity)
  ) on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return null; end if;

  if duplicate_item then
    insert into public.student_economy_wallets(student_id, essence)
    values (p_student_id, essence_award)
    on conflict (student_id) do update set
      essence = public.student_economy_wallets.essence + excluded.essence,
      updated_at = now();
  else
    insert into public.student_inventory(student_id, item_key, acquisition_type)
    values (p_student_id, discovered.item_key, 'discovery');
  end if;

  return jsonb_build_object(
    'item_key', discovered.item_key,
    'name', discovered.name,
    'rarity', discovered.rarity,
    'icon', discovered.icon,
    'accent', discovered.accent,
    'duplicate', duplicate_item,
    'essence_awarded', essence_award
  );
end;
$$;

-- ── get_student_realm_progress_compat_secure (widen realm guard) ─────────────
create or replace function public.get_student_realm_progress_compat_secure(
  p_student_id uuid,
  p_realm_id text
)
returns table(
  student_id uuid,
  class_id uuid,
  realm_id text,
  program_key text,
  school_year_level text,
  working_level text,
  is_current boolean,
  status text,
  current_week integer,
  assigned_week integer,
  placement_complete boolean,
  pretest_score integer,
  pretest_completed_at timestamptz,
  posttest_score integer,
  posttest_completed_at timestamptz,
  required_weeks jsonb,
  optional_weeks jsonb,
  unlocked_legends jsonb,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics') then
    raise exception 'Invalid realm';
  end if;
  return query select * from public.get_student_realm_progress_compat(p_student_id, p_realm_id);
end;
$$;

-- ── save_student_realm_progress_secure (widen realm guard) ───────────────────
create or replace function public.save_student_realm_progress_secure(
  p_student_id uuid,
  p_class_id uuid,
  p_realm_id text,
  p_program_key text,
  p_school_year_level text,
  p_working_level text,
  p_data jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actual_class_id uuid;
begin
  perform public.assert_student_access(p_student_id);
  select s.class_id into actual_class_id from public.students s where s.id = p_student_id;
  if p_class_id is distinct from actual_class_id or p_realm_id not in ('number', 'measurement', 'space', 'statistics') then
    raise exception 'Student context does not match';
  end if;
  perform public.save_student_realm_progress(
    p_student_id, actual_class_id, p_realm_id, p_program_key,
    p_school_year_level, p_working_level, p_data
  );
end;
$$;


-- ══ 2. From 20260731103000_correct_realmies_to_discovery_model.sql ══════════
-- Realmie catalogue / receipt / event constraints and the discovery engine.

alter table public.realmie_catalogue
  add column if not exists is_collectible boolean not null default true,
  add column if not exists retired_at timestamptz,
  add column if not exists retirement_reason text;

alter table public.realmie_catalogue
  drop constraint if exists realmie_catalogue_realm_id_check,
  drop constraint if exists realmie_catalogue_category_check,
  drop constraint if exists realmie_catalogue_asset_path_check,
  drop constraint if exists realmie_catalogue_silhouette_asset_path_check;

alter table public.realmie_catalogue
  add constraint realmie_catalogue_realm_id_check
    check (realm_id in ('number', 'measurement', 'space', 'statistics', 'global')),
  add constraint realmie_catalogue_category_check
    check (category in (
      'legend', 'villain', 'variant', 'event',
      'realm_citizen', 'realm_creature', 'helper', 'guardian',
      'explorer', 'fog_creature', 'special', 'seasonal'
    )),
  add constraint realmie_catalogue_asset_path_check
    check (
      asset_path is null
      or asset_path ~ '^/realmies/(number|measurement|space|global)/[a-z0-9-]+\.(png|webp)$'
    ),
  add constraint realmie_catalogue_silhouette_asset_path_check
    check (
      silhouette_asset_path is null
      or silhouette_asset_path ~ '^/realmies/(number|measurement|space|global)/[a-z0-9-]+-silhouette\.(png|webp)$'
    );

alter table public.realmie_unlock_receipts
  alter column canonical_realm_id drop not null,
  alter column canonical_working_level drop not null,
  drop constraint if exists realmie_unlock_receipts_canonical_realm_id_check;

alter table public.realmie_unlock_receipts
  add constraint realmie_unlock_receipts_canonical_realm_id_check
    check (
      canonical_realm_id is null
      or canonical_realm_id in ('number', 'measurement', 'space', 'statistics', 'global')
    );

alter table public.realmie_product_events
  drop constraint if exists realmie_product_events_event_name_check,
  drop constraint if exists realmie_product_events_realm_id_check;

alter table public.realmie_product_events
  add constraint realmie_product_events_event_name_check
    check (event_name in (
      -- Historical names remain valid for immutable telemetry rows.
      'realmies_room_opened',
      'realmie_unlock_viewed',
      -- Canonical discovery-product telemetry.
      'realmie_discovery_shown',
      'realmie_collection_opened',
      'realmie_detail_viewed',
      'realmie_lore_viewed',
      'realmie_favourited',
      'realmie_display_added',
      'realmie_display_removed',
      'realmie_clue_viewed'
    )),
  add constraint realmie_product_events_realm_id_check
    check (
      realm_id is null
      or realm_id in ('number', 'measurement', 'space', 'statistics', 'global')
    );

-- realmie_discovery_rules carries its realm check inline in a
-- `create table if not exists`, so the table already exists and never picked
-- up 'statistics'. Swap the constraint explicitly.
alter table public.realmie_discovery_rules
  drop constraint if exists realmie_discovery_rules_realm_id_check;
alter table public.realmie_discovery_rules
  add constraint realmie_discovery_rules_realm_id_check
    check (realm_id in ('number', 'measurement', 'space', 'statistics', 'global'));

-- NOTE (flagged for review): the asset-path checks below were NOT touched by
-- 419b1d0b and still exclude 'statistics', so a Statistica realmie artwork row
-- (/realmies/statistics/...) would be rejected. Widened here for parity — this
-- only loosens the constraint. Drop this block if Statistica realmie art is
-- meant to live under a different path.
alter table public.realmie_catalogue
  drop constraint if exists realmie_catalogue_asset_path_check,
  drop constraint if exists realmie_catalogue_silhouette_asset_path_check;
alter table public.realmie_catalogue
  add constraint realmie_catalogue_asset_path_check
    check (
      asset_path is null
      or asset_path ~ '^/realmies/(number|measurement|space|statistics|global)/[a-z0-9-]+\.(png|webp)$'
    ),
  add constraint realmie_catalogue_silhouette_asset_path_check
    check (
      silhouette_asset_path is null
      or silhouette_asset_path ~ '^/realmies/(number|measurement|space|statistics|global)/[a-z0-9-]+-silhouette\.(png|webp)$'
    );


-- ── evaluate_realmie_discoveries_internal ──

create or replace function public.evaluate_realmie_discoveries_internal(
  p_student_id uuid,
  p_event_type text default 'canonical_refresh',
  p_realm_id text default null,
  p_context jsonb default '{}'::jsonb,
  p_is_backfill boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rule record;
  v_eligible boolean;
  v_evidence_count integer;
  v_inserted integer;
  v_granted integer := 0;
  v_already_owned integer := 0;
  v_realm_counts jsonb := '{}'::jsonb;
  v_quiz_counts jsonb := '{}'::jsonb;
  v_global_lessons integer := 0;
  v_longest_streak integer := 0;
  v_source_type text;
  v_source_key text;
begin
  if p_event_type not in (
    'canonical_refresh', 'lesson_completion', 'weekly_quiz_completion',
    'streak_refresh', 'special_event', 'backfill'
  ) then
    raise exception 'Unsupported Realmie discovery event';
  end if;

  if p_realm_id is not null
    and p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'global') then
    raise exception 'Unsupported Realmie discovery realm';
  end if;

  select coalesce(jsonb_object_agg(counts.realm_id, counts.completed_count), '{}'::jsonb)
  into v_realm_counts
  from (
    select unique_lessons.realm_id, count(*)::integer as completed_count
    from (
      select distinct attempt.realm_id, attempt.working_level, attempt.week, attempt.lesson
      from public.student_lesson_attempts attempt
      where attempt.student_id = p_student_id
        and attempt.completed
        and attempt.realm_id in ('number', 'measurement', 'space', 'statistics')
        and public.realmie_attempt_is_canonical(attempt.summary)
    ) unique_lessons
    group by unique_lessons.realm_id
  ) counts;

  select coalesce(sum((value)::integer), 0)
  into v_global_lessons
  from jsonb_each_text(v_realm_counts);

  select coalesce(jsonb_object_agg(counts.realm_id, counts.passed_count), '{}'::jsonb)
  into v_quiz_counts
  from (
    select unique_quizzes.realm_id, count(*)::integer as passed_count
    from (
      select distinct attempt.realm_id, attempt.working_level, attempt.week
      from public.student_weekly_quiz_attempts attempt
      where attempt.student_id = p_student_id
        and attempt.realm_id in ('number', 'measurement', 'space', 'statistics')
        and attempt.passed
        and attempt.accuracy_percent >= 80
        and public.realmie_attempt_is_canonical(attempt.summary)
    ) unique_quizzes
    group by unique_quizzes.realm_id
  ) counts;

  -- Reuse the platform's existing canonical streak source and exact gaps-and-
  -- islands definition from gem_student_totals. Do not infer a second streak
  -- from lesson, quiz, telemetry or session rows.
  select coalesce(max(streak.streak_length), 0)
  into v_longest_streak
  from (
    select count(*)::integer as streak_length
    from (
      select
        activity.activity_date
          - (row_number() over (order by activity.activity_date))::integer
            as streak_group
      from public.student_activity_daily activity
      where activity.student_id = p_student_id
    ) grouped_days
    group by grouped_days.streak_group
  ) streak;

  for v_rule in
    select
      rule.*,
      catalogue.realmie_key,
      catalogue.display_name,
      catalogue.rarity
    from public.realmie_discovery_rules rule
    join public.realmie_catalogue catalogue on catalogue.id = rule.realmie_id
    where rule.is_active
      and catalogue.is_active
      and catalogue.is_collectible
      and (
        p_realm_id is null
        or rule.realm_id = p_realm_id
        or rule.realm_id = 'global'
      )
    order by catalogue.collection_order
  loop
    v_eligible := false;
    v_evidence_count := 0;

    case v_rule.rule_type
      when 'first_realm_lesson_completed' then
        v_evidence_count := coalesce((v_realm_counts->>v_rule.realm_id)::integer, 0);
        v_eligible := v_evidence_count >= 1;
      when 'realm_lessons_completed_count' then
        v_evidence_count := coalesce((v_realm_counts->>v_rule.realm_id)::integer, 0);
        v_eligible := v_evidence_count >= v_rule.threshold;
      when 'realm_weekly_quizzes_passed_count' then
        v_evidence_count := coalesce((v_quiz_counts->>v_rule.realm_id)::integer, 0);
        v_eligible := v_evidence_count >= v_rule.threshold;
      when 'global_lessons_completed_count' then
        v_evidence_count := v_global_lessons;
        v_eligible := v_evidence_count >= v_rule.threshold;
      when 'canonical_learning_streak' then
        v_evidence_count := v_longest_streak;
        v_eligible := v_evidence_count >= v_rule.threshold;
      when 'special_event' then
        v_evidence_count := 1;
        v_eligible := p_event_type = 'special_event'
          and nullif(p_context->>'event_key', '') is not null
          and p_context->>'event_key' = v_rule.rule_payload->>'event_key';
      else
        v_eligible := false;
    end case;

    if not v_eligible then
      continue;
    end if;

    v_source_type := case
      when p_is_backfill then 'canonical_discovery_backfill'
      when v_rule.rule_type = 'realm_weekly_quizzes_passed_count' then 'canonical_weekly_quiz_discovery'
      when v_rule.rule_type = 'canonical_learning_streak' then 'canonical_streak_discovery'
      when v_rule.rule_type = 'special_event' then 'special_event_discovery'
      else 'canonical_lesson_discovery'
    end;
    v_source_key := 'discovery-rule:' || v_rule.rule_key;

    insert into public.student_realmies (
      student_id, realmie_id, earned_at, source_type, source_key, source_payload
    )
    values (
      p_student_id,
      v_rule.realmie_id,
      now(),
      v_source_type,
      v_source_key,
      jsonb_build_object(
        'rule_key', v_rule.rule_key,
        'rule_type', v_rule.rule_type,
        'evidence_count', v_evidence_count,
        'threshold', v_rule.threshold,
        'event_type', p_event_type
      )
    )
    on conflict (student_id, realmie_id) do nothing;
    get diagnostics v_inserted = row_count;

    insert into public.realmie_unlock_receipts (
      student_id, realmie_id, source_type, source_key, idempotency_key,
      canonical_realm_id, canonical_working_level, canonical_assessment_id,
      context, is_backfill
    )
    values (
      p_student_id,
      v_rule.realmie_id,
      v_source_type,
      v_source_key,
      'realmie-discovery:' || p_student_id::text || ':' || v_rule.realmie_key,
      v_rule.realm_id,
      nullif(p_context->>'working_level', ''),
      null,
      jsonb_build_object(
        'rule_key', v_rule.rule_key,
        'rule_type', v_rule.rule_type,
        'evidence_count', v_evidence_count,
        'threshold', v_rule.threshold,
        'event_type', p_event_type
      ),
      p_is_backfill
    )
    on conflict do nothing;

    if v_inserted = 1 then
      v_granted := v_granted + 1;

      if p_is_backfill then
        insert into public.student_realmie_backfill_state (
          student_id, unseen_backfill_realmie_count, latest_backfill_at,
          acknowledged_at, updated_at
        )
        values (p_student_id, 1, now(), null, now())
        on conflict (student_id) do update set
          unseen_backfill_realmie_count =
            public.student_realmie_backfill_state.unseen_backfill_realmie_count + 1,
          latest_backfill_at = now(),
          acknowledged_at = null,
          updated_at = now();
      end if;
    else
      v_already_owned := v_already_owned + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'student_id', p_student_id,
    'granted', v_granted,
    'already_owned', v_already_owned,
    'realm_lesson_counts', v_realm_counts,
    'realm_passed_quiz_counts', v_quiz_counts,
    'global_unique_lessons', v_global_lessons,
    'longest_learning_streak', v_longest_streak
  );
end;
$$;

revoke all on function public.evaluate_realmie_discoveries_internal(
  uuid, text, text, jsonb, boolean
) from public, anon, authenticated;

-- ── realmie discovery triggers (lesson + quiz) ──

create or replace function public.evaluate_realmie_lesson_attempt_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.completed
    and new.realm_id in ('number', 'measurement', 'space', 'statistics')
    and public.realmie_attempt_is_canonical(new.summary) then
    perform public.evaluate_realmie_discoveries_internal(
      new.student_id,
      'lesson_completion',
      new.realm_id,
      jsonb_build_object(
        'attempt_id', new.id,
        'working_level', new.working_level,
        'week', new.week,
        'lesson', new.lesson
      ),
      false
    );
  end if;
  return null;
end;
$$;

create or replace function public.evaluate_realmie_quiz_attempt_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.passed
    and new.accuracy_percent >= 80
    and new.realm_id in ('number', 'measurement', 'space', 'statistics')
    and public.realmie_attempt_is_canonical(new.summary) then
    perform public.evaluate_realmie_discoveries_internal(
      new.student_id,
      'weekly_quiz_completion',
      new.realm_id,
      jsonb_build_object(
        'attempt_id', new.id,
        'working_level', new.working_level,
        'week', new.week
      ),
      false
    );
  end if;
  return null;
end;
$$;

drop trigger if exists trg_evaluate_realmie_lesson_discoveries
  on public.student_lesson_attempts;
create constraint trigger trg_evaluate_realmie_lesson_discoveries
after insert on public.student_lesson_attempts
deferrable initially deferred
for each row
execute function public.evaluate_realmie_lesson_attempt_trigger();

drop trigger if exists trg_evaluate_realmie_quiz_discoveries
  on public.student_weekly_quiz_attempts;
create constraint trigger trg_evaluate_realmie_quiz_discoveries
after insert on public.student_weekly_quiz_attempts
deferrable initially deferred
for each row
execute function public.evaluate_realmie_quiz_attempt_trigger();

revoke all on function public.evaluate_realmie_lesson_attempt_trigger()
  from public, anon, authenticated;
revoke all on function public.evaluate_realmie_quiz_attempt_trigger()
  from public, anon, authenticated;

-- ── complete_realm_assessment ──

-- Restore assessment completion to its canonical progression-only role.
create or replace function public.complete_realm_assessment(
  p_student_id uuid,
  p_class_id uuid,
  p_realm_id text,
  p_program_key text,
  p_school_year_level text,
  p_working_level text,
  p_assessment_type text,
  p_completion_key uuid,
  p_attempt jsonb default '{}'::jsonb,
  p_progress jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
  actual_class_id uuid;
  effective_progress jsonb := coalesce(p_progress, '{}'::jsonb);
  assessment_percent integer := coalesce(
    nullif(p_attempt->>'score_percent', '')::integer,
    nullif(p_attempt->>'percent', '')::integer,
    0
  );
  full_program_weeks jsonb;
begin
  perform public.assert_student_access(p_student_id);
  select s.class_id into actual_class_id from public.students s where s.id = p_student_id;
  if p_class_id is distinct from actual_class_id
    or p_realm_id not in ('number', 'measurement', 'space', 'statistics')
    or p_assessment_type not in ('pretest', 'posttest') then
    raise exception 'Student context does not match';
  end if;

  -- Preserve the canonical assessment completion concurrency guard while
  -- removing only the retired post-test Realmie grant.
  perform pg_advisory_xact_lock(
    hashtextextended(
      p_student_id::text || ':' || p_realm_id || ':' ||
      p_working_level || ':' || p_assessment_type,
      0
    )
  );

  if p_assessment_type = 'pretest'
    and assessment_percent < 50
    and nullif(effective_progress->>'next_working_level', '') is null then
    full_program_weeks := case
      when p_realm_id = 'number' then '[1,2,3,4,5,6,7,8,9,10,11,12]'::jsonb
      else '[1,2,3,4,5,6,7,8]'::jsonb
    end;
    effective_progress := effective_progress || jsonb_build_object(
      'current_week', 1,
      'assigned_week', 1,
      'required_weeks', full_program_weeks,
      'optional_weeks', '[]'::jsonb
    );
  end if;

  insert into public.student_completion_receipts(
    student_id, realm_id, activity_type, completion_key
  )
  values (p_student_id, p_realm_id, p_assessment_type, p_completion_key)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;

  perform public.save_realm_assessment(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, p_assessment_type, p_attempt
  );
  perform public.save_student_realm_progress(
    p_student_id, actual_class_id, p_realm_id, p_program_key, p_school_year_level,
    p_working_level, effective_progress
  );

  if p_assessment_type = 'pretest'
    and nullif(effective_progress->>'next_working_level', '') is not null then
    perform public.save_student_realm_progress(
      p_student_id,
      actual_class_id,
      p_realm_id,
      lower(replace(effective_progress->>'next_working_level', ' ', '')) ||
        case when p_realm_id = 'measurement' then '-measurelands'
             when p_realm_id = 'space' then '-starpath'
             else '-number' end,
      p_school_year_level,
      effective_progress->>'next_working_level',
      jsonb_build_object(
        'status', 'ASSIGNED_PROGRAM',
        'current_week', 1,
        'assigned_week', 1,
        'placement_complete', false,
        'required_weeks', '[]'::jsonb,
        'optional_weeks', '[]'::jsonb,
        'unlocked_legends', coalesce(effective_progress->'unlocked_legends', '[]'::jsonb)
      )
    );
  end if;

  return true;
end;
$$;

-- ── backfill_realmie_discoveries_internal ──

create or replace function public.backfill_realmie_discoveries_internal()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student record;
  v_result jsonb;
  v_students_examined integer := 0;
  v_realmies_granted integer := 0;
begin
  for v_student in
    select distinct evidence.student_id
    from (
      select student_id
      from public.student_lesson_attempts
      where completed
        and realm_id in ('number', 'measurement', 'space', 'statistics')
        and public.realmie_attempt_is_canonical(summary)
      union
      select student_id
      from public.student_weekly_quiz_attempts
      where passed
        and accuracy_percent >= 80
        and realm_id in ('number', 'measurement', 'space', 'statistics')
        and public.realmie_attempt_is_canonical(summary)
    ) evidence
  loop
    v_students_examined := v_students_examined + 1;
    v_result := public.evaluate_realmie_discoveries_internal(
      v_student.student_id, 'backfill', null, '{}'::jsonb, true
    );
    v_realmies_granted :=
      v_realmies_granted + coalesce((v_result->>'granted')::integer, 0);
  end loop;

  return jsonb_build_object(
    'students_examined', v_students_examined,
    'realmies_granted', v_realmies_granted,
    'xp_awarded', 0,
    'gems_awarded', 0,
    'cards_awarded', 0,
    'progression_changed', false
  );
end;
$$;

revoke all on function public.backfill_realmie_discoveries_internal()
  from public, anon, authenticated;

-- ── record_realmie_product_event_secure ──

create or replace function public.record_realmie_product_event_secure(
  p_student_id uuid,
  p_event_name text,
  p_realmie_id uuid default null,
  p_realm_id text default null,
  p_source_screen text default 'unknown',
  p_session_id text default null,
  p_context jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
  v_context jsonb := coalesce(p_context, '{}'::jsonb);
begin
  perform public.assert_realmie_student_self_access(p_student_id);

  if p_event_name not in (
    'realmie_discovery_shown',
    'realmie_collection_opened',
    'realmie_detail_viewed',
    'realmie_lore_viewed',
    'realmie_favourited',
    'realmie_display_added',
    'realmie_display_removed',
    'realmie_clue_viewed'
  ) then
    raise exception 'Unsupported Realmies telemetry event';
  end if;

  if p_realm_id is not null
    and p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'global') then
    raise exception 'Unsupported Realmies telemetry realm';
  end if;

  if jsonb_typeof(v_context) <> 'object'
    or octet_length(v_context::text) > 2048 then
    raise exception 'Realmies telemetry context is invalid';
  end if;

  v_context := jsonb_strip_nulls(jsonb_build_object(
    'collection_filter', v_context->'collection_filter',
    'display_slot', v_context->'display_slot',
    'owned', v_context->'owned',
    'rarity', v_context->'rarity',
    'unlock_source', v_context->'unlock_source',
    'rule_key', v_context->'rule_key',
    'clue_key', v_context->'clue_key'
  ));

  insert into public.realmie_product_events(
    student_id, event_name, realmie_id, realm_id, source_screen,
    session_id, context
  )
  values (
    p_student_id,
    p_event_name,
    p_realmie_id,
    p_realm_id,
    left(coalesce(nullif(trim(p_source_screen), ''), 'unknown'), 80),
    left(nullif(trim(p_session_id), ''), 100),
    v_context
  )
  returning id into v_event_id;

  return v_event_id;
end;
$$;


-- ══ 3. From 20260814143000_enable_starpath_teacher_placements.sql ═══════════
-- realm_program_key (statistics -> statistica), teacher placement, the
-- placement backfill and teacher_advance_student_week. This is the block that
-- unblocks "Placements were not fully saved" on the Statistica screen.

create or replace function public.realm_program_key(p_level text, p_realm_id text)
returns text
language sql
immutable
as $$
  select lower(replace(coalesce(p_level, ''), ' ', ''))
    || '-'
    || case
      when p_realm_id = 'measurement' then 'measurelands'
      when p_realm_id = 'space' then 'starpath'
      when p_realm_id = 'statistics' then 'statistica'
      else 'number'
    end;
$$;

create or replace function public.teacher_change_starting_level(
  p_student_id uuid,
  p_realm_id text,
  p_assigned_level text,
  p_entry_mode text default 'pretest'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher uuid := auth.uid();
  v_entry text := coalesce(nullif(trim(p_entry_mode), ''), 'pretest');
  v_old text;
  v_has_progress boolean;
  v_has_established_progress boolean;
  v_class_id uuid;
  v_school_year_level text;
begin
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics') then
    raise exception 'Invalid realm';
  end if;
  if p_assigned_level not in ('Prep', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6') then
    raise exception 'Invalid assigned level';
  end if;
  if v_entry not in ('pretest', 'full_level', 'ground_week1') then
    raise exception 'Invalid entry mode';
  end if;
  if not public.teacher_owns_student(p_student_id) then
    raise exception 'Not authorized for this student' using errcode = '42501';
  end if;

  select s.class_id, coalesce(s.school_year_level, s.year_level)
  into v_class_id, v_school_year_level
  from public.students s
  where s.id = p_student_id;

  if v_class_id is null then
    raise exception 'Student class context is missing';
  end if;

  select placement.assigned_start_level
  into v_old
  from public.student_realm_placement placement
  where placement.student_id = p_student_id
    and placement.realm_id = p_realm_id;

  insert into public.student_realm_placement (
    student_id, realm_id, assigned_start_level, assigned_entry_mode,
    placement_source, placement_assigned_by, placement_assigned_at, updated_at
  ) values (
    p_student_id, p_realm_id, p_assigned_level, v_entry,
    'teacher', v_teacher, now(), now()
  )
  on conflict (student_id, realm_id) do update set
    assigned_start_level = excluded.assigned_start_level,
    assigned_entry_mode = excluded.assigned_entry_mode,
    placement_source = 'teacher',
    placement_assigned_by = excluded.placement_assigned_by,
    placement_assigned_at = now(),
    updated_at = now();

  select exists (
    select 1
    from public.student_realm_progress progress
    where progress.student_id = p_student_id
      and progress.realm_id = p_realm_id
  )
  into v_has_progress;

  select
    exists (
      select 1
      from public.student_realm_progress progress
      where progress.student_id = p_student_id
        and progress.realm_id = p_realm_id
        and (
          progress.pretest_score is not null
          or progress.posttest_score is not null
          or progress.pretest_completed_at is not null
          or progress.posttest_completed_at is not null
        )
    )
    or exists (
      select 1
      from public.student_lesson_attempts attempt
      where attempt.student_id = p_student_id
        and attempt.realm_id = p_realm_id
    )
    or exists (
      select 1
      from public.student_weekly_quiz_attempts attempt
      where attempt.student_id = p_student_id
        and attempt.realm_id = p_realm_id
    )
    or exists (
      select 1
      from public.student_realm_assessments assessment
      where assessment.student_id = p_student_id
        and assessment.realm_id = p_realm_id
    )
  into v_has_established_progress;

  if not v_has_progress then
    insert into public.student_realm_progress (
      student_id, class_id, realm_id, program_key, school_year_level,
      working_level, is_current, status, current_week, assigned_week,
      placement_complete, required_weeks, optional_weeks
    ) values (
      p_student_id, v_class_id, p_realm_id,
      public.realm_program_key(p_assigned_level, p_realm_id),
      v_school_year_level, p_assigned_level, true, 'ASSIGNED_PROGRAM',
      case when v_entry = 'pretest' then null else 1 end,
      case when v_entry = 'pretest' then null else 1 end,
      v_entry <> 'pretest', '[]'::jsonb, '[]'::jsonb
    );
  elsif not v_has_established_progress then
    update public.student_realm_progress
    set is_current = false
    where student_id = p_student_id
      and realm_id = p_realm_id
      and working_level <> p_assigned_level
      and is_current;

    insert into public.student_realm_progress (
      student_id, class_id, realm_id, program_key, school_year_level,
      working_level, is_current, status, current_week, assigned_week,
      placement_complete, pretest_score, pretest_completed_at,
      posttest_score, posttest_completed_at, required_weeks, optional_weeks
    ) values (
      p_student_id, v_class_id, p_realm_id,
      public.realm_program_key(p_assigned_level, p_realm_id),
      v_school_year_level, p_assigned_level, true, 'ASSIGNED_PROGRAM',
      case when v_entry = 'pretest' then null else 1 end,
      case when v_entry = 'pretest' then null else 1 end,
      v_entry <> 'pretest', null, null, null, null, '[]'::jsonb, '[]'::jsonb
    )
    on conflict (student_id, realm_id, working_level) do update set
      class_id = excluded.class_id,
      program_key = excluded.program_key,
      school_year_level = excluded.school_year_level,
      is_current = true,
      status = excluded.status,
      current_week = excluded.current_week,
      assigned_week = excluded.assigned_week,
      placement_complete = excluded.placement_complete,
      pretest_score = null,
      pretest_completed_at = null,
      posttest_score = null,
      posttest_completed_at = null,
      required_weeks = '[]'::jsonb,
      optional_weeks = '[]'::jsonb,
      updated_at = now();
  end if;

  insert into public.teacher_realm_actions (
    teacher_id, student_id, realm_id, action, old_value, new_value
  ) values (
    v_teacher, p_student_id, p_realm_id, 'placement_changed', v_old, p_assigned_level
  );
end;
$$;

revoke all on function public.teacher_change_starting_level(uuid, text, text, text)
  from public, anon;
grant execute on function public.teacher_change_starting_level(uuid, text, text, text)
  to authenticated;

insert into public.student_realm_progress (
  student_id, class_id, realm_id, program_key, school_year_level,
  working_level, is_current, status, current_week, assigned_week,
  placement_complete, required_weeks, optional_weeks
)
select
  placement.student_id,
  student.class_id,
  placement.realm_id,
  public.realm_program_key(placement.assigned_start_level, placement.realm_id),
  coalesce(student.school_year_level, student.year_level),
  placement.assigned_start_level,
  true,
  'ASSIGNED_PROGRAM',
  case when placement.assigned_entry_mode = 'pretest' then null else 1 end,
  case when placement.assigned_entry_mode = 'pretest' then null else 1 end,
  placement.assigned_entry_mode <> 'pretest',
  '[]'::jsonb,
  '[]'::jsonb
from public.student_realm_placement placement
join public.students student on student.id = placement.student_id
where placement.realm_id in ('number', 'measurement', 'space', 'statistics')
  and not exists (
    select 1
    from public.student_realm_progress progress
    where progress.student_id = placement.student_id
      and progress.realm_id = placement.realm_id
  );

update public.student_realm_progress
set
  program_key = public.realm_program_key(working_level, realm_id),
  updated_at = now()
where realm_id = 'space'
  and program_key not like '%-starpath';

alter table public.student_progress_overrides
  drop constraint if exists student_progress_overrides_realm_id_check;
alter table public.student_progress_overrides
  add constraint student_progress_overrides_realm_id_check
  check (realm_id in ('number', 'measurement', 'space', 'statistics'));

create or replace function public.teacher_advance_student_week(
  p_student_id uuid,
  p_realm_id text,
  p_working_level text,
  p_week integer,
  p_reason text,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher uuid := auth.uid();
  v_progress public.student_realm_progress%rowtype;
  v_override_id uuid;
  v_last_week integer;
  v_next_week integer;
begin
  if v_teacher is null or not public.can_manage_student_progress(p_student_id) then
    raise exception 'Not authorized for this student' using errcode = '42501';
  end if;
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics') then
    raise exception 'Invalid realm';
  end if;
  if p_reason not in (
    'additional_needs', 'iep', 'professional_judgement',
    'extended_absence', 'technical_issue', 'other'
  ) then
    raise exception 'A valid advancement reason is required';
  end if;

  select * into v_progress
  from public.student_realm_progress
  where student_id = p_student_id
    and realm_id = p_realm_id
    and working_level = p_working_level
    and is_current
  for update;

  if v_progress.id is null then
    raise exception 'Canonical student progress was not found';
  end if;
  if v_progress.status <> 'ASSIGNED_PROGRAM' or not v_progress.placement_complete then
    raise exception 'The student must have an active placed program before a week can be advanced';
  end if;
  if p_week is distinct from coalesce(v_progress.current_week, v_progress.assigned_week, 1) then
    raise exception 'Only the student current week can be advanced';
  end if;

  v_last_week := case when p_realm_id in ('measurement', 'space') then 8 else 12 end;
  if p_week < 1 or p_week >= v_last_week then
    raise exception 'This week cannot be advanced';
  end if;
  v_next_week := p_week + 1;

  insert into public.student_progress_overrides (
    student_id, realm_id, working_level, week, advanced_to_week,
    teacher_id, reason, notes, previous_state, new_state
  ) values (
    p_student_id, p_realm_id, p_working_level, p_week, v_next_week,
    v_teacher, p_reason, nullif(trim(coalesce(p_notes, '')), ''),
    jsonb_build_object(
      'current_week', v_progress.current_week,
      'assigned_week', v_progress.assigned_week,
      'status', v_progress.status
    ),
    jsonb_build_object(
      'current_week', v_next_week,
      'assigned_week', v_next_week,
      'status', v_progress.status,
      'advancement', 'teacher_override'
    )
  )
  returning id into v_override_id;

  update public.student_realm_progress
  set current_week = v_next_week,
      assigned_week = v_next_week,
      updated_at = now()
  where id = v_progress.id;

  insert into public.teacher_realm_actions (
    teacher_id, student_id, realm_id, action, old_value, new_value
  ) values (
    v_teacher, p_student_id, p_realm_id, 'week_advanced',
    jsonb_build_object(
      'working_level', p_working_level,
      'week', p_week,
      'reason', p_reason,
      'notes', nullif(trim(coalesce(p_notes, '')), '')
    )::text,
    jsonb_build_object(
      'working_level', p_working_level,
      'week', v_next_week,
      'override_id', v_override_id
    )::text
  );

  return v_override_id;
end;
$$;

revoke all on function public.teacher_advance_student_week(uuid, text, text, integer, text, text)
  from public, anon;
grant execute on function public.teacher_advance_student_week(uuid, text, text, integer, text, text)
  to authenticated;


commit;
