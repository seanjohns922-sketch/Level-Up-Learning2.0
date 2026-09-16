import assert from 'node:assert/strict';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {YEAR5_MEASUREMENT_FIVE_FORMS as forms,YEAR5_MEASUREMENT_BLUEPRINT as blueprint} from '../data/assessments/revisions/year5MeasurementFiveForms';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
import {fromMeasurelandsTimeResponse,toMeasurelandsTimeResponse,formatMeasurelandsReviewAnswer} from '../data/assessments/measurelandsPresentation';
for(const bank of Object.values(forms)){
 assert.equal(bank.length,20);
 bank.forEach((q,i)=>{
  const v=q.visual,n=v.values;let expected='';
  if(v.task==='precision')expected='Millimetres';
  if(v.task==='estimate')expected=`${n[0]}°`;
  if(v.task==='construct'||v.task==='protractor'){expected=q.options?`${n[0]}° — acute`:String(n[0]);assert.ok(n[0]>0&&n[0]<180);}
  if(v.task==='mixed')expected=String(n.length===1?n[0]:n[0]-n[1]);
  if(v.task==='compareArea'){assert.equal(n[0]+n[1],n[2]+n[3]);expected=String(n[2]*n[3]-n[0]*n[1]);}
  if(v.task==='time'){expected=String(Math.floor(n[0]/60)*100+n[0]%60).padStart(4,'0');const fmt=q.answerFormat!;assert.equal(fmt.kind,'time');if(fmt.kind==='time'){const response=fromMeasurelandsTimeResponse(expected,fmt.mode);assert.equal(toMeasurelandsTimeResponse(response.hour,response.minute,fmt.mode,response.meridiem),expected);assert.match(formatMeasurelandsReviewAnswer(expected,fmt),/^\d{1,2}:\d{2}( (am|pm))?$/);}}
  if(v.task==='timetable')expected=String(n[1]-n[0]);
  if(v.base){const b=v.base;if(b.task==='area')expected=String(b.areaCells?b.areaCells.reduce((sum,c)=>sum+(c[2]==='full'?1:.5),0):n[0]*n[1]);if(b.task==='perimeter'){const[w,h,a,c]=n;const pts=b.lShape?[[0,0],[w-a,0],[w-a,h-c],[w,h-c],[w,h],[0,h]]:[[0,0],[w,0],[w,h],[0,h]];const boundary=pts.reduce((sum,[x,y],j)=>{const[nx,ny]=pts[(j+1)%pts.length];return sum+Math.hypot(nx-x,ny-y);},0);const opening=b.description.match(/A (\d+)-metre gate/);expected=String(boundary-(opening?Number(opening[1]):0));}}
  assert.equal(q.correctAnswer,expected,q.id);assert.ok(isAssessmentAnswerCorrect(q,expected));assert.ok(!isAssessmentAnswerCorrect(q,'idk'));assert.ok(!isAssessmentAnswerCorrect(q,''));
  if(q.options){assert.equal(new Set(q.options).size,q.options.length);assert.equal(q.options.filter(o=>isAssessmentAnswerCorrect(q,o)).length,1);}else assert.ok(!isAssessmentAnswerCorrect(q,String(Number(expected)+1)));
  assert.equal(q.primaryDescriptorCode,blueprint[i][0]);assert.equal(q.difficulty,blueprint[i][2]);assert.equal(q.readAloudText,q.prompt);assert.ok(q.prompt.split(/\s+/).length<18);
  if(v.art)assert.ok(existsSync('public/images/measurelands/'+v.art));
 });
}
for(let i=0;i<20;i++){const qs=Object.values(forms).map(b=>b[i]);for(const key of ['type','primaryDescriptorCode','difficulty','skillId'] as const)assert.equal(new Set(qs.map(q=>q[key])).size,1);assert.equal(new Set(qs.map(q=>JSON.stringify(q.visual))).size,5);}
const renderer=readFileSync('components/assessment/Year5MeasurementAssessmentVisual.tsx','utf8');assert.ok(!renderer.includes('targetDeg='));assert.ok(renderer.includes('showInteractiveReading={false}'));assert.ok(renderer.includes('onKeyDown='));
writeFileSync('docs/assessment-blueprints/year5-measurement-authoring-inventory.json',JSON.stringify(forms,null,2)+'\n');
console.log('Level 5 Measurement: 100 answers, exact scoring and IDK, five matched forms, closed boundaries, grid areas, time-system conversions, construction without answer snapping/feedback, and lesson assets pass.');
