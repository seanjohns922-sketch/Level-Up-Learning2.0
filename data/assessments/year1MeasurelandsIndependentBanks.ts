import type { Question } from "@/data/assessments/posttests";
import { createUncalibratedItemStatistics, type AssessmentCognitiveCategory, type AssessmentItemDifficulty, type AssessmentResponseMode, type IndependentAssessmentItem } from "@/data/assessments/assessmentItemStandard";

type Descriptor = "AC9M1M01" | "AC9M1M02" | "AC9M1M03";
type Form = "pretest" | "posttest";
type CandidateQuestion = Question & IndependentAssessmentItem;
type Domain = "comparison" | "length_measure" | "duration_sequence";
type ItemSpec = {
  descriptor: Descriptor; week: number; lesson: number; skillId: string; skillLabel: string;
  difficulty: AssessmentItemDifficulty; cognitiveCategory: AssessmentCognitiveCategory; responseMode: AssessmentResponseMode;
  misconceptionTags: readonly string[]; misconceptionDiagnosis?: boolean; contextKey: string; structureKey: string;
  prompt: string; correctAnswer: string; domain: Domain; options?: readonly string[]; visual?: Question["visual"];
};

function candidate(form: Form, index: number, spec: ItemSpec): CandidateQuestion {
  const selected = spec.options !== undefined;
  const id = `y1-measurement-${form === "pretest" ? "pre" : "post"}-${String(index + 1).padStart(2, "0")}-v3`;
  const selectedAnswerPosition = spec.options?.indexOf(spec.correctAnswer);
  return {
    schemaVersion: 1, id, version: "3.0.0", realm: "measurement", level: 1, form,
    origin: "assessment_authored", sourcePool: form, bankId: `measurelands-level-1-${form}-v3`,
    primaryDescriptorCode: spec.descriptor, descriptorCodes: [spec.descriptor], curriculumLessonMapping: [{ week: spec.week, lesson: spec.lesson }],
    cognitiveCategory: spec.cognitiveCategory, difficulty: spec.difficulty, isTransfer: spec.cognitiveCategory === "transfer",
    requiresReasoning: spec.cognitiveCategory === "reasoning" || spec.cognitiveCategory === "transfer",
    misconceptionDiagnosis: spec.misconceptionDiagnosis ?? false, responseMode: spec.responseMode,
    misconceptionTags: spec.misconceptionTags, contextKey: spec.contextKey, structureKey: spec.structureKey,
    ...(selected ? { selectedAnswerPosition: (selectedAnswerPosition ?? -1) + 1 } : {}), prompt: spec.prompt,
    renderer: { type: selected ? "selected_response" : "numeric_entry", payload: { domain: spec.domain, prompt: spec.prompt, correctAnswer: spec.correctAnswer, ...(spec.options ? { options: spec.options } : {}) } },
    scoring: { kind: "exact", correctResponse: spec.correctAnswer }, statistics: createUncalibratedItemStatistics(spec.difficulty),
    type: selected ? "mcq" : "numeric", options: spec.options ? [...spec.options] : undefined, correctAnswer: spec.correctAnswer,
    answer: spec.correctAnswer, skillId: spec.skillId, skillLabel: spec.skillLabel, linkedWeeks: [spec.week], linkedLessons: [spec.lesson],
    visual: spec.visual, strand: "Measurement", curriculumCodes: [spec.descriptor], difficultyBand: "year1", inputMode: selected ? undefined : "decimal",
  };
}

