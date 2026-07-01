import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 2 (Year 2) · Week 4 · Lesson 1 — "Not Exact Yet" ──
// AC9M2M01. The lightbulb moment of the accuracy arc (Notice → Solve → Explain):
// students NOTICE that some measurements don't finish exactly on a block — they
// stop in between. One idea, one question: "Does it finish exactly on a block?"
//
// The coloured measurement BAR is the source of truth (full cells + a partial
// last cell = "not exact"); the object illustration is engagement only. No
// "between which two" and no "which needs a smaller unit" — those are L2/L3.

type MeasurePathTask = Extract<PracticeTask, { kind: "measurePath" }>;

const BASE = "/images/measurelands/measure-objects-3d";

type Family = { id: string; label: string; image: string; min: number; max: number };
const FAMILIES: Family[] = [
  { id: "crayon", label: "Crayon", image: `${BASE}/crayon.png`, min: 3, max: 5 },
  { id: "worm", label: "Worm", image: `${BASE}/worm.png`, min: 3, max: 5 },
  { id: "carrot", label: "Carrot", image: `${BASE}/carrot.png`, min: 4, max: 6 },
  { id: "pencil", label: "Pencil", image: `${BASE}/pencil.png`, min: 4, max: 6 },
  { id: "plank", label: "Plank", image: `${BASE}/plank.png`, min: 5, max: 7 },
  { id: "cucumber", label: "Cucumber", image: `${BASE}/cucumber.png`, min: 5, max: 7 },
  { id: "snake", label: "Snake", image: `${BASE}/snake.png`, min: 5, max: 7 },
  { id: "vine", label: "Vine", image: `${BASE}/vine.png`, min: 6, max: 8 },
];

const OVERHANGS = [0.3, 0.4, 0.5, 0.6, 0.7];

type LessonMemory = { introShown: boolean; cursor: number; lastKey: string | null };
const lessonMemory = new Map<string, LessonMemory>();
// Mostly the single Yes/No judgement; an occasional "tap the exact one" keeps a
// 9-minute lesson from being ten identical taps — same one concept throughout.
const ROTATION: Array<"notExact" | "tapExact"> = [
  "notExact", "notExact", "tapExact", "notExact", "notExact", "tapExact",
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

function pickFamily(memory: LessonMemory): Family {
  const pool = FAMILIES.filter((f) => f.id !== memory.lastKey);
  const f = choose(pool.length ? pool : FAMILIES);
  memory.lastKey = f.id;
  return f;
}

type Item = { id: string; imageSrc: string; label: string; wholeBlocks: number; overhang: number };

// `between = true` → the bar stops part-way past the last block (overhang > 0);
// `false` → an exact whole-block length that stops right on a gridline.
function buildItem(f: Family, between: boolean): Item {
  const whole = f.min + randInt(f.max - f.min + 1);
  const overhang = between ? choose(OVERHANGS) : 0;
  const id = between ? `${f.id}-${whole}-o${Math.round(overhang * 10)}` : `${f.id}-${whole}`;
  return { id, imageSrc: f.image, label: f.label, wholeBlocks: whole, overhang };
}

// ── Intro: Professor Gauge shows a bar that stops in between ──
function buildIntroTask(): MeasurePathTask {
  return {
    kind: "measurePath",
    scene: "intro",
    prompt: "Does the measurement always finish on a block?",
    speakText:
      "Professor Gauge says: sometimes our blocks don't fit perfectly. Watch the coloured bar. It doesn't stop on a block — it stops in between. Some measurements are not exact.",
    badgeLabel: "Meazurex Mission",
    betweenItem: { imageSrc: `${BASE}/pencil.png`, label: "Pencil", wholeBlocks: 4, overhang: 0.5 },
    feedback: { correct: "Let's spot the ones that stop in between!", wrong: "Let's get ready." },
  };
}

// ── Activity: Does it finish exactly on a block? (Yes / No · ~50/50) ──
function buildNotExactTask(memory: LessonMemory): MeasurePathTask {
  const between = randInt(2) === 0; // ~50% between
  const f = pickFamily(memory);
  const item = buildItem(f, between);
  return {
    kind: "measurePath",
    scene: "notExact",
    prompt: `Does the ${f.label.toLowerCase()} finish exactly on a block?`,
    speakText: `Look at where the bar stops. Does the ${f.label.toLowerCase()} finish exactly on a block?`,
    badgeLabel: "Exact or Not?",
    betweenItem: item,
    textOptions: ["Yes", "No"],
    correctTextOption: between ? "No" : "Yes",
    feedback: {
      correct: between ? "That's right — it stops in between, not exactly." : "Yes — it stops right on a block!",
      wrong: between ? "Look again — the bar stops in the gap, not on a line." : "Look again — the bar stops right on a line.",
    },
  };
}

// ── Variety: tap the object that finishes EXACTLY on a block ──
function buildTapExactTask(memory: LessonMemory): MeasurePathTask {
  const fa = pickFamily(memory);
  const fb = choose(FAMILIES.filter((f) => f.id !== fa.id));
  const exactItem = buildItem(fa, false);
  const betweenItem = buildItem(fb, true);
  return {
    kind: "measurePath",
    scene: "tapExact",
    prompt: "Tap the one that finishes exactly on a block.",
    speakText: "One bar stops right on a block. The other stops in between. Tap the one that finishes exactly on a block.",
    badgeLabel: "Tap the Exact One",
    betweenItems: shuffle([exactItem, betweenItem]),
    correctItemId: exactItem.id,
    feedback: {
      correct: "Yes — that bar stops right on a block!",
      wrong: "Look for the bar that stops right on a line, not in a gap.",
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
  if (rotation === "tapExact") return buildTapExactTask(memory);
  return buildNotExactTask(memory);
}

export function resetY2MeasurelandsWeek4Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the weekly quiz: mix of Yes/No and tap-the-exact-one.
export function buildY2MeasurelandsWeek4Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastKey: null };
  return [
    buildNotExactTask(seed),
    buildTapExactTask(seed),
    buildNotExactTask(seed),
    buildNotExactTask(seed),
    buildTapExactTask(seed),
  ];
}
