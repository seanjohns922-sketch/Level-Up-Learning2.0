import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { pickW1Object, rulerFor, shuffle, randInt, W1_MAX_RULER } from "@/data/activities/year4Measurelands/week1Common";

// ── Measurelands · Level 4 · Week 1 · Lesson 2 — "Measure Precisely" (AC9M4M01) ──
// Students actively MEASURE (not just read a prepared value). The precision ruler
// is reused. Headline misconceptions: starting at 1 cm, reading the wrong
// graduation, guessing, forgetting to check the finish point.
// THREE rotating activities:
//   A. measure     — measure one object (half-cm options).
//   B. whichRuler  — the same object on three rulers; pick the one aligned to 0
//                    AND read correctly (beats start-at-1 and wrong-graduation).
//   C. align       — line the object up: tap where measuring starts (the 0 mark).

type RulerTask = Extract<PracticeTask, { kind: "rulerMeasure" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"measure" | "whichRuler" | "align"> = [
  "measure", "whichRuler", "align", "measure", "whichRuler", "align",
];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function buildIntroTask(): RulerTask {
  return {
    kind: "rulerMeasure",
    scene: "intro",
    precision: true,
    prompt: "Good measurers don't rush.",
    speakText:
      "Professor Gauge says: good measurers don't rush. They line the object up carefully at zero, read every mark, and always check their answer. Start at zero, then read the final mark carefully.",
    badgeLabel: "Meazurex Mission",
    rulerCm: 12,
    object: { label: "crayon", icon: "🖍️", lengthCm: 8.5 },
    feedback: { correct: "Let's measure!", wrong: "Let's measure!" },
  };
}

// Activity A — Measure the Object.
function buildMeasureTask(): RulerTask {
  const object = pickW1Object();
  const len = object.lengthCm;
  const opts = [len - 1, len, len + 1].filter((v) => v >= 1);
  const options = opts.length === 3 ? opts : [len, len + 1, len + 2];
  return {
    kind: "rulerMeasure",
    scene: "measure",
    precision: true,
    prompt: `How long is the ${object.label}?`,
    speakText: `Measure the ${object.label}. Line it up at zero and read the final mark carefully.`,
    badgeLabel: "Measure the Object",
    rulerCm: rulerFor(len),
    object,
    options: shuffle(options),
    correctAnswer: len,
    feedback: {
      correct: `Yes — the ${object.label} is ${len} cm long.`,
      wrong: `Check from 0 to the finish point — it's ${len} cm.`,
    },
  };
}

// Activity B — Which Ruler Is Correct? (alignment + reading).
function buildWhichRulerTask(): RulerTask {
  const object = pickW1Object({ maxLen: 14.5 });
  const len = object.lengthCm;
  const misread = len + (randInt(2) === 0 ? 0.5 : -0.5); // read one graduation too far
  const options = shuffle([
    { id: "ok", startCm: 0, claim: len, correct: true },
    { id: "start1", startCm: 1, claim: len, correct: false }, // not lined up at 0
    { id: "misread", startCm: 0, claim: misread <= 0 ? len + 0.5 : misread, correct: false }, // wrong graduation
  ]);
  return {
    kind: "rulerMeasure",
    scene: "whichRuler",
    precision: true,
    prompt: `Which ruler measures the ${object.label} correctly?`,
    speakText: `Which ruler measures the ${object.label} correctly? Check where the object starts and where it finishes.`,
    badgeLabel: "Which Ruler Is Correct?",
    rulerCm: Math.min(W1_MAX_RULER, Math.ceil(len) + 4),
    object,
    rulerOptions: options,
    feedback: {
      correct: "Yes — lined up at 0 and read to the right mark.",
      wrong: "A correct measure starts at 0 and reads the mark the object finishes on.",
    },
  };
}

// Activity C — Align: tap where measuring starts.
function buildAlignTask(): RulerTask {
  const object = pickW1Object();
  return {
    kind: "rulerMeasure",
    scene: "startZero",
    precision: true,
    prompt: `Line up the ${object.label}. Where does measuring start?`,
    speakText: `Line up the ${object.label} like a scientist. Tap the mark where measuring starts.`,
    badgeLabel: "Measure Like a Scientist",
    rulerCm: rulerFor(object.lengthCm),
    object,
    tickOptions: [0, 1, 2],
    correctTick: 0,
    includeEdgeOption: true,
    feedback: {
      correct: "Yes — always line up with the 0 mark before you read.",
      wrong: "Not there. Accurate measuring always starts at 0, not the edge or the 1.",
    },
  };
}

export function generateY4MeasurelandsWeek1Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "whichRuler") return buildWhichRulerTask();
  if (activity === "align") return buildAlignTask();
  return buildMeasureTask();
}

export function resetY4MeasurelandsWeek1Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY4MeasurelandsWeek1Lesson2QuizTasks(): PracticeTask[] {
  return [
    buildMeasureTask(),
    buildWhichRulerTask(),
    buildAlignTask(),
    buildMeasureTask(),
    buildWhichRulerTask(),
  ];
}
