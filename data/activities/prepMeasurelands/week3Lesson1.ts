import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Ground Level · Week 3 · Lesson 1 — "Which Holds More?" ──
// Foundation Measurement: compare familiar containers by capacity using
// "holds more", "holds less", "full", and "empty" language.
// Reuses the shared measurementCompare scenes:
//   A — Holds More?           (pair compare)
//   B — Sort the Containers   (order 4)
//   C — Fill the Container    (sort into empty / nearly empty / nearly full / full)

type CompareTask = Extract<PracticeTask, { kind: "measurementCompare" }>;
type MObj = CompareTask["objects"][number];
type Accent = MObj["accent"];

type LessonMemory = {
  introShown: boolean;
  cursor: number;
  lastSetId: string | null;
};

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];
const ACCENTS: Accent[] = ["rose", "gold", "teal", "sky", "violet", "leaf"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastSetId: null };
  lessonMemory.set(lessonId, created);
  return created;
}

function randInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

function choose<T>(items: T[]): T {
  return items[randInt(items.length)]!;
}

type ContainerThing = {
  id: string;
  label: string;
  icon: string;
  capacity: number;
};

type PairSet = {
  setId: string;
  less: ContainerThing;
  more: ContainerThing;
};

type OrderSet = {
  setId: string;
  items: ContainerThing[];
};

const CONTAINERS: Record<string, ContainerThing> = {
  cup: { id: "cup", label: "Cup", icon: "🥤", capacity: 1 },
  mug: { id: "mug", label: "Mug", icon: "☕", capacity: 2 },
  bottle: { id: "bottle", label: "Bottle", icon: "🍼", capacity: 3 },
  lunchbox: { id: "lunchbox", label: "Lunchbox", icon: "🍱", capacity: 4 },
  jug: { id: "jug", label: "Jug", icon: "🍶", capacity: 5 },
  kettle: { id: "kettle", label: "Kettle", icon: "🫖", capacity: 6 },
  wateringCan: { id: "watering-can", label: "Watering Can", icon: "🪴", capacity: 7 },
  bucket: { id: "bucket", label: "Bucket", icon: "🪣", capacity: 8 },
  fishTank: { id: "fish-tank", label: "Fish Tank", icon: "🐠", capacity: 9 },
  bathtub: { id: "bathtub", label: "Bathtub", icon: "🛁", capacity: 10 },
};

const PAIR_SETS: PairSet[] = [
  { setId: "cup-bucket", less: CONTAINERS.cup, more: CONTAINERS.bucket },
  { setId: "mug-bathtub", less: CONTAINERS.mug, more: CONTAINERS.bathtub },
  { setId: "bottle-fish-tank", less: CONTAINERS.bottle, more: CONTAINERS.fishTank },
  { setId: "cup-jug", less: CONTAINERS.cup, more: CONTAINERS.jug },
  { setId: "lunchbox-bucket", less: CONTAINERS.lunchbox, more: CONTAINERS.bucket },
  { setId: "mug-kettle", less: CONTAINERS.mug, more: CONTAINERS.kettle },
  { setId: "bottle-watering-can", less: CONTAINERS.bottle, more: CONTAINERS.wateringCan },
  { setId: "jug-bathtub", less: CONTAINERS.jug, more: CONTAINERS.bathtub },
];

const ORDER_SETS: OrderSet[] = [
  {
    setId: "cup-bottle-jug-bucket",
    items: [CONTAINERS.cup, CONTAINERS.bottle, CONTAINERS.jug, CONTAINERS.bucket],
  },
  {
    setId: "mug-lunchbox-kettle-fish-tank",
    items: [CONTAINERS.mug, CONTAINERS.lunchbox, CONTAINERS.kettle, CONTAINERS.fishTank],
  },
  {
    setId: "cup-bottle-watering-can-bathtub",
    items: [CONTAINERS.cup, CONTAINERS.bottle, CONTAINERS.wateringCan, CONTAINERS.bathtub],
  },
  {
    setId: "mug-jug-bucket-fish-tank",
    items: [CONTAINERS.mug, CONTAINERS.jug, CONTAINERS.bucket, CONTAINERS.fishTank],
  },
];

