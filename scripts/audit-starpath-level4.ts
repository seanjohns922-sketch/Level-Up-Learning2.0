import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { getStarpathQuizTasks } from "@/data/activities/starpath/ground/week1Quiz";
import { LEVEL_FOUR_LESSON_CONTENT } from "@/data/activities/starpath/level4";
import { isCompositeSolution, type CompositeTask } from "@/data/activities/starpath/level4/composite";
import { runGridRoute, type GridRouteTask } from "@/data/activities/starpath/level4/gridRoute";
import { isSymmetricDesign, type SymmetryTask } from "@/data/activities/starpath/level4/symmetry";
import { isAssessmentAnswerCorrect } from "@/data/assessments/analysis";
import { getPosttestForLevel, getPosttestForYearLabel, getPretestForLevel, getPretestForYearLabel } from "@/data/assessments/api";
import type { IndependentAssessmentItem } from "@/data/assessments/assessmentItemStandard";
import {
  LEVEL4_STARPATH_INDEPENDENT_POSTTEST_ITEMS,
  LEVEL4_STARPATH_INDEPENDENT_PRETEST_ITEMS,
} from "@/data/assessments/level4StarpathIndependentAssessments";
import type { Question } from "@/data/assessments/posttests";
import { STARPATH_ASSESSMENT_BLUEPRINTS } from "@/data/assessments/starpathAssessmentBlueprint";
import { STARPATH_MISCONCEPTION_LIBRARY } from "@/data/assessments/starpathMisconceptions";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import { ASSESSMENT_THRESHOLDS } from "@/lib/assessment-rules";
import { gridReferenceForCell, isGridReferenceTaskValid, type StarpathGridReferenceTask } from "@/lib/starpath-grid-reference";
import { isPracticeTaskSafe } from "@/lib/task-safety";

type Candidate = Question & IndependentAssessmentItem;

function assertInBounds(rows: number, cols: number, cells: Array<{ r: number; c: number }>, label: string) {
  cells.forEach((cell) => assert(cell.r >= 0 && cell.r < rows && cell.c >= 0 && cell.c < cols, `${label} contains an out-of-bounds cell`));
}

function assertTask(task: PracticeTask, label: string) {
  assert.equal(isPracticeTaskSafe(task), true, `${label} must be supported by the production renderer`);
  assert("prompt" in task && typeof task.prompt === "string" && task.prompt.trim().length > 0, `${label} needs a prompt`);
  if (task.kind === "starpathGridReference") {
    assert.equal(isGridReferenceTaskValid(task), true, `${label} violates the grid-reference contract`);
    return;
  }
  if (task.kind === "starpathGridRoute") {
    assertInBounds(task.rows, task.cols, [task.start, task.goal, ...(task.blocked ?? []), ...(task.checkpoints ?? [])], label);
    if (task.route) {
      const result = runGridRoute(task, task.route);
      assert.equal(result.valid, true, `${label} supplied route must reach its goal`);
      if (task.expectedReference) assert.equal(task.expectedReference, gridReferenceForCell(task, result.position), `${label} final reference must match route replay`);
    }
    if (task.routeOptions) {
      const valid = task.routeOptions.filter((option) => runGridRoute(task, option.route).valid);
      assert.equal(valid.length, 1, `${label} must have exactly one valid route option`);
      assert.equal(valid[0]?.id, task.correctOptionId, `${label} correct route option must match simulation`);
    }
    assert(!/coordinate|cartesian|axis|origin|ordered pair/i.test(`${task.prompt} ${task.speakText} ${task.rule}`), `${label} leaks Year 5 coordinate language`);
    return;
  }
  if (task.kind === "starpathComposite") {
    if (task.figure) {
      // Figure build: every socket must be fillable from the shape palette.
      assert(task.figure.parts.length >= 3, `${label} composite figure needs at least three parts`);
      const palette = new Set(task.buildPalette ?? []);
      assert(palette.size >= 2, `${label} composite build needs a shape palette`);
      task.figure.parts.forEach((part) => assert(palette.has(part.shape), `${label} part "${part.id}" shape must be offered in the palette`));
      return;
    }
    if (task.figureOptions?.length) {
      assert.equal(task.figureOptions.length, 2, `${label} compare must show two figures`);
      assert(task.figureOptions.some((option) => option.id === task.correctOptionId), `${label} correct figure must be one of the options`);
      assert(task.correctReasonId && (task.reasonOptions ?? []).some((reason) => reason.id === task.correctReasonId), `${label} compare requires a linked reason`);
      return;
    }
    if (task.figureSvg) {
      assert((task.options ?? []).some((option) => option.id === task.correctOptionId), `${label} scan requires a correct option`);
      return;
    }
    // Legacy cube board (Week 2 solid / views / hidden).
    const solutions = task.validSolutions ?? [];
    assert(solutions.length > 0, `${label} must declare at least one solution`);
    assertInBounds(task.rows ?? 0, task.cols ?? 0, task.targetCells ?? [], label);
    solutions.forEach((solution, index) => {
      assertInBounds(task.rows ?? 0, task.cols ?? 0, solution, `${label} solution ${index + 1}`);
      assert.equal(isCompositeSolution(task, solution), true, `${label} declared solution ${index + 1} must validate`);
    });
    return;
  }
  if (task.kind === "starpathSymmetry") {
    assertInBounds(task.size, task.size, [...task.seedCells, ...task.expectedCells], label);
    assert.equal(isSymmetricDesign(task, task.expectedCells), true, `${label} canonical design must pass its stated transform`);
    if (!task.options && task.mode !== "create") {
      const nearMiss = task.expectedCells.slice(0, -1);
      assert.equal(isSymmetricDesign(task, nearMiss), false, `${label} controlled near-miss must fail`);
    }
  }
}

