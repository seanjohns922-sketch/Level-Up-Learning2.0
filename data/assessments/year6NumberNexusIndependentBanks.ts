import type { Question } from "@/data/assessments/posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentFormKind,
  type AssessmentItemDifficulty,
  type AssessmentResponseMode,
  type IndependentAssessmentItem,
} from "@/data/assessments/assessmentItemStandard";

type Descriptor = `AC9M6N0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;
type CandidateQuestion = Question & IndependentAssessmentItem;
type RuntimeType = "numeric" | "number_order" | "fraction_order";

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
  const shortForm = form === "pretest" ? "pre" : "post";
  if (index === 16 || index === 19) {
    const reasons = index === 16
      ? ["A discount is added to the original price.", "One quarter of a nearby whole-hundred price estimates a 25% discount.", "The percentage is the discount amount in dollars."]
      : ["Divide the budget by the discounted price, then round down to a whole number of kits.", "Round up because part of the final kit is affordable.", "Subtract the discount percentage from the budget."];
    spec = { ...spec, correctAnswer: `${spec.correctAnswer}||${index === 16 ? 2 : 1}`, responseMode: "justification", visual: { ...spec.visual, reasonOptions: reasons } };
  }
  return {
    schemaVersion: 1,
    id: `y6-number-${shortForm}-${String(index + 1).padStart(2, "0")}-v2`,
    version: "2.0.0",
    realm: "number",
    level: 6,
    form,
    origin: "assessment_authored",
    sourcePool: form,
    bankId: `number-nexus-level-6-${form}-v2`,
    primaryDescriptorCode: spec.descriptor,
    descriptorCodes: [spec.descriptor],
    curriculumLessonMapping: [{ week: spec.week, lesson: spec.lesson }],
    cognitiveCategory: spec.cognitiveCategory,
    difficulty: spec.difficulty,
    isTransfer: spec.cognitiveCategory === "transfer",
    requiresReasoning: spec.cognitiveCategory === "reasoning" || spec.cognitiveCategory === "transfer",
    misconceptionDiagnosis: spec.misconceptionDiagnosis ?? false,
    responseMode: index === 16 || index === 19 ? "justification" : spec.type === "numeric" ? "constructed_response" : "manipulated_response",
    misconceptionTags: spec.misconceptionTags,
    contextKey: spec.contextKey,
    structureKey: spec.structureKey,
    prompt: spec.prompt,
    renderer: { type: spec.type === "numeric" ? "numeric_entry" : spec.type, payload: { prompt: spec.prompt, correctAnswer: spec.correctAnswer, visual: spec.visual, ...(spec.options ? { options: spec.options } : {}) } },
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
    strand: "Number",
    curriculumCodes: [spec.descriptor],
    difficultyBand: "year6-number",
    visual: spec.visual,
    inputMode: "decimal",
  };
}

const PRETEST_SPECS: readonly ItemSpec[] = [
  { descriptor: "AC9M6N01", week: 4, lesson: 1, skillId: "integer_order", skillLabel: "Order Integers", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "manipulated_response", misconceptionTags: ["integer-order"], contextKey: "y6-pre-freezer-order", structureKey: "y6-pre-order-four-integers", prompt: "Order the temperatures from coldest to warmest.", correctAnswer: "-12||-5||0||7", type: "number_order", options: ["7", "-5", "0", "-12"], visual: { type: "number_y6_integer_set", values: ["7°C", "-5°C", "0°C", "-12°C"] } },
  { descriptor: "AC9M6N01", week: 10, lesson: 3, skillId: "coordinate_signs", skillLabel: "Use Coordinates", difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionTags: ["coordinate-sign"], misconceptionDiagnosis: true, contextKey: "y6-pre-coordinate-reflection", structureKey: "y6-pre-enter-reflected-coordinate", prompt: "Reflect point P across the y-axis. Enter the new coordinate.", correctAnswer: "-4,-3", type: "numeric", visual: { type: "number_y6_coordinate", points: [{ x: 4, y: -3, label: "P" }] } },
  { descriptor: "AC9M6N02", week: 2, lesson: 1, skillId: "prime_classification", skillLabel: "Classify Numbers", difficulty: "easy", cognitiveCategory: "recall", responseMode: "constructed_response", misconceptionTags: ["prime-composite-one"], contextKey: "y6-pre-prime-43", structureKey: "y6-pre-enter-factor-count", prompt: "How many factors does 43 have?", correctAnswer: "2", type: "numeric", visual: { type: "number_y6_number_card", number: 43 } },
  { descriptor: "AC9M6N02", week: 2, lesson: 2, skillId: "factor_constraint", skillLabel: "Use Number Properties", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["factor-vs-multiple"], misconceptionDiagnosis: true, contextKey: "y6-pre-square-factor", structureKey: "y6-pre-enter-smallest-square-multiple", prompt: "Enter the smallest square number divisible by 6.", correctAnswer: "36", type: "numeric", visual: { type: "number_y6_constraint", rules: ["square number", "divisible by 6"] } },
  { descriptor: "AC9M6N03", week: 5, lesson: 2, skillId: "fraction_order", skillLabel: "Order Fractions", difficulty: "moderate", cognitiveCategory: "application", responseMode: "manipulated_response", misconceptionTags: ["denominator-size", "equivalent-fraction-scale"], contextKey: "y6-pre-fraction-order", structureKey: "y6-pre-order-three-fractions", prompt: "Arrange the fractions from least to greatest.", correctAnswer: "5/8,2/3,7/10", type: "fraction_order", options: ["7/10", "5/8", "2/3"], visual: { type: "number_y6_fraction_set", values: ["7/10", "5/8", "2/3"] } },
  { descriptor: "AC9M6N03", week: 5, lesson: 3, skillId: "fraction_line", skillLabel: "Fractions on a Number Line", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionTags: ["fraction-number-line", "equivalent-fraction-scale"], misconceptionDiagnosis: true, contextKey: "y6-pre-line-seven-twelfths", structureKey: "y6-pre-enter-twelfths-numerator", prompt: "The marker is ?/12. Enter the numerator.", correctAnswer: "7", type: "numeric", visual: { type: "number_y6_number_line", min: 0, max: 1, divisions: 12, marker: 7 } },
  { descriptor: "AC9M6N04", week: 1, lesson: 2, skillId: "decimal_addition", skillLabel: "Add Decimals", difficulty: "easy", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["decimal-operation-alignment"], contextKey: "y6-pre-decimal-add", structureKey: "y6-pre-enter-decimal-sum", prompt: "Calculate the sum.", correctAnswer: "23.008", type: "numeric", visual: { type: "number_y6_calculation", expression: "17.64 + 5.368" } },
  { descriptor: "AC9M6N04", week: 1, lesson: 3, skillId: "decimal_correction", skillLabel: "Check Decimal Calculations", difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "spot_the_mistake", misconceptionTags: ["decimal-operation-alignment", "reasonableness-no-reference"], misconceptionDiagnosis: true, contextKey: "y6-pre-decimal-claim", structureKey: "y6-pre-correct-decimal-difference", prompt: "A student made an error. Enter the correct difference.", correctAnswer: "6.525", type: "numeric", visual: { type: "number_y6_claim", label: "Student's result", statement: "12.4 − 5.875 = 7.475", correctionPrefix: "12.4 − 5.875 =" } },
  { descriptor: "AC9M6N05", week: 6, lesson: 1, skillId: "fraction_addition", skillLabel: "Add Fractions", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["fraction-add-denominator", "equivalent-fraction-scale"], contextKey: "y6-pre-fraction-add", structureKey: "y6-pre-enter-twentieths-numerator", prompt: "Add. Enter the missing numerator.", correctAnswer: "17", type: "numeric", visual: { type: "number_y6_fraction_equation", expression: "3/4 + 1/10 = ?/20", answerDenominator: 20 } },
  { descriptor: "AC9M6N05", week: 6, lesson: 3, skillId: "fraction_correction", skillLabel: "Check Fraction Operations", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "spot_the_mistake", misconceptionTags: ["fraction-add-denominator"], misconceptionDiagnosis: true, contextKey: "y6-pre-fraction-claim", structureKey: "y6-pre-correct-twelfths-numerator", prompt: "Correct the subtraction. Enter the missing numerator.", correctAnswer: "7", type: "numeric", visual: { type: "number_y6_claim", label: "Student's result", statement: "5/6 − 1/4 = 4/2", answerDenominator: 12 } },
  { descriptor: "AC9M6N06", week: 3, lesson: 1, skillId: "decimal_scaling", skillLabel: "Scale Decimals", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["powers-ten-direction", "decimal-place-value"], contextKey: "y6-pre-scale-100", structureKey: "y6-pre-enter-scaled-decimal", prompt: "Enter the result.", correctAnswer: "308.6", type: "numeric", visual: { type: "number_y6_calculation", expression: "3.086 × 100" } },
  { descriptor: "AC9M6N06", week: 3, lesson: 3, skillId: "scaling_correction", skillLabel: "Check Decimal Scaling", difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "spot_the_mistake", misconceptionTags: ["powers-ten-direction", "reasonableness-no-reference"], misconceptionDiagnosis: true, contextKey: "y6-pre-scale-claim", structureKey: "y6-pre-correct-divide-thousand", prompt: "A student divided incorrectly. Enter the correct result.", correctAnswer: "0.0472", type: "numeric", visual: { type: "number_y6_claim", label: "Student's result", statement: "47.2 ÷ 1000 = 4.72", correctionPrefix: "47.2 ÷ 1000 =" } },
  { descriptor: "AC9M6N07", week: 7, lesson: 1, skillId: "fraction_quantity", skillLabel: "Find Part of a Quantity", difficulty: "moderate", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["fraction-decimal-connection"], contextKey: "y6-pre-quarter-156", structureKey: "y6-pre-enter-quarter-quantity", prompt: "Find one quarter of the quantity.", correctAnswer: "39", type: "numeric", visual: { type: "number_y6_quantity", whole: 156, part: "1/4" } },
  { descriptor: "AC9M6N07", week: 8, lesson: 1, skillId: "percentage_discount", skillLabel: "Calculate Discounts", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["percentage-of-quantity", "percentage-whole"], contextKey: "y6-pre-discount-180", structureKey: "y6-pre-enter-sale-price", prompt: "Enter the sale price.", correctAnswer: "144", type: "numeric", visual: { type: "number_y6_discount", price: 180, discount: 20 } },
  { descriptor: "AC9M6N07", week: 9, lesson: 2, skillId: "percentage_transfer", skillLabel: "Find Percentages", difficulty: "challenging", cognitiveCategory: "transfer", responseMode: "constructed_response", misconceptionTags: ["percentage-of-quantity", "fraction-decimal-connection"], misconceptionDiagnosis: true, contextKey: "y6-pre-water-tank", structureKey: "y6-pre-enter-remaining-capacity", prompt: "The tank is 65% full. Enter the empty capacity.", correctAnswer: "294", type: "numeric", visual: { type: "number_y6_quantity", whole: 840, part: "65% full" } },
  { descriptor: "AC9M6N08", week: 9, lesson: 3, skillId: "rational_estimate", skillLabel: "Estimate Rational Numbers", difficulty: "moderate", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["estimation-vs-exact"], contextKey: "y6-pre-estimate-percent", structureKey: "y6-pre-enter-benchmark-estimate", prompt: "Estimate 39.6% of 504. Give your answer to the nearest ten.", correctAnswer: "200", type: "numeric", visual: { type: "number_y6_estimate", expression: "39.6% of 504", answerSymbol: "≈" } },
  { descriptor: "AC9M6N08", week: 11, lesson: 1, skillId: "reasonableness", skillLabel: "Judge Reasonableness", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "justification", misconceptionTags: ["reasonableness-no-reference", "financial-operation-choice"], misconceptionDiagnosis: true, contextKey: "y6-pre-discount-reason", structureKey: "y6-pre-enter-estimate-to-refute", prompt: "Estimate the actual discount to the nearest ten dollars.", correctAnswer: "50", type: "numeric", visual: { type: "number_y6_claim", label: "Student's estimate", statement: "A 25% discount on $198 is about $15.", answerPrefix: "$" } },
  { descriptor: "AC9M6N09", week: 8, lesson: 2, skillId: "budget_model", skillLabel: "Model a Budget", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["operation-story-structure", "financial-operation-choice"], contextKey: "y6-pre-event-budget", structureKey: "y6-pre-enter-budget-balance", prompt: "Enter the money remaining.", correctAnswer: "214", type: "numeric", visual: { type: "number_y6_budget", budget: 1250, rows: [["Venue", "$460"], ["Catering", "24 × $24"]] } },
  { descriptor: "AC9M6N09", week: 11, lesson: 2, skillId: "unit_rate_transfer", skillLabel: "Compare Unit Rates", difficulty: "challenging", cognitiveCategory: "transfer", responseMode: "constructed_response", misconceptionTags: ["financial-operation-choice", "operation-story-structure"], contextKey: "y6-pre-rice-rate", structureKey: "y6-pre-enter-saving", prompt: "Enter the saving when buying exactly 12 kg at the better rate.", correctAnswer: "6", type: "numeric", visual: { type: "number_y6_rates", rows: [["Pack A", "4 kg for $18"], ["Pack B", "3 kg for $12"]] } },
  { descriptor: "AC9M6N09", week: 11, lesson: 3, skillId: "constraint_transfer", skillLabel: "Justify Financial Decisions", difficulty: "challenging", cognitiveCategory: "transfer", responseMode: "justification", misconceptionTags: ["operation-story-structure", "percentage-of-quantity"], misconceptionDiagnosis: true, contextKey: "y6-pre-club-order", structureKey: "y6-pre-enter-largest-order", prompt: "Enter the greatest whole number of kits the club can buy.", correctAnswer: "19", type: "numeric", visual: { type: "number_y6_budget", budget: 720, rows: [["Discount", "10%"], ["Kit price", "$42"]] } },
] as const;

// Parallel tasks retain the same operations, representations and response modes.
// Alternate values and contexts prevent copying a remembered answer.
const POSTTEST_VARIANTS: Array<Pick<ItemSpec, "prompt" | "correctAnswer" | "visual"> & Partial<Pick<ItemSpec,"options">>> = [
  {prompt:"Order the temperatures from coldest to warmest.",correctAnswer:"-14||-6||0||9",options:["9","-6","0","-14"],visual:{type:"number_y6_integer_set",values:["9°C","-6°C","0°C","-14°C"]}},
  {prompt:"Reflect point Q across the y-axis. Enter the new coordinate.",correctAnswer:"-3,-5",visual:{type:"number_y6_coordinate",points:[{x:3,y:-5,label:"Q"}]}},
  {prompt:"How many factors does 47 have?",correctAnswer:"2",visual:{type:"number_y6_number_card",number:47}},
  {prompt:"Enter the smallest square number divisible by 8.",correctAnswer:"16",visual:{type:"number_y6_constraint",rules:["square number","divisible by 8"]}},
  {prompt:"Arrange the fractions from least to greatest.",correctAnswer:"7/12,3/5,5/8",options:["5/8","7/12","3/5"],visual:{type:"number_y6_fraction_set",values:["5/8","7/12","3/5"]}},
  {prompt:"The marker is ?/12. Enter the numerator.",correctAnswer:"5",visual:{type:"number_y6_number_line",min:0,max:1,divisions:12,marker:5}},
  {prompt:"Calculate the sum.",correctAnswer:"34.017",visual:{type:"number_y6_calculation",expression:"26.58 + 7.437"}},
  {prompt:"A student made an error. Enter the correct difference.",correctAnswer:"7.425",visual:{type:"number_y6_claim",label:"Student's result",statement:"15.3 − 7.875 = 8.575",correctionPrefix:"15.3 − 7.875 ="}},
  {prompt:"Add. Enter the missing numerator.",correctAnswer:"11",visual:{type:"number_y6_fraction_equation",expression:"1/4 + 3/10 = ?/20",answerDenominator:20}},
  {prompt:"Correct the subtraction. Enter the missing numerator.",correctAnswer:"5",visual:{type:"number_y6_claim",label:"Student's result",statement:"2/3 − 1/4 = 1/1",answerDenominator:12}},
  {prompt:"Enter the result.",correctAnswer:"407.3",visual:{type:"number_y6_calculation",expression:"4.073 × 100"}},
  {prompt:"A student divided incorrectly. Enter the correct result.",correctAnswer:"0.0628",visual:{type:"number_y6_claim",label:"Student's result",statement:"62.8 ÷ 1000 = 6.28",correctionPrefix:"62.8 ÷ 1000 ="}},
  {prompt:"Find one quarter of the quantity.",correctAnswer:"47",visual:{type:"number_y6_quantity",whole:188,part:"1/4"}},
  {prompt:"Enter the sale price.",correctAnswer:"192",visual:{type:"number_y6_discount",price:240,discount:20}},
  {prompt:"The tank is 65% full. Enter the empty capacity.",correctAnswer:"238",visual:{type:"number_y6_quantity",whole:680,part:"65% full"}},
  {prompt:"Estimate 39.8% of 746. Give your answer to the nearest ten.",correctAnswer:"300",visual:{type:"number_y6_estimate",expression:"39.8% of 746",answerSymbol:"≈"}},
  {prompt:"Estimate the actual discount to the nearest ten dollars.",correctAnswer:"100",visual:{type:"number_y6_claim",label:"Student's estimate",statement:"A 25% discount on $398 is about $30.",answerPrefix:"$"}},
  {prompt:"Enter the money remaining.",correctAnswer:"244",visual:{type:"number_y6_budget",budget:1500,rows:[["Hall hire","$520"],["Meals","32 × $23"]]}},
  {prompt:"Enter the saving when buying exactly 12 kg at the better rate.",correctAnswer:"8",visual:{type:"number_y6_rates",rows:[["Pack A","4 kg for $16"],["Pack B","3 kg for $10"]]}},
  {prompt:"Enter the greatest whole number of kits the club can buy.",correctAnswer:"22",visual:{type:"number_y6_budget",budget:900,rows:[["Discount","10%"],["Kit price","$44"]]}}
];
const POSTTEST_SPECS: readonly ItemSpec[] = PRETEST_SPECS.map((spec,index)=>({...spec,...POSTTEST_VARIANTS[index]!,contextKey:spec.contextKey.replace("-pre-","-post-"),structureKey:spec.structureKey.replace("-pre-","-post-")}));

export const YEAR6_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS: readonly CandidateQuestion[] = PRETEST_SPECS.map((spec, index) => candidate("pretest", index, spec));
export const YEAR6_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS: readonly CandidateQuestion[] = POSTTEST_SPECS.map((spec, index) => candidate("posttest", index, spec));
