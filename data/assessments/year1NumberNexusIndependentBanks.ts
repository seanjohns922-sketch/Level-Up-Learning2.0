import type { Question } from "@/data/assessments/posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentFormKind,
  type AssessmentItemDifficulty,
  type AssessmentResponseMode,
  type IndependentAssessmentItem,
} from "@/data/assessments/assessmentItemStandard";

type Descriptor =
  | "AC9M1N01"
  | "AC9M1N02"
  | "AC9M1N03"
  | "AC9M1N04"
  | "AC9M1N05"
  | "AC9M1N06"
  | "AC9M1A01"
  | "AC9M1A02";

type CandidateQuestion = Question & IndependentAssessmentItem;
type RuntimeType = "mcq" | "numeric" | "number_order" | "pattern_build";

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
  const formLabel = form === "pretest" ? "pre" : "post";

  return {
    schemaVersion: 1,
    id: `y1-number-${formLabel}-${String(index + 1).padStart(2, "0")}-v1`,
    version: "1.0.0",
    realm: "number",
    level: 1,
    form,
    origin: "assessment_authored",
    sourcePool: form,
    bankId: `number-nexus-level-1-${form}-v1`,
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
    renderer: {
      type: spec.type === "mcq" ? "selected_response" : spec.type === "numeric" ? "numeric_entry" : spec.type,
      payload: { prompt: spec.prompt, correctAnswer: spec.correctAnswer, visual: spec.visual, ...(spec.options ? { options: spec.options } : {}) },
    },
    scoring: {
      kind: spec.type === "numeric" ? "numeric_tolerance" : "exact",
      correctResponse: spec.correctAnswer,
      ...(spec.type === "numeric" ? { tolerance: 0 } : {}),
    },
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
    difficultyBand: "year1-number",
    visual: spec.visual,
    inputMode: spec.type === "numeric" ? "decimal" : undefined,
  };
}

