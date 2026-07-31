begin;

create table if not exists public.realmie_catalogue (
  id uuid primary key default gen_random_uuid(),
  realmie_key text not null unique,
  display_name text not null,
  realm_id text not null check (realm_id in ('number', 'measurement', 'space')),
  category text not null check (category in ('legend', 'villain', 'variant', 'event')),
  character_key text not null,
  evolution_level integer check (evolution_level between 1 and 6),
  variant_type text not null default 'standard'
    check (variant_type in ('standard', 'special', 'event', 'trial')),
  rarity text not null
    check (rarity in ('common', 'rare', 'epic', 'legendary', 'crystal', 'mythic')),
  lore_text text not null,
  unlock_rule_type text not null,
  unlock_rule_payload jsonb not null default '{}'::jsonb,
  asset_path text check (
    asset_path is null
    or asset_path ~ '^/realmies/(number|measurement|space)/[a-z0-9-]+\.(png|webp)$'
  ),
  silhouette_asset_path text check (
    silhouette_asset_path is null
    or silhouette_asset_path ~ '^/realmies/(number|measurement|space)/[a-z0-9-]+-silhouette\.(png|webp)$'
  ),
  collection_order integer not null,
  active_for_standard_completion boolean not null default false,
  is_active boolean not null default false,
  available_from timestamptz,
  available_until timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists realmie_catalogue_active_standard_mapping_idx
  on public.realmie_catalogue(realm_id, evolution_level)
  where is_active
    and active_for_standard_completion
    and category = 'legend'
    and variant_type = 'standard';

create index if not exists realmie_catalogue_collection_idx
  on public.realmie_catalogue(is_active, realm_id, collection_order);

create table if not exists public.student_realmies (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  realmie_id uuid not null references public.realmie_catalogue(id),
  earned_at timestamptz not null default now(),
  source_type text not null,
  source_key text not null,
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (student_id, realmie_id)
);

create index if not exists student_realmies_student_earned_idx
  on public.student_realmies(student_id, earned_at desc);

create table if not exists public.realmie_unlock_receipts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  realmie_id uuid not null references public.realmie_catalogue(id),
  source_type text not null,
  source_key text not null,
  idempotency_key text not null,
  canonical_realm_id text not null
    check (canonical_realm_id in ('number', 'measurement', 'space')),
  canonical_working_level text not null,
  canonical_assessment_id uuid
    references public.student_realm_assessments(id) on delete restrict,
  context jsonb not null default '{}'::jsonb,
  is_backfill boolean not null default false,
  created_at timestamptz not null default now(),
  unique (student_id, realmie_id),
  unique (student_id, idempotency_key)
);

create index if not exists realmie_unlock_receipts_student_created_idx
  on public.realmie_unlock_receipts(student_id, created_at desc);

create index if not exists realmie_unlock_receipts_assessment_idx
  on public.realmie_unlock_receipts(canonical_assessment_id)
  where canonical_assessment_id is not null;

create table if not exists public.student_realmie_favourites (
  student_id uuid not null references public.students(id) on delete cascade,
  realmie_id uuid not null references public.realmie_catalogue(id),
  created_at timestamptz not null default now(),
  primary key (student_id, realmie_id)
);

create table if not exists public.student_realmie_display_slots (
  student_id uuid not null references public.students(id) on delete cascade,
  slot_number integer not null check (slot_number between 1 and 6),
  realmie_id uuid not null references public.realmie_catalogue(id),
  updated_at timestamptz not null default now(),
  primary key (student_id, slot_number),
  unique (student_id, realmie_id)
);

