import type { Question } from "@/data/assessments/posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentItemDifficulty,
  type AssessmentResponseMode,
  type IndependentAssessmentItem,
} from "@/data/assessments/assessmentItemStandard";

type Descriptor = "AC9M3M01" | "AC9M3M02" | "AC9M3M03" | "AC9M3M04" | "AC9M3M05";
type Form = "pretest" | "posttest";
type CandidateQuestion = Question & IndependentAssessmentItem;
type Domain = "unit_estimate" | "instrument" | "duration" | "clock" | "angle";
type ItemSpec = {
  descriptor: Descriptor; week: number; lesson: number; skillId: string; skillLabel: string;
  difficulty: AssessmentItemDifficulty; cognitiveCategory: AssessmentCognitiveCategory;
  responseMode: AssessmentResponseMode; misconceptionTags: readonly string[]; misconceptionDiagnosis?: boolean;
  contextKey: string; structureKey: string; prompt: string; correctAnswer: string; domain: Domain;
  options?: readonly string[]; visual?: Question["visual"];
};

function candidate(form: Form, index: number, spec: ItemSpec): CandidateQuestion {
  const selected = spec.options !== undefined;
  const id = `y3-measurement-${form === "pretest" ? "pre" : "post"}-${String(index + 1).padStart(2, "0")}-v3`;
  const selectedAnswerPosition = spec.options?.indexOf(spec.correctAnswer);
  return {
    schemaVersion: 1, id, version: "3.0.0", realm: "measurement", level: 3, form,
    origin: "assessment_authored", sourcePool: form, bankId: `measurelands-level-3-${form}-v3`,
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
    statistics: createUncalibratedItemStatistics(spec.difficulty), type: selected ? "mcq" : "numeric",
    options: spec.options ? [...spec.options] : undefined, correctAnswer: spec.correctAnswer, answer: spec.correctAnswer,
    visual: spec.visual, skillId: spec.skillId, skillLabel: spec.skillLabel, linkedWeeks: [spec.week],
    linkedLessons: [spec.lesson], strand: "Measurement", curriculumCodes: [spec.descriptor],
    difficultyBand: spec.difficulty, reviewFeedback: "Review the unit, instrument marking, time relationship or angle benchmark required by the problem.",
  };
}

