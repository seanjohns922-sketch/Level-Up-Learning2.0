import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { Question } from "@/data/assessments/posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentItemDifficulty,
  type IndependentAssessmentItem,
} from "@/data/assessments/assessmentItemStandard";

type Descriptor = "AC9M2SP01" | "AC9M2SP02";
type Form = "pretest" | "posttest";
type CandidateQuestion = Question & IndependentAssessmentItem;
type StarpathAssessmentTask = Extract<PracticeTask, {
  kind: "starpathShapeFeature" | "starpathShapeWorkshop" | "starpathMapLocate" | "starpathMapRoute";
}>;
type ResponseMode = "selected_response" | "manipulated_response";
type Misconception =
  | "shape-orientation-invariance"
  | "shape-feature-count"
  | "classification-single-rule"
  | "straight-curved-boundary"
  | "parallel-opposite-confusion"
  | "viewpoint-left-right"
  | "route-start-order"
  | "route-destination-only"
  | "map-symbol-representation"
  | "map-viewpoint"
  | "map-relative-location";
type Direction = "up" | "down" | "left" | "right";
type Cell = { r: number; c: number };

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

const MAP_A = [
  { id: "crystal-caves", label: "Crystal Caves", object: "crystal", r: 0, c: 0 },
  { id: "planet-plaza", label: "Planet Plaza", object: "planet", r: 0, c: 4 },
  { id: "constellation-crossing", label: "Constellation Crossing", object: "star", r: 1, c: 2 },
  { id: "nebula-station", label: "Nebula Station", object: "satellite", r: 1, c: 5 },
  { id: "moon-maze", label: "Moon Maze", object: "moon", r: 3, c: 4 },
  { id: "rocket-base", label: "Rocket Base", object: "rocket", r: 2, c: 6 },
] as const;

const MAP_B = [
  { id: "rocket-base", label: "Rocket Base", object: "rocket", r: 0, c: 1 },
  { id: "flag-point", label: "Flag Point", object: "flag", r: 0, c: 4 },
  { id: "moon-maze", label: "Moon Maze", object: "moon", r: 1, c: 1 },
  { id: "planet-plaza", label: "Planet Plaza", object: "planet", r: 2, c: 0 },
  { id: "asteroid-pass", label: "Asteroid Pass", object: "cave", r: 2, c: 6 },
  { id: "constellation-crossing", label: "Constellation Crossing", object: "star", r: 3, c: 4 },
] as const;

const SHAPES = {
  triangle: [{ r: 4, c: 1 }, { r: 0, c: 2 }, { r: 4, c: 3 }],
  rectangle: [{ r: 1, c: 0 }, { r: 1, c: 4 }, { r: 3, c: 4 }, { r: 3, c: 0 }],
  trapezoid: [{ r: 1, c: 1 }, { r: 1, c: 3 }, { r: 4, c: 4 }, { r: 4, c: 0 }],
  pentagon: [{ r: 0, c: 2 }, { r: 2, c: 4 }, { r: 4, c: 3 }, { r: 4, c: 1 }, { r: 2, c: 0 }],
  hexagon: [{ r: 0, c: 1 }, { r: 0, c: 3 }, { r: 2, c: 4 }, { r: 4, c: 3 }, { r: 4, c: 1 }, { r: 2, c: 0 }],
} as const;

function feature(
  prompt: string,
  mode: "edge" | "sides" | "parallel" | "compare",
  shapes: Array<{ id: string; colour?: string }>,
  options: Array<{ id: string; label: string; shapeId?: string }>,
  correctOptionId: string,
): StarpathAssessmentTask {
  return { kind: "starpathShapeFeature", mode, prompt, speakText: prompt, target: 1, shapes, options, correctOptionId, feedback: FEEDBACK };
}

function workshop(
  prompt: string,
  mode: "construct" | "repair",
  shapeLabel: string,
  points: Array<{ r: number; c: number }>,
  missingEdgeIndex?: number,
): StarpathAssessmentTask {
  return { kind: "starpathShapeWorkshop", mode, prompt, speakText: prompt, target: 1, shapeLabel, points, missingEdgeIndex, feedback: FEEDBACK };
}

