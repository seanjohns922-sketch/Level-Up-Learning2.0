import type { EconomyItem } from "@/lib/economy";

/** World metres. The avatar is 2.2 m tall. Every item has its own land reservation.
 * Sites use width as their sizing anchor; props and trees use height. Width-led
 * models retain proportions unless explicitly constructed as a height-adjustable
 * connector/ground feature. Landmarks and sporting venues use compressed game scale. */
export type ItemPresentation = {
  height: number;
  width?: number;
  footprint?: [number, number];
  resizeHeight?: boolean;
  theme: "garden" | "fortress" | "australian_reward";
};
export const CASTLE_WALL_HEIGHT = 14.3;
// Native mesh stays fixed; presentation fitting controls its world height.
export const CASTLE_WALL_NATIVE_HEIGHT = 26;
export const WORLD_ITEM_PRESENTATION: Record<string, ItemPresentation> = {
  tree: {height:14, footprint:[16,16], theme:"garden"},
  pine_tree: {height:18, footprint:[14,14], theme:"garden"},
  palm_tree: {height:16, footprint:[16,16], theme:"garden"},
  gum_tree: {height:18, footprint:[20,20], theme:"garden"},
  birch_tree: {height:14, footprint:[16,16], theme:"garden"},
  autumn_tree: {height:14, footprint:[18,18], theme:"garden"},
  shrub: {height:1.5, footprint:[4,4], theme:"garden"},
  hedge: {height:2, footprint:[2,2], width:2, resizeHeight:true, theme:"garden"},
  toadstool: {height:.6, footprint:[2,2], theme:"garden"},
  log: {height:1, footprint:[6,2], width:5, resizeHeight:true, theme:"garden"},
  flower_bed: {height:.85, footprint:[4,4], theme:"garden"},
  lavender: {height:1.1, footprint:[4,4], theme:"garden"},
  sunflower: {height:2.2, footprint:[4,4], theme:"garden"},
  vegetable_bed: {height:.75, footprint:[6,4], width:4, resizeHeight:true, theme:"garden"},
  boulder: {height:3, footprint:[6,6], theme:"garden"},
  rock_pile: {height:1.4, footprint:[4,4], theme:"garden"},
  pond: {height:.35, footprint:[10,10], width:9, resizeHeight:true, theme:"garden"},
  fountain: {height:4, footprint:[8,8], theme:"garden"},
  bridge: {height:2.4, footprint:[12,6], width:10, resizeHeight:true, theme:"garden"},
  lily_pond: {height:.35, footprint:[8,8], width:7, resizeHeight:true, theme:"garden"},
  birdbath: {height:1.5, footprint:[2,2], theme:"garden"},
  stepping_stones: {height:.16, footprint:[4,6], width:2.5, resizeHeight:true, theme:"garden"},
  mossy_boulder: {height:1.4, footprint:[4,4], theme:"garden"},
  lamp_post: {height:5.5, footprint:[2,2], theme:"garden"},
  bench: {height:1.15, footprint:[4,2], theme:"garden"},
  fence: {height:1.6, footprint:[2,2], width:2, resizeHeight:true, theme:"garden"},
  mailbox: {height:1.6, footprint:[2,2], theme:"garden"},
  flag: {height:6, footprint:[4,2], theme:"garden"},
  umbrella: {height:3.2, footprint:[6,6], theme:"garden"},
  signpost: {height:2.4, footprint:[4,2], theme:"garden"},
  balloons: {height:3, footprint:[4,4], theme:"garden"},
  picnic_table: {height:1.1, footprint:[4,4], theme:"garden"},
  garden_arch: {height:3.4, footprint:[4,4], theme:"garden"},
  gazebo: {height:4.5, footprint:[8,8], theme:"garden"},
  market_stall: {height:3.5, footprint:[6,6], theme:"garden"},
  swing: {height:3.8, footprint:[8,6], theme:"garden"},
  birdhouse: {height:3.2, footprint:[2,2], theme:"garden"},
  fire_pit: {height:.65, footprint:[4,4], width:2.2, resizeHeight:true, theme:"garden"},
  campsite: {height:2.8, footprint:[8,8], theme:"garden"},
  kangaroo: {height:2.4, footprint:[2,4], theme:"garden"},
  koala: {height:16, footprint:[18,18], theme:"garden"},
  wombat: {height:.9, footprint:[2,2], theme:"garden"},
  emu: {height:2.3, footprint:[2,2], theme:"garden"},
  kookaburra: {height:16, footprint:[18,18], theme:"garden"},
  echidna: {height:.6, footprint:[2,2], theme:"garden"},
  cockatoo: {height:.8, footprint:[2,2], theme:"garden"},
  rabbit: {height:.7, footprint:[2,2], theme:"garden"},
  duck: {height:.75, footprint:[2,2], theme:"garden"},
  platypus: {height:.55, footprint:[2,2], theme:"garden"},
  blue_heeler: {height:1.15, footprint:[2,2], theme:"garden"},
  bilby: {height:.75, footprint:[2,2], theme:"garden"},
  castle_wall: {height:14.3, footprint:[2,2], width:2, resizeHeight:true, theme:"fortress"},
  castle_corner: {height:14.3, footprint:[2,2], width:2, resizeHeight:true, theme:"fortress"},
  castle_gate: {height:15.4, footprint:[22,10], theme:"fortress"},
  castle_turret: {height:17.6, footprint:[10,10], theme:"fortress"},
  castle_keep: {height:18.7, footprint:[20,20], theme:"fortress"},
  castle_banner: {height:2.75, footprint:[4,2], theme:"fortress"},
  drawbridge: {height:3.85, footprint:[8,8], theme:"fortress"},
  torch: {height:1.65, footprint:[2,2], theme:"fortress"},
  chest: {height:0.66, footprint:[4,2], theme:"fortress"},
  well: {height:1.925, footprint:[4,4], theme:"fortress"},
  stone_wall: {height:0.99, footprint:[2,2], width:2, resizeHeight:true, theme:"fortress"},
  wood_gate: {height:0.88, footprint:[2,2], width:2, resizeHeight:true, theme:"fortress"},
  fern: {height:1.8, footprint:[4,4], theme:"garden"},
  native_grass: {height:1, footprint:[2,2], theme:"garden"},
  reeds: {height:1.8, footprint:[4,4], theme:"garden"},
  bottlebrush: {height:4, footprint:[6,6], theme:"garden"},
  terracotta_pot: {height:1.1, footprint:[2,2], theme:"garden"},
  climbing_trellis: {height:1.65, footprint:[4,4], theme:"fortress"},
  driftwood: {height:.8, footprint:[6,4], width:4, resizeHeight:true, theme:"garden"},
  pebble_border: {height:.22, footprint:[2,2], width:2, resizeHeight:true, theme:"garden"},
  boardwalk: {height:.3, footprint:[2,2], width:2, resizeHeight:true, theme:"garden"},
  picket_fence: {height:1.6, footprint:[2,2], width:2, resizeHeight:true, theme:"garden"},
  rope_fence: {height:1.5, footprint:[2,2], width:2, resizeHeight:true, theme:"garden"},
  barrel: {height:1.3, footprint:[2,2], theme:"garden"},
  crate: {height:.9, footprint:[2,2], theme:"garden"},
  wheelbarrow: {height:1.2, footprint:[2,4], theme:"garden"},
  watering_can: {height:.6, footprint:[2,2], theme:"garden"},
  camp_lantern: {height:.65, footprint:[2,2], theme:"garden"},
  log_stool: {height:.65, footprint:[2,2], theme:"garden"},
  deck_chair: {height:1.5, footprint:[2,4], theme:"garden"},
  surfboard: {height:2.8, footprint:[4,2], theme:"garden"},
  bicycle: {height:1.5, footprint:[4,2], theme:"garden"},
  picnic_basket: {height:.6, footprint:[2,2], theme:"garden"},
  buoy: {height:1.2, footprint:[2,2], theme:"garden"},
  stone_planter: {height:0.77, footprint:[2,2], theme:"fortress"},
  stone_bench: {height:0.715, footprint:[4,2], theme:"fortress"},
  arched_window: {height:2.2, footprint:[4,2], theme:"fortress"},
  sundial: {height:0.99, footprint:[2,2], theme:"fortress"},
  clubhouse: {height:7, footprint:[12,12], theme:"australian_reward"},
  games_room: {height:4, footprint:[8,8], theme:"australian_reward"},
  treehouse: {height:14, footprint:[18,18], theme:"australian_reward"},
  training_centre: {height:6, footprint:[8,8], theme:"australian_reward"},
  workshop: {height:7, footprint:[10,10], theme:"australian_reward"},
  observatory: {height:40, footprint:[16,16], theme:"australian_reward"},
  puppy_yard: {height:1.8, footprint:[10,10], theme:"australian_reward"},
  bunny_garden: {height:3, footprint:[10,8], theme:"australian_reward"},
  pony_paddock: {height:4, footprint:[26,22], width:24, theme:"australian_reward"},
  farmyard: {height:8, footprint:[14,12], theme:"australian_reward"},
  wildlife_habitat: {height:18, footprint:[26,22], theme:"australian_reward"},
  backyard_pool: {height:1.5, footprint:[10,8], width:8, theme:"australian_reward"},
  splash_pool: {height:3.5, footprint:[10,10], width:8, theme:"australian_reward"},
  water_park: {height:12, footprint:[22,20], width:20, theme:"australian_reward"},
  adventure_playground: {height:5, footprint:[14,12], theme:"australian_reward"},
  trampoline_park: {height:3, footprint:[6,6], theme:"australian_reward"},
  sports_stadium: {height:12, footprint:[66,44], width:64, theme:"australian_reward"},
  cinema: {height:9, footprint:[24,18], width:22, theme:"australian_reward"},
  arcade: {height:4, footprint:[8,8], theme:"australian_reward"},
  party_house: {height:4, footprint:[10,8], theme:"australian_reward"},
  pet_sanctuary: {height:12, footprint:[30,24], width:28, theme:"australian_reward"},
  opera_house: {height:20, footprint:[38,36], width:36, theme:"australian_reward"},
  harbour_bridge: {height:20, footprint:[46,16], width:44, theme:"australian_reward"},
  lighthouse: {height:24, footprint:[18,12], theme:"australian_reward"},
  beach_huts: {height:3.5, footprint:[12,6], theme:"australian_reward"},
  railway_station: {height:5, footprint:[16,14], width:14, theme:"australian_reward"},
  country_bakery: {height:4.5, footprint:[8,8], theme:"australian_reward"},
  platypus_creek: {height:2, footprint:[14,10], width:12, theme:"australian_reward"},
  wombat_burrows: {height:1.5, footprint:[8,6], width:6, theme:"australian_reward"},
  cockatoo_aviary: {height:4, footprint:[6,6], theme:"australian_reward"},
  wildlife_rescue: {height:5, footprint:[16,10], width:14, theme:"australian_reward"},
  windmill_garden: {height:10, footprint:[8,8], theme:"australian_reward"},
  bush_camp: {height:2.8, footprint:[8,8], theme:"australian_reward"},
};
export function getItemPresentation(item: EconomyItem): ItemPresentation {
  return WORLD_ITEM_PRESENTATION[String(item.metadata.worldAssetKey)] ?? {height:3, theme:"garden"};
}

/** Uniform scaling respects both the item's anchor and its reserved land. */
export function fitWorldItem(size:{x:number;y:number;z:number}, footprint:[number,number], presentation:ItemPresentation){
 const target=presentation.width?presentation.width/Math.max(size.x,.001):presentation.height/Math.max(size.y,.001);
 const margin=presentation.width===2?0:.12;
 return Math.max(.001,Math.min(target,(footprint[0]-margin)/Math.max(size.x,.001),(footprint[1]-margin)/Math.max(size.z,.001)));
}
export function fitWorldItemScale(size:{x:number;y:number;z:number},footprint:[number,number],presentation:ItemPresentation):[number,number,number]{
 const uniform=fitWorldItem(size,footprint,presentation);
 return [uniform,presentation.resizeHeight?presentation.height/Math.max(size.y,.001):uniform,uniform];
}
