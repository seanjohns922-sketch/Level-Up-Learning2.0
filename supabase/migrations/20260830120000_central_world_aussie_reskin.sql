-- Aussie re-skin of the Central World customisation rewards.
-- item_key / worldAssetKey / worldPlotId / slot / price / rarity / tier are all
-- unchanged, so anything already purchased or equipped keeps working. Only the
-- presentation (name, description, accent, icon) and the placement footprint
-- (metadata.gridSize) change — footprints are now true-to-scale so the AFL oval
-- dwarfs a gum-tree cubby. The 3D models are driven by worldAssetKey, which is
-- untouched, and re-themed in CentralWorldEnvironment.tsx.
begin;

update public.economy_items set name = 'Queenslander', description = 'A classic raised timber home with a wraparound veranda.', accent = '#3b82f6', icon = 'house', metadata = jsonb_set(metadata, '{gridSize}', '"4x4"') where item_key = 'central_world_plot_1_clubhouse';
update public.economy_items set name = 'Milk Bar Arcade', description = 'A retro Aussie milk bar packed with games and treats.', accent = '#7c3aed', icon = 'gamepad-2', metadata = jsonb_set(metadata, '{gridSize}', '"4x4"') where item_key = 'central_world_plot_1_games_room';
update public.economy_items set name = 'Gum Tree Cubby', description = 'A cosy cubby house tucked up in a gum tree.', accent = '#16a34a', icon = 'tree-pine', metadata = jsonb_set(metadata, '{gridSize}', '"2x2"') where item_key = 'central_world_plot_1_treehouse';

update public.economy_items set name = 'Footy Training Shed', description = 'Train, kick and handball like an AFL pro.', accent = '#22c55e', icon = 'dumbbell', metadata = jsonb_set(metadata, '{gridSize}', '"3x3"') where item_key = 'central_world_plot_2_training_centre';
update public.economy_items set name = 'Surf Life Saving Club', description = 'The red-and-yellow beach club watching over the bay.', accent = '#dc2626', icon = 'flag', metadata = jsonb_set(metadata, '{gridSize}', '"4x4"') where item_key = 'central_world_plot_2_workshop';
update public.economy_items set name = 'Sydney Tower Eye', description = 'Australia''s golden skyline lookout, high above the city.', accent = '#e6b64c', icon = 'telescope', metadata = jsonb_set(metadata, '{gridSize}', '"3x3"') where item_key = 'central_world_plot_2_observatory';

update public.economy_items set name = 'Blue Heeler Yard', description = 'A playful yard for Australia''s loyal cattle dogs.', accent = '#3b82f6', icon = 'paw-print', metadata = jsonb_set(metadata, '{gridSize}', '"3x3"') where item_key = 'central_world_plot_3_puppy_yard';
update public.economy_items set name = 'Bilby Burrows', description = 'A soft garden of burrows for the Easter Bilby.', accent = '#a78bfa', icon = 'carrot', metadata = jsonb_set(metadata, '{gridSize}', '"3x3"') where item_key = 'central_world_plot_3_bunny_garden';
update public.economy_items set name = 'Brumby Paddock', description = 'Wild brumbies trot around this bright paddock.', accent = '#a16207', icon = 'horseshoe', metadata = jsonb_set(metadata, '{gridSize}', '"4x3"') where item_key = 'central_world_plot_3_pony_paddock';

update public.economy_items set name = 'Outback Homestead', description = 'A cream farmhouse with a silver roof and a windmill.', accent = '#c2410c', icon = 'home', metadata = jsonb_set(metadata, '{gridSize}', '"4x4"') where item_key = 'central_world_plot_4_farmyard';
update public.economy_items set name = 'Koala Gum Trees', description = 'Towering gums with a koala snoozing in the branches.', accent = '#5c7a4b', icon = 'trees', metadata = jsonb_set(metadata, '{gridSize}', '"4x4"') where item_key = 'central_world_plot_4_wildlife_habitat';

update public.economy_items set name = 'Backyard Pool', description = 'A cool dip for a hot Aussie summer day.', accent = '#0ea5e9', icon = 'waves', metadata = jsonb_set(metadata, '{gridSize}', '"3x2"') where item_key = 'central_world_plot_5_backyard_pool';
update public.economy_items set name = 'Splash Pool', description = 'A colourful splash zone with fountains.', accent = '#06b6d4', icon = 'waves', metadata = jsonb_set(metadata, '{gridSize}', '"3x3"') where item_key = 'central_world_plot_5_splash_pool';
update public.economy_items set name = 'Lagoon Pool', description = 'A resort-style lagoon fringed with palms.', accent = '#0284c7', icon = 'waves', metadata = jsonb_set(metadata, '{gridSize}', '"6x6"') where item_key = 'central_world_plot_5_water_park';

update public.economy_items set name = 'Adventure Playground', description = 'Climbing towers, slides and places to explore.', accent = '#f97316', icon = 'mountain', metadata = jsonb_set(metadata, '{gridSize}', '"4x3"') where item_key = 'central_world_plot_6_adventure_playground';
update public.economy_items set name = 'Trampoline Park', description = 'Bounce high in a park made for energy.', accent = '#22c55e', icon = 'circle-dot', metadata = jsonb_set(metadata, '{gridSize}', '"3x3"') where item_key = 'central_world_plot_6_trampoline_park';

update public.economy_items set name = 'AFL Oval', description = 'The big oval — floodlights, goal posts and a roaring crowd.', accent = '#2563eb', icon = 'trophy', metadata = jsonb_set(metadata, '{gridSize}', '"8x8"') where item_key = 'central_world_plot_7_sports_stadium';
update public.economy_items set name = 'Drive-In Cinema', description = 'Watch movies from the car under the stars.', accent = '#dc2626', icon = 'clapperboard', metadata = jsonb_set(metadata, '{gridSize}', '"4x3"') where item_key = 'central_world_plot_7_cinema';
update public.economy_items set name = 'Arcade', description = 'Retro games and high score challenges.', accent = '#a855f7', icon = 'joystick', metadata = jsonb_set(metadata, '{gridSize}', '"3x3"') where item_key = 'central_world_plot_7_arcade';

update public.economy_items set name = 'Aussie BBQ Backyard', description = 'Fire up the barbie for a backyard get-together.', accent = '#ec4899', icon = 'party-popper', metadata = jsonb_set(metadata, '{gridSize}', '"3x3"') where item_key = 'central_world_plot_8_party_house';
update public.economy_items set name = 'Kangaroo Sanctuary', description = 'A protected paddock where kangaroos bound free.', accent = '#a16207', icon = 'heart', metadata = jsonb_set(metadata, '{gridSize}', '"5x4"') where item_key = 'central_world_plot_8_pet_sanctuary';

commit;
