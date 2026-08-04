import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "@/data/activities/starpath/level1/quizUtils";
import { createMeetTheObjectsTaskSet, createFindTheObjectTaskSet, create3DObjectChallengeTaskSet } from "./week1";

export function buildLevelThreeWeek1VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(createMeetTheObjectsTaskSet(), createFindTheObjectTaskSet(), create3DObjectChallengeTaskSet());
}
