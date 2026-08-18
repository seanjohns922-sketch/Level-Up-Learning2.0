#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const failures = [];
const requireText = (source, expected, message) => {
  if (!source.includes(expected)) failures.push(message);
};

const rules = read("lib/assessment-rules.ts");
const progress = read("lib/program-progress.ts");
const hydration = read("lib/student-progress-sync.ts");
const weekPage = read("app/program/page.tsx");
const sharedQuiz = read("app/session/page.tsx");
const starpathQuiz = read("components/starpath/StarpathVoyageQuiz.tsx");

requireText(rules, "weeklyQuizPassPercent: 80", "Weekly quizzes no longer use the canonical 80% threshold.");
requireText(rules, "Math.ceil(totalQuestions", "The exact required-correct count is not derived from the quiz total.");
requireText(progress, "quizBestScore", "Program progress does not preserve a student's best quiz result.");
requireText(progress, "Math.max(previousBest, score)", "A later retry can overwrite a better quiz result.");
requireText(hydration, "const best = candidates.reduce", "Canonical quiz attempts are not hydrated using the best attempt.");
requireText(weekPage, "const needsRetry", "The shared week card has no persistent retry state.");
requireText(weekPage, "TRY AGAIN", "The shared week card does not label an unsuccessful quiz clearly.");
requireText(weekPage, "previousQuizNeedsRetry", "A locked next week does not explain the previous quiz requirement.");
requireText(sharedQuiz, "is not unlocked yet", "Number Nexus and Measurelands results do not explain the progression block.");
requireText(sharedQuiz, "Try Quiz Again", "The shared quiz result does not provide a direct retry action.");
requireText(starpathQuiz, "requiredCorrect", "Starpath results do not show the exact score needed to pass.");
requireText(starpathQuiz, "bg-gradient-to-br from-amber-500", "Starpath unsuccessful results do not use the amber retry state.");

if (failures.length > 0) {
  console.error(`Weekly quiz retry-state audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Weekly quiz retry-state audit passed: 80% gating, best-score persistence, amber retry cards and explicit unlock guidance are present.");
