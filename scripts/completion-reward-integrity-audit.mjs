import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const migration = fs.readFileSync(
  path.join(root, "supabase/migrations/20260720190000_prevent_completion_reward_farming.sql"),
  "utf8",
);
const syncClient = fs.readFileSync(path.join(root, "lib/student-progress-sync.ts"), "utf8");
const livePanel = fs.readFileSync(path.join(root, "components/teacher/LiveClassPanel.tsx"), "utf8");
const practiceRunner = fs.readFileSync(path.join(root, "components/PracticeRunner.tsx"), "utf8");
const lessonEngine = fs.readFileSync(path.join(root, "components/lesson/Year2LessonEngine.tsx"), "utf8");
const scoreRepair = fs.readFileSync(
  path.join(root, "supabase/migrations/20260720191000_repair_impossible_lesson_totals.sql"),
  "utf8",
);

const checks = [
  ["lesson completions are serialized", /pg_advisory_xact_lock[\s\S]*student_lesson_attempts/],
  ["lesson rewards require no prior completed attempt", /student_lesson_attempts[\s\S]*and sla\.completed[\s\S]*into reward_eligible/],
  ["quiz rewards require no prior attempt", /student_weekly_quiz_attempts[\s\S]*into reward_eligible/],
  ["retakes remain recorded", (migration.match(/perform public\.save_realm_(?:lesson_attempt|weekly_quiz_attempt)/g) ?? []).length === 2],
  ["XP is gated for lessons and quizzes", (migration.match(/if reward_eligible then/g) ?? []).length === 2],
  ["retakes record activity with zero XP", (migration.match(/perform public\.upsert_student_activity_daily/g) ?? []).length === 2],
  ["quiz reveals are gated by server eligibility", /if \(rewardEligible === true\)[\s\S]*awardAndReveal\(studentId, "quiz"/.test(syncClient)],
  ["lesson reveals are gated by server eligibility", /if \(completed === true\)[\s\S]*awardAndReveal\(studentId, "lesson"/.test(syncClient)],
  ["live table distinguishes lesson attempts", livePanel.includes(">Lesson attempt</SortHeader>")],
  ["timed lessons have a ten-question ceiling", /const questionLimit = MAX_LESSON_QUESTIONS/.test(practiceRunner)],
  ["Number Nexus lessons have a ten-question ceiling", /secondsLeft <= 0 \|\| questionsAnswered >= 10/.test(lessonEngine)],
  ["Number Nexus timer continues through feedback", !/turnState !== "answering" \? c : c - 1/.test(lessonEngine)],
  ["legacy impossible totals retain repair metadata", /original_total_questions[\s\S]*where total_questions > 10/.test(scoreRepair)],
  ["live impossible totals are normalized", /live_student_activity[\s\S]*where questions_answered > 10/.test(scoreRepair)],
];

let failed = 0;
for (const [label, assertion] of checks) {
  const passed = typeof assertion === "boolean" ? assertion : assertion.test(migration);
  console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
  if (!passed) failed += 1;
}

if (failed > 0) {
  console.error(`\n${failed} completion reward integrity check(s) failed.`);
  process.exit(1);
}

console.log(`\nCompletion reward integrity audit passed (${checks.length}/${checks.length}).`);
