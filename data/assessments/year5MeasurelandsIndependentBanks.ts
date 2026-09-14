import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { Question } from "@/data/assessments/posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentItemDifficulty,
  type AssessmentResponseMode,
  type IndependentAssessmentItem,
} from "@/data/assessments/assessmentItemStandard";

const CORRECT_TOKEN = "__measurelands_task_correct__";

type Level5Descriptor = "AC9M5M01" | "AC9M5M02" | "AC9M5M03" | "AC9M5M04";
type Form = "pretest" | "posttest";
type AssessmentAuthoredQuestion = Question & IndependentAssessmentItem;

type DirectResponseSpec = {
  correctAnswer: string;
  domain: "metric" | "perimeter" | "area" | "time24" | "angle";
  visual?: Question["visual"];
};

type ItemSpec = {
  index: number;
  descriptor: Level5Descriptor;
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
  task: PracticeTask;
  directResponse?: DirectResponseSpec;
};

function assessmentItem(form: Form, spec: ItemSpec): AssessmentAuthoredQuestion {
  const number = String(spec.index).padStart(2, "0");
  const id = `y5-measurement-${form === "pretest" ? "pre" : "post"}-${number}-v3`;
  const bankId = `measurelands-level-5-${form}-v3`;
  const isTransfer = spec.cognitiveCategory === "transfer";
  const requiresReasoning = spec.cognitiveCategory === "reasoning" || isTransfer;
  const prompt = "prompt" in spec.task ? String(spec.task.prompt) : spec.skillLabel;
  const directResponse = spec.directResponse;
  const correctAnswer = directResponse?.correctAnswer ?? CORRECT_TOKEN;
  const tolerance = (directResponse?.visual as { answerTolerance?: number } | undefined)?.answerTolerance;

  return {
    schemaVersion: 1,
    id,
    version: "3.0.0",
    realm: "measurement",
    level: 5,
    form,
    origin: "assessment_authored",
    sourcePool: form,
    bankId,
    primaryDescriptorCode: spec.descriptor,
    descriptorCodes: [spec.descriptor],
    curriculumLessonMapping: [{ week: spec.week, lesson: spec.lesson }],
    cognitiveCategory: spec.cognitiveCategory,
    difficulty: spec.difficulty,
    isTransfer,
    requiresReasoning,
    misconceptionDiagnosis: spec.misconceptionDiagnosis ?? false,
    responseMode: spec.responseMode,
    misconceptionTags: spec.misconceptionTags,
    contextKey: spec.contextKey,
    structureKey: spec.structureKey,
    prompt,
    renderer: directResponse
      ? { type: "numeric_entry", payload: { ...directResponse, sourceTask: spec.task } }
      : { type: spec.task.kind, payload: spec.task },
    scoring: directResponse
      ? { kind: tolerance == null ? "exact" : "numeric_tolerance", correctResponse: directResponse.correctAnswer, ...(tolerance == null ? {} : { tolerance }) }
      : { kind: "interaction", correctResponse: CORRECT_TOKEN },
    statistics: createUncalibratedItemStatistics(spec.difficulty),
    type: directResponse ? "numeric" : "measurelandsTask",
    correctAnswer,
    answer: correctAnswer,
    ...(directResponse ? { visual: directResponse.visual } : { practiceTask: spec.task }),
    skillId: spec.skillId,
    skillLabel: spec.skillLabel,
    linkedWeeks: [spec.week],
    linkedLessons: [spec.lesson],
    strand: "Measurement",
    curriculumCodes: [spec.descriptor],
    difficultyBand: spec.difficulty,
    reviewFeedback: "Review the curriculum evidence for this item before trying a new example.",
  };
}

function rectangleCells(width: number, height: number): Array<[number, number]> {
  return Array.from({ length: height }, (_, row) =>
    Array.from({ length: width }, (__, column): [number, number] => [column, row]),
  ).flat();
}

