import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { assertWeeklyQuizQuestionCount } from "@/lib/weekly-quiz-contract";
import { repairLabelsTask, typeReferenceTask } from "./gridReference";

export function buildLevelFourWeek4VoyageQuiz(): PracticeTask[] {
  const lessonOne = Array.from({ length: 5 }, (_, index) => typeReferenceTask(index + 7, index + 1, false));
  const lessonTwo = Array.from({ length: 5 }, (_, index) => typeReferenceTask(index + 19, index + 6, true));
  const lessonThree = Array.from({ length: 5 }, (_, index) => repairLabelsTask(index + 31, index + 11));
  return assertWeeklyQuizQuestionCount([...lessonOne, ...lessonTwo, ...lessonThree], "Starpath Level 4 Week 4");
}
