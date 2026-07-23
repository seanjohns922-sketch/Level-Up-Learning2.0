#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(
  path.join(repoRoot, "components/teacher/LiveClassPanel.tsx"),
  "utf8",
);

assert.match(source, /if \(event\.student_id !== row\.student_id\) return false/);
assert.match(
  source,
  /if \(row\.current_lesson \|\| eventLessonId\) \{[\s\S]*?eventLessonId === row\.current_lesson/,
);
assert.doesNotMatch(
  source,
  /\(row\.current_lesson && eventLessonId === row\.current_lesson\) \|\|\s*\(row\.current_lesson_title/,
);

function matchesCurrentQuiz(row, event) {
  if (event.student_id !== row.student_id) return false;
  const eventLessonId = event.payload.lessonId ?? null;
  const eventLessonTitle = event.payload.lessonTitle ?? null;
  if (row.current_lesson || eventLessonId) {
    return Boolean(row.current_lesson && eventLessonId === row.current_lesson);
  }
  return Boolean(row.current_lesson_title && eventLessonTitle === row.current_lesson_title);
}

const taliaQuiz = {
  student_id: "talia",
  current_lesson: "year-5-measurement-w1-weekly-quiz",
  current_lesson_title: "Weekly Quiz",
};

assert.equal(matchesCurrentQuiz(taliaQuiz, {
  student_id: "another-student",
  payload: {
    lessonId: "year-5-measurement-w1-weekly-quiz",
    lessonTitle: "Weekly Quiz",
  },
}), false);

assert.equal(matchesCurrentQuiz(taliaQuiz, {
  student_id: "talia",
  payload: {
    lessonId: "year-5-measurement-w2-weekly-quiz",
    lessonTitle: "Weekly Quiz",
  },
}), false);

assert.equal(matchesCurrentQuiz(taliaQuiz, {
  student_id: "talia",
  payload: {
    lessonId: "year-5-measurement-w1-weekly-quiz",
    lessonTitle: "Weekly Quiz",
  },
}), true);

console.log("Live quiz score audit passed: reconstruction is isolated by student and canonical quiz ID.");
