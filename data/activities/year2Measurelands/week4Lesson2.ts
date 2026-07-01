import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 2 (Year 2) · Week 4 · Lesson 2 — "Estimate It" ──
// AC9M2M01. Estimation is a real Year-2 measurement skill: look at an object and
// guess its length BEFORE measuring. Different feel from L1 (real object photos,
// not rendered block-bars). THREE rotating activities, each drawing from a big
// pool of objects + randomised numbers, so the questions are endless:
//   1. estimateGuess  — pick the sensible guess (magnitude sense).
//   2. estimateSlider — drag a slider to your estimate, then check the real one.
//   3. estimateLonger — two objects; guess which is longer by eye.

type MeasurePathTask = Extract<PracticeTask, { kind: "measurePath" }>;

const OBJ = "/images/measurelands/measure-objects-3d";

// Big pool: label + real length in blocks. (Estimation only shows the photo, so
// exact tip-alignment doesn't matter.)
type EObj = { id: string; label: string; img: string; blocks: number };
const OBJECTS: EObj[] = [
  { id: "crayon", label: "Crayon", img: `${OBJ}/crayon.png`, blocks: 4 },
  { id: "worm", label: "Worm", img: `${OBJ}/worm.png`, blocks: 4 },
  { id: "carrot", label: "Carrot", img: `${OBJ}/carrot.png`, blocks: 5 },
  { id: "pencil", label: "Pencil", img: `${OBJ}/pencil.png`, blocks: 6 },
  { id: "cucumber", label: "Cucumber", img: `${OBJ}/cucumber.png`, blocks: 7 },
  { id: "plank", label: "Plank", img: `${OBJ}/plank.png`, blocks: 8 },
  { id: "snake", label: "Snake", img: `${OBJ}/snake.png`, blocks: 9 },
  { id: "vine", label: "Vine", img: `${OBJ}/vine.png`, blocks: 11 },
];

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"estimateGuess" | "estimateSlider" | "estimateLonger"> = [
  "estimateSlider", "estimateGuess", "estimateLonger", "estimateSlider", "estimateGuess", "estimateLonger",
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

function pickObj(memory: LessonMemory): EObj {
  const pool = OBJECTS.filter((o) => !memory.recent.includes(o.id));
  const o = choose(pool.length ? pool : OBJECTS);
  memory.recent = [o.id, ...memory.recent].slice(0, 4);
  return o;
}

type EstimateMeasurement = NonNullable<MeasurePathTask["estimateMeasurement"]>;

function buildMeasurementSpec(objectLengthUnits: number): EstimateMeasurement {
  const bigUnitSize = 2;
  const smallUnitSize = 1;
  const expectedBigCount = Math.floor(objectLengthUnits / bigUnitSize);
  const expectedSmallCount = objectLengthUnits / smallUnitSize;
  const gapAmount = objectLengthUnits % bigUnitSize;
  return {
    objectLengthUnits,
    bigUnitSize,
    smallUnitSize,
    expectedBigCount,
    expectedSmallCount,
    gapAmount,
    correctAnswer: expectedSmallCount,
    closeRange: [Math.max(1, expectedSmallCount - 1), expectedSmallCount + 1],
  };
}

function buildCloseOptions(correct: number): number[] {
  const options = new Set<number>([correct]);
  const offsets = shuffle([-1, 1, -2, 2]);
  for (const offset of offsets) {
    if (options.size >= 3) break;
    const next = correct + offset;
    if (next >= 1) options.add(next);
  }
  return shuffle([...options]);
}

function closeFeedback(label: string, correct: number) {
  return `Correct answer: ${correct} small blocks. Use the object length, then choose the estimate closest to ${label.toLowerCase()}.`;
}

function auditTask(task: MeasurePathTask): MeasurePathTask {
  if (process.env.NODE_ENV === "production") return task;

  const problems: string[] = [];
  if (task.scene === "estimateGuess") {
    const correct = task.correctAnswer;
    const options = task.options ?? [];
    const correctCount = options.filter((option) => option === correct).length;
    if (correctCount !== 1) problems.push("estimateGuess must include exactly one correct answer option");
    if (typeof correct === "number" && options.some((option) => Math.abs(option - correct) > 2)) {
      problems.push("estimateGuess options must stay close to the correct estimate");
    }
  }

  if (task.scene === "estimateSlider") {
    const correct = task.correctAnswer;
    if (typeof correct !== "number") problems.push("estimateSlider needs a numeric correctAnswer");
    if (typeof correct === "number" && (task.estimateMin ?? 0) > correct) problems.push("estimateMin is above correctAnswer");
    if (typeof correct === "number" && (task.estimateMax ?? 0) < correct) problems.push("estimateMax is below correctAnswer");
    if (typeof correct === "number" && Math.abs((task.estimateStart ?? correct) - correct) > 1) {
      problems.push("estimateStart should begin within one unit of the correct answer");
    }
    if (!task.feedback?.wrong?.includes("Correct answer:")) problems.push("wrong feedback must reveal the correct answer");
  }

  if (task.scene === "estimateLonger") {
    const pair = task.estimatePair ?? [];
    if (pair.length !== 2) problems.push("estimateLonger needs exactly two objects");
    if (pair.length === 2 && Math.abs(pair[0]!.blocks - pair[1]!.blocks) < 2) {
      problems.push("estimateLonger pair is too close to compare visually");
    }
    const correctCount = pair.filter((item) => item.id === task.correctItemId).length;
    if (correctCount !== 1) problems.push("estimateLonger must have one matching correct item");
    if (!task.feedback?.wrong?.includes("Correct answer:")) problems.push("wrong feedback must reveal the correct answer");
  }

  if (task.estimateMeasurement) {
    const m = task.estimateMeasurement;
    if (m.correctAnswer !== task.correctAnswer) problems.push("measurement spec correctAnswer must match task correctAnswer");
    if (m.expectedSmallCount !== m.objectLengthUnits / m.smallUnitSize) problems.push("small-unit count mismatch");
    if (m.expectedBigCount !== Math.floor(m.objectLengthUnits / m.bigUnitSize)) problems.push("big-unit count mismatch");
    if (m.gapAmount !== m.objectLengthUnits % m.bigUnitSize) problems.push("gap amount mismatch");
  }

  if (problems.length) {
    console.warn("[Measurelands W4 L2 audit]", task.scene, task.prompt, problems);
  }
  return task;
}

// ── Intro ──
function buildIntroTask(): MeasurePathTask {
  return {
    kind: "measurePath",
    scene: "intro",
    prompt: "Can you guess before you measure?",
    speakText:
      "Professor Gauge says: a good measurer can estimate. That means having a smart guess about how long something is, just by looking, before you measure it.",
    badgeLabel: "Meazurex Mission",
    betweenItem: { imageSrc: undefined, label: "Rope", wholeBlocks: 5, overhang: 0 },
    feedback: { correct: "Let's estimate!", wrong: "Let's get ready." },
  };
}

// ── Activity 1 — best guess (pick the sensible estimate) ──
function buildGuessTask(memory: LessonMemory): MeasurePathTask {
  const o = pickObj(memory);
  const measurement = buildMeasurementSpec(o.blocks);
  const options = buildCloseOptions(measurement.correctAnswer);
  return auditTask({
    kind: "measurePath",
    scene: "estimateGuess",
    prompt: `About how many blocks long is the ${o.label.toLowerCase()}?`,
    speakText: `Have a smart guess. About how many blocks long is the ${o.label.toLowerCase()}?`,
    badgeLabel: "Best Guess",
    objectImageSrc: o.img,
    objectLabel: o.label,
    estimateMeasurement: measurement,
    options,
    correctAnswer: measurement.correctAnswer,
    feedback: {
      correct: `Good estimate — about ${measurement.correctAnswer} small blocks!`,
      wrong: closeFeedback(o.label, measurement.correctAnswer),
    },
  });
}

// ── Activity 2 — guess & check (slider → reveal) ──
function buildSliderTask(memory: LessonMemory): MeasurePathTask {
  const o = pickObj(memory);
  const measurement = buildMeasurementSpec(o.blocks);
  const start = measurement.correctAnswer + (randInt(3) - 1);
  return auditTask({
    kind: "measurePath",
    scene: "estimateSlider",
    prompt: `Estimate the ${o.label.toLowerCase()}, then check.`,
    speakText: `Slide to your guess for how many blocks long the ${o.label.toLowerCase()} is, then check.`,
    badgeLabel: "Guess & Check",
    objectImageSrc: o.img,
    objectLabel: o.label,
    estimateMeasurement: measurement,
    estimateMin: Math.max(1, measurement.correctAnswer - 2),
    estimateMax: measurement.correctAnswer + 2,
    estimateStart: start,
    estimateTolerance: 1,
    correctAnswer: measurement.correctAnswer,
    feedback: {
      correct: `Great estimate — ${measurement.correctAnswer} small blocks is the exact measure.`,
      wrong: `Correct answer: ${measurement.correctAnswer} small blocks. Smaller units help you estimate within 1 block.`,
    },
  });
}

// ── Activity 3 — which is longer (estimate by eye) ──
function buildLongerTask(memory: LessonMemory): MeasurePathTask {
  const a = pickObj(memory);
  let b = pickObj(memory);
  let guard = 0;
  while (Math.abs(b.blocks - a.blocks) < 2 && guard < 20) { b = pickObj(memory); guard += 1; }
  const longer = a.blocks >= b.blocks ? a : b;
  return auditTask({
    kind: "measurePath",
    scene: "estimateLonger",
    prompt: "Which one looks longer?",
    speakText: "Guess by looking. Which one looks longer?",
    badgeLabel: "Which Is Longer?",
    estimatePair: shuffle([
      { id: a.id, imageSrc: a.img, label: a.label, blocks: a.blocks },
      { id: b.id, imageSrc: b.img, label: b.label, blocks: b.blocks },
    ]),
    correctItemId: longer.id,
    feedback: {
      correct: `Yes — the ${longer.label.toLowerCase()} is longer!`,
      wrong: `Correct answer: ${longer.label}. It measures ${longer.blocks} small blocks, which is longer.`,
    },
  });
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
  if (activity === "estimateGuess") return buildGuessTask(memory);
  if (activity === "estimateLonger") return buildLongerTask(memory);
  return buildSliderTask(memory);
}

export function resetY2MeasurelandsWeek4Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY2MeasurelandsWeek4Lesson2QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildGuessTask(seed),
    buildSliderTask(seed),
    buildLongerTask(seed),
    buildGuessTask(seed),
    buildLongerTask(seed),
  ];
}

export function auditY2MeasurelandsWeek4Lesson2TaskGeneration(iterations = 120) {
  if (process.env.NODE_ENV === "production") return;
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  for (let index = 0; index < iterations; index += 1) {
    const activity = ROTATION[index % ROTATION.length]!;
    if (activity === "estimateGuess") buildGuessTask(seed);
    else if (activity === "estimateLonger") buildLongerTask(seed);
    else buildSliderTask(seed);
  }
}
