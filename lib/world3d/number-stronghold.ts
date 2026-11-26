import { LEVEL8_WEEK_COUNTS } from '../level8-config';
export { LEVEL8_WEEK_COUNTS } from '../level8-config';
import type { SummitPoint } from './number-summit';
import type { ExpeditionRealm } from './expedition-access';

// Demo navigation; curriculum lengths come from the shared Year 8 configuration.
export const NUMBER_STRONGHOLD_DEMO = '/demo-review/volcano/number';
export const STRONGHOLD_SUMMIT_RETURN = '/demo-review/number-adventure/3d?summit=1';
/** A real student's way back from a stronghold to the volcano summit. */
export const STRONGHOLD_LIVE_SUMMIT = '/world/expedition?summit=1';
/**
 * Per-realm stronghold settings. Guardian names are drafts awaiting story approval; each guardian
 * serves the Fog of Forgetfulness, whose purple seal holds every Core.
 */
export const STRONGHOLD_REALMS: Record<ExpeditionRealm,{name:string;core:string;guardian:string;deed:string;colour:string;glyphs:string[]}> = {
  number:{name:'Number Nexus',core:'Number Core',guardian:'Confusion Creeper',deed:'tangles every calculation',colour:'#45e6c8',glyphs:['π','√2','−7','¾','2³','%','0.5','10⁻¹','√9','−½','4²','1.25']},
  measurement:{name:'Measurelands',core:'Measure Core',guardian:'the Warp Warden',deed:'bends every length and angle out of true',colour:'#ffc65c',glyphs:['cm','m²','45°','km','mL','m³','πr²','90°','mm','ha','180°','A=lw']},
  space:{name:'Starpath',core:'Star Core',guardian:'the Shape Shifter',deed:'twists every shape and turns maps around',colour:'#8c9dff',glyphs:['△','□','⬡','○','∠','⊥','∥','⬠','◇','60°','↻','⟷']},
  statistics:{name:'Statistica',core:'Data Core',guardian:'the Data Scrambler',deed:'jumbles every record and hides the truth in the numbers',colour:'#84e070',glyphs:['x̄','Σ','%','n=30','Q1','max','min','mode','range','f','median','IQR']},
  pattern:{name:'Pattern Peaks',core:'Pattern Core',guardian:'the Pattern Breaker',deed:'snaps every sequence and scrambles every rule',colour:'#4fc3ff',glyphs:['2n+1','×2','y=3x','+5','n²','…','x','4, 7, 10','a+b','−3','y','2x−1']},
  chance:{name:'Chance Hollow',core:'Chance Core',guardian:'the Chaos Jester',deed:'turns every outcome into a trick',colour:'#ff7d9a',glyphs:['½','1/6','P(A)','0.25','50%','0–1','¼','HT','1/52','3/8','0.7','P']},
};
export function strongholdDemoHref(realm:ExpeditionRealm){return `/demo-review/volcano/${realm}`;}
/** Heading for a realm's Level 8 post-test, which is the final battle against its guardian. */
export function strongholdBattleTitle(realm:ExpeditionRealm){const g=STRONGHOLD_REALMS[realm].guardian;return `Final Battle · Break ${g}’s seal`;}
export function strongholdStory(realm:ExpeditionRealm){
  const r=STRONGHOLD_REALMS[realm];
  return {
    opening:{title:'The Final Battle',text:'The path to the volcano is open. The Fog of Forgetfulness has hidden the six stolen Cores beyond its summit.'},
    entrance:{title:`${r.guardian[0].toUpperCase()}${r.guardian.slice(1)}’s stronghold`,text:`${r.guardian[0].toUpperCase()}${r.guardian.slice(1)} guards the ${r.core} and ${r.deed}. Follow the weekly portals and build the skills to break its seal.`},
    battle:{title:'The Final Battle',text:`${r.guardian[0].toUpperCase()}${r.guardian.slice(1)}’s seal is cracked but still holds the ${r.core}. Every question you answer strikes it. Score 85% or more on the post-test to shatter the seal and set the Core free.`},
    recovery:{title:'The Core shines again',text:`The seal breaks. The ${r.core} is free, pushing the Fog of Forgetfulness back from the summit.`},
  } as const;
}
export const STRONGHOLD_STORY = strongholdStory('number');
export type StrongholdStory = keyof typeof STRONGHOLD_STORY;
/**
 * Stronghold layout: an open volcanic hall. A raised causeway runs from the entrance plaza to the Core plaza
 * over a lava lake; each week's portal stands on its own island, joined to the causeway by a short bridge.
 * Islands alternate sides down the hall.
 */
