begin;

-- Expand the avatar wardrobe and bring the whole catalogue into line with the
-- real earn rate (~40 XP per lesson). Before this, the cheapest cosmetic was
-- 250 XP (~6 lessons) and a full week of lessons could not buy a single item,
-- which broke the "small win most weeks" promise. New price ladder:
--   common 40-90 · uncommon 120-200 · rare 280-460 · epic 600-800 · legendary 1000-1400
--
-- Avatar looks are GLOBAL (realm_id null) so My Home never feels owned by one
-- realm; each look ships a full AvatarOutfit override in metadata. A couple of
-- realm-flavoured pieces are kept for collect-the-set motivation.
--
-- Idempotent: every row upserts on item_key, so replay is safe.
insert into public.economy_items (
  item_key, name, description, category, realm_id, rarity, price, icon, accent,
  purchasable, discoverable, sort_order, metadata
) values
  -- ── Starter looks (cheap, the "choose who you are" tier) ──────────────────
  ('avatar_scout_classic', 'Classic Scout', 'A friendly everyday explorer look.', 'avatar', null, 'common', 40, 'Shirt', '#2563eb', true, false, 10,
    '{"slot":"avatar","shirt":"#1d4ed8","shirtTrim":"#93c5fd","hairStyle":"swept"}'),
  ('avatar_scout_ponytail', 'Ponytail Scout', 'The everyday explorer look with a ponytail.', 'avatar', null, 'common', 40, 'Shirt', '#db2777', true, false, 11,
    '{"slot":"avatar","shirt":"#db2777","shirtTrim":"#fbcfe8","hairStyle":"ponytail"}'),
  ('avatar_scout_bun', 'Top-Knot Scout', 'The everyday explorer look with a neat bun.', 'avatar', null, 'common', 40, 'Shirt', '#7c3aed', true, false, 12,
    '{"slot":"avatar","shirt":"#7c3aed","shirtTrim":"#ddd6fe","hairStyle":"bun"}'),
  ('avatar_scout_buzz', 'Buzz Scout', 'The everyday explorer look with a fresh buzz cut.', 'avatar', null, 'common', 40, 'Shirt', '#0ea5e9', true, false, 13,
    '{"slot":"avatar","shirt":"#0ea5e9","shirtTrim":"#bae6fd","hairStyle":"buzz"}'),

  -- ── Colour hoodies (common recolours) ─────────────────────────────────────
  ('avatar_hoodie_crimson', 'Crimson Hoodie', 'A bold red hoodie for confident explorers.', 'avatar', null, 'common', 60, 'Shirt', '#dc2626', true, false, 20,
    '{"slot":"avatar","shirt":"#dc2626","shirtTrim":"#fca5a5"}'),
  ('avatar_hoodie_forest', 'Forest Hoodie', 'A calm green hoodie for the outdoors.', 'avatar', null, 'common', 60, 'Shirt', '#16a34a', true, false, 21,
    '{"slot":"avatar","shirt":"#166534","shirtTrim":"#bbf7d0"}'),
  ('avatar_hoodie_sunbeam', 'Sunbeam Hoodie', 'A cheerful golden hoodie.', 'avatar', null, 'common', 60, 'Shirt', '#f59e0b', true, false, 22,
    '{"slot":"avatar","shirt":"#d97706","shirtTrim":"#fde68a","pants":"#1f2937"}'),
  ('avatar_hoodie_midnight', 'Midnight Hoodie', 'A deep indigo hoodie with a soft glow trim.', 'avatar', null, 'uncommon', 130, 'Shirt', '#4f46e5', true, false, 23,
    '{"slot":"avatar","shirt":"#312e81","shirtTrim":"#a5b4fc","pants":"#0b1020"}'),

  -- ── Headwear-forward looks ────────────────────────────────────────────────
  ('avatar_beanie_look', 'Cosy Beanie', 'A warm pom-pom beanie.', 'avatar', null, 'common', 70, 'Shirt', '#ef4444', true, false, 30,
    '{"slot":"avatar","hat":"beanie","hatColor":"#ef4444","shirt":"#334155","shirtTrim":"#cbd5e1"}'),
  ('avatar_cap_look', 'Sports Cap', 'A classic curved-brim cap.', 'avatar', null, 'common', 70, 'Shirt', '#0891b2', true, false, 31,
    '{"slot":"avatar","hat":"cap","hatColor":"#0e7490","shirt":"#155e75","shirtTrim":"#a5f3fc"}'),
  ('avatar_safari_look', 'Field Explorer', 'A wide-brim safari hat for real fieldwork.', 'avatar', null, 'uncommon', 160, 'Shirt', '#a16207', true, false, 32,
    '{"slot":"avatar","hat":"explorer","hatColor":"#a16207","shirt":"#4d7c0f","shirtTrim":"#d9f99d","backpack":"explorer","backpackColor":"#7c5b21"}'),
  ('avatar_round_specs', 'Round Specs', 'Smart round glasses.', 'avatar', null, 'common', 60, 'Glasses', '#1f2937', true, false, 33,
    '{"slot":"avatar","glasses":"round","glassesColor":"#1f2937","shirt":"#0f766e","shirtTrim":"#99f6e4"}'),
  ('avatar_cool_shades', 'Cool Shades', 'Slick sunglasses for a confident look.', 'avatar', null, 'uncommon', 140, 'Glasses', '#111827', true, false, 34,
    '{"slot":"avatar","glasses":"shades","glassesColor":"#111827","shirt":"#1e293b","shirtTrim":"#38bdf8"}'),

  -- ── Adventurer sets (rare) ────────────────────────────────────────────────
  ('avatar_explorer_kit', 'Explorer Kit', 'Khaki jacket and a trusty backpack.', 'avatar', null, 'rare', 320, 'Backpack', '#65a30d', true, false, 40,
    '{"slot":"avatar","shirt":"#4d7c0f","shirtTrim":"#d9f99d","pants":"#3f3f46","backpack":"explorer","backpackColor":"#a16207"}'),
  ('avatar_hero_suit', 'Hero Suit', 'A bright hero outfit with a flowing cape.', 'avatar', null, 'rare', 380, 'Sparkles', '#dc2626', true, false, 41,
    '{"slot":"avatar","shirt":"#1d4ed8","shirtTrim":"#93c5fd","cape":"hero","capeColor":"#dc2626"}'),
  ('avatar_visor_racer', 'Visor Racer', 'A sleek visor and racing colours.', 'avatar', null, 'rare', 300, 'Glasses', '#06b6d4', true, false, 42,
    '{"slot":"avatar","glasses":"visor","glassesColor":"#0e7490","shirt":"#0f172a","shirtTrim":"#22d3ee"}'),

  -- ── Premium looks (epic / legendary) ──────────────────────────────────────
  ('avatar_royal_robe', 'Royal Regalia', 'A gold-trimmed royal cape and crown.', 'avatar', null, 'epic', 700, 'Crown', '#eab308', true, false, 50,
    '{"slot":"avatar","shirt":"#6d28d9","shirtTrim":"#fde68a","cape":"royal","capeColor":"#6d28d9","hat":"crown"}'),
  ('avatar_wizard_robe', 'Arcane Scholar', 'A star-touched wizard hat and round specs.', 'avatar', null, 'epic', 750, 'Sparkles', '#7c3aed', true, false, 51,
    '{"slot":"avatar","shirt":"#4338ca","shirtTrim":"#c4b5fd","hat":"wizard","hatColor":"#4c1d95","glasses":"round","glassesColor":"#312e81"}'),
  ('avatar_astro_suit', 'Astro Explorer', 'A white space suit, rocket pack and mirror visor.', 'avatar', null, 'legendary', 1200, 'Rocket', '#38bdf8', true, false, 52,
    '{"slot":"avatar","shirt":"#e2e8f0","shirtTrim":"#38bdf8","pants":"#cbd5e1","shoes":"#94a3b8","backpack":"rocket","backpackColor":"#e2e8f0","glasses":"visor","glassesColor":"#0ea5e9"}'),

  -- ── Realm-flavoured pieces (repriced, kept for collect-the-set) ────────────
  ('avatar_nexus_hoodie', 'Nexus Hoodie', 'A circuit-trim hoodie for Number Nexus explorers.', 'avatar', 'number', 'common', 80, 'Shirt', '#14b8a6', true, false, 60,
    '{"slot":"avatar","shirt":"#0f766e","shirtTrim":"#99f6e4"}'),
  ('avatar_measurelands_cape', 'Surveyor Cape', 'A brass-trimmed cape for Measurelands fieldwork.', 'avatar', 'measurement', 'rare', 320, 'Sparkles', '#d97706', true, false, 61,
    '{"slot":"avatar","shirt":"#365314","shirtTrim":"#fde68a","cape":"royal","capeColor":"#7c5b21"}')
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

-- Bring the rest of the catalogue down to the new ladder so every category has
-- an achievable entry point. (Collectibles stay price null — discovered, never
-- bought.)
update public.economy_items set price = 260 where item_key = 'pet_circuit_owl';
update public.economy_items set price = 180 where item_key = 'pet_baby_turtle';
update public.economy_items set price = 90  where item_key = 'home_crystal_lamp';
update public.economy_items set price = 140 where item_key = 'home_data_shelf';
update public.economy_items set price = 300 where item_key = 'background_measurelands_sunset';
update public.economy_items set price = 300 where item_key = 'background_neon_city';
update public.economy_items set price = 600 where item_key = 'trail_energy_sparks';
update public.economy_items set price = 220 where item_key = 'title_master_measurer';

commit;
