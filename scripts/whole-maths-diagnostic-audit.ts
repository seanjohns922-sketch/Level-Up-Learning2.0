import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  AC_DESCRIPTOR_COUNTS_BY_LEVEL,
  AC_PRIMARY_LEVELS,
  AC_STRANDS,
  type AcStrand,
} from "@/lib/curriculum/ac-standards";
import {
  AVAILABLE_DIAGNOSTIC_STRANDS,
  DIAGNOSTIC_FLOOR,
  DIAGNOSTIC_MASTERY,
  WHOLE_MATHS_WEIGHT_TOTAL,
  computeReachedCurriculumPoints,
  computeWholeMathsLevel,
  curriculumPointsReached,
  decideDiagnosticPlacement,
  diagnosticAvailableWeight,
} from "@/lib/whole-maths-diagnostic";
import { getDiagnosticQuestions } from "@/lib/whole-maths-diagnostic-questions";

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

assert.equal(DIAGNOSTIC_MASTERY, 85, "Diagnostic mastery must remain a named 85% threshold.");
assert.equal(DIAGNOSTIC_FLOOR, 40, "Diagnostic floor must remain a named 40% threshold.");
assert.equal(
  Object.values(AC_STRANDS).reduce((sum, strand) => sum + strand.weight, 0),
  WHOLE_MATHS_WEIGHT_TOTAL,
  "Whole-maths weights must come from AC_STRANDS and total 139.",
);
for (const strand of Object.keys(AC_STRANDS) as AcStrand[]) {
  assert.equal(
    AC_PRIMARY_LEVELS.reduce<number>(
      (sum, level) => sum + AC_DESCRIPTOR_COUNTS_BY_LEVEL[level][strand],
      0,
    ),
    AC_STRANDS[strand].weight,
    `${strand} level counts must reconcile to its F-6 total.`,
  );
}
assert.equal(
  AC_PRIMARY_LEVELS.reduce<number>(
    (total, level) => total + Object.values(AC_DESCRIPTOR_COUNTS_BY_LEVEL[level]).reduce(
      (sum, count) => sum + count,
      0,
    ),
    0,
  ),
  WHOLE_MATHS_WEIGHT_TOTAL,
  "The exact AC9 level-by-level matrix must total 139.",
);
assert.equal(AC_DESCRIPTOR_COUNTS_BY_LEVEL[4].space, 3, "AC9 Year 4 Space must carry 3 descriptors.");
assert.equal(AC_DESCRIPTOR_COUNTS_BY_LEVEL[6].algebra, 3, "AC9 Year 6 Algebra must carry 3 descriptors.");
assert.deepEqual(
  AVAILABLE_DIAGNOSTIC_STRANDS.map((strand) => strand.strand),
  ["number", "measurement", "space", "statistics", "algebra", "probability"],
  "All six built maths strands must be active in the diagnostic.",
);
assert.equal(diagnosticAvailableWeight(), 139, "The six live strands must cover all 139 curriculum points.");

assert.equal(
  computeWholeMathsLevel({ number: 4, measurement: 4.5, space: 4, statistics: 4.5, algebra: 3.5, probability: 4 }),
  4.09,
  "The worked example must use the level-aware AC9 descriptor distribution.",
);
assert.equal(
  computeWholeMathsLevel({ number: 4, measurement: 4.5, space: 4, statistics: 4.5 }),
  null,
  "A four-strand result must never masquerade as the official whole-maths level.",
);
for (const level of [0, 0.5, 1, 2.25, 3, 4.5, 5.75, 6]) {
  assert.equal(
    computeWholeMathsLevel({
      number: level,
      measurement: level,
      space: level,
      statistics: level,
      algebra: level,
      probability: level,
    }),
    level,
    `Equal strand levels must reproduce the same whole-maths level at ${level}.`,
  );
}
const mixedBefore = { number: 3, measurement: 2, space: 4, statistics: 3, algebra: 3, probability: 3 };
const mixedAfter = { ...mixedBefore, number: 3.25 };
assert(
  computeWholeMathsLevel(mixedAfter)! > computeWholeMathsLevel(mixedBefore)!,
  "Improving one strand in a mixed profile must never lower the whole-maths level.",
);
assert.equal(curriculumPointsReached("probability", 3), 0, "Probability must contribute no points below Level 3.");
assert.equal(curriculumPointsReached("probability", 3.5), 1, "A mid-Level 3 probability result must reach one of its two descriptors.");
assert.equal(
  computeWholeMathsLevel({ number: 2, measurement: 2, space: 2, statistics: 2, algebra: 2 }),
  null,
  "An official result must remain withheld until all six formal strand outcomes exist.",
);
assert.equal(
  computeWholeMathsLevel({ number: 3, measurement: 2, space: 2, statistics: 2, algebra: 2 }),
  null,
  "A missing strand must never be imputed in a mixed profile.",
);
const johnnyLiveProfile = {
  number: 3,
  algebra: 3,
  statistics: 3,
  space: 3,
  probability: 4,
  measurement: 2,
};
assert.equal(computeReachedCurriculumPoints(johnnyLiveProfile), 42);
assert.equal(
  computeWholeMathsLevel(johnnyLiveProfile),
  2.83,
  "Johnny's complete six-realm live profile must calculate to 2.83 without becoming an official result.",
);