const counts = (values: readonly string[]) => values.reduce<Record<string, number>>((result, value) => {
  result[value] = (result[value] ?? 0) + 1;
  return result;
}, {});

function assertSameCounts(actual: Record<string, number>, expected: Record<string, number>, label: string) {
  const keys = new Set([...Object.keys(actual), ...Object.keys(expected)]);
  for (const key of keys) assert.equal(actual[key] ?? 0, expected[key] ?? 0, `${label}: expected ${key}=${expected[key] ?? 0}, received ${actual[key] ?? 0}`);
}

function assertAssessmentBank(
  kind: "pretest" | "posttest",
  bank: readonly Candidate[],
  expectedDifficulty: Record<string, number>,
  expectedCognitive: Record<string, number>,
) {
  assert.equal(bank.length, 20, `Level 4 ${kind} must contain 20 items`);
  assert.equal(new Set(bank.map((item) => item.id)).size, 20, `Level 4 ${kind} IDs must be unique`);
  assert.equal(new Set(bank.map((item) => item.prompt)).size, 20, `Level 4 ${kind} prompts must be unique`);
  assert.equal(new Set(bank.map((item) => item.contextKey)).size, 20, `Level 4 ${kind} contexts must be unique`);
  assert.equal(new Set(bank.map((item) => item.structureKey)).size, 20, `Level 4 ${kind} structures must be unique`);
  assertSameCounts(counts(bank.map((item) => item.primaryDescriptorCode)), { AC9M4SP01: 7, AC9M4SP02: 6, AC9M4SP03: 7 }, `Level 4 ${kind} descriptor allocation`);
  assertSameCounts(counts(bank.map((item) => item.difficulty)), expectedDifficulty, `Level 4 ${kind} difficulty mix`);
  assertSameCounts(counts(bank.map((item) => item.cognitiveCategory)), expectedCognitive, `Level 4 ${kind} cognitive mix`);
  assertSameCounts(counts(bank.map((item) => item.responseMode)), { selected_response: 3, manipulated_response: 17 }, `Level 4 ${kind} response mix`);

  const misconceptionById = new Map(STARPATH_MISCONCEPTION_LIBRARY.map((item) => [item.id, item]));
  for (const item of bank) {
    assert.equal(item.version, "1.0.0", `${item.id} must declare release metadata`);
    assert.equal(item.bankId, `starpath-level-4-${kind}-v1`, `${item.id} bank ID mismatch`);
    assert.equal(item.realm, "space", `${item.id} realm mismatch`);
    assert.equal(item.level, 4, `${item.id} level mismatch`);
    assert.equal(item.form, kind, `${item.id} form mismatch`);
    assert.equal(item.origin, "assessment_authored", `${item.id} must be authored assessment content`);
    assert.equal(item.sourcePool, kind, `${item.id} source pool mismatch`);
    assert.equal(item.renderer.type, "starpath_assessment_task", `${item.id} is not launchable through the Starpath renderer`);
    assert.equal(item.type, "starpathTask", `${item.id} must use the Starpath assessment question type`);
    assert.equal(item.scoring.kind, "interaction", `${item.id} must use interaction scoring`);
    assert.equal(isAssessmentAnswerCorrect(item, item.correctAnswer), true, `${item.id} rejects the correct interaction token`);
    assert.equal(isAssessmentAnswerCorrect(item, `incorrect:${item.id}`), false, `${item.id} accepts an incorrect interaction token`);
    assert.equal(item.statistics.calibrationStatus, "uncalibrated", `${item.id} must start uncalibrated`);
    assert.equal(item.statistics.sampleSize, 0, `${item.id} must start with no calibration samples`);
    assert.equal(item.curriculumLessonMapping.length, 1, `${item.id} must map to one curriculum lesson`);
    assert(item.descriptorCodes.includes(item.primaryDescriptorCode), `${item.id} descriptor metadata is inconsistent`);
    assert(item.misconceptionTags.length > 0, `${item.id} needs misconception metadata`);
    assert(item.misconceptionTags.every((tag) => misconceptionById.get(tag)?.descriptorCodes.includes(item.primaryDescriptorCode)), `${item.id} has a misconception tag outside its descriptor`);
    assert.equal(item.isTransfer, item.cognitiveCategory === "transfer", `${item.id} transfer flag mismatch`);
    assert.equal(item.requiresReasoning, item.cognitiveCategory === "reasoning" || item.cognitiveCategory === "transfer", `${item.id} reasoning flag mismatch`);
    assert(item.practiceTask, `${item.id} must expose a practice task`);
    assertTask(item.practiceTask, item.id);
    assert("feedback" in item.practiceTask && item.practiceTask.feedback?.correct === item.practiceTask.feedback?.wrong, `${item.id} feedback must not reveal correctness`);
  }
}

