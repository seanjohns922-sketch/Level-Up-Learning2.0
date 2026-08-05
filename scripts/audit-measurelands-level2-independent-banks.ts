import fs from "node:fs";
import path from "node:path";
import { isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import type { IndependentAssessmentItem } from "../data/assessments/assessmentItemStandard";
import { MEASURELANDS_FORM_MIGRATIONS, getMeasurelandsFormStandard, validateIndependentMeasurelandsForm, validateParallelMeasurelandsForms } from "../data/assessments/measurelandsAssessmentArchitecture";
import type { Question } from "../data/assessments/posttests";
import { YEAR2_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS, YEAR2_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS } from "../data/assessments/year2MeasurelandsIndependentBanks";
import { YEAR2_MEASURELANDS_POSTTEST, YEAR2_MEASURELANDS_PRETEST } from "../data/assessments/year2MeasurelandsAssessments";

type CandidateItem = Question & IndependentAssessmentItem;
const failures: string[] = [];
let checksPassed = 0;
function check(condition: boolean, message: string): void { if (condition) checksPassed += 1; else failures.push(message); }
function wrongAnswer(item: CandidateItem): string {
  if (item.type === "mcq") return String(item.options?.find((option) => String(option) !== item.correctAnswer) ?? "__wrong__");
  return String(Number(item.correctAnswer) + 1);
}
function runtimeIssues(item: CandidateItem): string[] {
  const issues: string[] = [];
  const payload = item.renderer.payload as { correctAnswer?: string; domain?: string };
  if (payload.correctAnswer !== item.correctAnswer) issues.push("renderer and question answers differ");
  if (item.scoring.kind !== "exact" || item.scoring.correctResponse !== item.correctAnswer) issues.push("exact scoring metadata differs");
  if (!isAssessmentAnswerCorrect(item, item.correctAnswer)) issues.push("runtime scorer rejects the correct answer");
  if (isAssessmentAnswerCorrect(item, wrongAnswer(item))) issues.push("runtime scorer accepts a wrong answer");
  if (item.type === "numeric") {
    if (item.renderer.type !== "numeric_entry" || !Number.isFinite(Number(item.correctAnswer))) issues.push("constructed numeric contract is invalid");
    if (item.options !== undefined) issues.push("constructed item exposes answer options");
  } else if (item.type === "mcq") {
    const options = (item.options ?? []).map(String);
    if (item.renderer.type !== "selected_response" || options.length < 3 || new Set(options).size !== options.length) issues.push("selected-response contract is invalid");
    if (!options.includes(item.correctAnswer) || item.selectedAnswerPosition !== options.indexOf(item.correctAnswer) + 1) issues.push("selected answer metadata is invalid");
  } else issues.push(`unsupported runtime type ${item.type ?? "undefined"}`);
  const domains: Record<string, string> = { AC9M2M01: "informal_measurement", AC9M2M02: "fraction", AC9M2M03: "calendar", AC9M2M04: "clock", AC9M2M05: "turn" };
  if (payload.domain !== domains[item.primaryDescriptorCode]) issues.push("renderer domain does not match descriptor");
  if (/money|dollar|coin|centimet|millimet|kilogram|gram|millilitre|litre|perimeter|area|temperature|degree|ruler|scale dial|measuring jug/i.test(`${item.prompt} ${JSON.stringify(item.renderer.payload)}`)) issues.push("item contains content outside the approved Level 2 scope");
  return issues;
}

const pretest = YEAR2_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS as readonly CandidateItem[];
const posttest = YEAR2_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS as readonly CandidateItem[];
const allItems = [...pretest, ...posttest];
const pretestStandard = getMeasurelandsFormStandard(2, "pretest");
const posttestStandard = getMeasurelandsFormStandard(2, "posttest");
check(Boolean(pretestStandard), "Missing Level 2 pre-test standard.");
check(Boolean(posttestStandard), "Missing Level 2 post-test standard.");
if (pretestStandard) { const issues = validateIndependentMeasurelandsForm(pretestStandard, pretest); check(issues.length === 0, `Level 2 pre-test blueprint failure: ${issues.join(" | ")}`); }
if (posttestStandard) { const issues = validateIndependentMeasurelandsForm(posttestStandard, posttest); check(issues.length === 0, `Level 2 post-test blueprint failure: ${issues.join(" | ")}`); }
const parallelIssues = validateParallelMeasurelandsForms(pretest, posttest);
check(parallelIssues.length === 0, `Level 2 parallel-form failure: ${parallelIssues.join(" | ")}`);
check(pretest.length === 20 && posttest.length === 20, "Level 2 forms must contain 20 items each.");
check(new Set(allItems.map((item) => item.id)).size === 40, "Level 2 candidate IDs must be globally unique.");
check(new Set(allItems.map((item) => item.prompt)).size === 40, "Level 2 candidate prompts must be unique.");
check(new Set(allItems.map((item) => JSON.stringify(item.renderer.payload))).size === 40, "Level 2 candidates reuse a payload.");
for (const item of allItems) {
  const issues = runtimeIssues(item);
  check(issues.length === 0, `${item.id}: ${issues.join(" | ")}`);
  check(item.statistics.calibrationStatus === "uncalibrated", `${item.id} must remain uncalibrated.`);
  check(item.statistics.sampleSize === 0, `${item.id} must start with a zero calibration sample.`);
}
for (const [label, form] of [["pre-test", pretest], ["post-test", posttest]] as const) {
  check(form.filter((item) => item.type === "numeric").length === 14, `Level 2 ${label} must have 14 generated responses.`);
  check(form.filter((item) => item.type === "mcq").length === 6, `Level 2 ${label} must have 6 selected responses.`);
}
const source = fs.readFileSync(path.join(process.cwd(), "data/assessments/year2MeasurelandsIndependentBanks.ts"), "utf8");
check(!source.includes("year2Measurelands/registry") && !source.includes("buildY2Measurelands") && !source.includes("PracticeTask"), "Level 2 bank imports lesson or weekly-quiz content.");
check(YEAR2_MEASURELANDS_PRETEST.every((item) => !("origin" in item)), "Level 2 candidates replaced the live pre-test.");
check(YEAR2_MEASURELANDS_POSTTEST.every((item) => !("origin" in item)), "Level 2 candidates replaced the live post-test.");
check(MEASURELANDS_FORM_MIGRATIONS.filter((migration) => migration.key.startsWith("2:")).every((migration) => migration.replacementStatus === "candidate_authored_uncalibrated" && migration.productionReleaseGate === "blocked"), "Level 2 migration records must identify authored candidates while keeping release blocked.");
console.log(`Level 2 independent-bank audit: ${checksPassed} passed, ${failures.length} failed.`);
console.log("Candidate release status: BLOCKED pending educator review and representative pilot calibration; responsive rendered QA passed.");
if (failures.length > 0) { for (const failure of failures) console.error(`- ${failure}`); process.exitCode = 1; }
