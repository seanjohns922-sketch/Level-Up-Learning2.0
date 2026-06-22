import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 1 (Year 1) · Week 1 · Lesson 1 — "Measure with Blocks" ──
// AC9M1M01: measure & compare the length of objects using uniform informal
// units (blocks) laid end-to-end. This is the step up from Ground Level
// comparison: students now QUANTIFY length, not just judge "longer / shorter".
//   A — Count the Blocks   (scene "count",   object shown, MCQ on block length)
//   B — Who Is Longer?      (scene "compare", two measured objects, tap longer)
//   C — Measure the Trail   (scene "build",   lay blocks along the object)
// The illustrated block is the hero; objects reuse the Length realm 3D art.

type MeasurePathTask = Extract<PracticeTask, { kind: "measurePath" }>;

const BASE = "/images/measurelands/measure-objects-3d";

type MeasureObjectFamily = {
  id: string;
  label: string;
  image: string;
  lengths: number[];
};

type MeasureObject = {
  id: string;
  familyId: string;
  label: string;
  image: string;
  blocks: number;
};

// Straight, horizontal length objects so each visibly spans its block rod.
// Each family can now appear at multiple measured lengths, which gives the
// lesson a real spread instead of "pencil is always 6" every time.
const OBJECT_FAMILIES: MeasureObjectFamily[] = [
  { id: "crayon", label: "Crayon", image: `${BASE}/crayon.png`, lengths: [3, 4, 5] },
  { id: "carrot", label: "Carrot", image: `${BASE}/carrot.png`, lengths: [4, 5, 6] },
  { id: "pencil", label: "Pencil", image: `${BASE}/pencil.png`, lengths: [5, 6, 7] },
  { id: "cucumber", label: "Cucumber", image: `${BASE}/cucumber.png`, lengths: [6, 7, 8] },
  { id: "plank", label: "Plank", image: `${BASE}/plank.png`, lengths: [7, 8, 9] },
];

const OBJECTS: MeasureObject[] = OBJECT_FAMILIES.flatMap((family) =>
  family.lengths.map((blocks) => ({
    id: `${family.id}-${blocks}`,
    familyId: family.id,
    label: family.label,
    image: family.image,
    blocks,
  })),
);

type LessonMemory = { introShown: boolean; cursor: number; lastObjectId: string | null; lastFamilyId: string | null };

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastObjectId: null, lastFamilyId: null };
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

function pickObject(memory: LessonMemory): MeasureObject {
  const pool = OBJECTS.filter(
    (o) => o.id !== memory.lastObjectId && o.familyId !== memory.lastFamilyId,
  );
  const obj = choose(pool.length > 0 ? pool : OBJECTS.filter((o) => o.id !== memory.lastObjectId));
  memory.lastObjectId = obj.id;
  memory.lastFamilyId = obj.familyId;
  return obj;
}

function buildIntroTask(): MeasurePathTask {
  const pencil = OBJECTS.find((o) => o.id === "pencil-6")!;
  const cucumber = OBJECTS.find((o) => o.id === "cucumber-8")!;
  return {
    kind: "measurePath",
    scene: "intro",
    prompt: "We can measure with blocks.",
    speakText:
      "Meazurex has found an ancient measuring trail! In Ground Level we compared lengths. Now we become real measurers. We line up the same-sized blocks end to end, and count how many blocks long something is. Let's measure!",
    badgeLabel: "Meazurex Mission",
    teachingPaths: [
      { length: pencil.blocks, unitEmoji: "block", caption: `The pencil is ${pencil.blocks} blocks long.`, objectImageSrc: pencil.image, objectLabel: "Pencil" },
      { length: cucumber.blocks, unitEmoji: "block", caption: `The cucumber is ${cucumber.blocks} blocks long.`, objectImageSrc: cucumber.image, objectLabel: "Cucumber" },
    ],
    feedback: { correct: "Let's start measuring!", wrong: "Let's get ready." },
  };
}

