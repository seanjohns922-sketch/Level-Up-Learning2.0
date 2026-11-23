-- Stop selling the old-look buildings, landmarks and pools now that premium sets (homes, City Life, and the
-- coming Main Street town buildings) replace them, so the shop only offers items with four levels. The
-- animals stay on sale. Anyone who owns one keeps it and can still place it: ownership lives in
-- student_inventory and the world only checks ownership to place. Generated from RETIRED_FROM_SALE in
-- lib/world3d/central-world-customisation-catalog.ts (checked by scripts/retired-items-test.mjs). 31 rows.
-- Rollback: update public.economy_items set purchasable = true where item_key in (the same list);
begin;
update public.economy_items
set purchasable = false
where item_key in (
  'central_world_plot_1_clubhouse',
  'central_world_plot_1_games_room',
  'central_world_plot_1_treehouse',
  'central_world_plot_2_training_centre',
  'central_world_plot_2_workshop',
  'central_world_plot_2_observatory',
  'central_world_plot_5_backyard_pool',
  'central_world_plot_5_splash_pool',
  'central_world_plot_5_water_park',
  'central_world_plot_6_adventure_playground',
  'central_world_plot_7_sports_stadium',
  'central_world_plot_7_cinema',
  'central_world_plot_7_arcade',
  'central_world_plot_8_party_house',
  'central_world_plot_1_village_store',
  'central_world_plot_1_village_cafe',
  'central_world_plot_1_village_library',
  'central_world_plot_1_village_town_hall',
  'central_world_plot_7_opera_house',
  'central_world_plot_7_harbour_bridge',
  'central_world_plot_2_lighthouse',
  'central_world_plot_1_beach_huts',
  'central_world_plot_1_country_bakery',
  'central_world_plot_8_windmill_garden',
  'central_world_plot_6_bush_camp',
  'central_world_plot_1_nexus_tower',
  'central_world_plot_1_measure_lodge',
  'central_world_plot_1_pattern_loom',
  'central_world_plot_1_stats_station',
  'central_world_plot_1_chance_games',
  'central_world_plot_1_star_habitat'
);
commit;
