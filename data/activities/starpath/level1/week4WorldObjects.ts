import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask, StarpathShape } from "@/data/activities/year1/practice-task";
import { LEVEL_ONE_ARTWORK, capitalise, rotate } from "./shared";
import { getWorldObject, worldObjectShape } from "./world-objects";

// Level 1 · Week 4 — Shapes in the World. Recognise familiar shapes in everyday
// objects and reason about similarities and differences (AC9M1SP01, environment
// half). Three distinct mechanics: spot → compare → match.

const HUNT_ORDER: StarpathShape[] = ["square", "rectangle", "triangle", "circle"];
const SHAPE_WORD: Record<StarpathShape, string> = {
  circle: "circle",
  oval: "oval",
  triangle: "triangle",
  square: "square",
  rectangle: "rectangle",
};

// ── L1 · Shape Spotter — tap every object of the named shape ──────────────────
const SPOTTER_SETS: string[][] = [
  ["clock", "ball", "wheel", "window", "present", "door", "book", "flag", "hat"],
  ["wheel", "clock", "frame", "window", "tv", "book", "pizza", "flag", "ball"],
  ["ball", "wheel", "present", "frame", "door", "tv", "hat", "pizza", "clock"],
];

function computeSpotterHunts(objectIds: string[]): Array<{ shape: StarpathShape; count: number }> {
  return HUNT_ORDER.flatMap((shape) => {
    const count = objectIds.filter((id) => worldObjectShape(id) === shape).length;
    return count > 0 ? [{ shape, count }] : [];
  });
}

export function spotterTask(round: number, target: number): PracticeTask {
  const objectIds = SPOTTER_SETS[round % SPOTTER_SETS.length]!;
  return {
    kind: "starpathObjectSpotter",
    prompt: "Tap the objects that are each shape.",
    speakText: "These are everyday objects. Tap all the objects of one shape, then the next shape.",
    target,
    objects: objectIds.map((objectId, index) => ({ id: `obj-${target}-${index}`, objectId })),
    hunts: computeSpotterHunts(objectIds),
    feedback: {
      correct: "You spotted every object of that shape.",
      wrong: "That object is a different shape. Look for the shape you are spotting.",
    },
  };
}

// ── L2 · Same or Different — compare two objects by shape ─────────────────────
const SAME_PAIRS: Array<[string, string]> = [
  ["clock", "ball"],
  ["window", "present"],
  ["door", "book"],
  ["flag", "hat"],
  ["wheel", "clock"],
  ["door", "tv"],
];
const DIFF_PAIRS: Array<[string, string]> = [
  ["clock", "door"],
  ["window", "flag"],
  ["ball", "tv"],
  ["present", "pizza"],
  ["book", "wheel"],
  ["hat", "frame"],
];

export function compareTask(round: number, target: number, mode: "sameDiff" | "whatSame"): PracticeTask {
  if (mode === "whatSame") {
    const [left, right] = SAME_PAIRS[round % SAME_PAIRS.length]!;
    const shared = worldObjectShape(left);
    const distractors = HUNT_ORDER.filter((s) => s !== shared).slice(0, 3);
    const optionShapes = rotate([shared, ...distractors], round);
    return {
      kind: "starpathObjectCompare",
      mode,
      prompt: `A ${getWorldObject(left).label} and a ${getWorldObject(right).label} are the same shape. What shape?`,
      speakText: `A ${getWorldObject(left).label} and a ${getWorldObject(right).label} are the same shape. Which shape are they both?`,
      target,
      left,
      right,
      options: optionShapes.map((shape) => ({ id: shape, label: capitalise(SHAPE_WORD[shape]) })),
      correctOptionId: shared,
      feedback: {
        correct: `Yes — a ${getWorldObject(left).label} and a ${getWorldObject(right).label} are both ${SHAPE_WORD[shared]}s.`,
        wrong: `Look at both objects. They are both ${SHAPE_WORD[shared]}s.`,
      },
    };
  }
  const same = round % 2 === 0;
  const [left, right] = same
    ? SAME_PAIRS[round % SAME_PAIRS.length]!
    : DIFF_PAIRS[round % DIFF_PAIRS.length]!;
  const leftShape = worldObjectShape(left);
  const rightShape = worldObjectShape(right);
  return {
    kind: "starpathObjectCompare",
    mode,
    prompt: "Are these the same shape or different?",
    speakText: `Look at the ${getWorldObject(left).label} and the ${getWorldObject(right).label}. Are they the same shape or different?`,
    target,
    left,
    right,
    options: [
      { id: "same", label: "Same shape" },
      { id: "different", label: "Different shape" },
    ],
    correctOptionId: leftShape === rightShape ? "same" : "different",
    feedback: {
      correct:
        leftShape === rightShape
          ? `Correct — both are ${SHAPE_WORD[leftShape]}s.`
          : `Correct — a ${getWorldObject(left).label} is a ${SHAPE_WORD[leftShape]} and a ${getWorldObject(right).label} is a ${SHAPE_WORD[rightShape]}.`,
      wrong: "Name each object's shape, then compare them.",
    },
  };
}

// ── L3 · Shape Match — pair objects that share a shape ───────────────────────
const CIRCLES = ["clock", "ball", "wheel"];
const SQUARES = ["window", "present", "frame"];
const RECTS = ["door", "book", "tv"];
const TRIS = ["flag", "hat", "pizza"];