// Activity A — Count the Blocks (object shown, MCQ on length).
function buildCountTask(memory: LessonMemory): MeasurePathTask {
  const obj = pickObject(memory);
  const length = obj.blocks;
  const candidates = [length - 2, length - 1, length + 1, length + 2].filter(
    (n) => n >= 2 && n <= 10 && n !== length,
  );
  const distractors = shuffle(candidates).slice(0, 2);
  const options = shuffle([length, ...distractors]);

  return {
    kind: "measurePath",
    scene: "count",
    prompt: `How many blocks long is the ${obj.label.toLowerCase()}?`,
    speakText: `How many blocks long is the ${obj.label.toLowerCase()}?`,
    badgeLabel: "Count the Blocks",
    unitLabel: "blocks",
    unitEmoji: "block",
    objectImageSrc: obj.image,
    objectLabel: obj.label,
    pathLength: length,
    options,
    correctAnswer: length,
    feedback: { correct: "You measured it!", wrong: "Count each block one by one." },
  };
}

// Activity B — Who Is Longer? (two measured objects, tap the longer).
function buildCompareTask(memory: LessonMemory): MeasurePathTask {
  const first = pickObject(memory);
  const secondPool = OBJECTS.filter(
    (o) => o.familyId !== first.familyId && Math.abs(o.blocks - first.blocks) >= 2,
  );
  const second = choose(
    secondPool.length > 0
      ? secondPool
      : OBJECTS.filter((o) => o.familyId !== first.familyId && o.blocks !== first.blocks),
  );
  memory.lastObjectId = second.id;
  memory.lastFamilyId = second.familyId;

  const longer = first.blocks > second.blocks ? first : second;
  const paths = shuffle([
    { id: first.id, length: first.blocks, unitEmoji: "block", unitLabel: "blocks", objectImageSrc: first.image, objectLabel: first.label },
    { id: second.id, length: second.blocks, unitEmoji: "block", unitLabel: "blocks", objectImageSrc: second.image, objectLabel: second.label },
  ]);

  return {
    kind: "measurePath",
    scene: "compare",
    prompt: "Which one is longer?",
    speakText: "Look at the blocks. Which one is longer?",
    badgeLabel: "Who Is Longer?",
    paths,
    correctPathId: longer.id,
    feedback: { correct: "That one measured more blocks!", wrong: "Count the blocks under each one." },
  };
}

// Activity C — Measure the Trail (lay blocks along the object).
function buildBuildTask(memory: LessonMemory): MeasurePathTask {
  const obj = pickObject(memory);
  return {
    kind: "measurePath",
    scene: "build",
    prompt: `Lay blocks along the ${obj.label.toLowerCase()}.`,
    speakText: `Lay the blocks end to end along the ${obj.label.toLowerCase()}. Make it ${obj.blocks} blocks long.`,
    badgeLabel: "Measure the Trail",
    unitLabel: "blocks",
    unitEmoji: "block",
    objectImageSrc: obj.image,
    objectLabel: obj.label,
    targetLength: obj.blocks,
    maxUnits: obj.blocks + 3,
    feedback: { correct: "Measured!", wrong: "Line the blocks up end to end." },
  };
}

export function generateY1MeasurelandsWeek1Lesson1Task(
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

  if (rotation === "A") return buildCountTask(memory);
  if (rotation === "B") return buildCompareTask(memory);
  return buildBuildTask(memory);
}

export function resetY1MeasurelandsWeek1Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the Week 1 weekly quiz (Lesson 1's contribution).
export function buildY1MeasurelandsWeek1Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = {
    introShown: true,
    cursor: 0,
    lastObjectId: null,
    lastFamilyId: null,
  };
  return [
    buildCountTask(seed),
    buildCountTask(seed),
    buildCompareTask(seed),
    buildCompareTask(seed),
    buildBuildTask(seed),
  ];
}
