import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import {
  MEET_THE_OBJECTS_CONTENT,
  FIND_THE_OBJECT_CONTENT,
  OBJECT_CHALLENGE_CONTENT,
} from "./week1";
import {
  WHICH_OBJECT_CONTENT,
  COMPARE_OBJECTS_CONTENT,
  OBJECT_SORT_CONTENT,
} from "./week2";
import {
  BUILD_THE_ROVER_CONTENT,
  CHOOSE_BEST_SHAPE_CONTENT,
  SPACE_ENGINEERING_CONTENT,
} from "./week3";

// Registry-lesson-id → playable content for Starpath Level 3 (Year 3).
// Weeks fill in as they are built; unbuilt lessons fall back to the in-development
// lesson screen via the lesson page dispatcher.
export const LEVEL_THREE_LESSON_CONTENT: Record<string, StarpathLessonContent> = {
  // W1 3D Discoveries
  "y3-space-w1-l1": MEET_THE_OBJECTS_CONTENT,
  "y3-space-w1-l2": FIND_THE_OBJECT_CONTENT,
  "y3-space-w1-l3": OBJECT_CHALLENGE_CONTENT,
  // W2 Object Detectives
  "y3-space-w2-l1": WHICH_OBJECT_CONTENT,
  "y3-space-w2-l2": COMPARE_OBJECTS_CONTENT,
  "y3-space-w2-l3": OBJECT_SORT_CONTENT,
  // W3 Building Starpath
  "y3-space-w3-l1": BUILD_THE_ROVER_CONTENT,
  "y3-space-w3-l2": CHOOSE_BEST_SHAPE_CONTENT,
  "y3-space-w3-l3": SPACE_ENGINEERING_CONTENT,
};
