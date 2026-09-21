import {foldNet,normalise,type Cell} from '@/data/activities/starpath/level5/nets';
import type {Point,MoveDir} from '@/data/activities/starpath/level5/coordinates';
import {cellKey,pointKey,pointLabel,type Level5Item} from '@/data/assessments/revisions/level5StarpathFiveForms';
export type Level5Response={selected:string;cells:Cell[];points:Point[];pair:{x:string;y:string};labels:Record<string,string>;moves:MoveDir[]};
export const emptyLevel5Response=(q:Level5Item):Level5Response=>({selected:'',cells:q.kind==='net'?[...(q.task.seeds??[])]:[],points:[],pair:{x:'',y:''},labels:{},moves:[]});
export function netSignature(cells:Cell[]){if(!cells.length)return '';const versions:string[]=[];for(const flip of [1,-1]){let current=cells.map(p=>({r:p.r,c:p.c*flip}));for(let i=0;i<4;i++){versions.push(normalise(current).map(cellKey).sort().join(';'));current=current.map(p=>({r:p.c,c:-p.r}));}}return versions.sort()[0];}
export function follow(start:Point,moves:MoveDir[]){const path=[start];for(const d of moves){const p=path.at(-1)!;path.push({x:p.x+(d==='right'?1:d==='left'?-1:0),y:p.y+(d==='up'?1:d==='down'?-1:0)});}return path;}
const inside=(p:Point)=>Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=0&&p.x<=8&&p.y>=0&&p.y<=8;
export function level5ResponseReady(q:Level5Item,a:Level5Response){const t=q.task;if(t.mode==='choice')return !!a.selected;if(q.kind==='net')return a.cells.length>(q.task.seeds?.length??0);switch(q.task.mode){case 'pair':return !!a.pair.x.trim()&&!!a.pair.y.trim();case 'point':case 'shape':return a.points.length>0;case 'axes':return q.task.axisValues!.every(v=>['x','y'].every(axis=>!!a.labels[axis+v]?.trim()));case 'route':return a.moves.length>0;default:return false;}}
export function scoreLevel5Response(q:Level5Item,a:Level5Response){
 const t=q.task;if(t.mode==='choice')return a.selected===t.correctId;
 if(q.kind==='net')return a.cells.length===6&&new Set(a.cells.map(cellKey)).size===6&&a.cells.every(p=>Number.isInteger(p.r)&&Number.isInteger(p.c)&&p.r>=0&&p.r<5&&p.c>=0&&p.c<5)&&(q.task.seeds??[]).every(p=>a.cells.some(c=>cellKey(c)===cellKey(p)))&&foldNet(a.cells).valid&&(t.mode!=='build'||netSignature(a.cells)!==netSignature(q.task.cells!));
 const p=q.task;
 if(p.mode==='pair')return /^\d+$/.test(a.pair.x.trim())&&/^\d+$/.test(a.pair.y.trim())&&Number(a.pair.x)===p.answer!.x&&Number(a.pair.y)===p.answer!.y;
 if(p.mode==='point')return a.points.length===1&&pointKey(a.points[0])===pointKey(p.answer!);
 if(p.mode==='axes')return p.axisValues!.every(v=>['x','y'].every(axis=>/^\d+$/.test(a.labels[axis+v]?.trim()??'')&&Number(a.labels[axis+v])===v));
 if(p.mode==='shape')return a.points.length===p.expected!.length&&new Set(a.points.map(pointKey)).size===a.points.length&&p.expected!.every(v=>a.points.some(w=>pointKey(w)===pointKey(v)));
 const path=follow(p.start!,a.moves),firstGoal=path.findIndex(v=>pointKey(v)===pointKey(p.goal!));return a.moves.length===p.maxMoves&&path.every(v=>inside(v)&&!p.blocked!.some(b=>pointKey(b)===pointKey(v)))&&firstGoal===path.length-1&&path.slice(0,-1).some(v=>pointKey(v)===pointKey(p.via!));
}
export function level5Expected(q:Level5Item){const t=q.task;if(t.mode==='choice')return t.options!.find(o=>o.id===t.correctId)!.label;if(q.kind==='net')return t.mode==='build'?'Any six-square cube net including the marked square and different from the example, allowing for turning and flipping.':'Any valid cube net retaining all five given squares.';const p=q.task;return p.mode==='axes'?'Both axes increase from 0 to 8 in steps of one.':p.mode==='route'?`A valid shortest route. Example: ${p.example!.join(', ')}.`:p.mode==='shape'?p.expected!.map(pointLabel).join(', '):pointLabel(p.answer!);}
