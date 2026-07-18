begin;

-- ── Home themes (room backgrounds) ──────────────────────────────────────────
-- My Home is no longer tied to a realm. "Explorer Study" is the free stock room
-- (rendered as the default when nothing is equipped); the rest are premium
-- backgrounds unlocked with XP. Each theme is a `background` economy item whose
-- metadata carries the room image path.
--
-- Image files live in /public/images/home-themes/<name>.png.

-- Retire the old realm-linked backgrounds — themes replace them.
update public.economy_items set active = false
where item_key in ('background_measurelands_sunset', 'background_neon_city');

insert into public.economy_items (
  item_key, name, description, category, realm_id, rarity, price, icon, accent,
  purchasable, discoverable, sort_order, metadata
) values
  ('bg_enchanted_clearing', 'Enchanted Forest Clearing', 'A misty forest of waterfalls and floating crystals.', 'background', null, 'uncommon', 200, 'Trees', '#22c55e', true, false, 300,
    '{"slot":"background","kind":"home_theme","image":"/images/home-themes/enchanted-forest-clearing.png"}'),
  ('bg_hidden_waterfall', 'Hidden Waterfall Retreat', 'A secret glade of glowing crystals and gentle streams.', 'background', null, 'rare', 350, 'Sparkles', '#f472b6', true, false, 301,
    '{"slot":"background","kind":"home_theme","image":"/images/home-themes/hidden-waterfall-retreat.png"}'),
  ('bg_aurora_cabin', 'Aurora Mountain Cabin', 'A cosy cabin beneath the northern lights.', 'background', null, 'rare', 400, 'Mountain', '#38bdf8', true, false, 302,
    '{"slot":"background","kind":"home_theme","image":"/images/home-themes/aurora-mountain-cabin.png"}'),
  ('bg_grand_lodge', 'Grand Explorer Lodge', 'A warm timber lodge with mountain views.', 'background', null, 'rare', 450, 'Building2', '#d97706', true, false, 303,
    '{"slot":"background","kind":"home_theme","image":"/images/home-themes/grand-explorer-lodge.png"}'),
  ('bg_ancient_hall', 'Ancient Hall of Explorers', 'A grand hall of stained glass and treasures.', 'background', null, 'epic', 650, 'Gem', '#a78bfa', true, false, 304,
    '{"slot":"background","kind":"home_theme","image":"/images/home-themes/ancient-hall-of-explorers.png"}'),
  ('bg_hall_portals', 'Hall of Infinite Portals', 'A grand observatory of glowing realm portals.', 'background', null, 'epic', 700, 'Sparkles', '#818cf8', true, false, 305,
    '{"slot":"background","kind":"home_theme","image":"/images/home-themes/hall-of-infinite-portals.png"}'),
  ('bg_crystal_observatory', 'Crystal Observatory', 'A crystal dome under a galaxy of stars.', 'background', null, 'legendary', 900, 'Telescope', '#67e8f9', true, false, 306,
    '{"slot":"background","kind":"home_theme","image":"/images/home-themes/crystal-observatory.png"}'),
  ('bg_floating_sky', 'Floating Sky Sanctuary', 'Floating islands and a crystal castle in the clouds.', 'background', null, 'legendary', 1000, 'Castle', '#f9a8d4', true, false, 307,
    '{"slot":"background","kind":"home_theme","image":"/images/home-themes/floating-sky-sanctuary.png"}')
on conflict (item_key) do update set
  name = excluded.name, description = excluded.description, category = excluded.category,
  realm_id = excluded.realm_id, rarity = excluded.rarity, price = excluded.price,
  icon = excluded.icon, accent = excluded.accent, purchasable = excluded.purchasable,
  discoverable = excluded.discoverable, active = true, sort_order = excluded.sort_order,
  metadata = excluded.metadata;

commit;
