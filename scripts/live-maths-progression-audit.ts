import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  computePredictedWholeMathsLevel,
  estimateLiveProgression,
  measuredCheckpointForAssessment,
} from "@/lib/live-maths-progression";

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

assert.equal(measuredCheckpointForAssessment(3, 85), 4, "An 85% Level 3 post-test must confirm Level 4.00.");
assert.equal(measuredCheckpointForAssessment(2, 60), 2.44, "A 60% Level 2 post-test must recalibrate the realm checkpoint to 2.44.");

const firstQuiz = estimateLiveProgression({
  checkpointLevel: 4.1,
  checkpointSource: "diagnostic",
  workingLevel: 4,
  totalWeeks: 12,
  passedQuizWeeks: 1,
  completedUnconfirmedLessons: 0,
});
assert.equal(firstQuiz.predictedLevel, 4.18, "A confirmed Number week should move 4.10 to 4.18.");
assert.equal(firstQuiz.confidence, 74, "Confirmed evidence should increase prediction confidence.");

const lessonsOnly = estimateLiveProgression({
  checkpointLevel: 4.1,
  checkpointSource: "diagnostic",
  workingLevel: 4,
  totalWeeks: 12,
  passedQuizWeeks: 0,
  completedUnconfirmedLessons: 3,
});
assert.equal(lessonsOnly.predictedLevel, 4.13, "Three lessons may move the prediction provisionally by only 0.4 week.");

const confirmedReplacesProvisional = estimateLiveProgression({
  checkpointLevel: 4.1,
  checkpointSource: "diagnostic",
  workingLevel: 4,
  totalWeeks: 12,
  passedQuizWeeks: 1,
  completedUnconfirmedLessons: 0,
});
assert.equal(confirmedReplacesProvisional.predictedLevel, 4.18, "A quiz must replace, not stack on, its lessons' provisional credit.");

assert.equal(
  computePredictedWholeMathsLevel({ number: 4.2, measurement: 4.1, space: 4.3, statistics: 4.2 }),
  null,
  "Four live strand predictions must not be labelled as a Whole-Maths overall.",
);
assert.equal(
  computePredictedWholeMathsLevel({ number: 4, measurement: 4.5, space: 4, statistics: 4.5, algebra: 3.5, probability: 4 }),
  4.09,
  "The future six-strand live overall must use the same level-aware AC9 calculation as the official diagnostic.",
);
assert.equal(
  computePredictedWholeMathsLevel({
    number: 3,
    algebra: 3,
    statistics: 3,
    space: 3,
    probability: 4,
    measurement: 2,
  }),
  2.83,
  "A complete six-realm working profile may produce a live estimate without claiming an official result.",
);
assert.equal(
  computePredictedWholeMathsLevel({
    number: measuredCheckpointForAssessment(3, 85),
    algebra: 3,
    statistics: 3,
    space: 3,
    probability: 4,
    measurement: measuredCheckpointForAssessment(2, 60),
  }),
  3.27,
  "Johnny's Number mastery and 60% Measurement post-test must recalibrate his live whole-maths estimate to 3.27.",
);

const migration = read("supabase/migrations/20260903180000_live_maths_progression_tracker.sql");
for (const required of [
  "student_live_maths_progression",
  "refresh_student_live_maths_progression",
  "v_quiz_pass constant integer := 80",
  "v_mastery constant integer := 85",
  "v_floor constant integer := 40",
  "checkpoint_source in ('diagnostic', 'pretest', 'posttest', 'placement')",
  "when v_assessment_score >= v_mastery then v_assessment_level + 1",
  ") = 6",
  "sitting.checkpoint in ('start', 'mid', 'end')",
  "v_lesson_week_credit constant numeric := 0.4",
  "group by attempt.week",
  "group by attempt.week, attempt.lesson",
  "official_level = excluded.official_level",
  "predicted_level = excluded.predicted_level",
  "get_teacher_live_maths_progression",
  "drop function if exists public.get_teacher_live_maths_progression(uuid)",
  "drop column official_source",
  "trg_refresh_live_progression_from_diagnostic_sitting",
  "security definer",
]) {
  assert(migration.toLowerCase().includes(required.toLowerCase()), `Live progression migration is missing: ${required}`);
}
assert(
  !/set\s+official_level[\s\S]{0,160}(student_lesson_attempts|student_weekly_quiz_attempts)/i.test(migration),
  "Weekly evidence must never directly overwrite an official level.",
);

const panel = read("components/teacher/WholeMathsDiagnosticPanel.tsx");
assert(panel.includes("Live progression tracker"), "The teacher Diagnostic tab is missing the live tracker.");
assert(panel.includes("Live score") && panel.includes("Diagnostic score"), "Live and diagnostic levels are not clearly distinguished.");
assert(panel.includes("S = Start · M = Mid · E = End"), "The diagnostic checkpoint markers are missing.");
assert(panel.includes('setSelectedStrand("all")'), "The complete Whole-Maths view is missing.");
assert(!panel.includes(">Confidence<") && !panel.includes(">Evidence<"), "Internal confidence or evidence leaked back into the teacher tracker.");
assert(panel.includes("30_000"), "The live tracker must refresh while the teacher keeps the tab open.");

console.log("Live maths progression audit passed: official results stay fixed, realm tests recalibrate checkpoints, and weekly evidence moves predictions.");
