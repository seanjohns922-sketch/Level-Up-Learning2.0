import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type {
  PracticeTask,
  StarpathShape,
} from "@/data/activities/year1/practice-task";

const LEVEL_ONE_ARTWORK = "/images/starpath-home-bg-y1.png";
const SHAPES: StarpathShape[] = [
  "circle",
  "oval",
  "triangle",
  "square",
  "rectangle",
];
const COLOURS = ["#67e8f9", "#c4b5fd", "#fde047", "#86efac", "#f9a8d4"] as const;

const CLOSE_SHAPE: Record<StarpathShape, StarpathShape> = {
  circle: "oval",
  oval: "circle",
  triangle: "oval",
  square: "rectangle",
  rectangle: "square",
};

const SHAPE_CLUES: Record<StarpathShape, string[]> = {
  circle: ["I am round", "I am equally wide and tall", "I have no straight sides"],
  oval: ["I am round", "I am longer in one direction", "I am not a circle"],
  triangle: ["I have 3 straight sides", "I have 3 corners", "I can be turned"],
  square: ["I have 4 equal sides", "I have 4 corners", "All my sides look equal"],
  rectangle: ["I have 4 straight sides", "2 sides are longer", "I have 4 corners"],
};

function rotate<T>(items: readonly T[], by: number): T[] {
  const shift = ((by % items.length) + items.length) % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}

function disguiseTask(
  mode: "hologram" | "turntable" | "match",
  round: number,
  target: number
): PracticeTask {
  const shape = SHAPES[round % SHAPES.length]!;
  const closeShape = CLOSE_SHAPE[shape];
  const thirdShape = SHAPES.find(
    (candidate) => candidate !== shape && candidate !== closeShape
  )!;
  const correctId = `correct-${target}`;
  const options = rotate(
    [
      {
        id: correctId,
        shape,
        colour: COLOURS[(round + 2) % COLOURS.length]!,
        scale: 0.68 + (round % 3) * 0.12,
        rotation: shape === "circle" ? 0 : 25 + (round % 3) * 19,
      },
      {
        id: `close-${target}`,
        shape: closeShape,
        colour: COLOURS[(round + 3) % COLOURS.length]!,
        scale: 0.92,
        rotation: -18,
      },
      {
        id: `other-${target}`,
        shape: thirdShape,
        colour: COLOURS[(round + 4) % COLOURS.length]!,
        scale: 0.82,
        rotation: 16,
      },
    ],
    round
  );

  return {
    kind: "starpathShapeDisguise",
    mode,
    prompt:
      mode === "hologram"
        ? "Stabilise the hologram. Which shape is hiding?"
        : mode === "turntable"
          ? "Turn the scanner. Which shape stays the same?"
          : `Find the disguised ${shape}.`,
    speakText:
      mode === "hologram"
        ? "Stabilise the hologram, then identify the familiar shape. Its colour and size may have changed."
        : mode === "turntable"
          ? "Turn the scanner and identify the shape. Turning a shape does not change its name."
          : `Find the ${shape} in disguise. It may be turned, resized or recoloured.`,
    target,
    shape,
    colour: COLOURS[round % COLOURS.length]!,
    scale: 0.72 + (round % 3) * 0.12,
    rotation: shape === "circle" ? 0 : 30 + (round % 4) * 22,
    options,
    correctOptionId: correctId,
    feedback: {
      correct: `Scanner confirmed: ${shape}. Its colour, size and direction did not change its identity.`,
      wrong: `Compare the whole outline and look again for the ${shape}.`,
    },
  };
}