const PRETEST_SPECS: readonly ItemSpec[] = [
  { descriptor: "AC9M3M01", week: 3, lesson: 1, skillId: "choose_metric_unit", skillLabel: "Choose a Suitable Metric Unit", difficulty: "easy", cognitiveCategory: "recall", responseMode: "selected_response", misconceptionTags: ["inappropriate-metric-unit"], contextKey: "pre-school-bag-mass-unit", structureKey: "pre-unit-choice-bag-mass", prompt: "Which unit is most suitable for measuring the mass of a full school bag?", correctAnswer: "kilograms", domain: "unit_estimate", options: ["millilitres", "grams", "kilograms"] },
  { descriptor: "AC9M3M02", week: 1, lesson: 2, skillId: "measure_cm", skillLabel: "Read a Centimetre Ruler", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["scale-interval-value"], contextKey: "pre-pencil-ruler", structureKey: "pre-ruler-whole-centimetres", prompt: "Read the ruler shown. Enter the pencil's length in centimetres.", correctAnswer: "9", domain: "instrument", visual: { kind: "ruler", toCm: 9, label: "pencil" } },
  { descriptor: "AC9M3M03", week: 5, lesson: 1, skillId: "formal_time_units", skillLabel: "Relate Hours and Minutes", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["duration-unit-scale"], contextKey: "pre-two-hours", structureKey: "pre-hours-to-minutes", prompt: "Enter the number of minutes in 2 hours.", correctAnswer: "120", domain: "duration" },
  { descriptor: "AC9M3M04", week: 6, lesson: 1, skillId: "read_analog_time", skillLabel: "Read Five-Minute Time", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["analog-hand-role"], contextKey: "pre-breakfast-clock", structureKey: "pre-clock-five-minute-benchmark", prompt: "Read the breakfast-time clock shown. Enter the time as four digits, without punctuation.", correctAnswer: "0725", domain: "clock", visual: { kind: "clock", hour: 7, minute: 25 } },
  { descriptor: "AC9M3M05", week: 7, lesson: 2, skillId: "compare_right_angle", skillLabel: "Compare with a Right Angle", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "selected_response", misconceptionTags: ["right-angle-orientation"], contextKey: "pre-open-window", structureKey: "pre-angle-less-equal-greater", prompt: "A window opens less than a square corner. How does its opening compare with a right angle?", correctAnswer: "Less than a right angle", domain: "angle", options: ["Less than a right angle", "Equal to a right angle", "Greater than a right angle"] },
  { descriptor: "AC9M3M01", week: 2, lesson: 1, skillId: "estimate_length", skillLabel: "Estimate with a Metre Benchmark", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["estimate-vs-exact-reading"], contextKey: "pre-desk-benchmark", structureKey: "pre-double-benchmark-estimate", prompt: "A known metre stick is about the same length as a desk. Two such desks are placed end to end. Enter a reasonable estimate of their total length in metres.", correctAnswer: "2", domain: "unit_estimate" },
  { descriptor: "AC9M3M02", week: 3, lesson: 2, skillId: "read_mass_scale", skillLabel: "Read a Labelled Mass Scale", difficulty: "easy", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["scale-interval-value"], contextKey: "pre-apples-scale", structureKey: "pre-scale-hundreds-grams", prompt: "Read the apple scale shown. Enter the mass in grams.", correctAnswer: "600", domain: "instrument", visual: { kind: "scaleDial", value: 600, unit: "g", max: 1000 } },
  { descriptor: "AC9M3M03", week: 5, lesson: 1, skillId: "formal_time_units", skillLabel: "Relate Minutes and Seconds", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["duration-unit-scale"], contextKey: "pre-three-minutes", structureKey: "pre-minutes-to-seconds", prompt: "Enter the number of seconds in 3 minutes.", correctAnswer: "180", domain: "duration" },
  { descriptor: "AC9M3M04", week: 6, lesson: 2, skillId: "read_minute_time", skillLabel: "Read Time to the Minute", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["minute-mark-counting"], contextKey: "pre-school-bell-clock", structureKey: "pre-clock-nearest-minute", prompt: "Read the school-bell clock shown. Enter the time as four digits, without punctuation.", correctAnswer: "0847", domain: "clock", visual: { kind: "clock", hour: 8, minute: 47 } },
  { descriptor: "AC9M3M05", week: 7, lesson: 1, skillId: "angle_as_turn", skillLabel: "Recognise an Angle as Turn", difficulty: "moderate", cognitiveCategory: "application", responseMode: "selected_response", misconceptionTags: ["turn-size-vs-direction"], contextKey: "pre-robot-quarter-turn", structureKey: "pre-turn-vs-direction-choice", prompt: "A robot makes a quarter turn anticlockwise. Which statement describes the angle turned?", correctAnswer: "It is equal to a right angle.", domain: "angle", options: ["It is less than a right angle because it turned anticlockwise.", "It is equal to a right angle.", "It is greater than a right angle because it changed direction."] },
  { descriptor: "AC9M3M01", week: 3, lesson: 1, skillId: "estimate_mass", skillLabel: "Estimate a Familiar Mass", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["estimate-vs-exact-reading"], contextKey: "pre-apple-benchmark", structureKey: "pre-mass-benchmark-multiple", prompt: "One apple has a familiar mass of about 150 g. Enter a reasonable estimate for the mass of 4 similar apples in grams.", correctAnswer: "600", domain: "unit_estimate" },
  { descriptor: "AC9M3M02", week: 4, lesson: 2, skillId: "read_measuring_jug", skillLabel: "Read a Labelled Measuring Jug", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["scale-interval-value"], contextKey: "pre-lemonade-jug", structureKey: "pre-jug-hundreds-millilitres", prompt: "Read the lemonade jug shown. Enter the capacity in millilitres.", correctAnswer: "750", domain: "instrument", visual: { kind: "jug", value: 750, unit: "mL", max: 1000 } },
  { descriptor: "AC9M3M03", week: 5, lesson: 3, skillId: "compare_duration", skillLabel: "Compare Formal Durations", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["duration-unit-scale"], contextKey: "pre-reading-sessions", structureKey: "pre-duration-difference-minutes", prompt: "One reading session lasts 1 hour and another lasts 45 minutes. Enter the difference in minutes.", correctAnswer: "15", domain: "duration" },
  { descriptor: "AC9M3M04", week: 6, lesson: 2, skillId: "digital_time", skillLabel: "Match Analog and Digital Time", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["analog-hand-role"], contextKey: "pre-lunch-clock", structureKey: "pre-clock-after-hour", prompt: "Read the lunch-time clock shown. Enter the time as four digits, without punctuation.", correctAnswer: "1213", domain: "clock", visual: { kind: "clock", hour: 12, minute: 13 } },
  { descriptor: "AC9M3M05", week: 7, lesson: 2, skillId: "right_angle_benchmark", skillLabel: "Use a Right-Angle Benchmark", difficulty: "moderate", cognitiveCategory: "application", responseMode: "selected_response", misconceptionTags: ["angle-arm-length"], contextKey: "pre-scissors-arms", structureKey: "pre-arm-length-angle-choice", prompt: "Two pairs of scissors have the same opening, but one pair has longer blades. Which comparison is correct?", correctAnswer: "The angles are equal because blade length does not change the opening.", domain: "angle", options: ["The longer blades make a greater angle.", "The angles are equal because blade length does not change the opening.", "The shorter blades make a greater angle."] },
  { descriptor: "AC9M3M02", week: 1, lesson: 3, skillId: "length_difference", skillLabel: "Find a Length Difference", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["mixed-unit-comparison"], contextKey: "pre-two-ribbons", structureKey: "pre-length-difference-centimetres", prompt: "A blue ribbon is 84 cm long and a red ribbon is 57 cm long. Enter the difference in centimetres.", correctAnswer: "27", domain: "instrument" },
  { descriptor: "AC9M3M01", week: 4, lesson: 3, skillId: "estimate_capacity", skillLabel: "Reason About a Capacity Estimate", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionTags: ["estimate-vs-exact-reading"], contextKey: "pre-cup-benchmark", structureKey: "pre-capacity-benchmark-multiple", prompt: "A familiar cup holds about 250 mL. Enter a reasonable estimate for 3 full cups in millilitres.", correctAnswer: "750", domain: "unit_estimate" },
  { descriptor: "AC9M3M02", week: 1, lesson: 3, skillId: "ruler_diagnosis", skillLabel: "Diagnose a Ruler Error", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionDiagnosis: true, misconceptionTags: ["ruler-starting-point"], contextKey: "pre-offset-pencil", structureKey: "pre-ruler-offset-whole", prompt: "A pencil starts at the 2 cm mark and ends at the 13 cm mark. A student reports 13 cm. Enter the pencil's actual length in centimetres.", correctAnswer: "11", domain: "instrument" },
  { descriptor: "AC9M3M04", week: 6, lesson: 3, skillId: "clock_diagnosis", skillLabel: "Diagnose a Clock Reading", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionDiagnosis: true, misconceptionTags: ["analog-hand-role"], contextKey: "pre-hands-swapped-clock", structureKey: "pre-clock-hand-role-diagnosis", prompt: "On a clock, the long hand points to 6 and the short hand is halfway between 4 and 5. A student says 6:04. Enter the correct time as four digits, without punctuation.", correctAnswer: "0430", domain: "clock" },
  { descriptor: "AC9M3M02", week: 3, lesson: 3, skillId: "measurement_transfer", skillLabel: "Compare Instrument Measurements", difficulty: "very_challenging", cognitiveCategory: "transfer", responseMode: "constructed_response", misconceptionTags: ["mixed-unit-comparison"], contextKey: "pre-parcel-masses", structureKey: "pre-three-mass-difference", prompt: "Three parcels have masses 425 g, 680 g and 540 g. Enter the difference between the heaviest and lightest parcel in grams.", correctAnswer: "255", domain: "instrument" },
];

