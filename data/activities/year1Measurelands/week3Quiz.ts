import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildY1MeasurelandsWeek3Lesson1QuizTasks } from "@/data/activities/year1Measurelands/week3Lesson1";
import { buildY1MeasurelandsWeek3Lesson2QuizTasks } from "@/data/activities/year1Measurelands/week3Lesson2";
import { buildY1MeasurelandsWeek3Lesson3QuizTasks } from "@/data/activities/year1Measurelands/week3Lesson3";

export function buildY1MeasurelandsWeek3QuizTasks(): PracticeTask[] {
  return [
    ...buildY1MeasurelandsWeek3Lesson1QuizTasks(),
    ...buildY1MeasurelandsWeek3Lesson2QuizTasks(),
    ...buildY1MeasurelandsWeek3Lesson3QuizTasks(),
  ];
}
