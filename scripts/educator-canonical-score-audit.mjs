import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  aggregateLearningScores,
  calculateAccuracy,
  formatAccuracy,
} from "../lib/learning-score.ts";

const root = new URL("../", import.meta.url);

assert.equal(calculateAccuracy(34, 40), 85);
assert.equal(calculateAccuracy(18, 20), 90);
assert.equal(calculateAccuracy(13, 15), 86.67);
assert.equal(formatAccuracy(13, 15), "86.67%");
assert.equal(formatAccuracy(13, 15, "—", 0), "87%");
assert.deepEqual(
  aggregateLearningScores([
    { correct: 9, total: 13 },
    { correct: 35, total: 35 },
  ]),
  { correct: 44, total: 48, accuracy: 91.67 },
);

const liveClass = await readFile(new URL("components/teacher/LiveClassPanel.tsx", root), "utf8");
const compat = await readFile(new URL("lib/realm-progress-compat.ts", root), "utf8");
const teacherFiles = [
  "app/teacher/dashboard/page.tsx",
  "app/teacher/student-insights/page.tsx",
  "components/teacher/AssessmentReplay.tsx",
  "components/teacher/CurriculumExplorer.tsx",
  "components/teacher/LiveClassPanel.tsx",
  "components/teacher/LiveStudentDrawer.tsx",
  "components/teacher/StrandStudentsPanel.tsx",
];

assert.doesNotMatch(liveClass, /MAX_LESSON_SCORE_QUESTIONS/);
assert.match(liveClass, /Current accuracy/);
assert.match(liveClass, /studentIds[\s\S]*\.in\("student_id", studentIds\)/);
assert.match(compat, /questionsAnswered:\s*row\.total_questions/);
assert.match(compat, /correctAnswers:\s*row\.correct_count/);

for (const file of teacherFiles) {
  const source = await readFile(new URL(file, root), "utf8");
  assert.match(source, /learning-score/, `${file} must use the canonical score helper`);
}

console.log("Educator canonical score audit passed.");
console.log("34/40 = 85%; 18/20 = 90%; 13/15 = 86.67%.");
console.log("Live lesson totals are uncapped and completed attempt columns remain canonical.");
