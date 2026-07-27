import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import {
  COMPARE_THE_SHAPES_CONTENT,
  SHAPE_DETECTIVE_CHALLENGE_CONTENT,
  SHAPE_REVIEW_MISSION_CONTENT,
} from "./week1Lessons";

export const LEVEL_ONE_LESSON_CONTENT: Record<string, StarpathLessonContent> = {
  "y1-space-w1-l1": SHAPE_REVIEW_MISSION_CONTENT,
  "y1-space-w1-l2": COMPARE_THE_SHAPES_CONTENT,
  "y1-space-w1-l3": SHAPE_DETECTIVE_CHALLENGE_CONTENT,
};
