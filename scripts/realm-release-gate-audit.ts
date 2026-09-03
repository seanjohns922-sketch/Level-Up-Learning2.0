import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getPosttestForYearLabel, getPretestForYearLabel } from "@/data/assessments/api";
import { getCurriculumPlan, getGenresForYear } from "@/data/programs/genres";
import {
  CANONICAL_REALM_IDS,
  getLiveRealmDefinitions,
  getRealmDefinition,
  LIVE_REALM_IDS,
  tryCanonicalRealmId,
  getRealmFirstLevel,
} from "@/lib/realms/realm-registry";
import {
  buildRealmProgramHref,
  isSharedWeeklyProgramRealm,
} from "@/lib/realms/realm-journey";
import { getPlayableWeeks, type ProgramProgressStore } from "@/lib/program-progress";

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");
const liveRealms = getLiveRealmDefinitions();

function latestMigrationContaining(marker: string) {
  const migrationDir = path.join(root, "supabase", "migrations");
  const matches = fs.readdirSync(migrationDir)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .filter((name) => fs.readFileSync(path.join(migrationDir, name), "utf8").includes(marker));
  assert(matches.length > 0, `No migration defines ${marker}.`);
  const filename = matches.at(-1)!;
  const source = fs.readFileSync(path.join(migrationDir, filename), "utf8");
  const start = source.lastIndexOf(marker);
  const end = source.indexOf("$$;", start);
  assert(end > start, `Could not isolate ${marker} in ${filename}.`);
  return { filename, body: source.slice(start, end + 3), source };
}

assert(LIVE_REALM_IDS.length > 0, "At least one live realm is required.");

const activityCodes = new Set<string>();
for (const realmId of CANONICAL_REALM_IDS) {
  const realm = getRealmDefinition(realmId);
  assert(/^[A-Z]{2,3}$/.test(realm.activityCode), `${realm.name} needs a 2–3 letter capital activity code.`);
  assert(!activityCodes.has(realm.activityCode), `${realm.activityCode} is assigned to more than one realm.`);
  activityCodes.add(realm.activityCode);
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(realm.programSuffix), `${realm.name} has an invalid program-key suffix.`);
  for (const alias of [realm.realmId, realm.portalId, realm.slug, realm.name, realm.shortName, realm.activityCode, realm.strand]) {
    assert.equal(tryCanonicalRealmId(alias), realm.realmId, `${realm.name} alias "${alias}" is not canonicalised.`);
  }
}

const firstLevelMigration = latestMigrationContaining(
  "create or replace function public.realm_first_level(",
);
for (const realm of liveRealms) {
  assert(
    firstLevelMigration.body.includes(`when '${realm.realmId}' then '${getRealmFirstLevel(realm.realmId)}'`),
    `${realm.name}'s first curriculum level must be registered in ${firstLevelMigration.filename}.`,
  );
}

