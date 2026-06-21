import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildMeasurelandsWeek4Lesson1QuizTasks } from "@/data/activities/prepMeasurelands/week4Lesson1";
import { buildMeasurelandsWeek4Lesson2QuizTasks } from "@/data/activities/prepMeasurelands/week4Lesson2";
import { buildMeasurelandsWeek4Lesson3QuizTasks } from "@/data/activities/prepMeasurelands/week4Lesson3";

export function buildMeasurelandsWeek4QuizTasks(): PracticeTask[] {
  return [
    ...buildMeasurelandsWeek4Lesson1QuizTasks(),
    ...buildMeasurelandsWeek4Lesson2QuizTasks(),
    ...buildMeasurelandsWeek4Lesson3QuizTasks(),
  ];
}
