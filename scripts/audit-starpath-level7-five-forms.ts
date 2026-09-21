import assert from 'node:assert/strict';
import {LEVEL7_STARPATH_FORMS as forms,LEVEL7_STARPATH_BLUEPRINT,type Level7Item,type P7} from '../data/assessments/revisions/level7StarpathFiveForms';
import {emptyLevel7Response,scoreLevel7Response,level7ResponseReady,type Level7Response} from '../lib/starpath-level7-review';
import {foldNet,relationBetween} from '../data/activities/starpath/level5/nets';
export function sampleAnswer(q:Level7Item):Level7Response{const a=emptyLevel7Response(q),t=q.task;if(t.correctIds)a.selected=[...t.correctIds];if(t.mode==='number')a.value=String(t.number);if(t.mode==='pair')a.pair={x:String(t.pair!.x),y:String(t.pair!.y)};if(t.mode==='points')a.points=[...t.expected!];if(t.mode==='program')a.commands=['reflectX','reflectY'];if(t.mode==='sort')a.assignments=Object.fromEntries(t.sortRows!.map(r=>[r.id,r.answer]));if(t.mode==='decisions')a.decisions=[...t.decisionAnswers!];return a;}
const key=(ps:P7[])=>ps.map(p=>`${p.x},${p.y}`).sort().join(';');
const ids=new Set<string>();
for(const [form,items]of Object.entries(forms)){
 assert.equal(items.length,30);assert.deepEqual(items.map(q=>q.skillLabel),LEVEL7_STARPATH_BLUEPRINT);assert.deepEqual(['AC9M7SP01','AC9M7SP02','AC9M7SP03','AC9M7SP04'].map(code=>items.filter(q=>q.primaryDescriptorCode===code).length),[8,8,7,7]);assert.equal(items.filter(q=>q.task.diagram==='plane').length,7);
 for(const [i,q]of items.entries()){
  assert(!ids.has(q.id));ids.add(q.id);assert.equal(q.form,form);assert(q.readAloudText.includes(q.task.instruction));const blank=emptyLevel7Response(q),a=sampleAnswer(q),t=q.task;assert(!level7ResponseReady(q,blank));assert(!scoreLevel7Response(q,blank));assert(level7ResponseReady(q,a));assert(scoreLevel7Response(q,a),q.id);
  if(t.options){assert.equal(t.options.length,4);assert.equal(new Set(t.options.map(o=>o.id)).size,4);assert.equal(new Set(t.options.map(o=>o.label)).size,4);for(const id of t.correctIds!)assert(t.options.some(o=>o.id===id));for(const o of t.options)if(!t.correctIds!.includes(o.id))assert(!scoreLevel7Response(q,{...a,selected:[o.id]}));assert(!scoreLevel7Response(q,{...a,selected:[a.selected[0],a.selected[0]]}));if(t.mode==='multi')assert(!scoreLevel7Response(q,{...a,selected:t.options.map(o=>o.id)}));}
  for(const p of [...(t.shape??[]),...(t.image??[]),...(t.expected??[])])assert(Math.abs(p.x)<=6&&Math.abs(p.y)<=6,`${q.id} within grid`);
  if(t.mode==='points'){assert(scoreLevel7Response(q,{...a,points:[...a.points].reverse()}));assert(!scoreLevel7Response(q,{...a,points:a.points.slice(1)}));assert(!scoreLevel7Response(q,{...a,points:a.points.map(p=>({x:p.x+1,y:p.y}))}));if(a.points.length===3)assert(!scoreLevel7Response(q,{...a,points:[a.points[0],a.points[0],a.points[1]]}));}
  if(t.mode==='number')for(const value of ['',String(t.number!+1),'NaN','1x'])assert(!scoreLevel7Response(q,{...a,value}));
  if(t.mode==='pair')for(const x of ['',String(t.pair!.x+1),'NaN'])assert(!scoreLevel7Response(q,{...a,pair:{...a.pair,x}}));
  if(t.mode==='sort')for(const r of t.sortRows!)for(const output of t.categories!)assert.equal(scoreLevel7Response(q,{...a,assignments:{...a.assignments,[r.id]:output}}),output===r.answer);
  if(t.mode==='decisions')for(let d=0;d<3;d++)for(const output of t.decisionChoices!)assert.equal(scoreLevel7Response(q,{...a,decisions:a.decisions.map((s,j)=>j===d?output:s)}),output===t.decisionAnswers![d]);
  if(t.mode==='program')for(const first of ['reflectX','reflectY'] as const)for(const second of ['reflectX','reflectY'] as const)assert.equal(scoreLevel7Response(q,{...a,commands:[first,second]}),first!==second);
  if(i===0)for(const o of t.options!)assert.equal(foldNet(o.cells!).valid,t.correctIds!.includes(o.id));
  if(i===1)for(const o of t.options!)assert.equal(relationBetween(foldNet(t.cells!),t.cells![t.marked!],t.cells![Number(o.id.slice(1))])==='opposite',t.correctIds!.includes(o.id));
  if(i===2)for(const o of t.options!)assert.equal(o.profile!.every((v,j)=>v===Number(t.heights![j]>0)),t.correctIds!.includes(o.id));
  if(i===3){const profile=[0,1,2].map(c=>Math.max(t.heights![c],t.heights![c+3]));assert.deepEqual(t.options!.find(o=>t.correctIds!.includes(o.id))!.profile,profile);}
  if(i===4){const profile=[0,1].map(r=>Math.max(...t.heights!.slice(r*3,r*3+3))).join(', ');assert.equal(t.options!.find(o=>t.correctIds!.includes(o.id))!.label,profile);}
  if(i===5)assert.equal(t.number,t.heights!.reduce((s,n)=>s+n,0));
  if(i===8){const lens=t.polygons![0].sideLabels!.map(Number).sort((a,b)=>a-b);assert.equal(new Set(lens).size,3);assert.equal(lens[0]**2+lens[1]**2,lens[2]**2);}
  if(i===9)for(const o of t.options!){const [a,b,c]=o.label.split(', ').map(Number).sort((a,b)=>a-b);assert.equal(a+b>c,t.correctIds!.includes(o.id));}
  if(i>=16&&i<=21){const expected=t.shape!.map(p=>{if(i===16)return{x:p.x+t.vector!.x,y:p.y+t.vector!.y};if(i===17)return{x:p.x,y:-p.y};if(i===18)return{x:-p.x,y:p.y};if(i===19){const c=t.centre!;return{x:c.x+(p.y-c.y),y:c.y-(p.x-c.x)};}if(i===20)return{x:p.x+t.pair!.x,y:p.y+t.pair!.y};return{x:2*t.mirrorX![1]-(2*t.mirrorX![0]-p.x),y:p.y};});assert.equal(key(expected),key(i===20?t.image!:t.expected!));}
 }
}
assert.equal(ids.size,150);
for(let i=0;i<30;i++)assert(new Set(Object.values(forms).map(items=>JSON.stringify(items[i].task))).size>=3,`Variation Q${i+1}`);
console.log('PASS: 150 Level 7 questions; 8/8/7/7 curriculum balance; four distinct choices; cube nets, profiles, counts, triangle inequalities and independent transformation checks; valid/wrong/blank responses; sorting, decision trees and both reflection orders; all coordinates within bounds; matched-form variation.');