// Fill levels are spaced so the four states read clearly against the brim line:
// empty = nothing, nearly-empty = thin layer, nearly-full = just below the brim,
// full = right up to the brim.
const FILL_STATES = [
  { id: "empty", label: "Empty", icon: "⚪", waterLevel: 0 },
  { id: "nearly-empty", label: "Nearly Empty", icon: "💧", waterLevel: 0.16 },
  { id: "nearly-full", label: "Nearly Full", icon: "💦", waterLevel: 0.78 },
  { id: "full", label: "Full", icon: "🌊", waterLevel: 1 },
] as const;

// One fixed container for every fill-state task so students focus on the WATER
// LEVEL, not the container's size/shape.
const FILL_CONTAINER = CONTAINERS.jug;

// waterLevel defaults to 0 (empty) — capacity compare/order cards must stay
// empty so container SIZE is the only cue. Only fill-state tasks pass a level.
function toObj(thing: ContainerThing, accent: Accent, waterLevel = 0, suffix = ""): MObj {
  return {
    id: `${thing.id}${suffix}`,
    label: thing.label,
    icon: thing.icon,
    compareValue: thing.capacity,
    axis: "capacity",
    waterLevel,
    accent,
  };
}

function chooseWithoutRepeat<T extends { setId: string }>(pool: T[], memory: LessonMemory): T {
  let picked = choose(pool);
  let guard = 0;
  while (picked.setId === memory.lastSetId && guard++ < 20) {
    picked = choose(pool);
  }
  memory.lastSetId = picked.setId;
  return picked;
}

const TEACHING_MOMENTS: NonNullable<CompareTask["teachingMoments"]> = [
  {
    id: "cup-bottle-bucket",
    title: "Holds Less and Holds More",
    objects: [
      { label: "Tiny Cup", icon: "🥤", compareValue: 1, axis: "capacity", waterLevel: 0.7, accent: "sky" },
      { label: "Bottle", icon: "🍼", compareValue: 3, axis: "capacity", waterLevel: 0.7, accent: "rose" },
      { label: "Bucket", icon: "🪣", compareValue: 8, axis: "capacity", waterLevel: 0.7, accent: "gold" },
    ],
    left: { label: "Tiny Cup", icon: "🥤", compareValue: 1, axis: "capacity", waterLevel: 0.7, accent: "sky" },
    right: { label: "Bucket", icon: "🪣", compareValue: 8, axis: "capacity", waterLevel: 0.7, accent: "gold" },
    narration: "The tiny cup holds less. The bucket holds more.",
  },
  {
    id: "mug-jug-bucket",
    title: "Compare the Containers",
    objects: [
      { label: "Mug", icon: "☕", compareValue: 2, axis: "capacity", waterLevel: 0.68, accent: "violet" },
      { label: "Jug", icon: "🍶", compareValue: 5, axis: "capacity", waterLevel: 0.68, accent: "teal" },
      { label: "Bucket", icon: "🪣", compareValue: 8, axis: "capacity", waterLevel: 0.68, accent: "leaf" },
    ],
    left: { label: "Mug", icon: "☕", compareValue: 2, axis: "capacity", waterLevel: 0.68, accent: "violet" },
    right: { label: "Jug", icon: "🍶", compareValue: 5, axis: "capacity", waterLevel: 0.68, accent: "teal" },
    narration: "A mug holds less than a jug. A bucket holds more than both.",
  },
  {
    id: "bottle-fish-tank-bathtub",
    title: "Big Containers Hold More",
    objects: [
      { label: "Bottle", icon: "🍼", compareValue: 3, axis: "capacity", waterLevel: 0.7, accent: "rose" },
      { label: "Fish Tank", icon: "🐠", compareValue: 9, axis: "capacity", waterLevel: 0.7, accent: "sky" },
      { label: "Bathtub", icon: "🛁", compareValue: 10, axis: "capacity", waterLevel: 0.7, accent: "gold" },
    ],
    left: { label: "Bottle", icon: "🍼", compareValue: 3, axis: "capacity", waterLevel: 0.7, accent: "rose" },
    right: { label: "Bathtub", icon: "🛁", compareValue: 10, axis: "capacity", waterLevel: 0.7, accent: "gold" },
    narration: "The bathtub holds the most. The bottle holds less.",
  },
];

