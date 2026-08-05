import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "@/data/activities/starpath/level1/quizUtils";
import { createWhichWayTaskSet, createFirstMoveTaskSet, createDriveRoverTaskSet } from "./week6";

export function buildLevelThreeWeek6VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(createWhichWayTaskSet(), createFirstMoveTaskSet(), createDriveRoverTaskSet());
}
