begin;

-- Economy ownership and XP are student-global. Realm identity belongs only to
-- item origin and discovery context; it never partitions the wallet.

create table if not exists public.economy_items (
  item_key text primary key,
  name text not null,
  description text not null,
  category text not null check (category in (
    'avatar', 'pet', 'home', 'background', 'decoration', 'collectible',
    'trail', 'emote', 'nameplate', 'title', 'victory_effect'
  )),
  realm_id text check (realm_id in ('number', 'measurement')),
  rarity text not null check (rarity in ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  price integer check (price is null or price >= 0),
  icon text not null,
  accent text not null default '#0ea5a4',
  purchasable boolean not null default true,
  discoverable boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.student_economy_wallets (
  student_id uuid primary key references public.students(id) on delete cascade,
  xp_earned integer not null default 0 check (xp_earned >= 0),
  xp_spent integer not null default 0 check (xp_spent >= 0 and xp_spent <= xp_earned),
  essence integer not null default 0 check (essence >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_economy_transactions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('earn', 'purchase', 'discovery', 'duplicate')),
  xp_delta integer not null default 0,
  essence_delta integer not null default 0,
  source_type text not null,
  source_key text not null,
  item_key text references public.economy_items(item_key),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(student_id, source_type, source_key)
);

create table if not exists public.student_inventory (
  student_id uuid not null references public.students(id) on delete cascade,
  item_key text not null references public.economy_items(item_key),
  acquired_at timestamptz not null default now(),
  acquisition_type text not null check (acquisition_type in ('purchase', 'discovery', 'reward')),
  primary key (student_id, item_key)
);

create table if not exists public.student_equipped_items (
  student_id uuid not null references public.students(id) on delete cascade,
  slot text not null check (slot in ('avatar', 'pet', 'home', 'background', 'trail', 'nameplate', 'title', 'victory_effect')),
  item_key text not null references public.economy_items(item_key),
  equipped_at timestamptz not null default now(),
  primary key (student_id, slot)
);

create index if not exists student_economy_transactions_student_idx
  on public.student_economy_transactions(student_id, created_at desc);
create index if not exists student_inventory_student_idx
  on public.student_inventory(student_id, acquired_at desc);

alter table public.economy_items enable row level security;
alter table public.student_economy_wallets enable row level security;
alter table public.student_economy_transactions enable row level security;
alter table public.student_inventory enable row level security;
alter table public.student_equipped_items enable row level security;

revoke all on public.economy_items from public, anon, authenticated;
revoke all on public.student_economy_wallets from public, anon, authenticated;
revoke all on public.student_economy_transactions from public, anon, authenticated;
revoke all on public.student_inventory from public, anon, authenticated;
revoke all on public.student_equipped_items from public, anon, authenticated;

insert into public.economy_items (
  item_key, name, description, category, realm_id, rarity, price, icon, accent,
  purchasable, discoverable, sort_order, metadata
) values
  ('avatar_nexus_hoodie', 'Nexus Hoodie', 'A circuit-trim hoodie for Number Nexus explorers.', 'avatar', 'number', 'common', 250, 'Shirt', '#14b8a6', true, false, 10, '{"slot":"avatar","shirt":"#0f766e","shirtTrim":"#99f6e4"}'),
  ('avatar_measurelands_cape', 'Surveyor Cape', 'A brass-trimmed cape for Measurelands fieldwork.', 'avatar', 'measurement', 'rare', 700, 'Sparkles', '#d97706', true, false, 20, '{"slot":"avatar","shirt":"#365314","shirtTrim":"#fde68a"}'),
  ('pet_circuit_owl', 'Circuit Owl', 'A bright-eyed companion built from friendly circuitry.', 'pet', 'number', 'rare', 900, 'Bot', '#22d3ee', true, false, 30, '{"slot":"pet"}'),
  ('pet_baby_turtle', 'Baby Turtle', 'A calm Measurelands companion who loves sunny windows.', 'pet', 'measurement', 'uncommon', 500, 'Turtle', '#22c55e', true, false, 40, '{"slot":"pet"}'),
  ('home_crystal_lamp', 'Crystal Study Lamp', 'A warm lamp for late-afternoon discoveries.', 'home', 'measurement', 'common', 300, 'LampDesk', '#f59e0b', true, false, 50, '{"slot":"home"}'),
  ('home_data_shelf', 'Data Display Shelf', 'A clean shelf for displaying collected technology.', 'home', 'number', 'uncommon', 450, 'Library', '#06b6d4', true, false, 60, '{"slot":"home"}'),
  ('background_measurelands_sunset', 'Measurelands Sunset', 'Turn the realm sky warm gold at sunset.', 'background', 'measurement', 'rare', 800, 'Sunset', '#f97316', true, false, 70, '{"slot":"background"}'),
  ('background_neon_city', 'Neon City', 'A vivid Number Nexus skyline after dark.', 'background', 'number', 'rare', 800, 'Building2', '#8b5cf6', true, false, 80, '{"slot":"background"}'),
  ('trail_energy_sparks', 'Energy Sparks', 'A harmless trail of teal energy sparks.', 'trail', 'number', 'epic', 1200, 'Zap', '#2dd4bf', true, false, 90, '{"slot":"trail"}'),
  ('title_master_measurer', 'Master Measurer', 'A title celebrating careful measurement.', 'title', 'measurement', 'rare', 650, 'Award', '#eab308', true, false, 100, '{"slot":"title"}'),
  ('collectible_quartz', 'Quartz', 'A bright common stone from Measurelands.', 'collectible', 'measurement', 'common', null, 'Gem', '#d8b4fe', false, true, 200, '{}'),
  ('collectible_jade', 'Jade', 'A smooth uncommon Measurelands gemstone.', 'collectible', 'measurement', 'uncommon', null, 'Gem', '#34d399', false, true, 210, '{}'),
  ('collectible_amethyst', 'Amethyst', 'A rare purple crystal discovered while learning.', 'collectible', 'measurement', 'rare', null, 'Gem', '#a78bfa', false, true, 220, '{}'),
  ('collectible_celestial_crystal', 'Celestial Crystal', 'A legendary crystal that glows like the night sky.', 'collectible', 'measurement', 'legendary', null, 'Gem', '#38bdf8', false, true, 230, '{}'),
  ('collectible_energy_crystal', 'Energy Crystal', 'A charged crystal recovered from Number Nexus.', 'collectible', 'number', 'common', null, 'BatteryCharging', '#2dd4bf', false, true, 240, '{}'),
  ('collectible_data_cube', 'Data Cube', 'An uncommon cube filled with shifting number patterns.', 'collectible', 'number', 'uncommon', null, 'Box', '#22d3ee', false, true, 250, '{}'),
  ('collectible_ai_core', 'AI Core', 'A legendary core from the deepest Nexus circuits.', 'collectible', 'number', 'legendary', null, 'Cpu', '#f472b6', false, true, 260, '{}')
on conflict (item_key) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  realm_id = excluded.realm_id,
  rarity = excluded.rarity,
  price = excluded.price,
  icon = excluded.icon,
  accent = excluded.accent,
  purchasable = excluded.purchasable,
  discoverable = excluded.discoverable,
  active = true,
  sort_order = excluded.sort_order,
  metadata = excluded.metadata;

insert into public.student_economy_wallets(student_id, xp_earned)
select s.id, coalesce(sum(sad.xp_earned), 0)::integer
from public.students s
left join public.student_activity_daily sad on sad.student_id = s.id
group by s.id
on conflict (student_id) do update set
  xp_earned = greatest(public.student_economy_wallets.xp_earned, excluded.xp_earned),
  updated_at = now();

create or replace function public.award_student_economy_xp(
  p_student_id uuid,
  p_amount integer,
  p_source_type text,
  p_source_key text,
  p_metadata jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
begin
  if coalesce(p_amount, 0) <= 0 then return false; end if;

  insert into public.student_economy_transactions(
    student_id, transaction_type, xp_delta, source_type, source_key, metadata
  ) values (
    p_student_id, 'earn', p_amount, p_source_type, p_source_key, coalesce(p_metadata, '{}'::jsonb)
  ) on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;

  insert into public.student_economy_wallets(student_id, xp_earned)
  values (p_student_id, p_amount)
  on conflict (student_id) do update set
    xp_earned = public.student_economy_wallets.xp_earned + excluded.xp_earned,
    updated_at = now();
  return true;
end;
$$;

revoke all on function public.award_student_economy_xp(uuid, integer, text, text, jsonb)
  from public, anon, authenticated;

create or replace function public.apply_completion_xp(
  p_student_id uuid,
  p_class_id uuid,
  p_questions integer,
  p_correct integer,
  p_lessons integer,
  p_quizzes integer,
  p_xp integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.upsert_student_activity_daily(
    p_student_id,
    p_class_id,
    (timezone('Australia/Melbourne', now()))::date,
    greatest(coalesce(p_questions, 0), 0),
    greatest(coalesce(p_correct, 0), 0),
    greatest(coalesce(p_lessons, 0), 0),
    greatest(coalesce(p_quizzes, 0), 0),
    0,
    greatest(coalesce(p_xp, 0), 0)
  );
  perform public.award_student_economy_xp(
    p_student_id,
    greatest(coalesce(p_xp, 0), 0),
    'completion',
    gen_random_uuid()::text,
    jsonb_build_object('lessons', p_lessons, 'quizzes', p_quizzes)
  );
end;
$$;

revoke all on function public.apply_completion_xp(uuid, uuid, integer, integer, integer, integer, integer)
  from public, anon, authenticated;

create or replace function public.get_student_economy_secure(p_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  perform public.assert_student_access(p_student_id);

  insert into public.student_economy_wallets(student_id)
  values (p_student_id) on conflict do nothing;

  select jsonb_build_object(
    'wallet', jsonb_build_object(
      'xp_earned', w.xp_earned,
      'xp_spent', w.xp_spent,
      'xp_balance', w.xp_earned - w.xp_spent,
      'essence', w.essence
    ),
    'items', coalesce((
      select jsonb_agg(to_jsonb(i) order by i.sort_order, i.name)
      from public.economy_items i where i.active
    ), '[]'::jsonb),
    'inventory', coalesce((
      select jsonb_agg(jsonb_build_object(
        'item_key', si.item_key,
        'acquired_at', si.acquired_at,
        'acquisition_type', si.acquisition_type
      ) order by si.acquired_at desc)
      from public.student_inventory si where si.student_id = p_student_id
    ), '[]'::jsonb),
    'equipped', coalesce((
      select jsonb_object_agg(sei.slot, sei.item_key)
      from public.student_equipped_items sei where sei.student_id = p_student_id
    ), '{}'::jsonb)
  ) into result
  from public.student_economy_wallets w
  where w.student_id = p_student_id;

  return result;
end;
$$;

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
  if p_realm_id not in ('number', 'measurement') then raise exception 'Invalid realm'; end if;
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

create or replace function public.purchase_economy_item_secure(
  p_student_id uuid,
  p_item_key text,
  p_purchase_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.economy_items%rowtype;
  wallet public.student_economy_wallets%rowtype;
begin
  perform public.assert_student_access(p_student_id);
  select * into target from public.economy_items
  where item_key = p_item_key and active and purchasable and price is not null;
  if target.item_key is null then raise exception 'Item is not available'; end if;

  if exists(select 1 from public.student_inventory where student_id = p_student_id and item_key = p_item_key) then
    raise exception 'Item is already owned';
  end if;

  insert into public.student_economy_wallets(student_id) values (p_student_id) on conflict do nothing;
  select * into wallet from public.student_economy_wallets where student_id = p_student_id for update;
  if wallet.xp_earned - wallet.xp_spent < target.price then raise exception 'Not enough XP'; end if;

  insert into public.student_economy_transactions(
    student_id, transaction_type, xp_delta, source_type, source_key, item_key
  ) values (
    p_student_id, 'purchase', -target.price, 'marketplace', p_purchase_key::text, p_item_key
  );
  insert into public.student_inventory(student_id, item_key, acquisition_type)
  values (p_student_id, p_item_key, 'purchase');
  update public.student_economy_wallets
  set xp_spent = xp_spent + target.price, updated_at = now()
  where student_id = p_student_id;

  return public.get_student_economy_secure(p_student_id);
end;
$$;

create or replace function public.equip_economy_item_secure(
  p_student_id uuid,
  p_item_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.economy_items%rowtype;
  target_slot text;
begin
  perform public.assert_student_access(p_student_id);
  select * into target from public.economy_items where item_key = p_item_key and active;
  if target.item_key is null then raise exception 'Item is not available'; end if;
  if not exists(select 1 from public.student_inventory where student_id = p_student_id and item_key = p_item_key) then
    raise exception 'Item is not owned';
  end if;

  target_slot := coalesce(target.metadata->>'slot', target.category);
  if target_slot not in ('avatar', 'pet', 'home', 'background', 'trail', 'nameplate', 'title', 'victory_effect') then
    raise exception 'Item cannot be equipped';
  end if;
  insert into public.student_equipped_items(student_id, slot, item_key)
  values (p_student_id, target_slot, p_item_key)
  on conflict (student_id, slot) do update set item_key = excluded.item_key, equipped_at = now();
  return public.get_student_economy_secure(p_student_id);
end;
$$;

revoke all on function public.get_student_economy_secure(uuid) from public;
revoke all on function public.discover_realm_collectible_secure(uuid, text, uuid) from public;
revoke all on function public.purchase_economy_item_secure(uuid, text, uuid) from public;
revoke all on function public.equip_economy_item_secure(uuid, text) from public;
grant execute on function public.get_student_economy_secure(uuid) to anon, authenticated;
grant execute on function public.discover_realm_collectible_secure(uuid, text, uuid) to anon, authenticated;
grant execute on function public.purchase_economy_item_secure(uuid, text, uuid) to anon, authenticated;
grant execute on function public.equip_economy_item_secure(uuid, text) to anon, authenticated;

commit;
