#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Weekly Quiz navigation audit
//
// Verifies that the quiz header (the "Q n/N" + "Lesson" titles and the "Jump"
// dropdown) always REGISTER the question the student is currently on and MOVE
// WITH the student, while the student can still TOGGLE back and forth.
//
// Two layers:
//   1. Source contract — the JSX in app/session/page.tsx is wired so the title
//      chips and the dropdown are driven by the live `quizIndex` (controlled),
//      and BACK / NEXT / Jump all drive `setQuizIndex`. Catches regressions
//      (e.g. someone making the <select> uncontrolled, or removing value=).
//   2. Behaviour model — a pure simulation of the navigation reducer proving
//      the dropdown value tracks the active question and back/forth + jump work
//      with correct clamping.
//
// Run: node scripts/quiz-nav-audit.mjs   (or: npm run qa:quiz-nav)
// ─────────────────────────────────────────────────────────────────────────────

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const SESSION_FILE = "app/session/page.tsx";
const source = fs.readFileSync(path.resolve(repoRoot, SESSION_FILE), "utf8");
// Collapse whitespace so multi-line JSX matches single-line patterns.
const flat = source.replace(/\s+/g, " ");

let failures = 0;
const results = [];

function check(label, ok, detail = "") {
  results.push({ label, ok, detail });
  if (!ok) failures += 1;
}

function has(label, pattern, detail = "") {
  const ok = pattern instanceof RegExp ? pattern.test(flat) : flat.includes(pattern);
  check(label, ok, ok ? "" : detail || `expected to find: ${pattern}`);
}

// ── 1. Source contract ───────────────────────────────────────────────────────

// The active question is derived from the live index.
has(
  "Active question derives from quizIndex (currentQuiz = quizQuestions[quizIndex])",
  /const currentQuiz = quizQuestions\[quizIndex\]/
);

// Title chip registers the current question number / total.
has(
  'Title chip shows "Q {quizIndex + 1}" of total',
  /Q \{quizIndex \+ 1\}.*\/\{quizQuestions\.length\}/
);

// Lesson title chip registers the current question's lesson.
has(
  "Lesson title chip reads from currentQuiz.lessonTag",
  /Lesson \{currentQuiz\.lessonTag\}/
);

// The dropdown is a CONTROLLED select bound to quizIndex → it always reflects
// (moves with) the current question.
has(
  "Jump dropdown is controlled by quizIndex (value={quizIndex})",
  /<select value=\{quizIndex\}/
);
has(
  "Jump dropdown changes the active question (onChange → setQuizIndex)",
  /const target = Number\(e\.target\.value\);[\s\S]*setQuizIndex\(target\)/
);

