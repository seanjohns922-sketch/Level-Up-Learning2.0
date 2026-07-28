import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "./quizUtils";
import {
  createBuildTheShapeTaskSet,
  createShapeMakerTaskSet,
  createTwoMakeOneTaskSet,
} from "./week5MakeShape";

// Level 1 · Week 5 Voyage Quiz — 15 questions (5 per lesson): Make a Shape.
export function buildLevelOneWeek5VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(
    createTwoMakeOneTaskSet(),
    createBuildTheShapeTaskSet(),
    createShapeMakerTaskSet()
  );
}
