import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getPosttestForYearLabel, getPretestForYearLabel } from "@/data/assessments/api";
import { getCurriculumPlan, getGenresForYear } from "@/data/programs/genres";
import { DIAGNOSTIC_STRANDS, diagnosticAvailableWeight } from "@/lib/whole-maths-diagnostic";
import { REALM_REGISTRY, getRealmFirstLevel } from "@/lib/realms/realm-registry";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const migration = read("supabase/migrations/20260906120000_prepare_pattern_peaks_live_realm.sql");

assert.equal(REALM_REGISTRY.pattern.status, "live");
assert.equal(REALM_REGISTRY.pattern.isSelectable, true);
assert.equal(REALM_REGISTRY.pattern.totalWeeks, 8);
assert.equal(REALM_REGISTRY.pattern.lessonsPerWeek, 3);
assert.equal(getRealmFirstLevel("pattern"), "Year 3");
assert.deepEqual(REALM_REGISTRY.pattern.levelLabels, ["Year 3", "Year 4", "Year 5", "Year 6"]);

for (const year of ["Prep", "Year 1", "Year 2"]) {
  assert(!getGenresForYear(year).some((genre) => genre.id === "algebra"), `${year} must not expose Pattern Peaks.`);
}
for (const year of ["Year 3", "Year 4", "Year 5", "Year 6"]) {
  const algebra = getGenresForYear(year).find((genre) => genre.id === "algebra");
  assert.equal(algebra?.available, true, `${year} Algebra must be live.`);
  const plan = getCurriculumPlan(year, "algebra");
  assert.equal(plan.length, 8, `${year} must have eight Pattern Peaks weeks.`);
  assert(plan.every((week) => week.lessons.length === 3), `${year} must have three lessons per week.`);
  const posttest = getPosttestForYearLabel(year, "pattern");
  assert(posttest, `${year} must have a Pattern Peaks post-test.`);
  assert.equal(posttest.questions.length, 20, `${year} post-test must have 20 questions.`);
}
assert.equal(getPretestForYearLabel("Year 3", "pattern").length, 0, "Year 3 is the first Pattern Peaks level and must not have a pre-test.");
for (const year of ["Year 4", "Year 5", "Year 6"]) {
  assert.equal(getPretestForYearLabel(year, "pattern").length, 20, `${year} pre-test must have 20 questions.`);
}

const sharedProgram = read("app/program/page.tsx");
assert(sharedProgram.includes("previewMode = teacherPreview || demoPreviewMode"));
assert(!sharedProgram.includes("previewMode = isPatternRealm ||"));
const entry = read("components/pattern-peaks/PatternPeaksEntry.tsx");
assert(entry.includes('restoreStudentStateFromServer(identity.studentId, "pattern")'));
assert(entry.includes('realmId: "pattern"'));
assert(!read("components/world/PatternPeaksMap.tsx").includes("only: true"));
const resultsPage = read("app/results/page.tsx");
assert(resultsPage.includes('realmId === "pattern" ? "pattern"'), "Assessment results must retain Pattern Peaks as the canonical realm.");
assert(resultsPage.includes('if (realmId === "pattern") return "/pattern-peaks"'), "Assessment results must return students to Pattern Peaks.");
const parentPortal = read("components/parent/ParentPortal.tsx");
assert(parentPortal.includes('pattern: "Pattern Peaks"'), "The parent portal must label canonical Pattern Peaks progress.");
assert(parentPortal.includes('realmId === "pattern" ? "algebra" : realmId'), "The parent portal must resolve Pattern Peaks curriculum through Algebra.");
const schoolAnalytics = read("components/school/SchoolAnalyticsDashboard.tsx");
assert(schoolAnalytics.includes('pattern: "Pattern Peaks"'), "School analytics must label Pattern Peaks results.");
assert(read("app/api/school/[schoolId]/analytics/export/route.ts").includes('["pattern", "Algebra"]'), "School exports must include Algebra results.");
const towerChamber = read("components/world3d/TowerRealmChamber.tsx");
assert(!towerChamber.includes('activePortal?.realmId === "pattern" && preview ? "PREVIEW REALM"'), "The live Pattern Peaks portal must never retain its old preview label.");
const liveProgressionClient = read("lib/whole-maths-diagnostic-client.ts");
assert(liveProgressionClient.includes('| "pattern";') && liveProgressionClient.includes('| "algebra";'), "Teacher live progression types must accept Pattern Peaks Algebra rows.");
for (const route of [
  "app/pattern-peaks/lesson/[level]/[week]/[lesson]/page.tsx",
  "app/pattern-peaks/quiz/[level]/[week]/page.tsx",
]) {
  const source = read(route);
  assert(source.includes("CanonicalRealmActivityGate"), `${route} must use the canonical activity gate.`);
  assert(!source.includes("as LiveRealmId"), `${route} must not cast an unreleased realm into the live type.`);
  assert(!source.includes("getServerStarpathAccess"), `${route} must not be Demo-only.`);
}

for (const functionName of [
  "complete_realm_lesson",
  "complete_realm_quiz",
  "complete_realm_assessment",
  "teacher_change_starting_level",
  "teacher_change_starting_levels",
  "teacher_advance_student_week",
  "realm_week_is_playable",
]) {
  assert(migration.includes(`create or replace function public.${functionName}(`), `Release migration is missing ${functionName}.`);
}
assert(migration.includes("perform public.assert_student_access(p_student_id)"), "Student writes must enforce student access.");
assert(migration.includes("when p_realm_id = 'pattern' then 'pattern-peaks'"), "Pattern Peaks needs an isolated program key.");
assert(migration.includes("when p_realm_id = 'pattern' then '[1,2,3,4,5,6,7,8]'::jsonb"), "Pattern Peaks needs an explicit eight-week full pathway.");
assert(migration.includes("Pattern Peaks supports Year 3 to Year 6"), "Teacher placement must reject levels outside Years 3-6.");
assert(migration.includes("Pattern Peaks Year 3 starts directly without a pre-test"), "Year 3 placement must reject pre-test mode.");
assert(migration.includes("Pattern Peaks Year 3 does not use a pre-test"), "The assessment RPC must reject a Year 3 pre-test.");
assert(migration.includes("when p_realm_id in ('measurement', 'space', 'pattern') then 8"), "Canonical sequencing must recognise all eight Pattern Peaks weeks.");

const algebraDiagnostic = DIAGNOSTIC_STRANDS.find((strand) => strand.strand === "algebra");
const probabilityDiagnostic = DIAGNOSTIC_STRANDS.find((strand) => strand.strand === "probability");
assert.equal(algebraDiagnostic?.realmId, "pattern");
assert.equal(algebraDiagnostic?.available, true);
assert.equal(probabilityDiagnostic?.available, false);
assert.equal(diagnosticAvailableWeight(), 131);
assert(migration.includes("when v_strand = 'algebra' then 'pattern'"));
assert(migration.includes("where requested.strand = 'probability'"));

const collection = read("app/legends/pattern-peaks/page.tsx");
assert(collection.includes('readProgress("pattern")'));
assert(collection.includes("isUnlocked={visibleUnlockedIds.includes(legend.id)}"));
assert(!collection.includes("demoResolved && !demoPreview"), "Live students must be able to open their Patternox collection.");

console.log("Pattern Peaks release audit passed: Years 3-6 only, canonical progression, secure persistence, diagnostics, reporting and rewards are release-wired.");
