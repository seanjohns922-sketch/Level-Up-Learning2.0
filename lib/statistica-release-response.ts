import type {StatsItem} from '@/data/assessments/revisions/level1StatisticaFiveForms';
import {emptyStatsResponse,statsResponseReady,scoreStatsResponse,type StatsResponse} from './statistica-level1-review';
export type StatisticaReleaseVisual={type:'statistica_released';level:number;item:StatsItem};
export function statisticaReleaseVisual(q:{visual?:unknown}):StatisticaReleaseVisual|null{const v=q.visual as StatisticaReleaseVisual|undefined;return v?.type==='statistica_released'&&Number.isInteger(v.level)&&v.level>=1&&v.level<=8&&!!v.item?v:null;}
const PREFIX='statistica-release-v3:';
export function encodeReleasedStatistica(id:string,response:unknown){return PREFIX+JSON.stringify({questionId:id,response});}
export function readReleasedStatistica(id:string,value:unknown):StatsResponse|null{if(typeof value!=='string'||!value.startsWith(PREFIX))return null;try{const v=JSON.parse(value.slice(PREFIX.length));return v.questionId===id&&v.response&&typeof v.response==='object'?v.response:null;}catch{return null;}}
export function readyReleasedStatistica(q:{id?:string;visual?:unknown},value:unknown):boolean{if(value==='idk'||value==='__unknown__')return true;const v=statisticaReleaseVisual(q),r=readReleasedStatistica(q.id??'',value);if(!v||!r)return false;try{return !!statsResponseReady(v.item,r);}catch{return false;}}
export function scoreReleasedStatistica(q:{id?:string;visual?:unknown},value:unknown):boolean{const v=statisticaReleaseVisual(q),r=readReleasedStatistica(q.id??'',value);if(!v||!r)return false;try{return !!scoreStatsResponse(v.item,r);}catch{return false;}}
export {emptyStatsResponse};