function buildIntroTask(): CompareTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "Let’s find which container holds more!",
    speakText:
      "Professor Gauge says capacity tells us how much something can hold inside. A bucket can hold more than a cup. A cup can hold less than a bucket. Let's compare containers in Capacity Springs.",
    badgeLabel: "Professor Gauge",
    introIcon: "🪣",
    introBody: [
      "Capacity tells us how much something can hold inside.",
      "A bucket can hold more than a cup.",
      "A cup can hold less than a bucket.",
      "Let's compare the containers in Capacity Springs.",
    ],
    objects: [],
    teachingMoments: TEACHING_MOMENTS,
    correctOptionId: "continue",
    feedback: { correct: "Let's start comparing!", wrong: "Let's get ready." },
  };
}

function buildCompareCapacityTask(memory: LessonMemory): CompareTask {
  const set = chooseWithoutRepeat(PAIR_SETS, memory);
  const accents = shuffle(ACCENTS);
  const less = toObj(set.less, accents[0]!);
  const more = toObj(set.more, accents[1]!);
  const askMore = Math.random() < 0.5;
  return {
    kind: "measurementCompare",
    scene: "pair",
    prompt: askMore ? "Which holds more?" : "Which holds less?",
    speakText: askMore ? "Which container holds more?" : "Which container holds less?",
    badgeLabel: askMore ? "Holds More?" : "Holds Less?",
    objects: shuffle([less, more]),
    correctOptionId: askMore ? more.id : less.id,
    feedback: {
      correct: askMore
        ? `Yes! The ${set.more.label.toLowerCase()} holds more.`
        : `Yes! The ${set.less.label.toLowerCase()} holds less.`,
      wrong: "Try again.",
    },
  };
}

function buildSortContainersTask(memory: LessonMemory): CompareTask {
  const set = chooseWithoutRepeat(ORDER_SETS, memory);
  const accents = shuffle(ACCENTS);
  const ordered = set.items
    .slice()
    .sort((a, b) => a.capacity - b.capacity)
    .map((item, index) => toObj(item, accents[index]!));
  return {
    kind: "measurementCompare",
    scene: "order",
    prompt: "Put the containers in order: smallest capacity to largest capacity.",
    speakText: "Put the containers in order from smallest capacity to largest capacity.",
    badgeLabel: "Sort the Containers",
    objects: shuffle(ordered),
    orderedIds: ordered.map((item) => item.id),
    correctOptionId: ordered[ordered.length - 1]!.id,
    feedback: { correct: "Nice ordering!", wrong: "Try the smallest container first." },
  };
}

function buildFillContainerTask(memory: LessonMemory): CompareTask {
  const container = FILL_CONTAINER;
  let state = choose([...FILL_STATES]);
  let guard = 0;
  while (`${container.id}-${state.id}` === memory.lastSetId && guard++ < 20) {
    state = choose([...FILL_STATES]);
  }
  memory.lastSetId = `${container.id}-${state.id}`;
  const accents = shuffle(ACCENTS);
  return {
    kind: "measurementCompare",
    scene: "sort",
    prompt: "How full is this container?",
    speakText: `How full is the ${container.label.toLowerCase()}?`,
    badgeLabel: "Fill the Container",
    objects: [toObj(container, accents[0]!, state.waterLevel)],
    bins: FILL_STATES.map((fillState) => ({
      id: fillState.id,
      label: fillState.label,
      icon: fillState.icon,
    })),
    correctOptionId: state.id,
    feedback: { correct: "Great looking!", wrong: "Look at the water level." },
  };
}

