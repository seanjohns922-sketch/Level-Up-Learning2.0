import type { Question } from "@/data/assessments/posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentItemDifficulty,
  type AssessmentResponseMode,
  type IndependentAssessmentItem,
} from "@/data/assessments/assessmentItemStandard";

type Descriptor = "AC9M4M01" | "AC9M4M02" | "AC9M4M03" | "AC9M4M04";
type Form = "pretest" | "posttest";
type CandidateQuestion = Question & IndependentAssessmentItem;
type Domain = "instrument" | "perimeter_area" | "duration" | "angle";

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
  domain: Domain;
  options?: readonly string[];
  visual?: Question["visual"];
};

function candidate(form: Form, index: number, spec: ItemSpec): CandidateQuestion {
  const selected = spec.options !== undefined;
  const id = `y4-measurement-${form === "pretest" ? "pre" : "post"}-${String(index + 1).padStart(2, "0")}-v2`;
  const selectedAnswerPosition = spec.options?.indexOf(spec.correctAnswer);
  return {
    schemaVersion: 1,
    id,
    version: "1.0.0",
    realm: "measurement",
    level: 4,
    form,
    origin: "assessment_authored",
    sourcePool: form,
    bankId: `measurelands-level-4-${form}-v1`,
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
    ...(selected ? { selectedAnswerPosition: (selectedAnswerPosition ?? -1) + 1 } : {}),
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
    skillId: spec.skillId,
    skillLabel: spec.skillLabel,
    linkedWeeks: [spec.week],
    linkedLessons: [spec.lesson],
    strand: "Measurement",
    curriculumCodes: [spec.descriptor],
    difficultyBand: spec.difficulty,
    reviewFeedback: "Review the measurement evidence, unit and relationship required by the problem.",
  };
}

