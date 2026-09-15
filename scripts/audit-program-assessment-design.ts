import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PROGRAM_ASSESSMENT_BLUEPRINTS, curriculumAssessmentOwnership } from "../data/assessments/design/programBlueprint";
import { ASSESSMENT_FORMS, RELEASE_EVIDENCE } from "../data/assessments/design/assessmentContract";
import { AUSTRALIAN_CURRICULUM_V9_PAGES } from "../data/assessments/australianCurriculumV9Catalogue";
import { getPretestForYearLabel, getPosttestForYearLabel } from "../data/assessments/api";
import { getDiagnosticQuestions } from "../lib/whole-maths-diagnostic-questions";
import type { AcStrand } from "../lib/curriculum/ac-standards";

const output = path.resolve("docs/assessment-blueprints");
const issues: Array<{ blueprint: string; category: string; detail: string }> = [];
assert.equal(PROGRAM_ASSESSMENT_BLUEPRINTS.length,35);
assert.deepEqual(PROGRAM_ASSESSMENT_BLUEPRINTS.filter(b=>b.level===0).map(b=>b.realm).sort(),["measurement","number","space"]);
const rows: string[] = [];
const coverage: string[] = [];
const inventory = [];
const allSlotIds = new Set<string>();
for (const b of PROGRAM_ASSESSMENT_BLUEPRINTS) {
  const year = b.level ? `Year ${b.level}` : "Prep";
  assert.equal(b.forms.length,5);
  for (const form of b.forms) {
    assert.equal(form.slotIds.length,20,`${b.id} ${form.kind} requires 20 authored slots`);
    assert.deepEqual(form.slotIds,b.forms[0]!.slotIds);
    assert.deepEqual(form.cognitiveProfile,b.forms[0]!.cognitiveProfile);
    assert.deepEqual(form.difficultyProfile,b.forms[0]!.difficultyProfile);
    assert.deepEqual(form.responseProfile,b.forms[0]!.responseProfile);
    for (const profile of [form.cognitiveProfile,form.difficultyProfile,form.responseProfile]) assert.equal(Object.values(profile).reduce((a,n)=>a+n,0),20);
  }
  const allocation = b.descriptors.reduce((sum,d)=>sum+d.itemsPerForm,0);
  if (allocation!==20) issues.push({blueprint:b.id,category:"allocation",detail:`Descriptor allocation totals ${allocation}, not 20.`});
  for (const d of b.descriptors) {
    assert.ok(AUSTRALIAN_CURRICULUM_V9_PAGES[d.code],d.code);
    if (d.itemsPerForm!==d.legacyPostAllocation) issues.push({blueprint:b.id,category:"allocation",detail:`${d.code}: legacy pre/post allocations differ.`});
    coverage.push(`| ${b.id} | ${d.code} | ${d.itemsPerForm} | ${d.sourcePages.join(", ")} | ${d.description.replaceAll("|","/")} |`);
  }
  if (b.skillSlots.length !== 20) issues.push({blueprint:b.id,category:"skill-contract",detail:"Twenty explicit skill slots still require authoring and curriculum review; existing question labels are not approval."});
  if(b.skillSlots.length) {
    assert.equal(new Set(b.skillSlots.map(s=>s.id)).size,20);
    for(const d of b.descriptors) assert.equal(b.skillSlots.filter(s=>s.descriptor===d.code).length,d.itemsPerForm,`${b.id} ${d.code}`);
    for(const s of b.skillSlots) {
      assert.ok(s.evidence&&s.scoring&&s.representation.specification);assert.ok(s.invariants.length>=2);
      assert.ok(!allSlotIds.has(s.id),`Duplicate slot ${s.id}`);allSlotIds.add(s.id);
      assert.ok(b.descriptors.some(d=>d.code===s.descriptor),`${s.id} uses an unallocated code`);
      assert.ok(s.descriptor.startsWith(`AC9M${b.level||"F"}`),`${s.id} maps to a different level`);
      assert.ok(s.tools.calculator&&s.tools.taskTools&&s.tools.access);
      if (/explain|justify|critique/i.test(s.evidence)) assert.ok(s.response!=="number",`${s.id} cannot capture required reasoning as a bare number`);
    }
  }
  const strand: AcStrand = b.realm==='pattern'?'algebra':b.realm==='chance'?'probability':b.realm;
  const forms = [getPretestForYearLabel(year,b.realm),getPosttestForYearLabel(year,b.realm)?.questions??[],...(['start','mid','end'] as const).map(c=>getDiagnosticQuestions(strand,year,'blueprint-inventory',c).map(q=>q.question))];
  const repeats=[];
  for(let i=0;i<forms.length;i++) {
    assert.equal(forms[i]!.length,20,`${b.id} ${ASSESSMENT_FORMS[i]}`);
    for(let j=i+1;j<forms.length;j++) {
      const ids = new Set(forms[i]!.map(q=>q.id));
      const overlap=forms[j]!.filter(q=>ids.has(q.id)).length;
      if(overlap) repeats.push(`${ASSESSMENT_FORMS[i]}/${ASSESSMENT_FORMS[j]}: ${overlap}`);
    }
    const actual=new Map<string,number>();
    for(const q of forms[i]!) {
      const code=(q as typeof q & {primaryDescriptorCode?:string}).primaryDescriptorCode??'unmapped';
      actual.set(code,(actual.get(code)??0)+1);
    }
    for(const d of b.descriptors) if((actual.get(d.code)??0)!==d.itemsPerForm) issues.push({blueprint:b.id,category:'live-allocation',detail:`${ASSESSMENT_FORMS[i]} ${d.code}: ${actual.get(d.code)??0} live / ${d.itemsPerForm} proposed.`});
  }
  if(repeats.length) issues.push({blueprint:b.id,category:'repeated-forms',detail:repeats.join('; ')});
  const missingVisual= forms.slice(0,2).map(qs=>qs.filter(q=>!q.visual&&!q.practiceTask).length);
  inventory.push({id:b.id,forms:ASSESSMENT_FORMS.map((kind,i)=>({kind,items:forms[i]!.map(q=>({id:q.id,prompt:q.prompt,hasRepresentation:!!(q.visual||q.practiceTask)}))})),representationReview:missingVisual});
  rows.push(`| ${b.id} | ${allocation} | ${b.skillSlots.length}/20 | ${missingVisual.join(" / ")} | ${repeats.length ? "Reuses items" : "Distinct IDs"} | Not ready |`);
}
assert.equal(allSlotIds.size,700);
const slotsFor=(id:string)=>PROGRAM_ASSESSMENT_BLUEPRINTS.find(b=>b.id===id)!.skillSlots;
assert.ok(slotsFor("chance-4").some(s=>s.descriptor==="AC9M4P01"&&/independent/.test(s.evidence)),"Level 4 must explicitly assess independent events");
assert.ok(slotsFor("chance-4").some(s=>s.descriptor==="AC9M4P01"&&/dependen/.test(s.evidence)),"Level 4 must explicitly assess dependence");
assert.ok(slotsFor("chance-5").every(s=>!/calculate.*probabil|fractional probability/i.test(s.evidence)),"Do not move formal numerical probability into Level 5");
assert.ok(slotsFor("statistics-5").filter(s=>s.descriptor==="AC9M5ST02").every(s=>s.response!=="construction"),"Level 5 line-graph descriptor requires interpretation, not replacement by construction");
for(const b of PROGRAM_ASSESSMENT_BLUEPRINTS) for(const slot of b.skillSlots) if(["AC9M3N03","AC9M3A02","AC9M4N05","AC9M4A02","AC9M6N06"].includes(slot.descriptor)) assert.equal(slot.tools.calculator,"prohibited-by-descriptor");
const unassigned=[];
for(const code of Object.keys(AUSTRALIAN_CURRICULUM_V9_PAGES)) {
 const owner=curriculumAssessmentOwnership(code);
 if(owner.scope==='unassigned')unassigned.push(code);
}
fs.mkdirSync(output,{recursive:true});
const slotReview = PROGRAM_ASSESSMENT_BLUEPRINTS.filter(b=>b.skillSlots.length).map(b=>
  `## ${b.id}\n\n`+b.skillSlots.map(s=>
    `### ${s.id} — ${s.descriptor}\n\n${s.evidence}\n\n- Response: ${s.response}; thinking: ${s.cognitiveDemand}; expected difficulty: ${s.expectedDifficulty} (uncalibrated).\n- Required representation: ${s.representation.specification}\n- Keep equivalent: ${s.invariants.join(" ")}\n- Scoring: ${s.scoring}\n- Calculator: ${s.tools.calculator}. ${s.tools.taskTools}\n`).join("\n")
).join("\n");
fs.writeFileSync(path.join(output,"authored-skill-slots.md"),"# Authored skill-slot specifications\n\nDesign drafts for all five forms. These describe what must be authored and verified, not currently verified student screens.\n\n"+slotReview);
fs.writeFileSync(path.join(output,"design-inventory.json"),JSON.stringify({status:"blueprints-drafted; forms-not-rebuilt",blueprints:PROGRAM_ASSESSMENT_BLUEPRINTS,issues,unassignedCurriculumCodes:unassigned,requiredReleaseEvidence:RELEASE_EVIDENCE},null,2)+'\n');
fs.writeFileSync(path.join(output,"current-form-inventory.json"),JSON.stringify(inventory,null,2)+'\n');
fs.writeFileSync(path.join(output,"coverage.md"),'# Curriculum allocation inventory\n\nCommon descriptor allocations retained from the existing curriculum blueprints, with 700 authored skill specifications and source-scope corrections. This is the blueprint for rebuilding all five forms, not evidence that the current questions meet it. The completed forms still require mathematical, rendered-screen and owner review.\n\n| Blueprint | Code | Items per form | PDF pages | Skill scope |\n|---|---|---:|---|---|\n'+coverage.join('\n')+'\n\nUnassigned codes requiring investigation: '+(unassigned.length ? unassigned.join(', ') : 'None')+'.\n\nFoundation Statistics (AC9MFST01) is intentionally outside the assessed Prep scope.\n');
fs.writeFileSync(path.join(output,"readiness.md"),'# Five-form assessment readiness\n\nThis report intentionally distinguishes structurally valid design data from release readiness. No form is approved by generating this report. A missing representation is a review flag, not automatically a defect. A present payload does not prove successful rendering.\n\n| Blueprint | Allocation | Authored skill slots | Pre/post without visual or task payload | Current forms | Status |\n|---|---:|---:|---:|---|---|\n'+rows.join('\n')+'\n\n'+issues.map(i=>`- **${i.blueprint} / ${i.category}:** ${i.detail}`).join('\n')+'\n');
console.log(`Design structure checked: 35 blueprints, 700 authored slots, 175 matched form specifications. ${issues.length} open design/release findings; ${unassigned.length} unassigned curriculum codes. Not a release pass.`);

if(process.argv.includes("--require-ready") && (issues.length || PROGRAM_ASSESSMENT_BLUEPRINTS.some(b=>RELEASE_EVIDENCE.some(e=>!b.releaseEvidence.includes(e))))) {
  console.error("Release readiness FAILED: unresolved design findings or missing audit/manual-review evidence.");
  process.exitCode=1;
}
