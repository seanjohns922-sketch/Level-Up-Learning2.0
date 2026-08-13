import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { CARTESIAN_RANGE } from "@/data/activities/starpath/level6/cartesian";
import { changeWhichTask, crossAxisTask, plotSignedTask, quadrantTask, readSignedTask, reasonTask, reverseTask } from "@/data/activities/starpath/level6/cartesianTasks";
import { constantTask, explainTask, predictTask, prismTask, sliceChangeTask, sliceShapeTask } from "@/data/activities/starpath/level6/crossTasks";
import { evidenceTask, explainFitTask, noticeRuleTask, patternRuleTask, varyTask, willTessellateTask } from "@/data/activities/starpath/level6/tessellationTasks";
import { findChainTask, orderMattersTask, transformInOrderTask } from "@/data/activities/starpath/level6/transformChainTasks";
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
type AssessmentTask = Extract<PracticeTask, { kind: "starpathCrossSection" | "starpathCartesian" | "starpathTransform" | "starpathTessellation" }>;
type ResponseMode = "selected_response" | "manipulated_response";
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
  responseMode: ResponseMode;
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

function assessmentTask(task: AssessmentTask, prompt: string): AssessmentTask {
  return { ...task, prompt, speakText: task.speakText || prompt, feedback: FEEDBACK } as AssessmentTask;
}

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

const PRE_TASKS: readonly AssessmentTask[] = [
  assessmentTask(sliceShapeTask(91, 1), "Identify the cross-section made by the cut."),
  assessmentTask(sliceChangeTask(92, 2), "Compare the parallel slices through the object."),
  assessmentTask(predictTask(93, 3), "Predict the cross-section before cutting."),
  assessmentTask(prismTask(94, 4), "Use cross-section evidence to decide whether this is a right prism."),
  assessmentTask(constantTask(95, 5), "Classify whether the parallel cross-sections stay congruent or change."),
  assessmentTask(explainTask(96, 6), "Explain what the section pattern proves about the object."),
  assessmentTask(plotSignedTask(101, 7), "Plot the signed ordered pair on the Cartesian plane."),
  assessmentTask(readSignedTask(102, 8), "Read the coordinates of the plotted point."),
  assessmentTask(quadrantTask(103, 9), "Name the quadrant containing the marked point."),
  assessmentTask(reasonTask(104, 10), "Use coordinate signs to identify the quadrant."),
  assessmentTask(changeWhichTask(105, 11), "Compare the coordinates and identify what changed."),
  assessmentTask(crossAxisTask(106, 12), "Move the point across an axis and plot the image."),
  assessmentTask(transformInOrderTask(111, 13), "Apply the transformations in order and place the image point."),
  assessmentTask(orderMattersTask(112, 14), "Decide whether reversing the transformations changes the result."),
  assessmentTask(findChainTask(113, 15), "Choose the transformation chain that maps the shape to its image."),
  assessmentTask(willTessellateTask(114, 16), "Decide whether the tile forms a tessellation."),
  assessmentTask(patternRuleTask(115, 17), "Identify the transformation rule in the tessellation."),
  assessmentTask(explainFitTask(116, 18), "Explain why the tiles fit with no gaps."),
  assessmentTask(varyTask(117, 19), "Predict what happens when a tessellation copy is changed."),
  assessmentTask(evidenceTask(118, 20), "Choose the evidence that proves a tessellation."),
];

const POST_TASKS: readonly AssessmentTask[] = [
  assessmentTask(predictTask(121, 1), "Predict the section from the object and cut."),
  assessmentTask(sliceChangeTask(122, 2), "Analyse how the parallel sections change."),
  assessmentTask(prismTask(123, 3), "Classify the object using right-prism evidence."),
  assessmentTask(constantTask(124, 4), "Use the section sequence to distinguish constant and shrinking sections."),
  assessmentTask(explainTask(125, 5), "Infer the object's structure from cross-section evidence."),
  assessmentTask(sliceShapeTask(126, 6), "Audit the cross-section shape after the cut."),
  assessmentTask(readSignedTask(131, 7), "Read a signed ordered pair from the plane."),
  assessmentTask(plotSignedTask(132, 8), "Plot a point across the four quadrants."),
  assessmentTask(quadrantTask(133, 9), "Justify the quadrant from the plotted point."),
  assessmentTask(changeWhichTask(134, 10), "Identify the coordinate change in a movement."),
  assessmentTask(crossAxisTask(135, 11), "Track a point as it crosses an axis."),
  assessmentTask(reverseTask(136, 12), "Infer the movement rule from a point and its image."),
  assessmentTask(transformInOrderTask(141, 13), "Complete a two-step transformation in order."),
  assessmentTask(orderMattersTask(142, 14), "Evaluate whether transformation order changes the final image."),
  assessmentTask(findChainTask(143, 15), "Find the ordered chain that maps the original to the image."),
  assessmentTask(noticeRuleTask(144, 16), "Identify the rule that repeats the tile."),
  assessmentTask(willTessellateTask(145, 17), "Test whether the shape tessellates."),
  assessmentTask(patternRuleTask(146, 18), "Connect the tessellation to its transformation rule."),
  assessmentTask(varyTask(147, 19), "Diagnose what breaks when a tessellation condition changes."),
  assessmentTask(evidenceTask(148, 20), "Use evidence to defend whether the pattern is a tessellation."),
];

