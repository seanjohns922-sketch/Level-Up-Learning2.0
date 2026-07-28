import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "./quizUtils";
import {
  createSameOrDifferentTaskSet,
  createShapeMatchTaskSet,
  createShapeSpotterTaskSet,
} from "./week4WorldObjects";

// Level 1 · Week 4 Voyage Quiz — 15 questions (5 per lesson): spot, compare, match.
export function buildLevelOneWeek4VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(
    createShapeSpotterTaskSet(),
    createSameOrDifferentTaskSet(),
    createShapeMatchTaskSet()
  );
}
