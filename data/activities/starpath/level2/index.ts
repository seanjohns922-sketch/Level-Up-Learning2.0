import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import {
  FIND_THE_PLANET_CONTENT,
  MAP_EXPLORER_CONTENT,
  READING_A_MAP_CONTENT,
} from "./week4StarMaps";

// Registry-lesson-id → playable content for Starpath Level 2 (Year 2).
export const LEVEL_TWO_LESSON_CONTENT: Record<string, StarpathLessonContent> = {
  "y2-space-w4-l1": READING_A_MAP_CONTENT,
  "y2-space-w4-l2": FIND_THE_PLANET_CONTENT,
  "y2-space-w4-l3": MAP_EXPLORER_CONTENT,
};
