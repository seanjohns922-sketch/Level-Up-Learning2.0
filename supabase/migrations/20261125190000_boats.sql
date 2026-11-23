-- Boats: four boats to collect in the Marketplace's Swimming & boats tab. Additive catalogue only.
-- Kayak, Aussie Tinny, Swan Pedal Boat and Speedboat are ordinary XP purchases through the existing
-- purchase_economy_item_secure; the explorer launches one from any water in the hub. Which owned boat
-- to ride is chosen on the device. No functions, grants or other rows change.
-- Generated from lib/world3d/boats.ts (checked by scripts/boats-test.mjs). 4 rows.
-- Rollback: delete from public.economy_items where item_key like 'central_world_boat_%';
begin;
insert into public.economy_items (item_key, name, description, category, realm_id, rarity, price, icon, accent, active, purchasable, discoverable, sort_order, metadata) values
('central_world_boat_kayak', 'Kayak', 'Paddle anywhere there''s water. Your first boat. Wade into any water and tap BOAT to ride it.', 'decoration', null, 'rare', 300, 'sailboat', '#ffcf1a', true, true, true, 50, '{"marketplaceCategory":"water","boatStyle":"kayak","marketplace_visual":{"type":"asset","src":"/marketplace/world-renders/boat_kayak.webp","alt":"Kayak: the actual boat","previewMode":"world"}}'::jsonb),
('central_world_boat_tinny', 'Aussie Tinny', 'A little aluminium boat with an outboard motor. Putt-putt round the lake. Wade into any water and tap BOAT to ride it.', 'decoration', null, 'rare', 500, 'sailboat', '#b8c2cc', true, true, true, 51, '{"marketplaceCategory":"water","boatStyle":"tinny","marketplace_visual":{"type":"asset","src":"/marketplace/world-renders/boat_tinny.webp","alt":"Aussie Tinny: the actual boat","previewMode":"world"}}'::jsonb),
('central_world_boat_swan', 'Swan Pedal Boat', 'Pedal a giant swan round the water. Slow, and very fancy. Wade into any water and tap BOAT to ride it.', 'decoration', null, 'epic', 700, 'sailboat', '#f6f6f2', true, true, true, 52, '{"marketplaceCategory":"water","boatStyle":"swan","marketplace_visual":{"type":"asset","src":"/marketplace/world-renders/boat_swan.webp","alt":"Swan Pedal Boat: the actual boat","previewMode":"world"}}'::jsonb),
('central_world_boat_speedboat', 'Speedboat', 'The fastest thing on the water, with a big white wake. Wade into any water and tap BOAT to ride it.', 'decoration', null, 'legendary', 1000, 'sailboat', '#e5302a', true, true, true, 53, '{"marketplaceCategory":"water","boatStyle":"speedboat","marketplace_visual":{"type":"asset","src":"/marketplace/world-renders/boat_speedboat.webp","alt":"Speedboat: the actual boat","previewMode":"world"}}'::jsonb)
on conflict (item_key) do nothing;
commit;
