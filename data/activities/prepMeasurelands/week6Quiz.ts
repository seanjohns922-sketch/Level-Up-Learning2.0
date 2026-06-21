import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildMeasurelandsWeek6Lesson1QuizTasks } from "@/data/activities/prepMeasurelands/week6Lesson1";
import { buildMeasurelandsWeek6Lesson2QuizTasks } from "@/data/activities/prepMeasurelands/week6Lesson2";
import { buildMeasurelandsWeek6Lesson3QuizTasks } from "@/data/activities/prepMeasurelands/week6Lesson3";

/** Returns 15 tasks (5 per lesson) for the Week 6 quiz — Clockwork Crossing.
 *  L1 times of day · L2 match activities · L3 daily routine. */
export function buildMeasurelandsWeek6QuizTasks(): PracticeTask[] {
  return [
    ...buildMeasurelandsWeek6Lesson1QuizTasks(),
    ...buildMeasurelandsWeek6Lesson2QuizTasks(),
    ...buildMeasurelandsWeek6Lesson3QuizTasks(),
  ];
}
