import fs from 'node:fs';import assert from 'node:assert/strict';import React from 'react';import {domHarness} from './test-support/react-dom-harness.mjs';
const empty=()=>null;
const mocks={
 '@/lib/live-class-client':{trackLiveLearningEvent:()=>{},clearIdleLiveEventTimer:()=>{},scheduleIdleLiveEvent:()=>{}},
 '@/lib/brain-break-settings':{getBrainBreakSchedule:()=>[]},
 '@/lib/speak':{speak:()=>{},stop:()=>{},useSpeakState:()=>({}),useAutoReadSetting:()=>({autoReadEnabled:false}),useSpeechInteractionReady:()=>false},
 '@/components/lesson/SurgeAmbience':{__esModule:true,default:empty},
 '@/components/lesson/NexusActivation':{__esModule:true,default:empty},
 '@/components/lesson/ComboActivation':{__esModule:true,default:empty},
};
function walk(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){const p=dir+'/'+f.name;if(f.isDirectory())walk(p);else if(/\.tsx?$/.test(p))for(const m of fs.readFileSync(p,'utf8').matchAll(/from ['"]([^'"]+\.css)['"]/g))mocks[m[1]]={__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};}}
walk('components');walk('lib');const h=domHarness(mocks);globalThis.localStorage=h.document.defaultView.localStorage;globalThis.sessionStorage=h.document.defaultView.sessionStorage;const oldInterval=globalThis.setInterval,oldClear=globalThis.clearInterval;const intervals=new Map();let id=0;globalThis.setInterval=fn=>{intervals.set(++id,fn);return id};globalThis.clearInterval=id=>intervals.delete(id);
try {
 const {PracticeRunner}=h.load('components/PracticeRunner.tsx');const {Year2LessonEngine}=h.load('components/lesson/Year2LessonEngine.tsx');
 const question={kind:'mcq',prompt:'One plus one?',options:['2','3'],answer:'2'};
 for(const level of [0,1,2,3,4,5,6,7,8]){
  let completed=0;await h.render(PracticeRunner,{minutes:0,getTask:()=>question,onComplete:()=>completed++,levelNumber:level,realmId:'number',liveContext:{level:`Year ${level}`,strand:'Number',week:1,lessonId:`y${level}-w1-l1`},practisedSkills:['Addition'],renderCompletionCard:()=>React.createElement('div',null,'Completion reached')});
  assert.match(h.document.body.textContent,/Coach Review/);assert.equal(completed,1);assert.doesNotMatch(h.document.body.textContent,/Completion reached/);
  await h.click([...h.document.querySelectorAll('button')].find(b=>b.textContent.includes('Continue')));assert.match(h.document.body.textContent,/Completion reached/);assert.equal(completed,1);await h.render(empty,{});
 }
 localStorage.clear();sessionStorage.clear();
 const lesson={id:'y2-w1-l1',week:1,lesson:1,title:'Number order',focus:'Number order',activities:['fast_thinking','reasoning','apply_create'].map(rotationRole=>({activityType:'multiple_choice',weight:1,config:{rotationRole,lessonStructure:"8_minute_rotation"}}))};let completed=0;
 await h.render(Year2LessonEngine,{lesson,realmId:'number',levelNumber:2,onTimedComplete:()=>completed++,onExit:()=>{},renderCompletionCard:()=>React.createElement('div',null,'Completion reached'),questionGenerator:()=>({kind:'multiple_choice',prompt:'One plus one?',options:['2','3'],answer:'2'})});
 const resume=[...h.document.querySelectorAll('button')].find(b=>b.textContent.includes('Resume Lesson'));if(resume)await h.click(resume);
 await h.act(async()=>{for(let n=0;n<540;n++)for(const tick of [...intervals.values()])tick();});
 assert.match(h.document.body.textContent,/Coach Review/);assert.equal(completed,1);
 await h.click([...h.document.querySelectorAll('button')].find(b=>b.textContent.includes('Continue')));assert.match(h.document.body.textContent,/Completion reached/);assert.equal(completed,1);
 const {buildCoachReview}=h.load('lib/lesson-coach.ts');
 const review=buildCoachReview({realmId:'pattern',levelNumber:5,accuracy:50,topicSummaries:[{label:'Balance equations',total:4,correct:2,accuracy:50}],strengths:[],areasToImprove:[{label:'Balance equations',total:4,correct:2,accuracy:50}],practisedSkills:['Balance equations']});
 assert.match(review.coachTip,/both sides equal/);assert.doesNotMatch(review.coachTip,/mass|scale/);assert.ok(review.keepPractising.length);
 const {resolveCoachingKey}=h.load('lib/skill-coaching.ts');
 assert.equal(resolveCoachingKey({lessonId:'y5-algebra-w6-l1',topicLabels:['Balance equations']}),'algebra_equation');
 assert.equal(resolveCoachingKey({realmId:'number',topicLabels:['Unit fractions']}),'fractions');
 const {isPracticeTaskSafe}=h.load('lib/task-safety.ts');
 assert.equal(isPracticeTaskSafe({kind:'fractionTurn',prompt:'Incomplete saved question'}),false);
 const {MeasurelandsFractionTurnCard}=h.load('components/measurelands/MeasurelandsFractionTurnCard.tsx');
 let right=0,wrong=0;await h.render(MeasurelandsFractionTurnCard,{task:{kind:'fractionTurn',scene:'turn',startDirection:'up',turnFraction:'quarter',clockwise:false,prompt:'How much turn?',options:['quarter turn','half turn'],correctOption:'quarter turn'},onCorrect:()=>right++,onWrong:()=>wrong++});
 await h.click([...h.document.querySelectorAll('button')].find(b=>b.textContent==='half turn'));assert.equal(wrong,1);assert.equal(right,0);await h.click([...h.document.querySelectorAll('button')].find(b=>b.textContent==='quarter turn'));assert.equal(right,1);
 const {MeasurelandsPathTaskCard}=h.load('components/measurelands/MeasurelandsPathTaskCard.tsx');
 await h.render(MeasurelandsPathTaskCard,{task:{kind:'measurePath',scene:'compare',prompt:'Which is longer?',paths:[{id:'short',length:5},{id:'long',length:7}],correctPathId:'long'},onCorrect:()=>{},onWrong:()=>{}});
 const rods=[...h.document.querySelectorAll('svg rect')].filter(r=>r.getAttribute('fill')==='url(#rod-front)');assert.equal(rods.length,2);
 assert.ok(Math.abs(Number(rods[0].getAttribute('width'))/5-Number(rods[1].getAttribute('width'))/7)<1e-8,'compared rods must share one unit scale');
 console.log('PASS: real React completion -> coach -> completion card, Prep–8 PracticeRunner and timed Year2LessonEngine; completion fires once. Server persistence and audible speech untested; network effects mocked.');
}finally{globalThis.setInterval=oldInterval;globalThis.clearInterval=oldClear;delete globalThis.localStorage;delete globalThis.sessionStorage;await h.close();}
process.exit(0);
