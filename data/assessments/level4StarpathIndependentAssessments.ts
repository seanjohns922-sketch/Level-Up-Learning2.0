import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { CompositeTask } from "@/data/activities/starpath/level4/composite";
import { figureSvg, getL4Figure, type CompositeFigure, type FigureShape } from "@/data/activities/starpath/level4/composite-figures";
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

const diagram = (body: string) => `<svg viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg"><rect width="220" height="180" rx="14" fill="#f8fafc"/>${body}</svg>`;
const rect = (x: number, y: number, w: number, h: number, fill: string) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${fill}" stroke="#312e81" stroke-width="3"/>`;
const circle = (x: number, y: number, r: number, fill: string) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="#312e81" stroke-width="3"/>`;
const triangle = (points: string, fill: string) => `<polygon points="${points}" fill="${fill}" stroke="#312e81" stroke-width="3" stroke-linejoin="round"/>`;
const line = (x1: number, y1: number, x2: number, y2: number) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#312e81" stroke-width="3"/>`;
const label = (x: number, y: number, value: string) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#312e81">${value}</text>`;

function evidenceTask(params: {
  target: number;
  mode: CompositeTask["mode"];
  prompt: string;
  clues: string[];
  correctSvg: string;
  incorrectSvg: string;
  correctReason: string;
  wrongReasons: [string, string];
  correctFirst: boolean;
}): AssessmentTask {
  return {
    kind: "starpathComposite",
    mode: params.mode,
    target: params.target,
    prompt: params.prompt,
    speakText: `${params.prompt} Use every clue. Choose a model, then choose why.`,
    designBrief: "Use every clue before choosing.",
    evidenceClues: params.clues,
    figureOptions: params.correctFirst
      ? [{ id: "a", svg: params.correctSvg }, { id: "b", svg: params.incorrectSvg }]
      : [{ id: "a", svg: params.incorrectSvg }, { id: "b", svg: params.correctSvg }],
    correctOptionId: params.correctFirst ? "a" : "b",
    reasonOptions: [
      { id: "evidence", label: params.correctReason },
      { id: "first", label: params.wrongReasons[0] },
      { id: "second", label: params.wrongReasons[1] },
    ],
    correctReasonId: "evidence",
    feedback: FEEDBACK,
  };
}

function equivalentDecompositionTask(form: Form, target: number): AssessmentTask {
  const correct = form === "pretest"
    ? diagram(`${rect(22, 35, 74, 96, "#a78bfa")}${line(59, 35, 59, 131)}${label(59, 153, "Build 1")}${rect(124, 35, 74, 96, "#67e8f9")}${line(124, 83, 198, 83)}${label(161, 153, "Build 2")}`)
    : diagram(`${rect(24, 42, 82, 82, "#f9a8d4")}${line(24, 83, 106, 83)}${label(65, 148, "Build 1")}${rect(130, 42, 82, 82, "#fde68a")}${line(171, 42, 171, 124)}${label(171, 148, "Build 2")}`);
  const wrong = form === "pretest"
    ? diagram(`${rect(22, 35, 74, 96, "#a78bfa")}${line(59, 35, 59, 131)}${label(59, 153, "Build 1")}${rect(124, 45, 74, 76, "#67e8f9")}${line(124, 83, 198, 83)}${label(161, 153, "Build 2")}`)
    : diagram(`${rect(24, 42, 82, 82, "#f9a8d4")}${line(24, 83, 106, 83)}${label(65, 148, "Build 1")}${rect(134, 34, 72, 98, "#fde68a")}${line(170, 34, 170, 132)}${label(170, 148, "Build 2")}`);
  return evidenceTask({
    target,
    mode: "alternate",
    prompt: "Which pair has the same outside shape?",
    clues: ["The joins may be different.", "The outside size must stay the same."],
    correctSvg: correct,
    incorrectSvg: wrong,
    correctReason: "Both outside shapes match exactly.",
    wrongReasons: ["Both builds use the same join.", "The taller build has more pieces."],
    correctFirst: form === "pretest",
  });
}

