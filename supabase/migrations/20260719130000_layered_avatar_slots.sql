begin;

-- ── Layered avatar cosmetics ────────────────────────────────────────────────
-- The avatar moves from a single "avatar" equip slot (one full look at a time)
-- to independent layer slots, so a student can wear a hairstyle + outfit + hat +
-- glasses + cape + backpack together (Roblox-locker style).
--
-- Two kinds of customization:
--   * FREE BASE  — skin tone, hairstyle, hair colour, base clothing colour.
--     Stored per student as a small JSON blob (student_avatar_base). No XP.
--   * PREMIUM LAYERS — hats, glasses, capes, backpacks, special outfits. Each is
--     a single-layer economy item equipped into its own avatar_* slot.
--
-- The rendered outfit = DEFAULT <- base <- each equipped avatar_* item metadata.

-- 1) Allow the new layer slots on the equipped table.
alter table public.student_equipped_items
  drop constraint if exists student_equipped_items_slot_check;
alter table public.student_equipped_items
  add constraint student_equipped_items_slot_check check (slot in (
    'avatar', 'avatar_outfit', 'avatar_hat', 'avatar_glasses', 'avatar_cape',
    'avatar_backpack', 'pet', 'home', 'background', 'trail', 'nameplate',
    'title', 'victory_effect'
  ));

-- 2) Free base-look storage (choices, not inventory).
create table if not exists public.student_avatar_base (
  student_id uuid primary key references public.students(id) on delete cascade,
  base jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.student_avatar_base enable row level security;
revoke all on public.student_avatar_base from public, anon, authenticated;

-- 3) Re-tag the avatar catalogue as single-layer premium pieces. Colours and
--    hair are free base choices now, so the old bundled "looks" are retired.
update public.economy_items set active = false where category = 'avatar';

insert into public.economy_items (
  item_key, name, description, category, realm_id, rarity, price, icon, accent,
  purchasable, discoverable, sort_order, metadata
) values
  -- Hats (slot: avatar_hat)
  ('avatar_hat_beanie', 'Cosy Beanie', 'A warm pom-pom beanie.', 'avatar', null, 'common', 60, 'Shirt', '#ef4444', true, false, 110,
    '{"slot":"avatar_hat","hat":"beanie","hatColor":"#ef4444"}'),
  ('avatar_hat_cap', 'Sports Cap', 'A classic curved-brim cap.', 'avatar', null, 'common', 60, 'Shirt', '#0e7490', true, false, 111,
    '{"slot":"avatar_hat","hat":"cap","hatColor":"#0e7490"}'),
  ('avatar_hat_explorer', 'Explorer Hat', 'A wide-brim hat for real fieldwork.', 'avatar', null, 'uncommon', 140, 'Shirt', '#a16207', true, false, 112,
    '{"slot":"avatar_hat","hat":"explorer","hatColor":"#a16207"}'),
  ('avatar_hat_crown', 'Golden Crown', 'A jewelled crown for a true champion.', 'avatar', null, 'epic', 500, 'Crown', '#eab308', true, false, 113,
    '{"slot":"avatar_hat","hat":"crown","hatColor":"#fcd34d"}'),
  ('avatar_hat_wizard', 'Wizard Hat', 'A star-touched pointed hat.', 'avatar', null, 'epic', 550, 'Sparkles', '#4c1d95', true, false, 114,
    '{"slot":"avatar_hat","hat":"wizard","hatColor":"#4c1d95"}'),

  -- Glasses (slot: avatar_glasses)
  ('avatar_glasses_round', 'Round Specs', 'Smart round glasses.', 'avatar', null, 'common', 50, 'Glasses', '#1f2937', true, false, 120,
    '{"slot":"avatar_glasses","glasses":"round","glassesColor":"#1f2937"}'),
  ('avatar_glasses_shades', 'Cool Shades', 'Slick sunglasses.', 'avatar', null, 'uncommon', 120, 'Glasses', '#111827', true, false, 121,
    '{"slot":"avatar_glasses","glasses":"shades","glassesColor":"#111827"}'),
  ('avatar_glasses_visor', 'Race Visor', 'A sleek reflective visor.', 'avatar', null, 'rare', 260, 'Glasses', '#0e7490', true, false, 122,
    '{"slot":"avatar_glasses","glasses":"visor","glassesColor":"#0e7490"}'),

  -- Capes (slot: avatar_cape)
  ('avatar_cape_hero', 'Hero Cape', 'A bright, flowing hero cape.', 'avatar', null, 'rare', 300, 'Sparkles', '#dc2626', true, false, 130,
    '{"slot":"avatar_cape","cape":"hero","capeColor":"#dc2626"}'),
  ('avatar_cape_royal', 'Royal Cape', 'A gold-trimmed royal cape.', 'avatar', null, 'epic', 600, 'Sparkles', '#6d28d9', true, false, 131,
    '{"slot":"avatar_cape","cape":"royal","capeColor":"#6d28d9"}'),
  ('avatar_cape_surveyor', 'Surveyor Cape', 'A brass-trimmed cape for Measurelands fieldwork.', 'avatar', 'measurement', 'rare', 320, 'Sparkles', '#7c5b21', true, false, 132,
    '{"slot":"avatar_cape","cape":"royal","capeColor":"#7c5b21"}'),

  -- Backpacks (slot: avatar_backpack)
  ('avatar_pack_explorer', 'Explorer Pack', 'A trusty adventurer''s backpack.', 'avatar', null, 'rare', 240, 'Backpack', '#a16207', true, false, 140,
    '{"slot":"avatar_backpack","backpack":"explorer","backpackColor":"#a16207"}'),
  ('avatar_pack_rocket', 'Rocket Pack', 'A gleaming jet-pack for space explorers.', 'avatar', null, 'legendary', 900, 'Rocket', '#e2e8f0', true, false, 141,
    '{"slot":"avatar_backpack","backpack":"rocket","backpackColor":"#e2e8f0"}'),

  -- Special outfits (slot: avatar_outfit) — more than a colour, so they''re paid
  ('avatar_outfit_explorer', 'Explorer Kit', 'A khaki field outfit with sturdy boots.', 'avatar', null, 'uncommon', 150, 'Shirt', '#4d7c0f', true, false, 100,
    '{"slot":"avatar_outfit","shirt":"#4d7c0f","shirtTrim":"#d9f99d","pants":"#3f3f46","shoes":"#78716c"}'),
  ('avatar_outfit_racer', 'Racer Suit', 'A sleek racing outfit.', 'avatar', null, 'rare', 260, 'Shirt', '#0f172a', true, false, 101,
    '{"slot":"avatar_outfit","shirt":"#0f172a","shirtTrim":"#22d3ee","pants":"#1e293b","shoes":"#0ea5e9"}'),
  ('avatar_outfit_astro', 'Astro Suit', 'A white space suit with silver boots.', 'avatar', null, 'legendary', 700, 'Rocket', '#e2e8f0', true, false, 102,
    '{"slot":"avatar_outfit","shirt":"#e2e8f0","shirtTrim":"#38bdf8","pants":"#cbd5e1","shoes":"#94a3b8"}')