function locate(
  prompt: string,
  mapId: string,
  landmarks: typeof MAP_A | typeof MAP_B,
  correctLandmarkId: string,
): StarpathAssessmentTask {
  return {
    kind: "starpathMapLocate", mode: "find", prompt, speakText: prompt, target: 1,
    mapId, cols: 8, rows: 4, landmarks: [...landmarks], correctLandmarkId, feedback: FEEDBACK,
  };
}

function endpoint(start: Cell, directions: Direction[]): Cell {
  const delta: Record<Direction, Cell> = {
    up: { r: -1, c: 0 }, down: { r: 1, c: 0 }, left: { r: 0, c: -1 }, right: { r: 0, c: 1 },
  };
  return directions.reduce((cell, direction) => ({ r: cell.r + delta[direction].r, c: cell.c + delta[direction].c }), start);
}

function follow(prompt: string, mapId: string, landmarks: typeof MAP_A | typeof MAP_B, start: Cell, directions: Direction[]): StarpathAssessmentTask {
  const goal = endpoint(start, directions);
  return {
    kind: "starpathMapRoute", mode: "follow", prompt, speakText: prompt, target: 1,
    mapId, cols: 8, rows: 4, landmarks: [...landmarks], object: "rover", start,
    goal: { ...goal, object: "flag", label: "Flag Point" },
    steps: directions.map((direction) => ({ direction, instruction: `Move ${direction}.`, speakText: `Move ${direction}.` })),
    feedback: FEEDBACK,
  };
}

function give(prompt: string, mapId: string, landmarks: typeof MAP_A | typeof MAP_B, start: Cell, goal: Cell, label: string, object: string, maxSteps = 12): StarpathAssessmentTask {
  return {
    kind: "starpathMapRoute", mode: "give", prompt, speakText: prompt, target: 1,
    mapId, cols: 8, rows: 4, landmarks: [...landmarks], object: "rover", start,
    goal: { ...goal, object, label }, palette: ["up", "down", "left", "right"], maxSteps, feedback: FEEDBACK,
  };
}

function mission(
  prompt: string,
  mapId: string,
  landmarks: typeof MAP_A | typeof MAP_B,
  start: Cell,
  goal: Cell,
  blocked: Cell[],
  checkpoint: Cell & { object: string; label: string },
): StarpathAssessmentTask {
  return {
    kind: "starpathMapRoute", mode: "mission", prompt, speakText: prompt, target: 1,
    mapId, cols: 8, rows: 4, landmarks: [...landmarks], object: "rover", start,
    goal: { ...goal, object: "flag", label: "Flag Point" }, palette: ["up", "down", "left", "right"],
    maxSteps: 14, blocked, checkpoints: [checkpoint], missionRule: prompt, singleAttempt: true, feedback: FEEDBACK,
  };
}

function debug(prompt: string, mapId: string, landmarks: typeof MAP_A | typeof MAP_B, start: Cell, correctDirections: Direction[], wrongIndex: number, key: string): StarpathAssessmentTask {
  const opposite: Record<Direction, Direction> = { up: "down", down: "up", left: "right", right: "left" };
  return {
    kind: "starpathMapRoute", mode: "debug", prompt, speakText: prompt, target: 1,
    mapId, cols: 8, rows: 4, landmarks: [...landmarks], object: "rover", start,
    goal: { ...endpoint(start, correctDirections), object: "flag", label: "Flag Point" },
    debugSteps: correctDirections.map((direction, index) => ({
      id: `${key}-${index}`,
      direction: index === wrongIndex ? opposite[direction] : direction,
    })),
    wrongStepId: `${key}-${wrongIndex}`, feedback: FEEDBACK,
  };
}

function candidate(form: Form, index: number, spec: ItemSpec): CandidateQuestion {
  const formLabel = form === "pretest" ? "pre" : "post";
  return {
    schemaVersion: 1,
    id: `y2-starpath-${formLabel}-${String(index + 1).padStart(2, "0")}-v1`,
    version: "1.0.0",
    realm: "space",
    level: 2,
    form,
    origin: "assessment_authored",
    sourcePool: form,
    bankId: `starpath-level-2-${form}-v1`,
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
    difficultyBand: "level-2-starpath",
    visual: { type: "starpath_level2_assessment", taskKind: spec.task.kind },
    practiceTask: spec.task,
  };
}

