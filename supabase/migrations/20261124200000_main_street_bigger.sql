-- The supermarket, town hall and school stand bigger at their top levels, so their plots grow. This brings
-- their Marketplace rows' recorded plot sizes in line (the game itself reads sizes from the code). Safe to
-- run whether or not 20261124180000_main_street.sql has already been run, and safe to run twice.
-- Rollback: set gridSize back to 5x4, 6x5 and 7x5 the same way.
begin;
update public.economy_items set metadata = jsonb_set(metadata, '{gridSize}', '"8x7"') where item_key = 'central_world_plot_1_main_corner_shop';
update public.economy_items set metadata = jsonb_set(metadata, '{gridSize}', '"10x8"') where item_key = 'central_world_plot_1_main_town_hall';
update public.economy_items set metadata = jsonb_set(metadata, '{gridSize}', '"12x8"') where item_key = 'central_world_plot_1_main_school';
commit;