const PRETEST_SPECS: readonly ItemSpec[] = [
  {
    index: 1,
    descriptor: "AC9M5M01",
    week: 1,
    lesson: 1,
    skillId: "metric_unit_scale",
    skillLabel: "Choose a Metric Unit",
    difficulty: "easy",
    cognitiveCategory: "understanding",
    responseMode: "selected_response",
    misconceptionTags: ["inappropriate-metric-unit"],
    contextKey: "pre-parcel-mass",
    structureKey: "pre-unit-choice-mass-scale",
    task: {
      kind: "metricUnit",
      scene: "chooseUnit",
      prompt: "A parcel is ready for the post office. Which unit is most suitable for its mass?",
      attribute: "mass",
      object: { label: "parcel", emoji: "📦", context: "Post office counter" },
      options: ["g", "kg", "mL", "cm"],
      correctOption: "kg",
    },
  },
  {
    index: 2,
    descriptor: "AC9M5M02",
    week: 3,
    lesson: 1,
    skillId: "regular_perimeter",
    skillLabel: "Calculate Perimeter",
    difficulty: "easy",
    cognitiveCategory: "understanding",
    responseMode: "constructed_response",
    misconceptionTags: ["perimeter-vs-area"],
    contextKey: "pre-dog-run-boundary",
    structureKey: "pre-rectangle-perimeter-choice",
    task: {
      kind: "perimeterCalc",
      scene: "choose",
      prompt: "A rectangular dog run is 7 m long and 4 m wide. Enter the metres of fencing needed around it.",
      poly: [[0, 0], [7, 0], [7, 4], [0, 4]],
      sideLabels: [7, 4, 7, 4],
      unit: "m",
      theme: "garden",
      shapeName: "dog run",
      perimeter: 22,
      options: [11, 22, 28],
      correctNumber: 22,
    },
    directResponse: {
      correctAnswer: "22",
      domain: "perimeter",
      visual: { kind: "rectangle", w: 7, h: 4, mode: "perimeter", unit: "m" },
    },
  },
  {
    index: 3,
    descriptor: "AC9M5M04",
    week: 7,
    lesson: 3,
    skillId: "estimate_angle",
    skillLabel: "Estimate an Angle",
    difficulty: "easy",
    cognitiveCategory: "understanding",
    responseMode: "constructed_response",
    misconceptionTags: ["angle-arm-length"],
    contextKey: "pre-solar-panel-angle",
    structureKey: "pre-angle-estimate-acute",
    task: {
      kind: "protractor",
      scene: "estimate",
      prompt: "Estimate the angle of the solar-panel support. Enter the number of degrees.",
      angle: 70,
      baselineSide: "right",
      guidance: "none",
      context: { label: "solar-panel support", emoji: "☀️" },
      options: [35, 70, 110],
      correctOption: 70,
    },
    directResponse: { correctAnswer: "70", domain: "angle", visual: { kind: "angle", single: 70, answerTolerance: 10 } },
  },
  {
    index: 4,
    descriptor: "AC9M5M03",
    week: 6,
    lesson: 1,
    skillId: "convert_to_24_hour",
    skillLabel: "Convert to 24-Hour Time",
    difficulty: "easy",
    cognitiveCategory: "understanding",
    responseMode: "constructed_response",
    misconceptionTags: ["twelve-vs-twenty-four-hour-time"],
    contextKey: "pre-library-closing-time",
    structureKey: "pre-time-convert-afternoon-whole-hour",
    task: {
      kind: "time24",
      scene: "convert",
      prompt: "The library closes at 1:00 pm. Enter the 24-hour time as four digits.",
      minutes: 13 * 60,
      direction: "to24",
      options: ["01:00", "11:00", "13:00", "23:00"],
      correctOption: "13:00",
    },
    directResponse: { correctAnswer: "1300", domain: "time24" },
  },
  {
    index: 5,
    descriptor: "AC9M5M01",
    week: 2,
    lesson: 1,
    skillId: "read_mixed_length",
    skillLabel: "Read a Mixed-Unit Length",
    difficulty: "easy",
    cognitiveCategory: "application",
    responseMode: "constructed_response",
    misconceptionTags: ["mixed-unit-comparison"],
    contextKey: "pre-curtain-length",
    structureKey: "pre-precision-read-length",
    task: {
      kind: "precisionMeasure",
      scene: "readMixed",
      prompt: "A curtain measures 2 m 35 cm. Enter its length in metres.",
      attribute: "length",
      valueSmall: 235,
      object: { label: "curtain", emoji: "🪟", context: "Drama room" },
      options: ["2 m 35 cm", "2 m 53 cm", "235 m"],
      correctOption: "2 m 35 cm",
    },
    directResponse: { correctAnswer: "2.35", domain: "metric" },
  },
  {
    index: 6,
    descriptor: "AC9M5M02",
    week: 4,
    lesson: 1,
    skillId: "regular_area",
    skillLabel: "Calculate Rectangle Area",
    difficulty: "moderate",
    cognitiveCategory: "application",
    responseMode: "constructed_response",
    misconceptionTags: ["linear-vs-square-units"],
    contextKey: "pre-stage-floor-area",
    structureKey: "pre-area-choice-grid",
    task: {
      kind: "area",
      scene: "chooseArea",
      prompt: "A stage floor is 8 m by 3 m. Enter the area in square metres.",
      gridW: 8,
      gridH: 3,
      areaUnit: "m²",
      context: "Stage floor covering",
      emoji: "🎭",
      options: [11, 22, 24],
      correctNumber: 24,
    },
    directResponse: {
      correctAnswer: "24",
      domain: "area",
      visual: { kind: "rectangle", w: 8, h: 3, mode: "area", unit: "m" },
    },
  },
  {
    index: 7,
    descriptor: "AC9M5M04",
    week: 7,
    lesson: 1,
    skillId: "read_protractor",
    skillLabel: "Read a Protractor",
    difficulty: "moderate",
    cognitiveCategory: "application",
    responseMode: "constructed_response",
    misconceptionTags: ["protractor-wrong-scale"],
    contextKey: "pre-roof-brace-measure",
    structureKey: "pre-protractor-read-obtuse-right-base",
    task: {
      kind: "protractor",
      scene: "read",
      prompt: "Read the roof-brace angle. Enter the number of degrees.",
      angle: 124,
      baselineSide: "right",
      guidance: "none",
      context: { label: "roof brace", emoji: "🏠" },
      options: [56, 90, 124],
      correctOption: 124,
    },
    directResponse: { correctAnswer: "124", domain: "angle", visual: { kind: "protractor", angle: 124, baselineSide: "right" } },
  },
  {
    index: 8,
    descriptor: "AC9M5M03",
    week: 6,
    lesson: 2,
    skillId: "match_time_systems",
    skillLabel: "Match 12-Hour and 24-Hour Time",
    difficulty: "moderate",
    cognitiveCategory: "application",
    responseMode: "constructed_response",
    misconceptionTags: ["twelve-vs-twenty-four-hour-time"],
    contextKey: "pre-evening-swim-session",
    structureKey: "pre-time-match-evening-minutes",
    task: {
      kind: "time24",
      scene: "match",
      prompt: "The evening swim session starts at 9:05 pm. Enter the 24-hour time as four digits.",
      minutes: 21 * 60 + 5,
      options: ["09:05", "19:05", "21:05", "21:50"],
      correctOption: "21:05",
    },
    directResponse: { correctAnswer: "2105", domain: "time24" },
  },
  {
    index: 9,
    descriptor: "AC9M5M02",
    week: 3,
    lesson: 2,
    skillId: "irregular_perimeter",
    skillLabel: "Solve an Irregular Perimeter",
    difficulty: "moderate",
    cognitiveCategory: "application",
    responseMode: "constructed_response",
    misconceptionTags: ["perimeter-vs-area"],
    contextKey: "pre-community-garden-edge",
    structureKey: "pre-irregular-perimeter-numeric",
    task: {
      kind: "perimeterCalc",
      scene: "calc",
      prompt: "Find the total boundary length of this community garden.",
      poly: [[0, 0], [9, 0], [9, 3], [5, 3], [5, 7], [0, 7]],
      sideLabels: [9, 3, 4, 4, 5, 7],
      unit: "m",
      theme: "garden",
      shapeName: "community garden",
      perimeter: 32,
      answerValue: 32,
      answerUnit: "m",
    },
  },
  {
    index: 10,
    descriptor: "AC9M5M04",
    week: 7,
    lesson: 2,
    skillId: "construct_angle",
    skillLabel: "Construct an Angle",
    difficulty: "moderate",
    cognitiveCategory: "application",
    responseMode: "manipulated_response",
    misconceptionTags: ["protractor-baseline"],
    contextKey: "pre-sign-support-construction",
    structureKey: "pre-protractor-construct-acute",
    task: {
      kind: "protractor",
      scene: "construct",
      prompt: "Construct a 68° angle for the sign support.",
      targetDeg: 68,
      baselineSide: "right",
      guidance: "none",
      context: { label: "sign support", emoji: "🪧" },
    },
  },
  {
    index: 11,
    descriptor: "AC9M5M01",
    week: 1,
    lesson: 2,
    skillId: "tool_and_unit",
    skillLabel: "Choose a Tool and Unit",
    difficulty: "moderate",
    cognitiveCategory: "application",
    responseMode: "constructed_response",
    misconceptionTags: ["capacity-vs-volume"],
    contextKey: "pre-paint-tin-capacity",
    structureKey: "pre-tool-unit-capacity-small-container",
    task: {
      kind: "metricUnit",
      scene: "toolAndUnit",
      prompt: "A small paint tin contains 0.65 L. Enter the same capacity in millilitres.",
      attribute: "capacity",
      object: { label: "paint tin", emoji: "🪣", context: "Art room" },
      tools: [
        { id: "jug", label: "measuring jug", emoji: "🥛" },
        { id: "scale", label: "mass scale", emoji: "⚖️" },
        { id: "tape", label: "tape measure", emoji: "📏" },
      ],
      correctTool: "jug",
      options: ["mL", "kg", "cm"],
      correctOption: "mL",
    },
    directResponse: {
      correctAnswer: "650",
      domain: "metric",
      visual: { kind: "jug", value: 650, unit: "mL", max: 1000 },
    },
  },
  {
    index: 12,
    descriptor: "AC9M5M02",
    week: 4,
    lesson: 2,
    skillId: "area_with_square_units",
    skillLabel: "Use Square Units for Area",
    difficulty: "moderate",
    cognitiveCategory: "application",
    responseMode: "constructed_response",
    misconceptionTags: ["linear-vs-square-units"],
    contextKey: "pre-poster-board-area",
    structureKey: "pre-area-choice-centimetres",
    task: {
      kind: "area",
      scene: "chooseArea",
      prompt: "A poster board is 9 cm by 4 cm. Enter its area in square centimetres.",
      gridW: 9,
      gridH: 4,
      areaUnit: "cm²",
      context: "Poster board",
      emoji: "🖼️",
      options: [13, 26, 36],
      correctNumber: 36,
    },
    directResponse: {
      correctAnswer: "36",
      domain: "area",
      visual: { kind: "rectangle", w: 9, h: 4, mode: "area", unit: "cm" },
    },
  },
  {
    index: 13,
    descriptor: "AC9M5M03",
    week: 6,
    lesson: 2,
    skillId: "diagnose_time_conversion",
    skillLabel: "Diagnose a Time Conversion",
    difficulty: "moderate",
    cognitiveCategory: "reasoning",
    responseMode: "constructed_response",
    misconceptionTags: ["twelve-vs-twenty-four-hour-time"],
    misconceptionDiagnosis: true,
    contextKey: "pre-noon-news-conversion",
    structureKey: "pre-time-mistake-midday",
    task: {
      kind: "time24",
      scene: "mistake",
      prompt: "Professor Gauge wrote 00:00 for the midday news. Correct it by entering the 24-hour time as four digits.",
      minutes: 12 * 60,
      statement: "Midday is 12:00 am, so it is 00:00.",
      options: ["00:00", "12:00", "22:00"],
      correctOption: "12:00",
    },
    directResponse: { correctAnswer: "1200", domain: "time24" },
  },
  {
    index: 14,
    descriptor: "AC9M5M04",
    week: 7,
    lesson: 1,
    skillId: "select_protractor_scale",
    skillLabel: "Select the Protractor Scale",
    difficulty: "moderate",
    cognitiveCategory: "reasoning",
    responseMode: "selected_response",
    misconceptionTags: ["protractor-wrong-scale"],
    contextKey: "pre-gate-hinge-scale",
    structureKey: "pre-protractor-scale-left-baseline",
    task: {
      kind: "protractor",
      scene: "whichScale",
      prompt: "The gate hinge starts from the left baseline. Which reading is correct?",
      angle: 42,
      baselineSide: "left",
      guidance: "none",
      context: { label: "gate hinge", emoji: "🚪" },
      options: [42, 90, 138],
      correctOption: 42,
    },
  },
  {
    index: 15,
    descriptor: "AC9M5M01",
    week: 2,
    lesson: 2,
    skillId: "compare_mixed_mass",
    skillLabel: "Compare Mixed-Unit Mass",
    difficulty: "moderate",
    cognitiveCategory: "application",
    responseMode: "constructed_response",
    misconceptionTags: ["mixed-unit-comparison"],
    contextKey: "pre-science-sample-mass",
    structureKey: "pre-precision-compare-mass",
    task: {
      kind: "precisionMeasure",
      scene: "compareMixed",
      prompt: "A soil sample is 1 kg 450 g and a clay sample is 1 kg 380 g. Enter the difference in grams.",
      attribute: "mass",
      pair: {
        a: { valueSmall: 1450, label: "soil sample", emoji: "🪨" },
        b: { valueSmall: 1380, label: "clay sample", emoji: "🧱" },
      },
      compareMode: "larger",
      correctSide: "a",
    },
    directResponse: { correctAnswer: "70", domain: "metric" },
  },
  {
    index: 16,
    descriptor: "AC9M5M02",
    week: 3,
    lesson: 3,
    skillId: "diagnose_missed_side",
    skillLabel: "Diagnose a Perimeter Error",
    difficulty: "challenging",
    cognitiveCategory: "reasoning",
    responseMode: "constructed_response",
    misconceptionTags: ["perimeter-vs-area"],
    misconceptionDiagnosis: true,
    contextKey: "pre-wildlife-enclosure-error",
    structureKey: "pre-perimeter-diagnosis-missing-edge",
    task: {
      kind: "perimeterCalc",
      scene: "choose",
      prompt: "Professor Gauge missed an outside edge of this wildlife enclosure. Enter the correct perimeter in metres.",
      poly: [[0, 0], [8, 0], [8, 2], [5, 2], [5, 6], [0, 6]],
      sideLabels: [8, 2, 3, 4, 5, 6],
      unit: "m",
      theme: "paddock",
      shapeName: "wildlife enclosure",
      perimeter: 28,
      options: [22, 25, 28],
      correctNumber: 28,
    },
    directResponse: { correctAnswer: "28", domain: "perimeter" },
  },
  {
    index: 17,
    descriptor: "AC9M5M04",
    week: 7,
    lesson: 3,
    skillId: "diagnose_protractor_reading",
    skillLabel: "Diagnose a Protractor Reading",
    difficulty: "challenging",
    cognitiveCategory: "reasoning",
    responseMode: "constructed_response",
    misconceptionTags: ["protractor-wrong-scale"],
    misconceptionDiagnosis: true,
    contextKey: "pre-ramp-angle-error",
    structureKey: "pre-protractor-diagnosis-complementary-scale",
    task: {
      kind: "protractor",
      scene: "mistake",
      prompt: "Professor Gauge read the wrong protractor scale and wrote 144°. Enter the correct access-ramp angle.",
      angle: 36,
      baselineSide: "right",
      guidance: "none",
      context: { label: "access ramp", emoji: "♿" },
      statement: "The angle is 144°.",
      reasonOptions: [
        "He read the scale that does not begin at zero on the baseline.",
        "He should add 90° because the ramp rises.",
        "The arm is too short to measure the angle.",
      ],
      correctReason: "He read the scale that does not begin at zero on the baseline.",
    },
    directResponse: { correctAnswer: "36", domain: "angle", visual: { kind: "protractor", angle: 36, baselineSide: "right" } },
  },
  {
    index: 18,
    descriptor: "AC9M5M03",
    week: 6,
    lesson: 3,
    skillId: "convert_from_24_hour",
    skillLabel: "Convert from 24-Hour Time",
    difficulty: "challenging",
    cognitiveCategory: "application",
    responseMode: "constructed_response",
    misconceptionTags: ["twelve-vs-twenty-four-hour-time"],
    contextKey: "pre-ferry-departure-time",
    structureKey: "pre-time-convert-from24-late-evening",
    task: {
      kind: "time24",
      scene: "convert",
      prompt: "A ferry notice says 10:35 pm. Enter the matching 24-hour time as four digits.",
      minutes: 22 * 60 + 35,
      direction: "to12",
      options: ["10:35 am", "10:35 pm", "12:35 pm", "22:35 pm"],
      correctOption: "10:35 pm",
    },
    directResponse: { correctAnswer: "2235", domain: "time24" },
  },
  {
    index: 19,
    descriptor: "AC9M5M02",
    week: 5,
    lesson: 2,
    skillId: "diagnose_area_perimeter",
    skillLabel: "Diagnose Area and Perimeter",
    difficulty: "challenging",
    cognitiveCategory: "reasoning",
    responseMode: "constructed_response",
    misconceptionTags: ["perimeter-vs-area"],
    misconceptionDiagnosis: true,
    contextKey: "pre-classroom-carpet-error",
    structureKey: "pre-area-diagnosis-perimeter-answer",
    task: {
      kind: "area",
      scene: "mistakeDims",
      prompt: "Professor Gauge used the perimeter for a 7 m by 5 m classroom carpet. Enter the correct area in square metres.",
      gridW: 7,
      gridH: 5,
      areaUnit: "m²",
      context: "Classroom carpet",
      emoji: "🏫",
      statement: "Professor Gauge says 7 + 5 + 7 + 5 = 24 m² of carpet.",
      reasonOptions: [
        "He calculated perimeter instead of area.",
        "He should change metres into centimetres first.",
        "He counted the width twice but not the length.",
      ],
      correctReason: "He calculated perimeter instead of area.",
    },
    directResponse: {
      correctAnswer: "35",
      domain: "area",
      visual: { kind: "rectangle", w: 7, h: 5, mode: "area", unit: "m" },
    },
  },
  {
    index: 20,
    descriptor: "AC9M5M04",
    week: 7,
    lesson: 2,
    skillId: "transfer_construct_angle",
    skillLabel: "Transfer Angle Construction",
    difficulty: "very_challenging",
    cognitiveCategory: "transfer",
    responseMode: "manipulated_response",
    misconceptionTags: ["protractor-baseline"],
    contextKey: "pre-stage-light-beam",
    structureKey: "pre-transfer-protractor-construct-obtuse",
    task: {
      kind: "protractor",
      scene: "construct",
      prompt: "A stage light must turn 117° from its baseline. Construct the required angle.",
      targetDeg: 117,
      baselineSide: "right",
      guidance: "none",
      context: { label: "stage light", emoji: "🔦" },
    },
  },
] as const;

