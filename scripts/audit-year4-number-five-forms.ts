import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {NUMBER_LEVEL4_FIVE_FORMS as forms,NUMBER_LEVEL4_FORMS as names} from '../data/assessments/revisions/year4NumberFiveForms';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
// Independent worked answers; not calculated from bank parameters.
const compare=['4.7 is greater than 4.53','5.6 is greater than 5.42','6.8 is greater than 6.64','7.5 is greater than 7.34','8.9 is greater than 8.72'];
const parity=[1235,1437,1639,1841,2043];
const inverse=['107 × 8 = 856','108 × 8 = 864','109 × 8 = 872','106 × 8 = 848','104 × 8 = 832'];
const algorithms=[['Start at 7.','Add 8.'],['Start at 8.','Add 9.'],['Start at 6.','Add 7.'],['Start at 9.','Add 6.'],['Start at 5.','Add 8.']];
const numericKeys=[
 ['0.06','3','3','0.28','3','1.25','4200','4274','296','700','150','85','182','95','141','16'],
 ['0.08','3','15','0.48','7','2.25','5300','5274','376','800','200','85','210','109','131','20'],
 ['0.04','3','21','0.68','11','3.25','6400','6274','456','900','250','85','238','81','121','24'],
 ['0.07','3','9','0.72','15','4.25','7500','7274','536','600','300','85','266','67','111','28'],
 ['0.03','3','18','0.88','19','5.25','8600','8274','616','500','350','85','154','53','101','32'],
];
const numericSlots=[0,2,4,5,6,7,8,9,10,12,13,14,15,16,17,18];
const keys=new Map<string,string>();const ids=new Set<string>();
for(const [f,form] of names.entries()){
 const bank=forms[form];assert.equal(bank.length,20);
 const expected:Record<number,string>={1:compare[f],3:`${parity[f]} × ${parity[f]+2} is odd: both factors are odd.`,11:inverse[f],19:[algorithms[f][0],'Record the current number.',algorithms[f][1],'Repeat steps 2 and 3.'].join('||')};
 numericSlots.forEach((slot,i)=>expected[slot]=numericKeys[f][i]);
 bank.forEach((q,i)=>{
  assert.equal(q.correctAnswer,expected[i],q.id);keys.set(q.id,expected[i]);assert.ok(!ids.has(q.id));ids.add(q.id);
  assert.ok(isAssessmentAnswerCorrect(q,expected[i]),q.id+' correct');assert.ok(!isAssessmentAnswerCorrect(q,''));assert.ok(!isAssessmentAnswerCorrect(q,'__wrong__'));
  if(q.type==='numeric')assert.ok(!isAssessmentAnswerCorrect(q,String(Number(expected[i])+1)));
  assert.ok(q.visual&&q.readAloudText);assert.ok(q.prompt.split(/\s+/).length<=18,q.id+' prompt length');
  const b=forms.posttest[i];assert.equal(q.type,b.type);assert.equal(q.primaryDescriptorCode,b.primaryDescriptorCode);assert.equal(q.difficulty,b.difficulty);assert.equal(q.responseMode,b.responseMode);
  assert.deepEqual(q.scoring?.correctResponse,q.correctAnswer);assert.equal(q.answer,q.correctAnswer);
  if(q.type==='mcq')assert.equal(q.options?.filter(x=>x===q.correctAnswer).length,1);
 });
 assert.equal(new Set(bank.map(q=>q.primaryDescriptorCode)).size,9);
 const sum=bank[9].visual as {top:number;bottom:number};let carry=0,carries=0;
 for(let place=0;place<4;place++){carry=(Math.floor(sum.top/10**place)%10+Math.floor(sum.bottom/10**place)%10+carry)>=10?1:0;carries+=carry;}
 assert.equal(carries,3,form+' same regrouping demand');
 assert.equal(new Set(bank.filter(q=>q.type==='mcq').map(q=>q.selectedAnswerPosition)).size,3,form+' balanced correct option positions');
 const equivalent=bank[4].visual as {left:number[];right:number[]};assert.equal(equivalent.right[1]/equivalent.left[1],3);
 const decimal=bank[5].visual as {numerator:number;denominator:number};assert.equal(decimal.denominator,25);assert.ok(decimal.numerator>0&&decimal.numerator<25);
 assert.equal((bank[7].visual as {divisions:number}).divisions,4);
 assert.equal((bank[14].visual as {items:unknown[]}).items.length,1);assert.equal((bank[17].visual as {items:unknown[]}).items.length,2);
}
for(let i=0;i<20;i++)assert.equal(new Set(names.map(f=>JSON.stringify([forms[f][i].prompt,forms[f][i].visual]))).size,5,`Slot ${i+1} distinct examples`);
const page=readFileSync('app/demo-review/number-level-4/page.tsx','utf8');assert.ok(page.includes('getServerStarpathAccess')&&page.includes('redirect("/login")'));
writeFileSync('docs/assessment-blueprints/year4-number-authoring-inventory.json',JSON.stringify({status:'review-only',forms},null,2)+'\n');
console.log('Level 4: 100 independent answers, all nine Number codes, distinct matched examples, response formats, fraction scales, budget demands and protected review pass.');
