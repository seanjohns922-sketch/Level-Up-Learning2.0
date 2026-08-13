import type { PracticeTask } from "@/data/activities/year1/practice-task";
import {
  alternateShapeTask,
  componentScanTask,
  constructShapeTask,
  evaluateModelTask,
  hiddenStructureTask,
  modelTask,
  simplifyTask,
  solidAssemblyTask,
  viewBuildTask,
} from "@/data/activities/starpath/level4/composite";
import {
  cellToReferenceTask,
  labelGridTask,
  landmarkToReferenceTask,
  placeAtReferenceTask,
  referenceToCellTask,
  repairLabelsTask,
  typeReferenceTask,
} from "@/data/activities/starpath/level4/gridReference";
import {
  authorRouteTask,
  checkpointRouteTask,
  missingReferenceTask,
} from "@/data/activities/starpath/level4/gridRoute";
import {
  diagonalCompleteTask,
  horizontalCompleteTask,
  lineCreateTask,
  lineRepairTask,
  lineTestTask,
  rotationCompleteTask,
  rotationCreateTask,
  rotationRecordTask,
  rotationRepairTask,
  verticalCompleteTask,
} from "@/data/activities/starpath/level4/symmetry";
import type { Question } from "@/data/assessments/posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentItemDifficulty,
  type IndependentAssessmentItem,
} from "@/data/assessments/assessmentItemStandard";

type Descriptor = "AC9M4SP01" | "AC9M4SP02" | "AC9M4SP03";
type Form = "pretest" | "posttest";
type CandidateQuestion = Question & IndependentAssessmentItem;
type AssessmentTask = Extract<PracticeTask, { kind: "starpathComposite" | "starpathGridReference" | "starpathGridRoute" | "starpathSymmetry" }>;
type ResponseMode = "selected_response" | "manipulated_response";
type Misconception =
  | "object-view-consistency"
  | "composite-decomposition"
  | "approximation-as-exact"
  | "grid-reference-coordinate-order"
  | "grid-path-reference"
  | "route-destination-only"
  | "line-symmetry-visual-balance"
  | "rotational-line-symmetry"
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
  "easy", "easy", "moderate", "moderate", "moderate", "challenging", "moderate",
  "easy", "easy", "moderate", "moderate", "challenging", "moderate",
  "easy", "moderate", "challenging", "moderate", "moderate", "challenging", "easy",
];
const PRE_COGNITIVE: AssessmentCognitiveCategory[] = [
  "recall", "recall", "understanding", "understanding", "understanding", "application", "application",
  "understanding", "understanding", "application", "application", "reasoning", "reasoning",
  "application", "application", "reasoning", "application", "reasoning", "reasoning", "transfer",
];
const POST_DIFFICULTY: AssessmentItemDifficulty[] = [
  "easy", "moderate", "moderate", "challenging", "moderate", "challenging", "moderate",
  "easy", "moderate", "moderate", "challenging", "challenging", "moderate",
  "easy", "moderate", "challenging", "moderate", "challenging", "challenging", "easy",
];
const POST_COGNITIVE: AssessmentCognitiveCategory[] = [
  "recall", "understanding", "understanding", "application", "application", "reasoning", "reasoning",
  "understanding", "understanding", "application", "application", "reasoning", "reasoning",
  "application", "application", "reasoning", "application", "reasoning", "transfer", "transfer",
];

function assessmentTask(task: PracticeTask, prompt: string): AssessmentTask {
  const speakText = "speakText" in task && typeof task.speakText === "string" ? task.speakText : prompt;
  return { ...task, prompt, speakText, feedback: FEEDBACK } as AssessmentTask;
}

function descriptorForIndex(index: number): Descriptor {
  if (index < 7) return "AC9M4SP01";
  if (index < 13) return "AC9M4SP02";
  return "AC9M4SP03";
}

function descriptorSkill(descriptor: Descriptor) {
  if (descriptor === "AC9M4SP01") return { skillId: "space_l4_composite_representation", skillLabel: "Composite Shape and Object Representation" };
  if (descriptor === "AC9M4SP02") return { skillId: "space_l4_grid_references_pathways", skillLabel: "Grid References and Pathways" };
  return { skillId: "space_l4_symmetry_systems", skillLabel: "Line and Rotational Symmetry" };
}

function misconceptionFor(descriptor: Descriptor, index: number): readonly Misconception[] {
  if (descriptor === "AC9M4SP01") {
    return (["composite-decomposition", "object-view-consistency", "approximation-as-exact"] as const).slice(index % 3, (index % 3) + 1);
  }
  if (descriptor === "AC9M4SP02") {
    return (["grid-reference-coordinate-order", "grid-path-reference", "route-destination-only"] as const).slice(index % 3, (index % 3) + 1);
  }
  return (["line-symmetry-visual-balance", "rotational-line-symmetry", "transformation-reference"] as const).slice(index % 3, (index % 3) + 1);
}

