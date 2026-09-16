import assert from 'node:assert/strict';
import {existsSync,writeFileSync} from 'node:fs';
import {YEAR3_MEASUREMENT_FIVE_FORMS as forms,YEAR3_MEASUREMENT_BLUEPRINT as blueprint} from '../data/assessments/revisions/year3MeasurementFiveForms';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
for(const bank of Object.values(forms)){
 assert.equal(bank.length,20);
 bank.forEach((q,i)=>{
  const v=q.visual,n=v.values??[];let expected='';
  if(v.task==='clock') {expected=`${v.hour}:${String(v.minute).padStart(2,'0')}`;assert.ok(v.minute!>=0&&v.minute!<60);}
  else if(v.task==='ruler'){expected=String(n[0]);assert.ok((v.start??0)+n[0]<=15);}
  else if(v.task==='scale'||v.task==='jug'){expected=String(n[0]);assert.ok(n[0]>0&&n[0]<1000&&n[0]%100===0);}
  else if(v.task==='planks')expected=String(n[0]-n[1]);
  else if(v.task==='benchmark')expected=String(n[0]*v.quantity!);
  else if(v.task==='object')expected='Kilograms';
  else if(v.task==='angle')expected=v.compareArms?'Both are equal':v.angle===180?'2':v.angle!<90?'Less than a right angle':'Greater than a right angle';
  else if(v.task==='duration')expected=String(n.length===2?n[0]*60-n[1]:n[0]*(v.unit==='days'?24:60));
  assert.equal(q.correctAnswer,expected,q.id);assert.ok(isAssessmentAnswerCorrect(q,expected));assert.ok(!isAssessmentAnswerCorrect(q,'idk'));
  if(q.options){assert.equal(new Set(q.options).size,q.options.length);assert.equal(q.options.filter(a=>isAssessmentAnswerCorrect(q,a)).length,1,q.id);}
  assert.equal(q.primaryDescriptorCode,blueprint[i][0]);assert.equal(q.difficulty,blueprint[i][2]);assert.ok(q.prompt.split(/\s+/).length<=15,q.id);
  for(const art of v.arts??[])assert.ok(existsSync('public/images/measurelands/'+art),art);
 });
}
for(let i=0;i<20;i++){const q=Object.values(forms).map(b=>b[i]);for(const key of ['type','primaryDescriptorCode','difficulty'] as const)assert.equal(new Set(q.map(x=>x[key])).size,1);}
writeFileSync('docs/assessment-blueprints/year3-measurement-authoring-inventory.json',JSON.stringify(forms,null,2)+'\n');
console.log('Level 3 Measurement: 100 independent answer checks; labelled instrument geometry; time conversions; matched forms; scoring, IDK and assets pass.');
