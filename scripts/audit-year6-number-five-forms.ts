import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {NUMBER_LEVEL6_FIVE_FORMS as forms,NUMBER_LEVEL6_FORMS as names} from '../data/assessments/revisions/year6NumberFiveForms';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
// Independently worked answer keys, separate from authoring calculations.
const keys=[
 ['-12||-5||0||7','(4, -3)','43','16','3/8,2/5,5/12','14','24.017','6.425','17','7','61.72','0.0472','39','144','294','200','50','202','6','19'],
 ['-14||-6||0||9','(-3, -4)','47','36','7/12,3/5,5/8','10','34.017','7.425','11','5','81.46','0.0628','47','192','238','300','100','228','8','22'],
 ['-16||-7||0||8','(-4, 2)','53','36','4/5,7/8,11/12','16','44.017','8.425','21','1','101.28','0.0784','59','208','266','260','150','248','8','24'],
 ['-18||-8||0||6','(2, 4)','59','100','2/5,5/12,5/8','18','54.017','9.425','19','7','120.94','0.0836','67','256','322','340','200','310','10','25'],
 ['-17||-9||0||5','(3, -2)','61','196','7/12,5/8,4/5','22','64.017','10.425','7','5','140.76','0.0964','79','288','308','380','250','270','12','25'],
];
const ids=new Set<string>();
for(const [f,form] of names.entries()) {
 const bank=forms[form];assert.equal(bank.length,20);
 bank.forEach((q,i)=>{
  const expected=keys[f][i],pair=forms.posttest[i];
  assert.equal(q.correctAnswer,expected,q.id);assert.equal(q.answer,expected);assert.equal(q.scoring.correctResponse,expected);
  assert.ok(isAssessmentAnswerCorrect(q,expected),q.id);assert.ok(!isAssessmentAnswerCorrect(q,''));assert.ok(!isAssessmentAnswerCorrect(q,'__wrong__'));
  if(q.type==='numeric')assert.ok(!isAssessmentAnswerCorrect(q,String(Number(expected)+1)));
  if(q.type==='fraction_order'||q.type==='number_order')assert.ok(!isAssessmentAnswerCorrect(q,expected.split(q.type==='fraction_order'?',':'||').reverse().join(q.type==='fraction_order'?',':'||')));
  if(q.type==='mcq'){assert.equal(q.options![q.selectedAnswerPosition!-1],expected);assert.equal(q.options!.filter(o=>o===expected).length,1);}
  for(const k of ['type','primaryDescriptorCode','skillId','structureKey','responseMode','difficulty'] as const)assert.equal(q[k],pair[k],q.id+' '+k);
  assert.ok(!ids.has(q.id));ids.add(q.id);assert.ok(q.readAloudText&&q.visual);assert.ok(q.prompt.split(/\s+/).length<=16,q.id+' wording');
 });
 assert.equal(new Set(bank.map(q=>q.primaryDescriptorCode)).size,9);
 assert.equal(bank[0].options!.length,4);assert.equal(bank[1].options!.length,4);assert.ok(!bank[1].readAloudText.includes(bank[1].correctAnswer));
 const p=(bank[1].visual as {points:Array<{x:number;y:number}>}).points[0];assert.ok(Math.abs(p.x)<=4&&Math.abs(p.y)<=4&&p.x!==0&&p.y!==0,'Coordinates stay legible inside the grid');
 const prime=Number(bank[2].correctAnswer);for(let d=2;d*d<=prime;d++)assert.notEqual(prime%d,0);
 const divisor=Number((bank[3].visual as {rules:string[]}).rules[1].match(/\d+/)![0]);const sq=Number(bank[3].correctAnswer);assert.equal(Math.sqrt(sq)%1,0);assert.equal(sq%divisor,0);for(let r=1;r*r<sq;r++)assert.notEqual(r*r%divisor,0);assert.ok(bank[3].prompt.includes('positive'));
 assert.deepEqual(bank[4].options!.map(o=>Number(String(o).split('/')[1])).sort((a,b)=>a-b),[5,8,12]);
 const line=bank[5].visual as {divisions:number;marker:number};assert.equal(line.divisions,12);assert.equal(Number(bank[5].correctAnswer),line.marker*2);
 assert.ok((bank[10].visual as {expression:string}).expression.endsWith('× 20'));
 assert.ok((bank[11].visual as {expression:string}).expression.endsWith('÷ 1000'));
 assert.equal((bank[14].visual as {percentFull:number}).percentFull,65);
 const budget=bank[17].visual as {purchases:Array<{quantity:number;price:number}>};assert.equal(budget.purchases.length,2);assert.equal(budget.purchases[1].price%1,0.5);
 const kits=bank[19].visual as {budget:number;price:number;discount:number};const count=Number(bank[19].correctAnswer),cost=kits.price*(1-kits.discount/100);assert.ok(count*cost<=kits.budget);assert.ok((count+1)*cost>kits.budget);
}
assert.equal(ids.size,100);
for(let i=0;i<20;i++)assert.equal(new Set(names.map(f=>JSON.stringify([forms[f][i].prompt,forms[f][i].visual,forms[f][i].options]))).size,5,`Slot ${i+1}: five distinct examples`);
const page=readFileSync('app/demo-review/number-level-6/page.tsx','utf8');assert.ok(page.includes('getServerStarpathAccess')&&page.includes('redirect("/login")'));
writeFileSync('docs/assessment-blueprints/year6-number-authoring-inventory.json',JSON.stringify({status:'review-only',forms},null,2)+'\n');
console.log('Level 6: 100 worked answers, scoring and order checks, nine Number codes, matched formats, fraction/decimal/rounding demands and budget bounds pass.');
