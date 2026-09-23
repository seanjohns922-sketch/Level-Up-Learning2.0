import assert from 'node:assert/strict';
import {STATISTICA_FORMS} from '../data/assessments/revisions/level1StatisticaFiveForms';
import {LEVEL8_STATISTICA_FORMS} from '../data/assessments/revisions/level8StatisticaFiveForms';
import {emptyStatsResponse,statsResponseReady,scoreStatsResponse} from '../lib/statistica-level1-review';
const ids=new Set<string>(),sum=(v:number[])=>v.reduce((s,n)=>s+n,0),mean=(v:number[])=>sum(v)/v.length,range=(v:number[])=>Math.max(...v)-Math.min(...v);
for(const form of STATISTICA_FORMS){
 const bank=LEVEL8_STATISTICA_FORMS[form];assert.equal(bank.length,30);
 for(const [code,n] of [['AC9M8ST01',7],['AC9M8ST02',7],['AC9M8ST03',8],['AC9M8ST04',8]] as const)assert.equal(bank.filter(q=>q.code===code).length,n);
 for(const q of bank){
  assert(!ids.has(q.id));ids.add(q.id);assert(q.prompt&&q.instruction);assert.equal(q.categories.length,q.counts.length);
  const blank=emptyStatsResponse(q);assert(!statsResponseReady(q,blank));assert(!scoreStatsResponse(q,blank));
  const correct={...blank,touched:true,...(typeof q.answer==='string'?{choice:q.answer}:{values:[...q.answer]})};assert(scoreStatsResponse(q,correct),q.id);
  if(q.mode==='choice'){assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(o=>o.label)).size,4,q.id);assert.equal(q.options.filter(o=>o.id===q.answer).length,1);assert(!scoreStatsResponse(q,{...correct,choice:q.options.find(o=>o.id!==q.answer)!.id}));}
  else{assert(!scoreStatsResponse(q,{...correct,values:correct.values.map((v,i)=>v+(i===0?1:0))}));assert(!statsResponseReady(q,{...correct,values:[-1,...correct.values.slice(1)]}));}
  const answer=q.options.find(o=>o.id===q.answer)?.label??'';
  if(q.sampleSetup){assert.equal(new Set(q.sampleSetup.selected).size,q.sampleSetup.selected.length);assert(q.sampleSetup.selected.every(i=>i>=0&&i<q.sampleSetup!.population));assert.equal(q.sampleSetup.population,60);}
  if(q.source==='graph'||q.source==='comparison')for(const values of [q.counts,...(q.secondCounts?[q.secondCounts]:[])])assert(values.every(v=>v>=0&&v<=q.graphMax!));
  if(q.slot===1)assert.equal(q.sampleSetup!.selected.length,60);
  if(q.slot===10)assert.equal(Number(answer),Number(q.categories[q.counts.indexOf(Math.max(...q.counts))].name));
  if(q.slot===11){const values=q.counts.flatMap((n,i)=>Array(n).fill(Number(q.categories[i].name)));assert.equal(Number(answer),(values[99]+values[100])/2);}
  if(q.slot===12)assert.equal(Number(answer),q.counts.reduce((s,n,i)=>s+n*Number(q.categories[i].name),0)/sum(q.counts));
  if(q.slot===15){assert.equal(sum(q.counts),50);assert.equal(sum(q.secondCounts!),50);assert(Math.abs(parseFloat(answer)-(q.secondCounts![0]-q.counts[0])*2)<1e-8);}
  if(q.slot===16)assert.equal(parseFloat(answer),range(q.counts));
  if(q.slot===17)assert.equal(Number(answer),q.counts[0]/sum(q.counts)*1000);
  if(q.slot===18){assert.equal(sum(q.counts),50);assert.equal(sum(q.secondCounts!),50);}
  if(q.slot===19){assert(range(q.secondCounts!)<range(q.counts));assert(q.counts.every(v=>Number.isInteger(v/5)));assert(q.secondCounts!.every(v=>Number.isInteger(v*2)));}
  if(q.slot===20)assert.equal(parseFloat(answer),mean(q.dataset!)-mean(q.dataset!.slice(0,4)));
  if(q.slot===22||q.slot===25)assert.equal(q.counts[0]/(q.counts[0]+q.counts[1])*100,60);
  if(q.slot===26)assert.deepEqual(q.answer,q.counts);
  if(q.slot===27){assert.equal(sum(q.counts),300);assert.equal(q.counts.indexOf(Math.max(...q.counts)),2);assert(Math.max(...q.counts)<150);}
  if(q.slot===28)assert(answer.includes(`About ${mean(q.counts)*10} supporters`));
  if(q.slot===30){assert.equal(q.dataset!.length,6);assert.equal(q.sampleSetup!.selected.length,6);assert(answer.includes(`About ${mean(q.dataset!)*60} plants`));}
 }
}
for(let i=0;i<30;i++)for(const field of ['mode','skillLabel','code','difficulty','source'] as const)assert.equal(new Set(STATISTICA_FORMS.map(f=>LEVEL8_STATISTICA_FORMS[f][i][field])).size,1);
console.log(`PASS: ${ids.size} Level 8 items, four curriculum codes, four options, sampling frames, proportions, estimates, variation and scoring.`);
