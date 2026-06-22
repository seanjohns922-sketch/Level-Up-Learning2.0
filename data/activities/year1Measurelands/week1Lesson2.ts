import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

type MeasurePathTask = Extract<PracticeTask, { kind: "measurePath" }>;

const BASE = "/images/measurelands/week1-3d";

type MeasureObject = {
  id: string;
  label: string;
  image: string;
  blocks: number[];
};

const OBJECTS: MeasureObject[] = [
  { id: "worm", label: "Worm", image: `${BASE}/worm.png`, blocks: [2, 3, 4] },
  { id: "crayon", label: "Crayon", image: `${BASE}/crayon.png`, blocks: [3, 4, 5, 6] },
  { id: "carrot", label: "Carrot", image: `${BASE}/carrot.png`, blocks: [4, 5, 6, 7] },
  { id: "pencil", label: "Pencil", image: `${BASE}/pencil.png`, blocks: [5, 6, 7, 8] },
  { id: "cucumber", label: "Cucumber", image: `${BASE}/cucumber.png`, blocks: [6, 7, 8, 9] },
  { id: "plank", label: "Plank", image: `${BASE}/plank.png`, blocks: [8, 9, 10] },
  { id: "vine", label: "Vine", image: `${BASE}/vine.png`, blocks: [9, 10, 11] },
  { id: "snake", label: "Snake", image: `${BASE}/snake.png`, blocks: [10, 11, 12] },
];

type MeasuredOption = {
  id: string;
  label: string;
  image: string;
  blocks: number;
};

type LessonMemory = {
  introShown: boolean;
  cursor: number;
  lastSetKey: string | null;
};

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastSetKey: null };
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

function measure(objectId: string, blocks: number): MeasuredOption {
  const object = OBJECTS.find((candidate) => candidate.id === objectId)!;
  return {
    id: `${object.id}-${blocks}`,
    label: object.label,
    image: object.image,
    blocks,
  };
}

const ORDER_SETS: Array<{ key: string; items: MeasuredOption[] }> = [
  {
    key: "crayon-pencil-cucumber",
    items: [measure("crayon", 3), measure("pencil", 5), measure("cucumber", 8)],
  },
  {
    key: "plank-vine-snake",
    items: [measure("plank", 8), measure("vine", 10), measure("snake", 12)],
  },
  {
    key: "worm-carrot-pencil",
    items: [measure("worm", 2), measure("carrot", 5), measure("pencil", 7)],
  },
  {
    key: "crayon-cucumber-snake",
    items: [measure("crayon", 4), measure("cucumber", 7), measure("snake", 11)],
  },
];

const SAME_LENGTH_SETS: Array<{
  key: string;
  target: MeasuredOption;
  options: MeasuredOption[];
  correctId: string;
}> = [
  {
    key: "carrot-6",
    target: measure("carrot", 6),
    options: [measure("pencil", 4), measure("crayon", 6), measure("vine", 9)],
    correctId: "crayon-6",
  },
  {
    key: "pencil-7",
    target: measure("pencil", 7),
    options: [measure("carrot", 5), measure("cucumber", 7), measure("worm", 3)],
    correctId: "cucumber-7",
  },
  {
    key: "plank-8",
    target: measure("plank", 8),
    options: [measure("snake", 10), measure("pencil", 8), measure("crayon", 5)],
    correctId: "pencil-8",
  },
  {
    key: "vine-10",
    target: measure("vine", 10),
    options: [measure("plank", 8), measure("snake", 10), measure("carrot", 6)],
    correctId: "snake-10",
  },
];

function buildIntroTask(): MeasurePathTask {
  const pencil = measure("pencil", 5);
  const crayon = measure("crayon", 3);
  return {
    kind: "measurePath",
    scene: "intro",
    prompt: "Now we can compare measurements.",
    speakText:
      "Now that we know how to measure with blocks, we can compare our measurements. The pencil is 5 blocks. The crayon is 3 blocks. 5 blocks is longer than 3 blocks.",
    badgeLabel: "Professor Gauge",
    teachingPaths: [
      {
        length: pencil.blocks,
        unitEmoji: "block",
        caption: `Pencil = ${pencil.blocks} blocks`,
        objectImageSrc: pencil.image,
        objectLabel: pencil.label,
      },
      {
        length: crayon.blocks,
        unitEmoji: "block",
        caption: `Crayon = ${crayon.blocks} blocks`,
        objectImageSrc: crayon.image,
        objectLabel: crayon.label,
      },
    ],
    feedback: { correct: "Let's compare measurements!", wrong: "Let's get ready." },
  };
}

function buildWhichIsLongerTask(memory: LessonMemory): MeasurePathTask {
  const orderSet = choose(ORDER_SETS);
  memory.lastSetKey = orderSet.key;
  const [shorter, longer] = shuffle([
    orderSet.items[0]!,
    orderSet.items[1]!,
  ]).sort((a, b) => a.blocks - b.blocks);

  const display = shuffle([shorter, longer]).map((item) => ({
    id: item.id,
    length: item.blocks,
    unitEmoji: "block",
    unitLabel: "blocks",
    objectImageSrc: item.image,
    objectLabel: item.label,
  }));

  return {
    kind: "measurePath",
    scene: "compare",
    prompt: "Which is longer?",
    speakText: "Which is longer? Compare the measurements.",
    badgeLabel: "Which Is Longer?",
    paths: display,
    correctPathId: longer.id,
    feedback: { correct: "Yes. It has more blocks.", wrong: "Look at the number of blocks." },
  };
}

