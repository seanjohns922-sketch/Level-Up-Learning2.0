-- Race Kit: paint your own race track anywhere, add race pieces, then race it. Four kit levels.
-- Additive catalogue only: the kit unlock (shown under Build kits) and three hidden kit upgrades,
-- all XP purchases through purchase_economy_item_secure. Tarmac painting and pieces are free once unlocked.
-- Generated from lib/world3d/race-kit.ts (checked by scripts/race-kit-audit.mjs).
-- Rollback: delete from public.economy_items where item_key = 'central_world_kit_race' or item_key like 'central_world_kit_upgrade_race_%';
begin;
insert into public.economy_items (item_key, name, description, category, realm_id, rarity, price, icon, accent, active, purchasable, discoverable, sort_order, metadata) values
('central_world_kit_race', 'Race Kit', 'Paint your own race track anywhere, any shape, then race it! Upgrades add kerbs, tyre walls, jumps, boost pads, bridges and neon.', 'decoration', null, 'epic', 500, 'flag', '#3fd0ff', true, true, true, 3, '{"marketplaceCategory":"kits","buildKit":"race","marketplace_visual":{"type":"asset","src":"/marketplace/world-renders/kit_race.webp","alt":"Race Kit: a track painted and built with it","previewMode":"world"}}'::jsonb),
('central_world_kit_upgrade_race_2', 'Race Kit: Race Day Pack', 'Race Kit level 2: Race Day Pack. New pieces appear in the Race tab.', 'decoration', null, 'rare', 450, 'flag', '#3fd0ff', true, true, true, 952, '{"marketplaceCategory":"kit_upgrades","marketplaceHidden":true,"buildKit":"race","buildKitLevel":2}'::jsonb),
('central_world_kit_upgrade_race_3', 'Race Kit: Stunt Pack', 'Race Kit level 3: Stunt Pack. New pieces appear in the Race tab.', 'decoration', null, 'epic', 900, 'flag', '#3fd0ff', true, true, true, 953, '{"marketplaceCategory":"kit_upgrades","marketplaceHidden":true,"buildKit":"race","buildKitLevel":3}'::jsonb),
('central_world_kit_upgrade_race_4', 'Race Kit: Neon Night Pack', 'Race Kit level 4: Neon Night Pack. New pieces appear in the Race tab.', 'decoration', null, 'legendary', 1800, 'flag', '#3fd0ff', true, true, true, 954, '{"marketplaceCategory":"kit_upgrades","marketplaceHidden":true,"buildKit":"race","buildKitLevel":4}'::jsonb)
on conflict (item_key) do nothing;
commit;