for (const realm of liveRealms) {
  assert.equal(realm.status, "live", `${realm.name} release status is inconsistent.`);
  assert.equal(realm.isSelectable, true, `${realm.name} must be selectable when live.`);
  assert(realm.totalWeeks != null && realm.totalWeeks > 0, `${realm.name} needs a canonical week count.`);
  assert(realm.lessonsPerWeek != null && realm.lessonsPerWeek > 0, `${realm.name} needs a lessons-per-week contract.`);
  assert(realm.hasWeeklyQuiz, `${realm.name} must declare its weekly-quiz contract.`);
  assert(isSharedWeeklyProgramRealm(realm.realmId), `${realm.name} is not connected to the shared weekly-program journey.`);
  assert(
    buildRealmProgramHref({ realmId: realm.realmId, year: realm.levelLabels[0], week: 1 }).startsWith("/program?"),
    `${realm.name} does not build a shared weekly-program route.`,
  );
  assert(fs.existsSync(path.join(root, "app", realm.slug, "page.tsx")), `${realm.name} is live but app/${realm.slug}/page.tsx is missing.`);

  for (const yearLabel of realm.levelLabels) {
    const genre = getGenresForYear(yearLabel).find((candidate) => candidate.id === realm.realmId);
    assert(genre?.available, `${realm.name} ${yearLabel} is not available in teacher curriculum.`);

    const plan = getCurriculumPlan(yearLabel, realm.realmId);
    assert.equal(plan.length, realm.totalWeeks, `${realm.name} ${yearLabel} has the wrong week count.`);
    for (const week of plan) {
      assert.equal(week.lessons.length, realm.lessonsPerWeek, `${realm.name} ${yearLabel} Week ${week.week} has the wrong lesson count.`);
      assert(!/coming soon|placeholder|lesson details will appear/i.test(week.topic), `${realm.name} ${yearLabel} Week ${week.week} is placeholder curriculum.`);
      assert(week.curriculum.length > 0, `${realm.name} ${yearLabel} Week ${week.week} needs curriculum descriptors.`);
    }

    if (yearLabel !== "Prep") {
      const pretest = getPretestForYearLabel(yearLabel, realm.realmId);
      const posttest = getPosttestForYearLabel(yearLabel, realm.realmId);
      if (!(realm.realmId === "statistics" && yearLabel === "Year 1")) {
        assert(pretest.length > 0, `${realm.name} ${yearLabel} pre-test is missing.`);
      }
      assert((posttest?.questions.length ?? 0) > 0, `${realm.name} ${yearLabel} post-test is missing.`);
    }
  }
}

const dashboard = read("app/teacher/dashboard/page.tsx");
assert(dashboard.includes("LIVE_REALM_IDS.map"), "Teacher dashboard must discover live realms from the registry.");
assert(dashboard.includes("realmProgress.flat()"), "Teacher dashboard must merge all discovered realm progress.");

const studentsPanel = read("components/teacher/StrandStudentsPanel.tsx");
assert(studentsPanel.includes("isLiveRealmId(selectedRealmId)"), "Student rows must use the registry live-realm guard.");
assert(!studentsPanel.includes("unsupported teacher realm"), "Student detail contains a stale realm allowlist.");

const placements = read("components/teacher/PlacementManager.tsx");
assert(placements.includes("getLiveRealmDefinitions"), "Placement management must discover registry-live realms.");
assert(
  placements.includes("isRealmFirstLevel(realmId, level)") &&
    placements.includes('level === "Prep" ? "ground_week1" : "full_level"'),
  "Teacher placement must remove the pre-test option at every realm's first curriculum level.",
);

const sharedProgram = read("app/program/page.tsx");
assert(
  !sharedProgram.includes("previewMode = isStatisticsRealm"),
  "Live Statistica must never inherit teacher-preview progression bypasses.",
);
assert(
  sharedProgram.includes("previewMode = isPatternRealm || teacherPreview || demoPreviewMode"),
  "Only explicit demo/teacher preview and unreleased Pattern Peaks may bypass canonical progression.",
);
assert(
  sharedProgram.includes("preview: teacherPreview"),
  "Statistica week navigation must preserve preview only for an explicit teacher preview.",
);
assert(
  !sharedProgram.includes("hidden_teacher_mode") && !sharedProgram.includes("|| teacherMode"),
  "A browser-local hidden teacher mode must never bypass live student progression.",
);

const studentProgressSync = read("lib/student-progress-sync.ts");
assert(
  studentProgressSync.includes("isLiveRealmId(row.realm_id) ? row.realm_id : realmId"),
  "Student progress hydration must recognise every registry-live realm.",
);
assert(
  studentProgressSync.includes("getRealmDefinition(realmId).programSuffix"),
  "Student progress keys must use the canonical realm registry.",
);

const dashboardShell = read("components/realms/dashboard/RealmDashboardShell.tsx");
assert(
  dashboardShell.includes("isLiveRealmId(config.storageRealmId)"),
  "Realm dashboards must restore progress for every registry-live realm.",
);

