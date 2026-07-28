import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fifteenFrom } from "./quizUtils";
import {
  createBuildARouteTaskSet,
  createMissionRoutesTaskSet,
  createRouteDesignerTaskSet,
} from "./week6Lessons";

// Level 1 · Week 6 Voyage Quiz — 15 questions (5 per lesson):
// create routes, plan 4×4 missions, then solve wider 8×4 mission routes.
export function buildLevelOneWeek6VoyageQuiz(): PracticeTask[] {
  return fifteenFrom(
    createBuildARouteTaskSet(),
    createMissionRoutesTaskSet(),
    createRouteDesignerTaskSet()
  );
}