const canonicalPromotion = decideDiagnosticPlacement("Year 3", [
  { level: "Year 3", score: 17, total: 20, percent: 85 },
  { level: "Year 4", score: 12, total: 20, percent: 60 },
]);
assert.equal(canonicalPromotion.recommendedLevel, "Year 4");
assert.equal(canonicalPromotion.placementChanged, true);
assert.equal(canonicalPromotion.measuredLevel, 3.44);

const currentLevelNotMastered = decideDiagnosticPlacement("Year 3", [
  { level: "Year 3", score: 16, total: 20, percent: 80 },
]);
assert.equal(currentLevelNotMastered.recommendedLevel, "Year 3");
assert.equal(currentLevelNotMastered.placementChanged, false);
assert.equal(currentLevelNotMastered.measuredLevel, 2.89);

const leapfrog = decideDiagnosticPlacement("Year 4", [
  { level: "Year 4", score: 18, total: 20, percent: 90 },
]);
assert.equal(leapfrog.shouldProbeNext, true, "A mastered level must probe upward.");

const cliff = decideDiagnosticPlacement("Year 4", [
  { level: "Year 4", score: 18, total: 20, percent: 90 },
  { level: "Year 5", score: 7, total: 20, percent: 35 },
]);
assert.equal(cliff.recommendedLevel, "Year 4");
assert.equal(cliff.flag, "extension_ready_to_bridge");

const noDemotion = decideDiagnosticPlacement("Year 4", [
  { level: "Year 4", score: 6, total: 20, percent: 30 },
]);
assert.equal(noDemotion.recommendedLevel, "Year 4");
assert.equal(noDemotion.placementChanged, false);
assert.equal(noDemotion.flag, "review_support");

for (const strand of AVAILABLE_DIAGNOSTIC_STRANDS) {
  const firstLevel = strand.strand === "algebra" || strand.strand === "probability" ? 3 : 1;
  for (let level = firstLevel; level <= 6; level += 1) {
    const questions = getDiagnosticQuestions(strand.strand, `Year ${level}`, "audit-sitting");
    assert.equal(questions.length, 10, `${strand.strand} Year ${level} must draw 10 questions from its existing level test.`);
    assert(questions.every(({ question }) => question.id), `${strand.strand} Year ${level} diagnostic questions need stable IDs.`);
    assert(
      questions.some(({ curriculumCodes }) => curriculumCodes.length > 0),
      `${strand.strand} Year ${level} diagnostic questions are not linked to curriculum codes.`,
    );
  }
}

const dashboard = read("app/teacher/dashboard/page.tsx");
assert(dashboard.includes('{ id: "diagnostic", label: "Diagnostic" }'), "Teacher dashboard is missing the Diagnostic tab.");
const vision = read("docs/diagnostic-vision.md");
assert(
  vision.includes("Release order is therefore fixed:") &&
    vision.includes("Release the six-strand AC9 Whole-Maths Diagnostic") &&
    vision.includes("Build and validate the jurisdiction crosswalks"),
  "The state-curriculum work must remain sequenced after the complete AC9 diagnostic.",
);
const panel = read("components/teacher/WholeMathsDiagnosticPanel.tsx");
assert(panel.includes("All six maths strand engines are connected"), "The teacher UI must show that Probability is connected.");
assert(panel.includes("Assign Start / Mid / End"), "Teachers must be able to assign the formal diagnostic from its dashboard tab.");
assert(panel.includes("assignWholeMathsDiagnostic"), "The diagnostic assignment control must call the secure assignment RPC.");
const studentInstrument = read("app/diagnostic/page.tsx");
assert(!studentInstrument.includes("isDemoPreviewMode"), "The diagnostic must not have a demo-only persistence shortcut.");
assert(studentInstrument.includes("saveDiagnosticProgress"), "Student answers and position must persist during a sitting.");
const migration = read("supabase/migrations/20260910170000_release_chance_hollow_live_realm.sql");
const completionMigration = read("supabase/migrations/20260911120000_complete_six_strand_whole_maths_diagnostic.sql");
const diagnosticFoundation = read("supabase/migrations/20260903170000_whole_maths_diagnostic_foundation.sql");
assert(!migration.includes("available_weight"), "Curriculum weights must not be duplicated in the database migration.");
for (const required of [
  "security definer",
  "perform public.assert_student_access(p_student_id)",
  "v_mastery constant integer := 85",
  "v_floor constant integer := 40",
  "when v_strand = 'probability' then 'chance'",
]) {
  assert(migration.toLowerCase().includes(required.toLowerCase()), `Diagnostic migration is missing: ${required}`);
}
assert(diagnosticFoundation.toLowerCase().includes("if v_placement then"), "Secure diagnostic completion must retain guarded placement application.");
for (const required of [
  "save_whole_math_diagnostic_progress",
  "perform public.assert_student_access(p_student_id)",
  "whole_math_level_for_sitting",
  "v_sitting.checkpoint in ('start','mid','end')",
  "official diagnostic requires all six completed strands",
]) {
  assert(completionMigration.toLowerCase().includes(required.toLowerCase()), `Completed diagnostic workflow is missing: ${required}`);
}
const centralWorldEntry = read("components/world3d/CentralWorld3DEntry.tsx");
assert(
  centralWorldEntry.includes("fetchPendingStudentDiagnostic") && centralWorldEntry.includes('router.replace("/diagnostic")'),
  "An assigned diagnostic must take priority when a student enters the world.",
);

console.log("Whole-Maths Diagnostic audit passed: assignment, six-strand scoring, resumability, student handoff and guarded placement are connected.");
