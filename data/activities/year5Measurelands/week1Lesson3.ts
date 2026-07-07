import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { OBJECTS, choose, shuffle, type MetricObject } from "@/data/activities/year5Measurelands/week1Common";

// ── Measurelands · Level 5 · Week 1 · Lesson 3 — "Metric Decisions" (AC9M5M01) ──
// Choose AND justify: pick the right instrument and the right unit, then explain.
//   A. toolbox     — builder's toolbox: choose the tool AND the unit.
//   B. scientist   — choose the right unit for a science measurement.
//   C. justify     — explain why a unit is the best choice.

type MetricTask = Extract<PracticeTask, { kind: "metricUnit" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"toolbox" | "scientist" | "justify"> = ["toolbox", "scientist", "justify", "toolbox", "scientist", "justify"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

const RULER = { id: "ruler", label: "Ruler", emoji: "📏" };
const WHEEL = { id: "wheel", label: "Trundle wheel", emoji: "🎡" };
const SCALES = { id: "scales", label: "Kitchen scales", emoji: "⚖️" };
const JUG = { id: "jug", label: "Measuring jug", emoji: "🥛" };

function buildIntroTask(): MetricTask {
  return {
    kind: "metricUnit",
    scene: "intro",
    attribute: "length",
    prompt: "Engineers decide the smartest way to measure.",
    speakText:
      "Professor Gauge says: engineers and scientists don't just measure — they decide the smartest way to measure. First choose the right tool, then the right unit, and be ready to explain why.",
    badgeLabel: "Meazurex Mission",
    ladder: [
      { unit: "Choose", example: "the tool", emoji: "🧰" },
      { unit: "Choose", example: "the unit", emoji: "📐" },
      { unit: "Explain", example: "your thinking", emoji: "💬" },
    ],
    feedback: { correct: "Let's decide!", wrong: "Let's decide!" },
  };
}

// Activity A — Builder's toolbox: choose the tool AND the unit.
const TOOLBOX: Array<{ job: string; emoji: string; tools: typeof RULER[]; correctTool: string; options: string[]; correctOption: string; why: string }> = [
  { job: "build a fence around a paddock", emoji: "🚧", tools: [RULER, WHEEL, SCALES], correctTool: "wheel", options: ["cm", "m", "km"], correctOption: "m", why: "a trundle wheel measures the long distance in metres" },
  { job: "measure a coin for a collection", emoji: "🪙", tools: [RULER, WHEEL, SCALES], correctTool: "ruler", options: ["mm", "cm", "m"], correctOption: "mm", why: "a ruler measures the tiny coin in millimetres" },
  { job: "measure a football field", emoji: "🏉", tools: [RULER, WHEEL, SCALES], correctTool: "wheel", options: ["cm", "m", "km"], correctOption: "m", why: "a trundle wheel measures the field in metres" },
  { job: "weigh a puppy at the vet", emoji: "🐕", tools: [SCALES, RULER, JUG], correctTool: "scales", options: ["g", "kg"], correctOption: "kg", why: "kitchen scales weigh the puppy in kilograms" },
  { job: "measure medicine for an experiment", emoji: "🧪", tools: [JUG, SCALES, RULER], correctTool: "jug", options: ["mL", "L"], correctOption: "mL", why: "a measuring jug reads small amounts in millilitres" },
];

function buildToolboxTask(): MetricTask {
  const t = choose(TOOLBOX);
  return {
    kind: "metricUnit",
    scene: "toolAndUnit",
    attribute: "length",
    prompt: `You need to ${t.job}. Choose the tool and the unit.`,
    speakText: `You need to ${t.job}. First choose the right tool, then the right unit.`,
    badgeLabel: "Builder's Toolbox",
    object: { label: t.job, emoji: t.emoji, context: "on the job" },
    tools: shuffle(t.tools),
    correctTool: t.correctTool,
    options: t.options,
    correctOption: t.correctOption,
    feedback: { correct: `Yes — ${t.why}.`, wrong: `Match the tool and unit to the job — ${t.why}.` },
  };
}

// Activity B — Scientist's investigation: choose the right unit for a measurement.
function buildScientistTask(): MetricTask {
  const pool: MetricObject[] = OBJECTS.filter((o) => ["mm", "kg", "g", "L", "mL", "m"].includes(o.best));
  const o = choose(pool);
  return {
    kind: "metricUnit",
    scene: "chooseUnit",
    attribute: o.attr,
    prompt: `Scientist's log: which unit records the ${o.label} best?`,
    speakText: `In the science lab, which metric unit records the ${o.label} best?`,
    badgeLabel: "Scientist's Investigation",
    object: { label: o.label, emoji: o.emoji, context: "in the lab" },
    options: o.options,
    correctOption: o.best,
    feedback: {
      correct: `Yes — record the ${o.label} in ${o.best}.`,
      wrong: `Think about the ${o.attr} — record it in ${o.best}.`,
    },
  };
}

// Activity C — Justify the choice.
const JUSTIFY: Array<{ label: string; emoji: string; prompt: string; reasons: string[]; correct: string }> = [
  {
    label: "school oval", emoji: "🏟️",
    prompt: "You measured the oval in metres. Why is that the best unit?",
    reasons: ["It matches the size — not too big or too small", "Because metres are always best", "So the number has no decimals"],
    correct: "It matches the size — not too big or too small",
  },
  {
    label: "ring", emoji: "💍",
    prompt: "You measured the ring in millimetres. Why is that the best unit?",
    reasons: ["A small unit gives an accurate measurement", "Small units are always better", "Millimetres are easier to say"],
    correct: "A small unit gives an accurate measurement",
  },
  {
    label: "swimming pool", emoji: "🏊",
    prompt: "You measured the pool's water in litres. Why is that the best unit?",
    reasons: ["Litres suit a large amount of water", "Litres are the biggest unit", "Millilitres are too hard to spell"],
    correct: "Litres suit a large amount of water",
  },
  {
    label: "hiking trail", emoji: "🥾",
    prompt: "You measured the trail in kilometres. Why is that the best unit?",
    reasons: ["Kilometres suit a long distance", "Kilometres are the newest unit", "Metres would give a smaller number"],
    correct: "Kilometres suit a long distance",
  },
  {
    label: "strawberry", emoji: "🍓",
    prompt: "You measured the strawberry in grams. Why is that the best unit?",
    reasons: ["Grams suit a light object", "Grams are always best for food", "Kilograms have too many zeros"],
    correct: "Grams suit a light object",
  },
];

function buildJustifyTask(): MetricTask {
  const j = choose(JUSTIFY);
  return {
    kind: "metricUnit",
    scene: "justify",
    attribute: "length",
    prompt: j.prompt,
    speakText: j.prompt,
    badgeLabel: "Explain Your Choice",
    object: { label: j.label, emoji: j.emoji },
    reasonOptions: shuffle(j.reasons),
    correctReason: j.correct,
    feedback: { correct: "Yes — a great measurer can explain their choice!", wrong: "Good measurers choose the unit that fits the size." },
  };
}

export function generateY5MeasurelandsWeek1Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "scientist") return buildScientistTask();
  if (activity === "justify") return buildJustifyTask();
  return buildToolboxTask();
}

export function resetY5MeasurelandsWeek1Lesson3TaskSessionState() {
  lessonMemory.clear();
}

// Weekly-quiz contribution — the scientist (chooseUnit) and justify scenes are
// single-answer; the toolbox scene is determinate (tool + unit both scored).
export function buildY5MeasurelandsWeek1Lesson3QuizTasks(): PracticeTask[] {
  return [buildScientistTask(), buildJustifyTask(), buildScientistTask(), buildJustifyTask(), buildScientistTask()];
}
