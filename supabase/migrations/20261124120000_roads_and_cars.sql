-- Roads & Cars: four cars to collect in the Marketplace's Cars tab. Additive catalogue only.
-- City Hatch, Aussie Ute, Adventure 4WD and Volt GT are ordinary XP purchases through the existing
-- purchase_economy_item_secure; which owned car to drive and its paint are kept on the device. The carport
-- is a free build item and needs no row. No functions, grants or other rows change.
-- Generated from lib/world3d/cars.ts (checked by scripts/cars-test.mjs). 4 rows.
-- Rollback: delete from public.economy_items where item_key like 'central_world_car_%';
begin;
insert into public.economy_items (item_key, name, description, category, realm_id, rarity, price, icon, accent, active, purchasable, discoverable, sort_order, metadata) values
('central_world_car_hatch', 'City Hatch', 'A bright, zippy little hatchback. Your first car. Park it at a carport and drive it round your roads.', 'decoration', null, 'rare', 300, 'car', '#ff5e57', true, true, true, 40, '{"marketplaceCategory":"cars","carStyle":"hatch","marketplace_visual":{"type":"asset","src":"/marketplace/world-renders/car_hatch.webp","alt":"City Hatch: the actual car","previewMode":"world"}}'::jsonb),
('central_world_car_ute', 'Aussie Ute', 'A ute with a roo bar up front and a surfboard in the tray. Handles a bit of grass. Park it at a carport and drive it round your roads.', 'decoration', null, 'rare', 500, 'car', '#f5f5f0', true, true, true, 41, '{"marketplaceCategory":"cars","carStyle":"ute","marketplace_visual":{"type":"asset","src":"/marketplace/world-renders/car_ute.webp","alt":"Aussie Ute: the actual car","previewMode":"world"}}'::jsonb),
('central_world_car_four_wd', 'Adventure 4WD', 'Big chunky tyres and a kayak on the roof. Drives almost as fast on grass as on roads. Park it at a carport and drive it round your roads.', 'decoration', null, 'epic', 700, 'car', '#3f6b4a', true, true, true, 42, '{"marketplaceCategory":"cars","carStyle":"four_wd","marketplace_visual":{"type":"asset","src":"/marketplace/world-renders/car_four_wd.webp","alt":"Adventure 4WD: the actual car","previewMode":"world"}}'::jsonb),
('central_world_car_sports', 'Volt GT', 'A low electric sports car with neon underglow. The fastest on roads, but it hates grass. Park it at a carport and drive it round your roads.', 'decoration', null, 'legendary', 1000, 'car', '#7a46e0', true, true, true, 43, '{"marketplaceCategory":"cars","carStyle":"sports","marketplace_visual":{"type":"asset","src":"/marketplace/world-renders/car_sports.webp","alt":"Volt GT: the actual car","previewMode":"world"}}'::jsonb)
on conflict (item_key) do nothing;
commit;
