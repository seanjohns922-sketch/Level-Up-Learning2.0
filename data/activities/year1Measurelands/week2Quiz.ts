import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildY1MeasurelandsWeek2Lesson1QuizTasks } from "@/data/activities/year1Measurelands/week2Lesson1";
import { buildY1MeasurelandsWeek2Lesson2QuizTasks } from "@/data/activities/year1Measurelands/week2Lesson2";
import { buildY1MeasurelandsWeek2Lesson3QuizTasks } from "@/data/activities/year1Measurelands/week2Lesson3";

// ── Measurelands · Level 1 · Week 2 Weekly Quiz — "Balance Basin" ──
// 15 questions: 5 from each lesson (measure → compare → evaluate fairness).
export function buildY1MeasurelandsWeek2QuizTasks(): PracticeTask[] {
  return [
    ...buildY1MeasurelandsWeek2Lesson1QuizTasks(),
    ...buildY1MeasurelandsWeek2Lesson2QuizTasks(),
    ...buildY1MeasurelandsWeek2Lesson3QuizTasks(),
  ];
}
