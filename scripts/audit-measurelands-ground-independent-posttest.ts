import fs from "node:fs";
import path from "node:path";
import { isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import type { IndependentAssessmentItem } from "../data/assessments/assessmentItemStandard";
import { buildGroundMeasurelandsPosttestQuestions } from "../data/assessments/groundMeasurelandsPosttest";
import { GROUND_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS } from "../data/assessments/groundMeasurelandsIndependentPosttest";
import { MEASURELANDS_FORM_MIGRATIONS, getMeasurelandsFormStandard, validateIndependentMeasurelandsForm } from "../data/assessments/measurelandsAssessmentArchitecture";
import type { Question } from "../data/assessments/posttests";

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
  const domains: Record<string, string> = { AC9MFM01: "attribute_compare", AC9MFM02: "routine_sequence" };
  if (payload.domain !== domains[item.primaryDescriptorCode]) issues.push("renderer domain does not match descriptor");
  if (/money|dollar|coin|centimet|millimet|kilogram|gram|millilitre|litre|perimeter|area|temperature|degree|ruler|analog clock|quarter past|quarter to|days between|fraction/i.test(`${item.prompt} ${JSON.stringify(item.renderer.payload)}`)) issues.push("item contains content outside the approved Ground scope");
  return issues;
}

const posttest = GROUND_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS as readonly CandidateItem[];
const standard = getMeasurelandsFormStandard(0, "posttest");
check(Boolean(standard), "Missing Ground post-test standard.");
if (standard) { const issues = validateIndependentMeasurelandsForm(standard, posttest); check(issues.length === 0, `Ground post-test blueprint failure: ${issues.join(" | ")}`); }
check(posttest.length === 20, "Ground post-test must contain 20 items.");
check(new Set(posttest.map((item) => item.id)).size === 20, "Ground candidate IDs must be unique.");
check(new Set(posttest.map((item) => item.prompt)).size === 20, "Ground candidate prompts must be unique.");
check(new Set(posttest.map((item) => JSON.stringify(item.renderer.payload))).size === 20, "Ground candidates reuse a payload.");
for (const item of posttest) {
  const issues = runtimeIssues(item);
  check(issues.length === 0, `${item.id}: ${issues.join(" | ")}`);
  check(item.statistics.calibrationStatus === "uncalibrated", `${item.id} must remain uncalibrated.`);
  check(item.statistics.sampleSize === 0, `${item.id} must start with a zero calibration sample.`);
}
check(posttest.filter((item) => item.type === "numeric").length === 10, "Ground post-test must have 10 generated responses.");
check(posttest.filter((item) => item.type === "mcq").length === 10, "Ground post-test must have 10 selected responses.");
const source = fs.readFileSync(path.join(process.cwd(), "data/assessments/groundMeasurelandsIndependentPosttest.ts"), "utf8");
check(!source.includes("prepMeasurelands/registry") && !source.includes("buildMeasurelandsWeek") && !source.includes("PracticeTask"), "Ground bank imports lesson or weekly-quiz content.");
check(buildGroundMeasurelandsPosttestQuestions().every((item) => !("origin" in item)), "Ground candidates replaced the live post-test.");
check(MEASURELANDS_FORM_MIGRATIONS.filter((migration) => migration.key === "0:posttest").every((migration) => migration.replacementStatus === "candidate_authored_uncalibrated" && migration.productionReleaseGate === "blocked"), "Ground migration record must identify an authored candidate while keeping release blocked.");
console.log(`Ground independent post-test audit: ${checksPassed} passed, ${failures.length} failed.`);
console.log("Candidate release status: BLOCKED pending educator review and representative pilot calibration; responsive rendered QA passed.");
if (failures.length > 0) { for (const failure of failures) console.error(`- ${failure}`); process.exitCode = 1; }
