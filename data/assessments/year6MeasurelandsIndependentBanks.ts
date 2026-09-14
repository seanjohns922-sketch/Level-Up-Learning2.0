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
  const id = `y6-measurement-${form === "pretest" ? "pre" : "post"}-${number}-v3`;

  return {
    schemaVersion: 1,
    id,
    version: "3.0.0",
    realm: "measurement",
    level: 6,
    form,
    origin: "assessment_authored",
    sourcePool: form,
    bankId: `measurelands-level-6-${form}-v3`,
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

const PARALLEL_PRE_VARIANTS: Array<Pick<ItemSpec,"prompt"|"correctAnswer"> & Partial<Pick<ItemSpec,"options"|"visual"|"inputMode">>> = [
 {prompt:"A path section is 0.008 km long. Enter its length in metres.",correctAnswer:"8"},
 {prompt:"A rectangular display is 12.5 m long and 6 m wide. Enter its area in square metres.",correctAnswer:"75"},
 {prompt:"A coach departs at 13:35 and arrives at 15:20. Enter its journey duration in minutes.",correctAnswer:"105"},
 {prompt:"Two adjacent angles lie on a straight line. One is 126 degrees. Enter the other angle in degrees.",correctAnswer:"54"},
 {prompt:"A water vat contains 3.425 L. Enter this capacity in millilitres.",correctAnswer:"3425"},
 {prompt:"A rectangular garden has area 154 square metres and width 11 m. Enter its length in metres.",correctAnswer:"14"},
 {prompt:"A cruise starts at 10:38 and ends at 11:53. Enter its duration in minutes.",correctAnswer:"75"},
 {prompt:"Three angles around a point are 116 degrees, 94 degrees and x. Enter x in degrees.",correctAnswer:"150"},
 {prompt:"A container holds 3.8 kg of flour. After 750 g is used, enter the remaining mass in grams.",correctAnswer:"3050"},
 {prompt:"A rectangular floor has area 154 square metres. Its whole-number length is greater than 13 m but no more than 14 m. Enter the length and width in metres, separated by a comma.",correctAnswer:"14,11",inputMode:"text"},
 {prompt:"A performance requires arrival by 17:15. A bus arrives at exactly 17:15. A student says it is late. Enter how many minutes late it is.",correctAnswer:"0"},
 {prompt:"A student subtracts 46 degrees from 90 to find the adjacent angle on a straight line. Enter the correct adjacent angle in degrees.",correctAnswer:"134"},
 {prompt:"A student writes that 0.76 m equals 76 mm. Enter the correct length in millimetres.",correctAnswer:"760"},
 {prompt:"A student says a 14 m by 6 m banner has area 40 square metres because they added all four sides. Enter the correct area in square metres.",correctAnswer:"84"},
 {prompt:"Service A leaves at 09:10 and arrives at 10:35. Service B leaves at 09:30 and arrives at 10:15. Enter how many minutes earlier B arrives than A.",correctAnswer:"20"},
 {prompt:"Angles around a point are 105 degrees, 85 degrees, 75 degrees and x. A student uses a total of 180 degrees. Enter the correct value of x in degrees.",correctAnswer:"95"},
 {prompt:"A tank needs 4.15 L more water. Which statement gives an equivalent amount and a valid reason?",correctAnswer:"4150 mL, because multiplying litres by 1000 preserves the amount.",options:["415 mL, because litres are ten times millilitres.","4150 mL, because multiplying litres by 1000 preserves the amount.","41.5 mL, because decimal digits stay in the same places."]},
 {prompt:"Two rectangular enclosures each have area 72 square metres. Design A is 9 m by 8 m. Design B is 12 m by 6 m. Enter the difference between their perimeters in metres.",correctAnswer:"2"},
 {prompt:"A train leaves at 08:42 and arrives at 09:31. A connecting bus leaves at 09:55 and arrives at 10:28. Enter the total time from the train departure to the bus arrival in minutes.",correctAnswer:"106"},
 {prompt:"Two straight bars cross. One angle is 56 degrees. Let x be its adjacent angle and y its vertically opposite angle. Enter x,y using a comma.",correctAnswer:"124,56",inputMode:"text"}
];
const PRE_VISUALS: Record<number, Question["visual"]> = {
  0:{kind:"convert",fromValue:0.008,fromUnit:"km",toValue:0,toUnit:"m"},
  1:{kind:"rectangle",w:12.5,h:6,mode:"area",unit:"m"},
  3:{kind:"angle",known:126,unknown:54,total:180},
  7:{kind:"angle",known:210,unknown:150,total:360},
  11:{kind:"angle",known:46,unknown:134,total:180},
  13:{kind:"rectangle",w:14,h:6,mode:"area",unit:"m"},
  15:{kind:"angle",known:265,unknown:95,total:360},
};
const PRETEST_SPECS: readonly ItemSpec[] = POSTTEST_SPECS.map((spec,index)=>({...spec,...PARALLEL_PRE_VARIANTS[index]!,visual:PRE_VISUALS[index],contextKey:spec.contextKey.replace("post-","pre-"),structureKey:spec.structureKey.replace("post-","pre-")}));

export const YEAR6_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS = PRETEST_SPECS.map((spec, index) =>
  candidate("pretest", index, spec),
);

export const YEAR6_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS = POSTTEST_SPECS.map((spec, index) =>
  candidate("posttest", index, spec),
);
