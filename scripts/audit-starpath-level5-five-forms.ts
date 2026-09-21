import assert from 'node:assert/strict';
import {LEVEL5_STARPATH_FORMS as forms,LEVEL5_STARPATH_BLUEPRINT,cellKey,pointKey,type Level5Item} from '../data/assessments/revisions/level5StarpathFiveForms';
import {emptyLevel5Response,scoreLevel5Response,level5ResponseReady,netSignature,follow,type Level5Response} from '../lib/starpath-level5-review';
import {HEXOMINOES,normalise,foldNet,type Cell} from '../data/activities/starpath/level5/nets';
// Independent 3D face-frame folding: unique outward normals and consistent frames.
type V=[number,number,number];const neg=(v:V)=>v.map(n=>-n) as V;
function normals(cells:Cell[]){const frames=new Map<string,{n:V;u:V;v:V}>();if(!cells.length)return frames;frames.set(cellKey(cells[0]),{n:[0,0,1],u:[1,0,0],v:[0,1,0]});const queue=[cells[0]];let conflict=false;while(queue.length){const c=queue.shift()!,a=frames.get(cellKey(c))!;for(const [dr,dc]of [[0,1],[0,-1],[1,0],[-1,0]]){const p={r:c.r+dr,c:c.c+dc};if(!cells.some(c=>cellKey(c)===cellKey(p)))continue;const b=dc===1?{n:a.u,u:neg(a.n),v:a.v}:dc===-1?{n:neg(a.u),u:a.n,v:a.v}:dr===1?{n:a.v,u:a.u,v:neg(a.n)}:{n:neg(a.v),u:a.u,v:a.n};const old=frames.get(cellKey(p));if(old){if(JSON.stringify(old)!==JSON.stringify(b))conflict=true;}else{frames.set(cellKey(p),b);queue.push(p);}}}if(conflict)frames.clear();return frames;}
function independentNet(cells:Cell[]){const f=normals(cells);return cells.length===6&&new Set(cells.map(cellKey)).size===6&&f.size===6&&new Set([...f.values()].map(f=>f.n.join(','))).size===6;}
export function sampleAnswer(q:Level5Item):Level5Response{
 const a=emptyLevel5Response(q),t=q.task;if(t.mode==='choice'){a.selected=t.correctId!;return a;}
 if(q.kind==='net'){
  if(t.mode==='complete'){a.cells=q.task.example!;a.folded=true;return a;}
  for(const cells of Object.values(HEXOMINOES)){for(let flip=0;flip<2;flip++){let variant=cells.map(p=>({r:p.r,c:p.c*(flip?-1:1)}));for(let rotation=0;rotation<4;rotation++){variant=normalise(variant.map(p=>({r:p.c,c:-p.r})));for(let r=0;r<5;r++)for(let c=0;c<5;c++){const candidate=variant.map(p=>({r:p.r+r,c:p.c+c}));if(scoreLevel5Response(q,{...a,cells:candidate}))return {...a,cells:candidate};}}}}throw Error(`No alternative net for ${q.id}`);
 }
 const p=q.task;if(p.mode==='pair')a.pair={x:String(p.answer!.x),y:String(p.answer!.y)};if(p.mode==='point')a.points=[p.answer!];if(p.mode==='shape')a.points=p.expected!;if(p.mode==='axes')a.labels=Object.fromEntries(p.axisValues!.flatMap(n=>[['x'+n,String(n)],['y'+n,String(n)]]));if(p.mode==='route')a.moves=p.example!;return a;
}
const ids=new Set<string>();
for(const [form,items]of Object.entries(forms)){
 assert.equal(items.length,20);assert.equal(items.filter(q=>q.kind==='plot'&&q.task.plainDiagram).length,3);assert.deepEqual(items.map(q=>q.skillLabel),LEVEL5_STARPATH_BLUEPRINT);
 assert.deepEqual(['AC9M5SP01','AC9M5SP02','AC9M5SP03'].map(code=>items.filter(q=>q.primaryDescriptorCode===code).length),[7,6,7]);
 for(const [i,q]of items.entries()){
  assert(!ids.has(q.id));ids.add(q.id);assert.equal(q.form,form);assert(q.readAloudText.includes(q.prompt));const blank=emptyLevel5Response(q);assert(!scoreLevel5Response(q,blank));assert(!level5ResponseReady(q,blank));const a=sampleAnswer(q);assert(level5ResponseReady(q,a),q.id);assert(scoreLevel5Response(q,a),q.id);
  const t=q.task;if(t.mode==='choice'){assert.equal(new Set(t.options!.map(o=>o.label)).size,t.options!.length);for(const o of t.options!)if(o.id!==t.correctId)assert(!scoreLevel5Response(q,{...a,selected:o.id}));}
  if(q.kind==='net'){
   const n=q.task;if(n.options?.some(o=>o.cells))for(const o of n.options)assert.equal(independentNet(o.cells!),o.id===n.correctId);
   if(i===2){const frames=normals(n.cells!),marked=n.cells![n.marked!],target=n.cells![Number(n.correctId!.slice(1))];assert.deepEqual(frames.get(cellKey(marked))!.n,neg(frames.get(cellKey(target))!.n));}
   if(i===3)assert(!independentNet(n.cells!));
   if(n.foldRequired)assert(!scoreLevel5Response(q,{...a,folded:false}));
   if(n.mode==='complete')for(let r=0;r<5;r++)for(let c=0;c<5;c++){const candidate=[...n.seeds!,{r,c}];assert.equal(scoreLevel5Response(q,{...a,cells:candidate}),independentNet(candidate));}

   if(n.mode!=='choice'){assert(independentNet(a.cells));assert(!scoreLevel5Response(q,{...a,cells:a.cells.slice(0,-1)}));assert(!scoreLevel5Response(q,{...a,cells:[...a.cells.slice(0,-1),a.cells[0]]}));if(n.mode==='build')assert.notEqual(netSignature(a.cells),netSignature(n.cells!));}
  }else{
   const p=q.task;for(const pt of [...(p.shape??[]),...(p.image??[]),...(p.expected??[]),...(p.answer?[p.answer]:[])])assert(pt.x>=0&&pt.x<=8&&pt.y>=0&&pt.y<=8,q.id);
   if(p.mode==='pair')assert(!scoreLevel5Response(q,{...a,pair:{x:'',y:''}}));
   if(p.mode==='axes'){assert.equal(p.axisValues!.length,5);assert(!scoreLevel5Response(q,{...a,labels:{...a.labels,x0:'1'}}));}
   if(p.mode==='route'){assert(scoreLevel5Response(q,{...a,moves:['up','up','right','right',...a.moves.slice(4)]}));const path=follow(p.start!,a.moves);assert(path.some(v=>pointKey(v)===pointKey(p.via!)));assert.equal(pointKey(path.at(-1)!),pointKey(p.goal!));assert(!scoreLevel5Response(q,{...a,moves:[...a.moves,'up','down']}));}
   if(i===18){const set=new Set(p.shape!.map(pointKey)),line=p.shape!.every(v=>set.has(`${8-v.x},${v.y}`)),half=p.shape!.every(v=>set.has(`${8-v.x},${8-v.y}`));assert.equal(p.correctId,line?(half?'o0':'o1'):(half?'o2':'o3'));}
   if(p.mode==='shape'){
    const expected=p.shape!.map(v=>p.operation==='translate'?{x:v.x+p.dx!,y:v.y+p.dy!}:p.operation==='rotate'?{x:p.centre!.x+(v.y-p.centre!.y),y:p.centre!.y-(v.x-p.centre!.x)}:p.operation==='combine'?{x:2*p.mirror!.at-v.x,y:v.y+1}:p.mirror!.axis==='vertical'?{x:2*p.mirror!.at-v.x,y:v.y}:{x:v.x,y:2*p.mirror!.at-v.y});
    assert.deepEqual(expected,p.expected);assert(scoreLevel5Response(q,{...a,points:[...a.points].reverse()}));assert(!scoreLevel5Response(q,{...a,points:[...a.points.slice(0,-1),a.points[0]]}));assert(!scoreLevel5Response(q,{...a,points:p.shape!}));
   }
  }
 }
}
// Exhaust all fixed six-square connected arrangements, rather than only the lesson pool.
let arrangements:Cell[][]=[[{r:0,c:0}]];
for(let size=2;size<=6;size++){const next=new Map<string,Cell[]>();for(const cells of arrangements)for(const c of cells)for(const [dr,dc] of [[0,1],[0,-1],[1,0],[-1,0]]){const extra={r:c.r+dr,c:c.c+dc};if(cells.some(p=>cellKey(p)===cellKey(extra)))continue;const grown=normalise([...cells,extra]);next.set(grown.map(cellKey).sort().join(';'),grown);}arrangements=[...next.values()];}
assert.equal(arrangements.length,216);const working=new Set<string>();
for(const cells of arrangements){assert.equal(foldNet(cells).valid,independentNet(cells));if(independentNet(cells))working.add(netSignature(cells));}
assert.equal(working.size,11,'There are eleven distinct cube nets up to rotation/reflection');
assert.equal(ids.size,100);
for(let i=0;i<20;i++)assert(new Set(Object.values(forms).map(items=>JSON.stringify(items[i].task))).size>=3,`Form variation Q${i+1}`);
console.log('PASS: 100 Level 5 questions; 7/6/7 curriculum coverage; independent net folding and opposite faces; alternative net construction; coordinates, axes and routes; independently calculated whole-shape transformations; distractors and empty/duplicate responses.');
