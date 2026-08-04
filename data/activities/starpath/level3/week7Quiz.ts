import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "@/data/activities/starpath/level1/quizUtils";
import { createExplorerChallengeTaskSet, createNavigatorChallengeTaskSet, createRescueMissionTaskSet } from "./week7";

export function buildLevelThreeWeek7VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(createExplorerChallengeTaskSet(), createRescueMissionTaskSet(), createNavigatorChallengeTaskSet());
}