const PRETEST_SPECS: readonly ItemSpec[] = [
  { descriptor: "AC9M4M01", week: 1, lesson: 1, skillId: "scale_intervals", skillLabel: "Interpret Scale Intervals", difficulty: "easy", cognitiveCategory: "recall", responseMode: "selected_response", misconceptionTags: ["scale-interval-value"], contextKey: "pre-rain-gauge-scale", structureKey: "pre-labelled-interval-choice", prompt: "A rain gauge labels 0 mL and 100 mL with 5 equal intervals between them. What does each interval represent?", correctAnswer: "20 mL", domain: "instrument", options: ["5 mL", "20 mL", "25 mL"] },
  { descriptor: "AC9M4M01", week: 1, lesson: 1, skillId: "read_partial_length", skillLabel: "Read Between Ruler Marks", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["scale-interval-value"], contextKey: "pre-pencil-ruler", structureKey: "pre-ruler-tenths-reading", prompt: "Read the ruler shown. Enter the pencil's length in centimetres.", correctAnswer: "12.6", domain: "instrument", visual: { kind: "ruler", toCm: 12.6, label: "pencil" } },
  { descriptor: "AC9M4M02", week: 4, lesson: 1, skillId: "rectangle_perimeter", skillLabel: "Measure the Outside", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["perimeter-vs-area"], contextKey: "pre-sandpit-edge", structureKey: "pre-rectangle-perimeter-basic", prompt: "A rectangular sandpit is 6 m long and 3 m wide. Enter its perimeter in metres.", correctAnswer: "18", domain: "perimeter_area", visual: { kind: "rectangle", w: 6, h: 3, mode: "perimeter", unit: "m" } },
  { descriptor: "AC9M4M03", week: 6, lesson: 1, skillId: "convert_time", skillLabel: "Convert Time Units", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["elapsed-time-base-ten"], contextKey: "pre-swimming-session", structureKey: "pre-hours-to-minutes-whole", prompt: "A swimming session lasts 2 hours. Enter the duration in minutes.", correctAnswer: "120", domain: "duration" },
  { descriptor: "AC9M4M04", week: 7, lesson: 1, skillId: "classify_angles", skillLabel: "Recognise Named Angles", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "selected_response", misconceptionTags: ["angle-classification-range"], contextKey: "pre-open-book-angle", structureKey: "pre-angle-name-obtuse", prompt: "An angle is larger than a right angle but smaller than a straight angle. What is its name?", correctAnswer: "Obtuse angle", domain: "angle", options: ["Acute angle", "Obtuse angle", "Reflex angle"] },
  { descriptor: "AC9M4M01", week: 2, lesson: 1, skillId: "read_mass_scale", skillLabel: "Read a Mass Scale", difficulty: "easy", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["scale-interval-value"], contextKey: "pre-fruit-scale", structureKey: "pre-dial-quarter-kilogram", prompt: "Read the fruit scale shown. Enter the mass in grams.", correctAnswer: "750", domain: "instrument", visual: { kind: "scaleDial", value: 0.75, unit: "kg", max: 2 } },
  { descriptor: "AC9M4M02", week: 5, lesson: 1, skillId: "measure_area", skillLabel: "Measure Area in Squares", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["linear-vs-square-units"], contextKey: "pre-tile-panel", structureKey: "pre-area-grid-rectangle", prompt: "A rectangular tile panel is 8 squares across and 4 squares high. Enter its area in square units.", correctAnswer: "32", domain: "perimeter_area", visual: { kind: "rectangle", w: 8, h: 4, mode: "area", unit: "units" } },
  { descriptor: "AC9M4M03", week: 6, lesson: 2, skillId: "elapsed_time", skillLabel: "Find Elapsed Time", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["elapsed-time-base-ten"], contextKey: "pre-art-club", structureKey: "pre-elapsed-cross-hour", prompt: "Art club starts at 3:35 pm and finishes at 4:20 pm. Enter the duration in minutes.", correctAnswer: "45", domain: "duration", visual: { kind: "clock", hour: 3, minute: 35, digital: "3:35 pm" } },
  { descriptor: "AC9M4M04", week: 7, lesson: 1, skillId: "right_angle_benchmark", skillLabel: "Use a Right-Angle Benchmark", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["rotated-right-angle"], contextKey: "pre-square-corners", structureKey: "pre-count-right-angles", prompt: "A square has four corners. Enter how many of its corners are right angles.", correctAnswer: "4", domain: "angle" },
  { descriptor: "AC9M4M01", week: 2, lesson: 2, skillId: "read_measuring_jug", skillLabel: "Read a Measuring Jug", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["scale-interval-value"], contextKey: "pre-soup-jug", structureKey: "pre-jug-quarter-litres", prompt: "Read the measuring jug shown. Enter the amount in millilitres.", correctAnswer: "1250", domain: "instrument", visual: { kind: "jug", value: 1.25, unit: "L", max: 2 } },
  { descriptor: "AC9M4M02", week: 4, lesson: 2, skillId: "irregular_perimeter", skillLabel: "Find an Irregular Perimeter", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["perimeter-vs-area"], contextKey: "pre-garden-path", structureKey: "pre-irregular-side-sum", prompt: "An enclosed garden has boundary lengths 5 m, 4 m, 3 m, 2 m, 2 m and 4 m. Enter its perimeter in metres.", correctAnswer: "20", domain: "perimeter_area" },
  { descriptor: "AC9M4M03", week: 6, lesson: 2, skillId: "finish_time", skillLabel: "Find a Finish Time", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["duration-vs-clock-time"], contextKey: "pre-movie-finish", structureKey: "pre-finish-time-under-hour", prompt: "A movie starts at 6:25 pm and lasts 50 minutes. Enter the finish time as four digits, without punctuation.", correctAnswer: "1915", domain: "duration", visual: { kind: "clock", hour: 6, minute: 25, digital: "6:25 pm" } },
  { descriptor: "AC9M4M04", week: 7, lesson: 2, skillId: "compare_angles", skillLabel: "Compare Named Angles", difficulty: "moderate", cognitiveCategory: "application", responseMode: "selected_response", misconceptionTags: ["angle-arm-length"], contextKey: "pre-short-long-rays", structureKey: "pre-angle-arm-length-choice", prompt: "Two angles both open 60 degrees, but one has longer arms. Which statement is correct?", correctAnswer: "The angles are equal because arm length does not change the opening.", domain: "angle", options: ["The angle with longer arms is larger.", "The angles are equal because arm length does not change the opening.", "The angle with shorter arms is larger."] },
  { descriptor: "AC9M4M01", week: 3, lesson: 1, skillId: "read_temperature", skillLabel: "Read a Thermometer", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["scale-interval-value"], contextKey: "pre-greenhouse-temperature", structureKey: "pre-thermometer-even-interval", prompt: "Read the greenhouse thermometer shown. Enter the temperature in degrees Celsius.", correctAnswer: "18", domain: "instrument", visual: { kind: "thermometer", value: 18, min: 0, max: 40 } },
  { descriptor: "AC9M4M02", week: 5, lesson: 2, skillId: "compare_area", skillLabel: "Compare Areas", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["linear-vs-square-units"], contextKey: "pre-poster-coverage", structureKey: "pre-area-difference-rectangles", prompt: "One poster covers 30 square units and another covers 24 square units. Enter the difference in square units.", correctAnswer: "6", domain: "perimeter_area" },
  { descriptor: "AC9M4M03", week: 6, lesson: 3, skillId: "am_pm_duration", skillLabel: "Solve an am/pm Duration", difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionTags: ["am-pm-boundary"], contextKey: "pre-noon-market", structureKey: "pre-duration-cross-noon", prompt: "A market opens at 11:40 am and closes at 1:10 pm. Enter how long it is open in minutes.", correctAnswer: "90", domain: "duration" },
  { descriptor: "AC9M4M04", week: 7, lesson: 3, skillId: "named_angles", skillLabel: "Recognise a Reflex Angle", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionTags: ["angle-classification-range"], contextKey: "pre-compass-turn", structureKey: "pre-reflex-missing-turn", prompt: "A turn is 250 degrees. Enter how many degrees more than a straight angle this is.", correctAnswer: "70", domain: "angle", visual: { kind: "angle", single: 250 } },
  { descriptor: "AC9M4M01", week: 1, lesson: 3, skillId: "instrument_diagnosis", skillLabel: "Diagnose a Ruler Error", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionDiagnosis: true, misconceptionTags: ["ruler-starting-point"], contextKey: "pre-broken-ruler-pencil", structureKey: "pre-offset-ruler-subtraction", prompt: "A pencil begins at the 3.2 cm mark and ends at the 11.7 cm mark. Enter its actual length in centimetres.", correctAnswer: "8.5", domain: "instrument" },
  { descriptor: "AC9M4M02", week: 5, lesson: 3, skillId: "area_perimeter_diagnosis", skillLabel: "Diagnose Area and Perimeter", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionDiagnosis: true, misconceptionTags: ["perimeter-vs-area"], contextKey: "pre-pool-cover", structureKey: "pre-cover-vs-boundary-diagnosis", prompt: "A rectangular pool cover is 9 m by 4 m. A student calculates 26 to describe the cover's surface. Enter the correct surface area in square metres.", correctAnswer: "36", domain: "perimeter_area", visual: { kind: "rectangle", w: 9, h: 4, mode: "area", unit: "m" } },
  { descriptor: "AC9M4M03", week: 6, lesson: 3, skillId: "time_transfer", skillLabel: "Plan Across am and pm", difficulty: "very_challenging", cognitiveCategory: "transfer", responseMode: "constructed_response", misconceptionTags: ["am-pm-boundary"], contextKey: "pre-excursion-schedule", structureKey: "pre-multistage-noon-duration", prompt: "An excursion begins at 10:35 am. It includes 85 minutes of activities and a 25-minute lunch. Enter the finish time as four digits in 24-hour time, without punctuation.", correctAnswer: "1225", domain: "duration", visual: { kind: "clock", hour: 10, minute: 35, digital: "10:35 am" } },
];

