import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { Question } from "@/data/assessments/posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentItemDifficulty,
  type IndependentAssessmentItem,
} from "@/data/assessments/assessmentItemStandard";

type Descriptor = "AC9M1SP01" | "AC9M1SP02";
type Form = "pretest" | "posttest";
type CandidateQuestion = Question & IndependentAssessmentItem;
type StarpathAssessmentTask = Extract<PracticeTask, {
  kind:
    | "starpathShapeClassify"
    | "starpathObjectCompare"
    | "starpathShapeWorkshop"
    | "starpathObjectMatch"
    | "starpathRouteBuild"
    | "starpathRouteRecord"
    | "starpathRouteDebug";
}>;
type ResponseMode = "selected_response" | "manipulated_response";
type Misconception =
  | "shape-orientation-invariance"
  | "shape-colour-size"
  | "shape-feature-count"
  | "shape-in-object"
  | "classification-single-rule"
  | "viewpoint-left-right"
  | "route-start-order"
  | "route-destination-only";

type ItemSpec = {
  descriptor: Descriptor;
  week: number;
  lesson: number;
  skillId: string;
  skillLabel: string;
  difficulty: AssessmentItemDifficulty;
  cognitiveCategory: AssessmentCognitiveCategory;
  responseMode: ResponseMode;
  misconceptionTags: readonly Misconception[];
  misconceptionDiagnosis?: boolean;
  contextKey: string;
  structureKey: string;
  task: StarpathAssessmentTask;
};

const CORRECT_TOKEN = "__starpath_task_correct__";
const FEEDBACK = { correct: "Answer recorded.", wrong: "Answer recorded." } as const;
const SHAPES = {
  triangle: [{ r: 4, c: 1 }, { r: 0, c: 2 }, { r: 4, c: 3 }],
  square: [{ r: 1, c: 1 }, { r: 1, c: 3 }, { r: 3, c: 3 }, { r: 3, c: 1 }],
  rectangle: [{ r: 1, c: 0 }, { r: 1, c: 4 }, { r: 3, c: 4 }, { r: 3, c: 0 }],
  diamond: [{ r: 0, c: 2 }, { r: 2, c: 4 }, { r: 4, c: 2 }, { r: 2, c: 0 }],
} as const;

function selectedShape(
  prompt: string,
  specimens: Array<{ id: string; shape: "circle" | "oval" | "triangle" | "square" | "rectangle"; colour: string; scale: number }>,
  options: Array<{ id: string; label: string }>,
  correctOptionId: string,
  mode: "belongs" | "rule" | "reclassify" = "rule",
): StarpathAssessmentTask {
  return { kind: "starpathShapeClassify", mode, prompt, speakText: prompt, target: 1, specimens, options, correctOptionId, feedback: FEEDBACK };
}

function objectCompare(prompt: string, left: string, right: string, options: Array<{ id: string; label: string }>, correctOptionId: string): StarpathAssessmentTask {
  return { kind: "starpathObjectCompare", mode: "whatSame", prompt, speakText: prompt, target: 1, left, right, options, correctOptionId, feedback: FEEDBACK };
}

function workshop(mode: "construct" | "repair", label: string, points: Array<{ r: number; c: number }>, missingEdgeIndex?: number): StarpathAssessmentTask {
  const prompt = mode === "construct" ? `Make the ${label}.` : `Complete the ${label}.`;
  return { kind: "starpathShapeWorkshop", mode, prompt, speakText: prompt, target: 1, shapeLabel: label, points, missingEdgeIndex, feedback: FEEDBACK };
}

function objectMatch(prompt: string, objects: Array<{ id: string; objectId: string }>): StarpathAssessmentTask {
  return { kind: "starpathObjectMatch", mode: "open", prompt, speakText: prompt, target: 1, objects, feedback: FEEDBACK };
}

type Direction = "up" | "down" | "left" | "right";
type Cell = { r: number; c: number };

function endpoint(start: Cell, route: Direction[]): Cell {
  const delta: Record<Direction, Cell> = {
    up: { r: -1, c: 0 }, down: { r: 1, c: 0 }, left: { r: 0, c: -1 }, right: { r: 0, c: 1 },
  };
  return route.reduce((cell, direction) => ({ r: cell.r + delta[direction].r, c: cell.c + delta[direction].c }), start);
}

function routeBuild(prompt: string, start: Cell, goal: Cell, extras: Partial<Extract<PracticeTask, { kind: "starpathRouteBuild" }>> = {}): StarpathAssessmentTask {
  return {
    kind: "starpathRouteBuild", mode: extras.mode ?? "build", prompt, speakText: prompt, target: 1,
    cols: 4, rows: 4, object: "rover", start, goal: { ...goal, object: "star" },
    palette: ["up", "down", "left", "right"], maxSteps: 14, feedback: FEEDBACK, ...extras,
  };
}

