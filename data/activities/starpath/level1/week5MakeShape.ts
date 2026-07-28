import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { LEVEL_ONE_ARTWORK } from "./shared";

type Point = { r: number; c: number };
type Diagram = { label: string; points: Point[] };

// Level 1 · Week 5 — Shape Workshop (AC9M1SP01). Students now make familiar
// shapes deliberately by joining points, repair incomplete shapes, then compare
// completed constructions. This is distinct from the earlier tap-and-find work.

const DIAGRAMS = {
  triangleWide: {
    label: "triangle",
    points: [{ r: 4, c: 0 }, { r: 0, c: 2 }, { r: 4, c: 4 }],
  },
  triangleSmall: {
    label: "triangle",
    points: [{ r: 3, c: 1 }, { r: 0, c: 2 }, { r: 3, c: 3 }],
  },
  squareLarge: {
    label: "square",
    points: [{ r: 0, c: 0 }, { r: 0, c: 4 }, { r: 4, c: 4 }, { r: 4, c: 0 }],
  },
  squareSmall: {
    label: "square",
    points: [{ r: 1, c: 1 }, { r: 1, c: 3 }, { r: 3, c: 3 }, { r: 3, c: 1 }],
  },
  squareTurned: {
    label: "square",
    points: [{ r: 0, c: 2 }, { r: 2, c: 4 }, { r: 4, c: 2 }, { r: 2, c: 0 }],
  },
  rectangleWide: {
    label: "rectangle",
    points: [{ r: 1, c: 0 }, { r: 1, c: 4 }, { r: 3, c: 4 }, { r: 3, c: 0 }],
  },
  rectangleTall: {
    label: "rectangle",
    points: [{ r: 0, c: 1 }, { r: 0, c: 3 }, { r: 4, c: 3 }, { r: 4, c: 1 }],
  },
} satisfies Record<string, Diagram>;

const CONSTRUCT_POOL = [
  DIAGRAMS.triangleWide,
  DIAGRAMS.squareLarge,
  DIAGRAMS.rectangleWide,
  DIAGRAMS.squareTurned,
  DIAGRAMS.rectangleTall,
  DIAGRAMS.triangleSmall,
];

const REPAIR_POOL = [
  DIAGRAMS.squareLarge,
  DIAGRAMS.triangleWide,
  DIAGRAMS.rectangleWide,
  DIAGRAMS.squareTurned,
  DIAGRAMS.rectangleTall,
  DIAGRAMS.triangleSmall,
];

const COMPARISONS = [
  {
    left: DIAGRAMS.triangleWide,
    right: DIAGRAMS.squareLarge,
    options: [
      { id: "same", label: "They are the same shape" },
      { id: "sides", label: "One has 3 sides and one has 4 sides" },
      { id: "both-square", label: "They are both squares" },
    ],
    correctOptionId: "sides",
  },
  {
    left: DIAGRAMS.squareLarge,
    right: DIAGRAMS.squareSmall,
    options: [
      { id: "same", label: "They are the same shape" },
      { id: "different", label: "They are different shapes" },
      { id: "triangle", label: "One is a triangle" },
    ],
    correctOptionId: "same",
  },
  {
    left: DIAGRAMS.squareLarge,
    right: DIAGRAMS.rectangleWide,
    options: [
      { id: "same", label: "They are the same shape" },
      { id: "four", label: "They both have 4 sides" },
      { id: "three", label: "They both have 3 sides" },
    ],
    correctOptionId: "four",
  },
  {
    left: DIAGRAMS.rectangleWide,
    right: DIAGRAMS.rectangleTall,
    options: [
      { id: "same", label: "They are both rectangles" },
      { id: "square", label: "One is a square" },
      { id: "triangle", label: "One is a triangle" },
    ],
    correctOptionId: "same",
  },
  {
    left: DIAGRAMS.squareLarge,
    right: DIAGRAMS.squareTurned,
    options: [
      { id: "same", label: "They are both squares" },
      { id: "changed", label: "Turning made a new shape" },
      { id: "rectangle", label: "One is a rectangle" },
    ],
    correctOptionId: "same",
  },
  {
    left: DIAGRAMS.triangleWide,
    right: DIAGRAMS.triangleSmall,
    options: [
      { id: "same", label: "They are both triangles" },
      { id: "changed", label: "Size made a new shape" },
      { id: "square", label: "One is a square" },
    ],
    correctOptionId: "same",
  },
];

export function constructTask(index: number, target: number): PracticeTask {
  const diagram = CONSTRUCT_POOL[index % CONSTRUCT_POOL.length]!;
  return {
    kind: "starpathShapeWorkshop",
    mode: "construct",
    prompt: `Connect the stars to make a ${diagram.label}.`,
    speakText: `Start at the glowing star. Join the corners in order and return to the start to make a ${diagram.label}.`,
    target,
    shapeLabel: diagram.label,
    points: diagram.points,
    feedback: {
      correct: `You constructed a ${diagram.label}.`,
      wrong: `Try the next corner around the ${diagram.label}.`,
    },
  };
}

export function repairTask(index: number, target: number): PracticeTask {
  const diagram = REPAIR_POOL[index % REPAIR_POOL.length]!;
  const missingEdgeIndex = index % diagram.points.length;
  return {
    kind: "starpathShapeWorkshop",
    mode: "repair",
    prompt: `Repair the ${diagram.label}. Which corners need joining?`,
    speakText: `One side of this ${diagram.label} is missing. Tap the two corners that need to be joined.`,
    target,
    shapeLabel: diagram.label,
    points: diagram.points,
    missingEdgeIndex,
    feedback: {
      correct: `You repaired the ${diagram.label}.`,
      wrong: `Those corners already have a side. Find the dashed missing side.`,
    },
  };
}

