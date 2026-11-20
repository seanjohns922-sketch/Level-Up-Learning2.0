-- Skate Kit: unlock it, place skate pieces anywhere, ride them. Four kit levels unlock more pieces.
-- Additive catalogue only: the kit unlock (shown under Build kits) and three hidden kit upgrades,
-- all XP purchases through purchase_economy_item_secure. The pieces themselves are free scenery.
-- Generated from lib/world3d/skate-kit.ts (checked by scripts/skate-kit-audit.mjs).
-- Rollback: delete from public.economy_items where item_key = 'central_world_kit_skate' or item_key like 'central_world_kit_upgrade_skate_%';
begin;
insert into public.economy_items (item_key, name, description, category, realm_id, rarity, price, icon, accent, active, purchasable, discoverable, sort_order, metadata) values
('central_world_kit_skate', 'Skate Kit', 'Build your own skate park anywhere: ramps, rails, a bowl and more. Then ride it! Upgrades unlock bigger pieces and neon.', 'decoration', null, 'epic', 400, 'skateboard', '#ff4fd8', true, true, true, 4, '{"marketplaceCategory":"kits","buildKit":"skate","marketplace_visual":{"type":"asset","src":"/marketplace/world-renders/kit_skate.webp","alt":"Skate Kit: a park built from its pieces","previewMode":"world"}}'::jsonb),
('central_world_kit_upgrade_skate_2', 'Skate Kit: Mini Ramp Pack', 'Skate Kit level 2: Mini Ramp Pack. New pieces appear in the Skate tab.', 'decoration', null, 'rare', 400, 'skateboard', '#ff4fd8', true, true, true, 952, '{"marketplaceCategory":"kit_upgrades","marketplaceHidden":true,"buildKit":"skate","buildKitLevel":2}'::jsonb),
('central_world_kit_upgrade_skate_3', 'Skate Kit: Half-Pipe and Bowl Pack', 'Skate Kit level 3: Half-Pipe and Bowl Pack. New pieces appear in the Skate tab.', 'decoration', null, 'epic', 800, 'skateboard', '#ff4fd8', true, true, true, 953, '{"marketplaceCategory":"kit_upgrades","marketplaceHidden":true,"buildKit":"skate","buildKitLevel":3}'::jsonb),
('central_world_kit_upgrade_skate_4', 'Skate Kit: Neon Vert Pack', 'Skate Kit level 4: Neon Vert Pack. New pieces appear in the Skate tab.', 'decoration', null, 'legendary', 1600, 'skateboard', '#ff4fd8', true, true, true, 954, '{"marketplaceCategory":"kit_upgrades","marketplaceHidden":true,"buildKit":"skate","buildKitLevel":4}'::jsonb)
on conflict (item_key) do nothing;
commit;