function routeRecord(prompt: string, start: Cell, route: Direction[]): StarpathAssessmentTask {
  return {
    kind: "starpathRouteRecord", prompt, speakText: prompt, target: 1, cols: 4, rows: 4,
    object: "rover", start, goal: { ...endpoint(start, route), object: "flag" }, route, feedback: FEEDBACK,
  };
}

function routeDebug(prompt: string, start: Cell, correctRoute: Direction[], wrongIndex: number, id: string): StarpathAssessmentTask {
  const opposite: Record<Direction, Direction> = { up: "down", down: "up", left: "right", right: "left" };
  return {
    kind: "starpathRouteDebug", prompt, speakText: prompt, target: 1, cols: 4, rows: 4,
    object: "rover", start, goal: { ...endpoint(start, correctRoute), object: "flag" },
    steps: correctRoute.map((direction, index) => ({ id: `${id}-${index}`, direction: index === wrongIndex ? opposite[direction] : direction })),
    wrongStepId: `${id}-${wrongIndex}`, feedback: FEEDBACK,
  };
}

function candidate(form: Form, index: number, spec: ItemSpec): CandidateQuestion {
  const formLabel = form === "pretest" ? "pre" : "post";
  return {
    schemaVersion: 1,
    id: `y1-starpath-${formLabel}-${String(index + 1).padStart(2, "0")}-rc1`,
    version: "1.0.0-rc1",
    realm: "space",
    level: 1,
    form,
    origin: "assessment_authored",
    sourcePool: form,
    bankId: `starpath-level-1-${form}-rc1`,
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
    skillId: spec.skillId,
    skillLabel: spec.skillLabel,
    linkedWeeks: [spec.week],
    linkedLessons: [spec.lesson],
    strand: "Space",
    curriculumCodes: [spec.descriptor],
    difficultyBand: "level-1-starpath",
    visual: { type: "starpath_level1_assessment", taskKind: spec.task.kind },
    practiceTask: spec.task,
  };
}

