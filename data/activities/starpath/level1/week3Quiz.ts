import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "./quizUtils";
import {
  createBuildTheTargetTaskSet,
  createDesignTwoWaysTaskSet,
  createFindHiddenPartsTaskSet,
} from "./week3Lessons";

// Level 1 · Week 3 Voyage Quiz — 15 questions (5 per lesson).
export function buildLevelOneWeek3VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(
    createBuildTheTargetTaskSet(),
    createFindHiddenPartsTaskSet(),
    createDesignTwoWaysTaskSet()
  );
}
