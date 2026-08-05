import fs from "node:fs";
import path from "node:path";
import {
  MEASURELANDS_POSTTESTS_BY_YEAR,
  MEASURELANDS_PRETESTS_BY_YEAR,
} from "../data/assessments/measurelands";
import {
  MEASURELANDS_ASSESSMENT_BLUEPRINTS,
  validateMeasurelandsAssessmentBlueprints,
  type MeasurelandsLevel,
} from "../data/assessments/measurelandsAssessmentBlueprint";
import {
  MEASURELANDS_FORM_MIGRATIONS,
  MEASURELANDS_INDEPENDENT_FORM_STANDARDS,
  MEASURELANDS_INDEPENDENT_ITEM_BANKS,
  legacyMeasurelandsFormIssues,
  validateIndependentMeasurelandsForm,
  validateParallelMeasurelandsForms,
  type MeasurelandsIndependentFormStandard,
} from "../data/assessments/measurelandsAssessmentArchitecture";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentItemDifficulty,
  type AssessmentResponseEvidence,
  type IndependentAssessmentItem,
} from "../data/assessments/assessmentItemStandard";
import { buildAssessmentTeacherReport } from "../data/assessments/assessmentReporting";
import { MEASURELANDS_MISCONCEPTION_LIBRARY } from "../data/assessments/measurelandsMisconceptions";

type LegacyQuestion = { type?: string; practiceTask?: unknown };

const LEVEL_TO_YEAR: Record<MeasurelandsLevel, "Prep" | `Year ${1 | 2 | 3 | 4 | 5 | 6}`> = {
  0: "Prep",
  1: "Year 1",
  2: "Year 2",
  3: "Year 3",
  4: "Year 4",
  5: "Year 5",
  6: "Year 6",
};

let checksPassed = 0;
const failures: string[] = [];

function check(condition: boolean, message: string): void {
  if (condition) checksPassed += 1;
  else failures.push(message);
}

function expandMix<T extends string>(mix: Readonly<Record<T, number>>, order: readonly T[]): T[] {
  return order.flatMap((key) => Array.from({ length: mix[key] }, () => key));
}

function descriptorSequence(standard: MeasurelandsIndependentFormStandard): string[] {
  const remaining = new Map(Object.entries(standard.descriptorAllocation));
  const result: string[] = [];
  while (result.length < standard.questionCount) {
    const candidates = [...remaining.entries()]
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const candidate = candidates.find(([code]) =>
      result.length < 2 || code !== result.at(-1) || code !== result.at(-2),
    );
    if (!candidate) throw new Error(`Could not construct descriptor sequence for ${standard.key}.`);
    result.push(candidate[0]);
    remaining.set(candidate[0], candidate[1] - 1);
  }
  return result;
}

function buildFixture(standard: MeasurelandsIndependentFormStandard): IndependentAssessmentItem[] {
  const difficulties = expandMix<AssessmentItemDifficulty>(standard.difficultyMix, [
    "easy",
    "moderate",
    "challenging",
    "very_challenging",
  ]);
  const cognitiveCategories = expandMix<AssessmentCognitiveCategory>(standard.cognitiveMix, [
    "recall",
    "understanding",
    "application",
    "reasoning",
    "transfer",
  ]);
  const descriptorCodes = descriptorSequence(standard);

  let selectedResponsesAssigned = 0;
  return descriptorCodes.map((descriptorCode, index) => {
    const misconception = MEASURELANDS_MISCONCEPTION_LIBRARY.find((item) =>
      item.descriptorCodes.includes(descriptorCode),
    );
    const cognitiveCategory = cognitiveCategories[index];
    const isRequiredMisconceptionDiagnosis =
      standard.misconceptionDiagnosisMinimum > 0 && index < standard.misconceptionDiagnosisMinimum;
    const reasoningJustificationIndex = cognitiveCategories
      .map((category, categoryIndex) => ({ category, categoryIndex }))
      .filter(({ category }) => category === "reasoning" || category === "transfer")
      .findIndex(({ categoryIndex }) => categoryIndex === index);
    const isRequiredReasoningJustification =
      standard.reasoningJustificationMinimum > 0
      && reasoningJustificationIndex >= 0
      && reasoningJustificationIndex < standard.reasoningJustificationMinimum;
    const responseMode = isRequiredMisconceptionDiagnosis
      ? "explanation"
      : isRequiredReasoningJustification
        ? "choose_and_explain"
        : selectedResponsesAssigned < standard.selectedResponseMaximum
          ? (selectedResponsesAssigned += 1, "selected_response" as const)
          : "constructed_response";
    const difficulty = difficulties[index];
    return {
      schemaVersion: 1,
      id: `${standard.bankId}-fixture-${String(index + 1).padStart(2, "0")}`,
      version: "fixture-1",
      realm: "measurement",
      level: standard.level,
      form: standard.kind,
      origin: "assessment_authored",
      sourcePool: standard.kind,
      bankId: standard.bankId,
      primaryDescriptorCode: descriptorCode,
      descriptorCodes: [descriptorCode],
      curriculumLessonMapping: [{ week: (index % 8) + 1, lesson: (index % 3) + 1 }],
      cognitiveCategory,
      difficulty,
      isTransfer: cognitiveCategory === "transfer",
      requiresReasoning: cognitiveCategory === "reasoning" || cognitiveCategory === "transfer",
      misconceptionDiagnosis: isRequiredMisconceptionDiagnosis,
      responseMode,
      misconceptionTags: [misconception?.id ?? "missing-fixture-misconception"],
      contextKey: `${standard.key}-fixture-context-${index + 1}`,
      structureKey: `${standard.key}-fixture-structure-${index + 1}`,
      selectedAnswerPosition: responseMode === "selected_response" ? index % 4 : undefined,
      prompt: "Architecture validation fixture",
      renderer: { type: "fixture", payload: { fixture: true, index } },
      scoring: { kind: "exact", correctResponse: "fixture" },
      statistics: createUncalibratedItemStatistics(difficulty),
    };
  });
}

