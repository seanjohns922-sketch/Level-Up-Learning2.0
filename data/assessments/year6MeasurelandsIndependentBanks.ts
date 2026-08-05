import type { Question } from "@/data/assessments/posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentItemDifficulty,
  type AssessmentResponseMode,
  type IndependentAssessmentItem,
} from "@/data/assessments/assessmentItemStandard";

type Level6Descriptor = "AC9M6M01" | "AC9M6M02" | "AC9M6M03" | "AC9M6M04";
type Form = "pretest" | "posttest";
type CandidateQuestion = Question & IndependentAssessmentItem;

type ItemSpec = {
  descriptor: Level6Descriptor;
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
  domain: "metric" | "area" | "timetable" | "angle";
  options?: readonly string[];
  visual?: Question["visual"];
  inputMode?: Question["inputMode"];
};

function candidate(form: Form, index: number, spec: ItemSpec): CandidateQuestion {
  const number = String(index + 1).padStart(2, "0");
  const selected = spec.options !== undefined;
  const selectedAnswerPosition = spec.options?.indexOf(spec.correctAnswer);
  const id = `y6-measurement-${form === "pretest" ? "pre" : "post"}-${number}-v2`;

  return {
    schemaVersion: 1,
    id,
    version: "1.0.0",
    realm: "measurement",
    level: 6,
    form,
    origin: "assessment_authored",
    sourcePool: form,
    bankId: `measurelands-level-6-${form}-v1`,
    primaryDescriptorCode: spec.descriptor,
    descriptorCodes: [spec.descriptor],
    curriculumLessonMapping: [{ week: spec.week, lesson: spec.lesson }],
    cognitiveCategory: spec.cognitiveCategory,
    difficulty: spec.difficulty,
    isTransfer: spec.cognitiveCategory === "transfer",
    requiresReasoning:
      spec.cognitiveCategory === "reasoning" || spec.cognitiveCategory === "transfer",
    misconceptionDiagnosis: spec.misconceptionDiagnosis ?? false,
    responseMode: spec.responseMode,
    misconceptionTags: spec.misconceptionTags,
    contextKey: spec.contextKey,
    structureKey: spec.structureKey,
    ...(selected
      ? { selectedAnswerPosition: (selectedAnswerPosition ?? -1) + 1 }
      : {}),
    prompt: spec.prompt,
    renderer: {
      type: selected ? "selected_response" : "numeric_entry",
      payload: {
        domain: spec.domain,
        prompt: spec.prompt,
        correctAnswer: spec.correctAnswer,
        ...(spec.options ? { options: spec.options } : {}),
        ...(spec.visual ? { visual: spec.visual } : {}),
      },
    },
    scoring: { kind: "exact", correctResponse: spec.correctAnswer },
    statistics: createUncalibratedItemStatistics(spec.difficulty),
    type: selected ? "mcq" : "numeric",
    options: spec.options ? [...spec.options] : undefined,
    correctAnswer: spec.correctAnswer,
    answer: spec.correctAnswer,
    visual: spec.visual,
    inputMode: spec.inputMode,
    skillId: spec.skillId,
    skillLabel: spec.skillLabel,
    linkedWeeks: [spec.week],
    linkedLessons: [spec.lesson],
    strand: "Measurement",
    curriculumCodes: [spec.descriptor],
    difficultyBand: spec.difficulty,
    reviewFeedback: "Review the measurement relationship and the evidence required by the problem.",
  };
}

