import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildY1MeasurelandsWeek7Lesson1QuizTasks } from "@/data/activities/year1Measurelands/week7Lesson1";
import { buildY1MeasurelandsWeek7Lesson2QuizTasks } from "@/data/activities/year1Measurelands/week7Lesson2";
import { buildY1MeasurelandsWeek7Lesson3QuizTasks } from "@/data/activities/year1Measurelands/week7Lesson3";

// ── Measurelands · Level 1 · Week 7 Weekly Quiz — "Time Journey" ──
// 15 questions: 5 from each lesson (yesterday -> today -> tomorrow).
export function buildY1MeasurelandsWeek7QuizTasks(): PracticeTask[] {
  return [
    ...buildY1MeasurelandsWeek7Lesson1QuizTasks(),
    ...buildY1MeasurelandsWeek7Lesson2QuizTasks(),
    ...buildY1MeasurelandsWeek7Lesson3QuizTasks(),
  ];
}