const PRE_TASKS: readonly AssessmentTask[] = [
  assessmentTask(componentScanTask(31, 1), "Choose the familiar shapes inside the observatory badge."),
  assessmentTask(constructShapeTask(32, 2), "Build the shuttle badge from familiar shapes."),
  assessmentTask(alternateShapeTask(33, 3), "Build the rover sign another way."),
  assessmentTask(solidAssemblyTask(34, 4), "Build the fuel station from familiar solids."),
  assessmentTask(viewBuildTask(35, 5), "Build the tower to match both views."),
  assessmentTask(hiddenStructureTask(36, 6), "Add the smallest hidden support for the tower."),
  assessmentTask(simplifyTask(37, 7), "Make a simpler icon that still shows the station."),
  assessmentTask(cellToReferenceTask(41, 8), "Choose the reference for the highlighted grid cell."),
  assessmentTask(referenceToCellTask(42, 9), "Tap the grid cell named by the reference."),
  assessmentTask(placeAtReferenceTask(43, 10), "Place the supply pod at the given reference."),
  assessmentTask(typeReferenceTask(44, 11, true), "Type the reference for the marked landmark."),
  assessmentTask(authorRouteTask(45, 12), "Write a route from the start to the base."),
  assessmentTask(checkpointRouteTask(46, 13), "Write a route that visits the relay first."),
  assessmentTask(lineTestTask(51, 14), "Decide whether every tile has line symmetry."),
  assessmentTask(verticalCompleteTask(52, 15), "Complete the vertical reflection pattern."),
  assessmentTask(diagonalCompleteTask(53, 16), "Complete the diagonal reflection pattern."),
  assessmentTask(lineCreateTask(54, 17), "Create a pattern with the stated line symmetry."),
  assessmentTask(rotationCompleteTask(55, 18), "Complete the turning pattern around the centre."),
  assessmentTask(rotationCreateTask(56, 19), "Create a pattern that matches after turning."),
  assessmentTask(rotationRepairTask(57, 20), "Repair the tile that breaks rotational symmetry."),
];

const POST_TASKS: readonly AssessmentTask[] = [
  assessmentTask(evaluateModelTask(61, 1), "Choose the complete composite model and reason."),
  assessmentTask(modelTask(62, 2), "Model the space port from familiar shapes."),
  assessmentTask(alternateShapeTask(63, 3), "Build the satellite icon in another way."),
  assessmentTask(solidAssemblyTask(64, 4), "Build the lunar lab from familiar solids."),
  assessmentTask(viewBuildTask(65, 5), "Build the object that matches both camera views."),
  assessmentTask(hiddenStructureTask(66, 6), "Add hidden supports using the fewest cubes."),
  assessmentTask(simplifyTask(67, 7), "Simplify the composite mission icon."),
  assessmentTask(landmarkToReferenceTask(71, 8), "Choose the reference for the named landmark."),
  assessmentTask(labelGridTask(72, 9), "Complete the grid reference labels."),
  assessmentTask(repairLabelsTask(73, 10), "Repair the incorrect row or column label."),
  assessmentTask(typeReferenceTask(74, 11, true), "Type the reference for the mission landmark."),
  assessmentTask(missingReferenceTask(75, 12), "Complete the route log with its final reference."),
  assessmentTask(authorRouteTask(76, 13), "Author a precise pathway between references."),
  assessmentTask(rotationRecordTask(81, 14), "Record the smallest turn that matches."),
  assessmentTask(horizontalCompleteTask(82, 15), "Complete the horizontal reflection pattern."),
  assessmentTask(diagonalCompleteTask(83, 16), "Complete the diagonal symmetry pattern."),
  assessmentTask(lineRepairTask(84, 17), "Repair the tile that breaks line symmetry."),
  assessmentTask(rotationCompleteTask(85, 18), "Complete the rotational symmetry pattern."),
  assessmentTask(rotationCreateTask(86, 19), "Create a pattern with rotational symmetry."),
  assessmentTask(rotationRepairTask(87, 20), "Repair the rotational pattern and retest it."),
];

function specs(form: Form, tasks: readonly AssessmentTask[]): ItemSpec[] {
  const difficulty = form === "pretest" ? PRE_DIFFICULTY : POST_DIFFICULTY;
  const cognitive = form === "pretest" ? PRE_COGNITIVE : POST_COGNITIVE;
  return tasks.map((task, index) => {
    const descriptor = descriptorForIndex(index);
    const selected = index === 0 || index === 7 || index === 13;
    return {
      descriptor,
      week: descriptor === "AC9M4SP01" ? Math.min(3, Math.floor(index / 2) + 1) : descriptor === "AC9M4SP02" ? Math.min(5, 4 + Math.floor((index - 7) / 3)) : Math.min(8, 6 + Math.floor((index - 13) / 3)),
      lesson: (index % 3) + 1,
      difficulty: difficulty[index]!,
      cognitiveCategory: cognitive[index]!,
      responseMode: selected ? "selected_response" : "manipulated_response",
      misconceptionTags: misconceptionFor(descriptor, index),
      misconceptionDiagnosis: [0, 4, 7, 11, 13, 17].includes(index),
      contextKey: `y4-${form}-${descriptor.toLowerCase()}-${index + 1}`,
      structureKey: `y4-${form}-${task.kind}-${"mode" in task ? task.mode : "task"}-${index + 1}`,
      task,
    };
  });
}

function candidate(form: Form, index: number, spec: ItemSpec): CandidateQuestion {
  const shortForm = form === "pretest" ? "pre" : "post";
  const skill = descriptorSkill(spec.descriptor);
  return {
    schemaVersion: 1,
    id: `y4-starpath-${shortForm}-${String(index + 1).padStart(2, "0")}-v1`,
    version: "1.0.0",
    realm: "space",
    level: 4,
    form,
    origin: "assessment_authored",
    sourcePool: form,
    bankId: `starpath-level-4-${form}-v1`,
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
    difficultyBand: "level-4-starpath",
    visual: { type: "starpath_level4_assessment", taskKind: spec.task.kind },
    practiceTask: spec.task,
  };
}

export const LEVEL4_STARPATH_INDEPENDENT_PRETEST_ITEMS = specs("pretest", PRE_TASKS).map((spec, index) => candidate("pretest", index, spec));
export const LEVEL4_STARPATH_INDEPENDENT_POSTTEST_ITEMS = specs("posttest", POST_TASKS).map((spec, index) => candidate("posttest", index, spec));
