import type { PracticeTask } from "@/data/activities/year1/practice-task";
import {
  compareShapeTask,
  oddShapeTask,
  twinMatchTask,
  whatChangedTask,
} from "@/data/activities/starpath/ground/week3Tasks";

// Ground Level · Week 3 Voyage Quiz — 15 questions, 5 from each lesson, using
// single-answer graded tasks only (so every question is pass/fail).
//   L1 Shape Families    : which shape does not belong to the family
//   L2 Same or Different : compare / find the twin / what changed
//   L3 Shape Challenge   : a cumulative mix of the week's graded skills
export function buildGroundWeek3VoyageQuiz(): PracticeTask[] {
  const tasks: PracticeTask[] = [];
  let n = 0;

  // Lesson 1 — 5 questions (odd one out of a shape family)
  for (let i = 0; i < 5; i += 1) {
    n += 1;
    tasks.push(oddShapeTask(i, n));
  }

  // Lesson 2 — 5 questions (compare / twin / what changed, cycling)
  for (let i = 0; i < 5; i += 1) {
    n += 1;
    const step = i % 3;
    tasks.push(
      step === 0 ? compareShapeTask(i, n) : step === 1 ? twinMatchTask(i, n) : whatChangedTask(i, n)
    );
  }

  // Lesson 3 — 5 questions (cumulative: recognise, compare, explain)
  for (let i = 0; i < 5; i += 1) {
    n += 1;
    const step = i % 4;
    tasks.push(
      step === 0
        ? oddShapeTask(i + 5, n)
        : step === 1
          ? compareShapeTask(i + 5, n)
          : step === 2
            ? twinMatchTask(i + 5, n)
            : whatChangedTask(i + 5, n)
    );
  }

  return tasks;
}
