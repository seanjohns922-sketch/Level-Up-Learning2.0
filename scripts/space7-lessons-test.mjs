import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadSpace7} from './space7-loader.mjs';
const {SPACE7_WEEKS,SPACE7_PROGRAM}=loadSpace7('curriculum');
const {space7Question,space7Quiz}=loadSpace7('questions');
const pair=p=>`(${p.x}, ${p.y})`;
// Calculate from displayed coordinates and properties, independently of the
// generator's answer/explanation. Direction and order are deliberately tested.
function check(key,q){
 const A=q.tier==='apply_create',R=q.tier==='reasoning',v=q.spaceVisual,n=(q.prompt.match(/-?\d+/g)||[]).map(Number);
 let answer;
 if(!R){
  if(key===3)answer=String(n[0]+(A?2:0));
  if(key>=4&&key<=7){const h=v.heights,front=[0,1,2].map(i=>Math.max(h[i],h[i+3])),side=[Math.max(...h.slice(0,3)),Math.max(...h.slice(3))];answer=String(key===4?h.filter(Boolean).length:key===5?(A?front.reduce((s,x)=>s+x,0):front.join(', ')):key===6?(A?side[0]+side[1]:side.join(', ')):h.reduce((s,x)=>s+x,0)-(A?h.filter(Boolean).length:0));}
  if(key===8)answer=String(n[0]*(A?n[2]:1));
  if(key===10){const distinct=new Set(n.slice(0,3)).size;answer=distinct===1?'Equilateral':distinct===2?'Isosceles (exactly two equal sides)':'Scalene';assert.ok(n[0]+n[1]>n[2]);}
  if(key===11)answer=Math.max(...n.slice(0,3))>90?'Obtuse':n.slice(0,3).includes(90)?'Right-angled':'Acute';
  if(key===12)answer=String(A?Math.abs(n[0]-n[1])+1:n[0]+n[1]-1);
  if(key===19)answer=pair({x:n[0]+n[2]*(A?2:1),y:n[1]-n[3]*(A?2:1)});
  if(key===20)answer=v.shape.map(p=>pair({x:p.x+n[6]-(A?1:0),y:p.y-n[7]})).join('; ');
  if(key===21)answer=pair({x:(n[2]-n[0])*(A?-1:1),y:(n[3]-n[1])*(A?-1:1)});
  if(key===22||key===23)answer=pair({x:(A||key===23)?-n[0]:n[0],y:(A||key===22)?-n[1]:n[1]});
  if(key===24){const first=2*n[2]-n[0];answer=pair({x:2*n[3]-first,y:n[1]});}
  if(key===25)answer=pair(A?{x:-n[0],y:-n[1]}:{x:n[1],y:-n[0]});
  if(key===26){const [x,y,cx,cy]=n,rx=x-cx,ry=y-cy;answer=pair({x:cx+(A?-ry:ry),y:cy+(A?rx:-rx)});}
  if(key===27)answer=pair({x:A?-n[0]+n[2]:-(n[0]+n[2]),y:n[1]});
  if(key===28)answer=n[0]===n[2]?'Equilateral':'Isosceles';
  if(key===30)answer=new Set(n.slice(0,4)).size===1?'Square':'Non-square rectangle';
 }
 if(key===9){answer=q.prompt.includes('sheet')?'A labelled net':q.prompt.includes('stack heights')?'A height plan':'An isometric drawing';}
 if(answer!==undefined)assert.equal(q.answer,answer,JSON.stringify({key,q}));
 if(v?.polygons)for(const p of v.polygons){assert.ok(p.points.length>=3);assert.ok(p.caption);}
 if(v?.shape)for(const p of [...v.shape,...v.image??[]])assert.ok(Math.abs(p.x)<=6&&Math.abs(p.y)<=6);
 assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.options.includes(q.answer));assert.equal(q.steps.length,3);
}
let count=0;assert.equal(SPACE7_WEEKS.length,12);
for(let w=1;w<=12;w++)for(let l=1;l<=3;l++)for(let seed=1;seed<=200;seed++)for(const role of ['fast_thinking','reasoning','apply_create']){check((w-1)*3+l,space7Question(w,l,seed*7919,role));count++;}
for(let w=1;w<=11;w++){
 const qs=space7Quiz(w);assert.equal(qs.length,15);assert.equal(new Set(qs.map(q=>q.id)).size,15);
 for(let l=1;l<=3;l++){const rows=qs.filter(q=>q.lessonTag===l);assert.equal(rows.length,5);assert.equal(rows.filter(q=>q.tier==='reasoning').length,1);assert.equal(rows.filter(q=>q.tier==='apply_create').length,2);assert.equal(new Set(rows.map(q=>q.prompt+JSON.stringify(q.spaceVisual)+q.options.slice().sort().join('|'))).size,5);}
 qs.forEach(q=>check((w-1)*3+q.lessonTag,q));
}
assert.throws(()=>space7Quiz(12));
assert.equal(fs.readFileSync('public/curriculum/space-level7-scope-and-sequence.csv','utf8').trim().split('\n').length,49);
console.log(`PASS ${count} Space practice variants and 165 quiz questions; independent numeric/coordinate checks, unique choices, quiz balance and export.`);
// Exercise shared authenticated route handlers with Space URLs, rather
// than granting access via teacher_preview query parameters alone.
const ts=(await import('typescript')).default;
function moduleAt(path,deps){const module={exports:{}};const js=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;new Function('require','module','exports',js)(name=>{if(!(name in deps))throw Error(name);return deps[name];},module,module.exports);return module.exports;}
const rules=moduleAt('lib/number7-demo.ts',{'@/lib/program-progress':{getWeekProgress:(store,year,week,realm)=>store[`${realm}:${week}`]??{lessonsCompleted:[false,false,false]}},'@/lib/assessment-rules':{weeklyQuizMinimumCorrect:n=>Math.ceil(.8*n)}});
for(let w=1;w<=12;w++)for(const l of [1,2,3,'quiz'])assert.equal(rules.number7DemoActivityAllowed(true,w,l),!(w===12&&l==='quiz'));
const store={};for(let w=1;w<=11;w++){store[`space:${w}`]={lessonsCompleted:[true,true,true],quizCompleted:true,quizBestCorrect:11,quizTotal:15};assert.equal(rules.number7WeekUnlocked(store,w+1,'space'),false);store[`space:${w}`].quizBestCorrect=12;assert.equal(rules.number7WeekUnlocked(store,w+1,'space'),true);assert.equal(rules.number7WeekUnlocked(store,w+1,'number'),false);}
for(const kind of ['lesson','quiz'])for(const allowed of [false,true]){
 const route=moduleAt(`app/demo-review/shattered-realms/[realm]/${kind}/page.tsx`,{'@/lib/demo-session-server':{getServerStarpathAccess:async()=>({allowed})},'next/navigation':{redirect:x=>{throw Error('redirect:'+x);},notFound:()=>{throw Error('not-found');}},'@/lib/number7-demo':rules,'@/app/lesson/page':{default:'lesson'},'@/app/session/page':{default:'quiz'},'@/components/starpath/Space7QuizClient':{default:'quiz'},'react/jsx-runtime':{jsx:(type,props)=>({type,props})}}).default;
 const req=(week,overrides={})=>({params:Promise.resolve({realm:'space'}),searchParams:Promise.resolve({realm_id:'space',year:'Year 7',week:String(week),lessonId:`y7-space-w${week}-l1`,teacher_preview:'1',expedition:'1',type:'quiz',n:'1',...overrides})});
 if(!allowed){await assert.rejects(route(req(1)),/redirect:\/login/);continue;}
 for(let w=1;w<=(kind==='quiz'?11:12);w++)assert.equal((await route(req(w))).type,kind);
 await assert.rejects(route(req(13)),/not-found/);
 await assert.rejects(route(req(1,{realm_id:'number'})),/redirect:.*space/);
 if(kind==='lesson')await assert.rejects(route(req(1,{lessonId:'y7-w1-l1'})),/not-found/);
 else await assert.rejects(route(req(12)),/redirect:\/posttest.*space/);
}
// Verify custom generator uses the engine's three-argument calling convention.
const {generateSpace7Question}=loadSpace7('questions');
for(const w of SPACE7_PROGRAM)for(const lesson of w.lessons)for(const activity of lesson.activities)assert.equal(generateSpace7Question(5,lesson,activity).lessonId,lesson.id);
console.log('PASS demo access, 23 protected routes, invalid and cross-realm links, exact 80% gates, realm-isolated progress and engine generator integration.');
