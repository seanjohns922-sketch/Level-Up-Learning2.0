import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 2 (Year 2) · Week 4 · Lesson 1 — "Measure More Accurately" ──
// AC9M2M01: "...using appropriate uniform informal units AND SMALLER UNITS FOR
// ACCURACY WHEN NECESSARY." ACARA: when a big-unit measurement isn't precise (a
// leftover part), re-measure with smaller units. Verified vs ACARA + Twinkl.
//
// THREE rotating activities (house rule: every lesson has 3), all teaching
// "smaller units measure more precisely":
//   1. reMeasure   — measure with big blocks (a bit left over) → tap "try
//                    smaller" → they tile exactly → count them.  (the skill)
//   2. moreOrFewer — predict: with smaller blocks, more or fewer? (always more;
//                    the inverse relationship)                    (reasoning)
//   3. countSmall  — the small blocks already fit exactly; count them. (fluency)
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

type LessonMemory = { introShown: boolean; cursor: number; lastLabel: string | null };
const lessonMemory = new Map<string, LessonMemory>();
// Three activities per lesson (hard rule), reMeasure as the anchor.
const ROTATION: Array<"reMeasure" | "moreOrFewer" | "countSmall"> = [
  "reMeasure", "moreOrFewer", "countSmall", "reMeasure", "countSmall", "moreOrFewer",
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

// ── Activity 2 — predict: smaller blocks → more or fewer? ──
function buildMoreOrFewerTask(memory: LessonMemory): MeasurePathTask {
  const { obj, wholeBig } = pickObject(memory);
  return {
    kind: "measurePath",
    scene: "moreOrFewer",
    prompt: `Smaller blocks — will there be MORE or FEWER?`,
    speakText: `The ${obj.label.toLowerCase()} is ${wholeBig} big blocks and a bit. If we measure with smaller blocks, will there be more blocks or fewer blocks?`,
    badgeLabel: "More or Fewer?",
    objectLabel: obj.label,
    pathLength: wholeBig,
    correctTextOption: "More",
    feedback: {
      correct: "More! Smaller blocks means you need more of them to measure the same length.",
      wrong: "Smaller blocks are little, so you need MORE of them to fill the same length.",
    },
  };
}

// ── Activity 3 — count the small blocks that fit exactly ──
function buildCountSmallTask(memory: LessonMemory): MeasurePathTask {
  const { obj, wholeBig, smallCount } = pickObject(memory);
  return {
    kind: "measurePath",
    scene: "countSmall",
    prompt: `How many small blocks long is the ${obj.label.toLowerCase()}?`,
    speakText: `The small blocks fit the ${obj.label.toLowerCase()} exactly. Count them. How many small blocks long is it?`,
    badgeLabel: "Count the Small Blocks",
    objectLabel: obj.label,
    pathLength: wholeBig,
    options: countOptions(smallCount),
    correctAnswer: smallCount,
    feedback: {
      correct: `Yes — ${smallCount} small blocks, and they fit exactly!`,
      wrong: "Count each small block along it, one by one.",
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
  if (activity === "moreOrFewer") return buildMoreOrFewerTask(memory);
  if (activity === "countSmall") return buildCountSmallTask(memory);
  return buildReMeasureTask(memory);
}

export function resetY2MeasurelandsWeek4Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the weekly quiz: covers all three activities.
export function buildY2MeasurelandsWeek4Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastLabel: null };
  return [
    buildReMeasureTask(seed),
    buildMoreOrFewerTask(seed),
    buildCountSmallTask(seed),
    buildReMeasureTask(seed),
    buildMoreOrFewerTask(seed),
  ];
}
