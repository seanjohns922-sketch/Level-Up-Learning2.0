import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "@/data/activities/starpath/level1/quizUtils";
import { createCountTheSidesTaskSet, createSidesSortTaskSet, createSidesChallengeTaskSet } from "./shapeWeeks";
export function buildLevelTwoWeek2VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(createCountTheSidesTaskSet(), createSidesSortTaskSet(), createSidesChallengeTaskSet())
    .map((task, index) => Object.assign(task, { target: index + 1 }));
}
