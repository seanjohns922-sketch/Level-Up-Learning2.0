import assert from 'node:assert/strict';
import {loadCave7 as load} from './cave7-loader.mjs';
const {number7Question}=load('data/activities/year7Number/questions.ts');
const generators={number:number7Question,measurement:load('data/activities/year7Measurement/questions.ts').measurement7Question,space:load('data/activities/year7Space/questions.ts').space7Question,...load('data/activities/cave7/questions.ts').CAVE7_GENERATORS};
let count=0;
for(const [realm,generate] of Object.entries(generators))for(let week=1;week<=({space:10,statistics:10,chance:8}[realm]??12);week++)for(let lesson=1;lesson<=3;lesson++)for(let seed=1;seed<=20;seed++)for(const role of ['fast_thinking','reasoning','apply_create']){
 const q=generate(week,lesson,seed*7919,role),context=`${realm} ${week}/${lesson} ${role}`;
 assert.equal(q.readabilityRevision,realm==='number'&&week===7&&lesson===1?2:realm==='number'&&week===6&&(lesson===1||lesson===2)?2:realm==='number'&&week===5&&(lesson===1||lesson===2)?3:1,context);
 if(realm==='number'&&week===5&&(lesson===1||lesson===2)){assert.equal(q.visual.type,'fraction_number_line');assert.ok(q.diagramSpeech);if(role==='reasoning')assert.ok(q.answer.includes('/'));assert.ok(q.prompt.split(/\s+/).length<=16);assert.ok(q.options.every(o=>o.split(/\s+/).length===1));}
 assert.ok(q.prompt.split(/\s+/).length<=50,`${context}: long prompt: ${q.prompt}`);
 for(const option of q.options)assert.ok(option.split(/\s+/).length<=25,`${context}: long choice: ${option}`);
 assert.ok(!q.prompt.includes('Which explanation correctly justifies the result'),context);
 if(realm==='number'&&week===6&&(lesson===1||lesson===2)){
  assert.ok(q.prompt.split(/\s+/).length<=20,context);
  assert.ok(q.options.every(o=>o.split(/\s+/).length===1),context);
  if(lesson===2){assert.ok(q.paintContext.need>0);assert.ok(q.paintContext.capacity>0);assert.ok(q.prompt.split(/\s+/).length<=10);}
 }
 count++;
}
for(let seed=1;seed<=100;seed++){
 const q=number7Question(2,3,seed,'apply_create'),[a,b]=q.prompt.match(/\d+/g).map(Number);
 assert.ok(q.prompt.endsWith('How many seconds until they next flash together?'));
 let lcm=Math.max(a,b);while(lcm%a||lcm%b)lcm++;
 assert.equal(Number(q.answer),lcm);
 assert.ok(number7Question(2,3,seed,'reasoning').options.every(s=>s.split(/\s+/).length<=6));
}
console.log(`PASS ${count} Level 7 wording samples: prompt/choice reading budgets, refreshed resume content and single-unit common-multiple questions.`);
