begin;

with visuals(item_key, asset_key) as (
  values
    ('central_world_plot_1_reflection_pond', 'reflection_pond'),
    ('central_world_plot_1_willow_lake', 'willow_lake'),
    ('central_world_plot_1_crystal_reservoir', 'crystal_reservoir'),
    ('central_world_plot_2_practice_court', 'practice_court'),
    ('central_world_plot_2_explorer_gym', 'explorer_gym'),
    ('central_world_plot_2_champion_arena', 'champion_arena'),
    ('central_world_plot_3_wildflower_garden', 'wildflower_garden'),
    ('central_world_plot_3_scholar_grove', 'scholar_grove'),
    ('central_world_plot_3_starlight_conservatory', 'starlight_conservatory'),
    ('central_world_plot_4_timber_footbridge', 'timber_footbridge'),
    ('central_world_plot_4_stone_arch_bridge', 'stone_arch_bridge'),
    ('central_world_plot_4_lumina_bridge', 'lumina_bridge'),
    ('central_world_plot_5_garden_fence', 'garden_fence'),
    ('central_world_plot_5_stone_boundary', 'stone_boundary'),
    ('central_world_plot_5_crystal_ward', 'crystal_ward'),
    ('central_world_plot_6_picnic_circle', 'picnic_circle'),
    ('central_world_plot_6_explorer_plaza', 'explorer_plaza'),
    ('central_world_plot_6_festival_courtyard', 'festival_courtyard'),
    ('central_world_plot_7_tool_shed', 'tool_shed'),
    ('central_world_plot_7_maker_workshop', 'maker_workshop'),
    ('central_world_plot_7_inventor_hall', 'inventor_hall'),
    ('central_world_plot_8_trail_lookout', 'trail_lookout'),
    ('central_world_plot_8_skywatch_deck', 'skywatch_deck'),
    ('central_world_plot_8_celestial_observatory', 'celestial_observatory')
)
update public.economy_items item
set metadata = item.metadata || jsonb_build_object(
  'marketplace_visual',
  jsonb_build_object(
    'type', 'asset',
    'src', '/marketplace/central-world/' || visuals.asset_key || '.svg',
    'alt', item.name || ' central world customisation preview',
    'previewMode', 'background'
  )
)
from visuals
where item.item_key = visuals.item_key;

commit;
