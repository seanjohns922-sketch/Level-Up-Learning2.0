import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import { PREDICT_CONTENT, SLICE_SEE_CONTENT, SLICE_SEQUENCE_CONTENT } from "./week1";
import { CONSTANT_CHANGING_CONTENT, EXPLAIN_STRUCTURE_CONTENT, PRISM_OR_NOT_CONTENT } from "./week2";
import { COORD_REASONING_CONTENT, EXTEND_AXES_CONTENT, PLOT_QUADRANTS_CONTENT } from "./week3";
import { CHANGE_COORD_CONTENT, CROSS_AXES_CONTENT, REVERSE_MOVE_CONTENT } from "./week4";

// Level 6 (Year 6) — Cross-sections, Cartesian Space and Tessellations.
// Weeks 1-2 (cross-sections, SP01) and 3-4 (four-quadrant coordinates, SP02)
// are built; W5-8 land in later blocks.
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
};
