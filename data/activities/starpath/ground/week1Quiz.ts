import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { assertWeeklyQuizQuestionCount } from "@/lib/weekly-quiz-contract";
import { shapeMatchTask, shapeNameTask } from "@/data/activities/starpath/ground/week1Lesson1";
import { objectMatchTask, shapeExplorerTask } from "@/data/activities/starpath/ground/week1Lesson2";
import { oddOneOutTask } from "@/data/activities/starpath/ground/week1Lesson3";
import { buildGroundWeek2VoyageQuiz } from "@/data/activities/starpath/ground/week2Quiz";
import { buildGroundWeek3VoyageQuiz } from "@/data/activities/starpath/ground/week3Quiz";
import { buildGroundWeek4VoyageQuiz } from "@/data/activities/starpath/ground/week4Quiz";
import { buildGroundWeek5VoyageQuiz } from "@/data/activities/starpath/ground/week5Quiz";
import { buildGroundWeek6VoyageQuiz } from "@/data/activities/starpath/ground/week6Quiz";
import { buildGroundWeek7VoyageQuiz } from "@/data/activities/starpath/ground/week7Quiz";
import { buildLevelOneWeek1VoyageQuiz } from "@/data/activities/starpath/level1/week1Quiz";
import { buildLevelTwoWeek1VoyageQuiz } from "@/data/activities/starpath/level2/week1Quiz";
import { buildLevelTwoWeek2VoyageQuiz } from "@/data/activities/starpath/level2/week2Quiz";
import { buildLevelTwoWeek3VoyageQuiz } from "@/data/activities/starpath/level2/week3Quiz";
import { buildLevelTwoWeek4VoyageQuiz } from "@/data/activities/starpath/level2/week4Quiz";
import { buildLevelTwoWeek5VoyageQuiz } from "@/data/activities/starpath/level2/week5Quiz";
import { buildLevelTwoWeek6VoyageQuiz } from "@/data/activities/starpath/level2/week6Quiz";
import { buildLevelTwoWeek7VoyageQuiz } from "@/data/activities/starpath/level2/week7Quiz";
import { buildLevelOneWeek2VoyageQuiz } from "@/data/activities/starpath/level1/week2Quiz";
import { buildLevelOneWeek3VoyageQuiz } from "@/data/activities/starpath/level1/week3Quiz";
import { buildLevelOneWeek4VoyageQuiz } from "@/data/activities/starpath/level1/week4Quiz";
import { buildLevelOneWeek5VoyageQuiz } from "@/data/activities/starpath/level1/week5Quiz";
import { buildLevelOneWeek6VoyageQuiz } from "@/data/activities/starpath/level1/week6Quiz";
import { buildLevelOneWeek7VoyageQuiz } from "@/data/activities/starpath/level1/week7Quiz";
import { buildLevelThreeWeek1VoyageQuiz } from "@/data/activities/starpath/level3/week1Quiz";
import { buildLevelThreeWeek2VoyageQuiz } from "@/data/activities/starpath/level3/week2Quiz";
import { buildLevelThreeWeek3VoyageQuiz } from "@/data/activities/starpath/level3/week3Quiz";
import { buildLevelThreeWeek4VoyageQuiz } from "@/data/activities/starpath/level3/week4Quiz";
import { buildLevelThreeWeek5VoyageQuiz } from "@/data/activities/starpath/level3/week5Quiz";
import { buildLevelThreeWeek6VoyageQuiz } from "@/data/activities/starpath/level3/week6Quiz";
import { buildLevelThreeWeek7VoyageQuiz } from "@/data/activities/starpath/level3/week7Quiz";

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
  "level-1-w1": buildLevelOneWeek1VoyageQuiz,
  "level-1-w2": buildLevelOneWeek2VoyageQuiz,
  "level-1-w3": buildLevelOneWeek3VoyageQuiz,
  "level-1-w4": buildLevelOneWeek4VoyageQuiz,
  "level-1-w5": buildLevelOneWeek5VoyageQuiz,
  "level-1-w6": buildLevelOneWeek6VoyageQuiz,
  "level-1-w7": buildLevelOneWeek7VoyageQuiz,
  "level-2-w1": buildLevelTwoWeek1VoyageQuiz,
  "level-2-w2": buildLevelTwoWeek2VoyageQuiz,
  "level-2-w3": buildLevelTwoWeek3VoyageQuiz,
  "level-2-w4": buildLevelTwoWeek4VoyageQuiz,
  "level-2-w5": buildLevelTwoWeek5VoyageQuiz,
  "level-2-w6": buildLevelTwoWeek6VoyageQuiz,
  "level-2-w7": buildLevelTwoWeek7VoyageQuiz,
  "level-3-w1": buildLevelThreeWeek1VoyageQuiz,
  "level-3-w2": buildLevelThreeWeek2VoyageQuiz,
  "level-3-w3": buildLevelThreeWeek3VoyageQuiz,
  "level-3-w4": buildLevelThreeWeek4VoyageQuiz,
  "level-3-w5": buildLevelThreeWeek5VoyageQuiz,
  "level-3-w6": buildLevelThreeWeek6VoyageQuiz,
  "level-3-w7": buildLevelThreeWeek7VoyageQuiz,
  // Week 8 has no weekly quiz — its assessment is the Post-Test.
};

export function getStarpathQuizTasks(levelPrefix: string, week: number): PracticeTask[] | null {
  const builder = STARPATH_QUIZ_BUILDERS[`${levelPrefix}-w${week}`];
  if (!builder) return null;

  return assertWeeklyQuizQuestionCount(
    builder(),
    `Starpath ${levelPrefix} Week ${week}`
  );
}