// The post form uses the same operations and interaction demands as its baseline.
const PARALLEL_POST_VARIANTS: readonly Pick<ItemSpec, "task" | "directResponse">[] = [
  {
    "task": {
      "kind": "metricUnit",
      "scene": "chooseUnit",
      "prompt": "Which unit is most suitable for the mass of a packed suitcase?",
      "attribute": "mass",
      "object": {
        "label": "suitcase",
        "emoji": "🧳",
        "context": "Journey"
      },
      "options": [
        "cm",
        "g",
        "kg",
        "mL"
      ],
      "correctOption": "kg"
    }
  },
  {
    "task": {
      "kind": "perimeterCalc",
      "scene": "choose",
      "prompt": "A rectangular pen is 8 m long and 3 m wide. Enter its perimeter in metres.",
      "poly": [
        [
          0,
          0
        ],
        [
          8,
          0
        ],
        [
          8,
          3
        ],
        [
          0,
          3
        ]
      ],
      "sideLabels": [
        8,
        3,
        8,
        3
      ],
      "unit": "m",
      "theme": "garden",
      "shapeName": "pen",
      "perimeter": 22,
      "options": [
        11,
        22,
        24
      ],
      "correctNumber": 22
    },
    "directResponse": {
      "correctAnswer": "22",
      "domain": "perimeter",
      "visual": {
        "kind": "rectangle",
        "w": 8,
        "h": 3,
        "mode": "perimeter",
        "unit": "m"
      }
    }
  },
  {
    "task": {
      "kind": "protractor",
      "scene": "estimate",
      "prompt": "Estimate the camera-support angle in degrees.",
      "angle": 60,
      "baselineSide": "right",
      "guidance": "none",
      "context": {
        "label": "camera support",
        "emoji": "📷"
      },
      "options": [
        30,
        60,
        100
      ],
      "correctOption": 60
    },
    "directResponse": {
      "correctAnswer": "60",
      "domain": "angle",
      "visual": {
        "kind": "angle",
        "single": 60,
        "answerTolerance": 10
      }
    }
  },
  {
    "task": {
      "kind": "time24",
      "scene": "convert",
      "prompt": "The museum closes at 2:00 pm. Enter the 24-hour time as four digits.",
      "minutes": 840,
      "direction": "to24",
      "options": [
        "02:00",
        "12:00",
        "14:00",
        "22:00"
      ],
      "correctOption": "14:00"
    },
    "directResponse": {
      "correctAnswer": "1400",
      "domain": "time24"
    }
  },
  {
    "task": {
      "kind": "precisionMeasure",
      "scene": "readMixed",
      "prompt": "A ribbon measures 3 m 45 cm. Enter its length in metres.",
      "attribute": "length",
      "valueSmall": 345,
      "object": {
        "label": "ribbon",
        "emoji": "🎀",
        "context": "Craft room"
      },
      "options": [
        "3 m 45 cm",
        "3 m 54 cm",
        "345 m"
      ],
      "correctOption": "3 m 45 cm"
    },
    "directResponse": {
      "correctAnswer": "3.45",
      "domain": "metric"
    }
  },
  {
    "task": {
      "kind": "area",
      "scene": "chooseArea",
      "prompt": "A mural is 7 m by 4 m. Enter its area in square metres.",
      "gridW": 7,
      "gridH": 4,
      "areaUnit": "m²",
      "context": "Mural",
      "emoji": "🎨",
      "options": [
        11,
        22,
        28
      ],
      "correctNumber": 28
    },
    "directResponse": {
      "correctAnswer": "28",
      "domain": "area",
      "visual": {
        "kind": "rectangle",
        "w": 7,
        "h": 4,
        "mode": "area",
        "unit": "m"
      }
    }
  },
  {
    "task": {
      "kind": "protractor",
      "scene": "read",
      "prompt": "Read the bridge-brace protractor. Enter the angle in degrees.",
      "angle": 132,
      "baselineSide": "right",
      "guidance": "none",
      "context": {
        "label": "bridge brace",
        "emoji": "🌉"
      },
      "options": [
        48,
        90,
        132
      ],
      "correctOption": 132
    },
    "directResponse": {
      "correctAnswer": "132",
      "domain": "angle",
      "visual": {
        "kind": "protractor",
        "angle": 132,
        "baselineSide": "right"
      }
    }
  },
  {
    "task": {
      "kind": "time24",
      "scene": "match",
      "prompt": "The evening concert starts at 8:05 pm. Enter the 24-hour time as four digits.",
      "minutes": 1205,
      "options": [
        "08:05",
        "18:05",
        "20:05",
        "20:50"
      ],
      "correctOption": "20:05"
    },
    "directResponse": {
      "correctAnswer": "2005",
      "domain": "time24"
    }
  },
  {
    "task": {
      "kind": "perimeterCalc",
      "scene": "calc",
      "prompt": "Find the total boundary length of this park.",
      "poly": [
        [
          0,
          0
        ],
        [
          8,
          0
        ],
        [
          8,
          4
        ],
        [
          5,
          4
        ],
        [
          5,
          7
        ],
        [
          0,
          7
        ]
      ],
      "sideLabels": [
        8,
        4,
        3,
        3,
        5,
        7
      ],
      "unit": "m",
      "theme": "garden",
      "shapeName": "park",
      "perimeter": 30,
      "answerValue": 30,
      "answerUnit": "m"
    }
  },
  {
    "task": {
      "kind": "protractor",
      "scene": "construct",
      "prompt": "Construct a 74° angle for the kite frame.",
      "targetDeg": 74,
      "baselineSide": "right",
      "guidance": "none",
      "context": {
        "label": "kite frame",
        "emoji": "🪁"
      }
    }
  },
  {
    "task": {
      "kind": "metricUnit",
      "scene": "toolAndUnit",
      "prompt": "A small bottle contains 0.75 L. Enter the capacity in millilitres.",
      "attribute": "capacity",
      "object": {
        "label": "bottle",
        "emoji": "🧴",
        "context": "Art room"
      },
      "tools": [
        {
          "id": "jug",
          "label": "measuring jug",
          "emoji": "🥛"
        },
        {
          "id": "scale",
          "label": "mass scale",
          "emoji": "⚖️"
        },
        {
          "id": "tape",
          "label": "tape measure",
          "emoji": "📏"
        }
      ],
      "correctTool": "jug",
      "options": [
        "mL",
        "kg",
        "cm"
      ],
      "correctOption": "mL"
    },
    "directResponse": {
      "correctAnswer": "750",
      "domain": "metric"
    }
  },
  {
    "task": {
      "kind": "area",
      "scene": "chooseArea",
      "prompt": "A sign is 8 cm by 5 cm. Enter its area in square centimetres.",
      "gridW": 8,
      "gridH": 5,
      "areaUnit": "cm²",
      "context": "Sign",
      "emoji": "🪧",
      "options": [
        13,
        26,
        40
      ],
      "correctNumber": 40
    },
    "directResponse": {
      "correctAnswer": "40",
      "domain": "area",
      "visual": {
        "kind": "rectangle",
        "w": 8,
        "h": 5,
        "mode": "area",
        "unit": "cm"
      }
    }
  },
  {
    "task": {
      "kind": "time24",
      "scene": "mistake",
      "prompt": "A notice writes 12:00 for midnight. Enter the correct 24-hour time as four digits.",
      "minutes": 0,
      "statement": "Midnight is 12:00.",
      "options": [
        "00:00",
        "12:00",
        "22:00"
      ],
      "correctOption": "00:00"
    },
    "directResponse": {
      "correctAnswer": "0000",
      "domain": "time24"
    }
  },
  {
    "task": {
      "kind": "protractor",
      "scene": "whichScale",
      "prompt": "The hatch hinge starts from the left baseline. Which reading is correct?",
      "angle": 48,
      "baselineSide": "left",
      "guidance": "none",
      "context": {
        "label": "hatch hinge",
        "emoji": "🚪"
      },
      "options": [
        48,
        90,
        132
      ],
      "correctOption": 48
    }
  },
  {
    "task": {
      "kind": "precisionMeasure",
      "scene": "compareMixed",
      "prompt": "A sand sample is 1 kg 560 g and a soil sample is 1 kg 480 g. Enter the difference in grams.",
      "attribute": "mass",
      "pair": {
        "a": {
          "valueSmall": 1560,
          "label": "sand",
          "emoji": "🏖️"
        },
        "b": {
          "valueSmall": 1480,
          "label": "soil",
          "emoji": "🪨"
        }
      },
      "compareMode": "larger",
      "correctSide": "a"
    },
    "directResponse": {
      "correctAnswer": "80",
      "domain": "metric"
    }
  },
  {
    "task": {
      "kind": "perimeterCalc",
      "scene": "choose",
      "prompt": "A student missed an outside edge of this enclosure. Enter the correct perimeter in metres.",
      "poly": [
        [
          0,
          0
        ],
        [
          9,
          0
        ],
        [
          9,
          2
        ],
        [
          5,
          2
        ],
        [
          5,
          6
        ],
        [
          0,
          6
        ]
      ],
      "sideLabels": [
        9,
        2,
        4,
        4,
        5,
        6
      ],
      "unit": "m",
      "theme": "paddock",
      "shapeName": "enclosure",
      "perimeter": 30,
      "options": [
        24,
        27,
        30
      ],
      "correctNumber": 30
    },
    "directResponse": {
      "correctAnswer": "30",
      "domain": "perimeter",
      "visual": {
        "kind": "perimeterShape",
        "points": [
          [
            0,
            0
          ],
          [
            9,
            0
          ],
          [
            9,
            2
          ],
          [
            5,
            2
          ],
          [
            5,
            6
          ],
          [
            0,
            6
          ]
        ],
        "sideLabels": [
          9,
          2,
          4,
          4,
          5,
          6
        ],
        "unit": "m"
      }
    }
  },
  {
    "task": {
      "kind": "protractor",
      "scene": "mistake",
      "prompt": "A student read the wrong protractor scale and wrote 142°. Enter the correct ramp angle.",
      "angle": 38,
      "baselineSide": "right",
      "guidance": "none",
      "context": {
        "label": "ramp",
        "emoji": "♿"
      },
      "statement": "The angle is 142°.",
      "reasonOptions": [
        "He read the scale that does not begin at zero on the baseline.",
        "He should add 90° because the ramp rises.",
        "The arm is too short to measure the angle."
      ],
      "correctReason": "He read the scale that does not begin at zero on the baseline."
    },
    "directResponse": {
      "correctAnswer": "38",
      "domain": "angle",
      "visual": {
        "kind": "protractor",
        "angle": 38,
        "baselineSide": "right"
      }
    }
  },
  {
    "task": {
      "kind": "time24",
      "scene": "convert",
      "prompt": "A radio program begins at 9:45 pm. Enter the matching 24-hour time as four digits.",
      "minutes": 1305,
      "direction": "to24",
      "options": [
        "09:45",
        "19:45",
        "21:45",
        "21:54"
      ],
      "correctOption": "21:45"
    },
    "directResponse": {
      "correctAnswer": "2145",
      "domain": "time24"
    }
  },
  {
    "task": {
      "kind": "area",
      "scene": "mistakeDims",
      "prompt": "A student used perimeter for an 8 m by 4 m carpet. Enter its correct area in square metres.",
      "gridW": 8,
      "gridH": 4,
      "areaUnit": "m²",
      "context": "Carpet",
      "emoji": "🏫",
      "statement": "The carpet area is 8 + 4 + 8 + 4 = 24 square metres.",
      "reasonOptions": [
        "He calculated perimeter instead of area.",
        "He should change metres into centimetres first.",
        "He counted the width twice but not the length."
      ],
      "correctReason": "He calculated perimeter instead of area."
    },
    "directResponse": {
      "correctAnswer": "32",
      "domain": "area",
      "visual": {
        "kind": "rectangle",
        "w": 8,
        "h": 4,
        "mode": "area",
        "unit": "m"
      }
    }
  },
  {
    "task": {
      "kind": "protractor",
      "scene": "construct",
      "prompt": "A robot arm must turn 123° from its baseline. Construct the angle.",
      "targetDeg": 123,
      "baselineSide": "right",
      "guidance": "none",
      "context": {
        "label": "robot arm",
        "emoji": "🦾"
      }
    }
  }
];
const POSTTEST_SPECS: readonly ItemSpec[] = PRETEST_SPECS.map((spec,index) => ({ ...spec, ...PARALLEL_POST_VARIANTS[index], contextKey: `post-paired-${index+1}`, structureKey: `post-paired-${index+1}` }));