const lessonIds = Object.keys(LEVEL_FOUR_LESSON_CONTENT).sort();
assert.equal(lessonIds.length, 24, "Level 4 must expose all 24 lessons");
for (let week = 1; week <= 8; week += 1) {
  for (let lesson = 1; lesson <= 3; lesson += 1) {
    const id = `y4-space-w${week}-l${lesson}`;
    const content = LEVEL_FOUR_LESSON_CONTENT[id];
    assert(content, `${id} must have playable lesson content`);
    const set = content.createTaskSet();
    assert(set.teaching(), `${id} must build a teaching task`);
    assert.equal(set.activities.length, 3, `${id} must have three activity generators`);
    set.activities.forEach((generator, index) => {
      for (let sample = 0; sample < 6; sample += 1) {
        const task = generator();
        assertTask(task, `${id} activity ${index + 1} sample ${sample + 1}`);
        assert(content.activities[index]!.taskKinds.includes(task.kind), `${id} activity ${index + 1} metadata must declare ${task.kind}`);
      }
    });
  }
}

for (let week = 1; week <= 7; week += 1) {
  const quiz = getStarpathQuizTasks("level-4", week);
  assert(quiz, `Level 4 Week ${week} quiz must resolve through production dispatcher`);
  assert.equal(quiz.length, 15, `Level 4 Week ${week} quiz must contain exactly 15 questions`);
  assert.deepEqual(quiz.map((task) => "target" in task ? task.target : null), Array.from({ length: 15 }, (_, index) => index + 1), `Level 4 Week ${week} must retain the 5-5-5 target allocation`);
  quiz.forEach((task, index) => assertTask(task, `Week ${week} quiz question ${index + 1}`));
  const identities = quiz.map((task) => task.kind === "starpathGridReference" || task.kind === "starpathGridRoute" ? task.mapId : task.kind === "starpathComposite" ? `comp-${task.mode}-${task.target}` : task.kind === "starpathSymmetry" ? task.boardId : `${task.kind}-${"target" in task ? task.target : 0}`);
  assert.equal(new Set(identities).size, 15, `Level 4 Week ${week} quiz item identities must be unique`);
}

