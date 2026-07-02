import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildY2MeasurelandsWeek7Lesson1QuizTasks } from "@/data/activities/year2Measurelands/week7Lesson1";
import { buildY2MeasurelandsWeek7Lesson2QuizTasks } from "@/data/activities/year2Measurelands/week7Lesson2";
import { buildY2MeasurelandsWeek7Lesson3QuizTasks } from "@/data/activities/year2Measurelands/week7Lesson3";

// Measurelands · Level 2 · Week 7 Weekly Quiz — "Calendar Keep"
// 15 questions: 5 from each lesson.
export function buildY2MeasurelandsWeek7QuizTasks(): PracticeTask[] {
  return [
    ...buildY2MeasurelandsWeek7Lesson1QuizTasks(),
    ...buildY2MeasurelandsWeek7Lesson2QuizTasks(),
    ...buildY2MeasurelandsWeek7Lesson3QuizTasks(),
  ];
}