function constraintModelTask(form: Form, target: number): AssessmentTask {
  const correct = form === "pretest"
    ? diagram(`${rect(62, 72, 96, 58, "#67e8f9")}${triangle("62,72 110,28 158,72", "#fca5a5")}${circle(110, 101, 14, "#fde68a")}${rect(100, 130, 20, 30, "#a78bfa")}`)
    : diagram(`${rect(62, 66, 96, 68, "#a78bfa")}${circle(110, 42, 24, "#fde68a")}${rect(76, 134, 22, 30, "#67e8f9")}${rect(122, 134, 22, 30, "#67e8f9")}`);
  const wrong = form === "pretest"
    ? diagram(`${rect(62, 72, 96, 58, "#67e8f9")}${triangle("62,72 110,28 158,72", "#fca5a5")}${circle(110, 101, 14, "#fde68a")}${rect(138, 130, 20, 30, "#a78bfa")}`)
    : diagram(`${rect(62, 66, 96, 68, "#a78bfa")}${circle(110, 42, 24, "#fde68a")}${rect(76, 134, 22, 30, "#67e8f9")}${rect(76, 104, 22, 30, "#67e8f9")}`);
  return evidenceTask({
    target,
    mode: "model",
    prompt: "Which model follows every clue?",
    clues: form === "pretest"
      ? ["The triangle is above the large rectangle.", "The circle is inside the rectangle.", "The small rectangle is centred below."]
      : ["The circle is centred above the large rectangle.", "Two equal rectangles are below it.", "The two lower rectangles do not touch."],
    correctSvg: correct,
    incorrectSvg: wrong,
    correctReason: "Every part has the stated position.",
    wrongReasons: ["It uses the brightest colours.", "Its largest shape is a rectangle."],
    correctFirst: form === "posttest",
  });
}

function viewConsistencyTask(form: Form, target: number): AssessmentTask {
  const towers = (heights: number[]) => heights.map((height, index) => `${rect(32 + index * 52, 145 - height * 30, 38, height * 30, ["#67e8f9", "#a78bfa", "#fbbf24"][index]!)}`).join("");
  const correctHeights = form === "pretest" ? [1, 3, 2] : [2, 1, 3];
  const wrongHeights = form === "pretest" ? [1, 2, 3] : [3, 1, 2];
  return evidenceTask({
    target,
    mode: "views",
    prompt: "Which build matches all three views?",
    clues: form === "pretest"
      ? ["Front heights: 1, 3, 2.", "Side view hides the short stack.", "Top view shows 3 spaces."]
      : ["Front heights: 2, 1, 3.", "The tallest stack is on the right.", "Top view shows 3 spaces."],
    correctSvg: diagram(`${towers(correctHeights)}${label(110, 168, "MODEL")}`),
    incorrectSvg: diagram(`${towers(wrongHeights)}${label(110, 168, "MODEL")}`),
    correctReason: "Its positions and heights match every view.",
    wrongReasons: ["It has the tallest stack.", "It covers three top spaces."],
    correctFirst: form === "pretest",
  });
}

function hiddenSupportTask(form: Form, target: number): AssessmentTask {
  const stack = (x: number, baseY: number, count: number, hidden: number) => Array.from({ length: count }, (_, index) => rect(x, baseY - (index + 1) * 30, 36, 30, index < hidden ? "#cbd5e1" : "#67e8f9")).join("");
  const correct = form === "pretest"
    ? `${stack(48, 152, 3, 2)}${stack(128, 152, 2, 1)}`
    : `${stack(42, 152, 2, 1)}${stack(92, 152, 3, 2)}${stack(142, 152, 1, 0)}`;
  const wrong = form === "pretest"
    ? `${stack(48, 152, 4, 3)}${stack(128, 152, 2, 1)}`
    : `${stack(42, 152, 2, 1)}${stack(92, 152, 4, 3)}${stack(142, 152, 1, 0)}`;
  return evidenceTask({
    target,
    mode: "hidden",
    prompt: "Which build uses the fewest hidden cubes?",
    clues: ["Blue cubes must stay at their shown heights.", "Grey cubes are hidden supports.", "No cube may float."],
    correctSvg: diagram(correct),
    incorrectSvg: diagram(wrong),
    correctReason: "It supports every blue cube with no extras.",
    wrongReasons: ["It has the tallest tower.", "It uses more grey cubes."],
    correctFirst: form === "posttest",
  });
}

