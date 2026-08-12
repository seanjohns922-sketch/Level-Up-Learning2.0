import type {
  PracticeTask,
  StarpathShape,
} from "@/data/activities/year1/practice-task";
import { computeHunts, getHuntScene } from "./shape-hunt-scenes";
import {
  getWorldObject,
  worldObjectShape,
} from "./world-objects";
import { COLOURS, SHAPES, SIDES, capitalise, colourFor, rotate } from "./shared";

// Weekly quizzes use an independently authored bank. They share proven
// renderers and static artwork with lessons, but never call lesson task-set
// factories or reuse lesson-native prompts.

const CLOSE_SHAPE: Record<StarpathShape, StarpathShape> = {
  circle: "oval",
  oval: "circle",
  triangle: "rectangle",
  square: "rectangle",
  rectangle: "square",
};

const QUIZ_CLUES: Record<StarpathShape, string[]> = {
  circle: ["No straight sides", "Round all the way around", "Not stretched"],
  oval: ["No straight sides", "Round", "Stretched in one direction"],
  triangle: ["3 straight sides", "3 corners", "Not round"],
  square: ["4 straight sides", "4 corners", "Every side is equal"],
  rectangle: ["4 straight sides", "4 corners", "Two sides are longer"],
};

function shapeDisguiseQuestion(round: number, target: number): PracticeTask {
  const shape = SHAPES[(round + 2) % SHAPES.length]!;
  const close = CLOSE_SHAPE[shape];
  const other = SHAPES.find((candidate) => candidate !== shape && candidate !== close)!;
  const correctOptionId = `quiz-shape-${target}`;
  return {
    kind: "starpathShapeDisguise",
    mode: "match",
    prompt: `Which scanner tile is still a ${shape}?`,
    speakText: `Find the ${shape}. Its colour, size and direction may be different.`,
    target,
    shape,
    colour: colourFor(round + 1),
    scale: 0.72 + (round % 2) * 0.16,
    rotation: shape === "circle" ? 0 : 18 + round * 13,
    options: rotate(
      [
        {
          id: correctOptionId,
          shape,
          colour: colourFor(round + 3),
          scale: 0.82,
          rotation: shape === "circle" ? 0 : -24 - round * 7,
        },
        {
          id: `quiz-close-${target}`,
          shape: close,
          colour: colourFor(round + 4),
          scale: 0.94,
          rotation: 14,
        },
        {
          id: `quiz-other-${target}`,
          shape: other,
          colour: colourFor(round),
          scale: 0.74,
          rotation: -12,
        },
      ],
      round + 1
    ),
    correctOptionId,
    feedback: {
      correct: `Correct. It is still a ${shape}.`,
      wrong: `Compare the outlines and find the ${shape}.`,
    },
  };
}

function shapeCompareQuestion(round: number, target: number): PracticeTask {
  const shape = SHAPES[round % SHAPES.length]!;
  const sameShape = round % 2 === 0;
  return {
    kind: "starpathShapeFaceOff",
    mode: "difference",
    prompt: sameShape ? "Which feature stayed the same?" : "Which feature changed?",
    speakText: sameShape
      ? "Compare both scanner shapes. Which feature stayed the same?"
      : "Compare both scanner shapes. Which feature changed?",
    target,
    left: { shape, colour: colourFor(round), scale: 0.9, rotation: -8 },
    right: {
      shape: sameShape ? shape : CLOSE_SHAPE[shape],
      colour: sameShape ? colourFor(round + 2) : colourFor(round),
      scale: sameShape ? 0.7 : 0.9,
      rotation: sameShape ? 32 : -8,
    },
    options: sameShape
      ? [
          { id: "shape", label: "The shape" },
          { id: "colour", label: "The colour" },
          { id: "size", label: "The size" },
        ]
      : [
          { id: "shape", label: "The shape" },
          { id: "colour", label: "The colour" },
          { id: "size", label: "The size" },
        ],
    correctOptionId: "shape",
    feedback: {
      correct: sameShape ? "The outline stayed the same." : "The outline changed.",
      wrong: "Name each outline, then compare them.",
    },
  };
}

