import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import { EXPLAIN_MATCH_CONTENT, UNFOLD_CONTENT, WHICH_NET_CONTENT } from "./week1";
import { FOLD_NET_CONTENT, RELATION_CONTENT, TRACK_FACE_CONTENT } from "./week2";
import { ARRANGE_CONTENT, COMPARE_NETS_CONTENT, TEST_FOLD_CONTENT } from "./week3";
import { BUILD_AXES_CONTENT, COORD_ERROR_CONTENT, PLOT_READ_CONTENT } from "./week4";
import { FOLLOW_COMMANDS_CONTENT, MOVE_AXIS_CONTENT, PLAN_ROUTE_CONTENT } from "./week5";
import { CHECK_IMAGE_CONTENT, DESCRIBE_CONTENT, SLIDE_CONTENT } from "./week6";
import { COMPARE_TRANSFORMS_CONTENT, REFLECT_CONTENT, ROTATE_CONTENT } from "./week7";

export const LEVEL_FIVE_LESSON_CONTENT: Record<string, StarpathLessonContent> = {
  "y5-space-w1-l1": UNFOLD_CONTENT,
  "y5-space-w1-l2": WHICH_NET_CONTENT,
  "y5-space-w1-l3": EXPLAIN_MATCH_CONTENT,
  "y5-space-w2-l1": TRACK_FACE_CONTENT,
  "y5-space-w2-l2": FOLD_NET_CONTENT,
  "y5-space-w2-l3": RELATION_CONTENT,
  "y5-space-w3-l1": ARRANGE_CONTENT,
  "y5-space-w3-l2": TEST_FOLD_CONTENT,
  "y5-space-w3-l3": COMPARE_NETS_CONTENT,
  "y5-space-w4-l1": BUILD_AXES_CONTENT,
  "y5-space-w4-l2": PLOT_READ_CONTENT,
  "y5-space-w4-l3": COORD_ERROR_CONTENT,
  "y5-space-w5-l1": MOVE_AXIS_CONTENT,
  "y5-space-w5-l2": FOLLOW_COMMANDS_CONTENT,
  "y5-space-w5-l3": PLAN_ROUTE_CONTENT,
  "y5-space-w6-l1": SLIDE_CONTENT,
  "y5-space-w6-l2": DESCRIBE_CONTENT,
  "y5-space-w6-l3": CHECK_IMAGE_CONTENT,
  "y5-space-w7-l1": REFLECT_CONTENT,
  "y5-space-w7-l2": ROTATE_CONTENT,
  "y5-space-w7-l3": COMPARE_TRANSFORMS_CONTENT,
};
