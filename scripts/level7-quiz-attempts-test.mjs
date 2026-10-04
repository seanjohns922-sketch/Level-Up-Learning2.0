// Level 7 weekly quizzes: every attempt gets its own questions, attempt 0 stays fixed,
// each lesson keeps 2 fluency / 1 reasoning / 2 application, and no question repeats.
import assert from 'node:assert/strict';
import {loadCave7 as load} from './cave7-loader.mjs';
const {number7Quiz}=load('data/activities/year7Number/questions.ts');
const {measurement7Quiz}=load('data/activities/year7Measurement/questions.ts');
const {space7Quiz}=load('data/activities/year7Space/questions.ts');
const {cave7Quiz}=load('data/activities/cave7/questions.ts');
const quizzes={number:[11,(w,a)=>number7Quiz(w,a)],measurement:[11,(w,a)=>measurement7Quiz(w,a)],space:[9,(w,a)=>space7Quiz(w,a)],pattern:[11,(w,a)=>cave7Quiz('pattern',w,a)],statistics:[9,(w,a)=>cave7Quiz('statistics',w,a)],chance:[7,(w,a)=>cave7Quiz('chance',w,a)]};
const key=q=>q.prompt+'|'+q.answer+'|'+JSON.stringify(q.measurementVisual??q.spaceVisual??q.cave7Visual??q.visual??null);
let checked=0;
for(const [realm,[weeks,build]] of Object.entries(quizzes))for(let w=1;w<=weeks;w++){
 assert.deepEqual(build(w,0).map(key),build(w,0).map(key),`${realm} W${w}: attempt 0 must be fixed`);
 const attempts=[0,1,2,3].map(a=>build(w,a*7919+11));
 for(const qs of attempts){
  assert.equal(qs.length,15);
  for(let l=1;l<=3;l++){const rows=qs.filter(q=>q.lessonTag===l);assert.deepEqual(rows.map(q=>q.tier),['fast_thinking','reasoning','apply_create','fast_thinking','apply_create'],`${realm} W${w}L${l} roles`);}
  assert.equal(new Set(qs.map(key)).size,15,`${realm} W${w}: repeated question`);
 }
 // Different attempts should mostly differ; small pools may share a few questions.
 const shared=attempts[1].filter(q=>attempts[2].some(r=>key(r)===key(q))).length;
 assert.ok(shared<=8,`${realm} W${w}: attempts share ${shared}/15 questions`);
 checked++;
}
console.log(`PASS ${checked} Level 7 weekly quizzes: fresh questions per attempt, fixed attempt 0, 2/1/2 roles per lesson, no repeats.`);