create table if not exists public.student_realmie_backfill_state (
  student_id uuid primary key references public.students(id) on delete cascade,
  unseen_backfill_realmie_count integer not null default 0
    check (unseen_backfill_realmie_count >= 0),
  latest_backfill_at timestamptz,
  acknowledged_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.realmie_product_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  event_name text not null check (
    event_name in (
      'realmies_room_opened',
      'realmie_detail_viewed',
      'realmie_favourited',
      'realmie_display_added',
      'realmie_display_removed',
      'realmie_unlock_viewed'
    )
  ),
  realmie_id uuid references public.realmie_catalogue(id),
  realm_id text check (realm_id in ('number', 'measurement', 'space')),
  source_screen text not null,
  session_id text,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists realmie_product_events_student_created_idx
  on public.realmie_product_events(student_id, created_at desc);

alter table public.realmie_catalogue enable row level security;
alter table public.student_realmies enable row level security;
alter table public.realmie_unlock_receipts enable row level security;
alter table public.student_realmie_favourites enable row level security;
alter table public.student_realmie_display_slots enable row level security;
alter table public.student_realmie_backfill_state enable row level security;
alter table public.realmie_product_events enable row level security;

revoke all on table public.realmie_catalogue from public, anon, authenticated;
revoke all on table public.student_realmies from public, anon, authenticated;
revoke all on table public.realmie_unlock_receipts from public, anon, authenticated;
revoke all on table public.student_realmie_favourites from public, anon, authenticated;
revoke all on table public.student_realmie_display_slots from public, anon, authenticated;
revoke all on table public.student_realmie_backfill_state from public, anon, authenticated;
revoke all on table public.realmie_product_events from public, anon, authenticated;

insert into public.realmie_catalogue (
  realmie_key, display_name, realm_id, category, character_key,
  evolution_level, variant_type, rarity, lore_text, unlock_rule_type,
  unlock_rule_payload, asset_path, silhouette_asset_path, collection_order,
  active_for_standard_completion, is_active, metadata
)
values
  ('number-nexus-numbot-counter-standard', 'Numbot Counter', 'number', 'legend', 'numbot', 1, 'standard', 'rare', 'Numbot begins by counting the patterns hidden inside Number Nexus.', 'realm_posttest_pass', '{"minimum_score":85,"assessment_type":"posttest"}', null, null, 101, true, true, '{"asset_status":"missing","artwork_phase":"R3"}'),
  ('number-nexus-numbot-builder-standard', 'Numbot Builder', 'number', 'legend', 'numbot', 2, 'standard', 'rare', 'Numbot builds stronger number structures from every solved challenge.', 'realm_posttest_pass', '{"minimum_score":85,"assessment_type":"posttest"}', null, null, 102, true, true, '{"asset_status":"missing","artwork_phase":"R3"}'),
  ('number-nexus-numbot-processor-standard', 'Numbot Processor', 'number', 'legend', 'numbot', 3, 'standard', 'epic', 'Numbot processes complex number signals with speed and precision.', 'realm_posttest_pass', '{"minimum_score":85,"assessment_type":"posttest"}', null, null, 103, true, true, '{"asset_status":"missing","artwork_phase":"R3"}'),
  ('number-nexus-numbot-solver-standard', 'Numbot Solver', 'number', 'legend', 'numbot', 4, 'standard', 'epic', 'Numbot solves the deepest puzzles in the digital realm.', 'realm_posttest_pass', '{"minimum_score":85,"assessment_type":"posttest"}', null, null, 104, true, true, '{"asset_status":"missing","artwork_phase":"R3"}'),
  ('number-nexus-numbot-calculator-standard', 'Numbot Calculator', 'number', 'legend', 'numbot', 5, 'standard', 'epic', 'Numbot calculates pathways through even the largest number systems.', 'realm_posttest_pass', '{"minimum_score":85,"assessment_type":"posttest"}', null, null, 105, true, true, '{"asset_status":"missing","artwork_phase":"R3"}'),
  ('number-nexus-numbot-equationator-standard', 'Numbot Equationator', 'number', 'legend', 'numbot', 6, 'standard', 'legendary', 'Numbot masters the equations that power all of Number Nexus.', 'realm_posttest_pass', '{"minimum_score":85,"assessment_type":"posttest"}', null, null, 106, true, true, '{"asset_status":"missing","artwork_phase":"R3"}'),
  ('measurelands-meazurex-ticklet-standard', 'Meazurex Ticklet', 'measurement', 'legend', 'meazurex', 1, 'standard', 'rare', 'Meazurex learns to notice every tick, mark and measured step.', 'realm_posttest_pass', '{"minimum_score":85,"assessment_type":"posttest"}', null, null, 201, true, true, '{"asset_status":"missing","artwork_phase":"R3"}'),
  ('measurelands-meazurex-measurer-standard', 'Meazurex Measurer', 'measurement', 'legend', 'meazurex', 2, 'standard', 'rare', 'Meazurex measures the paths and landmarks of Measurelands.', 'realm_posttest_pass', '{"minimum_score":85,"assessment_type":"posttest"}', null, null, 202, true, true, '{"asset_status":"missing","artwork_phase":"R3"}'),
  ('measurelands-meazurex-tracker-standard', 'Meazurex Tracker', 'measurement', 'legend', 'meazurex', 3, 'standard', 'epic', 'Meazurex tracks distance, mass, capacity and time across the realm.', 'realm_posttest_pass', '{"minimum_score":85,"assessment_type":"posttest"}', null, null, 203, true, true, '{"asset_status":"missing","artwork_phase":"R3"}'),
  ('measurelands-meazurex-balancer-standard', 'Meazurex Balancer', 'measurement', 'legend', 'meazurex', 4, 'standard', 'epic', 'Meazurex balances quantities with calm and exact judgement.', 'realm_posttest_pass', '{"minimum_score":85,"assessment_type":"posttest"}', null, null, 204, true, true, '{"asset_status":"missing","artwork_phase":"R3"}'),
  ('measurelands-meazurex-calibrator-standard', 'Meazurex Calibrator', 'measurement', 'legend', 'meazurex', 5, 'standard', 'epic', 'Meazurex calibrates every instrument used by Measurelands explorers.', 'realm_posttest_pass', '{"minimum_score":85,"assessment_type":"posttest"}', null, null, 205, true, true, '{"asset_status":"missing","artwork_phase":"R3"}'),
  ('measurelands-meazurex-timewielder-standard', 'Meazurex Timewielder', 'measurement', 'legend', 'meazurex', 6, 'standard', 'legendary', 'Meazurex wields time and measure as one legendary force.', 'realm_posttest_pass', '{"minimum_score":85,"assessment_type":"posttest"}', null, null, 206, true, true, '{"asset_status":"missing","artwork_phase":"R3"}'),
  ('starpath-geospin-roller-standard', 'Geospin Roller', 'space', 'legend', 'geospin', 1, 'standard', 'rare', 'Geospin rolls into Starpath ready to explore shapes and routes.', 'realm_posttest_pass', '{"minimum_score":85,"assessment_type":"posttest"}', null, null, 301, true, true, '{"asset_status":"missing","artwork_phase":"R3"}'),
  ('starpath-geospin-mapper-standard', 'Geospin Mapper', 'space', 'legend', 'geospin', 2, 'standard', 'rare', 'Geospin maps the floating paths between Starpath worlds.', 'realm_posttest_pass', '{"minimum_score":85,"assessment_type":"posttest"}', null, null, 302, true, true, '{"asset_status":"missing","artwork_phase":"R3"}'),
  ('starpath-geospin-navigator-standard', 'Geospin Navigator', 'space', 'legend', 'geospin', 3, 'standard', 'epic', 'Geospin navigates distant routes using shape, position and direction.', 'realm_posttest_pass', '{"minimum_score":85,"assessment_type":"posttest"}', null, null, 303, true, true, '{"asset_status":"missing","artwork_phase":"R3"}'),
  ('starpath-geospin-shapeshifter-standard', 'Geospin Shapeshifter', 'space', 'legend', 'geospin', 4, 'standard', 'epic', 'Geospin reshapes cosmic structures to solve spatial mysteries.', 'realm_posttest_pass', '{"minimum_score":85,"assessment_type":"posttest"}', null, null, 304, true, true, '{"asset_status":"missing","artwork_phase":"R3"}'),
  ('starpath-geospin-galaxycrafter-standard', 'Geospin Galaxycrafter', 'space', 'legend', 'geospin', 5, 'standard', 'epic', 'Geospin crafts whole galaxies from patterns, paths and forms.', 'realm_posttest_pass', '{"minimum_score":85,"assessment_type":"posttest"}', null, null, 305, true, true, '{"asset_status":"missing","artwork_phase":"R3"}'),
  ('starpath-geospin-starweaver-standard', 'Geospin Starweaver', 'space', 'legend', 'geospin', 6, 'standard', 'legendary', 'Geospin weaves the final Starpath into a legendary cosmic map.', 'realm_posttest_pass', '{"minimum_score":85,"assessment_type":"posttest"}', null, null, 306, true, true, '{"asset_status":"missing","artwork_phase":"R3"}')
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
  active_for_standard_completion = excluded.active_for_standard_completion,
  is_active = excluded.is_active,
  metadata = excluded.metadata,
  updated_at = now();

create or replace function public.assert_realmie_student_self_access(p_student_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if public.request_student_session_token() is null then
    raise exception 'Realmies student access denied' using errcode = '42501';
  end if;

  perform public.assert_student_access(p_student_id);
end;
$$;

revoke all on function public.assert_realmie_student_self_access(uuid)
  from public, anon, authenticated;

create or replace function public.grant_standard_realmie_for_canonical_posttest(
  p_student_id uuid,
  p_realm_id text,
  p_working_level text,
  p_assessment_id uuid,
  p_completion_key uuid,
  p_is_backfill boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assessment public.student_realm_assessments%rowtype;
  v_progress public.student_realm_progress%rowtype;
  v_level integer;
  v_realmie public.realmie_catalogue%rowtype;
  v_owned_id uuid;
  v_inserted integer := 0;
  v_earned_at timestamptz;
  v_source_key text;
begin
  select assessment.*
  into v_assessment
  from public.student_realm_assessments assessment
  where assessment.id = p_assessment_id
    and assessment.student_id = p_student_id
    and assessment.realm_id = p_realm_id
    and assessment.working_level = p_working_level
    and assessment.assessment_type = 'posttest';

  if v_assessment.id is null then
    raise exception 'Canonical passed post-test was not found';
  end if;

  if coalesce(v_assessment.passed, false) is false
    or v_assessment.score_percent < 85 then
    return jsonb_build_object(
      'granted', false,
      'already_owned', false,
      'reason', 'posttest_below_threshold'
    );
  end if;

  v_level := case p_working_level
    when 'Year 1' then 1
    when 'Year 2' then 2
    when 'Year 3' then 3
    when 'Year 4' then 4
    when 'Year 5' then 5
    when 'Year 6' then 6
    when 'Prep' then null
    when 'Ground' then null
    when 'Ground Level' then null
    else -1
  end;

  if v_level is null then
    return jsonb_build_object(
      'granted', false,
      'already_owned', false,
      'reason', 'ground_level_has_no_standard_realmie'
    );
  end if;

  if v_level = -1 or p_realm_id not in ('number', 'measurement', 'space') then
    raise exception 'Unknown Realmie completion mapping for realm % and level %',
      p_realm_id, p_working_level;
  end if;

  select progress.*
  into v_progress
  from public.student_realm_progress progress
  where progress.student_id = p_student_id
    and progress.realm_id = p_realm_id
    and progress.working_level = p_working_level;

  if v_progress.id is null
    or v_progress.posttest_score < 85
    or v_progress.posttest_completed_at is null
    or v_progress.status <> 'PASSED' then
    raise exception 'Canonical level completion is not confirmed';
  end if;

  select catalogue.*
  into strict v_realmie
  from public.realmie_catalogue catalogue
  where catalogue.realm_id = p_realm_id
    and catalogue.evolution_level = v_level
    and catalogue.category = 'legend'
    and catalogue.variant_type = 'standard'
    and catalogue.active_for_standard_completion
    and catalogue.is_active;

  v_earned_at := coalesce(v_assessment.completed_at, v_progress.posttest_completed_at, now());
  v_source_key := case
    when p_is_backfill then 'backfill:assessment:' || v_assessment.id::text
    else 'assessment:' || v_assessment.id::text
  end;

  insert into public.student_realmies (
    student_id, realmie_id, earned_at, source_type, source_key, source_payload
  )
  values (
    p_student_id,
    v_realmie.id,
    v_earned_at,
    case when p_is_backfill then 'canonical_posttest_backfill' else 'canonical_posttest' end,
    v_source_key,
    jsonb_build_object(
      'realm_id', p_realm_id,
      'working_level', p_working_level,
      'assessment_id', v_assessment.id
    )
  )
  on conflict (student_id, realmie_id) do nothing
  returning id into v_owned_id;

  get diagnostics v_inserted = row_count;

  insert into public.realmie_unlock_receipts (
    student_id, realmie_id, source_type, source_key, idempotency_key,
    canonical_realm_id, canonical_working_level, canonical_assessment_id,
    context, is_backfill, created_at
  )
  values (
    p_student_id,
    v_realmie.id,
    case when p_is_backfill then 'canonical_posttest_backfill' else 'canonical_posttest' end,
    v_source_key,
    'standard-realmie:' || p_student_id::text || ':' || v_realmie.realmie_key,
    p_realm_id,
    p_working_level,
    v_assessment.id,
    jsonb_build_object('completion_key', p_completion_key),
    p_is_backfill,
    v_earned_at
  )
  on conflict do nothing;

  if p_is_backfill and v_inserted = 1 then
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

  return jsonb_build_object(
    'granted', v_inserted = 1,
    'already_owned', v_inserted = 0,
    'realmie_id', v_realmie.id,
    'realmie_key', v_realmie.realmie_key,
    'display_name', v_realmie.display_name
  );
exception
  when no_data_found then
    raise exception 'Active standard Realmie mapping is missing for realm % and level %',
      p_realm_id, p_working_level;
  when too_many_rows then
    raise exception 'Multiple active standard Realmie mappings exist for realm % and level %',
      p_realm_id, p_working_level;
end;
$$;

revoke all on function public.grant_standard_realmie_for_canonical_posttest(
  uuid, text, text, uuid, uuid, boolean
) from public, anon, authenticated;

create or replace function public.get_active_realmie_catalogue_secure()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', catalogue.id,
        'realmie_key', catalogue.realmie_key,
        'display_name', catalogue.display_name,
        'realm_id', catalogue.realm_id,
        'category', catalogue.category,
        'character_key', catalogue.character_key,
        'evolution_level', catalogue.evolution_level,
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
    ),
    '[]'::jsonb
  )
  from public.realmie_catalogue catalogue
  where catalogue.is_active;
$$;

revoke all on function public.get_active_realmie_catalogue_secure()
  from public, anon, authenticated;
grant execute on function public.get_active_realmie_catalogue_secure()
  to anon, authenticated;

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
    'catalogue',
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', catalogue.id,
          'realmie_key', catalogue.realmie_key,
          'display_name', catalogue.display_name,
          'realm_id', catalogue.realm_id,
          'character_key', catalogue.character_key,
          'evolution_level', catalogue.evolution_level,
          'rarity', catalogue.rarity,
          'lore_text', catalogue.lore_text,
          'collection_order', catalogue.collection_order,
          'asset_path', catalogue.asset_path,
          'silhouette_asset_path', catalogue.silhouette_asset_path,
          'asset_status', coalesce(catalogue.metadata->>'asset_status', 'missing'),
          'owned', ownership.id is not null,
          'earned_at', ownership.earned_at,
          'unlock_source', ownership.source_type,
          'favourite', favourite.realmie_id is not null,
          'display_slot', display.slot_number
        )
        order by catalogue.collection_order
      )
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
      where catalogue.is_active or ownership.id is not null
    ), '[]'::jsonb),
    'display',
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'slot_number', slot.slot_number,
          'realmie_id', catalogue.id,
          'realmie_key', catalogue.realmie_key,
          'display_name', catalogue.display_name,
          'realm_id', catalogue.realm_id,
          'rarity', catalogue.rarity,
          'asset_path', catalogue.asset_path
        )
        order by slot.slot_number
      )
      from public.student_realmie_display_slots slot
      join public.realmie_catalogue catalogue on catalogue.id = slot.realmie_id
      where slot.student_id = p_student_id
    ), '[]'::jsonb),
    'totals',
    jsonb_build_object(
      'collected', (
        select count(*)
        from public.student_realmies ownership
        join public.realmie_catalogue catalogue on catalogue.id = ownership.realmie_id
        where ownership.student_id = p_student_id
          and catalogue.category = 'legend'
          and catalogue.variant_type = 'standard'
      ),
      'active_standard', (
        select count(*)
        from public.realmie_catalogue catalogue
        where catalogue.is_active
          and catalogue.category = 'legend'
          and catalogue.variant_type = 'standard'
      )
    ),
    'backfill',
    coalesce((
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

revoke all on function public.get_student_realmies_secure(uuid)
  from public, anon, authenticated;
grant execute on function public.get_student_realmies_secure(uuid)
  to anon, authenticated;

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
    select jsonb_agg(
      jsonb_build_object(
        'slot_number', slot.slot_number,
        'realmie_key', catalogue.realmie_key,
        'display_name', catalogue.display_name,
        'realm_id', catalogue.realm_id,
        'rarity', catalogue.rarity,
        'asset_path', catalogue.asset_path
      )
      order by slot.slot_number
    )
    from public.student_realmie_display_slots slot
    join public.student_realmies ownership
      on ownership.student_id = slot.student_id
     and ownership.realmie_id = slot.realmie_id
    join public.realmie_catalogue catalogue on catalogue.id = slot.realmie_id
    where slot.student_id = p_student_id
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.get_student_realmie_display_secure(uuid)
  from public, anon, authenticated;
grant execute on function public.get_student_realmie_display_secure(uuid)
  to anon, authenticated;

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
    where ownership.student_id = p_student_id
      and ownership.realmie_id = p_realmie_id
  ) then
    raise exception 'Only owned Realmies can be favourited' using errcode = '42501';
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

revoke all on function public.set_student_realmie_favourite_secure(uuid, uuid, boolean)
  from public, anon, authenticated;
grant execute on function public.set_student_realmie_favourite_secure(uuid, uuid, boolean)
  to anon, authenticated;

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
    where ownership.student_id = p_student_id
      and ownership.realmie_id = p_realmie_id
  ) then
    raise exception 'Only owned Realmies can be displayed' using errcode = '42501';
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

