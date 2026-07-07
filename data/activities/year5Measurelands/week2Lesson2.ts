import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  OBJECTS, UNITS, fmtMixed, valueFor, readOptions, comparePair, COMPARE_ITEMS,
  choose, shuffle, randInt, type Attr,
} from "@/data/activities/year5Measurelands/week2Common";

// ── Measurelands · Level 5 · Week 2 · Lesson 2 — "Mixed Metric Units" (AC9M5M01) ──
// Read, compare and match mixed-unit measurements.
//   A. read     — read a mixed-unit measurement (any attribute).
//   B. larger   — which is larger? (includes cross-boundary traps)
//   C. match     — match an object to a realistic mixed measurement.

type PrecisionTask = Extract<PracticeTask, { kind: "precisionMeasure" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"read" | "larger" | "match"> = ["read", "larger", "match", "read", "larger", "match"];

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
    attribute: "mass",
    prompt: "Two units can describe a measurement properly.",
    speakText:
      "Professor Gauge says: sometimes we need more than one unit to describe a measurement properly. A parcel might be two kilograms and five hundred grams. Read both parts.",
    badgeLabel: "Meazurex Mission",
    valueSmall: 2500,
    beforeAfter: { before: "2 kg", after: "2 kg 500 g" },
    feedback: { correct: "Let's read!", wrong: "Let's read!" },
  };
}

// Activity A — Read a mixed-unit measurement.
function buildReadTask(): PrecisionTask {
  const o = choose(OBJECTS);
  const value = valueFor(o);
  const { options, correct } = readOptions(value, o.attr);
  return {
    kind: "precisionMeasure",
    scene: "readMixed",
    attribute: o.attr,
    prompt: `Read the measurement of the ${o.label}.`,
    speakText: `Read both parts. What is the measurement of the ${o.label}?`,
    badgeLabel: "Read the Measurement",
    object: { label: o.label, emoji: o.emoji, context: o.context },
    valueSmall: value,
    options,
    correctOption: correct,
    feedback: { correct: `Yes — ${correct}.`, wrong: `Read the big unit, then the smaller one — it's ${correct}.` },
  };
}

// Activity B — Which is larger? (trap-aware compare)
function buildLargerTask(): PrecisionTask {
  const attr: Attr = choose(["length", "mass", "capacity"] as Attr[]);
  const { a, b } = comparePair(attr);
  const item = COMPARE_ITEMS[attr];
  const correctSide: "a" | "b" = a >= b ? "a" : "b";
  return {
    kind: "precisionMeasure",
    scene: "compareMixed",
    attribute: attr,
    prompt: `Which is ${item.more}?`,
    speakText: `Read both parts of each measurement. Which is ${item.more}?`,
    badgeLabel: "Which Is Larger?",
    pair: {
      a: { valueSmall: a, label: item.a, emoji: item.emoji },
      b: { valueSmall: b, label: item.b, emoji: item.emoji },
    },
    compareMode: "larger",
    correctSide,
    feedback: {
      correct: `Yes — ${fmtMixed(Math.max(a, b), attr)} is ${item.more}.`,
      wrong: `Compare the big unit first, then the smaller one — ${fmtMixed(Math.max(a, b), attr)} is ${item.more}.`,
    },
  };
}

// Activity C — Match an object to a realistic mixed measurement.
function buildMatchTask(): PrecisionTask {
  const o = choose(OBJECTS);
  const u = UNITS[o.attr];
  const real = valueFor(o);
  // Distractors: far too small, and far too large — clearly unrealistic.
  const tiny = Math.max(u.step, Math.round((real / 10) / u.step) * u.step);
  const huge = real + u.ratio * (3 + randInt(3));
  const options = shuffle([fmtMixed(real, o.attr), fmtMixed(tiny, o.attr), fmtMixed(huge, o.attr)]);
  return {
    kind: "precisionMeasure",
    scene: "matchMixed",
    attribute: o.attr,
    prompt: `Which measurement matches the ${o.label}?`,
    speakText: `Which mixed-unit measurement is realistic for the ${o.label}?`,
    badgeLabel: "Match the Measurement",
    object: { label: o.label, emoji: o.emoji, context: o.context },
    options,
    correctOption: fmtMixed(real, o.attr),
    feedback: { correct: `Yes — a ${o.label} is about ${fmtMixed(real, o.attr)}.`, wrong: `Think about its real size — about ${fmtMixed(real, o.attr)}.` },
  };
}

export function generateY5MeasurelandsWeek2Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "larger") return buildLargerTask();
  if (activity === "match") return buildMatchTask();
  return buildReadTask();
}

export function resetY5MeasurelandsWeek2Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY5MeasurelandsWeek2Lesson2QuizTasks(): PracticeTask[] {
  return [buildReadTask(), buildLargerTask(), buildMatchTask(), buildLargerTask(), buildMatchTask()];
}
