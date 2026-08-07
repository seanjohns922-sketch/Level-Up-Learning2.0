import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import { EXPLAIN_MATCH_CONTENT, UNFOLD_CONTENT, WHICH_NET_CONTENT } from "./week1";
import { FOLD_NET_CONTENT, RELATION_CONTENT, TRACK_FACE_CONTENT } from "./week2";
import { ARRANGE_CONTENT, COMPARE_NETS_CONTENT, TEST_FOLD_CONTENT } from "./week3";

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
};
