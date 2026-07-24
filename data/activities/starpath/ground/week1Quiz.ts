import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { shapeMatchTask, shapeNameTask } from "@/data/activities/starpath/ground/week1Lesson1";
import { objectMatchTask, shapeExplorerTask } from "@/data/activities/starpath/ground/week1Lesson2";
import { oddOneOutTask } from "@/data/activities/starpath/ground/week1Lesson3";
import { buildGroundWeek2VoyageQuiz } from "@/data/activities/starpath/ground/week2Quiz";
import { buildGroundWeek3VoyageQuiz } from "@/data/activities/starpath/ground/week3Quiz";
import { buildGroundWeek4VoyageQuiz } from "@/data/activities/starpath/ground/week4Quiz";
import { buildGroundWeek5VoyageQuiz } from "@/data/activities/starpath/ground/week5Quiz";
import { buildGroundWeek6VoyageQuiz } from "@/data/activities/starpath/ground/week6Quiz";
import { buildGroundWeek7VoyageQuiz } from "@/data/activities/starpath/ground/week7Quiz";

// Ground Level · Week 1 Voyage Quiz — 15 questions, 5 from each lesson, using
// single-answer shape tasks only (so every question is graded pass/fail).
//   L1 Meet the Shapes  : recognise + name
//   L2 Shape Detectives : shape-in-object + find-in-scene
//   L3 Shape Masters    : odd one out
export function buildGroundWeek1VoyageQuiz(): PracticeTask[] {
  const tasks: PracticeTask[] = [];
  let n = 0;

  // Lesson 1 — 5 questions (alternating recognise / name)
  for (let i = 0; i < 5; i += 1) {
    n += 1;
    tasks.push(i % 2 === 0 ? shapeMatchTask(i, n) : shapeNameTask(i, n));
  }

  // Lesson 2 — 5 questions (alternating object-shape / find-in-scene)
  for (let i = 0; i < 5; i += 1) {
    n += 1;
    tasks.push(i % 2 === 0 ? objectMatchTask(i, n) : shapeExplorerTask(i, n));
  }

  // Lesson 3 — 5 questions (which one doesn't belong)
  for (let i = 0; i < 5; i += 1) {
    n += 1;
    tasks.push(oddOneOutTask(i, n));
  }

  return tasks;
}

// Registry keyed by `${level}-w${week}`; extend as new weeks are authored.
const STARPATH_QUIZ_BUILDERS: Record<string, () => PracticeTask[]> = {
  "ground-w1": buildGroundWeek1VoyageQuiz,
  "ground-w2": buildGroundWeek2VoyageQuiz,
  "ground-w3": buildGroundWeek3VoyageQuiz,
  "ground-w4": buildGroundWeek4VoyageQuiz,
  "ground-w5": buildGroundWeek5VoyageQuiz,
  "ground-w6": buildGroundWeek6VoyageQuiz,
  "ground-w7": buildGroundWeek7VoyageQuiz,
  // Week 8 has no weekly quiz — its assessment is the Ground Level Post-Test.
};

export function getStarpathQuizTasks(levelPrefix: string, week: number): PracticeTask[] | null {
  const builder = STARPATH_QUIZ_BUILDERS[`${levelPrefix}-w${week}`];
  return builder ? builder() : null;
}