// Parallel forms keep the same descriptor, operation and response demand.
const PARALLEL_POST_VARIANTS: readonly Partial<ItemSpec>[] = [
  {
    "prompt": "Which unit is most suitable for the mass of a full suitcase?",
    "correctAnswer": "kilograms",
    "visual": undefined,
    "options": [
      "millilitres",
      "kilograms",
      "centimetres"
    ]
  },
  {
    "prompt": "Read the ruler shown. Enter the crayon length in centimetres.",
    "correctAnswer": "8",
    "visual": {
      "kind": "ruler",
      "toCm": 8,
      "label": "crayon"
    }
  },
  {
    "prompt": "How many minutes in 3 hours?",
    "correctAnswer": "180",
    "visual": undefined
  },
  {
    "prompt": "Read the training clock. Enter the time as four digits, without punctuation.",
    "correctAnswer": "0935",
    "visual": {
      "kind": "clock",
      "hour": 9,
      "minute": 35
    }
  },
  {
    "prompt": "A door opens wider than a square corner. How does its opening compare with a right angle?",
    "correctAnswer": "Greater than a right angle",
    "visual": undefined,
    "options": [
      "Less than a right angle",
      "Equal to a right angle",
      "Greater than a right angle"
    ]
  },
  {
    "prompt": "A familiar metre stick is about as long as a bench. Three such benches are placed end to end. Using this benchmark, estimate the total length in metres.",
    "correctAnswer": "3",
    "visual": undefined
  },
  {
    "prompt": "Read the flour scale shown. Enter the mass in grams.",
    "correctAnswer": "800",
    "visual": {
      "kind": "scaleDial",
      "value": 800,
      "unit": "g",
      "max": 1000
    }
  },
  {
    "prompt": "How many seconds in 4 minutes?",
    "correctAnswer": "240",
    "visual": undefined
  },
  {
    "prompt": "Read the library clock. Enter the time as four digits, without punctuation.",
    "correctAnswer": "1058",
    "visual": {
      "kind": "clock",
      "hour": 10,
      "minute": 58
    }
  },
  {
    "prompt": "A map arrow makes a quarter turn clockwise. Which statement describes the turn?",
    "correctAnswer": "It is equal to a right angle.",
    "visual": undefined,
    "options": [
      "It is less than a right angle.",
      "It is equal to a right angle.",
      "It is greater than a right angle."
    ]
  },
  {
    "prompt": "One orange has a familiar mass of about 200 g. Using this benchmark, estimate the mass of 4 similar oranges in grams.",
    "correctAnswer": "800",
    "visual": undefined
  },
  {
    "prompt": "Read the juice jug shown. Enter the amount in millilitres.",
    "correctAnswer": "650",
    "visual": {
      "kind": "jug",
      "value": 650,
      "unit": "mL",
      "max": 1000
    }
  },
  {
    "prompt": "One practice lasts 1 hour and another lasts 40 minutes. What is the difference in minutes?",
    "correctAnswer": "20",
    "visual": undefined
  },
  {
    "prompt": "Read the excursion clock. Enter the time as four digits, without punctuation.",
    "correctAnswer": "0219",
    "visual": {
      "kind": "clock",
      "hour": 2,
      "minute": 19
    }
  },
  {
    "prompt": "Two angles have the same opening but one has longer arms. Which comparison is correct?",
    "correctAnswer": "The angles are equal because arm length does not change the opening.",
    "visual": undefined,
    "options": [
      "The longer arms make a greater angle.",
      "The angles are equal because arm length does not change the opening.",
      "The shorter arms make a greater angle."
    ]
  },
  {
    "prompt": "A green ribbon is 83 cm and a yellow ribbon is 56 cm. What is the difference in centimetres?",
    "correctAnswer": "27",
    "visual": undefined
  },
  {
    "prompt": "A familiar mug holds about 300 mL. Using this benchmark, estimate the amount in 3 full mugs in millilitres.",
    "correctAnswer": "900",
    "visual": undefined
  },
  {
    "prompt": "A straw begins at 3 cm and ends at 15 cm on a ruler. A student reports 15 cm. What is its actual length in centimetres?",
    "correctAnswer": "12",
    "visual": undefined
  },
  {
    "prompt": "The long clock hand points to 6 and the short hand is halfway between 7 and 8. A student says 6:07. Enter the correct time as four digits.",
    "correctAnswer": "0730",
    "visual": undefined
  },
  {
    "prompt": "Three boxes have masses 435 g, 690 g and 550 g. What is the difference between the heaviest and lightest in grams?",
    "correctAnswer": "255",
    "visual": undefined
  }
];

const POSTTEST_SPECS: readonly ItemSpec[] = PRETEST_SPECS.map((spec, index) => ({
  ...spec, ...PARALLEL_POST_VARIANTS[index],
  contextKey: `post-paired-${index + 1}`, structureKey: `post-paired-${index + 1}`,
}));

export const YEAR3_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS = PRETEST_SPECS.map((spec, index) => candidate("pretest", index, spec));
export const YEAR3_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS = POSTTEST_SPECS.map((spec, index) => candidate("posttest", index, spec));
