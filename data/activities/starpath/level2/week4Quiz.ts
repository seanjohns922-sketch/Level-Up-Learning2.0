import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "@/data/activities/starpath/level1/quizUtils";
import { createSameFeatureTaskSet, createWhatIsDifferentTaskSet, createCompareChallengeTaskSet } from "./shapeWeeks";
export function buildLevelTwoWeek4VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(createSameFeatureTaskSet(), createWhatIsDifferentTaskSet(), createCompareChallengeTaskSet())
    .map((task, index) => Object.assign(task, { target: index + 1 }));
}