function specs(form: Form, tasks: readonly AssessmentTask[]): ItemSpec[] {
  const difficulty = form === "pretest" ? PRE_DIFFICULTY : POST_DIFFICULTY;
  const cognitive = form === "pretest" ? PRE_COGNITIVE : POST_COGNITIVE;
  return tasks.map((task, index) => {
    const descriptor = descriptorForIndex(index);
    return {
      descriptor,
      week: descriptor === "AC9M6SP01" ? Math.min(2, Math.floor(index / 3) + 1) : descriptor === "AC9M6SP02" ? Math.min(4, 3 + Math.floor((index - 6) / 3)) : Math.min(8, 5 + Math.floor((index - 12) / 3)),
      lesson: (index % 3) + 1,
      difficulty: difficulty[index]!,
      cognitiveCategory: cognitive[index]!,
      responseMode: index === 0 ? "selected_response" : "manipulated_response",
      misconceptionTags: misconceptionFor(descriptor, index),
      misconceptionDiagnosis: [0, 3, 6, 10, 13, 16].includes(index),
      contextKey: `y6-${form}-${descriptor.toLowerCase()}-${index + 1}`,
      structureKey: `y6-${form}-${task.kind}-${"mode" in task ? task.mode : "task"}-${index + 1}`,
      task,
    };
  });
}

function candidate(form: Form, index: number, spec: ItemSpec): CandidateQuestion {
  const shortForm = form === "pretest" ? "pre" : "post";
  const skill = descriptorSkill(spec.descriptor);
  return {
    schemaVersion: 1, id: `y6-starpath-${shortForm}-${String(index + 1).padStart(2, "0")}-v1`, version: "1.0.0",
    realm: "space", level: 6, form, origin: "assessment_authored", sourcePool: form,
    bankId: `starpath-level-6-${form}-v1`, primaryDescriptorCode: spec.descriptor, descriptorCodes: [spec.descriptor],
    curriculumLessonMapping: [{ week: spec.week, lesson: spec.lesson }],
    cognitiveCategory: spec.cognitiveCategory, difficulty: spec.difficulty,
    isTransfer: spec.cognitiveCategory === "transfer",
    requiresReasoning: spec.cognitiveCategory === "reasoning" || spec.cognitiveCategory === "transfer",
    misconceptionDiagnosis: spec.misconceptionDiagnosis ?? false,
    responseMode: spec.responseMode, misconceptionTags: spec.misconceptionTags,
    contextKey: spec.contextKey, structureKey: spec.structureKey,
    prompt: spec.task.prompt, renderer: { type: "starpath_assessment_task", payload: spec.task },
    scoring: { kind: "interaction", correctResponse: CORRECT_TOKEN },
    statistics: createUncalibratedItemStatistics(spec.difficulty),
    type: "starpathTask", correctAnswer: CORRECT_TOKEN, answer: CORRECT_TOKEN,
    ...skill,
    linkedWeeks: [spec.week], linkedLessons: [spec.lesson], strand: "Space", curriculumCodes: [spec.descriptor],
    difficultyBand: "level-6-starpath", visual: { type: "starpath_level6_assessment", taskKind: spec.task.kind, cartesianRange: CARTESIAN_RANGE }, practiceTask: spec.task,
  };
}

export const LEVEL6_STARPATH_INDEPENDENT_PRETEST_ITEMS = specs("pretest", PRE_TASKS).map((spec, index) => candidate("pretest", index, spec));
export const LEVEL6_STARPATH_INDEPENDENT_POSTTEST_ITEMS = specs("posttest", POST_TASKS).map((spec, index) => candidate("posttest", index, spec));
