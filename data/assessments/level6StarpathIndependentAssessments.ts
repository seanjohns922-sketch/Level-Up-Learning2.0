import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { Question } from "@/data/assessments/posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentItemDifficulty,
  type IndependentAssessmentItem,
} from "@/data/assessments/assessmentItemStandard";

type Descriptor = "AC9M6SP01" | "AC9M6SP02" | "AC9M6SP03";
type Form = "pretest" | "posttest";
type CandidateQuestion = Question & IndependentAssessmentItem;
type AssessmentTask = Extract<PracticeTask, { kind: "starpathLevel6Assessment" }>;
type Misconception =
  | "cross-section-face"
  | "parallel-sections-congruent"
  | "coordinate-order-scale"
  | "coordinate-movement-change"
  | "quadrant-sign"
  | "transformation-invariants"
  | "transformation-reference"
  | "transformation-order"
  | "tessellation-gap-overlap";

type ItemSpec = {
  descriptor: Descriptor;
  week: number;
  lesson: number;
  difficulty: AssessmentItemDifficulty;
  cognitiveCategory: AssessmentCognitiveCategory;
  responseMode: "selected_response" | "manipulated_response";
  misconceptionTags: readonly Misconception[];
  misconceptionDiagnosis?: boolean;
  contextKey: string;
  structureKey: string;
  task: AssessmentTask;
};

const CORRECT_TOKEN = "__starpath_task_correct__";
const FEEDBACK = { correct: "Answer recorded.", wrong: "Answer recorded." } as const;

const PRE_DIFFICULTY: AssessmentItemDifficulty[] = [
  "easy", "moderate", "moderate", "challenging", "moderate", "challenging",
  "easy", "moderate", "moderate", "challenging", "moderate", "challenging",
  "easy", "moderate", "challenging", "moderate", "challenging", "moderate", "moderate", "easy",
];
const PRE_COGNITIVE: AssessmentCognitiveCategory[] = [
  "recall", "understanding", "understanding", "application", "reasoning", "reasoning",
  "understanding", "application", "application", "reasoning", "reasoning", "transfer",
  "understanding", "application", "reasoning", "application", "reasoning", "transfer", "transfer", "application",
];
const POST_DIFFICULTY: AssessmentItemDifficulty[] = [
  "moderate", "challenging", "moderate", "challenging", "challenging", "moderate",
  "easy", "moderate", "challenging", "moderate", "challenging", "challenging",
  "easy", "moderate", "challenging", "moderate", "challenging", "challenging", "moderate", "challenging",
];
const POST_COGNITIVE: AssessmentCognitiveCategory[] = [
  "understanding", "application", "reasoning", "reasoning", "transfer", "application",
  "understanding", "application", "reasoning", "application", "reasoning", "transfer",
  "understanding", "application", "reasoning", "application", "reasoning", "transfer", "transfer", "reasoning",
];

function task(target: number, payload: Omit<AssessmentTask, "kind" | "target" | "feedback">): AssessmentTask {
  return { kind: "starpathLevel6Assessment", target, feedback: FEEDBACK, ...payload };
}

