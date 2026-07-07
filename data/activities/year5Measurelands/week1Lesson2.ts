import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { choose } from "@/data/activities/year5Measurelands/week1Common";

// ── Measurelands · Level 5 · Week 1 · Lesson 2 — "Smaller Units for Accuracy" (AC9M5M01) ──
// Choose a SMALLER unit when a more accurate measurement is needed. Whole-unit
// reasoning only — no decimals or conversions (that's Week 2).
//   A. accuracy   — which unit measures this most accurately?
//   B. better     — which unit suits this job better?
//   C. challenge  — which unit gives the finer, more detailed reading?

type MetricTask = Extract<PracticeTask, { kind: "metricUnit" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"accuracy" | "better" | "challenge"> = ["accuracy", "better", "challenge", "accuracy", "better", "challenge"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

// Small, precise objects — a smaller unit gives a more accurate measurement.
const PRECISE: Array<{ label: string; emoji: string; best: string; options: string[]; context: string }> = [
  { label: "ring", emoji: "💍", best: "mm", options: ["mm", "cm", "m"], context: "jewellery maker" },
  { label: "coin", emoji: "🪙", best: "mm", options: ["mm", "cm", "m"], context: "coin collector" },
  { label: "key", emoji: "🔑", best: "mm", options: ["mm", "cm", "m"], context: "locksmith" },
  { label: "button", emoji: "🔘", best: "mm", options: ["mm", "cm", "m"], context: "tailor" },
  { label: "postage stamp", emoji: "📮", best: "mm", options: ["mm", "cm", "m"], context: "stamp album" },
  { label: "screw", emoji: "🔩", best: "mm", options: ["mm", "cm", "m"], context: "builder" },
];

function buildIntroTask(): MetricTask {
  return {
    kind: "metricUnit",
    scene: "intro",
    attribute: "length",
    prompt: "Sometimes a bigger unit isn't accurate enough.",
    speakText:
      "Professor Gauge says: sometimes a bigger unit isn't accurate enough. When you need a precise measurement — like a ring for a jeweller — you choose a smaller unit. A smaller unit shows more detail.",
    badgeLabel: "Meazurex Mission",
    ladder: [
      { unit: "m", example: "not detailed", emoji: "📏" },
      { unit: "cm", example: "more detailed", emoji: "📐" },
      { unit: "mm", example: "most detailed", emoji: "🔍" },
    ],
    feedback: { correct: "Let's get accurate!", wrong: "Let's get accurate!" },
  };
}

// Activity A — Which unit measures this most accurately?
function buildAccuracyTask(): MetricTask {
  const p = choose(PRECISE);
  return {
    kind: "metricUnit",
    scene: "accuracyPick",
    attribute: "length",
    prompt: `Which unit measures the ${p.label} most accurately?`,
    speakText: `A ${p.context} needs an exact size. Which unit measures the ${p.label} most accurately?`,
    badgeLabel: "Most Accurate Unit",
    object: { label: p.label, emoji: p.emoji, context: p.context },
    note: "For small, precise things, a smaller unit shows more detail.",
    options: p.options,
    correctOption: p.best,
    feedback: {
      correct: `Yes — ${p.best} gives the most accurate measurement for a ${p.label}.`,
      wrong: `A bigger unit is too rough — use ${p.best} for accuracy.`,
    },
  };
}

// Activity B — Which unit suits the job better? (two-option decision)
const BETTER: Array<{ scenario: string; emoji: string; context: string; options: string[]; correct: string; why: string }> = [
  { scenario: "measuring a shelf so a book fits", emoji: "📚", context: "at home", options: ["cm", "m"], correct: "cm", why: "cm gives the accuracy you need for a book to fit" },
  { scenario: "measuring a running track", emoji: "🏃", context: "at the oval", options: ["cm", "m"], correct: "m", why: "a track is long — metres are efficient" },
  { scenario: "measuring a garden bed for soil", emoji: "🌱", context: "in the garden", options: ["mm", "m"], correct: "m", why: "a garden bed is big — metres suit it" },
  { scenario: "measuring a phone screen", emoji: "📱", context: "in the shop", options: ["mm", "m"], correct: "mm", why: "a screen is small — millimetres are accurate" },
  { scenario: "cutting a piece of ribbon for a gift", emoji: "🎀", context: "wrapping presents", options: ["cm", "km"], correct: "cm", why: "ribbon is short — centimetres fit" },
];

function buildBetterTask(): MetricTask {
  const b = choose(BETTER);
  return {
    kind: "metricUnit",
    scene: "accuracyPick",
    attribute: "length",
    prompt: `Which unit is better for ${b.scenario}?`,
    speakText: `Which unit is better for ${b.scenario}?`,
    badgeLabel: "Better Measurement",
    object: { label: b.scenario, emoji: b.emoji, context: b.context },
    options: b.options,
    correctOption: b.correct,
    feedback: { correct: `Yes — ${b.why}.`, wrong: `Think about the size — ${b.why}.` },
  };
}

// Activity C — Which unit gives the finer, more detailed reading?
const CHALLENGE: Array<{ label: string; emoji: string; context: string; options: string[]; correct: string }> = [
  { label: "a puzzle piece", emoji: "🧩", context: "for an exact fit", options: ["mm", "cm"], correct: "mm" },
  { label: "a piece of Lego", emoji: "🧱", context: "for an exact fit", options: ["mm", "cm"], correct: "mm" },
  { label: "a finger", emoji: "🖐️", context: "for a ring size", options: ["mm", "cm"], correct: "mm" },
  { label: "a picture frame", emoji: "🖼️", context: "so the photo fits", options: ["mm", "cm"], correct: "mm" },
  { label: "a bookmark", emoji: "🔖", context: "to fit a book", options: ["mm", "cm"], correct: "mm" },
];

function buildChallengeTask(): MetricTask {
  const c = choose(CHALLENGE);
  return {
    kind: "metricUnit",
    scene: "accuracyPick",
    attribute: "length",
    prompt: `Which unit gives the more detailed measurement of ${c.label}?`,
    speakText: `You need an exact measurement of ${c.label} ${c.context}. Which unit gives the finer, more detailed reading?`,
    badgeLabel: "Accuracy Challenge",
    object: { label: c.label, emoji: c.emoji, context: c.context },
    note: "The smaller unit shows finer detail.",
    options: c.options,
    correctOption: c.correct,
    feedback: {
      correct: `Yes — ${c.correct} shows finer detail than the bigger unit.`,
      wrong: `The smaller unit gives more detail — that's ${c.correct}.`,
    },
  };
}

export function generateY5MeasurelandsWeek1Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "better") return buildBetterTask();
  if (activity === "challenge") return buildChallengeTask();
  return buildAccuracyTask();
}

export function resetY5MeasurelandsWeek1Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY5MeasurelandsWeek1Lesson2QuizTasks(): PracticeTask[] {
  return [buildAccuracyTask(), buildBetterTask(), buildChallengeTask(), buildAccuracyTask(), buildBetterTask()];
}
