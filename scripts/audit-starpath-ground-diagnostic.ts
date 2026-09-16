import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getDiagnosticQuestions } from "../lib/whole-maths-diagnostic-questions";
import { decideDiagnosticPlacement } from "../lib/whole-maths-diagnostic";
import { GROUND_STARPATH_FIVE_FORMS } from "../data/assessments/revisions/groundStarpathFiveForms";
import { isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import { encodeAssessmentResponse } from "../lib/assessment-response";
import { SHAPE_OBJECTS } from "../data/activities/starpath/ground/shape-objects";

for (const questions of Object.values(GROUND_STARPATH_FIVE_FORMS)) {
  for (const question of questions) {
    const task = question.practiceTask;
    if (task.kind === "starpathObjectShape") {
      assert.ok(task.objectId in SHAPE_OBJECTS, `${question.id}: unsupported shape object ${task.objectId}`);
      assert.equal(task.options.find(option => option.id === task.correctOptionId)?.shape, task.targetShape);
    }
  }
}

const ids = new Set<string>();
for (const checkpoint of ["start", "mid", "end", "ad_hoc"] as const) {
  const questions = getDiagnosticQuestions("space", "Prep", "ground-audit", checkpoint,
    5,3,3,3,3,3,3,8,4,4,4,4,4,1,3);
  const form = checkpoint === "ad_hoc" ? "start" : checkpoint;
  assert.equal(questions.length, 20);
  assert.deepEqual(questions.map(q => q.question.id).sort(), GROUND_STARPATH_FIVE_FORMS[form].map(q => q.id).sort());
  for (const { question, curriculumCodes } of questions) {
    assert.ok(curriculumCodes.length && curriculumCodes.every(code => ["AC9MFSP01", "AC9MFSP02"].includes(code)));
    assert.equal(isAssessmentAnswerCorrect(question, encodeAssessmentResponse(question.id, "starpathGroundAssessment", true, "chosen")), true);
    assert.equal(isAssessmentAnswerCorrect(question, encodeAssessmentResponse(question.id, "starpathGroundAssessment", false, "chosen")), false);
    assert.equal(isAssessmentAnswerCorrect(question, "idk"), false);
    if (checkpoint !== "ad_hoc") { assert.ok(!ids.has(question.id)); ids.add(question.id); }
  }
}
assert.equal(ids.size, 60, "Each Ground checkpoint needs independent IDs.");
for (const checkpoint of ["start", "mid", "end"] as const) {
  assert.ok(getDiagnosticQuestions("space", "Prep", "legacy", checkpoint).every(q => !q.question.id.endsWith("-v3")), "Legacy cycles keep their questions.");
}
const probe = (level: string, score: number) => ({ level, score, total: 20, percent: score * 5 });
assert.equal(decideDiagnosticPlacement("Prep", [probe("Prep", 5)], 0).shouldProbeLower, false);
assert.equal(decideDiagnosticPlacement("Prep", [probe("Prep", 17)], 0).shouldProbeNext, true);
assert.equal(decideDiagnosticPlacement("Year 1", [probe("Year 1", 5)], 0).shouldProbeLower, true);
assert.equal(decideDiagnosticPlacement("Year 1", [probe("Year 1", 5), probe("Prep", 12)], 0).recommendedLevel, "Year 1", "A support probe must preserve established placement.");
const menu = readFileSync("components/demo/DemoReviewPanel.tsx", "utf8");
assert.ok(menu.includes('realm === "measurement" || realm === "space" ? ('), "Ground diagnostic controls must be visible.");
const card = readFileSync("components/assessment/AssessmentQuestionCard.tsx", "utf8");
assert.ok(card.includes('realmId === "space" && question.practiceTask'), "The student diagnostic must render Starpath interactions.");
console.log("Ground Starpath diagnostic: all checkpoints, curriculum links, interactive scoring, legacy banks and Ground/up/down progression pass.");
