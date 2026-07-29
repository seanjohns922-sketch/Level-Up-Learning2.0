import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "@/data/activities/starpath/level1/quizUtils";
import { createStraightOrCurvedTaskSet, createSortByEdgeTaskSet, createEdgeChallengeTaskSet } from "./shapeWeeks";
export function buildLevelTwoWeek1VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(createStraightOrCurvedTaskSet(), createSortByEdgeTaskSet(), createEdgeChallengeTaskSet());
}
