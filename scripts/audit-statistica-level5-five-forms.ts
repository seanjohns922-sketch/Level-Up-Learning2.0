import assert from 'node:assert/strict';
import {STATISTICA_FORMS} from '../data/assessments/revisions/level1StatisticaFiveForms';
import {LEVEL5_STATISTICA_FORMS} from '../data/assessments/revisions/level5StatisticaFiveForms';
import {emptyStatsResponse,statsResponseReady,scoreStatsResponse} from '../lib/statistica-level1-review';
const ids=new Set<string>();
for(const form of STATISTICA_FORMS){
 const bank=LEVEL5_STATISTICA_FORMS[form];assert.equal(bank.length,20);
 for(const [code,n] of [['AC9M5ST01',7],['AC9M5ST02',7],['AC9M5ST03',6]] as const)assert.equal(bank.filter(q=>q.code===code).length,n);
 for(const q of bank){
  assert(!ids.has(q.id));ids.add(q.id);assert(q.prompt&&q.instruction);assert.equal(q.categories.length,q.counts.length);
  const blank=emptyStatsResponse(q);assert(!statsResponseReady(q,blank));assert(!scoreStatsResponse(q,blank));
  const correct={...blank,touched:true,...(typeof q.answer==='string'?{choice:q.answer}:{values:[...q.answer]})};assert(scoreStatsResponse(q,correct),q.id);
  if(q.mode==='choice'){assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(o=>o.label)).size,4);assert.equal(q.options.filter(o=>o.id===q.answer).length,1);assert(!scoreStatsResponse(q,{...correct,choice:q.options.find(o=>o.id!==q.answer)!.id}));}
  else{assert(!scoreStatsResponse(q,{...correct,values:correct.values.map((v,i)=>v+(i===0?1:0))}));assert(!statsResponseReady(q,{...correct,values:[-1,...correct.values.slice(1)]}));}
  const label=q.options.find(o=>o.id===q.answer)?.label;
  if(q.source==='records'){assert.equal(q.recordIds!.length,q.observations.length);assert(q.observations.every(v=>v>=0&&v<q.categories.length));if(q.slot===17){const unique=new Map(q.recordIds!.map((id,i)=>[id,q.observations[i]]));assert.equal(unique.size,8);assert.deepEqual(q.answer,q.categories.map((_,i)=>[...unique.values()].filter(v=>v===i).length));}else assert.equal(new Set(q.recordIds).size,q.observations.length);}
  if(q.slot===3)assert.deepEqual(q.answer,q.observations);
  if(q.slot===5)assert.equal(Number(label),q.counts.indexOf(Math.max(...q.counts)));
  if(q.slot===7)assert.equal(q.counts.filter(v=>v===Math.max(...q.counts)).length,2);
  if(q.source==='line'){const p=q.linePoints!,d=p.slice(1).map((v,i)=>v.value-p[i].value);assert.equal(p.length,5);assert(p.every(v=>v.value>=0&&v.value<=q.graphMax!));if(q.slot===8)assert.equal(Number(label),p[2].value);if(q.slot===10)assert.equal(Number(label),d[2]-d[0]);if(q.slot===11)assert.equal(d.filter(v=>v===0).length,1);if(q.slot===12){assert.equal(d.filter(v=>v===Math.max(...d)).length,1);const i=d.indexOf(Math.max(...d));assert.equal(label,`${p[i].label} to ${p[i+1].label}`);}}
  if(q.slot===18){assert.deepEqual(q.answer,q.counts);assert.equal(Math.max(...q.counts),140);}
  if(q.slot===19)assert.equal(Number(label),Math.max(...q.counts)-Math.min(...q.counts));
 }
}
for(let i=0;i<20;i++)for(const field of ['mode','skillLabel','code','difficulty','source'] as const)assert.equal(new Set(STATISTICA_FORMS.map(f=>LEVEL5_STATISTICA_FORMS[f][i][field])).size,1);
console.log(`PASS: ${ids.size} Level 5 items, matched forms, three curriculum codes, four options, records, mode, unique line-graph answers and scoring.`);