const PRE_TASKS: readonly AssessmentTask[] = [
  task(1, {
    mode: "diagnose",
    prompt: "Which evidence proves that a solid is a right prism?",
    speakText: "Which evidence proves that a solid is a right prism?",
    contextLabel: "Choose the strongest cross-section evidence.",
    options: [
      { id: "same", label: "Parallel cuts give congruent sections from base to top." },
      { id: "shrink", label: "Parallel cuts become smaller near the top." },
      { id: "face", label: "One outside face is a rectangle." },
      { id: "height", label: "The solid is taller than it is wide." },
    ],
    correctOptionId: "same",
  }),
  task(2, { mode: "crossSectionProfile", prompt: "Construct the section-width profile for this right prism.", speakText: "Construct the section width profile for this right prism.", contextLabel: "The lower parallel cut is 4 units wide. A right prism keeps congruent parallel sections.", profileAnswer: [4, 4, 4] }),
  task(3, { mode: "crossSectionProfile", prompt: "Build the profile for a tapered solid whose sections shrink evenly.", speakText: "Build the profile for a tapered solid whose sections shrink evenly.", contextLabel: "The lower cut is 6 units wide. Each higher cut is 2 units narrower.", profileAnswer: [6, 4, 2] }),
  task(4, { mode: "crossSectionProfile", prompt: "Record the three parallel sections through the storage block.", speakText: "Record the three parallel sections through the storage block.", contextLabel: "The middle cut is 5 units wide. The block has identical ends and no taper.", profileAnswer: [5, 5, 5] }),
  task(5, { mode: "crossSectionProfile", prompt: "Construct the profile of the expanding display solid.", speakText: "Construct the profile of the expanding display solid.", contextLabel: "The middle cut is 3 units wide. The cuts increase by 1 unit from lower to upper.", profileAnswer: [2, 3, 4] }),
  task(6, { mode: "crossSectionProfile", prompt: "Use the clues to complete the unknown section profile.", speakText: "Use the clues to complete the unknown section profile.", contextLabel: "The upper cut is half the lower cut. The middle cut is 1 unit wider than the upper cut. Lower width: 6.", profileAnswer: [6, 4, 3] }),
  task(7, { mode: "coordinatePlot", prompt: "Plot the image of point A after the stated movement.", speakText: "Plot the image of point A after the stated movement.", contextLabel: "A starts at (-3, 2). Move 5 right and 1 down.", range: 5, targetPoints: [{ x: 2, y: 1 }] }),
  task(8, { mode: "coordinatePlot", prompt: "Plot both endpoints after reflection in the y-axis.", speakText: "Plot both endpoints after reflection in the y axis.", contextLabel: "Endpoints are (-4, -1) and (-2, 3). Reflect both across the y-axis.", range: 5, targetPoints: [{ x: 4, y: -1 }, { x: 2, y: 3 }] }),
  task(9, { mode: "coordinatePlot", prompt: "Plot the two stops reached by the rover in order.", speakText: "Plot the two stops reached by the rover in order.", contextLabel: "Start (1, -3). First move 4 left. From there move 5 up.", range: 5, targetPoints: [{ x: -3, y: -3 }, { x: -3, y: 2 }] }),
  task(10, { mode: "coordinatePlot", prompt: "Plot the image points after the translation.", speakText: "Plot the image points after the translation.", contextLabel: "Translate P(-4, 2), Q(-1, 2) and R(-1, 4) by 3 right and 5 down.", range: 5, targetPoints: [{ x: -1, y: -3 }, { x: 2, y: -3 }, { x: 2, y: -1 }] }),
  task(11, { mode: "coordinatePlot", prompt: "Plot the point after it crosses both axes.", speakText: "Plot the point after it crosses both axes.", contextLabel: "Start (-2, 4). Change x by +5 and y by -7.", range: 5, targetPoints: [{ x: 3, y: -3 }] }),
  task(12, { mode: "coordinatePlot", prompt: "Reverse the movement and plot the starting point.", speakText: "Reverse the movement and plot the starting point.", contextLabel: "The image is (4, -2) after moving 6 right and 3 down. Plot the original point.", range: 5, targetPoints: [{ x: -2, y: 1 }] }),
  task(13, { mode: "transformChain", prompt: "Apply the transformations in order and construct the final coordinate.", speakText: "Apply the transformations in order and construct the final coordinate.", contextLabel: "Order matters. Work from the listed starting point.", start: { x: 2, y: 1 }, operations: [{ kind: "translate", label: "Translate 3 left and 2 up", dx: -3, dy: 2 }, { kind: "reflectY", label: "Reflect in the y-axis" }] }),
  task(14, { mode: "transformChain", prompt: "Find the final position after a quarter-turn and translation.", speakText: "Find the final position after a quarter turn and translation.", contextLabel: "A quarter-turn is anticlockwise about the origin.", start: { x: 3, y: -1 }, operations: [{ kind: "rotate90", label: "Rotate 90 degrees anticlockwise" }, { kind: "translate", label: "Translate 2 right and 1 down", dx: 2, dy: -1 }] }),
  task(15, { mode: "transformChain", prompt: "Construct the endpoint of this three-step transformation chain.", speakText: "Construct the endpoint of this three step transformation chain.", contextLabel: "Complete every operation before recording the endpoint.", start: { x: -2, y: 3 }, operations: [{ kind: "reflectX", label: "Reflect in the x-axis" }, { kind: "translate", label: "Translate 4 right", dx: 4, dy: 0 }, { kind: "rotate90", label: "Rotate 90 degrees anticlockwise" }] }),
  task(16, { mode: "transformChain", prompt: "Use the ordered rules to determine the image coordinate.", speakText: "Use the ordered rules to determine the image coordinate.", contextLabel: "Do not reverse the two transformations.", start: { x: 1, y: 4 }, operations: [{ kind: "reflectY", label: "Reflect in the y-axis" }, { kind: "translate", label: "Translate 3 down", dx: 0, dy: -3 }] }),
  task(17, { mode: "tessellationRule", prompt: "Construct the repeat rule that moves tile A to tile B.", speakText: "Construct the repeat rule that moves tile A to tile B.", contextLabel: "Anchor A is (1, 4). Anchor B is (4, 2). B is also turned 90 degrees clockwise.", ruleAnswer: { across: 3, down: 2, quarterTurns: 1 } }),
  task(18, { mode: "tessellationRule", prompt: "Record the transformation used by every second tile.", speakText: "Record the transformation used by every second tile.", contextLabel: "The next anchor is 2 columns left and 3 rows down. Its orientation is unchanged.", ruleAnswer: { across: -2, down: 3, quarterTurns: 0 } }),
  task(19, { mode: "tessellationRule", prompt: "Infer the repeating rule from the two anchor positions.", speakText: "Infer the repeating rule from the two anchor positions.", contextLabel: "A(-3, 2) maps to B(1, -1). B is turned through 180 degrees.", ruleAnswer: { across: 4, down: 3, quarterTurns: 2 } }),
  task(20, { mode: "tessellationRule", prompt: "Construct the rule that continues the gap-free border pattern.", speakText: "Construct the rule that continues the gap free border pattern.", contextLabel: "Each copy moves 5 columns right, stays on the same row and turns 270 degrees clockwise.", ruleAnswer: { across: 5, down: 0, quarterTurns: 3 } }),
];

