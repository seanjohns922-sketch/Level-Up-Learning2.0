import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "@/data/activities/starpath/level1/quizUtils";
import { createFollowThePathTaskSet, createPlanAMissionTaskSet, createTestAndFixTaskSet } from "./navWeeks";
export function buildLevelTwoWeek7VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(createFollowThePathTaskSet(), createPlanAMissionTaskSet(), createTestAndFixTaskSet());
}
