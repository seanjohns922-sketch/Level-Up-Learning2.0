import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import { SHAPE_FACTS, type FoundationShape } from "@/data/activities/starpath/ground/week1Lesson1";

const SHAPES: FoundationShape[] = ["circle", "triangle", "square", "rectangle"];
const SHAPE_COLOURS = ["#67e8f9", "#f9a8d4", "#fde047", "#86efac", "#c4b5fd"] as const;

function colour(index: number) {
  return SHAPE_COLOURS[index % SHAPE_COLOURS.length]!;
}

// A1 — Which One Doesn't Belong? Three of one shape and one different shape.
export function oddOneOutTask(round: number, target: number): PracticeTask {
  const commonShape = SHAPES[round % SHAPES.length]!;
  // (round + 2) mod 4 is always a different index, so the odd shape never
  // accidentally matches the common shape.
  const oddShape = SHAPES[(round + 2) % SHAPES.length]!;
  const raw = [
    { shape: commonShape, tag: "c0" },
    { shape: commonShape, tag: "c1" },
    { shape: commonShape, tag: "c2" },
    { shape: oddShape, tag: "odd" },
  ];
  const options = raw
    .map((entry, index) => ({ entry, sort: (index * 5 + round * 3) % raw.length }))
    .sort((left, right) => left.sort - right.sort)
    .map(({ entry }, index) => ({
      id: `${entry.tag}-${target}-${index}`,
      shape: entry.shape,
      colour: colour(round + index),
      isOdd: entry.tag === "odd",
    }));
  const odd = options.find((option) => option.isOdd)!;
  return {
    kind: "starpathOddOneOut",
    prompt: "Which shape is different?",
    speakText: `Which shape is different? Look carefully at the sides and whether it is round.`,
    target,
    options: options.map(({ id, shape, colour: c }) => ({ id, shape, colour: c })),
    oddOptionId: odd.id,
    feedback: {
      correct: `Yes! The ${oddShape} is different. The others are all ${commonShape}s. ${SHAPE_FACTS[oddShape]}`,
      wrong: `Look again — three shapes are ${commonShape}s, so the ${oddShape} is the different one.`,
    },
  };
}

// A2 — Space Shape Sort: send each shape to its matching planet.
function shapeSortTask(round: number, target: number): PracticeTask {
  const shape = SHAPES[round % SHAPES.length]!;
  return {
    kind: "starpathShapeSort",
    prompt: `Sort the ${shape} onto its planet.`,
    speakText: `Sort this ${shape} onto ${shape} planet. ${SHAPE_FACTS[shape]}`,
    target,
    shape,
    colour: colour(round * 2 + 1),
    scale: 0.84 + (round % 4) * 0.06,
    feedback: {
      correct: `Perfect sorting! The ${shape} belongs on ${shape} planet. ${SHAPE_FACTS[shape]}`,
      wrong: `This shape belongs with the ${shape}s.`,
    },
  };
}

// A3 — Cosmic Mission: collect exactly the shapes Geospin requests.
const MISSION_PRESETS: ReadonlyArray<ReadonlyArray<{ shape: FoundationShape; count: number }>> = [
  [
    { shape: "triangle", count: 1 },
    { shape: "circle", count: 2 },
    { shape: "rectangle", count: 1 },
  ],
  [
    { shape: "square", count: 2 },
    { shape: "triangle", count: 1 },
    { shape: "circle", count: 1 },
  ],
  [
    { shape: "rectangle", count: 2 },
    { shape: "square", count: 1 },
    { shape: "triangle", count: 1 },
  ],
];

