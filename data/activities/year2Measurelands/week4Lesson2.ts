import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 2 (Year 2) · Week 4 · Lesson 2 — "Which Measurement Is Closer?" ──
// AC9M2M01 (smaller units for accuracy) — the REASON step of the accuracy arc.
// The same object is shown measured two ways: big blocks (a bit left over) and
// small blocks (exact). Students decide which is exact, and why.
//
// THREE rotating activities (house rule), with one INTERACTIVE hands-on one:
//   1. whichExact — tap the exact measurement (card order shuffled).
//   2. fillSmall  — INTERACTIVE: tap to lay small blocks along the object and
//                   measure it yourself; the count reveals (varies).
//   3. sameLength — N big blocks vs 2N small blocks measure the SAME object:
//                   same length or longer? (bigger number ≠ longer — ACARA).

type MeasurePathTask = Extract<PracticeTask, { kind: "measurePath" }>;

// label MUST match a render style in MeasurelandsPathTaskCard (OBJECT_STYLES).
type Obj = { label: string; min: number; max: number };
const OBJECTS: Obj[] = [
  { label: "Rope", min: 4, max: 6 },
  { label: "Ribbon", min: 4, max: 6 },
  { label: "Tape", min: 4, max: 6 },
  { label: "Chain", min: 5, max: 7 },
  { label: "Vine", min: 5, max: 7 },
  { label: "Cord", min: 4, max: 6 },
];

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"whichExact" | "sameLength" | "fillSmall"> = [
  "fillSmall", "whichExact", "fillSmall", "sameLength", "fillSmall", "whichExact",
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

function pickObject(memory: LessonMemory): { obj: Obj; wholeBig: number; smallCount: number } {
  // Avoid reusing any object seen in the last 3 questions.
  const pool = OBJECTS.filter((o) => !memory.recent.includes(o.label));
  const obj = choose(pool.length ? pool : OBJECTS);
  memory.recent = [obj.label, ...memory.recent].slice(0, 3);
  const wholeBig = obj.min + randInt(obj.max - obj.min + 1);
  return { obj, wholeBig, smallCount: wholeBig * 2 + 1 };
}

// ── Intro ──
function buildIntroTask(): MeasurePathTask {
  return {
    kind: "measurePath",
    scene: "intro",
    prompt: "Which measurement is closer?",
    speakText:
      "Professor Gauge says: we can measure the same thing with big blocks or small blocks. The big blocks leave a bit over — but the small blocks fit exactly. The exact measurement is the closer one.",
    badgeLabel: "Meazurex Mission",
    betweenItem: { imageSrc: undefined, label: "Rope", wholeBlocks: 4, overhang: 0.5 },
    feedback: { correct: "Let's find the exact measurement!", wrong: "Let's get ready." },
  };
}

// ── Activity 1 — tap the exact measurement (small) ──
function buildWhichExactTask(memory: LessonMemory): MeasurePathTask {
  const { obj, wholeBig, smallCount } = pickObject(memory);
  return {
    kind: "measurePath",
    scene: "compareAccuracy",
    prompt: `Which measurement of the ${obj.label.toLowerCase()} is exact?`,
    speakText: `The ${obj.label.toLowerCase()} was measured two ways. Which measurement is exact — with no bit left over?`,
    badgeLabel: "Which Is Exact?",
    objectLabel: obj.label,
    pathLength: wholeBig,
    correctAnswer: smallCount,
    accuracyMode: "tapExact",
    feedback: {
      correct: "Yes — the small blocks fit exactly, so that measurement is the closest.",
      wrong: "That one has a bit left over — it isn't exact. Look for no leftover.",
    },
  };
}

// ── Activity 2 — same length? (bigger number ≠ longer). Both fit exactly:
//    N big blocks and 2N small blocks measure the SAME object. ──
function buildSameLengthTask(memory: LessonMemory): MeasurePathTask {
  const { obj, wholeBig } = pickObject(memory);
  const smallExact = wholeBig * 2;
  const correct = "The same length";
  return {
    kind: "measurePath",
    scene: "compareAccuracy",
    prompt: `${wholeBig} big blocks or ${smallExact} small blocks. Is the ${obj.label.toLowerCase()} the same length, or longer?`,
    speakText: `The ${obj.label.toLowerCase()} is ${wholeBig} big blocks, or ${smallExact} small blocks. The small number is bigger. Is the ${obj.label.toLowerCase()} the same length, or longer with the small blocks?`,
    badgeLabel: "Same Length?",
    objectLabel: obj.label,
    pathLength: wholeBig,
    accuracyMode: "sameLength",
    textOptions: shuffle([correct, "Longer with the small blocks"]),
    correctTextOption: correct,
    feedback: {
      correct: "The same length! Smaller blocks make a bigger number, but the object didn't get longer.",
      wrong: "It's the same object — the small blocks are just littler, so you need more of them.",
    },
  };
}

// ── Activity 3 — INTERACTIVE: tap to lay small blocks and measure it yourself
//    (count varies; kept to ~7–9 blocks so it's not too many taps). ──
function buildFillSmallTask(memory: LessonMemory): MeasurePathTask {
  const { obj } = pickObject(memory);
  const wholeBig = 3 + randInt(2); // 3–4 big → 7–9 small
  const smallCount = wholeBig * 2 + 1;
  return {
    kind: "measurePath",
    scene: "fillSmall",
    prompt: `Measure the ${obj.label.toLowerCase()} with small blocks.`,
    speakText: `Measure the ${obj.label.toLowerCase()} yourself. Tap to lay a small block, then the next, all the way along.`,
    badgeLabel: "Measure It Yourself",
    objectLabel: obj.label,
    pathLength: wholeBig,
    correctAnswer: smallCount,
    feedback: {
      correct: `${smallCount} small blocks — measured exactly!`,
      wrong: "Keep going — lay a small block all the way along.",
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
  if (activity === "sameLength") return buildSameLengthTask(memory);
  if (activity === "fillSmall") return buildFillSmallTask(memory);
  return buildWhichExactTask(memory);
}

export function resetY2MeasurelandsWeek4Lesson2TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the weekly quiz: covers all three activities.
export function buildY2MeasurelandsWeek4Lesson2QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildWhichExactTask(seed),
    buildFillSmallTask(seed),
    buildSameLengthTask(seed),
    buildWhichExactTask(seed),
    buildSameLengthTask(seed),
  ];
}
