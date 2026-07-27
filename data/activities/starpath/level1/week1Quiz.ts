import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import {
  createCompareTheShapesTaskSet,
  createShapeDetectiveChallengeTaskSet,
  createShapeReviewMissionTaskSet,
} from "./week1Lessons";

function buildFiveQuestions(taskSet: RealmLessonTaskSet): PracticeTask[] {
  return Array.from({ length: 5 }, (_, index) => {
    const activity = taskSet.activities[index % taskSet.activities.length];
    if (!activity) {
      throw new Error("Starpath quiz activity is missing");
    }
    return activity();
  });
}

// Level 1 · Week 1 Voyage Quiz
// Questions 1–5: Shape Disguise Mission
// Questions 6–10: Shape Face-Off
// Questions 11–15: Mystery Shape Rescue
export function buildLevelOneWeek1VoyageQuiz(): PracticeTask[] {
  return [
    ...buildFiveQuestions(createShapeReviewMissionTaskSet()),
    ...buildFiveQuestions(createCompareTheShapesTaskSet()),
    ...buildFiveQuestions(createShapeDetectiveChallengeTaskSet()),
  ];
}
