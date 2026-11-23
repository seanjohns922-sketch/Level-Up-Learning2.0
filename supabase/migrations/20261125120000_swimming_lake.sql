-- Swimming Lake: a lake explorers swim in, on the premium upgrade system, in a new Swimming tab.
-- Additive catalogue only: one unlock row (Marketplace: Swimming) and three upgrades bought from the
-- in-world Upgrade button, all XP purchases through the existing purchase_economy_item_secure.
-- No functions, grants or existing rows change.
-- Generated from lib/world3d/premium-homes.ts (checked by scripts/swimming-test.mjs). 4 rows.
-- Rollback: delete from public.economy_items where item_key = 'central_world_plot_1_water_swimming_lake' or item_key like 'central_world_water_upgrade_%';
begin;
insert into public.economy_items (item_key, name, description, category, realm_id, rarity, price, icon, accent, active, purchasable, discoverable, sort_order, metadata) values
('central_world_plot_1_water_swimming_lake', 'Swimming Lake', 'Dive in and swim! A swimming hole that grows into a lagoon with a waterslide. Unlock once, place as many as you like, and upgrade it through four levels.', 'decoration', null, 'epic', 600, 'waves', '#2fa8d6', true, true, true, 36, '{"slot":"world_plot_1","worldPlotId":"customisation-plot-1","worldAssetKey":"water_swimming_lake","worldArea":"water","worldCollection":"country","gridSize":"10x7","tier":1,"marketplaceCategory":"water","premiumHome":"swimming_lake","marketplace_visual":{"type":"asset","src":"/marketplace/world-renders/water_swimming_lake.webp","alt":"Swimming Lake: the actual world model","previewMode":"world"}}'::jsonb),
('central_world_water_upgrade_swimming_lake_2', 'Swimming Lake: Beach Lake', 'Upgrades every Swimming Lake you place to level 2: Beach Lake.', 'decoration', null, 'rare', 600, 'waves', '#2fa8d6', true, true, true, 902, '{"marketplaceCategory":"home_upgrades","marketplaceHidden":true,"premiumHome":"swimming_lake","premiumHomeLevel":2}'::jsonb),
('central_world_water_upgrade_swimming_lake_3', 'Swimming Lake: Patrolled Lake', 'Upgrades every Swimming Lake you place to level 3: Patrolled Lake.', 'decoration', null, 'epic', 1200, 'waves', '#2fa8d6', true, true, true, 903, '{"marketplaceCategory":"home_upgrades","marketplaceHidden":true,"premiumHome":"swimming_lake","premiumHomeLevel":3}'::jsonb),
('central_world_water_upgrade_swimming_lake_4', 'Swimming Lake: Lagoon', 'Upgrades every Swimming Lake you place to level 4: Lagoon.', 'decoration', null, 'legendary', 2400, 'waves', '#2fa8d6', true, true, true, 904, '{"marketplaceCategory":"home_upgrades","marketplaceHidden":true,"premiumHome":"swimming_lake","premiumHomeLevel":4}'::jsonb)
on conflict (item_key) do nothing;
commit;