function mysteryShapeQuestion(round: number, target: number): PracticeTask {
  const answer = SHAPES[(round + 1) % SHAPES.length]!;
  const correctOptionId = `quiz-answer-${target}`;
  const optionShapes = rotate(
    [answer, ...SHAPES.filter((shape) => shape !== answer).slice(0, 3)],
    round + 2
  );
  return {
    kind: "starpathMysteryShape",
    mode: "clue-decoder",
    prompt: "Which shape matches every clue?",
    speakText: "Listen to every clue, then choose the one shape that matches them all.",
    target,
    clues: QUIZ_CLUES[answer],
    options: optionShapes.map((shape, index) => ({
      id: shape === answer ? correctOptionId : `quiz-option-${target}-${index}`,
      shape,
      label: capitalise(shape),
      colour: colourFor(round + index),
      rotation: shape === "circle" ? 0 : index * 11,
    })),
    correctOptionId,
    feedback: {
      correct: `Every clue matches a ${answer}.`,
      wrong: "Check the choice against every clue.",
    },
  };
}

function classifyQuestion(
  round: number,
  target: number,
  mode: "belongs" | "rule" | "reclassify"
): PracticeTask {
  if (mode === "belongs") {
    const shape = SHAPES[(round + 1) % SHAPES.length]!;
    const correctOptionId = SIDES[shape] === 0 ? "round" : SIDES[shape] === 3 ? "three" : "four";
    return {
      kind: "starpathShapeClassify",
      mode,
      prompt: "Sort this shape by its straight sides.",
      speakText: `Count the straight sides on the ${shape}, then choose its group.`,
      target,
      specimens: [{ id: `quiz-specimen-${target}`, shape, colour: colourFor(round), scale: 0.9 }],
      options: [
        { id: "round", label: "No straight sides" },
        { id: "three", label: "3 straight sides" },
        { id: "four", label: "4 straight sides" },
      ],
      correctOptionId,
      feedback: { correct: "That group matches the shape.", wrong: "Count each straight side once." },
    };
  }

  const roundGroup = round % 2 === 0;
  const shapes: StarpathShape[] = roundGroup
    ? ["circle", "oval"]
    : ["triangle", "square", "rectangle"];
  if (mode === "rule") {
    return {
      kind: "starpathShapeClassify",
      mode,
      prompt: "Which rule is true for every shape shown?",
      speakText: "Choose the rule that is true for every shape in the group.",
      target,
      specimens: shapes.map((shape, index) => ({
        id: `quiz-rule-${target}-${index}`,
        shape,
        colour: colourFor(round + index),
        scale: 0.86,
      })),
      options: roundGroup
        ? [
            { id: "round", label: "They are round" },
            { id: "corners", label: "They have corners" },
            { id: "equal", label: "They have equal sides" },
          ]
        : [
            { id: "corners", label: "They have corners" },
            { id: "round", label: "They are round" },
            { id: "three", label: "They all have 3 sides" },
          ],
      correctOptionId: roundGroup ? "round" : "corners",
      feedback: { correct: "The rule fits every shape.", wrong: "Test the rule on every shape." },
    };
  }

  return {
    kind: "starpathShapeClassify",
    mode,
    prompt: "Choose another sensible way to sort this set.",
    speakText: "The shapes were sorted by colour. Choose another rule about their shape features.",
    target,
    specimens: ["circle", "oval", "triangle", "square"].map((shape, index) => ({
      id: `quiz-sort-${target}-${index}`,
      shape: shape as StarpathShape,
      colour: COLOURS[index % 2]!,
      scale: 0.84,
    })),
    options: [
      { id: "round-corners", label: "Round shapes and shapes with corners" },
      { id: "sound", label: "Quiet shapes and loud shapes" },
      { id: "taste", label: "Sweet shapes and salty shapes" },
    ],
    correctOptionId: "round-corners",
    feedback: { correct: "That is a feature-based sorting rule.", wrong: "Choose a rule you can see in the shapes." },
  };
}

