import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { LEVEL_ONE_ARTWORK } from "./shared";
import { getComposition } from "./shape-compositions";

// Level 1 · Week 5 — Make a Shape (AC9M1SP01, the "make" verb). Compose a target
// shape from congruent parts: two triangles make a square, four squares make a
// big square. Plants part-whole reasoning for fractions and symmetry later.

const EASY = ["rect-2square", "square-2rect", "rect-2rect"];
const MEDIUM = ["square-2tri", "big-square-4"];
const ALL = [...EASY, ...MEDIUM];

export function composeTask(compositionId: string, target: number): PracticeTask {
  const comp = getComposition(compositionId);
  const pieceWord = comp.pieceShape;
  return {
    kind: "starpathShapeCompose",
    prompt: `Make a ${comp.label} from ${pieceWord}s.`,
    speakText: `Put ${pieceWord}s together to make a ${comp.label}. Tap a ${pieceWord} to add each part.`,
    target,
    compositionId: comp.id,
    targetShape: comp.targetShape,
    feedback: {
      correct: `You made a ${comp.label} from ${pieceWord}s.`,
      wrong: `That piece is not a ${pieceWord}. Tap the ${pieceWord} to add a part.`,
    },
  };
}

function teaching(heading: string, prompt: string, speakText: string) {
  let target = 0;
  return () =>
    ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "builders",
      heading,
      prompt,
      speakText,
      target: ++target,
    }) satisfies PracticeTask;
}

function huntActivities(pool: string[], start: number) {
  let a = start;
  let b = start + 1;
  let c = start + 2;
  let target = 10;
  return [
    () => composeTask(pool[a++ % pool.length]!, ++target),
    () => composeTask(pool[b++ % pool.length]!, ++target),
    () => composeTask(pool[c++ % pool.length]!, ++target),
  ] as const;
}

export function createTwoMakeOneTaskSet(): RealmLessonTaskSet {
  return {
    teaching: teaching(
      "Two Make One",
      "Two shapes can join to make one bigger shape.",
      "Two shapes fit together to make a new shape. Tap the pieces to build the target."
    ),
    activities: huntActivities(EASY, 0),
  };
}

export function createBuildTheShapeTaskSet(): RealmLessonTaskSet {
  return {
    teaching: teaching(
      "Build the Shape",
      "More parts can make one shape.",
      "Some shapes are made of two triangles or four squares. Add each part to build the target shape."
    ),
    activities: huntActivities(MEDIUM, 0),
  };
}

export function createShapeMakerTaskSet(): RealmLessonTaskSet {
  return {
    teaching: teaching(
      "Shape Maker",
      "You can make shapes from lots of different parts.",
      "Make each target shape from its parts. Some take two pieces, some take four."
    ),
    activities: huntActivities(ALL, 0),
  };
}

export const TWO_MAKE_ONE_CONTENT = {
  missionBrief:
    "Geospin's shape forge builds shapes from parts. Put two shapes together to make one bigger shape.",
  successCriteria: ["choose the right piece", "add each part", "make the target shape"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Two Make One", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "make-1", title: "Two Make One", description: "Join two shapes to make one.", taskKinds: ["starpathShapeCompose"] },
    { key: "make-2", title: "Forge Round", description: "Build another shape from parts.", taskKinds: ["starpathShapeCompose"] },
    { key: "make-3", title: "Forge Master", description: "Make a shape independently.", taskKinds: ["starpathShapeCompose"] },
  ],
  reflection: {
    prompt: "How did you make the shape?",
    options: ["I put two parts together", "I chose the right piece", "The parts made one shape"],
  },
  practisedSkills: ["Compose a shape from parts", "Choose the right piece", "See part and whole"],
  nextUpLabel: "Build the Shape",
  createTaskSet: createTwoMakeOneTaskSet,
} satisfies StarpathLessonContent;

export const BUILD_THE_SHAPE_CONTENT = {
  missionBrief:
    "Bigger builds now: two triangles make a square, four squares make a big square. Add every part to complete the shape.",
  successCriteria: ["use more parts", "add each piece", "complete the shape"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Build the Shape", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "make-1", title: "Two Triangles", description: "Make a square from triangles.", taskKinds: ["starpathShapeCompose"] },
    { key: "make-2", title: "Four Squares", description: "Make a big square from squares.", taskKinds: ["starpathShapeCompose"] },
    { key: "make-3", title: "Build Master", description: "Complete a build from many parts.", taskKinds: ["starpathShapeCompose"] },
  ],
  reflection: {
    prompt: "What did you notice?",
    options: ["Two triangles can make a square", "Four squares can make a big square", "Parts join to make a whole"],
  },
  practisedSkills: ["Compose from several parts", "Use triangles and squares", "Complete a target"],
  nextUpLabel: "Shape Maker",
  createTaskSet: createBuildTheShapeTaskSet,
} satisfies StarpathLessonContent;

export const SHAPE_MAKER_CONTENT = {
  missionBrief:
    "You are a Shape Maker. Build every target shape from its parts — some take two pieces, some take four.",
  successCriteria: ["make different shapes", "use the right parts", "finish every shape"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Shape Maker", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "make-1", title: "Shape Maker", description: "Make a shape from its parts.", taskKinds: ["starpathShapeCompose"] },
    { key: "make-2", title: "Maker Round", description: "Make another target shape.", taskKinds: ["starpathShapeCompose"] },
    { key: "make-3", title: "Master Maker", description: "Make every shape confidently.", taskKinds: ["starpathShapeCompose"] },
  ],
  reflection: {
    prompt: "You are a Shape Maker! What did you learn?",
    options: ["Shapes are made of parts", "The same shape can be made different ways", "Parts join to make a whole"],
  },
  practisedSkills: ["Compose familiar shapes", "Choose correct parts", "Recognise part and whole"],
  nextUpLabel: "Week 5 Voyage Quiz",
  createTaskSet: createShapeMakerTaskSet,
} satisfies StarpathLessonContent;
