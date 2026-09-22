export const releaseSamples = new Map<string, unknown>();
import assert from 'node:assert/strict';
import {LEVEL4_STARPATH_FORMS as forms,LEVEL4_STARPATH_BLUEPRINT,symClosure,type SymTask,type SymCell} from '../data/assessments/revisions/level4StarpathFiveForms';
import {emptyLevel4Response,scoreLevel4Response,level4ResponseReady,symmetric} from '../lib/starpath-level4-review';
import {routeCells,type Direction} from '../data/assessments/revisions/level1StarpathFiveForms';
const ids=new Set<string>();const key=(p:{r:number;c:number})=>`${p.r},${p.c}`;
function independentSym(t:SymTask,tiles:SymCell[]){return tiles.every(p=>{const r=t.line==='horizontal'?4-p.r:t.line==='diagonal'?p.c:t.line==='vertical'?p.r:t.turn===90?p.c:4-p.r;const c=t.line==='horizontal'?p.c:t.line==='diagonal'?p.r:t.line==='vertical'?4-p.c:4-p.c+(t.turn===90?p.c-p.r:0);return tiles.some(q=>q.r===r&&q.c===c&&q.colour===p.colour);});}
for(const [form,items]of Object.entries(forms)){
 assert.equal(items.length,20);assert.deepEqual(items.map(q=>q.skillLabel),LEVEL4_STARPATH_BLUEPRINT);for(const [code,n]of [['AC9M4SP01',7],['AC9M4SP02',7],['AC9M4SP03',6]] as const)assert.equal(items.filter(q=>q.primaryDescriptorCode===code).length,n);
 // Keep the same rotational demand and construction workload in every matched form.
 const half=items[17],quarter=items[18],design=items[19];
 assert(half.kind==='symmetry'&&half.task.turn===180);
 assert(quarter.kind==='symmetry'&&quarter.task.turn===90);
 assert.equal(quarter.task.expected.length-quarter.task.seeds.length,6);
 assert(design.kind==='symmetry'&&design.task.line==='vertical'&&design.task.minCells===6);
 const recompose=items[2];assert(recompose.kind==='composite'&&!recompose.task.hiddenPart);assert(recompose.prompt.includes('two triangular pieces'));
 for(const [i,q]of items.entries()){
  assert(!ids.has(q.id));ids.add(q.id);assert.equal(q.form,form);assert(q.readAloudText.includes(q.prompt));const a=emptyLevel4Response(q);assert(!scoreLevel4Response(q,a),q.id);assert(!level4ResponseReady(q,a));
  if(q.kind==='composite'){
   const t=q.task;if(t.model){a.heights=t.model.heights;assert(!scoreLevel4Response(q,{...a,heights:a.heights.map((n,j)=>j===0?n+1:n)}));}
   else{a.selected=t.correctIds!;assert.equal(new Set(t.options!.map(o=>o.label)).size,t.options!.length);for(const o of t.options!)if(!t.correctIds!.includes(o.id))assert(!scoreLevel4Response(q,{...a,selected:[o.id]}));if(t.mode==='multi'){const used=new Set(t.figure!.parts.map(p=>p.shape==='prism'?'rectangular prism':p.shape));for(const o of t.options!)assert.equal(t.correctIds!.includes(o.id),used.has(o.label as never));assert(!scoreLevel4Response(q,{...a,selected:t.options!.map(o=>o.id)}));}if(i===1)assert.equal(Number(t.options!.find(o=>o.id===t.correctIds![0])!.label),t.figure!.parts.filter(p=>p.shape==='triangle').length);if(t.hiddenPart){const p=t.figure!.parts.find(p=>p.id===t.hiddenPart)!;assert.equal(t.options!.find(o=>o.id===t.correctIds![0])!.label,p.shape);}}
  }else if(q.kind==='grid'){
   const t=q.task;const ref=(c:{r:number;c:number})=>'ABCD'[c.c]+String(4-c.r);
   if(t.mode==='reference'){a.reference=ref(t.target!);assert(scoreLevel4Response(q,{...a,reference:' '+a.reference.toLowerCase()+' '}));assert(!scoreLevel4Response(q,{...a,reference:a.reference.split('').reverse().join('')}));if(t.given)assert.equal(key(t.target!),key(routeCells(t.start!,t.given).at(-1)!));}
   if(t.mode==='locate'){a.cell=t.target!;assert(t.prompt.includes(ref(t.target!)));}
   if(t.mode==='place'){a.placements=t.placements!;assert.equal(new Set(Object.values(a.placements).map(key)).size,t.landmarks.length);assert(!scoreLevel4Response(q,{...a,placements:{}}));for(const l of t.landmarks)assert(t.instruction.includes(`${l.label}: ${ref(t.placements![l.id])}`));}
   if(t.mode==='labels'){a.labels=Object.fromEntries(['A','B','C','D'].map((v,i)=>[`c${i}`,v]).concat(['4','3','2','1'].map((v,i)=>[`r${i}`,v])));assert(!scoreLevel4Response(q,{...a,labels:{...a.labels,r0:'1'}}));}
   if(t.mode==='choice'){a.selected=[t.correctId!];for(const o of t.options!){const cells=o.label.split(' → ').map(s=>({c:'ABCD'.indexOf(s[0]),r:4-Number(s[1])}));const valid=key(cells[0])===key(t.start!)&&key(cells.at(-1)!)===key(t.goal!)&&cells.slice(1).every((c,j)=>Math.abs(c.r-cells[j].r)+Math.abs(c.c-cells[j].c)===1);assert.equal(valid,o.id===t.correctId);}}
   if(t.mode==='route'){a.moves=t.example!;let valid=0;const queue:Direction[][]=[[]];while(queue.length){const moves=queue.pop()!,path=routeCells(t.start!,moves);if(path.some(p=>p.r<0||p.r>3||p.c<0||p.c>3))continue;if(key(path.at(-1)!)===key(t.goal!)){const wanted=!path.some(p=>t.blocked.some(b=>key(p)===key(b)))&&path.slice(0,-1).some(p=>key(p)===key(t.checkpoint!));assert.equal(scoreLevel4Response(q,{...a,moves}),wanted);if(wanted)valid++;continue;}if(moves.length<8)for(const d of ['up','right','down','left'] as Direction[])queue.push([...moves,d]);}assert(valid>1);assert(!scoreLevel4Response(q,{...a,moves:['up','up','up','up']}));}
  }else{
   const t=q.task;assert(independentSym(t,t.expected));assert(symmetric(t,t.expected));
   if(t.mode==='choice'){a.selected=[t.correctId!];assert.equal(t.correctId==='o0',independentSym(t,t.seeds));assert.equal(t.options!.length,4);for(const o of t.options!)if(o.id!==t.correctId)assert(!scoreLevel4Response(q,{...a,selected:[o.id]}));}
   else{a.tiles=t.expected;assert(!scoreLevel4Response(q,{...a,tiles:a.tiles.slice(0,-1)}));assert(!scoreLevel4Response(q,{...a,tiles:[...a.tiles,a.tiles[0]]}));const palette=[...new Set(t.expected.map(p=>p.colour))];assert(!scoreLevel4Response(q,{...a,tiles:a.tiles.map((p,i)=>i? p:{...p,colour:palette.find(c=>c!==p.colour)!})}));if(t.mode==='create'){const alternative=symClosure(t,[{r:0,c:1,colour:palette[0]},{r:1,c:1,colour:palette[1]},{r:2,c:0,colour:palette[0]}]);assert(scoreLevel4Response(q,{...a,tiles:alternative}));assert(!scoreLevel4Response(q,{...a,tiles:t.expected.map(p=>({...p,colour:palette[0]}))}));}}
  }
  assert(level4ResponseReady(q,a),q.id);assert(scoreLevel4Response(q,a),q.id);releaseSamples.set(q.id,structuredClone(a));
 }
}
assert.equal(ids.size,100);for(let i=0;i<20;i++)assert(new Set(Object.values(forms).map(q=>JSON.stringify(q[i].task))).size>=3,`Question ${i+1} needs form variation`);
console.log('PASS: 100 Level 4 items; three-descriptor coverage; composite parts and cube models; reversed grid rows; alternative routes; independent reflection/rotation checks and creative alternatives.');
