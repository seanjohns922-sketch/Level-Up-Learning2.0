import type { Question } from "@/data/assessments/posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentItemDifficulty,
  type AssessmentResponseMode,
  type IndependentAssessmentItem,
} from "@/data/assessments/assessmentItemStandard";

type Descriptor = "AC9M2M01" | "AC9M2M02" | "AC9M2M03" | "AC9M2M04" | "AC9M2M05";
type Form = "pretest" | "posttest";
type CandidateQuestion = Question & IndependentAssessmentItem;
type Domain = "informal_measurement" | "fraction" | "calendar" | "clock" | "turn";
type ItemSpec = {
  descriptor: Descriptor; week: number; lesson: number; skillId: string; skillLabel: string;
  difficulty: AssessmentItemDifficulty; cognitiveCategory: AssessmentCognitiveCategory;
  responseMode: AssessmentResponseMode; misconceptionTags: readonly string[]; misconceptionDiagnosis?: boolean;
  contextKey: string; structureKey: string; prompt: string; correctAnswer: string; domain: Domain;
  options?: readonly string[]; visual?: Question["visual"];
};

function candidate(form: Form, index: number, spec: ItemSpec): CandidateQuestion {
  const selected = spec.options !== undefined;
  const id = `y2-measurement-${form === "pretest" ? "pre" : "post"}-${String(index + 1).padStart(2, "0")}-v3`;
  const selectedAnswerPosition = spec.options?.indexOf(spec.correctAnswer);
  return {
    schemaVersion: 1, id, version: "3.0.0", realm: "measurement", level: 2, form,
    origin: "assessment_authored", sourcePool: form, bankId: `measurelands-level-2-${form}-v3`,
    primaryDescriptorCode: spec.descriptor, descriptorCodes: [spec.descriptor],
    curriculumLessonMapping: [{ week: spec.week, lesson: spec.lesson }],
    cognitiveCategory: spec.cognitiveCategory, difficulty: spec.difficulty,
    isTransfer: spec.cognitiveCategory === "transfer",
    requiresReasoning: spec.cognitiveCategory === "reasoning" || spec.cognitiveCategory === "transfer",
    misconceptionDiagnosis: spec.misconceptionDiagnosis ?? false, responseMode: spec.responseMode,
    misconceptionTags: spec.misconceptionTags, contextKey: spec.contextKey, structureKey: spec.structureKey,
    ...(selected ? { selectedAnswerPosition: (selectedAnswerPosition ?? -1) + 1 } : {}),
    prompt: spec.prompt,
    renderer: { type: selected ? "selected_response" : "numeric_entry", payload: { domain: spec.domain, prompt: spec.prompt, correctAnswer: spec.correctAnswer, ...(spec.options ? { options: spec.options } : {}), ...(spec.visual ? { visual: spec.visual } : {}) } },
    scoring: { kind: "exact", correctResponse: spec.correctAnswer },
    statistics: createUncalibratedItemStatistics(spec.difficulty),
    type: selected ? "mcq" : "numeric", options: spec.options ? [...spec.options] : undefined,
    correctAnswer: spec.correctAnswer, answer: spec.correctAnswer, skillId: spec.skillId, skillLabel: spec.skillLabel,
    linkedWeeks: [spec.week], linkedLessons: [spec.lesson], strand: "Measurement", curriculumCodes: [spec.descriptor],
    difficultyBand: "year2", inputMode: selected ? undefined : "decimal", visual: spec.visual,
  };
}

