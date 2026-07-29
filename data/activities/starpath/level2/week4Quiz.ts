import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "@/data/activities/starpath/level1/quizUtils";
import {
  createFindThePlanetTaskSet,
  createMapExplorerTaskSet,
  createReadingAMapTaskSet,
} from "./week4StarMaps";

// Level 2 · Week 4 Voyage Quiz — 15 questions (5 per lesson): read, locate, reason.
export function buildLevelTwoWeek4VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(
    createReadingAMapTaskSet(),
    createFindThePlanetTaskSet(),
    createMapExplorerTaskSet()
  );
}
