import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildY1MeasurelandsWeek1Lesson1QuizTasks } from "@/data/activities/year1Measurelands/week1Lesson1";
import { buildY1MeasurelandsWeek1Lesson2QuizTasks } from "@/data/activities/year1Measurelands/week1Lesson2";
import { buildY1MeasurelandsWeek1Lesson3QuizTasks } from "@/data/activities/year1Measurelands/week1Lesson3";

// ── Measurelands · Level 1 · Week 1 Weekly Quiz — "Length Trail" ──
// 15 questions: 5 from each lesson (measure → compare → evaluate). Reuses the
// lessons' own quiz builders so the quiz mirrors the lesson visuals/scoring.
export function buildY1MeasurelandsWeek1QuizTasks(): PracticeTask[] {
  return [
    ...buildY1MeasurelandsWeek1Lesson1QuizTasks(),
    ...buildY1MeasurelandsWeek1Lesson2QuizTasks(),
    ...buildY1MeasurelandsWeek1Lesson3QuizTasks(),
  ];
}
