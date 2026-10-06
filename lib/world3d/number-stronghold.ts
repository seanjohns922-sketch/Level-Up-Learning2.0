import type { SummitPoint } from './number-summit';

// Navigation samples only. Level 8 curriculum lengths are deliberately not set here.
export const NUMBER_STRONGHOLD_DEMO = '/demo-review/volcano/number';
export const STRONGHOLD_SUMMIT_RETURN = '/demo-review/number-adventure/3d?summit=1';
export const STRONGHOLD_PORTALS = [
  {week:1,position:[-9,0,-10] as SummitPoint},
  {week:2,position:[9,0,-30] as SummitPoint},
  {week:3,position:[-9,0,-50] as SummitPoint},
];
export const STRONGHOLD_STORY = {
  opening:{title:'The Final Battle',text:'The path to the volcano is open. The Fog of Forgetfulness has hidden the six stolen Cores beyond its summit.'},
  entrance:{title:'Confusion Creeper’s stronghold',text:'Confusion Creeper guards the Number Nexus Core. Follow the weekly portals and build the skills to break its seal.'},
  battle:{title:'The Core chamber',text:'You have reached the Number Nexus Core. Show what you have learned to clear the confusion and release it.'},
  recovery:{title:'The Core shines again',text:'The seal breaks. The Number Nexus Core is free, pushing the Fog of Forgetfulness back from the summit.'},
} as const;
export type StrongholdStory = keyof typeof STRONGHOLD_STORY;
export function strongholdFloor(x:number,z:number):number|null {
  return Math.abs(x)<14 && z>-82 && z<18 ? 0 : null;
}
export function strongholdNearest(x:number,z:number):number|null {
  if(Math.hypot(x,z+72)<7)return 4;
  return STRONGHOLD_PORTALS.find(p=>Math.hypot(x-p.position[0],z-p.position[2])<5)?.week??null;
}
