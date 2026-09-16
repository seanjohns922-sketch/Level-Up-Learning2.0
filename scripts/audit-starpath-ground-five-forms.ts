import assert from "node:assert/strict";
import {
  GROUND_STARPATH_BLUEPRINT,
  GROUND_STARPATH_FIVE_FORMS,
  GROUND_STARPATH_FORMS,
} from "../data/assessments/revisions/groundStarpathFiveForms";
import { groundPlacementIsCorrect } from "../lib/starpath-ground-assessment";

for (const form of GROUND_STARPATH_FORMS) {
  const questions = GROUND_STARPATH_FIVE_FORMS[form];
  assert.equal(questions.length, 20, `${form} must contain 20 questions`);
  assert.equal(new Set(questions.map((question) => question.id)).size, 20, `${form} IDs must be unique`);
  assert.deepEqual(
    questions.map((question) => question.primaryDescriptorCode),
    GROUND_STARPATH_BLUEPRINT.map(([descriptor]) => descriptor),
    `${form} must follow the Ground curriculum blueprint`,
  );
  questions.forEach((question, index) => {
    assert.ok(question.practiceTask, `${form} question ${index + 1} must reuse a lesson interaction`);
    assert.ok(question.readAloudText.trim(), `${form} question ${index + 1} needs read-aloud text`);
    const feedback = (question.practiceTask as { feedback?: { correct?: string; wrong?: string } }).feedback;
    assert.deepEqual(feedback, { correct: "Answer recorded.", wrong: "Answer recorded." }, `${form} question ${index + 1} feedback must be neutral`);
    const task = question.practiceTask;
    if (task.kind === "starpathGroundAssessment" && task.mode === "placement") {
      assert.equal(groundPlacementIsCorrect(task, task.answer), true, `${form} question ${index + 1} stored placement must score correctly`);
    }
    if ("correctOptionId" in task && "options" in task && Array.isArray(task.options)) {
      assert.ok(task.options.some((option) => option.id === task.correctOptionId), `${form} question ${index + 1} correct option must be visible`);
    }
    if (task.kind === "starpathOddOneOut") {
      assert.ok(task.options.some((option) => option.id === task.oddOptionId), `${form} question ${index + 1} odd option must be visible`);
    }
  });
}

for (let index = 0; index < 20; index += 1) {
  const taskSignatures = GROUND_STARPATH_FORMS.map((form) =>
    JSON.stringify(GROUND_STARPATH_FIVE_FORMS[form][index]!.practiceTask),
  );
  assert.equal(new Set(taskSignatures).size, 5, `Question ${index + 1} must vary across all five forms`);
}

console.log("Ground Starpath five-form audit passed: 5 matched forms, 100 interactive questions.");