function shapeHuntQuestion(sceneId: string, target: number): PracticeTask {
  const scene = getHuntScene(sceneId);
  return {
    kind: "starpathShapeHunt",
    prompt: `Complete the shape count for this ${scene.label.toLowerCase()}.`,
    speakText: `Count each kind of shape in the ${scene.label.toLowerCase()}. Tap every matching piece carefully.`,
    target,
    sceneId,
    hunts: computeHunts(scene),
    feedback: { correct: "Your shape count is complete.", wrong: "That piece belongs to another shape family." },
  };
}

const OBJECT_SETS = [
  ["clock", "door", "ball", "window", "flag", "book", "hat", "present"],
  ["wheel", "tv", "pizza", "frame", "clock", "door", "flag", "window"],
  ["ball", "book", "hat", "present", "wheel", "tv", "pizza", "frame"],
];

function objectSpotterQuestion(round: number, target: number): PracticeTask {
  const ids = OBJECT_SETS[round % OBJECT_SETS.length]!;
  const huntOrder: StarpathShape[] = ["circle", "square", "rectangle", "triangle"];
  return {
    kind: "starpathObjectSpotter",
    prompt: "Find the everyday objects with each shape.",
    speakText: "Look at each everyday object. Find all the objects for one shape at a time.",
    target,
    objects: ids.map((objectId, index) => ({ id: `quiz-object-${target}-${index}`, objectId })),
    hunts: huntOrder.flatMap((shape) => {
      const count = ids.filter((id) => worldObjectShape(id) === shape).length;
      return count ? [{ shape, count }] : [];
    }),
    feedback: { correct: "You found every matching object.", wrong: "Name the object's main outline first." },
  };
}

const OBJECT_PAIRS: Array<[string, string]> = [
  ["clock", "wheel"], ["window", "frame"], ["door", "book"], ["flag", "pizza"],
  ["clock", "door"], ["present", "hat"],
];

function objectCompareQuestion(round: number, target: number): PracticeTask {
  const [left, right] = OBJECT_PAIRS[round % OBJECT_PAIRS.length]!;
  const same = worldObjectShape(left) === worldObjectShape(right);
  return {
    kind: "starpathObjectCompare",
    mode: "sameDiff",
    prompt: "Do these objects have the same main shape?",
    speakText: `Compare the ${getWorldObject(left).label} and the ${getWorldObject(right).label}. Do they have the same main shape?`,
    target,
    left,
    right,
    options: [{ id: "same", label: "Same shape" }, { id: "different", label: "Different shapes" }],
    correctOptionId: same ? "same" : "different",
    feedback: { correct: "You compared the main outlines correctly.", wrong: "Name both main shapes before comparing." },
  };
}

function objectMatchQuestion(round: number, target: number): PracticeTask {
  const pools = [["clock", "ball"], ["window", "present"], ["door", "book"], ["flag", "hat"]];
  const order = rotate(pools.flat(), round + 1);
  return {
    kind: "starpathObjectMatch",
    mode: round % 2 === 0 ? "open" : "memory",
    prompt: "Pair the objects with the same main shape.",
    speakText: "Match each everyday object to another object with the same main shape.",
    target,
    objects: order.map((objectId, index) => ({ id: `quiz-match-${target}-${index}`, objectId })),
    feedback: { correct: "Every object has a shape partner.", wrong: "Those main outlines are different." },
  };
}

type Point = { r: number; c: number };
type Diagram = { label: string; points: Point[] };
const QUIZ_DIAGRAMS: Diagram[] = [
  { label: "triangle", points: [{ r: 4, c: 1 }, { r: 0, c: 2 }, { r: 4, c: 3 }] },
  { label: "square", points: [{ r: 1, c: 1 }, { r: 1, c: 4 }, { r: 4, c: 4 }, { r: 4, c: 1 }] },
  { label: "rectangle", points: [{ r: 0, c: 1 }, { r: 0, c: 3 }, { r: 4, c: 3 }, { r: 4, c: 1 }] },
  { label: "square", points: [{ r: 0, c: 2 }, { r: 2, c: 4 }, { r: 4, c: 2 }, { r: 2, c: 0 }] },
  { label: "rectangle", points: [{ r: 1, c: 0 }, { r: 1, c: 4 }, { r: 3, c: 4 }, { r: 3, c: 0 }] },
];

