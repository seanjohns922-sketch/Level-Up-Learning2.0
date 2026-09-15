import assert from 'node:assert/strict';
import {writeFileSync,readFileSync} from 'node:fs';
import {NUMBER_LEVEL3_FIVE_FORMS as forms,NUMBER_LEVEL3_FORMS as names} from '../data/assessments/revisions/year3NumberFiveForms';
import {isAssessmentAnswerCorrect} from '../data/assessments/analysis';
// Independently worked keys in question order. Never derived from the form generator.
const keys={
 pretest:['13426','13,064||13,406||13,460||13,640','4300','400','67','75','5','37','440','26','287','159','35','4 × 6 = 24','7','10','A','7','1/10,4/10,7/10','3/10'],
 posttest:['25648','25,086||25,608||25,680||25,860','6700','500','76','93','5','36','640','36','283','169','30','4 × 5 = 20','8','12','D','6','2/10,5/10,8/10','7/10'],
 start:['32567','32,056||32,506||32,560||32,650','5200','700','85','57','5','37','540','46','295','158','40','4 × 7 = 28','9','14','C','4','3/10,6/10,9/10','4/10'],
 mid:['47386','47,038||47,308||47,380||47,830','7500','600','94','77','6','37','740','28','294','167','45','4 × 8 = 32','6','16','B','3','1/10,5/10,8/10','6/10'],
 end:['54729','54,027||54,270||54,702||54,720','8600','600','87','95','5','37','840','38','293','178','20','4 × 9 = 36','10','18','E','2','2/10,6/10,9/10','8/10'],
};
const ids=new Set<string>();
const signatures=new Map<number,string>();
function borrows(a:number,b:number){let borrow=0,count=0;for(let i=0;i<3;i++){const needed=(Math.floor(a/10**i)%10)-borrow<Math.floor(b/10**i)%10;borrow=needed?1:0;count+=borrow;}return count;}
function carries(a:number,b:number){let carry=0,count=0;for(let i=0;i<3;i++){carry=((Math.floor(a/10**i)%10)+(Math.floor(b/10**i)%10)+carry)>=10?1:0;count+=carry;}return count;}
for(const form of names){
 const bank=forms[form];assert.equal(bank.length,20);
 bank.forEach((q,i)=>{
  assert.ok(!ids.has(q.id));ids.add(q.id);
  assert.equal(String(q.correctAnswer),keys[form][i],q.id+' independent key');
  assert.ok(isAssessmentAnswerCorrect(q,keys[form][i]),q.id+' grades');
  assert.ok(!isAssessmentAnswerCorrect(q,''));assert.ok(!isAssessmentAnswerCorrect(q,'__wrong__'));
  assert.ok(q.visual&&q.prompt.length>0);assert.ok(q.prompt.split(/\s+/).length<=18,q.id+' reading load');
  const sig=JSON.stringify([q.type,q.visual.kind,q.curriculumCodes,q.difficulty]);
  if(form===names[0])signatures.set(i,sig);else assert.equal(sig,signatures.get(i),q.id+' same skill/format/intended demand');
  if(q.type==='numeric')assert.ok(!isAssessmentAnswerCorrect(q,String(Number(keys[form][i])+1)));
  if(q.type==='mcq')assert.equal(q.options?.filter(o=>o===q.correctAnswer).length,1);
  if(q.visual.kind==='money')assert.ok(q.visual.dollars>=2&&q.visual.dollars<=8&&q.visual.twenties>=2&&q.visual.twenties<=4);
  if(q.visual.kind==='round')assert.ok(q.visual.value%100>=40&&q.visual.value%100<=43); // Same side and distance from midpoint.
  if(q.visual.kind==='fractionChoices'){assert.deepEqual(q.visual.models.map(m=>m.denominator),[2,3,4,5,10]);assert.ok(q.visual.models.every(m=>m.numerator===1));}
 });
 for(const i of [4,5]){const nums=bank[i].prompt.match(/\d+/g)!.map(Number);assert.equal(carries(nums[0],nums[1]),1);}
 const story=bank[10].visual;if(story.kind!=='story')throw Error('story missing');const [a,b,c]=story.stages.map(x=>x.value);assert.equal(carries(a,b),2,form+' story carries');assert.equal(borrows(a+b,c),2,form+' story borrows');
 const tickets=bank[11].visual;if(tickets.kind!=='story')throw Error('tickets missing');const [x,y,z]=tickets.stages.map(s=>s.value);assert.equal(borrows(x,y),2);assert.equal(borrows(x-y,z),2);
 for(const i of [17,19]){const v=bank[i].visual;assert.ok(v.kind==='completeWhole'||v.kind==='numberLine');assert.equal(v.denominator,10);}
}
// Examples differ in each slot; unit fractions share five models but ask for different fractions.
for(let i=0;i<20;i++)assert.equal(new Set(names.map(f=>JSON.stringify([forms[f][i].prompt,forms[f][i].visual]))).size,5,`slot ${i+1} distinct examples`);
const page=readFileSync('app/demo-review/number-level-3/page.tsx','utf8');assert.ok(page.includes('getServerStarpathAccess')&&page.includes('redirect("/login")'));
const component=readFileSync('components/demo/NumberLevel3FiveFormReview.tsx','utf8');assert.ok(!/supabase|localStorage|fetch\(/.test(component));assert.ok(component.includes('reviewNavigation'));assert.ok(component.includes('/demo-review?realm=number&year=Year%203'));
writeFileSync('docs/assessment-blueprints/year3-number-authoring-inventory.json',JSON.stringify({status:'review-only',forms},null,2)+'\n');
console.log('Level 3 Number: 100 independent answers, matched skills/formats, carry/borrow demands, five distinct examples, fraction/coin models and protected review pass.');
