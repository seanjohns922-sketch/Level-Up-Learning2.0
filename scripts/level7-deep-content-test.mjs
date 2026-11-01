// Additional Level 7 audit: all lesson/role contracts plus independent maths on
// selected displayed-data families. This is not a proof of every question family.
import assert from 'node:assert/strict';
import {loadCave7 as load} from './cave7-loader.mjs';
const {level7Answer,markLevel7Answer,scalarAnswer}=load('lib/level7-answer.ts');
const generators={number:load('data/activities/year7Number/questions.ts').number7Question,measurement:load('data/activities/year7Measurement/questions.ts').measurement7Question,space:load('data/activities/year7Space/questions.ts').space7Question,...load('data/activities/cave7/questions.ts').CAVE7_GENERATORS};
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const mean=xs=>sum(xs)/xs.length;
const median=xs=>{const s=[...xs].sort((a,b)=>a-b),m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;};
const checks={},lessons=new Set(),rateUnits=new Set();let sampled=0,typed=0;
function equal(q,value,family){const actual=scalarAnswer(q.answer);assert.notEqual(actual,null,q.lessonId);assert.ok(Math.abs(actual-value)<0.000051,`${q.lessonId}: ${q.prompt}: ${q.answer} != ${value}`);checks[family]=(checks[family]??0)+1;}
for(const [realm,generate] of Object.entries(generators))for(let week=1;week<=({space:10,statistics:10,chance:8}[realm]??12);week++)for(let lesson=1;lesson<=3;lesson++)for(let seed=1;seed<=25;seed++)for(const role of ['fast_thinking','reasoning','apply_create']){
 const q=generate(week,lesson,seed*7919,role),spec=level7Answer(q),p=q.prompt,v=q.cave7Visual;sampled++;lessons.add(q.lessonId);
 assert.ok(p.trim()&&q.explanation.trim(),q.lessonId);assert.equal(new Set(q.options).size,q.options.length,q.lessonId);assert.ok(q.options.includes(q.answer),q.lessonId);
 if(spec&&!['build','sorter'].includes(spec.kind)&&spec.expected===q.answer){typed++;assert.deepEqual(q.options.filter(x=>markLevel7Answer(spec,x)),[q.answer],`${q.lessonId}: ambiguous choices`);}
 if(realm==='statistics'){
  const data=v?.kind==='data'?v.values:v?.kind==='stemleaf'&&!v.left?v.stems.flatMap((s,i)=>v.leaves[i].map(l=>v.decimal?s+l/10:s*10+l)):v?.kind==='dotplot'&&v.groups.length===1?v.groups[0].values:null;
  if(data&&/^What is the mean(?: of the values in this plot)?\?$/.test(p))equal(q,mean(data),'statistics mean');
  if(data&&p==='What is the median?')equal(q,median(data),'statistics median');
  if(data&&/^What is the range(?: of the data in the dot plot)?\?$/.test(p))equal(q,Math.max(...data)-Math.min(...data),'statistics range');
  if(data&&p.startsWith('What is the mode?')){const counts=new Map();for(const x of data)counts.set(x,(counts.get(x)??0)+1);const max=Math.max(...counts.values());assert.deepEqual(q.answer.split(',').map(Number).sort((a,b)=>a-b),[...counts].filter(([,n])=>n===max).map(([x])=>x).sort((a,b)=>a-b));checks['statistics mode']=(checks['statistics mode']??0)+1;}
  if(v?.kind==='frequency'&&p==='How many students are represented altogether?')equal(q,sum(v.counts),'statistics frequency');
 }
 if(realm==='pattern'&&week===7&&lesson===3&&role==='apply_create'){
  const match=p.match(/from (\d+) to (\d+) (?:minutes|hours), in (.+?)\? Give/);assert.ok(match,p);const a=v.points.find(x=>x[0]===Number(match[1])),b=v.points.find(x=>x[0]===Number(match[2]));equal(q,(b[1]-a[1])/(b[0]-a[0]),'graph rate');assert.equal(spec.unit,match[3]);rateUnits.add(spec.unit);assert.ok(markLevel7Answer(spec,`${q.answer} ${spec.unit}`));assert.ok(!markLevel7Answer(spec,`${Number(q.answer)+1} ${spec.unit}`));
 }
 if(realm==='pattern'&&week===11&&lesson===1&&role==='reasoning'){assert.equal(spec.unit,'km/h');for(const row of v.rows)equal(q,Number(row[1])/Number(row[0]),'spreadsheet speed');assert.ok(markLevel7Answer(spec,`${q.answer} km/h`));}
 if(realm==='number'){
  let m=p.match(/^What is (\d+)²\?$/);if(m)equal(q,Number(m[1])**2,'squares');
  m=p.match(/^What is √(\d+)\?$/);if(m)equal(q,Math.sqrt(Number(m[1])),'square roots');
  m=p.match(/^Which whole number is immediately below √(\d+)\?$/);if(m)equal(q,Math.floor(Math.sqrt(Number(m[1]))),'root bounds');
 }
 if(realm==='chance'&&v?.kind==='chance'&&v.apparatus.type==='spinner'){
  const wedges=v.apparatus.wedges,red=wedges.filter(x=>x==='#e5484d').length;
  if(p==='What is the probability of red on one spin? Give a fraction.')equal(q,red/wedges.length,'spinner probability');
  if(p==='What is the probability of NOT landing on red? Give a fraction.')equal(q,1-red/wedges.length,'complement probability');
  const m=p.match(/^About how many red results would you expect in (\d+) spins\?$/);if(m)equal(q,Number(m[1])*red/wedges.length,'expected frequency');
 }
}
assert.equal(lessons.size,192);assert.equal(rateUnits.size,4,'Exercise every graph context and its rate unit');
console.log(JSON.stringify({lessons:lessons.size,sampled,typedChoiceContracts:typed,independentMathChecks:checks,rateUnits:[...rateUnits]},null,2));
