begin;

-- Realmies are discoverable inhabitants and helpers. Realm Legends remain
-- exclusively in the Hall of Legends card system. Preserve historical rows
-- from the retired Legend experiment, but never expose or grant them again.
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

create table if not exists public.realmie_discovery_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null unique,
  realmie_id uuid not null references public.realmie_catalogue(id) on delete restrict,
  rule_type text not null check (rule_type in (
    'first_realm_lesson_completed',
    'realm_lessons_completed_count',
    'realm_weekly_quizzes_passed_count',
    'global_lessons_completed_count',
    'canonical_learning_streak',
    'special_event'
  )),
  realm_id text check (realm_id in ('number', 'measurement', 'space', 'statistics', 'global')),
  threshold integer check (threshold is null or threshold > 0),
  rule_payload jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists realmie_discovery_rules_active_realmie_idx
  on public.realmie_discovery_rules(realmie_id)
  where is_active;

create table if not exists public.realmie_architecture_correction_reports (
  id uuid primary key default gen_random_uuid(),
  correction_key text not null unique,
  report jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.realmie_discovery_rules enable row level security;
alter table public.realmie_architecture_correction_reports enable row level security;
revoke all on table public.realmie_discovery_rules from public, anon, authenticated;
revoke all on table public.realmie_architecture_correction_reports from public, anon, authenticated;

update public.realmie_catalogue
set
  is_active = false,
  is_collectible = false,
  active_for_standard_completion = false,
  retired_at = coalesce(retired_at, now()),
  retirement_reason = 'Realm Legends belong exclusively to Hall of Legends cards',
  metadata = metadata || jsonb_build_object(
    'collection_status', 'retired',
    'retired_architecture', 'legend_as_realmie',
    'historical_rows_preserved', true
  ),
  updated_at = now()
where category = 'legend'
  and variant_type = 'standard';

-- The corrected launch catalogue is deliberately limited to these 15
-- discoverable inhabitants. Preserve any experimental definitions and their
-- ownership history, but keep them out of collection totals and projections.
update public.realmie_catalogue
set
  is_active = false,
  is_collectible = false,
  active_for_standard_completion = false,
  retired_at = coalesce(retired_at, now()),
  retirement_reason = coalesce(
    retirement_reason,
    'Not part of the corrected initial Realmies discovery catalogue'
  ),
  metadata = metadata || jsonb_build_object(
    'collection_status', 'retired',
    'historical_rows_preserved', true
  ),
  updated_at = now()
where realmie_key not in (
  'number-nexus-bitling-standard',
  'number-nexus-carrybot-standard',
  'number-nexus-codekeeper-standard',
  'number-nexus-neon-sentinel-standard',
  'measurelands-gaugekin-standard',
  'measurelands-ruleroot-standard',
  'measurelands-compass-keeper-standard',
  'measurelands-golden-surveyor-standard',
  'starpath-orbitling-standard',
  'starpath-prism-scout-standard',
  'starpath-constellation-keeper-standard',
  'starpath-aurora-guardian-standard',
  'global-fogling-standard',
  'global-mist-mischief-standard',
  'global-shadow-of-forgetfulness-standard'
);

update public.realmie_discovery_rules rule
set is_active = false, updated_at = now()
from public.realmie_catalogue catalogue
where catalogue.id = rule.realmie_id
  and not catalogue.is_collectible
  and rule.is_active;

-- Retired catalogue rows and immutable ownership/receipts remain for audit.
-- Remove only mutable presentation choices so invisible figures cannot occupy
-- a favourite or one of the six display slots.
delete from public.student_realmie_favourites favourite
using public.realmie_catalogue catalogue
where favourite.realmie_id = catalogue.id
  and not catalogue.is_collectible;

delete from public.student_realmie_display_slots slot
using public.realmie_catalogue catalogue
where slot.realmie_id = catalogue.id
  and not catalogue.is_collectible;

update public.student_realmie_backfill_state
set
  unseen_backfill_realmie_count = 0,
  acknowledged_at = now(),
  updated_at = now()
where unseen_backfill_realmie_count > 0;

insert into public.realmie_catalogue (
  realmie_key, display_name, realm_id, category, character_key,
  evolution_level, variant_type, rarity, lore_text, unlock_rule_type,
  unlock_rule_payload, asset_path, silhouette_asset_path, collection_order,
  active_for_standard_completion, is_active, is_collectible, metadata
)
values
  ('number-nexus-bitling-standard', 'Bitling', 'number', 'realm_citizen', 'bitling', null, 'standard', 'common',
   'A bright little Number Nexus citizen that appears when a learner completes their first true number lesson.',
   'first_realm_lesson_completed', '{"threshold":1}', null, null, 1010, false, true, true,
   '{"asset_status":"awaiting_production","artwork_phase":"R3-correction"}'),
  ('number-nexus-carrybot-standard', 'CarryBot', 'number', 'helper', 'carrybot', null, 'standard', 'rare',
   'CarryBot helps move ideas from one number place to the next.',
   'realm_lessons_completed_count', '{"threshold":10}', null, null, 1020, false, true, true,
   '{"asset_status":"awaiting_production","artwork_phase":"R3-correction"}'),
  ('number-nexus-codekeeper-standard', 'Codekeeper', 'number', 'guardian', 'codekeeper', null, 'standard', 'epic',
   'Codekeeper guards the patterns revealed by successful weekly mastery checks.',
   'realm_weekly_quizzes_passed_count', '{"threshold":5,"minimum_accuracy":80}', null, null, 1030, false, true, true,
   '{"asset_status":"awaiting_production","artwork_phase":"R3-correction"}'),
  ('number-nexus-neon-sentinel-standard', 'Neon Sentinel', 'number', 'guardian', 'neon-sentinel', null, 'standard', 'legendary',
   'A legendary sentinel awakened by sustained exploration of Number Nexus.',
   'realm_lessons_completed_count', '{"threshold":50}', null, null, 1040, false, true, true,
   '{"asset_status":"awaiting_production","artwork_phase":"R3-correction"}'),

  ('measurelands-gaugekin-standard', 'Gaugekin', 'measurement', 'helper', 'gaugekin', null, 'standard', 'common',
   'Gaugekin notices the first careful measurement made by a new explorer.',
   'first_realm_lesson_completed', '{"threshold":1}', null, null, 2010, false, true, true,
   '{"asset_status":"awaiting_production","artwork_phase":"R3-correction"}'),
  ('measurelands-ruleroot-standard', 'Ruleroot', 'measurement', 'realm_citizen', 'ruleroot', null, 'standard', 'rare',
   'Ruleroot grows stronger as learners investigate length, mass, capacity and time.',
   'realm_lessons_completed_count', '{"threshold":10}', null, null, 2020, false, true, true,
   '{"asset_status":"awaiting_production","artwork_phase":"R3-correction"}'),
  ('measurelands-compass-keeper-standard', 'Compass Keeper', 'measurement', 'guardian', 'compass-keeper', null, 'standard', 'epic',
   'Compass Keeper records the pathways confirmed by weekly mastery.',
   'realm_weekly_quizzes_passed_count', '{"threshold":5,"minimum_accuracy":80}', null, null, 2030, false, true, true,
   '{"asset_status":"awaiting_production","artwork_phase":"R3-correction"}'),
  ('measurelands-golden-surveyor-standard', 'Golden Surveyor', 'measurement', 'explorer', 'golden-surveyor', null, 'standard', 'legendary',
   'The Golden Surveyor appears only after a long and careful Measurelands expedition.',
   'realm_lessons_completed_count', '{"threshold":50}', null, null, 2040, false, true, true,
   '{"asset_status":"awaiting_production","artwork_phase":"R3-correction"}'),

  ('starpath-orbitling-standard', 'Orbitling', 'space', 'realm_creature', 'orbitling', null, 'standard', 'common',
   'Orbitling circles close when an explorer completes their first Starpath mission.',
   'first_realm_lesson_completed', '{"threshold":1}', null, null, 3010, false, true, true,
   '{"asset_status":"awaiting_production","artwork_phase":"R3-correction","collection_status":"coming_soon"}'),
  ('starpath-prism-scout-standard', 'Prism Scout', 'space', 'explorer', 'prism-scout', null, 'standard', 'rare',
   'Prism Scout searches for shapes, paths and positions across distant worlds.',
   'realm_lessons_completed_count', '{"threshold":10}', null, null, 3020, false, true, true,
   '{"asset_status":"awaiting_production","artwork_phase":"R3-correction","collection_status":"coming_soon"}'),
  ('starpath-constellation-keeper-standard', 'Constellation Keeper', 'space', 'guardian', 'constellation-keeper', null, 'standard', 'epic',
   'Constellation Keeper remembers the weekly voyages an explorer has mastered.',
   'realm_weekly_quizzes_passed_count', '{"threshold":5,"minimum_accuracy":80}', null, null, 3030, false, true, true,
   '{"asset_status":"awaiting_production","artwork_phase":"R3-correction","collection_status":"coming_soon"}'),
  ('starpath-aurora-guardian-standard', 'Aurora Guardian', 'space', 'guardian', 'aurora-guardian', null, 'standard', 'legendary',
   'Aurora Guardian wakes after a learner completes fifty unique Starpath missions.',
   'realm_lessons_completed_count', '{"threshold":50}', null, null, 3040, false, true, true,
   '{"asset_status":"awaiting_production","artwork_phase":"R3-correction","collection_status":"coming_soon"}'),

  ('global-fogling-standard', 'Fogling', 'global', 'fog_creature', 'fogling', null, 'standard', 'common',
   'A curious Fogling follows explorers who begin learning across the realms.',
   'global_lessons_completed_count', '{"threshold":3}', null, null, 4010, false, true, true,
   '{"asset_status":"awaiting_production","artwork_phase":"R3-correction"}'),
  ('global-mist-mischief-standard', 'Mist Mischief', 'global', 'fog_creature', 'mist-mischief', null, 'standard', 'rare',
   'Mist Mischief appears after seven days of steady canonical learning.',
   'canonical_learning_streak', '{"threshold":7}', null, null, 4020, false, true, true,
   '{"asset_status":"awaiting_production","artwork_phase":"R3-correction"}'),
  ('global-shadow-of-forgetfulness-standard', 'Shadow of Forgetfulness', 'global', 'fog_creature', 'shadow-of-forgetfulness', null, 'standard', 'epic',
   'This elusive shadow can only be discovered through thirty days of consistent learning.',
   'canonical_learning_streak', '{"threshold":30}', null, null, 4030, false, true, true,
   '{"asset_status":"awaiting_production","artwork_phase":"R3-correction"}')
on conflict (realmie_key) do update set
  display_name = excluded.display_name,
  realm_id = excluded.realm_id,
  category = excluded.category,
  character_key = excluded.character_key,
  evolution_level = excluded.evolution_level,
  variant_type = excluded.variant_type,
  rarity = excluded.rarity,
  lore_text = excluded.lore_text,
  unlock_rule_type = excluded.unlock_rule_type,
  unlock_rule_payload = excluded.unlock_rule_payload,
  collection_order = excluded.collection_order,
  active_for_standard_completion = false,
  is_active = true,
  is_collectible = true,
  retired_at = null,
  retirement_reason = null,
  metadata = excluded.metadata,
  updated_at = now();

insert into public.realmie_discovery_rules (
  rule_key, realmie_id, rule_type, realm_id, threshold, rule_payload
)
select seed.rule_key, catalogue.id, seed.rule_type, seed.realm_id, seed.threshold, seed.payload
from (
  values
    ('number-first-lesson', 'number-nexus-bitling-standard', 'first_realm_lesson_completed', 'number', 1, '{}'::jsonb),
    ('number-ten-lessons', 'number-nexus-carrybot-standard', 'realm_lessons_completed_count', 'number', 10, '{}'::jsonb),
    ('number-five-quizzes', 'number-nexus-codekeeper-standard', 'realm_weekly_quizzes_passed_count', 'number', 5, '{"minimum_accuracy":80}'::jsonb),
    ('number-fifty-lessons', 'number-nexus-neon-sentinel-standard', 'realm_lessons_completed_count', 'number', 50, '{}'::jsonb),
    ('measurement-first-lesson', 'measurelands-gaugekin-standard', 'first_realm_lesson_completed', 'measurement', 1, '{}'::jsonb),
    ('measurement-ten-lessons', 'measurelands-ruleroot-standard', 'realm_lessons_completed_count', 'measurement', 10, '{}'::jsonb),
    ('measurement-five-quizzes', 'measurelands-compass-keeper-standard', 'realm_weekly_quizzes_passed_count', 'measurement', 5, '{"minimum_accuracy":80}'::jsonb),
    ('measurement-fifty-lessons', 'measurelands-golden-surveyor-standard', 'realm_lessons_completed_count', 'measurement', 50, '{}'::jsonb),
    ('space-first-lesson', 'starpath-orbitling-standard', 'first_realm_lesson_completed', 'space', 1, '{}'::jsonb),
    ('space-ten-lessons', 'starpath-prism-scout-standard', 'realm_lessons_completed_count', 'space', 10, '{}'::jsonb),
    ('space-five-quizzes', 'starpath-constellation-keeper-standard', 'realm_weekly_quizzes_passed_count', 'space', 5, '{"minimum_accuracy":80}'::jsonb),
    ('space-fifty-lessons', 'starpath-aurora-guardian-standard', 'realm_lessons_completed_count', 'space', 50, '{}'::jsonb),
    ('global-three-lessons', 'global-fogling-standard', 'global_lessons_completed_count', 'global', 3, '{}'::jsonb),
    ('global-seven-day-streak', 'global-mist-mischief-standard', 'canonical_learning_streak', 'global', 7, '{}'::jsonb),
    ('global-thirty-day-streak', 'global-shadow-of-forgetfulness-standard', 'canonical_learning_streak', 'global', 30, '{}'::jsonb)
) as seed(rule_key, realmie_key, rule_type, realm_id, threshold, payload)
join public.realmie_catalogue catalogue on catalogue.realmie_key = seed.realmie_key
on conflict (rule_key) do update set
  realmie_id = excluded.realmie_id,
  rule_type = excluded.rule_type,
  realm_id = excluded.realm_id,
  threshold = excluded.threshold,
  rule_payload = excluded.rule_payload,
  is_active = true,
  updated_at = now();

do $$
declare
  v_collectible_count integer;
  v_rule_count integer;
  v_number_count integer;
  v_measurement_count integer;
  v_space_count integer;
  v_global_count integer;
  v_forbidden_count integer;
begin
  select
    count(*) filter (
      where is_active and is_collectible and variant_type = 'standard'
    ),
    count(*) filter (
      where is_active and is_collectible and variant_type = 'standard'
        and realm_id = 'number'
    ),
    count(*) filter (
      where is_active and is_collectible and variant_type = 'standard'
        and realm_id = 'measurement'
    ),
    count(*) filter (
      where is_active and is_collectible and variant_type = 'standard'
        and realm_id = 'space'
    ),
    count(*) filter (
      where is_active and is_collectible and variant_type = 'standard'
        and realm_id = 'global'
    ),
    count(*) filter (
      where is_active and is_collectible
        and (
          category in ('legend', 'pet')
          or lower(character_key) in ('numbot', 'meazurex', 'geospin', 'datara')
        )
    )
  into
    v_collectible_count,
    v_number_count,
    v_measurement_count,
    v_space_count,
    v_global_count,
    v_forbidden_count
  from public.realmie_catalogue;

  select count(*)
  into v_rule_count
  from public.realmie_discovery_rules rule
  join public.realmie_catalogue catalogue on catalogue.id = rule.realmie_id
  where rule.is_active
    and catalogue.is_active
    and catalogue.is_collectible
    and catalogue.variant_type = 'standard';

  if v_collectible_count <> 15
    or v_rule_count <> 15
    or v_number_count <> 4
    or v_measurement_count <> 4
    or v_space_count <> 4
    or v_global_count <> 3
    or v_forbidden_count <> 0 then
    raise exception
      'Realmies correction invariant failed: catalogue %, rules %, number %, measurement %, space %, global %, forbidden %',
      v_collectible_count, v_rule_count, v_number_count, v_measurement_count,
      v_space_count, v_global_count, v_forbidden_count;
  end if;
end;
$$;

create or replace function public.realmie_attempt_is_canonical(p_summary jsonb)
returns boolean
language sql
immutable
set search_path = public
as $$
  select not (
    lower(coalesce(p_summary->>'is_demo', 'false')) = 'true'
    or lower(coalesce(p_summary->>'demo', 'false')) = 'true'
    or lower(coalesce(p_summary->>'demo_mode', 'false')) = 'true'
    or lower(coalesce(p_summary->>'isDemo', 'false')) = 'true'
    or lower(coalesce(p_summary->>'review_mode', 'false')) = 'true'
    or lower(coalesce(p_summary->>'is_review', 'false')) = 'true'
    or lower(coalesce(p_summary->>'reviewOnly', 'false')) = 'true'
    or lower(coalesce(p_summary->>'teacher_advanced', 'false')) = 'true'
  );
$$;

revoke all on function public.realmie_attempt_is_canonical(jsonb)
  from public, anon, authenticated;

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

drop function if exists public.backfill_standard_realmies_internal();
drop function if exists public.grant_standard_realmie_for_canonical_posttest(
  uuid, text, text, uuid, uuid, boolean
);

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

create or replace function public.get_active_realmie_catalogue_secure()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', catalogue.id,
      'realmie_key', catalogue.realmie_key,
      'display_name', catalogue.display_name,
      'realm_id', catalogue.realm_id,
      'category', catalogue.category,
      'character_key', catalogue.character_key,
      'variant_type', catalogue.variant_type,
      'rarity', catalogue.rarity,
      'lore_text', catalogue.lore_text,
      'unlock_rule_type', catalogue.unlock_rule_type,
      'collection_order', catalogue.collection_order,
      'asset_path', catalogue.asset_path,
      'silhouette_asset_path', catalogue.silhouette_asset_path,
      'asset_status', coalesce(catalogue.metadata->>'asset_status', 'missing')
    )
    order by catalogue.collection_order
  ), '[]'::jsonb)
  from public.realmie_catalogue catalogue
  where catalogue.is_active
    and catalogue.is_collectible
    and catalogue.variant_type = 'standard';
