import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { StarpathBuildObjectId } from "@/data/activities/starpath/ground/shape-builds";
import {
  buildMatchTask,
  finishPictureTask,
  identifyBuildShapesTask,
} from "@/data/activities/starpath/ground/week2Tasks";
import { findItTask, sayWhereTask, whichPictureTask } from "@/data/activities/starpath/ground/week4Tasks";
import type { PositionRelation } from "@/data/activities/starpath/ground/position-objects";

const BUILD_OBJECTS: StarpathBuildObjectId[] = [
  "rocket",
  "house",
  "tree",
  "robot",
  "cat",
  "planet",
  "satellite",
  "alien",
  "moon-buggy",
  "space-station",
];
const RELATIONS: PositionRelation[] = ["above", "below", "beside", "behind", "inside"];
const POOL: PositionRelation[] = ["above", "below", "beside", "behind", "in-front", "inside"];

// Ground Level · Week 7 Voyage Quiz — 15 questions, 5 from each lesson, using
// single-answer graded tasks (shape building + reasoning + position).
//   L1 Build a Planet        : finish the picture / name the shapes
//   L2 Create a Space Scene  : which scene / match the build
//   L3 Describe Your Picture : say where / find it / scene reasoning
export function buildGroundWeek7VoyageQuiz(): PracticeTask[] {
  const tasks: PracticeTask[] = [];
  let n = 0;

  for (let i = 0; i < 5; i += 1) {
    n += 1;
    tasks.push(i % 2 === 0 ? finishPictureTask(BUILD_OBJECTS, i, n) : identifyBuildShapesTask(BUILD_OBJECTS, i, n));
  }
  for (let i = 0; i < 5; i += 1) {
    n += 1;
    tasks.push(i % 2 === 0 ? whichPictureTask(i, n, RELATIONS) : buildMatchTask(BUILD_OBJECTS, i, n));
  }
  for (let i = 0; i < 5; i += 1) {
    n += 1;
    const step = i % 3;
    tasks.push(
      step === 0 ? sayWhereTask(i, n, RELATIONS, POOL) : step === 1 ? findItTask(i, n, RELATIONS) : whichPictureTask(i + 2, n, RELATIONS)
    );
  }

  return tasks;
}