const POST_TASKS: readonly AssessmentTask[] = [
  task(1, {
    mode: "diagnose",
    prompt: "Which section sequence rules out a right prism?",
    speakText: "Which section sequence rules out a right prism?",
    contextLabel: "The cuts are parallel and equally spaced.",
    options: [
      { id: "constant", label: "5 units, 5 units, 5 units" },
      { id: "taper", label: "6 units, 4 units, 2 units" },
      { id: "equal", label: "3 units, 3 units, 3 units" },
      { id: "same", label: "4 units, 4 units, 4 units" },
    ],
    correctOptionId: "taper",
  }),
  task(2, { mode: "crossSectionProfile", prompt: "Construct the profile that supports a right-prism classification.", speakText: "Construct the profile that supports a right prism classification.", contextLabel: "The base section is 3 units wide. All parallel sections are congruent.", profileAnswer: [3, 3, 3] }),
  task(3, { mode: "crossSectionProfile", prompt: "Complete the section profile for the narrowing sculpture.", speakText: "Complete the section profile for the narrowing sculpture.", contextLabel: "Lower width: 5. The width decreases by 2, then by 1.", profileAnswer: [5, 3, 2] }),
  task(4, { mode: "crossSectionProfile", prompt: "Model the parallel cuts through the uniform beam.", speakText: "Model the parallel cuts through the uniform beam.", contextLabel: "The upper cut is 6 units wide. The beam does not taper.", profileAnswer: [6, 6, 6] }),
  task(5, { mode: "crossSectionProfile", prompt: "Construct the profile using both comparison clues.", speakText: "Construct the profile using both comparison clues.", contextLabel: "Middle is 1 wider than lower. Upper is twice lower. Middle width: 3.", profileAnswer: [2, 3, 4] }),
  task(6, { mode: "crossSectionProfile", prompt: "Record the section changes through the tapered roof.", speakText: "Record the section changes through the tapered roof.", contextLabel: "Lower width: 6. Middle is two-thirds of lower. Upper is half of middle.", profileAnswer: [6, 4, 2] }),
  task(7, { mode: "coordinatePlot", prompt: "Plot the final point after the signed coordinate change.", speakText: "Plot the final point after the signed coordinate change.", contextLabel: "Start (3, -4). Change x by -6 and y by +5.", range: 5, targetPoints: [{ x: -3, y: 1 }] }),
  task(8, { mode: "coordinatePlot", prompt: "Plot both vertices after reflection in the x-axis.", speakText: "Plot both vertices after reflection in the x axis.", contextLabel: "Vertices are (-2, 4) and (3, 1). Reflect both across the x-axis.", range: 5, targetPoints: [{ x: -2, y: -4 }, { x: 3, y: -1 }] }),
  task(9, { mode: "coordinatePlot", prompt: "Plot every checkpoint on this two-stage route.", speakText: "Plot every checkpoint on this two stage route.", contextLabel: "Start (-4, 1). Move 6 right, then from there move 4 down.", range: 5, targetPoints: [{ x: 2, y: 1 }, { x: 2, y: -3 }] }),
  task(10, { mode: "coordinatePlot", prompt: "Translate the triangle and plot its three image vertices.", speakText: "Translate the triangle and plot its three image vertices.", contextLabel: "Move A(-1, -4), B(2, -4), C(2, -2) by 2 left and 5 up.", range: 5, targetPoints: [{ x: -3, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 3 }] }),
  task(11, { mode: "coordinatePlot", prompt: "Plot the point after two axis crossings.", speakText: "Plot the point after two axis crossings.", contextLabel: "Start (4, 3). Move 7 left and 5 down.", range: 5, targetPoints: [{ x: -3, y: -2 }] }),
  task(12, { mode: "coordinatePlot", prompt: "Work backwards to plot the original coordinate.", speakText: "Work backwards to plot the original coordinate.", contextLabel: "The image is (-1, 5) after moving 4 left and 3 up. Plot the start.", range: 5, targetPoints: [{ x: 3, y: 2 }] }),
  task(13, { mode: "transformChain", prompt: "Construct the endpoint after reflection and translation.", speakText: "Construct the endpoint after reflection and translation.", contextLabel: "Apply the rules in the displayed order.", start: { x: -3, y: 2 }, operations: [{ kind: "reflectY", label: "Reflect in the y-axis" }, { kind: "translate", label: "Translate 1 left and 4 down", dx: -1, dy: -4 }] }),
  task(14, { mode: "transformChain", prompt: "Find the image after translation then a quarter-turn.", speakText: "Find the image after translation then a quarter turn.", contextLabel: "The rotation is anticlockwise about the origin.", start: { x: 1, y: -3 }, operations: [{ kind: "translate", label: "Translate 2 right and 5 up", dx: 2, dy: 5 }, { kind: "rotate90", label: "Rotate 90 degrees anticlockwise" }] }),
  task(15, { mode: "transformChain", prompt: "Complete this three-operation mapping.", speakText: "Complete this three operation mapping.", contextLabel: "Keep the intermediate coordinates until the final step.", start: { x: 4, y: 1 }, operations: [{ kind: "reflectX", label: "Reflect in the x-axis" }, { kind: "rotate90", label: "Rotate 90 degrees anticlockwise" }, { kind: "translate", label: "Translate 2 down", dx: 0, dy: -2 }] }),
  task(16, { mode: "transformChain", prompt: "Determine the final coordinate without reversing the order.", speakText: "Determine the final coordinate without reversing the order.", contextLabel: "Translation occurs before reflection.", start: { x: -1, y: -4 }, operations: [{ kind: "translate", label: "Translate 5 right and 2 up", dx: 5, dy: 2 }, { kind: "reflectY", label: "Reflect in the y-axis" }] }),
  task(17, { mode: "tessellationRule", prompt: "Construct the repeat rule shown by consecutive tile anchors.", speakText: "Construct the repeat rule shown by consecutive tile anchors.", contextLabel: "A(-2, 3) maps to B(2, 1). B is turned 270 degrees clockwise.", ruleAnswer: { across: 4, down: 2, quarterTurns: 3 } }),
  task(18, { mode: "tessellationRule", prompt: "Record the rule for the alternating row of tiles.", speakText: "Record the rule for the alternating row of tiles.", contextLabel: "Each copy moves 3 columns left and 1 row down, then turns 90 degrees clockwise.", ruleAnswer: { across: -3, down: 1, quarterTurns: 1 } }),
  task(19, { mode: "tessellationRule", prompt: "Infer the transformation between matching pattern units.", speakText: "Infer the transformation between matching pattern units.", contextLabel: "Anchor C(4, 4) maps to D(1, -1). The orientation changes by 180 degrees.", ruleAnswer: { across: -3, down: 5, quarterTurns: 2 } }),
  task(20, { mode: "tessellationRule", prompt: "Construct the rule that extends the final tessellation strip.", speakText: "Construct the rule that extends the final tessellation strip.", contextLabel: "The next anchor is 6 columns right on the same row. Matching edges keep the same orientation.", ruleAnswer: { across: 6, down: 0, quarterTurns: 0 } }),
];

