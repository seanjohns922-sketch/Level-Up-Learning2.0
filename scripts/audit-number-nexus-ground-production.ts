import fs from "node:fs";
import path from "node:path";
import { getPosttestForYearLabel } from "../data/assessments/api";
import { analyzeAssessmentResult, isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import { GROUND_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS } from "../data/assessments/groundNumberNexusIndependentPosttest";
import { buildPrepPosttest, POSTTESTS, type Question } from "../data/assessments/posttests";
import { ASSESSMENT_THRESHOLDS } from "../lib/assessment-rules";
import { buildAssessmentQuestionSnapshots, isAssessmentQuestionSnapshot } from "../lib/assessment-replay";

const failures: string[] = [];
let passed = 0;
function check(condition: boolean, message: string): void {
  if (condition) passed += 1;
  else failures.push(message);
}

const production = getPosttestForYearLabel("Prep", "number")?.questions ?? [];
const approved = GROUND_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS;
const legacy = buildPrepPosttest().questions;

check(production.length === 20, "Ground production route must resolve 20 items.");
check(production.every((item, index) => item.id === approved[index]?.id), "Ground production route does not resolve the approved bank in order.");
check(production.every((item) => "origin" in item && item.origin === "assessment_authored"), "Ground production contains a non-independent item.");
check(new Set(production.map((item) => item.id)).size === 20, "Ground production IDs are not unique.");
check(legacy.every((legacyItem) => !production.some((item) => item.id === legacyItem.id)), "A legacy Ground item remains reachable in production.");
check(POSTTESTS.Prep === undefined, "The general post-test registry still exposes the legacy Prep form.");
check(ASSESSMENT_THRESHOLDS.posttestPassPercent === 85, "Ground post-test threshold changed from 85%.");

const questions = production as Question[];
const completedAt = new Date(0).toISOString();
const snapshots = buildAssessmentQuestionSnapshots(
  questions,
  (question) => String(question.correctAnswer ?? ""),
  (question, answer) => isAssessmentAnswerCorrect(question as Question, String(answer)),
  completedAt,
);
check(snapshots.length === 20 && snapshots.every(isAssessmentQuestionSnapshot), "Ground production cannot create canonical replay snapshots.");
check(snapshots.every((snapshot) => snapshot.correct), "Ground replay scoring rejects an approved answer.");
check(snapshots.every((snapshot) => (snapshot.curriculum_codes?.length ?? 0) > 0), "Ground replay loses curriculum descriptor metadata.");
check(snapshots.every((snapshot) => snapshot.lesson_mapping.length > 0), "Ground replay loses lesson mappings.");

const answersAt85 = Object.fromEntries(questions.slice(0, 17).map((item) => [item.id, String(item.correctAnswer)]));
const answersAt80 = Object.fromEntries(questions.slice(0, 16).map((item) => [item.id, String(item.correctAnswer)]));
const resultAt85 = analyzeAssessmentResult({ questions, answers: answersAt85, yearLevel: 0, testType: "post", passThreshold: ASSESSMENT_THRESHOLDS.posttestPassPercent });
const resultAt80 = analyzeAssessmentResult({ questions, answers: answersAt80, yearLevel: 0, testType: "post", passThreshold: ASSESSMENT_THRESHOLDS.posttestPassPercent });
check(resultAt85.percentage === 85 && resultAt85.passed, "Ground production does not pass exactly at 85%.");
check(resultAt80.percentage === 80 && !resultAt80.passed, "Ground production passes below 85%.");
check(resultAt80.recommendedWeeks.length > 0 && resultAt80.assignedWeek !== undefined, "Ground production cannot produce targeted curriculum recommendations.");

const posttestSource = fs.readFileSync(path.join(process.cwd(), "app/posttest/page.tsx"), "utf8");
const syncSource = fs.readFileSync(path.join(process.cwd(), "lib/student-progress-sync.ts"), "utf8");
const apiSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/api.ts"), "utf8");
const legacySource = fs.readFileSync(path.join(process.cwd(), "data/assessments/posttests.ts"), "utf8");
check(posttestSource.includes("saveRealmAssessment") && posttestSource.includes("question_results: questionResults"), "Canonical post-test saving or replay persistence changed.");
check(posttestSource.includes("buildAssessmentQuestionSnapshots") && posttestSource.includes("analyzeAssessmentResult"), "Post-test replay or teacher-report analysis is not wired.");
check(syncSource.includes('saveRealmAssessment(studentId, year, assessmentType, attempt, completionKey, progress, "number")'), "Number-realm canonical saving is not wired.");
check(apiSource.includes("GROUND_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS"), "API does not resolve the independent Ground bank.");
check(!apiSource.includes("buildPrepPosttest"), "API still imports the legacy Ground builder.");
check(/@deprecated Legacy Ground Number Nexus form/.test(legacySource), "Legacy Ground form is not marked deprecated.");

console.log(`Ground Number Nexus production audit: ${passed} passed, ${failures.length} failed.`);
console.log("Release: Number Nexus Ground Assessment v1.0 PRODUCTION, live 6 August 2026.");
if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exitCode = 1;
}
