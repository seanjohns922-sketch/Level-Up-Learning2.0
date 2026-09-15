import assert from "node:assert/strict";
import { NUMBER_LEVEL1_FIVE_FORMS as forms, NUMBER_LEVEL1_FORMS as formNames, NUMBER_LEVEL1_STRENGTHENED_SLOTS } from "../data/assessments/revisions/year1NumberFiveForms";
import { YEAR1_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS as benchmark } from "../data/assessments/year1NumberNexusIndependentBanks";
import { isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import { getPretestForYearLabel, getPosttestForYearLabel } from "../data/assessments/api";
import { getDiagnosticQuestions } from "../lib/whole-maths-diagnostic-questions";
import { readFileSync } from "node:fs";

// Independently worked keys, separate from generation and from the visual-based checks below.
const keys = {
  pretest:["58","42","30","9","7","4","12","star","109","5","35","25 groups of 5","15","7","7","30","star||star","96||108||120","4","3"],
  posttest:["73","64","25","8","7","5","10","robot","119","7","34","24 groups of 5","17","9","6","25","robot||robot","98||109||120","5","4"],
  start:["62","56","20","8","8","6","14","crystal","129","6","36","26 groups of 5","16","8","5","35","crystal||crystal","95||107||120","6","3"],
  mid:["85","79","35","7","8","3","16","star","139","5","33","27 groups of 5","17","7","4","40","star||star","94||106||120","3","4"],
  end:["47","83","15","7","8","7","18","robot","149","4","37","28 groups of 5","16","6","8","45","robot||robot","93||105||120","5","3"],
};
const revisedSlots: readonly number[] = NUMBER_LEVEL1_STRENGTHENED_SLOTS;

type Visual = { before:number; after:number; paid:number; prices:number[]; labels:string[]; type:string; tens:number; ones:number; whole:number|null; parts:(number|null)[]; groups:number[]|number; groupSize:number; total:number; start:number; change:number; token:string; values:(number|null)[]; expression:string; sequence:string[]; answerSlots:number; amounts:number[]; choices:{count:number;size:number}[]; totals:number[] };
const numbers = (prompt:string) => (prompt.match(/\d+/g) ?? []).map(Number);
const sum = (values:readonly number[]) => values.reduce((a,b)=>a+b,0);
const range = (n:number,min:number,max:number) => assert.ok(n>=min&&n<=max,`${n} outside ${min}–${max}`);
const ids = new Set<string>();
const workload: Record<string,number> = {};
for(const form of formNames) {
  const items = forms[form];
  assert.equal(items.length,20);
  workload[form]=0;
  items.forEach((item,i)=>{
    const v = item.visual as Visual;
    assert.ok(!ids.has(item.id)); ids.add(item.id);
    assert.equal(item.primaryDescriptorCode,benchmark[i].primaryDescriptorCode);
    assert.deepEqual(item.curriculumCodes,benchmark[i].curriculumCodes);
    assert.equal(item.type,forms.posttest[i].type);
    assert.equal(item.responseMode,forms.posttest[i].responseMode);
    assert.equal(item.difficulty,forms.posttest[i].difficulty);
    assert.equal(item.scoring.kind,forms.posttest[i].scoring.kind);
    assert.equal(item.correctAnswer,keys[form][i],`${form} Q${i+1}`);
    assert.equal(item.scoring.correctResponse,keys[form][i]);
    assert.equal((item.renderer.payload as Record<string,unknown>).correctAnswer,keys[form][i]);
    assert.equal(isAssessmentAnswerCorrect(item,keys[form][i]),true);
    assert.equal(isAssessmentAnswerCorrect(item,""),false);
    assert.equal(isAssessmentAnswerCorrect(item,"__wrong__"),false);
    assert.ok(item.prompt.split(/\s+/).length<=15,`${form} Q${i+1} wording`);
    assert.equal(v.type,(forms.posttest[i].visual as Visual).type);
    if(item.type==="mcq") {
      assert.equal(new Set(item.options).size,item.options!.length);
      for(const option of item.options!) assert.equal(isAssessmentAnswerCorrect(item,String(option)),option===keys[form][i]);
      assert.equal(item.options![item.selectedAnswerPosition!-1],keys[form][i]);
    } else if(item.type==="numeric") {
      assert.equal(isAssessmentAnswerCorrect(item,String(Number(keys[form][i])+1)),false);
    }
    let calculated: string|number;
    switch(i) {
      case 0: range(v.tens,4,8);range(v.ones,2,8);calculated=v.tens*10+v.ones;break;
      case 1: assert.equal(v.whole,null);assert.equal(v.parts[0]!%10,0);range(v.parts[1]!,1,9);calculated=sum(v.parts as number[]);break;
      case 2: { const groups=v.groups as number[];range(groups.length,3,7);assert.ok(groups.every(n=>n===5));calculated=sum(groups);workload[form]+=calculated;break; }
      case 3: { const [known,whole]=numbers(v.expression);assert.match(v.expression,/^\d+ \+ \? = \d+$/);range(known,7,9);range(whole,15,17);calculated=whole-known;range(calculated,7,9);break; }
      case 4: assert.equal(v.type,"number_y1_growth_story");assert.deepEqual(numbers(item.prompt),[v.before,v.after]);range(v.before,7,9);range(v.after,15,17);calculated=v.after-v.before;range(calculated,7,8);break;
      case 5: assert.equal(v.groups,3);assert.deepEqual(numbers(item.prompt),[v.total,3]);assert.equal(v.total%3,0);calculated=v.total/3;range(calculated,3,7);workload[form]+=v.total;break;
      case 6: assert.equal(v.values.length,4);assert.equal(v.values[3],null);assert.equal(v.values[1]!-v.values[0]!,2);assert.equal(v.values[2]!-v.values[1]!,2);assert.equal(v.values[0]!%2,0);calculated=v.values[2]!+2;break;
      case 7: assert.equal(v.answerSlots,1);assert.notEqual(v.sequence[0],v.sequence[1]);assert.deepEqual(v.sequence,[v.sequence[0],v.sequence[1],v.sequence[0],v.sequence[1],"?"]);calculated=v.sequence[0];break;
      case 8: assert.equal(v.values.length,4);assert.equal(v.values[2],null);range(v.values[0]!,100,149);assert.equal(v.values[0]!%10,7);assert.equal(v.values[1],v.values[0]!+1);assert.equal(v.values[3],v.values[0]!+3);calculated=v.values[0]!+2;assert.equal(calculated%10,9);break;
      case 9: assert.equal(v.parts[1],null);range(v.whole!,16,19);range(v.parts[0]!,11,14);assert.ok(v.whole!%10>=v.parts[0]!%10,"No borrowing in benchmark missing-part task");assert.deepEqual(numbers(item.prompt),[v.whole,v.parts[0]]);calculated=v.whole!-v.parts[0]!;break;
      case 10: assert.equal(v.parts[1],null);assert.equal(v.parts[0]!%10,0);assert.deepEqual(numbers(item.prompt),[v.whole,v.parts[0]]);calculated=v.whole!-v.parts[0]!;range(calculated,33,37);break;
      case 11: { const target=numbers(item.prompt)[0];range(target,120,140);assert.deepEqual(v.choices.map(c=>`${c.count} groups of ${c.size}`),item.options);assert.ok(v.choices.every(c=>c.size===5));assert.deepEqual(v.choices.map(c=>c.count*5),v.totals);const solutions=v.choices.filter(c=>c.count*5===target);assert.equal(solutions.length,1);const count=solutions[0].count;assert.ok(v.choices.some(c=>c.count===Math.ceil(count/2)));assert.ok(v.choices.some(c=>c.count===count-4));calculated=`${count} groups of 5`;break; }
      case 12: { const [removed,left]=numbers(v.expression);assert.match(v.expression,/^\? − \d+ = \d+$/);range(removed,7,9);range(left,7,9);calculated=removed+left;range(calculated,15,17);break; }
      case 13: assert.equal(v.type,"number_y1_shop_change");assert.deepEqual(numbers(item.prompt),[20]);assert.equal(v.paid,20);assert.equal(v.prices.length,2);assert.ok(v.prices.every(n=>n>=5&&n<=9));range(sum(v.prices),11,14);calculated=v.paid-sum(v.prices);range(calculated,6,9);break;
      case 14: assert.equal(v.groupSize,3);assert.equal(v.groups,undefined);assert.equal(v.total%3,0);assert.deepEqual(numbers(item.prompt),[v.total,3]);calculated=v.total/3;range(calculated,4,8);workload[form]+=v.total;break;
      case 15: assert.equal(v.values.length,4);assert.equal(v.values[3],null);assert.equal(v.values[0]!%5,0);assert.equal(v.values[1]!-v.values[0]!,5);assert.equal(v.values[2]!-v.values[1]!,5);calculated=v.values[2]!+5;break;
      case 16: { const [a,,b]=v.sequence;assert.notEqual(a,b);assert.equal(v.answerSlots,2);assert.deepEqual(v.sequence,[a,a,b,a,a,b,"?","?"]);calculated=`${a}||${a}`;break; }
      case 17: assert.deepEqual(v.values.map(String),item.options);assert.equal(v.values.length,3);assert.equal(v.values[0],120);range(v.values[1]!,90,99);range(v.values[2]!,100,109);calculated=[...v.values as number[]].sort((a,b)=>a-b).join("||");assert.equal(isAssessmentAnswerCorrect(item,[...v.values].reverse().join("||")),false);break;
      case 18: { const groups=(item.visual as {groups:number[][]}).groups;assert.ok(groups[0].length>groups[1].length);assert.ok(groups[0].every(n=>n===1)&&groups[1].every(n=>n===2));assert.ok(sum(groups[0])<sum(groups[1]));range(sum(groups[0]),7,9);range(sum(groups[1]),12,14);assert.ok(item.prompt.includes(v.labels[1])&&item.prompt.includes(v.labels[0]));calculated=sum(groups[1])-sum(groups[0]);range(calculated,3,6);break; }
      case 19: { const [a,b]=v.groups as number[];assert.equal(v.type,"number_y1_balance_trays");assert.equal((v.groups as number[]).length,2);range(a,10,13);range(b,4,6);assert.equal((a+b)%2,0);calculated=(a-b)/2;range(calculated,3,4);assert.equal(a-calculated,b+calculated);assert.equal(isAssessmentAnswerCorrect(item,String(a-b)),false,"Difference is not the number to transfer");break; }
      default: throw new Error("Unreviewed slot");
    }
    assert.equal(String(calculated),keys[form][i],`${form} Q${i+1} visual independently solves to key`);
  });
}
assert.equal(ids.size,100);
// Preserve the other fourteen original post-test questions; revise exactly the six requested slots.
forms.posttest.forEach((q,i)=>{
  if(revisedSlots.includes(i)) return;
  assert.equal(q.prompt,benchmark[i].prompt);assert.equal(q.correctAnswer,benchmark[i].correctAnswer);
  assert.deepEqual(q.visual,benchmark[i].visual);assert.deepEqual(q.options,benchmark[i].options??[]);
});
for(let i=0;i<20;i++) {
  const fingerprints=formNames.map(f=>JSON.stringify(forms[f][i].visual));
  assert.equal(new Set(fingerprints).size,5,`Slot ${i+1} requires five different examples`);
}
for(const form of formNames) range(workload[form],workload.posttest*0.9,workload.posttest*1.1);
const reviewComponent=readFileSync(new URL("../components/demo/NumberLevel1FiveFormReview.tsx",import.meta.url),"utf8");
assert.ok(reviewComponent.includes("AssessmentQuestionCard")&&reviewComponent.includes("AssessmentShell"));
assert.doesNotMatch(reviewComponent,/localStorage|sessionStorage|supabase|saveRealmAssessment|saveDiagnosticProgress|fetch\(/);
const route=readFileSync(new URL("../app/demo-review/number-level-1/page.tsx",import.meta.url),"utf8");
assert.ok(route.includes("getServerStarpathAccess")&&route.includes('if (!access.allowed) redirect("/login")'));
// Manual review must not alter currently assigned student questions or diagnostics.
assert.ok(getPretestForYearLabel("Year 1","number").every(q=>q.id.endsWith("-v3")));
assert.ok(getPosttestForYearLabel("Year 1","number",2)!.questions.every(q=>q.id.endsWith("-v2")));
assert.ok(getDiagnosticQuestions("number","Year 1","existing-sitting","start").every(q=>q.question.id.endsWith("-v2")));
console.log(`Number Level 1: 100 independent answer/visual checks, five distinct examples per slot, six strengthened slots, retained benchmark elsewhere, matched demand, scoring and protected review isolation pass. Counting workload: ${JSON.stringify(workload)}.`);
