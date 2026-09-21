import assert from 'node:assert/strict';
import {LEVEL6_STARPATH_FORMS as forms,LEVEL6_STARPATH_BLUEPRINT,key,type Level6Item,type Operation} from '../data/assessments/revisions/level6StarpathFiveForms';
import {emptyLevel6Response,scoreLevel6Response,level6ResponseReady,type Level6Response} from '../lib/starpath-level6-review';
import type {Point} from '../data/activities/starpath/level5/coordinates';
const operations:Operation[]=['right','up','reflect','turn'];
// Independent homogeneous matrix calculation, distinct from the production helper.
function apply(p:Point,op:Operation):Point{const m=op==='right'?[1,0,2,0,1,0]:op==='up'?[1,0,0,0,1,2]:op==='reflect'?[-1,0,0,0,1,0]:[0,1,0,-1,0,0];return{x:m[0]*p.x+m[1]*p.y+m[2],y:m[3]*p.x+m[4]*p.y+m[5]};}
const equal=(a:Point[],b:Point[])=>a.map(key).sort().join(';')===b.map(key).sort().join(';');
export function sampleAnswer(q:Level6Item):Level6Response{const a=emptyLevel6Response(q),t=q.task;if(t.mode==='choice'||t.mode==='multi')a.selected=t.correctIds!;if(t.mode==='pair')a.pair={x:String(t.answer!.x),y:String(t.answer!.y)};if(t.mode==='point')a.points=[t.answer!];if(t.mode==='shape')a.points=t.expected!;if(t.mode==='tiles')a.orientations=t.expectedOrientations!;if(t.mode==='sequence'){for(const first of operations)for(const second of operations)if(equal(t.shape!.map(p=>apply(apply(p,first),second)),t.expected!)){a.commands=[first,second];return a;}throw Error(`Unsolvable ${q.id}`);}return a;}
const ids=new Set<string>();
for(const [form,items]of Object.entries(forms)){
 assert.equal(items.length,20);assert.deepEqual(items.map(q=>q.skillLabel),LEVEL6_STARPATH_BLUEPRINT);assert.deepEqual(['AC9M6SP01','AC9M6SP02','AC9M6SP03'].map(code=>items.filter(q=>q.primaryDescriptorCode===code).length),[6,6,8]);assert.equal(items.filter(q=>q.task.diagram==='cartesian').length,8);
 for(const [i,q]of items.entries()){
  assert(!ids.has(q.id));ids.add(q.id);assert.equal(q.form,form);assert(q.readAloudText.includes(q.task.instruction));const blank=emptyLevel6Response(q),a=sampleAnswer(q),t=q.task;assert(!level6ResponseReady(q,blank),q.id);assert(!scoreLevel6Response(q,blank),q.id);assert(level6ResponseReady(q,a));assert(scoreLevel6Response(q,a),q.id);
  if(t.options){assert.equal(t.options!.length,4,`${q.id}: four answer options`);assert.equal(new Set(t.options!.map(o=>o.id)).size,4);assert.equal(new Set(t.options.map(o=>o.label)).size,t.options.length);for(const id of t.correctIds!)assert(t.options.some(o=>o.id===id));for(const o of t.options)if(!t.correctIds!.includes(o.id))assert(!scoreLevel6Response(q,{...a,selected:[o.id]}));if(t.mode==='multi'){assert(!scoreLevel6Response(q,{...a,selected:[a.selected[0],a.selected[0]]}));assert(!scoreLevel6Response(q,{...a,selected:t.options.map(o=>o.id)}));}}
  for(const p of [...(t.shape??[]),...(t.image??[]),...(t.expected??[]),...(t.points??[]).map(v=>v.point),...(t.answer?[t.answer]:[])])assert(Math.abs(p.x)<=4&&Math.abs(p.y)<=4,q.id+' on-grid');
  if(t.mode==='pair'){assert(!scoreLevel6Response(q,{...a,pair:{x:'',y:a.pair.y}}));assert(!scoreLevel6Response(q,{...a,pair:{x:String(t.answer!.x+1),y:a.pair.y}}));}
  if(t.mode==='point')assert(!scoreLevel6Response(q,{...a,points:[t.answer!,t.answer!]}));
  if(t.mode==='shape'){assert(equal(t.operations!.reduce((ps,op)=>ps.map(p=>apply(p,op)),t.shape!),t.expected!));assert(scoreLevel6Response(q,{...a,points:[...a.points].reverse()}));assert(!scoreLevel6Response(q,{...a,points:a.points.slice(1)}));assert(!scoreLevel6Response(q,{...a,points:[a.points[0],a.points[0],a.points[1]]}));}
  if(t.mode==='tiles'){for(let cell=0;cell<6;cell++)for(let r=0;r<4;r++)assert.equal(scoreLevel6Response(q,{...a,orientations:a.orientations.map((n,j)=>j===cell?r:n)}),r===(t.orientations![cell]+2)%4);}
  if(t.mode==='sequence'){for(const first of operations)for(const second of operations)assert.equal(scoreLevel6Response(q,{...a,commands:[first,second]}),equal(t.shape!.map(p=>apply(apply(p,first),second)),t.expected!));assert(!scoreLevel6Response(q,{...a,commands:a.commands.slice(1)}));}
  if(i===3)assert(t.correctIds!.every(id=>['triPrism','rectPrism','hexPrism'].includes(id)));
 }
}
assert.equal(ids.size,100);
// Exercise all quadrants plus axes across the matched forms.
const locations=Object.values(forms).flatMap(items=>items.slice(6,12).flatMap(q=>[...(q.task.points??[]).map(p=>p.point),...(q.task.answer?[q.task.answer]:[])]));
for(const [x,y]of [[1,1],[-1,1],[-1,-1],[1,-1]])assert(locations.some(p=>Math.sign(p.x)===x&&Math.sign(p.y)===y));assert(locations.some(p=>p.x===0));assert(locations.some(p=>p.y===0));
for(let i=0;i<20;i++)assert(new Set(Object.values(forms).map(items=>JSON.stringify(items[i].task))).size>=3,`Variation Q${i+1}`);
// A full turn pairs the six angles of an equilateral triangle, four right angles,
// or three regular-hexagon angles. Regular pentagon corners cannot fit alone.
assert.equal(6*60,360);assert.equal(4*90,360);assert.equal(3*120,360);assert.notEqual(360%108,0);
console.log('PASS: 100 Level 6 questions, 6/6/8 descriptor coverage, only eight coordinate diagrams, all quadrants/axes, independent transformation matrices, exhaustive two-command scoring, tessellation rotations, malformed/blank responses and matched-form variation.');
