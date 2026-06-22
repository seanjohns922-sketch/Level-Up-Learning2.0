import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildMeasurelandsWeek8Lesson1QuizTasks } from "@/data/activities/prepMeasurelands/week8Lesson1";
import { buildMeasurelandsWeek8Lesson2QuizTasks } from "@/data/activities/prepMeasurelands/week8Lesson2";
import { buildMeasurelandsWeek8Lesson3QuizTasks } from "@/data/activities/prepMeasurelands/week8Lesson3";

/** Returns 15 tasks (5 per lesson) for the Week 8 quiz — Timewielder Trial.
 *  A mixed-measurement finale across Weeks 1-7. */
export function buildMeasurelandsWeek8QuizTasks(): PracticeTask[] {
  return [
    ...buildMeasurelandsWeek8Lesson1QuizTasks(),
    ...buildMeasurelandsWeek8Lesson2QuizTasks(),
    ...buildMeasurelandsWeek8Lesson3QuizTasks(),
  ];
}
