import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {loadCave7} from './cave7-loader.mjs';
function moduleAt(file,deps){const m={exports:{}};const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;new Function('require','module','exports',js)(name=>{if(!(name in deps))throw Error(name);return deps[name];},m,m.exports);return m.exports;}
const config=loadCave7('lib/cave7-config.ts'),{CAVE7_WEEK_COUNTS}=config;
const rules=moduleAt('lib/number7-demo.ts',{'./cave7-config':config,'@/lib/program-progress':{getWeekProgress:(store,year,week,realm)=>store[`${realm}:${week}`]??{lessonsCompleted:[false,false,false]}},'@/lib/assessment-rules':{weeklyQuizMinimumCorrect:n=>Math.ceil(n*.8)}});
let lessons=0,quizzes=0;
for(const [realm,count] of Object.entries(CAVE7_WEEK_COUNTS)){
 const store={};
 for(let week=1;week<=count;week++){
  for(let l=1;l<=3;l++){assert.equal(rules.number7DemoActivityAllowed(true,week,l,realm),true);assert.equal(rules.number7DemoActivityAllowed(false,week,l,realm),false);}
  assert.equal(rules.number7DemoActivityAllowed(true,week,'quiz',realm),week<count);
  if(week<count){store[`${realm}:${week}`]={lessonsCompleted:[true,true,true],quizCompleted:true,quizBestCorrect:11,quizTotal:15};assert.equal(rules.number7WeekUnlocked(store,week+1,realm),false);store[`${realm}:${week}`].quizBestCorrect=12;assert.equal(rules.number7WeekUnlocked(store,week+1,realm),true);}
 }
 assert.equal(rules.number7DemoActivityAllowed(true,count+1,1,realm),false);
 assert.equal(rules.number7WeekUnlocked(store,count+1,realm),false);
 assert.match(rules.number7ActivityHref(count,'quiz',realm),new RegExp(`/posttest.*realm_id=${realm}`));
 for(const kind of ['lesson','quiz'])for(const allowed of [true,false]){
  const route=moduleAt(`app/demo-review/shattered-realms/[realm]/${kind}/page.tsx`,{'@/lib/cave7-config':config,'@/lib/number7-demo':rules,'@/lib/demo-session-server':{getServerStarpathAccess:async()=>({allowed})},'next/navigation':{redirect:x=>{throw Error('redirect:'+x)},notFound:()=>{throw Error('not-found')}},'@/app/lesson/page':{default:'lesson'},'@/app/session/page':{default:'quiz'},'@/components/starpath/Space7QuizClient':{default:'quiz'},'@/components/lesson/cave7/Cave7QuizClient':{default:'quiz'},'react/jsx-runtime':{jsx:(type,props)=>({type,props})}}).default;
  const req=(week,l=1,overrides={})=>({params:Promise.resolve({realm}),searchParams:Promise.resolve({realm_id:realm,year:'Year 7',week:String(week),lessonId:`${realm==='number'?'y7':`y7-${realm}`}-w${week}-l${l}`,teacher_preview:'1',expedition:'1',type:'quiz',n:'1',...overrides})});
  if(!allowed){await assert.rejects(route(req(1)),/redirect:\/login/);continue;}
  for(let w=1;w<=(kind==='lesson'?count:count-1);w++)for(let l=1;l<=(kind==='lesson'?3:1);l++){assert.equal((await route(req(w,l))).type,kind);if(kind==='lesson')lessons++;else quizzes++;}
  await assert.rejects(route(req(count+1)),/not-found/);
  await assert.rejects(route(req(1,1,{realm_id:'invalid'})),/redirect:/);
  if(kind==='quiz')await assert.rejects(route(req(count)),/redirect:\/posttest/);
  else await assert.rejects(route(req(1,1,{lessonId:'y7-invalid-w1-l1'})),/not-found/);
 }
}
const cavern=loadCave7('lib/world3d/shattered-realms.ts');
for(const [realm,count] of Object.entries(CAVE7_WEEK_COUNTS)){
 for(let w=1;w<=count;w++){const [x,,z]=cavern.cavernDoor(w);assert.equal(cavern.cavernNearest(x,z,realm),w);assert.equal(cavern.cavernWeek(w,realm),w);}
 const [x,,z]=cavern.cavernDoor(count+1);assert.equal(cavern.cavernNearest(x,z,realm),null);assert.equal(cavern.cavernWeek(count+1,realm),1);assert.match(cavern.cavernWeekHref(realm,count),new RegExp(`week=${count}&`));
}
console.log(`PASS ${lessons} protected lessons and ${quizzes} quizzes across all six Level 7 realms; realm lengths, exact 80% gates, unauthorised sessions, invalid links, final post-tests and matching cavern doors.`);
