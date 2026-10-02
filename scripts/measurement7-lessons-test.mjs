import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadMeasurement7} from './measurement7-loader.mjs';
const {MEASUREMENT7_WEEKS,MEASUREMENT7_PROGRAM}=loadMeasurement7('curriculum');
const {measurement7Question,measurement7Quiz}=loadMeasurement7('questions');
// Independent calculations use numbers in the displayed prompt, not generator
// intermediates, explanations, formulas or stored answers.
function expected(key,q){
 const n=(q.prompt.match(/\d+(?:\.\d+)?/g)||[]).map(Number),[a,b,c,d,e,f,g,h]=n,A=q.tier==='apply_create';
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
 case 19:case 20:case 22:case 23:return a;
 case 21:case 24:return 180-a;
 case 25:return A?a+b:180-a-b;
 case 26:return A?180-(180-a)/2:(180-a)/2;
 case 27:return A?a-b:a+b;
 case 28:return A?180-(360-a-b-c):360-a-b-c;
 case 29:return A?a/180+2:(a-2)*180;
 case 30:return (720-a)/(A?2:1);
 case 31:return c*(A?a+b:b)/a;
 case 32:return c/5*(A?1:2);
 case 33:return A?d-c/a*b:(a+b)*Math.min(c/a,d/b);
 case 34:return A?e/4:e*4; // ratio precedes quantities, repeated ratio follows
 case 35:return A?c*100/b:c*b/100;
 case 36:return A?f-(c/5*2*d+c/5*3*e):c/5*2*d+c/5*3*e;
 default:throw Error(key);
 }
}
const reasonFragments={1:'Two copies',2:'because it is perpendicular',3:'Move one end triangle',4:'Double the area',5:'It stays the same',6:'Add half base',7:'layers contains',8:' × ',9:'cross-section is a triangle',10:'Divide volume by cross-sectional area',11:'1000 cm³ equals 1 L',12:'holds half as much',13:'through the centre',14:'Circumference divided by diameter',15:' × π',16:'needs diameter',17:'Divide circumference by twice pi',18:'Circumference × number',19:'corresponding angles are equal',20:'alternate angles are equal',21:'co-interior angles sum to 180',22:'corresponding angles are equal',23:'alternate angles are equal',24:'co-interior angles sum to 180',25:'sum to 180',26:'divide by 2',27:'after subtracting the adjacent',28:'two triangles',29:'− 2',30:'Only if',31:'',32:'five equal ratio parts',33:'smaller scale',34:'Four times the extra',35:'cm in reality',36:'cost of each share'};
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
   assert.ok(q.answer.includes(reasonFragments[key]),`${key}: ${q.answer}`);
   const n=(q.prompt.match(/\d+(?:\.\d+)?/g)||[]).map(Number);
   if(key===8)assert.equal(q.answer,`${n[0]} × ${n[1]}`);
   if(key>=19&&key<=24)assert.equal(Number(q.answer.match(/^\d+/)[0]),[21,24].includes(key)?180-n[0]:n[0]);
   if(key===31)assert.equal(q.answer,`1/${n[1]+1}`);
  }
  if(q.measurementVisual){assert.ok(q.measurementVisual.description);assert.ok(q.measurementVisual.values.every(Number.isFinite));}
  count++;
 }
}
for(let w=1;w<=11;w++){
 const quiz=measurement7Quiz(w);assert.equal(quiz.length,15);assert.equal(new Set(quiz.map(q=>q.id)).size,15);
 for(let l=1;l<=3;l++){const qs=quiz.filter(q=>q.lessonTag===l);assert.equal(qs.length,5);assert.equal(qs.filter(q=>q.tier==='reasoning').length,1);assert.equal(qs.filter(q=>q.tier==='apply_create').length,2);assert.equal(new Set(qs.map(q=>q.prompt)).size,5,'Quiz questions must be distinct');}
 for(const q of quiz)if(q.tier!=='reasoning')assert.equal(Number(q.answer),Math.round(expected((w-1)*3+q.lessonTag,q)*100)/100);
}
assert.throws(()=>measurement7Quiz(12));
const csv=fs.readFileSync('public/curriculum/measurement-level7-scope-and-sequence.csv','utf8');assert.equal(csv.trim().split('\n').length,49);
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
