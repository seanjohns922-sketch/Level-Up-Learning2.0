import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { validChallenge } from './number7-challenge-oracle.mjs';
const cache=new Map();
function load(path,mocks={}){if(cache.has(path))return cache.get(path);const m={exports:{}};const js=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;new Function('require','module','exports',js)(name=>{if(mocks[name])return mocks[name];if(name==='./cave7-config'||name==='@/lib/cave7-config')return load('lib/cave7-config.ts');if(name==='./curriculum')return load('data/activities/year7Number/curriculum.ts');if(name==='./challenges')return load('data/activities/year7Number/challenges.ts');if(name==='@/lib/level7-quiz')return load('lib/level7-quiz.ts');throw Error(name);},m,m.exports);cache.set(path,m.exports);return m.exports;}
const {NUMBER7_PROGRAM,NUMBER7_WEEKS,number7ContentKey,number7ContentWeek}=load('data/activities/year7Number/curriculum.ts');
assert.deepEqual(NUMBER7_WEEKS.map(w=>w.content),[1,2,3,4,9,5,6,7,8,10,11,12],'Integers are taught before negative rationals');
const {number7Question,number7Quiz}=load('data/activities/year7Number/questions.ts');
function calc(s){s=s.replace(/(\d+) (\d+)\/(\d+)/g,'($1+$2/$3)').replace(/(\d+)\/(\d+)/g,'($1/$2)').replaceAll('−','-').replaceAll('×','*').replaceAll('÷','/').replace(/(\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g,(_,a,b)=>`(${a}**${[...b].map(c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join('')})`).replaceAll(',','');assert.match(s,/^[\d\s.()+*/-]+$/);return Function(`return (${s})`)();}
const approx=(a,b)=>Math.abs(a-b)<1e-7;
const nums=s=>(s.replaceAll('−','-').match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
function valid(key,q,option){const p=q.prompt,ns=nums(p);let e;
 switch(key){
 case 1:e=ns[0]**2;break;
 case 2:e=Math.sqrt(ns[0]);break;
 case 3:e=p.includes('perimeter')?Math.sqrt(ns[0])*4:Math.floor(Math.sqrt(ns[0]));break;
 case 4:return approx(calc(option),ns[0]);
 case 5:e=calc(p.replace('Evaluate ','').replace(/\.$/,''));break;
 case 6:{const [a,b]=ns;const common=Array.from({length:Math.min(a,b)},(_,i)=>i+1).filter(n=>a%n===0&&b%n===0);e=p.includes('lowest')?Array.from({length:a*b},(_,i)=>i+1).find(n=>n%a===0&&n%b===0):Math.max(...common);break;}
 case 7:e=calc(p.replace('What is ','').replace('?',''));break;
 case 8:return approx(calc(option),Number(p.match(/equals ([\d,]+)/)[1].replaceAll(',','')));
 case 9:e=calc(p.split(': ')[1].replace(/\.$/,''));break;
 case 10:case 11:e=ns[0]/ns[1];break;
 case 12:e=100*ns[0]/ns[1];break;
 case 13:e=q.visual.markers[0].position;break;
 case 14:e=q.visual.markers[0].position;break;
 case 15:{const v=option.split(', ').map(Number);return v.every((n,i)=>i===0||v[i-1]<n);}
 case 16:if(p.includes('nearest $')){e=Math.round(ns[0]/ns[1])*ns[1];break;}{const raw=p.match(/Round ([0-9.]+)/)[1],places=ns[1];const [whole,dec]=raw.split(".");const kept=Number(whole+dec.slice(0,places));e=(kept+(Number(dec[places])>=5?1:0))/10**places;}break;
 case 17:e=Math.ceil(q.paintContext.need/q.paintContext.capacity);break;
 case 18:e=Math.round(ns[0]/10)*10*Math.round(ns[1]);break;
 case 19:case 20:case 21:case 22:case 23:case 27:e=calc(p.replace('Calculate ','').replace(/\.$/,''));break;
 case 24:e=ns[0]*ns[1]/100;break;
 case 25:assert.equal(ns.length,4);e=Math.min(...ns);break;
 case 26:e=ns[0]+ns[1];break;
 case 28:{const o=option.split(':').map(Number);return o.length===ns.length&&o.every((x,i)=>approx(x/o[0],ns[i]/ns[0]))&&Array.from({length:Math.min(...o)-1},(_,i)=>i+2).every(n=>o.some(x=>x%n!==0));}
 case 29:e=p.startsWith('Share')?ns[0]*ns[1]/(ns[1]+ns[2]):ns[2]/ns[0]*ns[1];break;
 case 30:e=ns[2]*ns[0]/(ns[0]+ns[1]);break;
 case 31:e=ns[0]*(1-ns[1]/100)+ns[2];break;
 case 32:e=Math.abs(ns[1]-ns[0])/ns[0]*100;break;
 case 33:e=ns[1]/ns[0];break;
 case 34:e=ns[3]-ns[0]*ns[1]-ns[2];break;
 case 35:e=ns[0]+ns[1]-ns[2];break;
 case 36:return approx(calc(option),ns[0]*(1-ns[1]/100)+ns[2]);
 }
 return approx(calc(option),e);
}
let checked=0;
for(let w=1;w<=12;w++){
 assert.equal(NUMBER7_PROGRAM[w-1].lessons.length,3);
 for(let l=1;l<=3;l++){
  const g=NUMBER7_WEEKS[w-1].lessons[l-1];assert.equal(g.steps.length,3);assert.ok(g.idea&&g.example&&g.caution);
  for(let seed=1;seed<=200;seed++){
   const q=number7Question(w,l,seed*7919,'fast_thinking');
   const correct=q.options.filter(o=>valid(number7ContentKey(w,l),q,o));
   if(number7ContentWeek(w)===5){assert.equal(q.visual.type,'fraction_number_line');assert.ok(q.diagramSpeech);assert.ok(q.visual.min<=0);for(const point of q.visual.markers){assert.ok(point.position>=q.visual.min&&point.position<=q.visual.max);assert.ok(['P','Q','R'].includes(point.label));}}
   assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
   assert.deepEqual(correct,[q.answer],`Week ${w} lesson ${l} seed ${seed}: ${JSON.stringify(q)}`);checked++;
   for(const role of ['fast_thinking','reasoning','apply_create']){const g=number7Question(w,l,seed*7919,role);
    // Stated ratios are already simplified (unless simplifying is the task); remaining amounts are never negative.
    if(!/Simplify/.test(g.prompt))for(const [,x,y] of g.prompt.matchAll(/(\d+):(\d+)/g)){let p=+x,q=+y;while(q)[p,q]=[q,p%q];assert.ok(p===1&&x!==y,`Unsimplified ratio: ${g.prompt}`);}
    if(/remain/.test(g.prompt)&&Number.isFinite(Number(g.answer)))assert.ok(Number(g.answer)>=0,`Negative remainder: ${g.prompt}`);}
   for(const role of ['reasoning','apply_create']){const challenge=number7Question(w,l,seed*7919,role);assert.equal(challenge.version,2);assert.equal(challenge.options.length,4);assert.deepEqual(challenge.options.filter(o=>validChallenge(number7ContentKey(w,l),challenge,o)),[challenge.answer],`Week ${w} lesson ${l} ${role} seed ${seed}: ${JSON.stringify(challenge)}`);checked++;}
  }
 }
 if(w===12){assert.throws(()=>number7Quiz(w),/Unknown Level 7 quiz/);continue;}
 const quiz=number7Quiz(w);assert.equal(quiz.length,15);assert.equal(new Set(quiz.map(q=>q.id)).size,15);
 for(const l of [1,2,3]){const subset=quiz.filter(q=>q.lessonTag===l);assert.equal(subset.length,5);assert.equal(subset.filter(q=>q.tier==='fast_thinking').length,2);assert.equal(subset.filter(q=>q.tier==='reasoning').length,1);assert.equal(subset.filter(q=>q.tier==='apply_create').length,2);}
 for(const q of quiz)assert.deepEqual(q.options.filter(o=>q.tier==='fast_thinking'?valid(number7ContentKey(w,q.lessonTag),q,o):validChallenge(number7ContentKey(w,q.lessonTag),q,o)),[q.answer],JSON.stringify(q));
}
const getWeekProgress=(store,_year,w)=>store[w]??{lessonsCompleted:[false,false,false]};
const rules=load('lib/number7-demo.ts',{'@/lib/program-progress':{getWeekProgress},'@/lib/assessment-rules':{weeklyQuizMinimumCorrect:n=>Math.ceil(n*.8)}});
for(let w=1;w<=12;w++)for(const activity of [1,2,3,'quiz']){assert.equal(rules.number7DemoActivityAllowed(true,w,activity),!(w===12&&activity==='quiz'));assert.equal(rules.number7DemoActivityAllowed(false,w,activity),false);}
for(const w of [0,13,1.5,NaN])assert.equal(rules.number7DemoActivityAllowed(true,w,1),false);
for(const l of [0,4,1.5])assert.equal(rules.number7DemoActivityAllowed(true,1,l),false);
let store={};assert.equal(rules.number7WeekUnlocked(store,1),true);assert.equal(rules.number7WeekUnlocked(store,2),false);
assert.equal(rules.number7ActivityAllowed(store,1,2),false);assert.equal(rules.number7ActivityAllowed(store,1,'quiz'),false);
for(let w=1;w<=11;w++){
 store[w]={quizCompleted:true,lessonsCompleted:[true,true,true],quizBestCorrect:11,quizTotal:15,quizBestScore:80};
 assert.equal(rules.number7WeekPassed(store,w),false,'Exact 11/15 never passes despite rounded/corrupt display score');
 store[w].quizBestCorrect=12;assert.equal(rules.number7WeekPassed(store,w),true);
 if(w<12)assert.equal(rules.number7WeekUnlocked(store,w+1),true);
}
store[4].quizBestCorrect=11;assert.equal(rules.number7WeekUnlocked(store,12),false,'No jumping over an earlier failed week');
const csv=fs.readFileSync('public/curriculum/number-level7-scope-and-sequence.csv','utf8');assert.equal(csv.trim().split('\n').length,50);assert.ok(csv.includes('Modelling Task')&&!csv.includes('..'));for(const w of NUMBER7_WEEKS)for(const l of w.lessons)assert.ok(csv.includes(l.title)&&csv.includes(l.code));
console.log(`PASS ${checked} independently scored practice variants, 165 quiz items, 36 guides, exact 80% gates, no week skipping, and 49 curriculum export rows.`);
// Execute the real protected route modules with access outcomes and tampered queries.
for(const kind of ['lesson','quiz']){
 for(const allowed of [false,true]){
  const routePath=`app/demo-review/shattered-realms/[realm]/${kind}/page.tsx`;
  cache.delete(routePath);
  const route=load(routePath,{'next/navigation':{redirect:url=>{throw Error(`redirect:${url}`)},notFound:()=>{throw Error('not-found')}},'@/lib/demo-session-server':{getServerStarpathAccess:async()=>({allowed})},'@/lib/number7-demo':rules,'@/app/lesson/page':{default:'SharedLessonPage'},'@/app/session/page':{default:'SharedQuizPage'},'@/components/starpath/Space7QuizClient':{default:'SpaceQuiz'},'@/components/lesson/cave7/Cave7QuizClient':{default:'CaveQuiz'},'react/jsx-runtime':{jsx:(type,props)=>({type,props})}}).default;
  const request=(realm,week,overrides={})=>({params:Promise.resolve({realm}),searchParams:Promise.resolve({realm_id:'number',year:'Year 7',week:String(week),lessonId:`y7-w${week}-l1`,teacher_preview:'1',expedition:'1',type:'quiz',n:'1',...overrides})});
  if(!allowed){await assert.rejects(route(request('number',1)),/redirect:\/login/);continue;}
  await assert.rejects(route(request('invalid',1)),/not-found/);
  await assert.rejects(route(request('number',13)),/not-found/);
  await assert.rejects(route(request('number',1,{realm_id:'chance'})),/redirect:.*number/);
  if(kind==='quiz')await assert.rejects(route(request('number',12)),/redirect:\/posttest/);
  for(let w=1;w<=(kind==='quiz'?11:12);w++)assert.equal((await route(request('number',w))).type,kind==='lesson'?'SharedLessonPage':'SharedQuizPage');
 }
}
const engine=fs.readFileSync('components/lesson/Year2LessonEngine.tsx','utf8');
assert.ok(!engine.includes('buildInitialTurn(lesson, activities);'),'Restart must not revert to the default generator');
const lessonPage=fs.readFileSync('app/lesson/page.tsx','utf8');
assert.ok(lessonPage.includes('isQuestionCompatible={number7QuestionCompatible}'),'Resume must reject older or foreign question snapshots');
assert.ok(engine.includes('!lesson.id.startsWith("y7-")'),'Level 7 must retain random rotation rather than inherit ordered Year 5/6 activities');
assert.equal(rules.number7ActivityHref(12,'posttest'),'/posttest?year=Year%207&realm_id=number&teacher_preview=1');
assert.equal(rules.number7DemoActivityAllowed(true,12,'quiz'),false);
const program=fs.readFileSync('app/program/page.tsx','utf8');assert.ok(program.includes('const unrestrictedMode = DEMO_MODE || previewMode;'));assert.ok(program.includes('unrestrictedMode ? true : isNumber7 ? number7WeekUnlocked'));
console.log('PASS all 47 demo lesson/quiz activities unlocked without student progress; all 23 protected shared routes, unauthorised sessions, wrong realms, invalid weeks, query tampering, restart and resume isolation.');