const liveClassPanel = read("components/teacher/LiveClassPanel.tsx");
assert(
  liveClassPanel.includes("getRealmActivityCode(normalized)"),
  "Live Class activity badges must come from the realm registry.",
);

const lessonRouting = read("lib/lesson-routing.ts");
assert(
  lessonRouting.includes("type StudentRealmId = LiveRealmId") && lessonRouting.includes("assertLessonRealmHandled(normalizedRealm)"),
  "Lesson routing must remain exhaustive when a new realm becomes live.",
);

const demoMode = read("lib/demo-mode.ts");
assert(
  demoMode.includes("return !activeStudent || activeStudent === DEMO_PREVIEW_SCOPE"),
  "A teacher-preview URL must not bypass progression in a real student session.",
);

const activityGate = read("components/realms/CanonicalRealmActivityGate.tsx");
for (const requiredGuard of [
  "restoreStudentStateFromServer(studentId, realmId)",
  "isWeekPlayable(",
  "previousLessonComplete",
  "quizReady",
]) {
  assert(activityGate.includes(requiredGuard), `Canonical activity gate is missing ${requiredGuard}.`);
}

const statisticaLessonRoute = read("app/statistica/lesson/[level]/[week]/[lesson]/page.tsx");
const statisticaQuizRoute = read("app/statistica/quiz/[level]/[week]/page.tsx");
const statisticaLessonShell = read("components/statistica/StatisticaLessonShell.tsx");
const statisticaEntry = read("components/statistica/StatisticaEntry.tsx");
assert(
  statisticaLessonRoute.includes("CanonicalRealmActivityGate") && statisticaLessonRoute.includes('activity="lesson"'),
  "Statistica lesson routes must enforce canonical week and lesson order.",
);
assert(
  statisticaQuizRoute.includes("CanonicalRealmActivityGate") && statisticaQuizRoute.includes('activity="quiz"'),
  "Statistica quiz routes must require all three canonical lesson completions.",
);
assert(
  statisticaLessonShell.includes("saveRealmLessonAttempt(") && statisticaLessonShell.includes('"statistics"'),
  "Statistica lesson completion must save to canonical statistics progress.",
);
assert(
  statisticaEntry.includes('restoreStudentStateFromServer(identity.studentId, "statistics")') &&
    statisticaEntry.includes("restored.progress") &&
    statisticaEntry.includes("RealmDashboardLoading"),
  "Statistica must restore its canonical level before rendering the world.",
);
assert(
  statisticaLessonShell.includes("completionKeyRef.current") &&
    statisticaLessonShell.includes("exitRequestedRef.current"),
  "Statistica completion retries must be idempotent and wait for persistence before exit.",
);
const starpathLessonRoute = read("app/starpath/lesson/[level]/[week]/[lesson]/page.tsx");
const starpathQuizRoute = read("app/starpath/quiz/[level]/[week]/page.tsx");
assert(
  starpathLessonRoute.includes("CanonicalRealmActivityGate") && starpathLessonRoute.includes('activity="lesson"'),
  "Starpath lesson routes must enforce the same canonical sequence as the other live realms.",
);
assert(
  starpathQuizRoute.includes("CanonicalRealmActivityGate") && starpathQuizRoute.includes('activity="quiz"'),
  "Starpath quiz routes must enforce the same canonical sequence as the other live realms.",
);

