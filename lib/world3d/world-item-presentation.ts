import { FREE_WORLD_ADDITIONS, WORLD_REWARD_ADDITIONS } from "./world-expansion";
import type { EconomyItem } from "@/lib/economy";

/** Metres in the world. The avatar is approximately 2.2 m tall. Small wildlife
 * is gently enlarged for legibility; buildings are compact game-scale models.
 * No arbitrary per-category multiplier: every item has a reviewed silhouette. */
export type ItemPresentation = { height: number; width?: number; theme: "garden" | "fortress" | "australian_reward" };
const garden: Record<string, number> = {
  tree:5.2,pine_tree:6,palm_tree:5.6,gum_tree:6,birch_tree:5.4,autumn_tree:5.1,
  shrub:.95,hedge:1.25,toadstool:.42,log:.6,flower_bed:.65,lavender:.8,sunflower:1.35,vegetable_bed:.55,
  boulder:1.5,rock_pile:.8,pond:.22,fountain:2.2,bridge:1.15,lily_pond:.25,birdbath:1.15,stepping_stones:.12,mossy_boulder:.7,
  lamp_post:3,bench:1.15,fence:1.2,mailbox:1.3,flag:3.2,umbrella:2.8,signpost:1.65,balloons:2.2,
  picnic_table:.95,garden_arch:2.8,gazebo:3.2,market_stall:2.5,swing:2.8,birdhouse:2.1,fire_pit:.45,campsite:1.8,
  kangaroo:2,koala:5.5,wombat:.7,emu:1.95,kookaburra:5.5,echidna:.45,cockatoo:.65,rabbit:.6,duck:.65,platypus:.4,blue_heeler:.95,bilby:.6,
};
const fortress:Record<string,number>={castle_wall:3.4,castle_corner:3.4,castle_gate:4.1,castle_turret:6.4,castle_keep:7.3,castle_banner:2.8,drawbridge:3.2,torch:1.8,chest:.85,well:2.6,stone_wall:1,wood_gate:1.2};
const rewards:Record<string,number>={clubhouse:6.2,games_room:4.4,treehouse:5.5,training_centre:4.4,workshop:6,observatory:16,puppy_yard:2.8,bunny_garden:1.1,pony_paddock:2.5,farmyard:5.8,wildlife_habitat:7.2,backyard_pool:1.2,splash_pool:2.4,water_park:6,adventure_playground:3.6,trampoline_park:3.2,sports_stadium:7,cinema:4.8,arcade:4.2,party_house:3.6,pet_sanctuary:3.1};
const widths:Record<string,number>={hedge:2,fence:2,castle_wall:2,castle_corner:2,stone_wall:2,wood_gate:2,pond:4.5,lily_pond:3.3,bridge:4.8,stepping_stones:1.7,fire_pit:1.25,vegetable_bed:2.4,log:2.7};
export const WORLD_ITEM_PRESENTATION:Record<string,ItemPresentation>=Object.fromEntries([
  ...FREE_WORLD_ADDITIONS.map(item=>[item.key,{height:item.height,width:item.width,theme:item.collection==="castle"?"fortress":"garden"}]),
  ...WORLD_REWARD_ADDITIONS.map(item=>[item.key,{height:item.height,theme:"australian_reward"}]),
  ...Object.entries(garden).map(([key,height])=>[key,{height,width:widths[key],theme:"garden"}]),
  ...Object.entries(fortress).map(([key,height])=>[key,{height,width:widths[key],theme:"fortress"}]),
  ...Object.entries(rewards).map(([key,height])=>[key,{height,theme:"australian_reward"}]),
]);
export function getItemPresentation(item:EconomyItem){return WORLD_ITEM_PRESENTATION[String(item.metadata.worldAssetKey)]??{height:3,theme:"garden" as const};}

/** Uniform scaling retains proportions. The reserved grid footprint is a hard
 * ceiling so neighbouring placed items cannot overlap after this art upgrade. */
export function fitWorldItem(size:{x:number;y:number;z:number}, footprint:[number,number], presentation:ItemPresentation){
  const target=presentation.width?presentation.width/Math.max(size.x,.001):presentation.height/Math.max(size.y,.001);
  const margin=presentation.width===2?0:.12;
  return Math.max(.001,Math.min(target,(footprint[0]-margin)/Math.max(size.x,.001),(footprint[1]-margin)/Math.max(size.z,.001)));
}
