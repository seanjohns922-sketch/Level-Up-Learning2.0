import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "@/data/activities/starpath/level1/quizUtils";
import { createWhichObjectTaskSet, createCompareObjectsTaskSet, createObjectSortTaskSet } from "./week2";

export function buildLevelThreeWeek2VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(createWhichObjectTaskSet(), createCompareObjectsTaskSet(), createObjectSortTaskSet());
}
