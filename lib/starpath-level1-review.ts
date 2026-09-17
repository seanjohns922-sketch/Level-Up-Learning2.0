import { routeCells, type Cell, type Direction, type Level1Item, type RouteTask } from '@/data/assessments/revisions/level1StarpathFiveForms';
import { emptyGroundResponse, groundResponseReady, scoreGroundResponse, type GroundResponse } from './starpath-ground-redesign';
export type Level1Response={shape:GroundResponse;moves:Direction[];cell:Cell|null;choice:string|null};
export const sameCell=(a:Cell,b:Cell)=>a.r===b.r&&a.c===b.c;
export const emptyLevel1Response=(item:Level1Item):Level1Response=>({shape:emptyGroundResponse(item.kind==='shape'?item.task:{mode:'choice',prompt:''}),moves:[],cell:null,choice:null});
export function routeIsCorrect(task:RouteTask,moves:Direction[]){
 const path=routeCells(task.start,moves);
 if(!moves.length||path.some(p=>p.r<0||p.r>3||p.c<0||p.c>3||task.blocked.some(b=>sameCell(b,p))))return false;
 if(task.mode==='record')return moves.length===task.shown?.length&&moves.every((d,i)=>d===task.shown![i]);
 if(!task.goal||!sameCell(path[path.length-1],task.goal))return false;
 // Reaching the goal ends the journey. A checkpoint must be visited beforehand.
 const arrival=path.findIndex(p=>sameCell(p,task.goal!));
 return arrival===path.length-1&&(!task.checkpoint||path.slice(0,arrival).some(p=>sameCell(p,task.checkpoint!)));
}
export function level1ResponseReady(item:Level1Item,a:Level1Response){
 if(item.kind==='shape')return groundResponseReady(item.task,a.shape);
 return item.task.mode==='destination'?a.cell!==null:item.task.mode==='choice'?a.choice!==null:a.moves.length>0;
}
export function scoreLevel1Response(item:Level1Item,a:Level1Response){
 if(item.kind==='shape')return scoreGroundResponse(item.task,a.shape);
 const t=item.task;
 if(t.mode==='choice')return a.choice===t.correctId;
 if(t.mode==='destination'){const path=routeCells(t.start,t.given??[]);return !!a.cell&&sameCell(a.cell,path[path.length-1]);}
 return routeIsCorrect(t,a.moves);
}
export function level1Expected(item:Level1Item){
 if(item.kind==='route'){
  const t=item.task;
  if(t.mode==='choice')return t.options?.find(o=>o.id===t.correctId)?.label??'';
  if(t.mode==='destination'){const p=routeCells(t.start,t.given??[]).at(-1)!;return `Row ${p.r+1}, column ${p.c+1} (counting from the top left).`;}
  return `${t.mode==='build'?'Any valid route meeting all conditions. Example: ':'The pictured route: '}${t.example.join(', ')}.`;
 }
 const t=item.task;
 if(t.mode==='draw')return `Any valid ${t.drawShape}; rotated alternatives are accepted.`;
 return t.options?.filter(o=>t.correctIds?.includes(o.id)).map(o=>o.label??`Shape ${String.fromCharCode(65+t.options!.indexOf(o))}`).join(', ')+(t.reasons?` · ${t.reasons.find(r=>r.id===t.correctReason)?.label}`:'');
}
