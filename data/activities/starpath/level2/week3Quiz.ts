import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "@/data/activities/starpath/level1/quizUtils";
import { createOppositeSidesTaskSet, createParallelTracksTaskSet, createParallelChallengeTaskSet } from "./shapeWeeks";
export function buildLevelTwoWeek3VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(createOppositeSidesTaskSet(), createParallelTracksTaskSet(), createParallelChallengeTaskSet())
    .map((task, index) => Object.assign(task, { target: index + 1 }));
}
