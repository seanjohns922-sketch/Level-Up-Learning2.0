import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const practice = fs.readFileSync(path.join(root, "components/PracticeRunner.tsx"), "utf8");
const numberEngine = fs.readFileSync(path.join(root, "components/lesson/Year2LessonEngine.tsx"), "utf8");
const lesson = fs.readFileSync(path.join(root, "app/lesson/page.tsx"), "utf8");
const session = fs.readFileSync(path.join(root, "app/session/page.tsx"), "utf8");
const program = fs.readFileSync(path.join(root, "app/program/page.tsx"), "utf8");
const numberNexus = fs.readFileSync(path.join(root, "app/number-nexus/page.tsx"), "utf8");
const teacher = fs.readFileSync(path.join(root, "components/teacher/StrandStudentsPanel.tsx"), "utf8");
const sync = fs.readFileSync(path.join(root, "lib/student-progress-sync.ts"), "utf8");
const architecture = fs.readFileSync(path.join(root, "docs/CANONICAL_PROGRESSION_ARCHITECTURE.md"), "utf8");
const progressCache = fs.readFileSync(path.join(root, "data/progress.ts"), "utf8");
const overrideMigration = fs.readFileSync(path.join(root, "supabase/migrations/20260722113000_teacher_progress_overrides.sql"), "utf8");
const teacherDashboard = fs.readFileSync(path.join(root, "app/teacher/dashboard/page.tsx"), "utf8");
const intro = fs.readFileSync(path.join(root, "app/onboarding/intro/page.tsx"), "utf8");
const home = fs.readFileSync(path.join(root, "app/home/page.tsx"), "utf8");
const results = fs.readFileSync(path.join(root, "app/results/page.tsx"), "utf8");

const checks = [
  ["shared timed lessons are not question capped", /const finished = secondsLeft <= 0;/.test(practice)],
  ["Number Nexus timed lessons are not question capped", /const finished = secondsLeft <= 0;/.test(numberEngine)],
  ["duplicate session progress store is removed", !session.includes("session_program_progress_v1")],
  ["lesson entry restores canonical state", lesson.includes("restoreStudentStateFromServer(studentId, lessonRealmId)")],
  ["program entry restores canonical state", program.includes("restoreStudentStateFromServer(studentId, canonicalRealmId)")],
  ["Number Nexus entry restores canonical state", numberNexus.includes('restoreStudentStateFromServer(studentId, "number")')],
  ["real Number Nexus level selection cannot overwrite placement", /preview &&[\s\S]*validLevel[\s\S]*updateProgress/.test(numberNexus)],
  ["real lesson completion refreshes server cache", /previewMode[\s\S]*markLessonComplete[\s\S]*else[\s\S]*restoreStudentStateFromServer/.test(lesson)],
  ["real quiz completion refreshes server cache", /persistProgramQuizComplete\(year, Number\(week\), percent[\s\S]*else[\s\S]*restoreStudentStateFromServer/.test(session)],
  ["legacy Number cache keys are removed during hydration", sync.includes("legacyNumberKey.test(key)")],
  ["teacher completion does not come from telemetry", !teacher.includes("buildCompletedLessonIdsFromEvents")],
  ["teacher week does not come from telemetry", /function resolveDisplayedWeek\(prog\?: ProgressRow\)/.test(teacher)],
  ["architecture contract documents server authority", architecture.includes("The server is the source of truth")],
  ["architecture contract protects uncapped timed lessons", architecture.includes("A timed lesson must not end after an assumed number of questions")],
  ["real progress cache records student and realm scope", progressCache.includes("student_id: string") && progressCache.includes("realm_id: ProgressRealmScope")],
  ["legacy real-student progress cache fails closed", progressCache.includes("return isDemoPreviewMode() ? parsed : null")],
  ["teacher override has a dedicated immutable table", overrideMigration.includes("create table if not exists public.student_progress_overrides")],
  ["teacher override does not fabricate attempts or rewards", !overrideMigration.includes("insert into public.student_lesson_attempts") && !overrideMigration.includes("student_economy")],
  ["teacher override reporting is separate", teacherDashboard.includes("teacher advanced")],
  ["onboarding verifies canonical server state", intro.includes('restoreStudentStateFromServer(studentId, "number")')],
  ["onboarding completion is saved before routing", /await markStudentIntroSeen\(studentId\)[\s\S]*router\.push\("\/home"\)/.test(intro)],
  ["home routing ignores local intro markers", !home.includes("hasActiveStudentSeenIntro")],
  ["real assessment results require canonical evidence", results.includes("Canonical assessment results were not found")],
];

let failed = 0;
for (const [label, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
  if (!passed) failed += 1;
}

if (failed) {
  console.error(`\n${failed} canonical progression check(s) failed.`);
  process.exit(1);
}

console.log(`\nCanonical progression audit passed (${checks.length}/${checks.length}).`);
