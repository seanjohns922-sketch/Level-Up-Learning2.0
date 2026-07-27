import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import {
  COMPARE_THE_SHAPES_CONTENT,
  SHAPE_DETECTIVE_CHALLENGE_CONTENT,
  SHAPE_REVIEW_MISSION_CONTENT,
} from "./week1Lessons";
import {
  MAKE_YOUR_OWN_RULE_CONTENT,
  MEET_THE_FAMILIES_CONTENT,
  TWO_WAYS_TO_SORT_CONTENT,
} from "./week2Lessons";
import {
  DESIGN_TWO_WAYS_CONTENT,
  FIND_HIDDEN_PARTS_CONTENT,
} from "./week3Lessons";
import { SHAPE_DETECTIVES_PICTURE_CONTENT } from "./week3ShapeHunt";
import {
  CHOOSE_BEST_VIEW_CONTENT,
  LOOK_FROM_HERE_CONTENT,
  OBJECT_OR_PICTURE_CONTENT,
} from "./week4Lessons";
import {
  FACE_AND_MOVE_CONTENT,
  SAY_THE_MOVE_CONTENT,
  TURNS_CONTENT,
} from "./week5Lessons";
import {
  FIND_THE_ERROR_CONTENT,
  MISSION_ROUTE_CONTENT,
  START_HERE_CONTENT,
} from "./week6Lessons";
import {
  BUILD_A_ROUTE_CONTENT,
  DIRECTIONS_FOR_A_FRIEND_CONTENT,
  TEST_AND_IMPROVE_CONTENT,
} from "./week7Lessons";
import {
  EXPLAIN_PATH_CONTENT,
  FIND_LANDMARK_CONTENT,
  PLAN_OBSTACLES_CONTENT,
} from "./week8Lessons";

export const LEVEL_ONE_LESSON_CONTENT: Record<string, StarpathLessonContent> = {
  "y1-space-w1-l1": SHAPE_REVIEW_MISSION_CONTENT,
  "y1-space-w1-l2": COMPARE_THE_SHAPES_CONTENT,
  "y1-space-w1-l3": SHAPE_DETECTIVE_CHALLENGE_CONTENT,
  "y1-space-w2-l1": MEET_THE_FAMILIES_CONTENT,
  "y1-space-w2-l2": MAKE_YOUR_OWN_RULE_CONTENT,
  "y1-space-w2-l3": TWO_WAYS_TO_SORT_CONTENT,
  "y1-space-w3-l1": SHAPE_DETECTIVES_PICTURE_CONTENT,
  "y1-space-w3-l2": FIND_HIDDEN_PARTS_CONTENT,
  "y1-space-w3-l3": DESIGN_TWO_WAYS_CONTENT,
  "y1-space-w4-l1": OBJECT_OR_PICTURE_CONTENT,
  "y1-space-w4-l2": LOOK_FROM_HERE_CONTENT,
  "y1-space-w4-l3": CHOOSE_BEST_VIEW_CONTENT,
  "y1-space-w5-l1": FACE_AND_MOVE_CONTENT,
  "y1-space-w5-l2": TURNS_CONTENT,
  "y1-space-w5-l3": SAY_THE_MOVE_CONTENT,
  "y1-space-w6-l1": START_HERE_CONTENT,
  "y1-space-w6-l2": MISSION_ROUTE_CONTENT,
  "y1-space-w6-l3": FIND_THE_ERROR_CONTENT,
  "y1-space-w7-l1": BUILD_A_ROUTE_CONTENT,
  "y1-space-w7-l2": DIRECTIONS_FOR_A_FRIEND_CONTENT,
  "y1-space-w7-l3": TEST_AND_IMPROVE_CONTENT,
  "y1-space-w8-l1": FIND_LANDMARK_CONTENT,
  "y1-space-w8-l2": PLAN_OBSTACLES_CONTENT,
  "y1-space-w8-l3": EXPLAIN_PATH_CONTENT,
};
