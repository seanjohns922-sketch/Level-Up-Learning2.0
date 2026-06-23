import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildY1MeasurelandsWeek5Lesson1QuizTasks } from "@/data/activities/year1Measurelands/week5Lesson1";
import { buildY1MeasurelandsWeek5Lesson2QuizTasks } from "@/data/activities/year1Measurelands/week5Lesson2";
import { buildY1MeasurelandsWeek5Lesson3QuizTasks } from "@/data/activities/year1Measurelands/week5Lesson3";

// ── Measurelands · Level 1 · Week 5 Weekly Quiz — "Calendar Grove" ──
// 15 questions: 5 from each lesson (days → weeks/months → months/year).
export function buildY1MeasurelandsWeek5QuizTasks(): PracticeTask[] {
  return [
    ...buildY1MeasurelandsWeek5Lesson1QuizTasks(),
    ...buildY1MeasurelandsWeek5Lesson2QuizTasks(),
    ...buildY1MeasurelandsWeek5Lesson3QuizTasks(),
  ];
}
