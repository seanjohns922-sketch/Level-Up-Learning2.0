import assert from 'node:assert/strict';
import {existsSync,writeFileSync} from 'node:fs';
import {YEAR1_MEASUREMENT_FIVE_FORMS as forms,YEAR1_MEASUREMENT_FORMS as names,YEAR1_MEASUREMENT_BLUEPRINT as blueprint} from '../data/assessments/revisions/year1MeasurementFiveForms';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
for(const bank of Object.values(forms)){
 assert.equal(bank.length,20);
 bank.forEach((q,i)=>{
  const v=q.visual,n=v.values??[];let expected:string;
  if(i===0)expected='Mass';
  else if(i===1||i===7)expected=String(n[0]);
  else if(i===2)expected=days[(days.indexOf(v.labels[0])+1)%7];
  else if(i===3||i===6||i===9||i===12||i===18)expected=v.labels[n[0]>n[1]?0:1];
  else if(i===4)expected='ABC'[v.variants!.indexOf('fair')];
  else if(i===5)expected='Hours';
  else if(i===8)expected=months[(months.indexOf(v.labels[0])+1)%12];
  else if(i===10)expected=v.labels[n[1]===n[0]?1:2];
  else if(i===11)expected='1 hour||1 day||1 week';
  else if(i===13||i===15)expected=n.map((x,i)=>({x,label:v.labels[i]})).sort((a,b)=>a.x-b.x).map(x=>x.label).join('||');
  else if(i===14)expected='Years';
  else if(i===16){assert.equal(n[0],2*n[1]);expected='Its blocks are longer';}
  else if(i===17)expected=[v.labels[2],v.labels[0],v.labels[1]].join('||');
  else expected='The cubes have different masses';
  assert.equal(q.correctAnswer,expected,q.id);assert.ok(isAssessmentAnswerCorrect(q,expected));assert.ok(!isAssessmentAnswerCorrect(q,'idk'));
  assert.equal(q.primaryDescriptorCode,blueprint[i][0]);assert.equal(q.difficulty,blueprint[i][2]);assert.ok(q.prompt.split(/\s+/).length<=12,q.id);
  if(q.type==='mcq')assert.equal(q.options!.filter(x=>isAssessmentAnswerCorrect(q,x)).length,1);
  if(q.type==='number_order'){assert.notEqual(q.options!.join('||'),expected);assert.ok(!isAssessmentAnswerCorrect(q,expected.split('||').reverse().join('||')));}
  for(const art of v.arts??[])assert.ok(existsSync('public/images/measurelands/'+art),art);
 });
}
for(let i=0;i<20;i++){
 const items=names.map(n=>forms[n][i]);assert.equal(new Set(items.map(q=>q.type)).size,1);assert.equal(new Set(items.map(q=>q.primaryDescriptorCode)).size,1);assert.equal(new Set(items.map(q=>q.difficulty)).size,1);
}
writeFileSync('docs/assessment-blueprints/year1-measurement-authoring-inventory.json',JSON.stringify(forms,null,2)+'\n');
console.log('Level 1 Measurement: 100 independently checked answers, scoring, assets, ordering, IDK and matched codes/difficulty/response modes pass.');