export function workshopCompareTask(index: number, target: number): PracticeTask {
  const comparison = COMPARISONS[index % COMPARISONS.length]!;
  return {
    kind: "starpathShapeWorkshop",
    mode: "compare",
    prompt: "Compare the two shapes. Which statement is true?",
    speakText: "Look closely at both constructed shapes. Choose the statement that is true.",
    target,
    shapeLabel: comparison.left.label,
    points: comparison.left.points,
    secondShape: {
      label: comparison.right.label,
      points: comparison.right.points,
    },
    options: comparison.options,
    correctOptionId: comparison.correctOptionId,
    feedback: {
      correct: "You compared the shapes carefully.",
      wrong: "Count the sides and check whether size or turning changed the shape.",
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

function rotatingActivities(
  task: (index: number, target: number) => PracticeTask,
  targetStart: number
) {
  let a = 0;
  let b = 1;
  let c = 2;
  let target = targetStart;
  return [
    () => task(a += 3, ++target),
    () => task(b += 3, ++target),
    () => task(c += 3, ++target),
  ] as const;
}

export function createConnectTheStarsTaskSet(): RealmLessonTaskSet {
  return {
    teaching: teaching(
      "Connect the Stars",
      "A shape can be made by joining its corners.",
      "Start at one corner, join each corner in order, then return to the start. The joined lines make a familiar shape."
    ),
    activities: rotatingActivities(constructTask, 10),
  };
}

export function createShapeRepairTaskSet(): RealmLessonTaskSet {
  return {
    teaching: teaching(
      "Shape Repair Crew",
      "An unfinished shape needs its missing side.",
      "Look for the gap in the shape. Join the two corners beside the gap to repair the missing side."
    ),
    activities: rotatingActivities(repairTask, 20),
  };
}

export function createBuildAndCompareTaskSet(): RealmLessonTaskSet {
  return {
    teaching: teaching(
      "Build and Compare",
      "Constructed shapes can be compared by what is the same and different.",
      "Look at the sides and overall shape. A shape stays the same when it is made larger, smaller or turned."
    ),
    activities: rotatingActivities(workshopCompareTask, 30),
  };
}

export const CONNECT_THE_STARS_CONTENT = {
  missionBrief:
    "Enter Geospin's constellation workshop. Join glowing stars in order to construct triangles, squares and rectangles.",
  successCriteria: ["start at a corner", "join corners in order", "close the shape"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Connect the Stars", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "construct-1", title: "Triangle Trails", description: "Join stars to construct triangles.", taskKinds: ["starpathShapeWorkshop"] },
    { key: "construct-2", title: "Four-Side Flight", description: "Construct squares and rectangles.", taskKinds: ["starpathShapeWorkshop"] },
    { key: "construct-3", title: "Constellation Builder", description: "Construct familiar shapes independently.", taskKinds: ["starpathShapeWorkshop"] },
  ],
  reflection: {
    prompt: "What helped you construct each shape?",
    options: ["I joined every corner", "I followed the sides around", "I returned to the start"],
  },
  practisedSkills: ["Construct familiar shapes", "Join corners in sequence", "Close a shape"],
  nextUpLabel: "Shape Repair Crew",
  createTaskSet: createConnectTheStarsTaskSet,
} satisfies StarpathLessonContent;

export const SHAPE_REPAIR_CONTENT = {
  missionBrief:
    "A meteor shower damaged the constellation shapes. Find each missing side and reconnect the correct corners.",
  successCriteria: ["find the gap", "choose the correct corners", "repair the shape"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Shape Repair Crew", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "repair-1", title: "Find the Gap", description: "Find where a side is missing.", taskKinds: ["starpathShapeWorkshop"] },
    { key: "repair-2", title: "Reconnect", description: "Join the correct corners.", taskKinds: ["starpathShapeWorkshop"] },
    { key: "repair-3", title: "Repair Crew", description: "Repair different familiar shapes.", taskKinds: ["starpathShapeWorkshop"] },
  ],
  reflection: {
    prompt: "How did you repair the shapes?",
    options: ["I found the gap", "I checked the corners", "I added the missing side"],
  },
  practisedSkills: ["Recognise incomplete shapes", "Identify a missing side", "Repair a construction"],
  nextUpLabel: "Build and Compare",
  createTaskSet: createShapeRepairTaskSet,
} satisfies StarpathLessonContent;

export const BUILD_AND_COMPARE_CONTENT = {
  missionBrief:
    "Inspect pairs from the constellation workshop. Compare their sides and decide what stayed the same or changed.",
  successCriteria: ["compare two shapes", "notice sides", "ignore size and turning"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Build and Compare", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "compare-build-1", title: "Side Scanner", description: "Compare shapes by their sides.", taskKinds: ["starpathShapeWorkshop"] },
    { key: "compare-build-2", title: "Size Check", description: "Recognise a shape at different sizes.", taskKinds: ["starpathShapeWorkshop"] },
    { key: "compare-build-3", title: "Turn Check", description: "Recognise a shape after it turns.", taskKinds: ["starpathShapeWorkshop"] },
  ],
  reflection: {
    prompt: "What did you check when comparing shapes?",
    options: ["I checked the sides", "I ignored colour and size", "I checked the whole shape"],
  },
  practisedSkills: ["Compare constructed shapes", "Identify similarities", "Identify differences"],
  nextUpLabel: "Week 5 Voyage Quiz",
  createTaskSet: createBuildAndCompareTaskSet,
} satisfies StarpathLessonContent;
