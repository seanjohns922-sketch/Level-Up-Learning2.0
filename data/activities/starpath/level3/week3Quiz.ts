import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "@/data/activities/starpath/level1/quizUtils";
import { createBuildTheRoverTaskSet, createChooseBestShapeTaskSet, createSpaceEngineeringTaskSet } from "./week3";

export function buildLevelThreeWeek3VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(createBuildTheRoverTaskSet(), createChooseBestShapeTaskSet(), createSpaceEngineeringTaskSet());
}
