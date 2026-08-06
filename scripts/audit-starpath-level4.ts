import assert from "node:assert/strict";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { getStarpathQuizTasks } from "@/data/activities/starpath/ground/week1Quiz";
import { LEVEL_FOUR_LESSON_CONTENT } from "@/data/activities/starpath/level4";
import { isCompositeSolution, type CompositeTask } from "@/data/activities/starpath/level4/composite";
import { runGridRoute, type GridRouteTask } from "@/data/activities/starpath/level4/gridRoute";
import { isSymmetricDesign, type SymmetryTask } from "@/data/activities/starpath/level4/symmetry";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import { ASSESSMENT_THRESHOLDS } from "@/lib/assessment-rules";
import { gridReferenceForCell, isGridReferenceTaskValid, type StarpathGridReferenceTask } from "@/lib/starpath-grid-reference";
import { isPracticeTaskSafe } from "@/lib/task-safety";

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
assert.equal(program.assessments.postTest.unlockAfterLessonId, "y4-space-w8-l3", "Post-Test visibility must remain gated after the final lesson");

console.log("Starpath Level 4 audit passed: 24 lessons, 72 activity generators and 105 quiz questions validated across all 8 weeks.");
