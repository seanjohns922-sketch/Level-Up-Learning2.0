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
import { MAP_SYMBOLS_CONTENT, FIND_LANDMARK_CONTENT, MAP_EXPLORER_CONTENT } from "./week4";
import { DRAW_CAMP_CONTENT, PLACE_LANDMARKS_CONTENT, MAP_BUILDER_CONTENT } from "./week5";
import { TREASURE_HUNT_CONTENT, FIND_OBSERVATORY_CONTENT, MISSION_CONTROL_CONTENT } from "./week6";
import { EXPLORER_CHALLENGE_CONTENT, RESCUE_MISSION_CONTENT, NAVIGATOR_CHALLENGE_CONTENT } from "./week7";
import { OBJECTS_REVIEW_CONTENT, MAP_MASTER_CONTENT, FINAL_MISSION_CONTENT } from "./week8";

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
  // W4 Reading Space Maps
  "y3-space-w4-l1": MAP_SYMBOLS_CONTENT,
  "y3-space-w4-l2": FIND_LANDMARK_CONTENT,
  "y3-space-w4-l3": MAP_EXPLORER_CONTENT,
  // W5 Creating Maps
  "y3-space-w5-l1": DRAW_CAMP_CONTENT,
  "y3-space-w5-l2": PLACE_LANDMARKS_CONTENT,
  "y3-space-w5-l3": MAP_BUILDER_CONTENT,
  // W6 Landmark Navigation
  "y3-space-w6-l1": TREASURE_HUNT_CONTENT,
  "y3-space-w6-l2": FIND_OBSERVATORY_CONTENT,
  "y3-space-w6-l3": MISSION_CONTROL_CONTENT,
  // W7 Cosmic Missions
  "y3-space-w7-l1": EXPLORER_CHALLENGE_CONTENT,
  "y3-space-w7-l2": RESCUE_MISSION_CONTENT,
  "y3-space-w7-l3": NAVIGATOR_CHALLENGE_CONTENT,
  // W8 Cosmic Navigator Graduation
  "y3-space-w8-l1": OBJECTS_REVIEW_CONTENT,
  "y3-space-w8-l2": MAP_MASTER_CONTENT,
  "y3-space-w8-l3": FINAL_MISSION_CONTENT,
};
