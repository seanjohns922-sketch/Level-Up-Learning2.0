import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildMeasurelandsWeek7Lesson1QuizTasks } from "@/data/activities/prepMeasurelands/week7Lesson1";
import { buildMeasurelandsWeek7Lesson2QuizTasks } from "@/data/activities/prepMeasurelands/week7Lesson2";
import { buildMeasurelandsWeek7Lesson3QuizTasks } from "@/data/activities/prepMeasurelands/week7Lesson3";

/** Returns 15 tasks (5 per lesson) for the Week 7 quiz — Calendar Keep.
 *  L1 today · L2 yesterday & tomorrow · L3 what day comes next. */
export function buildMeasurelandsWeek7QuizTasks(): PracticeTask[] {
  return [
    ...buildMeasurelandsWeek7Lesson1QuizTasks(),
    ...buildMeasurelandsWeek7Lesson2QuizTasks(),
    ...buildMeasurelandsWeek7Lesson3QuizTasks(),
  ];
}
