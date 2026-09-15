import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {NUMBER_LEVEL7_FIVE_FORMS as forms,NUMBER_LEVEL7_FORMS as names,NUMBER_LEVEL7_BLUEPRINT as blueprint} from '../data/assessments/revisions/year7NumberFiveForms';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
// Independently worked keys, not the authoring functions' outputs.
const keys=[
 ['12','52','2³ × 3²','4 × 10⁵ + 6 × 10³ + 8 × 10','-5/4','15','18.28','4','33/28','17/28','3/28','4/21','8.64','4.2','-7','5','2:3','60','76','50'],
 ['14','60','2² × 3³','5 × 10⁵ + 7 × 10³ + 9 × 10','-7/4','35','23.49','5','37/28','13/28','6/28','8/21','12.48','3.6','-8','6','3:4','90','111','40'],
 ['16','68','2³ × 5²','6 × 10⁵ + 8 × 10³ + 3 × 10','-3/4','45','34.66','6','41/28','9/28','9/28','12/21','15.68','4.2','-7','8','2:5','80','143','25'],
 ['18','76','2⁵ × 3²','7 × 10⁵ + 9 × 10³ + 4 × 10','-1/4','65','45.74','7','45/28','5/28','12/28','16/21','17.28','3.6','-9','9','3:5','120','159','60'],
 ['15','64','2³ × 7²','8 × 10⁵ + 3 × 10³ + 6 × 10','-9/4','85','56.85','8','31/28','1/28','15/28','20/21','16.56','3.6','-9','9','4:5','160','212','75'],
];
const extraKeys=[
 ['7','36','5','2/7','96','9','-12||-7||0||5','180','Pack B','50 × 10 − 280'],
 ['8','42','6','3/7','126','11','-14||-8||0||6','280','Pack B','45 × 9 − 240'],
 ['9','48','7','4/7','160','13','-16||-9||0||7','400','Pack B','60 × 9 − 360'],
 ['10','54','4','5/7','198','15','-18||-10||0||8','540','Pack B','70 × 9 − 340'],
 ['11','60','8','6/7','240','17','-20||-11||0||9','700','Pack B','70 × 8 − 280'],
];
keys.forEach((key,i)=>key.push(...extraKeys[i]));
const rational=(s:string)=>{const [n,d]=s.split('/').map(Number);return n/d;};
const ids=new Set<string>();
for(const [f,name] of names.entries()){
 const bank=forms[name];assert.equal(bank.length,30);
 bank.forEach((q,i)=>{
  assert.equal(q.correctAnswer,keys[f][i],q.id);assert.equal(q.answer,q.correctAnswer);assert.equal(q.scoring.correctResponse,q.correctAnswer);
  assert.ok(isAssessmentAnswerCorrect(q,q.correctAnswer),q.id);assert.ok(!isAssessmentAnswerCorrect(q,''));assert.ok(!isAssessmentAnswerCorrect(q,'wrong'));
  if(q.type==='number_order')assert.ok(!isAssessmentAnswerCorrect(q,q.correctAnswer.split('||').reverse().join('||')));
  if(q.type==='numeric')assert.ok(!isAssessmentAnswerCorrect(q,String(Number(q.correctAnswer)+1)),q.id);
  if(q.options&&q.type==='mcq'){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.options.includes(q.correctAnswer));for(const o of q.options)assert.equal(isAssessmentAnswerCorrect(q,o),o===q.correctAnswer,q.id);}
  for(const k of ['type','skillId','structureKey','difficulty','responseMode','primaryDescriptorCode'] as const)assert.equal(q[k],forms.posttest[i][k]);
  assert.ok(!ids.has(q.id));ids.add(q.id);assert.ok(q.prompt.split(/\s+/).length<=16,q.id);assert.ok(q.readAloudText);assert.deepEqual(q.curriculumCodes,[blueprint[i][0]]);
 });
 assert.equal(new Set(bank.map(q=>q.primaryDescriptorCode)).size,9);
 const superscripts:Record<string,string>={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
 const powerValue=(text:string)=>{const m=text.trim().match(/^(\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)?$/);assert.ok(m,text);return Number(m[1])**(m[2]?Number([...m[2]].map(c=>superscripts[c]).join('')):1);};
 const prime=(n:number)=>{if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true;};
 for(const option of bank[2].options!){const factors=option.split(' × ');const bases=factors.map(t=>Number(t.match(/^\d+/)![0]));const valid=bases.every(prime)&&factors.reduce((n,t)=>n*powerValue(t),1)===Number(bank[2].visual.expression);assert.equal(valid,option===bank[2].correctAnswer);}
 for(const option of bank[3].options!){const total=option.split(' + ').reduce((sum,term)=>sum+term.split(' × ').reduce((n,t)=>n*powerValue(t),1),0);assert.equal(total===Number(bank[3].visual.expression),option===bank[3].correctAnswer);}
 const gcd=(a:number,b:number):number=>b?gcd(b,a%b):a;
 for(const option of bank[23].options!){const [n,d]=option.split('/').map(Number);assert.equal(gcd(n,d)===1&&Math.abs(n/d-rational(String(bank[23].visual.expression)))<1e-12,option===bank[23].correctAnswer);}
 const packs=bank[28].visual.packs as Array<{label:string;kg:number;price:number}>;const cheapest=[...packs].sort((a,b)=>a.price/a.kg-b.price/b.kg);assert.equal(cheapest[0].label,bank[28].correctAnswer);assert.ok(cheapest[0].price/cheapest[0].kg<cheapest[1].price/cheapest[1].kg);
 assert.notDeepEqual(bank[19].visual,bank[29].visual,'Separate financial examples avoid providing each other’s answer');
 assert.ok(Number(bank[14].correctAnswer)<0&&Number(bank[15].correctAnswer)>0);assert.equal(bank[14].inputMode,'text');
 const factors=bank[21].visual.values as number[];assert.equal(gcd(factors[0],factors[1]),Number(bank[21].correctAnswer));assert.ok(factors.every(n=>n>=72));
 const line=bank[4];assert.equal(rational(line.correctAnswer),Number(line.visual.marker));assert.ok(!line.readAloudText.includes(line.correctAnswer));assert.ok(Number(line.visual.marker)>-3&&Number(line.visual.marker)<1);
 // Equivalent arithmetic, including all four positive-fraction operations.
 for(let i=8;i<=11;i++){
  const [a,op,b]=String(bank[i].visual.expression).split(' '),x=rational(a),y=rational(b);
  const expected=op==='+'?x+y:op==='−'?x-y:op==='×'?x*y:x/y;
  assert.ok(Math.abs(rational(bank[i].correctAnswer)-expected)<1e-12);
  for(const option of bank[i].options!)assert.equal(Math.abs(rational(option)-expected)<1e-12,option===bank[i].correctAnswer);
  assert.ok(x>0&&y>0);assert.equal(a.split('/')[1],i===10?'4':'7');assert.equal(b.split('/')[1],i===10?'7':'4');
 }
 const paint=bank[7];assert.ok(Number(paint.correctAnswer)*2>=Number(paint.visual.litres));assert.ok((Number(paint.correctAnswer)-1)*2<Number(paint.visual.litres));
 const ratio=bank[16];const [a,b]=ratio.correctAnswer.split(':').map(Number);assert.equal(Number(ratio.visual.blue)*b,Number(ratio.visual.orange)*a);
 const fund=bank[19].visual;assert.equal((Number(fund.tickets)*Number(fund.price)-Number(fund.cost))*100/Number(fund.cost),Number(bank[19].correctAnswer));
}
assert.equal(ids.size,150);
for(let i=0;i<30;i++)assert.equal(new Set(names.map(f=>JSON.stringify([forms[f][i].prompt,forms[f][i].visual,forms[f][i].options]))).size,5,`Five different examples in slot ${i+1}`);
const route=readFileSync('app/demo-review/number-level-7/page.tsx','utf8');assert.ok(route.includes('getServerStarpathAccess')&&route.includes('redirect("/login")'));
const shell=readFileSync('components/demo/NumberLevel7FiveFormReview.tsx','utf8');assert.ok(shell.includes('FiveFormAssessmentReview'));
writeFileSync('docs/assessment-blueprints/year7-number-authoring-inventory.json',JSON.stringify({status:'review-only',forms},null,2)+'\n');
console.log('Level 7: 150 independent keys, all answer options, fraction arithmetic, nine curriculum codes, matched structures, visual quantities and protected review route pass.');
