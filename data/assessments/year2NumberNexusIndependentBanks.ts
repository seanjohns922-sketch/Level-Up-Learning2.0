import type { Question } from "@/data/assessments/posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentFormKind,
  type AssessmentItemDifficulty,
  type AssessmentResponseMode,
  type IndependentAssessmentItem,
} from "@/data/assessments/assessmentItemStandard";

type Descriptor = "AC9M2N01" | "AC9M2N02" | "AC9M2N03" | "AC9M2N04" | "AC9M2N05" | "AC9M2N06" | "AC9M2A01" | "AC9M2A02" | "AC9M2A03";
type CandidateQuestion = Question & IndependentAssessmentItem;
type RuntimeType = "mcq" | "numeric" | "number_order";

type ItemSpec = {
  descriptor: Descriptor;
  week: number;
  lesson: number;
  skillId: string;
  skillLabel: string;
  difficulty: AssessmentItemDifficulty;
  cognitiveCategory: AssessmentCognitiveCategory;
  responseMode: AssessmentResponseMode;
  misconceptionTags: readonly string[];
  misconceptionDiagnosis?: boolean;
  contextKey: string;
  structureKey: string;
  prompt: string;
  correctAnswer: string;
  type: RuntimeType;
  visual: Record<string, unknown>;
  options?: readonly string[];
};

function candidate(form: AssessmentFormKind, index: number, spec: ItemSpec): CandidateQuestion {
  const selectedAnswerPosition = spec.type === "mcq" ? spec.options?.indexOf(spec.correctAnswer) : undefined;
  const shortForm = form === "pretest" ? "pre" : "post";
  return {
    schemaVersion: 1,
    id: `y2-number-${shortForm}-${String(index + 1).padStart(2, "0")}-v1`,
    version: "1.0.0",
    realm: "number",
    level: 2,
    form,
    origin: "assessment_authored",
    sourcePool: form,
    bankId: `number-nexus-level-2-${form}-v1`,
    primaryDescriptorCode: spec.descriptor,
    descriptorCodes: [spec.descriptor],
    curriculumLessonMapping: [{ week: spec.week, lesson: spec.lesson }],
    cognitiveCategory: spec.cognitiveCategory,
    difficulty: spec.difficulty,
    isTransfer: spec.cognitiveCategory === "transfer",
    requiresReasoning: spec.cognitiveCategory === "reasoning" || spec.cognitiveCategory === "transfer",
    misconceptionDiagnosis: spec.misconceptionDiagnosis ?? false,
    responseMode: spec.responseMode,
    misconceptionTags: spec.misconceptionTags,
    contextKey: spec.contextKey,
    structureKey: spec.structureKey,
    ...(selectedAnswerPosition !== undefined ? { selectedAnswerPosition: selectedAnswerPosition + 1 } : {}),
    prompt: spec.prompt,
    renderer: { type: spec.type === "mcq" ? "selected_response" : spec.type === "numeric" ? "numeric_entry" : spec.type, payload: { prompt: spec.prompt, correctAnswer: spec.correctAnswer, visual: spec.visual, ...(spec.options ? { options: spec.options } : {}) } },
    scoring: { kind: spec.type === "numeric" ? "numeric_tolerance" : "exact", correctResponse: spec.correctAnswer, ...(spec.type === "numeric" ? { tolerance: 0 } : {}) },
    statistics: createUncalibratedItemStatistics(spec.difficulty),
    type: spec.type,
    options: spec.options ? [...spec.options] : undefined,
    correctAnswer: spec.correctAnswer,
    answer: spec.correctAnswer,
    skillId: spec.skillId,
    skillLabel: spec.skillLabel,
    linkedWeeks: [spec.week],
    linkedLessons: [spec.lesson],
    strand: "Number and Algebra",
    curriculumCodes: [spec.descriptor],
    difficultyBand: "year2-number",
    visual: spec.visual,
    inputMode: spec.type === "numeric" ? "decimal" : undefined,
  };
}

