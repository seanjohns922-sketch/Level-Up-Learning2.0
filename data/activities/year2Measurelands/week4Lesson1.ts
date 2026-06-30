import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 2 (Year 2) · Week 4 · Lesson 1 — "In Between" ──
// AC9M2M01. New Year-2 idea: a measurement is not always a whole number — an
// object can finish BETWEEN two whole units. (Purely conceptual: no rulers, no
// centimetres, no fractions/decimals — just "between 4 and 5 blocks".) This is
// the bridge into Lesson 2, where smaller units give a closer count.
//
// Reuses the measurePath card's new "between"/"accuracy" scenes, which render an
// object whose tip pokes past the last block + a faint ghost of the next block.

type MeasurePathTask = Extract<PracticeTask, { kind: "measurePath" }>;

const BASE = "/images/measurelands/measure-objects-3d";

// The 8 calibrated length illustrations (same assets as Week 1 — already have
// pixel-width visible ratios so they span the rod correctly). `min`/`max` are
// the sensible WHOLE-block counts for each object.
type Family = { id: string; label: string; image: string; min: number; max: number };
const FAMILIES: Family[] = [
  { id: "crayon", label: "Crayon", image: `${BASE}/crayon.png`, min: 3, max: 5 },
  { id: "worm", label: "Worm", image: `${BASE}/worm.png`, min: 3, max: 5 },
  { id: "carrot", label: "Carrot", image: `${BASE}/carrot.png`, min: 4, max: 6 },
  { id: "pencil", label: "Pencil", image: `${BASE}/pencil.png`, min: 5, max: 7 },
  { id: "plank", label: "Plank", image: `${BASE}/plank.png`, min: 5, max: 7 },
  { id: "cucumber", label: "Cucumber", image: `${BASE}/cucumber.png`, min: 6, max: 8 },
  { id: "snake", label: "Snake", image: `${BASE}/snake.png`, min: 6, max: 8 },
  { id: "vine", label: "Vine", image: `${BASE}/vine.png`, min: 6, max: 8 },
];

const OVERHANGS = [0.3, 0.4, 0.5, 0.6, 0.7];

type LessonMemory = { introShown: boolean; cursor: number; lastKey: string | null };
const lessonMemory = new Map<string, LessonMemory>();
// 60% exact / 40% between is honoured inside the "isExact" activity (see
// buildIsExactTask); the rotation keeps the three activity types varied.
const ROTATION: Array<"isExact" | "whichTwo" | "needsSmaller"> = [
  "isExact", "whichTwo", "needsSmaller", "isExact", "needsSmaller", "whichTwo",
];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastKey: null };
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

function pickFamily(memory: LessonMemory): Family {
  const pool = FAMILIES.filter((f) => f.id !== memory.lastKey);
  const f = choose(pool.length ? pool : FAMILIES);
  memory.lastKey = f.id;
  return f;
}

type BetweenItem = { id: string; imageSrc: string; label: string; wholeBlocks: number; overhang: number };

// `between = true` → tip pokes past the last block (whole capped at 7 so the
// ghost block is ≤ 8); `between = false` → an exact whole-block length.
function buildItem(f: Family, between: boolean): BetweenItem {
  const cap = between ? Math.min(f.max, 7) : f.max;
  const whole = f.min + randInt(Math.max(1, cap - f.min + 1));
  const overhang = between ? choose(OVERHANGS) : 0;
  const id = between ? `${f.id}-${whole}-o${Math.round(overhang * 10)}` : `${f.id}-${whole}`;
  return { id, imageSrc: f.image, label: f.label, wholeBlocks: whole, overhang };
}

// ── Intro: Professor Gauge shows a length that lands between two blocks ──
function buildIntroTask(): MeasurePathTask {
  return {
    kind: "measurePath",
    scene: "intro",
    prompt: "Is every measurement exact?",
    speakText:
      "Professor Gauge says: sometimes an object does not finish exactly on a block. Look — this pencil is longer than four blocks, but shorter than five. It is between four and five blocks. Some measurements are between.",
    badgeLabel: "Meazurex Mission",
    betweenItem: { imageSrc: `${BASE}/pencil.png`, label: "Pencil", wholeBlocks: 4, overhang: 0.5 },
    feedback: { correct: "Let's spot the between measurements!", wrong: "Let's get ready." },
  };
}

