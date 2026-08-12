import fs from "node:fs";
import path from "node:path";
import { isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import type { IndependentAssessmentItem } from "../data/assessments/assessmentItemStandard";
import {
  LEVEL1_STARPATH_INDEPENDENT_POSTTEST_ITEMS,
  LEVEL1_STARPATH_INDEPENDENT_PRETEST_ITEMS,
} from "../data/assessments/level1StarpathIndependentAssessments";
import { STARPATH_ASSESSMENT_BLUEPRINTS } from "../data/assessments/starpathAssessmentBlueprint";
import { STARPATH_MISCONCEPTION_LIBRARY } from "../data/assessments/starpathMisconceptions";
import type { Question } from "../data/assessments/posttests";
import { isPracticeTaskSafe } from "../lib/task-safety";
import { ASSESSMENT_THRESHOLDS } from "../lib/assessment-rules";

type Candidate = Question & IndependentAssessmentItem;
type Direction = "up" | "down" | "left" | "right";
type Cell = { r: number; c: number };
type AccessibleCandidateTask = {
  speakText?: string;
  feedback?: { correct: string; wrong: string };
};
const failures: string[] = [];
let passed = 0;

function check(condition: boolean, message: string) {
  if (condition) passed += 1;
  else failures.push(message);
}

function counts(values: readonly string[]) {
  return values.reduce<Record<string, number>>((result, value) => {
    result[value] = (result[value] ?? 0) + 1;
    return result;
  }, {});
}

function sameCounts(actual: Record<string, number>, expected: Record<string, number>) {
  return Object.keys({ ...actual, ...expected }).every((key) => actual[key] === expected[key]);
}

function routeIsValid(start: Cell, route: Direction[], rows: number, cols: number) {
  const delta: Record<Direction, Cell> = {
    up: { r: -1, c: 0 }, down: { r: 1, c: 0 }, left: { r: 0, c: -1 }, right: { r: 0, c: 1 },
  };
  let current = start;
  for (const direction of route) {
    current = { r: current.r + delta[direction].r, c: current.c + delta[direction].c };
    if (current.r < 0 || current.r >= rows || current.c < 0 || current.c >= cols) return false;
  }
  return true;
}

const blueprint = STARPATH_ASSESSMENT_BLUEPRINTS.find((item) => item.level === 1);
const misconceptionById = new Map(STARPATH_MISCONCEPTION_LIBRARY.map((item) => [item.id, item]));
check(Boolean(blueprint), "Year 1 Starpath blueprint is missing.");

const forms = [
  { kind: "pretest", bank: LEVEL1_STARPATH_INDEPENDENT_PRETEST_ITEMS, difficulty: { easy: 10, moderate: 8, challenging: 2 }, cognitive: { recall: 4, understanding: 7, application: 6, reasoning: 3 }, bankId: "starpath-level-1-pretest-rc1" },
  { kind: "posttest", bank: LEVEL1_STARPATH_INDEPENDENT_POSTTEST_ITEMS, difficulty: { easy: 7, moderate: 8, challenging: 5 }, cognitive: { recall: 2, understanding: 6, application: 7, reasoning: 4, transfer: 1 }, bankId: "starpath-level-1-posttest-rc1" },
] as const;

for (const form of forms) {
  const bank = form.bank as readonly Candidate[];
  const formBlueprint = blueprint?.forms.find((item) => item.kind === form.kind);
  check(Boolean(formBlueprint), `Year 1 ${form.kind} blueprint is missing.`);
  check(bank.length === 20, `${form.kind} must contain 20 items.`);
  check(new Set(bank.map((item) => item.id)).size === 20, `${form.kind} IDs must be unique.`);
  check(new Set(bank.map((item) => item.prompt)).size === 20, `${form.kind} prompts must be unique.`);
  check(new Set(bank.map((item) => item.contextKey)).size === 20, `${form.kind} contexts must be unique.`);
  check(new Set(bank.map((item) => item.structureKey)).size === 20, `${form.kind} structures must be unique.`);
  check(sameCounts(counts(bank.map((item) => item.primaryDescriptorCode)), { AC9M1SP01: 12, AC9M1SP02: 8 }), `${form.kind} descriptor allocation must be 12/8.`);
  check(sameCounts(counts(bank.map((item) => item.difficulty)), form.difficulty), `${form.kind} difficulty mix differs from blueprint.`);
  check(sameCounts(counts(bank.map((item) => item.cognitiveCategory)), form.cognitive), `${form.kind} cognitive mix differs from blueprint.`);
  check(sameCounts(counts(bank.map((item) => item.responseMode)), { selected_response: 8, manipulated_response: 12 }), `${form.kind} response mix must be 8 selected and 12 manipulated.`);
  check(bank.every((item) => item.prompt.trim().split(/\s+/).length <= 12), `${form.kind} contains a prompt above the 12-word Year 1 ceiling.`);

  for (const item of bank) {
    check(item.version === "1.0.0-rc1" && item.bankId === form.bankId, `${item.id} has incorrect release metadata.`);
    check(item.realm === "space" && item.level === 1 && item.form === form.kind, `${item.id} targets the wrong form.`);
    check(item.origin === "assessment_authored" && item.sourcePool === form.kind, `${item.id} is not independent assessment content.`);
    check(item.renderer.type === "starpath_assessment_task" && item.type === "starpathTask", `${item.id} is not a launchable Starpath task.`);
    check(item.scoring.kind === "interaction" && isAssessmentAnswerCorrect(item, item.correctAnswer), `${item.id} rejects its canonical correct token.`);
    check(!isAssessmentAnswerCorrect(item, `incorrect:${item.id}`), `${item.id} accepts an incorrect token.`);
    check(item.statistics.calibrationStatus === "uncalibrated" && item.statistics.sampleSize === 0, `${item.id} must start uncalibrated.`);
    check(item.curriculumLessonMapping.length === 1 && item.descriptorCodes.includes(item.primaryDescriptorCode), `${item.id} has incomplete curriculum metadata.`);
    check(item.misconceptionTags.length > 0, `${item.id} has no misconception tag.`);
    check(item.misconceptionTags.every((tag) => misconceptionById.get(tag)?.descriptorCodes.includes(item.primaryDescriptorCode)), `${item.id} has a misconception outside its descriptor.`);
    check(item.isTransfer === (item.cognitiveCategory === "transfer"), `${item.id} has incorrect transfer metadata.`);
    check(item.requiresReasoning === (["reasoning", "transfer"] as string[]).includes(item.cognitiveCategory), `${item.id} has incorrect reasoning metadata.`);
    check(Boolean(item.practiceTask && isPracticeTaskSafe(item.practiceTask)), `${item.id} is blocked by task safety.`);
    const task = item.practiceTask;
    const accessibleTask = task as AccessibleCandidateTask | undefined;
    check(Boolean(accessibleTask?.speakText?.trim()), `${item.id} has no read-aloud prompt.`);
    check(Boolean(accessibleTask?.feedback && accessibleTask.feedback.correct === accessibleTask.feedback.wrong), `${item.id} feedback can reveal correctness.`);
    if (task?.kind === "starpathShapeWorkshop") {
      check(task.points.length >= 3 && new Set(task.points.map((point) => `${point.r}:${point.c}`)).size === task.points.length, `${item.id} has an invalid shape construction.`);
      check(task.mode !== "repair" || (task.missingEdgeIndex !== undefined && task.missingEdgeIndex < task.points.length), `${item.id} has an invalid repair edge.`);
    }
    if (task?.kind === "starpathObjectMatch") {
      check(task.objects.length % 2 === 0 && new Set(task.objects.map((object) => object.id)).size === task.objects.length, `${item.id} has an invalid object match set.`);
    }
    if (task?.kind === "starpathRouteRecord") {
      check(routeIsValid(task.start, task.route, task.rows, task.cols), `${item.id} displayed route leaves the grid.`);
    }
    if (task?.kind === "starpathRouteBuild") {
      check(task.start.r >= 0 && task.start.r < task.rows && task.start.c >= 0 && task.start.c < task.cols, `${item.id} route start is outside the grid.`);
      check(task.goal.r >= 0 && task.goal.r < task.rows && task.goal.c >= 0 && task.goal.c < task.cols, `${item.id} route goal is outside the grid.`);
      check(task.maxSteps >= Math.abs(task.goal.r - task.start.r) + Math.abs(task.goal.c - task.start.c), `${item.id} route step limit is too small.`);
    }
    if (task?.kind === "starpathRouteDebug") {
      check(task.steps.some((step) => step.id === task.wrongStepId), `${item.id} missing its marked incorrect route step.`);
    }
  }
}

const prePrompts = new Set(LEVEL1_STARPATH_INDEPENDENT_PRETEST_ITEMS.map((item) => item.prompt));
check(LEVEL1_STARPATH_INDEPENDENT_POSTTEST_ITEMS.every((item) => !prePrompts.has(item.prompt)), "Pre-Test and Post-Test reuse prompt wording.");
const source = fs.readFileSync(path.join(process.cwd(), "data/assessments/level1StarpathIndependentAssessments.ts"), "utf8");
const apiSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/api.ts"), "utf8");
const pretestPageSource = fs.readFileSync(path.join(process.cwd(), "app/pretest/page.tsx"), "utf8");
const posttestPageSource = fs.readFileSync(path.join(process.cwd(), "app/posttest/page.tsx"), "utf8");
const demoPanelSource = fs.readFileSync(path.join(process.cwd(), "components/demo/DemoReviewPanel.tsx"), "utf8");
check(!/activities\/starpath\/level1\/(week|quizTasks|level1PostTest)/.test(source), "Candidate banks import lesson, quiz or legacy assessment content.");
check(!apiSource.includes("level1StarpathIndependentAssessments"), "RC1 banks must not be reachable through the production resolver.");
check(pretestPageSource.includes('reviewBank === "level1-starpath-pre-rc1"') && pretestPageSource.includes("isDemoPreviewMode()"), "Pre-Test RC1 lacks its demo-only review gate.");
check(posttestPageSource.includes('reviewBank === "level1-starpath-post-rc1"') && posttestPageSource.includes("isDemoPreviewMode()"), "Post-Test RC1 lacks its demo-only review gate.");
check(demoPanelSource.includes('params.set("review_bank", "level1-starpath-pre-rc1")'), "Demo panel does not launch the Year 1 Pre-Test RC1 bank.");
check(demoPanelSource.includes("review_bank=level1-starpath-post-rc1"), "Demo panel does not launch the Year 1 Post-Test RC1 bank.");
check(ASSESSMENT_THRESHOLDS.pretestPassPercent === 85, "Pre-Test threshold must remain 85%.");
check(ASSESSMENT_THRESHOLDS.posttestPassPercent === 85, "Post-Test threshold must remain 85%.");

console.log(`Year 1 Starpath independent-bank audit: ${passed} passed, ${failures.length} failed.`);
console.log("Forms: 40 items; each 12 manipulated / 8 selected; production resolver unchanged.");
console.log("Release status: RC1 BLOCKED pending educator review and production approval.");
if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
}
