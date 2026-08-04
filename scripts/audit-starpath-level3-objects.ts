import assert from "node:assert/strict";

import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import {
  create3DObjectChallengeTaskSet,
  createFindTheObjectTaskSet,
  createMeetTheObjectsTaskSet,
} from "@/data/activities/starpath/level3/week1";
import {
  createCompareObjectsTaskSet,
  createObjectSortTaskSet,
  createWhichObjectTaskSet,
} from "@/data/activities/starpath/level3/week2";
import {
  createBuildTheRoverTaskSet,
  createChooseBestShapeTaskSet,
  createSpaceEngineeringTaskSet,
} from "@/data/activities/starpath/level3/week3";
import { buildLevelThreeWeek1VoyageQuiz } from "@/data/activities/starpath/level3/week1Quiz";
import { buildLevelThreeWeek2VoyageQuiz } from "@/data/activities/starpath/level3/week2Quiz";
import { buildLevelThreeWeek3VoyageQuiz } from "@/data/activities/starpath/level3/week3Quiz";
import type { PracticeTask, StarpathObjectTask } from "@/data/activities/year1/practice-task";
import { isPracticeTaskSafe } from "@/lib/task-safety";

function generatedTasks(taskSet: RealmLessonTaskSet, count = 18): PracticeTask[] {
  return Array.from({ length: count }, (_, index) => {
    const generator = taskSet.activities[index % taskSet.activities.length];
    assert(generator, `Missing activity generator at index ${index}`);
    return generator();
  });
}

function assertSafe(tasks: readonly PracticeTask[], label: string) {
  tasks.forEach((task, index) => {
    assert.equal(isPracticeTaskSafe(task), true, `${label} generated an unsafe task at position ${index + 1}`);
  });
}

const lessonSets = [
  ["Week 1 Lesson 1", createMeetTheObjectsTaskSet()],
  ["Week 1 Lesson 2", createFindTheObjectTaskSet()],
  ["Week 1 Lesson 3", create3DObjectChallengeTaskSet()],
  ["Week 2 Lesson 1", createWhichObjectTaskSet()],
  ["Week 2 Lesson 2", createCompareObjectsTaskSet()],
  ["Week 2 Lesson 3", createObjectSortTaskSet()],
  ["Week 3 Lesson 1", createBuildTheRoverTaskSet()],
  ["Week 3 Lesson 2", createChooseBestShapeTaskSet()],
  ["Week 3 Lesson 3", createSpaceEngineeringTaskSet()],
] as const;

lessonSets.forEach(([label, taskSet]) => assertSafe(generatedTasks(taskSet), label));

const classificationTasks = generatedTasks(createObjectSortTaskSet(), 12) as StarpathObjectTask[];
classificationTasks.forEach((task) => {
  assert.equal(task.kind, "starpathObject");
  assert.equal(task.mode, "classify", "Week 2 Lesson 3 must classify the complete set");
  if (task.mode !== "classify") return;
  assert.equal(task.scene.length, 5, "Classification should include all five familiar 3D objects");
  assert.equal(Object.keys(task.assignments).length, task.scene.length, "Every object needs one classification");
});

const constructionTasks = generatedTasks(createBuildTheRoverTaskSet(), 12) as StarpathObjectTask[];
let rectangularPrismUsed = false;
constructionTasks.forEach((task) => {
  assert.equal(task.kind, "starpathObject");
  assert.equal(task.mode, "build", "Week 3 Lesson 1 must assemble a complete model");
  if (task.mode !== "build") return;
  assert(task.slots.length >= 3, "A model build must require at least three placed parts");
  rectangularPrismUsed ||= task.slots.some((slot) => slot.correctObjectId === "prism");
  task.slots
    .filter((slot) => slot.id.includes("wheel"))
    .forEach((slot) => assert.equal(slot.correctObjectId, "cylinder", "Rover wheels must be cylinders"));
});
assert.equal(rectangularPrismUsed, true, "Week 3 construction must use a rectangular prism");

const quizzes = [
  ["Week 1 quiz", buildLevelThreeWeek1VoyageQuiz()],
  ["Week 2 quiz", buildLevelThreeWeek2VoyageQuiz()],
  ["Week 3 quiz", buildLevelThreeWeek3VoyageQuiz()],
] as const;

quizzes.forEach(([label, questions]) => {
  assert.equal(questions.length, 15, `${label} must contain exactly 15 questions`);
  assertSafe(questions, label);
});

assert.equal(
  buildLevelThreeWeek3VoyageQuiz().some((task) => task.kind === "starpathObject" && task.mode === "build"),
  false,
  "The weekly quiz must use independent construction decisions, not whole-model lesson interactions"
);

console.log("Starpath Level 3 objects audit passed: 9 lessons and 3 weekly quizzes checked.");
