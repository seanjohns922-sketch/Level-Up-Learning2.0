import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 2 (Year 2) · Week 4 · Lesson 1 — "Measure More Accurately" ──
// AC9M2M01: "...using appropriate uniform informal units AND SMALLER UNITS FOR
// ACCURACY WHEN NECESSARY." ACARA: when a big-unit measurement isn't precise (a
// leftover part), re-measure with smaller units. Verified vs ACARA + Twinkl.
//
// The single Week-4 accuracy lesson. THREE rotating activities:
//   1. measureYourWay — OPEN-ENDED: add big/small blocks however you like to
//                       measure it exactly (many valid answers).       (hero)
//   2. reMeasure      — big blocks leave a bit over → try smaller → count. (aha)
//   3. sameLength     — N big vs 2N small measure the SAME object: same length
//                       or longer? (bigger number ≠ longer — ACARA).  (reason)
//
// Objects are DRAWN lengths we control (so units tile exactly) and each has a
// distinct look; the label always matches the drawing (no "Vine" over a rope).

type MeasurePathTask = Extract<PracticeTask, { kind: "measurePath" }>;

// label MUST match a render style in MeasurelandsPathTaskCard (OBJECT_STYLES).
type Obj = { label: string; min: number; max: number };
const OBJECTS: Obj[] = [
  { label: "Rope", min: 4, max: 6 },
  { label: "Ribbon", min: 3, max: 5 },
  { label: "Tape", min: 4, max: 6 },
  { label: "Chain", min: 5, max: 7 },
  { label: "Vine", min: 5, max: 7 },
  { label: "Cord", min: 3, max: 5 },
];

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
const lessonMemory = new Map<string, LessonMemory>();
// measureYourWay (open-ended: add big/small blocks however you like) is the
// hero — it's a puzzle with many valid answers, so it never repeats. The other
// two vary their number answers.
const ROTATION: Array<"reMeasure" | "measureYourWay" | "sameLength"> = [
  "measureYourWay", "reMeasure", "measureYourWay", "sameLength", "measureYourWay", "reMeasure",
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
  const pool = OBJECTS.filter((o) => !memory.recent.includes(o.label));
  const obj = choose(pool.length ? pool : OBJECTS);
  memory.recent = [obj.label, ...memory.recent].slice(0, 3);
  const wholeBig = obj.min + randInt(obj.max - obj.min + 1);
  return { obj, wholeBig, smallCount: wholeBig * 2 + 1 }; // rope = wholeBig + a half
}
function countOptions(smallCount: number): number[] {
  return shuffle([smallCount - 1, smallCount, smallCount + 1]);
}

// ── Intro: Professor Gauge shows big blocks with a bit left over ──
function buildIntroTask(): MeasurePathTask {
  return {
    kind: "measurePath",
    scene: "intro",
    prompt: "What if the blocks don't fit?",
    speakText:
      "Professor Gauge says: sometimes the big blocks don't fit exactly — there's a little bit left over. When that happens, we measure again with smaller blocks to get a closer, exact answer.",
    badgeLabel: "Meazurex Mission",
    betweenItem: { imageSrc: undefined, label: "Rope", wholeBlocks: 4, overhang: 0.5 },
    feedback: { correct: "Let's measure more accurately!", wrong: "Let's get ready." },
  };
}

// ── Activity 1 — measure big, re-measure small, count ──
function buildReMeasureTask(memory: LessonMemory): MeasurePathTask {
  const { obj, wholeBig, smallCount } = pickObject(memory);
  return {
    kind: "measurePath",
    scene: "reMeasure",
    prompt: `Measure the ${obj.label.toLowerCase()} with the big blocks.`,
    speakText: `Measure the ${obj.label.toLowerCase()} with the big blocks. They don't fit exactly — there's a bit left over.`,
    badgeLabel: "Measure More Accurately",
    objectLabel: obj.label,
    pathLength: wholeBig,
    options: countOptions(smallCount),
    correctAnswer: smallCount,
    feedback: {
      correct: `Yes — ${smallCount}! Smaller blocks fit exactly and give a bigger number.`,
      wrong: "Count the small blocks along it one by one.",
    },
  };
}

// ── Activity 2 — OPEN-ENDED: add big and/or small blocks however you like to
//    measure the object exactly (many valid answers; a big block won't fit a
//    1-unit gap). Length is often odd so a small block is needed to finish. ──
function buildMeasureYourWayTask(memory: LessonMemory): MeasurePathTask {
  const { obj } = pickObject(memory);
  const L = 7 + randInt(6); // 7–12 small units
  return {
    kind: "measurePath",
    scene: "measureYourWay",
    prompt: `Measure the ${obj.label.toLowerCase()} your way — add big and small blocks.`,
    speakText: `Measure the ${obj.label.toLowerCase()} however you like. Add big blocks and small blocks until it is measured exactly, with no gap.`,
    badgeLabel: "Measure It Your Way",
    objectLabel: obj.label,
    correctAnswer: L,
    feedback: {
      correct: "Measured exactly! There's more than one way to do it.",
      wrong: "Keep going until there's no gap left.",
    },
  };
}

// ── Activity 3 — same length? (bigger number ≠ longer). N big blocks and 2N
//    small blocks measure the SAME object (both exact). ──
function buildSameLengthTask(memory: LessonMemory): MeasurePathTask {
  const { obj, wholeBig } = pickObject(memory);
  const smallExact = wholeBig * 2;
  const correct = "The same length";
  return {
    kind: "measurePath",
    scene: "compareAccuracy",
    prompt: `${wholeBig} big blocks or ${smallExact} small blocks. Is the ${obj.label.toLowerCase()} the same length, or longer?`,
    speakText: `The ${obj.label.toLowerCase()} is ${wholeBig} big blocks, or ${smallExact} small blocks. The small number is bigger. Is it the same length, or longer with the small blocks?`,
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

export function generateY2MeasurelandsWeek4Lesson1Task(
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
  if (activity === "measureYourWay") return buildMeasureYourWayTask(memory);
  if (activity === "sameLength") return buildSameLengthTask(memory);
  return buildReMeasureTask(memory);
}

export function resetY2MeasurelandsWeek4Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the weekly quiz: covers all three activities.
export function buildY2MeasurelandsWeek4Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildReMeasureTask(seed),
    buildMeasureYourWayTask(seed),
    buildSameLengthTask(seed),
    buildReMeasureTask(seed),
    buildSameLengthTask(seed),
  ];
}
