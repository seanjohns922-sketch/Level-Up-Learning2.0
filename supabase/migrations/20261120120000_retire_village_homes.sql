-- Retire the old village homes from the shop now that the premium homes replace them.
-- Village Cottage, Family House, Townhouse, Grand Manor and City Apartment Tower stop
-- being sold. Anyone who already owns one keeps it and can still place it: ownership
-- lives in student_inventory and the world only checks ownership to place.
-- Rollback: update public.economy_items set purchasable = true where item_key in (same list);
begin;
update public.economy_items
set purchasable = false
where item_key in (
  'central_world_plot_1_village_cottage',
  'central_world_plot_1_village_family_house',
  'central_world_plot_1_village_townhouse',
  'central_world_plot_1_village_manor',
  'central_world_plot_1_village_apartments'
);
commit;
