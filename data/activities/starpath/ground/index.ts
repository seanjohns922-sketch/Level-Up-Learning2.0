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
import { WHERE_IS_IT_CONTENT } from "./week4Lesson1";
import { AROUND_STARPATH_CONTENT } from "./week4Lesson2";
import { POSITION_CHALLENGE_CONTENT } from "./week4Lesson3";
import { MOVE_IT_THERE_CONTENT, WHICH_WAY_CONTENT, DIRECTION_MISSION_CONTENT } from "./week5Lessons";
import { GUIDE_THE_ROCKET_CONTENT, HELP_GEOSPIN_CONTENT, HIDDEN_TREASURE_CONTENT } from "./week6Lessons";
import { BUILD_A_PLANET_CONTENT, SPACE_SCENE_CONTENT, DESCRIBE_PICTURE_CONTENT } from "./week7Lessons";
import { SHAPE_EXPLORER_CHALLENGE_CONTENT, POSITION_EXPLORER_CHALLENGE_CONTENT, FINAL_MISSION_CONTENT } from "./week8Lessons";

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
  "ground-space-w4-l1": WHERE_IS_IT_CONTENT,
  "ground-space-w4-l2": AROUND_STARPATH_CONTENT,
  "ground-space-w4-l3": POSITION_CHALLENGE_CONTENT,
  "ground-space-w5-l1": MOVE_IT_THERE_CONTENT,
  "ground-space-w5-l2": WHICH_WAY_CONTENT,
  "ground-space-w5-l3": DIRECTION_MISSION_CONTENT,
  "ground-space-w6-l1": GUIDE_THE_ROCKET_CONTENT,
  "ground-space-w6-l2": HELP_GEOSPIN_CONTENT,
  "ground-space-w6-l3": HIDDEN_TREASURE_CONTENT,
  "ground-space-w7-l1": BUILD_A_PLANET_CONTENT,
  "ground-space-w7-l2": SPACE_SCENE_CONTENT,
  "ground-space-w7-l3": DESCRIBE_PICTURE_CONTENT,
  "ground-space-w8-l1": SHAPE_EXPLORER_CHALLENGE_CONTENT,
  "ground-space-w8-l2": POSITION_EXPLORER_CHALLENGE_CONTENT,
  "ground-space-w8-l3": FINAL_MISSION_CONTENT,
};
