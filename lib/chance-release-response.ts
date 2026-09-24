import type {CHItem} from '@/data/assessments/revisions/level3ChanceHollowFiveForms';
import {chReady,chScore,type CHResponse} from '@/data/assessments/revisions/level3ChanceHollowFiveForms';
export type ChanceReleaseVisual={type:'chance_released';level:number;item:CHItem};
export function chanceReleaseVisual(q:{visual?:unknown}):ChanceReleaseVisual|null{const v=q.visual as ChanceReleaseVisual|undefined;return v?.type==='chance_released'&&Number.isInteger(v.level)&&v.level>=3&&v.level<=8&&!!v.item?v:null;}
const PREFIX='chance-release-v1:';
export function encodeReleasedChance(id:string,response:unknown){return PREFIX+JSON.stringify({questionId:id,response});}
export function readReleasedChance(id:string,value:unknown):CHResponse|null{if(typeof value!=='string'||!value.startsWith(PREFIX))return null;try{const v=JSON.parse(value.slice(PREFIX.length));return v.questionId===id&&v.response&&typeof v.response==='object'?v.response:null;}catch{return null;}}
export function readyReleasedChance(q:{id?:string;visual?:unknown},value:unknown):boolean{if(value==='idk'||value==='__unknown__')return true;const v=chanceReleaseVisual(q),r=readReleasedChance(q.id??'',value);if(!v||!r)return false;try{return !!chReady(v.item,r);}catch{return false;}}
export function scoreReleasedChance(q:{id?:string;visual?:unknown},value:unknown):boolean{const v=chanceReleaseVisual(q),r=readReleasedChance(q.id??'',value);if(!v||!r)return false;try{return !!chScore(v.item,r);}catch{return false;}}
