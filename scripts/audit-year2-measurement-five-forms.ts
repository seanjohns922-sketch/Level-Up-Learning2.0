import assert from 'node:assert/strict';
import {existsSync,writeFileSync} from 'node:fs';
import {YEAR2_MEASUREMENT_FIVE_FORMS as forms,YEAR2_MEASUREMENT_BLUEPRINT as blueprint} from '../data/assessments/revisions/year2MeasurementFiveForms';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
const hour=(h:number)=>(h-1)%12+1;
const weekdays=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
for(const bank of Object.values(forms)){
 assert.equal(bank.length,20);
 bank.forEach((q,i)=>{
  const v=q.visual;let expected='';
  if(v.type==='measurement_year1_panel'){
   const n=v.values??[];
   if(i===0)expected='ABC'[v.variants!.indexOf('fair')];
   else if(i===5||i===10)expected=String(n[0]-n[1]);
   else if(i===11)expected=String(n[1]-n[0]);
   for(const art of v.arts??[])assert.ok(existsSync('public/images/measurelands/'+art),art);
  }else{
   if(v.task==='fraction')expected=v.unequal?'No, the pieces are not equal':v.parts===4?'One quarter':'One eighth';
   else if(v.task==='clock')expected=v.minute===0?`${v.hour} o'clock`:v.minute===30?`Half past ${v.hour}`:v.minute===15?`Quarter past ${v.hour}`:`Quarter to ${hour(v.hour!+1)}`;
   else if(v.task==='turn')expected=v.showEnd?({1:'Quarter turn',3:'Three-quarter turn',4:'Full turn'} as Record<number,string>)[v.steps!]:['Up','Right','Down','Left'][((v.variant??0)%4+2)%4];
   else if(v.task==='precision')expected='Small blocks';
   else if(i===2)expected=String(v.dates![1]-v.dates![0]);
   else if(i===7)expected=String(v.dates![0]+4);
   else if(i===13)expected=String(v.dates![0]+14);
   else if(i===17)expected=weekdays[new Date(Date.UTC(2026,v.month!,v.dates![0])).getUTCDay()];
   if(v.task==='calendar')for(const date of v.dates!)assert.ok(date>0&&date<=new Date(Date.UTC(2026,v.month!+1,0)).getUTCDate());
  }
  assert.equal(q.correctAnswer,expected,q.id);assert.ok(isAssessmentAnswerCorrect(q,expected));assert.ok(!isAssessmentAnswerCorrect(q,'idk'));
  if(q.options)assert.equal(q.options.filter(a=>isAssessmentAnswerCorrect(q,a)).length,1,q.id);
  assert.equal(q.primaryDescriptorCode,blueprint[i][0]);assert.equal(q.difficulty,blueprint[i][2]);assert.ok(q.prompt.split(/\s+/).length<=15,q.id);
 });
}
for(let i=0;i<20;i++){const q=Object.values(forms).map(b=>b[i]);for(const key of ['type','primaryDescriptorCode','difficulty'] as const)assert.equal(new Set(q.map(x=>x[key])).size,1);}
writeFileSync('docs/assessment-blueprints/year2-measurement-authoring-inventory.json',JSON.stringify(forms,null,2)+'\n');
console.log('Level 2 Measurement: 100 independently checked answers, clocks, calendars, turns, fraction partitions, scoring, IDK, assets and matched forms pass.');
