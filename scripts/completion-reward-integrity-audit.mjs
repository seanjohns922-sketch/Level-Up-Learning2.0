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
const scoreRestoration = fs.readFileSync(
  path.join(root, "supabase/migrations/20260722110000_restore_unbounded_timed_lesson_totals.sql"),
  "utf8",
);
const resumeState = fs.readFileSync(path.join(root, "lib/resume-state.ts"), "utf8");
const lessonPage = fs.readFileSync(path.join(root, "app/lesson/page.tsx"), "utf8");
const sessionPage = fs.readFileSync(path.join(root, "app/session/page.tsx"), "utf8");

const checks = [
  ["lesson completions are serialized", /pg_advisory_xact_lock[\s\S]*student_lesson_attempts/],
  ["lesson rewards require no prior completed attempt", /student_lesson_attempts[\s\S]*and sla\.completed[\s\S]*into reward_eligible/],
  ["quiz rewards require no prior attempt", /student_weekly_quiz_attempts[\s\S]*into reward_eligible/],
  ["lesson reward identity includes realm, level, week and lesson", /sla\.realm_id = p_realm_id[\s\S]*sla\.working_level = p_working_level[\s\S]*sla\.week = p_week[\s\S]*sla\.lesson = p_lesson/.test(migration)],
  ["quiz reward identity includes realm, level, week and quiz", /swqa\.realm_id = p_realm_id[\s\S]*swqa\.working_level = p_working_level[\s\S]*swqa\.week = p_week[\s\S]*swqa\.quiz_id = p_quiz_id/.test(migration)],
  ["lesson browser request identity uses the full activity scope", /lesson:\$\{realmId\}:\$\{workingLevel\}:\$\{week\}:\$\{lessonNumber\}:\$\{lessonId\}/.test(resumeState)],
  ["shared lesson reviews receive a new request identity", /clearLessonSession\(lessonCompletionActivityKey\)/.test(lessonPage)],
  ["legacy lesson reviews receive a new request identity", /clearLessonSession\(lessonCompletionActivityKey\)/.test(sessionPage)],
  ["retakes remain recorded", (migration.match(/perform public\.save_realm_(?:lesson_attempt|weekly_quiz_attempt)/g) ?? []).length === 2],
  ["XP is gated for lessons and quizzes", (migration.match(/if reward_eligible then/g) ?? []).length === 2],
  ["retakes record activity with zero XP", (migration.match(/perform public\.upsert_student_activity_daily/g) ?? []).length === 2],
  ["quiz reveals are gated by server eligibility", /if \(rewardEligible === true\)[\s\S]*awardAndReveal\(studentId, "quiz"/.test(syncClient)],
  ["lesson reveals are gated by server eligibility", /if \(completed === true\)[\s\S]*awardAndReveal\(studentId, "lesson"/.test(syncClient)],
  ["live table distinguishes lesson attempts", livePanel.includes(">Lesson attempt</SortHeader>")],
  ["timed lessons finish on time, not question count", /const finished = secondsLeft <= 0;/.test(practiceRunner)],
  ["Number Nexus lessons finish on time, not question count", /const finished = secondsLeft <= 0;/.test(lessonEngine)],
  ["Number Nexus timer continues through feedback", !/turnState !== "answering" \? c : c - 1/.test(lessonEngine)],
  ["legacy impossible totals retain repair metadata", /original_total_questions[\s\S]*where total_questions > 10/.test(scoreRepair)],
  ["preserved timed lesson totals are restored", /original_total_questions[\s\S]*timed_lessons_are_unbounded/.test(scoreRestoration)],
  ["live snapshots are repaired from canonical attempts", /latest_restored_attempt[\s\S]*update public\.live_student_activity/.test(scoreRestoration)],
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
