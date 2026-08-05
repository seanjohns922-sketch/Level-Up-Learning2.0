import fs from "node:fs";
import path from "node:path";
import { getPosttestForLevel, getPosttestForYearLabel, getPretestForLevel, getPretestForYearLabel } from "../data/assessments/api";
import { analyzeAssessmentResult, isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import { GROUND_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS } from "../data/assessments/groundMeasurelandsIndependentPosttest";
import { buildGroundMeasurelandsPosttestQuestions } from "../data/assessments/groundMeasurelandsPosttest";
import { getMeasurelandsPosttestForYear, getMeasurelandsPretestForYear } from "../data/assessments/measurelands";
import {
  MEASURELANDS_ASSESSMENT_RELEASE,
  MEASURELANDS_FORM_MIGRATIONS,
  MEASURELANDS_LEGACY_ARCHIVE,
  getMeasurelandsFormStandard,
  validateIndependentMeasurelandsForm,
  type MeasurelandsFormKey,
} from "../data/assessments/measurelandsAssessmentArchitecture";
import type { IndependentAssessmentItem } from "../data/assessments/assessmentItemStandard";
import type { Question } from "../data/assessments/posttests";
import { ASSESSMENT_THRESHOLDS } from "../lib/assessment-rules";
import { buildAssessmentQuestionSnapshots, isAssessmentQuestionSnapshot } from "../lib/assessment-replay";
import { YEAR1_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS, YEAR1_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS } from "../data/assessments/year1MeasurelandsIndependentBanks";
import { YEAR1_MEASURELANDS_POSTTEST, YEAR1_MEASURELANDS_PRETEST } from "../data/assessments/year1MeasurelandsAssessments";
import { YEAR2_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS, YEAR2_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS } from "../data/assessments/year2MeasurelandsIndependentBanks";
import { YEAR2_MEASURELANDS_POSTTEST, YEAR2_MEASURELANDS_PRETEST } from "../data/assessments/year2MeasurelandsAssessments";
import { YEAR3_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS, YEAR3_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS } from "../data/assessments/year3MeasurelandsIndependentBanks";
import { YEAR3_MEASURELANDS_POSTTEST, YEAR3_MEASURELANDS_PRETEST } from "../data/assessments/year3MeasurelandsAssessments";
import { YEAR4_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS, YEAR4_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS } from "../data/assessments/year4MeasurelandsIndependentBanks";
import { YEAR4_MEASURELANDS_POSTTEST, YEAR4_MEASURELANDS_PRETEST } from "../data/assessments/year4MeasurelandsAssessments";
import { YEAR5_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS, YEAR5_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS } from "../data/assessments/year5MeasurelandsIndependentBanks";
import { YEAR5_MEASURELANDS_POSTTEST, YEAR5_MEASURELANDS_PRETEST } from "../data/assessments/year5MeasurelandsAssessments";
import { YEAR6_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS, YEAR6_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS } from "../data/assessments/year6MeasurelandsIndependentBanks";
import { YEAR6_MEASURELANDS_POSTTEST, YEAR6_MEASURELANDS_PRETEST } from "../data/assessments/year6MeasurelandsAssessments";

type ProductionItem = Question & IndependentAssessmentItem;

type Form = {
  key: MeasurelandsFormKey;
  level: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  year: "Prep" | `Year ${1 | 2 | 3 | 4 | 5 | 6}`;
  kind: "pretest" | "posttest";
  production: readonly ProductionItem[];
  legacy: readonly { id: string }[];
};

const forms: Form[] = [
  { key: "0:posttest", level: 0, year: "Prep", kind: "posttest", production: GROUND_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS, legacy: buildGroundMeasurelandsPosttestQuestions() },
  { key: "1:pretest", level: 1, year: "Year 1", kind: "pretest", production: YEAR1_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS, legacy: YEAR1_MEASURELANDS_PRETEST },
  { key: "1:posttest", level: 1, year: "Year 1", kind: "posttest", production: YEAR1_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS, legacy: YEAR1_MEASURELANDS_POSTTEST },
  { key: "2:pretest", level: 2, year: "Year 2", kind: "pretest", production: YEAR2_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS, legacy: YEAR2_MEASURELANDS_PRETEST },
  { key: "2:posttest", level: 2, year: "Year 2", kind: "posttest", production: YEAR2_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS, legacy: YEAR2_MEASURELANDS_POSTTEST },
  { key: "3:pretest", level: 3, year: "Year 3", kind: "pretest", production: YEAR3_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS, legacy: YEAR3_MEASURELANDS_PRETEST },
  { key: "3:posttest", level: 3, year: "Year 3", kind: "posttest", production: YEAR3_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS, legacy: YEAR3_MEASURELANDS_POSTTEST },
  { key: "4:pretest", level: 4, year: "Year 4", kind: "pretest", production: YEAR4_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS, legacy: YEAR4_MEASURELANDS_PRETEST },
  { key: "4:posttest", level: 4, year: "Year 4", kind: "posttest", production: YEAR4_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS, legacy: YEAR4_MEASURELANDS_POSTTEST },
  { key: "5:pretest", level: 5, year: "Year 5", kind: "pretest", production: YEAR5_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS, legacy: YEAR5_MEASURELANDS_PRETEST },
  { key: "5:posttest", level: 5, year: "Year 5", kind: "posttest", production: YEAR5_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS, legacy: YEAR5_MEASURELANDS_POSTTEST },
  { key: "6:pretest", level: 6, year: "Year 6", kind: "pretest", production: YEAR6_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS, legacy: YEAR6_MEASURELANDS_PRETEST },
  { key: "6:posttest", level: 6, year: "Year 6", kind: "posttest", production: YEAR6_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS, legacy: YEAR6_MEASURELANDS_POSTTEST },
];

const failures: string[] = [];
let passed = 0;
function check(condition: boolean, message: string): void {
  if (condition) passed += 1;
  else failures.push(message);
}

check(forms.length === 13, "Production manifest must contain exactly 13 forms.");
check(MEASURELANDS_ASSESSMENT_RELEASE.name === "Measurelands Assessments", "Release name is incorrect.");
check(MEASURELANDS_ASSESSMENT_RELEASE.version === "1.0", "Release version is incorrect.");
check(MEASURELANDS_ASSESSMENT_RELEASE.status === "production", "Release is not marked production.");
check(MEASURELANDS_ASSESSMENT_RELEASE.passPercent === 85, "Release threshold is not 85%.");
check(ASSESSMENT_THRESHOLDS.pretestPassPercent === 85 && ASSESSMENT_THRESHOLDS.posttestPassPercent === 85, "Runtime assessment thresholds changed from 85%.");
check(MEASURELANDS_LEGACY_ARCHIVE.status === "retired" && !MEASURELANDS_LEGACY_ARCHIVE.productionUse, "Legacy archive is not retired from production.");
check(MEASURELANDS_LEGACY_ARCHIVE.retainedForms.length === 13, "Legacy archive must retain all 13 forms.");

for (const form of forms) {
  const direct = form.kind === "pretest"
    ? getMeasurelandsPretestForYear(form.year)
    : getMeasurelandsPosttestForYear(form.year)?.questions ?? [];
  const apiByYear = form.kind === "pretest"
    ? getPretestForYearLabel(form.year, "measurement")
    : getPosttestForYearLabel(form.year, "measurement")?.questions ?? [];
  const supportedLevel = form.level as 2 | 3 | 4 | 5;
  const apiByLevel = form.level >= 2 && form.level <= 5
    ? form.kind === "pretest"
      ? getPretestForLevel(supportedLevel, "measurement")
      : getPosttestForLevel(supportedLevel, "measurement")?.questions ?? []
    : apiByYear;
  const expectedIds = form.production.map((item) => item.id);
  const legacyIds = new Set(form.legacy.map((item) => item.id));
  const standard = getMeasurelandsFormStandard(form.level, form.kind);

  check(JSON.stringify(direct.map((item) => item.id)) === JSON.stringify(expectedIds), `${form.key} direct resolver does not return the approved bank.`);
  check(JSON.stringify(apiByYear.map((item) => item.id)) === JSON.stringify(expectedIds), `${form.key} year API does not return the approved bank.`);
  check(JSON.stringify(apiByLevel.map((item) => item.id)) === JSON.stringify(expectedIds), `${form.key} level API does not return the approved bank.`);
  check(direct.length === 20, `${form.key} does not resolve exactly 20 questions.`);
  check(direct.every((item) => "origin" in item && item.origin === "assessment_authored"), `${form.key} includes a non-independent item.`);
  check(direct.every((item) => !legacyIds.has(item.id)), `${form.key} resolves a retired legacy item.`);
  check(Boolean(standard), `${form.key} has no approved form standard.`);
  if (standard) check(validateIndependentMeasurelandsForm(standard, form.production).length === 0, `${form.key} fails its production blueprint.`);

  const questions = direct as unknown as ProductionItem[];
  const snapshots = buildAssessmentQuestionSnapshots(
    [...questions],
    (question) => String(question.correctAnswer ?? ""),
    (question, answer) => {
      const item = questions.find((candidate) => candidate.id === question.id);
      return item ? isAssessmentAnswerCorrect(item, String(answer)) : false;
    },
    new Date(0).toISOString(),
  );
  check(snapshots.length === 20 && snapshots.every(isAssessmentQuestionSnapshot), `${form.key} cannot create canonical replay snapshots.`);
  check(snapshots.every((snapshot) => snapshot.correct), `${form.key} replay snapshot scoring rejected an approved answer.`);

  const answersAt85 = Object.fromEntries(questions.slice(0, 17).map((item) => [item.id, String(item.correctAnswer)]));
  const answersAt80 = Object.fromEntries(questions.slice(0, 16).map((item) => [item.id, String(item.correctAnswer)]));
  const resultAt85 = analyzeAssessmentResult({
    questions,
    answers: answersAt85,
    yearLevel: form.level,
    testType: form.kind === "pretest" ? "pre" : "post",
    passThreshold: MEASURELANDS_ASSESSMENT_RELEASE.passPercent,
  });
  const resultAt80 = analyzeAssessmentResult({
    questions,
    answers: answersAt80,
    yearLevel: form.level,
    testType: form.kind === "pretest" ? "pre" : "post",
    passThreshold: MEASURELANDS_ASSESSMENT_RELEASE.passPercent,
  });
  check(resultAt85.percentage === 85 && resultAt85.passed, `${form.key} does not pass exactly at 85%.`);
  check(resultAt80.percentage === 80 && !resultAt80.passed, `${form.key} passes below 85%.`);
}

check(
  MEASURELANDS_FORM_MIGRATIONS.every((migration) =>
    migration.legacyStatus === "retired"
    && !migration.legacyProductionUse
    && migration.liveStatus === "independent_bank_v1"
    && migration.replacementStatus === "production_uncalibrated"
    && migration.productionReleaseGate === "approved"
    && migration.blockingReasons.length === 0),
  "Migration registry does not mark every independent bank approved and every legacy bank retired.",
);

const resolverSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/measurelands.ts"), "utf8");
check(!resolverSource.includes('from "./groundMeasurelandsPosttest"'), "Production resolver imports the legacy Ground bank.");
for (let level = 1; level <= 6; level += 1) {
  check(!resolverSource.includes(`from "./year${level}MeasurelandsAssessments"`), `Production resolver imports the legacy Level ${level} bank.`);
}

console.log(`Measurelands production-resolution audit: ${passed} passed, ${failures.length} failed across ${forms.length} routes.`);
if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exitCode = 1;
}
