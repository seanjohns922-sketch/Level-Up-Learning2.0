import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildLevelOneWeek3QuizBank } from "./quizTasks";

// Level 1 · Week 3 Voyage Quiz — 15 questions (5 per lesson), all Shape Hunts.
export function buildLevelOneWeek3VoyageQuiz(): PracticeTask[] {
  return buildLevelOneWeek3QuizBank();
}