function withIndependentReasoning(spec: ItemSpec): ItemSpec {
  if (spec.index === 20) return { ...spec, difficulty: "challenging", cognitiveCategory: "application" };
  if (![15, 19].includes(spec.index) || !spec.directResponse) return spec;
  const difference = spec.index === 15;
  const reasonOptions = difference
    ? ["Subtract the gram parts and then add the kilogram parts.", "Express both masses in grams and subtract to find the difference.", "Add the two masses to find how much heavier one is."]
    : ["Multiply the length by the width to count the square units covering the surface.", "Add all boundary lengths to find the surface area.", "Double the length and ignore the width."];
  return { ...spec, cognitiveCategory: "reasoning", responseMode: "justification",
    directResponse: { ...spec.directResponse, correctAnswer: `${spec.directResponse.correctAnswer}||${difference ? 2 : 1}`,
      visual: { ...(spec.directResponse.visual as Record<string, unknown> | undefined), reasonOptions } },
  };
}

export const YEAR5_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS: readonly AssessmentAuthoredQuestion[] =
  PRETEST_SPECS.map((spec) => assessmentItem("pretest", withIndependentReasoning(spec)));

export const YEAR5_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS: readonly AssessmentAuthoredQuestion[] =
  POSTTEST_SPECS.map((spec) => assessmentItem("posttest", withIndependentReasoning(spec)));