const POSTTEST_SPECS: readonly ItemSpec[] = [
  { descriptor: "AC9M4M01", week: 1, lesson: 1, skillId: "scale_intervals", skillLabel: "Interpret an Unmarked Scale", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "selected_response", misconceptionTags: ["scale-interval-value"], contextKey: "post-water-tank-scale", structureKey: "post-interval-between-labels-choice", prompt: "A tank scale labels 2 L and 3 L with 4 equal intervals between them. What does each interval represent?", correctAnswer: "0.25 L", domain: "instrument", options: ["0.2 L", "0.25 L", "0.5 L"] },
  { descriptor: "AC9M4M01", week: 2, lesson: 1, skillId: "read_mass_scale", skillLabel: "Read a Partial Mass Unit", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["scale-interval-value"], contextKey: "post-cheese-scale", structureKey: "post-dial-eighth-kilogram", prompt: "Read the cheese scale shown. Enter the mass in grams.", correctAnswer: "1125", domain: "instrument", visual: { kind: "scaleDial", value: 1.125, unit: "kg", max: 2 } },
  { descriptor: "AC9M4M02", week: 5, lesson: 1, skillId: "measure_area", skillLabel: "Measure an Enclosed Area", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["linear-vs-square-units"], contextKey: "post-mosaic-panel", structureKey: "post-area-grid-basic", prompt: "A mosaic is 7 squares across and 5 squares high. Enter its area in square units.", correctAnswer: "35", domain: "perimeter_area", visual: { kind: "rectangle", w: 7, h: 5, mode: "area", unit: "units" } },
  { descriptor: "AC9M4M03", week: 6, lesson: 1, skillId: "convert_time", skillLabel: "Convert a Mixed Duration", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["elapsed-time-base-ten"], contextKey: "post-sports-carnival", structureKey: "post-hours-minutes-to-minutes", prompt: "A sports carnival lasts 2 hours 35 minutes. Enter the total duration in minutes.", correctAnswer: "155", domain: "duration" },
  { descriptor: "AC9M4M04", week: 7, lesson: 1, skillId: "classify_angles", skillLabel: "Classify a Reflex Angle", difficulty: "moderate", cognitiveCategory: "application", responseMode: "selected_response", misconceptionTags: ["angle-classification-range"], contextKey: "post-carousel-turn", structureKey: "post-angle-name-reflex", prompt: "A carousel turns through 280 degrees. What type of angle describes the turn?", correctAnswer: "Reflex angle", domain: "angle", options: ["Obtuse angle", "Straight angle", "Reflex angle"] },
  { descriptor: "AC9M4M01", week: 3, lesson: 1, skillId: "read_temperature", skillLabel: "Read Between Thermometer Marks", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["scale-interval-value"], contextKey: "post-cold-room", structureKey: "post-thermometer-negative-reading", prompt: "Read the cold-room thermometer shown. Enter the temperature in degrees Celsius.", correctAnswer: "-6", domain: "instrument", visual: { kind: "thermometer", value: -6, min: -20, max: 20 } },
  { descriptor: "AC9M4M02", week: 4, lesson: 2, skillId: "irregular_perimeter", skillLabel: "Calculate an Irregular Perimeter", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["perimeter-vs-area"], contextKey: "post-playground-fence", structureKey: "post-irregular-seven-side-sum", prompt: "A playground boundary has side lengths 8 m, 5 m, 3 m, 2 m, 4 m, 3 m and 5 m. Enter the perimeter in metres.", correctAnswer: "30", domain: "perimeter_area" },
  { descriptor: "AC9M4M03", week: 6, lesson: 2, skillId: "elapsed_time", skillLabel: "Calculate Elapsed Time", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["elapsed-time-base-ten"], contextKey: "post-library-workshop", structureKey: "post-elapsed-two-hours", prompt: "A library workshop starts at 9:45 am and finishes at 12:10 pm. Enter its duration in minutes.", correctAnswer: "145", domain: "duration", visual: { kind: "clock", hour: 9, minute: 45, digital: "9:45 am" } },
  { descriptor: "AC9M4M04", week: 7, lesson: 1, skillId: "right_angle_benchmark", skillLabel: "Compare with a Right Angle", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["rotated-right-angle"], contextKey: "post-floor-tile-corners", structureKey: "post-multiple-right-angle-count", prompt: "Three separate square floor tiles are shown at different rotations. Enter the total number of right-angle corners.", correctAnswer: "12", domain: "angle" },
  { descriptor: "AC9M4M01", week: 2, lesson: 2, skillId: "read_measuring_jug", skillLabel: "Read a Partial Capacity Unit", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["scale-interval-value"], contextKey: "post-paint-jug", structureKey: "post-jug-decimal-litres", prompt: "Read the jug shown. Enter the amount in millilitres.", correctAnswer: "1350", domain: "instrument", visual: { kind: "jug", value: 1.35, unit: "L", max: 2 } },
  { descriptor: "AC9M4M02", week: 4, lesson: 1, skillId: "perimeter_unit", skillLabel: "Use an Appropriate Perimeter Unit", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["linear-vs-square-units"], contextKey: "post-whiteboard-frame", structureKey: "post-perimeter-decimal-rectangle", prompt: "A whiteboard is 2.4 m long and 1.1 m wide. Enter the length of frame needed around it in metres.", correctAnswer: "7", domain: "perimeter_area", visual: { kind: "rectangle", w: 2.4, h: 1.1, mode: "perimeter", unit: "m" } },
  { descriptor: "AC9M4M03", week: 6, lesson: 2, skillId: "start_time", skillLabel: "Find a Start Time", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["duration-vs-clock-time"], contextKey: "post-concert-start", structureKey: "post-missing-start-time", prompt: "A concert finishes at 9:05 pm after lasting 95 minutes. Enter the start time as four digits in 24-hour time, without punctuation.", correctAnswer: "1930", domain: "duration", visual: { kind: "clock", hour: 9, minute: 5, digital: "9:05 pm" } },
  { descriptor: "AC9M4M04", week: 7, lesson: 3, skillId: "angle_diagnosis", skillLabel: "Diagnose a Named-Angle Error", difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionDiagnosis: true, misconceptionTags: ["angle-classification-range"], contextKey: "post-robot-turn", structureKey: "post-reflex-vs-revolution-choice", prompt: "A robot turns 220 degrees. A student calls it a revolution. Which correction is best?", correctAnswer: "It is a reflex angle because it is more than 180 degrees but less than 360 degrees.", domain: "angle", options: ["It is a straight angle because it is more than 180 degrees.", "It is a reflex angle because it is more than 180 degrees but less than 360 degrees.", "It is a revolution because every angle above 180 degrees is a full turn."] },
  { descriptor: "AC9M4M01", week: 1, lesson: 3, skillId: "instrument_diagnosis", skillLabel: "Diagnose an Instrument Reading", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionDiagnosis: true, misconceptionTags: ["ruler-starting-point"], contextKey: "post-offset-ruler-wire", structureKey: "post-offset-ruler-decimal-subtraction", prompt: "A wire begins at 4.7 cm and ends at 16.3 cm on a ruler. A student reports 16.3 cm. Enter the wire's actual length in centimetres.", correctAnswer: "11.6", domain: "instrument" },
  { descriptor: "AC9M4M02", week: 5, lesson: 3, skillId: "area_approximation", skillLabel: "Approximate an Enclosed Area", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionTags: ["perimeter-vs-area"], contextKey: "post-leaf-grid", structureKey: "post-full-half-square-estimate", prompt: "A leaf outline covers 18 full grid squares and about 8 half-squares. Enter the best estimate of its area in square units.", correctAnswer: "22", domain: "perimeter_area" },
  { descriptor: "AC9M4M03", week: 6, lesson: 3, skillId: "am_pm_duration", skillLabel: "Reason Across Midday", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionDiagnosis: true, misconceptionTags: ["am-pm-boundary"], contextKey: "post-farmers-market", structureKey: "post-noon-boundary-diagnosis", prompt: "A stall operates from 11:25 am until 2:05 pm. A student says this is 80 minutes. Enter the correct duration in minutes.", correctAnswer: "160", domain: "duration" },
  { descriptor: "AC9M4M04", week: 7, lesson: 2, skillId: "compare_angles", skillLabel: "Compare Angles by Turn Size", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionTags: ["angle-arm-length"], contextKey: "post-windmill-blades", structureKey: "post-angle-difference-named", prompt: "One windmill blade turns through a right angle and another through a straight angle. Enter the difference in degrees.", correctAnswer: "90", domain: "angle" },
  { descriptor: "AC9M4M01", week: 2, lesson: 3, skillId: "compare_instruments", skillLabel: "Compare Compatible Readings", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "constructed_response", misconceptionTags: ["mixed-unit-comparison"], contextKey: "post-drink-containers", structureKey: "post-capacity-difference-mixed", prompt: "One container holds 1.2 L and another holds 875 mL. Enter the difference in millilitres.", correctAnswer: "325", domain: "instrument" },
  { descriptor: "AC9M4M02", week: 4, lesson: 3, skillId: "perimeter_area_transfer", skillLabel: "Apply Perimeter and Area", difficulty: "very_challenging", cognitiveCategory: "transfer", responseMode: "constructed_response", misconceptionTags: ["perimeter-vs-area"], contextKey: "post-school-courtyard", structureKey: "post-area-and-boundary-cost", prompt: "A 10 m by 6 m courtyard needs a 1 m opening left unfenced. Enter the metres of fencing required around the remaining boundary.", correctAnswer: "31", domain: "perimeter_area", visual: { kind: "rectangle", w: 10, h: 6, mode: "perimeter", unit: "m" } },
  { descriptor: "AC9M4M03", week: 6, lesson: 3, skillId: "schedule_transfer", skillLabel: "Solve a Multi-Stage Schedule", difficulty: "very_challenging", cognitiveCategory: "transfer", responseMode: "constructed_response", misconceptionTags: ["am-pm-boundary"], contextKey: "post-community-festival", structureKey: "post-multistage-am-pm-finish", prompt: "A festival program starts at 11:35 am. It has a 70-minute performance, a 25-minute break and a 55-minute workshop. Enter the finish time as four digits in 24-hour time, without punctuation.", correctAnswer: "1405", domain: "duration", visual: { kind: "clock", hour: 11, minute: 35, digital: "11:35 am" } },
];

export const YEAR4_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS = PRETEST_SPECS.map((spec, index) => candidate("pretest", index, spec));
export const YEAR4_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS = POSTTEST_SPECS.map((spec, index) => candidate("posttest", index, spec));
