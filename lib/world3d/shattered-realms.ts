import type { ExpeditionRealm } from './expedition-access';
import type { SummitPoint } from './number-summit';

export const CAVERN_WEEK_COUNT = 12;
export const CAVERN_REALMS: Record<ExpeditionRealm, {name:string;feature:string}> = {
  number: {name:'Number Nexus',feature:'Number-marked stones and ancient counting crystals'},
  measurement: {name:'Measurelands',feature:'Measuring markers and carved stone instruments'},
  space: {name:'Starpath',feature:'Constellations and geometric crystals'},
  statistics: {name:'Statistica',feature:'Grouped crystal records and research alcoves'},
  pattern: {name:'Pattern Peaks',feature:'Repeating arches and sequences of lights'},
  chance: {name:'Chance Hollow',feature:'Dice-shaped stones and branching water channels'},
};
export function cavernRealm(value:string): ExpeditionRealm | null {
  return Object.hasOwn(CAVERN_REALMS,value) ? value as ExpeditionRealm : null;
}
export function cavernWeek(value:unknown) {
  const week=Number(value);
  return Number.isInteger(week)&&week>=1&&week<=CAVERN_WEEK_COUNT?week:1;
}
export function cavernDoor(week:number):SummitPoint {return [week%2===1?-6:6,0,-8-(week-1)*16];}
export function cavernSpawn(week:number):SummitPoint {const door=cavernDoor(week);return [door[0]/3,0,door[2]+1];}
export function cavernFloor(x:number,z:number):number|null {return Math.abs(x)<=7&&z>=-204&&z<=16?0:null;}
export function cavernNearest(x:number,z:number):number|null {
  for(let week=1;week<=CAVERN_WEEK_COUNT;week++){const p=cavernDoor(week);if(Math.hypot(x-p[0],z-p[2])<5)return week;}
  return null;
}
export function cavernDarkness(z:number){return Math.max(0,Math.min(1,(-z-8)/176));}
export function cavernHref(realm:ExpeditionRealm,week=1){return `/demo-review/shattered-realms/${realm}?week=${cavernWeek(week)}`;}
export function cavernWeekHref(realm:ExpeditionRealm,week=1){return `/demo-review/shattered-realms/${realm}/week?realm_id=${realm}&year=Year%207&week=${cavernWeek(week)}&legacy=1&teacher_preview=1&expedition=1`;}
