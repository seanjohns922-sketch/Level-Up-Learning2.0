import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { ASSESSMENT_FORMS } from "../data/assessments/design/assessmentContract";
import { YEAR1_NUMBER_CANDIDATE_SPECS } from "../data/assessments/candidates/year1-number/authoring";
import { scoreYear1NumberResponse, scoreYear1NumberSubmission, type Year1NumberResponse } from "../data/assessments/candidates/year1-number/scoring";

// Independently calculated targets by form. These verify authoring arithmetic;
// they are not runtime scorers or a claim that constructions have been tested.
const keys = [
  {build:[11,1],order:[96,100,110,120],line:114,partition:[3,4],exchange:[2,14],small:[2,5],total:120,groups:4,add:15,subtract:8,missing:5,arrive:12,leave:9,money:4,share:4,group:4,skip:[18,20],stages:[20,30,40]},
  {build:[11,4],order:[97,100,110,120],line:117,partition:[3,7],exchange:[2,17],small:[3,5],total:120,groups:5,add:17,subtract:8,missing:5,arrive:13,leave:9,money:4,share:5,group:5,skip:[20,22],stages:[30,40,50]},
  {build:[11,2],order:[98,100,110,120],line:113,partition:[3,5],exchange:[2,15],small:[4,5],total:120,groups:6,add:17,subtract:7,missing:7,arrive:12,leave:8,money:4,share:6,group:6,skip:[22,24],stages:[40,50,60]},
  {build:[11,5],order:[99,100,110,120],line:116,partition:[3,8],exchange:[2,18],small:[3,4],total:120,groups:5,add:16,subtract:8,missing:5,arrive:13,leave:9,money:6,share:5,group:5,skip:[24,26],stages:[50,60,70]},
  {build:[11,3],order:[95,100,110,120],line:118,partition:[3,6],exchange:[2,16],small:[2,6],total:120,groups:4,add:16,subtract:7,missing:6,arrive:14,leave:8,money:6,share:4,group:4,skip:[16,18],stages:[60,70,80]},
];
let assertions=0;
const check=(value:unknown,label:string)=>{assertions++;assert.ok(value,label);};
const identities=new Set<string>();
const allocations=(...sizes:number[])=>sizes.flatMap((n,b)=>Array<number>(n).fill(b));
for(const [f,form] of ASSESSMENT_FORMS.entries()) {
  const items=YEAR1_NUMBER_CANDIDATE_SPECS[form], k=keys[f];
  check(items.length===20,`${form}: 20 questions`);
  const counts: Record<string,number>={};
  for(const [i,item] of items.entries()) {
    check(!identities.has(item.id),`${item.id}: unique ID`);identities.add(item.id);
    check(item.visual.length>30 && item.rubric.length>30,`${item.id}: visual and rubric present`);
    check(item.slot.id===`number-1-${String(i+1).padStart(2,"0")}`,`${item.id}: matching blueprint slot`);
    check(item.task.kind===YEAR1_NUMBER_CANDIDATE_SPECS.pretest[i].task.kind,`${item.id}: matched task type`);
    counts[item.slot.descriptor]=(counts[item.slot.descriptor] ?? 0)+1;
    const t=item.task;
    switch(t.kind) {
      case "build-tens": {
        const model=i===0 ? k.build : k.partition;
        check(model[0]*10+model[1]===t.target && model[1]<10,`${item.id}: standard partition`);
        break;
      }
      case "order": check(JSON.stringify([...t.cards].sort((a,b)=>a-b))===JSON.stringify(k.order),`${item.id}: ordering`);check(t.cards.includes(120) && t.cards.includes(100) && t.cards.some(n=>n<100),`${item.id}: hundred boundary`);break;
      case "number-line": check(k.line===t.target && t.target>110 && t.target<120 && t.min===100 && t.max===120 && t.step===1,`${item.id}: exact tick`);break;
      case "two-partitions": check(k.small[0]+k.small[1]===t.small && k.small.every(n=>n>0),`${item.id}: small split`);check(k.exchange[0]*10+k.exchange[1]===t.large && k.exchange[0]===Math.floor(t.large/10)-1 && k.exchange[1]>=10,`${item.id}: one-ten exchange`);break;
      case "count-tens": check(t.groups*t.perGroup===k.total && k.total===120,`${item.id}: count reaches 120`);break;
      case "make-groups": check(t.total/t.groupSize===k.groups && Number.isInteger(k.groups),`${item.id}: fives group exactly`);break;
      case "add": check(t.left+t.right===k.add && t.left<10 && t.right<10 && k.add>10 && k.add<=20,`${item.id}: crossing-ten addition`);break;
      case "subtract": check(t.whole-t.removed===k.subtract && t.whole>10 && t.whole<=20 && t.removed<10 && k.subtract<10,`${item.id}: crossing-ten subtraction`);break;
      case "missing-part": check(t.whole-t.known===k.missing && t.whole>10 && t.known<10 && k.missing<10,`${item.id}: missing part`);check(new Set(t.reasonChoices).size===3 && t.reasonChoices.includes("Take the known part from the whole."),`${item.id}: inverse reason`);break;
      case "addition-story": check(t.initial+t.arrive===k.arrive && t.initial<10 && t.arrive<10 && k.arrive>10 && k.arrive<=20,`${item.id}: model sum`);break;
      case "subtraction-story": check(t.initial-t.leave===k.leave && t.initial>10 && t.initial<=20 && t.leave<10 && k.leave<10,`${item.id}: model difference`);break;
      case "money": {
        const total=t.wallet.reduce((a,b)=>a+b,0);
        check(total-t.price===k.money && t.wallet.every(n=>n===1 || n===2),`${item.id}: authentic denominations and correct balance`);
        const payments=[];
        for(let mask=0;mask<2**t.wallet.length;mask++) if(t.wallet.reduce((sum,v,b)=>sum+((mask & (1<<b)) ? v : 0),0)===t.price) payments.push(mask);
        check(payments.length>0,`${item.id}: exact payment possible`);
        break;
      }
      case "share": check(t.total/t.recipients===k.share && Number.isInteger(k.share),`${item.id}: each share`);break;
      case "group": check(t.total/t.size===k.group && Number.isInteger(k.group),`${item.id}: group count`);break;
      case "unequal-share": { const mean=t.groups.reduce((a,b)=>a+b,0)/3;check(Number.isInteger(mean) && Math.max(...t.groups)===mean+1 && Math.min(...t.groups)===mean-1 && t.groups.includes(mean),`${item.id}: one-move redistribution`);check(t.reasonChoices.includes("Every tray must have the same number."),`${item.id}: sharing criterion`);break; }
      case "skip-two": check(t.terms.length===5 && t.terms[3]===null && t.terms[4]===null && t.terms[0]!%2===0 && t.terms[1]===t.terms[0]!+2 && t.terms[2]===t.terms[1]!+2 && k.skip[0]===t.terms[2]!+2 && k.skip[1]===k.skip[0]+2,`${item.id}: two missing skip terms`);break;
      case "create-tens": check(k.stages.length===t.stages && k.stages.every((n,i)=>n===t.start+10*i),`${item.id}: created tens sequence`);break;
      case "continue-pattern": case "create-pattern": check(t.unit.length===3 && new Set(t.unit).size===3 && new Set(t.unit.map(s=>s.split("-")[0])).size===3 && new Set(t.unit.map(s=>s.split("-")[1])).size===3,`${item.id}: same shape/colour ABC demand`);break;
    }
    let example:Year1NumberResponse;
    switch(t.kind) {
      case "build-tens": {const m=i===0 ? k.build : k.partition;example={models:[{tens:m[0],ones:m[1]}]};break;}
      case "order": example={values:k.order};break;
      case "number-line": example={values:[k.line]};break;
      case "two-partitions": example={parts:[k.small[0],k.small[1]],models:[{tens:k.exchange[0],ones:k.exchange[1]}]};break;
      case "count-tens": example={values:[k.total]};break;
      case "make-groups": example={placements:allocations(...Array<number>(k.groups).fill(5)),values:[k.groups*5]};break;
      case "add": example={values:[k.add]};break;
      case "subtract": example={values:[k.subtract]};break;
      case "missing-part": example={values:[k.missing],reason:"Take the known part from the whole."};break;
      case "addition-story": example={placements:allocations(t.initial,k.arrive-t.initial),values:[k.arrive]};break;
      case "subtraction-story": example={placements:allocations(k.leave,t.leave),values:[k.leave]};break;
      case "money": {let remaining=t.price;const paidCoinIds:number[]=[];for(const [coin,value] of t.wallet.entries()) if(value<=remaining){paidCoinIds.push(coin);remaining-=value;}example={paidCoinIds,values:[k.money]};break;}
      case "share": example={placements:allocations(k.share,k.share,k.share),values:[k.share]};break;
      case "group": example={placements:allocations(...Array<number>(k.group).fill(3)),values:[k.group]};break;
      case "unequal-share": example={choice:"No",reason:"Every tray must have the same number."};break;
      case "skip-two": example={values:k.skip};break;
      case "create-tens": example={values:k.stages,models:k.stages.map(n=>({tens:n/10,ones:0}))};break;
      case "continue-pattern": example={unit:t.unit,symbols:t.unit};break;
      case "create-pattern": example={symbols:[...t.unit,...t.unit,...t.unit]};break;
    }
    check(scoreYear1NumberResponse(item,example),`${item.id}: complete worked response`);
    check(!scoreYear1NumberResponse(item,{}),`${item.id}: blank response rejected`);
    check(!scoreYear1NumberResponse(item,{values:Array(1),models:Array(1),symbols:Array(9)}),`${item.id}: sparse response rejected`);
    const raw={itemId:item.id,version:item.version,response:example};
    check(scoreYear1NumberSubmission(item,JSON.stringify(raw)).score===1,`${item.id}: raw response roundtrip`);
    check(scoreYear1NumberSubmission(item,JSON.stringify({...raw,version:"old"})).score===null,`${item.id}: stale version not scored`);
    check(scoreYear1NumberSubmission(item,JSON.stringify({...raw,itemId:"different"})).score===null,`${item.id}: other question not scored`);
    if(example.values) check(!scoreYear1NumberResponse(item,{...example,values:example.values.map(n=>n+1)}),`${item.id}: wrong numeral rejected`);
    if(example.models) check(!scoreYear1NumberResponse(item,{...example,models:example.models.map(m=>({...m,ones:m.ones+1}))}),`${item.id}: wrong model rejected despite correct value`);
    if(example.placements) {
      check(!scoreYear1NumberResponse(item,{...example,placements:example.placements.slice(1)}),`${item.id}: missing object rejected`);
      check(!scoreYear1NumberResponse(item,{...example,placements:[...example.placements,0]}),`${item.id}: extra object rejected`);
      check(!scoreYear1NumberResponse(item,{...example,placements:example.placements.map(()=>0)}),`${item.id}: ungrouped model rejected`);
      check(!scoreYear1NumberResponse(item,{values:example.values}),`${item.id}: answer without model rejected`);
    }
    if(example.reason) check(!scoreYear1NumberResponse(item,{...example,reason:""}),`${item.id}: missing reason rejected`);
    if(example.symbols) check(!scoreYear1NumberResponse(item,{...example,symbols:example.symbols.slice(1)}),`${item.id}: incomplete pattern rejected`);
    if(example.paidCoinIds) check(!scoreYear1NumberResponse(item,{...example,paidCoinIds:[...example.paidCoinIds,example.paidCoinIds[0]]}),`${item.id}: spending the same coin twice rejected`);
  }
  check(JSON.stringify(counts)===JSON.stringify({AC9M1N01:3,AC9M1N02:2,AC9M1N03:2,AC9M1N04:3,AC9M1N05:3,AC9M1N06:3,AC9M1A01:2,AC9M1A02:2}),`${form}: descriptor allocation`);
}
const matrix=["# Level 1 Number: five-form authoring matrix","","Status: authoring only. Not rendered or connected to live assessments. Source: supplied Australian Curriculum v9 PDF, pages 12–14. Each item carries a visual specification and explicit evidence rubric in the JSON inventory.","","| Slot / curriculum code | Skill | Pre | Post | Start | Mid | End |","| --- | --- | --- | --- | --- | --- | --- |"];
for(let i=0;i<20;i++) {
  const item=YEAR1_NUMBER_CANDIDATE_SPECS.pretest[i];
  const cells=ASSESSMENT_FORMS.map(form=>{
    const q=YEAR1_NUMBER_CANDIDATE_SPECS[form][i];
    return `${q.prompt} — ${JSON.stringify(q.task)}`.replaceAll("|","&#124;");
  });
  matrix.push(`| ${i+1} / ${item.slot.descriptor} | ${item.slot.evidence} | ${cells.join(" | ")} |`);
}
writeFileSync("docs/assessment-blueprints/year1-number-authoring-matrix.md",matrix.join("\n")+"\n");
writeFileSync("docs/assessment-blueprints/year1-number-authoring-inventory.json",JSON.stringify({status:"authoring-only",assertions,forms:YEAR1_NUMBER_CANDIDATE_SPECS,independentWorkedTargets:keys},null,2)+"\n");
const profile:Record<string,number>={};
for(const item of YEAR1_NUMBER_CANDIDATE_SPECS.pretest) profile[item.slot.expectedDifficulty]=(profile[item.slot.expectedDifficulty]??0)+1;
const difficulty=["# Level 1 Number: difficulty audit","","Design review, not empirical calibration. All five forms share this intended difficulty profile: "+Object.entries(profile).map(([name,count])=>`${count} ${name}`).join(", ")+".","","## Changes from the first draft","","- Addition now samples sums 15–17 instead of clustering at 12–15. All five examples still use two single-digit addends crossing ten, within Year 1 scope.","- The two-part partition/exchange task is challenging: it requires conservation of a one-digit whole and exchanging one ten in a two-digit representation. It is not treated like straightforward place-value recognition.","- Grouping supports multi-select and untimed work. Larger totals still involve more selections; this workload variation must be checked during rendered review and piloting.","- Number-line movement has one-step buttons as well as a slider so motor precision need not determine correctness.","- Every form reaches 120, distinguishes sharing from grouping, samples twos/fives/tens, and distinguishes growing sequences from repeating patterns.","","## Slot comparison","","Prompt counts below cover the stem only. Instructions, labels and reason choices also contribute reading load and must be reviewed on screen. Read-aloud is available. Matching these properties does not establish statistically equal form difficulty.","","| Slot | Expected difficulty | Cognitive demand | Response | Stem words across forms | Main control |","| --- | --- | --- | --- | --- | --- |"];
for(let i=0;i<20;i++) {
  const item=YEAR1_NUMBER_CANDIDATE_SPECS.pretest[i];
  const counts=ASSESSMENT_FORMS.map(f=>YEAR1_NUMBER_CANDIDATE_SPECS[f][i].prompt.trim().split(/\s+/).length);
  difficulty.push(`| ${i+1} | ${item.slot.expectedDifficulty} | ${item.slot.cognitiveDemand} | ${item.slot.response} | ${Math.min(...counts)}–${Math.max(...counts)} | ${item.task.kind} |`);
}
difficulty.push("","## Limits before student release","","This is a broad Year 1 sample with both accessible and demanding tasks, not evidence of a measured test ceiling. A high-performing cohort may still score highly. Review item success rates, distractors and discrimination after piloting before declaring calibration. Same-level growth requires compatible form versions and observed parallel-form performance; do not strengthen End questions merely because they are taken later.","","Remaining: all rendered desktop/tablet/mobile states, spoken output, model construction and submission usability, then real save/resume/report verification. No claim that the full assessment is ready for students.");
writeFileSync("docs/assessment-blueprints/year1-number-difficulty-audit.md",difficulty.join("\n")+"\n");
console.log(`Level 1 Number: 100 specifications; ${assertions} authoring and candidate-scoring checks passed. Rendered review and live saving remain release gates.`);
