import type { PracticeTask } from "@/data/activities/year1/practice-task";
import {
  quizBuildMatchTask,
  quizBuildShapesTask,
  quizPositionFindTask,
  quizPositionPictureTask,
  quizPositionWordTask,
} from "@/data/activities/starpath/ground/quizTasks";
import type { StarpathBuildObjectId } from "@/data/activities/starpath/ground/shape-builds";
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
  "space-dog",
  "ufo",
  "astronaut",
  "telescope",
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
    tasks.push(i % 2 === 0 ? quizBuildShapesTask(i, n, BUILD_OBJECTS) : quizBuildMatchTask(i, n, BUILD_OBJECTS));
  }
  for (let i = 0; i < 5; i += 1) {
    n += 1;
    tasks.push(i % 2 === 0 ? quizPositionPictureTask(i, n, RELATIONS) : quizBuildMatchTask(i + 5, n, BUILD_OBJECTS));
  }
  for (let i = 0; i < 5; i += 1) {
    n += 1;
    const step = i % 3;
    tasks.push(
      step === 0
        ? quizPositionWordTask(i, n, POOL)
        : step === 1
          ? quizPositionFindTask(i, n, RELATIONS)
          : quizPositionPictureTask(i + 2, n, RELATIONS)
    );
  }

  return tasks;
}