const blueprintIssues = validateMeasurelandsAssessmentBlueprints();
check(blueprintIssues.length === 0, `Approved blueprint issues: ${blueprintIssues.join(" | ")}`);
check(MEASURELANDS_INDEPENDENT_FORM_STANDARDS.length === 13, "Expected 13 independent form standards.");
check(MEASURELANDS_FORM_MIGRATIONS.length === 13, "Expected 13 form migration records.");
check(
  new Set(MEASURELANDS_MISCONCEPTION_LIBRARY.map((item) => item.id)).size
    === MEASURELANDS_MISCONCEPTION_LIBRARY.length,
  "Canonical misconception IDs must be unique.",
);
check(
  MEASURELANDS_ASSESSMENT_BLUEPRINTS.every((blueprint) =>
    blueprint.descriptors.every((descriptor) =>
      MEASURELANDS_MISCONCEPTION_LIBRARY.some((item) => item.descriptorCodes.includes(descriptor.code)),
    ),
  ),
  "Every Measurelands descriptor must be represented in the canonical misconception library.",
);
check(Object.keys(MEASURELANDS_INDEPENDENT_ITEM_BANKS).length === 0, "Phase 1 bank registry must remain empty.");
check(
  new Set(MEASURELANDS_INDEPENDENT_FORM_STANDARDS.map((standard) => standard.key)).size === 13,
  "Independent form keys must be unique.",
);

const fixtures = new Map<string, IndependentAssessmentItem[]>();
for (const standard of MEASURELANDS_INDEPENDENT_FORM_STANDARDS) {
  const difficultyTotal = Object.values(standard.difficultyMix).reduce((sum, count) => sum + count, 0);
  const cognitiveTotal = Object.values(standard.cognitiveMix).reduce((sum, count) => sum + count, 0);
  const descriptorTotal = Object.values(standard.descriptorAllocation).reduce((sum, count) => sum + count, 0);
  check(standard.questionCount === 20, `${standard.key} must contain 20 questions.`);
  check(standard.passPercent === 85, `${standard.key} must retain the 85% threshold.`);
  check(difficultyTotal === 20, `${standard.key} difficulty allocation must total 20.`);
  check(cognitiveTotal === 20, `${standard.key} cognitive allocation must total 20.`);
  check(descriptorTotal === 20, `${standard.key} descriptor allocation must total 20.`);
  const requiresSeniorPosttestMinimums = standard.kind === "posttest" && standard.level >= 5;
  check(
    standard.transferTaskMinimum === (requiresSeniorPosttestMinimums ? 2 : 0),
    `${standard.key} has the wrong transfer-task minimum.`,
  );
  check(
    standard.reasoningJustificationMinimum === (requiresSeniorPosttestMinimums ? 2 : 0),
    `${standard.key} has the wrong reasoning-justification minimum.`,
  );
  check(
    standard.misconceptionDiagnosisMinimum === (requiresSeniorPosttestMinimums ? 2 : 0),
    `${standard.key} has the wrong misconception-diagnosis minimum.`,
  );

  const fixture = buildFixture(standard);
  fixtures.set(standard.key, fixture);
  const issues = validateIndependentMeasurelandsForm(standard, fixture);
  check(issues.length === 0, `${standard.key} valid fixture failed: ${issues.join(" | ")}`);

  const invalidOrigin = fixture.map((item, index) =>
    index === 0
      ? { ...item, origin: "lesson_reuse" as never, sourcePool: "pretest" as never }
      : item,
  );
  check(
    validateIndependentMeasurelandsForm(standard, invalidOrigin).some((issue) =>
      issue.includes("not independently authored"),
    ),
    `${standard.key} validator did not reject lesson reuse.`,
  );
}

