import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { GRID_8, commandsTask, errorTask, moveAxisTask, orderTask, readTask, routeTask } from "@/data/activities/starpath/level5/coordinateTasks";
import { buildTask, chooseNetTask, classifyTask, countTask, foldPredictTask, reasonTask, relationTask, selectValidTask } from "@/data/activities/starpath/level5/netTasks";
import { checkTask, compareTask, describeTask, reflectTapTask, rotateTapTask, translateTapTask } from "@/data/activities/starpath/level5/transformTasks";
import type { Question } from "@/data/assessments/posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentItemDifficulty,
  type IndependentAssessmentItem,
} from "@/data/assessments/assessmentItemStandard";

type Descriptor = "AC9M5SP01" | "AC9M5SP02" | "AC9M5SP03";
type Form = "pretest" | "posttest";
type CandidateQuestion = Question & IndependentAssessmentItem;
type AssessmentTask = Extract<PracticeTask, { kind: "starpathNet" | "starpathCoordinate" | "starpathTransform" }>;
type ResponseMode = "selected_response" | "manipulated_response";
type Misconception =
  | "object-view-consistency"
  | "net-face-count"
  | "net-adjacency-fold"
  | "coordinate-order-scale"
  | "coordinate-movement-change"
  | "route-destination-only"
  | "transformation-invariants"
  | "transformation-reference";

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
  "easy", "moderate", "moderate", "challenging", "moderate", "challenging", "moderate",
  "easy", "easy", "moderate", "moderate", "challenging", "moderate",
  "easy", "moderate", "challenging", "moderate", "challenging", "moderate", "easy",
];
const PRE_COGNITIVE: AssessmentCognitiveCategory[] = [
  "recall", "understanding", "understanding", "application", "application", "reasoning", "reasoning",
  "understanding", "understanding", "application", "application", "reasoning", "transfer",
  "understanding", "application", "application", "reasoning", "reasoning", "transfer", "application",
];
const POST_DIFFICULTY: AssessmentItemDifficulty[] = [
  "easy", "moderate", "challenging", "moderate", "challenging", "challenging", "moderate",
  "easy", "moderate", "challenging", "moderate", "challenging", "moderate",
  "easy", "moderate", "challenging", "moderate", "challenging", "challenging", "moderate",
];
const POST_COGNITIVE: AssessmentCognitiveCategory[] = [
  "recall", "understanding", "application", "application", "reasoning", "reasoning", "transfer",
  "understanding", "application", "application", "reasoning", "transfer", "reasoning",
  "understanding", "application", "reasoning", "application", "reasoning", "transfer", "reasoning",
];

function assessmentTask(task: AssessmentTask, prompt: string): AssessmentTask {
  return { ...task, prompt, speakText: task.speakText || prompt, feedback: FEEDBACK } as AssessmentTask;
}

function descriptorForIndex(index: number): Descriptor {
  if (index < 7) return "AC9M5SP01";
  if (index < 13) return "AC9M5SP02";
  return "AC9M5SP03";
}

function descriptorSkill(descriptor: Descriptor) {
  if (descriptor === "AC9M5SP01") return { skillId: "space_l5_nets_objects", skillLabel: "Objects and Nets" };
  if (descriptor === "AC9M5SP02") return { skillId: "space_l5_coordinates_movement", skillLabel: "Coordinates and Movement" };
  return { skillId: "space_l5_transformations", skillLabel: "Translations, Reflections and Rotations" };
}

function misconceptionFor(descriptor: Descriptor, index: number): readonly Misconception[] {
  if (descriptor === "AC9M5SP01") return (["net-face-count", "net-adjacency-fold", "object-view-consistency"] as const).slice(index % 3, (index % 3) + 1);
  if (descriptor === "AC9M5SP02") return (["coordinate-order-scale", "coordinate-movement-change", "route-destination-only"] as const).slice(index % 3, (index % 3) + 1);
  return (["transformation-invariants", "transformation-reference", "coordinate-movement-change"] as const).slice(index % 3, (index % 3) + 1);
}

const PRE_TASKS: readonly AssessmentTask[] = [
  assessmentTask(chooseNetTask(91, 1), "Which net can fold into the target object?"),
  assessmentTask(foldPredictTask(92, 2), "Will this net fold without overlap?"),
  assessmentTask(reasonTask(93, 3), "Choose the evidence that proves the net works."),
  assessmentTask(countTask(94, 4), "After folding, how many faces touch the marked face?"),
  assessmentTask(relationTask(95, 5), "How do the marked faces meet after folding?"),
  assessmentTask(classifyTask(96, 6), "Classify what happens when this net folds."),
  assessmentTask(selectValidTask(97, 7), "Choose every net that folds cleanly."),
  assessmentTask(orderTask(101, 8), "Use coordinate order to name the marked point."),
  assessmentTask(readTask(102, 9), "Read the coordinate of the marked point."),
  assessmentTask(errorTask(103, 10), "Correct the coordinate label error."),
  assessmentTask(moveAxisTask(104, 11, GRID_8), "Identify which coordinate changed."),
  assessmentTask(commandsTask(105, 12, GRID_8), "Build commands to reach the star."),
  assessmentTask(routeTask(106, 13, GRID_8), "Plan the shortest valid coordinate route."),
  assessmentTask(describeTask(111, 14), "Describe the slide from shape to image."),
  assessmentTask(checkTask(112, 15), "Decide whether the image is a translation."),
  assessmentTask(compareTask(113, 16), "Classify the transformation shown."),
  assessmentTask(translateTapTask(114, 17), "Map the marked point after a translation."),
  assessmentTask(reflectTapTask(115, 18), "Map the marked point after reflection."),
  assessmentTask(rotateTapTask(116, 19), "Map the marked point after rotation."),
  assessmentTask(compareTask(117, 20), "Choose the transformation and preserve its invariants."),
];