const ORIGINAL_PRETEST_SPECS: readonly ItemSpec[] = [
  { descriptor: "AC9M1M01", week: 3, lesson: 1, skillId: "identify_attribute", skillLabel: "Identify Capacity", difficulty: "easy", cognitiveCategory: "recall", responseMode: "selected_response", misconceptionTags: ["attribute-confusion"], contextKey: "pre-water-container-attribute", structureKey: "pre-name-capacity-attribute", prompt: "Which attribute tells how much water a container can hold?", correctAnswer: "Capacity", domain: "comparison", options: ["Mass", "Capacity", "Length"] },
  { descriptor: "AC9M1M02", week: 1, lesson: 1, skillId: "count_length_units", skillLabel: "Count Equal Length Units", difficulty: "easy", cognitiveCategory: "recall", responseMode: "constructed_response", misconceptionTags: ["gaps-or-overlaps"], contextKey: "pre-block-row-six", structureKey: "pre-count-equal-blocks", prompt: "A pencil reaches across 6 equal blocks placed end to end. Enter its length in blocks.", correctAnswer: "6", domain: "length_measure" },
  { descriptor: "AC9M1M03", week: 5, lesson: 1, skillId: "week_cycle", skillLabel: "Know the Week Cycle", difficulty: "easy", cognitiveCategory: "recall", responseMode: "constructed_response", misconceptionTags: ["routine-sequence"], contextKey: "pre-days-in-week", structureKey: "pre-week-day-count", prompt: "Enter the number of days in one week.", correctAnswer: "7", domain: "duration_sequence" },
  { descriptor: "AC9M1M01", week: 1, lesson: 2, skillId: "compare_length", skillLabel: "Compare Measured Lengths", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["non-uniform-units"], contextKey: "pre-two-ribbons", structureKey: "pre-same-unit-length-difference", prompt: "Two ribbons are measured with the same blocks. One is 8 blocks long and one is 5 blocks long. Enter the difference in blocks.", correctAnswer: "3", domain: "comparison" },
  { descriptor: "AC9M1M02", week: 1, lesson: 3, skillId: "fair_length_measure", skillLabel: "Recognise Fair Length Measurement", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "selected_response", misconceptionTags: ["gaps-or-overlaps"], contextKey: "pre-book-measurement-plan", structureKey: "pre-select-no-gap-plan", prompt: "Which plan measures a book fairly with informal units?", correctAnswer: "Use equal units touching end to end", domain: "length_measure", options: ["Use equal units touching end to end", "Leave gaps between the units", "Use units that overlap"] },
  { descriptor: "AC9M1M03", week: 4, lesson: 1, skillId: "choose_duration_unit", skillLabel: "Choose a Duration Unit", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "selected_response", misconceptionTags: ["duration-unit-choice"], contextKey: "pre-night-sleep-unit", structureKey: "pre-select-hours-for-sleep", prompt: "Which unit is sensible for the length of one night's sleep?", correctAnswer: "Hours", domain: "duration_sequence", options: ["Years", "Hours", "Weeks"] },
  { descriptor: "AC9M1M01", week: 2, lesson: 2, skillId: "compare_mass", skillLabel: "Compare Measured Mass", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["non-uniform-units"], contextKey: "pre-two-toy-masses", structureKey: "pre-same-unit-mass-difference", prompt: "Two toys balance with the same cubes. One balances 9 cubes and one balances 6 cubes. Enter how many cubes heavier the first toy is.", correctAnswer: "3", domain: "comparison" },
  { descriptor: "AC9M1M02", week: 1, lesson: 1, skillId: "measure_length", skillLabel: "Read an Informal Length", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["gaps-or-overlaps"], contextKey: "pre-crayon-seven-squares", structureKey: "pre-read-square-unit-length", prompt: "A crayon exactly covers 7 equal squares placed in one row. Enter its length in squares.", correctAnswer: "7", domain: "length_measure" },
  { descriptor: "AC9M1M03", week: 5, lesson: 3, skillId: "month_cycle", skillLabel: "Know the Year Cycle", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["routine-sequence"], contextKey: "pre-months-in-year", structureKey: "pre-year-month-count", prompt: "Enter the number of months in one year.", correctAnswer: "12", domain: "duration_sequence" },
  { descriptor: "AC9M1M01", week: 3, lesson: 2, skillId: "compare_capacity", skillLabel: "Compare Measured Capacity", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "selected_response", misconceptionTags: ["attribute-confusion"], contextKey: "pre-tall-short-jugs", structureKey: "pre-capacity-evidence-choice", prompt: "A tall container holds 5 cups. A shorter container holds 8 of the same cup. Which holds more?", correctAnswer: "The shorter container", domain: "comparison", options: ["The tall container", "The shorter container", "They hold the same"] },
  { descriptor: "AC9M1M02", week: 1, lesson: 1, skillId: "measure_length", skillLabel: "Measure with Equal Units", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["gaps-or-overlaps"], contextKey: "pre-card-eight-squares", structureKey: "pre-complete-equal-unit-row", prompt: "A card starts at the beginning of a row and ends after 8 equal squares. Enter its length in squares.", correctAnswer: "8", domain: "length_measure" },
  { descriptor: "AC9M1M03", week: 5, lesson: 1, skillId: "weeks_to_days", skillLabel: "Relate Weeks and Days", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["routine-sequence"], contextKey: "pre-three-weeks", structureKey: "pre-weeks-to-days", prompt: "Enter the number of days in 3 weeks.", correctAnswer: "21", domain: "duration_sequence" },
  { descriptor: "AC9M1M01", week: 4, lesson: 2, skillId: "compare_duration", skillLabel: "Compare Measured Durations", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["duration-comparison-evidence"], contextKey: "pre-two-trips", structureKey: "pre-hour-duration-difference", prompt: "One trip lasts 5 hours and another lasts 2 hours. Enter the difference in hours.", correctAnswer: "3", domain: "comparison" },
  { descriptor: "AC9M1M01", week: 3, lesson: 2, skillId: "order_capacity", skillLabel: "Order Measured Capacities", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["attribute-confusion"], contextKey: "pre-three-cup-counts", structureKey: "pre-capacity-count-range", prompt: "Three containers hold 4, 9 and 6 of the same cup. Enter the difference between the greatest and least capacities in cups.", correctAnswer: "5", domain: "comparison" },
  { descriptor: "AC9M1M03", week: 4, lesson: 1, skillId: "choose_duration_unit", skillLabel: "Choose a Long Duration Unit", difficulty: "moderate", cognitiveCategory: "application", responseMode: "selected_response", misconceptionTags: ["duration-unit-choice"], contextKey: "pre-tree-growth-unit", structureKey: "pre-select-years-for-growth", prompt: "Which unit is most sensible for how long a tree takes to grow tall?", correctAnswer: "Years", domain: "duration_sequence", options: ["Hours", "Days", "Years"] },
  { descriptor: "AC9M1M01", week: 2, lesson: 2, skillId: "order_mass", skillLabel: "Order Measured Masses", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["attribute-confusion"], contextKey: "pre-three-balance-counts", structureKey: "pre-identify-heaviest-count", prompt: "Three objects balance with 6, 11 and 8 equal cubes. Enter the cube count of the heaviest object.", correctAnswer: "11", domain: "comparison" },
  { descriptor: "AC9M1M02", week: 1, lesson: 3, skillId: "diagnose_gap", skillLabel: "Diagnose a Gap", difficulty: "moderate", cognitiveCategory: "application", responseMode: "selected_response", misconceptionDiagnosis: true, misconceptionTags: ["gaps-or-overlaps"], contextKey: "pre-straw-gap-plan", structureKey: "pre-fix-one-gap", prompt: "A student leaves a space between two equal units while measuring a straw. What should the student do?", correctAnswer: "Move the units together and measure again", domain: "length_measure", options: ["Count the gap as another unit", "Move the units together and measure again", "Use different-sized units"] },
  { descriptor: "AC9M1M03", week: 5, lesson: 3, skillId: "years_to_months", skillLabel: "Relate Years and Months", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["routine-sequence"], contextKey: "pre-two-years", structureKey: "pre-years-to-months", prompt: "Enter the number of months in 2 years.", correctAnswer: "24", domain: "duration_sequence" },
  { descriptor: "AC9M1M03", week: 4, lesson: 1, skillId: "diagnose_duration_unit", skillLabel: "Diagnose a Duration Unit", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionDiagnosis: true, misconceptionTags: ["duration-unit-choice"], contextKey: "pre-school-year-hours", structureKey: "pre-reject-hours-for-school-year", prompt: "A student says a school year lasts about 40 hours. Which correction is best?", correctAnswer: "A school year is better described in months", domain: "duration_sequence", options: ["A school year is better described in months", "A school year lasts less than one hour", "Hours and months mean the same duration"] },
  { descriptor: "AC9M1M01", week: 2, lesson: 3, skillId: "diagnose_fair_mass", skillLabel: "Diagnose an Unfair Mass Comparison", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionDiagnosis: true, misconceptionTags: ["non-uniform-units"], contextKey: "pre-mixed-balance-cubes", structureKey: "pre-reject-different-mass-units", prompt: "Two objects are balanced using cubes of different sizes. Why is the comparison unfair?", correctAnswer: "The same-sized mass units were not used", domain: "comparison", options: ["The same-sized mass units were not used", "Every object must balance 10 cubes", "Large cubes always make an object lighter"] },
];

