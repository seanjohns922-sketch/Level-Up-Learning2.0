import assert from 'node:assert/strict';
import {STATISTICA_FORMS} from '../data/assessments/revisions/level1StatisticaFiveForms';
import {LEVEL6_STATISTICA_FORMS} from '../data/assessments/revisions/level6StatisticaFiveForms';
import {emptyStatsResponse,statsResponseReady,scoreStatsResponse} from '../lib/statistica-level1-review';
const ids=new Set<string>();
for(const form of STATISTICA_FORMS){
 const bank=LEVEL6_STATISTICA_FORMS[form];assert.equal(bank.length,20);
 for(const [code,n] of [['AC9M6ST01',7],['AC9M6ST02',7],['AC9M6ST03',6]] as const)assert.equal(bank.filter(q=>q.code===code).length,n);
 for(const q of bank){
  assert(!ids.has(q.id));ids.add(q.id);assert(q.prompt&&q.instruction);assert.equal(q.categories.length,q.counts.length);
  const blank=emptyStatsResponse(q);assert(!statsResponseReady(q,blank));assert(!scoreStatsResponse(q,blank));
  const correct={...blank,touched:true,...(typeof q.answer==='string'?{choice:q.answer}:{values:[...q.answer]})};assert(scoreStatsResponse(q,correct),q.id);
  if(q.mode==='choice'){assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(o=>o.label)).size,4,q.id);assert.equal(q.options.filter(o=>o.id===q.answer).length,1);assert(!scoreStatsResponse(q,{...correct,choice:q.options.find(o=>o.id!==q.answer)!.id}));}
  else{assert(!scoreStatsResponse(q,{...correct,values:correct.values.map((v,i)=>v+(i===0?1:0))}));assert(!statsResponseReady(q,{...correct,values:[-1,...correct.values.slice(1)]}));assert(!statsResponseReady(q,{...correct,values:[351,...correct.values.slice(1)]}));}
  const label=q.options.find(o=>o.id===q.answer)?.label;
  const range=(counts:number[])=>{const values=q.categories.filter((_,i)=>counts[i]>0).map(c=>Number(c.name));return Math.max(...values)-Math.min(...values);};
  if(q.source==='records'){assert.equal(q.recordIds!.length,q.observations.length);assert(q.observations.every(v=>v>=0&&v<q.categories.length));assert.deepEqual(q.counts,q.categories.map((_,i)=>q.observations.filter(v=>v===i).length));}
  if(q.source==='graph'||q.source==='comparison'){for(const counts of [q.counts,...(q.secondCounts?[q.secondCounts]:[])])assert(counts.every(n=>n>=(q.graphMin??0)&&n<=q.graphMax!));}
  if(q.slot===3)assert.equal(Number(label),range(q.counts));
  if(q.slot===4){const values=q.categories.map(c=>parseFloat(c.name));assert.equal(parseFloat(label!),Number((Math.max(...values)-Math.min(...values)).toFixed(2)));}
  if(q.slot===5){assert(label!.includes(q.categories[q.counts.indexOf(250)].name));assert(label!.includes(q.categories[q.secondCounts!.indexOf(250)].name));}
  if(q.slot===6){assert.equal(range(q.counts),4);assert.equal(range(q.secondCounts!),2);}
  if(q.slot===7){assert.equal(range(q.counts),range(q.secondCounts!));assert.equal(q.counts.reduce((a,b)=>a+b),500);assert.equal(q.secondCounts!.reduce((a,b)=>a+b),500);}
  if([8,9,10].includes(q.slot)){assert(q.graphMin!>0);assert.equal(q.counts[1]-q.counts[0],40);assert(q.counts[1]<q.counts[0]*2);assert((q.counts[1]-q.graphMin!)/(q.counts[0]-q.graphMin!)>2);}
  if(q.slot===9)assert.equal(Number(label),q.counts[1]-q.counts[0]);
  if(q.slot===13){assert(q.linePoints!.every(p=>p.value<=q.graphMax!));assert(q.linePoints![1].value<q.linePoints![0].value);}
  if(q.slot===17){const v=q.categories.map(c=>parseFloat(c.name)*(c.name.endsWith(' m')?100:1));assert(Math.abs(Math.max(...v)-Math.min(...v)-parseFloat(label!))<1e-8);}
  if(q.slot===18){assert.deepEqual(q.answer,q.counts);assert.equal(Math.max(...q.counts),300);}
  if(q.slot===19){assert.equal(range(q.counts),20);assert.equal(range(q.secondCounts!),40);}
  if(q.slot===20||q.slot===14){assert.equal(q.counts.reduce((a,b)=>a+b),750);assert(Math.max(...q.counts)<375);}
 }
}
for(let i=0;i<20;i++)for(const field of ['mode','skillLabel','code','difficulty','source'] as const)assert.equal(new Set(STATISTICA_FORMS.map(f=>LEVEL6_STATISTICA_FORMS[f][i][field])).size,1);
console.log(`PASS: ${ids.size} Level 6 items; three curriculum codes, matched forms, four unique options, data-value ranges, media distortions, records and scoring.`);
