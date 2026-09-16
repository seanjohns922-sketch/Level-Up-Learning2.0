import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {YEAR4_MEASUREMENT_FIVE_FORMS as forms,YEAR4_MEASUREMENT_BLUEPRINT as blueprint} from '../data/assessments/revisions/year4MeasurementFiveForms';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
import {formatMeasurelandsReviewAnswer,toMeasurelandsTimeResponse,fromMeasurelandsTimeResponse} from '../data/assessments/measurelandsPresentation';
for(const bank of Object.values(forms)){
 assert.equal(bank.length,20);
 bank.forEach((q,i)=>{
  const v=q.visual,n=v.values;let expected='';
  switch(v.task){
   case 'interval':expected=String(n[0]/n[1]);break;
   case 'ruler':expected=String(n[0]);assert.ok((v.start??0)+n[0]<=15);assert.ok(Math.abs(n[0]*10-Math.round(n[0]*10))<1e-8);break;
   case 'scale':case 'jug':case 'thermometer':expected=String(n[0]);break;
   case 'perimeter':{const[w,h,a,b]=n;const points=v.lShape?[[0,0],[w-a,0],[w-a,h-b],[w,h-b],[w,h],[0,h]]:[[0,0],[w,0],[w,h],[0,h]];expected=String(points.reduce((sum,[x,y],j)=>{const[nx,ny]=points[(j+1)%points.length];return sum+Math.hypot(nx-x,ny-y);},0));break;}
   case 'duration':expected=String(n[0]);break;
   case 'area':expected=String(v.areaCells?v.areaCells.reduce((sum,cell)=>sum+(cell[2]==='full'?1:.5),0):v.halfCells?(n[0]-1)*n[1]+n[1]/2:n.length===4?n[0]*n[1]-n[2]*n[3]:n[0]*n[1]);break;
   case 'angle':expected=v.compareArms?'Both are equal':n[0]===180?'Straight':n[0]>180?'Reflex':n[0]>90?'Obtuse':'Acute';break;
   case 'timeline':if(q.answerFormat?.kind==='time'){const end=n.reduce((a,b)=>a+b,0);expected=String(Math.floor(end/60)*100+end%60).padStart(4,'0');const parts=fromMeasurelandsTimeResponse(expected,'12h_meridiem');assert.equal(toMeasurelandsTimeResponse(parts.hour,parts.minute,'12h_meridiem',parts.meridiem),expected);}else expected=String(n[1]-n[0]);break;
  }
  assert.equal(q.correctAnswer,expected,q.id);assert.ok(isAssessmentAnswerCorrect(q,expected),q.id);assert.ok(!isAssessmentAnswerCorrect(q,'idk'));assert.ok(!isAssessmentAnswerCorrect(q,''));
  if(q.options){assert.equal(new Set(q.options).size,q.options.length);assert.equal(q.options.filter(a=>isAssessmentAnswerCorrect(q,a)).length,1,q.id);}else assert.ok(!isAssessmentAnswerCorrect(q,String(Number(expected)+1)));
  assert.equal(q.primaryDescriptorCode,blueprint[i][0]);assert.equal(q.difficulty,blueprint[i][2]);assert.equal(q.readAloudText,q.prompt);assert.ok(v.description.length>0);assert.ok(q.prompt.split(/\s+/).length<=16,q.id);
  if(v.task==='scale')assert.ok(n[0]%100===50&&n[0]<1000);
  if(v.task==='jug')assert.ok(n[0]%.5===.25&&n[0]<2);
 });
}
for(let i=0;i<20;i++){const q=Object.values(forms).map(b=>b[i]);for(const key of ['type','primaryDescriptorCode','difficulty','skillId'] as const)assert.equal(new Set(q.map(x=>x[key])).size,1);assert.ok(new Set(q.map(x=>JSON.stringify(x.visual))).size>=3);}
for(const [h,m,period] of [['','30','PM'],['13','00','PM'],['2','60','PM'],['2','3','PM'],['2','30',null]] as const)assert.equal(toMeasurelandsTimeResponse(h,m,'12h_meridiem',period),'');
assert.equal(toMeasurelandsTimeResponse('12','25','12h_meridiem','PM'),'1225');
assert.equal(toMeasurelandsTimeResponse('12','25','12h_meridiem','AM'),'0025');
assert.equal(formatMeasurelandsReviewAnswer('1915',forms.posttest[11].answerFormat),'7:15 pm');
assert.equal(formatMeasurelandsReviewAnswer('1225',forms.posttest[19].answerFormat),'12:25 pm');
for(const bank of Object.values(forms)){const q=bank[18];assert.equal(q.visual.areaCells!.filter(c=>c[2]!=='full').length,6);assert.ok(!q.visual.description.includes('Combine'));}
writeFileSync('docs/assessment-blueprints/year4-measurement-authoring-inventory.json',JSON.stringify(forms,null,2)+'\n');
console.log('Level 4 Measurement: 100 answer/scoring checks, five matched forms, instrument ranges, closed perimeter geometry, partial area, elapsed time, typed-time validation and IDK pass.');
