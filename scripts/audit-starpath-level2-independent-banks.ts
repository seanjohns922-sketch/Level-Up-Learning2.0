import fs from "node:fs";
import path from "node:path";
import { isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import { getPosttestForLevel, getPosttestForYearLabel, getPretestForLevel, getPretestForYearLabel } from "../data/assessments/api";
import type { IndependentAssessmentItem } from "../data/assessments/assessmentItemStandard";
import {
  LEVEL2_STARPATH_INDEPENDENT_POSTTEST_ITEMS,
  LEVEL2_STARPATH_INDEPENDENT_PRETEST_ITEMS,
} from "../data/assessments/level2StarpathIndependentAssessments";
import { STARPATH_ASSESSMENT_BLUEPRINTS } from "../data/assessments/starpathAssessmentBlueprint";
import { STARPATH_MISCONCEPTION_LIBRARY } from "../data/assessments/starpathMisconceptions";
import type { Question } from "../data/assessments/posttests";
import { isPracticeTaskSafe } from "../lib/task-safety";
import { ASSESSMENT_THRESHOLDS } from "../lib/assessment-rules";
import { getLevelTwoPosttest } from "../data/activities/starpath/level2/level2PostTest";

type Candidate = Question & IndependentAssessmentItem;
type Direction = "up" | "down" | "left" | "right";
type Cell = { r: number; c: number };
const failures: string[] = [];
let passed = 0;
const check = (condition: boolean, message: string) => condition ? passed += 1 : failures.push(message);

function counts(values: readonly string[]) {
  return values.reduce<Record<string, number>>((result, value) => ({ ...result, [value]: (result[value] ?? 0) + 1 }), {});
}
function sameCounts(actual: Record<string, number>, expected: Record<string, number>) {
  return Object.keys({ ...actual, ...expected }).every((key) => actual[key] === expected[key]);
}
function move(cell: Cell, direction: Direction): Cell {
  const delta: Record<Direction, Cell> = { up: { r: -1, c: 0 }, down: { r: 1, c: 0 }, left: { r: 0, c: -1 }, right: { r: 0, c: 1 } };
  return { r: cell.r + delta[direction].r, c: cell.c + delta[direction].c };
}
function routeEnd(start: Cell, directions: readonly Direction[]) {
  return directions.reduce(move, start);
}
function inBounds(cell: Cell, rows: number, cols: number) {
  return cell.r >= 0 && cell.r < rows && cell.c >= 0 && cell.c < cols;
}
function routeInBounds(start: Cell, directions: readonly Direction[], rows: number, cols: number) {
  let cell = start;
  return directions.every((direction) => inBounds(cell = move(cell, direction), rows, cols));
}
function reachable(start: Cell, goal: Cell, rows: number, cols: number, blocked: readonly Cell[] = []) {
  const blockedKeys = new Set(blocked.map((cell) => `${cell.r}:${cell.c}`));
  const queue = [start];
  const seen = new Set([`${start.r}:${start.c}`]);
  while (queue.length) {
    const current = queue.shift()!;
    if (current.r === goal.r && current.c === goal.c) return true;
    for (const direction of ["up", "down", "left", "right"] as const) {
      const next = move(current, direction);
      const key = `${next.r}:${next.c}`;
      if (inBounds(next, rows, cols) && !blockedKeys.has(key) && !seen.has(key)) { seen.add(key); queue.push(next); }
    }
  }
  return false;
}

const blueprint = STARPATH_ASSESSMENT_BLUEPRINTS.find((item) => item.level === 2);
const misconceptionById = new Map(STARPATH_MISCONCEPTION_LIBRARY.map((item) => [item.id, item]));
check(Boolean(blueprint), "Year 2 Starpath blueprint is missing.");
check(blueprint?.descriptors.every((item) => item.curriculumMapping.implementationStatus === "aligned") ?? false, "Year 2 blueprint is not curriculum-aligned.");

const forms = [
  { kind: "pretest", bank: LEVEL2_STARPATH_INDEPENDENT_PRETEST_ITEMS, difficulty: { easy: 8, moderate: 9, challenging: 3 }, cognitive: { recall: 3, understanding: 6, application: 7, reasoning: 4 }, bankId: "starpath-level-2-pretest-v1" },
  { kind: "posttest", bank: LEVEL2_STARPATH_INDEPENDENT_POSTTEST_ITEMS, difficulty: { easy: 6, moderate: 9, challenging: 5 }, cognitive: { recall: 2, understanding: 5, application: 7, reasoning: 5, transfer: 1 }, bankId: "starpath-level-2-posttest-v1" },
] as const;

for (const form of forms) {
  const bank = form.bank as readonly Candidate[];
  check(bank.length === 20, `${form.kind} must contain 20 items.`);
  check(new Set(bank.map((item) => item.id)).size === 20, `${form.kind} IDs must be unique.`);
  check(new Set(bank.map((item) => item.prompt)).size === 20, `${form.kind} prompts must be unique.`);
  check(new Set(bank.map((item) => item.contextKey)).size === 20, `${form.kind} contexts must be unique.`);
  check(new Set(bank.map((item) => item.structureKey)).size === 20, `${form.kind} structures must be unique.`);
  check(sameCounts(counts(bank.map((item) => item.primaryDescriptorCode)), { AC9M2SP01: 10, AC9M2SP02: 10 }), `${form.kind} descriptor allocation must be 10/10.`);
  check(sameCounts(counts(bank.map((item) => item.difficulty)), form.difficulty), `${form.kind} difficulty mix differs from the approved blueprint.`);
  check(sameCounts(counts(bank.map((item) => item.cognitiveCategory)), form.cognitive), `${form.kind} cognitive mix differs from the approved blueprint.`);
  check(sameCounts(counts(bank.map((item) => item.responseMode)), { selected_response: 6, manipulated_response: 14 }), `${form.kind} response mix must be 6 selected and 14 manipulated.`);
  check(bank.every((item) => item.prompt.trim().split(/\s+/).length <= 16), `${form.kind} contains a prompt above the 16-word Year 2 ceiling.`);

  for (const item of bank) {
    check(item.version === "1.0.0" && item.bankId === form.bankId, `${item.id} has incorrect release metadata.`);
    check(item.realm === "space" && item.level === 2 && item.form === form.kind, `${item.id} targets the wrong form.`);
    check(item.origin === "assessment_authored" && item.sourcePool === form.kind, `${item.id} is not independent assessment content.`);
    check(item.renderer.type === "starpath_assessment_task" && item.type === "starpathTask", `${item.id} is not a launchable Starpath task.`);
    check(item.scoring.kind === "interaction" && isAssessmentAnswerCorrect(item, item.correctAnswer), `${item.id} rejects its correct token.`);
    check(!isAssessmentAnswerCorrect(item, `incorrect:${item.id}`), `${item.id} accepts an incorrect token.`);
    check(item.statistics.calibrationStatus === "uncalibrated" && item.statistics.sampleSize === 0, `${item.id} must start uncalibrated.`);
    check(item.curriculumLessonMapping.length === 1 && item.descriptorCodes.includes(item.primaryDescriptorCode), `${item.id} has incomplete curriculum metadata.`);
    check(item.misconceptionTags.length > 0 && item.misconceptionTags.every((tag) => misconceptionById.get(tag)?.descriptorCodes.includes(item.primaryDescriptorCode)), `${item.id} has an invalid misconception mapping.`);
    check(item.isTransfer === (item.cognitiveCategory === "transfer"), `${item.id} has incorrect transfer metadata.`);
    check(item.requiresReasoning === (["reasoning", "transfer"] as string[]).includes(item.cognitiveCategory), `${item.id} has incorrect reasoning metadata.`);
    check(Boolean(item.practiceTask && isPracticeTaskSafe(item.practiceTask)), `${item.id} is blocked by task safety.`);
    const task = item.practiceTask;
    check(Boolean(task && "speakText" in task && typeof task.speakText === "string" && task.speakText.trim()), `${item.id} has no read-aloud prompt.`);
    check(Boolean(task && "feedback" in task && task.feedback?.correct === task.feedback?.wrong), `${item.id} feedback can reveal correctness.`);
    if (task?.kind === "starpathShapeFeature") check(task.options.some((option) => option.id === task.correctOptionId), `${item.id} has no matching correct shape option.`);
    if (task?.kind === "starpathShapeWorkshop") {
      check(task.points.length >= 3 && new Set(task.points.map((point) => `${point.r}:${point.c}`)).size === task.points.length, `${item.id} has an invalid shape construction.`);
      check(task.mode !== "repair" || (task.missingEdgeIndex !== undefined && task.missingEdgeIndex < task.points.length), `${item.id} has an invalid repair edge.`);
    }
    if (task?.kind === "starpathMapLocate") check(task.landmarks.some((landmark) => landmark.id === task.correctLandmarkId), `${item.id} has no matching correct landmark.`);
    if (task?.kind === "starpathMapRoute") {
      check(inBounds(task.start, task.rows, task.cols) && inBounds(task.goal, task.rows, task.cols), `${item.id} starts or ends outside its map.`);
      if (task.mode === "follow") {
        const directions = task.steps?.map((step) => step.direction) ?? [];
        check(routeInBounds(task.start, directions, task.rows, task.cols), `${item.id} displayed route leaves the map.`);
        const end = routeEnd(task.start, directions);
        check(end.r === task.goal.r && end.c === task.goal.c, `${item.id} displayed route misses its goal.`);
      }
      if (task.mode === "give") check((task.maxSteps ?? 0) >= Math.abs(task.goal.r - task.start.r) + Math.abs(task.goal.c - task.start.c), `${item.id} route budget is too small.`);
      if (task.mode === "mission") {
        const checkpoint = task.checkpoints?.[0];
        check(Boolean(checkpoint && reachable(task.start, checkpoint, task.rows, task.cols, task.blocked) && reachable(checkpoint, task.goal, task.rows, task.cols, task.blocked)), `${item.id} mission is not solvable through its checkpoint.`);
      }
      if (task.mode === "debug") check(Boolean(task.debugSteps?.some((step) => step.id === task.wrongStepId)), `${item.id} lacks its marked incorrect step.`);
    }
  }
}

const prePrompts = new Set(LEVEL2_STARPATH_INDEPENDENT_PRETEST_ITEMS.map((item) => item.prompt));
check(LEVEL2_STARPATH_INDEPENDENT_POSTTEST_ITEMS.every((item) => !prePrompts.has(item.prompt)), "Pre-Test and Post-Test reuse prompt wording.");
const source = fs.readFileSync(path.join(process.cwd(), "data/assessments/level2StarpathIndependentAssessments.ts"), "utf8");
const apiSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/api.ts"), "utf8");
const legacyIds = new Set((getLevelTwoPosttest().questions ?? []).map((item) => item.id));
const productionPreByYear = getPretestForYearLabel("Year 2", "space");
const productionPreByLevel = getPretestForLevel(2, "space");
const productionPostByYear = getPosttestForYearLabel("Year 2", "space")?.questions ?? [];
const productionPostByLevel = getPosttestForLevel(2, "space")?.questions ?? [];
const expectedPreIds = LEVEL2_STARPATH_INDEPENDENT_PRETEST_ITEMS.map((item) => item.id);
const expectedPostIds = LEVEL2_STARPATH_INDEPENDENT_POSTTEST_ITEMS.map((item) => item.id);
check(!source.includes("activities/starpath/level2"), "Candidate banks import Level 2 lesson or quiz content.");
check(apiSource.includes("level2StarpathIndependentAssessments"), "Production resolver does not import the Year 2 Starpath banks.");
check(JSON.stringify(productionPreByYear.map((item) => item.id)) === JSON.stringify(expectedPreIds), "Year-label Pre-Test route is not live on the independent bank.");
check(JSON.stringify(productionPreByLevel.map((item) => item.id)) === JSON.stringify(expectedPreIds), "Level Pre-Test route is not live on the independent bank.");
check(JSON.stringify(productionPostByYear.map((item) => item.id)) === JSON.stringify(expectedPostIds), "Year-label Post-Test route is not live on the independent bank.");
check(JSON.stringify(productionPostByLevel.map((item) => item.id)) === JSON.stringify(expectedPostIds), "Level Post-Test route is not live on the independent bank.");
check(productionPostByYear.every((item) => !legacyIds.has(item.id)), "Production still resolves a retired quiz-derived Post-Test item.");
check(ASSESSMENT_THRESHOLDS.pretestPassPercent === 85 && ASSESSMENT_THRESHOLDS.posttestPassPercent === 85, "Assessment thresholds must remain 85%.");

console.log(`Year 2 Starpath independent-bank audit: ${passed} passed, ${failures.length} failed.`);
console.log("Forms: 40 items; each 14 manipulated / 6 selected; independent production resolver active.");
console.log("Release status: Version 1.0 PRODUCTION.");
if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
}
