import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "./quizUtils";
import {
  createBuildARouteTaskSet,
  createDirectionsForAFriendTaskSet,
  createRouteDesignerTaskSet,
} from "./week6Lessons";

// Level 1 · Week 6 Voyage Quiz — 15 questions (5 per lesson): Build a Route.
export function buildLevelOneWeek6VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(
    createBuildARouteTaskSet(),
    createDirectionsForAFriendTaskSet(),
    createRouteDesignerTaskSet()
  );
}