export function buildMeasurelandsWeek3Lesson1QuizTasks(): PracticeTask[] {
  const moreSet = PAIR_SETS[0]!;
  const lessSet = PAIR_SETS[5]!;
  const greatestSet = [CONTAINERS.mug, CONTAINERS.kettle, CONTAINERS.fishTank];
  const smallestSet = [CONTAINERS.cup, CONTAINERS.bottle, CONTAINERS.jug];
  const emptyState = FILL_STATES[0]!;

  // Capacity comparison/order questions show EMPTY containers (waterLevel 0).
  const greatestObjects = greatestSet.map((item, index) =>
    toObj(item, ACCENTS[index]!, 0, `-greatest-${index}`),
  );
  const smallestObjects = smallestSet.map((item, index) =>
    toObj(item, ACCENTS[index + 2]!, 0, `-smallest-${index}`),
  );

  return [
    {
      kind: "measurementCompare",
      scene: "pair",
      prompt: "Which holds more?",
      speakText: "Which container holds more?",
      badgeLabel: "Capacity Check",
      objects: shuffle([
        toObj(moreSet.less, "sky", 0, "-q1a"),
        toObj(moreSet.more, "gold", 0, "-q1b"),
      ]),
      correctOptionId: `${moreSet.more.id}-q1b`,
      feedback: { correct: "Yes!", wrong: "Look again." },
    },
    {
      kind: "measurementCompare",
      scene: "pair",
      prompt: "Which holds less?",
      speakText: "Which container holds less?",
      badgeLabel: "Capacity Check",
      objects: shuffle([
        toObj(lessSet.less, "violet", 0, "-q2a"),
        toObj(lessSet.more, "teal", 0, "-q2b"),
      ]),
      correctOptionId: `${lessSet.less.id}-q2a`,
      feedback: { correct: "Yes!", wrong: "Look again." },
    },
    {
      kind: "measurementCompare",
      scene: "trio",
      prompt: "Which container has the greatest capacity?",
      speakText: "Which container holds the most?",
      badgeLabel: "Greatest Capacity",
      objects: shuffle(greatestObjects),
      correctOptionId: greatestObjects[2]!.id,
      feedback: { correct: "Great job!", wrong: "Look for the biggest container." },
    },
    {
      kind: "measurementCompare",
      scene: "trio",
      prompt: "Which container has the smallest capacity?",
      speakText: "Which container holds the least?",
      badgeLabel: "Smallest Capacity",
      objects: shuffle(smallestObjects),
      correctOptionId: smallestObjects[0]!.id,
      feedback: { correct: "Great job!", wrong: "Look for the smallest container." },
    },
    {
      kind: "measurementCompare",
      scene: "sort",
      prompt: "How full is this container?",
      speakText: "How full is this container?",
      badgeLabel: "Full or Empty",
      objects: [toObj(FILL_CONTAINER, "leaf", emptyState.waterLevel, "-q5")],
      bins: FILL_STATES.map((fillState) => ({
        id: fillState.id,
        label: fillState.label,
        icon: fillState.icon,
      })),
      correctOptionId: emptyState.id,
      feedback: { correct: "That's right!", wrong: "Look at the water level." },
    },
  ];
}

export function generatePrepMeasurelandsWeek3Lesson1Task(
  lessonId: string,
  _difficulty: Difficulty,
): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }

  const rotation = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;

  if (rotation === "A") return buildCompareCapacityTask(memory);
  if (rotation === "B") return buildSortContainersTask(memory);
  return buildFillContainerTask(memory);
}

export function resetPrepMeasurelandsWeek3Lesson1TaskSessionState() {
  lessonMemory.clear();
}
