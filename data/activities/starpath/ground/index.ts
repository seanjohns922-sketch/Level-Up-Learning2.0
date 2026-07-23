import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import { MEET_THE_SHAPES_CONTENT } from "./week1Lesson1";
import { SHAPE_DETECTIVES_CONTENT } from "./week1Lesson2";
import { SHAPE_MASTERS_CONTENT } from "./week1Lesson3";
import { BUILD_WITH_SHAPES_CONTENT } from "./week2Lesson1";
import { SHAPE_CREATORS_CONTENT } from "./week2Lesson2";
import { SPACE_BUILDERS_CONTENT } from "./week2Lesson3";
import { SHAPE_FAMILIES_CONTENT } from "./week3Lesson1";
import { SAME_OR_DIFFERENT_CONTENT } from "./week3Lesson2";
import { SHAPE_CHALLENGE_CONTENT } from "./week3Lesson3";

// Registry-lesson-id → playable content for Ground Level. A lesson without an
// entry here falls back to the "in development" screen.
export const GROUND_LESSON_CONTENT: Record<string, StarpathLessonContent> = {
  "ground-space-w1-l1": MEET_THE_SHAPES_CONTENT,
  "ground-space-w1-l2": SHAPE_DETECTIVES_CONTENT,
  "ground-space-w1-l3": SHAPE_MASTERS_CONTENT,
  "ground-space-w2-l1": BUILD_WITH_SHAPES_CONTENT,
  "ground-space-w2-l2": SHAPE_CREATORS_CONTENT,
  "ground-space-w2-l3": SPACE_BUILDERS_CONTENT,
  "ground-space-w3-l1": SHAPE_FAMILIES_CONTENT,
  "ground-space-w3-l2": SAME_OR_DIFFERENT_CONTENT,
  "ground-space-w3-l3": SHAPE_CHALLENGE_CONTENT,
};
