import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadMeasurement7} from './measurement7-loader.mjs';
const {MEASUREMENT7_WEEKS,MEASUREMENT7_PROGRAM}=loadMeasurement7('curriculum');
const {measurement7Question,measurement7Quiz}=loadMeasurement7('questions');
// Independent calculations use numbers in the displayed prompt, not generator
// intermediates, explanations, formulas or stored answers.
const lin=s=>{const m=s.match(/\((\d*)y(?: ([+−]) (\d+))?\)/);return [Number(m[1]||1),m[2]?(m[2]==='+'?1:-1)*Number(m[3]):0];};
const PI_TABLE={'3 (early Babylon)':3,'3 1/8 (Babylon)':3.125,'256/81 (Egypt, Rhind papyrus)':256/81,'22/7 (Archimedes, Greece)':22/7,'3.1416 (Aryabhata, India)':3.1416,'355/113 (Zu Chongzhi, China)':355/113};
function expected(key,q){
 const n=(q.prompt.match(/\d+(?:\.\d+)?/g)||[]).map(Number),[a,b,c,d,e,f,g,h]=n,A=q.tier==='apply_create',vis=q.measurementVisual,p=q.prompt;
 switch(key){
 case 1:return a*b/2*(A?c:1);
 case 2:return a*b/(A?200:2);
 case 3:return a*b*(A?c:1);
 case 4:return 2*a/(A?c:b);
 case 5:return A?2*b:a*b/2;
 case 6:return (a+b)*c/2*(A?d:1);
 case 7:return a*b*c*(A?d:1);
 case 8:return a*(b+(A?c:0));
 case 9:return a*b*c/2*(A?d:1);
 case 10:return a/(b*c)*(A?2:1);
 case 11:return a*b*c/2000*(A?.75:1);
 case 12:return (a*b*c-d*e*f/2)*(A?g:1);
 case 13:return A?(2*a+b)/2:2*a;
 case 14:return A?b*c/a:a/b;
 case 15:return 3.14*a*(A?b:1);
 case 16:return 6.28*a*(A?b:1);
 case 17:return a/(A?6.28:3.14);
 case 18:return 3.14*a*b/(A?100:1);
 // Week 7 prompts never name the relationship: read it from the diagram or the described positions.
 case 19:case 20:case 21:if(A)return p.includes('angle above the first track')||/second track, on the left/.test(p)?a:180-a;return vis.relation==='cointerior'?180-vis.values[0]:vis.values[0];
 case 22:{if(A){const [k1,m1]=lin(vis.angleLabels[0]),[k2,m2]=lin(vis.angleLabels[1]);return vis.relation==='cointerior'?(180-m1-m2)/(k1+k2):(m2-m1)/(k1-k2);}const [k,m]=lin(vis.angleLabels[1]),t=vis.relation==='cointerior'?180-vis.values[0]:vis.values[0];return (t-m)/k;}
 case 23:return A?(p.includes('co-interior')?180-a-b:a-b):(p.includes('co-interior')?180-a:a);
 case 24:return A?(/below the bottom rail on the left/.test(p)?180-a:a):(/inside the rails on the left of the brace\?/.test(p)?a:180-a);
 case 25:return A?a+b:180-a-b;
 case 26:return A?180-(180-a)/2:(180-a)/2;
 case 27:return A?a-b:a+b;
 case 28:return A?180-(360-a-b-c):360-a-b-c;
 case 29:return A?a/180+2:(a-2)*180;
 case 30:{if(A){const sides=a+b;return ((sides-2)*180-90*a)/b;}const sides=p.includes('pentagon')?5:6;return (sides-2)*180-b;}
 case 31:return c*(A?a+b:b)/a;
 case 32:return c/(a+b)*(A?b-a:a);
 case 33:{const s=Math.min(c/a,d/b);return A?c+d-(a+b)*s:(a+b)*s;}
 case 34:return A?e/b:e*b; // 1 : r, concentrate, water, extra
 case 35:return A?c*100/b:c*b/100;
 case 36:{const cost=c/(a+b)*(a*d+b*e);return A?f-cost:cost;}
 default:throw Error(key);
 }
}
function reasonOk(key,q){
 const ans=q.answer,n=(q.prompt.match(/\d+(?:\.\d+)?/g)||[]).map(Number),vis=q.measurementVisual,has=(...xs)=>xs.some(x=>typeof x==='string'?ans.includes(x):x.test(ans));
 switch(key){
 case 1:return has('Two copies');
 case 2:return has('because it is perpendicular');
 case 3:return has('Move one end triangle')||ans===`${n[0]} × ${n[2]}`;
 case 4:return has('Double the area');
 case 5:{if(has('It stays the same'))return true;const m=ans.match(/Base (\d+(?:\.\d+)?) cm and perpendicular height (\d+(?:\.\d+)?) cm/);return !!m&&Number(m[1])*Number(m[2])===n[0]*n[1];}
 case 6:return has('Add half base',/^\(\d+ × \d+ ÷ 2 \+ \d+ × \d+ ÷ 2\) × \d+$/);
 case 7:return has('layers contains');
 case 8:return ans===`${n[0]} × ${n[1]}`;
 case 9:return has('cross-section is a triangle',/^\d+ × \d+ ÷ 2 × \d+$/);
 case 10:return has('Divide volume by cross-sectional area')||ans===`${n[0]} ÷ ${n[1]}`;
 case 11:return has('1000 cm³ equals 1 L');
 case 12:return has('holds half as much')||ans.startsWith(`${n[0]/2} cm³`);
 case 13:return q.prompt.includes('curved distance')?ans==='The circumference.':q.prompt.includes('centre of a circle to a point')?ans==='A radius.':has('through the centre');
 case 14:{if(q.prompt.startsWith('Ancient')){const best=q.options.reduce((x,y)=>Math.abs(PI_TABLE[y]-Math.PI)<Math.abs(PI_TABLE[x]-Math.PI)?y:x);return ans===best;}return has('Circumference divided by diameter','Measurements are estimates');}
 case 15:return ans===`${n[0]} × π`;
 case 16:return has('needs diameter');
 case 17:return has('Divide circumference by twice pi')||ans===`${n[0]} ÷ (2 × 3.14)`;
 case 18:return has('Circumference × number')||ans===`3.14 × ${n[0]} × ${n[1]}`;
 case 19:case 20:case 21:{const r=vis.relation,x=r==='cointerior'?180-vis.values[0]:vis.values[0];return ans===`${x}°, because ${r==='corresponding'?'corresponding angles are equal':r==='alternate'?'alternate angles are equal':'co-interior angles sum to 180°'}.`;}
 case 22:{const [k,m]=lin(vis.angleLabels[1]),y=((vis.relation==='cointerior'?180-vis.values[0]:vis.values[0])-m)/k;const [l,r]=ans.replace(/(\d*)y/,(_,c)=>`(${c||1}*${y})`).replaceAll('−','-').split('=').map(x=>Function(`return ${x}`)());return Math.abs(l-r)<1e-9;}
 case 23:{const equal=!q.prompt.includes('co-interior'),par=equal?n[0]===n[1]:n[0]+n[1]===180;return ans.startsWith(par?'Yes':'No')&&ans.includes(equal?'equal':'sum to 180°');}
 case 24:return (has('because the rails are still parallel')&&ans.includes(`${n[0]}°`))||has('not parallel, because alternate angles would be equal');
 case 25:return has('sum to 180')||ans===`180 − ${n[0]} − ${n[1]}`;
 case 26:return has('divide by 2');
 case 27:return has('after subtracting the adjacent')||ans===`${n[0]} − ${n[1]}`;
 case 28:return has('two triangles')||ans===`360 − ${n[0]} − ${n[1]} − ${n[2]}`;
 case 29:return has('− 2');
 case 30:{if(q.prompt.startsWith('What is each')){const sides={pentagon:5,hexagon:6,octagon:8}[q.prompt.match(/regular (\w+)/)[1]];return ans.startsWith(`${(sides-2)*180/sides}°`);}return has('Only if its interior angles are all equal');}
 case 31:return ans===`1/${n[1]+1}`;
 case 32:return ans===`${n[0]} + ${n[1]} gives ${n[0]+n[1]} equal ratio parts.`;
 case 33:return ans.startsWith(n[2]/n[0]<n[3]/n[1]?'Blue':'Yellow')&&ans.includes('smaller scale');
 case 34:return q.prompt.startsWith('Extra water')?ans.startsWith(`One ${{3:'third',4:'quarter',5:'fifth'}[n[2]]} of the extra water`):ans.startsWith(`${n[1]} times the extra concentrate`);
 case 35:return has('cm in reality');
 case 36:return has('cost of each share')||ans===`${n[2]} ÷ ${n[0]+n[1]} × ${n[0]} × ${n[3]} + ${n[2]} ÷ ${n[0]+n[1]} × ${n[1]} × ${n[4]}`;
 default:throw Error(key);
 }
}
let count=0;
assert.equal(MEASUREMENT7_WEEKS.length,12);
for(let w=1;w<=12;w++)for(let l=1;l<=3;l++){
 assert.equal(MEASUREMENT7_PROGRAM[w-1].lessons.length,3);
 for(let seed=1;seed<=200;seed++)for(const role of ['fast_thinking','reasoning','apply_create']){
  const key=(w-1)*3+l,q=measurement7Question(w,l,seed*7919,role);
  assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.options.includes(q.answer));assert.equal(q.steps.length,3);
  if(role!=='reasoning'){
   const value=Math.round(expected(key,q)*100)/100;
   assert.equal(Number(q.answer),value,JSON.stringify({key,seed,q,n:q.prompt.match(/\d+(?:\.\d+)?/g)}));
   assert.equal(q.options.filter(x=>Number(x)===value).length,1);
  } else {
   assert.ok(reasonOk(key,q),`${key}: ${q.prompt} → ${q.answer}`);
   assert.equal(q.options.filter(o=>reasonOk(key,{...q,answer:o})).length,1,`${key}: exactly one valid reason: ${JSON.stringify(q.options)}`);
  }
  if(q.measurementVisual){assert.ok(q.measurementVisual.description);assert.ok(q.measurementVisual.values.every(Number.isFinite));}
  count++;
 }
}
for(let w=1;w<=11;w++){
 const quiz=measurement7Quiz(w);assert.equal(quiz.length,15);assert.equal(new Set(quiz.map(q=>q.id)).size,15);
 for(let l=1;l<=3;l++){const qs=quiz.filter(q=>q.lessonTag===l);assert.equal(qs.length,5);assert.equal(qs.filter(q=>q.tier==='reasoning').length,1);assert.equal(qs.filter(q=>q.tier==='apply_create').length,2);assert.equal(new Set(qs.map(q=>q.prompt+JSON.stringify(q.measurementVisual??null))).size,5,'Quiz questions must be distinct');}
 for(const q of quiz)if(q.tier!=='reasoning')assert.equal(Number(q.answer),Math.round(expected((w-1)*3+q.lessonTag,q)*100)/100);
}
assert.throws(()=>measurement7Quiz(12));
// Regression guards: Week 8 is not a copy of Week 7, Week 7 prompts never name the relationship,
// non-reasoning answers vary, and every reasoning item has more than one prompt.
for(let l=1;l<=3;l++)for(const role of ['fast_thinking','apply_create'])assert.notEqual(measurement7Question(7,l,4242,role).prompt,measurement7Question(8,l,4242,role).prompt);
for(let l=1;l<=3;l++)for(let seed=1;seed<=50;seed++)for(const role of ['fast_thinking','reasoning','apply_create'])assert.ok(!/corresponding|alternate|co-interior/.test(measurement7Question(7,l,seed*7919,role).prompt),'Week 7 must not name the relationship');
for(let w=1;w<=12;w++)for(let l=1;l<=3;l++){
 for(const role of ['fast_thinking','apply_create']){const answers=new Set();for(let seed=1;seed<=200;seed++)answers.add(measurement7Question(w,l,seed*7919,role).answer);assert.ok(answers.size>=5,`W${w}L${l} ${role}: only ${answers.size} distinct answers`);}
 const prompts=new Set();for(let seed=1;seed<=200;seed++){const r=measurement7Question(w,l,seed*7919,'reasoning');prompts.add(r.prompt+JSON.stringify(r.measurementVisual??null));}assert.ok(prompts.size>=2,`W${w}L${l} reasoning has a single prompt`);
}
const csv=fs.readFileSync('public/curriculum/measurement-level7-scope-and-sequence.csv','utf8');assert.equal(csv.trim().split('\n').length,50);assert.ok(csv.includes('Modelling Task')&&!csv.includes('..'));
console.log(`PASS ${count} Measurement practice variants, 165 weekly quiz items, 36 skill guides, 12-week curriculum and export.`);
// Exercise shared authenticated route handlers with Measurement URLs, rather
// than granting access via teacher_preview query parameters alone.
const ts=(await import('typescript')).default;
function moduleAt(path,deps){const module={exports:{}};const js=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;new Function('require','module','exports',js)(name=>{if(!(name in deps))throw Error(name);return deps[name];},module,module.exports);return module.exports;}
const caveConfig=moduleAt('lib/cave7-config.ts',{});
const rules=moduleAt('lib/number7-demo.ts',{'./cave7-config':caveConfig,'@/lib/program-progress':{getWeekProgress:(store,year,week,realm)=>store[`${realm}:${week}`]??{lessonsCompleted:[false,false,false]}},'@/lib/assessment-rules':{weeklyQuizMinimumCorrect:n=>Math.ceil(.8*n)}});
for(let w=1;w<=12;w++)for(const l of [1,2,3,'quiz'])assert.equal(rules.number7DemoActivityAllowed(true,w,l),!(w===12&&l==='quiz'));
const store={};for(let w=1;w<=11;w++){store[`measurement:${w}`]={lessonsCompleted:[true,true,true],quizCompleted:true,quizBestCorrect:11,quizTotal:15};assert.equal(rules.number7WeekUnlocked(store,w+1,'measurement'),false);store[`measurement:${w}`].quizBestCorrect=12;assert.equal(rules.number7WeekUnlocked(store,w+1,'measurement'),true);assert.equal(rules.number7WeekUnlocked(store,w+1,'number'),false);}
for(const kind of ['lesson','quiz'])for(const allowed of [false,true]){
 const route=moduleAt(`app/demo-review/shattered-realms/[realm]/${kind}/page.tsx`,{'@/lib/cave7-config':caveConfig,'@/lib/demo-session-server':{getServerStarpathAccess:async()=>({allowed})},'next/navigation':{redirect:x=>{throw Error('redirect:'+x);},notFound:()=>{throw Error('not-found');}},'@/lib/number7-demo':rules,'@/app/lesson/page':{default:'lesson'},'@/app/session/page':{default:'quiz'},'@/components/starpath/Space7QuizClient':{default:'spaceQuiz'},'@/components/lesson/cave7/Cave7QuizClient':{default:'CaveQuiz'},'react/jsx-runtime':{jsx:(type,props)=>({type,props})}}).default;
 const req=(week,overrides={})=>({params:Promise.resolve({realm:'measurement'}),searchParams:Promise.resolve({realm_id:'measurement',year:'Year 7',week:String(week),lessonId:`y7-measurement-w${week}-l1`,teacher_preview:'1',expedition:'1',type:'quiz',n:'1',...overrides})});
 if(!allowed){await assert.rejects(route(req(1)),/redirect:\/login/);continue;}
 for(let w=1;w<=(kind==='quiz'?11:12);w++)assert.equal((await route(req(w))).type,kind);
 await assert.rejects(route(req(13)),/not-found/);
 await assert.rejects(route(req(1,{realm_id:'number'})),/redirect:.*measurement/);
 if(kind==='lesson')await assert.rejects(route(req(1,{lessonId:'y7-w1-l1'})),/not-found/);
 else await assert.rejects(route(req(12)),/redirect:\/posttest.*measurement/);
}
// Verify custom generator uses the engine's three-argument calling convention.
const {generateMeasurement7Question}=loadMeasurement7('questions');
for(const w of MEASUREMENT7_PROGRAM)for(const lesson of w.lessons)for(const activity of lesson.activities)assert.equal(generateMeasurement7Question(5,lesson,activity).lessonId,lesson.id);
console.log('PASS demo access, 23 protected routes, invalid and cross-realm links, exact 80% gates, realm-isolated progress and engine generator integration.');
