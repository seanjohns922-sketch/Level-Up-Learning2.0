import type { SummitPoint } from './number-summit';
import type { ExpeditionRealm } from './expedition-access';

// Navigation samples only. Level 8 curriculum lengths are deliberately not set here.
export const NUMBER_STRONGHOLD_DEMO = '/demo-review/volcano/number';
export const STRONGHOLD_SUMMIT_RETURN = '/demo-review/number-adventure/3d?summit=1';
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
export function strongholdStory(realm:ExpeditionRealm){
  const r=STRONGHOLD_REALMS[realm];
  return {
    opening:{title:'The Final Battle',text:'The path to the volcano is open. The Fog of Forgetfulness has hidden the six stolen Cores beyond its summit.'},
    entrance:{title:`${r.guardian[0].toUpperCase()}${r.guardian.slice(1)}’s stronghold`,text:`${r.guardian[0].toUpperCase()}${r.guardian.slice(1)} guards the ${r.core} and ${r.deed}. Follow the weekly portals and build the skills to break its seal.`},
    battle:{title:'The Core chamber',text:`You have reached the ${r.core}. Show what you have learned to break the seal and release it.`},
    recovery:{title:'The Core shines again',text:`The seal breaks. The ${r.core} is free, pushing the Fog of Forgetfulness back from the summit.`},
  } as const;
}
export const STRONGHOLD_STORY = strongholdStory('number');
export type StrongholdStory = keyof typeof STRONGHOLD_STORY;
/**
 * Level 8 week counts. These follow Level 7 except Probability, which gains two weeks for Year 8
 * content (two-way tables, Venn diagrams, complementary events). Confirm against the Level 8 curriculum map.
 */
export const LEVEL8_WEEK_COUNTS: Record<ExpeditionRealm,number> = {number:12,measurement:12,space:10,pattern:12,statistics:10,chance:10};
/** Stronghold layout: portals alternate sides down the hall and the Core chamber follows the final week. */
export const STRONGHOLD_PORTAL_SPACING = 14;
export function strongholdLayout(realm:ExpeditionRealm='number'){
  const weeks=LEVEL8_WEEK_COUNTS[realm];
  const portals=Array.from({length:weeks},(_,i)=>({week:i+1,position:[i%2===0?-9:9,0,-8-i*STRONGHOLD_PORTAL_SPACING] as SummitPoint}));
  const coreZ=portals[weeks-1].position[2]-24;
  return {weeks,portals,coreZ,coreId:weeks+1,backZ:coreZ-12,startZ:18};
}
export const STRONGHOLD_PORTALS = strongholdLayout('number').portals;
export function strongholdFloor(x:number,z:number,realm:ExpeditionRealm='number'):number|null {
  const layout=strongholdLayout(realm);
  return Math.abs(x)<12.3 && z>layout.backZ+4 && z<layout.startZ ? 0 : null;
}
/** The nearest portal's week, the Core chamber's id (weeks + 1), or null. */
export function strongholdNearest(x:number,z:number,realm:ExpeditionRealm='number'):number|null {
  const layout=strongholdLayout(realm);
  if(Math.hypot(x,z-layout.coreZ-2)<12)return layout.coreId;
  return layout.portals.find(p=>Math.hypot(x-p.position[0],z-p.position[2])<5)?.week??null;
}