const lockedStatisticaStore: ProgramProgressStore = {};
assert.deepEqual(
  getPlayableWeeks(lockedStatisticaStore, "Year 3", [], [], "statistics", [], 1),
  [1],
  "An empty Statistica pathway must fail closed to its assigned week.",
);
assert.deepEqual(
  getPlayableWeeks(lockedStatisticaStore, "Year 3", [1, 2, 3, 4, 5, 6], [], "statistics", [], 1),
  [1],
  "A full Statistica pathway must initially unlock only Week 1.",
);
assert.deepEqual(
  getPlayableWeeks(lockedStatisticaStore, "Year 3", [2, 4], [1, 3, 5, 6], "statistics", [], 2),
  [2],
  "A targeted Statistica pathway must initially unlock only its first required week.",
);
const progressedStatisticaStore: ProgramProgressStore = {
  "statistics|Year 3|2": {
    lessonsCompleted: [true, true, true],
    quizCompleted: true,
    quizBestScore: 80,
  },
};
assert.deepEqual(
  getPlayableWeeks(progressedStatisticaStore, "Year 3", [2, 4], [1, 3, 5, 6], "statistics", [], 2),
  [2, 4],
  "A targeted Statistica pathway may reveal only the next required week after a pass.",
);
assert.deepEqual(
  getPlayableWeeks(lockedStatisticaStore, "Year 3", [], [1, 2, 3, 4, 5, 6], "statistics", [], 1),
  [1, 2, 3, 4, 5, 6],
  "All Statistica weeks may open only when the server explicitly assigns an open-practice plan.",
);

const carousel = read("components/realms/RealmCarousel.tsx");
for (const realm of liveRealms) {
  assert(carousel.includes(`id: "${realm.portalId}"`), `${realm.name} is missing from the realm carousel.`);
}
assert(carousel.includes("isLiveRealmId(focusedRealmId)"), "Realm carousel progress scope must come from the registry.");

const parentPortal = read("components/parent/ParentPortal.tsx");
for (const realm of liveRealms) {
  assert(parentPortal.includes(realm.realmId), `${realm.name} is missing from Home parent setup/reporting.`);
}

const databaseFunctions = [
  "create or replace function public.realm_week_is_playable(",
  "create or replace function public.complete_realm_lesson(",
  "create or replace function public.complete_realm_quiz(",
  "create or replace function public.complete_realm_assessment(",
  "create or replace function public.teacher_change_starting_level(",
  "create or replace function public.teacher_change_starting_levels(",
  "create or replace function public.teacher_advance_student_week(",
];

for (const marker of databaseFunctions) {
  const migration = latestMigrationContaining(marker);
  for (const realm of liveRealms) {
    assert(
      migration.body.includes(`'${realm.realmId}'`),
      `${realm.name} is missing from ${marker} in ${migration.filename}. Add the database migration before release.`,
    );
  }
}

const bulkPlacement = latestMigrationContaining(
  "create or replace function public.teacher_change_starting_levels(",
);
assert(
  bulkPlacement.body.includes("public.teacher_change_starting_level("),
  `Bulk teacher placement in ${bulkPlacement.filename} must use the guarded single-student placement path.`,
);

const assessmentCompletion = latestMigrationContaining(
  "create or replace function public.complete_realm_assessment(",
);

const activitySequence = latestMigrationContaining(
  "create or replace function public.realm_week_is_playable(",
);
for (const requiredDatabaseGuard of [
  "trg_enforce_realm_lesson_sequence",
  "trg_enforce_realm_quiz_sequence",
  "The previous lesson must be completed first",
  "All three lessons must be completed before the quiz",
]) {
  assert(
    activitySequence.source.includes(requiredDatabaseGuard),
    `Canonical activity sequence migration ${activitySequence.filename} is missing ${requiredDatabaseGuard}.`,
  );
}
assert(
  assessmentCompletion.body.includes("when p_realm_id = 'statistics' then '[1,2,3,4,5,6]'::jsonb"),
  `Statistica full pre-test pathways in ${assessmentCompletion.filename} must contain exactly six weeks.`,
);
assert(
  assessmentCompletion.body.includes("public.realm_program_key(effective_progress->>'next_working_level', p_realm_id)"),
  `Assessment advancement in ${assessmentCompletion.filename} must preserve the realm-specific program key.`,
);

console.log(`Realm release gate passed for: ${liveRealms.map((realm) => realm.name).join(", ")}.`);
console.log("World routes, curriculum, assessments, teacher views, placements, parent coverage and database RPCs are present.");
