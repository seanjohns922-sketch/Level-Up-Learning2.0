import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "./quizUtils";
import {
  createFindTheErrorTaskSet,
  createFixTheRouteTaskSet,
  createTestAndImproveTaskSet,
} from "./week7Lessons";

// Level 1 · Week 7 Voyage Quiz — 15 questions (5 per lesson): Test & Fix.
export function buildLevelOneWeek7VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(
    createFindTheErrorTaskSet(),
    createFixTheRouteTaskSet(),
    createTestAndImproveTaskSet()
  );
}
