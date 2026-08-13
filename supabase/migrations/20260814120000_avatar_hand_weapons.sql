-- Held-item (weapon) slot for the explorer avatar.
-- Adds `avatar_hand` to the equipped-slot allowlist and seeds a weapon catalogue.
-- Weapons are avatar items (category 'avatar') with metadata.slot 'avatar_hand'
-- and metadata.held = a key from the WEAPONS registry (components/avatar/WeaponArt).
-- The weapon's colour, glow and flame come from that registry, so metadata only
-- carries the key — it renders on the avatar's right hand (96,156) and, for
-- legendaries, pulses with a glow (the Flame Blade also burns).

alter table public.student_equipped_items
  drop constraint if exists student_equipped_items_slot_check;
alter table public.student_equipped_items
  add constraint student_equipped_items_slot_check check (slot in (
    'avatar', 'avatar_outfit', 'avatar_hat', 'avatar_glasses', 'avatar_cape',
    'avatar_backpack', 'avatar_hand', 'top', 'bottom', 'footwear',
    'pet', 'home', 'background', 'trail', 'nameplate', 'title', 'victory_effect'
  ));

insert into public.economy_items (
  item_key, name, description, category, realm_id, rarity, price, icon, accent,
  purchasable, discoverable, sort_order, metadata
) values
  ('weapon_wooden_sword', 'Wooden Sword', 'A trusty training blade for a new explorer.', 'avatar', null, 'common', 120, 'Sword', '#cbd5e1', true, false, 300, '{"slot":"avatar_hand","held":"wooden_sword"}'),
  ('weapon_knights_sword', 'Knight''s Sword', 'A gleaming steel blade fit for a hero.', 'avatar', null, 'uncommon', 320, 'Sword', '#e2e8f0', true, false, 301, '{"slot":"avatar_hand","held":"knights_sword"}'),
  ('weapon_flame_blade', 'Flame Blade', 'A legendary sword wreathed in living fire.', 'avatar', null, 'legendary', 2200, 'Flame', '#fb7185', true, false, 302, '{"slot":"avatar_hand","held":"flame_blade"}'),
  ('weapon_apprentice_wand', 'Apprentice Wand', 'A starter wand with a twinkling tip.', 'avatar', null, 'common', 140, 'Wand2', '#a5f3fc', true, false, 303, '{"slot":"avatar_hand","held":"apprentice_wand"}'),
  ('weapon_crystal_wand', 'Crystal Wand', 'A wand tipped with a shimmering crystal star.', 'avatar', null, 'rare', 560, 'Wand2', '#c4b5fd', true, false, 304, '{"slot":"avatar_hand","held":"crystal_wand"}'),
  ('weapon_archmage_staff', 'Archmage Staff', 'A legendary staff crowned with a glowing orb.', 'avatar', null, 'legendary', 2400, 'Sparkles', '#a78bfa', true, false, 305, '{"slot":"avatar_hand","held":"archmage_staff"}'),
  ('weapon_nature_staff', 'Nature Staff', 'A living staff humming with green energy.', 'avatar', null, 'rare', 600, 'Sparkles', '#34d399', true, false, 306, '{"slot":"avatar_hand","held":"nature_staff"}'),
  ('weapon_stone_axe', 'Stone Axe', 'A rugged axe for the wildest trails.', 'avatar', null, 'common', 130, 'Axe', '#94a3b8', true, false, 307, '{"slot":"avatar_hand","held":"stone_axe"}'),
  ('weapon_golden_axe', 'Golden Axe', 'A dazzling axe forged from pure gold.', 'avatar', null, 'epic', 1100, 'Axe', '#fbbf24', true, false, 308, '{"slot":"avatar_hand","held":"golden_axe"}'),
  ('weapon_hunters_bow', 'Hunter''s Bow', 'A trusty bow with an arrow at the ready.', 'avatar', null, 'uncommon', 340, 'Target', '#a16207', true, false, 309, '{"slot":"avatar_hand","held":"hunters_bow"}'),
  ('weapon_guardian_shield', 'Guardian Shield', 'A sturdy shield with a shining star crest.', 'avatar', null, 'rare', 520, 'Shield', '#38bdf8', true, false, 310, '{"slot":"avatar_hand","held":"guardian_shield"}'),
  ('weapon_war_hammer', 'War Hammer', 'A mighty hammer that means business.', 'avatar', null, 'epic', 980, 'Hammer', '#cbd5e1', true, false, 311, '{"slot":"avatar_hand","held":"war_hammer"}'),
  ('weapon_explorers_spear', 'Explorer''s Spear', 'A long spear for reaching far-off wonders.', 'avatar', null, 'uncommon', 300, 'Swords', '#e2e8f0', true, false, 312, '{"slot":"avatar_hand","held":"explorers_spear"}'),
  ('weapon_shadow_dagger', 'Shadow Dagger', 'A swift dagger that glints in the dark.', 'avatar', null, 'uncommon', 280, 'Sword', '#818cf8', true, false, 313, '{"slot":"avatar_hand","held":"shadow_dagger"}'),
  ('weapon_adventurers_torch', 'Adventurer''s Torch', 'A blazing torch to light the deepest caves.', 'avatar', null, 'common', 110, 'Flame', '#f97316', true, false, 314, '{"slot":"avatar_hand","held":"adventurers_torch"}'),
  ('weapon_ocean_trident', 'Ocean Trident', 'A trident charged with the power of the tides.', 'avatar', null, 'epic', 1050, 'Anchor', '#22d3ee', true, false, 315, '{"slot":"avatar_hand","held":"ocean_trident"}'),
  ('weapon_reaper_scythe', 'Reaper Scythe', 'A legendary scythe wrapped in violet glow.', 'avatar', null, 'legendary', 2000, 'Sparkles', '#a78bfa', true, false, 316, '{"slot":"avatar_hand","held":"reaper_scythe"}')
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