on conflict (item_key) do update set
  name = excluded.name, description = excluded.description, category = excluded.category,
  realm_id = excluded.realm_id, rarity = excluded.rarity, price = excluded.price,
  icon = excluded.icon, accent = excluded.accent, purchasable = excluded.purchasable,
  discoverable = excluded.discoverable, active = true, sort_order = excluded.sort_order,
  metadata = excluded.metadata;

-- 4) Economy read now includes the free base look.
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
    ), '{}'::jsonb),
    'avatar_base', coalesce((
      select b.base from public.student_avatar_base b where b.student_id = p_student_id
    ), '{}'::jsonb)
  ) into result
  from public.student_economy_wallets w
  where w.student_id = p_student_id;

  return result;
end;
$$;

-- 5) Save the free base look (whitelisted keys, string values only).
create or replace function public.set_student_avatar_base_secure(
  p_student_id uuid,
  p_base jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clean jsonb;
begin
  perform public.assert_student_access(p_student_id);
  v_clean := coalesce((
    select jsonb_object_agg(e.key, e.value)
    from jsonb_each(coalesce(p_base, '{}'::jsonb)) e
    where e.key in (
      'skin', 'skinShade', 'hair', 'hairShade', 'hairStyle',
      'shirt', 'shirtTrim', 'pants', 'shoes'
    )
      and jsonb_typeof(e.value) = 'string'
      and length(e.value #>> '{}') <= 24
  ), '{}'::jsonb);

  insert into public.student_avatar_base(student_id, base)
  values (p_student_id, v_clean)
  on conflict (student_id) do update set base = excluded.base, updated_at = now();

  return public.get_student_economy_secure(p_student_id);
end;
$$;

-- 6) Equip now accepts the avatar layer slots.
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
  if target_slot not in (
    'avatar', 'avatar_outfit', 'avatar_hat', 'avatar_glasses', 'avatar_cape',
    'avatar_backpack', 'pet', 'home', 'background', 'trail', 'nameplate',
    'title', 'victory_effect'
  ) then
    raise exception 'Item cannot be equipped';
  end if;

  insert into public.student_equipped_items(student_id, slot, item_key)
  values (p_student_id, target_slot, p_item_key)
  on conflict (student_id, slot) do update set item_key = excluded.item_key, equipped_at = now();
  return public.get_student_economy_secure(p_student_id);
end;
$$;

-- 7) Unequip a single slot (take the hat back off).
create or replace function public.unequip_economy_slot_secure(
  p_student_id uuid,
  p_slot text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  delete from public.student_equipped_items
  where student_id = p_student_id and slot = p_slot;
  return public.get_student_economy_secure(p_student_id);
end;
$$;

revoke all on function public.set_student_avatar_base_secure(uuid, jsonb) from public;
revoke all on function public.unequip_economy_slot_secure(uuid, text) from public;
grant execute on function public.set_student_avatar_base_secure(uuid, jsonb) to anon, authenticated;
grant execute on function public.unequip_economy_slot_secure(uuid, text) to anon, authenticated;

commit;
