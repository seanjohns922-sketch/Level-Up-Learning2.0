import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 2 (Year 2) · Week 4 · Lesson 1 — "Measure More Accurately" ──
// AC9M2M01: "...using appropriate uniform informal units AND SMALLER UNITS FOR
// ACCURACY WHEN NECESSARY." ACARA: when a measurement with larger units isn't
// precise (a leftover part), re-measure with smaller units to increase accuracy.
//
// One active story per turn (Notice → Solve → Explain, all inside the task):
//   1. Measure a rope with BIG blocks → it comes to "N blocks and a bit" (the
//      leftover part is highlighted — it doesn't fit exactly).
//   2. The child taps "Try smaller blocks" → half-size blocks tile the rope
//      EXACTLY (2N+1 of them) → count them.
// Payoff: smaller units fit better and give a bigger number. The rope is a
// length WE control with units laid along it, so nothing floats/misaligns.

type MeasurePathTask = Extract<PracticeTask, { kind: "measurePath" }>;

// Rope "objects" are simple named lengths (drawn, not photos) so big + small
// units always tile cleanly. Each has a range of sensible big-block lengths.
type Rope = { id: string; label: string; min: number; max: number };
const ROPES: Rope[] = [
  { id: "rope", label: "Rope", min: 4, max: 6 },
  { id: "ribbon", label: "Ribbon", min: 3, max: 5 },
  { id: "vine", label: "Vine", min: 5, max: 7 },
  { id: "string", label: "String", min: 3, max: 5 },
  { id: "snake", label: "Snake", min: 4, max: 6 },
  { id: "cable", label: "Cable", min: 5, max: 7 },
];

type LessonMemory = { introShown: boolean; lastId: string | null };
const lessonMemory = new Map<string, LessonMemory>();

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, lastId: null };
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

function pickRope(memory: LessonMemory): Rope {
  const pool = ROPES.filter((r) => r.id !== memory.lastId);
  const r = choose(pool.length ? pool : ROPES);
  memory.lastId = r.id;
  return r;
}

// ── Intro: Professor Gauge shows big blocks with a bit left over ──
function buildIntroTask(): MeasurePathTask {
  return {
    kind: "measurePath",
    scene: "intro",
    prompt: "What if the blocks don't fit?",
    speakText:
      "Professor Gauge says: sometimes the big blocks don't fit exactly — there's a little bit left over. When that happens, we can measure again with smaller blocks to get a closer, exact answer.",
    badgeLabel: "Meazurex Mission",
    betweenItem: { imageSrc: undefined, label: "Rope", wholeBlocks: 4, overhang: 0.5 },
    feedback: { correct: "Let's measure more accurately!", wrong: "Let's get ready." },
  };
}

// ── Activity: measure with big blocks, re-measure with small, count ──
function buildReMeasureTask(memory: LessonMemory): MeasurePathTask {
  const r = pickRope(memory);
  const wholeBig = r.min + randInt(r.max - r.min + 1);
  const smallCount = wholeBig * 2 + 1; // rope = wholeBig + a half → exact small count
  const options = shuffle([smallCount - 1, smallCount, smallCount + 1]);
  return {
    kind: "measurePath",
    scene: "reMeasure",
    prompt: `How many blocks long is the ${r.label.toLowerCase()}?`,
    speakText: `Measure the ${r.label.toLowerCase()} with the big blocks. They don't fit exactly — there's a bit left over.`,
    badgeLabel: "Measure More Accurately",
    objectLabel: r.label,
    pathLength: wholeBig,
    options,
    correctAnswer: smallCount,
    feedback: {
      correct: `Yes — ${smallCount}! Smaller blocks fit exactly and give a bigger number.`,
      wrong: "Count the small blocks along the rope one by one.",
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
  return buildReMeasureTask(memory);
}

export function resetY2MeasurelandsWeek4Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the weekly quiz.
export function buildY2MeasurelandsWeek4Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, lastId: null };
  return [
    buildReMeasureTask(seed),
    buildReMeasureTask(seed),
    buildReMeasureTask(seed),
    buildReMeasureTask(seed),
    buildReMeasureTask(seed),
  ];
}
