-- Pet roster: 10 collectible pets rendered as premium procedural art (PetArt).
-- Adds species to metadata so the marketplace picks the right art. Existing two
-- pets (Circuit Owl, Baby Turtle) get their species tag; eight new pets added.

-- Tag the existing pets with their species (art is keyed by metadata.species,
-- with an item_key fallback in PetArt).
update public.economy_items set metadata = metadata || '{"species":"owl"}'::jsonb   where item_key = 'pet_circuit_owl';
update public.economy_items set metadata = metadata || '{"species":"turtle"}'::jsonb where item_key = 'pet_baby_turtle';

insert into public.economy_items (
  item_key, name, description, category, realm_id, rarity, price, icon, accent,
  purchasable, discoverable, sort_order, metadata
) values
  ('pet_scout_pup',     'Scout Pup',     'A loyal little explorer who never loses the trail.',            'pet', 'number',      'common',    350,  'Dog',       '#d9a066', true, false, 31, '{"slot":"pet","species":"puppy"}'),
  ('pet_cloud_bunny',   'Cloud Bunny',   'A soft, twitchy-nosed companion light as a cloud.',            'pet', 'measurement', 'common',    350,  'Rabbit',    '#cbb89a', true, false, 32, '{"slot":"pet","species":"bunny"}'),
  ('pet_pebble_kitten', 'Pebble Kitten', 'A curious grey kitten with a flick of a tail.',               'pet', 'number',      'uncommon',  500,  'Cat',       '#94a3b8', true, false, 33, '{"slot":"pet","species":"cat"}'),
  ('pet_frost_penguin', 'Frost Penguin', 'A tuxedoed friend who waddles in from Measurelands winters.',  'pet', 'measurement', 'uncommon',  500,  'Bird',      '#475569', true, false, 34, '{"slot":"pet","species":"penguin"}'),
  ('pet_rusty_fox',     'Rusty Fox',     'A clever, bushy-tailed fox with a bright white blaze.',        'pet', 'measurement', 'rare',      900,  'PawPrint',  '#f97316', true, false, 35, '{"slot":"pet","species":"fox"}'),
  ('pet_spark_dino',    'Spark Dino',    'A plucky little dino with plates down its back.',              'pet', 'number',      'epic',      1200, 'Sparkles',  '#10b981', true, false, 36, '{"slot":"pet","species":"dino"}'),
  ('pet_ember_dragon',  'Ember Dragon',  'A tiny dragon with golden horns and a warm heart.',           'pet', 'number',      'legendary', 1800, 'Flame',     '#8b5cf6', true, false, 37, '{"slot":"pet","species":"dragon"}'),
  ('pet_star_unicorn',  'Star Unicorn',  'A rainbow-maned unicorn with a shining golden horn.',          'pet', 'measurement', 'legendary', 1800, 'Sparkles',  '#c4b5fd', true, false, 38, '{"slot":"pet","species":"unicorn"}')
on conflict (item_key) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  realm_id = excluded.realm_id,
  rarity = excluded.rarity,
  price = excluded.price,
  icon = excluded.icon,
  accent = excluded.accent,
  purchasable = excluded.purchasable,
  discoverable = excluded.discoverable,
  active = true,
  sort_order = excluded.sort_order,
  metadata = excluded.metadata;
