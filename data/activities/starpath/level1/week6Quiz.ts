import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildLevelOneWeek6QuizBank } from "./quizTasks";

// Level 1 · Week 6 Voyage Quiz — 15 questions (5 per lesson):
// create routes, record paths, then solve 4×4 mission routes.
export function buildLevelOneWeek6VoyageQuiz(): PracticeTask[] {
  return buildLevelOneWeek6QuizBank();
}