const PRETEST_TASKS: readonly StarpathAssessmentTask[] = [
  feature("Which shape has only curved edges?", "edge", [], [{ id: "oval", label: "Oval", shapeId: "oval" }, { id: "triangle", label: "Triangle", shapeId: "triangle" }, { id: "rectangle", label: "Rectangle", shapeId: "rectangle" }], "oval"),
  feature("How many sides does this pentagon have?", "sides", [{ id: "pentagon" }], [{ id: "n4", label: "4 sides" }, { id: "n5", label: "5 sides" }, { id: "n6", label: "6 sides" }], "n5"),
  feature("Which shape has a pair of parallel sides?", "parallel", [], [{ id: "trapezoid", label: "Trapezoid", shapeId: "trapezoid" }, { id: "triangle", label: "Triangle", shapeId: "triangle" }, { id: "pentagon", label: "Pentagon", shapeId: "pentagon" }], "trapezoid"),
  feature("What is the same about these shapes?", "compare", [{ id: "square" }, { id: "rectangle" }], [{ id: "four", label: "Both have 4 straight sides." }, { id: "round", label: "Both are round." }, { id: "three", label: "Both have 3 sides." }], "four"),
  feature("Which statement describes this oval?", "edge", [{ id: "oval" }], [{ id: "curved", label: "Its boundary is curved." }, { id: "four", label: "It has 4 straight sides." }, { id: "parallel", label: "It has parallel sides." }], "curved"),
  feature("What is different about these shapes?", "compare", [{ id: "triangle" }, { id: "hexagon" }], [{ id: "count", label: "They have different numbers of sides." }, { id: "curve", label: "Only one has curved edges." }, { id: "none", label: "They have the same features." }], "count"),
  workshop("Make a triangle with 3 straight sides.", "construct", "triangle", [...SHAPES.triangle]),
  workshop("Join the missing side of this rectangle.", "repair", "rectangle", [...SHAPES.rectangle], 2),
  workshop("Make a closed shape with 5 straight sides.", "construct", "pentagon", [...SHAPES.pentagon]),
  workshop("Make a four-sided shape with parallel top and bottom sides.", "construct", "trapezoid", [...SHAPES.trapezoid]),
  locate("Tap Planet Plaza on this map.", "assessment-pre-map-a", MAP_A, "planet-plaza"),
  locate("Find Moon Maze on this map.", "assessment-pre-map-b", MAP_B, "moon-maze"),
  locate("Tap the landmark at the top right of the map.", "assessment-pre-map-c", MAP_B, "flag-point"),
  follow("Follow the directions to Flag Point.", "assessment-pre-route-a", MAP_A, { r: 3, c: 0 }, ["up", "right", "right", "up"]),
  follow("Move the rover along the shown pathway.", "assessment-pre-route-b", MAP_B, { r: 3, c: 7 }, ["left", "left", "up", "left"]),
  give("Give a pathway to Planet Plaza.", "assessment-pre-route-c", MAP_A, { r: 3, c: 0 }, { r: 0, c: 4 }, "Planet Plaza", "planet"),
  give("Create directions from Moon Maze to Flag Point.", "assessment-pre-route-d", MAP_B, { r: 1, c: 1 }, { r: 0, c: 4 }, "Flag Point", "flag"),
  mission("Visit the crystal, avoid the blocked square, then reach Flag Point.", "assessment-pre-mission-a", MAP_A, { r: 3, c: 0 }, { r: 0, c: 4 }, [{ r: 2, c: 2 }], { r: 1, c: 2, object: "crystal", label: "Crystal" }),
  debug("Tap the step that sends the rover away from the flag.", "assessment-pre-debug-a", MAP_B, { r: 3, c: 0 }, ["right", "right", "up", "right"], 2, "pre-debug"),
  mission("Reach the flag after visiting the moon and avoiding both hazards.", "assessment-pre-mission-b", MAP_B, { r: 3, c: 7 }, { r: 0, c: 4 }, [{ r: 2, c: 6 }, { r: 1, c: 6 }], { r: 1, c: 4, object: "moon", label: "Moon" }),
];