function buildOrderTask(memory: LessonMemory): MeasurePathTask {
  const pool = ORDER_SETS.filter((set) => set.key !== memory.lastSetKey);
  const picked = choose(pool.length > 0 ? pool : ORDER_SETS);
  memory.lastSetKey = picked.key;
  const ordered = [...picked.items].sort((a, b) => a.blocks - b.blocks);

  return {
    kind: "measurePath",
    scene: "order",
    prompt: "Put the measurements in order: shortest to longest.",
    speakText: "Put the measurements in order, from shortest to longest.",
    badgeLabel: "Order the Measurements",
    paths: shuffle(ordered).map((item) => ({
      id: item.id,
      length: item.blocks,
      unitEmoji: "block",
      unitLabel: "blocks",
      objectImageSrc: item.image,
      objectLabel: item.label,
    })),
    correctOrderIds: ordered.map((item) => item.id),
    feedback: { correct: "Great ordering!", wrong: "Read the number of blocks and try again." },
  };
}

function buildSameLengthTask(memory: LessonMemory): MeasurePathTask {
  const pool = SAME_LENGTH_SETS.filter((set) => set.key !== memory.lastSetKey);
  const picked = choose(pool.length > 0 ? pool : SAME_LENGTH_SETS);
  memory.lastSetKey = picked.key;
  return {
    kind: "measurePath",
    scene: "same",
    prompt: "Find the same length.",
    speakText: "Find the object with the same measurement.",
    badgeLabel: "Find the Same Length",
    unitEmoji: "block",
    unitLabel: "blocks",
    objectImageSrc: picked.target.image,
    objectLabel: picked.target.label,
    pathLength: picked.target.blocks,
    paths: shuffle(picked.options).map((item) => ({
      id: item.id,
      length: item.blocks,
      unitEmoji: "block",
      unitLabel: "blocks",
      objectImageSrc: item.image,
      objectLabel: item.label,
    })),
    correctPathId: picked.correctId,
    feedback: { correct: "Yes. They measure the same.", wrong: "Match the number of blocks." },
  };
}

export function generateY1MeasurelandsWeek1Lesson2Task(
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

  if (rotation === "A") return buildWhichIsLongerTask(memory);
  if (rotation === "B") return buildOrderTask(memory);
  return buildSameLengthTask(memory);
}

export function resetY1MeasurelandsWeek1Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY1MeasurelandsWeek1Lesson2QuizTasks(): PracticeTask[] {
  const longerA = measure("pencil", 7);
  const longerB = measure("crayon", 4);
  const shorterA = measure("snake", 12);
  const shorterB = measure("plank", 8);
  const greatestSet = [measure("carrot", 6), measure("cucumber", 8), measure("crayon", 4)];
  const orderedSet = [measure("plank", 8), measure("vine", 10), measure("snake", 12)];
  const sameSet = SAME_LENGTH_SETS[0]!;

  return [
    {
      kind: "measurePath",
      scene: "compare",
      prompt: "Which measurement is longer?",
      speakText: "Which measurement is longer?",
      badgeLabel: "Length Quiz",
      paths: shuffle([longerA, longerB]).map((item) => ({
        id: item.id,
        length: item.blocks,
        unitEmoji: "block",
        unitLabel: "blocks",
        objectImageSrc: item.image,
        objectLabel: item.label,
      })),
      correctPathId: longerA.id,
      feedback: { correct: "Correct!", wrong: "Compare the number of blocks." },
    },
    {
      kind: "measurePath",
      scene: "compare",
      prompt: "Which measurement is shorter?",
      speakText: "Which measurement is shorter?",
      badgeLabel: "Length Quiz",
      paths: shuffle([shorterA, shorterB]).map((item) => ({
        id: item.id,
        length: item.blocks,
        unitEmoji: "block",
        unitLabel: "blocks",
        objectImageSrc: item.image,
        objectLabel: item.label,
      })),
      correctPathId: shorterB.id,
      feedback: { correct: "Correct!", wrong: "Compare the number of blocks." },
    },
    {
      kind: "measurePath",
      scene: "order",
      prompt: "Put the measurements in order: shortest to longest.",
      speakText: "Put the measurements in order, from shortest to longest.",
      badgeLabel: "Length Quiz",
      paths: shuffle(orderedSet).map((item) => ({
        id: item.id,
        length: item.blocks,
        unitEmoji: "block",
        unitLabel: "blocks",
        objectImageSrc: item.image,
        objectLabel: item.label,
      })),
      correctOrderIds: orderedSet.map((item) => item.id),
      feedback: { correct: "Correct!", wrong: "Read the number of blocks." },
    },
    {
      kind: "measurePath",
      scene: "same",
      prompt: "Find the equal measurement.",
      speakText: "Find the equal measurement.",
      badgeLabel: "Length Quiz",
      unitEmoji: "block",
      unitLabel: "blocks",
      objectImageSrc: sameSet.target.image,
      objectLabel: sameSet.target.label,
      pathLength: sameSet.target.blocks,
      paths: sameSet.options.map((item) => ({
        id: item.id,
        length: item.blocks,
        unitEmoji: "block",
        unitLabel: "blocks",
        objectImageSrc: item.image,
        objectLabel: item.label,
      })),
      correctPathId: sameSet.correctId,
      feedback: { correct: "Correct!", wrong: "Match the number of blocks." },
    },
    {
      kind: "measurePath",
      scene: "compare",
      prompt: "Which measurement is greatest?",
      speakText: "Which measurement is greatest?",
      badgeLabel: "Length Quiz",
      paths: shuffle(greatestSet).map((item) => ({
        id: item.id,
        length: item.blocks,
        unitEmoji: "block",
        unitLabel: "blocks",
        objectImageSrc: item.image,
        objectLabel: item.label,
      })),
      correctPathId: "cucumber-8",
      feedback: { correct: "Correct!", wrong: "Look for the biggest number of blocks." },
    },
  ];
}
