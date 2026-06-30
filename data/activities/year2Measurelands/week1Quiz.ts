import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildY2MeasurelandsWeek1Lesson1QuizTasks } from "@/data/activities/year2Measurelands/week1Lesson1";
import { buildY2MeasurelandsWeek1Lesson2QuizTasks } from "@/data/activities/year2Measurelands/week1Lesson2";
import { buildY2MeasurelandsWeek1Lesson3QuizTasks } from "@/data/activities/year2Measurelands/week1Lesson3";

// ── Measurelands · Level 2 · Week 1 Weekly Quiz — "Unit Count Canyon" ──
// 15 questions: 5 from each lesson (difference → order → measuring detective).
export function buildY2MeasurelandsWeek1QuizTasks(): PracticeTask[] {
  return [
    ...buildY2MeasurelandsWeek1Lesson1QuizTasks(),
    ...buildY2MeasurelandsWeek1Lesson2QuizTasks(),
    ...buildY2MeasurelandsWeek1Lesson3QuizTasks(),
  ];
}
