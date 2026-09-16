import assert from 'node:assert/strict';
import {existsSync,writeFileSync} from 'node:fs';
import {YEAR6_MEASUREMENT_FIVE_FORMS as forms,YEAR6_MEASUREMENT_BLUEPRINT as blueprint} from '../data/assessments/revisions/year6MeasurementFiveForms';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
for(const bank of Object.values(forms)){
 assert.equal(bank.length,20);
 bank.forEach((q,i)=>{
  const v=q.visual,n=v.values;let answer:number|string=NaN;
  switch(v.task){
   case 'convert':answer=i===16?Number((n[0]+n[1]/1000).toFixed(3)):Number((n[0]*n[1]).toFixed(3));if(v.art!=='route')assert.ok(existsSync('public/images/measurelands/'+v.art));break;
   case 'rectangle':answer=n[0]*n[1];break;
   case 'missingWidth':answer=n[2]/n[0];break;
   case 'composite':answer=(n[0]-n[2])*n[3]+n[0]*(n[1]-n[3]);break;
   case 'pairArea':assert.equal(n[0]+n[1],n[2]+n[3]);answer=n[2]*n[3]-n[0]*n[1];break;
   case 'pairPerimeter':assert.equal(n[0]*n[1],n[2]*n[3]);answer=2*(n[0]+n[1]-n[2]-n[3]);break;
   case 'line':case 'point':assert.ok(n.every(a=>a>0&&a<360));answer=(v.task==='line'?180:360)-n.slice(0,-1).reduce((a,b)=>a+b,0);assert.equal(n.at(-1),answer);break;
   case 'opposite':answer=n[0];assert.ok(n[0]>0&&n[0]<180);break;
   case 'journey':answer=v.rows![0].arrives-v.rows![0].departs;break;
   case 'wait':answer=v.rows![1].departs-v.rows![0].arrives;break;
   case 'connection':answer=v.rows![1].arrives-v.rows![0].departs;break;
   case 'services':answer=v.rows!.filter(r=>r.arrives<=n[0]).sort((a,b)=>b.departs-a.departs)[0].service;break;
   case 'finish':{const m=n.reduce((a,b)=>a+b,0);answer=String(Math.floor(m/60)*100+m%60).padStart(4,'0');break;}
  }
  assert.equal(q.correctAnswer,String(answer),q.id);assert.ok(isAssessmentAnswerCorrect(q,String(answer)));assert.ok(!isAssessmentAnswerCorrect(q,'idk'));assert.ok(!isAssessmentAnswerCorrect(q,''));
  if(q.options)assert.equal(q.options.filter(a=>isAssessmentAnswerCorrect(q,a)).length,1);else assert.ok(!isAssessmentAnswerCorrect(q,String(Number(answer)+1)));
  assert.equal(q.readAloudText,q.prompt);assert.equal(q.primaryDescriptorCode,blueprint[i][0]);assert.equal(q.difficulty,blueprint[i][2]);
  for(const row of v.rows??[])assert.ok(row.departs<row.arrives&&row.arrives<1440);
 });
}
for(let i=0;i<20;i++){const items=Object.values(forms).map(bank=>bank[i]);assert.equal(new Set(items.map(q=>JSON.stringify(q.visual))).size,5);for(const key of ['type','difficulty','skillId','primaryDescriptorCode'] as const)assert.equal(new Set(items.map(q=>q[key])).size,1);}
writeFileSync('docs/assessment-blueprints/year6-measurement-authoring-inventory.json',JSON.stringify(forms,null,2)+'\n');
console.log('Level 6 Measurement: all 100 independently calculated answers, decimal conversions, timetable constraints, angle sums, area/perimeter relationships, IDK scoring and five matched forms pass.');
