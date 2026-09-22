import assert from 'node:assert/strict';
import {STATISTICA_FORMS} from '../data/assessments/revisions/level1StatisticaFiveForms';
import {LEVEL4_STATISTICA_FORMS} from '../data/assessments/revisions/level4StatisticaFiveForms';
import {emptyStatsResponse,statsResponseReady,scoreStatsResponse} from '../lib/statistica-level1-review';
const ids=new Set<string>();
for(const form of STATISTICA_FORMS){
 const bank=LEVEL4_STATISTICA_FORMS[form];assert.equal(bank.length,20);
 for(const [code,n] of [['AC9M4ST01',7],['AC9M4ST02',7],['AC9M4ST03',6]] as const)assert.equal(bank.filter(q=>q.code===code).length,n);
 for(const q of bank){
  assert(!ids.has(q.id));ids.add(q.id);assert(q.prompt&&q.instruction&&q.week>=1&&q.week<=6);
  assert.equal(new Set(q.categories.map(c=>c.name)).size,q.categories.length);
  assert.equal(q.categories.length,q.counts.length);
  const blank=emptyStatsResponse(q);assert(!statsResponseReady(q,blank));assert(!scoreStatsResponse(q,blank));
  const correct={...blank,touched:true,...(typeof q.answer==='string'?{choice:q.answer}:{values:[...q.answer]})};assert(scoreStatsResponse(q,correct),q.id);
  if(q.mode==='choice'){assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(o=>o.label)).size,4);assert.equal(q.options.filter(o=>o.id===q.answer).length,1);assert(!scoreStatsResponse(q,{...correct,choice:q.options.find(o=>o.id!==q.answer)!.id}));}
  else{assert.deepEqual(q.answer,q.counts);assert(!statsResponseReady(q,{...correct,values:[-1,...correct.values.slice(1)]}));assert(!statsResponseReady(q,{...correct,values:[(q.responseMax??20)+1,...correct.values.slice(1)]}));assert(!statsResponseReady(q,{...correct,values:correct.values.slice(1)}));assert(!scoreStatsResponse(q,{...correct,values:correct.values.map((n,i)=>n+(i===0?1:0))}));}
  if(q.source==='responses'){assert.equal(q.observations.length,20);assert.deepEqual(q.categories.map((_,i)=>q.observations.filter(v=>v===i).length),q.counts);}
  if(q.source==='comparison'){assert.equal(q.counts.reduce((a,b)=>a+b),60);assert.equal(q.secondCounts!.reduce((a,b)=>a+b),60);assert.equal(q.counts.indexOf(Math.max(...q.counts)),2);assert.deepEqual(q.categories.map(c=>c.name),['0','1','2','3','4']);}
  if(q.source==='pictograph'||q.display==='pictograph'&&q.mode==='counts')assert(q.counts.every(n=>Number.isInteger(n/(q.keyUnits!/(q.allowHalf?2:1)))));
  if(q.graphKind==='columns'||q.display==='columns'){assert.equal(q.graphMax,100);assert.equal(q.graphStep,10);assert.equal(q.graphMinorStep,5);assert.equal(Math.max(...q.counts),q.slot===3?80:95);}
  const label=q.options.find(o=>o.id===q.answer)?.label;
  if(q.slot===4){assert.equal(label,'65');assert(q.allowHalf);assert.equal(q.keyUnits,10);assert(q.counts.includes(65));}
  if([2,6,18].includes(q.slot)){assert.equal(q.keyUnits,10);assert(Math.max(...q.counts)>=60&&Math.max(...q.counts)<=80);}
  if(q.slot===7)assert.equal(Math.max(...q.counts),100);
  if(q.slot===5)assert.equal(Number(label),Math.max(...q.counts));
  if(q.slot===6){assert.equal(q.initial!.filter((n,i)=>n!==q.counts[i]).length,1);assert.equal(q.initial![1]-q.counts[1],q.keyUnits);}
  if(q.slot===7||q.slot===19)assert.equal(Number(label),Math.max(...q.counts)-Math.min(...q.counts));
  if(q.slot===13)assert(q.secondCounts![0]+q.secondCounts![4]>q.counts[0]+q.counts[4]);
 }
}
for(let i=0;i<20;i++)for(const field of ['mode','skillLabel','code','difficulty','display','graphMax','graphStep'] as const)assert.equal(new Set(STATISTICA_FORMS.map(f=>LEVEL4_STATISTICA_FORMS[f][i][field])).size,1);
console.log(`PASS: ${ids.size} Level 4 items; all three codes, matched demand, 20-observation recording, reading frequencies to 100 and construction to 80, half symbols, scale midpoints, distribution comparisons and scoring.`);