export function matchTask(round: number, target: number): PracticeTask {
  const pick = (pool: string[]) => [pool[round % pool.length]!, pool[(round + 1) % pool.length]!];
  const [c1, c2] = pick(CIRCLES);
  const [s1, s2] = pick(SQUARES);
  const [r1, r2] = pick(RECTS);
  const [t1, t2] = pick(TRIS);
  // Interleave so paired shapes are not adjacent.
  const order = [c1, s1, r1, t1, c2, s2, r2, t2];
  return {
    kind: "starpathObjectMatch",
    prompt: "Match the objects that are the same shape.",
    speakText: "Tap two objects that are the same shape to pair them. Clear the whole board.",
    target,
    objects: order.map((objectId, index) => ({ id: `m-${target}-${index}`, objectId })),
    feedback: {
      correct: "Every object matched with its shape partner.",
      wrong: "Those two are different shapes. Try another pair.",
    },
  };
}

function teaching(heading: string, prompt: string, speakText: string) {
  let target = 0;
  return () =>
    ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "levelOneShapes",
      heading,
      prompt,
      speakText,
      target: ++target,
    }) satisfies PracticeTask;
}

export function createShapeSpotterTaskSet(): RealmLessonTaskSet {
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Shapes Around Us",
      "Everyday things are made of familiar shapes.",
      "A clock is a circle, a door is a rectangle, a window is a square. Spot the shapes in the objects around us."
    ),
    activities: [
      () => spotterTask(a++, ++target),
      () => spotterTask(b++ + 1, ++target),
      () => spotterTask(c++ + 2, ++target),
    ],
  };
}

export function createSameOrDifferentTaskSet(): RealmLessonTaskSet {
  let target = 20;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Same or Different?",
      "Two objects can be the same shape or different.",
      "Compare two objects. Are they the same shape, or different? Say what is the same and what is different."
    ),
    activities: [
      () => compareTask(a++, ++target, "sameDiff"),
      () => compareTask(b++ + 1, ++target, "whatSame"),
      () => compareTask(c++ + 2, ++target, "sameDiff"),
    ],
  };
}

export function createShapeMatchTaskSet(): RealmLessonTaskSet {
  let target = 30;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Shape Match",
      "Objects that share a shape make a pair.",
      "Some objects are the same shape even though they are different things. Pair up the objects that share a shape."
    ),
    activities: [
      () => matchTask(a++, ++target),
      () => matchTask(b++ + 2, ++target),
      () => matchTask(c++ + 4, ++target),
    ],
  };
}

export const SHAPE_SPOTTER_CONTENT = {
  missionBrief:
    "Geospin's scanner spots shapes in everyday things. Tap every object that is a circle, then a square, then a rectangle, then a triangle.",
  successCriteria: ["find the shape in an object", "spot every object of a shape", "know each object's shape"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Shapes Around Us", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "spot-1", title: "Shape Spotter", description: "Tap every object of each shape.", taskKinds: ["starpathObjectSpotter"] },
    { key: "spot-2", title: "Spotter Round", description: "Spot the shapes in new objects.", taskKinds: ["starpathObjectSpotter"] },
    { key: "spot-3", title: "Spotter Master", description: "Spot every shape independently.", taskKinds: ["starpathObjectSpotter"] },
  ],
  reflection: {
    prompt: "How did you spot the shapes?",
    options: ["I looked at each object's shape", "I found every object of one shape", "I knew a clock is a circle"],
  },
  practisedSkills: ["Recognise shapes in objects", "Spot objects by shape", "Connect objects to shapes"],
  nextUpLabel: "Same or Different?",
  createTaskSet: createShapeSpotterTaskSet,
} satisfies StarpathLessonContent;

export const SAME_OR_DIFFERENT_WORLD_CONTENT = {
  missionBrief:
    "Compare everyday objects. Decide if two objects are the same shape or different, and say what makes them alike.",
  successCriteria: ["name each object's shape", "compare two objects", "say what is the same or different"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Same or Different?", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "compare-1", title: "Same or Different", description: "Compare two objects by shape.", taskKinds: ["starpathObjectCompare"] },
    { key: "compare-2", title: "What Is Shared", description: "Name the shape two objects share.", taskKinds: ["starpathObjectCompare"] },
    { key: "compare-3", title: "Compare Master", description: "Compare trickier objects.", taskKinds: ["starpathObjectCompare"] },
  ],
  reflection: {
    prompt: "How did you compare the objects?",
    options: ["I named each object's shape", "I checked if the shapes matched", "I said what was the same or different"],
  },
  practisedSkills: ["Compare objects by shape", "Identify similarities", "Identify differences"],
  nextUpLabel: "Shape Match",
  createTaskSet: createSameOrDifferentTaskSet,
} satisfies StarpathLessonContent;

export const SHAPE_MATCH_CONTENT = {
  missionBrief:
    "Different things can share a shape. Pair up every object on the board with another object of the same shape.",
  successCriteria: ["find objects that share a shape", "make a pair", "clear the whole board"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Shape Match", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "match-1", title: "Shape Match", description: "Pair objects that share a shape.", taskKinds: ["starpathObjectMatch"] },
    { key: "match-2", title: "Match Round", description: "Clear a new board of objects.", taskKinds: ["starpathObjectMatch"] },
    { key: "match-3", title: "Match Master", description: "Pair every object independently.", taskKinds: ["starpathObjectMatch"] },
  ],
  reflection: {
    prompt: "How did you make pairs?",
    options: ["I found objects with the same shape", "Different things can share a shape", "I cleared the whole board"],
  },
  practisedSkills: ["Match objects by shape", "Recognise shared shapes", "Reason about similarities"],
  nextUpLabel: "Week 4 Voyage Quiz",
  createTaskSet: createShapeMatchTaskSet,
} satisfies StarpathLessonContent;
