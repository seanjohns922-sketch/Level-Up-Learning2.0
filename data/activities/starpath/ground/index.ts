import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import { MEET_THE_SHAPES_CONTENT } from "./week1Lesson1";
import { SHAPE_DETECTIVES_CONTENT } from "./week1Lesson2";
import { SHAPE_MASTERS_CONTENT } from "./week1Lesson3";

// Registry-lesson-id → playable content for Ground Level. A lesson without an
// entry here falls back to the "in development" screen.
export const GROUND_LESSON_CONTENT: Record<string, StarpathLessonContent> = {
  "ground-space-w1-l1": MEET_THE_SHAPES_CONTENT,
  "ground-space-w1-l2": SHAPE_DETECTIVES_CONTENT,
  "ground-space-w1-l3": SHAPE_MASTERS_CONTENT,
};
