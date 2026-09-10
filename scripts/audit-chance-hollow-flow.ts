import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getPosttestForYearLabel, getPretestForYearLabel } from "@/data/assessments/api";
import { getChanceHollowProgramForYearLabel } from "@/data/programs/chanceHollow";
import { REALM_REGISTRY, isFirstLevelPretestEnabled } from "@/lib/realms/realm-registry";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

const migration = read("supabase/migrations/20260909150000_prepare_chance_hollow_reporting.sql");
const studentSync = read("lib/student-progress-sync.ts");
const progress = read("data/progress.ts");
const lessonShell = read("components/chance-hollow/ChanceHollowLessonShell.tsx");
const pretest = read("app/pretest/page.tsx");
const posttest = read("app/posttest/page.tsx");
const teacherDashboard = read("app/teacher/dashboard/page.tsx");
const teacherReplay = read("components/teacher/AssessmentReplay.tsx");
const teacherSnapshot = read("lib/teacher/teacher-student-snapshot.ts");
const realmCompat = read("lib/realm-progress-compat.ts");

assert.equal(REALM_REGISTRY.chance.status, "live");
assert.equal(REALM_REGISTRY.chance.isSelectable, true);
assert.equal(REALM_REGISTRY.chance.totalWeeks, 6);
assert.equal(REALM_REGISTRY.chance.lessonsPerWeek, 3);
assert.equal(isFirstLevelPretestEnabled("chance", "Year 3"), true);

for (const year of ["Year 3", "Year 4", "Year 5", "Year 6"]) {
  const program = getChanceHollowProgramForYearLabel(year);
  assert.equal(program?.length, 6, `${year} must contain six Chance Hollow weeks.`);
  assert(program?.every((week) => week.lessons.length === 3));
  assert.equal(getPretestForYearLabel(year, "chance").length, 20);
  assert.equal(getPosttestForYearLabel(year, "chance")?.questions.length, 20);
}

assert(studentSync.includes('if (isDemoPreviewMode()) return;'), "Demo Mode must not write canonical student records.");
assert(studentSync.includes('saveRealmLessonAttempt(studentId') || lessonShell.includes('saveRealmLessonAttempt(studentId'));
assert(lessonShell.includes('}, completionKey, "chance")'));
assert(lessonShell.includes('restoreStudentStateFromServer(studentId, "chance")'));
assert(lessonShell.includes('liveContext={{ level, strand: "Probability"'));
assert(progress.includes('pathname.startsWith("/chance-hollow")'));
assert(studentSync.includes('isProgressRealmScope(row.realm_id)'));

for (const source of [pretest, posttest]) {
  assert(source.includes("question_results: questionResults"));
  assert(source.includes("placement_result:"));
  assert(source.includes("completed_at: completedAt"));
  assert(source.includes("duration_seconds: durationSeconds"));
}

for (const functionName of [
  "realm_program_key",
  "get_student_realm_progress_compat_secure",
  "save_student_realm_progress_secure",
  "complete_realm_lesson",
  "complete_realm_quiz",
  "complete_realm_assessment",
  "teacher_change_starting_level",
  "teacher_change_starting_levels",
  "teacher_advance_student_week",
]) {
  assert(migration.includes(`function public.${functionName}(`), `Chance Hollow migration is missing ${functionName}.`);
}
assert(migration.includes("when p_realm_id = 'chance' then 'chance-hollow'"));
assert(migration.includes("when p_realm_id = 'chance' then '[1,2,3,4,5,6]'::jsonb"));
assert(migration.includes("when p_realm_id in ('statistics', 'chance') then 6"));
assert(migration.includes("p_realm_id = 'chance' and p_level = 'Year 3'"));
assert(migration.includes("student_completion_receipts_realm_id_check"));
assert(migration.includes("student_progress_overrides_realm_id_check"));
assert(migration.includes("perform public.assert_student_access(p_student_id)"));
assert(migration.includes("perform public.assert_student_read(p_student_id)"));
assert(migration.includes("public.can_manage_student_progress(p_student_id)"));

assert(teacherDashboard.includes("LIVE_REALM_IDS.map"), "Teacher reporting must remain registry-driven at launch.");
assert(teacherSnapshot.includes("assessment_attempts"));
assert(realmCompat.includes('.from("student_realm_assessments")'));
assert(realmCompat.includes("question_results"));
assert(teacherReplay.includes("getRealmDefinition(realmId).name"));
assert(read("components/parent/ParentPortal.tsx").includes('chance: "Chance Hollow"'));
assert(read("components/parent/ParentPortal.tsx").includes('? "probability"'));
assert(read("components/school/SchoolAnalyticsDashboard.tsx").includes('chance: "Chance Hollow"'));
assert(read("app/api/school/[schoolId]/analytics/export/route.ts").includes('["chance", "Probability"]'));

const entry = read("components/chance-hollow/ChanceHollowEntry.tsx");
assert(entry.includes('restoreStudentStateFromServer(identity.studentId, "chance")'));
assert(entry.includes('realmId: "chance"'));
assert(entry.includes("RealmDashboardLoading"));
const lessonRoute = read("app/chance-hollow/lesson/[level]/[week]/[lesson]/page.tsx");
const quizRoute = read("app/chance-hollow/quiz/[level]/[week]/page.tsx");
assert(lessonRoute.includes("CanonicalRealmActivityGate") && lessonRoute.includes('activity="lesson"'));
assert(quizRoute.includes("CanonicalRealmActivityGate") && quizRoute.includes('activity="quiz"'));
assert(!read("components/world/ChanceHollowMap.tsx").includes("only: true"));

const latestReleaseMigration = read("supabase/migrations/20260910170000_release_chance_hollow_live_realm.sql");
assert(latestReleaseMigration.includes("when 'chance' then 'Year 3'"));
assert(latestReleaseMigration.includes("p_realm_id = 'chance' and p_level = 'Year 3'"));
assert(latestReleaseMigration.includes("when v_strand = 'probability' then 'chance'"));
assert(latestReleaseMigration.includes("when p_realm_id = 'chance' then 'probability'"));
assert(latestReleaseMigration.includes("when p_realm_id in ('statistics', 'chance') then 6"));

console.log("Chance Hollow live-flow audit passed: canonical entry, guarded progression, assessments, Probability diagnostics, teacher replay, parent reporting and school exports are connected.");
