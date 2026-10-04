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
  // Independent Algebra checks from the student-facing prompt and visual only.
  const N=t=>(t.replaceAll('−','-').match(/-?\d+(?:\.\d+)?/g)||[]).map(Number),P=N(q.prompt),Fm=v?.kind==='formula'?N(v.formula):[],M=v?.kind==='formula'?N(v.meaning):[];
  const rhs=t=>t.includes('=')?t.slice(t.indexOf('=')+1):t;
  const sameExpr=(fn,vars=['n'])=>{for(const z of [1,3,7]){const env=Object.fromEntries(vars.map((name,i)=>[name,i?20:z]));assert.ok(Math.abs(evaluate(rhs(q.answer),env)-fn(z,20))<1e-9,JSON.stringify({key,q}));}};
  const point=()=>N(q.answer);const at=x=>v.points.find(p=>p[0]===x)[1];const F=!A&&!R;
  const pick1=(cond,yes,no)=>assert.ok(q.answer.startsWith(cond?yes:no),JSON.stringify({key,q}));
  switch(key){
   case 1:if(F)expected=q.prompt.includes('fixed amount')?Fm[1]:Fm[0];else if(R){const sym=q.prompt.match(/what does (\w) represent/)[1];assert.ok(q.answer.includes({n:'tickets',h:'hours',g:'goals',k:'kilometres',d:'gigabytes'}[sym]));}else sameExpr(z=>P[0]*z+P[1]);break;
   case 2:if(F)expected=Fm[0]*P[0]+Fm[1];else if(R)expected=Fm[0]*P[0]+Fm[1];else expected=Fm[0]*P[0]+Fm[1];break;
   case 3:if(!A)expected=P[0]*P[1]+P[2];else if(v.formula.startsWith('d'))expected=P[0]/P[1];else expected=P[0]+1.5*P[1]*P[2];break;
   case 4:if(F&&q.prompt.includes('product')){const k=(q.prompt.split('Write')[1].match(/\bn\b/g)||[]).length;sameExpr(z=>k*z);}else if(F)sameExpr(z=>P[0]*z+P[1]);else if(R)sameExpr(z=>P[1]*z-P[0]);else sameExpr(z=>P[1]*(2*z+P[0]));break;
   case 5:if(F)sameExpr(z=>P[1]*z+P[0]);else if(R)expected=P[1]*P[0]-P[0];else sameExpr(z=>P[1]*z+P[0],['w']);break;
   case 6:if(F)sameExpr(z=>2*z+2*P[0]);else if(R)expected=P[2]+P[0];else if(q.prompt.includes('isosceles'))sameExpr(z=>2*z+P[0]);else sameExpr(z=>4*(z+P[0]));break;
   case 7:if(R)expected=(P[0]-1)*P[1];else sameExpr(z=>(F?P[1]:P[0])*(z+(F?P[0]:P[1])));break;
   case 8:if(F)expected=(Fm[0]*(P[0]+Fm[1]))-(Fm[2]*P[0]+Fm[3]);else if(R){const [left,right]=q.prompt.match(/Are (.*) and (.*) always equal/).slice(1);const eq=[1,3].every(z=>evaluate(left,{n:z})===evaluate(right,{n:z}));pick1(eq,'Yes','No');}else expected=P[0]*P[1];break;
   case 9:if(R)expected=(P[0]-1)*P[2];else sameExpr((z,p)=>(z+(A?2:0))*(p-P[0]),['n','p']);break;
   case 10:case 11:case 13:if(F){assert.equal(evaluate(v.left,{x:value}),Number(v.right));}else if(key===10)expected=P[1]-P[0];else if(key===11)expected=R?P[1]/P[0]:P[0]*P[1];else expected=(P[2]-P[1])/P[0];break;
   case 12:if(F)expected=P[1]*P[0]+P[2];else if(R)pick1(P[1]*P[0]+P[2]===P[3],'Yes','No');else expected=(P[2]-P[1])/P[0];break;
   case 14:{const G=F?Fm:P;expected=G[2]/G[0]-G[1];break;}
   case 15:{const G=F?Fm:P;expected=G[0]*(G[2]-G[1]);break;}
   case 16:if(F)expected=(P[1]-2*P[0])/2;else if(R)assert.equal(q.answer,`2x + ${2*P[0]} = ${P[1]}`);else expected=(P[1]-P[0])/2;break;
   case 17:if(F)expected=(P[2]-P[1])/P[0];else if(R)assert.equal(q.answer,`${P[0]}p + ${P[1]} = ${P[2]}`);else expected=(P[2]-P[0])/P[1];break;
   case 18:if(F)expected=(Fm[2]-Fm[1])/Fm[0];else if(R)assert.ok(q.answer.startsWith(`Subtract ${Fm[1]} from ${Fm[2]} first`));else expected=P[1]*P[0]+P[2]-P[3];break;
   case 19:if(F)expected=at(P[0]);else if(R)expected=v.points.find(p=>p[1]===P[0])[0];else expected=at(P[1])-at(P[0]);break;
   case 20:{const moves=v.points.slice(1).map((p,i)=>Math.sign(p[1]-v.points[i][1])),word=m=>m>0?'increases':m===0?'stays the same':'decreases';
    if(F){const i=v.points.findIndex(p=>p[0]===P[0]);assert.equal(q.answer,`It ${word(moves[i])}.`);}
    else if(R)assert.equal(q.answer,moves.map((m,i)=>(i?'then ':'')+word(m)).join(', ').replace(/^./,c=>c.toUpperCase())+'.');
    else expected=moves.filter(m=>m===0).length*2;break;}
   case 21:if(F)expected=Math.max(...v.points.slice(1).map((p,i)=>p[1]-v.points[i][1]));else if(R)assert.ok(q.answer.startsWith('Only an estimate'));else expected=(at(P[1])-at(P[0]))/(P[1]-P[0]);break;
   case 22:if(A)expected=P[1]+P[2]*(P[3]-1);else expected=v.group*P.at(-1)+v.fixed;break;
   case 23:if(F)sameExpr(z=>v.group*z+v.fixed);else if(R)assert.ok(q.answer.startsWith('The tiles in the separate column'));else sameExpr(z=>P[2]*z+P[1]-P[2]);break;
   case 24:if(F)expected=(P[0]-Fm[1])/Fm[0];else if(R)pick1((P[0]-Fm[1])%Fm[0]===0,'Yes','No');else expected=Math.floor((P[0]-Fm[1])/Fm[0]);break;
   case 25:if(R)expected=2*Fm[0]+Fm[1];else expected=Fm[0]*P[0]+Fm[1];break;
   case 26:if(A)expected=(P[2]-P[0])/P[1];else expected=(P[0]-Fm[1])/Fm[0];break;
   case 27:{const rows=v.rows.map(r=>r.map(Number)),slope=(rows[1][1]-rows[0][1])/(rows[1][0]-rows[0][0]),start=rows[0][1]-slope*rows[0][0];if(R)expected=slope*10+start;else{for(const [x,y] of rows)assert.equal(evaluate(rhs(q.answer),{x}),y);}break;}
   case 28:{const [px,py]=point(),[a,b]=Fm;assert.equal(py,a*px+b);if(F)assert.equal(px,P[2]);if(R)assert.equal(px,P[0]);if(A)assert.equal(py,P[2]);break;}
   case 29:{const [p0,p1]=v.points,slope=p1[1]-p0[1],start=p0[1];if(F){for(const [x,y] of v.points)assert.equal(evaluate(rhs(q.answer),{x}),y);}else if(R)pick1(slope*P[0]+start===P[1],'Yes','No');else expected=slope*10+start;break;}
   case 30:if(F)expected=Fm[0]*P[0]+Fm[1];else if(R)assert.ok(q.answer.startsWith('A shop may give a bulk discount'));else expected=Math.floor((P[0]-Fm[1])/Fm[0]);break;
   case 31:{const rows=v.rows.map(r=>r.map(Number)),speed=rows[0][1]/rows[0][0];if(F)expected=rows[1][1]-rows[0][1];else if(R)expected=speed;else expected=speed*P[0];break;}
   case 32:if(F)expected=P[0]*P[1];else if(R)assert.equal(q.answer,`The volume is multiplied by ${P[0]*P[0]}.`);else expected=M[0]*M[1]*M[2]*P[0]*P[1];break;
   case 33:if(F)expected=M[1]/P[0];else if(R)assert.equal(q.answer,`1/${P[0]}`);else expected=P[0]*P[1]/P[2];break;
   case 34:{const [a,fa,b,e]=Fm,meet=(fa-e)/(b-a);if(F)expected=Math.abs((a*P[0]+fa)-(b*P[0]+e));else if(R)expected=meet;else expected=meet+1;break;}
   case 35:if(A)expected=Math.floor((P[0]-Fm[1])/Fm[0]);else expected=P[0]/(M[0]*M[1]);break;
   case 36:if(F)expected=Fm[0]*P[0];else if(R)assert.ok(q.answer.startsWith('It is added once'));else expected=Fm[0]*P[0];break;
  }
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
// Algebra regression guards: separate reasoning tasks, mostly typed answers, varied answers,
// and graph-reading questions that do not print the values on the points.
{
 const {level7Answer}=loadCave7('lib/level7-answer.ts');const gen=CAVE7_GENERATORS.pattern;let typed=0,total=0;
 for(let w=1;w<=12;w++)for(let l=1;l<=3;l++){
  const answers={fast_thinking:new Set(),apply_create:new Set()};
  for(let seed=1;seed<=100;seed++){
   const f=gen(w,l,seed*7919,'fast_thinking'),r=gen(w,l,seed*7919,'reasoning'),a=gen(w,l,seed*7919,'apply_create');
   assert.ok(!(f.prompt===r.prompt&&f.answer===r.answer),`Algebra W${w}L${l}: reasoning repeats fluency`);
   for(const q of [f,r,a]){total++;if(level7Answer(q))typed++;if(w===7&&q.cave7Visual?.kind==='plot')assert.ok(!q.cave7Visual.showValues,'Week 7 graphs must not label point values');}
   answers.fast_thinking.add(f.answer);answers.apply_create.add(a.answer);
  }
  for(const [role,set] of Object.entries(answers))if(!(w===7&&l===2&&role==='fast_thinking'))assert.ok(set.size>=3,`Algebra W${w}L${l} ${role}: only ${set.size} distinct answers`);
 }
 assert.ok(typed/total>=0.8,`Algebra typed share ${typed}/${total}`);
 console.log(`PASS Algebra: reasoning distinct from fluency, ${Math.round(typed/total*100)}% typed answers, varied answers, unlabelled graph points.`);
}
console.log(`PASS ${count} generated Algebra/Statistics/Probability questions and ${quizzes} quiz items: independent calculations, balanced weekly coverage and inequivalent numeric choices.`);
