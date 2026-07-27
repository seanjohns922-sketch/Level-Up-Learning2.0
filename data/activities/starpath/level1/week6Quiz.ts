import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "./quizUtils";
import {
  createFindTheErrorTaskSet,
  createMissionRouteTaskSet,
  createStartHereTaskSet,
} from "./week6Lessons";

// Level 1 · Week 6 Voyage Quiz — 15 questions (5 per lesson).
export function buildLevelOneWeek6VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(
    createStartHereTaskSet(),
    createMissionRouteTaskSet(),
    createFindTheErrorTaskSet()
  );
}
