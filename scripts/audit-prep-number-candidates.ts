import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { ASSESSMENT_FORMS } from "../data/assessments/design/assessmentContract";
import { PREP_NUMBER_CANDIDATE_FORMS } from "../data/assessments/candidates/prep-number/forms";
import { initialPrepNumberResponse, parsePrepNumberSubmission, scorePrepNumberResponse, scorePrepNumberSubmission } from "../data/assessments/candidates/prep-number/scoring";
import type { PrepNumberResponse } from "../data/assessments/candidates/prep-number/types";

// Separately worked answer examples, in slot order. Kept outside the bank and
// scorer: changing a prompt's values must not silently update its expected key.
const n = (...values:number[]): PrepNumberResponse => ({values});
const a = (...counts:number[]): PrepNumberResponse => ({placements:counts.flatMap((count,bin)=>Array<number>(count).fill(bin))});
const supply = (used:number,unused:number): PrepNumberResponse => ({placements:[...Array<number>(used).fill(0),...Array<number>(unused).fill(-1)]});
const symbols = (...values: NonNullable<PrepNumberResponse["symbols"]>): PrepNumberResponse => ({symbols:values});
const pairs = (aCount:number,bCount:number,choice:number): PrepNumberResponse => ({pairs:Array.from({length:aCount},(_,i)=>i<bCount ? i : -1),choice});
const reason = (total:number): PrepNumberResponse => ({values:[total],reason:"Nothing was added or taken away."});
const worked: PrepNumberResponse[][] = [
  [n(0,17),n(4),n(20),n(7),supply(5,4),a(3,3),symbols("star","robot","star","robot"),n(0,7,13,20),n(5),pairs(8,6,0),a(5,3),a(2,5),{choice:1},a(2,2,2,2),supply(7,5),a(4,4),reason(8),n(3),a(4,4),symbols("crystal","robot")],
  [n(0,18),n(4),n(20),n(8),supply(6,4),a(4,4),symbols("crystal","star","crystal","star"),n(0,6,12,20),n(5),pairs(7,9,1),a(5,4),a(3,5),{choice:0},a(2,2,2,2),supply(8,4),a(3,6),reason(9),n(3),a(5,5),symbols("star","robot")],
  [n(0,19),n(4),n(20),n(9),supply(6,3),a(5,5),symbols("robot","crystal","robot","crystal"),n(0,8,14,20),n(4),pairs(9,7,0),a(4,3),a(4,5),{choice:2},a(2,2,2,2),supply(9,3),a(2,5),reason(7),n(4),a(3,3),symbols("crystal","star")],
  [n(0,16),n(4),n(20),n(7),supply(7,3),a(4,4),symbols("robot","star","robot","star"),n(0,5,11,20),n(4),pairs(6,8,1),a(6,3),a(3,5),{choice:2},a(2,2,2,2),supply(6,6),a(3,5),reason(8),n(3),a(4,4),symbols("star","crystal")],
  [n(0,15),n(4),n(20),n(8),supply(7,4),a(3,3),symbols("star","crystal","star","crystal"),n(0,9,15,20),n(4),pairs(10,8,0),a(4,4),a(2,5),{choice:1},a(2,2,2,2),supply(10,2),a(4,5),reason(9),n(4),a(5,5),symbols("robot","crystal")],
];