function workshopQuestion(round: number, target: number, mode: "construct" | "repair" | "compare"): PracticeTask {
  const diagram = QUIZ_DIAGRAMS[round % QUIZ_DIAGRAMS.length]!;
  if (mode === "compare") {
    const second = QUIZ_DIAGRAMS[(round + 1) % QUIZ_DIAGRAMS.length]!;
    const same = diagram.label === second.label;
    return {
      kind: "starpathShapeWorkshop",
      mode,
      prompt: "Compare the completed shapes.",
      speakText: "Compare both completed shapes. Choose the statement that is true.",
      target,
      shapeLabel: diagram.label,
      points: diagram.points,
      secondShape: { label: second.label, points: second.points },
      options: [
        { id: "same", label: "They have the same shape name" },
        { id: "different", label: "They have different shape names" },
        { id: "round", label: "They are both round" },
      ],
      correctOptionId: same ? "same" : "different",
      feedback: { correct: "You compared the completed outlines.", wrong: "Count the sides and compare the outlines." },
    };
  }
  return {
    kind: "starpathShapeWorkshop",
    mode,
    prompt: mode === "construct" ? `Make a ${diagram.label}.` : `Complete the unfinished ${diagram.label}.`,
    speakText: mode === "construct"
      ? `Join the corners in order and return to the start to make a ${diagram.label}.`
      : `Find the missing side of the ${diagram.label} and join its two corners.`,
    target,
    shapeLabel: diagram.label,
    points: diagram.points,
    missingEdgeIndex: mode === "repair" ? (round + 1) % diagram.points.length : undefined,
    feedback: { correct: "The shape is complete.", wrong: "Follow the outside corners of the shape." },
  };
}

type Direction = "up" | "down" | "left" | "right";
type Cell = { r: number; c: number };

const QUIZ_ROUTE_CASES: Array<{ start: Cell; goal: Cell; preset: Direction[] }> = [
  { start: { r: 3, c: 0 }, goal: { r: 0, c: 2 }, preset: ["up"] },
  { start: { r: 0, c: 0 }, goal: { r: 2, c: 3 }, preset: ["right"] },
  { start: { r: 3, c: 3 }, goal: { r: 1, c: 0 }, preset: ["left"] },
  { start: { r: 1, c: 0 }, goal: { r: 3, c: 3 }, preset: ["down"] },
  { start: { r: 3, c: 1 }, goal: { r: 0, c: 3 }, preset: ["up"] },
];

const QUIZ_RECORDED_ROUTES: Array<{ start: Cell; route: Direction[] }> = [
  { start: { r: 3, c: 0 }, route: ["right", "up", "right", "up"] },
  { start: { r: 0, c: 0 }, route: ["down", "right", "down", "right"] },
  { start: { r: 3, c: 3 }, route: ["left", "up", "left", "up"] },
  { start: { r: 1, c: 0 }, route: ["right", "right", "down", "right"] },
  { start: { r: 3, c: 1 }, route: ["up", "right", "up", "right"] },
];

