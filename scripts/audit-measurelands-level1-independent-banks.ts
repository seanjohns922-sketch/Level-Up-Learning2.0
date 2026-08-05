import fs from "node:fs";
import path from "node:path";
import { isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import type { IndependentAssessmentItem } from "../data/assessments/assessmentItemStandard";
import { MEASURELANDS_FORM_MIGRATIONS, getMeasurelandsFormStandard, validateIndependentMeasurelandsForm, validateParallelMeasurelandsForms } from "../data/assessments/measurelandsAssessmentArchitecture";
import type { Question } from "../data/assessments/posttests";
import { YEAR1_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS, YEAR1_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS } from "../data/assessments/year1MeasurelandsIndependentBanks";
import { YEAR1_MEASURELANDS_POSTTEST, YEAR1_MEASURELANDS_PRETEST } from "../data/assessments/year1MeasurelandsAssessments";

type CandidateItem = Question & IndependentAssessmentItem;
const failures: string[] = [];
let checksPassed = 0;
function check(condition: boolean, message: string): void { if (condition) checksPassed += 1; else failures.push(message); }
function wrongAnswer(item: CandidateItem): string { return item.type === "mcq" ? String(item.options?.find((option) => String(option) !== item.correctAnswer) ?? "__wrong__") : String(Number(item.correctAnswer) + 1); }
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
  const domains: Record<string, string> = { AC9M1M01: "comparison", AC9M1M02: "length_measure", AC9M1M03: "duration_sequence" };
  if (payload.domain !== domains[item.primaryDescriptorCode]) issues.push("renderer domain does not match descriptor");
  if (/money|dollar|coin|centimet|millimet|kilogram|gram|millilitre|litre|perimeter|area|temperature|degree|ruler|analog clock|quarter past|quarter to|days between/i.test(`${item.prompt} ${JSON.stringify(item.renderer.payload)}`)) issues.push("item contains content outside the approved Level 1 scope");
  return issues;
}

const pretest = YEAR1_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS as readonly CandidateItem[];
const posttest = YEAR1_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS as readonly CandidateItem[];
const allItems = [...pretest, ...posttest];
const pretestStandard = getMeasurelandsFormStandard(1, "pretest");
const posttestStandard = getMeasurelandsFormStandard(1, "posttest");
check(Boolean(pretestStandard), "Missing Level 1 pre-test standard.");
check(Boolean(posttestStandard), "Missing Level 1 post-test standard.");
if (pretestStandard) { const issues = validateIndependentMeasurelandsForm(pretestStandard, pretest); check(issues.length === 0, `Level 1 pre-test blueprint failure: ${issues.join(" | ")}`); }
if (posttestStandard) { const issues = validateIndependentMeasurelandsForm(posttestStandard, posttest); check(issues.length === 0, `Level 1 post-test blueprint failure: ${issues.join(" | ")}`); }
check(validateParallelMeasurelandsForms(pretest, posttest).length === 0, "Level 1 parallel forms reuse IDs, contexts or structures.");
check(pretest.length === 20 && posttest.length === 20, "Level 1 forms must contain 20 items each.");
check(new Set(allItems.map((item) => item.id)).size === 40, "Level 1 candidate IDs must be globally unique.");
check(new Set(allItems.map((item) => item.prompt)).size === 40, "Level 1 candidate prompts must be unique.");
check(new Set(allItems.map((item) => JSON.stringify(item.renderer.payload))).size === 40, "Level 1 candidates reuse a payload.");
for (const item of allItems) {
  const issues = runtimeIssues(item);
  check(issues.length === 0, `${item.id}: ${issues.join(" | ")}`);
  check(item.statistics.calibrationStatus === "uncalibrated", `${item.id} must remain uncalibrated.`);
  check(item.statistics.sampleSize === 0, `${item.id} must start with a zero calibration sample.`);
}
for (const [label, form] of [["pre-test", pretest], ["post-test", posttest]] as const) {
  check(form.filter((item) => item.type === "numeric").length === 12, `Level 1 ${label} must have 12 generated responses.`);
  check(form.filter((item) => item.type === "mcq").length === 8, `Level 1 ${label} must have 8 selected responses.`);
}
const source = fs.readFileSync(path.join(process.cwd(), "data/assessments/year1MeasurelandsIndependentBanks.ts"), "utf8");
check(!source.includes("year1Measurelands/registry") && !source.includes("buildY1Measurelands") && !source.includes("PracticeTask"), "Level 1 bank imports lesson or weekly-quiz content.");
check(YEAR1_MEASURELANDS_PRETEST.every((item) => !("origin" in item)), "Level 1 legacy pre-test archive must remain distinguishable.");
check(YEAR1_MEASURELANDS_POSTTEST.every((item) => !("origin" in item)), "Level 1 legacy post-test archive must remain distinguishable.");
check(MEASURELANDS_FORM_MIGRATIONS.filter((migration) => migration.key.startsWith("1:")).every((migration) => migration.replacementStatus === "production_uncalibrated" && migration.productionReleaseGate === "approved" && migration.legacyStatus === "retired"), "Level 1 migration records must identify production banks and retired legacy forms.");
console.log(`Level 1 independent-bank audit: ${checksPassed} passed, ${failures.length} failed.`);
console.log("Release status: Measurelands Assessments v1.0 PRODUCTION; calibration data pending.");
if (failures.length > 0) { for (const failure of failures) console.error(`- ${failure}`); process.exitCode = 1; }
