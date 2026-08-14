import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getPosttestForYearLabel, getPretestForYearLabel } from "@/data/assessments/api";
import { getCurriculumPlan, getGenresForYear } from "@/data/programs/genres";
import { getLiveRealmDefinitions, LIVE_REALM_IDS } from "@/lib/realms/realm-registry";
import {
  buildRealmProgramHref,
  isSharedWeeklyProgramRealm,
} from "@/lib/realms/realm-journey";

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
  return { filename, body: source.slice(start, end + 3) };
}

assert(LIVE_REALM_IDS.length > 0, "At least one live realm is required.");

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
      assert(pretest.length > 0, `${realm.name} ${yearLabel} pre-test is missing.`);
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
  "create or replace function public.complete_realm_lesson",
  "create or replace function public.complete_realm_quiz",
  "create or replace function public.complete_realm_assessment",
  "create or replace function public.teacher_change_starting_level",
  "create or replace function public.teacher_advance_student_week",
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

console.log(`Realm release gate passed for: ${liveRealms.map((realm) => realm.name).join(", ")}.`);
console.log("World routes, curriculum, assessments, teacher views, placements, parent coverage and database RPCs are present.");
