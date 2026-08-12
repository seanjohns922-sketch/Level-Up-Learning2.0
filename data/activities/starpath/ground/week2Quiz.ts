import type { PracticeTask } from "@/data/activities/year1/practice-task";
import {
  quizBuildMatchTask,
  quizBuildShapesTask,
  quizShapeReasonTask,
} from "@/data/activities/starpath/ground/quizTasks";

// Ground Level · Week 2 Voyage Quiz — 15 questions, 5 from each lesson.
//   L1 Build with Shapes : finish pictures + identify their shapes
//   L2 Shape Creators    : finish pictures + match completed builds
//   L3 Space Builders    : reason about shapes in completed constructions
export function buildGroundWeek2VoyageQuiz(): PracticeTask[] {
  const tasks: PracticeTask[] = [];
  let target = 0;

  for (let round = 0; round < 5; round += 1) {
    target += 1;
    tasks.push(
      round < 3
        ? quizBuildShapesTask(round, target, ["rocket", "house", "tree", "robot", "moon-buggy"])
        : quizBuildMatchTask(round, target, ["rocket", "house", "tree", "robot", "moon-buggy"])
    );
  }

  for (let round = 0; round < 5; round += 1) {
    target += 1;
    tasks.push(
      round < 3
        ? quizBuildMatchTask(round + 3, target, ["cat", "rocket", "house", "space-station"])
        : quizBuildShapesTask(round + 3, target, ["cat", "rocket", "house", "space-station"])
    );
  }

  for (let round = 0; round < 5; round += 1) {
    target += 1;
    tasks.push(
      round < 3
        ? quizShapeReasonTask(round, target)
        : quizBuildMatchTask(round + 7, target, ["satellite", "alien", "ufo", "telescope"])
    );
  }

  return tasks;
}