assert.equal(ASSESSMENT_THRESHOLDS.weeklyQuizPassPercent, 80, "Weekly quiz pass threshold must remain 80%");
assert.equal(getStarpathQuizTasks("level-4", 8), null, "Week 8 must not resolve a weekly quiz");
const program = getStarpathProgram("level-4");
assert.equal(program.status, "implemented", "Level 4 program content must be implemented");
assert(program.weeks.every((week) => week.status === "implemented"), "Every Level 4 week must be implemented");
assert(program.weeks.flatMap((week) => week.lessons).every((lesson) => lesson.status === "implemented"), "Every Level 4 lesson must be implemented");
assert(program.weeks.slice(0, 7).every((week) => week.quiz?.status === "implemented"), "Weeks 1-7 quizzes must be implemented");
assert.equal(program.weeks[7]?.quiz, null, "Final week must not attempt to unlock a non-existent quiz or Week 9");
assert.equal(program.assessments.preTest?.status, "implemented", "Level 4 Pre-Test must be implemented");
assert.equal(program.assessments.preTest?.questionCount, 20, "Level 4 Pre-Test must advertise 20 items");
assert.equal(program.assessments.postTest.status, "implemented", "Level 4 Post-Test must be implemented");
assert.equal(program.assessments.postTest.questionCount, 20, "Level 4 Post-Test must advertise 20 items");
assert.equal(program.assessments.postTest.unlockAfterLessonId, "y4-space-w8-l3", "Post-Test visibility must remain gated after the final lesson");

const blueprint = STARPATH_ASSESSMENT_BLUEPRINTS.find((item) => item.level === 4);
assert(blueprint, "Year 4 Starpath blueprint is missing");
assert(blueprint.descriptors.every((item) => item.curriculumMapping.implementationStatus === "aligned"), "Year 4 blueprint must be curriculum-aligned");
assertAssessmentBank("pretest", LEVEL4_STARPATH_INDEPENDENT_PRETEST_ITEMS as readonly Candidate[], { easy: 6, moderate: 10, challenging: 4 }, { recall: 2, understanding: 5, application: 7, reasoning: 5, transfer: 1 });
assertAssessmentBank("posttest", LEVEL4_STARPATH_INDEPENDENT_POSTTEST_ITEMS as readonly Candidate[], { easy: 4, moderate: 9, challenging: 7 }, { recall: 1, understanding: 4, application: 7, reasoning: 6, transfer: 2 });

const expectedPreIds = LEVEL4_STARPATH_INDEPENDENT_PRETEST_ITEMS.map((item) => item.id);
const expectedPostIds = LEVEL4_STARPATH_INDEPENDENT_POSTTEST_ITEMS.map((item) => item.id);
assert.deepEqual(getPretestForYearLabel("Year 4", "space").map((item) => item.id), expectedPreIds, "Year 4 Starpath Pre-Test must resolve through the year API");
assert.deepEqual(getPretestForLevel(4, "space").map((item) => item.id), expectedPreIds, "Level 4 Starpath Pre-Test must resolve through the level API");
assert.deepEqual((getPosttestForYearLabel("Year 4", "space")?.questions ?? []).map((item) => item.id), expectedPostIds, "Year 4 Starpath Post-Test must resolve through the year API");
assert.deepEqual((getPosttestForLevel(4, "space")?.questions ?? []).map((item) => item.id), expectedPostIds, "Level 4 Starpath Post-Test must resolve through the level API");
assert.equal(ASSESSMENT_THRESHOLDS.pretestPassPercent, 85, "Pre-Test pass threshold must remain 85%");
assert.equal(ASSESSMENT_THRESHOLDS.posttestPassPercent, 85, "Post-Test pass threshold must remain 85%");

const bankSource = fs.readFileSync(path.join(process.cwd(), "data/assessments/level4StarpathIndependentAssessments.ts"), "utf8");
assert(!bankSource.includes("LEVEL_FOUR_LESSON_CONTENT") && !/week[1-8]Quiz|getStarpathQuizTasks/.test(bankSource), "Level 4 assessment banks must not import lesson or weekly quiz content");

console.log("Starpath Level 4 audit passed: 24 lessons, 72 activity generators, 105 quiz questions and 40 independent assessment items validated.");