revoke all on function public.set_student_realmie_display_slot_secure(uuid, integer, uuid)
  from public, anon, authenticated;
grant execute on function public.set_student_realmie_display_slot_secure(uuid, integer, uuid)
  to anon, authenticated;

create or replace function public.acknowledge_student_realmie_unlocks_secure(
  p_student_id uuid
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.assert_realmie_student_self_access(p_student_id);

  insert into public.student_realmie_backfill_state(
    student_id, unseen_backfill_realmie_count, acknowledged_at, updated_at
  )
  values (p_student_id, 0, now(), now())
  on conflict (student_id) do update set
    unseen_backfill_realmie_count = 0,
    acknowledged_at = now(),
    updated_at = now();
end;
$$;

revoke all on function public.acknowledge_student_realmie_unlocks_secure(uuid)
  from public, anon, authenticated;
grant execute on function public.acknowledge_student_realmie_unlocks_secure(uuid)
  to anon, authenticated;

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
    'realmies_room_opened',
    'realmie_detail_viewed',
    'realmie_favourited',
    'realmie_display_added',
    'realmie_display_removed',
    'realmie_unlock_viewed'
  ) then
    raise exception 'Unsupported Realmies telemetry event';
  end if;

  if p_realm_id is not null and p_realm_id not in ('number', 'measurement', 'space') then
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
    'unlock_source', v_context->'unlock_source'
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

