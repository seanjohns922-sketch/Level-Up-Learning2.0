import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildY1MeasurelandsWeek6Lesson1QuizTasks } from "@/data/activities/year1Measurelands/week6Lesson1";
import { buildY1MeasurelandsWeek6Lesson2QuizTasks } from "@/data/activities/year1Measurelands/week6Lesson2";
import { buildY1MeasurelandsWeek6Lesson3QuizTasks } from "@/data/activities/year1Measurelands/week6Lesson3";

// ── Measurelands · Level 1 · Week 6 Weekly Quiz — "Calendar Quest" ──
// 15 questions: 5 from each lesson (find dates → navigate dates → plan events).
export function buildY1MeasurelandsWeek6QuizTasks(): PracticeTask[] {
  return [
    ...buildY1MeasurelandsWeek6Lesson1QuizTasks(),
    ...buildY1MeasurelandsWeek6Lesson2QuizTasks(),
    ...buildY1MeasurelandsWeek6Lesson3QuizTasks(),
  ];
}
