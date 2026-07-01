import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 2 (Year 2) · Week 4 · Lesson 2 — "Which Measurement Is Closer?" ──
// AC9M2M01 (smaller units for accuracy) — the REASON step of the accuracy arc.
// The same object is shown measured two ways: big blocks (a bit left over) and
// small blocks (exact). Students decide which is exact, and why.
//
// THREE rotating activities (house rule), all the same comparison, framed 3 ways:
//   1. whichExact — tap the measurement that is exact (the small blocks).
//   2. exactNumber — what is the exact measurement? (pick the small count)
//   3. whyExact    — why do the small blocks measure it exactly? (no bit left over)

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

type LessonMemory = { introShown: boolean; cursor: number; lastLabel: string | null };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"whichExact" | "exactNumber" | "whyExact"> = [
  "whichExact", "exactNumber", "whyExact", "whichExact", "whyExact", "exactNumber",
];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastLabel: null };
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
  const pool = OBJECTS.filter((o) => o.label !== memory.lastLabel);
  const obj = choose(pool.length ? pool : OBJECTS);
  memory.lastLabel = obj.label;
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
    // no options / textOptions → tap-the-exact mode (small blocks is correct)
    feedback: {
      correct: "Yes — the small blocks fit exactly, so that measurement is the closest.",
      wrong: "That one has a bit left over — it isn't exact. Look for no leftover.",
    },
  };
}

// ── Activity 2 — pick the exact number ──
function buildExactNumberTask(memory: LessonMemory): MeasurePathTask {
  const { obj, wholeBig, smallCount } = pickObject(memory);
  return {
    kind: "measurePath",
    scene: "compareAccuracy",
    prompt: `What is the exact measurement of the ${obj.label.toLowerCase()}?`,
    speakText: `The small blocks fit the ${obj.label.toLowerCase()} exactly. What is the exact measurement?`,
    badgeLabel: "The Exact Measurement",
    objectLabel: obj.label,
    pathLength: wholeBig,
    options: shuffle([wholeBig, smallCount, smallCount + 1]),
    correctAnswer: smallCount,
    feedback: {
      correct: `Yes — ${smallCount}! The small blocks fit exactly, so that's the exact measurement.`,
      wrong: "The exact measurement is the small-block count, where nothing is left over.",
    },
  };
}

// ── Activity 3 — why are the small blocks exact? ──
function buildWhyExactTask(memory: LessonMemory): MeasurePathTask {
  const { obj, wholeBig, smallCount } = pickObject(memory);
  const correct = "They fit with no bit left over.";
  return {
    kind: "measurePath",
    scene: "compareAccuracy",
    prompt: `Why do the small blocks measure the ${obj.label.toLowerCase()} exactly?`,
    speakText: `Why do the small blocks measure the ${obj.label.toLowerCase()} exactly?`,
    badgeLabel: "Why Is It Exact?",
    objectLabel: obj.label,
    pathLength: wholeBig,
    correctAnswer: smallCount,
    textOptions: shuffle([correct, "They are a brighter colour.", "They are bigger blocks."]),
    correctTextOption: correct,
    feedback: {
      correct: "That's it — no bit is left over, so it's an exact measurement.",
      wrong: "Look at the blocks: the small ones leave nothing over. That's what makes it exact.",
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
  if (activity === "exactNumber") return buildExactNumberTask(memory);
  if (activity === "whyExact") return buildWhyExactTask(memory);
  return buildWhichExactTask(memory);
}

export function resetY2MeasurelandsWeek4Lesson2TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the weekly quiz: covers all three activities.
export function buildY2MeasurelandsWeek4Lesson2QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastLabel: null };
  return [
    buildWhichExactTask(seed),
    buildExactNumberTask(seed),
    buildWhyExactTask(seed),
    buildWhichExactTask(seed),
    buildExactNumberTask(seed),
  ];
}
