import type { PracticeTask } from "@/data/activities/year1/practice-task";
import {
  buildMatchTask,
  finishPictureTask,
  identifyBuildShapesTask,
  spaceMuseumTask,
} from "@/data/activities/starpath/ground/week2Tasks";

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
        ? finishPictureTask(["rocket", "house", "tree", "robot", "moon-buggy"], round, target)
        : identifyBuildShapesTask(["rocket", "house"], round, target)
    );
  }

  for (let round = 0; round < 5; round += 1) {
    target += 1;
    tasks.push(
      round < 3
        ? finishPictureTask(["cat", "rocket", "house"], round, target)
        : buildMatchTask(["cat", "space-station"], round, target)
    );
  }

  for (let round = 0; round < 5; round += 1) {
    target += 1;
    tasks.push(
      round < 3
        ? spaceMuseumTask(round, target)
        : buildMatchTask(["satellite", "alien"], round, target)
    );
  }

  return tasks;
}
