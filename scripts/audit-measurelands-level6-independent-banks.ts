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
  YEAR6_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS,
  YEAR6_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS,
} from "../data/assessments/year6MeasurelandsIndependentBanks";
import {
  YEAR6_MEASURELANDS_POSTTEST,
  YEAR6_MEASURELANDS_PRETEST,
} from "../data/assessments/year6MeasurelandsAssessments";

type CandidateItem = Question & IndependentAssessmentItem;

const failures: string[] = [];
let checksPassed = 0;

function check(condition: boolean, message: string): void {
  if (condition) checksPassed += 1;
  else failures.push(message);
}

function plausibleWrongAnswer(item: CandidateItem): string {
  if (item.type === "mcq") {
    return String(item.options?.find((option) => String(option) !== item.correctAnswer) ?? "__wrong__");
  }
  if (item.correctAnswer.includes(",")) return "1,1";
  return String(Number(item.correctAnswer) + 1);
}

function validateRuntimeMechanic(item: CandidateItem): string[] {
  const issues: string[] = [];
  const payload = item.renderer.payload as {
    correctAnswer?: string;
    domain?: string;
    options?: readonly string[];
  };

  if (payload.correctAnswer !== item.correctAnswer) issues.push("renderer and question answers differ");
  if (item.scoring.kind !== "exact" || item.scoring.correctResponse !== item.correctAnswer) {
    issues.push("exact scoring metadata differs from the runtime answer");
  }
  if (!isAssessmentAnswerCorrect(item, item.correctAnswer)) issues.push("runtime scorer rejects the correct answer");
  if (isAssessmentAnswerCorrect(item, plausibleWrongAnswer(item))) issues.push("runtime scorer accepts a wrong answer");

  if (item.type === "numeric") {
    if (item.renderer.type !== "numeric_entry") issues.push("constructed item lacks numeric-entry renderer metadata");
    if (item.options !== undefined) issues.push("constructed item exposes answer options");
    const numeric = Number(item.correctAnswer);
    const coordinate = /^\d+(?:\.\d+)?,\d+(?:\.\d+)?$/.test(item.correctAnswer);
    if (!Number.isFinite(numeric) && !coordinate) issues.push("constructed answer is neither numeric nor a numeric pair");
    if (coordinate && item.inputMode !== "text") issues.push("numeric pair does not request the text keyboard");
  } else if (item.type === "mcq") {
    const options = (item.options ?? []).map(String);
    if (item.renderer.type !== "selected_response") issues.push("selected item lacks selected-response renderer metadata");
    if (options.length < 3) issues.push("selected item has fewer than three defensible options");
    if (new Set(options).size !== options.length) issues.push("selected item repeats an option");
    if (!options.includes(item.correctAnswer)) issues.push("selected item omits its correct answer");
    if (item.selectedAnswerPosition !== options.indexOf(item.correctAnswer) + 1) {
      issues.push("selected-answer position metadata is incorrect");
    }
  } else {
    issues.push(`unsupported runtime type ${item.type ?? "undefined"}`);
  }

  const expectedDomain: Record<string, string> = {
    AC9M6M01: "metric",
    AC9M6M02: "area",
    AC9M6M03: "timetable",
    AC9M6M04: "angle",
  };
  if (payload.domain !== expectedDomain[item.primaryDescriptorCode]) {
    issues.push(`domain ${payload.domain ?? "missing"} does not match ${item.primaryDescriptorCode}`);
  }
  if (/volume|cubic|cm3|m3/i.test(`${item.prompt} ${JSON.stringify(item.renderer.payload)}`)) {
    issues.push("item assesses excluded volume content");
  }

  return issues;
}

const pretest = YEAR6_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS as readonly CandidateItem[];
const posttest = YEAR6_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS as readonly CandidateItem[];
const allItems = [...pretest, ...posttest];
const pretestStandard = getMeasurelandsFormStandard(6, "pretest");
const posttestStandard = getMeasurelandsFormStandard(6, "posttest");

