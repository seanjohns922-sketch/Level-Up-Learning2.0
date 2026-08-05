import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "@/data/activities/starpath/level1/quizUtils";
import { createExplorerViewTaskSet, createMapExplorerTaskSet, createMapSymbolsTaskSet } from "./week4";

export function buildLevelThreeWeek4VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(createMapSymbolsTaskSet(), createExplorerViewTaskSet(), createMapExplorerTaskSet());
}
