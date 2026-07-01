import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 2 (Year 2) · Week 4 · Lesson 3 ──
// "Different Units, Different Counts" (AC9M2M01). Measure the SAME object with
// different informal units and see the count change — smaller units give a
// bigger count; the object stays the same length. Two activities (per the
// design spec), each drawing from a big object pool so questions are endless:
//   1. estimateReveal — object + measurement line; estimate how many paper
//      clips / cubes / dominoes fit, then reveal the actual counts.
//   2. measureIt      — object + measurement line; place paper clips one at a
//      time into the drop targets until it's fully measured.

type ToolTask = Extract<PracticeTask, { kind: "toolChoice" }>;

const MEASURE = "/images/measurelands/measure-objects-3d";
const EVERYDAY = "/images/measurelands/everyday-3d";
const TOOL = "/images/measurelands/tools-3d";

// Estimate units: sizes 1 / 2 / 3 (paper clip is the base). Object lengths are
// multiples of 6 so all three give a whole count.
type Unit = { id: string; label: string; iconKey: string; imageSrc?: string; size: number };
const PAPERCLIP: Unit = { id: "paperclips", label: "Paper Clips", iconKey: "paperclips", size: 1 };
const ESTIMATE_UNITS: Unit[] = [
  PAPERCLIP,
  { id: "cubes", label: "Cubes", iconKey: "cubes", imageSrc: `${TOOL}/tool-cubes.png`, size: 2 },
  { id: "dominoes", label: "Dominoes", iconKey: "dominoes", size: 3 },
];

type Obj = { id: string; label: string; img: string; len: number };
const OBJECTS: Obj[] = [
  { id: "pencil", label: "Pencil", img: `${MEASURE}/pencil.png`, len: 12 },
  { id: "crayon", label: "Crayon", img: `${MEASURE}/crayon.png`, len: 6 },
  { id: "carrot", label: "Carrot", img: `${MEASURE}/carrot.png`, len: 12 },
  { id: "worm", label: "Worm", img: `${MEASURE}/worm.png`, len: 6 },
  { id: "cucumber", label: "Cucumber", img: `${MEASURE}/cucumber.png`, len: 18 },
  { id: "snake", label: "Snake", img: `${MEASURE}/snake.png`, len: 18 },
  { id: "plank", label: "Plank", img: `${MEASURE}/plank.png`, len: 12 },
  { id: "vine", label: "Vine", img: `${MEASURE}/vine.png`, len: 12 },
  { id: "book", label: "Book", img: `${EVERYDAY}/object-book.png`, len: 12 },
];

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"estimateReveal" | "measureIt"> = [
  "estimateReveal", "measureIt", "estimateReveal", "measureIt", "estimateReveal", "measureIt",
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
function pick(memory: LessonMemory, pool: Obj[]): Obj {
  const avail = pool.filter((o) => !memory.recent.includes(o.id));
  const from = avail.length ? avail : pool;
  const o = from[randInt(from.length)]!;
  memory.recent = [o.id, ...memory.recent].slice(0, 3);
  return o;
}

function objectCard(o: Obj) {
  return { label: o.label, iconKey: o.id, imageSrc: o.img };
}

function buildIntroTask(): ToolTask {
  return {
    kind: "toolChoice",
    scene: "intro",
    prompt: "Different units, different counts.",
    speakText:
      "Professor Gauge says: we can measure the same object with lots of different units — paper clips, cubes, dominoes. The object stays the same length, but the count changes. Smaller units make a bigger count.",
    badgeLabel: "Meazurex Mission",
    introTools: ESTIMATE_UNITS.map((u) => ({ id: u.id, label: u.label, focus: `${u.size === 1 ? "smallest" : u.size === 3 ? "biggest" : "middle"} unit`, iconKey: u.iconKey, imageSrc: u.imageSrc })),
    feedback: { correct: "Let's measure the same object different ways!", wrong: "Let's get ready." },
  };
}

// Activity 1 — estimate how many of each unit, then reveal the actual counts.
function buildEstimateRevealTask(memory: LessonMemory): ToolTask {
  const o = pick(memory, OBJECTS);
  return {
    kind: "toolChoice",
    scene: "estimateReveal",
    prompt: `About how many of each unit long is the ${o.label.toLowerCase()}?`,
    speakText: `Estimate how many paper clips, cubes and dominoes long the ${o.label.toLowerCase()} is. Then reveal the real counts.`,
    badgeLabel: "Estimate Then Reveal",
    object: objectCard(o),
    objectLengthUnits: o.len,
    measurementRows: ESTIMATE_UNITS.map((u) => ({
      id: u.id,
      unitLabel: u.label,
      unitIconKey: u.iconKey,
      unitImageSrc: u.imageSrc,
      count: o.len / u.size,
    })),
    feedback: { correct: "Smaller units make a bigger count — same object, different numbers!", wrong: "" },
  };
}

// Activity 2 — place paper clips one at a time until the object is measured.
function buildMeasureItTask(memory: LessonMemory): ToolTask {
  const o = pick(memory, OBJECTS.filter((x) => x.len <= 12)); // keep the tap-count sensible
  return {
    kind: "toolChoice",
    scene: "measureIt",
    prompt: `Measure the ${o.label.toLowerCase()} with paper clips.`,
    speakText: `Use paper clips to show how long the ${o.label.toLowerCase()} is. Place one at a time.`,
    badgeLabel: "Measure It",
    object: objectCard(o),
    objectLengthUnits: o.len,
    completeMeasurement: { unitLabel: PAPERCLIP.label, unitIconKey: PAPERCLIP.iconKey, unitImageSrc: PAPERCLIP.imageSrc, shownCount: 0, targetCount: o.len },
    correctCount: o.len,
    feedback: { correct: `The ${o.label.toLowerCase()} is ${o.len} paper clips long!`, wrong: "" },
  };
}

export function generateY2MeasurelandsWeek4Lesson3Task(
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
  if (activity === "measureIt") return buildMeasureItTask(memory);
  return buildEstimateRevealTask(memory);
}

export function resetY2MeasurelandsWeek4Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY2MeasurelandsWeek4Lesson3QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildEstimateRevealTask(seed),
    buildMeasureItTask(seed),
    buildEstimateRevealTask(seed),
    buildMeasureItTask(seed),
    buildEstimateRevealTask(seed),
  ];
}