function collectMissionTask(round: number, target: number): PracticeTask {
  const requests = MISSION_PRESETS[round % MISSION_PRESETS.length]!;
  const requestedShapes = new Set(requests.map((request) => request.shape));
  const items: Array<{ id: string; shape: FoundationShape; colour: string }> = [];
  requests.forEach((request, requestIndex) => {
    for (let i = 0; i < request.count; i += 1) {
      items.push({ id: `r${requestIndex}-${target}-${i}`, shape: request.shape, colour: colour(round + requestIndex + i) });
    }
  });
  // Two distractor shapes that were not requested.
  const distractors = SHAPES.filter((shape) => !requestedShapes.has(shape));
  distractors.slice(0, 2).forEach((shape, index) => {
    items.push({ id: `x-${target}-${index}`, shape, colour: colour(round + index + 3) });
  });
  const shuffled = items
    .map((item, index) => ({ item, sort: (index * 7 + round * 5) % items.length }))
    .sort((left, right) => left.sort - right.sort)
    .map((entry) => entry.item);
  const spoken = requests.map((request) => `${request.count} ${request.shape}${request.count > 1 ? "s" : ""}`).join(", ");
  return {
    kind: "starpathCollectMission",
    prompt: "Collect the shapes Geospin needs.",
    speakText: `Geospin needs ${spoken}. Tap them to collect them.`,
    target,
    requests: requests.map((request) => ({ ...request })),
    items: shuffled,
    feedback: {
      correct: `Mission complete! You collected exactly what Geospin needed.`,
      wrong: `That is not on the list. Collect only the shapes Geospin asked for.`,
    },
  };
}

export function createShapeMastersTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let oddRound = 0;
  let sortRound = 0;
  let missionRound = 0;

  return {
    teaching: () => {
      target += 1;
      return {
        kind: "starpathShapeIntro",
        scene: "intro",
        variant: "clues",
        prompt: "Good explorers look carefully.",
        speakText:
          "Good explorers look carefully. Don't rush. Look at the sides. Look at whether it is round. Every shape has clues.",
        target,
      };
    },
    activities: [
      () => {
        target += 1;
        const task = oddOneOutTask(oddRound, target);
        oddRound += 1;
        return task;
      },
      () => {
        target += 1;
        const task = shapeSortTask(sortRound, target);
        sortRound += 1;
        return task;
      },
      () => {
        target += 1;
        const task = collectMissionTask(missionRound, target);
        missionRound += 1;
        return task;
      },
    ],
  };
}

export const SHAPE_MASTERS_PRACTISED_SKILLS = [
  "Identify familiar shapes quickly",
  "Tell similar shapes apart",
  "Use shape clues to choose the right shape",
];

export const SHAPE_MASTERS_CONTENT = {
  missionBrief:
    "Become a Shape Master! Use your shape clues to spot the odd one out, sort shapes to their planets, and complete Geospin's cosmic mission.",
  successCriteria: [
    "identify shapes quickly",
    "tell similar shapes apart",
    "use shape clues",
  ],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: {
    title: "Look for the Clues",
    durationMinutes: 1,
    taskKind: "starpathShapeIntro",
  },
  activities: [
    {
      key: "which-one-doesnt-belong",
      title: "Which One Doesn't Belong?",
      description: "Study four shapes and tap the one that is different from the rest.",
      taskKinds: ["starpathOddOneOut"],
    },
    {
      key: "space-shape-sort",
      title: "Space Shape Sort",
      description: "Send each shape to its matching planet.",
      taskKinds: ["starpathShapeSort"],
    },
    {
      key: "cosmic-mission",
      title: "Cosmic Mission",
      description: "Collect exactly the shapes Geospin asks for from a busy space scene.",
      taskKinds: ["starpathCollectMission"],
    },
  ],
  reflection: {
    prompt: "How did you know which shape to choose?",
    options: ["I looked for straight sides", "I looked for a round shape", "I counted the sides"],
  },
  practisedSkills: SHAPE_MASTERS_PRACTISED_SKILLS,
  nextUpLabel: "Voyage Quiz",
  createTaskSet: createShapeMastersTaskSet,
} satisfies StarpathLessonContent;
