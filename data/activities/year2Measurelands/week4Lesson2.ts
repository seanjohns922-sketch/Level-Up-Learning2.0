import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 2 (Year 2) · Week 4 · Lesson 2 — "Estimate It" ──
// AC9M2M01. Estimation is a real Year-2 measurement skill: look at an object and
// guess its length BEFORE measuring. Different feel from L1 (real object photos,
// not rendered block-bars). THREE rotating activities, each drawing from a big
// pool of objects + randomised numbers, so the questions are endless:
//   1. estimateGuess  — pick the sensible guess (magnitude sense).
//   2. estimateSlider — drag a slider to your estimate, then check the real one.
//   3. estimateLonger — two objects; guess which is longer by eye.

type MeasurePathTask = Extract<PracticeTask, { kind: "measurePath" }>;

const OBJ = "/images/measurelands/measure-objects-3d";
const W1 = "/images/measurelands/week1-3d";

// Big pool: label + real length in blocks. (Estimation only shows the photo, so
// exact tip-alignment doesn't matter.)
type EObj = { id: string; label: string; img: string; blocks: number };
const OBJECTS: EObj[] = [
  { id: "crayon", label: "Crayon", img: `${OBJ}/crayon.png`, blocks: 4 },
  { id: "worm", label: "Worm", img: `${OBJ}/worm.png`, blocks: 4 },
  { id: "carrot", label: "Carrot", img: `${OBJ}/carrot.png`, blocks: 5 },
  { id: "pencil", label: "Pencil", img: `${OBJ}/pencil.png`, blocks: 6 },
  { id: "cucumber", label: "Cucumber", img: `${OBJ}/cucumber.png`, blocks: 7 },
  { id: "plank", label: "Plank", img: `${OBJ}/plank.png`, blocks: 8 },
  { id: "snake", label: "Snake", img: `${OBJ}/snake.png`, blocks: 9 },
  { id: "vine", label: "Vine", img: `${OBJ}/vine.png`, blocks: 11 },
  { id: "sapling", label: "Sapling", img: `${W1}/sapling.png`, blocks: 6 },
  { id: "ladder", label: "Ladder", img: `${W1}/ladder.png`, blocks: 8 },
  { id: "tree", label: "Tree", img: `${W1}/tree.png`, blocks: 12 },
  { id: "road", label: "Road", img: `${W1}/road.png`, blocks: 14 },
];

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"estimateGuess" | "estimateSlider" | "estimateLonger"> = [
  "estimateSlider", "estimateGuess", "estimateLonger", "estimateSlider", "estimateGuess", "estimateLonger",
];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, recent: [] };
  lessonMemory.set(lessonId, created);
  return created;
}

function randInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}
function choose<T>(items: T[]): T {
  return items[randInt(items.length)]!;
}
function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

function pickObj(memory: LessonMemory): EObj {
  const pool = OBJECTS.filter((o) => !memory.recent.includes(o.id));
  const o = choose(pool.length ? pool : OBJECTS);
  memory.recent = [o.id, ...memory.recent].slice(0, 4);
  return o;
}

// ── Intro ──
function buildIntroTask(): MeasurePathTask {
  return {
    kind: "measurePath",
    scene: "intro",
    prompt: "Can you guess before you measure?",
    speakText:
      "Professor Gauge says: a good measurer can estimate. That means having a smart guess about how long something is, just by looking, before you measure it.",
    badgeLabel: "Meazurex Mission",
    betweenItem: { imageSrc: undefined, label: "Rope", wholeBlocks: 5, overhang: 0 },
    feedback: { correct: "Let's estimate!", wrong: "Let's get ready." },
  };
}

// ── Activity 1 — best guess (pick the sensible estimate) ──
function buildGuessTask(memory: LessonMemory): MeasurePathTask {
  const o = pickObj(memory);
  const tooSmall = Math.max(1, Math.round(o.blocks / 2) - 1);
  const tooBig = o.blocks + 5 + randInt(4);
  const options = shuffle([tooSmall, o.blocks, tooBig]);
  return {
    kind: "measurePath",
    scene: "estimateGuess",
    prompt: `About how many blocks long is the ${o.label.toLowerCase()}?`,
    speakText: `Have a smart guess. About how many blocks long is the ${o.label.toLowerCase()}?`,
    badgeLabel: "Best Guess",
    objectImageSrc: o.img,
    objectLabel: o.label,
    options,
    correctAnswer: o.blocks,
    feedback: {
      correct: `Good estimate — about ${o.blocks} blocks!`,
      wrong: `Look at its size — about ${o.blocks} blocks is the sensible guess.`,
    },
  };
}

// ── Activity 2 — guess & check (slider → reveal) ──
function buildSliderTask(memory: LessonMemory): MeasurePathTask {
  const o = pickObj(memory);
  return {
    kind: "measurePath",
    scene: "estimateSlider",
    prompt: `Estimate the ${o.label.toLowerCase()}, then check.`,
    speakText: `Slide to your guess for how many blocks long the ${o.label.toLowerCase()} is, then check.`,
    badgeLabel: "Guess & Check",
    objectImageSrc: o.img,
    objectLabel: o.label,
    correctAnswer: o.blocks,
    feedback: {
      correct: "Great estimate — close!",
      wrong: "Good try — estimating gets easier with practice.",
    },
  };
}

// ── Activity 3 — which is longer (estimate by eye) ──
function buildLongerTask(memory: LessonMemory): MeasurePathTask {
  const a = pickObj(memory);
  let b = pickObj(memory);
  let guard = 0;
  while (b.blocks === a.blocks && guard < 10) { b = pickObj(memory); guard += 1; }
  const longer = a.blocks >= b.blocks ? a : b;
  return {
    kind: "measurePath",
    scene: "estimateLonger",
    prompt: "Which one looks longer?",
    speakText: "Guess by looking. Which one looks longer?",
    badgeLabel: "Which Is Longer?",
    estimatePair: shuffle([
      { id: a.id, imageSrc: a.img, label: a.label, blocks: a.blocks },
      { id: b.id, imageSrc: b.img, label: b.label, blocks: b.blocks },
    ]),
    correctItemId: longer.id,
    feedback: {
      correct: `Yes — the ${longer.label.toLowerCase()} is longer!`,
      wrong: `Look again — the ${longer.label.toLowerCase()} is longer.`,
    },
  };
}

export function generateY2MeasurelandsWeek4Lesson2Task(
  lessonId: string,
  _difficulty: Difficulty,
): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "estimateGuess") return buildGuessTask(memory);
  if (activity === "estimateLonger") return buildLongerTask(memory);
  return buildSliderTask(memory);
}

export function resetY2MeasurelandsWeek4Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY2MeasurelandsWeek4Lesson2QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildGuessTask(seed),
    buildSliderTask(seed),
    buildLongerTask(seed),
    buildGuessTask(seed),
    buildLongerTask(seed),
  ];
}