const PRETEST_SPECS: readonly ItemSpec[] = [
  { descriptor: "AC9M1N01", week: 1, lesson: 1, skillId: "represent_number", skillLabel: "Represent Numbers", difficulty: "easy", cognitiveCategory: "recall", responseMode: "constructed_response", misconceptionTags: ["numeral-quantity-disconnect"], contextKey: "y1-pre-four-tens-six-ones", structureKey: "y1-pre-enter-block-number", prompt: "What number is shown?", correctAnswer: "46", type: "numeric", visual: { type: "number_y1_place_value", tens: 4, ones: 6 } },
  { descriptor: "AC9M1N02", week: 3, lesson: 1, skillId: "tens_and_ones", skillLabel: "Tens and Ones", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["place-value-position"], contextKey: "y1-pre-three-tens-eight-ones", structureKey: "y1-pre-combine-tens-ones", prompt: "What number do these parts make?", correctAnswer: "38", type: "numeric", visual: { type: "number_y1_part_whole", whole: null, parts: [30, 8] } },
  { descriptor: "AC9M1N03", week: 4, lesson: 1, skillId: "equal_groups_total", skillLabel: "Total Equal Groups", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["skip-count-step"], contextKey: "y1-pre-four-groups-five", structureKey: "y1-pre-enter-grouped-total", prompt: "How many counters altogether?", correctAnswer: "20", type: "numeric", visual: { type: "number_y1_groups", groups: [5, 5, 5, 5] } },
  { descriptor: "AC9M1N04", week: 5, lesson: 1, skillId: "addition_facts", skillLabel: "Add Within 20", difficulty: "easy", cognitiveCategory: "recall", responseMode: "constructed_response", misconceptionTags: ["operation-story-structure"], contextKey: "y1-pre-eight-plus-six", structureKey: "y1-pre-enter-addition-fact", prompt: "What is 8 + 6?", correctAnswer: "14", type: "numeric", visual: { type: "number_y1_equation", expression: "8 + 6 = ?" } },
  { descriptor: "AC9M1N05", week: 7, lesson: 1, skillId: "practical_addition", skillLabel: "Solve an Addition Story", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["operation-story-structure"], contextKey: "y1-pre-six-five-books", structureKey: "y1-pre-enter-combined-story-total", prompt: "6 books are red. 5 are blue. How many books?", correctAnswer: "11", type: "numeric", visual: { type: "number_y1_change", start: 6, change: 5, action: "combine", token: "book" } },
  { descriptor: "AC9M1N06", week: 9, lesson: 1, skillId: "equal_sharing", skillLabel: "Share Equally", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["equal-sharing-vs-grouping"], contextKey: "y1-pre-twelve-three-plates", structureKey: "y1-pre-enter-share-size", prompt: "Share 12 equally onto 3 plates. How many on each?", correctAnswer: "4", type: "numeric", visual: { type: "number_y1_share", total: 12, groups: 3 } },
  { descriptor: "AC9M1A01", week: 4, lesson: 2, skillId: "skip_count_twos", skillLabel: "Skip Count by Twos", difficulty: "easy", cognitiveCategory: "recall", responseMode: "constructed_response", misconceptionTags: ["skip-count-step"], contextKey: "y1-pre-two-four-six-next", structureKey: "y1-pre-enter-next-skip-term", prompt: "What number comes next?", correctAnswer: "8", type: "numeric", visual: { type: "number_y1_sequence", values: [2, 4, 6, null] } },
  { descriptor: "AC9M1A02", week: 11, lesson: 1, skillId: "repeat_pattern", skillLabel: "Continue a Pattern", difficulty: "easy", cognitiveCategory: "recall", responseMode: "manipulated_response", misconceptionTags: ["repeating-unit"], contextKey: "y1-pre-star-robot-repeat", structureKey: "y1-pre-build-next-pattern-part", prompt: "Add the next part.", correctAnswer: "star", type: "pattern_build", options: ["star", "robot", "crystal"], visual: { type: "number_y1_pattern", sequence: ["star", "robot", "star", "robot", "?"], answerSlots: 1 } },
  { descriptor: "AC9M1N01", week: 2, lesson: 1, skillId: "number_sequence", skillLabel: "Complete a Number Sequence", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["numeral-quantity-disconnect"], contextKey: "y1-pre-sixty-seven-gap", structureKey: "y1-pre-enter-number-path-gap", prompt: "Fill the gap in the number path.", correctAnswer: "69", type: "numeric", visual: { type: "number_y1_sequence", values: [67, 68, null, 70] } },
  { descriptor: "AC9M1N04", week: 6, lesson: 1, skillId: "missing_part", skillLabel: "Find a Missing Part", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["operation-story-structure"], contextKey: "y1-pre-whole-twelve-part-five", structureKey: "y1-pre-enter-missing-part", prompt: "The whole is 12. One part is 5. Find the other part.", correctAnswer: "7", type: "numeric", visual: { type: "number_y1_part_whole", whole: 12, parts: [5, null] } },
  { descriptor: "AC9M1N02", week: 3, lesson: 2, skillId: "nonstandard_partition", skillLabel: "Partition Numbers", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["nonstandard-partition", "part-whole-conservation"], contextKey: "y1-pre-forty-seven-twenty", structureKey: "y1-pre-enter-nonstandard-part", prompt: "47 is 20 and what other part?", correctAnswer: "27", type: "numeric", visual: { type: "number_y1_part_whole", whole: 47, parts: [20, null] } },
  { descriptor: "AC9M1N03", week: 4, lesson: 3, skillId: "efficient_grouping", skillLabel: "Choose Efficient Groups", difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["skip-count-step"], misconceptionDiagnosis: true, contextKey: "y1-pre-thirty-counters-efficient", structureKey: "y1-pre-select-efficient-equal-groups", prompt: "Which grouping makes 30 easiest to count?", correctAnswer: "3 groups of 10", type: "mcq", options: ["3 groups of 10", "6 groups of 4", "4 groups of 8"], visual: { type: "number_y1_group_choices", totals: [30, 24, 32] } },
  { descriptor: "AC9M1N04", week: 6, lesson: 2, skillId: "subtraction_within_20", skillLabel: "Subtract Within 20", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["operation-story-structure"], contextKey: "y1-pre-seventeen-minus-nine", structureKey: "y1-pre-enter-subtraction-result", prompt: "What is 17 - 9?", correctAnswer: "8", type: "numeric", visual: { type: "number_y1_equation", expression: "17 - 9 = ?" } },
  { descriptor: "AC9M1N05", week: 8, lesson: 1, skillId: "money_total", skillLabel: "Find a Money Total", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["coin-count-vs-value"], contextKey: "y1-pre-four-dollar-three-dollar", structureKey: "y1-pre-enter-money-total", prompt: "A game costs $4. A ball costs $3. How much altogether?", correctAnswer: "7", type: "numeric", visual: { type: "number_y1_money", amounts: [4, 3], unit: "$" } },
  { descriptor: "AC9M1N06", week: 10, lesson: 1, skillId: "equal_grouping", skillLabel: "Make Equal Groups", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["equal-sharing-vs-grouping"], contextKey: "y1-pre-sixteen-groups-four", structureKey: "y1-pre-enter-number-of-groups", prompt: "Put 16 into groups of 4. How many groups?", correctAnswer: "4", type: "numeric", visual: { type: "number_y1_groups", total: 16, groupSize: 4 } },
  { descriptor: "AC9M1A01", week: 4, lesson: 3, skillId: "skip_count_fives", skillLabel: "Skip Count by Fives", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["skip-count-step"], contextKey: "y1-pre-twenty-five-gap-thirty-five", structureKey: "y1-pre-enter-middle-skip-term", prompt: "Fill the gap in the skip-count.", correctAnswer: "30", type: "numeric", visual: { type: "number_y1_sequence", values: [20, 25, null, 35, 40] } },
  { descriptor: "AC9M1A02", week: 11, lesson: 2, skillId: "continue_pattern", skillLabel: "Continue a Repeating Pattern", difficulty: "moderate", cognitiveCategory: "understanding", responseMode: "manipulated_response", misconceptionTags: ["repeating-unit"], contextKey: "y1-pre-two-star-one-robot", structureKey: "y1-pre-build-two-pattern-parts", prompt: "Build the next 2 parts.", correctAnswer: "star||star", type: "pattern_build", options: ["star", "robot", "crystal"], visual: { type: "number_y1_pattern", sequence: ["star", "star", "robot", "star", "star", "robot", "?", "?"], answerSlots: 2 } },
  { descriptor: "AC9M1N01", week: 2, lesson: 2, skillId: "order_numbers", skillLabel: "Order Numbers", difficulty: "moderate", cognitiveCategory: "application", responseMode: "manipulated_response", misconceptionTags: ["numeral-quantity-disconnect"], contextKey: "y1-pre-thirty-nine-seventy-four-fifty-two", structureKey: "y1-pre-build-ascending-order", prompt: "Put the numbers in order. Smallest first.", correctAnswer: "39||52||74", type: "number_order", options: ["74", "39", "52"], visual: { type: "number_y1_number_cards", values: [74, 39, 52] } },
  { descriptor: "AC9M1N05", week: 8, lesson: 2, skillId: "compare_coin_value", skillLabel: "Compare Money", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["coin-count-vs-value"], misconceptionDiagnosis: true, contextKey: "y1-pre-coin-count-value", structureKey: "y1-pre-diagnose-more-coins", prompt: "Mia has more coins. Does she always have more money?", correctAnswer: "No. Coin values matter.", type: "mcq", options: ["Yes. More coins means more money.", "No. Coin values matter.", "Yes. All coins have the same value."], visual: { type: "number_y1_money_compare", groups: [[1, 1, 1, 1], [10]] } },
  { descriptor: "AC9M1N06", week: 9, lesson: 3, skillId: "judge_equal_share", skillLabel: "Judge Equal Sharing", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["equal-sharing-vs-grouping"], misconceptionDiagnosis: true, contextKey: "y1-pre-ten-share-six-four", structureKey: "y1-pre-diagnose-unequal-share", prompt: "Is this share equal?", correctAnswer: "No", type: "mcq", options: ["Yes", "No"], visual: { type: "number_y1_groups", groups: [6, 4] } },
] as const;

