import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {YEAR7_MEASUREMENT_FIVE_FORMS as forms,YEAR7_MEASUREMENT_BLUEPRINT as blueprint} from '../data/assessments/revisions/year7MeasurementFiveForms';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
for(const bank of Object.values(forms)){
 assert.equal(bank.length,30);
 bank.forEach((q,i)=>{
  const v=q.visual,n=v.values;let answer:number|string=NaN;
  switch(i){
   case 0:answer=n[0]*n[1]/2;break;
   case 1:answer=n.reduce((a,b)=>a*b,1);break;
   case 2:answer=n[0]*2;break;
   case 3:answer=n[0];assert.equal(v.relation,'corresponding');break;
   case 4:answer=180-n[0]-n[1];assert.equal(n[2],answer);break;
   case 5:answer=n[2]/n[0]*n[1];break;
   case 6:answer=n[0]*n[1];break;
   case 7:answer=n[0]*n[1]*n[2]/2;break;
   case 8:answer=Math.round(n[0]*314)/100;break;
   case 9:answer=`${n[0]}°, because alternate angles are equal.`;assert.equal(v.relation,'alternate');break;
   case 10:answer=(180-n[2])/2;assert.equal(n[0],answer);assert.equal(n[1],answer);break;
   case 11:answer=n[2]*n[0]/(n[0]+n[1]);break;
   case 12:{const area=Number(v.labels![0].match(/[\d.]+/)![0]);answer=2*area/n[0];break;}
   case 13:{const volume=Number(v.labels![0].match(/[\d.]+/)![0]);answer=volume/(n[1]*n[2]);break;}
   case 14:answer=v.circleMeasure==='radius'?'2 × π × r':'π × d';break;
   case 15:answer=(n[0]*n[1]+n[2]*n[3])/2;break;
   case 16:answer=n[0]*n[1]*n[2]-n[3]*n[4]*n[5]/2;assert.ok(answer>0);break;
   case 17:answer=`${180-n[0]}°, because co-interior angles add to 180°.`;assert.equal(v.relation,'cointerior');break;
   case 18:answer=360-n[0]-n[1]-n[2];assert.equal(n[3],answer);break;
   case 19:{const batches=Math.min(n[2]/n[0],n[3]/n[1]);assert.equal(batches,n[2]/n[0]);answer=`${(n[0]+n[1])*batches} mL, using all the blue paint and keeping the ${n[0]}:${n[1]} ratio.`;break;}
   case 20:{const area=Number(v.labels![0].match(/[\d.]+/)![0]);answer=area/n[0];assert.equal(v.unknown,'height');break;}
   case 21:answer=n[0]*n[1]*n[2]/2/1000;break;
   case 22:answer=Math.round(n[0]*628)/100;break;
   case 23:{const circumference=Number(v.labels![1].match(/[\d.]+/)![0]);answer=Math.round(circumference/3.14*100)/100;break;}
   case 24:answer=`${n[0]}°, because corresponding angles are equal.`;break;
   case 25:answer=180-n[0];assert.equal(v.relation,'cointerior');break;
   case 26:answer=`${180-n[0]-n[1]}°, because the three interior angles add to 180°.`;break;
   case 27:answer='The diagonal makes two triangles, each with an angle sum of 180°.';assert.ok(v.angleSumModel);assert.equal(n.reduce((a,b)=>a+b),360);break;
   case 28:answer=(n[2]+n[4])*n[1]/n[0]-n[3];break;
   case 29:answer=n[2]*1000*n[0]/(n[0]+n[1]);break;
  }
  assert.equal(q.correctAnswer,String(answer),q.id);assert.ok(isAssessmentAnswerCorrect(q,String(answer)));assert.ok(!isAssessmentAnswerCorrect(q,'idk'));assert.ok(!isAssessmentAnswerCorrect(q,''));
  if(q.options)assert.equal(q.options.filter(a=>isAssessmentAnswerCorrect(q,a)).length,1);else assert.ok(!isAssessmentAnswerCorrect(q,String(Number(answer)+1)));
  assert.equal(q.readAloudText,q.prompt);assert.equal(q.primaryDescriptorCode,blueprint[i][0]);assert.equal(q.difficulty,blueprint[i][2]);
  if(['triangleAngles','quadAngles'].includes(v.task))assert.ok(n.every(a=>a>0&&a<180));
 });
 for(let descriptor=1;descriptor<=6;descriptor++)assert.equal(bank.filter(q=>q.primaryDescriptorCode===`AC9M7M0${descriptor}`).length,5);
 assert.deepEqual([...new Set(bank.map(q=>q.primaryDescriptorCode))].sort(),Array.from({length:6},(_,i)=>`AC9M7M0${i+1}`));
}
for(let i=0;i<30;i++){const items=Object.values(forms).map(bank=>bank[i]);assert.equal(new Set(items.map(q=>JSON.stringify(q.visual))).size,5);for(const key of ['type','difficulty','skillId','primaryDescriptorCode'] as const)assert.equal(new Set(items.map(q=>q[key])).size,1);}
writeFileSync('docs/assessment-blueprints/year7-measurement-authoring-inventory.json',JSON.stringify(forms,null,2)+'\n');
console.log('Level 7 Measurement: 150 independently calculated answers; all six descriptors; matched forms; angle/area/volume/ratio constraints and correct/incorrect/blank/IDK scoring pass.');
