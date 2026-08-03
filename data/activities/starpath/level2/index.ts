import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import {
  COMPARE_CHALLENGE_CONTENT,
  COUNT_THE_SIDES_CONTENT,
  EDGE_CHALLENGE_CONTENT,
  OPPOSITE_SIDES_CONTENT,
  PARALLEL_CHALLENGE_CONTENT,
  PARALLEL_TRACKS_CONTENT,
  SAME_FEATURE_CONTENT,
  SIDES_CHALLENGE_CONTENT,
  SIDES_SORT_CONTENT,
  SORT_BY_EDGE_CONTENT,
  STRAIGHT_OR_CURVED_CONTENT,
  WHAT_IS_DIFFERENT_CONTENT,
} from "./shapeWeeks";
import {
  FIND_THE_PLACE_CONTENT,
  MAP_READING_CHALLENGE_CONTENT,
  NEXT_TO_CONTENT,
  POSITION_CHALLENGE_CONTENT,
  READING_A_MAP_CONTENT,
  WHAT_IS_HERE_CONTENT,
} from "./week4StarMaps";
import {
  CHOOSE_THE_ROUTE_CONTENT,
  FOLLOW_THE_PATH_CONTENT,
  GIVE_A_ROUTE_CONTENT,
} from "./navWeeks";
import {
  MASTER_MISSION_CONTENT,
  PATHWAY_MASTER_CONTENT,
  SHAPE_AND_MAP_CONTENT,
} from "./week8";

// Registry-lesson-id → playable content for Starpath Level 2 (Year 2).
export const LEVEL_TWO_LESSON_CONTENT: Record<string, StarpathLessonContent> = {
  // W1 Straight & Curved
  "y2-space-w1-l1": STRAIGHT_OR_CURVED_CONTENT,
  "y2-space-w1-l2": SORT_BY_EDGE_CONTENT,
  "y2-space-w1-l3": EDGE_CHALLENGE_CONTENT,
  // W2 Count the Sides
  "y2-space-w2-l1": COUNT_THE_SIDES_CONTENT,
  "y2-space-w2-l2": SIDES_SORT_CONTENT,
  "y2-space-w2-l3": SIDES_CHALLENGE_CONTENT,
  // W3 Parallel & Opposite
  "y2-space-w3-l1": OPPOSITE_SIDES_CONTENT,
  "y2-space-w3-l2": PARALLEL_TRACKS_CONTENT,
  "y2-space-w3-l3": PARALLEL_CHALLENGE_CONTENT,
  // W4 Compare Shapes
  "y2-space-w4-l1": SAME_FEATURE_CONTENT,
  "y2-space-w4-l2": WHAT_IS_DIFFERENT_CONTENT,
  "y2-space-w4-l3": COMPARE_CHALLENGE_CONTENT,
  // W5 Reading a Map (locate named places)
  "y2-space-w5-l1": READING_A_MAP_CONTENT,
  "y2-space-w5-l2": FIND_THE_PLACE_CONTENT,
  "y2-space-w5-l3": MAP_READING_CHALLENGE_CONTENT,
  // W6 Positions on a Map (what is here / next to)
  "y2-space-w6-l1": WHAT_IS_HERE_CONTENT,
  "y2-space-w6-l2": NEXT_TO_CONTENT,
  "y2-space-w6-l3": POSITION_CHALLENGE_CONTENT,
  // W7 Pathways on a Map (follow / choose / give)
  "y2-space-w7-l1": FOLLOW_THE_PATH_CONTENT,
  "y2-space-w7-l2": CHOOSE_THE_ROUTE_CONTENT,
  "y2-space-w7-l3": GIVE_A_ROUTE_CONTENT,
  // W8 Master Mapper
  "y2-space-w8-l1": SHAPE_AND_MAP_CONTENT,
  "y2-space-w8-l2": PATHWAY_MASTER_CONTENT,
  "y2-space-w8-l3": MASTER_MISSION_CONTENT,
};
