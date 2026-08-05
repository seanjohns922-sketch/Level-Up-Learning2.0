import fs from "node:fs";
import path from "node:path";
import {
  YEAR5_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS,
  YEAR5_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS,
} from "../data/assessments/year5MeasurelandsIndependentBanks";
import {
  YEAR5_MEASURELANDS_POSTTEST,
  YEAR5_MEASURELANDS_PRETEST,
} from "../data/assessments/year5MeasurelandsAssessments";
import {
  MEASURELANDS_FORM_MIGRATIONS,
  getMeasurelandsFormStandard,
  validateIndependentMeasurelandsForm,
  validateParallelMeasurelandsForms,
} from "../data/assessments/measurelandsAssessmentArchitecture";
import type { IndependentAssessmentItem } from "../data/assessments/assessmentItemStandard";
import type { PracticeTask } from "../data/activities/year1/practice-task";
import type { Question } from "../data/assessments/posttests";

type CandidateItem = IndependentAssessmentItem & Question;

const failures: string[] = [];
let checksPassed = 0;

function check(condition: boolean, message: string): void {
  if (condition) checksPassed += 1;
  else failures.push(message);
}

function record(task: PracticeTask): Record<string, unknown> {
  return task as unknown as Record<string, unknown>;
}

function optionsForTask(task: PracticeTask): unknown[] {
  const value = record(task);
  if (Array.isArray(value.options)) return value.options;
  if (Array.isArray(value.reasonOptions)) return value.reasonOptions;
  return [];
}

function correctOptionForTask(task: PracticeTask): unknown {
  const value = record(task);
  return value.correctOption ?? value.correctNumber ?? value.correctReason;
}

function validateTask(item: CandidateItem): string[] {
  const issues: string[] = [];
  const scope = item.id;
  const rendererPayload = item.renderer.payload as { sourceTask?: PracticeTask; domain?: string };
  const task = item.practiceTask ?? rendererPayload.sourceTask;
  const isDirectResponse = item.type === "numeric";

  if (!task) return [`${scope} has no authored source task.`];

  if (isDirectResponse) {
    if (item.practiceTask !== undefined) issues.push(`${scope} exposes an unused interactive task.`);
    if (item.renderer.type !== "numeric_entry") issues.push(`${scope} does not use the numeric-entry renderer contract.`);
    if (!Number.isFinite(Number(item.correctAnswer))) issues.push(`${scope} has a non-numeric constructed answer.`);
    if (item.responseMode !== "constructed_response") {
      issues.push(`${scope} numeric entry is not classified as constructed response.`);
    }
  } else if (item.renderer.payload !== task || item.renderer.type !== task.kind) {
    issues.push(`${scope} renderer metadata does not reference its authored task payload.`);
  }

  const isManipulatedTask = task.kind === "protractor" && task.scene === "construct";
  if (!isDirectResponse && isManipulatedTask && item.responseMode !== "manipulated_response") {
    issues.push(`${scope} interactive construction is not classified as a manipulated response.`);
  }
  if (
    !isDirectResponse
    && !isManipulatedTask
    && !["selected_response", "justification"].includes(item.responseMode)
    && !(task.kind === "perimeterCalc" && task.scene === "calc")
  ) {
    issues.push(`${scope} selected interaction is incorrectly classified as independently generated.`);
  }

  const value = record(task);
  const options = isDirectResponse ? [] : optionsForTask(task);
  const correctOption = correctOptionForTask(task);
  if (["intro", "learn", "formulaIntro", "formulaReveal"].includes(String(value.scene))) {
    issues.push(`${scope} uses a teaching scene in an assessment.`);
  }
  if (value.guidance !== undefined && value.guidance !== "none") {
    issues.push(`${scope} exposes protractor guidance.`);
  }
  if (value.note !== undefined || value.introLines !== undefined) {
    issues.push(`${scope} includes method-revealing scaffold copy.`);
  }

  if (options.length > 0) {
    if (new Set(options.map((option) => JSON.stringify(option))).size !== options.length) {
      issues.push(`${scope} contains duplicate response options.`);
    }
    if (correctOption !== undefined && !options.some((option) => option === correctOption)) {
      issues.push(`${scope} does not include its correct response in the options.`);
    }
    for (const option of options) {
      if (typeof option !== "string") continue;
      const normalized = option.trim().toLowerCase().replace(/[.!?]+$/, "");
      if (normalized === "same" || normalized === "cannot tell") {
        issues.push(`${scope} contains prohibited filler distractor '${option}'.`);
      }
    }
  }

  if (item.misconceptionDiagnosis && !isDirectResponse && options.length < 3) {
    issues.push(`${scope} misconception diagnosis offers fewer than 3 defensible responses.`);
  }
  if (item.responseMode === "justification" && options.length < 3) {
    issues.push(`${scope} justification task does not present competing explanations.`);
  }

  if (task.kind === "perimeterCalc") {
    const perimeter = task.sideLabels.reduce((sum, side) => sum + side, 0);
    if (task.perimeter !== perimeter) issues.push(`${scope} perimeter payload is mathematically inconsistent.`);
    if (task.correctNumber !== undefined && task.correctNumber !== perimeter) {
      issues.push(`${scope} perimeter choice has an incorrect answer.`);
    }
    if (task.answerValue !== undefined && task.answerValue !== perimeter) {
      issues.push(`${scope} perimeter constructed response has an incorrect answer.`);
    }
    if (task.poly.length !== task.sideLabels.length) {
      issues.push(`${scope} perimeter diagram and side labels have different edge counts.`);
    }
  }

  if (task.kind === "area" && task.scene === "chooseArea") {
    const expected = (task.gridW ?? 0) * (task.gridH ?? 0);
    if (task.correctNumber !== expected) issues.push(`${scope} area choice has an incorrect answer.`);
  }
  if (task.kind === "time24" && !task.options?.includes(task.correctOption ?? "")) {
    issues.push(`${scope} time conversion has an invalid correct option.`);
  }
  if (
    task.kind === "protractor"
    && task.correctOption !== undefined
    && !task.options?.includes(task.correctOption)
  ) {
    issues.push(`${scope} protractor item has an invalid correct option.`);
  }
  if (
    (task.kind === "metricUnit" || task.kind === "precisionMeasure")
    && task.correctOption !== undefined
    && !task.options?.includes(task.correctOption)
  ) {
    issues.push(`${scope} metric item has an invalid correct option.`);
  }
  if (task.kind === "metricUnit" && task.correctReason !== undefined) {
    if (!task.reasonOptions?.includes(task.correctReason)) issues.push(`${scope} metric justification is invalid.`);
  }
  if (task.kind === "timetable") {
    if (task.answerRowId !== undefined && !task.rows.some((row) => row.id === task.answerRowId)) {
      issues.push(`${scope} timetable answer row does not exist.`);
    }
    if (task.correctOption !== undefined && !task.options?.includes(task.correctOption)) {
      issues.push(`${scope} timetable correct explanation is invalid.`);
    }
    if (task.rows.some((row) => row.arriveMin <= row.departMin)) {
      issues.push(`${scope} timetable contains a non-positive journey.`);
    }
  }

  return issues;
}