const QUIZ_MISSIONS: Array<{
  start: Cell;
  goal: Cell;
  blocked: Cell[];
  checkpoints: Array<Cell & { object: string }>;
  rule: string;
}> = [
  {
    start: { r: 3, c: 0 }, goal: { r: 0, c: 3 }, blocked: [{ r: 2, c: 0 }],
    checkpoints: [{ r: 2, c: 2, object: "crystal" }],
    rule: "Collect the crystal, avoid the asteroid and reach the flag.",
  },
  {
    start: { r: 0, c: 0 }, goal: { r: 3, c: 3 }, blocked: [{ r: 1, c: 1 }],
    checkpoints: [{ r: 1, c: 2, object: "satellite" }],
    rule: "Visit the satellite, avoid the asteroid and reach the star.",
  },
  {
    start: { r: 3, c: 3 }, goal: { r: 0, c: 0 }, blocked: [{ r: 2, c: 2 }],
    checkpoints: [{ r: 1, c: 2, object: "crystal" }],
    rule: "Collect the crystal, avoid the asteroid and reach the goal.",
  },
  {
    start: { r: 0, c: 3 }, goal: { r: 3, c: 0 }, blocked: [{ r: 1, c: 2 }],
    checkpoints: [{ r: 2, c: 2, object: "satellite" }],
    rule: "Visit the satellite, avoid the asteroid and reach the flag.",
  },
  {
    start: { r: 3, c: 1 }, goal: { r: 0, c: 2 }, blocked: [{ r: 2, c: 2 }],
    checkpoints: [{ r: 1, c: 1, object: "crystal" }],
    rule: "Collect the crystal, avoid the asteroid and reach the star.",
  },
];

function routeEndpoint(start: Cell, route: Direction[]): Cell {
  return route.reduce((cell, direction) => {
    const delta: Record<Direction, Cell> = {
      up: { r: -1, c: 0 }, down: { r: 1, c: 0 },
      left: { r: 0, c: -1 }, right: { r: 0, c: 1 },
    };
    return { r: cell.r + delta[direction].r, c: cell.c + delta[direction].c };
  }, start);
}

function quizRouteBuildQuestion(round: number, target: number, mode: "build" | "improve"): PracticeTask {
  const routeCase = QUIZ_ROUTE_CASES[round % QUIZ_ROUTE_CASES.length]!;
  const goalObject = ["flag", "star", "crystal"][round % 3]!;
  return {
    kind: "starpathRouteBuild",
    mode,
    prompt: mode === "build" ? `Give the rover directions to the ${goalObject}.` : `Finish the directions to the ${goalObject}.`,
    speakText: mode === "build"
      ? `Choose directions in order. Run them to check that the rover reaches the ${goalObject}.`
      : `Some directions are already shown. Add the moves needed to reach the ${goalObject}.`,
    target,
    cols: 4,
    rows: 4,
    object: "rover",
    start: routeCase.start,
    goal: { ...routeCase.goal, object: goalObject },
    palette: ["up", "down", "left", "right"],
    preset: mode === "improve" ? routeCase.preset : undefined,
    maxSteps: 16,
    feedback: { correct: "The directions reach the goal.", wrong: "Check each move from the starting square." },
  };
}

function quizRouteRecordQuestion(round: number, target: number): PracticeTask {
  const routeCase = QUIZ_RECORDED_ROUTES[round % QUIZ_RECORDED_ROUTES.length]!;
  const goal = routeEndpoint(routeCase.start, routeCase.route);
  return {
    kind: "starpathRouteRecord",
    prompt: "Record the shown path for another explorer.",
    speakText: "Read the numbered path from the rover. Enter the directions in the same order.",
    target,
    cols: 4,
    rows: 4,
    object: "rover",
    start: routeCase.start,
    goal: { ...goal, object: "star" },
    route: routeCase.route,
    feedback: { correct: "Your directions match the path.", wrong: "Start at step one and check the order." },
  };
}

function quizRouteMissionQuestion(round: number, target: number): PracticeTask {
  const mission = QUIZ_MISSIONS[round % QUIZ_MISSIONS.length]!;
  return {
    kind: "starpathRouteBuild",
    mode: "mission",
    prompt: "Give directions that complete the mission.",
    speakText: mission.rule,
    target,
    cols: 4,
    rows: 4,
    object: "rover",
    start: mission.start,
    goal: { ...mission.goal, object: "star" },
    palette: ["up", "down", "left", "right"],
    blocked: mission.blocked,
    checkpoints: mission.checkpoints,
    missionRule: mission.rule,
    singleAttempt: true,
    maxSteps: 16,
    feedback: { correct: "The route follows every mission rule.", wrong: "Check the checkpoint, asteroid and goal." },
  };
}

