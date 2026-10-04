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
  // Second application forms, recognised by their wording.
  const pr=q.prompt;let palt=A;
  if(!A){}
  else if(/Plan B charges \$\d+ per ride with no entry fee/.test(pr))sameExpr(z=>P[2]*z);
  else if(/How much more does a \d+ km trip cost than/.test(pr))expected=Fm[0]*(P[0]-P[1]);
  else if(/gives away \d+ muffins/.test(pr))sameExpr(z=>P[0]*z-P[1]);
  else if(/loses \d+ L each hour/.test(pr))sameExpr(z=>P[0]-P[1]*z,['h']);
  else if(/has width \d+ cm and length \(n \+ \d+\) cm/.test(pr))sameExpr(z=>P[0]*(z+P[1]));
  else if(/= \d+\(n \+ □\)/.test(pr))expected=P[1]/P[0];
  else if(/2 child tickets that are \$\d+ cheaper/.test(pr))sameExpr((z,pp)=>z*pp+2*(pp-P[1]),['n','p']);
  else if(/After spending \$\d+, Mia has/.test(pr))expected=P[0]+P[1];
  else if(/identical boxes weigh/.test(pr))expected=P[1]/P[0];
  else if(/value of n that makes/.test(pr))expected=P[2]/P[0]-P[1];
  else if(/call-out fee plus/.test(pr))expected=(P[2]-P[0])/P[1];
  else if(/length \(x \+ \d+\) cm\. Its area/.test(pr))expected=P[2]/P[0]-P[1];
  else if(/Think of a number, add \d+, then multiply by \d+\. The result/.test(pr))expected=P[2]/P[1]-P[0];
  else if(/burns down \d+ cm each hour/.test(pr))expected=(P[0]-P[2])/P[1];
  else if(/What does each side equal/.test(pr)){const [xv,k1,c1,k2,c2]=P;assert.equal(k1*xv+c1,k2*xv+c2);expected=k1*xv+c1;}
  else if(/Stages 1, 2 and 3 are each built separately/.test(pr))expected=6*Fm[0]+3*Fm[1];
  else if(/which input x gives the output y = /.test(pr))expected=(P.at(-1)-Fm[1])/Fm[0];
  else if(/A function machine multiplies by/.test(pr))expected=(P[2]+P[1])/P[0];
  else if(/outputs go down as x goes up/.test(pr)){for(const [xv,yv] of v.rows.map(r=>r.map(Number)))assert.ok(Math.abs(evaluate(rhs(q.answer),{x:xv})-yv)<1e-9,JSON.stringify(q));}
  else if(/The point \(\d+, k\) lies on/.test(pr))expected=Fm[0]*P[0]+Fm[1];
  else if(/A straight line passes through/.test(pr)){const slope=(P[3]-P[1])/(P[2]-P[0]);expected=P[1]+slope*P[4];}
  else if(/Notebooks now cost \$1 more/.test(pr))expected=(Fm[0]+P[0])*P[1]+Fm[1];
  else if(/travels at a constant \d+ km\/h\. How many hours/.test(pr))expected=P[1]/P[0];
  else if(/Every edge is doubled/.test(pr))expected=8*P[0]*P[1]*P[2];
  else if(/Its height is doubled\. What length/.test(pr))expected=P[0]/2;
  else palt=false;
  if(!palt)switch(key){
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
  // Independent Statistics checks: recompute every typed answer from the prompt and the visual.
  const D=v?.kind==='data'?v.values:v?.kind==='dotplot'?v.groups[0].values:v?.kind==='stemleaf'?v.stems.flatMap((st,i)=>v.leaves[i].map(l=>v.decimal?st+l/10:st*10+l)):v?.kind==='frequency'?v.values.flatMap((x,i)=>Array(v.counts[i]).fill(x)):null;
  const Left=v?.kind==='stemleaf'&&v.left?v.stems.flatMap((st,i)=>v.left[i].map(l=>st*10+l)):null;
  const rows=v?.kind==='table'?v.rows:null,group=i=>rows[i][1].split(',').map(Number),wf=()=>rows.reduce((t,[x,f])=>t+Number(x)*Number(f),0)/rows.reduce((t,[,f])=>t+Number(f),0);
  const rng=a=>Math.max(...a)-Math.min(...a),P=n,F=!A&&!R,close=(a,b)=>Math.abs(a-b)<1e-4;
  const listIs=xs=>{const got=q.answer.split(',').map(Number);assert.equal(got.length,xs.length,JSON.stringify({key,q}));got.forEach((g,i)=>assert.ok(close(g,xs[i]),JSON.stringify({key,xs,q})));};
  const modesOf=a=>{const c=new Map();a.forEach(x=>c.set(x,(c.get(x)??0)+1));const top=Math.max(...c.values());return [...c].filter(([,k])=>k===top).map(([x])=>x).sort((x,y)=>x-y);};
  const stem=()=>Number([...q.prompt.matchAll(/stem (\d+)/g)].at(-1)[1]);
  // Second application forms, recognised by their wording.
  const tot=a=>a.reduce((t,x)=>t+x,0),pr=q.prompt;let alt=true;
  if(!A)alt=false;
  else if(/How many of these survey questions/.test(pr)){const numeric=['How tall','How many hours','How far','How many books'];expected=pr.split(/\(\d\) /).slice(1).filter(x=>numeric.some(n=>x.startsWith(n))).length;}
  else if(/recorded three lengths in mm/.test(pr))listIs(P.slice(0,3).map(x=>x/10));
  else if(/One friend leaves/.test(pr))expected=5*P[0]-4*P[1];
  else if(/households like these/.test(pr))expected=wf()*P[0];
  else if(/Two more values are added/.test(pr))expected=med(D);
  else if(/winner’s time/.test(pr))expected=med([...D].sort((a,b)=>a-b).slice(1));
  else if(/exactly two modes/.test(pr)){const c=new Map();D.forEach(x=>c.set(x,(c.get(x)??0)+1));expected=[...c].find(([,k])=>k===2)[0];}
  else if(/By how much does the range increase/.test(pr))expected=Math.max(P[0],...D)-Math.min(P[0],...D)-rng(D);
  else if(/one-off bonus/.test(pr))expected=P[1]-P[2]/P[0];
  else if(/two largest values were recording errors/.test(pr))expected=med([...D].sort((a,b)=>a-b).slice(0,-2));
  else if(/Type mean, median or mode/.test(pr)&&key===13){const big=Math.max(...D)-med(D)>50,common=/sells most/.test(pr);assert.equal(q.answer,common?'Mode':big?'Median':'Mean');}
  else if(/added to each/.test(pr)){const a=group(0),k=P[0];listIs([mean(a)+k,rng(a)]);}
  else if(/higher is Class B’s mean journey time/.test(pr)){const mA=Number(rows[0][1].match(/\d+/)[0]);expected=mean(group(1))-mA;}
  else if(/total of all the values on stem/.test(pr)){const S=stem();expected=tot(D.filter(x=>Math.floor(x/10)===S));}
  else if(/key \d{2} \| 2 = \d{3} cm/.test(pr)){const S=stem();listIs(D.filter(x=>Math.floor(x/10)===S).map(x=>x%10).sort((a,b)=>a-b));}
  else if(/mean of the values in this plot/.test(pr))expected=mean(D);
  else if(/range of the data in the dot plot/.test(pr))expected=rng(D);
  else if(/What percentage of the students read more than/.test(pr))expected=D.filter(x=>x>P[0]).length/D.length*100;
  else if(/ranges of the two groups differ/.test(pr))expected=Math.abs(rng(Left)-rng(D));
  else if(/lie before the gap/.test(pr)){const u=[...new Set(D)].sort((a,b)=>a-b),i=u.findIndex((x,j)=>j&&x-u[j-1]>1);expected=D.filter(x=>x<u[i]).length;}
  else if(/mean minus the median/.test(pr))expected=mean(D)-med(D);
  else if(/Design A had a median flight/.test(pr))expected=med(D)-P[0];
  else if(/range of the heights/.test(pr))expected=rng(D.map(x=>x<10?Math.round(x*100):x));
  else if(/difference between the two designs’ ranges/.test(pr))expected=Math.abs(rng(group(0))-rng(group(1)));
  else alt=false;
  if(!alt)switch(key){
   case 1:assert.ok(F||R?['Discrete','Continuous'].includes(q.answer):Number.isInteger(value));break;
   case 2:if(A)expected=2*P.at(-2)*P.at(-1);break;
   case 3:if(R)expected=q.prompt.includes(' mm.')?P[0]/10:P[0]*100;if(A)listIs(P.slice(1,4).map(x=>x+P[0]));break;
   case 4:if(F)expected=mean(D);else if(R){if(q.prompt.includes('increased by')){assert.ok(close(P[0],mean(D)));expected=P[0]+P[1];}else expected=mean(D);}else expected=mean(D)*P[0];break;
   case 5:if(F)expected=P[0]*P[1]-D.reduce((t,x)=>t+x,0);else if(R)expected=P[3]*P[2]-P[0]*P[1];else expected=5*P[0]-D.reduce((t,x)=>t+x,0);break;
   case 6:expected=A?wf()*P[0]:wf();break;
   case 7:expected=A?med([...D].sort((a,b)=>a-b).slice(0,-1)):med(D);break;
   case 8:expected=A?med([...D,P[0]]):med(D);break;
   case 9:if(F)listIs(modesOf(D));else if(R){const top=Math.max(...rows.map(r=>Number(r[1])));expected=Number(rows.find(r=>Number(r[1])===top)[0]);}else expected=modesOf(D)[0];break;
   case 10:if(F)expected=rng(D);else if(R)expected=q.prompt.includes('smallest value is')?P[1]+P[0]:P[1]-P[0];else expected=rng(group(1))-rng(group(0));break;
   case 11:if(F)expected=mean([...D,P[0]])-mean(D);else if(R)expected=(P[0]*P[1]-P[2])/P[3];else expected=(P[0]-P[1])/D.length;break;
   case 12:if(F){if(q.prompt.includes('replaced')){const s=[...D].sort((a,b)=>a-b);s[s.length-1]=P[0];expected=med(s);}else expected=med([...D,P[0]]);}else if(R)listIs([mean([...D,P[0]])-mean(D),med([...D,P[0]])-med(D)]);else expected=med([...D,P[0]]);break;
   case 13:if(R)assert.equal(q.answer,mean(D)>med(D)?'Mean':'Median');if(A)assert.equal(q.answer.split(':')[0],Math.max(...D)-med(D)>20?'Median':'Mean');break;
   case 14:if(F)listIs([mean(group(0)),mean(group(1))]);else if(R){const known=rows[1][1].split(',').filter(x=>x.trim()!=='?').map(Number);expected=5*mean(group(0))-known.reduce((t,x)=>t+x,0);}else assert.equal(q.answer,rng(group(0))<rng(group(1))?'A':'B');break;
   case 15:if(F)expected=Math.abs(med(group(0))-med(group(1)));else if(R){const [[,mA,rA],[,mB,rB]]=rows.map(r=>r.map(Number));assert.ok(q.answer.includes(Number(mB)<Number(mA)?'lower mean':'higher mean')&&q.answer.includes(Number(rB)>Number(rA)?'larger range':'smaller range'));}else expected=(P[0]*P[1]+P[2]*P[3])/(P[0]+P[2]);break;
   case 16:if(A)expected=D.filter(x=>x>P[0]).length;else expected=v.decimal?P[0]+P[1]/10:P[0]*10+P[1];break;
   case 17:{const S=stem(),dec=D.some(x=>!Number.isInteger(x));listIs(D.filter(x=>Math.floor(dec?x+1e-9:x/10)===S).map(x=>dec?Math.round(x*10)%10:x%10).sort((a,b)=>a-b));break;}
   case 18:expected=F?med(D):R?rng(D):med([...D,P[0]]);break;
   case 19:if(F)expected=D.filter(x=>x===P[0]).length;else if(R){const full=P,missing=[...new Set(full)].filter(x=>full.filter(y=>y===x).length>D.filter(y=>y===x).length);assert.deepEqual(missing,[value]);}else expected=med(D);break;
   case 20:if(F)expected=D.length;else if(R)expected=D.filter(x=>x>P[1]).length;else expected=mean(D);break;
   case 21:if(F)expected=Math.max(...Left);else if(R)assert.equal(q.answer,med(Left)>med(D)?'A':'B');else expected=Math.abs(med(v.groups[0].values)-med(v.groups[1].values));break;
   case 22:if(!A){const shape=q.answer;if(shape==='Positive')assert.ok(mean(D)>med(D));if(shape==='Negative')assert.ok(mean(D)<med(D));if(shape==='Symmetric'){const c=v.counts;assert.deepEqual(c,[...c].reverse());}}break;
   case 23:if(F){const u=[...new Set(D)].sort((a,b)=>a-b),i=u.findIndex((x,j)=>j&&x-u[j-1]>1);listIs([u[i-1],u[i]]);}else if(R){const m=med(D);expected=D.reduce((b,x)=>Math.abs(x-m)>Math.abs(b-m)?x:b);}else expected=rng(D.filter(x=>x!==P[0]));break;
   case 24:if(F)listIs([mean(D),med(D)]);else if(R)assert.equal(q.answer,close(mean(D),med(D))?'Equal':mean(D)>med(D)?'Mean':'Median');else expected=mean(D);break;
   case 25:if(A)expected=mean(group(1))-mean(group(0));break;
   case 26:{if(F)break;const fixed=D.map(x=>x<10?Math.round(x*100):x);expected=R?fixed[D.findIndex(x=>x<10)]:mean(fixed);break;}
   case 27:if(F)listIs([mean(group(0)),mean(group(1))]);else if(R)assert.ok(q.answer.includes(`${Math.round((mean(group(1))-mean(group(0)))*1e4)/1e4} cm greater`)&&q.answer.includes(rng(group(1))<rng(group(0))?'smaller':'larger'));else expected=(mean(group(1))-mean(group(0)))/mean(group(0))*100;break;
   case 28:if(F)expected=mean(D);else if(R)listIs([med(D),rng(D)]);else expected=mean(group(1))-mean(group(0));break;
   case 29:if(A)expected=P[0]-med(D);break;
   case 30:if(A)expected=P[0]/P[1]*100;break;
  }
  // Word answers are typed without a unit beside the box.
  if(/^[A-Za-z]+$/.test(q.answer))assert.ok(!q.answerUnit);
 }
 if(realm==='chance'){
  // Independent Probability checks from the prompt and the visual only.
  const pr=q.prompt,N=t=>(t.replaceAll('−','-').match(/-?\d+(?:\.\d+)?/g)||[]).map(Number),P=N(pr),F=!A&&!R;
  const HEX={'#e5484d':'red','#3b82f6':'blue','#22a06b':'green','#f5b301':'yellow'},app=v?.kind==='chance'?v.apparatus:null;
  const items=app?.type==='spinner'?app.wedges:app?.type==='bag'?app.counters:[],cnt=c=>items.filter(x=>HEX[x]===c).length,tot=items.length;
  const rows=v?.kind==='table'?v.rows:null,val=s=>scalar(String(s));
  const setIs=xs=>{const got=q.answer.split(',').map(x=>x.trim().toLowerCase()).sort(),exp=xs.map(x=>String(x).toLowerCase()).sort();assert.deepEqual(got,exp,JSON.stringify(q));};
  const colours=()=>['red','blue','green','yellow'].filter(c=>cnt(c)>0);
  const cell=label=>Number(rows.find(r=>r[0]===label)[1]);
  switch(key){
   case 1:if(/Tiles numbered 1 to/.test(pr))setIs(Array.from({length:P[1]},(_,i)=>i+1));else if(/die is rolled once/.test(pr))setIs([1,2,3,4,5,6]);else if(/section numbers/.test(pr))expected=new Set(rows[0][0].split(', ')).size;else if(/from the word/.test(pr))setIs([...new Set(pr.match(/word ([A-Z]+)/)[1])]);else setIs(colours());break;
   case 2:if(/Raffle tickets/.test(pr))expected=Math.floor(P[1]/P[2]);else if(/NOT pick a blue/.test(pr))expected=tot-cnt('blue');else{const t=P[1],ev=pr.match(/are (even|odd|a multiple of 3|greater than \d+)\?/)?.[1];if(/really/.test(pr))expected=t-P[2];else if(ev?.startsWith('greater'))expected=t-P[2];else expected=Array.from({length:t},(_,i)=>i+1).filter(x=>ev==='even'?x%2===0:ev==='odd'?x%2===1:x%3===0).length;}break;
   case 3:if(F){const t=P[0],shown=P.slice(3);expected=Array.from({length:t},(_,i)=>i+1).find(x=>!shown.includes(x));}else if(R){const xs=P.slice(1);expected=xs.find((x,i)=>xs.indexOf(x)!==i);}else if(/Two new sections/.test(pr))expected=P[2];else expected=colours().length;break;
   case 4:if(/raffle/.test(pr))expected=P[1]/P[0];else if(/captain/.test(pr))expected=(P[0]-P[1])/P[0];else expected=cnt('red')/tot;break;
   case 5:if(F)assert.equal(q.answer,cnt('red')>cnt('blue')?'Red':'Blue');else if(R)expected=cnt('red')/tot;else if(rows){const [ra,na]=rows[0].slice(1).map(Number),[rb,nb]=rows[1].slice(1).map(Number);assert.equal(q.answer,ra/na>rb/nb?'A':'B');}else expected=cnt('blue')-cnt('red');break;
   case 6:if(F)expected=(tot-cnt('red'))/tot;else if(R)expected=1-P[0];else if(/greater than/.test(pr))expected=P[0]/6;else expected=P[0]-P[1];break;
   case 7:if(/forecast/.test(pr)){expected=P[0]/100;const [x,y]=q.answer.split('/').map(Number);let g=x,h=y;while(h)[g,h]=[h,g%h];assert.equal(g,1);}else if(/more likely/.test(pr))expected=Math.max(P[0],P[1]/P[2]);else{const m=pr.match(/probability (\d+)\/(\d+)/);expected=Number(m[1])/Number(m[2]);}break;
   case 8:if(rows)expected=1-cell('A')-cell('B');else if(/P\(red\) = 1\//.test(pr))expected=1-1/P[1]-1/P[3];else expected=100-P[0]-P[1];break;
   case 9:if(F)assert.equal(q.answer,cnt('red')===cnt('blue')?'Equal':cnt('red')>cnt('blue')?'A':'B');else if(R)expected=cnt('blue')/tot;else if(/recoloured/.test(pr))expected=(cnt('blue')-cnt('red'))/2;else expected=3-(/1 or 2/.test(pr)?2:1);break;
   case 10:if(/die is rolled/.test(pr))expected=P[0]/6;else if(/bus is late/.test(pr))expected=P[0]*P[1];else{const T=Number(pr.match(/in (\d+) spins/)[1]);expected=T*cnt('red')/tot;}break;
   case 11:if(/greater than/.test(pr))expected=(6-P[0])/6;else if(/percentage of picks/.test(pr))expected=cnt('red')/tot*100;else expected=cnt('red')/tot;break;
   case 12:if(rows&&/prediction/i.test(v.title))expected=Number(rows[0][1])/Number(rows[0][0]);else if(/bag holds/.test(pr))expected=P[0]*P[2]/P[1];else expected=P[0]*P[1]/P[2];break;
   case 13:if(app?.type==='frequency')expected=app.counts[1]+app.counts[3]+app.counts[5];else if(v?.kind==='frequency')expected=v.counts.reduce((t,c)=>t+c,0);else expected=P[0]-cell('Red')-cell('Green');break;
   case 14:if(/Class A tossed/.test(pr))expected=(P[1]+P[3])/(P[0]+P[2]);else if(/percentage/.test(pr))expected=Number(rows[0][0])/Number(rows[0][1])*100;else if(rows[0].length===2&&v.headers[1]==='Losses')expected=Number(rows[0][0])/(Number(rows[0][0])+Number(rows[0][1]));else expected=Number(rows[0][0])/Number(rows[0][1]);break;
   case 15:if(F)expected=P[1]-P[0]*cnt('red')/tot;else if(/die is unfair/.test(pr))expected=Number(pr.match(/in (\d+) rolls/)[1])/6;else if(/coin tosses/.test(pr))expected=Math.abs(P[1]/P[0]-0.5);else expected=(P[1]-P[0])/P[0]*100;break;
   case 16:if(R){const m=Number(pr.match(/integers 1 to (\d+)/)[1]),h=/1 to (\d+) mean heads/.test(pr)?Number(pr.match(/1 to (\d+) mean heads/)[1]):1;expected=h/m;}else if(A){if(/chance of rain/.test(pr))expected=P[0]*P[2]/100;else expected=P[0]/P[1]*P[2];}break;
   case 17:if(/decimal between 0 and 1/.test(pr))expected=Math.round(P[2]*100);else if(/multiples of/.test(pr))expected=Math.floor(100/P[2])/100;else if(R)expected=(P[2]-1)/P[1];else expected=P[2]/P[1];break;
   case 18:if(F)expected=Number(rows[0][0])/(Number(rows[0][0])+Number(rows[0][1]));else if(R)expected=app.counts.reduce((t,c)=>t+c,0)/6;else if(/predicted probability/.test(pr))expected=P[0]*P[1];else expected=(Number(rows[0][1])+Number(rows[1][1]))/200;break;
   case 19:if(R)expected=Math.abs(P[2]-P[1])/P[0];else if(A){const hs=rows.map(r=>Number(r[1]));if(/combined/.test(pr))expected=hs.reduce((t,h)=>t+h,0)/100;else{const d=hs.map(h=>Math.abs(h-10));assert.equal(q.answer,rows[d.indexOf(Math.max(...d))][0]);}}break;
   case 20:{const rs=rows.map(r=>Number(r[1])/Number(r[0]));if(F)expected=rs[rows.findIndex(r=>Number(r[0])===P[0])];else if(R){const pp=P[0],g=rs.map(x=>Math.abs(x-pp));expected=Number(rows[g.indexOf(Math.min(...g))][0]);}else if(/Estimate/.test(pr))assert.ok(Math.abs(value-rs[4])<=0.06&&Math.abs(value*10-Math.round(value*10))<1e-9,JSON.stringify(q));else expected=Math.abs(rs[4]-rs[0]);break;}
   case 21:if(/lottery/.test(pr))expected=1/P[0];else if(/How many 6s/.test(pr))expected=Number(pr.match(/next (\d+) rolls/)[1])/6;else if(/coin/.test(pr))expected=1/2;else if(/die/.test(pr))expected=1/6;else expected=cnt('red')/tot;break;
   case 22:if(A)expected=/test a die/.test(pr)?6*P[0]:P[1]*P[2];break;
   case 23:{const pA=cell('Model A: P(win)'),pB=cell('Model B: P(win)'),W=cell('Observed wins'),T=cell('Trials');if(F)assert.equal(q.answer,Math.abs(W/T-pA)<Math.abs(W/T-pB)?'A':'B');else if(R)expected=Math.abs(W/T-pA);else if(/Using Model A/.test(pr))expected=pA*T;else expected=Math.abs(W-pB*T);break;}
   case 24:if(R)expected=Number(rows[0][0])/Number(rows[0][1]);else if(/relative frequency of heads was/.test(pr))expected=Math.round(P[0]*P[1]);else if(A)expected=P[3]-P[2]/2;break;
  }
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
// Statistics regression guards: separate reasoning tasks, mostly typed answers and varied answers.
{
 const {level7Answer}=loadCave7('lib/level7-answer.ts');const gen=CAVE7_GENERATORS.statistics;let typed=0,total=0;
 for(let w=1;w<=10;w++)for(let l=1;l<=3;l++){
  const answers={fast_thinking:new Set(),reasoning:new Set(),apply_create:new Set()};
  for(let seed=1;seed<=100;seed++){
   const f=gen(w,l,seed*7919,'fast_thinking'),r=gen(w,l,seed*7919,'reasoning'),a=gen(w,l,seed*7919,'apply_create');
   assert.ok(f.prompt!==r.prompt&&f.prompt!==a.prompt,`Statistics W${w}L${l}: reasoning or application repeats fluency`);
   for(const q of [f,r,a]){total++;if(level7Answer(q))typed++;answers[q.tier].add(q.answer);}
  }
  for(const [role,set] of Object.entries(answers))assert.ok(set.size>=2,`Statistics W${w}L${l} ${role}: answer never changes`);
 }
 assert.ok(typed/total>=0.8,`Statistics typed share ${typed}/${total}`);
 console.log(`PASS Statistics: reasoning distinct from fluency, ${Math.round(typed/total*100)}% typed answers, no fixed answers.`);
}
// Probability regression guards: separate reasoning tasks, mostly typed answers, varied answers
// and two application forms in every lesson.
{
 const {level7Answer}=loadCave7('lib/level7-answer.ts'),{promptTemplate}=loadCave7('lib/level7-quiz.ts'),gen=CAVE7_GENERATORS.chance;let typed=0,total=0;
 for(let w=1;w<=8;w++)for(let l=1;l<=3;l++){
  const answers={fast_thinking:new Set(),reasoning:new Set(),apply_create:new Set()},forms=new Set();
  for(let seed=1;seed<=100;seed++){
   const f=gen(w,l,seed*7919,'fast_thinking'),r=gen(w,l,seed*7919,'reasoning'),a=gen(w,l,seed*7919,'apply_create');
   assert.ok(f.prompt!==r.prompt&&f.prompt!==a.prompt,`Probability W${w}L${l}: reasoning or application repeats fluency`);
   for(const q of [f,r,a]){total++;if(level7Answer(q))typed++;answers[q.tier].add(q.answer);}
   forms.add(promptTemplate(a.prompt));
  }
  for(const [role,set] of Object.entries(answers))assert.ok(set.size>=2,`Probability W${w}L${l} ${role}: answer never changes`);
  assert.ok(forms.size>=2,`Probability W${w}L${l}: only one application form`);
 }
 assert.ok(typed/total>=0.85,`Probability typed share ${typed}/${total}`);
 console.log(`PASS Probability: reasoning distinct from fluency, ${Math.round(typed/total*100)}% typed answers, no fixed answers, two application forms per lesson.`);
}
console.log(`PASS ${count} generated Algebra/Statistics/Probability questions and ${quizzes} quiz items: independent calculations, balanced weekly coverage and inequivalent numeric choices.`);

// Perimeter examples must show every side without revealing x.
for(let seed=1;seed<=200;seed++)for(const role of ['fast_thinking','reasoning','apply_create']){
 const q=CAVE7_GENERATORS.pattern(6,1,seed,role),v=q.cave7Visual;
 assert.equal(v?.kind,'perimeter');
 assert.equal(v.sideLabels.filter(s=>s==='x cm').length,2);
 assert.equal(v.sideLabels.length,role==='apply_create'?3:4);
 const given=v.sideLabels.filter(s=>s!=='x cm').map(parseFloat),x=(v.perimeter-given.reduce((a,b)=>a+b,0))/2;
 if(role!=='reasoning')assert.equal(scalar(q.answer),x);
 if(v.shape==='triangle')assert.ok(given[0]<2*x,'Triangle must have positive area');
}
console.log('PASS 600 perimeter visuals: all sides, matching totals, valid triangles, hidden x.');
