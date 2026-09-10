begin;

-- Chance Hollow live release. This remains additive so it is safe to apply after
-- the reporting-preparation migration without rewriting prior production history.

create or replace function public.realm_first_level(p_realm_id text)
returns text
language sql
immutable
set search_path = public
as $$
  select case p_realm_id
    when 'number' then 'Prep'
    when 'measurement' then 'Prep'
    when 'space' then 'Prep'
    when 'statistics' then 'Year 1'
    when 'pattern' then 'Year 3'
    when 'chance' then 'Year 3'
    else null
  end;
$$;

create or replace function public.realm_first_level_pretest_enabled(
  p_realm_id text,
  p_level text
)
returns boolean
language sql
immutable
set search_path = public
as $$
  select (p_realm_id = 'statistics' and p_level = 'Year 1')
      or (p_realm_id = 'pattern' and p_level = 'Year 3')
      or (p_realm_id = 'chance' and p_level = 'Year 3');
$$;

-- ── Table constraints ───────────────────────────────────────────────────────
alter table public.student_completion_receipts
  drop constraint if exists student_completion_receipts_realm_id_check;
alter table public.student_completion_receipts
  add constraint student_completion_receipts_realm_id_check
  check (realm_id in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance'));

alter table public.economy_items
  drop constraint if exists economy_items_realm_id_check;
alter table public.economy_items
  add constraint economy_items_realm_id_check
  check (realm_id in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance'));

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
  if p_class_id is distinct from actual_class_id or p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then
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
  if p_class_id is distinct from actual_class_id or p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then
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
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then raise exception 'Invalid realm'; end if;
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
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then
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
  if p_class_id is distinct from actual_class_id or p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then
    raise exception 'Student context does not match';
  end if;
  perform public.save_student_realm_progress(
    p_student_id, actual_class_id, p_realm_id, p_program_key,
    p_school_year_level, p_working_level, p_data
  );
end;
$$;




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
    check (realm_id in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance', 'global')),
  add constraint realmie_catalogue_category_check
    check (category in (
      'legend', 'villain', 'variant', 'event',
      'realm_citizen', 'realm_creature', 'helper', 'guardian',
      'explorer', 'fog_creature', 'special', 'seasonal'
    )),
  add constraint realmie_catalogue_asset_path_check
    check (
      asset_path is null
      or asset_path ~ '^/realmies/(number|measurement|space|statistics|pattern|chance|global)/[a-z0-9-]+\.(png|webp)$'
    ),
  add constraint realmie_catalogue_silhouette_asset_path_check
    check (
      silhouette_asset_path is null
      or silhouette_asset_path ~ '^/realmies/(number|measurement|space|statistics|pattern|chance|global)/[a-z0-9-]+-silhouette\.(png|webp)$'
    );

alter table public.realmie_unlock_receipts
  alter column canonical_realm_id drop not null,
  alter column canonical_working_level drop not null,
  drop constraint if exists realmie_unlock_receipts_canonical_realm_id_check;

alter table public.realmie_unlock_receipts
  add constraint realmie_unlock_receipts_canonical_realm_id_check
    check (
      canonical_realm_id is null
      or canonical_realm_id in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance', 'global')
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
      or realm_id in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance', 'global')
    );

-- realmie_discovery_rules carries its realm check inline in a
-- `create table if not exists`, so the table already exists and never picked
-- up 'statistics'. Swap the constraint explicitly.
alter table public.realmie_discovery_rules
  drop constraint if exists realmie_discovery_rules_realm_id_check;
alter table public.realmie_discovery_rules
  add constraint realmie_discovery_rules_realm_id_check
    check (realm_id in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance', 'global'));

-- Reapply the asset-path checks after widening the canonical realm set.
alter table public.realmie_catalogue
  drop constraint if exists realmie_catalogue_asset_path_check,
  drop constraint if exists realmie_catalogue_silhouette_asset_path_check;
alter table public.realmie_catalogue
  add constraint realmie_catalogue_asset_path_check
    check (
      asset_path is null
      or asset_path ~ '^/realmies/(number|measurement|space|statistics|pattern|chance|global)/[a-z0-9-]+\.(png|webp)$'
    ),
  add constraint realmie_catalogue_silhouette_asset_path_check
    check (
      silhouette_asset_path is null
      or silhouette_asset_path ~ '^/realmies/(number|measurement|space|statistics|pattern|chance|global)/[a-z0-9-]+-silhouette\.(png|webp)$'
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
    and p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance', 'global') then
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
        and attempt.realm_id in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance')
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
        and attempt.realm_id in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance')
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
    and new.realm_id in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance')
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
    and new.realm_id in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance')
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
    or p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance')
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
        and realm_id in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance')
        and public.realmie_attempt_is_canonical(summary)
      union
      select student_id
      from public.student_weekly_quiz_attempts
      where passed
        and accuracy_percent >= 80
        and realm_id in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance')
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
    and p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance', 'global') then
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
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then
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

  v_last_week := case
    when p_realm_id in ('statistics', 'chance') then 6
    when p_realm_id in ('measurement', 'space', 'pattern') then 8
    else 12
  end;
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


-- placement function on its old Number/Measurement allow-list.
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
      when p_realm_id = 'pattern' then 'pattern-peaks'
      when p_realm_id = 'chance' then 'chance-hollow'
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
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then
    raise exception 'Invalid realm';
  end if;
  if p_assigned_level not in ('Prep', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6') then
    raise exception 'Invalid assigned level';
  end if;
  if p_realm_id = 'statistics' and p_assigned_level = 'Prep' then
    raise exception 'Statistica starts at Year 1';
  end if;
  if p_realm_id in ('pattern', 'chance')
    and p_assigned_level not in ('Year 3', 'Year 4', 'Year 5', 'Year 6') then
    raise exception 'This realm supports Year 3 to Year 6';
  end if;
  if v_entry not in ('pretest', 'full_level', 'ground_week1') then
    raise exception 'Invalid entry mode';
  end if;
  if not public.teacher_owns_student(p_student_id) then
    raise exception 'Not authorized for this student' using errcode = '42501';
  end if;

  select student.class_id, coalesce(student.school_year_level, student.year_level)
  into v_class_id, v_school_year_level
  from public.students student
  where student.id = p_student_id;

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
  ) into v_has_progress;

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
      select 1 from public.student_lesson_attempts attempt
      where attempt.student_id = p_student_id and attempt.realm_id = p_realm_id
    )
    or exists (
      select 1 from public.student_weekly_quiz_attempts attempt
      where attempt.student_id = p_student_id and attempt.realm_id = p_realm_id
    )
    or exists (
      select 1 from public.student_realm_assessments assessment
      where assessment.student_id = p_student_id and assessment.realm_id = p_realm_id
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

create or replace function public.teacher_change_starting_levels(
  p_realm_id text,
  p_placements jsonb
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  placement jsonb;
  saved_count integer := 0;
begin
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then
    raise exception 'Invalid realm';
  end if;
  if jsonb_typeof(p_placements) <> 'array' then
    raise exception 'Placements must be an array';
  end if;

  for placement in select value from jsonb_array_elements(p_placements)
  loop
    perform public.teacher_change_starting_level(
      nullif(placement->>'student_id', '')::uuid,
      p_realm_id,
      placement->>'assigned_level',
      coalesce(placement->>'entry_mode', 'pretest')
    );
    saved_count := saved_count + 1;
  end loop;

  return saved_count;
end;
$$;

revoke all on function public.teacher_change_starting_levels(text, jsonb)
  from public, anon;
grant execute on function public.teacher_change_starting_levels(text, jsonb)
  to authenticated;

-- Statistica has no Prep curriculum. Repair any invalid placeholder created by


-- non-Number fallback (eight weeks).
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
  select student.class_id into actual_class_id
  from public.students student
  where student.id = p_student_id;

  if p_class_id is distinct from actual_class_id
    or p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance')
    or p_assessment_type not in ('pretest', 'posttest') then
    raise exception 'Student context does not match';
  end if;
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
      when p_realm_id = 'statistics' then '[1,2,3,4,5,6]'::jsonb
      when p_realm_id = 'chance' then '[1,2,3,4,5,6]'::jsonb
      when p_realm_id = 'pattern' then '[1,2,3,4,5,6,7,8]'::jsonb
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
  ) values (
    p_student_id, p_realm_id, p_assessment_type, p_completion_key
  )
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
      public.realm_program_key(effective_progress->>'next_working_level', p_realm_id),
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

revoke all on function public.complete_realm_assessment(
  uuid, uuid, text, text, text, text, text, uuid, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.complete_realm_assessment(
  uuid, uuid, text, text, text, text, text, uuid, jsonb, jsonb
) to anon, authenticated;

-- Repair Statistica rows created by the two generic fallbacks. Week arrays are


-- is called directly.
create or replace function public.realm_week_is_playable(
  p_student_id uuid,
  p_realm_id text,
  p_working_level text,
  p_program_key text,
  p_week integer
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  progress public.student_realm_progress%rowtype;
  maximum_week integer;
  required_count integer := 0;
  completed_required_count integer := 0;
  first_incomplete_required integer;
  optional_count integer := 0;
begin
  maximum_week := case
    when p_realm_id = 'number' then 12
    when p_realm_id in ('measurement', 'space', 'pattern') then 8
    when p_realm_id in ('statistics', 'chance') then 6
    else 0
  end;
  if p_week < 1 or p_week > maximum_week then return false; end if;

  select * into progress
  from public.student_realm_progress candidate
  where candidate.student_id = p_student_id
    and candidate.realm_id = p_realm_id
    and candidate.working_level = p_working_level
    and candidate.is_current
  limit 1;

  if progress.id is null
    or progress.program_key is distinct from p_program_key
    or progress.status <> 'ASSIGNED_PROGRAM'
    or not progress.placement_complete then
    return false;
  end if;

  select count(distinct required_week.value::integer)
  into required_count
  from jsonb_array_elements_text(coalesce(progress.required_weeks, '[]'::jsonb)) as required_week(value)
  where required_week.value ~ '^[0-9]+$'
    and required_week.value::integer between 1 and maximum_week;

  if required_count > 0 then
    select count(distinct required_week.value::integer)
    into completed_required_count
    from jsonb_array_elements_text(coalesce(progress.required_weeks, '[]'::jsonb)) as required_week(value)
    where required_week.value ~ '^[0-9]+$'
      and required_week.value::integer between 1 and maximum_week
      and exists (
        select 1
        from public.student_weekly_quiz_attempts quiz
        where quiz.student_id = p_student_id
          and quiz.realm_id = p_realm_id
          and quiz.working_level = p_working_level
          and quiz.week = required_week.value::integer
          and quiz.passed
          and quiz.accuracy_percent >= 80
      );

    if completed_required_count = required_count then return true; end if;

    select min(required_week.value::integer)
    into first_incomplete_required
    from jsonb_array_elements_text(coalesce(progress.required_weeks, '[]'::jsonb)) as required_week(value)
    where required_week.value ~ '^[0-9]+$'
      and required_week.value::integer between 1 and maximum_week
      and not exists (
        select 1
        from public.student_weekly_quiz_attempts quiz
        where quiz.student_id = p_student_id
          and quiz.realm_id = p_realm_id
          and quiz.working_level = p_working_level
          and quiz.week = required_week.value::integer
          and quiz.passed
          and quiz.accuracy_percent >= 80
      );

    return exists (
      select 1
      from jsonb_array_elements_text(coalesce(progress.required_weeks, '[]'::jsonb)) as required_week(value)
      where required_week.value ~ '^[0-9]+$'
        and required_week.value::integer = p_week
        and (
          required_week.value::integer = first_incomplete_required
          or required_week.value::integer <= coalesce(progress.assigned_week, 1)
          or exists (
            select 1
            from public.student_weekly_quiz_attempts quiz
            where quiz.student_id = p_student_id
              and quiz.realm_id = p_realm_id
              and quiz.working_level = p_working_level
              and quiz.week = p_week
              and quiz.passed
              and quiz.accuracy_percent >= 80
          )
        )
    );
  end if;

  select count(distinct optional_week.value::integer)
  into optional_count
  from jsonb_array_elements_text(coalesce(progress.optional_weeks, '[]'::jsonb)) as optional_week(value)
  where optional_week.value ~ '^[0-9]+$'
    and optional_week.value::integer between 1 and maximum_week;

  if optional_count = maximum_week then return true; end if;
  return p_week = least(maximum_week, greatest(1, coalesce(progress.assigned_week, 1)));
end;
$$;

revoke all on function public.realm_week_is_playable(uuid, text, text, text, integer)
  from public, anon, authenticated;

create or replace function public.enforce_realm_lesson_sequence()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.lesson not between 1 and 3
    or not public.realm_week_is_playable(
      new.student_id, new.realm_id, new.working_level, new.program_key, new.week
    ) then
    raise exception 'Lesson is locked by the canonical student pathway' using errcode = '42501';
  end if;

  if new.lesson > 1 and not exists (
    select 1
    from public.student_lesson_attempts previous
    where previous.student_id = new.student_id
      and previous.realm_id = new.realm_id
      and previous.working_level = new.working_level
      and previous.week = new.week
      and previous.lesson = new.lesson - 1
      and previous.completed
  ) then
    raise exception 'The previous lesson must be completed first' using errcode = '42501';
  end if;
  return new;
end;
$$;

create or replace function public.enforce_realm_quiz_sequence()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  completed_lesson_count integer;
begin
  if not public.realm_week_is_playable(
    new.student_id, new.realm_id, new.working_level, new.program_key, new.week
  ) then
    raise exception 'Quiz is locked by the canonical student pathway' using errcode = '42501';
  end if;

  select count(distinct lesson.lesson)
  into completed_lesson_count
  from public.student_lesson_attempts lesson
  where lesson.student_id = new.student_id
    and lesson.realm_id = new.realm_id
    and lesson.working_level = new.working_level
    and lesson.week = new.week
    and lesson.lesson between 1 and 3
    and lesson.completed;

  if completed_lesson_count < 3 then
    raise exception 'All three lessons must be completed before the quiz' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_realm_lesson_sequence() from public, anon, authenticated;
revoke all on function public.enforce_realm_quiz_sequence() from public, anon, authenticated;

drop trigger if exists trg_enforce_realm_lesson_sequence on public.student_lesson_attempts;
create trigger trg_enforce_realm_lesson_sequence
before insert on public.student_lesson_attempts
for each row execute function public.enforce_realm_lesson_sequence();

drop trigger if exists trg_enforce_realm_quiz_sequence on public.student_weekly_quiz_attempts;
create trigger trg_enforce_realm_quiz_sequence
before insert on public.student_weekly_quiz_attempts
for each row execute function public.enforce_realm_quiz_sequence();

-- Chance Hollow completes the sixth Whole-Maths Diagnostic strand.
create or replace function public.teacher_start_whole_math_diagnostic(
  p_student_id uuid,
  p_checkpoint text,
  p_strands text[] default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sitting_id uuid;
  v_class_id uuid;
  v_school_year text;
  v_strand text;
  v_realm_id text;
  v_starting_level text;
  v_requested text[] := coalesce(
    p_strands,
    array['number', 'measurement', 'space', 'statistics', 'algebra', 'probability']::text[]
  );
begin
  if not public.teacher_owns_student(p_student_id) then
    raise exception 'Not authorized for this student' using errcode = '42501';
  end if;
  if p_checkpoint not in ('start', 'mid', 'end', 'ad_hoc') then
    raise exception 'Invalid diagnostic checkpoint';
  end if;
  if cardinality(v_requested) = 0 or exists (
    select 1 from unnest(v_requested) requested(strand)
    where requested.strand not in ('number', 'algebra', 'measurement', 'space', 'statistics', 'probability')
  ) then
    raise exception 'Invalid diagnostic strand selection';
  end if;
  if exists (
    select 1 from public.whole_math_diagnostic_sittings sitting
    where sitting.student_id = p_student_id and sitting.status <> 'completed'
  ) then
    raise exception 'This student already has an active diagnostic';
  end if;

  select student.class_id, coalesce(student.school_year_level, student.year_level, 'Year 1')
  into v_class_id, v_school_year
  from public.students student
  where student.id = p_student_id and student.archived_at is null;
  if v_class_id is null then raise exception 'Student class context is missing'; end if;

  insert into public.whole_math_diagnostic_sittings (
    student_id, class_id, checkpoint, status, initiated_by
  ) values (
    p_student_id, v_class_id, p_checkpoint, 'assigned', auth.uid()
  ) returning id into v_sitting_id;

  foreach v_strand in array v_requested loop
    v_realm_id := case
      when v_strand in ('number', 'measurement', 'space', 'statistics') then v_strand
      when v_strand = 'algebra' then 'pattern'
      when v_strand = 'probability' then 'chance'
      else null
    end;

    if v_realm_id is null then
      insert into public.whole_math_diagnostic_strand_results (
        sitting_id, student_id, strand, realm_id, status, unavailable_reason
      ) values (
        v_sitting_id, p_student_id, v_strand, null, 'unavailable',
        case when v_strand = 'algebra'
          then 'Algebra level tests are not built yet.'
          else 'Probability level tests are not built yet.' end
      );
    else
      select progress.working_level
      into v_starting_level
      from public.student_realm_progress progress
      where progress.student_id = p_student_id
        and progress.realm_id = v_realm_id
        and progress.is_current
      order by progress.updated_at desc nulls last
      limit 1;

      v_starting_level := coalesce(v_starting_level, v_school_year);
      if v_strand in ('algebra', 'probability') and v_starting_level not in ('Year 3', 'Year 4', 'Year 5', 'Year 6') then
        v_starting_level := 'Year 3';
      elsif v_starting_level not in ('Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6') then
        v_starting_level := 'Year 1';
      end if;

      insert into public.whole_math_diagnostic_strand_results (
        sitting_id, student_id, strand, realm_id, status, starting_level
      ) values (
        v_sitting_id, p_student_id, v_strand, v_realm_id, 'pending', v_starting_level
      );
    end if;

  end loop;

  return v_sitting_id;
end;
$$;


alter table public.student_live_maths_progression
  drop constraint if exists student_live_maths_progression_realm_id_check,
  drop constraint if exists student_live_maths_progression_strand_check;
alter table public.student_live_maths_progression
  add constraint student_live_maths_progression_realm_id_check
    check (realm_id in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance')),
  add constraint student_live_maths_progression_strand_check
    check (strand in ('number', 'measurement', 'space', 'statistics', 'algebra', 'probability'));

create or replace function public.refresh_student_live_maths_progression(
  p_student_id uuid,
  p_realm_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quiz_pass constant integer := 80;
  v_mastery constant integer := 85;
  v_floor constant integer := 40;
  v_lesson_week_credit constant numeric := 0.4;
  v_lessons_per_week constant integer := 3;
  v_max_confidence constant integer := 95;
  v_progress public.student_realm_progress%rowtype;
  v_working_number integer;
  v_total_weeks integer;
  v_official numeric;
  v_official_at timestamptz;
  v_checkpoint numeric;
  v_checkpoint_source text;
  v_checkpoint_at timestamptz;
  v_assessment_type text;
  v_assessment_level integer;
  v_assessment_score numeric;
  v_assessment_at timestamptz;
  v_passed_quiz_weeks integer := 0;
  v_unconfirmed_lessons integer := 0;
  v_week_equivalents numeric := 0;
  v_predicted numeric;
  v_confidence integer;
begin
  if p_realm_id not in ('number', 'measurement', 'space', 'statistics', 'pattern', 'chance') then return; end if;

  select progress.* into v_progress
  from public.student_realm_progress progress
  where progress.student_id = p_student_id
    and progress.realm_id = p_realm_id
    and progress.is_current
  order by progress.updated_at desc
  limit 1;

  if not found or v_progress.class_id is null then
    delete from public.student_live_maths_progression
    where student_id = p_student_id and realm_id = p_realm_id;
    return;
  end if;

  v_working_number := public.maths_progression_level_number(v_progress.working_level);
  if v_working_number is null then return; end if;
  v_total_weeks := case
    when p_realm_id = 'number' then 12
    when p_realm_id in ('statistics', 'chance') then 6
    else 8
  end;

  -- Only a completed Whole-Maths strand result is official. Realm assessments
  -- are verified checkpoints for the live estimate, never official results.
  select result.measured_level, result.completed_at
  into v_official, v_official_at
  from public.whole_math_diagnostic_strand_results result
  join public.whole_math_diagnostic_sittings sitting on sitting.id = result.sitting_id
  where result.student_id = p_student_id
    and result.realm_id = p_realm_id
    and result.status = 'completed'
    and result.measured_level is not null
    and sitting.status = 'completed'
    and sitting.checkpoint in ('start', 'mid', 'end')
    and (
      select count(distinct completed_result.strand)
      from public.whole_math_diagnostic_strand_results completed_result
      where completed_result.sitting_id = sitting.id
        and completed_result.status = 'completed'
        and completed_result.measured_level is not null
    ) = 6
  order by result.completed_at desc
  limit 1;

  -- Any completed strand diagnostic, including a teacher-triggered ad-hoc
  -- check, may be the latest verified realm checkpoint. Ad-hoc checks never
  -- populate official_level.
  select result.measured_level, result.completed_at
  into v_checkpoint, v_checkpoint_at
  from public.whole_math_diagnostic_strand_results result
  join public.whole_math_diagnostic_sittings sitting on sitting.id = result.sitting_id
  where result.student_id = p_student_id
    and result.realm_id = p_realm_id
    and result.status = 'completed'
    and result.measured_level is not null
    and sitting.status = 'completed'
  order by result.completed_at desc
  limit 1;
  if v_checkpoint is not null then
    v_checkpoint_source := 'diagnostic';
  end if;

  -- The newest realm pre/post-test is a verified live checkpoint. Mastery at
  -- 85% confirms the next level boundary; a non-passing score still
  -- recalibrates position within (or just below) the tested level.
  select
    lower(assessment.assessment_type),
    public.maths_progression_level_number(assessment.working_level),
    assessment.score_percent,
    assessment.completed_at
  into v_assessment_type, v_assessment_level, v_assessment_score, v_assessment_at
  from public.student_realm_assessments assessment
  where assessment.student_id = p_student_id
    and assessment.realm_id = p_realm_id
    and lower(assessment.assessment_type) in ('pretest', 'posttest')
  order by assessment.completed_at desc
  limit 1;

  if not found then
    select historical.assessment_type, historical.assessment_level,
      historical.assessment_score, historical.assessment_at
    into v_assessment_type, v_assessment_level, v_assessment_score, v_assessment_at
    from (
      select 'pretest'::text as assessment_type,
        public.maths_progression_level_number(progress.working_level) as assessment_level,
        progress.pretest_score::numeric as assessment_score,
        progress.pretest_completed_at as assessment_at
      from public.student_realm_progress progress
      where progress.student_id = p_student_id and progress.realm_id = p_realm_id
        and progress.pretest_score is not null and progress.pretest_completed_at is not null
      union all
      select 'posttest'::text,
        public.maths_progression_level_number(progress.working_level),
        progress.posttest_score::numeric,
        progress.posttest_completed_at
      from public.student_realm_progress progress
      where progress.student_id = p_student_id and progress.realm_id = p_realm_id
        and progress.posttest_score is not null and progress.posttest_completed_at is not null
    ) historical
    order by historical.assessment_at desc
    limit 1;
  end if;

  if found and v_assessment_level is not null and v_assessment_score is not null
    and (v_checkpoint_at is null or v_assessment_at > v_checkpoint_at) then
    v_checkpoint := greatest(0, least(6, case
      when v_assessment_score >= v_mastery then v_assessment_level
      when v_assessment_score >= v_floor then v_assessment_level - 1 + ((v_assessment_score - v_floor) / (v_mastery - v_floor))
      else v_assessment_level - 1 - least(0.9, (v_floor - v_assessment_score) / v_floor)
    end));
    v_checkpoint_source := v_assessment_type;
    v_checkpoint_at := v_assessment_at;
  end if;

  -- A teacher placement is a transparent fallback, not verified evidence.
  if v_checkpoint is null then
    v_checkpoint := greatest(0, v_working_number - 1);
    v_checkpoint_source := 'placement';
    v_checkpoint_at := coalesce(v_progress.created_at, v_progress.updated_at, now());
  end if;

  select count(*) into v_passed_quiz_weeks
  from (
    select attempt.week
    from public.student_weekly_quiz_attempts attempt
    where attempt.student_id = p_student_id
      and attempt.realm_id = p_realm_id
      and attempt.working_level = v_progress.working_level
      and attempt.completed_at > v_checkpoint_at
    group by attempt.week
    having max(attempt.accuracy_percent) >= v_quiz_pass or bool_or(attempt.passed)
  ) passed_weeks;

  select count(*) into v_unconfirmed_lessons
  from (
    select attempt.week, attempt.lesson
    from public.student_lesson_attempts attempt
    where attempt.student_id = p_student_id
      and attempt.realm_id = p_realm_id
      and attempt.working_level = v_progress.working_level
      and attempt.completed
      and attempt.completed_at > v_checkpoint_at
      and not exists (
        select 1 from public.student_weekly_quiz_attempts quiz
        where quiz.student_id = attempt.student_id
          and quiz.realm_id = attempt.realm_id
          and quiz.working_level = attempt.working_level
          and quiz.week = attempt.week
          and quiz.completed_at > v_checkpoint_at
          and (quiz.accuracy_percent >= v_quiz_pass or quiz.passed)
      )
    group by attempt.week, attempt.lesson
  ) unconfirmed_lessons;

  v_week_equivalents := v_passed_quiz_weeks
    + (v_unconfirmed_lessons::numeric / v_lessons_per_week) * v_lesson_week_credit;
  v_predicted := least(6, round((v_checkpoint + v_week_equivalents / v_total_weeks)::numeric, 2));
  v_confidence := least(
    v_max_confidence,
    case v_checkpoint_source when 'diagnostic' then 70 when 'posttest' then 70 when 'pretest' then 60 else 25 end
      + least(25, v_passed_quiz_weeks * 4 + v_unconfirmed_lessons)
  );

  insert into public.student_live_maths_progression (
    student_id, class_id, realm_id, strand, current_working_level,
    official_level, official_at, checkpoint_level, checkpoint_source, checkpoint_at, predicted_level,
    prediction_confidence, evidence, updated_at
  ) values (
    p_student_id, v_progress.class_id, p_realm_id,
    case
      when p_realm_id = 'pattern' then 'algebra'
      when p_realm_id = 'chance' then 'probability'
      else p_realm_id
    end,
    v_progress.working_level,
    round(v_official, 2), v_official_at, round(v_checkpoint, 2), v_checkpoint_source, v_checkpoint_at, v_predicted,
    v_confidence,
    jsonb_build_object(
      'passedQuizWeeks', v_passed_quiz_weeks,
      'completedUnconfirmedLessons', v_unconfirmed_lessons,
      'confirmedWeekEquivalents', round(v_week_equivalents, 2),
      'totalWeeks', v_total_weeks,
      'quizPassPercent', v_quiz_pass,
      'lessonWeekCredit', v_lesson_week_credit
    ),
    now()
  ) on conflict (student_id, realm_id) do update set
    class_id = excluded.class_id,
    strand = excluded.strand,
    current_working_level = excluded.current_working_level,
    official_level = excluded.official_level,
    official_at = excluded.official_at,
    checkpoint_level = excluded.checkpoint_level,
    checkpoint_source = excluded.checkpoint_source,
    checkpoint_at = excluded.checkpoint_at,
    predicted_level = excluded.predicted_level,
    prediction_confidence = excluded.prediction_confidence,
    evidence = excluded.evidence,
    updated_at = now();
end;
$$;

revoke all on function public.refresh_student_live_maths_progression(uuid, text) from public, anon, authenticated;



commit;
