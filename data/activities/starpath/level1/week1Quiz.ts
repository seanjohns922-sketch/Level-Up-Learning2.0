import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildLevelOneWeek1QuizBank } from "./quizTasks";

// Level 1 · Week 1 Voyage Quiz
// Questions 1–5: Shape Disguise Mission
// Questions 6–10: Shape Face-Off
// Questions 11–15: Mystery Shape Rescue
export function buildLevelOneWeek1VoyageQuiz(): PracticeTask[] {
  return buildLevelOneWeek1QuizBank();
}