const POST_TASKS: readonly AssessmentTask[] = [
  assessmentTask(foldPredictTask(121, 1), "Test whether the net closes into a solid."),
  assessmentTask(reasonTask(122, 2), "Choose the strongest folding evidence."),
  assessmentTask(relationTask(123, 3), "Determine the folded face relationship."),
  assessmentTask(classifyTask(124, 4), "Diagnose the fold result from the net."),
  assessmentTask(selectValidTask(125, 5), "Select all nets that fold without overlap."),
  assessmentTask(buildTask(126, 6), "Build and test a valid cube net."),
  assessmentTask(countTask(127, 7), "Use folded structure to count adjacent faces."),
  assessmentTask(readTask(131, 8), "Read the coordinate from the grid."),
  assessmentTask(errorTask(132, 9), "Fix the swapped or mis-scaled coordinate."),
  assessmentTask(moveAxisTask(133, 10, GRID_8), "Compare coordinates after an axis move."),
  assessmentTask(commandsTask(134, 11, GRID_8), "Create a command route to the target."),
  assessmentTask(routeTask(135, 12, GRID_8), "Create the shortest route around obstacles."),
  assessmentTask(errorTask(136, 13, GRID_8), "Audit the coordinate in an integrated brief."),
  assessmentTask(checkTask(141, 14), "Check whether the image preserves translation invariants."),
  assessmentTask(compareTask(142, 15), "Classify the transformation from original to image."),
  assessmentTask(describeTask(143, 16), "Describe the movement from shape to image."),
  assessmentTask(translateTapTask(144, 17), "Locate a translated point."),
  assessmentTask(reflectTapTask(145, 18), "Locate a reflected point."),
  assessmentTask(rotateTapTask(146, 19), "Locate a rotated point."),
  assessmentTask(compareTask(147, 20), "Use invariant evidence to classify the transformation."),
];

function specs(form: Form, tasks: readonly AssessmentTask[]): ItemSpec[] {
  const difficulty = form === "pretest" ? PRE_DIFFICULTY : POST_DIFFICULTY;
  const cognitive = form === "pretest" ? PRE_COGNITIVE : POST_COGNITIVE;
  return tasks.map((task, index) => {
    const descriptor = descriptorForIndex(index);
    const selected = index === 0 || index === 13;
    return {
      descriptor,
      week: descriptor === "AC9M5SP01" ? Math.min(3, Math.floor(index / 3) + 1) : descriptor === "AC9M5SP02" ? Math.min(5, 4 + Math.floor((index - 7) / 3)) : Math.min(8, 6 + Math.floor((index - 13) / 3)),
      lesson: (index % 3) + 1,
      difficulty: difficulty[index]!,
      cognitiveCategory: cognitive[index]!,
      responseMode: selected ? "selected_response" : "manipulated_response",
      misconceptionTags: misconceptionFor(descriptor, index),
      misconceptionDiagnosis: [0, 3, 7, 10, 13, 17].includes(index),
      contextKey: `y5-${form}-${descriptor.toLowerCase()}-${index + 1}`,
      structureKey: `y5-${form}-${task.kind}-${"mode" in task ? task.mode : "task"}-${index + 1}`,
      task,
    };
  });
}

function candidate(form: Form, index: number, spec: ItemSpec): CandidateQuestion {
  const shortForm = form === "pretest" ? "pre" : "post";
  const skill = descriptorSkill(spec.descriptor);
  return {
    schemaVersion: 1, id: `y5-starpath-${shortForm}-${String(index + 1).padStart(2, "0")}-v1`, version: "1.0.0",
    realm: "space", level: 5, form, origin: "assessment_authored", sourcePool: form,
    bankId: `starpath-level-5-${form}-v1`, primaryDescriptorCode: spec.descriptor, descriptorCodes: [spec.descriptor],
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
    difficultyBand: "level-5-starpath", visual: { type: "starpath_level5_assessment", taskKind: spec.task.kind }, practiceTask: spec.task,
  };
}

export const LEVEL5_STARPATH_INDEPENDENT_PRETEST_ITEMS = specs("pretest", PRE_TASKS).map((spec, index) => candidate("pretest", index, spec));
export const LEVEL5_STARPATH_INDEPENDENT_POSTTEST_ITEMS = specs("posttest", POST_TASKS).map((spec, index) => candidate("posttest", index, spec));
