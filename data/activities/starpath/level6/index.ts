import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import { PREDICT_CONTENT, SLICE_SEE_CONTENT, SLICE_SEQUENCE_CONTENT } from "./week1";
import { CONSTANT_CHANGING_CONTENT, EXPLAIN_STRUCTURE_CONTENT, PRISM_OR_NOT_CONTENT } from "./week2";

// Level 6 (Year 6) — Cross-sections, Cartesian Space and Tessellations.
// Weeks 1-2 (cross-sections, AC9M6SP01) are built; W3-8 land in later blocks.
export const LEVEL_SIX_LESSON_CONTENT: Record<string, StarpathLessonContent> = {
  "y6-space-w1-l1": SLICE_SEE_CONTENT,
  "y6-space-w1-l2": SLICE_SEQUENCE_CONTENT,
  "y6-space-w1-l3": PREDICT_CONTENT,
  "y6-space-w2-l1": PRISM_OR_NOT_CONTENT,
  "y6-space-w2-l2": CONSTANT_CHANGING_CONTENT,
  "y6-space-w2-l3": EXPLAIN_STRUCTURE_CONTENT,
};
