import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildY2MeasurelandsWeek2Lesson1QuizTasks } from "@/data/activities/year2Measurelands/week2Lesson1";
import { buildY2MeasurelandsWeek2Lesson2QuizTasks } from "@/data/activities/year2Measurelands/week2Lesson2";
import { buildY2MeasurelandsWeek2Lesson3QuizTasks } from "@/data/activities/year2Measurelands/week2Lesson3";

// ── Measurelands · Level 2 · Week 2 Weekly Quiz — "Balance Basin" ──
// 15 questions: 5 from each lesson (count → by how many → predict & prove).
export function buildY2MeasurelandsWeek2QuizTasks(): PracticeTask[] {
  return [
    ...buildY2MeasurelandsWeek2Lesson1QuizTasks(),
    ...buildY2MeasurelandsWeek2Lesson2QuizTasks(),
    ...buildY2MeasurelandsWeek2Lesson3QuizTasks(),
  ];
}
