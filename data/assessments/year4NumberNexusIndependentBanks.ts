import type { Question } from "@/data/assessments/posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentFormKind,
  type AssessmentItemDifficulty,
  type AssessmentResponseMode,
  type IndependentAssessmentItem,
} from "@/data/assessments/assessmentItemStandard";

type Descriptor = "AC9M4N01" | "AC9M4N02" | "AC9M4N03" | "AC9M4N04" | "AC9M4N05" | "AC9M4N06" | "AC9M4N07" | "AC9M4N08" | "AC9M4N09";
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
    id: `y4-number-${shortForm}-${String(index + 1).padStart(2, "0")}-v1`,
    version: "1.0.0",
    realm: "number",
    level: 4,
    form,
    origin: "assessment_authored",
    sourcePool: form,
    bankId: `number-nexus-level-4-${form}-v1`,
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
    difficultyBand: "year4-number",
    visual: spec.visual,
    inputMode: spec.type === "numeric" ? "decimal" : undefined,
  };
}

const PRETEST_SPECS: readonly ItemSpec[] = [
  { descriptor: "AC9M4N01", week: 1, lesson: 1, skillId: "decimal_place_value", skillLabel: "Decimal Place Value", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["decimal-place-value"], contextKey: "y4-pre-decimal-347", structureKey: "y4-pre-enter-tenths-value", prompt: "What value does the digit 4 have?", correctAnswer: "0.4", type: "numeric", visual: { type: "number_y4_decimal_chart", value: "3.47", focus: "tenths" } },
  { descriptor: "AC9M4N01", week: 2, lesson: 1, skillId: "compare_decimals", skillLabel: "Compare Decimals", difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["decimal-length"], misconceptionDiagnosis: true, contextKey: "y4-pre-decimal-48-479", structureKey: "y4-pre-diagnose-decimal-length", prompt: "Compare the two decimals.", correctAnswer: "4.8 is greater than 4.79", type: "mcq", options: ["4.8 is greater than 4.79", "4.79 is greater because it has more digits", "The numbers are equal"], visual: { type: "number_y4_decimal_compare", left: "4.8", right: "4.79" } },
  { descriptor: "AC9M4N02", week: 3, lesson: 1, skillId: "classify_parity", skillLabel: "Classify Odd and Even", difficulty: "easy", cognitiveCategory: "recall", responseMode: "constructed_response", misconceptionTags: ["odd-even-properties"], contextKey: "y4-pre-parity-count", structureKey: "y4-pre-count-even-values", prompt: "How many numbers are even?", correctAnswer: "3", type: "numeric", visual: { type: "number_y4_number_set", values: [17, 24, 38, 51, 63, 70] } },
  { descriptor: "AC9M4N02", week: 3, lesson: 2, skillId: "parity_sum", skillLabel: "Reason About Sums", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["odd-even-properties"], contextKey: "y4-pre-parity-27", structureKey: "y4-pre-complete-even-sum", prompt: "Enter the smallest positive number that makes the sum even.", correctAnswer: "1", type: "numeric", visual: { type: "number_y4_equation", expression: "27 + □", label: "even total" } },
  { descriptor: "AC9M4N03", week: 9, lesson: 1, skillId: "equivalent_fraction", skillLabel: "Equivalent Fractions", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["equivalent-fraction-scale"], contextKey: "y4-pre-equivalent-3-4", structureKey: "y4-pre-enter-equivalent-numerator", prompt: "Complete the equivalent fraction.", correctAnswer: "9", type: "numeric", visual: { type: "number_y4_fraction_equivalence", left: [3, 4], right: [null, 12] } },
  { descriptor: "AC9M4N03", week: 9, lesson: 2, skillId: "fraction_decimal", skillLabel: "Fractions and Decimals", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["fraction-decimal-connection"], contextKey: "y4-pre-fraction-decimal-7-10", structureKey: "y4-pre-enter-decimal-equivalent", prompt: "Write the fraction as a decimal.", correctAnswer: "0.7", type: "numeric", visual: { type: "number_y4_fraction_decimal", numerator: 7, denominator: 10 } },
  { descriptor: "AC9M4N04", week: 10, lesson: 1, skillId: "fraction_sequence", skillLabel: "Count by Fractions", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["fraction-number-line"], contextKey: "y4-pre-quarter-sequence", structureKey: "y4-pre-enter-sequence-numerator", prompt: "Continue the quarter count. Enter the missing numerator.", correctAnswer: "4", type: "numeric", visual: { type: "number_y4_fraction_sequence", values: ["0/4", "1/4", "2/4", "3/4", "?/4"], answerDenominator: 4 } },
  { descriptor: "AC9M4N04", week: 10, lesson: 3, skillId: "mixed_numeral_location", skillLabel: "Locate Mixed Numerals", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionTags: ["mixed-number-whole", "fraction-number-line"], misconceptionDiagnosis: true, contextKey: "y4-pre-mixed-1-3-4", structureKey: "y4-pre-enter-number-line-value", prompt: "What decimal is marked on the line?", correctAnswer: "1.75", type: "numeric", visual: { type: "number_y4_number_line", min: 1, max: 2, divisions: 4, marker: 3 } },
  { descriptor: "AC9M4N05", week: 4, lesson: 1, skillId: "multiply_power_ten", skillLabel: "Multiply by Powers of 10", difficulty: "easy", cognitiveCategory: "recall", responseMode: "constructed_response", misconceptionTags: ["powers-ten-direction"], contextKey: "y4-pre-power-46-100", structureKey: "y4-pre-enter-scaled-product", prompt: "Find the scaled product.", correctAnswer: "4600", type: "numeric", visual: { type: "number_y4_equation", expression: "46 × 100" } },
  { descriptor: "AC9M4N06", week: 5, lesson: 1, skillId: "written_addition", skillLabel: "Efficient Addition", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["operation-story-structure"], contextKey: "y4-pre-add-2786-1457", structureKey: "y4-pre-enter-addition-result", prompt: "Find the sum.", correctAnswer: "4243", type: "numeric", visual: { type: "number_y4_vertical_calculation", top: 2786, bottom: 1457, operation: "+" } },
  { descriptor: "AC9M4N06", week: 6, lesson: 1, skillId: "written_multiplication", skillLabel: "Efficient Multiplication", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["additive-vs-multiplicative"], contextKey: "y4-pre-multiply-34-6", structureKey: "y4-pre-enter-product", prompt: "Find the product.", correctAnswer: "204", type: "numeric", visual: { type: "number_y4_equation", expression: "34 × 6" } },
  { descriptor: "AC9M4N06", week: 6, lesson: 3, skillId: "division_strategy", skillLabel: "Check Division", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["additive-vs-multiplicative"], misconceptionDiagnosis: true, contextKey: "y4-pre-division-156-6", structureKey: "y4-pre-diagnose-division-check", prompt: "Choose the multiplication check.", correctAnswer: "26 × 6 = 156", type: "mcq", options: ["26 × 6 = 156", "26 + 6 = 32", "156 × 6 = 936"], visual: { type: "number_y4_equation", expression: "156 ÷ 6 = 26" } },
  { descriptor: "AC9M4N07", week: 7, lesson: 1, skillId: "rounding", skillLabel: "Round for Estimation", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["estimation-vs-exact"], contextKey: "y4-pre-round-3748", structureKey: "y4-pre-enter-nearest-hundred", prompt: "Give 3,748 to the nearest hundred.", correctAnswer: "3700", type: "numeric", visual: { type: "number_y4_rounding", value: 3748, benchmark: 100 } },
  { descriptor: "AC9M4N07", week: 7, lesson: 3, skillId: "financial_reasonableness", skillLabel: "Check a Financial Estimate", difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["reasonableness-no-reference", "financial-operation-choice"], misconceptionDiagnosis: true, contextKey: "y4-pre-tickets-6-19", structureKey: "y4-pre-judge-financial-estimate", prompt: "Is the estimate reasonable?", correctAnswer: "Yes", type: "mcq", options: ["Yes", "No", "There is not enough information"], visual: { type: "number_y4_receipt", rows: [["Tickets", "6 × $19"]], reported: "about $120" } },
  { descriptor: "AC9M4N08", week: 8, lesson: 1, skillId: "budget_model", skillLabel: "Solve a Budget Problem", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["financial-operation-choice"], contextKey: "y4-pre-budget-250", structureKey: "y4-pre-enter-budget-remainder", prompt: "How much of the budget remains?", correctAnswer: "64", type: "numeric", visual: { type: "number_y4_budget", budget: 250, items: [{ label: "Equipment", quantity: 3, price: 62 }] } },
  { descriptor: "AC9M4N08", week: 8, lesson: 2, skillId: "multiplicative_model", skillLabel: "Model Equal Groups", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["additive-vs-multiplicative"], contextKey: "y4-pre-trays-8-24", structureKey: "y4-pre-enter-equal-group-total", prompt: "How many items altogether?", correctAnswer: "192", type: "numeric", visual: { type: "number_y4_groups", groups: 8, each: 24, label: "items" } },
  { descriptor: "AC9M4N08", week: 8, lesson: 3, skillId: "transfer_model", skillLabel: "Transfer a Multi-Step Model", difficulty: "challenging", cognitiveCategory: "transfer", responseMode: "constructed_response", misconceptionTags: ["operation-story-structure", "additive-vs-multiplicative"], misconceptionDiagnosis: true, contextKey: "y4-pre-seats-transfer", structureKey: "y4-pre-enter-usable-capacity", prompt: "How many seats can still be used?", correctAnswer: "179", type: "numeric", visual: { type: "number_y4_model", rows: [["Rows", "12"], ["Seats in each row", "18"], ["Unavailable", "37"]] } },
  { descriptor: "AC9M4N08", week: 8, lesson: 2, skillId: "interpret_model", skillLabel: "Interpret a Multiplicative Model", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["additive-vs-multiplicative"], contextKey: "y4-pre-boxes-4-12", structureKey: "y4-pre-enter-model-total", prompt: "What total does the model represent?", correctAnswer: "48", type: "numeric", visual: { type: "number_y4_groups", groups: 4, each: 12, label: "books" } },
  { descriptor: "AC9M4N09", week: 11, lesson: 1, skillId: "follow_addition_algorithm", skillLabel: "Follow an Addition Algorithm", difficulty: "moderate", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["algorithm-step-order"], contextKey: "y4-pre-algorithm-add-7", structureKey: "y4-pre-enter-fourth-output", prompt: "Enter the fourth output.", correctAnswer: "24", type: "numeric", visual: { type: "number_y4_algorithm", start: 3, rule: "Add 7", outputs: [3, 10, 17, null] } },
  { descriptor: "AC9M4N09", week: 11, lesson: 3, skillId: "create_addition_algorithm", skillLabel: "Create an Algorithm", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "manipulated_response", misconceptionTags: ["algorithm-step-order", "pattern-rule-vs-example"], misconceptionDiagnosis: true, contextKey: "y4-pre-build-algorithm", structureKey: "y4-pre-order-algorithm-steps", prompt: "Build an algorithm for the sequence shown. Put the four instructions in order.", correctAnswer: "Start at 4.||Record the current number.||Add 6.||Repeat steps 2 and 3.", type: "number_order", options: ["Add 6.", "Repeat steps 2 and 3.", "Start at 4.", "Record the current number."], visual: { type: "number_y4_sequence", values: [4, 10, 16, 22] } },
] as const;

