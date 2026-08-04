import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "@/data/activities/starpath/level1/quizUtils";
import { createDrawCampTaskSet, createMapBuilderTaskSet, createPlaceLandmarksTaskSet } from "./week5";

export function buildLevelThreeWeek5VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(createDrawCampTaskSet(), createPlaceLandmarksTaskSet(), createMapBuilderTaskSet());
}
