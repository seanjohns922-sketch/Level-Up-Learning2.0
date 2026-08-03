import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "@/data/activities/starpath/level1/quizUtils";
import { createReadingAMapTaskSet, createWhatIsHereTaskSet, createMapReadingChallengeTaskSet } from "./week4StarMaps";
export function buildLevelTwoWeek5VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(createReadingAMapTaskSet(), createWhatIsHereTaskSet(), createMapReadingChallengeTaskSet());
}
