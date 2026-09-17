import type {Level2Item,Level2MapTask} from '@/data/assessments/revisions/level2StarpathFiveForms';
import {routeCells,type Cell,type Direction} from '@/data/assessments/revisions/level1StarpathFiveForms';
import {emptyGroundResponse,groundResponseReady,scoreGroundResponse,type GroundResponse} from './starpath-ground-redesign';
import {sameCell} from './starpath-level1-review';
export type Level2Response={shape:GroundResponse;edge:number|null;cell:Cell|null;moves:Direction[];choice:string|null};
export const emptyLevel2Response=(item:Level2Item):Level2Response=>({shape:emptyGroundResponse(item.kind==='shape'?item.task:{mode:'choice',prompt:''}),edge:null,cell:null,moves:[],choice:null});
export function level2RouteCorrect(t:Level2MapTask,moves:Direction[]){
 if(!t.start||!t.goal||!moves.length)return false;
 const path=routeCells(t.start,moves);
 if(path.some(p=>p.r<0||p.r>3||p.c<0||p.c>3||t.blocked.some(b=>sameCell(b,p))))return false;
 if(t.shown)return moves.length===t.shown.length&&moves.every((d,i)=>d===t.shown![i]);
 const arrival=path.findIndex(p=>sameCell(p,t.goal!));
 return arrival===path.length-1&&(!t.checkpoint||path.slice(0,arrival).some(p=>sameCell(p,t.checkpoint!)));
}
export function level2ResponseReady(item:Level2Item,a:Level2Response){
 if(item.kind==='shape')return groundResponseReady(item.task,a.shape);
 if(item.kind==='edge')return a.edge!==null;
 return item.task.mode==='locate'?a.cell!==null:item.task.mode==='choice'?a.choice!==null:a.moves.length>0;
}
export function scoreLevel2Response(item:Level2Item,a:Level2Response){
 if(item.kind==='shape')return scoreGroundResponse(item.task,a.shape);
 if(item.kind==='edge')return a.edge===item.task.correct;
 if(item.task.mode==='choice')return a.choice===item.task.correctId;
 if(item.task.mode==='locate')return !!a.cell&&!!item.task.target&&sameCell(a.cell,item.task.target);
 return level2RouteCorrect(item.task,a.moves);
}
export function level2Expected(item:Level2Item){
 if(item.kind==='edge')return `Side ${'ABCD'[item.task.correct]}.`;
 if(item.kind==='shape'){
  const t=item.task;return t.options?.filter(o=>t.correctIds?.includes(o.id)).map(o=>o.label??`Shape ${String.fromCharCode(65+t.options!.indexOf(o))}`).join(', ')+(t.reasons?` · ${t.reasons.find(r=>r.id===t.correctReason)?.label}`:'');
 }
 const t=item.task;
 if(t.mode==='choice')return t.options?.find(o=>o.id===t.correctId)?.label??'';
 if(t.mode==='locate')return `${t.landmarks.find(l=>sameCell(l.cell,t.target!))?.label??'Square'}: row ${t.target!.r+1}, column ${t.target!.c+1}, counted from the top left.`;
 return `${t.shown?'The pictured pathway':'Any valid route. One example'}: ${t.example!.join(', ')}.`;
}
