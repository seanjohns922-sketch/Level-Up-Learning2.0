import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  UNITS, fmtMixed, comparePair, COMPARE_ITEMS,
  choose, shuffle, randInt, rangeStep, type Attr,
} from "@/data/activities/year5Measurelands/week2Common";

// ── Measurelands · Level 5 · Week 2 · Lesson 3 — "Precision Challenges" (AC9M5M01) ──
// Use accurate measurements to solve authentic problems.
//   A. construction — which board is long enough? (length, "at least")
//   B. science      — which holds more / is heavier? (compare)
//   C. mission      — which is enough + justify the choice.

type PrecisionTask = Extract<PracticeTask, { kind: "precisionMeasure" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"build" | "science" | "mission"> = ["build", "science", "mission", "build", "science", "mission"];

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
    prompt: "Engineers rely on accurate measurements.",
    speakText:
      "Professor Gauge says: scientists and engineers rely on accurate measurements to make good decisions. Use precise, mixed-unit measurements to solve each challenge.",
    badgeLabel: "Meazurex Mission",
    valueSmall: 185,
    beforeAfter: { before: "about 2 m", after: "exactly 1 m 85 cm" },
    feedback: { correct: "Let's solve!", wrong: "Let's solve!" },
  };
}

// Activity A — Construction: which board is long enough (at least X)?
function buildConstructionTask(): PrecisionTask {
  const u = UNITS.length;
  const need = 100 + rangeStep(20, 80, u.step) + (randInt(2) === 0 ? 100 : 0); // e.g. 1 m 40, 2 m 30
  const correct = need + rangeStep(u.step, 40, u.step); // long enough
  const short1 = need - rangeStep(u.step, 30, u.step);
  const short2 = need - rangeStep(35, 60, u.step);
  const options = shuffle([correct, short1, short2].map((v) => fmtMixed(v, "length")));
  return {
    kind: "precisionMeasure",
    scene: "problem",
    attribute: "length",
    prompt: "Which board is long enough?",
    speakText: `You need a board at least ${fmtMixed(need, "length")} long. Which board is long enough?`,
    badgeLabel: "Construction Challenge",
    object: { label: "timber board", emoji: "🪵", context: `needs at least ${fmtMixed(need, "length")}` },
    note: `Needs to be at least ${fmtMixed(need, "length")}.`,
    options,
    correctOption: fmtMixed(correct, "length"),
    feedback: {
      correct: `Yes — ${fmtMixed(correct, "length")} is long enough.`,
      wrong: `The others are too short — you need at least ${fmtMixed(need, "length")}.`,
    },
  };
}

// Activity B — Science: compare two measurements.
function buildScienceTask(): PrecisionTask {
  const attr: Attr = choose(["mass", "capacity"] as Attr[]);
  const { a, b } = comparePair(attr);
  const item = COMPARE_ITEMS[attr];
  const correctSide: "a" | "b" = a >= b ? "a" : "b";
  const label = attr === "mass" ? "Sample A" : "Beaker A";
  const labelB = attr === "mass" ? "Sample B" : "Beaker B";
  const emoji = attr === "mass" ? "⚗️" : "🧪";
  return {
    kind: "precisionMeasure",
    scene: "compareMixed",
    attribute: attr,
    prompt: attr === "mass" ? "Which sample is heavier?" : "Which beaker holds more?",
    speakText: `In the science lab, read both parts. Which is ${item.more}?`,
    badgeLabel: "Science Investigation",
    pair: {
      a: { valueSmall: a, label, emoji },
      b: { valueSmall: b, label: labelB, emoji },
    },
    compareMode: "larger",
    correctSide,
    feedback: {
      correct: `Yes — ${fmtMixed(Math.max(a, b), attr)} is ${item.more}.`,
      wrong: `Read both parts — ${fmtMixed(Math.max(a, b), attr)} is ${item.more}.`,
    },
  };
}

// Activity C — Mission: which container holds enough, then justify.
function buildMissionTask(asJustify = false): PrecisionTask {
  const u = UNITS.capacity;
  const need = 1000 + rangeStep(100, 800, u.step); // e.g. 1 L 500 mL
  if (asJustify) {
    return {
      kind: "precisionMeasure",
      scene: "problem",
      attribute: "capacity",
      prompt: "Why is this a good bottle for the juice?",
      speakText: `You chose a ${fmtMixed(need + 300, "capacity")} bottle for ${fmtMixed(need, "capacity")} of juice. Why is that a good choice?`,
      badgeLabel: "Precision Mission",
      object: { label: "juice bottle", emoji: "🧃", context: `${fmtMixed(need + 300, "capacity")} bottle · ${fmtMixed(need, "capacity")} juice` },
      reasonOptions: shuffle([
        "It holds a little more than we need",
        "It is the biggest bottle",
        "Bigger bottles are always better",
      ]),
      correctReason: "It holds a little more than we need",
      feedback: { correct: "Yes — it holds just enough, with a little to spare.", wrong: "We want just enough to fit the juice — a little more than we need." },
    };
  }
  const correct = need + rangeStep(u.step, 300, u.step);
  const small1 = need - rangeStep(u.step, 300, u.step);
  const small2 = need - rangeStep(350, 700, u.step);
  const options = shuffle([correct, small1, small2].map((v) => fmtMixed(v, "capacity")));
  return {
    kind: "precisionMeasure",
    scene: "problem",
    attribute: "capacity",
    prompt: "Which container holds enough juice?",
    speakText: `You need to pour ${fmtMixed(need, "capacity")} of juice. Which container holds enough?`,
    badgeLabel: "Precision Mission",
    object: { label: "juice", emoji: "🧃", context: `needs at least ${fmtMixed(need, "capacity")}` },
    note: `Needs at least ${fmtMixed(need, "capacity")}.`,
    options,
    correctOption: fmtMixed(correct, "capacity"),
    feedback: {
      correct: `Yes — ${fmtMixed(correct, "capacity")} holds enough.`,
      wrong: `The others are too small — you need at least ${fmtMixed(need, "capacity")}.`,
    },
  };
}

export function generateY5MeasurelandsWeek2Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "science") return buildScienceTask();
  if (activity === "mission") return buildMissionTask(randInt(2) === 0);
  return buildConstructionTask();
}

export function resetY5MeasurelandsWeek2Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY5MeasurelandsWeek2Lesson3QuizTasks(): PracticeTask[] {
  return [buildConstructionTask(), buildScienceTask(), buildMissionTask(false), buildScienceTask(), buildMissionTask(true)];
}
