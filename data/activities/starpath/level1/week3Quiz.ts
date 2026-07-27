import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "./quizUtils";
import {
  createHiddenShapeHuntTaskSet,
  createMasterDetectiveTaskSet,
  createShapeDetectivesPictureTaskSet,
} from "./week3ShapeHunt";

// Level 1 · Week 3 Voyage Quiz — 15 questions (5 per lesson), all Shape Hunts.
export function buildLevelOneWeek3VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(
    createShapeDetectivesPictureTaskSet(),
    createHiddenShapeHuntTaskSet(),
    createMasterDetectiveTaskSet()
  );
}
