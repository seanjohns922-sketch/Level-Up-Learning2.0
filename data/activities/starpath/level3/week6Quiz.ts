import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "@/data/activities/starpath/level1/quizUtils";
import { createMissionControlTaskSet, createObservatoryMissionTaskSet, createTreasureHuntTaskSet } from "./week6";

export function buildLevelThreeWeek6VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(createTreasureHuntTaskSet(), createObservatoryMissionTaskSet(), createMissionControlTaskSet());
}
