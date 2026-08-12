import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildLevelOneWeek2QuizBank } from "./quizTasks";

// Level 1 · Week 2 Voyage Quiz — 15 questions (5 per lesson).
export function buildLevelOneWeek2VoyageQuiz(): PracticeTask[] {
  return buildLevelOneWeek2QuizBank();
}
