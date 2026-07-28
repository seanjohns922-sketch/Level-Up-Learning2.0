import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "./quizUtils";
import {
  createMoveRoverTaskSet,
  createSayMoveTaskSet,
  createWhichWayTaskSet,
} from "./week5Lessons";

// Level 1 · Week 5 Voyage Quiz — 15 questions (5 per lesson): name, follow, give.
export function buildLevelOneWeek5VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(
    createWhichWayTaskSet(),
    createMoveRoverTaskSet(),
    createSayMoveTaskSet()
  );
}
