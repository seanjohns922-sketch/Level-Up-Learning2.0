begin;

-- Marketplace purchases require an explicit, accurate visual. These legacy
-- products have no approved artwork yet, so keep them registered and
-- visible as unavailable without allowing XP to be spent on placeholders.
update public.economy_items
set
  purchasable = false,
  metadata = metadata || jsonb_build_object(
    'marketplace_status', 'artwork_unavailable',
    'marketplace_reason', 'missing-marketplace-artwork'
  )
where item_key in (
  'home_crystal_lamp',
  'home_data_shelf',
  'trail_energy_sparks',
  'title_master_measurer'
);

commit;
