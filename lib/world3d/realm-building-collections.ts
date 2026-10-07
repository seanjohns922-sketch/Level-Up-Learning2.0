import { REALM_REGISTRY, type CanonicalRealmId } from "@/lib/realms/realm-registry";
import type { EconomyItem } from "@/lib/economy";
export type RealmBuildingDesign = {
 key:string; name:string; realm:CanonicalRealmId; kind:"decoration"|"building"|"landmark";
 description:string; price:number; width:number; grid:`${number}x${number}`; accent:string;
};
/** Design-review catalogue only. Release requires server-enforced learning unlocks. */
export const REALM_BUILDING_DESIGNS:RealmBuildingDesign[] = [
 {key:"nexus_abacus",name:"Counting Garden",realm:"number",kind:"decoration",description:"A brass-framed garden abacus with five rows of colourful counting beads.",price:0,width:2.5,grid:"3x3",accent:"#39adb2"},
 {key:"nexus_workshop",name:"Inventor’s Workshop",realm:"number",kind:"building",description:"Sawtooth copper roofs, a gear sign and a sheltered invention bench.",price:650,width:8,grid:"5x5",accent:"#39adb2"},
 {key:"nexus_tower",name:"Number Nexus Apartments",realm:"number",kind:"landmark",description:"A tall futuristic apartment block with illuminated balconies, teal circuitry and an orbital rooftop reactor.",price:0,width:9,grid:"6x6",accent:"#39adb2"},
 {key:"measure_marker",name:"Surveyor’s Garden",realm:"measurement",kind:"decoration",description:"A brass surveying telescope on a timber tripod beside a graduated measuring staff.",price:0,width:2.4,grid:"3x3",accent:"#c69a50"},
 {key:"measure_lodge",name:"Measurelands House",realm:"measurement",kind:"building",description:"An ornate brass-and-gold home with violet arched windows, ruler details and pointed corner towers.",price:700,width:8,grid:"5x5",accent:"#c69a50"},
 {key:"measure_mill",name:"Measurelands Watermill",realm:"measurement",kind:"landmark",description:"A stone mill with a large timber waterwheel, millrace and tall chimney.",price:0,width:10,grid:"6x6",accent:"#c69a50"},
 {key:"pattern_mosaic",name:"Pattern Mosaic",realm:"pattern",kind:"decoration",description:"Alternating diamond tiles form a repeating violet-and-gold village mosaic.",price:0,width:2,grid:"2x2",accent:"#9672b8"},
 {key:"pattern_loom",name:"Pattern Peaks Crystal House",realm:"pattern",kind:"building",description:"An angular emerald-and-violet home with diamond roof terraces and crystal pillars.",price:750,width:7,grid:"5x5",accent:"#9672b8"},
 {key:"pattern_pavilion",name:"Kaleidoscope Pavilion",realm:"pattern",kind:"landmark",description:"A six-sided pavilion crowned by layered jewel-coloured geometric roofs.",price:0,width:9,grid:"6x6",accent:"#9672b8"},
 {key:"stats_weather",name:"Weather Instruments",realm:"statistics",kind:"decoration",description:"A weather mast with anemometer cups, a rain gauge and an instrument cabinet.",price:0,width:2.4,grid:"3x3",accent:"#628ca0"},
 {key:"stats_station",name:"Statistica Glasshouse",realm:"statistics",kind:"building",description:"A white-stone home with green glass conservatory domes, gold trim and a lookout turret.",price:800,width:8,grid:"5x5",accent:"#628ca0"},
 {key:"stats_observatory",name:"Statistica Observatory",realm:"statistics",kind:"landmark",description:"A raised circular observatory with an open telescope dome and broad entrance steps.",price:0,width:9,grid:"6x6",accent:"#628ca0"},
 {key:"chance_vane",name:"Woodland Weather Vane",realm:"chance",kind:"decoration",description:"A copper arrow weather vane above a carved woodland stone base.",price:0,width:2,grid:"2x2",accent:"#b9825c"},
 {key:"chance_games",name:"Chance Hollow Fortune House",realm:"chance",kind:"building",description:"A mysterious rose-and-violet house with pointed towers, a glowing entrance and a fortune-wheel crest.",price:650,width:7,grid:"5x5",accent:"#b9825c"},
 {key:"chance_wheel",name:"Carnival Wheel",realm:"chance",kind:"landmark",description:"A large brass-framed carnival wheel with eight jewel-coloured passenger cabins.",price:0,width:10,grid:"6x6",accent:"#b9825c"},
 {key:"star_beacon",name:"Star Lantern",realm:"space",kind:"decoration",description:"A faceted glowing star suspended inside an orbital brass lantern.",price:0,width:1.8,grid:"2x2",accent:"#7379b8"},
 {key:"star_habitat",name:"Starpath Orbital Home",realm:"space",kind:"building",description:"Connected violet habitat domes with cyan orbital bands, silver ribs and a solar canopy.",price:950,width:8,grid:"5x5",accent:"#7379b8"},
 {key:"star_planetarium",name:"Starpath Planetarium",realm:"space",kind:"landmark",description:"A sweeping midnight-blue dome with a gold orbital ring and a star-topped entrance.",price:0,width:11,grid:"7x7",accent:"#7379b8"},
];
export const REALM_BUILDING_KEYS=new Set(REALM_BUILDING_DESIGNS.map(item=>item.key));
export const REALM_BUILDING_REVIEW_ITEMS:EconomyItem[]=REALM_BUILDING_DESIGNS.map((item,index)=>({
 item_key:`realm_design_${item.key}`,name:item.name,description:item.description,category:"decoration",realm_id:null,
 rarity:item.kind==="landmark"?"legendary":item.kind==="building"?"rare":"common",price:item.price,icon:"landmark",accent:item.accent,
 active:false,purchasable:false,discoverable:false,sort_order:index,
 metadata:{worldAssetKey:item.key,gridSize:item.grid,tier:item.kind==="landmark"?3:item.kind==="building"?2:1,realmCollection:item.realm,
 realmName:REALM_REGISTRY[item.realm].name,designStage:"review",unlockProposal:item.kind==="decoration"?"Earn through realm learning":item.kind==="building"?`Unlock through learning · ${item.price} XP`:"Earn by completing the realm program"},
}));

export const REALM_DESIGN_PRESENTATIONS=Object.fromEntries(REALM_BUILDING_DESIGNS.map(item=>[item.key,{height:3,width:item.width,theme:"garden" as const}]));

export const SIGNATURE_REALM_BUILDING_KEYS=["nexus_tower","measure_lodge","pattern_loom","stats_station","chance_games","star_habitat"];