function faceOffTask(
  mode: "close-pair" | "similarity" | "difference",
  round: number,
  target: number
): PracticeTask {
  if (mode === "close-pair") {
    const pair =
      round % 2 === 0
        ? (["circle", "oval"] as const)
        : (["square", "rectangle"] as const);
    const order = round % 4 < 2 ? pair : ([pair[1], pair[0]] as const);
    const wanted = round % 2 === 0 ? "oval" : "rectangle";
    const correctOptionId = order[0] === wanted ? "left" : "right";
    return {
      kind: "starpathShapeFaceOff",
      mode,
      prompt: `Which shape is the ${wanted}?`,
      speakText: `Compare Shape A and Shape B carefully. Which shape is the ${wanted}?`,
      target,
      left: {
        shape: order[0],
        colour: COLOURS[round % COLOURS.length]!,
        scale: 0.9,
        rotation: -12,
      },
      right: {
        shape: order[1],
        colour: COLOURS[(round + 2) % COLOURS.length]!,
        scale: 0.78,
        rotation: 18,
      },
      options: [
        { id: "left", label: "Shape A" },
        { id: "right", label: "Shape B" },
      ],
      correctOptionId,
      feedback: {
        correct: `Correct. ${correctOptionId === "left" ? "Shape A" : "Shape B"} is the ${wanted}.`,
        wrong: `Compare the outlines again. Look for the ${wanted}.`,
      },
    };
  }

  const shape = SHAPES[round % SHAPES.length]!;
  const changedShape = CLOSE_SHAPE[shape];
  const isSimilarity = mode === "similarity";
  return {
    kind: "starpathShapeFaceOff",
    mode,
    prompt: isSimilarity
      ? "What stayed the same?"
      : "What is different?",
    speakText: isSimilarity
      ? "Compare both shapes. What stayed the same: the outline, colour or size?"
      : "Compare both shapes. What is different: the shape, colour or size?",
    target,
    left: {
      shape,
      colour: COLOURS[round % COLOURS.length]!,
      scale: 0.92,
      rotation: -10,
    },
    right: {
      shape: isSimilarity ? shape : changedShape,
      colour: isSimilarity
        ? COLOURS[(round + 2) % COLOURS.length]!
        : COLOURS[round % COLOURS.length]!,
      scale: isSimilarity ? 0.68 : 0.92,
      rotation: isSimilarity ? 32 : -10,
    },
    options: isSimilarity
      ? [
          { id: "outline", label: "The outline" },
          { id: "colour", label: "The colour" },
          { id: "size", label: "The size" },
        ]
      : [
          { id: "shape", label: "The shape" },
          { id: "colour", label: "The colour" },
          { id: "size", label: "The size" },
        ],
    correctOptionId: isSimilarity ? "outline" : "shape",
    feedback: {
      correct: isSimilarity
        ? `Correct. Both outlines are ${shape}s.`
        : `Correct. The ${shape} changed into a ${changedShape}.`,
      wrong: isSimilarity
        ? "The colour, size and direction changed, but the outline stayed the same."
        : `The colour and size stayed the same. The ${shape} became a ${changedShape}.`,
    },
  };
}

function mysteryTask(
  mode: "clue-decoder" | "elimination" | "label-repair",
  round: number,
  target: number
): PracticeTask {
  const answerShape = SHAPES[round % SHAPES.length]!;
  const answerId = `answer-${target}`;

  if (mode === "label-repair") {
    const visibleShapes = rotate(SHAPES, round).slice(0, 4);
    const wrongIndex = round % visibleShapes.length;
    const options = visibleShapes.map((shape, index) => ({
      id: index === wrongIndex ? answerId : `correct-label-${target}-${index}`,
      shape,
      label:
        index === wrongIndex
          ? CLOSE_SHAPE[shape].charAt(0).toUpperCase() + CLOSE_SHAPE[shape].slice(1)
          : shape.charAt(0).toUpperCase() + shape.slice(1),
      colour: COLOURS[(round + index) % COLOURS.length]!,
      rotation: shape === "circle" ? 0 : (index - 1) * 12,
    }));
    return {
      kind: "starpathMysteryShape",
      mode,
      prompt: "Which scanner label is wrong?",
      speakText:
        "One scanner label does not match its shape. Tap the card with the incorrect label.",
      target,
      clues: [],
      options,
      correctOptionId: answerId,
      feedback: {
        correct: "You repaired the incorrect scanner label.",
        wrong: "That label matches its shape. Check the other scanner cards.",
      },
    };
  }

  const closeShape = CLOSE_SHAPE[answerShape];
  const otherShapes = [
    closeShape,
    ...SHAPES.filter((shape) => shape !== answerShape && shape !== closeShape),
  ].slice(0, 3);
  const options = rotate(
    [answerShape, ...otherShapes].map((shape, index) => ({
      id: shape === answerShape ? answerId : `option-${target}-${index}`,
      shape,
      label: shape.charAt(0).toUpperCase() + shape.slice(1),
      colour: COLOURS[(round + index) % COLOURS.length]!,
      rotation: shape === "circle" ? 0 : (round + index) * 11,
    })),
    round
  );
  return {
    kind: "starpathMysteryShape",
    mode,
    prompt:
      mode === "clue-decoder"
        ? "Decode Geospin's mystery shape."
        : "Reveal the clues and eliminate the impossible shapes.",
    speakText:
      mode === "clue-decoder"
        ? "Listen to Geospin's clues and choose the mystery shape."
        : "Reveal each clue. Use every clue to eliminate shapes that cannot be the answer.",
    target,
    clues: SHAPE_CLUES[answerShape],
    options,
    correctOptionId: answerId,
    feedback: {
      correct: `Mystery solved. The clues describe a ${answerShape}.`,
      wrong: `That shape does not match every clue. Check the clues again.`,
    },
  };
}

export function createShapeReviewMissionTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let hologramRound = 0;
  let turntableRound = 0;
  let matchRound = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "levelOneShapes",
      heading: "Welcome to the Shape Disguise Lab",
      prompt: "Colour, size and turning do not change a shape.",
      speakText:
        "A shape can be recoloured, resized or turned and still keep its identity. Train the scanner to see through every disguise.",
      target: ++target,
    }),
    activities: [
      () => disguiseTask("hologram", hologramRound++, ++target),
      () => disguiseTask("turntable", turntableRound++, ++target),
      () => disguiseTask("match", matchRound++, ++target),
    ],
  };
}

