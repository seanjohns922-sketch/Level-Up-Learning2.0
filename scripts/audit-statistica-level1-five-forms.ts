import assert from 'node:assert/strict';
import {STATISTICA_FORMS,LEVEL1_STATISTICA_FORMS} from '../data/assessments/revisions/level1StatisticaFiveForms';
import {emptyStatsResponse,statsResponseReady,scoreStatsResponse} from '../lib/statistica-level1-review';
const ids=new Set<string>();
for(const form of STATISTICA_FORMS){
 const bank=LEVEL1_STATISTICA_FORMS[form];assert.equal(bank.length,20);
 assert.equal(bank.filter(q=>q.code==='AC9M1ST01').length,10);
 assert.equal(bank.filter(q=>q.code==='AC9M1ST02').length,10);
 for(const q of bank){
  assert(!ids.has(q.id));ids.add(q.id);
  assert(q.prompt&&q.context&&q.week>=1&&q.week<=6);
  const blank=emptyStatsResponse(q);assert(!statsResponseReady(q,blank));assert(!scoreStatsResponse(q,blank));
  const correct={...blank,touched:true,...(typeof q.answer==='string'?{choice:q.answer}:{values:[...q.answer]})};
  assert(scoreStatsResponse(q,correct),`${q.id}: correct response`);
  const wrong=typeof q.answer==='string'?{...correct,choice:q.options.find(o=>o.id!==q.answer)!.id}:{...correct,values:correct.values.map((n,i)=>i===0?n+1:n)};
  assert(!scoreStatsResponse(q,wrong),`${q.id}: reject wrong response`);
  if(q.mode==='choice'){
   assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(o=>o.label)).size,4);
   assert.equal(q.options.filter(o=>o.id===q.answer).length,1);
  }else if((q.mode==='list'||q.mode==='sort'))assert.deepEqual(q.answer,q.observations);
  else{
   const sourceCounts=q.categories.map((_,i)=>q.observations.filter(v=>v===i).length);
   assert.deepEqual(q.answer,q.target===undefined?sourceCounts:[sourceCounts[q.target]]);
  }
  const label=q.options.find(o=>o.id===q.answer)?.label;
  if(q.slot===7){assert.equal(q.mode,'sort');assert.equal(q.categories.length,4);assert.equal(new Set(q.observations).size,4);const bad={...correct,values:correct.values.map((v,i)=>i===0?-1:v)};assert(!statsResponseReady(q,bad));assert(!scoreStatsResponse(q,bad));}
  if(q.slot===13)assert.equal(label,q.categories[q.counts.indexOf(Math.max(...q.counts))].name);
  if(q.slot===14)assert.equal(label,q.categories[q.counts.indexOf(0)].name);
  if(q.slot===15)assert.equal(Number(label),q.counts[q.target!]);
  if(q.slot===16)assert.equal(Number(label),7-4);
  if(q.slot===17){const pair=q.counts.map((n,i)=>n===4?q.categories[i].name:null).filter(Boolean);assert.equal(label,pair.join(' and '));}
  if(q.slot===18){assert(q.initial);assert.equal(q.initial.filter((n,i)=>n!==q.counts[i]).length,1);}
  if(q.slot===8){assert.equal(q.recorded?.length,q.observations.length-1);assert.equal(label,q.categories[q.observations.at(-1)!].name);}
  if(q.slot===9)assert.equal(q.recorded?.filter(n=>n===1).length,2);
 }
}
for(let i=0;i<20;i++){
 const items=STATISTICA_FORMS.map(f=>LEVEL1_STATISTICA_FORMS[f][i]);
 assert.equal(new Set(items.map(q=>q.context)).size,i===6?1:5);
 assert.equal(new Set(items.map(q=>q.mode)).size,1);
 assert.equal(new Set(items.map(q=>q.skillLabel)).size,1);
 assert.equal(new Set(items.map(q=>q.observations.length)).size,1);
}
console.log(`PASS: ${ids.size} matched Level 1 Statistica items; curriculum balance, source data, four-option distractors, sorting placements, independent answers, scoring and blank handling.`);