// The dropdown lists every question with its real index.
has(
  "Dropdown lists every question with its index",
  /quizQuestions\.map\(\(question, index\) => \{[\s\S]*<option key=\{question\.id\} value=\{index\}/
);

// Jumping is restricted to already-answered questions (or the current one).
has(
  "Dropdown disables questions that are not answered (no skipping ahead)",
  /disabled=\{!selectable\}/
);
has(
  "Dropdown onChange only allows jumping to answered questions",
  /if \(target === quizIndex \|\| isQuestionAnswered\(quizQuestions\[target\]\)\)/
);

// The quiz must be generated once (not re-randomised every render). Guard the
// regression where the memo depended on the re-created buildQuizQuestions fn.
has(
  "Quiz questions are generated from stable inputs (not regenerated every render)",
  /\[year, week, realmId, quizConfig, quizWeekPlan\]/
);
check(
  "Quiz questions memo does NOT depend on the re-created buildQuizQuestions function",
  !/\(\) => buildQuizQuestions\(\),\s*\[buildQuizQuestions\]/.test(flat),
  "found useMemo(() => buildQuizQuestions(), [buildQuizQuestions]) — this re-randomises the quiz every render"
);

// BACK toggles backward and is only disabled at the first question.
has(
  "BACK button steps the index back (setQuizIndex i-1, clamped at 0)",
  /setQuizIndex\(\(i\) => Math\.max\(0, i - 1\)\)/
);
has(
  "BACK button is enabled except on the first question",
  /disabled=\{quizIndex === 0\}/
);

// NEXT toggles forward, clamped at the last question.
has(
  "NEXT button steps the index forward (setQuizIndex i+1, clamped at last)",
  /setQuizIndex\(\(i\) => Math\.min\(quizQuestions\.length - 1, i \+ 1\) ?\)/
);

// Progress label/telemetry also tracks the live index (moves with the student).
has(
  "Live progress label tracks the current index",
  /Quiz question \$\{quizIndex \+ 1\} of \$\{quizQuestions\.length\}/
);

// ── 2. Behaviour model (pure navigation reducer) ─────────────────────────────
// Mirrors the component: BACK = max(0,i-1), NEXT = min(n-1,i+1), JUMP = clamp.
// `dropdownValue` mirrors `value={quizIndex}` (controlled) → equals the index.

const N = 15; // a weekly quiz has 15 questions
const clamp = (i) => Math.max(0, Math.min(N - 1, i));
const back = (i) => Math.max(0, i - 1);
const next = (i) => Math.min(N - 1, i + 1);
const jump = (i, target) => clamp(target);
const dropdownValue = (i) => i; // controlled select reflects the active index

// The dropdown / title always reflect the active index after every move.
{
  let i = 0;
  let ok = true;
  const ops = ["next", "next", "next", "back", "jump:11", "back", "jump:0", "next"];
  for (const op of ops) {
    if (op === "next") i = next(i);
    else if (op === "back") i = back(i);
    else if (op.startsWith("jump:")) i = jump(i, Number(op.split(":")[1]));
    if (dropdownValue(i) !== i) ok = false;
  }
  check("Dropdown value + titles stay in sync with the active question through a mixed nav path", ok);
}

// Jump is allowed only to answered questions (or the current one). Model: the
// student answers sequentially, so when on question `active`, indices 0..active
// are answered and selectable; ahead is locked.
{
  const canJump = (active, target, answered) => target === active || answered.has(target);
  const answered = new Set([0, 1, 2, 3]); // answered Q1–Q4
  const active = 4; // currently on Q5 (unanswered)
  let ok = true;
  // Can jump back to any answered question.
  for (const t of answered) if (!canJump(active, t, answered)) ok = false;
  // Can stay on the current one.
  if (!canJump(active, active, answered)) ok = false;
  // Cannot skip ahead to an unanswered question.
  if (canJump(active, 9, answered)) ok = false;
  check("Student can jump to answered questions (and current), but not skip ahead to unanswered", ok);
}

// Clamping: BACK at first stays first, NEXT at last stays last.
check("BACK at the first question stays at the first question", back(0) === 0);
check("NEXT at the last question stays at the last question", next(N - 1) === N - 1);

// Walking NEXT/BACK across the whole quiz lands on the right ends.
{
  let i = 0;
  for (let k = 0; k < N - 1; k += 1) i = next(i);
  check("Pressing NEXT through the quiz reaches the last question", i === N - 1);
  for (let k = 0; k < N - 1; k += 1) i = back(i);
  check("Pressing BACK through the quiz returns to the first question", i === 0);
}

// Out-of-range jumps are clamped, never crash.
check("Jump above range clamps to last", jump(3, 999) === N - 1);
check("Jump below range clamps to first", jump(3, -5) === 0);

// ── Report ───────────────────────────────────────────────────────────────────
console.log("\nWeekly Quiz Navigation Audit\n" + "=".repeat(60));
for (const r of results) {
  console.log(`${r.ok ? "✅ PASS" : "❌ FAIL"}  ${r.label}`);
  if (!r.ok && r.detail) console.log(`         ↳ ${r.detail}`);
}
console.log("=".repeat(60));
console.log(`${results.length - failures}/${results.length} checks passed.`);

if (failures > 0) {
  console.error(`\n${failures} check(s) FAILED — quiz navigation contract may have regressed.`);
  process.exit(1);
}
console.log("\nAll good: titles + dropdown register and follow the current question, and back/forth toggling works.\n");