const PRETEST_SPECS: readonly ItemSpec[] = [
  { descriptor: "AC9M2M01", week: 1, lesson: 3, skillId: "choose_informal_unit", skillLabel: "Choose a Uniform Informal Unit", difficulty: "easy", cognitiveCategory: "recall", responseMode: "selected_response", misconceptionTags: ["non-uniform-units"], contextKey: "pre-paperclip-length-unit", structureKey: "pre-select-repeatable-length-unit", prompt: "Which plan would give a fair informal measurement of a book's length?", correctAnswer: "Place matching units edge to edge", domain: "informal_measurement", options: ["Use units of several sizes", "Place matching units edge to edge", "Allow the units to overlap"] },
  { descriptor: "AC9M2M02", week: 5, lesson: 3, skillId: "recognise_quarters", skillLabel: "Recognise Equal Quarters", difficulty: "easy", cognitiveCategory: "recall", responseMode: "constructed_response", misconceptionTags: ["unequal-fractional-parts"], contextKey: "pre-sandwich-quarters", structureKey: "pre-quarter-part-count", prompt: "A sandwich is cut into equal quarters. Enter the number of equal pieces.", correctAnswer: "4", domain: "fraction" },
  { descriptor: "AC9M2M03", week: 7, lesson: 1, skillId: "count_calendar_days", skillLabel: "Count Days Between Dates", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["calendar-inclusive-count"], contextKey: "pre-march-short-interval", structureKey: "pre-date-jumps-same-week", prompt: "A class plants seeds on 3 March and checks them on 6 March. Enter the number of days between the events.", correctAnswer: "3", domain: "calendar" },
  { descriptor: "AC9M2M04", week: 5, lesson: 1, skillId: "read_oclock", skillLabel: "Read O'Clock Time", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["analog-hand-role"], contextKey: "pre-breakfast-oclock", structureKey: "pre-clock-whole-hour", prompt: "Read the breakfast clock shown. Enter the time as four digits, without punctuation.", correctAnswer: "0700", domain: "clock", visual: { kind: "clock", hour: 7, minute: 0 } },
  { descriptor: "AC9M2M05", week: 6, lesson: 3, skillId: "recognise_quarter_turn", skillLabel: "Recognise a Quarter Turn", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "selected_response", misconceptionTags: ["turn-size-vs-direction"], contextKey: "pre-arrow-east-quarter", structureKey: "pre-name-turn-from-orientation", prompt: "An arrow starts pointing east and turns clockwise until it points south. What turn did it make?", correctAnswer: "A quarter turn", domain: "turn", options: ["A half turn", "A full turn", "A quarter turn"] },
  { descriptor: "AC9M2M01", week: 1, lesson: 1, skillId: "compare_uniform_lengths", skillLabel: "Compare Uniform Length Counts", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["gaps-or-overlaps"], contextKey: "pre-two-pencil-counts", structureKey: "pre-same-unit-length-difference", prompt: "Two pencils are measured with the same-sized cubes. One is 9 cubes long and one is 6 cubes long. Enter how many cubes longer the first pencil is.", correctAnswer: "3", domain: "informal_measurement" },
  { descriptor: "AC9M2M02", week: 5, lesson: 3, skillId: "recognise_eighths", skillLabel: "Recognise Equal Eighths", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["unequal-fractional-parts"], contextKey: "pre-ribbon-eighths", structureKey: "pre-eighth-denominator", prompt: "A ribbon is divided into 8 equal sections. One section is one-eighth. Enter the number of equal sections in the whole ribbon.", correctAnswer: "8", domain: "fraction" },
  { descriptor: "AC9M2M03", week: 7, lesson: 2, skillId: "count_forward_dates", skillLabel: "Count Forward to an Event", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["calendar-inclusive-count"], contextKey: "pre-library-event", structureKey: "pre-count-forward-four-days", prompt: "Today is 11 May. Library Day is 4 days later. Enter the date in May of Library Day.", correctAnswer: "15", domain: "calendar" },
  { descriptor: "AC9M2M04", week: 5, lesson: 2, skillId: "read_half_past", skillLabel: "Read Half-Past Time", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["analog-hand-role"], contextKey: "pre-recess-half-past", structureKey: "pre-clock-half-hour", prompt: "Read the recess clock shown. Enter the time as four digits, without punctuation.", correctAnswer: "1030", domain: "clock", visual: { kind: "clock", hour: 10, minute: 30 } },
  { descriptor: "AC9M2M05", week: 6, lesson: 3, skillId: "apply_half_turn", skillLabel: "Apply a Half Turn", difficulty: "moderate", cognitiveCategory: "application", responseMode: "selected_response", misconceptionTags: ["turn-size-vs-direction"], contextKey: "pre-robot-north-half", structureKey: "pre-final-direction-half-turn", prompt: "A robot starts facing north and makes a half turn. Which direction does it face now?", correctAnswer: "South", domain: "turn", options: ["East", "South", "North"] },
  { descriptor: "AC9M2M01", week: 2, lesson: 2, skillId: "compare_uniform_mass", skillLabel: "Compare Uniform Mass Counts", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["non-uniform-units"], contextKey: "pre-fruit-balance-cubes", structureKey: "pre-same-unit-mass-difference", prompt: "An orange balances 12 identical cubes and an apple balances 8 identical cubes. Enter how many cubes heavier the orange is.", correctAnswer: "4", domain: "informal_measurement" },
  { descriptor: "AC9M2M01", week: 3, lesson: 2, skillId: "compare_uniform_capacity", skillLabel: "Compare Uniform Capacity Counts", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["cross-unit-count-comparison"], contextKey: "pre-two-jug-cup-counts", structureKey: "pre-capacity-range-same-cup", prompt: "Three containers hold 5, 9 and 7 of the same cup. Enter the difference between the greatest and least capacities in cups.", correctAnswer: "4", domain: "informal_measurement" },
  { descriptor: "AC9M2M02", week: 5, lesson: 3, skillId: "check_equal_halves", skillLabel: "Check Equal Halves", difficulty: "moderate", cognitiveCategory: "application", responseMode: "selected_response", misconceptionDiagnosis: true, misconceptionTags: ["unequal-fractional-parts"], contextKey: "pre-fruit-bar-halves", structureKey: "pre-diagnose-unequal-halves", prompt: "A fruit bar is broken into 2 pieces, but one piece is much larger. Which statement is correct?", correctAnswer: "The pieces are not halves because they are not equal.", domain: "fraction", options: ["The pieces are halves because there are 2 pieces.", "The larger piece is one half.", "The pieces are not halves because they are not equal."] },
  { descriptor: "AC9M2M03", week: 7, lesson: 1, skillId: "calendar_week_boundary", skillLabel: "Count Across a Week Boundary", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["calendar-inclusive-count"], contextKey: "pre-june-week-boundary", structureKey: "pre-date-jumps-seven-days", prompt: "A project begins on 18 June and ends on 25 June. Enter the number of days between the dates.", correctAnswer: "7", domain: "calendar" },
  { descriptor: "AC9M2M04", week: 6, lesson: 1, skillId: "read_quarter_past", skillLabel: "Read Quarter-Past Time", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["analog-hand-role"], contextKey: "pre-sport-quarter-past", structureKey: "pre-clock-quarter-past", prompt: "Read the sports clock shown. Enter the time as four digits, without punctuation.", correctAnswer: "0315", domain: "clock", visual: { kind: "clock", hour: 3, minute: 15 } },
  { descriptor: "AC9M2M05", week: 6, lesson: 3, skillId: "compose_quarter_turns", skillLabel: "Compose Quarter Turns", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["turn-size-vs-direction"], contextKey: "pre-three-quarter-turn-count", structureKey: "pre-quarter-turns-in-three-quarter", prompt: "Enter the number of quarter turns in a three-quarter turn.", correctAnswer: "3", domain: "turn" },
  { descriptor: "AC9M2M01", week: 4, lesson: 1, skillId: "smaller_unit_accuracy", skillLabel: "Use Smaller Units for Accuracy", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["informal-unit-size-count"], contextKey: "pre-block-size-count", structureKey: "pre-small-unit-count-relation", prompt: "A shelf measures 6 large blocks long. Each large block is the same length as 2 small blocks. Enter the shelf's length in small blocks.", correctAnswer: "12", domain: "informal_measurement" },
  { descriptor: "AC9M2M03", week: 7, lesson: 3, skillId: "diagnose_calendar_count", skillLabel: "Diagnose Calendar Counting", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionDiagnosis: true, misconceptionTags: ["calendar-inclusive-count"], contextKey: "pre-camp-inclusive-error", structureKey: "pre-correct-inclusive-day-count", prompt: "Camp starts on 9 August and finishes on 13 August. A student counts 9, 10, 11, 12, 13 and says 5 days between. Enter the correct number of days between the dates.", correctAnswer: "4", domain: "calendar" },
  { descriptor: "AC9M2M04", week: 6, lesson: 2, skillId: "diagnose_quarter_to", skillLabel: "Diagnose Quarter-To Time", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionDiagnosis: true, misconceptionTags: ["quarter-to-hour-name"], contextKey: "pre-music-quarter-to", structureKey: "pre-correct-quarter-to-name", prompt: "The minute hand points to 9 and the hour hand is nearly at 6. Which time is correct?", correctAnswer: "Quarter to 6", domain: "clock", options: ["Quarter past 5", "Quarter to 5", "Quarter to 6"] },
  { descriptor: "AC9M2M01", week: 4, lesson: 3, skillId: "diagnose_cross_unit_measure", skillLabel: "Diagnose Different Unit Counts", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionDiagnosis: true, misconceptionTags: ["cross-unit-count-comparison"], contextKey: "pre-desk-hands-pencils", structureKey: "pre-reject-cross-unit-numeral", prompt: "Mia measures a desk as 7 hand spans. Leo measures it as 10 pencils. Leo says the desk became longer because 10 is greater than 7. Which correction is best?", correctAnswer: "The counts cannot be compared until the same-sized unit is used.", domain: "informal_measurement", options: ["Leo is correct because 10 is always longer than 7.", "The counts cannot be compared until the same-sized unit is used.", "Mia is correct because hand spans are always exact."] },
];

