import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { assertWeeklyQuizQuestionCount } from "@/lib/weekly-quiz-contract";
import { authorRouteTask, checkpointRouteTask, compareGridRouteTask, debugGridRouteTask, missingReferenceTask, traceRouteTask } from "./gridRoute";

export function buildLevelFourWeek5VoyageQuiz(): PracticeTask[] {
  const lessonOne = Array.from({ length: 5 }, (_, i) => (i % 2 ? missingReferenceTask : traceRouteTask)(i + 41, i + 1));
  const lessonTwo = Array.from({ length: 5 }, (_, i) => (i % 2 ? checkpointRouteTask : authorRouteTask)(i + 53, i + 6));
  const lessonThree = Array.from({ length: 5 }, (_, i) => (i % 2 ? compareGridRouteTask : debugGridRouteTask)(i + 67, i + 11));
  return assertWeeklyQuizQuestionCount([...lessonOne, ...lessonTwo, ...lessonThree], "Starpath Level 4 Week 5");
}
