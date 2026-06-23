import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildY1MeasurelandsWeek4Lesson1QuizTasks } from "@/data/activities/year1Measurelands/week4Lesson1";
import { buildY1MeasurelandsWeek4Lesson2QuizTasks } from "@/data/activities/year1Measurelands/week4Lesson2";
import { buildY1MeasurelandsWeek4Lesson3QuizTasks } from "@/data/activities/year1Measurelands/week4Lesson3";

// ── Measurelands · Level 1 · Week 4 Weekly Quiz — "Duration Dunes" ──
// 15 questions: 5 from each lesson (units → compare → sort/classify).
export function buildY1MeasurelandsWeek4QuizTasks(): PracticeTask[] {
  return [
    ...buildY1MeasurelandsWeek4Lesson1QuizTasks(),
    ...buildY1MeasurelandsWeek4Lesson2QuizTasks(),
    ...buildY1MeasurelandsWeek4Lesson3QuizTasks(),
  ];
}
