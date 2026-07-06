import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { MASS_G, MASS_KG, massOptions, fmtMass, shuffle, choose, randInt, type MassItem } from "@/data/activities/year4Measurelands/week2Common";

// ── Measurelands · Level 4 · Week 2 · Lesson 1 — "Read the Scale" (AC9M4M01) ──
// Read analog and digital mass scales accurately, including partial graduations
// (0.5 kg, 50 g). Reuses the Level 3 Scale, now in precision mode.
// THREE rotating activities:
//   A. read   — read the scale (options bracket the true reading).
//   B. match  — three scales; choose the one that matches the object.
//   C. verify — Professor Gauge's reading vs the scale; choose the correct one.

type MassScaleTask = Extract<PracticeTask, { kind: "massScale" }>;

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

function pickMass(memory: LessonMemory): MassItem {
  const pool = randInt(2) === 0 ? MASS_G : MASS_KG;
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

function buildIntroTask(): MassScaleTask {
  return {
    kind: "massScale",
    scene: "intro",
    precision: true,
    scaleType: "dial",
    prompt: "Scientists trust the instrument, not their eyes.",
    speakText:
      "Professor Gauge says: scientists trust the measuring instrument, not their eyes. Read the scale carefully — the needle can rest between the numbered marks. A different instrument gives the same answer.",
    badgeLabel: "Meazurex Mission",
    object: { label: "melon", emoji: "🍈", mass: 2.5, unit: "kg" },
    feedback: { correct: "Let's read!", wrong: "Let's read!" },
  };
}

// Activity A — Read the Scale.
function buildReadTask(memory: LessonMemory): MassScaleTask {
  const object = pickMass(memory);
  const { options, correct } = massOptions(object.mass, object.unit);
  const scaleType = randInt(4) === 0 ? "digital" : "dial"; // mostly analog (the skill)
  return {
    kind: "massScale",
    scene: "read",
    precision: true,
    scaleType,
    prompt: `How much does the ${object.label} weigh?`,
    speakText: `Read the scale. How much does the ${object.label} weigh?`,
    badgeLabel: "Read the Scale",
    object,
    options,
    correctOption: correct,
    feedback: {
      correct: `Yes — the needle reads ${fmtMass(object.mass, object.unit)}.`,
      wrong: `Read where the needle points — it's ${fmtMass(object.mass, object.unit)}.`,
    },
  };
}

// Activity B — Match the Reading (three scales, one matches the object).
function buildMatchTask(memory: LessonMemory): MassScaleTask {
  const object = pickMass(memory);
  const step = object.unit === "kg" ? 0.5 : 50;
  const distractors = [object.mass + step, Math.max(step, object.mass - step)]
    .filter((m) => m !== object.mass);
  const scales = shuffle([
    { id: "ok", mass: object.mass, unit: object.unit, scaleType: "dial" as const },
    { id: "d1", mass: distractors[0]!, unit: object.unit, scaleType: "dial" as const },
    { id: "d2", mass: distractors[1] ?? object.mass + 2 * step, unit: object.unit, scaleType: "dial" as const },
  ]);
  return {
    kind: "massScale",
    scene: "match",
    precision: true,
    prompt: `Which scale shows the ${object.label} at ${fmtMass(object.mass, object.unit)}?`,
    speakText: `The ${object.label} weighs ${fmtMass(object.mass, object.unit)}. Which scale shows that reading?`,
    badgeLabel: "Match the Reading",
    object,
    scales,
    correctOptionId: "ok",
    feedback: {
      correct: "Yes — that needle points to the right mark.",
      wrong: `Look for the needle on ${fmtMass(object.mass, object.unit)}.`,
    },
  };
}

// Activity C — Which Reading Is Correct? (Professor Gauge vs the scale).
function buildVerifyTask(memory: LessonMemory): MassScaleTask {
  const object = pickMass(memory);
  const step = object.unit === "kg" ? 0.5 : 50;
  const claim = Math.max(step, object.mass - step); // Gauge rounds to a nearby mark
  const { options, correct } = massOptions(object.mass, object.unit);
  return {
    kind: "massScale",
    scene: "read",
    precision: true,
    scaleType: "dial",
    prompt: "Which reading is correct?",
    speakText: `Professor Gauge read ${fmtMass(claim, object.unit)}. Read the scale yourself. Which reading is correct?`,
    badgeLabel: "Which Reading Is Correct?",
    object,
    statement: `Professor Gauge read ${fmtMass(claim, object.unit)}.`,
    options,
    correctOption: correct,
    feedback: {
      correct: `Yes — the needle really reads ${fmtMass(object.mass, object.unit)}, not ${fmtMass(claim, object.unit)}.`,
      wrong: `Don't trust the claim — read the needle. It's ${fmtMass(object.mass, object.unit)}.`,
    },
  };
}

export function generateY4MeasurelandsWeek2Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
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

export function resetY4MeasurelandsWeek2Lesson1TaskSessionState() {
  lessonMemory.clear();
}

export function buildY4MeasurelandsWeek2Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildReadTask(seed),
    buildMatchTask(seed),
    buildVerifyTask(seed),
    buildReadTask(seed),
    buildVerifyTask(seed),
  ];
}