const POSTTEST_TASKS: readonly StarpathAssessmentTask[] = [
  feature("Which shape has straight sides and no curved edge?", "edge", [], [{ id: "hexagon", label: "Hexagon", shapeId: "hexagon" }, { id: "circle", label: "Circle", shapeId: "circle" }, { id: "oval", label: "Oval", shapeId: "oval" }], "hexagon"),
  feature("How many straight sides are on this hexagon?", "sides", [{ id: "hexagon" }], [{ id: "n5", label: "5 sides" }, { id: "n6", label: "6 sides" }, { id: "n7", label: "7 sides" }], "n6"),
  feature("Which shape has no parallel sides?", "parallel", [], [{ id: "triangle", label: "Triangle", shapeId: "triangle" }, { id: "rectangle", label: "Rectangle", shapeId: "rectangle" }, { id: "trapezoid", label: "Trapezoid", shapeId: "trapezoid" }], "triangle"),
  feature("What is the same about this pair?", "compare", [{ id: "rectangle" }, { id: "hexagon" }], [{ id: "parallel", label: "Both have parallel sides." }, { id: "round", label: "Both are curved." }, { id: "five", label: "Both have 5 sides." }], "parallel"),
  feature("Which description is true for the circle?", "edge", [{ id: "circle" }], [{ id: "curve", label: "It has one curved boundary." }, { id: "side", label: "It has one straight side." }, { id: "corner", label: "It has one corner." }], "curve"),
  feature("What is different about this pair?", "compare", [{ id: "oval" }, { id: "rectangle" }], [{ id: "boundary", label: "One is curved and one has straight sides." }, { id: "same", label: "Both have 4 straight sides." }, { id: "parallel", label: "Neither has parallel sides." }], "boundary"),
  workshop("Construct a shape with 3 straight sides.", "construct", "three-sided shape", [...SHAPES.triangle]),
  workshop("Repair this four-sided shape.", "repair", "four-sided shape", [...SHAPES.trapezoid], 1),
  workshop("Construct a closed six-sided shape.", "construct", "six-sided shape", [...SHAPES.hexagon]),
  workshop("Construct a quadrilateral with two pairs of parallel sides.", "construct", "parallel-sided quadrilateral", [...SHAPES.rectangle]),
  locate("Tap Crystal Caves on the unfamiliar map.", "assessment-post-map-a", MAP_A, "crystal-caves"),
  locate("Find Constellation Crossing on this map.", "assessment-post-map-b", MAP_B, "constellation-crossing"),
  locate("Tap the landmark directly above Moon Maze.", "assessment-post-map-c", MAP_B, "rocket-base"),
  follow("Carry out the ordered pathway to the flag.", "assessment-post-route-a", MAP_A, { r: 3, c: 7 }, ["left", "left", "up", "left", "up"]),
  follow("Follow every move from the marked start.", "assessment-post-route-b", MAP_B, { r: 3, c: 0 }, ["right", "right", "right", "up"]),
  give("Record a pathway from Rocket Base to Moon Maze.", "assessment-post-route-c", MAP_A, { r: 2, c: 6 }, { r: 3, c: 4 }, "Moon Maze", "moon"),
  give("Plan directions from Planet Plaza to Constellation Crossing.", "assessment-post-route-d", MAP_B, { r: 2, c: 0 }, { r: 3, c: 4 }, "Constellation Crossing", "star"),
  mission("Visit the satellite, avoid the hazard, and finish at the flag.", "assessment-post-mission-a", MAP_A, { r: 3, c: 0 }, { r: 0, c: 4 }, [{ r: 2, c: 3 }], { r: 1, c: 5, object: "satellite", label: "Satellite" }),
  debug("Find the move that breaks this pathway.", "assessment-post-debug-a", MAP_B, { r: 3, c: 7 }, ["left", "left", "left", "up", "up"], 3, "post-debug"),
  mission("Design a pathway that visits the star, avoids the hazards, and reaches the flag.", "assessment-post-mission-b", MAP_A, { r: 3, c: 0 }, { r: 0, c: 7 }, [{ r: 2, c: 2 }, { r: 1, c: 3 }], { r: 1, c: 5, object: "star", label: "Star" }),
];