function approximationTask(form: Form, target: number): AssessmentTask {
  const useful = form === "pretest"
    ? diagram(`${rect(42, 82, 136, 42, "#67e8f9")}${circle(72, 132, 20, "#334155")}${circle(148, 132, 20, "#334155")}${rect(122, 52, 44, 30, "#fca5a5")}`)
    : diagram(`${triangle("40,130 110,36 180,130", "#86efac")}${rect(100, 82, 20, 48, "#a78bfa")}${circle(110, 55, 10, "#fde68a")}`);
  const weak = form === "pretest"
    ? diagram(`${rect(42, 82, 136, 42, "#67e8f9")}${circle(72, 132, 20, "#334155")}${rect(122, 52, 44, 30, "#fca5a5")}`)
    : diagram(`${triangle("40,130 110,36 180,130", "#86efac")}${circle(110, 55, 10, "#fde68a")}`);
  return evidenceTask({
    target,
    mode: "simplify",
    prompt: "Which simple icon keeps the useful information?",
    clues: form === "pretest"
      ? ["The icon is for a car park sign.", "People must recognise a car.", "Small decoration is not needed."]
      : ["The icon marks a lookout tree.", "People must see the trunk and treetop.", "Small leaves are not needed."],
    correctSvg: useful,
    incorrectSvg: weak,
    correctReason: "It keeps the parts needed to recognise it.",
    wrongReasons: ["It includes every tiny detail.", "It uses more colour."],
    correctFirst: form === "pretest",
  });
}

function transferTask(form: Form, target: number): AssessmentTask {
  const correct = form === "pretest"
    ? diagram(`${circle(110, 82, 30, "#fde68a")}${triangle("80,112 50,152 92,138", "#67e8f9")}${triangle("140,112 170,152 128,138", "#67e8f9")}${rect(96, 112, 28, 42, "#a78bfa")}`)
    : diagram(`${rect(78, 68, 64, 70, "#67e8f9")}${circle(110, 48, 20, "#fde68a")}${triangle("78,92 46,116 78,122", "#fca5a5")}${triangle("142,92 174,116 142,122", "#fca5a5")}`);
  const wrong = form === "pretest"
    ? diagram(`${circle(110, 82, 30, "#fde68a")}${triangle("80,112 50,152 92,138", "#67e8f9")}${triangle("140,112 170,152 128,138", "#67e8f9")}${rect(96, 40, 28, 42, "#a78bfa")}`)
    : diagram(`${rect(78, 68, 64, 70, "#67e8f9")}${circle(110, 48, 20, "#fde68a")}${triangle("78,92 46,116 78,122", "#fca5a5")}${triangle("142,92 174,116 142,122", "#fca5a5")}${circle(110, 108, 12, "#fde68a")}`);
  return evidenceTask({
    target,
    mode: "evaluate",
    prompt: "Which design meets every rule?",
    clues: form === "pretest"
      ? ["Use exactly 4 familiar shapes.", "Matching triangles go on opposite sides.", "The rectangle is below the circle."]
      : ["Use exactly 4 familiar shapes.", "Matching triangles go on opposite sides.", "Only one circle is used."],
    correctSvg: correct,
    incorrectSvg: wrong,
    correctReason: "It meets the number, shape and position rules.",
    wrongReasons: ["It is the most colourful design.", "Its circle is near the top."],
    correctFirst: form === "posttest",
  });
}

function completeSvg(figure: CompositeFigure) {
  return figureSvg(figure, () => true);
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
  equivalentDecompositionTask("pretest", 2),
  constraintModelTask("pretest", 3),
  viewConsistencyTask("pretest", 4),
  hiddenSupportTask("pretest", 5),
  approximationTask("pretest", 6),
  transferTask("pretest", 7),
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
  equivalentDecompositionTask("posttest", 2),
  constraintModelTask("posttest", 3),
  viewConsistencyTask("posttest", 4),
  hiddenSupportTask("posttest", 5),
  approximationTask("posttest", 6),
  transferTask("posttest", 7),
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
    id: `y4-starpath-${shortForm}-${String(index + 1).padStart(2, "0")}-v3`,
    version: "3.0.0",
    realm: "space",
    level: 4,
    form,
    origin: "assessment_authored",
    sourcePool: form,
    bankId: `starpath-level-4-${form}-v3`,
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
