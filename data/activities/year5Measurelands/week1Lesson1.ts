import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  OBJECTS, LADDER, SILLY, UNIT_BIN_LABEL, objectsByUnit,
  choose, shuffle, sample, randInt, type Attr, type MetricObject,
} from "@/data/activities/year5Measurelands/week1Common";

// ── Measurelands · Level 5 · Week 1 · Lesson 1 — "Choose the Best Unit" (AC9M5M01) ──
// Choose the most appropriate metric unit BEFORE measuring.
//   A. choose   — pick the best unit for an object.
//   B. sort     — sort objects into unit bins.
//   C. mistake  — spot Professor Gauge's silly unit.

type MetricTask = Extract<PracticeTask, { kind: "metricUnit" }>;

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"choose" | "sort" | "mistake"> = ["choose", "sort", "mistake", "choose", "sort", "mistake"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, recent: [] };
  lessonMemory.set(lessonId, created);
  return created;
}

function pickObject(memory: LessonMemory): MetricObject {
  for (let i = 0; i < 20; i += 1) {
    const o = choose(OBJECTS);
    if (!memory.recent.includes(o.label)) {
      memory.recent.push(o.label);
      if (memory.recent.length > 8) memory.recent.shift();
      return o;
    }
  }
  return choose(OBJECTS);
}

function buildIntroTask(): MetricTask {
  return {
    kind: "metricUnit",
    scene: "intro",
    attribute: "length",
    prompt: "Good measurers choose the unit first.",
    speakText:
      "Professor Gauge says: master measurers don't always use the same unit. They choose the one that gives the best measurement. A tiny ant is measured in millimetres, but a long highway is measured in kilometres.",
    badgeLabel: "Meazurex Mission",
    ladder: [...LADDER.length],
    feedback: { correct: "Let's decide!", wrong: "Let's decide!" },
  };
}

// Activity A — Which unit is best?
function buildChooseTask(memory: LessonMemory): MetricTask {
  const o = pickObject(memory);
  return {
    kind: "metricUnit",
    scene: "chooseUnit",
    attribute: o.attr,
    prompt: `Which unit is best for measuring the ${o.label}?`,
    speakText: `Which metric unit is the best choice for measuring the ${o.label}?`,
    badgeLabel: "Which Unit?",
    object: { label: o.label, emoji: o.emoji, context: o.context },
    options: o.options,
    correctOption: o.best,
    feedback: {
      correct: `Yes — the ${o.label} is measured in ${o.best}.`,
      wrong: `Think about its size — the ${o.label} is measured in ${o.best}.`,
    },
  };
}

// Activity B — Sort objects into unit bins.
const SORT_SETS: Array<{ attr: Attr; units: string[] }> = [
  { attr: "length", units: ["mm", "cm"] },
  { attr: "length", units: ["cm", "m"] },
  { attr: "length", units: ["m", "km"] },
  { attr: "mass", units: ["g", "kg"] },
  { attr: "capacity", units: ["mL", "L"] },
];

function buildSortTask(): MetricTask {
  const set = choose(SORT_SETS);
  const bins = set.units.map((u) => ({ unit: u, label: UNIT_BIN_LABEL[u] ?? u }));
  const items = set.units.flatMap((u) =>
    sample(objectsByUnit(u), 2).map((o, i) => ({ id: `${u}-${i}`, label: o.label, emoji: o.emoji, unit: u })),
  );
  return {
    kind: "metricUnit",
    scene: "sortBins",
    attribute: set.attr,
    prompt: "Sort each object into the unit you'd use to measure it.",
    speakText: "Tap an object, then tap the best unit to measure it. Sort them all.",
    badgeLabel: "Sort by Unit",
    bins,
    metricItems: shuffle(items),
    feedback: { correct: "Sorted — every object in its best unit!", wrong: "Not quite — think about the object's size." },
  };
}

// Activity C — Spot Professor Gauge's mistake.
function buildMistakeTask(): MetricTask {
  const s = choose(SILLY);
  return {
    kind: "metricUnit",
    scene: "spotMistake",
    attribute: s.attr,
    prompt: "Professor Gauge used the wrong unit. Which unit should it be?",
    speakText: `Professor Gauge said: ${s.statement} That's not sensible. Which unit should it be?`,
    badgeLabel: "Professor Gauge's Mistake",
    object: { label: s.label, emoji: s.emoji },
    statement: s.statement,
    options: s.options,
    correctOption: s.correctOption,
    feedback: {
      correct: `Yes — the ${s.label} should be measured in ${s.correctOption}.`,
      wrong: `Look at the size — it should be ${s.correctOption}.`,
    },
  };
}

export function generateY5MeasurelandsWeek1Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "sort") return buildSortTask();
  if (activity === "mistake") return buildMistakeTask();
  return buildChooseTask(memory);
}

export function resetY5MeasurelandsWeek1Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// Weekly-quiz contribution — MCQ-safe (choose / mistake are single-answer; the
// sort scene is determinate too, but the quiz uses the tap-one scenes).
export function buildY5MeasurelandsWeek1Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildChooseTask(seed),
    buildMistakeTask(),
    buildChooseTask(seed),
    buildMistakeTask(),
    buildChooseTask(seed),
  ];
}
