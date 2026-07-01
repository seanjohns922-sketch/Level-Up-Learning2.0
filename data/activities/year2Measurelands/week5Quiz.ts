import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildY2MeasurelandsWeek5Lesson1QuizTasks } from "@/data/activities/year2Measurelands/week5Lesson1";
import { buildY2MeasurelandsWeek5Lesson2QuizTasks } from "@/data/activities/year2Measurelands/week5Lesson2";
import { buildY2MeasurelandsWeek5Lesson3QuizTasks } from "@/data/activities/year2Measurelands/week5Lesson3";

// Measurelands · Level 2 · Week 5 Weekly Quiz — "Clock Tower I"
// 15 questions: 5 from each lesson (o'clock → half past → build the time).
export function buildY2MeasurelandsWeek5QuizTasks(): PracticeTask[] {
  return [
    ...buildY2MeasurelandsWeek5Lesson1QuizTasks(),
    ...buildY2MeasurelandsWeek5Lesson2QuizTasks(),
    ...buildY2MeasurelandsWeek5Lesson3QuizTasks(),
  ];
}
