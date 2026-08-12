import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import { PREDICT_CONTENT, SLICE_SEE_CONTENT, SLICE_SEQUENCE_CONTENT } from "./week1";
import { CONSTANT_CHANGING_CONTENT, EXPLAIN_STRUCTURE_CONTENT, PRISM_OR_NOT_CONTENT } from "./week2";
import { COORD_REASONING_CONTENT, EXTEND_AXES_CONTENT, PLOT_QUADRANTS_CONTENT } from "./week3";
import { CHANGE_COORD_CONTENT, CROSS_AXES_CONTENT, REVERSE_MOVE_CONTENT } from "./week4";
import { FIND_CHAIN_CONTENT, ORDER_MATTERS_CONTENT, TRANSFORM_ORDER_CONTENT } from "./week5";
import { EXPLAIN_FIT_CONTENT, PATTERN_RULE_CONTENT, WILL_TESSELLATE_CONTENT } from "./week6";
import { EVIDENCE_CONTENT, NOTICE_RULE_CONTENT, VARY_CONTENT } from "./week7";
import { ANALYSE_CONTENT, BUILD_TEST_CONTENT, DEFEND_CONTENT } from "./week8";

// Level 6 (Year 6) — Cross-sections, Cartesian Space and Tessellations.
// All 24 lessons built: W1-2 cross-sections (SP01), W3-4 four-quadrant
// coordinates (SP02), W5-7 transformations + tessellations (SP03), W8 integration.
export const LEVEL_SIX_LESSON_CONTENT: Record<string, StarpathLessonContent> = {
  "y6-space-w1-l1": SLICE_SEE_CONTENT,
  "y6-space-w1-l2": SLICE_SEQUENCE_CONTENT,
  "y6-space-w1-l3": PREDICT_CONTENT,
  "y6-space-w2-l1": PRISM_OR_NOT_CONTENT,
  "y6-space-w2-l2": CONSTANT_CHANGING_CONTENT,
  "y6-space-w2-l3": EXPLAIN_STRUCTURE_CONTENT,
  "y6-space-w3-l1": EXTEND_AXES_CONTENT,
  "y6-space-w3-l2": PLOT_QUADRANTS_CONTENT,
  "y6-space-w3-l3": COORD_REASONING_CONTENT,
  "y6-space-w4-l1": CHANGE_COORD_CONTENT,
  "y6-space-w4-l2": CROSS_AXES_CONTENT,
  "y6-space-w4-l3": REVERSE_MOVE_CONTENT,
  "y6-space-w5-l1": TRANSFORM_ORDER_CONTENT,
  "y6-space-w5-l2": ORDER_MATTERS_CONTENT,
  "y6-space-w5-l3": FIND_CHAIN_CONTENT,
  "y6-space-w6-l1": WILL_TESSELLATE_CONTENT,
  "y6-space-w6-l2": PATTERN_RULE_CONTENT,
  "y6-space-w6-l3": EXPLAIN_FIT_CONTENT,
  "y6-space-w7-l1": NOTICE_RULE_CONTENT,
  "y6-space-w7-l2": VARY_CONTENT,
  "y6-space-w7-l3": EVIDENCE_CONTENT,
  "y6-space-w8-l1": ANALYSE_CONTENT,
  "y6-space-w8-l2": BUILD_TEST_CONTENT,
  "y6-space-w8-l3": DEFEND_CONTENT,
};
