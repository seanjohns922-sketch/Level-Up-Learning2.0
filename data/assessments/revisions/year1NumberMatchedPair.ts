/** Targeted amendments to the existing pair. V2 remains available for existing cycles.
 */
import {
  YEAR1_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS as existingPre,
  YEAR1_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS as existingPost,
} from "../year1NumberNexusIndependentBanks";
import { createUncalibratedItemStatistics } from "../assessmentItemStandard";

type Item = typeof existingPre[number];
type Amendment = Pick<Item, "prompt" | "correctAnswer" | "visual"> & { options?: string[] };

const postAmendments: Record<number, Amendment> = {
  10: { prompt: "The whole is 13. One part is 6. Find the other part.", correctAnswer: "7", visual: { type: "number_y1_part_whole", whole: 13, parts: [6, null] } },
  12: { prompt: "Which grouping represents 110 counters?", correctAnswer: "11 groups of 10", options: ["10 groups of 10", "11 groups of 10", "11 groups of 5"], visual: { type: "number_y1_group_choices", totals: [100, 110, 55], choices: [{ count: 10, size: 10 }, { count: 11, size: 10 }, { count: 11, size: 5 }] } },
  14: { prompt: "A puzzle costs $5. A kite costs $3. How much altogether?", correctAnswer: "8", visual: { type: "number_y1_money", amounts: [5, 3], labels: ["Puzzle", "Kite"], unit: "$" } },
  15: { prompt: "Put 20 into groups of 4. How many groups?", correctAnswer: "5", visual: { type: "number_y1_groups", total: 20, groupSize: 4 } },
  16: { prompt: "Fill the gap.", correctAnswer: "35", visual: { type: "number_y1_sequence", values: [25, 30, null, 40, 45] } },
  20: { prompt: "Is this share equal?", correctAnswer: "No", options: ["No", "Yes"], visual: { type: "number_y1_groups", groups: [7, 3] } },
};

function revise(item: Item, slot: number, amendment?: Amendment): Item {
  const next = { ...item, ...amendment };
  // Labels describe intended demand only; they are not calibrated difficulty.
  const difficulty = slot === 20 ? "easy" : slot === 19 || slot === 10 ? "moderate" : item.difficulty;
  return {
    ...next,
    id: item.id.replace(/-v2$/, "-v3"),
    version: "3.0.0",
    bankId: item.bankId.replace(/-v2$/, "-v3"),
    contextKey: `${item.contextKey}-pair-audit-v3`,
    structureKey: `${item.structureKey}-pair-audit-v3`,
    difficulty,
    statistics: createUncalibratedItemStatistics(difficulty),
    answer: next.correctAnswer,
    ...(next.type === "mcq" ? { selectedAnswerPosition: next.options!.indexOf(next.correctAnswer) + 1 } : {}),
    renderer: { ...item.renderer, payload: { ...(item.renderer.payload as Record<string, unknown>), prompt: next.prompt, correctAnswer: next.correctAnswer, visual: next.visual, ...(next.options ? { options: next.options } : {}) } },
    scoring: { ...item.scoring, correctResponse: next.correctAnswer },
  };
}

export const YEAR1_NUMBER_MATCHED_PRE_ITEMS = existingPre.map((item, index) => revise(item, index + 1));
export const YEAR1_NUMBER_MATCHED_POST_ITEMS = existingPost.map((item, index) => revise(item, index + 1, postAmendments[index + 1]));
