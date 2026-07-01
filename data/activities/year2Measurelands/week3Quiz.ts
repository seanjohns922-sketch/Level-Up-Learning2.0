import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildY2MeasurelandsWeek3Lesson1QuizTasks } from "@/data/activities/year2Measurelands/week3Lesson1";
import { buildY2MeasurelandsWeek3Lesson2QuizTasks } from "@/data/activities/year2Measurelands/week3Lesson2";
import { buildY2MeasurelandsWeek3Lesson3QuizTasks } from "@/data/activities/year2Measurelands/week3Lesson3";

// Measurelands · Level 2 · Week 3 Weekly Quiz — "Capacity Springs"
// 15 questions: 5 from each lesson (count cups → order capacity → better units).
export function buildY2MeasurelandsWeek3QuizTasks(): PracticeTask[] {
  return [
    ...buildY2MeasurelandsWeek3Lesson1QuizTasks(),
    ...buildY2MeasurelandsWeek3Lesson2QuizTasks(),
    ...buildY2MeasurelandsWeek3Lesson3QuizTasks(),
  ];
}
