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
const sessionSource = fs.readFileSync(path.join(repoRoot, "app/session/page.tsx"), "utf8");
const telemetrySource = fs.readFileSync(path.join(repoRoot, "lib/live-class-client.ts"), "utf8");
const guardMigration = fs.readFileSync(
  path.join(repoRoot, "supabase/migrations/20260903190000_enforce_live_quiz_snapshot_totals.sql"),
  "utf8",
);

assert.match(
  source,
  /if \(row\) return row;[\s\S]*canonicalProgressActivityRow/,
  "Live telemetry must be preserved ahead of canonical waiting placeholders.",
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
assert.match(source, /Math\.min\(answered, WEEKLY_QUIZ_QUESTION_COUNT\)/, "Live Class must reject impossible quiz denominators.");
assert.match(sessionSource, /const quizKey = quizAttemptKey/, "Quiz telemetry must reset for the full realm quiz identity.");
assert.match(sessionSource, /questionsAnswered: distinctAnswered/, "Quiz telemetry must report distinct questions, not accumulated responses.");
assert.match(telemetrySource, /isLearningActivityStart \|\| changedLearningActivity/, "A changed lesson or quiz id must reset live counters.");
assert.match(guardMigration, /new\.questions_answered := least\(15/, "The database must enforce the 15-question live quiz ceiling.");
assert.match(guardMigration, /update public\.live_student_activity/, "Existing malformed live quiz snapshots must be repaired.");

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