const PRETEST_SPECS: readonly ItemSpec[] = [
  { descriptor: "AC9M1SP01", week: 1, lesson: 1, skillId: "compare_shape_features", skillLabel: "Compare Shape Features", difficulty: "easy", cognitiveCategory: "recall", responseMode: "selected_response", misconceptionTags: ["shape-feature-count"], contextKey: "pre-triangle-three-sides", structureKey: "select-feature-from-one-shape", task: selectedShape("Which statement is true?", [{ id: "t", shape: "triangle", colour: "#22d3ee", scale: 1 }], [{ id: "three", label: "It has 3 straight sides." }, { id: "four", label: "It has 4 straight sides." }, { id: "round", label: "It is round." }], "three") },
  { descriptor: "AC9M1SP01", week: 1, lesson: 2, skillId: "recognise_turned_shapes", skillLabel: "Recognise Turned Shapes", difficulty: "easy", cognitiveCategory: "recall", responseMode: "selected_response", misconceptionTags: ["shape-orientation-invariance"], contextKey: "pre-turned-square", structureKey: "identify-shape-after-turn", task: selectedShape("Which name matches this shape?", [{ id: "s", shape: "square", colour: "#f472b6", scale: 1 }], [{ id: "square", label: "Square" }, { id: "triangle", label: "Triangle" }, { id: "circle", label: "Circle" }], "square") },
  { descriptor: "AC9M1SP01", week: 2, lesson: 1, skillId: "classify_shapes", skillLabel: "Classify Shapes", difficulty: "easy", cognitiveCategory: "recall", responseMode: "selected_response", misconceptionTags: ["classification-single-rule"], contextKey: "pre-round-pair", structureKey: "name-shared-feature", task: selectedShape("Why do these belong together?", [{ id: "c", shape: "circle", colour: "#fde047", scale: 1 }, { id: "o", shape: "oval", colour: "#67e8f9", scale: 1 }], [{ id: "round", label: "Both are round." }, { id: "colour", label: "Both are the same colour." }, { id: "corners", label: "Both have corners." }], "round") },
  { descriptor: "AC9M1SP01", week: 4, lesson: 1, skillId: "compare_objects", skillLabel: "Compare Everyday Objects", difficulty: "easy", cognitiveCategory: "recall", responseMode: "selected_response", misconceptionTags: ["shape-in-object"], contextKey: "pre-clock-ball", structureKey: "compare-object-outline", task: objectCompare("What is the same about these objects?", "clock", "ball", [{ id: "round", label: "Both are round." }, { id: "corners", label: "Both have 4 corners." }, { id: "triangle", label: "Both are triangles." }], "round") },
  { descriptor: "AC9M1SP01", week: 2, lesson: 2, skillId: "classify_by_sides", skillLabel: "Classify by Sides", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "selected_response", misconceptionTags: ["shape-colour-size"], contextKey: "pre-different-colour-four-sides", structureKey: "ignore-colour-use-sides", task: selectedShape("Which shape belongs with the square?", [{ id: "s", shape: "square", colour: "#22d3ee", scale: 0.9 }], [{ id: "rect", label: "The rectangle with 4 straight sides" }, { id: "circle", label: "The circle with no sides" }, { id: "tri", label: "The triangle with 3 sides" }], "rect", "belongs") },
  { descriptor: "AC9M1SP01", week: 3, lesson: 1, skillId: "find_shapes_in_objects", skillLabel: "Find Shapes in Objects", difficulty: "moderate", cognitiveCategory: "understanding", responseMode: "selected_response", misconceptionTags: ["shape-in-object"], contextKey: "pre-window-door", structureKey: "compare-object-parts", task: objectCompare("What shape can you find in both objects?", "window", "door", [{ id: "rectangle", label: "Rectangle" }, { id: "circle", label: "Circle" }, { id: "triangle", label: "Triangle" }], "rectangle") },
  { descriptor: "AC9M1SP01", week: 5, lesson: 1, skillId: "construct_shapes", skillLabel: "Construct Familiar Shapes", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "manipulated_response", misconceptionTags: ["shape-feature-count"], contextKey: "pre-build-triangle", structureKey: "construct-three-sided-shape", task: workshop("construct", "triangle", [...SHAPES.triangle]) },
  { descriptor: "AC9M1SP01", week: 5, lesson: 2, skillId: "repair_shapes", skillLabel: "Repair Familiar Shapes", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "manipulated_response", misconceptionTags: ["shape-feature-count"], contextKey: "pre-repair-square", structureKey: "repair-one-missing-edge", task: workshop("repair", "square", [...SHAPES.square], 2) },
  { descriptor: "AC9M1SP01", week: 4, lesson: 3, skillId: "match_objects_by_shape", skillLabel: "Match Objects by Shape", difficulty: "moderate", cognitiveCategory: "understanding", responseMode: "manipulated_response", misconceptionTags: ["shape-in-object"], contextKey: "pre-object-pairs-a", structureKey: "pair-four-objects-by-outline", task: objectMatch("Match objects with the same outline.", [{ id: "clock", objectId: "clock" }, { id: "ball", objectId: "ball" }, { id: "door", objectId: "door" }, { id: "book", objectId: "book" }]) },
  { descriptor: "AC9M1SP01", week: 5, lesson: 1, skillId: "construct_shapes", skillLabel: "Construct Familiar Shapes", difficulty: "moderate", cognitiveCategory: "application", responseMode: "manipulated_response", misconceptionTags: ["shape-orientation-invariance"], contextKey: "pre-build-diamond-square", structureKey: "construct-turned-four-sided-shape", task: workshop("construct", "turned square", [...SHAPES.diamond]) },
  { descriptor: "AC9M1SP01", week: 5, lesson: 2, skillId: "repair_shapes", skillLabel: "Repair Familiar Shapes", difficulty: "moderate", cognitiveCategory: "application", responseMode: "manipulated_response", misconceptionTags: ["shape-feature-count"], contextKey: "pre-repair-rectangle", structureKey: "repair-wide-four-sided-shape", task: workshop("repair", "rectangle", [...SHAPES.rectangle], 0) },
  { descriptor: "AC9M1SP01", week: 4, lesson: 3, skillId: "match_objects_by_shape", skillLabel: "Match Objects by Shape", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "manipulated_response", misconceptionTags: ["shape-colour-size", "shape-in-object"], misconceptionDiagnosis: true, contextKey: "pre-object-pairs-b", structureKey: "pair-objects-ignore-size", task: objectMatch("Match each object to another with the same shape.", [{ id: "clock", objectId: "clock" }, { id: "wheel", objectId: "wheel" }, { id: "book", objectId: "book" }, { id: "tv", objectId: "tv" }]) },
  { descriptor: "AC9M1SP02", week: 6, lesson: 1, skillId: "follow_directions", skillLabel: "Follow Ordered Directions", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "manipulated_response", misconceptionTags: ["route-start-order"], contextKey: "pre-record-up-right", structureKey: "record-three-step-route", task: routeRecord("Record the shown path in order.", { r: 3, c: 0 }, ["up", "right", "right"]) },
  { descriptor: "AC9M1SP02", week: 6, lesson: 1, skillId: "follow_directions", skillLabel: "Follow Ordered Directions", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "manipulated_response", misconceptionTags: ["viewpoint-left-right"], contextKey: "pre-record-left-up", structureKey: "record-route-with-left", task: routeRecord("Record this path for the rover.", { r: 3, c: 3 }, ["left", "left", "up"]) },
  { descriptor: "AC9M1SP02", week: 6, lesson: 2, skillId: "give_directions", skillLabel: "Give Ordered Directions", difficulty: "easy", cognitiveCategory: "application", responseMode: "manipulated_response", misconceptionTags: ["route-destination-only"], contextKey: "pre-build-short-route", structureKey: "author-route-to-near-goal", task: routeBuild("Give directions to the star.", { r: 3, c: 0 }, { r: 1, c: 2 }) },
  { descriptor: "AC9M1SP02", week: 6, lesson: 2, skillId: "give_directions", skillLabel: "Give Ordered Directions", difficulty: "moderate", cognitiveCategory: "application", responseMode: "manipulated_response", misconceptionTags: ["route-start-order"], contextKey: "pre-finish-preset", structureKey: "complete-started-route", task: routeBuild("Finish the directions to the star.", { r: 0, c: 0 }, { r: 2, c: 3 }, { mode: "improve", preset: ["right"] }) },
  { descriptor: "AC9M1SP02", week: 7, lesson: 2, skillId: "repair_routes", skillLabel: "Repair a Route", difficulty: "moderate", cognitiveCategory: "application", responseMode: "selected_response", misconceptionTags: ["route-start-order"], misconceptionDiagnosis: true, contextKey: "pre-debug-order", structureKey: "find-one-reversed-step", task: routeDebug("Tap the direction that breaks the route.", { r: 3, c: 0 }, ["up", "up", "right", "right"], 1, "pre-debug-a") },
  { descriptor: "AC9M1SP02", week: 7, lesson: 3, skillId: "test_routes", skillLabel: "Test a Route", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionTags: ["route-destination-only"], misconceptionDiagnosis: true, contextKey: "pre-debug-destination", structureKey: "diagnose-route-missing-goal", task: routeDebug("Which direction stops the rover reaching the flag?", { r: 0, c: 0 }, ["down", "right", "down", "right"], 2, "pre-debug-b") },
  { descriptor: "AC9M1SP02", week: 6, lesson: 3, skillId: "give_directions", skillLabel: "Give Ordered Directions", difficulty: "moderate", cognitiveCategory: "application", responseMode: "manipulated_response", misconceptionTags: ["viewpoint-left-right"], contextKey: "pre-build-left-route", structureKey: "author-route-starting-left", task: routeBuild("Give directions from the rover to the star.", { r: 3, c: 3 }, { r: 0, c: 1 }) },
  { descriptor: "AC9M1SP02", week: 7, lesson: 2, skillId: "repair_routes", skillLabel: "Repair a Route", difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "manipulated_response", misconceptionTags: ["route-start-order", "route-destination-only"], misconceptionDiagnosis: true, contextKey: "pre-complete-two-moves", structureKey: "repair-started-route-two-dimensions", task: routeBuild("Add the missing directions and reach the star.", { r: 3, c: 0 }, { r: 0, c: 3 }, { mode: "improve", preset: ["up", "right"] }) },
];

