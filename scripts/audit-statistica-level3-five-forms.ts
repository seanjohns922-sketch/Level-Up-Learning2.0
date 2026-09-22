import assert from 'node:assert/strict';
import {STATISTICA_FORMS} from '../data/assessments/revisions/level1StatisticaFiveForms';
import {LEVEL3_STATISTICA_FORMS} from '../data/assessments/revisions/level3StatisticaFiveForms';
import {emptyStatsResponse,statsResponseReady,scoreStatsResponse} from '../lib/statistica-level1-review';
const ids=new Set<string>();
for(const form of STATISTICA_FORMS){
 const bank=LEVEL3_STATISTICA_FORMS[form];assert.equal(bank.length,20);
 assert.equal(Math.max(...bank[18].counts),50);assert.equal(bank[4].observations.length,18);assert.equal(Math.max(...bank[15].counts),30);
 for(const [code,n] of [['AC9M3ST01',7],['AC9M3ST03',7],['AC9M3ST02',6]] as const)assert.equal(bank.filter(q=>q.code===code).length,n);
 for(const q of bank){
  assert(!ids.has(q.id));ids.add(q.id);assert(q.prompt&&q.instruction&&q.week>=1&&q.week<=6);
  assert.equal(new Set(q.categories.map(c=>c.name)).size,q.categories.length);
  assert(q.counts.every(n=>Number.isInteger(n)&&n>=0&&n<=(q.graphMax??12)));
  if(q.numerical)assert.deepEqual(q.categories.map(c=>c.name),['0','1','2','3','4']);
  const blank=emptyStatsResponse(q);assert(!statsResponseReady(q,blank));assert(!scoreStatsResponse(q,blank));
  const correct={...blank,touched:true,...(typeof q.answer==='string'?{choice:q.answer}:{values:[...q.answer]})};
  assert(statsResponseReady(q,correct));assert(scoreStatsResponse(q,correct),q.id);
  const wrong=typeof q.answer==='string'?{...correct,choice:q.options.find(o=>o.id!==q.answer)!.id}:{...correct,values:correct.values.map((n,i)=>i===0?n+1:n)};assert(!scoreStatsResponse(q,wrong));
  if(q.mode==='choice'){assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(o=>o.label)).size,4);assert.equal(q.options.filter(o=>o.id===q.answer).length,1);}
  else if(q.mode==='list'){assert.deepEqual(q.answer,q.observations);assert(!statsResponseReady(q,{...correct,values:correct.values.map((v,i)=>i===0?-1:v)}));}
  else{assert.deepEqual(q.answer,q.counts);assert.deepEqual(q.categories.map((_,i)=>q.observations.filter(v=>v===i).length),q.counts);}
  const label=q.options.find(o=>o.id===q.answer)?.label;
  if(q.slot===4)assert.equal(Number(label),q.counts[2]);
  if(q.slot===7){assert(q.initial);assert.equal(q.initial[2],q.counts[2]+1);assert.equal(q.initial.filter((n,i)=>n!==q.counts[i]).length,1);}
  if([11,15,16].includes(q.slot)){assert.equal(q.graphMax,50);assert.equal(q.graphStep,5);assert.equal(q.responseMax,50);assert(q.counts.every(n=>n%5===0));assert(!statsResponseReady(q,{...correct,values:[51,...correct.values.slice(1)]}));}
  if([4,12,14,18,19,20].includes(q.slot)){assert.equal(Math.max(...q.counts),50);assert.equal(q.graphMax,60);assert.equal(q.graphStep,5);}
  if(q.slot===16){assert.equal(q.counts.filter(n=>n===0).length,1);assert.equal(q.categories.length,5);}
  if(q.slot===18){assert.equal(Number(label),50-20);assert.equal(q.graphStep,5);assert(q.counts.every(n=>n%5===0));}
  if(q.slot===19){const most=q.counts.indexOf(Math.max(...q.counts));assert.equal(label,`The answer ${most} was most common.`);assert(q.counts[0]>0,'Distractor must stay false');}
  if(q.slot===20){const max=Math.max(...q.counts),min=Math.min(...q.counts);assert.equal(label,`${q.categories[q.counts.indexOf(max)].name} received ${max-min} more votes than ${q.categories[q.counts.indexOf(min)].name}.`);}
 }
}
for(let i=0;i<20;i++){
 const items=STATISTICA_FORMS.map(f=>LEVEL3_STATISTICA_FORMS[f][i]);
 for(const field of ['mode','skillLabel','code','difficulty','display'] as const)assert.equal(new Set(items.map(q=>q[field])).size,1);
 assert.equal(new Set(items.map(q=>q.observations.length)).size,1);assert.equal(new Set(items.map(q=>JSON.stringify([...q.counts].sort()))).size,1);
}
console.log(`PASS: ${ids.size} Level 3 items; three curriculum codes, categorical/numerical data, source frequencies, zero values, graph scales, four choices and scoring.`);
