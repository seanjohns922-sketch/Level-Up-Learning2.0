import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { directionChoiceTask } from "@/data/activities/starpath/ground/directionTasks";

// Ground Level · Week 5 Voyage Quiz — 15 questions, 5 from each lesson, using
// the single-answer "Which Way?" task (Move It There and Direction Mission are
// completion-style paths, so the quiz assesses direction identification).
//   L1 Move It There     : which way did it move
//   L2 Which Way?         : which way to reach the goal
//   L3 Direction Mission  : mixed moved / goal
export function buildGroundWeek5VoyageQuiz(): PracticeTask[] {
  const tasks: PracticeTask[] = [];
  let n = 0;

  for (let i = 0; i < 5; i += 1) {
    n += 1;
    tasks.push(directionChoiceTask(i, n, "moved"));
  }
  for (let i = 0; i < 5; i += 1) {
    n += 1;
    tasks.push(directionChoiceTask(i + 2, n, "goal"));
  }
  for (let i = 0; i < 5; i += 1) {
    n += 1;
    tasks.push(directionChoiceTask(i + 4, n, i % 2 === 0 ? "moved" : "goal"));
  }

  return tasks;
}