const PRE_DIFFICULTY: AssessmentItemDifficulty[] = ["easy", "easy", "easy", "easy", "moderate", "moderate", "easy", "moderate", "challenging", "challenging", "easy", "easy", "moderate", "easy", "moderate", "moderate", "moderate", "moderate", "challenging", "moderate"];
const PRE_COGNITIVE: AssessmentCognitiveCategory[] = ["recall", "recall", "recall", "understanding", "understanding", "understanding", "application", "application", "reasoning", "application", "understanding", "understanding", "understanding", "application", "application", "application", "application", "reasoning", "reasoning", "reasoning"];
const POST_DIFFICULTY: AssessmentItemDifficulty[] = ["easy", "easy", "moderate", "easy", "moderate", "moderate", "moderate", "moderate", "challenging", "challenging", "easy", "easy", "moderate", "easy", "moderate", "moderate", "moderate", "challenging", "challenging", "challenging"];
const POST_COGNITIVE: AssessmentCognitiveCategory[] = ["recall", "recall", "understanding", "understanding", "understanding", "application", "application", "application", "reasoning", "reasoning", "understanding", "understanding", "application", "application", "application", "application", "reasoning", "reasoning", "reasoning", "transfer"];

function specs(form: Form, tasks: readonly StarpathAssessmentTask[]): ItemSpec[] {
  const difficulty = form === "pretest" ? PRE_DIFFICULTY : POST_DIFFICULTY;
  const cognitive = form === "pretest" ? PRE_COGNITIVE : POST_COGNITIVE;
  return tasks.map((task, index) => {
    const shape = index < 10;
    const shapeWeeks = [1, 2, 3, 4, 1, 4, 2, 3, 2, 3];
    const mapWeeks = [5, 5, 6, 7, 7, 7, 7, 7, 7, 8];
    const shapeTags: Misconception[][] = [
      ["straight-curved-boundary"], ["shape-feature-count"], ["parallel-opposite-confusion"],
      ["classification-single-rule"], ["straight-curved-boundary"], ["shape-feature-count"],
      ["shape-feature-count"], ["shape-feature-count"], ["shape-feature-count"], ["parallel-opposite-confusion"],
    ];
    const mapTags: Misconception[][] = [
      ["map-symbol-representation"], ["map-symbol-representation"], ["map-relative-location"],
      ["route-start-order"], ["route-start-order"], ["route-destination-only"], ["route-start-order"],
      ["route-destination-only"], ["route-start-order"], ["route-destination-only", "map-relative-location"],
    ];
    const offset = shape ? index : index - 10;
    const week = shape ? shapeWeeks[offset]! : mapWeeks[offset]!;
    return {
      descriptor: shape ? "AC9M2SP01" : "AC9M2SP02",
      week,
      lesson: (offset % 3) + 1,
      skillId: shape ? `space_l2_shape_${offset + 1}` : `space_l2_map_${offset + 1}`,
      skillLabel: shape ? "Shape Feature Reasoning" : "Map and Pathway Reasoning",
      difficulty: difficulty[index]!,
      cognitiveCategory: cognitive[index]!,
      responseMode: index < 6 ? "selected_response" : "manipulated_response",
      misconceptionTags: shape ? shapeTags[offset]! : mapTags[offset]!,
      misconceptionDiagnosis: [2, 4, 5, 8, 12, 18].includes(index),
      contextKey: `${form}-${shape ? "shape" : "map"}-${index + 1}`,
      structureKey: `${form}-${task.kind}-${index + 1}`,
      task,
    };
  });
}

export const LEVEL2_STARPATH_INDEPENDENT_PRETEST_ITEMS = specs("pretest", PRETEST_TASKS).map((spec, index) => candidate("pretest", index, spec));
export const LEVEL2_STARPATH_INDEPENDENT_POSTTEST_ITEMS = specs("posttest", POSTTEST_TASKS).map((spec, index) => candidate("posttest", index, spec));
