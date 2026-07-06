import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { randomShape, randRange, shuffle, randInt } from "@/data/activities/year4Measurelands/week4Common";

// ── Measurelands · Level 4 · Week 4 · Lesson 1 — "Measure the Outside" (AC9M4M02) ──
// Perimeter starts with accurate measurement. Reuses the Precision Ruler to
// measure sides, and the surveyor shape to measure every side.
// THREE rotating activities:
//   A. measureSide  — read one fence side on the ruler.
//   B. measureEvery — tap every side of the land to measure it (don't miss one).
//   C. whichRuler   — which ruler measures the side correctly?

type RulerTask = Extract<PracticeTask, { kind: "rulerMeasure" }>;
type SurveyorTask = Extract<PracticeTask, { kind: "perimeterCalc" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"measureSide" | "measureEvery" | "whichRuler"> = [
  "measureSide", "measureEvery", "whichRuler", "measureSide", "measureEvery", "whichRuler",
];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function buildIntroTask(): SurveyorTask {
  return {
    kind: "perimeterCalc",
    scene: "intro",
    prompt: "Before we find the perimeter, we measure every side.",
    speakText:
      "Professor Gauge says: perimeter is the total distance all the way around the outside of a shape. Before we can find it, we measure every side, then add them together. A good surveyor measures the whole boundary — no side left out.",
    badgeLabel: "Meazurex Mission",
    poly: [[0, 0], [6, 0], [6, 4], [0, 4]],
    sideLabels: [6, 4, 6, 4],
    perimeter: 20,
    unit: "cm",
    theme: "garden",
    shapeName: "garden bed",
    feedback: { correct: "Let's survey!", wrong: "Let's survey!" },
  };
}

// Activity A — Measure a Side (ruler).
function buildMeasureSideTask(): RulerTask {
  const len = randRange(4, 18);
  const opts = [len - 1, len, len + 1].filter((v) => v >= 1);
  const options = opts.length === 3 ? opts : [len, len + 1, len + 2];
  return {
    kind: "rulerMeasure",
    scene: "measure",
    precision: true,
    prompt: "How long is this fence side?",
    speakText: "Measure this fence side with the ruler. How long is it?",
    badgeLabel: "Measure a Side",
    rulerCm: Math.min(20, len + 1 + randInt(3)),
    object: { label: "fence side", icon: "🪵", lengthCm: len },
    options: shuffle(options),
    correctAnswer: len,
    feedback: {
      correct: `Yes — this side is ${len} cm.`,
      wrong: `Line it up at 0 and read the end — it's ${len} cm.`,
    },
  };
}

// Activity B — Measure Every Side (tap each side).
function buildMeasureEveryTask(): SurveyorTask {
  const shape = randomShape("cm", { allowL: true, min: 3, max: 8 });
  return {
    kind: "perimeterCalc",
    scene: "measureEvery",
    prompt: `Measure every side of the ${shape.shapeName}.`,
    speakText: `Tap every side of the ${shape.shapeName} to measure it. Don't miss a side.`,
    badgeLabel: "Measure Every Side",
    poly: shape.poly,
    sideLabels: shape.sideLabels,
    perimeter: shape.perimeter,
    unit: shape.unit,
    theme: shape.theme,
    shapeName: shape.shapeName,
    feedback: {
      correct: "Every side measured — now you could add them!",
      wrong: "Measure every side.",
    },
  };
}

// Activity C — Which Ruler Is Correct? (reuse the Week 1 mechanic).
function buildWhichRulerTask(): RulerTask {
  const len = randRange(4, 13);
  const misread = len + (randInt(2) === 0 ? 0.5 : -0.5);
  const options = shuffle([
    { id: "ok", startCm: 0, claim: len, correct: true },
    { id: "start1", startCm: 1, claim: len, correct: false },
    { id: "misread", startCm: 0, claim: misread <= 0 ? len + 0.5 : misread, correct: false },
  ]);
  return {
    kind: "rulerMeasure",
    scene: "whichRuler",
    precision: true,
    prompt: "Which ruler measures the side correctly?",
    speakText: "Which ruler measures the fence side correctly? Check where it starts and finishes.",
    badgeLabel: "Choose the Correct Measurement",
    rulerCm: Math.min(20, Math.ceil(len) + 4),
    object: { label: "fence side", icon: "🪵", lengthCm: len },
    rulerOptions: options,
    feedback: {
      correct: "Yes — lined up at 0 and read to the right mark.",
      wrong: "A correct measure starts at 0 and reads where the side finishes.",
    },
  };
}

export function generateY4MeasurelandsWeek4Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "measureEvery") return buildMeasureEveryTask();
  if (activity === "whichRuler") return buildWhichRulerTask();
  return buildMeasureSideTask();
}

export function resetY4MeasurelandsWeek4Lesson1TaskSessionState() {
  lessonMemory.clear();
}

export function buildY4MeasurelandsWeek4Lesson1QuizTasks(): PracticeTask[] {
  // Determinate tasks only (measureEvery always completes, so it's not assessed).
  return [buildMeasureSideTask(), buildWhichRulerTask(), buildMeasureSideTask(), buildWhichRulerTask(), buildMeasureSideTask()];
}
