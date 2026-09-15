import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {NUMBER_LEVEL5_FIVE_FORMS as forms,NUMBER_LEVEL5_FORMS as names} from '../data/assessments/revisions/year5NumberFiveForms';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
// Independently worked keys. Kept separate from the authoring profiles and calculations.
const keys = [
 ['0.007','4.059||4.095||4.5||4.509','4','316','5/8,3/4,9/8','9','25','80','5','5','21608','1026','11','10','3200','350','280','913','42','66'],
 ['0.005','6.059||6.095||6.5||6.509','4','356','3/4,7/8,11/8','11','75','60','3','5','25308','1206','3','11','3600','300','306','1039','45','77'],
 ['0.006','7.059||7.095||7.5||7.509','4','396','1/4,3/8,9/8','13','50','40','3','3','29008','1386','7','12','4000','400','388','973','48','88'],
 ['0.009','8.059||8.095||8.5||8.509','4','436','1/8,1/4,11/8','15','20','20','1','7','32708','1566','11','13','2800','450','404','1099','51','99'],
 ['0.008','9.059||9.095||9.5||9.509','4','476','5/8,3/4,13/8','10','80','70','1','7','36408','1746','3','14','2400','250','500','841','54','132'],
];
const ids=new Set<string>();
for(const [f,form] of names.entries()) {
 const bank=forms[form];assert.equal(bank.length,20);
 bank.forEach((q,i)=>{
  const expected=keys[f][i],pair=forms.posttest[i];
  assert.equal(q.correctAnswer,expected,q.id);assert.equal(q.answer,expected);assert.equal(q.scoring.correctResponse,expected);
  assert.ok(isAssessmentAnswerCorrect(q,expected),q.id);assert.ok(!isAssessmentAnswerCorrect(q,''));assert.ok(!isAssessmentAnswerCorrect(q,'__wrong__'));
  if(q.type==='numeric')assert.ok(!isAssessmentAnswerCorrect(q,String(Number(expected)+1)));
  if((q.type==='number_order'||q.type==='fraction_order'))assert.ok(!isAssessmentAnswerCorrect(q,expected.split(q.type==='fraction_order'?',':'||').reverse().join(q.type==='fraction_order'?',':'||')));
  for(const key of ['type','primaryDescriptorCode','difficulty','responseMode','structureKey','skillId'] as const)assert.equal(q[key],pair[key],q.id+' '+key);
  assert.ok(!ids.has(q.id));ids.add(q.id);assert.ok(q.visual&&q.readAloudText);assert.ok(q.prompt.split(/\s+/).length<=16,q.id+' wording');
  if(q.type==='mcq')assert.equal(q.options![q.selectedAnswerPosition!-1],expected);
 });
 assert.equal(new Set(bank.map(q=>q.primaryDescriptorCode)).size,10);
 // Demand controls, beyond matching difficulty labels.
 assert.equal((bank[0].visual as {focus:string}).focus,'thousandths');
 assert.equal(bank[1].options!.length,4);
 const factorNumber=Number((bank[2].visual as {number:number}).number);
 let factorPairs=0;for(let d=1;d*d<=factorNumber;d++)if(factorNumber%d===0)factorPairs++;
 assert.equal(factorPairs,4);
 const fractionNumbers=bank[4].options!.map(s=>String(s).split('/').map(Number));assert.equal(fractionNumbers.filter(([n,d])=>n>d).length,1);assert.deepEqual(fractionNumbers.map(([,d])=>d).sort(),[4,8,8]);assert.equal(new Set(fractionNumbers.filter(([n,d])=>n<d).map(([,d])=>d)).size,2,'Proper fractions must require comparing different denominators');
 assert.equal((bank[5].visual as {divisions:number}).divisions,16);
 assert.ok(Number(bank[12].correctAnswer)>0,'Each division must have a remainder');
 assert.equal((bank[16].visual as {purchases:unknown[]}).purchases.length,2);
 assert.ok(bank[17].readAloudText.includes('ALTOGETHER'));
 assert.equal((bank[18].visual as {divisor:number}).divisor,3);
}
assert.equal(ids.size,100);
for(let i=0;i<20;i++)assert.equal(new Set(names.map(f=>JSON.stringify([forms[f][i].prompt,forms[f][i].visual,forms[f][i].options]))).size,5,`Slot ${i+1}: five distinct examples`);
const page=readFileSync('app/demo-review/number-level-5/page.tsx','utf8');assert.ok(page.includes('getServerStarpathAccess')&&page.includes('redirect("/login")'));
writeFileSync('docs/assessment-blueprints/year5-number-authoring-inventory.json',JSON.stringify({status:'review-only',forms},null,2)+'\n');
console.log('Level 5: all 100 worked answers, scoring, ten Number codes, matched formats and demand controls, clear visual data and protected review pass.');