function descriptorForIndex(index: number): Descriptor {
  if (index < 6) return "AC9M6SP01";
  if (index < 12) return "AC9M6SP02";
  return "AC9M6SP03";
}

function descriptorSkill(descriptor: Descriptor) {
  if (descriptor === "AC9M6SP01") return { skillId: "space_l6_cross_sections", skillLabel: "Cross-Sections and Prisms" };
  if (descriptor === "AC9M6SP02") return { skillId: "space_l6_cartesian_plane", skillLabel: "Four-Quadrant Coordinates" };
  return { skillId: "space_l6_transform_tessellate", skillLabel: "Transformations and Tessellations" };
}

function misconceptionFor(descriptor: Descriptor, index: number): readonly Misconception[] {
  const cross: readonly Misconception[] = ["cross-section-face", "parallel-sections-congruent"];
  const coordinates: readonly Misconception[] = ["coordinate-order-scale", "coordinate-movement-change", "quadrant-sign"];
  const transforms: readonly Misconception[] = ["transformation-invariants", "transformation-reference", "transformation-order", "tessellation-gap-overlap"];
  if (descriptor === "AC9M6SP01") return [cross[index % cross.length]!];
  if (descriptor === "AC9M6SP02") return [coordinates[index % coordinates.length]!];
  return [transforms[index % transforms.length]!];
}

