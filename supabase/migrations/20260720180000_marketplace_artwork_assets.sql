begin;

-- Approved product artwork is now available. Restore purchasing and store the
-- canonical asset, alt text, preview mode and room placement on each item.
update public.economy_items
set
  purchasable = true,
  metadata = (metadata
    - 'marketplace_status'
    - 'marketplace_reason')
    || jsonb_build_object(
      'marketplace_visual', jsonb_build_object(
        'type', 'asset',
        'src', '/marketplace/furniture/crystal-study-lamp.png',
        'alt', 'Amber crystal study lamp with a teal and gold base',
        'previewMode', 'room',
        'placement', 'desk'
      )
    )
where item_key = 'home_crystal_lamp';

update public.economy_items
set
  purchasable = true,
  metadata = (metadata
    - 'marketplace_status'
    - 'marketplace_reason')
    || jsonb_build_object(
      'marketplace_visual', jsonb_build_object(
        'type', 'asset',
        'src', '/marketplace/furniture/data-display-shelf.png',
        'alt', 'Teal and navy data display shelf with crystals and data cubes',
        'previewMode', 'room',
        'placement', 'floor'
      )
    )
where item_key = 'home_data_shelf';

update public.economy_items
set
  purchasable = true,
  metadata = (metadata
    - 'marketplace_status'
    - 'marketplace_reason')
    || jsonb_build_object(
      'marketplace_visual', jsonb_build_object(
        'type', 'asset',
        'src', '/marketplace/effects/energy-sparks.png',
        'alt', 'Teal lightning and starburst Energy Sparks trail',
        'previewMode', 'effect'
      )
    )
where item_key = 'trail_energy_sparks';

update public.economy_items
set
  purchasable = true,
  metadata = (metadata
    - 'marketplace_status'
    - 'marketplace_reason')
    || jsonb_build_object(
      'marketplace_visual', jsonb_build_object(
        'type', 'asset',
        'src', '/marketplace/titles/master-measurer.png',
        'alt', 'Gold and navy Master Measurer title badge',
        'previewMode', 'title'
      )
    )
where item_key = 'title_master_measurer';

commit;
