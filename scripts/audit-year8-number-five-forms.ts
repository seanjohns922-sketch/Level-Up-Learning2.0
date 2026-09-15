import assert from 'node:assert/strict';
import {writeFileSync,readFileSync} from 'node:fs';
import {NUMBER_LEVEL8_FIVE_FORMS as forms,NUMBER_LEVEL8_FORMS as names,NUMBER_LEVEL8_BLUEPRINT as blueprint} from '../data/assessments/revisions/year8NumberFiveForms';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
// Independently calculated answer keys for the five parallel forms.
const keys=[
 ['√18','4','π','√7','5','3','6','1','7','36','1/8','1/7','2','0.1666…','84','-13','-17','4/21','11/21','-2/21','3/14','-3','200','176','140.8','Offer B','25','6.4','1200','612'],
 ['√32','5','π','√11','7','4','12','1','10','72','1/20','1/9','3','0.8333…','104','-14','-26','1/21','8/21','-4/21','3/7','-4.5','250','220','176','Offer B','25','8','1600','702'],
 ['√50','7','π','√13','9','5','20','1','13','144','1/25','1/11','4','0.5833…','126','-15','-37','-2/21','5/21','-2/7','9/14','-6','300','264','211.2','Offer B','25','9.6','2000','792'],
 ['√72','8','π','√19','11','6','30','1','16','288','1/40','1/13','5','0.9166…','150','-16','-50','-5/21','2/21','-8/21','6/7','-7.5','350','308','246.4','Offer B','25','11.2','2400','882'],
 ['√98','9','π','√23','13','7','42','1','19','576','1/50','1/15','6','0.0833…','176','-17','-65','-8/21','-1/21','-10/21','15/14','-9','400','352','281.6','Offer B','25','12.8','2800','972'],
];
const terminating=(s:string)=>{let d=Number(s.split('/')[1]);while(d%2===0)d/=2;while(d%5===0)d/=5;return d===1;};
const ids=new Set<string>();
for(const [f,name] of names.entries()){
 const bank=forms[name];assert.equal(bank.length,30);assert.equal(new Set(bank.map(q=>q.primaryDescriptorCode)).size,5);
 bank.forEach((q,i)=>{
  assert.equal(q.correctAnswer,keys[f][i],q.id);assert.ok(isAssessmentAnswerCorrect(q,keys[f][i]),q.id);
  assert.ok(!isAssessmentAnswerCorrect(q,''));assert.ok(!isAssessmentAnswerCorrect(q,'wrong'));
  assert.equal(q.answer,q.correctAnswer);assert.equal(q.scoring.correctResponse,q.correctAnswer);
  assert.equal(q.primaryDescriptorCode,blueprint[i][0]);assert.equal(q.difficulty,blueprint[i][2]);
  assert.ok(q.readAloudText.startsWith(q.prompt));assert.ok(!ids.has(q.id));ids.add(q.id);
  assert.equal(q.showFractionModels,false);
  if(q.options){assert.equal(new Set(q.options).size,q.options.length);assert.equal(q.options.filter(o=>isAssessmentAnswerCorrect(q,o)).length,1,q.id);}
  if(q.type==='numeric')assert.ok(!isAssessmentAnswerCorrect(q,String(Number(q.correctAnswer)+1)),q.id);
  if(i===10)assert.deepEqual(q.options!.filter(terminating),[q.correctAnswer]);
  if(i===11)assert.deepEqual(q.options!.filter(o=>!terminating(o)),[q.correctAnswer]);
  if(i>=17&&i<=20){const values=q.options!.map(x=>{const[n,d]=x.split('/').map(Number);return n/d;});assert.equal(new Set(values).size,4,q.id);}
 });
}
for(let i=0;i<30;i++){
 const parallel=names.map(n=>forms[n][i]);
 assert.equal(new Set(parallel.map(q=>q.type)).size,1);
 assert.equal(new Set(parallel.map(q=>q.skillId)).size,1);
 assert.equal(new Set(parallel.map(q=>JSON.stringify([q.visual,q.options]))).size,5,`Slot ${i+1} examples must differ`);
}
assert.ok(readFileSync('app/demo-review/number-level-8/page.tsx','utf8').includes('if (!access.allowed) redirect("/login")'));
writeFileSync('docs/assessment-blueprints/year8-number-authoring-inventory.json',JSON.stringify(forms,null,2)+'\n');
console.log('Level 8: 150 independently checked answers; matched skills, formats and difficulty; unique choices and five distinct examples per slot; all five Number codes.');
