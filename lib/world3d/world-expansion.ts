export type WorldCollection = "coastal" | "bush" | "country" | "castle";
export const WORLD_COLLECTIONS: Record<WorldCollection,string> = {
  coastal: "Coastal village", bush: "Bush retreat", country: "Country town", castle: "Castle garden",
};
type FreeAddition = { key:string;name:string;group:"trees_plants"|"rocks_water"|"furniture_fun"|"fortress";collection:WorldCollection;grid:string;height:number; width?:number };
export const FREE_WORLD_ADDITIONS:FreeAddition[] = [
 {key:"fern",name:"Fern",group:"trees_plants",collection:"bush",grid:"1x1",height:1.2},
 {key:"native_grass",name:"Native Grass",group:"trees_plants",collection:"bush",grid:"1x1",height:.75},
 {key:"reeds",name:"Creek Reeds",group:"trees_plants",collection:"bush",grid:"1x1",height:1.1},
 {key:"bottlebrush",name:"Bottlebrush",group:"trees_plants",collection:"bush",grid:"1x1",height:1.6},
 {key:"terracotta_pot",name:"Terracotta Planter",group:"trees_plants",collection:"country",grid:"1x1",height:.75},
 {key:"climbing_trellis",name:"Climbing Trellis",group:"trees_plants",collection:"castle",grid:"1x1",height:2},
 {key:"driftwood",name:"Driftwood",group:"rocks_water",collection:"coastal",grid:"2x1",height:.5,width:2.2},
 {key:"pebble_border",name:"Pebble Edging",group:"rocks_water",collection:"coastal",grid:"1x1",height:.16,width:2},
 {key:"boardwalk",name:"Boardwalk Section",group:"rocks_water",collection:"coastal",grid:"1x1",height:.22,width:2},
 {key:"picket_fence",name:"Picket Fence",group:"furniture_fun",collection:"country",grid:"1x1",height:1.1,width:2},
 {key:"rope_fence",name:"Rope Fence",group:"furniture_fun",collection:"coastal",grid:"1x1",height:1,width:2},
 {key:"barrel",name:"Timber Barrel",group:"furniture_fun",collection:"country",grid:"1x1",height:.9},
 {key:"crate",name:"Timber Crate",group:"furniture_fun",collection:"country",grid:"1x1",height:.65},
 {key:"wheelbarrow",name:"Wheelbarrow",group:"furniture_fun",collection:"country",grid:"1x1",height:.85},
 {key:"watering_can",name:"Watering Can",group:"furniture_fun",collection:"country",grid:"1x1",height:.45},
 {key:"camp_lantern",name:"Camp Lantern",group:"furniture_fun",collection:"bush",grid:"1x1",height:.5},
 {key:"log_stool",name:"Log Stool",group:"furniture_fun",collection:"bush",grid:"1x1",height:.5},
 {key:"deck_chair",name:"Deck Chair",group:"furniture_fun",collection:"coastal",grid:"1x1",height:1.1},
 {key:"surfboard",name:"Surfboard Rack",group:"furniture_fun",collection:"coastal",grid:"1x1",height:2},
 {key:"bicycle",name:"Country Bicycle",group:"furniture_fun",collection:"country",grid:"1x1",height:1.1},
 {key:"picnic_basket",name:"Picnic Basket",group:"furniture_fun",collection:"bush",grid:"1x1",height:.45},
 {key:"buoy",name:"Harbour Buoy",group:"furniture_fun",collection:"coastal",grid:"1x1",height:.8},
 {key:"stone_planter",name:"Carved Stone Planter",group:"fortress",collection:"castle",grid:"1x1",height:.9},
 {key:"stone_bench",name:"Stone Garden Seat",group:"fortress",collection:"castle",grid:"2x1",height:.85},
 {key:"arched_window",name:"Garden Window Arch",group:"fortress",collection:"castle",grid:"1x1",height:2.3},
 {key:"sundial",name:"Garden Sundial",group:"fortress",collection:"castle",grid:"1x1",height:1.2},
];
type RewardAddition={key:string;name:string;description:string;collection:WorldCollection;area:"buildings"|"animals"|"special";plot:number;price:number;tier:1|2|3;grid:`${number}x${number}`;height:number;icon:string};
export const WORLD_REWARD_ADDITIONS:RewardAddition[]=[
 {key:"opera_house",name:"Sydney Opera House",description:"Sculptural sail-shaped roofs overlooking your own harbour.",collection:"coastal",area:"special",plot:7,price:2500,tier:3,grid:"5x4",height:7,icon:"landmark"},
 {key:"harbour_bridge",name:"Harbour Bridge",description:"A steel arch bridge with sandstone pylons and a timber promenade.",collection:"coastal",area:"special",plot:7,price:2300,tier:3,grid:"6x2",height:6,icon:"landmark"},
 {key:"lighthouse",name:"Coastal Lighthouse",description:"A coastal lookout with a lantern room and keeper’s cottage.",collection:"coastal",area:"buildings",plot:2,price:1100,tier:2,grid:"3x3",height:8,icon:"lamp"},
 {key:"beach_huts",name:"Beach Bathing Boxes",description:"Three colourful timber bathing boxes for your beach village.",collection:"coastal",area:"buildings",plot:1,price:420,tier:1,grid:"4x2",height:3,icon:"house"},
 {key:"railway_station",name:"Outback Railway Station",description:"A country platform with a station clock, canopy and railway track.",collection:"country",area:"buildings",plot:2,price:1200,tier:2,grid:"5x3",height:4.8,icon:"train-front"},
 {key:"country_bakery",name:"Country Bakery",description:"A welcoming weatherboard bakery with an awning and bread display.",collection:"country",area:"buildings",plot:1,price:520,tier:2,grid:"3x3",height:4.2,icon:"croissant"},
 {key:"platypus_creek",name:"Platypus Creek",description:"A reed-lined creek with river stones, driftwood and a resident platypus.",collection:"bush",area:"animals",plot:4,price:760,tier:2,grid:"4x3",height:1.8,icon:"waves"},
 {key:"wombat_burrows",name:"Wombat Burrows",description:"Earthy burrows beneath a fallen log, home to two sturdy wombats.",collection:"bush",area:"animals",plot:3,price:380,tier:1,grid:"3x2",height:1.4,icon:"paw-print"},
 {key:"cockatoo_aviary",name:"Cockatoo Aviary",description:"A spacious mesh aviary with branches and sulphur-crested cockatoos.",collection:"bush",area:"animals",plot:4,price:1050,tier:2,grid:"3x3",height:3.5,icon:"bird"},
 {key:"wildlife_rescue",name:"Wildlife Rescue Centre",description:"A bushland care centre with sheltered yards and native wildlife.",collection:"bush",area:"animals",plot:8,price:1750,tier:3,grid:"5x4",height:4.8,icon:"heart"},
 {key:"windmill_garden",name:"Country Windmill",description:"A farm windmill, rainwater tank and garden trough.",collection:"country",area:"special",plot:8,price:650,tier:2,grid:"3x3",height:5.5,icon:"wind"},
 {key:"bush_camp",name:"Bush Explorer Camp",description:"A canvas shelter, map table and camp seats for your next expedition.",collection:"bush",area:"special",plot:6,price:180,tier:1,grid:"3x3",height:2.8,icon:"tent"},
];
const knownCollections:Record<string,WorldCollection>={
 tree:"bush",pine_tree:"bush",gum_tree:"bush",palm_tree:"coastal",shrub:"bush",hedge:"castle",toadstool:"castle",log:"bush",flower_bed:"country",
 birch_tree:"castle",autumn_tree:"castle",lavender:"castle",sunflower:"country",vegetable_bed:"country",pond:"bush",lily_pond:"castle",birdbath:"castle",
 fountain:"castle",boulder:"bush",rock_pile:"bush",mossy_boulder:"bush",stepping_stones:"castle",bridge:"bush",
 lamp_post:"country",bench:"country",fence:"country",mailbox:"country",flag:"castle",umbrella:"coastal",signpost:"bush",balloons:"country",
 picnic_table:"bush",garden_arch:"castle",gazebo:"castle",market_stall:"country",swing:"country",birdhouse:"country",fire_pit:"bush",campsite:"bush",
 clubhouse:"country",games_room:"country",treehouse:"bush",training_centre:"country",workshop:"coastal",observatory:"coastal",farmyard:"country",
 backyard_pool:"country",splash_pool:"coastal",water_park:"coastal",adventure_playground:"bush",trampoline_park:"country",sports_stadium:"country",cinema:"country",arcade:"coastal",party_house:"country",
};
export function worldCollectionFor(assetKey:string):WorldCollection{
 const extra=[...FREE_WORLD_ADDITIONS,...WORLD_REWARD_ADDITIONS].find(item=>item.key===assetKey);
 return extra?.collection??knownCollections[assetKey]??(assetKey.startsWith("castle_")||["torch","well","chest","drawbridge","stone_wall","wood_gate"].includes(assetKey)?"castle":"bush");
}
