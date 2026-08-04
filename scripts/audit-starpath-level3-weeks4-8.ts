import assert from "node:assert/strict";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { LEVEL_THREE_LESSON_CONTENT } from "@/data/activities/starpath/level3/index";
import { fiveFrom } from "@/data/activities/starpath/level1/quizUtils";
import { createFindLandmarkTaskSet, createMapExplorerTaskSet, createMapSymbolsTaskSet } from "@/data/activities/starpath/level3/week4";
import { createDrawCampTaskSet, createMapBuilderTaskSet, createPlaceLandmarksTaskSet } from "@/data/activities/starpath/level3/week5";
import { createMissionControlTaskSet, createObservatoryMissionTaskSet, createTreasureHuntTaskSet } from "@/data/activities/starpath/level3/week6";
import { createExplorerChallengeTaskSet, createNavigatorChallengeTaskSet, createRescueMissionTaskSet } from "@/data/activities/starpath/level3/week7";
import { createFinalMissionTaskSet, createMapMasterTaskSet, createObjectsReviewTaskSet } from "@/data/activities/starpath/level3/week8";
import { buildLevelThreeWeek4VoyageQuiz } from "@/data/activities/starpath/level3/week4Quiz";
import { buildLevelThreeWeek5VoyageQuiz } from "@/data/activities/starpath/level3/week5Quiz";
import { buildLevelThreeWeek6VoyageQuiz } from "@/data/activities/starpath/level3/week6Quiz";
import { buildLevelThreeWeek7VoyageQuiz } from "@/data/activities/starpath/level3/week7Quiz";
import { buildLevelThreePostTestQuestions } from "@/data/activities/starpath/level3/level3PostTest";
import { getStarpathQuizTasks } from "@/data/activities/starpath/ground/week1Quiz";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import { isPracticeTaskSafe } from "@/lib/task-safety";
import { isStarpathMapCreationValid } from "@/lib/starpath-map-create";

type Factory = () => RealmLessonTaskSet;
type MapCreateTask = Extract<PracticeTask, { kind: "starpathMapCreate" }>;

function generated(factory: Factory, count = 15): PracticeTask[] {
  const set = factory();
  return Array.from({ length: count }, (_, index) => set.activities[index % 3]!());
}

function assertValid(task: PracticeTask, label: string) {
  assert.equal(isPracticeTaskSafe(task), true, `${label} generated an unsafe task`);
  if (task.kind === "starpathMapLocate") {
    if (task.mode === "find") assert(task.landmarks.some((item) => item.id === task.correctLandmarkId), `${label} has an invalid landmark answer`);
    else assert(task.options?.some((item) => item.id === task.correctOptionId), `${label} has an invalid map option answer`);
  }
  if (task.kind === "starpathMapRoute" && task.mode === "debug") {
    assert(task.debugSteps?.some((step) => step.id === task.wrongStepId), `${label} has an invalid debug answer`);
  }
}

const DELTA = { above: [-1, 0], below: [1, 0], leftOf: [0, -1], rightOf: [0, 1] } as const;
function assertMapCreateSolvable(task: MapCreateTask, label: string) {
  const offsets = new Map<string, { r: number; c: number }>();
  offsets.set(task.landmarks[0]!.id, { r: 0, c: 0 });
  let changed = true;
  while (changed) {
    changed = false;
    for (const constraint of task.constraints) {
      const [dr, dc] = DELTA[constraint.relation];
      const subject = offsets.get(constraint.subjectId);
      const reference = offsets.get(constraint.referenceId);
      if (!subject && reference) { offsets.set(constraint.subjectId, { r: reference.r + dr, c: reference.c + dc }); changed = true; }
      if (subject && !reference) { offsets.set(constraint.referenceId, { r: subject.r - dr, c: subject.c - dc }); changed = true; }
      if (subject && reference) assert.deepEqual(subject, { r: reference.r + dr, c: reference.c + dc }, `${label} has conflicting constraints`);
    }
  }
  assert.equal(offsets.size, task.landmarks.length, `${label} constraints must connect every landmark`);
  const positions = [...offsets.values()];
  assert.equal(new Set(positions.map(({ r, c }) => `${r}:${c}`)).size, positions.length, `${label} places two landmarks in one cell`);
  const rows = positions.map((item) => item.r);
  const cols = positions.map((item) => item.c);
  assert(Math.max(...rows) - Math.min(...rows) < task.rows, `${label} cannot fit vertically`);
  assert(Math.max(...cols) - Math.min(...cols) < task.cols, `${label} cannot fit horizontally`);
  const minRow = Math.min(...rows);
  const minCol = Math.min(...cols);
  const solution = Object.fromEntries([...offsets].map(([id, cell]) => [id, { r: cell.r - minRow, c: cell.c - minCol }]));
  assert.equal(isStarpathMapCreationValid(task, solution), true, `${label} canonical solution must pass the production validator`);
}

