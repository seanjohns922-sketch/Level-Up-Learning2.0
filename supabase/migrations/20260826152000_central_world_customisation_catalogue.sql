begin;

alter table public.student_equipped_items
  drop constraint if exists student_equipped_items_slot_check;
alter table public.student_equipped_items
  add constraint student_equipped_items_slot_check check (slot in (
    'avatar', 'avatar_outfit', 'avatar_hat', 'avatar_glasses', 'avatar_cape',
    'avatar_backpack', 'avatar_hand', 'top', 'bottom', 'footwear',
    'pet', 'home', 'background', 'trail', 'nameplate', 'title', 'victory_effect',
    'world_plot_1', 'world_plot_2', 'world_plot_3', 'world_plot_4',
    'world_plot_5', 'world_plot_6', 'world_plot_7', 'world_plot_8'
  ));

create or replace function public.equip_economy_item_secure(
  p_student_id uuid,
  p_item_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.economy_items%rowtype;
  target_slot text;
begin
  perform public.assert_student_access(p_student_id);
  select * into target from public.economy_items where item_key = p_item_key and active;
  if target.item_key is null then raise exception 'Item is not available'; end if;
  if not exists(select 1 from public.student_inventory where student_id = p_student_id and item_key = p_item_key) then
    raise exception 'Item is not owned';
  end if;

  target_slot := coalesce(target.metadata->>'slot', target.category);
  if target_slot not in (
    'avatar', 'avatar_outfit', 'avatar_hat', 'avatar_glasses', 'avatar_cape',
    'avatar_backpack', 'avatar_hand', 'top', 'bottom', 'footwear',
    'pet', 'home', 'background', 'trail', 'nameplate', 'title', 'victory_effect',
    'world_plot_1', 'world_plot_2', 'world_plot_3', 'world_plot_4',
    'world_plot_5', 'world_plot_6', 'world_plot_7', 'world_plot_8'
  ) then
    raise exception 'Item cannot be equipped';
  end if;

  insert into public.student_equipped_items(student_id, slot, item_key)
  values (p_student_id, target_slot, p_item_key)
  on conflict (student_id, slot) do update set item_key = excluded.item_key, equipped_at = now();
  return public.get_student_economy_secure(p_student_id);
end;
$$;
revoke all on function public.equip_economy_item_secure(uuid, text) from public;
grant execute on function public.equip_economy_item_secure(uuid, text) to anon, authenticated;

insert into public.economy_items (
  item_key, name, description, category, realm_id, rarity, price, icon, accent,
  purchasable, discoverable, sort_order, metadata
) values
  ('central_world_plot_1_reflection_pond', 'Reflection Pond', 'A calm pond beside the Tower path.', 'decoration', null, 'common', 200, 'waves', '#38bdf8', true, false, 811, '{"slot":"world_plot_1","worldPlotId":"customisation-plot-1","worldAssetKey":"reflection_pond","worldArea":"waterworks","tier":1,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Reflection Pond central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_1_willow_lake', 'Willow Lake', 'A peaceful lake shaded by a willow tree.', 'decoration', null, 'rare', 800, 'tree-pine', '#0ea5e9', true, false, 812, '{"slot":"world_plot_1","worldPlotId":"customisation-plot-1","worldAssetKey":"willow_lake","worldArea":"waterworks","tier":2,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Willow Lake central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_1_crystal_reservoir', 'Crystal Reservoir', 'A brilliant reservoir powered by crystal light.', 'decoration', null, 'legendary', 2400, 'gem', '#8b5cf6', true, false, 813, '{"slot":"world_plot_1","worldPlotId":"customisation-plot-1","worldAssetKey":"crystal_reservoir","worldArea":"waterworks","tier":3,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Crystal Reservoir central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_2_practice_court', 'Practice Court', 'A simple court for daily training.', 'decoration', null, 'common', 200, 'dumbbell', '#f59e0b', true, false, 821, '{"slot":"world_plot_2","worldPlotId":"customisation-plot-2","worldAssetKey":"practice_court","worldArea":"training","tier":1,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Practice Court central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_2_explorer_gym', 'Explorer Gym', 'A dedicated gym for growing explorers.', 'decoration', null, 'rare', 800, 'dumbbell', '#f97316', true, false, 822, '{"slot":"world_plot_2","worldPlotId":"customisation-plot-2","worldAssetKey":"explorer_gym","worldArea":"training","tier":2,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Explorer Gym central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_2_champion_arena', 'Champion Arena', 'A grand arena built for Tower champions.', 'decoration', null, 'legendary', 2400, 'trophy', '#eab308', true, false, 823, '{"slot":"world_plot_2","worldPlotId":"customisation-plot-2","worldAssetKey":"champion_arena","worldArea":"training","tier":3,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Champion Arena central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_3_wildflower_garden', 'Wildflower Garden', 'A bright garden filled with wildflowers.', 'decoration', null, 'common', 200, 'flower-2', '#22c55e', true, false, 831, '{"slot":"world_plot_3","worldPlotId":"customisation-plot-3","worldAssetKey":"wildflower_garden","worldArea":"gardens","tier":1,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Wildflower Garden central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_3_scholar_grove', 'Scholar Grove', 'A shady grove for reading and reflection.', 'decoration', null, 'rare', 800, 'trees', '#16a34a', true, false, 832, '{"slot":"world_plot_3","worldPlotId":"customisation-plot-3","worldAssetKey":"scholar_grove","worldArea":"gardens","tier":2,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Scholar Grove central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_3_starlight_conservatory', 'Starlight Conservatory', 'A glass garden glowing beneath the stars.', 'decoration', null, 'legendary', 2400, 'sparkles', '#a855f7', true, false, 833, '{"slot":"world_plot_3","worldPlotId":"customisation-plot-3","worldAssetKey":"starlight_conservatory","worldArea":"gardens","tier":3,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Starlight Conservatory central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_4_timber_footbridge', 'Timber Footbridge', 'A sturdy timber crossing for the grounds.', 'decoration', null, 'common', 200, 'route', '#a16207', true, false, 841, '{"slot":"world_plot_4","worldPlotId":"customisation-plot-4","worldAssetKey":"timber_footbridge","worldArea":"crossing","tier":1,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Timber Footbridge central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_4_stone_arch_bridge', 'Stone Arch Bridge', 'A lasting stone bridge with a high arch.', 'decoration', null, 'rare', 800, 'landmark', '#64748b', true, false, 842, '{"slot":"world_plot_4","worldPlotId":"customisation-plot-4","worldAssetKey":"stone_arch_bridge","worldArea":"crossing","tier":2,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Stone Arch Bridge central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_4_lumina_bridge', 'Lumina Bridge', 'A radiant bridge lit by magical energy.', 'decoration', null, 'legendary', 2400, 'sparkles', '#06b6d4', true, false, 843, '{"slot":"world_plot_4","worldPlotId":"customisation-plot-4","worldAssetKey":"lumina_bridge","worldArea":"crossing","tier":3,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Lumina Bridge central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_5_garden_fence', 'Garden Fence', 'A neat fence marking the Tower grounds.', 'decoration', null, 'common', 200, 'fence', '#84cc16', true, false, 851, '{"slot":"world_plot_5","worldPlotId":"customisation-plot-5","worldAssetKey":"garden_fence","worldArea":"boundary","tier":1,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Garden Fence central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_5_stone_boundary', 'Stone Boundary', 'A strong stone boundary around the grounds.', 'decoration', null, 'rare', 800, 'shield', '#78716c', true, false, 852, '{"slot":"world_plot_5","worldPlotId":"customisation-plot-5","worldAssetKey":"stone_boundary","worldArea":"boundary","tier":2,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Stone Boundary central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_5_crystal_ward', 'Crystal Ward', 'A crystal barrier that watches over the Tower.', 'decoration', null, 'legendary', 2400, 'shield-check', '#c084fc', true, false, 853, '{"slot":"world_plot_5","worldPlotId":"customisation-plot-5","worldAssetKey":"crystal_ward","worldArea":"boundary","tier":3,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Crystal Ward central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_6_picnic_circle', 'Picnic Circle', 'A friendly place to gather and rest.', 'decoration', null, 'common', 200, 'users', '#fb7185', true, false, 861, '{"slot":"world_plot_6","worldPlotId":"customisation-plot-6","worldAssetKey":"picnic_circle","worldArea":"community","tier":1,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Picnic Circle central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_6_explorer_plaza', 'Explorer Plaza', 'A lively plaza for explorers to meet.', 'decoration', null, 'rare', 800, 'users-round', '#14b8a6', true, false, 862, '{"slot":"world_plot_6","worldPlotId":"customisation-plot-6","worldAssetKey":"explorer_plaza","worldArea":"community","tier":2,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Explorer Plaza central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_6_festival_courtyard', 'Festival Courtyard', 'A colourful courtyard for Tower celebrations.', 'decoration', null, 'legendary', 2400, 'party-popper', '#ec4899', true, false, 863, '{"slot":"world_plot_6","worldPlotId":"customisation-plot-6","worldAssetKey":"festival_courtyard","worldArea":"community","tier":3,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Festival Courtyard central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_7_tool_shed', 'Tool Shed', 'A compact shed for tools and supplies.', 'decoration', null, 'common', 200, 'hammer', '#a16207', true, false, 871, '{"slot":"world_plot_7","worldPlotId":"customisation-plot-7","worldAssetKey":"tool_shed","worldArea":"workshop","tier":1,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Tool Shed central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_7_maker_workshop', 'Maker Workshop', 'A busy workshop for building new ideas.', 'decoration', null, 'rare', 800, 'wrench', '#ea580c', true, false, 872, '{"slot":"world_plot_7","worldPlotId":"customisation-plot-7","worldAssetKey":"maker_workshop","worldArea":"workshop","tier":2,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Maker Workshop central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_7_inventor_hall', 'Inventor Hall', 'A grand hall for ambitious inventions.', 'decoration', null, 'legendary', 2400, 'lightbulb', '#facc15', true, false, 873, '{"slot":"world_plot_7","worldPlotId":"customisation-plot-7","worldAssetKey":"inventor_hall","worldArea":"workshop","tier":3,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Inventor Hall central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_8_trail_lookout', 'Trail Lookout', 'A raised lookout over the Tower grounds.', 'decoration', null, 'common', 200, 'binoculars', '#60a5fa', true, false, 881, '{"slot":"world_plot_8","worldPlotId":"customisation-plot-8","worldAssetKey":"trail_lookout","worldArea":"lookout","tier":1,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Trail Lookout central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_8_skywatch_deck', 'Skywatch Deck', 'A high deck made for watching the night sky.', 'decoration', null, 'rare', 800, 'telescope', '#6366f1', true, false, 882, '{"slot":"world_plot_8","worldPlotId":"customisation-plot-8","worldAssetKey":"skywatch_deck","worldArea":"lookout","tier":2,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Skywatch Deck central world customisation preview","previewMode":"title"}}'),
  ('central_world_plot_8_celestial_observatory', 'Celestial Observatory', 'A magnificent observatory for exploring the cosmos.', 'decoration', null, 'legendary', 2400, 'orbit', '#7c3aed', true, false, 883, '{"slot":"world_plot_8","worldPlotId":"customisation-plot-8","worldAssetKey":"celestial_observatory","worldArea":"lookout","tier":3,"marketplace_visual":{"type":"asset","src":"/images/central-world-valley-panorama.png","alt":"Celestial Observatory central world customisation preview","previewMode":"title"}}')
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

commit;
