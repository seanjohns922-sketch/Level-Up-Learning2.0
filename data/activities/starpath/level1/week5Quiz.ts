import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildLevelOneWeek5QuizBank } from "./quizTasks";

// Level 1 · Week 5 Voyage Quiz — 15 questions (5 per lesson): Shape Workshop.
export function buildLevelOneWeek5VoyageQuiz(): PracticeTask[] {
  return buildLevelOneWeek5QuizBank();
}