revoke all on function public.record_realmie_product_event_secure(
  uuid, text, uuid, text, text, text, jsonb
) from public, anon, authenticated;
grant execute on function public.record_realmie_product_event_secure(
  uuid, text, uuid, text, text, text, jsonb
) to anon, authenticated;

create or replace function public.get_teacher_student_realmie_summary_secure(
  p_student_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.can_view_student_learning(p_student_id) then
    raise exception 'Not authorised to view this student' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'total_collected', (
      select count(*)
      from public.student_realmies ownership
      join public.realmie_catalogue catalogue on catalogue.id = ownership.realmie_id
      where ownership.student_id = p_student_id
        and catalogue.category = 'legend'
        and catalogue.variant_type = 'standard'
    ),
    'total_active_standard', (
      select count(*)
      from public.realmie_catalogue catalogue
      where catalogue.is_active
        and catalogue.category = 'legend'
        and catalogue.variant_type = 'standard'
    ),
    'by_realm', coalesce((
      select jsonb_object_agg(realm_totals.realm_id, realm_totals.collected)
      from (
        select catalogue.realm_id, count(*) as collected
        from public.student_realmies ownership
        join public.realmie_catalogue catalogue on catalogue.id = ownership.realmie_id
        where ownership.student_id = p_student_id
          and catalogue.category = 'legend'
          and catalogue.variant_type = 'standard'
        group by catalogue.realm_id
      ) realm_totals
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
      order by favourite.created_at
      limit 1
    )
  )
  into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_teacher_student_realmie_summary_secure(uuid)
  from public, anon, authenticated;
grant execute on function public.get_teacher_student_realmie_summary_secure(uuid)
  to authenticated;

commit;