const POSTTEST_TASKS: readonly StarpathAssessmentTask[] = [
  selectedShape("Choose the true statement about this triangle.", [{ id: "t", shape: "triangle", colour: "#f97316", scale: 0.8 }], [{ id: "three", label: "It has 3 straight sides." }, { id: "four", label: "It has 4 straight sides." }, { id: "round", label: "It is round." }], "three"),
  selectedShape("What is the name of this four-sided shape?", [{ id: "s", shape: "square", colour: "#a78bfa", scale: 0.75 }], [{ id: "triangle", label: "Triangle" }, { id: "circle", label: "Circle" }, { id: "square", label: "Square" }], "square"),
  selectedShape("What feature do these shapes share?", [{ id: "o", shape: "oval", colour: "#f472b6", scale: 0.85 }, { id: "c", shape: "circle", colour: "#34d399", scale: 0.7 }], [{ id: "corners", label: "They have corners." }, { id: "round", label: "They are round." }, { id: "colour", label: "They are the same colour." }], "round"),
  objectCompare("How are the wheel and clock alike?", "wheel", "clock", [{ id: "four", label: "Both have 4 corners." }, { id: "round", label: "Both are round." }, { id: "triangle", label: "Both are triangles." }], "round"),
  selectedShape("Which shape joins this four-sided group?", [{ id: "s", shape: "square", colour: "#fde047", scale: 0.8 }], [{ id: "rect", label: "A blue rectangle" }, { id: "circle", label: "A yellow circle" }, { id: "tri", label: "A green triangle" }], "rect", "belongs"),
  objectCompare("Which main shape appears in both objects?", "book", "tv", [{ id: "circle", label: "Circle" }, { id: "rectangle", label: "Rectangle" }, { id: "triangle", label: "Triangle" }], "rectangle"),
  { ...workshop("construct", "triangle", [{ r: 4, c: 0 }, { r: 1, c: 2 }, { r: 4, c: 4 }]), prompt: "Build a three-sided shape." },
  { ...workshop("repair", "square", [{ r: 0, c: 0 }, { r: 0, c: 4 }, { r: 4, c: 4 }, { r: 4, c: 0 }], 1), prompt: "Add the missing side to finish the square." },
  objectMatch("Pair every object with a shape partner.", [{ id: "wheel", objectId: "wheel" }, { id: "clock", objectId: "clock" }, { id: "present", objectId: "present" }, { id: "frame", objectId: "frame" }]),
  { ...workshop("construct", "turned square", [{ r: 0, c: 2 }, { r: 2, c: 3 }, { r: 4, c: 2 }, { r: 2, c: 1 }]), prompt: "Build a square standing on one corner." },
  { ...workshop("repair", "rectangle", [{ r: 0, c: 0 }, { r: 0, c: 3 }, { r: 4, c: 3 }, { r: 4, c: 0 }], 3), prompt: "Finish the wide four-sided shape." },
  objectMatch("Match each object by its main outline.", [{ id: "ball", objectId: "ball" }, { id: "wheel", objectId: "wheel" }, { id: "door", objectId: "door" }, { id: "tv", objectId: "tv" }]),
  routeRecord("Send these directions in the shown order.", { r: 0, c: 0 }, ["down", "right", "right", "down"]),
  routeRecord("Record the path from the rover to the flag.", { r: 0, c: 3 }, ["left", "down", "left", "down"]),
  routeBuild("Create a route from the rover to the star.", { r: 3, c: 3 }, { r: 1, c: 0 }),
  routeBuild("Complete the started route to the star.", { r: 3, c: 1 }, { r: 0, c: 3 }, { mode: "improve", preset: ["up", "right"] }),
  routeDebug("Find the direction that breaks this route.", { r: 0, c: 3 }, ["down", "down", "left", "left"], 0, "post-debug-a"),
  routeDebug("Which move prevents the rover reaching the flag?", { r: 3, c: 3 }, ["left", "up", "left", "up"], 3, "post-debug-b"),
  routeBuild("Repair the route and reach the star.", { r: 0, c: 0 }, { r: 3, c: 3 }, { mode: "improve", preset: ["down", "right"] }),
  routeBuild("Visit the crystal, avoid the asteroid and reach the star.", { r: 3, c: 0 }, { r: 0, c: 3 }, { mode: "mission", blocked: [{ r: 2, c: 0 }], checkpoints: [{ r: 2, c: 2, object: "crystal" }], missionRule: "Visit the crystal, avoid the asteroid and reach the star.", singleAttempt: true }),
];

const POSTTEST_SPECS: readonly ItemSpec[] = PRETEST_SPECS.map((spec, index) => ({
  ...spec,
  contextKey: spec.contextKey.replace("pre-", "post-"),
  structureKey: `${spec.structureKey}-post`,
  difficulty: (["easy", "easy", "easy", "easy", "easy", "easy", "easy", "moderate", "moderate", "moderate", "moderate", "moderate", "moderate", "moderate", "moderate", "challenging", "challenging", "challenging", "challenging", "challenging"] as AssessmentItemDifficulty[])[index]!,
  cognitiveCategory: (["recall", "recall", "understanding", "understanding", "understanding", "understanding", "understanding", "understanding", "application", "application", "application", "reasoning", "application", "application", "application", "application", "reasoning", "reasoning", "reasoning", "transfer"] as AssessmentCognitiveCategory[])[index]!,
  task: POSTTEST_TASKS[index]!,
}));

export const LEVEL1_STARPATH_INDEPENDENT_PRETEST_ITEMS = PRETEST_SPECS.map((spec, index) => candidate("pretest", index, spec));
export const LEVEL1_STARPATH_INDEPENDENT_POSTTEST_ITEMS = POSTTEST_SPECS.map((spec, index) => candidate("posttest", index, spec));