for (let level = 1; level <= 6; level += 1) {
  const pretest = fixtures.get(`${level}:pretest`) ?? [];
  const posttest = fixtures.get(`${level}:posttest`) ?? [];
  const issues = validateParallelMeasurelandsForms(pretest, posttest);
  check(issues.length === 0, `Level ${level} parallel fixture failed: ${issues.join(" | ")}`);
  check(
    validateParallelMeasurelandsForms(pretest, pretest).length === 3,
    `Level ${level} overlap validator did not reject IDs, contexts and structures.`,
  );
}

const reportingFixture: AssessmentResponseEvidence[] = [
  {
    schema_version: 2,
    question_id: "report-1",
    question_version: "1",
    descriptor_codes: ["AC9M5M01"],
    cognitive_category: "reasoning",
    difficulty: "challenging",
    response_mode: "justification",
    misconception_tags: ["unit-size-only"],
    student_answer: "answer",
    correct: false,
    response_status: "incorrect",
    answered_at: new Date(0).toISOString(),
  },
  {
    schema_version: 2,
    question_id: "report-2",
    question_version: "1",
    descriptor_codes: ["AC9M5M01"],
    cognitive_category: "transfer",
    difficulty: "very_challenging",
    response_mode: "constructed_response",
    misconception_tags: ["unit-size-only"],
    student_answer: "answer",
    correct: true,
    response_status: "correct",
    answered_at: new Date(0).toISOString(),
  },
];
const report = buildAssessmentTeacherReport(reportingFixture);
check(report.descriptorMastery.AC9M5M01.percent === 50, "Descriptor mastery aggregation failed.");
check(report.misconceptionFrequency["unit-size-only"] === 1, "Misconception aggregation failed.");
check(report.reasoningPerformance.percent === 0, "Reasoning aggregation failed.");
check(report.transferPerformance.percent === 100, "Transfer aggregation failed.");

const requiredDocs = [
  "docs/LEVEL_UP_LEARNING_ASSESSMENT_FRAMEWORK.md",
  "docs/measurelands/assessment-blueprint.md",
  "docs/measurelands/phase-1-assessment-architecture.md",
  "docs/measurelands/level-5-assessment-rebuild-plan.md",
  "docs/measurelands/level-6-assessment-rebuild-plan.md",
];
for (const relativePath of requiredDocs) {
  check(fs.existsSync(path.join(process.cwd(), relativePath)), `Missing required document ${relativePath}.`);
}

const legacyFailures: string[] = [];
for (const standard of MEASURELANDS_INDEPENDENT_FORM_STANDARDS) {
  const year = LEVEL_TO_YEAR[standard.level];
  const questions = (standard.kind === "pretest"
    ? MEASURELANDS_PRETESTS_BY_YEAR[year]
    : MEASURELANDS_POSTTESTS_BY_YEAR[year]?.questions) as LegacyQuestion[] | undefined;
  const issues = legacyMeasurelandsFormIssues(questions ?? []);
  if (issues.length > 0) legacyFailures.push(`${standard.key} ${standard.yearLabel} ${standard.kind}: ${issues.join(" ")}`);
}

check(legacyFailures.length === 13, `Expected all 13 live forms to fail independence; found ${legacyFailures.length}.`);
check(
  MEASURELANDS_FORM_MIGRATIONS.every(
    (migration) => migration.liveStatus === "legacy_lesson_reuse"
      && migration.productionReleaseGate === "blocked",
  ),
  "Migration register must block every legacy form.",
);

console.log(`Phase 1 architecture checks: ${checksPassed} passed, ${failures.length} failed.`);
console.log(`Live independent-pool compliance: 0 passed, ${legacyFailures.length} failed (expected migration baseline).`);
for (const failure of legacyFailures) console.log(`LEGACY FAIL: ${failure}`);

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exitCode = 1;
}
