export const releaseSamples = new Map<string, unknown>();
import assert from 'node:assert/strict';
import {LEVEL3_STARPATH_FORMS as forms,LEVEL3_STARPATH_BLUEPRINT,relativeDirection} from '../data/assessments/revisions/level3StarpathFiveForms';
import {emptyLevel3Response,scoreLevel3Response,level3ResponseReady,layoutCorrect} from '../lib/starpath-level3-review';
import {L3_OBJECTS} from '../data/activities/starpath/level3/l3-objects';
import type {Cell} from '../data/assessments/revisions/level1StarpathFiveForms';
const ids=new Set<string>();let alternateLayouts=0;
for(const [form,items]of Object.entries(forms)){
 assert.equal(items.length,20);assert.deepEqual(items.map(q=>q.skillLabel),LEVEL3_STARPATH_BLUEPRINT);assert.equal(items.filter(q=>q.primaryDescriptorCode==='AC9M3SP01').length,10);assert.equal(items.filter(q=>q.primaryDescriptorCode==='AC9M3SP02').length,10);
 for(const [i,q]of items.entries()){
  assert(!ids.has(q.id));ids.add(q.id);assert.equal(q.form,form);assert(q.readAloudText.includes(q.prompt));const a=emptyLevel3Response(q);assert(!scoreLevel3Response(q,a));assert(!level3ResponseReady(q,a));
  if(q.kind==='solid'){
   const t=q.task;if(t.build){a.heights=Array(t.build.cols*t.build.rows).fill(t.build.height);assert(!scoreLevel3Response(q,{...a,heights:a.heights.map((n,j)=>j===0?n+1:n)}));assert(!scoreLevel3Response(q,{...a,heights:a.heights.slice(1)}));}
   else {a.selected=t.correctIds!;a.reason=t.correctReason??null;for(const o of t.options!)if(!t.correctIds!.includes(o.id))assert(!scoreLevel3Response(q,{...a,selected:[o.id]}));if(t.mode==='multi'){assert(!scoreLevel3Response(q,{...a,selected:t.options!.map(o=>o.id)}));for(const o of t.options!)assert.equal(t.correctIds!.includes(o.id),L3_OBJECTS[o.object!].curvedSurfaces>0);}if(t.reasons)assert(!scoreLevel3Response(q,{...a,reason:t.reasons.find(r=>r.id!==t.correctReason)!.id}));
    const answer=t.options!.find(o=>o.id===t.correctIds![0])!.label;
    if(i===1)assert.equal(Number(answer),L3_OBJECTS[t.objects![0]].flatFaces);
    if(i===2)assert.equal(Number(answer),L3_OBJECTS[t.objects![0]].vertices);
    if(i===7)assert.equal(Number(answer),t.models![0].cols*t.models![0].rows*t.models![0].height);
    if(i===9){const [x,y]=t.models!;assert.equal(x.height,y.height);assert.equal(Number(answer),y.cols*y.rows*y.height-x.cols*x.rows*x.height);}
   }
  }else if(q.kind==='map'){
   if(q.task.mode==='locate')a.map.cell=q.task.target!;else if(q.task.mode==='choice')a.map.choice=q.task.correctId!;else{a.map.moves=q.task.example!;assert(!scoreLevel3Response(q,{...a,map:{...a.map,moves:a.map.moves.slice(0,-1)}}));}
  }else{
   const t=q.task;if(t.mode==='build'){
    a.placements=t.example!;assert(layoutCorrect(t,a.placements));const invalid={...a.placements,[t.landmarks[1].id]:a.placements[t.landmarks[0].id]};assert(!layoutCorrect(t,invalid));assert(!layoutCorrect(t,{}));
    // Independently enumerate all in-bounds maps; accept exactly maps satisfying
    // the written aligned relations, not only the illustrative answer layout.
    let valid=0;const cells=Array.from({length:16},(_,n)=>({r:Math.floor(n/4),c:n%4}));
    const visit=(p:Record<string,Cell>,n:number)=>{if(n===t.landmarks.length){const unique=new Set(Object.values(p).map(c=>`${c.r},${c.c}`)).size===n;const satisfies=t.constraints!.every(c=>{const a=p[c.subject],b=p[c.reference];return c.relation==='above'?a.c===b.c&&a.r<b.r:c.relation==='below'?a.c===b.c&&a.r>b.r:c.relation==='left'?a.r===b.r&&a.c<b.c:a.r===b.r&&a.c>b.c;});const wanted=unique&&satisfies;assert.equal(layoutCorrect(t,p),wanted);if(wanted)valid++;return;}for(const c of cells)visit({...p,[t.landmarks[n].id]:c},n+1);};visit({},0);assert(valid>1);alternateLayouts+=valid;
   }else {a.selected=[t.correctId!];for(const o of t.options!)if(o.id!==t.correctId)assert(!scoreLevel3Response(q,{...a,selected:[o.id]}));if(t.explorer){const d=relativeDirection(t.explorer.facing,t.relation!),p=t.landmarks.find(l=>l.id===t.target)!.cell,e=t.explorer.cell;assert.equal(d,p.r<e.r?'up':p.r>e.r?'down':p.c<e.c?'left':'right');assert(t.landmarks.every(l=>l.cell.r>=0&&l.cell.r<4&&l.cell.c>=0&&l.cell.c<4));}if(t.mode==='views')assert.equal(t.options!.find(o=>o.id===t.correctId)!.label,t.viewAnswer==='plan'?'Plan view':'Front view');}
  }
  assert(level3ResponseReady(q,a),q.id);assert(scoreLevel3Response(q,a),q.id);releaseSamples.set(q.id,structuredClone(a));
 }
}
assert.equal(ids.size,100);for(let i=0;i<20;i++)assert(new Set(Object.values(forms).map(q=>JSON.stringify(q[i].task))).size>=3,`Question ${i+1}: matched but varied forms`);
console.log(`PASS: 100 Level 3 items; curriculum balance; solid features and cube counts; viewpoints; ${alternateLayouts} valid map layouts plus invalid alternatives; scoring and varied forms.`);
