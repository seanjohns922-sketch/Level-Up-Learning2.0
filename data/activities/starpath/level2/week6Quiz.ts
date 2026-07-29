import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "@/data/activities/starpath/level1/quizUtils";
import { createFollowThePathTaskSet, createChooseTheRouteTaskSet, createSpaceMazeTaskSet } from "./navWeeks";
export function buildLevelTwoWeek6VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(createFollowThePathTaskSet(), createChooseTheRouteTaskSet(), createSpaceMazeTaskSet());
}
