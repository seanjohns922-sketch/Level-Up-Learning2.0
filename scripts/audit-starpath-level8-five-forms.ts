import assert from 'node:assert/strict';
import {LEVEL8_STARPATH_FORMS as forms,LEVEL8_STARPATH_BLUEPRINT,type Level8Item,type Polygon8} from '../data/assessments/revisions/level8StarpathFiveForms';
import {emptyLevel8Response,scoreLevel8Response,level8ResponseReady,type Level8Response} from '../lib/starpath-level8-review';
export function sampleAnswer(q:Level8Item):Level8Response{const a=emptyLevel8Response(q),t=q.task;if(t.correctIds)a.selected=[...t.correctIds];if(t.mode==='number')a.value=String(t.answer);if(t.mode==='triple')a.triple={x:String(t.expectedPoint!.x),y:String(t.expectedPoint!.y),z:String(t.expectedPoint!.z)};if(t.mode==='place3d'){a.placed=t.expectedPoint!;a.floor=t.expectedPoint!.z;}if(t.sortRows)a.assignments=Object.fromEntries(t.sortRows.map(r=>[r.id,r.answer]));if(t.decisionAnswers)a.decisions=[...t.decisionAnswers];return a;}
const lengths=(p:Polygon8)=>p.points.map((a,i)=>{const b=p.points[(i+1)%p.points.length];return Math.hypot(b.x-a.x,b.y-a.y);});
const near=(a:number,b:number)=>Math.abs(a-b)<.001;
const same=(a:number[],b:number[])=>a.length===b.length&&a.every((n,i)=>near(n,b[i]));
const similar=(a:number[],b:number[])=>{a=[...a].sort((x,y)=>x-y);b=[...b].sort((x,y)=>x-y);return a.every((n,i)=>near(b[i]/n,b[0]/a[0]));};
const classify=(a:number[],b:number[])=>same([...a].sort((x,y)=>x-y),[...b].sort((x,y)=>x-y))?'Congruent':similar(a,b)?'Similar but not congruent':'Not similar';
const ids=new Set<string>();
for(const [form,items]of Object.entries(forms)){
 assert.equal(items.length,30);assert.deepEqual(items.map(q=>q.skillLabel),LEVEL8_STARPATH_BLUEPRINT);assert.deepEqual(['AC9M8SP01','AC9M8SP02','AC9M8SP03','AC9M8SP04'].map(code=>items.filter(q=>q.primaryDescriptorCode===code).length),[8,8,7,7]);assert.equal(items.filter(q=>q.task.space).length,7);assert.equal(new Set(items.filter(q=>q.task.options).map(q=>q.task.options!.findIndex(o=>q.task.correctIds!.includes(o.id)))).size,4,'Correct answers use all four positions within each form');
 for(const [i,q]of items.entries()){
  assert(!ids.has(q.id));ids.add(q.id);assert.equal(q.form,form);assert(q.readAloudText.includes(q.task.instruction));const a=sampleAnswer(q),t=q.task,blank=emptyLevel8Response(q);assert(!level8ResponseReady(q,blank));assert(!scoreLevel8Response(q,blank));assert(scoreLevel8Response(q,a),q.id);
  if(t.options){assert.equal(t.options.length,4);assert.equal(new Set(t.options.map(o=>o.id)).size,4);assert.equal(new Set(t.options.map(o=>o.label)).size,4);for(const o of t.options)assert.equal(scoreLevel8Response(q,{...a,selected:[o.id]}),t.correctIds!.includes(o.id));assert(!scoreLevel8Response(q,{...a,selected:[a.selected[0],a.selected[0]]}));}
  if(t.mode==='number')for(const value of ['',String(t.answer!+1),'NaN','1x','Infinity'])assert(!scoreLevel8Response(q,{...a,value}));
  if(t.mode==='triple')for(const axis of ['x','y','z'] as const)for(const value of ['',String(t.expectedPoint![axis]+1),'NaN'])assert(!scoreLevel8Response(q,{...a,triple:{...a.triple,[axis]:value}}));
  if(t.mode==='place3d')for(const axis of ['x','y','z'] as const)assert(!scoreLevel8Response(q,{...a,placed:{...a.placed!,[axis]:a.placed![axis]+1}}));
  if(t.sortRows)for(const row of t.sortRows){const expected=classify(...row.polygons.map(p=>lengths(p)) as [number[],number[]]);assert.equal(row.answer,expected);for(const value of t.categories!)assert.equal(scoreLevel8Response(q,{...a,assignments:{...a.assignments,[row.id]:value}}),value===row.answer);}
  if(t.decisionAnswers)for(let d=0;d<t.decisionAnswers.length;d++)for(const value of t.decisionChoices!)assert.equal(scoreLevel8Response(q,{...a,decisions:a.decisions.map((s,j)=>j===d?value:s)}),value===t.decisionAnswers[d]);
  for(const p of [t.expectedPoint,t.space?.point,t.space?.box?.min,t.space?.box?.max])if(p)for(const n of Object.values(p))assert(Number.isInteger(n)&&n>=0&&n<=4,q.id+' coordinate range');
  const allPolygons=[...(t.polygons??[]),...(t.options??[]).flatMap(o=>o.polygons??[]),...(t.sortRows??[]).flatMap(r=>r.polygons)];
  for(const p of allPolygons){assert(p.points.every(v=>Number.isFinite(v.x)&&Number.isFinite(v.y)));const ls=lengths(p);p.sideLabels?.forEach((label,j)=>{if(/^\d/.test(label))assert(near(ls[j],Number(label)),q.id+' length geometry');});p.angles?.forEach((label,j)=>{if(!/^\d/.test(label))return;const v=p.points[j],prev=p.points[(j+p.points.length-1)%p.points.length],next=p.points[(j+1)%p.points.length],u={x:prev.x-v.x,y:prev.y-v.y},w={x:next.x-v.x,y:next.y-v.y},angle=Math.acos(Math.max(-1,Math.min(1,(u.x*w.x+u.y*w.y)/(Math.hypot(u.x,u.y)*Math.hypot(w.x,w.y)))))*180/Math.PI;assert(Math.abs(angle-parseFloat(label))<.04,`${q.id} angle ${label} drawn ${angle}`);});}
  if(i===0)assert.equal(classify(...t.polygons!.map(lengths) as [number[],number[]]),'Congruent');
  if(i===4){const [one,two]=t.polygons!.map(lengths);assert(near(one[0],two[0])&&near(one[1],two[1]));assert(!near(one[2],two[2]));}
  if(i===5){assert.equal(t.answer,t.evidence!.sides![0][2]*t.evidence!.factor!);assert(similar(...t.evidence!.sides as [number[],number[]]));}
  if(i===6)for(const o of t.options!)assert.equal(similar(lengths(t.polygons![0]),lengths(o.polygons![0])),t.correctIds!.includes(o.id));
  if(i===8)assert.equal(t.answer,180-t.evidence!.angles![0]);
  if(i===10)assert.equal(t.answer,t.evidence!.angles![0]/2);
  if(i===13){assert.equal(t.evidence!.angles!.reduce((a,b)=>a+b),360);assert.equal(t.answer,360-t.evidence!.angles!.slice(0,3).reduce((a,b)=>a+b));}
  if(t.evidence?.start){const end=t.evidence.steps!.reduce((p,d)=>({x:p.x+d.x,y:p.y+d.y,z:p.z+d.z}),t.evidence.start);assert.deepEqual(t.expectedPoint,end);}
  if(i===23)assert.equal(classify(...t.evidence!.sides as [number[],number[]]),'Similar but not congruent');
  if(i===28)for(const o of t.options!){const reference=lengths(t.polygons![0]),candidate=lengths(o.polygons![0]),equalPerimeter=near(reference.reduce((a,b)=>a+b),candidate.reduce((a,b)=>a+b)),congruent=classify(reference,candidate)==='Congruent';assert.equal(equalPerimeter&&!congruent,t.correctIds!.includes(o.id));}
 }
}
assert.equal(ids.size,150);for(let i=0;i<30;i++)assert(new Set(Object.values(forms).map(items=>JSON.stringify(items[i].task))).size>=3,`Form variation Q${i+1}`);
console.log('PASS: 150 Level 8 items; 8/8/7/7 descriptor balance; four distinct options; actual side/angle geometry; congruence/similarity ratios and SSA counterexample; quadrilateral calculations; all 3D movements and bounds; wrong/blank responses; sorting and decision-tree alternatives; matched-form variation.');
