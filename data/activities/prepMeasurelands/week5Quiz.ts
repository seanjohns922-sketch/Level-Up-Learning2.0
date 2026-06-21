import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildMeasurelandsWeek5Lesson1QuizTasks } from "@/data/activities/prepMeasurelands/week5Lesson1";
import { buildMeasurelandsWeek5Lesson2QuizTasks } from "@/data/activities/prepMeasurelands/week5Lesson2";
import { buildMeasurelandsWeek5Lesson3QuizTasks } from "@/data/activities/prepMeasurelands/week5Lesson3";

/** Returns 15 tasks (5 per lesson) for the Week 5 quiz — Daylight Grove.
 *  L1 name the days · L2 order/before/after · L3 weekdays & weekends. */
export function buildMeasurelandsWeek5QuizTasks(): PracticeTask[] {
  return [
    ...buildMeasurelandsWeek5Lesson1QuizTasks(),
    ...buildMeasurelandsWeek5Lesson2QuizTasks(),
    ...buildMeasurelandsWeek5Lesson3QuizTasks(),
  ];
}
