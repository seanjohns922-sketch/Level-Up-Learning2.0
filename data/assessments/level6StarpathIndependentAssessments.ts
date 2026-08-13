import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { Question } from "@/data/assessments/posttests";
import {
  constantTask,
  explainTask,
  predictTask,
  prismTask,
  sliceChangeTask,
  sliceShapeTask,
} from "@/data/activities/starpath/level6/crossTasks";
import {
  changeWhichTask,
  crossAxisTask,
  plotSignedTask,
  quadrantTask,
  readSignedTask,
  reverseTask,
} from "@/data/activities/starpath/level6/cartesianTasks";
import {
  findChainTask,
  orderMattersTask,
  transformInOrderTask,
} from "@/data/activities/starpath/level6/transformChainTasks";
import {
  evidenceTask,
  explainFitTask,
  noticeRuleTask,
  patternRuleTask,
  varyTask,
  willTessellateTask,
} from "@/data/activities/starpath/level6/tessellationTasks";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentItemDifficulty,
  type IndependentAssessmentItem,
} from "@/data/assessments/assessmentItemStandard";

type Descriptor = "AC9M6SP01" | "AC9M6SP02" | "AC9M6SP03";
type Form = "pretest" | "posttest";
type CandidateQuestion = Question & IndependentAssessmentItem;
type AssessmentTask = Extract<
  PracticeTask,
  {
    kind:
      | "starpathCrossSection"
      | "starpathCartesian"
      | "starpathTransform"
      | "starpathTessellation";
  }
>;
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

function neutral<T extends AssessmentTask>(task: T): T {
  return {
    ...task,
    feedback: FEEDBACK,
  };
}

const PRE_TASKS: readonly AssessmentTask[] = [
  neutral(sliceShapeTask(0, 1)),
  neutral(sliceChangeTask(1, 2)),
  neutral(predictTask(2, 3)),
  neutral(prismTask(3, 4)),
  neutral(constantTask(4, 5)),
  neutral(explainTask(5, 6)),
  neutral(plotSignedTask(0, 7)),
  neutral(readSignedTask(1, 8)),
  neutral(quadrantTask(2, 9)),
  neutral(changeWhichTask(3, 10)),
  neutral(crossAxisTask(4, 11)),
  neutral(reverseTask(5, 12)),
  neutral(transformInOrderTask(0, 13)),
  neutral(orderMattersTask(1, 14)),
  neutral(findChainTask(2, 15)),
  neutral(willTessellateTask(0, 16)),
  neutral(patternRuleTask(1, 17)),
  neutral(explainFitTask(2, 18)),
  neutral(varyTask(3, 19)),
  neutral(evidenceTask(4, 20)),
];

const POST_TASKS: readonly AssessmentTask[] = [
  neutral(sliceShapeTask(6, 1)),
  neutral(sliceChangeTask(7, 2)),
  neutral(predictTask(8, 3)),
  neutral(prismTask(9, 4)),
  neutral(constantTask(10, 5)),
  neutral(explainTask(11, 6)),
  neutral(plotSignedTask(6, 7)),
  neutral(readSignedTask(7, 8)),
  neutral(quadrantTask(8, 9)),
  neutral(changeWhichTask(9, 10)),
  neutral(crossAxisTask(10, 11)),
  neutral(reverseTask(11, 12)),
  neutral(transformInOrderTask(3, 13)),
  neutral(orderMattersTask(4, 14)),
  neutral(findChainTask(5, 15)),
  neutral(willTessellateTask(5, 16)),
  neutral(noticeRuleTask(6, 17)),
  neutral(explainFitTask(7, 18)),
  neutral(varyTask(8, 19)),
  neutral(evidenceTask(9, 20)),
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
      responseMode:
        "render" in assessmentTask && assessmentTask.render === "tap"
          ? "manipulated_response"
          : "selected_response",
      misconceptionTags: misconceptionFor(descriptor, index),
      misconceptionDiagnosis: [0, 3, 6, 10, 13, 16].includes(index),
      contextKey: `y6-${form}-${descriptor.toLowerCase()}-${index + 1}-v3`,
      structureKey: `y6-${form}-${assessmentTask.kind}-${assessmentTask.mode}-${index + 1}-v3`,
      task: assessmentTask,
    };
  });
}

function candidate(form: Form, index: number, spec: ItemSpec): CandidateQuestion {
  const shortForm = form === "pretest" ? "pre" : "post";
  const skill = descriptorSkill(spec.descriptor);
  return {
    schemaVersion: 1,
    id: `y6-starpath-${shortForm}-${String(index + 1).padStart(2, "0")}-v3`,
    version: "3.0.0",
    realm: "space",
    level: 6,
    form,
    origin: "assessment_authored",
    sourcePool: form,
    bankId: `starpath-level-6-${form}-v3`,
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
    visual: { type: "starpath_level6_independent_assessment", taskKind: spec.task.kind, mode: "mode" in spec.task ? spec.task.mode : undefined },
    practiceTask: spec.task,
  };
}

export const LEVEL6_STARPATH_INDEPENDENT_PRETEST_ITEMS = specs("pretest", PRE_TASKS).map((spec, index) => candidate("pretest", index, spec));
export const LEVEL6_STARPATH_INDEPENDENT_POSTTEST_ITEMS = specs("posttest", POST_TASKS).map((spec, index) => candidate("posttest", index, spec));
