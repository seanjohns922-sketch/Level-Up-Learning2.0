import assert from "node:assert/strict";
import { AUSTRALIAN_CURRICULUM_V9_PAGES } from "../data/assessments/australianCurriculumV9Catalogue";
import { assessmentEvidenceMetadata, comparableAssessmentGrowth } from "../lib/assessment-growth";
import type { NormalizedAssessmentAttempt } from "../lib/realm-progress-compat";
import { isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import { encodeAssessmentResponse, decodeAssessmentResponse } from "../lib/assessment-response";
import { getPretestForYearLabel, getPosttestForYearLabel } from "../data/assessments/api";

const fraction = { id: "fraction", type: "numeric", correctAnswer: "13/12" };
for (const answer of ["13/12", "26/24", "1 1/12", " 13 / 12 "]) assert.equal(isAssessmentAnswerCorrect(fraction, answer), true, answer);
for (const answer of ["13", "12/13", "13/0", "1/12", "1 13/12", "NaN", "", "13/12junk"]) assert.equal(isAssessmentAnswerCorrect(fraction, answer), false, answer);
const missing = { id: "missing", type: "numeric", correctAnswer: "3", visual: { expression: "?/4" } };
assert.equal(isAssessmentAnswerCorrect(missing, "3/4"), true);
assert.equal(isAssessmentAnswerCorrect(missing, "6/8"), false);
assert.equal(isAssessmentAnswerCorrect(missing, "3"), true);
assert.equal(isAssessmentAnswerCorrect({ id: "point", type: "numeric", correctAnswer: "(2, -3)" }, "2,-3"), true);
const evidence = encodeAssessmentResponse("graph", "statisticaGraph", true, JSON.stringify([3, 7, 2]));
assert.equal(decodeAssessmentResponse(evidence)?.response, "[3,7,2]");
assert.equal(isAssessmentAnswerCorrect({ id: "graph", type: "statisticaTask" }, evidence), true);
assert.equal(isAssessmentAnswerCorrect({ id: "other", type: "statisticaTask" }, evidence), false);
assert.equal(isAssessmentAnswerCorrect(fraction, evidence), false);
assert.equal(decodeAssessmentResponse("__assessment_evidence_v1__:invalid"), null);
let count = 0;
for (const realm of ["number", "measurement", "space", "statistics", "pattern", "chance"] as const) {
  const start = realm === "statistics" ? 1 : ["pattern", "chance"].includes(realm) ? 3 : 0;
  for (let level = start; level <= 6; level++) {
    const year = level === 0 ? "Prep" : `Year ${level}`;
    for (const questions of [getPretestForYearLabel(year, realm), getPosttestForYearLabel(year, realm)?.questions ?? []]) {
      assert.equal(questions.length, 20, `${realm} ${year}`);
      for (const q of questions) {
        // Ground model tasks require raw evidence; their rubric is not a valid answer.
        // qa:ground-number-release independently verifies all 100 worked responses.
        assert.equal(isAssessmentAnswerCorrect(q, String(q.correctAnswer)), q.type !== "prepNumberTask" && !["starpath_released","statistica_released"].includes((q.visual as {type?:string})?.type??""), q.id);
        assert.equal(isAssessmentAnswerCorrect(q, "__invalid_answer__"), false, q.id);
        for (const code of (q as { curriculumCodes?: string[] }).curriculumCodes ?? []) assert.ok(AUSTRALIAN_CURRICULUM_V9_PAGES[code], `${q.id}: ${code} must exist in the supplied PDF`);
        count++;
      }
    }
  }
}


// Independent calculations for the retained v2 Year 6 post-test, rather than
// merely checking that its answer keys are accepted by their own scorer.
const year6 = getPosttestForYearLabel("Year 6", "number", 5, 3, 3, 3, 3, 2)!.questions;
const calculations: Record<number, number> = {
  6: 26.58 + 7.437, 7: 15.3 - 7.875, 8: (1/4 + 3/10) * 20,
  9: (2/3 - 1/4) * 12, 10: 4.073 * 100, 11: 62.8 / 1000,
  12: 188 / 4, 13: 240 * 0.8, 14: 680 * 0.35,
  15: Math.round((39.8 / 100 * 746) / 10) * 10,
  16: Math.round((398 * 0.25) / 10) * 10,
  17: 1500 - 520 - 32 * 23, 18: 12 / 4 * 16 - 12 / 3 * 10,
  19: Math.floor(900 / (44 * 0.9)),
};
for (const [index, expected] of Object.entries(calculations)) {
  assert.ok(Math.abs(Number(String(year6[Number(index)]!.correctAnswer).split("||")[0]) - expected) < 1e-9, `Year 6 post item ${Number(index)+1} mathematical answer`);
}

// A correct numerical value cannot compensate for an incorrect justification.
for (const [realm, level, indices] of [["number", 6, [16,19]], ["measurement", 5, [14,18]]] as const) {
  const questions = getPretestForYearLabel(`Year ${level}`, realm, 5, 3, 3, 3, 3, 2, 3, 4, 4, 4, 3);
  for (const index of indices) {
    const q = questions[index]!;
    const [value, reason] = String(q.correctAnswer).split("||");
    assert.equal(isAssessmentAnswerCorrect(q, `${value}||${reason === "1" ? "2" : "1"}`), false);
    assert.equal(isAssessmentAnswerCorrect(q, `${Number(value)+100}||${reason}`), false);
    assert.equal(isAssessmentAnswerCorrect(q, value!), false);
  }
}
const estimate = getPretestForYearLabel("Year 5", "measurement", 5, 3, 3, 3, 3, 3, 3, 4, 4, 4, 3)[2]!;
for (const answer of ["60", "70", "80"]) assert.equal(isAssessmentAnswerCorrect(estimate, answer), true);
for (const answer of ["59", "81", "junk"]) assert.equal(isAssessmentAnswerCorrect(estimate, answer), false);
const exactAngle = getPretestForYearLabel("Year 5", "measurement", 5, 3, 3, 3, 3, 3, 3, 4, 4, 4, 3)[6]!;
assert.equal(isAssessmentAnswerCorrect(exactAngle, "123"), false, "Exact protractor reading does not inherit estimate tolerance");
// This section verifies the retained repair bank; released forms have their own audit.
const year3 = getPretestForYearLabel("Year 3", "number", 5, 3, 3, 3, 3, 3, 2);
for (const index of [4,5,6,7]) assert.deepEqual((year3[index] as { curriculumCodes?: string[] }).curriculumCodes, ["AC9M3N03"], "Addition/subtraction belongs to N03");
for (const index of [12,13,14]) assert.deepEqual((year3[index] as { curriculumCodes?: string[] }).curriculumCodes, ["AC9M3N04"], "Multiplication/division belongs to N04");
for (const index of [2,3]) assert.deepEqual((year3[index] as { curriculumCodes?: string[] }).curriculumCodes, ["AC9M3N05"], "Estimation belongs to N05");
const makeAttempt = (id: string, kind: "pretest"|"posttest", day: number, score: number, cycleId: string): NormalizedAssessmentAttempt => ({
  id, realmId: "statistics", workingLevel: "Year 1", assessmentType: kind, completedAt: `2026-09-${String(day).padStart(2,"0")}T00:00:00Z`,
  scorePercent: score, attemptNumber: 1, correctCount: score/5, totalQuestions: 20, passed: false, questionResults: [],
  placementResult: { assessment_evidence: { comparison_group: "matched", learning_cycle_id: cycleId } },
});
const firstCycle = [makeAttempt("a","pretest",1,40,"first"),makeAttempt("b","pretest",2,70,"first"),makeAttempt("c","posttest",3,90,"first")];
assert.equal(comparableAssessmentGrowth(firstCycle,"statistics","Year 1").change,50);
const nextCycle = [...firstCycle,makeAttempt("d","pretest",4,30,"second")];
assert.equal(comparableAssessmentGrowth(nextCycle,"statistics","Year 1").change,null);
assert.equal(comparableAssessmentGrowth([...nextCycle,makeAttempt("e","posttest",5,85,"second")],"statistics","Year 1").change,55);
assert.equal(assessmentEvidenceMetadata("number","Year 1",[{id:"old-v1"}]).assessment_evidence?.comparison_group,null);
assert.deepEqual(assessmentEvidenceMetadata("statistics","Prep",[]),{},"No Ground Statistica baseline or growth group");
// Independently execute every ordering of the Level 3 instruction cards.
for (const [form,inputs,outputs] of [["pretest",[10,7],[16,22]],["posttest",[12,9],[20,28]]] as const) {
  const qs = form === "pretest" ? getPretestForYearLabel("Year 3","pattern") : getPosttestForYearLabel("Year 3","pattern")!.questions;
  const q = qs[19]!;
  const cards = q.options as string[];
  const permutations = cards.flatMap(a => cards.filter(b => b !== a).map(b => [a,b,cards.find(c => c !== a && c !== b)!]));
  const execute = (steps: string[], input: number) => steps.reduce((value, step) => step.startsWith("If ") ? (value % 2 === 0 ? value / 2 : value + 1) : step.startsWith("Double") ? value * 2 : value + Number(step.match(/Add (\d+)/)?.[1]), input);
  const valid = permutations.filter(steps => inputs.every((value,i) => execute(steps,value) === outputs[i]));
  assert.equal(valid.length,1,"Algorithm examples identify exactly one instruction ordering");
  assert.equal(isAssessmentAnswerCorrect(q,valid[0]!.join("||")),true);
  assert.equal(isAssessmentAnswerCorrect(q,[...valid[0]!].reverse().join("||")),false);
}
console.log(`Assessment repair regression passed: ${count} keys, PDF identifiers, fraction scoring, numerical reasoning, estimation boundaries and learning cycles.`);