$$;

create or replace function public.get_student_realmies_secure(p_student_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  perform public.assert_realmie_student_self_access(p_student_id);

  select jsonb_build_object(
    'catalogue', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', catalogue.id,
        'realmie_key', catalogue.realmie_key,
        'display_name', catalogue.display_name,
        'realm_id', catalogue.realm_id,
        'category', catalogue.category,
        'character_key', catalogue.character_key,
        'rarity', catalogue.rarity,
        'lore_text', catalogue.lore_text,
        'unlock_rule_type', catalogue.unlock_rule_type,
        'collection_order', catalogue.collection_order,
        'asset_path', catalogue.asset_path,
        'silhouette_asset_path', catalogue.silhouette_asset_path,
        'asset_status', coalesce(catalogue.metadata->>'asset_status', 'missing'),
        'owned', ownership.id is not null,
        'earned_at', ownership.earned_at,
        'unlock_source', ownership.source_type,
        'favourite', favourite.realmie_id is not null,
        'display_slot', display.slot_number
      ) order by catalogue.collection_order)
      from public.realmie_catalogue catalogue
      left join public.student_realmies ownership
        on ownership.realmie_id = catalogue.id
       and ownership.student_id = p_student_id
      left join public.student_realmie_favourites favourite
        on favourite.realmie_id = catalogue.id
       and favourite.student_id = p_student_id
      left join public.student_realmie_display_slots display
        on display.realmie_id = catalogue.id
       and display.student_id = p_student_id
      where catalogue.is_active
        and catalogue.is_collectible
        and catalogue.variant_type = 'standard'
    ), '[]'::jsonb),
    'display', coalesce((
      select jsonb_agg(jsonb_build_object(
        'slot_number', slot.slot_number,
        'realmie_id', catalogue.id,
        'realmie_key', catalogue.realmie_key,
        'display_name', catalogue.display_name,
        'realm_id', catalogue.realm_id,
        'rarity', catalogue.rarity,
        'asset_path', catalogue.asset_path
      ) order by slot.slot_number)
      from public.student_realmie_display_slots slot
      join public.realmie_catalogue catalogue on catalogue.id = slot.realmie_id
      where slot.student_id = p_student_id
        and catalogue.is_active
        and catalogue.is_collectible
    ), '[]'::jsonb),
    'totals', jsonb_build_object(
      'collected', (
        select count(*)
        from public.student_realmies ownership
        join public.realmie_catalogue catalogue on catalogue.id = ownership.realmie_id
        where ownership.student_id = p_student_id
          and catalogue.is_active
          and catalogue.is_collectible
      ),
      'active_standard', (
        select count(*)
        from public.realmie_catalogue catalogue
        where catalogue.is_active
          and catalogue.is_collectible
          and catalogue.variant_type = 'standard'
      )
    ),
    'backfill', coalesce((
      select jsonb_build_object(
        'unseen_count', state.unseen_backfill_realmie_count,
        'latest_backfill_at', state.latest_backfill_at,
        'acknowledged_at', state.acknowledged_at
      )
      from public.student_realmie_backfill_state state
      where state.student_id = p_student_id
    ), '{"unseen_count":0,"latest_backfill_at":null,"acknowledged_at":null}'::jsonb)
  )
  into v_result;

  return v_result;
