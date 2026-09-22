import assert from 'node:assert/strict';
import {STATISTICA_FORMS} from '../data/assessments/revisions/level1StatisticaFiveForms';
import {LEVEL2_STATISTICA_FORMS} from '../data/assessments/revisions/level2StatisticaFiveForms';
import {emptyStatsResponse,statsResponseReady,scoreStatsResponse} from '../lib/statistica-level1-review';
// Keep Level 2 frequencies above the introductory Level 1 bank.
const ids=new Set<string>();
for(const form of STATISTICA_FORMS){
 const bank=LEVEL2_STATISTICA_FORMS[form];assert.equal(bank.length,20);
 assert.equal(Math.max(...bank[15].counts),15);assert.equal(bank[2].observations.length,15);assert.equal(Math.max(...bank[12].counts),10);
 for(const code of ['AC9M2ST01','AC9M2ST02'])assert.equal(bank.filter(q=>q.code===code).length,10);
 for(const q of bank){
  assert(!ids.has(q.id));ids.add(q.id);assert(q.prompt&&q.instruction&&q.week>=1&&q.week<=6);
  assert.equal(q.categories.length,4);assert.equal(new Set(q.categories.map(c=>c.name)).size,4);
  assert(q.counts.every(n=>Number.isInteger(n)&&n>=0&&n<=(q.graphMax??12)));
  const blank=emptyStatsResponse(q);assert(!statsResponseReady(q,blank));assert(!scoreStatsResponse(q,blank));
  const correct={...blank,touched:true,...(typeof q.answer==='string'?{choice:q.answer}:{values:[...q.answer]})};
  assert(statsResponseReady(q,correct));assert(scoreStatsResponse(q,correct),q.id);
  const wrong=typeof q.answer==='string'?{...correct,choice:q.options.find(o=>o.id!==q.answer)!.id}:{...correct,values:correct.values.map((n,i)=>i===0?n+1:n)};
  assert(!scoreStatsResponse(q,wrong),q.id);
  const label=q.options.find(o=>o.id===q.answer)?.label;
  if(q.mode==='choice'){assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(o=>o.label)).size,4);assert.equal(q.options.filter(o=>o.id===q.answer).length,1);}
  else if(q.mode==='list'||q.mode==='sort'){
   assert.deepEqual(q.answer,q.observations);
   const partial={...correct,values:correct.values.map((n,i)=>i===0?-1:n)};
   assert(!statsResponseReady(q,partial));assert(!scoreStatsResponse(q,partial));
  }else{const totals=q.categories.map((_,i)=>q.observations.filter(v=>v===i).length);assert.deepEqual(q.answer,totals);assert.deepEqual(q.counts,totals);}
  if(q.slot===4){assert.equal(q.observations.length,15);assert.equal(q.sourceLabel,'Draw');assert.equal(q.display,'tally');}
  if(q.slot===6){assert.equal(q.mode,'sort');assert.equal(new Set(q.observations).size,4);}
  if(q.slot===10||q.slot===18){assert(q.initial);assert.equal(q.initial.filter((n,i)=>n!==q.counts[i]).length,1);assert(!scoreStatsResponse(q,{...correct,values:q.initial}));}
  if(q.slot===14)assert.equal(label,q.categories[q.counts.indexOf(Math.max(...q.counts))].name);
  if(q.slot===16)assert.equal(Number(label),Math.max(...q.counts)-q.counts.find(n=>n===8)!);
  if(q.source==='dual'){assert.equal(q.graphKind,'pictures');assert.equal(q.secondaryKind,'columns');assert.deepEqual([...(q.secondaryOrder??[0,1,2,3])].sort(),[0,1,2,3]);}
  if(q.slot===19)assert(q.secondaryOrder?.some((n,i)=>n!==i));
  if(q.slot===20){const most=q.categories[q.counts.indexOf(Math.max(...q.counts))].name,least=q.categories[q.counts.indexOf(Math.min(...q.counts))].name;assert.equal(label,`${most} had ${Math.max(...q.counts)-Math.min(...q.counts)} more answers than ${least}.`);}
 }
}
for(let i=0;i<20;i++){
 const items=STATISTICA_FORMS.map(f=>LEVEL2_STATISTICA_FORMS[f][i]);
 for(const field of ['mode','skillLabel','code','difficulty','display'] as const)assert.equal(new Set(items.map(q=>q[field])).size,1);
 assert.equal(new Set(items.map(q=>q.observations.length)).size,1);
 assert.equal(new Set(items.map(q=>JSON.stringify([...q.counts].sort()))).size,1);
}
console.log(`PASS: ${ids.size} Level 2 items; two curriculum codes, matched demand, four choices, source counts, graph orders, correct/wrong/partial scoring and repairs.`);