let assertions=0;
function check(value:unknown,message:string) { assertions++; assert.ok(value,message); }
const identities = new Set<string>();
const inventory: unknown[]=[];
for (const [f,form] of ASSESSMENT_FORMS.entries()) {
  const items=PREP_NUMBER_CANDIDATE_FORMS[form];
  check(items.length===20,`${form}: 20 items`);
  check(worked[f].length===20,`${form}: 20 independent keys`);
  const codes: Record<string,number>={};
  for (const [i,item] of items.entries()) {
    const label=`${form} slot ${i+1}`;
    check(!identities.has(item.id),`${label}: unique identity`); identities.add(item.id);
    codes[item.slot.descriptor]=(codes[item.slot.descriptor]??0)+1;
    check(item.slot.id===`number-0-${String(i+1).padStart(2,"0")}`,`${label}: blueprint slot`);
    check(scorePrepNumberResponse(item,worked[f][i]),`${label}: independently worked answer`);
    check(!scorePrepNumberResponse(item,{}),`${label}: empty response cannot pass`);
    check(!scorePrepNumberResponse(item,{values:Array(2),symbols:Array(4),placements:Array(8)}),`${label}: sparse malformed response rejected`);
    check(!scorePrepNumberResponse(item,initialPrepNumberResponse(item)),`${label}: initial screen cannot pass`);
    const raw={itemId:item.id,version:item.version,response:worked[f][i]};
    const restored=parsePrepNumberSubmission(item,JSON.stringify(raw));
    check(scorePrepNumberSubmission(item,restored).score===1,`${label}: raw evidence roundtrip`);
    check(parsePrepNumberSubmission(item,JSON.stringify({...raw,version:"old"}))===null,`${label}: stale version rejected`);
    check(parsePrepNumberSubmission(item,JSON.stringify({...raw,itemId:"other-item"}))===null,`${label}: wrong item rejected`);
    check(scorePrepNumberSubmission(item,null).score===null,`${label}: missing is not zero`);
    const correct=worked[f][i];
    if(correct.placements) {
      check(!scorePrepNumberResponse(item,{placements:correct.placements.slice(1)}),`${label}: lost object rejected`);
      check(!scorePrepNumberResponse(item,{placements:[...correct.placements,0]}),`${label}: duplicate object rejected`);
      check(!scorePrepNumberResponse(item,{placements:correct.placements.map(()=>99)}),`${label}: invalid destination rejected`);
      check(!scorePrepNumberResponse(item,{placements:correct.placements.map(()=>-1)}),`${label}: all unplaced rejected`);
    }
    if(correct.values) check(!scorePrepNumberResponse(item,{...correct,values:correct.values.map(v=>v+1)}),`${label}: off-by-one rejected`);
    if(correct.symbols) check(!scorePrepNumberResponse(item,{symbols:correct.symbols.slice(1)}),`${label}: incomplete pattern rejected`);
    if(item.task.kind==="partition" && item.task.previous) {
      check(!scorePrepNumberResponse(item,a(...item.task.previous)),`${label}: repeating old split rejected`);
      check(!scorePrepNumberResponse(item,a(item.task.previous[1],item.task.previous[0])),`${label}: swapping old split rejected`);
    }
    if(item.task.kind==="conserve") {
      check(!scorePrepNumberResponse(item,n(item.task.count)),`${label}: quantity without reason rejected`);
      check(!scorePrepNumberResponse(item,{...correct,reason:"More space means more objects."}),`${label}: wrong reason rejected`);
    }
    if(item.task.kind==="compare") {
      check(!scorePrepNumberResponse(item,{...correct,choice:1-correct.choice!}),`${label}: wrong comparison rejected`);
      check(!scorePrepNumberResponse(item,{...correct,pairs:correct.pairs!.map(()=>0)}),`${label}: duplicated pairing rejected`);
    }
    if(item.task.kind==="supply_shortfall") {
      const {recipients,available}=item.task;
      check(recipients>=7 && recipients<=10 && available>=4 && available<=6,`${label}: matched collection sizes`);
      check(recipients-available>=3 && recipients-available<=4,`${label}: matched shortfall`);
      check(!scorePrepNumberResponse(item,n(recipients)),`${label}: total needed is not the shortfall`);
      check(!scorePrepNumberResponse(item,n(available)),`${label}: available amount is not the shortfall`);
      check(!scorePrepNumberResponse(item,n(recipients+available)),`${label}: adding both sets rejected`);
    }
    if(item.task.kind==="match") check(!scorePrepNumberResponse(item,{choice:(correct.choice!+1)%3}),`${label}: wrong dot card rejected`);
    inventory.push({form,slot:item.slot.id,code:item.slot.descriptor,prompt:item.prompt,task:item.task,token:item.token,workedResponse:correct});
  }
  check(JSON.stringify(codes)===JSON.stringify({AC9MFN01:3,AC9MFN02:2,AC9MFN03:3,AC9MFN04:4,AC9MFN05:3,AC9MFN06:3,AC9MFA01:2}),`${form}: source allocation`);
}

// Whole/parts allow multiple valid solutions, not just the worked example.
for(const form of ASSESSMENT_FORMS) for(const index of [11,15]) {
  const item=PREP_NUMBER_CANDIDATE_FORMS[form][index];
  assert.equal(item.task.kind,"partition");
  if(item.task.kind!=="partition") throw new Error("Wrong task");
  for(let left=0;left<=item.task.total;left++) {
    const right=item.task.total-left;
    const old=item.task.previous;
    const permitted=left>0 && right>0 && !(old && ((left===old[0] && right===old[1]) || (left===old[1] && right===old[0])));
    check(scorePrepNumberResponse(item,a(left,right))===permitted,`${form}: partition ${left}+${right}`);
  }
}
writeFileSync("docs/assessment-blueprints/prep-number-candidate-inventory.json",JSON.stringify({status:"candidate-not-released",assertions,items:inventory},null,2)+"\n");
const matrix=["# Prep Number: candidate authoring matrix", "", "Status: draft, not connected to live assessments. Each column is a fixed form, not a randomly generated sitting. See the JSON inventory for complete visual/task parameters and independently worked response examples.", "", "| Slot / code | Skill | Pre | Post | Start | Mid | End |", "| --- | --- | --- | --- | --- | --- | --- |"];
for(let i=0;i<20;i++) {
  const base=PREP_NUMBER_CANDIDATE_FORMS.pretest[i];
  const descriptions=ASSESSMENT_FORMS.map(form=>{
    const item=PREP_NUMBER_CANDIDATE_FORMS[form][i];
    return `${item.prompt} — ${JSON.stringify(item.task)}; objects: ${item.token}`.replaceAll("|","&#124;");
  });
  matrix.push(`| ${i+1} / ${base.slot.descriptor} | ${base.slot.evidence} | ${descriptions.join(" | ")} |`);
}
writeFileSync("docs/assessment-blueprints/prep-number-authoring-matrix.md",matrix.join("\n")+"\n");
console.log(`Prep Number: 100 candidate items; ${assertions} assertions passed. Screens, real persistence and owner review remain release gates.`);