end;
$$;

create or replace function public.get_student_realmie_display_secure(p_student_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_realmie_student_self_access(p_student_id);

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'slot_number', slot.slot_number,
      'realmie_key', catalogue.realmie_key,
      'display_name', catalogue.display_name,
      'realm_id', catalogue.realm_id,
      'rarity', catalogue.rarity,
      'asset_path', catalogue.asset_path
    ) order by slot.slot_number)
    from public.student_realmie_display_slots slot
    join public.student_realmies ownership
      on ownership.student_id = slot.student_id
     and ownership.realmie_id = slot.realmie_id
    join public.realmie_catalogue catalogue on catalogue.id = slot.realmie_id
    where slot.student_id = p_student_id
      and catalogue.is_active
      and catalogue.is_collectible
  ), '[]'::jsonb);
end;
$$;

create or replace function public.set_student_realmie_favourite_secure(
  p_student_id uuid,
  p_realmie_id uuid,
  p_favourite boolean
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_realmie_student_self_access(p_student_id);

  if not exists (
    select 1
    from public.student_realmies ownership
    join public.realmie_catalogue catalogue on catalogue.id = ownership.realmie_id
    where ownership.student_id = p_student_id
      and ownership.realmie_id = p_realmie_id
      and catalogue.is_active
      and catalogue.is_collectible
  ) then
    raise exception 'Only active owned Realmies can be favourited' using errcode = '42501';
  end if;

  if p_favourite then
    insert into public.student_realmie_favourites(student_id, realmie_id)
    values (p_student_id, p_realmie_id)
    on conflict do nothing;
  else
    delete from public.student_realmie_favourites
    where student_id = p_student_id
      and realmie_id = p_realmie_id;
  end if;

  return p_favourite;
end;
$$;

create or replace function public.set_student_realmie_display_slot_secure(
  p_student_id uuid,
  p_slot_number integer,
  p_realmie_id uuid default null
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_realmie_student_self_access(p_student_id);

  if p_slot_number not between 1 and 6 then
    raise exception 'Realmie display slot must be between 1 and 6';
  end if;

  if p_realmie_id is null then
    delete from public.student_realmie_display_slots
    where student_id = p_student_id and slot_number = p_slot_number;
    return;
  end if;

  if not exists (
    select 1
    from public.student_realmies ownership
    join public.realmie_catalogue catalogue on catalogue.id = ownership.realmie_id
    where ownership.student_id = p_student_id
      and ownership.realmie_id = p_realmie_id
      and catalogue.is_active
      and catalogue.is_collectible
  ) then
    raise exception 'Only active owned Realmies can be displayed' using errcode = '42501';
  end if;

  delete from public.student_realmie_display_slots
  where student_id = p_student_id
    and realmie_id = p_realmie_id
    and slot_number <> p_slot_number;

  insert into public.student_realmie_display_slots(
    student_id, slot_number, realmie_id, updated_at
  )
  values (p_student_id, p_slot_number, p_realmie_id, now())
  on conflict (student_id, slot_number) do update set
    realmie_id = excluded.realmie_id,
    updated_at = now();
end;
$$;

create or replace function public.get_teacher_student_realmie_summary_secure(
  p_student_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.can_view_student_learning(p_student_id) then
    raise exception 'Not authorised to view this student' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'total_collected', (
      select count(*)
      from public.student_realmies ownership
      join public.realmie_catalogue catalogue on catalogue.id = ownership.realmie_id
      where ownership.student_id = p_student_id
        and catalogue.is_active
        and catalogue.is_collectible
    ),
    'total_active_standard', (
      select count(*)
      from public.realmie_catalogue catalogue
      where catalogue.is_active
        and catalogue.is_collectible
        and catalogue.variant_type = 'standard'
    ),
    'by_realm', coalesce((
      select jsonb_object_agg(totals.realm_id, totals.collected)
      from (
        select catalogue.realm_id, count(*) as collected
        from public.student_realmies ownership
        join public.realmie_catalogue catalogue on catalogue.id = ownership.realmie_id
        where ownership.student_id = p_student_id
          and catalogue.is_active
          and catalogue.is_collectible
        group by catalogue.realm_id
      ) totals
    ), '{}'::jsonb),
    'latest_unlock', (
      select jsonb_build_object(
        'display_name', catalogue.display_name,
        'realm_id', catalogue.realm_id,
        'earned_at', ownership.earned_at
      )
      from public.student_realmies ownership
      join public.realmie_catalogue catalogue on catalogue.id = ownership.realmie_id
      where ownership.student_id = p_student_id
        and catalogue.is_active
        and catalogue.is_collectible
      order by ownership.earned_at desc, ownership.id desc
      limit 1
    ),
    'favourite_realmie', (
      select jsonb_build_object(
        'display_name', catalogue.display_name,
        'realm_id', catalogue.realm_id
      )
      from public.student_realmie_favourites favourite
      join public.realmie_catalogue catalogue on catalogue.id = favourite.realmie_id
      where favourite.student_id = p_student_id
        and catalogue.is_active
        and catalogue.is_collectible
      order by favourite.created_at
      limit 1
    ),
    'collections_started', (
      select count(distinct catalogue.realm_id)
      from public.student_realmies ownership
      join public.realmie_catalogue catalogue on catalogue.id = ownership.realmie_id
      where ownership.student_id = p_student_id
        and catalogue.is_active
        and catalogue.is_collectible
    )
  );
end;
$$;

create or replace function public.get_parent_student_realmie_summary_secure(
  p_student_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null
    or not exists (
      select 1
      from public.parent_student_links link
      where link.parent_user_id = auth.uid()
        and link.student_id = p_student_id
        and link.status = 'active'
    ) then
    raise exception 'Not authorised to view this student' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'total_collected', (
      select count(*)
      from public.student_realmies ownership
      join public.realmie_catalogue catalogue on catalogue.id = ownership.realmie_id
      where ownership.student_id = p_student_id
        and catalogue.is_active
        and catalogue.is_collectible
    ),
    'total_active_standard', (
      select count(*)
      from public.realmie_catalogue catalogue
      where catalogue.is_active
        and catalogue.is_collectible
        and catalogue.variant_type = 'standard'
    ),
    'by_realm', coalesce((
      select jsonb_object_agg(totals.realm_id, totals.collected)
      from (
        select catalogue.realm_id, count(*) as collected
        from public.student_realmies ownership
        join public.realmie_catalogue catalogue on catalogue.id = ownership.realmie_id
        where ownership.student_id = p_student_id
          and catalogue.is_active
          and catalogue.is_collectible
        group by catalogue.realm_id
      ) totals
    ), '{}'::jsonb),
    'latest_unlock', (
      select jsonb_build_object(
        'display_name', catalogue.display_name,
        'realm_id', catalogue.realm_id,
        'earned_at', ownership.earned_at
      )
      from public.student_realmies ownership
      join public.realmie_catalogue catalogue on catalogue.id = ownership.realmie_id
      where ownership.student_id = p_student_id
        and catalogue.is_active
        and catalogue.is_collectible
      order by ownership.earned_at desc, ownership.id desc
      limit 1
    ),
    'favourite_realmie', (
      select jsonb_build_object(
        'display_name', catalogue.display_name,
        'realm_id', catalogue.realm_id
      )
      from public.student_realmie_favourites favourite
      join public.realmie_catalogue catalogue on catalogue.id = favourite.realmie_id
      where favourite.student_id = p_student_id
        and catalogue.is_active
        and catalogue.is_collectible
      order by favourite.created_at
      limit 1
    ),
    'collections_started', (
      select count(distinct catalogue.realm_id)
      from public.student_realmies ownership
      join public.realmie_catalogue catalogue on catalogue.id = ownership.realmie_id
      where ownership.student_id = p_student_id
        and catalogue.is_active
        and catalogue.is_collectible
    )
  );
end;
$$;

revoke all on function public.get_parent_student_realmie_summary_secure(uuid)
  from public, anon;
grant execute on function public.get_parent_student_realmie_summary_secure(uuid)
  to authenticated;

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

create or replace function public.get_realmie_collection_availability_secure()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_array(
    jsonb_build_object('realm_id', 'number', 'display_name', 'Number Nexus', 'status', 'live'),
    jsonb_build_object('realm_id', 'measurement', 'display_name', 'Measurelands', 'status', 'live'),
    jsonb_build_object('realm_id', 'space', 'display_name', 'Starpath', 'status', 'coming_soon'),
    jsonb_build_object('realm_id', 'global', 'display_name', 'Beyond the Fog', 'status', 'live')
  );
$$;

revoke all on function public.get_realmie_collection_availability_secure()
  from public, anon;
grant execute on function public.get_realmie_collection_availability_secure()
  to authenticated;

do $$
declare
  v_backfill jsonb;
  v_retired integer;
  v_retired_rules integer;
  v_historical_ownership integer;
  v_historical_receipts integer;
begin
  v_backfill := public.backfill_realmie_discoveries_internal();

  select count(*) into v_retired
  from public.realmie_catalogue
  where category = 'legend' and not is_collectible;

  select count(*) into v_historical_ownership
  from public.student_realmies ownership
  join public.realmie_catalogue catalogue on catalogue.id = ownership.realmie_id
  where not catalogue.is_collectible;

  select count(*) into v_historical_receipts
  from public.realmie_unlock_receipts receipt
  join public.realmie_catalogue catalogue on catalogue.id = receipt.realmie_id
  where not catalogue.is_collectible;

  select count(*) into v_retired_rules
  from public.realmie_discovery_rules rule
  join public.realmie_catalogue catalogue on catalogue.id = rule.realmie_id
  where not catalogue.is_collectible
    and not rule.is_active;

  insert into public.realmie_architecture_correction_reports(correction_key, report)
  values (
    '20260731-remove-legends-and-enable-discovery',
    jsonb_build_object(
      'retired_legend_catalogue_rows', v_retired,
      'historical_ownership_rows_preserved', v_historical_ownership,
      'historical_receipts_preserved', v_historical_receipts,
      'retired_discovery_rules_disabled', v_retired_rules,
      'active_discovery_realmies', (
        select count(*) from public.realmie_catalogue
        where is_active and is_collectible
      ),
      'active_discovery_rules', (
        select count(*) from public.realmie_discovery_rules where is_active
      ),
      'backfill', v_backfill,
      'posttest_grants_removed', true,
      'assessment_concurrency_lock_preserved', true,
      'parent_read_projection_added', true,
      'streak_evidence_uses_existing_canonical_activity_daily', true,
      'hall_of_legends_changed', false,
      'xp_gems_cards_or_progression_changed', false
    )
  )
  on conflict (correction_key) do update set
    report = excluded.report,
    created_at = now();
end;
$$;

commit;
