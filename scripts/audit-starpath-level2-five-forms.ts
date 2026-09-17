import assert from 'node:assert/strict';
import {LEVEL2_STARPATH_FORMS as forms,LEVEL2_STARPATH_BLUEPRINT,shapeSpec,transformCell} from '../data/assessments/revisions/level2StarpathFiveForms';
import {emptyLevel2Response,scoreLevel2Response,level2ResponseReady,level2RouteCorrect} from '../lib/starpath-level2-review';
import {routeCells,type Direction} from '../data/assessments/revisions/level1StarpathFiveForms';
import {sameCell} from '../lib/starpath-level1-review';
import type {ShapeSpec} from '../data/assessments/revisions/groundStarpathRedesignedForms';
const sides=(s:ShapeSpec)=>s.vertices?.length??({circle:0,oval:0,triangle:3,square:4,rectangle:4}[s.shape]);
function parallelPairs(s:ShapeSpec){
 if(!s.vertices)return s.shape==='square'||s.shape==='rectangle'?2:0;
 const es=s.vertices.map((p,i)=>{const q=s.vertices![(i+1)%s.vertices!.length];return [q[0]-p[0],q[1]-p[1]];});let pairs=0;
 for(let i=0;i<es.length;i++)for(let j=i+1;j<es.length;j++){const a=es[i],b=es[j];if(Math.abs(a[0]*b[1]-a[1]*b[0])/(Math.hypot(...a)*Math.hypot(...b))<.002)pairs++;}return pairs;
}
assert.equal(sides(shapeSpec('pentagon')),5);assert.equal(sides(shapeSpec('hexagon')),6);assert.equal(parallelPairs(shapeSpec('trapezoid')),1);assert.equal(parallelPairs(shapeSpec('hexagon')),3);
const ids=new Set<string>();
for(const [f,[form,items]]of Object.entries(forms).entries()){
 assert.equal(items.length,20);assert.deepEqual(items.map(q=>q.skillLabel),LEVEL2_STARPATH_BLUEPRINT);
 assert.equal(items.filter(q=>q.primaryDescriptorCode==='AC9M2SP01').length,10);
 assert.equal(items.filter(q=>q.primaryDescriptorCode==='AC9M2SP02').length,10);
 for(const [i,q]of items.entries()){
  assert(!ids.has(q.id));ids.add(q.id);assert.equal(q.form,form);assert(q.id.endsWith('-v5'));assert(q.readAloudText.includes(q.prompt));
  const a=emptyLevel2Response(q);assert(!scoreLevel2Response(q,a));assert(!level2ResponseReady(q,a));
  if(q.kind==='shape'){
   const t=q.task;assert.equal(new Set(t.options!.map(o=>o.id)).size,t.options!.length);a.shape.selected=t.correctIds!;a.shape.reason=t.correctReason??null;
   for(const o of t.options!)if(!t.correctIds!.includes(o.id))assert(!scoreLevel2Response(q,{...a,shape:{...a.shape,selected:[o.id]}}));
   if(t.mode==='multi')assert(!scoreLevel2Response(q,{...a,shape:{...a.shape,selected:t.options!.map(o=>o.id)}}));
   if(t.reasons)assert(!scoreLevel2Response(q,{...a,shape:{...a.shape,reason:t.reasons.find(r=>r.id!==t.correctReason)!.id}}));
   if([0,2,3,6,9].includes(i))for(const o of t.options!){const s=o.shape!,wanted=i===0?sides(s)===0:i===2?sides(s)===(f%2?6:5):i===3?sides(s)===4:i===6?parallelPairs(s)===1:parallelPairs(s)===2;assert.equal(t.correctIds!.includes(o.id),wanted,`${q.id}: geometry determines answer`);}
   if(i===1)assert.equal(t.options!.find(o=>o.id===t.correctIds![0])!.label,String(sides(t.visual!.kind==='shapes'?t.visual!.shapes[0]:shapeSpec('circle'))));
  }else if(q.kind==='edge'){
   const t=q.task;a.edge=t.correct;assert.equal(t.correct,(t.reference+2)%4);
   if(t.property==='parallel'){const vector=(n:number)=>{const p=t.vertices[n],r=t.vertices[(n+1)%4];return [r[0]-p[0],r[1]-p[1]];};const u=vector(t.reference),v=vector(t.correct);assert(Math.abs(u[0]*v[1]-u[1]*v[0])<1e-7);}
   for(let edge=0;edge<4;edge++)assert.equal(scoreLevel2Response(q,{...a,edge}),edge===t.correct);
  }else{
   const t=q.task;assert.equal(new Set(t.landmarks.map(l=>JSON.stringify(l.cell))).size,t.landmarks.length);
   assert.equal(new Set(t.landmarks.map(l=>l.icon)).size,t.landmarks.length,'Map key symbols must be unique');
   if(t.mode==='locate'){
    a.cell=t.target!;assert(a.cell.r>=0&&a.cell.r<4&&a.cell.c>=0&&a.cell.c<4);
    if(i===12)assert.deepEqual(t.target,transformCell({r:3,c:0},f));
    if(i===13)assert.deepEqual(t.target,routeCells(t.start!,t.given!).at(-1));
    assert(!scoreLevel2Response(q,{...a,cell:{r:(a.cell.r+1)%4,c:a.cell.c}}));
   }else if(t.mode==='choice'){
    a.choice=t.correctId!;for(const o of t.options!)if(o.id!==t.correctId)assert(!scoreLevel2Response(q,{...a,choice:o.id}));
    if(i===17){const wrong=t.given!.flatMap((d,n)=>d===t.shown![n]?[]:[n]);assert.equal(wrong.length,1);assert.equal(t.options!.find(o=>o.id===t.correctId)!.label,`Step ${wrong[0]+1}`);}
    if(i===16)for(const o of t.options!)assert.equal(sameCell(routeCells(t.start!,o.label.match(/up|right|down|left/g) as Direction[]).at(-1)!,t.goal!),o.id===t.correctId);
   }else{
    a.moves=t.example!;assert(level2RouteCorrect(t,a.moves),q.id);
    assert(!level2RouteCorrect(t,[]));assert(!level2RouteCorrect(t,['up','up','up','up']));assert(!level2RouteCorrect(t,a.moves.slice(0,-1)));
    if(!t.shown){let valid=0,rejected=0;const queue:Direction[][]=[[]];while(queue.length){const ds=queue.shift()!,path=routeCells(t.start!,ds);if(path.some(p=>p.r<0||p.r>3||p.c<0||p.c>3))continue;const last=path.at(-1)!;if(sameCell(last,t.goal!)){const invalid=path.some(p=>t.blocked.some(b=>sameCell(b,p)))||!!t.checkpoint&&!path.some(p=>sameCell(p,t.checkpoint!));assert.equal(level2RouteCorrect(t,ds),!invalid);if(invalid)rejected++;else valid++;continue;}if(ds.length<8)for(const d of ['up','right','down','left'] as Direction[])queue.push([...ds,d]);}assert(valid>1);assert(rejected>0);}
   }
  }
  assert(level2ResponseReady(q,a));assert(scoreLevel2Response(q,a),q.id);
 }
}
assert.equal(ids.size,100);for(let i=0;i<20;i++)assert(new Set(Object.values(forms).map(q=>JSON.stringify(q[i].task))).size>=3,`Question ${i+1} requires varied forms`);
console.log('PASS: 100 Level 2 items, curriculum balance, independent geometry checks, map keys/answers, varied forms, valid alternatives and invalid route rejection.');
