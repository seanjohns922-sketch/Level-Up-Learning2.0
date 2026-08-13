import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getCurriculumPlan, getGenresForYear } from "@/data/programs/genres";
import { getRealmDefinition } from "@/lib/realms/realm-registry";
import { getRealmWeekNumbers } from "@/lib/teacher/teacher-student-snapshot";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

const liveRealms = [
  { id: "number", name: "Number Nexus", strand: "Number", weeks: 12, descriptor: /^AC9M(F|[1-6])N/ },
  { id: "measurement", name: "Measurelands", strand: "Measurement", weeks: 8, descriptor: /^AC9M(F|[1-6])M/ },
  { id: "space", name: "Starpath", strand: "Space", weeks: 8, descriptor: /^AC9M(F|[1-6])SP/ },
] as const;
const yearLabels = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"] as const;

for (const realm of liveRealms) {
  const definition = getRealmDefinition(realm.id);
  assert.equal(definition.status, "live", `${realm.name} must be live in the canonical registry.`);
  assert.equal(definition.isSelectable, true, `${realm.name} must be selectable in live teacher/student surfaces.`);
  assert.equal(definition.totalWeeks, realm.weeks, `${realm.name} must use its canonical week count.`);
  assert.deepEqual(getRealmWeekNumbers(realm.id), Array.from({ length: realm.weeks }, (_, index) => index + 1));
}

for (const yearLabel of yearLabels) {
  const genres = getGenresForYear(yearLabel);
  for (const realm of liveRealms) {
    const genre = genres.find((candidate) => candidate.id === realm.id);
    assert(genre, `${realm.name} missing from teacher genre selector for ${yearLabel}.`);
    assert.equal(genre.available, true, `${realm.name} must not render a Soon badge for ${yearLabel}.`);
    assert.equal(genre.realm, realm.name, `${realm.id} must display the live realm name.`);
    assert.equal(genre.strand, realm.strand, `${realm.name} has the wrong strand label.`);

    const plan = getCurriculumPlan(yearLabel, realm.id);
    assert.equal(plan.length, realm.weeks, `${realm.name} ${yearLabel} must expose ${realm.weeks} weeks.`);
    assert(!plan.some((week) => week.week > realm.weeks), `${realm.name} ${yearLabel} leaked extra weeks.`);
    for (const week of plan) {
      assert(week.topic && !/coming soon|placeholder|lesson details will appear/i.test(week.topic), `${realm.name} ${yearLabel} Week ${week.week} uses placeholder topic copy.`);
      assert.equal(week.lessons.length, 3, `${realm.name} ${yearLabel} Week ${week.week} must expose 3 lessons.`);
      assert(week.curriculum.length > 0, `${realm.name} ${yearLabel} Week ${week.week} is missing curriculum codes.`);
      if (realm.id === "space") {
        assert(
          week.curriculum.some((code) => realm.descriptor.test(String(code))),
          `${realm.name} ${yearLabel} Week ${week.week} is missing Space descriptor codes.`,
        );
      }
      for (const lesson of week.lessons) {
        assert(lesson.title && !/^Lesson \d+$/.test(lesson.title), `${realm.name} ${yearLabel} Week ${week.week} Lesson ${lesson.lesson} has a generic title.`);
        assert(!/coming soon|placeholder|lesson details will appear/i.test(lesson.focus), `${realm.name} ${yearLabel} Week ${week.week} Lesson ${lesson.lesson} uses placeholder focus copy.`);
        assert(lesson.curriculum.length > 0, `${realm.name} ${yearLabel} Week ${week.week} Lesson ${lesson.lesson} is missing curriculum codes.`);
        if (realm.id === "space") {
          assert(
            lesson.curriculum.some((code) => realm.descriptor.test(String(code))),
            `${realm.name} ${yearLabel} Week ${week.week} Lesson ${lesson.lesson} is missing a Space descriptor.`,
          );
        }
      }
    }
  }
}

const placementManager = read("components/teacher/PlacementManager.tsx");
assert(!/filter\(\(realm\)\s*=>\s*realm\.id\s*!==\s*["']space["']\)/.test(placementManager), "Teacher placement manager must not exclude Starpath.");

const starpathPlacementMigration = read("supabase/migrations/20260814143000_enable_starpath_teacher_placements.sql");
assert(starpathPlacementMigration.includes("p_realm_id not in ('number', 'measurement', 'space')"), "Teacher placement RPC must allow Starpath realm_id=space.");
assert(starpathPlacementMigration.includes("when p_realm_id = 'space' then 'starpath'"), "realm_program_key must map Starpath to starpath program keys.");
assert(starpathPlacementMigration.includes("placement.realm_id in ('number', 'measurement', 'space')"), "Saved Starpath placements must be materialised as canonical progress rows.");
assert(starpathPlacementMigration.includes("check (realm_id in ('number', 'measurement', 'space'))"), "Teacher progress override table must allow Starpath.");
assert(starpathPlacementMigration.includes("p_realm_id in ('measurement', 'space') then 8"), "Teacher advancement must treat Starpath as an 8-week realm.");

const realmProgressCompat = read("lib/realm-progress-compat.ts");
assert(realmProgressCompat.includes('realm_id: "number" | "measurement" | "space"'), "Teacher override rows must type Starpath as a valid realm.");
assert(realmProgressCompat.includes('realmId: "number" | "measurement" | "space"'), "Teacher week advancement client must allow Starpath.");

const dashboard = read("app/teacher/dashboard/page.tsx");
assert(dashboard.includes('Extract<CanonicalRealmId, "number" | "measurement" | "space">'), "Teacher dashboard analytics state must include Starpath.");

const strandStudents = read("components/teacher/StrandStudentsPanel.tsx");
assert(strandStudents.includes('selectedRealmId === "space"'), "Students tab must notify the dashboard when Starpath is selected.");
assert(strandStudents.includes('`${lessonIdPrefix(workingYear)}space-`'), "Students tab must count Starpath lesson IDs with a space-specific prefix.");

const curriculumExplorer = read("components/teacher/CurriculumExplorer.tsx");
assert(curriculumExplorer.includes('`${lessonIdPrefix(yearLabel)}space-`'), "Curriculum tab must count Starpath lesson IDs with a space-specific prefix.");
assert(curriculumExplorer.includes("realmId={selectedRealmId ?? undefined}"), "Curriculum preview must pass the canonical realm to the lesson drawer.");

const lessonPreview = read("components/teacher/LessonPreviewDrawer.tsx");
assert(lessonPreview.includes("teacher_preview=1"), "Lesson preview drawer must open live lessons in teacher preview mode.");
assert(lessonPreview.includes("buildLessonRoute"), "Lesson preview drawer must use canonical lesson routing.");

console.log("Teacher live realm integration audit passed: Number Nexus, Measurelands and Starpath are selectable, scoped, previewable and backed by canonical curriculum data.");
