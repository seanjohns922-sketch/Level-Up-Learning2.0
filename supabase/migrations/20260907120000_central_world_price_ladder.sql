-- Re-tier the Central World marketplace onto a continuous price ladder.
--
-- The Aussie reskin (20260830120000) deliberately left prices untouched, so the
-- DB still holds the original flat tiers: 200 (common) / 800 (rare) / 2400
-- (legendary). purchase_economy_item_secure reads price straight from
-- public.economy_items, so the DB is the source of truth — the client catalog is
-- only used for demo/preview and as a merge fallback. This migration spreads the
-- 21 items across a smooth 150 -> 2600 ladder so there is always a next unlock
-- ~1-2 weeks of learning away (earn rate ~150-180 XP/week) and no mid-journey
-- "dead zone". item_key / rarity / tier are unchanged, so anything already
-- purchased or equipped keeps working.

-- Commons
update public.economy_items set price = 150 where item_key = 'central_world_plot_1_treehouse';
update public.economy_items set price = 200 where item_key = 'central_world_plot_3_puppy_yard';
update public.economy_items set price = 220 where item_key = 'central_world_plot_3_bunny_garden';
update public.economy_items set price = 250 where item_key = 'central_world_plot_2_training_centre';
update public.economy_items set price = 280 where item_key = 'central_world_plot_5_backyard_pool';
update public.economy_items set price = 320 where item_key = 'central_world_plot_6_trampoline_park';
update public.economy_items set price = 350 where item_key = 'central_world_plot_8_party_house';

-- Rares
update public.economy_items set price = 480 where item_key = 'central_world_plot_3_pony_paddock';
update public.economy_items set price = 560 where item_key = 'central_world_plot_5_splash_pool';
update public.economy_items set price = 620 where item_key = 'central_world_plot_6_adventure_playground';
update public.economy_items set price = 680 where item_key = 'central_world_plot_7_arcade';
update public.economy_items set price = 740 where item_key = 'central_world_plot_1_clubhouse';
update public.economy_items set price = 820 where item_key = 'central_world_plot_2_workshop';
update public.economy_items set price = 900 where item_key = 'central_world_plot_4_farmyard';
update public.economy_items set price = 980 where item_key = 'central_world_plot_7_sports_stadium';

-- Legendaries
update public.economy_items set price = 1300 where item_key = 'central_world_plot_1_games_room';
update public.economy_items set price = 1600 where item_key = 'central_world_plot_5_water_park';
update public.economy_items set price = 1900 where item_key = 'central_world_plot_7_cinema';
update public.economy_items set price = 2200 where item_key = 'central_world_plot_2_observatory';
update public.economy_items set price = 2400 where item_key = 'central_world_plot_4_wildlife_habitat';
update public.economy_items set price = 2600 where item_key = 'central_world_plot_8_pet_sanctuary';