const lessonFactories: Array<[string, Factory]> = [
  ["W4 L1", createMapSymbolsTaskSet], ["W4 L2", createFindLandmarkTaskSet], ["W4 L3", createMapExplorerTaskSet],
  ["W5 L1", createDrawCampTaskSet], ["W5 L2", createPlaceLandmarksTaskSet], ["W5 L3", createMapBuilderTaskSet],
  ["W6 L1", createTreasureHuntTaskSet], ["W6 L2", createObservatoryMissionTaskSet], ["W6 L3", createMissionControlTaskSet],
  ["W7 L1", createExplorerChallengeTaskSet], ["W7 L2", createRescueMissionTaskSet], ["W7 L3", createNavigatorChallengeTaskSet],
  ["W8 L1", createObjectsReviewTaskSet], ["W8 L2", createMapMasterTaskSet], ["W8 L3", createFinalMissionTaskSet],
];

lessonFactories.forEach(([label, factory]) => generated(factory).forEach((task, index) => {
  assertValid(task, `${label} task ${index + 1}`);
  if (task.kind === "starpathMapCreate") assertMapCreateSolvable(task, `${label} task ${index + 1}`);
}));

generated(createObservatoryMissionTaskSet).forEach((task) => {
  assert(task.kind === "starpathMapRoute" && task.goal.label === "Observatory", "Week 6 Lesson 2 must route to the Observatory");
});
const objectReviewModes = generated(createObjectsReviewTaskSet)
  .filter((task) => task.kind === "starpathObject")
  .map((task) => task.mode);
for (const mode of ["name", "compare", "classify", "build", "find"] as const) {
  assert(objectReviewModes.includes(mode), `Week 8 object review must include ${mode} tasks`);
}

const quizSpecs: Array<[number, () => PracticeTask[], [Factory, Factory, Factory]]> = [
  [4, buildLevelThreeWeek4VoyageQuiz, [createMapSymbolsTaskSet, createFindLandmarkTaskSet, createMapExplorerTaskSet]],
  [5, buildLevelThreeWeek5VoyageQuiz, [createDrawCampTaskSet, createPlaceLandmarksTaskSet, createMapBuilderTaskSet]],
  [6, buildLevelThreeWeek6VoyageQuiz, [createTreasureHuntTaskSet, createObservatoryMissionTaskSet, createMissionControlTaskSet]],
  [7, buildLevelThreeWeek7VoyageQuiz, [createExplorerChallengeTaskSet, createRescueMissionTaskSet, createNavigatorChallengeTaskSet]],
];

quizSpecs.forEach(([week, build, factories]) => {
  const quiz = build();
  assert.equal(quiz.length, 15, `Week ${week} quiz must contain 15 questions`);
  factories.forEach((factory, lessonIndex) => assert.deepEqual(quiz.slice(lessonIndex * 5, lessonIndex * 5 + 5), fiveFrom(factory()), `Week ${week} quiz Lesson ${lessonIndex + 1} must contribute exactly five questions`));
  quiz.forEach((task, index) => assertValid(task, `Week ${week} quiz question ${index + 1}`));
  assert.deepEqual(getStarpathQuizTasks("level-3", week), quiz, `Week ${week} dispatcher must return the registered quiz`);
});

const program = getStarpathProgram("level-3");
assert.equal(Object.keys(LEVEL_THREE_LESSON_CONTENT).length, 24, "Level 3 must register all 24 lessons");
assert(program.weeks.every((week) => week.lessons.every((lesson) => lesson.status === "implemented")), "Every Level 3 lesson must be implemented");
assert(program.weeks.slice(0, 7).every((week) => week.quiz?.status === "implemented"), "Weeks 1-7 quizzes must be implemented");
assert.equal(program.weeks[7]?.quiz, null, "Week 8 must use the post-test instead of a weekly quiz");
assert.equal(getStarpathQuizTasks("level-3", 8), null, "Week 8 must not dispatch a weekly quiz");
assert.equal(program.assessments.postTest.status, "implemented", "Level 3 post-test must be implemented");

const posttest = buildLevelThreePostTestQuestions();
assert.equal(posttest.length, 20, "Level 3 post-test must contain 20 questions");
assert.equal(new Set(posttest.map((question) => question.id)).size, 20, "Post-test question ids must be unique");
posttest.forEach((question, index) => {
  assert(question.practiceTask, `Post-test question ${index + 1} needs an interactive task`);
  assertValid(question.practiceTask, `Post-test question ${index + 1}`);
  if (question.practiceTask.kind === "starpathMapCreate") assertMapCreateSolvable(question.practiceTask, `Post-test question ${index + 1}`);
});

console.log("Starpath Level 3 Weeks 4-8 audit passed: 15 lessons, 4 weekly quizzes (5-5-5), and 20 post-test questions checked.");