const POSTTEST_SPECS: readonly ItemSpec[] = [
  { descriptor: "AC9M1N01", week: 1, lesson: 1, skillId: "represent_number", skillLabel: "Represent Numbers", difficulty: "easy", cognitiveCategory: "recall", responseMode: "constructed_response", misconceptionTags: ["numeral-quantity-disconnect"], contextKey: "y1-post-seven-tens-three-ones", structureKey: "y1-post-enter-block-number", prompt: "Write the number shown.", correctAnswer: "73", type: "numeric", visual: { type: "number_y1_place_value", tens: 7, ones: 3 } },
  { descriptor: "AC9M1N02", week: 3, lesson: 1, skillId: "place_value", skillLabel: "Partition Numbers", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["place-value-position"], contextKey: "y1-post-sixty-four-tens", structureKey: "y1-post-enter-tens-count", prompt: "How many tens are in 64?", correctAnswer: "6", type: "numeric", visual: { type: "number_y1_place_value", number: 64, hide: "tens" } },
  { descriptor: "AC9M1N03", week: 4, lesson: 1, skillId: "equal_groups_total", skillLabel: "Total Equal Groups", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["skip-count-step"], contextKey: "y1-post-five-groups-two", structureKey: "y1-post-enter-grouped-total", prompt: "Find the total number of counters.", correctAnswer: "10", type: "numeric", visual: { type: "number_y1_groups", groups: [2, 2, 2, 2, 2] } },
  { descriptor: "AC9M1N04", week: 5, lesson: 1, skillId: "subtraction_facts", skillLabel: "Subtract Within 20", difficulty: "easy", cognitiveCategory: "recall", responseMode: "constructed_response", misconceptionTags: ["operation-story-structure"], contextKey: "y1-post-thirteen-minus-five", structureKey: "y1-post-enter-subtraction-fact", prompt: "What is 13 - 5?", correctAnswer: "8", type: "numeric", visual: { type: "number_y1_equation", expression: "13 - 5 = ?" } },
  { descriptor: "AC9M1N05", week: 7, lesson: 1, skillId: "practical_addition", skillLabel: "Solve an Addition Story", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["operation-story-structure"], contextKey: "y1-post-seven-four-seedlings", structureKey: "y1-post-enter-combined-story-total", prompt: "7 seedlings grow here. 4 grow there. How many seedlings?", correctAnswer: "11", type: "numeric", visual: { type: "number_y1_change", start: 7, change: 4, action: "combine", token: "plant" } },
  { descriptor: "AC9M1N06", week: 9, lesson: 1, skillId: "equal_sharing", skillLabel: "Share Equally", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["equal-sharing-vs-grouping"], contextKey: "y1-post-fifteen-three-bowls", structureKey: "y1-post-enter-share-size", prompt: "Share 15 equally into 3 bowls. How many in each?", correctAnswer: "5", type: "numeric", visual: { type: "number_y1_share", total: 15, groups: 3 } },
  { descriptor: "AC9M1A01", week: 4, lesson: 2, skillId: "skip_count_fives", skillLabel: "Skip Count by Fives", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["skip-count-step"], contextKey: "y1-post-five-ten-fifteen-next", structureKey: "y1-post-enter-next-skip-term", prompt: "Continue this skip-count.", correctAnswer: "20", type: "numeric", visual: { type: "number_y1_sequence", values: [5, 10, 15, null] } },
  { descriptor: "AC9M1A02", week: 11, lesson: 1, skillId: "repeat_pattern", skillLabel: "Continue a Pattern", difficulty: "moderate", cognitiveCategory: "understanding", responseMode: "manipulated_response", misconceptionTags: ["repeating-unit"], contextKey: "y1-post-robot-crystal-crystal", structureKey: "y1-post-build-next-pattern-part", prompt: "Complete this pattern.", correctAnswer: "robot", type: "pattern_build", options: ["robot", "crystal", "star"], visual: { type: "number_y1_pattern", sequence: ["robot", "crystal", "crystal", "robot", "crystal", "crystal", "?"], answerSlots: 1 } },
  { descriptor: "AC9M1N01", week: 2, lesson: 2, skillId: "order_numbers", skillLabel: "Order Numbers", difficulty: "moderate", cognitiveCategory: "application", responseMode: "manipulated_response", misconceptionTags: ["numeral-quantity-disconnect"], contextKey: "y1-post-eighty-six-forty-nine-sixty-one", structureKey: "y1-post-build-descending-order", prompt: "Put the numbers in order. Largest first.", correctAnswer: "86||61||49", type: "number_order", options: ["49", "86", "61"], visual: { type: "number_y1_number_cards", values: [49, 86, 61] } },
  { descriptor: "AC9M1N02", week: 3, lesson: 3, skillId: "diagnose_partition", skillLabel: "Check a Partition", difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["nonstandard-partition", "part-whole-conservation"], misconceptionDiagnosis: true, contextKey: "y1-post-fifty-two-partitions", structureKey: "y1-post-diagnose-changed-whole", prompt: "Which partition does not make 52?", correctAnswer: "40 and 2", type: "mcq", options: ["50 and 2", "30 and 22", "40 and 2"], visual: { type: "number_y1_partition_choices", whole: 52, choices: [[50, 2], [30, 22], [40, 2]] } },
  { descriptor: "AC9M1N03", week: 4, lesson: 3, skillId: "group_and_total", skillLabel: "Group and Count", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["skip-count-step"], contextKey: "y1-post-six-groups-five", structureKey: "y1-post-enter-efficient-group-total", prompt: "Find this grouped total.", correctAnswer: "30", type: "numeric", visual: { type: "number_y1_groups", groups: [5, 5, 5, 5, 5, 5] } },
  { descriptor: "AC9M1N04", week: 6, lesson: 2, skillId: "missing_part", skillLabel: "Find a Missing Part", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["operation-story-structure"], contextKey: "y1-post-whole-eighteen-part-eleven", structureKey: "y1-post-enter-missing-part", prompt: "The whole is 18. One part is 11. Find the other part.", correctAnswer: "7", type: "numeric", visual: { type: "number_y1_part_whole", whole: 18, parts: [11, null] } },
  { descriptor: "AC9M1N05", week: 8, lesson: 1, skillId: "money_total", skillLabel: "Find a Money Total", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["coin-count-vs-value"], contextKey: "y1-post-six-dollar-five-dollar", structureKey: "y1-post-enter-money-total", prompt: "A puzzle costs $6. A kite costs $5. How much altogether?", correctAnswer: "11", type: "numeric", visual: { type: "number_y1_money", amounts: [6, 5], unit: "$" } },
  { descriptor: "AC9M1N06", week: 10, lesson: 1, skillId: "equal_grouping", skillLabel: "Make Equal Groups", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["equal-sharing-vs-grouping"], contextKey: "y1-post-eighteen-groups-three", structureKey: "y1-post-enter-number-of-groups", prompt: "Put 18 into groups of 3. How many groups?", correctAnswer: "6", type: "numeric", visual: { type: "number_y1_groups", total: 18, groupSize: 3 } },
  { descriptor: "AC9M1A01", week: 4, lesson: 3, skillId: "skip_count_tens", skillLabel: "Skip Count by Tens", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["skip-count-step"], contextKey: "y1-post-forty-gap-sixty", structureKey: "y1-post-enter-middle-skip-term", prompt: "Complete the count by tens.", correctAnswer: "50", type: "numeric", visual: { type: "number_y1_sequence", values: [30, 40, null, 60, 70] } },
  { descriptor: "AC9M1A02", week: 11, lesson: 3, skillId: "create_pattern", skillLabel: "Create a Repeating Pattern", difficulty: "challenging", cognitiveCategory: "application", responseMode: "manipulated_response", misconceptionTags: ["repeating-unit"], contextKey: "y1-post-star-star-crystal-unit", structureKey: "y1-post-build-complete-repeat", prompt: "Build one more repeat.", correctAnswer: "star||star||crystal", type: "pattern_build", options: ["star", "crystal", "robot"], visual: { type: "number_y1_pattern", sequence: ["star", "star", "crystal", "star", "star", "crystal", "?", "?", "?"], answerSlots: 3 } },
  { descriptor: "AC9M1N01", week: 2, lesson: 3, skillId: "repair_number_line", skillLabel: "Check a Number Line", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["numeral-quantity-disconnect"], misconceptionDiagnosis: true, contextKey: "y1-post-number-line-sixty-two-error", structureKey: "y1-post-diagnose-number-path-placement", prompt: "Which number is in the wrong place?", correctAnswer: "62", type: "mcq", options: ["58", "62", "64"], visual: { type: "number_y1_sequence", values: [58, 59, 62, 61, 64] } },
  { descriptor: "AC9M1N04", week: 7, lesson: 3, skillId: "compare_strategies", skillLabel: "Compare Calculation Strategies", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["operation-story-structure"], misconceptionDiagnosis: true, contextKey: "y1-post-fourteen-minus-six-strategies", structureKey: "y1-post-select-correct-strategy", prompt: "Which strategy correctly finds 14 - 6?", correctAnswer: "Take 4, then take 2 more.", type: "mcq", options: ["Add 6 to 14.", "Take 4, then take 2 more.", "Take 6 from 10 only."], visual: { type: "number_y1_equation", expression: "14 - 6 = ?" } },
  { descriptor: "AC9M1N06", week: 9, lesson: 3, skillId: "diagnose_grouping", skillLabel: "Check Equal Groups", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["equal-sharing-vs-grouping"], misconceptionDiagnosis: true, contextKey: "y1-post-fourteen-groups-four", structureKey: "y1-post-diagnose-leftover-grouping", prompt: "Can 14 counters make equal groups of 4 with none left?", correctAnswer: "No", type: "mcq", options: ["Yes", "No"], visual: { type: "number_y1_groups", groups: [4, 4, 4, 2] } },
  { descriptor: "AC9M1N05", week: 8, lesson: 3, skillId: "money_transfer", skillLabel: "Solve a Money Problem", difficulty: "challenging", cognitiveCategory: "transfer", responseMode: "constructed_response", misconceptionTags: ["financial-operation-choice", "operation-story-structure"], misconceptionDiagnosis: true, contextKey: "y1-post-market-twelve-five-two", structureKey: "y1-post-transfer-money-left", prompt: "You have $12. You buy items for $5 and $2. How much is left?", correctAnswer: "5", type: "numeric", visual: { type: "number_y1_money", amounts: [12, 5, 2], roles: ["have", "spend", "spend"], unit: "$" } },
] as const;

export const YEAR1_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS: readonly CandidateQuestion[] =
  PRETEST_SPECS.map((spec, index) => candidate("pretest", index, spec));

export const YEAR1_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS: readonly CandidateQuestion[] =
  POSTTEST_SPECS.map((spec, index) => candidate("posttest", index, spec));
