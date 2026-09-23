import type {PPItem} from '@/data/assessments/revisions/level3PatternPeaksFiveForms';
import {ppReady,ppScore,type PPResponse} from '@/data/assessments/revisions/level3PatternPeaksFiveForms';
export type PatternReleaseVisual={type:'pattern_released';level:number;item:PPItem};
export function patternReleaseVisual(q:{visual?:unknown}):PatternReleaseVisual|null{const v=q.visual as PatternReleaseVisual|undefined;return v?.type==='pattern_released'&&Number.isInteger(v.level)&&v.level>=3&&v.level<=8&&!!v.item?v:null;}
const PREFIX='pattern-release-v1:';
export function encodeReleasedPattern(id:string,response:unknown){return PREFIX+JSON.stringify({questionId:id,response});}
export function readReleasedPattern(id:string,value:unknown):PPResponse|null{if(typeof value!=='string'||!value.startsWith(PREFIX))return null;try{const v=JSON.parse(value.slice(PREFIX.length));return v.questionId===id&&v.response&&typeof v.response==='object'?v.response:null;}catch{return null;}}
export function readyReleasedPattern(q:{id?:string;visual?:unknown},value:unknown):boolean{if(value==='idk'||value==='__unknown__')return true;const v=patternReleaseVisual(q),r=readReleasedPattern(q.id??'',value);if(!v||!r)return false;try{return !!ppReady(v.item,r);}catch{return false;}}
export function scoreReleasedPattern(q:{id?:string;visual?:unknown},value:unknown):boolean{const v=patternReleaseVisual(q),r=readReleasedPattern(q.id??'',value);if(!v||!r)return false;try{return !!ppScore(v.item,r);}catch{return false;}}
