import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  OBJECTS, UNITS, fmtMixed, valueFor, readOptions, choose, shuffle,
} from "@/data/activities/year5Measurelands/week2Common";

// ── Measurelands · Level 5 · Week 2 · Lesson 1 — "Measure More Accurately" (AC9M5M01) ──
// One unit isn't always precise enough — add a smaller unit.
//   A. read      — read the mixed-unit measurement off the instrument.
//   B. accurate  — which reading is more accurate? (2 m vs 2 m 36 cm)
//   C. precise   — read a finer measurement off the instrument.

type PrecisionTask = Extract<PracticeTask, { kind: "precisionMeasure" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"read" | "accurate" | "precise"> = ["read", "accurate", "precise", "read", "accurate", "precise"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function buildIntroTask(): PrecisionTask {
  return {
    kind: "precisionMeasure",
    scene: "intro",
    attribute: "length",
    prompt: "Sometimes '2 metres' isn't accurate enough.",
    speakText:
      "Professor Gauge says: sometimes two metres isn't accurate enough. Real engineers add a smaller unit as well — like two metres and thirty-five centimetres — to measure exactly.",
    badgeLabel: "Meazurex Mission",
    valueSmall: 235,
    beforeAfter: { before: "2 m", after: "2 m 35 cm" },
    feedback: { correct: "Let's measure!", wrong: "Let's measure!" },
  };
}

// Activity A / C — Read the measurement off the instrument.
function buildReadTask(): PrecisionTask {
  const o = choose(OBJECTS);
  const value = valueFor(o);
  const { options, correct } = readOptions(value, o.attr);
  return {
    kind: "precisionMeasure",
    scene: "readMixed",
    attribute: o.attr,
    prompt: `Read the measurement of the ${o.label}.`,
    speakText: `Read the instrument carefully. What is the measurement of the ${o.label}?`,
    badgeLabel: "Read the Measurement",
    object: { label: o.label, emoji: o.emoji, context: o.context },
    valueSmall: value,
    options,
    correctOption: correct,
    feedback: {
      correct: `Yes — that reads ${correct}.`,
      wrong: `Read the whole unit, then count the smaller marks — it's ${correct}.`,
    },
  };
}

// Activity B — Which reading is more accurate?
function buildAccurateTask(): PrecisionTask {
  const o = choose(OBJECTS);
  const value = valueFor(o);
  const u = UNITS[o.attr];
  const whole = Math.floor(value / u.ratio);
  const rough = fmtMixed(whole * u.ratio, o.attr);
  const precise = fmtMixed(value, o.attr);
  return {
    kind: "precisionMeasure",
    scene: "whichAccurate",
    attribute: o.attr,
    prompt: `Which measurement of the ${o.label} is more accurate?`,
    speakText: `Which measurement of the ${o.label} tells you more — which is more accurate?`,
    badgeLabel: "Which Is More Accurate?",
    object: { label: o.label, emoji: o.emoji, context: o.context },
    note: "A second, smaller unit gives a more exact measurement.",
    options: shuffle([rough, precise]),
    correctOption: precise,
    feedback: {
      correct: `Yes — ${precise} is more accurate than ${rough}.`,
      wrong: `The extra smaller unit adds detail — ${precise} is more accurate.`,
    },
  };
}

export function generateY5MeasurelandsWeek2Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "accurate") return buildAccurateTask();
  return buildReadTask();
}

export function resetY5MeasurelandsWeek2Lesson1TaskSessionState() {
  lessonMemory.clear();
}

export function buildY5MeasurelandsWeek2Lesson1QuizTasks(): PracticeTask[] {
  return [buildReadTask(), buildAccurateTask(), buildReadTask(), buildAccurateTask(), buildReadTask()];
}
