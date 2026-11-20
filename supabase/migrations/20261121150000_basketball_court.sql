-- Basketball Court: an upgradeable set piece (driveway hoop, half court, floodlit full court, neon arena)
-- where the explorer can shoot hoops. Additive catalogue only: the unlock and three hidden upgrades, all
-- XP purchases through the existing purchase_economy_item_secure.
-- Generated from lib/world3d/premium-homes.ts (checked by scripts/premium-homes-audit.mjs).
-- Rollback: delete from public.economy_items where item_key = 'central_world_plot_1_play_basketball' or item_key like 'central_world_set_upgrade_basketball_%';
begin;
insert into public.economy_items (item_key, name, description, category, realm_id, rarity, price, icon, accent, active, purchasable, discoverable, sort_order, metadata) values
('central_world_plot_1_play_basketball', 'Basketball Court', 'Shoot hoops! Walk on, tap Shoot and score. Grows from a driveway hoop to a neon arena with a scoreboard. Unlock once, place as many as you like, and upgrade it through four levels.', 'decoration', null, 'rare', 300, 'dribbble', '#ff7a1a', true, true, true, 11, '{"slot":"world_plot_1","worldPlotId":"customisation-plot-1","worldAssetKey":"play_basketball","worldArea":"pools_play","worldCollection":"country","gridSize":"6x8","tier":1,"marketplaceCategory":"pools_play","premiumHome":"basketball","marketplace_visual":{"type":"asset","src":"/marketplace/world-renders/play_basketball.webp","alt":"Basketball Court: the actual world model","previewMode":"world"}}'::jsonb),
('central_world_set_upgrade_basketball_2', 'Basketball Court: Half Court', 'Upgrades every Basketball Court you place to level 2: Half Court.', 'decoration', null, 'rare', 300, 'dribbble', '#ff7a1a', true, true, true, 902, '{"marketplaceCategory":"home_upgrades","marketplaceHidden":true,"premiumHome":"basketball","premiumHomeLevel":2}'::jsonb),
('central_world_set_upgrade_basketball_3', 'Basketball Court: Floodlit Full Court', 'Upgrades every Basketball Court you place to level 3: Floodlit Full Court.', 'decoration', null, 'epic', 600, 'dribbble', '#ff7a1a', true, true, true, 903, '{"marketplaceCategory":"home_upgrades","marketplaceHidden":true,"premiumHome":"basketball","premiumHomeLevel":3}'::jsonb),
('central_world_set_upgrade_basketball_4', 'Basketball Court: Neon Arena', 'Upgrades every Basketball Court you place to level 4: Neon Arena.', 'decoration', null, 'legendary', 1200, 'dribbble', '#ff7a1a', true, true, true, 904, '{"marketplaceCategory":"home_upgrades","marketplaceHidden":true,"premiumHome":"basketball","premiumHomeLevel":4}'::jsonb)
on conflict (item_key) do nothing;
commit;
