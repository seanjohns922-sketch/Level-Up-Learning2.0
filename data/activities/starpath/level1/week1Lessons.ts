import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type {
  PracticeTask,
  StarpathShape,
} from "@/data/activities/year1/practice-task";

const LEVEL_ONE_ARTWORK = "/images/starpath-home-bg-y1.png";
const LEVEL_ONE_SHAPES: StarpathShape[] = [
  "circle",
  "oval",
  "triangle",
  "square",
  "rectangle",
];
const LEVEL_ONE_COLOURS = [
  "#67e8f9",
  "#c4b5fd",
  "#fde047",
  "#86efac",
  "#f9a8d4",
] as const;

function rotated<T>(items: readonly T[], by: number): T[] {
  const shift = ((by % items.length) + items.length) % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}

function shapeTwinTask(round: number, target: number): PracticeTask {
  const shape = LEVEL_ONE_SHAPES[round % LEVEL_ONE_SHAPES.length]!;
  const closeDistractor: StarpathShape =
    shape === "circle"
      ? "oval"
      : shape === "oval"
        ? "circle"
        : shape === "square"
          ? "rectangle"
          : shape === "rectangle"
            ? "square"
            : "oval";
  const other = LEVEL_ONE_SHAPES.find(
    (candidate) => candidate !== shape && candidate !== closeDistractor
  )!;
  const options = rotated(
    [
      {
        id: `correct-${target}`,
        shape,
        colour: LEVEL_ONE_COLOURS[(round + 2) % LEVEL_ONE_COLOURS.length]!,
        scale: 0.7 + (round % 3) * 0.12,
        rotation: shape === "circle" ? 0 : 18 + (round % 3) * 17,
      },
      {
        id: `close-${target}`,
        shape: closeDistractor,
        colour: LEVEL_ONE_COLOURS[(round + 3) % LEVEL_ONE_COLOURS.length]!,
        scale: 0.92,
        rotation: -12,
      },
      {
        id: `other-${target}`,
        shape: other,
        colour: LEVEL_ONE_COLOURS[(round + 4) % LEVEL_ONE_COLOURS.length]!,
        scale: 0.84,
        rotation: 22,
      },
    ],
    round
  );

  return {
    kind: "starpathShapeMatch",
    prompt: `Find the matching ${shape}.`,
    speakText: `Find the shape that is also a ${shape}. It may be turned, a different size or a different colour.`,
    target,
    targetShape: shape,
    options,
    correctOptionId: `correct-${target}`,
    feedback: {
      correct: `Correct. It is still a ${shape}, even when its colour, size or direction changes.`,
      wrong: `Look at the whole outline. Find the shape that is still a ${shape}.`,
    },
  };
}

function compareLevelOneShapesTask(round: number, target: number): PracticeTask {
  const comparisons: Array<{
    left: StarpathShape;
    right: StarpathShape;
    answer: "same" | "different";
  }> = [
    { left: "circle", right: "oval", answer: "different" },
    { left: "square", right: "rectangle", answer: "different" },
    { left: "oval", right: "oval", answer: "same" },
    { left: "triangle", right: "triangle", answer: "same" },
    { left: "rectangle", right: "rectangle", answer: "same" },
  ];
  const comparison = comparisons[round % comparisons.length]!;

  return {
    kind: "starpathShapeCompare",
    prompt: "Are these the same shape?",
    speakText:
      "Compare the outlines carefully. Remember that colour, size and turning do not change a shape.",
    target,
    left: {
      shape: comparison.left,
      colour: LEVEL_ONE_COLOURS[round % LEVEL_ONE_COLOURS.length]!,
      scale: 0.82,
      rotation: round % 2 === 0 ? -14 : 0,
    },
    right: {
      shape: comparison.right,
      colour: LEVEL_ONE_COLOURS[(round + 2) % LEVEL_ONE_COLOURS.length]!,
      scale: 0.66 + (round % 3) * 0.12,
      rotation: comparison.right === "circle" ? 0 : 24 + (round % 2) * 20,
    },
    answer: comparison.answer,
    feedback: {
      correct:
        comparison.answer === "same"
          ? `Yes. They are both ${comparison.left}s, even though they look different.`
          : `Correct. A ${comparison.left} and a ${comparison.right} are different shapes.`,
      wrong:
        comparison.answer === "same"
          ? `They are both ${comparison.left}s. Turning, colour and size do not change the shape.`
          : `Look closely at the outlines. One is a ${comparison.left} and one is a ${comparison.right}.`,
    },
  };
}