const PRETEST_SPECS: readonly ItemSpec[] = [
  { descriptor: "AC9M2N01", week: 1, lesson: 2, skillId: "represent_to_1000", skillLabel: "Represent Numbers", difficulty: "easy", cognitiveCategory: "recall", responseMode: "constructed_response", misconceptionTags: ["numeral-quantity-disconnect"], contextKey: "y2-pre-mab-326", structureKey: "y2-pre-read-hundreds-blocks", prompt: "Each flat is 100, rod is 10 and small block is 1. Write the number.", correctAnswer: "326", type: "numeric", visual: { type: "number_y2_place_value", hundreds: 3, tens: 2, ones: 6 } },
  { descriptor: "AC9M2N01", week: 1, lesson: 3, skillId: "order_to_1000", skillLabel: "Order Numbers", difficulty: "moderate", cognitiveCategory: "application", responseMode: "manipulated_response", misconceptionTags: ["numeral-quantity-disconnect"], contextKey: "y2-pre-order-407-470-740", structureKey: "y2-pre-build-ascending-order", prompt: "Put these numbers in order. Smallest first.", correctAnswer: "407||470||740", type: "number_order", options: ["740", "407", "470"], visual: { type: "number_y2_number_cards", values: [740, 407, 470] } },
  { descriptor: "AC9M2N02", week: 2, lesson: 1, skillId: "place_value_parts", skillLabel: "Partition Numbers", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["place-value-position"], contextKey: "y2-pre-parts-504", structureKey: "y2-pre-combine-hundreds-ones", prompt: "What number do 5 hundreds, 0 tens and 4 ones make?", correctAnswer: "504", type: "numeric", visual: { type: "number_y2_place_value", hundreds: 5, tens: 0, ones: 4 } },
  { descriptor: "AC9M2N02", week: 2, lesson: 3, skillId: "zero_placeholder", skillLabel: "Check Place Value", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["zero-placeholder", "part-whole-conservation"], misconceptionDiagnosis: true, contextKey: "y2-pre-zero-603-error", structureKey: "y2-pre-diagnose-zero-partition", prompt: "Which partition does not make 603?", correctAnswer: "600 + 30", type: "mcq", options: ["600 + 3", "500 + 103", "600 + 30"], visual: { type: "number_y2_partition_choices", whole: 603, choices: [[600, 3], [500, 103], [600, 30]] } },
  { descriptor: "AC9M2N03", week: 12, lesson: 1, skillId: "equal_fraction_parts", skillLabel: "Equal Fraction Parts", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["unequal-fraction-parts"], contextKey: "y2-pre-quarter-four-parts", structureKey: "y2-pre-enter-selected-quarter", prompt: "One of 4 equal parts is selected. Write the numerator.", correctAnswer: "1", type: "numeric", visual: { type: "number_y2_fraction", parts: 4, selected: 1 } },
  { descriptor: "AC9M2N03", week: 12, lesson: 2, skillId: "repeated_halving", skillLabel: "Halves, Quarters and Eighths", difficulty: "moderate", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["denominator-size"], contextKey: "y2-pre-halve-quarter", structureKey: "y2-pre-enter-parts-after-halving", prompt: "Halve each quarter once. How many equal parts are there now?", correctAnswer: "8", type: "numeric", visual: { type: "number_y2_fraction_halving", before: 4, after: 8 } },
  { descriptor: "AC9M2N04", week: 5, lesson: 1, skillId: "addition_strategy", skillLabel: "Add Two-Digit Numbers", difficulty: "easy", cognitiveCategory: "recall", responseMode: "constructed_response", misconceptionTags: ["operation-story-structure"], contextKey: "y2-pre-add-34-25", structureKey: "y2-pre-enter-addition-result", prompt: "What is 34 + 25?", correctAnswer: "59", type: "numeric", visual: { type: "number_y2_equation", expression: "34 + 25 = ?" } },
  { descriptor: "AC9M2N04", week: 6, lesson: 2, skillId: "subtraction_strategy", skillLabel: "Subtract Two-Digit Numbers", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["operation-story-structure"], contextKey: "y2-pre-subtract-82-37", structureKey: "y2-pre-enter-subtraction-result", prompt: "Find 82 - 37.", correctAnswer: "45", type: "numeric", visual: { type: "number_y2_equation", expression: "82 - 37 = ?" } },
  { descriptor: "AC9M2N04", week: 5, lesson: 3, skillId: "strategy_check", skillLabel: "Check an Addition Strategy", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["operation-story-structure"], misconceptionDiagnosis: true, contextKey: "y2-pre-friendly-48-27", structureKey: "y2-pre-diagnose-friendly-number", prompt: "Which strategy correctly solves 48 + 27?", correctAnswer: "50 + 25", type: "mcq", options: ["50 + 25", "40 + 20", "48 + 30"], visual: { type: "number_y2_equation", expression: "48 + 27" } },
  { descriptor: "AC9M2N05", week: 9, lesson: 2, skillId: "array_total", skillLabel: "Read an Array", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["additive-vs-multiplicative"], contextKey: "y2-pre-array-3-5", structureKey: "y2-pre-enter-array-total", prompt: "How many counters are in this array?", correctAnswer: "15", type: "numeric", visual: { type: "number_y2_array", rows: 3, columns: 5 } },
  { descriptor: "AC9M2N05", week: 10, lesson: 1, skillId: "equal_sharing", skillLabel: "Share Equally", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["equal-sharing-vs-grouping"], contextKey: "y2-pre-share-24-4", structureKey: "y2-pre-enter-share-size", prompt: "Share 24 equally among 4 teams. How many does each team get?", correctAnswer: "6", type: "numeric", visual: { type: "number_y2_share", total: 24, groups: 4 } },
  { descriptor: "AC9M2N05", week: 10, lesson: 2, skillId: "grouping_check", skillLabel: "Check Equal Groups", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["equal-sharing-vs-grouping"], misconceptionDiagnosis: true, contextKey: "y2-pre-groups-20-5", structureKey: "y2-pre-diagnose-groups-vs-size", prompt: "20 counters make groups of 5. Which statement is correct?", correctAnswer: "There are 4 groups.", type: "mcq", options: ["There are 4 groups.", "There are 5 groups.", "There are 20 groups."], visual: { type: "number_y2_groups", groups: [5, 5, 5, 5] } },
  { descriptor: "AC9M2N06", week: 11, lesson: 2, skillId: "money_total", skillLabel: "Find a Money Total", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["coin-count-vs-value"], contextKey: "y2-pre-money-six-four", structureKey: "y2-pre-enter-dollar-total", prompt: "A puzzle costs $6. A ball costs $4. Enter the total in dollars.", correctAnswer: "10", type: "numeric", visual: { type: "number_y2_money", amounts: [6, 4], labels: ["Puzzle", "Ball"] } },
  { descriptor: "AC9M2N06", week: 11, lesson: 3, skillId: "money_change", skillLabel: "Calculate Change", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["financial-operation-choice"], contextKey: "y2-pre-change-twenty-thirteen", structureKey: "y2-pre-enter-dollar-change", prompt: "Pay $20 for a $13 item. Enter the change in dollars.", correctAnswer: "7", type: "numeric", visual: { type: "number_y2_money", amounts: [20, 13], labels: ["Paid", "Cost"] } },
  { descriptor: "AC9M2N06", week: 11, lesson: 3, skillId: "operation_choice", skillLabel: "Choose a Money Operation", difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["financial-operation-choice", "operation-story-structure"], misconceptionDiagnosis: true, contextKey: "y2-pre-money-operation", structureKey: "y2-pre-select-change-operation", prompt: "A shopkeeper finds change. Which calculation should they use?", correctAnswer: "Amount paid - cost", type: "mcq", options: ["Amount paid - cost", "Amount paid + cost", "Cost - amount paid"], visual: { type: "number_y2_money", amounts: [20, 14], labels: ["Paid", "Cost"] } },
  { descriptor: "AC9M2A01", week: 8, lesson: 2, skillId: "additive_pattern", skillLabel: "Continue an Additive Pattern", difficulty: "easy", cognitiveCategory: "recall", responseMode: "constructed_response", misconceptionTags: ["pattern-rule-vs-example"], contextKey: "y2-pre-pattern-plus-5", structureKey: "y2-pre-enter-next-pattern-term", prompt: "What number comes next?", correctAnswer: "35", type: "numeric", visual: { type: "number_y2_sequence", values: [15, 20, 25, 30, null], rule: "+5" } },
  { descriptor: "AC9M2A01", week: 8, lesson: 3, skillId: "missing_pattern_term", skillLabel: "Find a Missing Pattern Term", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["pattern-rule-vs-example"], contextKey: "y2-pre-pattern-minus-10", structureKey: "y2-pre-enter-middle-decreasing-term", prompt: "The rule is subtract 10. Fill the gap.", correctAnswer: "60", type: "numeric", visual: { type: "number_y2_sequence", values: [80, 70, null, 50, 40], rule: "-10" } },
  { descriptor: "AC9M2A02", week: 7, lesson: 1, skillId: "inverse_fact", skillLabel: "Related Addition and Subtraction", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["inverse-addition-subtraction"], contextKey: "y2-pre-inverse-13-7", structureKey: "y2-pre-enter-related-difference", prompt: "13 + 7 = 20. What is 20 - 13?", correctAnswer: "7", type: "numeric", visual: { type: "number_y2_fact_family", family: [13, 7, 20], missing: "difference" } },
  { descriptor: "AC9M2A02", week: 7, lesson: 3, skillId: "derive_subtraction", skillLabel: "Derive a Related Fact", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["fact-recall-transfer"], contextKey: "y2-pre-inverse-9-8", structureKey: "y2-pre-enter-inverse-result", prompt: "Use 9 + 8 = 17. Find 17 - 8.", correctAnswer: "9", type: "numeric", visual: { type: "number_y2_fact_family", family: [9, 8, 17], missing: "part" } },
  { descriptor: "AC9M2A03", week: 10, lesson: 3, skillId: "derive_twos_division", skillLabel: "Derive a Twos Division Fact", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["fact-recall-transfer"], contextKey: "y2-pre-double-8", structureKey: "y2-pre-enter-related-halving-fact", prompt: "Double 8 is 16. Halve 16 into 2 equal groups. How many in each?", correctAnswer: "8", type: "numeric", visual: { type: "number_y2_double_halve", factor: 8, total: 16 } },
] as const;

