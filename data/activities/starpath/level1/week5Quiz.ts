import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "./quizUtils";
import {
  createBuildAndCompareTaskSet,
  createConnectTheStarsTaskSet,
  createShapeRepairTaskSet,
} from "./week5MakeShape";

// Level 1 · Week 5 Voyage Quiz — 15 questions (5 per lesson): Shape Workshop.
export function buildLevelOneWeek5VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(
    createConnectTheStarsTaskSet(),
    createShapeRepairTaskSet(),
    createBuildAndCompareTaskSet()
  );
}
