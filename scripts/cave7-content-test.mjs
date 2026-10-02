import assert from 'node:assert/strict';
import {loadCave7} from './cave7-loader.mjs';
const {CAVE7_GENERATORS,cave7Quiz}=loadCave7('data/activities/cave7/questions.ts');
const {CAVE7_CURRICULA,NEW_CAVE7_PROGRAMS}=loadCave7('data/activities/cave7/curriculum.ts');
const {scalar}=loadCave7('data/activities/cave7/shared.ts');
const nums=s=>(s.match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
const mean=a=>a.reduce((s,n)=>s+n,0)/a.length;
const med=a=>{a=[...a].sort((a,b)=>a-b);const i=a.length>>1;return a.length%2?a[i]:(a[i-1]+a[i])/2;};
function evaluate(text,vars={}){text=text.replaceAll('−','-').replaceAll('×','*').replaceAll('÷','/');for(const [name,n] of Object.entries(vars))text=text.replaceAll(name,`(${n})`);text=text.replace(/(\d|\))\(/g,'$1*(');assert.match(text,/^[\d\s.+*/()\-]+$/);return Function(`"use strict";return (${text})`)();}
function verify(q){
 assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.options.includes(q.answer));assert.equal(q.steps.length,3);assert.ok(q.explanation);
 const {realm,skillKey:key,cave7Visual:v}=q,A=q.tier==='apply_create',R=q.tier==='reasoning',n=nums(q.prompt),first=q.answer.split(': ')[0],value=scalar(first);let expected;
 if(realm==='pattern'){
  if([10,11,13,14,15,16].includes(key)){const [left,right]=v.formula.split('=');assert.equal(evaluate(left,{x:value}),evaluate(right,{x:value}));}
  if(key===2){const [coef,constant]=nums(v.formula),input=n[0]+(A?n[1]:0);expected=coef*input+constant;}
  if(key===3)expected=n[0]*(n[1]+(A?n[3]:0))+n[2];
  if([4,5,6,7,9,23,27,29].includes(key)){
   const optionValue=(s,z)=>evaluate(s.includes('=')?s.split('=')[1]:s,{n:z,x:z,p:20});
   for(const z of [1,3,7]){let y;if(key===4)y=n[0]*z+(A?-n[1]:n[1]);if(key===5)y=n[1]*(z+(A?1:0))+n[0];if(key===6)y=2*z+2*n[0];if(key===7)y=n[1]*(z+n[0]);if(key===9)y=(z+(A?2:0))*(20-n[0]);if(key===23||key===27){const pairs=v.rows.map(r=>r.map(Number));const slope=(pairs[1][1]-pairs[0][1])/(pairs[1][0]-pairs[0][0]);y=pairs[0][1]+slope*(z-pairs[0][0]);}if(key===29){const pairs=v.points;y=pairs[0][1]+(pairs[1][1]-pairs[0][1])*z;}assert.equal(optionValue(q.answer,z),y,JSON.stringify(q));}
  }
  if(key===8){const [left,right]=v.formula.split(';');expected=evaluate(left.split('=')[1],{n:n[0]})-evaluate(right.split('=')[1],{n:n[0]});}
  if(key===17)expected=(n[2]-n[1])/n[0];
  if(key===19)expected=v.points.find(p=>p[0]===n[0])[1];
  if(key===21&&value!==null)expected=Math.max(...v.points.slice(1).map((p,i)=>p[1]-v.points[i][1]));
  if(key===22)expected=n[0]*n[2]+n[1];
  if(key===24)assert.equal(evaluate(v.formula.split('=')[1],{n:value}),n[0]);
  if(key===25)expected=evaluate(v.formula.split('=')[1],{x:n[0]});
  if(key===26)assert.equal(evaluate(v.formula.split('=')[1],{x:value}),n[0]);
  if(key===28){const pair=nums(first);assert.equal(pair[0],n[0]);assert.equal(pair[1],evaluate(v.formula.split('=')[1],{x:n[0]}));}
  if(key===30)expected=evaluate(v.formula.split('=')[1],{n:n[0]});
  if(key===31)expected=nums(v.meaning)[0]*(n[1]-n[0]);
  if(key===32)expected=n[0]*n[1];
  if(key===33)expected=nums(v.meaning)[1]/n[0];
  if(key===34){const [left,right]=v.formula.split(';');expected=evaluate(right.split('=')[1],{n:n[0]})-evaluate(left.split('=')[1],{n:n[0]});}
  if(key===35){const [l,w]=nums(v.meaning);expected=n[0]/(l*w);}
  if(key===36){const [coef]=nums(v.formula);expected=coef*n[0];}
 }
 if(realm==='statistics'){
  const observations=v?.kind==='table'&&v.headers[0]==='Observation'?v.rows.map(r=>Number(r[1])):null;
  if(key===4)expected=mean(observations);
  if(key===5)expected=5*n[0]-observations.reduce((s,n)=>s+n,0);
  if(key===6){const rows=v.rows.map(r=>r.map(Number));expected=rows.reduce((s,[x,f])=>s+x*f,0)/rows.reduce((s,[,f])=>s+f,0);}
  if(key===7||key===8)expected=med(observations);
  if(key===10)expected=Math.max(...observations)-Math.min(...observations);
  if(key===11)expected=mean([...observations,n[0]])-mean(observations);
  if(key===12){const sorted=[...observations].sort((a,b)=>a-b);sorted[sorted.length-1]=n[1];expected=med(sorted);}
  if(key===16){const row=v.rows[1];expected=Number(row[0])*10+2;}
  if(key===17){const leaves=observations.map(n=>n%10).sort((a,b)=>a-b).join(' ');assert.equal(q.answer,leaves);}
  if(key===18){const values=v.rows.flatMap(([stem,leaves])=>leaves.split(' ').map(l=>Number(stem)*10+Number(l)));expected=A?Math.max(...values)-Math.min(...values):med(values);}
  if(key===19)expected=observations.filter(x=>x===n[0]).length;
  if(key===20)expected=v.counts.reduce((s,c,i)=>s+(!A||v.values[i]>n[0]?c:0),0);
  if(key===28)expected=A?Math.max(...observations)-Math.min(...observations):mean(observations);
 }
 if(realm==='chance'){
  const wedges=v?.kind==='chance'?v.apparatus.wedges:null,red=wedges?.filter(c=>c==='#e5484d').length;
  if(key===2)expected=n[1]-n[2]+(A?1:0);
  if(key===4||key===11)expected=red/wedges.length;
  if(key===6)expected=1-red/wedges.length;
  if(key===7)expected=Number(v.rows[0][0])/Number(v.rows[0][1]);
  if(key===8)expected=1-Number(v.rows[0][1])-Number(v.rows[1][1]);
  if(key===10)expected=n[0]*red/wedges.length;
  if(key===12)expected=Number(v.rows[0][1])/Number(v.rows[0][0]);
  if(key===13)expected=v.rows.reduce((s,r)=>s+Number(r[1]),0);
  if(key===14)expected=Number(v.rows[0][0])/Number(v.rows[0][1]);
  if(key===15)expected=Math.abs(n[1]-n[0]*red/wedges.length);
  if(key===17)expected=n[2]/n[1];
  if(key===18)expected=Number(v.rows[0][0])/(Number(v.rows[0][0])+Number(v.rows[0][1]));
  if(key===20){const [a,b]=v.rows;assert.ok(Math.abs(Number(b[1])/Number(b[2])-.5)<Math.abs(Number(a[1])/Number(a[2])-.5));}
  // Fractions and decimals that mean the same probability cannot both be choices.
  const scalars=q.options.map(scalar).filter(n=>n!==null);assert.equal(new Set(scalars.map(n=>n.toFixed(8))).size,scalars.length);
 }
 if(expected!==undefined)assert.ok(value!==null&&Math.abs(value-expected)<.00011,JSON.stringify({key,expected,q}));
}
let count=0,quizzes=0;
for(const [realm,weeks] of Object.entries(CAVE7_CURRICULA)){
 assert.equal(weeks.length,{pattern:12,statistics:10,chance:8}[realm]);
 for(let w=1;w<=weeks.length;w++)for(let l=1;l<=3;l++){assert.equal(NEW_CAVE7_PROGRAMS[realm][w-1].lessons.length,3);for(let seed=1;seed<=200;seed++)for(const role of ['fast_thinking','reasoning','apply_create']){verify(CAVE7_GENERATORS[realm](w,l,seed*7919,role));count++;}}
 for(let w=1;w<weeks.length;w++){const qs=cave7Quiz(realm,w);assert.equal(qs.length,15);for(let l=1;l<=3;l++){const rows=qs.filter(q=>q.lessonTag===l);assert.equal(rows.length,5);assert.equal(rows.filter(q=>q.tier==='reasoning').length,1);assert.equal(rows.filter(q=>q.tier==='apply_create').length,2);assert.equal(new Set(rows.map(q=>q.prompt+JSON.stringify(q.cave7Visual)+q.options.slice().sort().join('|'))).size,5);}qs.forEach(verify);quizzes+=qs.length;}
 assert.throws(()=>cave7Quiz(realm,weeks.length));
}
console.log(`PASS ${count} generated Algebra/Statistics/Probability questions and ${quizzes} quiz items: independent calculations, balanced weekly coverage and inequivalent numeric choices.`);