// ── Activity A — Is It Exact? (60% exact, 40% between) ──
function buildIsExactTask(memory: LessonMemory): MeasurePathTask {
  const between = randInt(10) >= 6; // ~40% between
  const f = pickFamily(memory);
  const item = buildItem(f, between);
  const n = item.wholeBlocks;
  const exact = `Yes, exactly ${n} blocks`;
  const above = `No — it's between ${n} and ${n + 1}`;
  const below = `No — it's between ${n - 1} and ${n}`;
  const correct = between ? above : exact;
  return {
    kind: "measurePath",
    scene: "between",
    prompt: `Is the ${f.label.toLowerCase()} exactly ${n} blocks long?`,
    speakText: `Look where the ${f.label.toLowerCase()} ends. Is it exactly ${n} blocks long?`,
    badgeLabel: "Is It Exact?",
    betweenItem: item,
    textOptions: shuffle([exact, above, below]),
    correctTextOption: correct,
    feedback: {
      correct: between ? "Yes — it finishes between two blocks." : "Yes — it finishes right on the block.",
      wrong: "Look carefully at where the object ends.",
    },
  };
}

// ── Activity B — Between Which Two? (always a between length) ──
function buildWhichTwoTask(memory: LessonMemory): MeasurePathTask {
  const f = pickFamily(memory);
  const item = buildItem(f, true);
  const n = item.wholeBlocks;
  const correct = `${n} and ${n + 1}`;
  return {
    kind: "measurePath",
    scene: "between",
    prompt: `The ${f.label.toLowerCase()} is between which two numbers?`,
    speakText: `The ${f.label.toLowerCase()} sticks past the last block. Between which two numbers does it finish?`,
    badgeLabel: "Between Which Two?",
    betweenItem: item,
    textOptions: shuffle([`${n - 1} and ${n}`, correct, `${n + 1} and ${n + 2}`]),
    correctTextOption: correct,
    feedback: {
      correct: `Yes — between ${n} and ${n + 1} blocks.`,
      wrong: "Find the last whole block, then the next one.",
    },
  };
}

// ── Activity C — Which Needs a Smaller Unit? (one exact, one between) ──
function buildNeedsSmallerTask(memory: LessonMemory): MeasurePathTask {
  const fa = pickFamily(memory);
  const fb = choose(FAMILIES.filter((f) => f.id !== fa.id));
  const exactItem = buildItem(fa, false);
  const betweenItem = buildItem(fb, true);
  const items = shuffle([exactItem, betweenItem]);
  return {
    kind: "measurePath",
    scene: "accuracy",
    prompt: "Which object needs a smaller measuring unit?",
    speakText:
      "One object finishes exactly on a block. The other finishes between two blocks. Which one needs a smaller measuring unit to measure it more exactly?",
    badgeLabel: "Which Needs a Smaller Unit?",
    betweenItems: items,
    correctItemId: betweenItem.id,
    feedback: {
      correct: "Yes — it sticks past the last block, so a smaller unit measures it more exactly.",
      wrong: "Look for the object that finishes between two blocks.",
    },
  };
}

export function generateY2MeasurelandsWeek4Lesson1Task(
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
  if (rotation === "whichTwo") return buildWhichTwoTask(memory);
  if (rotation === "needsSmaller") return buildNeedsSmallerTask(memory);
  return buildIsExactTask(memory);
}

export function resetY2MeasurelandsWeek4Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the weekly quiz: covers all three activities.
export function buildY2MeasurelandsWeek4Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastKey: null };
  return [
    buildIsExactTask(seed),
    buildWhichTwoTask(seed),
    buildNeedsSmallerTask(seed),
    buildIsExactTask(seed),
    buildWhichTwoTask(seed),
  ];
}