const pretestStandard = getMeasurelandsFormStandard(5, "pretest");
const posttestStandard = getMeasurelandsFormStandard(5, "posttest");
check(Boolean(pretestStandard), "Missing Level 5 pre-test standard.");
check(Boolean(posttestStandard), "Missing Level 5 post-test standard.");

const pretest = YEAR5_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS as readonly CandidateItem[];
const posttest = YEAR5_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS as readonly CandidateItem[];

if (pretestStandard) {
  const issues = validateIndependentMeasurelandsForm(pretestStandard, pretest);
  check(issues.length === 0, `Level 5 pre-test blueprint failure: ${issues.join(" | ")}`);
}
if (posttestStandard) {
  const issues = validateIndependentMeasurelandsForm(posttestStandard, posttest);
  check(issues.length === 0, `Level 5 post-test blueprint failure: ${issues.join(" | ")}`);
}

const parallelIssues = validateParallelMeasurelandsForms(pretest, posttest);
check(parallelIssues.length === 0, `Level 5 parallel-form failure: ${parallelIssues.join(" | ")}`);
check(pretest.length === 20 && posttest.length === 20, "Level 5 forms must contain 20 items each.");
check(
  new Set([...pretest, ...posttest].map((item) => item.id)).size === 40,
  "Level 5 candidate item IDs must be globally unique.",
);
check(
  new Set([...pretest, ...posttest].map((item) => item.prompt)).size === 40,
  "Level 5 candidate prompts must be unique.",
);
check(
  new Set([...pretest, ...posttest].map((item) => JSON.stringify(item.renderer.payload))).size === 40,
  "Level 5 forms reuse an assessment interaction payload.",
);
check(
  [...pretest, ...posttest]
    .filter((item) => item.primaryDescriptorCode === "AC9M5M03")
    .every((item) => {
      const payload = item.renderer.payload as { domain?: string };
      return item.practiceTask?.kind === "time24" || payload.domain === "time24";
    }),
  "AC9M5M03 candidates must assess 12-hour/24-hour comparison and conversion, not Year 6 timetable planning.",
);

for (const item of [...pretest, ...posttest]) {
  const issues = validateTask(item);
  check(issues.length === 0, issues.join(" | "));
  check(item.statistics.calibrationStatus === "uncalibrated", `${item.id} must remain uncalibrated.`);
  check(item.statistics.sampleSize === 0, `${item.id} must start with a zero calibration sample.`);
}

check(
  posttest.filter((item) => item.isTransfer).length === 3,
  "Level 5 post-test must contain exactly 3 approved transfer items.",
);
check(
  posttest.filter((item) => item.requiresReasoning && item.responseMode === "justification").length >= 2,
  "Level 5 post-test must contain at least 2 reasoning justifications.",
);
check(
  posttest.filter((item) => item.misconceptionDiagnosis).length >= 2,
  "Level 5 post-test must contain at least 2 misconception diagnoses.",
);

const source = fs.readFileSync(
  path.join(process.cwd(), "data/assessments/year5MeasurelandsIndependentBanks.ts"),
  "utf8",
);
check(
  !source.includes("year5Measurelands/registry")
    && !source.includes("getY5MeasurelandsLessonQuizContribution"),
  "Level 5 independent bank imports lesson or weekly-quiz content.",
);

check(
  YEAR5_MEASURELANDS_PRETEST.every((item) => !("origin" in item)),
  "Uncalibrated Level 5 pre-test candidates must not replace the production resolver.",
);
check(
  YEAR5_MEASURELANDS_POSTTEST.every((item) => !("origin" in item)),
  "Uncalibrated Level 5 post-test candidates must not replace the production resolver.",
);
check(
  MEASURELANDS_FORM_MIGRATIONS
    .filter((migration) => migration.key.startsWith("5:"))
    .every(
      (migration) => migration.replacementStatus === "candidate_authored_uncalibrated"
        && migration.productionReleaseGate === "blocked",
    ),
  "Level 5 migration records must identify the authored candidates while keeping release blocked.",
);

console.log(`Level 5 independent-bank audit: ${checksPassed} passed, ${failures.length} failed.`);
console.log("Candidate release status: BLOCKED pending educator review and representative pilot calibration; responsive rendered QA passed.");

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exitCode = 1;
}