// Parallel forms keep the same descriptor, operation and response demand.
const PARALLEL_POST_VARIANTS: readonly Partial<ItemSpec>[] = [
  {
    "prompt": "Which plan fairly measures a marker's length?",
    "correctAnswer": "Repeat one equal unit from end to end",
    "visual": undefined,
    "options": [
      "Repeat one equal unit from end to end",
      "Mix large and small units",
      "Leave gaps between units"
    ]
  },
  {
    "prompt": "A pizza is cut into equal quarters. How many equal slices?",
    "correctAnswer": "4",
    "visual": undefined
  },
  {
    "prompt": "A book is borrowed on 4 April and returned on 9 April. How many days between the dates?",
    "correctAnswer": "5",
    "visual": undefined
  },
  {
    "prompt": "Read the arrival clock. Enter the time as four digits, without punctuation.",
    "correctAnswer": "0800",
    "visual": {
      "kind": "clock",
      "hour": 8,
      "minute": 0
    }
  },
  {
    "prompt": "An arrow points west, then turns clockwise to north. What turn did it make?",
    "correctAnswer": "A quarter turn",
    "visual": undefined,
    "options": [
      "A full turn",
      "A quarter turn",
      "A half turn"
    ]
  },
  {
    "prompt": "Two ribbons measure 8 and 5 of the same counter. How many counters longer is the first ribbon?",
    "correctAnswer": "3",
    "visual": undefined
  },
  {
    "prompt": "A paper strip is divided into eighths. How many equal parts make the whole strip?",
    "correctAnswer": "8",
    "visual": undefined
  },
  {
    "prompt": "Today is 7 September. A concert is 4 days later. What is the date in September of the concert?",
    "correctAnswer": "11",
    "visual": undefined
  },
  {
    "prompt": "Read the reading clock. Enter the time as four digits, without punctuation.",
    "correctAnswer": "1130",
    "visual": {
      "kind": "clock",
      "hour": 11,
      "minute": 30
    }
  },
  {
    "prompt": "A robot starts facing west and makes a half turn. Which direction does it face now?",
    "correctAnswer": "East",
    "visual": undefined,
    "options": [
      "North",
      "West",
      "East"
    ]
  },
  {
    "prompt": "A truck balances 13 identical blocks and a car balances 9. How many blocks heavier is the truck?",
    "correctAnswer": "4",
    "visual": undefined
  },
  {
    "prompt": "Three buckets hold 6, 10 and 8 of the same scoop. What is the difference between the greatest and least capacities?",
    "correctAnswer": "4",
    "visual": undefined
  },
  {
    "prompt": "A biscuit is broken into two unequal pieces. Which statement is correct?",
    "correctAnswer": "The pieces are not halves because they are unequal.",
    "visual": undefined,
    "options": [
      "Any two pieces are halves.",
      "The pieces are not halves because they are unequal.",
      "The larger piece is a quarter."
    ]
  },
  {
    "prompt": "A project begins on 17 October and ends on 24 October. How many days between the dates?",
    "correctAnswer": "7",
    "visual": undefined
  },
  {
    "prompt": "Read the bus clock. Enter the time as four digits, without punctuation.",
    "correctAnswer": "0415",
    "visual": {
      "kind": "clock",
      "hour": 4,
      "minute": 15
    }
  },
  {
    "prompt": "A robot makes three quarter turns in the same direction. How many quarter turns has it made?",
    "correctAnswer": "3",
    "visual": undefined
  },
  {
    "prompt": "A mat measures 7 large blocks. Each large block is as long as 2 small blocks. How long is the mat in small blocks?",
    "correctAnswer": "14",
    "visual": undefined
  },
  {
    "prompt": "Camp begins on 8 July and ends on 12 July. A student counts both dates and says 5 days between. How many days between the dates?",
    "correctAnswer": "4",
    "visual": undefined
  },
  {
    "prompt": "The minute hand points to 9 and the hour hand is nearly at 8. Which time is correct?",
    "correctAnswer": "Quarter to 8",
    "visual": undefined,
    "options": [
      "Quarter past 8",
      "Quarter to 8",
      "Quarter to 7"
    ]
  },
  {
    "prompt": "A table measures 8 hand spans or 12 pencils. A student says it is longer when measured in pencils. Which correction is best?",
    "correctAnswer": "Use the same-sized unit before comparing the counts.",
    "visual": undefined,
    "options": [
      "More units always means a longer table.",
      "The table changed length.",
      "Use the same-sized unit before comparing the counts."
    ]
  }
];

const POSTTEST_SPECS: readonly ItemSpec[] = PRETEST_SPECS.map((spec, index) => ({
  ...spec, ...PARALLEL_POST_VARIANTS[index],
  contextKey: `post-paired-${index + 1}`, structureKey: `post-paired-${index + 1}`,
}));

export const YEAR2_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS = PRETEST_SPECS.map((spec, index) => candidate("pretest", index, spec));
export const YEAR2_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS = POSTTEST_SPECS.map((spec, index) => candidate("posttest", index, spec));
