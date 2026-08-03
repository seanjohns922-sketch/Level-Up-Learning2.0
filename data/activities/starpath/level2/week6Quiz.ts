import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "@/data/activities/starpath/level1/quizUtils";
import { createWhatIsHereTaskSet, createNextToTaskSet, createPositionChallengeTaskSet } from "./week4StarMaps";
export function buildLevelTwoWeek6VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(createWhatIsHereTaskSet(), createNextToTaskSet(), createPositionChallengeTaskSet());
}
