import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "./quizUtils";
import {
  createBuildARouteTaskSet,
  createDirectionsForAFriendTaskSet,
  createTestAndImproveTaskSet,
} from "./week7Lessons";

// Level 1 · Week 7 Voyage Quiz — 15 questions (5 per lesson).
export function buildLevelOneWeek7VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(
    createBuildARouteTaskSet(),
    createDirectionsForAFriendTaskSet(),
    createTestAndImproveTaskSet()
  );
}
