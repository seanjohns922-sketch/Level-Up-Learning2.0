import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { assertWeeklyQuizQuestionCount } from "@/lib/weekly-quiz-contract";

// Draw five questions from a lesson's activity generators, cycling through them.
// Matches the Level 1 Week 1 quiz pattern so every week is graded 5 + 5 + 5.
export function fiveFrom(taskSet: RealmLessonTaskSet): PracticeTask[] {
  return Array.from({ length: 5 }, (_, index) => {
    const activity = taskSet.activities[index % taskSet.activities.length];
    if (!activity) throw new Error("Starpath Level 1 quiz activity is missing");
    return activity();
  });
}

export function fifteenFrom(
  a: RealmLessonTaskSet,
  b: RealmLessonTaskSet,
  c: RealmLessonTaskSet
): PracticeTask[] {
  return assertWeeklyQuizQuestionCount(
    [...fiveFrom(a), ...fiveFrom(b), ...fiveFrom(c)],
    "Starpath lesson quiz composition"
  );
}
