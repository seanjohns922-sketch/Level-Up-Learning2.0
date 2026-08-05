import fs from "node:fs";
import path from "node:path";
import { isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import type { IndependentAssessmentItem } from "../data/assessments/assessmentItemStandard";
import {
  MEASURELANDS_FORM_MIGRATIONS,
  getMeasurelandsFormStandard,
  validateIndependentMeasurelandsForm,
  validateParallelMeasurelandsForms,
} from "../data/assessments/measurelandsAssessmentArchitecture";
import type { Question } from "../data/assessments/posttests";
import {
  YEAR4_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS,
  YEAR4_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS,
} from "../data/assessments/year4MeasurelandsIndependentBanks";
import {
  YEAR4_MEASURELANDS_POSTTEST,
  YEAR4_MEASURELANDS_PRETEST,
} from "../data/assessments/year4MeasurelandsAssessments";

type CandidateItem = Question & IndependentAssessmentItem;
const failures: string[] = [];
let checksPassed = 0;

function check(condition: boolean, message: string): void {
  if (condition) checksPassed += 1;
  else failures.push(message);
}

function wrongAnswer(item: CandidateItem): string {
  if (item.type === "mcq") {
    return String(item.options?.find((option) => String(option) !== item.correctAnswer) ?? "__wrong__");
  }
  return String(Number(item.correctAnswer) + 1);
}

function runtimeIssues(item: CandidateItem): string[] {
  const issues: string[] = [];
  const payload = item.renderer.payload as { correctAnswer?: string; domain?: string; options?: readonly string[] };
  if (payload.correctAnswer !== item.correctAnswer) issues.push("renderer and question answers differ");
  if (item.scoring.kind !== "exact" || item.scoring.correctResponse !== item.correctAnswer) issues.push("exact scoring metadata differs");
  if (!isAssessmentAnswerCorrect(item, item.correctAnswer)) issues.push("runtime scorer rejects the correct answer");
  if (isAssessmentAnswerCorrect(item, wrongAnswer(item))) issues.push("runtime scorer accepts a wrong answer");

  if (item.type === "numeric") {
    if (item.renderer.type !== "numeric_entry") issues.push("constructed item lacks numeric-entry renderer metadata");
    if (!Number.isFinite(Number(item.correctAnswer))) issues.push("constructed answer is not numeric");
    if (item.options !== undefined) issues.push("constructed item exposes answer options");
  } else if (item.type === "mcq") {
    const options = (item.options ?? []).map(String);
    if (item.renderer.type !== "selected_response") issues.push("selected item lacks selected-response metadata");
    if (options.length < 3 || new Set(options).size !== options.length) issues.push("selected options are invalid");
    if (!options.includes(item.correctAnswer)) issues.push("selected options omit the correct answer");
    if (item.selectedAnswerPosition !== options.indexOf(item.correctAnswer) + 1) issues.push("selected-answer position is incorrect");
  } else issues.push(`unsupported runtime type ${item.type ?? "undefined"}`);

  const domainByDescriptor: Record<string, string> = {
    AC9M4M01: "instrument",
    AC9M4M02: "perimeter_area",
    AC9M4M03: "duration",
    AC9M4M04: "angle",
  };
  if (payload.domain !== domainByDescriptor[item.primaryDescriptorCode]) issues.push("renderer domain does not match descriptor");
  if (/money|dollar|coin|volume|cubic/i.test(`${item.prompt} ${JSON.stringify(item.renderer.payload)}`)) {
    issues.push("item contains content outside the approved physical-measurement scope");
  }
  return issues;
}

const pretest = YEAR4_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS as readonly CandidateItem[];
const posttest = YEAR4_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS as readonly CandidateItem[];
const allItems = [...pretest, ...posttest];
const pretestStandard = getMeasurelandsFormStandard(4, "pretest");
const posttestStandard = getMeasurelandsFormStandard(4, "posttest");

check(Boolean(pretestStandard), "Missing Level 4 pre-test standard.");
check(Boolean(posttestStandard), "Missing Level 4 post-test standard.");
if (pretestStandard) {
  const issues = validateIndependentMeasurelandsForm(pretestStandard, pretest);
  check(issues.length === 0, `Level 4 pre-test blueprint failure: ${issues.join(" | ")}`);
}
if (posttestStandard) {
  const issues = validateIndependentMeasurelandsForm(posttestStandard, posttest);
  check(issues.length === 0, `Level 4 post-test blueprint failure: ${issues.join(" | ")}`);
}
const parallelIssues = validateParallelMeasurelandsForms(pretest, posttest);
check(parallelIssues.length === 0, `Level 4 parallel-form failure: ${parallelIssues.join(" | ")}`);
check(pretest.length === 20 && posttest.length === 20, "Level 4 forms must contain 20 items each.");
check(new Set(allItems.map((item) => item.id)).size === 40, "Level 4 candidate IDs must be globally unique.");
check(new Set(allItems.map((item) => item.prompt)).size === 40, "Level 4 candidate prompts must be unique.");
check(new Set(allItems.map((item) => JSON.stringify(item.renderer.payload))).size === 40, "Level 4 candidates reuse a payload.");

for (const item of allItems) {
  const issues = runtimeIssues(item);
  check(issues.length === 0, `${item.id}: ${issues.join(" | ")}`);
  check(item.statistics.calibrationStatus === "uncalibrated", `${item.id} must remain uncalibrated.`);
  check(item.statistics.sampleSize === 0, `${item.id} must start with a zero calibration sample.`);
}
for (const [label, form] of [["pre-test", pretest], ["post-test", posttest]] as const) {
  check(form.filter((item) => item.type === "numeric").length === 17, `Level 4 ${label} must have 17 generated responses.`);
  check(form.filter((item) => item.type === "mcq").length === 3, `Level 4 ${label} must have 3 selected responses.`);
}
check(
  ["acute", "obtuse", "straight", "reflex", "revolution"].every((name) =>
    allItems.some((item) => `${item.prompt} ${item.options?.join(" ") ?? ""}`.toLowerCase().includes(name)),
  ),
  "Level 4 candidates do not cover the full approved named-angle range.",
);

const source = fs.readFileSync(path.join(process.cwd(), "data/assessments/year4MeasurelandsIndependentBanks.ts"), "utf8");
check(
  !source.includes("year4Measurelands/registry") && !source.includes("getY4MeasurelandsLessonQuizContribution") && !source.includes("PracticeTask"),
  "Level 4 independent bank imports or embeds lesson/weekly-quiz content.",
);
check(YEAR4_MEASURELANDS_PRETEST.every((item) => !("origin" in item)), "Level 4 legacy pre-test archive must remain distinguishable.");
check(YEAR4_MEASURELANDS_POSTTEST.every((item) => !("origin" in item)), "Level 4 legacy post-test archive must remain distinguishable.");
check(
  MEASURELANDS_FORM_MIGRATIONS.filter((migration) => migration.key.startsWith("4:")).every(
    (migration) => migration.replacementStatus === "production_uncalibrated" && migration.productionReleaseGate === "approved" && migration.legacyStatus === "retired",
  ),
  "Level 4 migration records must identify production banks and retired legacy forms.",
);

console.log(`Level 4 independent-bank audit: ${checksPassed} passed, ${failures.length} failed.`);
console.log("Release status: Measurelands Assessments v1.0 PRODUCTION; calibration data pending.");
if (failures.length > 0) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
}
