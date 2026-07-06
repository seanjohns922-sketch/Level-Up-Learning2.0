import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { CAP_ML, CAP_L, capOptions, fmtCap, shuffle, choose, randInt, type CapItem } from "@/data/activities/year4Measurelands/week2Common";

// ── Measurelands · Level 4 · Week 2 · Lesson 2 — "Read the Measuring Jug" (AC9M4M01) ──
// Read capacity from scaled jugs, including partial graduations (0.5 L, 250 mL).
// Reuses the Level 3 Measuring Jug in precision mode (minors unlabelled).
// THREE rotating activities:
//   A. read   — read the jug (options bracket the true reading).
//   B. match  — three jugs; choose the one that shows the asked amount.
//   C. verify — Professor Gauge's reading vs the jug; choose the correct one.

type CapTask = Extract<PracticeTask, { kind: "capacity" }>;

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"read" | "match" | "verify"> = ["read", "match", "verify", "read", "match", "verify"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, recent: [] };
  lessonMemory.set(lessonId, created);
  return created;
}

function jugConfig(unit: "mL" | "L") {
  return unit === "L" ? { max: 3, majorStep: 1 } : { max: 1000, majorStep: 500 };
}

function pickCap(memory: LessonMemory): CapItem {
  const pool = randInt(2) === 0 ? CAP_ML : CAP_L;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const item = choose(pool);
    if (!memory.recent.includes(item.label)) {
      memory.recent.push(item.label);
      if (memory.recent.length > 6) memory.recent.shift();
      return item;
    }
  }
  return choose(pool);
}

function buildIntroTask(): CapTask {
  return {
    kind: "capacity",
    scene: "intro",
    precision: true,
    prompt: "Every line on the jug has meaning.",
    speakText:
      "Professor Gauge says: just like a ruler, every line on a measuring jug has meaning. Watch the water level and read it where it meets the marking — even between the numbered lines.",
    badgeLabel: "Meazurex Mission",
    object: { label: "measuring jug", emoji: "🏺" },
    feedback: { correct: "Let's read!", wrong: "Let's read!" },
  };
}

// Activity A — Read the Jug.
function buildReadTask(memory: LessonMemory): CapTask {
  const item = pickCap(memory);
  const cfg = jugConfig(item.unit);
  const { options, correct } = capOptions(item.value, item.unit);
  return {
    kind: "capacity",
    scene: "readJug",
    precision: true,
    prompt: `How much water is in the jug?`,
    speakText: `Read the measuring jug. How much water is in it?`,
    badgeLabel: "Read the Jug",
    jug: { value: item.value, unit: item.unit, max: cfg.max, majorStep: cfg.majorStep },
    numberOptions: options,
    correctNumber: correct,
    readUnit: item.unit,
    feedback: {
      correct: `Yes — the water is on ${fmtCap(item.value, item.unit)}.`,
      wrong: `Read the water level where it meets the mark — it's ${fmtCap(item.value, item.unit)}.`,
    },
  };
}

// Activity B — Choose the Correct Jug (three jugs, one matches).
function buildMatchTask(memory: LessonMemory): CapTask {
  const item = pickCap(memory);
  const cfg = jugConfig(item.unit);
  const step = item.unit === "L" ? 0.5 : 250;
  const values = shuffle([
    item.value,
    Math.min(cfg.max, item.value + step),
    Math.max(step, item.value - step),
  ]);
  // ensure distinct, correct present
  const uniqueVals = Array.from(new Set(values));
  while (uniqueVals.length < 3) uniqueVals.push(Math.min(cfg.max, (uniqueVals[uniqueVals.length - 1] ?? item.value) + step));
  const jugs = shuffle(
    uniqueVals.slice(0, 3).map((v, i) => ({ id: `j${i}`, value: v, unit: item.unit, max: cfg.max, majorStep: cfg.majorStep })),
  );
  const correct = jugs.find((j) => j.value === item.value)!;
  return {
    kind: "capacity",
    scene: "matchJug",
    precision: true,
    prompt: `Which jug holds ${fmtCap(item.value, item.unit)}?`,
    speakText: `Which measuring jug is filled to ${fmtCap(item.value, item.unit)}?`,
    badgeLabel: "Choose the Correct Jug",
    jugs,
    correctJugId: correct.id,
    feedback: {
      correct: "Yes — that water level is on the right mark.",
      wrong: `Find the jug filled to ${fmtCap(item.value, item.unit)}.`,
    },
  };
}

// Activity C — Which Jug Reading Is Correct? (Professor Gauge vs the jug).
function buildVerifyTask(memory: LessonMemory): CapTask {
  const item = pickCap(memory);
  const cfg = jugConfig(item.unit);
  const step = item.unit === "L" ? 0.5 : 250;
  const claim = Math.max(step, item.value - step);
  const { options, correct } = capOptions(item.value, item.unit);
  return {
    kind: "capacity",
    scene: "readJug",
    precision: true,
    prompt: "Which reading is correct?",
    speakText: `Professor Gauge read ${fmtCap(claim, item.unit)}. Read the jug yourself. Which reading is correct?`,
    badgeLabel: "Which Reading Is Correct?",
    jug: { value: item.value, unit: item.unit, max: cfg.max, majorStep: cfg.majorStep },
    statement: `Professor Gauge read ${fmtCap(claim, item.unit)}.`,
    numberOptions: options,
    correctNumber: correct,
    readUnit: item.unit,
    feedback: {
      correct: `Yes — the water is really on ${fmtCap(item.value, item.unit)}.`,
      wrong: `Read the water level — it's ${fmtCap(item.value, item.unit)}, not ${fmtCap(claim, item.unit)}.`,
    },
  };
}

export function generateY4MeasurelandsWeek2Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "match") return buildMatchTask(memory);
  if (activity === "verify") return buildVerifyTask(memory);
  return buildReadTask(memory);
}

export function resetY4MeasurelandsWeek2Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY4MeasurelandsWeek2Lesson2QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildReadTask(seed),
    buildMatchTask(seed),
    buildVerifyTask(seed),
    buildReadTask(seed),
    buildVerifyTask(seed),
  ];
}