export const SHAPE_REVIEW_MISSION_CONTENT = {
  missionBrief:
    "Enter Geospin's Shape Disguise Lab. Stabilise holograms, turn the scanner and recognise familiar shapes in disguise.",
  successCriteria: [
    "recognise a resized shape",
    "recognise a turned shape",
    "recognise a recoloured shape",
  ],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Shape Disguise Lab", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "hologram-stabiliser", title: "Hologram Stabiliser", description: "Reveal and identify a distorted hologram.", taskKinds: ["starpathShapeDisguise"] },
    { key: "turntable-scanner", title: "Turntable Scanner", description: "Turn and identify a familiar shape.", taskKinds: ["starpathShapeDisguise"] },
    { key: "disguise-match", title: "Disguise Match", description: "Find a shape after several visual changes.", taskKinds: ["starpathShapeDisguise"] },
  ],
  reflection: {
    prompt: "What can change without changing a shape's name?",
    options: ["Its colour", "Its size", "The way it is turned"],
  },
  practisedSkills: ["Recognise resized shapes", "Recognise rotated shapes", "Recognise recoloured shapes"],
  nextUpLabel: "Shape Face-Off",
  createTaskSet: createShapeReviewMissionTaskSet,
} satisfies StarpathLessonContent;

export function createCompareTheShapesTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let closePairRound = 0;
  let similarityRound = 0;
  let differenceRound = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "levelOneShapes",
      heading: "Shape Face-Off",
      prompt: "Compare close shapes carefully.",
      speakText:
        "Circle or oval? Square or rectangle? Compare the outlines and decide what stayed the same and what is different.",
      target: ++target,
    }),
    activities: [
      () => faceOffTask("close-pair", closePairRound++, ++target),
      () => faceOffTask("similarity", similarityRound++, ++target),
      () => faceOffTask("difference", differenceRound++, ++target),
    ],
  };
}

export const COMPARE_THE_SHAPES_CONTENT = {
  missionBrief:
    "Enter the Shape Face-Off arena. Compare close shape pairs, find similarities and detect important differences.",
  successCriteria: [
    "tell a circle from an oval",
    "tell a square from a rectangle",
    "identify a similarity or difference",
  ],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Shape Face-Off", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "close-pair", title: "Close Pair", description: "Distinguish shapes with similar outlines.", taskKinds: ["starpathShapeFaceOff"] },
    { key: "similarity-scan", title: "Similarity Scan", description: "Identify what stayed the same.", taskKinds: ["starpathShapeFaceOff"] },
    { key: "difference-scan", title: "Difference Scan", description: "Identify what changed.", taskKinds: ["starpathShapeFaceOff"] },
  ],
  reflection: {
    prompt: "What helped you compare close shapes?",
    options: ["I compared the outlines", "I checked what stayed the same", "I checked what changed"],
  },
  practisedSkills: ["Compare close shape pairs", "Identify similarities", "Identify differences"],
  nextUpLabel: "Mystery Shape Rescue",
  createTaskSet: createCompareTheShapesTaskSet,
} satisfies StarpathLessonContent;

export function createShapeDetectiveChallengeTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let clueRound = 0;
  let eliminationRound = 0;
  let repairRound = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "levelOneShapes",
      heading: "Mystery Shape Rescue",
      prompt: "Use every clue before choosing.",
      speakText:
        "Geospin's shape records are scrambled. Decode clues, eliminate impossible choices and repair incorrect scanner labels.",
      target: ++target,
    }),
    activities: [
      () => mysteryTask("clue-decoder", clueRound++, ++target),
      () => mysteryTask("elimination", eliminationRound++, ++target),
      () => mysteryTask("label-repair", repairRound++, ++target),
    ],
  };
}

export const SHAPE_DETECTIVE_CHALLENGE_CONTENT = {
  missionBrief:
    "Rescue Geospin's scrambled records by decoding mystery clues, eliminating impossible shapes and repairing incorrect labels.",
  successCriteria: [
    "use several clues together",
    "eliminate shapes that do not fit",
    "identify an incorrect shape label",
  ],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Mystery Shape Rescue", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "clue-decoder", title: "Clue Decoder", description: "Identify a mystery shape from several clues.", taskKinds: ["starpathMysteryShape"] },
    { key: "shape-elimination", title: "Shape Elimination", description: "Reveal clues and remove impossible answers.", taskKinds: ["starpathMysteryShape"] },
    { key: "label-repair", title: "Scanner Repair", description: "Find and repair an incorrect shape label.", taskKinds: ["starpathMysteryShape"] },
  ],
  reflection: {
    prompt: "How did you solve the mystery?",
    options: ["I used every clue", "I removed impossible shapes", "I checked each label"],
  },
  practisedSkills: ["Interpret shape clues", "Use elimination", "Check shape labels"],
  nextUpLabel: "Week 1 Voyage Quiz",
  createTaskSet: createShapeDetectiveChallengeTaskSet,
} satisfies StarpathLessonContent;