const POSTTEST_SPECS: readonly ItemSpec[] = [
  { descriptor: "AC9M4N01", week: 1, lesson: 2, skillId: "decimal_place_value", skillLabel: "Decimal Place Value", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["decimal-place-value"], contextKey: "y4-post-decimal-608", structureKey: "y4-post-enter-hundredths-value", prompt: "What value does the digit 8 have?", correctAnswer: "0.08", type: "numeric", visual: { type: "number_y4_decimal_chart", value: "6.08", focus: "hundredths" } },
  { descriptor: "AC9M4N01", week: 2, lesson: 1, skillId: "compare_decimals", skillLabel: "Compare Decimals", difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["decimal-length"], misconceptionDiagnosis: true, contextKey: "y4-post-decimal-56-542", structureKey: "y4-post-diagnose-decimal-claim", prompt: "Choose the true decimal comparison.", correctAnswer: "5.6 is greater than 5.42", type: "mcq", options: ["5.6 is greater than 5.42", "5.42 is greater because 42 is greater than 6", "The numbers are equal"], visual: { type: "number_y4_decimal_compare", left: "5.6", right: "5.42" } },
  { descriptor: "AC9M4N02", week: 3, lesson: 1, skillId: "classify_parity", skillLabel: "Classify Odd and Even", difficulty: "easy", cognitiveCategory: "recall", responseMode: "constructed_response", misconceptionTags: ["odd-even-properties"], contextKey: "y4-post-parity-count", structureKey: "y4-post-count-odd-values", prompt: "How many numbers are odd?", correctAnswer: "3", type: "numeric", visual: { type: "number_y4_number_set", values: [26, 35, 47, 58, 62, 71] } },
  { descriptor: "AC9M4N02", week: 3, lesson: 3, skillId: "parity_product", skillLabel: "Reason About Products", difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["odd-even-properties"], misconceptionDiagnosis: true, contextKey: "y4-post-parity-product", structureKey: "y4-post-select-product-rule", prompt: "Which rule is always true?", correctAnswer: "odd × odd = odd", type: "mcq", options: ["odd × odd = odd", "odd × odd = even", "even × odd = odd"], visual: { type: "number_y4_equation", expression: "odd × odd" } },
  { descriptor: "AC9M4N03", week: 9, lesson: 1, skillId: "equivalent_fraction", skillLabel: "Equivalent Fractions", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["equivalent-fraction-scale"], contextKey: "y4-post-equivalent-5-8", structureKey: "y4-post-enter-equivalent-numerator", prompt: "Complete this equivalent fraction.", correctAnswer: "15", type: "numeric", visual: { type: "number_y4_fraction_equivalence", left: [5, 8], right: [null, 24] } },
  { descriptor: "AC9M4N03", week: 9, lesson: 2, skillId: "fraction_decimal", skillLabel: "Check a Fraction Decimal", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionTags: ["fraction-decimal-connection"], misconceptionDiagnosis: true, contextKey: "y4-post-fraction-decimal-3-5", structureKey: "y4-post-correct-decimal-equivalent", prompt: "Enter the correct decimal.", correctAnswer: "0.6", type: "numeric", visual: { type: "number_y4_fraction_decimal", numerator: 3, denominator: 5, reported: "0.35" } },
  { descriptor: "AC9M4N04", week: 10, lesson: 1, skillId: "fraction_sequence", skillLabel: "Count by Fractions", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["fraction-number-line"], contextKey: "y4-post-three-quarter-sequence", structureKey: "y4-post-enter-sequence-numerator", prompt: "Continue the three-quarter count. Enter the missing numerator.", correctAnswer: "9", type: "numeric", visual: { type: "number_y4_fraction_sequence", values: ["0/4", "3/4", "6/4", "?/4"], answerDenominator: 4 } },
  { descriptor: "AC9M4N04", week: 10, lesson: 3, skillId: "mixed_numeral_location", skillLabel: "Locate Mixed Numerals", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionTags: ["mixed-number-whole", "fraction-number-line"], misconceptionDiagnosis: true, contextKey: "y4-post-mixed-2-1-2", structureKey: "y4-post-enter-number-line-value", prompt: "Enter the decimal at the marked point.", correctAnswer: "2.5", type: "numeric", visual: { type: "number_y4_number_line", min: 2, max: 3, divisions: 2, marker: 1 } },
  { descriptor: "AC9M4N05", week: 4, lesson: 2, skillId: "divide_power_ten", skillLabel: "Divide by Powers of 10", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["powers-ten-direction"], contextKey: "y4-post-power-78000", structureKey: "y4-post-enter-scaled-quotient", prompt: "Find the quotient.", correctAnswer: "78", type: "numeric", visual: { type: "number_y4_equation", expression: "78,000 ÷ 1,000" } },
  { descriptor: "AC9M4N06", week: 5, lesson: 1, skillId: "written_subtraction", skillLabel: "Efficient Subtraction", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["operation-story-structure"], contextKey: "y4-post-subtract-5942-2678", structureKey: "y4-post-enter-subtraction-result", prompt: "Find the difference.", correctAnswer: "3264", type: "numeric", visual: { type: "number_y4_vertical_calculation", top: 5942, bottom: 2678, operation: "−" } },
  { descriptor: "AC9M4N06", week: 6, lesson: 1, skillId: "written_multiplication", skillLabel: "Efficient Multiplication", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["additive-vs-multiplicative"], contextKey: "y4-post-multiply-47-8", structureKey: "y4-post-enter-product", prompt: "Work out the multiplication.", correctAnswer: "376", type: "numeric", visual: { type: "number_y4_equation", expression: "47 × 8" } },
  { descriptor: "AC9M4N06", week: 6, lesson: 3, skillId: "division_strategy", skillLabel: "Check Division", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["additive-vs-multiplicative"], misconceptionDiagnosis: true, contextKey: "y4-post-division-864-8", structureKey: "y4-post-diagnose-division-check", prompt: "Select the inverse check.", correctAnswer: "108 × 8 = 864", type: "mcq", options: ["108 × 8 = 864", "108 + 8 = 116", "864 × 8 = 6,912"], visual: { type: "number_y4_equation", expression: "864 ÷ 8 = 108" } },
  { descriptor: "AC9M4N07", week: 7, lesson: 1, skillId: "rounding", skillLabel: "Round for Estimation", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["estimation-vs-exact"], contextKey: "y4-post-round-846", structureKey: "y4-post-enter-nearest-hundred", prompt: "Give 846 to the nearest hundred.", correctAnswer: "800", type: "numeric", visual: { type: "number_y4_rounding", value: 846, benchmark: 100 } },
  { descriptor: "AC9M4N07", week: 7, lesson: 3, skillId: "financial_reasonableness", skillLabel: "Check a Financial Estimate", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionTags: ["reasonableness-no-reference", "financial-operation-choice"], misconceptionDiagnosis: true, contextKey: "y4-post-estimate-4-48", structureKey: "y4-post-enter-financial-benchmark", prompt: "Use $50 for each item. Enter the estimated total.", correctAnswer: "200", type: "numeric", visual: { type: "number_y4_receipt", rows: [["Items", "4"], ["Price each", "$48"]] } },
  { descriptor: "AC9M4N08", week: 8, lesson: 1, skillId: "budget_model", skillLabel: "Solve a Budget Problem", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["financial-operation-choice"], contextKey: "y4-post-budget-400", structureKey: "y4-post-enter-budget-remainder", prompt: "How much remains from the $400 budget?", correctAnswer: "85", type: "numeric", visual: { type: "number_y4_budget", budget: 400, items: [{ label: "Supplies", quantity: 5, price: 63 }] } },
  { descriptor: "AC9M4N08", week: 8, lesson: 3, skillId: "multi_step_model", skillLabel: "Solve a Multi-Step Model", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["operation-story-structure", "financial-operation-choice"], contextKey: "y4-post-tickets-fee", structureKey: "y4-post-enter-transaction-total", prompt: "Enter the total cost.", correctAnswer: "210", type: "numeric", visual: { type: "number_y4_budget", budget: null, items: [{ label: "Tickets", quantity: 7, price: 28 }, { label: "Booking fee", quantity: 1, price: 14 }] } },
  { descriptor: "AC9M4N08", week: 8, lesson: 3, skillId: "transfer_capacity", skillLabel: "Transfer a Capacity Model", difficulty: "challenging", cognitiveCategory: "transfer", responseMode: "constructed_response", misconceptionTags: ["operation-story-structure", "additive-vs-multiplicative"], misconceptionDiagnosis: true, contextKey: "y4-post-vans-transfer", structureKey: "y4-post-enter-attending-total", prompt: "How many students are travelling?", correctAnswer: "109", type: "numeric", visual: { type: "number_y4_model", rows: [["Vans", "9"], ["Seats in each van", "14"], ["Empty seats", "17"]] } },
  { descriptor: "AC9M4N08", week: 8, lesson: 3, skillId: "transfer_budget", skillLabel: "Transfer a Financial Model", difficulty: "challenging", cognitiveCategory: "transfer", responseMode: "constructed_response", misconceptionTags: ["financial-operation-choice", "additive-vs-multiplicative"], misconceptionDiagnosis: true, contextKey: "y4-post-event-budget", structureKey: "y4-post-enter-multiline-budget-remainder", prompt: "How much remains from the $500 budget?", correctAnswer: "131", type: "numeric", visual: { type: "number_y4_budget", budget: 500, items: [{ label: "Meals", quantity: 6, price: 47 }, { label: "Passes", quantity: 3, price: 29 }] } },
  { descriptor: "AC9M4N09", week: 11, lesson: 2, skillId: "follow_multiplication_algorithm", skillLabel: "Follow a Multiplication Algorithm", difficulty: "moderate", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["algorithm-step-order"], contextKey: "y4-post-algorithm-double", structureKey: "y4-post-enter-third-output", prompt: "Enter the third output.", correctAnswer: "20", type: "numeric", visual: { type: "number_y4_algorithm", start: 5, rule: "Multiply by 2", outputs: [5, 10, null] } },
  { descriptor: "AC9M4N09", week: 11, lesson: 3, skillId: "create_addition_algorithm", skillLabel: "Create an Algorithm", difficulty: "challenging", cognitiveCategory: "application", responseMode: "manipulated_response", misconceptionTags: ["algorithm-step-order", "pattern-rule-vs-example"], contextKey: "y4-post-build-algorithm", structureKey: "y4-post-order-algorithm-steps", prompt: "The sequence is shown. Put the four algorithm instructions in order.", correctAnswer: "Start at 8.||Record the current number.||Add 9.||Repeat steps 2 and 3.", type: "number_order", options: ["Repeat steps 2 and 3.", "Add 9.", "Record the current number.", "Start at 8."], visual: { type: "number_y4_sequence", values: [8, 17, 26, 35] } },
] as const;

export const YEAR4_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS: readonly CandidateQuestion[] = PRETEST_SPECS.map((spec, index) => candidate("pretest", index, spec));
export const YEAR4_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS: readonly CandidateQuestion[] = POSTTEST_SPECS.map((spec, index) => candidate("posttest", index, spec));
