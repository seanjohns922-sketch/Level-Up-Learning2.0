import assert from 'node:assert/strict';
import {STATISTICA_FORMS} from '../data/assessments/revisions/level1StatisticaFiveForms';
import {LEVEL7_STATISTICA_FORMS,mean,median} from '../data/assessments/revisions/level7StatisticaFiveForms';
import {emptyStatsResponse,statsResponseReady,scoreStatsResponse} from '../lib/statistica-level1-review';
const ids=new Set<string>();
for(const form of STATISTICA_FORMS){
 const bank=LEVEL7_STATISTICA_FORMS[form];assert.equal(bank.length,30);
 for(const code of ['AC9M7ST01','AC9M7ST02','AC9M7ST03'])assert.equal(bank.filter(q=>q.code===code).length,10);
 for(const q of bank){
  assert(!ids.has(q.id));ids.add(q.id);assert(q.prompt&&q.instruction);assert.equal(q.categories.length,q.counts.length);
  const blank=emptyStatsResponse(q);assert(!statsResponseReady(q,blank));assert(!scoreStatsResponse(q,blank));
  const correct={...blank,touched:true,...(q.mode==='leaves'?{leaves:q.leafAnswer}:typeof q.answer==='string'?{choice:q.answer}:{values:[...q.answer]})};assert(scoreStatsResponse(q,correct),q.id);
  if(q.mode==='choice'){assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(o=>o.label)).size,4,q.id);assert.equal(q.options.filter(o=>o.id===q.answer).length,1);assert(!scoreStatsResponse(q,{...correct,choice:q.options.find(o=>o.id!==q.answer)!.id}));}
  else if(q.mode==='leaves'){const reconstructed=q.stems!.flatMap((stem,i)=>q.leafAnswer![i].split(' ').map(v=>stem*10+Number(v)));assert.deepEqual(reconstructed,[...q.dataset!].sort((a,b)=>a-b));assert(!scoreStatsResponse(q,{...correct,leaves:['8 4 4 2',...q.leafAnswer!.slice(1)]}));assert(!statsResponseReady(q,{...correct,leaves:['x',...q.leafAnswer!.slice(1)]}));assert(scoreStatsResponse(q,{...correct,leaves:q.leafAnswer!.map(s=>` ${s.replaceAll(' ',', ')} `)}));}
  else{assert(!scoreStatsResponse(q,{...correct,values:correct.values.map((v,i)=>v+(i===0?1:0))}));assert(!statsResponseReady(q,{...correct,values:[-1,...correct.values.slice(1)]}));}
  const answer=q.options.find(o=>o.id===q.answer)?.label??'',a=q.dataset??[],range=(a:number[])=>Math.max(...a)-Math.min(...a);
  if(q.slot===1)assert.equal(Number(answer),mean(a));
  if([2,3,13,24].includes(q.slot))assert(Math.abs(parseFloat(answer)-median(a))<1e-8);
  if(q.slot===4||q.slot===15){const mode=[...new Set(a)].sort((x,y)=>a.filter(v=>v===y).length-a.filter(v=>v===x).length)[0];assert.equal(Number(answer),mode);}
  if(q.slot===5||q.slot===14)assert(Math.abs(parseFloat(answer)-range(a))<1e-8);
  if(q.slot===6)assert.equal(Number(answer),q.counts.reduce((s,n,i)=>s+n*Number(q.categories[i].name),0)/q.counts.reduce((s,n)=>s+n));
  if(q.slot===12)assert.equal(Number(answer),a.length);
  if(q.slot===17||q.slot===25)assert.deepEqual(q.answer,q.categories.map(c=>a.filter(v=>v===Number(c.name)).length));
  if(q.slot===18)assert.equal(Number(answer),Number(q.categories[q.counts.indexOf(Math.max(...q.counts))].name));
  if(q.slot===20){const expand=(c:number[])=>c.flatMap((n,i)=>Array(n).fill(Number(q.categories[i].name)));assert.equal(median(expand(q.counts)),median(expand(q.secondCounts!)));assert(range(expand(q.secondCounts!))>range(expand(q.counts)));}
  if(q.slot===28){const values=q.counts.flatMap((n,i)=>Array(n).fill(Number(q.categories[i].name)));assert.equal(mean(values),median(values));assert.equal(mean(values),Number(q.categories[2].name));}
  if(q.slot===30){assert(answer.includes(`Mean ${mean(a)} m`));assert(answer.includes(`median ${median(a)} m`));assert(answer.includes(`range ${range(a)} m`));}
 }
}
for(let i=0;i<30;i++)for(const field of ['mode','skillLabel','code','difficulty','source'] as const)assert.equal(new Set(STATISTICA_FORMS.map(f=>LEVEL7_STATISTICA_FORMS[f][i][field])).size,1);
console.log(`PASS: ${ids.size} Level 7 items; 30 per form, three curriculum codes, four unique options, means/medians/ranges, stem construction, dot plots and scoring.`);
