import { groundMeasurementVisualSpeech } from '../data/assessments/revisions/groundMeasurementVisualSpeech';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {GROUND_MEASUREMENT_FIVE_FORMS as forms,GROUND_MEASUREMENT_FORMS as names,GROUND_MEASUREMENT_BLUEPRINT as blueprint} from '../data/assessments/revisions/groundMeasurementFiveForms';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const ids=new Set<string>();
for(const name of names){
 const bank=forms[name];assert.equal(bank.length,20);
 bank.forEach((q,i)=>{
  assert.ok(!ids.has(q.id));ids.add(q.id);assert.equal(q.primaryDescriptorCode,blueprint[i][0]);assert.equal(q.difficulty,blueprint[i][2]);
  assert.equal(q.answer,q.correctAnswer);assert.equal(q.scoring.correctResponse,q.correctAnswer);
  assert.ok(isAssessmentAnswerCorrect(q,q.correctAnswer),q.id);assert.ok(!isAssessmentAnswerCorrect(q,'idk'),q.id);assert.ok(!isAssessmentAnswerCorrect(q,''),q.id);
  assert.ok(q.prompt.split(/\s+/).length<=12,q.id);assert.ok(q.readAloudText.startsWith(q.prompt));assert.ok(q.visual.description.length>15);
  assert.equal(q.visual.type,'measurement_ground_panel');if(q.visual.art)assert.ok(existsSync('public/images/measurelands/'+q.visual.art));assert.equal(new Set(q.options).size,3);
  const v=q.visual,values=v.values??[];let expected:string;
  if([0,1,2,4,5,11,12].includes(i)){
   const max=[0,2,4,11].includes(i);const chosen=values[0]===Math[max?'max':'min'](...values)?0:1;
   expected=v.labels[chosen];assert.equal(values.length,2);assert.ok(values[0]!==values[1]);
  }else if(i===3)expected='Line up one end';
  else if(i===6){assert.equal(values[0],values[1]);expected='Same mass';}
  else if(i===7){assert.ok(values[0]>values[1]);assert.equal(v.scene,'size-trap');expected='Its pan is lower';}
  else if(i===8||i===9){assert.equal(v.remainder,true);assert.equal(v.equal,false);expected=v.labels[i===8?v.source!:1-v.source!];}
  else if(i===10){assert.equal(v.equal,true);assert.equal(v.remainder,false);expected='Same capacity';}
  else if(i===13)expected='Morning';
  else if(i===14)expected='Night';
  else if(i===15)expected=days[(days.indexOf(v.days![0])+1)%7];
  else if(i===16)expected=days[(days.indexOf(v.days![1])+6)%7];
  else if(i===17){assert.equal(v.days![0],'Sunday');expected='Monday';}
  else if(i===18)expected='Morning||Lunchtime||Afternoon';
  else expected=v.labels.join('||');
  assert.equal(q.correctAnswer,expected,q.id);
  if(q.type==='mcq')assert.equal(q.options.filter(o=>isAssessmentAnswerCorrect(q,o)).length,1,q.id);
  else {assert.notEqual(q.options.join('||'),expected);assert.ok(!isAssessmentAnswerCorrect(q,expected.split('||').reverse().join('||')));}
  // Diagrams are direct comparisons: no numbered measuring units or formal time readings.
  assert.ok(!/\b(cm|metres|kilograms|litres|minutes|hours|months)\b/i.test(q.prompt));
 });
 assert.equal(bank.filter(q=>q.primaryDescriptorCode==='AC9MFM01').length,13);
}
for(let i=0;i<20;i++){
 const items=names.map(n=>forms[n][i]);assert.equal(new Set(items.map(q=>q.type)).size,1);assert.equal(new Set(items.map(q=>q.structureKey)).size,1);assert.equal(new Set(items.map(q=>JSON.stringify(q.visual))).size,5,`Slot ${i+1}: distinct visual examples`);
}
for(const asset of ['routine-3d/routine-wakeup.png','routine-3d/routine-bed.png','week2-3d/book.png','week2-3d/apple.png','week2-3d/rock.png','week2-3d/soccer-ball.png','week2-3d/backpack.png','timeofday-3d/morning.png','timeofday-3d/lunch.png','timeofday-3d/afternoon.png'])assert.ok(existsSync('public/images/measurelands/'+asset));
assert.ok(readFileSync('app/demo-review/measurement-ground/page.tsx','utf8').includes("if(!access.allowed)redirect('/login')"));
writeFileSync('docs/assessment-blueprints/ground-measurement-authoring-inventory.json',JSON.stringify(forms,null,2)+'\n');
console.log('Ground Measurement: 100 independently checked answers, diagrams, scoring and unknown responses; 13 direct-comparison and 7 sequence items per form; matched difficulty and response types; five distinct visual examples per slot.');

for (const bank of Object.values(forms)) for (const q of bank) {
 const v=q.visual, speech=groundMeasurementVisualSpeech(v);
 assert.ok(speech.length>20 && !/undefined|NaN/.test(speech), q.id);
 const visible = v.task==='daypart' ? [v.scene!] : v.task==='weekday' ? [v.context!, ...v.days!.filter(d=>d!=='?')] : v.labels;
 for (const text of visible) assert.ok(speech.includes(text), `${q.id}: missing spoken label ${text}`);
 if(v.task==='routine') assert.ok(speech.includes('Tap the answers below in order.'));
 if(v.task==='capacity') for(const text of ['At first','After pouring','full','empty']) assert.ok(speech.includes(text));
 if(v.task==='duration') for(const text of ['Both start together','Finished','Watch both activities']) assert.ok(speech.includes(text));
}
console.log('All 100 diagrams have narration covering their visible labels, captions and instructions.');
