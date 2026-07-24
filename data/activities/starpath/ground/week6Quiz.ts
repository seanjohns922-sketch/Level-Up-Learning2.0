import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { directionChoiceTask } from "@/data/activities/starpath/ground/directionTasks";

// Ground Level · Week 6 Voyage Quiz — 15 questions, 5 from each lesson. The
// journeys are completion-style paths, so the quiz assesses the single-answer
// "Which Way?" skill that drives every journey (leaning on reach-the-goal).
//   L1 Guide the Rocket : which way to the goal
//   L2 Help Geospin     : which way to the destination
//   L3 Hidden Treasure  : which way to the treasure (mixed)
export function buildGroundWeek6VoyageQuiz(): PracticeTask[] {
  const tasks: PracticeTask[] = [];
  let n = 0;

  for (let i = 0; i < 5; i += 1) {
    n += 1;
    tasks.push(directionChoiceTask(i + 1, n, "goal"));
  }
  for (let i = 0; i < 5; i += 1) {
    n += 1;
    tasks.push(directionChoiceTask(i + 3, n, "goal"));
  }
  for (let i = 0; i < 5; i += 1) {
    n += 1;
    tasks.push(directionChoiceTask(i + 6, n, i % 2 === 0 ? "goal" : "moved"));
  }

  return tasks;
}