function levelOneWhatChangedTask(round: number, target: number): PracticeTask {
  const change = (["colour", "size", "shape"] as const)[round % 3]!;
  const shape = LEVEL_ONE_SHAPES[round % LEVEL_ONE_SHAPES.length]!;
  const changedShape =
    shape === "circle"
      ? "oval"
      : shape === "oval"
        ? "circle"
        : shape === "square"
          ? "rectangle"
          : shape === "rectangle"
            ? "square"
            : "oval";
  const colour = LEVEL_ONE_COLOURS[round % LEVEL_ONE_COLOURS.length]!;

  return {
    kind: "starpathWhatChanged",
    prompt: "What changed?",
    speakText:
      "Compare the two shapes. Did the colour change, did the size change, or is it a different shape?",
    target,
    before: { shape, colour, scale: 0.9 },
    after:
      change === "colour"
        ? {
            shape,
            colour: LEVEL_ONE_COLOURS[(round + 2) % LEVEL_ONE_COLOURS.length]!,
            scale: 0.9,
          }
        : change === "size"
          ? { shape, colour, scale: 0.58 }
          : { shape: changedShape, colour, scale: 0.9 },
    answer: change,
    feedback: {
      correct:
        change === "shape"
          ? `Correct. The ${shape} changed into a ${changedShape}.`
          : `Correct. Only the ${change} changed, so it is still a ${shape}.`,
      wrong: `Compare the outlines, colours and sizes one more time.`,
    },
  };
}

function levelOneOddShapeTask(round: number, target: number): PracticeTask {
  const pairs: Array<[StarpathShape, StarpathShape]> = [
    ["circle", "oval"],
    ["square", "rectangle"],
    ["oval", "triangle"],
    ["rectangle", "circle"],
  ];
  const [commonShape, oddShape] = pairs[round % pairs.length]!;
  const options = rotated(
    [
      ...Array.from({ length: 3 }, (_, index) => ({
        id: `same-${target}-${index}`,
        shape: commonShape,
        colour: LEVEL_ONE_COLOURS[(round + index) % LEVEL_ONE_COLOURS.length]!,
      })),
      {
        id: `odd-${target}`,
        shape: oddShape,
        colour: LEVEL_ONE_COLOURS[(round + 3) % LEVEL_ONE_COLOURS.length]!,
      },
    ],
    round
  );

  return {
    kind: "starpathOddOneOut",
    prompt: "Which shape does not belong?",
    speakText:
      "Three shapes have the same outline. Find the one shape with a different outline.",
    target,
    options,
    oddOptionId: `odd-${target}`,
    feedback: {
      correct: `Correct. The ${oddShape} is different from the ${commonShape}s.`,
      wrong: `Look closely. Three are ${commonShape}s and one is a ${oddShape}.`,
    },
  };
}

function levelOneFamilyTask(round: number, target: number): PracticeTask {
  const queue = rotated(
    [...LEVEL_ONE_SHAPES, LEVEL_ONE_SHAPES[round % LEVEL_ONE_SHAPES.length]!],
    round
  );
  return {
    kind: "starpathFamilySort",
    prompt: "Classify each shape into its family.",
    speakText:
      "Sort each shape into its matching family. Pay special attention to circles and ovals, and squares and rectangles.",
    target,
    bins: [...LEVEL_ONE_SHAPES],
    items: queue.map((shape, index) => ({
      id: `family-${target}-${index}`,
      shape,
      colour: LEVEL_ONE_COLOURS[(round + index) % LEVEL_ONE_COLOURS.length]!,
      scale: 0.68 + ((round + index) % 3) * 0.13,
    })),
    feedback: {
      correct: "Excellent classifying. Every shape is in the correct family.",
      wrong: "Compare the outline carefully before choosing its family.",
    },
  };
}

export function createShapeReviewMissionTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let matchRound = 0;
  let compareRound = 0;
  let changeRound = 0;

  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "levelOneShapes",
      heading: "A shape stays the same",
      prompt: "Colour, size and a small turn do not change a shape.",
      speakText:
        "Welcome, Junior Space Explorer! A familiar shape can change colour, become bigger or smaller, or turn around and still be the same shape. Look at the shape clues, not its decoration.",
      target: ++target,
    }),
    activities: [
      () => shapeTwinTask(matchRound++, ++target),
      () => compareLevelOneShapesTask(compareRound++, ++target),
      () => levelOneWhatChangedTask(changeRound++, ++target),
    ],
  };
}

export const SHAPE_REVIEW_MISSION_CONTENT = {
  missionBrief:
    "Begin your Junior Space Explorer training by recognising familiar shapes when their colour, size or direction changes.",
  successCriteria: [
    "recognise familiar shapes",
    "match the same shape in a different size or colour",
    "notice what changed",
  ],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: {
    title: "Shape Expert Review",
    durationMinutes: 1,
    taskKind: "starpathShapeIntro",
  },
  activities: [
    {
      key: "shape-twins",
      title: "Shape Twins",
      description: "Match familiar shapes despite changes in colour and size.",
      taskKinds: ["starpathShapeMatch"],
    },
    {
      key: "same-or-different",
      title: "Same or Different?",
      description: "Compare two familiar shapes.",
      taskKinds: ["starpathShapeCompare"],
    },
    {
      key: "what-changed",
      title: "What Changed?",
      description: "Decide whether the colour, size or shape changed.",
      taskKinds: ["starpathWhatChanged"],
    },
  ],
  reflection: {
    prompt: "What helped you recognise a shape?",
    options: [
      "I ignored its colour",
      "I ignored its size",
      "I looked at the whole shape",
    ],
  },
  practisedSkills: [
    "Recognise familiar shapes in varied colours and sizes",
    "Compare two familiar shapes",
    "Identify which visual feature changed",
  ],
  nextUpLabel: "Compare the Shapes",
  createTaskSet: createShapeReviewMissionTaskSet,
} satisfies StarpathLessonContent;

