import assert from 'node:assert/strict';
import {loadCave7 as load} from './cave7-loader.mjs';
const {number7Question}=load('data/activities/year7Number/questions.ts');
const generators={number:number7Question,measurement:load('data/activities/year7Measurement/questions.ts').measurement7Question,space:load('data/activities/year7Space/questions.ts').space7Question,...load('data/activities/cave7/questions.ts').CAVE7_GENERATORS};
let count=0;
for(const [realm,generate] of Object.entries(generators))for(let week=1;week<=({space:10,statistics:10,chance:8}[realm]??12);week++)for(let lesson=1;lesson<=3;lesson++)for(let seed=1;seed<=20;seed++)for(const role of ['fast_thinking','reasoning','apply_create']){
 const q=generate(week,lesson,seed*7919,role),context=`${realm} ${week}/${lesson} ${role}`;
 assert.equal(q.readabilityRevision,realm==='number'?7:realm==='measurement'?6:realm==='pattern'?4:realm==='space'?4:realm==='statistics'?3:realm==='chance'?2:1,context);
 if(realm==='number'&&week===6&&(lesson===1||lesson===2)){assert.equal(q.visual.type,'fraction_number_line');assert.ok(q.diagramSpeech);if(role==='reasoning')assert.ok(q.answer.includes('/'));assert.ok(q.prompt.split(/\s+/).length<=16);assert.ok(q.options.every(o=>o.split(/\s+/).length===1));}
 assert.ok(q.prompt.split(/\s+/).length<=50,`${context}: long prompt: ${q.prompt}`);
 for(const option of q.options)assert.ok(option.split(/\s+/).length<=25,`${context}: long choice: ${option}`);
 assert.ok(!q.prompt.includes('Which explanation correctly justifies the result'),context);
 if(realm==='number'&&week===6&&(lesson===1||lesson===2)&&role==='apply_create'){
  const v=q.visual,j=v.jumps;
  assert.ok(j,`${context}: missing movement diagram`);
  assert.equal(j.start,v.markers[0].position);
  assert.ok(Math.abs(j.start+j.step*j.count-Number(q.answer))<1e-8,`${context}: jump must land on the correct answer`);
  assert.ok(j.start+j.step*j.count>=v.min&&j.start+j.step*j.count<=v.max);
  assert.equal(Math.abs(j.step),1/v.subdivisions);
  assert.ok(q.diagramSpeech.includes('question mark'));
  assert.ok(q.diagramSpeech.includes(j.step>0?'jump right':'jump left'));
 }
 if(realm==='number'&&week===7&&(lesson===1||lesson===2)){
  assert.ok(q.prompt.split(/\s+/).length<=20,context);
  assert.ok(q.options.every(o=>o.split(/\s+/).length===1),context);
  if(lesson===2){assert.ok(q.paintContext.need>0);assert.ok(q.paintContext.capacity>0);assert.ok(q.prompt.split(/\s+/).length<=10);}
 }
 count++;
}
for(let seed=1;seed<=100;seed++){
 const q=number7Question(2,3,seed,'apply_create'),[a,b]=q.prompt.match(/\d+/g).map(Number);
 // Two application forms: flashing lights (lowest common multiple) or bead bags (highest common factor).
 if(q.prompt.includes('beads')){let h=Math.min(a,b);while(a%h||b%h)h--;assert.equal(Number(q.answer),h);continue;}
 assert.ok(q.prompt.endsWith('How many seconds until they next flash together?'));
 let lcm=Math.max(a,b);while(lcm%a||lcm%b)lcm++;
 assert.equal(Number(q.answer),lcm);
 assert.ok(number7Question(2,3,seed,'reasoning').options.every(s=>s.split(/\s+/).length<=6));
}
console.log(`PASS ${count} Level 7 wording samples: prompt/choice reading budgets, refreshed resume content and single-unit common-multiple questions.`);