function quizRouteDebugQuestion(round: number, target: number): PracticeTask {
  const base = QUIZ_RECORDED_ROUTES[round % QUIZ_RECORDED_ROUTES.length]!;
  const wrongIndex = (round + 1) % base.route.length;
  const opposite: Record<Direction, Direction> = { up: "down", down: "up", left: "right", right: "left" };
  const steps = base.route.map((direction, index) => ({
    id: `quiz-step-${target}-${index}`,
    direction: index === wrongIndex ? opposite[direction] : direction,
  }));
  const goal = routeEndpoint(base.start, base.route);
  return {
    kind: "starpathRouteDebug",
    prompt: "Which direction breaks this route?",
    speakText: "Follow the directions from the start. Tap the one direction that sends the rover the wrong way.",
    target,
    cols: 4,
    rows: 4,
    object: "rover",
    start: base.start,
    goal: { ...goal, object: "flag" },
    steps,
    wrongStepId: `quiz-step-${target}-${wrongIndex}`,
    feedback: { correct: "You found the direction that breaks the route.", wrong: "Trace every direction from the start." },
  };
}

function five(build: (index: number, target: number) => PracticeTask, targetStart: number): PracticeTask[] {
  return Array.from({ length: 5 }, (_, index) => build(index, targetStart + index + 1));
}

export function buildLevelOneWeek1QuizBank(): PracticeTask[] {
  return [
    ...five(shapeDisguiseQuestion, 100),
    ...five(shapeCompareQuestion, 110),
    ...five(mysteryShapeQuestion, 120),
  ];
}

export function buildLevelOneWeek2QuizBank(): PracticeTask[] {
  return [
    ...five((index, target) => classifyQuestion(index, target, "belongs"), 200),
    ...five((index, target) => classifyQuestion(index, target, "rule"), 210),
    ...five((index, target) => classifyQuestion(index, target, "reclassify"), 220),
  ];
}

export function buildLevelOneWeek3QuizBank(): PracticeTask[] {
  const sceneGroups = [
    ["sailboat", "rocket", "house", "truck", "robot"],
    ["truck", "house", "robot", "castle", "train"],
    ["castle", "train", "robot", "house", "truck"],
  ];
  return sceneGroups.flatMap((group, lesson) =>
    group.map((sceneId, index) => shapeHuntQuestion(sceneId, 300 + lesson * 10 + index + 1))
  );
}

export function buildLevelOneWeek4QuizBank(): PracticeTask[] {
  return [
    ...five(objectSpotterQuestion, 400),
    ...five(objectCompareQuestion, 410),
    ...five(objectMatchQuestion, 420),
  ];
}

export function buildLevelOneWeek5QuizBank(): PracticeTask[] {
  return [
    ...five((index, target) => workshopQuestion(index, target, "construct"), 500),
    ...five((index, target) => workshopQuestion(index + 1, target, "repair"), 510),
    ...five((index, target) => workshopQuestion(index + 2, target, "compare"), 520),
  ];
}

export function buildLevelOneWeek6QuizBank(): PracticeTask[] {
  return [
    ...five((index, target) => quizRouteBuildQuestion(index + 1, target, "build"), 600),
    ...five((index, target) => quizRouteRecordQuestion(index + 2, target), 610),
    ...five((index, target) => quizRouteMissionQuestion(index + 1, target), 620),
  ];
}

export function buildLevelOneWeek7QuizBank(): PracticeTask[] {
  return [
    ...five((index, target) => quizRouteDebugQuestion(index + 1, target), 700),
    ...five((index, target) => quizRouteBuildQuestion(index + 2, target, "improve"), 710),
    ...five(
      (index, target) => index % 2 === 0
        ? quizRouteDebugQuestion(index + 2, target)
        : quizRouteBuildQuestion(index + 3, target, "improve"),
      720
    ),
  ];
}