const PRETEST_SPECS: readonly ItemSpec[] = [
  {
    descriptor: "AC9M6M01", week: 4, lesson: 1, skillId: "metric_conversion", skillLabel: "Convert Metric Length",
    difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response",
    misconceptionTags: ["conversion-direction"], contextKey: "pre-space-rope", structureKey: "pre-m-to-cm-whole-tenths",
    prompt: "A space-camp rope is 3.6 m long. Enter its length in centimetres.", correctAnswer: "360", domain: "metric",
    visual: { kind: "convert", fromValue: 3.6, fromUnit: "m", toValue: 0, toUnit: "cm" },
  },
  {
    descriptor: "AC9M6M02", week: 1, lesson: 2, skillId: "rectangle_area", skillLabel: "Calculate Rectangle Area",
    difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response",
    misconceptionTags: ["linear-vs-square-units"], contextKey: "pre-seedling-bed", structureKey: "pre-area-integer-basic",
    prompt: "A rectangular seedling bed is 7 m long and 5 m wide. Enter its area in square metres.", correctAnswer: "35", domain: "area",
    visual: { kind: "rectangle", w: 7, h: 5, mode: "area", unit: "m" },
  },
  {
    descriptor: "AC9M6M03", week: 5, lesson: 2, skillId: "journey_duration", skillLabel: "Determine Journey Duration",
    difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response",
    misconceptionTags: ["elapsed-time-base-ten"], contextKey: "pre-museum-shuttle", structureKey: "pre-duration-under-hour",
    prompt: "A museum shuttle leaves at 09:15 and arrives at 10:05. Enter the journey duration in minutes.", correctAnswer: "50", domain: "timetable",
  },
  {
    descriptor: "AC9M6M04", week: 6, lesson: 1, skillId: "straight_line_angles", skillLabel: "Angles on a Straight Line",
    difficulty: "easy", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["angle-relationship-confusion"], contextKey: "pre-rail-junction", structureKey: "pre-line-single-obtuse",
    prompt: "Two adjacent angles lie on a straight line. One is 112 degrees. Enter the other angle in degrees.", correctAnswer: "68", domain: "angle",
    visual: { kind: "angle", known: 112, unknown: 68, total: 180 },
  },
  {
    descriptor: "AC9M6M01", week: 4, lesson: 2, skillId: "metric_conversion", skillLabel: "Convert Metric Mass",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["metric-decimal-place-value"], contextKey: "pre-flour-crate", structureKey: "pre-kg-to-g-hundredths",
    prompt: "A flour crate has a mass of 2.45 kg. Enter its mass in grams.", correctAnswer: "2450", domain: "metric",
    visual: { kind: "convert", fromValue: 2.45, fromUnit: "kg", toValue: 0, toUnit: "g" },
  },
  {
    descriptor: "AC9M6M02", week: 1, lesson: 3, skillId: "rectangle_area", skillLabel: "Apply the Area Formula",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["linear-vs-square-units"], contextKey: "pre-stage-panel", structureKey: "pre-area-decimal-length",
    prompt: "A rectangular stage panel is 12.5 m long and 4 m wide. Enter its area in square metres.", correctAnswer: "50", domain: "area",
    visual: { kind: "rectangle", w: 12.5, h: 4, mode: "area", unit: "m" },
  },
  {
    descriptor: "AC9M6M03", week: 5, lesson: 2, skillId: "elapsed_time", skillLabel: "Solve Elapsed-Time Problems",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["elapsed-time-base-ten"], contextKey: "pre-ferry-crossing", structureKey: "pre-duration-cross-hour",
    prompt: "A ferry departs at 13:40 and arrives at 15:05. Enter the journey duration in minutes.", correctAnswer: "85", domain: "timetable",
  },
  {
    descriptor: "AC9M6M04", week: 6, lesson: 2, skillId: "angles_around_point", skillLabel: "Angles Around a Point",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["angle-point-vs-line-total"], contextKey: "pre-playground-hub", structureKey: "pre-point-four-angles",
    prompt: "Angles around a point are 90 degrees, 125 degrees, 75 degrees and x. Enter x in degrees.", correctAnswer: "70", domain: "angle",
    visual: { kind: "angle", known: 290, unknown: 70, total: 360 },
  },
  {
    descriptor: "AC9M6M01", week: 4, lesson: 2, skillId: "mixed_metric", skillLabel: "Combine Metric Capacity",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["mixed-unit-comparison"], contextKey: "pre-water-dispenser", structureKey: "pre-capacity-add-mixed",
    prompt: "A dispenser contains 1.8 L of water. Another 350 mL is added. Enter the total in millilitres.", correctAnswer: "2150", domain: "metric",
  },
  {
    descriptor: "AC9M6M02", week: 2, lesson: 1, skillId: "missing_dimension", skillLabel: "Find a Rectangle Dimension",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["rectangle-area-factor-pairs"], contextKey: "pre-display-board", structureKey: "pre-area-to-width-integer",
    prompt: "A rectangular display board has area 96 square metres and length 12 m. Enter its width in metres.", correctAnswer: "8", domain: "area",
  },
  {
    descriptor: "AC9M6M03", week: 5, lesson: 1, skillId: "timetable_deadline", skillLabel: "Use a Timetable Deadline",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["timetable-deadline-inclusive"], contextKey: "pre-clinic-bus", structureKey: "pre-arrival-before-deadline",
    prompt: "A bus arrives at 11:58. An appointment begins at 12:00. Enter how many minutes early the bus arrives.", correctAnswer: "2", domain: "timetable",
  },
  {
    descriptor: "AC9M6M04", week: 6, lesson: 3, skillId: "vertical_angles", skillLabel: "Use Vertically Opposite Angles",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["vertical-opposite-supplement"], contextKey: "pre-crossed-paths", structureKey: "pre-vertical-single-acute",
    prompt: "Two straight paths cross. One angle is 47 degrees. Enter the vertically opposite angle in degrees.", correctAnswer: "47", domain: "angle",
    visual: { kind: "angle", known: 47, unknown: 47, total: 360 },
  },
  {
    descriptor: "AC9M6M01", week: 4, lesson: 3, skillId: "conversion_reasoning", skillLabel: "Reason About Metric Conversion",
    difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "justification",
    misconceptionTags: ["metric-decimal-place-value"], contextKey: "pre-running-track", structureKey: "pre-conversion-explanation-choice",
    prompt: "A running track section is 0.72 km long. Which explanation correctly converts it to metres?",
    correctAnswer: "0.72 km is 720 m because each kilometre contains 1000 metres.", domain: "metric",
    options: ["0.72 km is 72 m because two decimal places are removed.", "0.72 km is 720 m because each kilometre contains 1000 metres.", "0.72 km is 7200 m because kilometres are larger than metres."],
  },
  {
    descriptor: "AC9M6M02", week: 2, lesson: 2, skillId: "area_misconception", skillLabel: "Distinguish Area from Perimeter",
    difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionDiagnosis: true,
    misconceptionTags: ["perimeter-vs-area"], contextKey: "pre-artwork-cover", structureKey: "pre-diagnose-area-not-perimeter",
    prompt: "A student adds 9 + 6 + 9 + 6 to find the surface covered by a 9 m by 6 m mural. Enter the correct area in square metres.", correctAnswer: "54", domain: "area",
    visual: { kind: "rectangle", w: 9, h: 6, mode: "area", unit: "m" },
  },
  {
    descriptor: "AC9M6M03", week: 5, lesson: 2, skillId: "timetable_wait", skillLabel: "Calculate Waiting Time",
    difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response",
    misconceptionTags: ["timetable-wait-time"], contextKey: "pre-station-transfer", structureKey: "pre-wait-between-services",
    prompt: "A train arrives at 10:20 and the connecting bus leaves at 10:47. Enter the waiting time in minutes.", correctAnswer: "27", domain: "timetable",
  },
  {
    descriptor: "AC9M6M04", week: 6, lesson: 1, skillId: "straight_line_angles", skillLabel: "Reason with a Straight Line",
    difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response",
    misconceptionTags: ["angle-point-vs-line-total"], contextKey: "pre-folding-ramp", structureKey: "pre-line-complement-trap",
    prompt: "An angle of 68 degrees and angle x form a straight line. Enter x in degrees.", correctAnswer: "112", domain: "angle",
    visual: { kind: "angle", known: 68, unknown: 112, total: 180 },
  },
  {
    descriptor: "AC9M6M01", week: 4, lesson: 3, skillId: "metric_comparison", skillLabel: "Compare Compatible Measurements",
    difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response",
    misconceptionTags: ["mixed-unit-comparison"], contextKey: "pre-supply-bags", structureKey: "pre-mass-difference-mixed",
    prompt: "One supply bag has mass 2.05 kg and another has mass 1980 g. Enter the difference in grams.", correctAnswer: "70", domain: "metric",
  },
  {
    descriptor: "AC9M6M02", week: 3, lesson: 2, skillId: "area_constraint", skillLabel: "Reason About Rectangle Dimensions",
    difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response",
    misconceptionTags: ["rectangle-area-factor-pairs"], contextKey: "pre-market-stall", structureKey: "pre-factor-pair-missing-width",
    prompt: "A rectangular market stall must cover 72 square metres. If its length is 9 m, enter the required width in metres.", correctAnswer: "8", domain: "area",
  },
  {
    descriptor: "AC9M6M03", week: 5, lesson: 3, skillId: "itinerary_duration", skillLabel: "Determine Multi-Leg Duration",
    difficulty: "very_challenging", cognitiveCategory: "transfer", responseMode: "constructed_response",
    misconceptionTags: ["timetable-wait-time"], contextKey: "pre-island-itinerary", structureKey: "pre-two-leg-total-elapsed",
    prompt: "A ferry leaves at 08:35 and arrives at 09:20. After a 15-minute wait, a bus leaves at 09:35 and arrives at 10:10. Enter the total time from the ferry departure to the bus arrival in minutes.", correctAnswer: "95", domain: "timetable",
  },
  {
    descriptor: "AC9M6M04", week: 6, lesson: 3, skillId: "angle_reasoning_chain", skillLabel: "Complete an Angle Reasoning Chain",
    difficulty: "very_challenging", cognitiveCategory: "transfer", responseMode: "explanation",
    misconceptionTags: ["vertical-opposite-supplement"], contextKey: "pre-road-intersection", structureKey: "pre-vertical-adjacent-chain",
    prompt: "Two straight roads cross. One angle is 64 degrees. Angle x is adjacent to it on a straight line. Enter x in degrees.", correctAnswer: "116", domain: "angle",
    visual: { kind: "angle", known: 64, unknown: 116, total: 180 },
  },
];