function specs(form: Form, tasks: readonly AssessmentTask[]): ItemSpec[] {
  const difficulty = form === "pretest" ? PRE_DIFFICULTY : POST_DIFFICULTY;
  const cognitive = form === "pretest" ? PRE_COGNITIVE : POST_COGNITIVE;
  return tasks.map((assessmentTask, index) => {
    const descriptor = descriptorForIndex(index);
    return {
      descriptor,
      week: descriptor === "AC9M6SP01" ? Math.floor(index / 3) + 1 : descriptor === "AC9M6SP02" ? 3 + Math.floor((index - 6) / 3) : Math.min(8, 5 + Math.floor((index - 12) / 2)),
      lesson: (index % 3) + 1,
      difficulty: difficulty[index]!,
      cognitiveCategory: cognitive[index]!,
      responseMode: assessmentTask.mode === "diagnose" ? "selected_response" : "manipulated_response",
      misconceptionTags: misconceptionFor(descriptor, index),
      misconceptionDiagnosis: [0, 3, 6, 10, 13, 16].includes(index),
      contextKey: `y6-${form}-${descriptor.toLowerCase()}-${index + 1}-v2`,
      structureKey: `y6-${form}-${assessmentTask.mode}-${index + 1}-v2`,
      task: assessmentTask,
    };
  });
}

function candidate(form: Form, index: number, spec: ItemSpec): CandidateQuestion {
  const shortForm = form === "pretest" ? "pre" : "post";
  const skill = descriptorSkill(spec.descriptor);
  return {
    schemaVersion: 1,
    id: `y6-starpath-${shortForm}-${String(index + 1).padStart(2, "0")}-v2`,
    version: "2.0.0",
    realm: "space",
    level: 6,
    form,
    origin: "assessment_authored",
    sourcePool: form,
    bankId: `starpath-level-6-${form}-v2`,
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
    prompt: spec.task.prompt,
    renderer: { type: "starpath_assessment_task", payload: spec.task },
    scoring: { kind: "interaction", correctResponse: CORRECT_TOKEN },
    statistics: createUncalibratedItemStatistics(spec.difficulty),
    type: "starpathTask",
    correctAnswer: CORRECT_TOKEN,
    answer: CORRECT_TOKEN,
    ...skill,
    linkedWeeks: [spec.week],
    linkedLessons: [spec.lesson],
    strand: "Space",
    curriculumCodes: [spec.descriptor],
    difficultyBand: "level-6-starpath",
    visual: { type: "starpath_level6_independent_assessment", taskKind: spec.task.kind, mode: spec.task.mode },
    practiceTask: spec.task,
  };
}

export const LEVEL6_STARPATH_INDEPENDENT_PRETEST_ITEMS = specs("pretest", PRE_TASKS).map((spec, index) => candidate("pretest", index, spec));
export const LEVEL6_STARPATH_INDEPENDENT_POSTTEST_ITEMS = specs("posttest", POST_TASKS).map((spec, index) => candidate("posttest", index, spec));
