import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildY2MeasurelandsWeek6Lesson1QuizTasks } from "@/data/activities/year2Measurelands/week6Lesson1";
import { buildY2MeasurelandsWeek6Lesson2QuizTasks } from "@/data/activities/year2Measurelands/week6Lesson2";
import { buildY2MeasurelandsWeek6Lesson3QuizTasks } from "@/data/activities/year2Measurelands/week6Lesson3";

// Measurelands · Level 2 · Week 6 Weekly Quiz — "Clock Tower II"
// 15 questions: 5 from each lesson (quarter past → quarter to → build any time).
export function buildY2MeasurelandsWeek6QuizTasks(): PracticeTask[] {
  return [
    ...buildY2MeasurelandsWeek6Lesson1QuizTasks(),
    ...buildY2MeasurelandsWeek6Lesson2QuizTasks(),
    ...buildY2MeasurelandsWeek6Lesson3QuizTasks(),
  ];
}