const POSTTEST_SPECS: readonly ItemSpec[] = [
  { descriptor: "AC9M2N01", week: 1, lesson: 2, skillId: "represent_to_1000", skillLabel: "Represent Numbers", difficulty: "easy", cognitiveCategory: "recall", responseMode: "constructed_response", misconceptionTags: ["numeral-quantity-disconnect"], contextKey: "y2-post-mab-542", structureKey: "y2-post-read-hundreds-blocks", prompt: "Read the blocks. Flats show 100, rods show 10 and small blocks show 1.", correctAnswer: "542", type: "numeric", visual: { type: "number_y2_place_value", hundreds: 5, tens: 4, ones: 2 } },
  { descriptor: "AC9M2N01", week: 1, lesson: 3, skillId: "order_to_1000", skillLabel: "Order Numbers", difficulty: "moderate", cognitiveCategory: "application", responseMode: "manipulated_response", misconceptionTags: ["numeral-quantity-disconnect"], contextKey: "y2-post-order-609-690-906", structureKey: "y2-post-build-descending-order", prompt: "Put these numbers in order. Largest first.", correctAnswer: "906||690||609", type: "number_order", options: ["609", "906", "690"], visual: { type: "number_y2_number_cards", values: [609, 906, 690] } },
  { descriptor: "AC9M2N02", week: 2, lesson: 1, skillId: "place_value_parts", skillLabel: "Partition Numbers", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["place-value-position"], contextKey: "y2-post-parts-708", structureKey: "y2-post-combine-hundreds-ones", prompt: "What number do 7 hundreds, 0 tens and 8 ones make?", correctAnswer: "708", type: "numeric", visual: { type: "number_y2_place_value", hundreds: 7, tens: 0, ones: 8 } },
  { descriptor: "AC9M2N02", week: 2, lesson: 3, skillId: "partition_check", skillLabel: "Check a Partition", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["nonstandard-partition", "part-whole-conservation"], misconceptionDiagnosis: true, contextKey: "y2-post-partition-482-error", structureKey: "y2-post-diagnose-changed-whole", prompt: "Which partition does not make 482?", correctAnswer: "400 + 28", type: "mcq", options: ["400 + 82", "300 + 182", "400 + 28"], visual: { type: "number_y2_partition_choices", whole: 482, choices: [[400, 82], [300, 182], [400, 28]] } },
  { descriptor: "AC9M2N03", week: 12, lesson: 1, skillId: "equal_fraction_parts", skillLabel: "Equal Fraction Parts", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["unequal-fraction-parts"], contextKey: "y2-post-three-quarters", structureKey: "y2-post-enter-selected-parts", prompt: "How many of the 4 equal parts are selected?", correctAnswer: "3", type: "numeric", visual: { type: "number_y2_fraction", parts: 4, selected: 3 } },
  { descriptor: "AC9M2N03", week: 12, lesson: 2, skillId: "repeated_halving", skillLabel: "Halves, Quarters and Eighths", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["denominator-size", "fraction-whole"], contextKey: "y2-post-two-quarters-eighths", structureKey: "y2-post-enter-equivalent-eighths", prompt: "Two quarters cover the same amount as how many eighths?", correctAnswer: "4", type: "numeric", visual: { type: "number_y2_fraction_compare", left: [2, 4], right: [null, 8] } },
  { descriptor: "AC9M2N04", week: 5, lesson: 2, skillId: "addition_strategy", skillLabel: "Add Two-Digit Numbers", difficulty: "easy", cognitiveCategory: "recall", responseMode: "constructed_response", misconceptionTags: ["operation-story-structure"], contextKey: "y2-post-add-46-37", structureKey: "y2-post-enter-addition-result", prompt: "What is 46 + 37?", correctAnswer: "83", type: "numeric", visual: { type: "number_y2_equation", expression: "46 + 37 = ?" } },
  { descriptor: "AC9M2N04", week: 6, lesson: 2, skillId: "subtraction_strategy", skillLabel: "Subtract Two-Digit Numbers", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["operation-story-structure"], contextKey: "y2-post-subtract-94-58", structureKey: "y2-post-enter-subtraction-result", prompt: "Find 94 - 58.", correctAnswer: "36", type: "numeric", visual: { type: "number_y2_equation", expression: "94 - 58 = ?" } },
  { descriptor: "AC9M2N04", week: 6, lesson: 3, skillId: "strategy_check", skillLabel: "Check a Subtraction Strategy", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["operation-story-structure"], misconceptionDiagnosis: true, contextKey: "y2-post-subtraction-strategy-73-28", structureKey: "y2-post-diagnose-subtraction-step", prompt: "Which strategy correctly solves 73 - 28?", correctAnswer: "73 - 30 + 2", type: "mcq", options: ["73 - 30 + 2", "73 - 20 + 8", "73 + 30 - 2"], visual: { type: "number_y2_equation", expression: "73 - 28" } },
  { descriptor: "AC9M2N05", week: 9, lesson: 2, skillId: "array_total", skillLabel: "Read an Array", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["additive-vs-multiplicative"], contextKey: "y2-post-array-4-6", structureKey: "y2-post-enter-array-total", prompt: "Find the total in this array.", correctAnswer: "24", type: "numeric", visual: { type: "number_y2_array", rows: 4, columns: 6 } },
  { descriptor: "AC9M2N05", week: 10, lesson: 2, skillId: "equal_grouping", skillLabel: "Make Equal Groups", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["equal-sharing-vs-grouping"], contextKey: "y2-post-group-30-by-5", structureKey: "y2-post-enter-number-groups", prompt: "Put 30 counters into groups of 5. How many groups?", correctAnswer: "6", type: "numeric", visual: { type: "number_y2_groups", total: 30, groupSize: 5 } },
  { descriptor: "AC9M2N05", week: 10, lesson: 1, skillId: "sharing_check", skillLabel: "Check Equal Sharing", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["equal-sharing-vs-grouping"], misconceptionDiagnosis: true, contextKey: "y2-post-share-18-3", structureKey: "y2-post-diagnose-share-size", prompt: "18 counters are shared among 3 teams. Which statement is correct?", correctAnswer: "Each team gets 6.", type: "mcq", options: ["Each team gets 6.", "Each team gets 3.", "There are 18 teams."], visual: { type: "number_y2_share", total: 18, groups: 3 } },
  { descriptor: "AC9M2N06", week: 11, lesson: 2, skillId: "money_total", skillLabel: "Find a Money Total", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["coin-count-vs-value"], contextKey: "y2-post-money-nine-six", structureKey: "y2-post-enter-dollar-total", prompt: "A book costs $9. A game costs $6. Enter the total in dollars.", correctAnswer: "15", type: "numeric", visual: { type: "number_y2_money", amounts: [9, 6], labels: ["Book", "Game"] } },
  { descriptor: "AC9M2N06", week: 11, lesson: 3, skillId: "money_change", skillLabel: "Calculate Change", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["financial-operation-choice"], contextKey: "y2-post-change-twenty-twelve", structureKey: "y2-post-enter-dollar-change", prompt: "An item costs $12. You pay $20. Enter the change in dollars.", correctAnswer: "8", type: "numeric", visual: { type: "number_y2_money", amounts: [20, 12], labels: ["Paid", "Cost"] } },
  { descriptor: "AC9M2N06", week: 11, lesson: 3, skillId: "model_money", skillLabel: "Check a Money Model", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["financial-operation-choice", "coin-count-vs-value"], misconceptionDiagnosis: true, contextKey: "y2-post-money-model-change", structureKey: "y2-post-diagnose-change-model", prompt: "Which equation correctly finds the change?", correctAnswer: "20 - 13 = 7", type: "mcq", options: ["20 - 13 = 7", "20 + 13 = 33", "13 - 20 = 7"], visual: { type: "number_y2_money", amounts: [20, 13], labels: ["Paid", "Cost"] } },
  { descriptor: "AC9M2A01", week: 8, lesson: 2, skillId: "additive_pattern", skillLabel: "Continue an Additive Pattern", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["pattern-rule-vs-example"], contextKey: "y2-post-pattern-plus-5", structureKey: "y2-post-enter-next-pattern-term", prompt: "Complete this increasing pattern.", correctAnswer: "55", type: "numeric", visual: { type: "number_y2_sequence", values: [35, 40, 45, 50, null], rule: "+5" } },
  { descriptor: "AC9M2A01", week: 8, lesson: 3, skillId: "create_pattern", skillLabel: "Apply an Additive Rule", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["pattern-rule-vs-example"], contextKey: "y2-post-pattern-minus-20", structureKey: "y2-post-enter-decreasing-term", prompt: "Start at 140. Subtract 20 three times. Where do you land?", correctAnswer: "80", type: "numeric", visual: { type: "number_y2_sequence", values: [140, 120, 100, null], rule: "-20" } },
  { descriptor: "AC9M2A02", week: 7, lesson: 1, skillId: "inverse_fact", skillLabel: "Related Addition and Subtraction", difficulty: "moderate", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["inverse-addition-subtraction"], contextKey: "y2-post-inverse-12-9", structureKey: "y2-post-enter-related-difference", prompt: "12 + 9 = 21. What is 21 - 12?", correctAnswer: "9", type: "numeric", visual: { type: "number_y2_fact_family", family: [12, 9, 21], missing: "difference" } },
  { descriptor: "AC9M2A02", week: 7, lesson: 3, skillId: "fact_transfer", skillLabel: "Use a Related Fact", difficulty: "challenging", cognitiveCategory: "transfer", responseMode: "constructed_response", misconceptionTags: ["fact-recall-transfer"], misconceptionDiagnosis: true, contextKey: "y2-post-transfer-17-8", structureKey: "y2-post-transfer-find-removed", prompt: "17 players started. 8 remain. How many left the game?", correctAnswer: "9", type: "numeric", visual: { type: "number_y2_part_whole", whole: 17, parts: [8, null] } },
  { descriptor: "AC9M2A03", week: 10, lesson: 3, skillId: "derive_twos_division", skillLabel: "Derive a Twos Division Fact", difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["fact-recall-transfer"], misconceptionDiagnosis: true, contextKey: "y2-post-double-9", structureKey: "y2-post-diagnose-related-halving-fact", prompt: "Double 9 is 18. Which related halving fact is true?", correctAnswer: "18 ÷ 2 = 9", type: "mcq", options: ["18 ÷ 2 = 9", "18 ÷ 9 = 9", "9 ÷ 2 = 18"], visual: { type: "number_y2_double_halve", factor: 9, total: 18 } },
] as const;

export const YEAR2_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS: readonly CandidateQuestion[] = PRETEST_SPECS.map((spec, index) => candidate("pretest", index, spec));
export const YEAR2_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS: readonly CandidateQuestion[] = POSTTEST_SPECS.map((spec, index) => candidate("posttest", index, spec));
