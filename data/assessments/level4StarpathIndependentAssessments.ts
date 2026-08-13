import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { CompositeTask } from "@/data/activities/starpath/level4/composite";
import { figureSvg, getL4Figure, type CompositeFigure, type FigureShape } from "@/data/activities/starpath/level4/composite-figures";
import { getL4Object } from "@/data/activities/starpath/level4/composite-objects";
import {
  labelGridTask,
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

function rotate<T>(items: T[], by: number): T[] {
  if (items.length === 0) return items;
  const start = ((by % items.length) + items.length) % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
}

const SHAPE_PALETTE: FigureShape[] = ["triangle", "square", "rectangle", "circle"];
const SOLID_PALETTE: FigureShape[] = ["cube", "cylinder", "cone", "sphere", "prism"];

function assessmentScanTask(round: number, target: number): AssessmentTask {
  const figure = getL4Figure(round);
  const shapes = [...new Set(figure.parts.map((part) => part.shape))];
  const correct = shapes.join(" + ");
  const unused = SHAPE_PALETTE.filter((shape) => !shapes.includes(shape));
  const wrong = [
    shapes.slice(1).join(" + ") || `${shapes[0]} + ${unused[0] ?? "circle"}`,
    [...new Set([...shapes, unused[0] ?? "circle"])].join(" + "),
  ].filter((option) => option !== correct);
  return {
    kind: "starpathComposite",
    mode: "scan",
    target,
    prompt: `Which shapes make this ${figure.name}?`,
    speakText: `Look closely at the ${figure.name}. Which familiar shapes make it?`,
    designBrief: "Name every familiar shape used in the picture.",
    figureSvg: completeSvg(figure),
    options: rotate([
      { id: "correct", label: correct },
      { id: "missing", label: wrong[0] ?? "square + circle" },
      { id: "extra", label: wrong[1] ?? "triangle + square + circle" },
    ], round),
    correctOptionId: "correct",
    feedback: FEEDBACK,
  };
}

function assessmentBuildTask(round: number, target: number, object = false): AssessmentTask {
  const figure = object ? getL4Object(round) : getL4Figure(round);
  return {
    kind: "starpathComposite",
    mode: object ? "solid" : "construct",
    target,
    prompt: `Build the ${figure.name}.`,
    speakText: `Choose a ${object ? "solid" : "shape"}, then tap the matching space. Build the ${figure.name}.`,
    designBrief: `Use the correct ${object ? "solids" : "shapes"} to complete every part.`,
    figure: {
      id: figure.id,
      name: figure.name,
      viewBox: figure.viewBox,
      parts: figure.parts.map((part) => ({ ...part })),
    },
    buildPalette: object ? SOLID_PALETTE : SHAPE_PALETTE,
    feedback: FEEDBACK,
  };
}

function assessmentStructureTask(round: number, target: number, mode: "views" | "hidden"): AssessmentTask {
  const cells = [{ r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }];
  const heights = [1 + (round % 2), 1, 2 + (round % 2), 1];
  const solution = cells.map((cell, index) => ({ ...cell, pieceId: `cube-${heights[index]}` }));
  const views = { front: [heights[1]!, heights[2]!, heights[3]!], side: [heights[2]!, heights[0]!], top: cells.length };
  return {
    kind: "starpathComposite",
    mode,
    target,
    prompt: mode === "hidden" ? "Build the smallest supported structure." : "Build the object from all three views.",
    speakText: mode === "hidden" ? "Add the fewest cube stacks needed to support every part." : "Use the front, side and top views to build the object.",
    boardId: `y4-assessment-${mode}-${round}`,
    cols: 4,
    rows: 3,
    palette: [
      { id: "cube-1", label: "1 cube high", colour: "#8b5cf6" },
      { id: "cube-2", label: "2 cubes high", colour: "#0ea5e9" },
      { id: "cube-3", label: "3 cubes high", colour: "#f97316" },
    ],
    targetCells: cells,
    validSolutions: [solution],
    maxPieces: cells.length,
    viewLabels: views,
    designBrief: mode === "hidden" ? "Every raised part needs support beneath it." : `Front ${views.front.join("-")}; side ${views.side.join("-")}; top ${views.top} cells.`,
    feedback: FEEDBACK,
  };
}

function completeSvg(figure: CompositeFigure) {
  return figureSvg(figure, () => true);
}

function missingSvg(figure: CompositeFigure, missingPartId: string) {
  return figureSvg(figure, (partId) => partId !== missingPartId);
}

function assessmentCompareTask(params: {
  round: number;
  target: number;
  figure: CompositeFigure;
  prompt: string;
  correctReason: string;
  distractorReasons: readonly string[];
  missingPartIndex: number;
  correctFirst?: boolean;
}): CompositeTask {
  const missing = params.figure.parts[params.missingPartIndex % params.figure.parts.length]!;
  const correctId = params.correctFirst ? "a" : "b";
  const incorrectId = params.correctFirst ? "b" : "a";
  const options = params.correctFirst
    ? [{ id: "a", svg: completeSvg(params.figure) }, { id: "b", svg: missingSvg(params.figure, missing.id) }]
    : [{ id: "a", svg: missingSvg(params.figure, missing.id) }, { id: "b", svg: completeSvg(params.figure) }];
  return {
    kind: "starpathComposite",
    mode: "evaluate",
    target: params.target,
    prompt: params.prompt,
    speakText: `${params.prompt} Choose a picture, then choose why.`,
    designBrief: `The complete model has every part needed to make the ${params.figure.name}.`,
    figureOptions: options,
    correctOptionId: correctId,
    reasonOptions: rotate([
      { id: "evidence", label: params.correctReason },
      { id: "missing", label: `It still works without the ${missing.label.toLowerCase()}.` },
      { id: "appearance", label: params.distractorReasons[0] ?? "It uses brighter colours." },
      { id: "size", label: params.distractorReasons[1] ?? "It is the bigger picture." },
    ], params.round),
    correctReasonId: "evidence",
    feedback: FEEDBACK,
    boardId: `y4-assessment-compare-${params.figure.id}-${params.round}-${incorrectId}`,
  };
}

function shapeRepresentationTask(round: number, target: number, prompt: string, missingPartIndex: number): AssessmentTask {
  const figure = getL4Figure(round);
  const resolvedPrompt = prompt.replace("{name}", figure.name);
  return assessmentCompareTask({
    round,
    target,
    figure,
    prompt: resolvedPrompt,
    missingPartIndex,
    correctFirst: round % 2 === 0,
    correctReason: `It has every shape needed to make the ${figure.name}.`,
    distractorReasons: ["It uses fewer shapes.", "It is the bigger picture."],
  });
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
  assessmentScanTask(31, 1),
  assessmentBuildTask(32, 2),
  assessmentBuildTask(33, 3),
  assessmentBuildTask(34, 4, true),
  assessmentStructureTask(35, 5, "views"),
  assessmentStructureTask(36, 6, "hidden"),
  shapeRepresentationTask(37, 7, "Which simple picture still looks like the {name}?", 0),
  assessmentTask(repairLabelsTask(41, 8), "Repair the grid label so references stay consistent."),
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
  assessmentScanTask(61, 1),
  assessmentBuildTask(62, 2),
  assessmentBuildTask(63, 3),
  assessmentBuildTask(64, 4, true),
  assessmentStructureTask(65, 5, "views"),
  assessmentStructureTask(66, 6, "hidden"),
  shapeRepresentationTask(67, 7, "Which simple picture still looks like the {name}?", 2),
  assessmentTask(labelGridTask(71, 8), "Complete the grid labels so every cell has a reference."),
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
    id: `y4-starpath-${shortForm}-${String(index + 1).padStart(2, "0")}-v2`,
    version: "2.0.0",
    realm: "space",
    level: 4,
    form,
    origin: "assessment_authored",
    sourcePool: form,
    bankId: `starpath-level-4-${form}-v2`,
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