const POSTTEST_SPECS: readonly ItemSpec[] = [
  {
    descriptor: "AC9M6M01", week: 4, lesson: 1, skillId: "metric_conversion", skillLabel: "Convert Metric Length",
    difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response",
    misconceptionTags: ["metric-decimal-place-value"], contextKey: "post-trail-section", structureKey: "post-km-to-m-thousandths",
    prompt: "A short trail section is 0.006 km long. Enter its length in metres.", correctAnswer: "6", domain: "metric",
    visual: { kind: "convert", fromValue: 0.006, fromUnit: "km", toValue: 0, toUnit: "m" },
  },
  {
    descriptor: "AC9M6M02", week: 1, lesson: 3, skillId: "rectangle_area", skillLabel: "Apply the Area Formula",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["linear-vs-square-units"], contextKey: "post-solar-array", structureKey: "post-area-decimal-by-integer",
    prompt: "A rectangular solar array is 14.5 m long and 6 m wide. Enter its area in square metres.", correctAnswer: "87", domain: "area",
    visual: { kind: "rectangle", w: 14.5, h: 6, mode: "area", unit: "m" },
  },
  {
    descriptor: "AC9M6M03", week: 5, lesson: 2, skillId: "journey_duration", skillLabel: "Determine Journey Duration",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["elapsed-time-base-ten"], contextKey: "post-regional-coach", structureKey: "post-duration-one-hour-plus",
    prompt: "A coach departs at 14:25 and arrives at 16:10. Enter the journey duration in minutes.", correctAnswer: "105", domain: "timetable",
  },
  {
    descriptor: "AC9M6M04", week: 6, lesson: 1, skillId: "straight_line_angles", skillLabel: "Angles on a Straight Line",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["angle-relationship-confusion"], contextKey: "post-bridge-support", structureKey: "post-line-obtuse-known",
    prompt: "Two adjacent angles on a straight bridge support form 180 degrees. One is 137 degrees. Enter the other angle.", correctAnswer: "43", domain: "angle",
    visual: { kind: "angle", known: 137, unknown: 43, total: 180 },
  },
  {
    descriptor: "AC9M6M01", week: 4, lesson: 2, skillId: "metric_conversion", skillLabel: "Convert Metric Capacity",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["conversion-direction"], contextKey: "post-juice-vat", structureKey: "post-l-to-ml-thousandths",
    prompt: "A juice vat contains 2.375 L. Enter this capacity in millilitres.", correctAnswer: "2375", domain: "metric",
  },
  {
    descriptor: "AC9M6M02", week: 2, lesson: 1, skillId: "missing_dimension", skillLabel: "Find a Rectangle Dimension",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["rectangle-area-factor-pairs"], contextKey: "post-community-garden", structureKey: "post-area-to-length-integer",
    prompt: "A rectangular community garden has area 180 square metres and width 12 m. Enter its length in metres.", correctAnswer: "15", domain: "area",
  },
  {
    descriptor: "AC9M6M03", week: 5, lesson: 2, skillId: "elapsed_time", skillLabel: "Solve Elapsed-Time Problems",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["elapsed-time-base-ten"], contextKey: "post-harbour-cruise", structureKey: "post-duration-hour-boundary",
    prompt: "A harbour cruise starts at 09:48 and ends at 11:03. Enter its duration in minutes.", correctAnswer: "75", domain: "timetable",
  },
  {
    descriptor: "AC9M6M04", week: 6, lesson: 2, skillId: "angles_around_point", skillLabel: "Angles Around a Point",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["angle-point-vs-line-total"], contextKey: "post-cycle-hub", structureKey: "post-point-three-angles",
    prompt: "Three angles around a point are 128 degrees, 96 degrees and x. Enter x in degrees.", correctAnswer: "136", domain: "angle",
    visual: { kind: "angle", known: 224, unknown: 136, total: 360 },
  },
  {
    descriptor: "AC9M6M01", week: 4, lesson: 3, skillId: "mixed_metric", skillLabel: "Solve a Mixed-Unit Mass Problem",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["mixed-unit-comparison"], contextKey: "post-catering-container", structureKey: "post-mass-subtract-mixed",
    prompt: "A catering container holds 4.2 kg of rice. After 650 g is used, enter the remaining mass in grams.", correctAnswer: "3550", domain: "metric",
  },
  {
    descriptor: "AC9M6M02", week: 3, lesson: 2, skillId: "area_design", skillLabel: "Design a Rectangle with Fixed Area",
    difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "explanation",
    misconceptionTags: ["rectangle-area-factor-pairs"], contextKey: "post-exhibition-floor", structureKey: "post-factor-pair-structured-entry",
    prompt: "An exhibition floor must have area 180 square metres. Its whole-number length must be greater than 14 m but no more than 15 m. Enter length,width using a comma.", correctAnswer: "15,12", domain: "area", inputMode: "text",
  },
  {
    descriptor: "AC9M6M03", week: 5, lesson: 1, skillId: "timetable_deadline", skillLabel: "Check a Timetable Deadline",
    difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionDiagnosis: true,
    misconceptionTags: ["timetable-deadline-inclusive"], contextKey: "post-theatre-arrival", structureKey: "post-deadline-equality-diagnosis",
    prompt: "A show requires arrival by 18:30. A train arrives at exactly 18:30. A student says it is late. Enter the number of minutes late.", correctAnswer: "0", domain: "timetable",
  },
  {
    descriptor: "AC9M6M04", week: 6, lesson: 1, skillId: "straight_line_angles", skillLabel: "Diagnose a Straight-Line Error",
    difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionDiagnosis: true,
    misconceptionTags: ["angle-point-vs-line-total"], contextKey: "post-opening-gate", structureKey: "post-line-vs-right-angle-diagnosis",
    prompt: "A student subtracts 38 degrees from 90 to find the adjacent angle on a straight line. Enter the correct adjacent angle.", correctAnswer: "142", domain: "angle",
    visual: { kind: "angle", known: 38, unknown: 142, total: 180 },
  },
  {
    descriptor: "AC9M6M01", week: 4, lesson: 3, skillId: "conversion_diagnosis", skillLabel: "Diagnose a Metric Conversion",
    difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionDiagnosis: true,
    misconceptionTags: ["metric-decimal-place-value"], contextKey: "post-fabric-cut", structureKey: "post-m-to-mm-diagnosis",
    prompt: "A student writes that 0.84 m equals 84 mm. Enter the correct length in millimetres.", correctAnswer: "840", domain: "metric",
  },
  {
    descriptor: "AC9M6M02", week: 2, lesson: 2, skillId: "area_misconception", skillLabel: "Diagnose an Area Error",
    difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionDiagnosis: true,
    misconceptionTags: ["perimeter-vs-area"], contextKey: "post-banner-print", structureKey: "post-area-vs-side-sum-diagnosis",
    prompt: "A student says a 16 m by 5 m rectangular banner has area 42 square metres because they added all four sides. Enter the correct area.", correctAnswer: "80", domain: "area",
    visual: { kind: "rectangle", w: 16, h: 5, mode: "area", unit: "m" },
  },
  {
    descriptor: "AC9M6M03", week: 5, lesson: 3, skillId: "timetable_choice", skillLabel: "Compare Timetable Services",
    difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionDiagnosis: true,
    misconceptionTags: ["timetable-earliest-departure"], contextKey: "post-airport-services", structureKey: "post-earliest-arrival-comparison",
    prompt: "Service A leaves at 08:10 and arrives at 09:25. Service B leaves at 08:30 and arrives at 09:10. Enter how many minutes earlier B arrives than A.", correctAnswer: "15", domain: "timetable",
  },
  {
    descriptor: "AC9M6M04", week: 6, lesson: 2, skillId: "angles_around_point", skillLabel: "Diagnose an Angle-Total Error",
    difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionDiagnosis: true,
    misconceptionTags: ["angle-point-vs-line-total"], contextKey: "post-roundabout-sectors", structureKey: "post-point-total-diagnosis",
    prompt: "Angles around a point are 110 degrees, 95 degrees, 70 degrees and x. A student uses a total of 180 degrees. Enter the correct value of x.", correctAnswer: "85", domain: "angle",
    visual: { kind: "angle", known: 275, unknown: 85, total: 360 },
  },
  {
    descriptor: "AC9M6M01", week: 4, lesson: 3, skillId: "conversion_transfer", skillLabel: "Choose a Reasonable Metric Representation",
    difficulty: "very_challenging", cognitiveCategory: "transfer", responseMode: "justification",
    misconceptionTags: ["conversion-direction"], contextKey: "post-water-tank-order", structureKey: "post-multistep-conversion-explanation",
    prompt: "A tank needs 3.25 L more water. Which statement gives an equivalent amount and a valid reason?",
    correctAnswer: "3250 mL, because multiplying litres by 1000 preserves the amount.", domain: "metric",
    options: ["325 mL, because litres are divided by 10.", "3250 mL, because multiplying litres by 1000 preserves the amount.", "32 500 mL, because a smaller unit always adds four zeros."],
  },
  {
    descriptor: "AC9M6M02", week: 3, lesson: 3, skillId: "area_constraint", skillLabel: "Compare Practical Rectangle Designs",
    difficulty: "very_challenging", cognitiveCategory: "transfer", responseMode: "constructed_response",
    misconceptionTags: ["rectangle-area-factor-pairs"], contextKey: "post-animal-enclosure", structureKey: "post-equal-area-perimeter-difference",
    prompt: "Two rectangular enclosures each have area 96 square metres. Design A is 12 m by 8 m. Design B is 16 m by 6 m. Enter the difference between their perimeters in metres.", correctAnswer: "4", domain: "area",
  },
  {
    descriptor: "AC9M6M03", week: 5, lesson: 3, skillId: "itinerary_plan", skillLabel: "Plan a Multi-Leg Itinerary",
    difficulty: "very_challenging", cognitiveCategory: "transfer", responseMode: "constructed_response",
    misconceptionTags: ["timetable-wait-time"], contextKey: "post-conference-itinerary", structureKey: "post-multileg-door-to-door-duration",
    prompt: "A train leaves at 07:52 and arrives at 08:41. The connecting bus leaves at 09:05 and arrives at 09:38. Enter the total time from the train departure to the bus arrival in minutes.", correctAnswer: "106", domain: "timetable",
  },
  {
    descriptor: "AC9M6M04", week: 6, lesson: 3, skillId: "angle_reasoning_chain", skillLabel: "Communicate an Angle Reasoning Chain",
    difficulty: "very_challenging", cognitiveCategory: "transfer", responseMode: "explanation",
    misconceptionTags: ["vertical-opposite-supplement"], contextKey: "post-scissor-linkage", structureKey: "post-adjacent-and-vertical-pair-entry",
    prompt: "Two straight bars cross. One angle is 42 degrees. Let x be its adjacent angle and y its vertically opposite angle. Enter x,y using a comma.", correctAnswer: "138,42", domain: "angle", inputMode: "text",
  },
];

export const YEAR6_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS = PRETEST_SPECS.map((spec, index) =>
  candidate("pretest", index, spec),
);

export const YEAR6_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS = POSTTEST_SPECS.map((spec, index) =>
  candidate("posttest", index, spec),
);
