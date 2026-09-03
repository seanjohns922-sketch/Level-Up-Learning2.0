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
  ["number", "measurement", "space", "statistics"],
  "Only the four built maths strands may be active in the staged diagnostic.",
);
assert.equal(diagnosticAvailableWeight(), 115, "The staged four strands must cover 115 of 139 curriculum points.");

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
  { level: "Year 3", score: 9, total: 10, percent: 90 },
  { level: "Year 4", score: 11, total: 20, percent: 55 },
]);
assert.equal(canonicalPromotion.recommendedLevel, "Year 4");
assert.equal(canonicalPromotion.placementChanged, true);

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
  for (let level = 1; level <= 6; level += 1) {
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
assert(panel.includes("Full diagnostic launch and the official Whole-Maths overall remain locked"), "The staged UI must not imply a complete six-strand release.");
const studentInstrument = read("app/diagnostic/page.tsx");
assert(!studentInstrument.includes("isDemoPreviewMode"), "The diagnostic must not have a demo-only persistence shortcut.");
const migration = read("supabase/migrations/20260903170000_whole_maths_diagnostic_foundation.sql");
assert(!migration.includes("available_weight"), "Curriculum weights must not be duplicated in the database migration.");
for (const required of [
  "security definer",
  "perform public.assert_student_access(p_student_id)",
  "v_mastery constant integer := 85",
  "v_floor constant integer := 40",
  "Whole-Maths Diagnostic is staged until all six strand tests are available",
  "if v_placement then",
]) {
  assert(migration.toLowerCase().includes(required.toLowerCase()), `Diagnostic migration is missing: ${required}`);
}

console.log("Whole-Maths Diagnostic audit passed: four strands staged, six-strand overall locked, and server placement guarded.");