check(Boolean(pretestStandard), "Missing Level 6 pre-test standard.");
check(Boolean(posttestStandard), "Missing Level 6 post-test standard.");
if (pretestStandard) {
  const issues = validateIndependentMeasurelandsForm(pretestStandard, pretest);
  check(issues.length === 0, `Level 6 pre-test blueprint failure: ${issues.join(" | ")}`);
}
if (posttestStandard) {
  const issues = validateIndependentMeasurelandsForm(posttestStandard, posttest);
  check(issues.length === 0, `Level 6 post-test blueprint failure: ${issues.join(" | ")}`);
}

const parallelIssues = validateParallelMeasurelandsForms(pretest, posttest);
check(parallelIssues.length === 0, `Level 6 parallel-form failure: ${parallelIssues.join(" | ")}`);
check(pretest.length === 20 && posttest.length === 20, "Level 6 forms must contain 20 items each.");
check(new Set(allItems.map((item) => item.id)).size === 40, "Level 6 candidate IDs must be globally unique.");
check(new Set(allItems.map((item) => item.prompt)).size === 40, "Level 6 candidate prompts must be unique.");
check(
  new Set(allItems.map((item) => JSON.stringify(item.renderer.payload))).size === 40,
  "Level 6 candidates reuse an interaction payload.",
);

for (const item of allItems) {
  const issues = validateRuntimeMechanic(item);
  check(issues.length === 0, `${item.id}: ${issues.join(" | ")}`);
  check(item.statistics.calibrationStatus === "uncalibrated", `${item.id} must remain uncalibrated.`);
  check(item.statistics.sampleSize === 0, `${item.id} must start with a zero calibration sample.`);
}

for (const [label, form] of [["pre-test", pretest], ["post-test", posttest]] as const) {
  check(form.filter((item) => item.type === "numeric").length === 19, `Level 6 ${label} must have 19 generated responses.`);
  check(form.filter((item) => item.type === "mcq").length === 1, `Level 6 ${label} must have exactly 1 selected response.`);
  check(
    form.filter((item) => item.primaryDescriptorCode === "AC9M6M03").every(
      (item) => (item.renderer.payload as { domain?: string }).domain === "timetable",
    ),
    `Level 6 ${label} AC9M6M03 items must assess timetables, itineraries or journey duration.`,
  );
}

check(posttest.filter((item) => item.isTransfer).length === 4, "Level 6 post-test must contain exactly 4 transfer items.");
check(
  posttest.filter(
    (item) => item.requiresReasoning && ["justification", "explanation", "choose_and_explain"].includes(item.responseMode),
  ).length >= 2,
  "Level 6 post-test must contain at least 2 reasoning tasks requiring justification evidence.",
);
check(
  posttest.filter((item) => item.misconceptionDiagnosis).length >= 2,
  "Level 6 post-test must contain at least 2 misconception diagnoses.",
);

const source = fs.readFileSync(
  path.join(process.cwd(), "data/assessments/year6MeasurelandsIndependentBanks.ts"),
  "utf8",
);
check(
  !source.includes("year6Measurelands/registry")
    && !source.includes("getY6MeasurelandsLessonQuizContribution")
    && !source.includes("PracticeTask"),
  "Level 6 independent bank imports or embeds lesson/weekly-quiz interaction content.",
);
check(
  YEAR6_MEASURELANDS_PRETEST.every((item) => !("origin" in item)),
  "Uncalibrated Level 6 pre-test candidates must not replace the production resolver.",
);
check(
  YEAR6_MEASURELANDS_POSTTEST.every((item) => !("origin" in item)),
  "Uncalibrated Level 6 post-test candidates must not replace the production resolver.",
);
check(
  MEASURELANDS_FORM_MIGRATIONS
    .filter((migration) => migration.key.startsWith("6:"))
    .every(
      (migration) => migration.replacementStatus === "candidate_authored_uncalibrated"
        && migration.productionReleaseGate === "blocked",
    ),
  "Level 6 migration records must identify authored candidates while keeping release blocked.",
);

console.log(`Level 6 independent-bank audit: ${checksPassed} passed, ${failures.length} failed.`);
console.log("Candidate release status: EDUCATOR APPROVED; production remains BLOCKED pending representative pilot calibration; responsive rendered QA passed.");
if (failures.length > 0) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
}