export function createCompareTheShapesTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let compareRound = 0;
  let changeRound = 0;
  let oddRound = 0;

  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "levelOneShapes",
      heading: "Compare like an explorer",
      prompt: "Look for what is the same and what is different.",
      speakText:
        "Space explorers compare carefully. Two shapes can have the same name even when their colour, size or direction is different. Look at both shapes and explain what stayed the same or what changed.",
      target: ++target,
    }),
    activities: [
      () => compareLevelOneShapesTask(compareRound++, ++target),
      () => levelOneWhatChangedTask(changeRound++, ++target),
      () => levelOneOddShapeTask(oddRound++, ++target),
    ],
  };
}

export const COMPARE_THE_SHAPES_CONTENT = {
  missionBrief:
    "Compare familiar shapes across Starpath. Decide what is the same, what is different and which shape does not belong.",
  successCriteria: [
    "compare two familiar shapes",
    "notice a similarity or difference",
    "find a shape that does not belong",
  ],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: {
    title: "Compare the Shapes",
    durationMinutes: 1,
    taskKind: "starpathShapeIntro",
  },
  activities: [
    {
      key: "shape-comparison",
      title: "Shape Comparison",
      description: "Decide whether two shapes are the same or different.",
      taskKinds: ["starpathShapeCompare"],
    },
    {
      key: "change-detector",
      title: "Change Detector",
      description: "Identify what changed between two shapes.",
      taskKinds: ["starpathWhatChanged"],
    },
    {
      key: "odd-shape",
      title: "Odd Shape",
      description: "Find the one shape that is different.",
      taskKinds: ["starpathOddOneOut"],
    },
  ],
  reflection: {
    prompt: "How did you compare the shapes?",
    options: [
      "I looked for what stayed the same",
      "I looked for what changed",
      "I ignored colour and size",
    ],
  },
  practisedSkills: [
    "Compare familiar shapes",
    "Identify visual similarities and differences",
    "Use comparison clues to find an odd shape",
  ],
  nextUpLabel: "Shape Detective Challenge",
  createTaskSet: createCompareTheShapesTaskSet,
} satisfies StarpathLessonContent;

export function createShapeDetectiveChallengeTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let familyRound = 0;
  let matchRound = 0;
  let oddRound = 0;

  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "levelOneShapes",
      heading: "Use every shape clue",
      prompt: "Recognise, compare and group familiar shapes.",
      speakText:
        "Junior Space Explorers use every clue they know. Recognise each familiar shape, compare it with the others, then decide which shapes belong together.",
      target: ++target,
    }),
    activities: [
      () => levelOneFamilyTask(familyRound++, ++target),
      () => shapeTwinTask(matchRound++, ++target),
      () => levelOneOddShapeTask(oddRound++, ++target),
    ],
  };
}

export const SHAPE_DETECTIVE_CHALLENGE_CONTENT = {
  missionBrief:
    "Complete Geospin's detective challenge by recognising, comparing and grouping familiar shapes across a busy sorting station.",
  successCriteria: [
    "recognise familiar shapes in different forms",
    "put matching shapes together",
    "explain which shape is different",
  ],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: {
    title: "Shape Detective Challenge",
    durationMinutes: 1,
    taskKind: "starpathShapeIntro",
  },
  activities: [
    {
      key: "shape-families",
      title: "Shape Families",
      description: "Classify familiar shapes into matching groups.",
      taskKinds: ["starpathFamilySort"],
    },
    {
      key: "detective-match",
      title: "Detective Match",
      description: "Find the matching shape despite visual changes.",
      taskKinds: ["starpathShapeMatch"],
    },
    {
      key: "detective-odd-one-out",
      title: "Which Does Not Belong?",
      description: "Use shape clues to find the different shape.",
      taskKinds: ["starpathOddOneOut"],
    },
  ],
  reflection: {
    prompt: "Which clue made you a strong shape detective?",
    options: [
      "I matched the shape",
      "I compared what was different",
      "I grouped the same shapes",
    ],
  },
  practisedSkills: [
    "Recognise familiar shapes despite visual changes",
    "Classify familiar shapes",
    "Explain a simple similarity or difference",
  ],
  nextUpLabel: "Week 1 Voyage Quiz",
  createTaskSet: createShapeDetectiveChallengeTaskSet,
} satisfies StarpathLessonContent;
