import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {YEAR8_MEASUREMENT_FIVE_FORMS as forms,YEAR8_MEASUREMENT_BLUEPRINT as blueprint} from '../data/assessments/revisions/year8MeasurementFiveForms';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
const rounded=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
const time=(n:number)=>{const minutes=(n%1440+1440)%1440;return String(Math.floor(minutes/60)).padStart(2,'0')+String(minutes%60).padStart(2,'0');};
const dayTime=(n:number)=>`${['Monday','Tuesday','Wednesday','Thursday'][Math.floor(n/1440)]} ${time(n).slice(0,2)}:${time(n).slice(2)}`;
for(const bank of Object.values(forms)){
 assert.equal(bank.length,30);
 bank.forEach((q,i)=>{
  const v=q.visual,n=v.values;let expected:number|string=NaN;
  switch(i){
   case 0:expected=n[0]*n[1]-n[2]*n[3];break;
   case 1:expected=n[0]*n[1]*n[2]/1000;break;
   case 2:expected=rounded(n[0]**2*3.14);break;
   case 3:case 10:expected=time(n[0]+60*(n[2]-n[1]));break;
   case 4:expected=n[0]/n[1];break;
   case 5:expected=Math.hypot(n[0],n[1]);assert.equal(expected,n[2]);break;
   case 6:expected=`${rounded(n[0]*n[1]/100000)} km, after converting the scaled centimetres to kilometres.`;break;
   case 7:expected=(n[0]-n[2])+n[3]+n[2]+(n[1]-n[3])+n[0]+n[1];break;
   case 8:expected=n[0]*n[1]*n[2]/2;break;
   case 9:expected=rounded(n[0]*3.14);break;
   case 11:expected=n[0]/(n[1]/60);break;
   case 12:case 19:expected=Math.sqrt(n[2]**2-n[0]**2);assert.equal(expected,n[1]);break;
   case 13:expected=`${Math.ceil(n[0]*n[2]/n[1])} one-litre pots: allow for two coats and round up to have enough paint.`;assert.notEqual(n[0]*n[2]%n[1],0);break;
   case 14:expected=n[0]*n[1]+n[0]*n[2]/2;break;
   case 15:expected=n[0]*n[1]*n[2]*1000/n[3];break;
   case 16:expected=rounded(n[0]/2*3.14+n[0]);break;
   case 17:expected=(n[1]-60*n[3])-(n[0]-60*n[2]);assert.ok(expected>0&&expected<1440);break;
   case 18:expected=n[4]*(n[0]/n[1]-n[2]/n[3]);expected=rounded(expected);break;
   case 20:expected='The model underestimates the time because the flow rate decreases.';assert.ok(n[2]+(n[1]-n[0]*n[2])/(n[0]/2)>n[1]/n[0]);break;
   case 21:{const arm=(n[0]-n[2])/2;expected=2*arm+2*n[3]+n[2]+2*n[1]+n[0];break;}
   case 22:expected=Math.floor(n[0]/n[3])*Math.floor(n[1]/n[4])*Math.floor(n[2]/n[5]);assert.notEqual(expected,n[0]*n[1]*n[2]/(n[3]*n[4]*n[5]));break;
   case 23:expected=rounded(3.14*(n[0]**2-n[1]**2));assert.ok(n[0]>n[1]);break;
   case 24:{const starts=[9*60-10*60,9*60-8*60,n[0]-5.5*60],ends=[17*60-10*60,17*60-8*60,17*60-5.5*60];const start=Math.max(...starts);assert.ok(start+30<=Math.min(...ends));expected=time(start+10*60);break;}
   case 25:expected=n[0]/1000*60;break;
   case 26:expected=Math.hypot(n[0],n[1]);break;
   case 27:expected=`${Math.ceil((n[0]+n[1])*n[2]/100000/n[3]*60+n[4])} minutes, including walking both sections and the rest break.`;break;
   case 28:{const circumference=Number(v.labels![0].match(/[\d.]+/)![0]);expected=rounded(3.14*(circumference/(2*3.14))**2);break;}
   case 29:expected=dayTime(n[0]+n[1]+60*(n[3]-n[2]));break;
  }
  if(typeof expected==='number')expected=rounded(expected);
  assert.equal(q.correctAnswer,String(expected),q.id);
  assert.ok(isAssessmentAnswerCorrect(q,String(expected)),q.id);
  assert.ok(!isAssessmentAnswerCorrect(q,''));assert.ok(!isAssessmentAnswerCorrect(q,'idk'));
  if(q.options){assert.equal(new Set(q.options).size,q.options.length);assert.equal(q.options.filter(a=>isAssessmentAnswerCorrect(q,a)).length,1);}
  else assert.ok(!isAssessmentAnswerCorrect(q,String(Number(expected)+1)));
  assert.equal(q.primaryDescriptorCode,blueprint[i][0]);assert.equal(q.readAloudText,q.prompt);
  if(v.task==='composite')assert.ok(n[0]>n[2]&&n[1]>n[3]&&n.every(x=>x>0));
 });
 assert.deepEqual([...new Set(bank.map(q=>q.primaryDescriptorCode))].sort(),Array.from({length:7},(_,i)=>`AC9M8M0${i+1}`));
}
for(let i=0;i<30;i++){
 const matched=Object.values(forms).map(bank=>bank[i]);
 for(const key of ['type','difficulty','skillId','primaryDescriptorCode'] as const)assert.equal(new Set(matched.map(q=>q[key])).size,1);
 assert.equal(new Set(matched.map(q=>JSON.stringify(q.visual))).size,5);
 assert.equal(new Set(matched.map(q=>q.visual.orientation)).size,4);
}
writeFileSync('docs/assessment-blueprints/year8-measurement-authoring-inventory.json',JSON.stringify(forms,null,2)+'\n');
console.log('Level 8 Measurement: 150 independently checked answers, seven curriculum descriptors, five matched 30-question forms, time-zone/day rollover and geometry constraints, correct/wrong/blank/IDK scoring passed.');