// Assessment tasks compare and sequence measurement evidence without multi-week arithmetic.
const PRE_VARIANTS: readonly Partial<ItemSpec>[] = [
  {
    "prompt": "Which attribute tells how much water a container can hold?",
    "correctAnswer": "Capacity",
    "options": [
      "Mass",
      "Capacity",
      "Length"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "How many equal blocks long is the pencil?",
    "correctAnswer": "6",
    "options": undefined,
    "visual": {
      "type": "informal_measurement_units",
      "rows": [
        {
          "label": "Pencil",
          "units": 6
        }
      ]
    },
    "responseMode": "constructed_response"
  },
  {
    "prompt": "Which day comes just after Friday?",
    "correctAnswer": "Saturday",
    "options": [
      "Thursday",
      "Saturday",
      "Monday"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "The ribbons are measured with equal blocks. Which is longer?",
    "correctAnswer": "Ribbon A",
    "options": [
      "Ribbon A",
      "Ribbon B",
      "They are equal"
    ],
    "visual": {
      "type": "informal_measurement_units",
      "rows": [
        {
          "label": "Ribbon A",
          "units": 8
        },
        {
          "label": "Ribbon B",
          "units": 5
        }
      ]
    },
    "responseMode": "selected_response"
  },
  {
    "prompt": "Which plan measures a book fairly with informal units?",
    "correctAnswer": "Use equal units touching end to end",
    "options": [
      "Use equal units touching end to end",
      "Leave gaps between the units",
      "Use units that overlap"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "Which unit is sensible for the length of one night's sleep?",
    "correctAnswer": "Hours",
    "options": [
      "Years",
      "Hours",
      "Weeks"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "Look at the balance. Which object is heavier?",
    "correctAnswer": "A",
    "options": [
      "A",
      "B",
      "They have equal mass"
    ],
    "visual": {
      "type": "ground_measurement_comparison",
      "attribute": "mass",
      "labels": [
        "A",
        "B"
      ],
      "values": [
        105,
        65
      ],
      "description": "Balance with pan A lower than pan B."
    },
    "responseMode": "selected_response"
  },
  {
    "prompt": "How many equal squares long is the crayon?",
    "correctAnswer": "7",
    "options": undefined,
    "visual": {
      "type": "informal_measurement_units",
      "rows": [
        {
          "label": "Crayon",
          "units": 7
        }
      ]
    },
    "responseMode": "constructed_response"
  },
  {
    "prompt": "Which month comes just after March?",
    "correctAnswer": "April",
    "options": [
      "February",
      "April",
      "June"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "A tall container holds 5 cups. A shorter container holds 8 of the same cup. Which holds more?",
    "correctAnswer": "The shorter container",
    "options": [
      "The tall container",
      "The shorter container",
      "They hold the same"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "How many equal blocks long is the card?",
    "correctAnswer": "8",
    "options": undefined,
    "visual": {
      "type": "informal_measurement_units",
      "rows": [
        {
          "label": "Card",
          "units": 8
        }
      ]
    },
    "responseMode": "constructed_response"
  },
  {
    "prompt": "Which list puts these durations from shortest to longest?",
    "correctAnswer": "1 hour, 1 day, 1 week",
    "options": [
      "1 week, 1 day, 1 hour",
      "1 hour, 1 day, 1 week",
      "1 day, 1 hour, 1 week"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "One trip lasts 5 hours and another lasts 2 hours. Which lasts longer?",
    "correctAnswer": "The 5-hour trip",
    "options": [
      "The 2-hour trip",
      "Both trips last equally long",
      "The 5-hour trip"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "Containers A, B and C hold 4, 9 and 6 of the same cup. Which order is least to greatest capacity?",
    "correctAnswer": "A, C, B",
    "options": [
      "A, C, B",
      "B, C, A",
      "C, A, B"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "Which unit is most sensible for how long a tree takes to grow tall?",
    "correctAnswer": "Years",
    "options": [
      "Hours",
      "Days",
      "Years"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "Objects A, B and C balance 6, 11 and 8 equal cubes. Which order is lightest to heaviest?",
    "correctAnswer": "A, C, B",
    "options": [
      "B, C, A",
      "C, A, B",
      "A, C, B"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "A student leaves a space between two equal units while measuring a straw. What should the student do?",
    "correctAnswer": "Move the units together and measure again",
    "options": [
      "Count the gap as another unit",
      "Move the units together and measure again",
      "Use different-sized units"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "Which list puts these events in their usual order during a day?",
    "correctAnswer": "Breakfast, lunch, dinner",
    "options": [
      "Dinner, breakfast, lunch",
      "Breakfast, lunch, dinner",
      "Lunch, dinner, breakfast"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "A student says a school year lasts about 40 hours. Which correction is best?",
    "correctAnswer": "A school year is better described in months",
    "options": [
      "A school year is better described in months",
      "A school year lasts less than one hour",
      "Hours and months mean the same duration"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "Two objects are balanced using cubes of different masses. Why is comparing their cube counts unfair?",
    "correctAnswer": "The mass units are not equal",
    "options": [
      "Every object must balance 10 cubes",
      "The mass units are not equal",
      "More cubes always means a heavier object"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  }
];
const POST_VARIANTS: readonly Partial<ItemSpec>[] = [
  {
    "prompt": "Which attribute describes how heavy an object is?",
    "correctAnswer": "Mass",
    "options": [
      "Capacity",
      "Length",
      "Mass"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "How many equal blocks long is the marker?",
    "correctAnswer": "5",
    "options": undefined,
    "visual": {
      "type": "informal_measurement_units",
      "rows": [
        {
          "label": "Marker",
          "units": 5
        }
      ]
    },
    "responseMode": "constructed_response"
  },
  {
    "prompt": "Which day comes just after Tuesday?",
    "correctAnswer": "Wednesday",
    "options": [
      "Monday",
      "Friday",
      "Wednesday"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "The strips are measured with equal blocks. Which is longer?",
    "correctAnswer": "Strip B",
    "options": [
      "Strip A",
      "Strip B",
      "They are equal"
    ],
    "visual": {
      "type": "informal_measurement_units",
      "rows": [
        {
          "label": "Strip A",
          "units": 6
        },
        {
          "label": "Strip B",
          "units": 9
        }
      ]
    },
    "responseMode": "selected_response"
  },
  {
    "prompt": "Which arrangement gives a fair informal length measurement?",
    "correctAnswer": "Equal units placed from start to end",
    "options": [
      "Units with spaces between them",
      "Equal units placed from start to end",
      "Large and small units mixed together"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "Which unit is sensible for the length of a school day?",
    "correctAnswer": "Hours",
    "options": [
      "Hours",
      "Months",
      "Years"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "Use the balance to choose the heavier object.",
    "correctAnswer": "B",
    "options": [
      "They have equal mass",
      "A",
      "B"
    ],
    "visual": {
      "type": "ground_measurement_comparison",
      "attribute": "mass",
      "labels": [
        "A",
        "B"
      ],
      "values": [
        65,
        105
      ],
      "description": "Balance with pan A higher than pan B."
    },
    "responseMode": "selected_response"
  },
  {
    "prompt": "How many equal squares long is the straw?",
    "correctAnswer": "8",
    "options": undefined,
    "visual": {
      "type": "informal_measurement_units",
      "rows": [
        {
          "label": "Straw",
          "units": 8
        }
      ]
    },
    "responseMode": "constructed_response"
  },
  {
    "prompt": "Which month comes just after September?",
    "correctAnswer": "October",
    "options": [
      "October",
      "August",
      "December"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "A wide container holds 7 cups. A taller container holds 5 of the same cup. Which holds more?",
    "correctAnswer": "The wide container",
    "options": [
      "The taller container",
      "They hold the same",
      "The wide container"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "How many equal blocks long is the ribbon?",
    "correctAnswer": "7",
    "options": undefined,
    "visual": {
      "type": "informal_measurement_units",
      "rows": [
        {
          "label": "Ribbon",
          "units": 7
        }
      ]
    },
    "responseMode": "constructed_response"
  },
  {
    "prompt": "Which list puts these durations from longest to shortest?",
    "correctAnswer": "1 week, 1 day, 1 hour",
    "options": [
      "1 hour, 1 day, 1 week",
      "1 week, 1 hour, 1 day",
      "1 week, 1 day, 1 hour"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "One workshop lasts 3 hours and another lasts 6 hours. Which lasts longer?",
    "correctAnswer": "The 6-hour workshop",
    "options": [
      "The 6-hour workshop",
      "The 3-hour workshop",
      "Both workshops last equally long"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "Jugs A, B and C hold 8, 5 and 10 of the same cup. Which order is least to greatest capacity?",
    "correctAnswer": "B, A, C",
    "options": [
      "C, A, B",
      "B, A, C",
      "A, B, C"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "Which unit is sensible for how long a baby takes to grow into an adult?",
    "correctAnswer": "Years",
    "options": [
      "Days",
      "Years",
      "Hours"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "Toys A, B and C balance 9, 12 and 7 equal cubes. Which order is lightest to heaviest?",
    "correctAnswer": "C, A, B",
    "options": [
      "C, A, B",
      "B, A, C",
      "A, C, B"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "A student overlaps equal blocks while measuring a card. How should this be fixed?",
    "correctAnswer": "Place the blocks end to end and measure again",
    "options": [
      "Count overlapping blocks twice",
      "Place the blocks end to end and measure again",
      "Leave a gap after every block"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "Which sequence shows a usual school day?",
    "correctAnswer": "Wake up, go to school, go to bed",
    "options": [
      "Go to school, wake up, go to bed",
      "Go to bed, go to school, wake up",
      "Wake up, go to school, go to bed"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "A student says a summer holiday lasts about 30 hours. Which correction is best?",
    "correctAnswer": "A summer holiday is better described in weeks",
    "options": [
      "Hours and weeks are the same duration",
      "A summer holiday is better described in weeks",
      "A summer holiday is shorter than one hour"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  },
  {
    "prompt": "A bag is balanced with heavy blocks and a toy with light blocks. Why is comparing the counts unfair?",
    "correctAnswer": "The blocks do not have equal mass",
    "options": [
      "The blocks do not have equal mass",
      "Every bag needs the same number of blocks",
      "A bigger count always means a heavier object"
    ],
    "visual": undefined,
    "responseMode": "selected_response"
  }
];
const SKILL_REPAIRS: Record<number, Partial<ItemSpec>> = {
  2: { skillId: "day_sequence", skillLabel: "Sequence Days" },
  8: { skillId: "month_sequence", skillLabel: "Sequence Months" },
  11: { week: 4, lesson: 3, skillId: "order_durations", skillLabel: "Order Durations" },
  17: { week: 8, lesson: 3, skillId: "sequence_events", skillLabel: "Sequence Daily Events" },
};
const PRETEST_SPECS: readonly ItemSpec[] = ORIGINAL_PRETEST_SPECS.map((spec, index) => ({ ...spec, ...SKILL_REPAIRS[index], ...PRE_VARIANTS[index] }));
const POSTTEST_SPECS: readonly ItemSpec[] = ORIGINAL_PRETEST_SPECS.map((spec, index) => ({ ...spec, ...SKILL_REPAIRS[index], ...POST_VARIANTS[index], contextKey: `post-paired-${index+1}`, structureKey: `post-paired-${index+1}` }));

export const YEAR1_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS = PRETEST_SPECS.map((spec, index) => candidate("pretest", index, spec));
export const YEAR1_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS = POSTTEST_SPECS.map((spec, index) => candidate("posttest", index, spec));