export const STRONGHOLD_PORTAL_SPACING = 14;
/** Half-widths and radii of the walkable stone: causeway, bridges, islands, entrance and Core plazas. */
export const STRONGHOLD_CAUSEWAY = 3.6, STRONGHOLD_BRIDGE = 1.9, STRONGHOLD_ISLAND = 4.6, STRONGHOLD_ISLAND_X = 11, STRONGHOLD_CORE_PLAZA = 15;
/** How close to an island its Enter prompt appears: from the near half of the causeway, so students see it as they pass. */
export const STRONGHOLD_PORTAL_REACH = 10.5;
export function strongholdLayout(realm:ExpeditionRealm='number'){
  const weeks=LEVEL8_WEEK_COUNTS[realm];
  const portals=Array.from({length:weeks},(_,i)=>({week:i+1,position:[i%2===0?-STRONGHOLD_ISLAND_X:STRONGHOLD_ISLAND_X,0,-8-i*STRONGHOLD_PORTAL_SPACING] as SummitPoint}));
  const coreZ=portals[weeks-1].position[2]-30;
  return {weeks,portals,coreZ,coreId:weeks+1,backZ:coreZ-STRONGHOLD_CORE_PLAZA-2,startZ:18};
}
export const STRONGHOLD_PORTALS = strongholdLayout('number').portals;
/** Walkable height (0) on the causeway, plazas, bridges and islands; null over the lava. */
export function strongholdFloor(x:number,z:number,realm:ExpeditionRealm='number'):number|null {
  const layout=strongholdLayout(realm);
  if(z>=layout.startZ)return null;
  if(z>8&&Math.abs(x)<9)return 0;
  if(Math.hypot(x,z-layout.coreZ)<=STRONGHOLD_CORE_PLAZA)return 0;
  if(Math.abs(x)<=STRONGHOLD_CAUSEWAY&&z>layout.coreZ)return 0;
  for(const p of layout.portals){const [px,,pz]=p.position;
    if(Math.hypot(x-px,z-pz)<=STRONGHOLD_ISLAND)return 0;
    if(Math.abs(z-pz)<=STRONGHOLD_BRIDGE&&x*px>0&&Math.abs(x)<=Math.abs(px))return 0;}
  return null;
}
/** Spot on the causeway beside a week's bridge, facing down the hall (or in front of the Core), inside its Enter range. Used for fast travel and returning from a week. */
export function strongholdPortalSpot(realm:ExpeditionRealm,target:number):SummitPoint {
  const layout=strongholdLayout(realm),p=layout.portals.find(q=>q.week===target);
  return p?[Math.sign(p.position[0])*2.6,0,p.position[2]+4.5]:[0,0,layout.coreZ+13];
}
/** The nearest portal's week, the Core chamber's id (weeks + 1), or null. */
export function strongholdNearest(x:number,z:number,realm:ExpeditionRealm='number'):number|null {
  const layout=strongholdLayout(realm);
  if(Math.hypot(x,z-layout.coreZ-2)<12)return layout.coreId;
  return layout.portals.find(p=>Math.hypot(x-p.position[0],z-p.position[2])<STRONGHOLD_PORTAL_REACH)?.week??null;
}
/** Parapet runs along each side of the causeway, broken where a bridge leaves for an island. */
export function strongholdParapets(realm:ExpeditionRealm='number'){
  const layout=strongholdLayout(realm),end=layout.coreZ+Math.sqrt(STRONGHOLD_CORE_PLAZA**2-STRONGHOLD_CAUSEWAY**2),gap=STRONGHOLD_BRIDGE+.15;
  return ([-1,1] as const).flatMap(side=>{const cuts=layout.portals.filter(p=>Math.sign(p.position[0])===side).map(p=>p.position[2]);
    const runs:{side:-1|1;from:number;to:number}[]=[];let from=8;
    for(const z of cuts){runs.push({side,from,to:z+gap});from=z-gap;}
    runs.push({side,from,to:end});return runs;});
}
