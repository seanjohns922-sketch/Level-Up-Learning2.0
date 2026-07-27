import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "./quizUtils";
import {
  createChooseBestViewTaskSet,
  createLookFromHereTaskSet,
  createObjectOrPictureTaskSet,
} from "./week4Lessons";

// Level 1 · Week 4 Voyage Quiz — 15 questions (5 per lesson).
export function buildLevelOneWeek4VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(
    createObjectOrPictureTaskSet(),
    createLookFromHereTaskSet(),
    createChooseBestViewTaskSet()
  );
}
