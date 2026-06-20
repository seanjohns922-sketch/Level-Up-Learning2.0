import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildMeasurelandsWeek3Lesson1QuizTasks } from "@/data/activities/prepMeasurelands/week3Lesson1";
import { buildMeasurelandsWeek3Lesson2QuizTasks } from "@/data/activities/prepMeasurelands/week3Lesson2";
import { buildMeasurelandsWeek3Lesson3QuizTasks } from "@/data/activities/prepMeasurelands/week3Lesson3";

/** Returns 15 tasks (5 per lesson) for the Week 3 quiz — Capacity Springs.
 *  L1 compare · L2 order · L3 describe fill states. */
export function buildMeasurelandsWeek3QuizTasks(): PracticeTask[] {
  return [
    ...buildMeasurelandsWeek3Lesson1QuizTasks(),
    ...buildMeasurelandsWeek3Lesson2QuizTasks(),
    ...buildMeasurelandsWeek3Lesson3QuizTasks(),
  ];
}
