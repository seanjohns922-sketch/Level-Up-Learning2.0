import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  MASS_G, MASS_KG, CAP_ML, CAP_L, fmtMass, fmtCap, shuffle, choose, randInt,
  type MassItem, type CapItem,
} from "@/data/activities/year4Measurelands/week2Common";

// ── Measurelands · Level 4 · Week 2 · Lesson 3 — "Measurement Investigations" (AC9M4M01) ──
// Apply readings: compare and reason with real mass/capacity measurements.
// Reuses the Scale and Jug (no new mechanics). Same-unit reasoning only — no
// conversions.
// THREE rotating activities:
//   A. heavier   — which object is heavier? (mass readings)
//   B. holdsMore — which container holds more? (jug readings)
//   C. challenge — how much heavier / how much more? (difference)

type MassScaleTask = Extract<PracticeTask, { kind: "massScale" }>;
type CapTask = Extract<PracticeTask, { kind: "capacity" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"heavier" | "holdsMore" | "challenge"> = [
  "heavier", "holdsMore", "challenge", "heavier", "holdsMore", "challenge",
];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function pickMassPair(): [MassItem, MassItem] {
  const pool = randInt(2) === 0 ? MASS_G : MASS_KG;
  const shuffled = shuffle(pool);
  const a = shuffled[0]!;
  const b = shuffled.find((x) => x.mass !== a.mass) ?? shuffled[1]!;
  return [a, b];
}

function pickCapPair(): [CapItem, CapItem] {
  const pool = randInt(2) === 0 ? CAP_ML : CAP_L;
  const shuffled = shuffle(pool);
  const a = shuffled[0]!;
  const b = shuffled.find((x) => x.value !== a.value) ?? shuffled[1]!;
  return [a, b];
}

function buildIntroTask(): MassScaleTask {
  return {
    kind: "massScale",
    scene: "intro",
    precision: true,
    scaleType: "dial",
    prompt: "Scientists use their measurements.",
    speakText:
      "Professor Gauge says: real scientists don't stop after reading the measurement — they use it. Compare the readings to solve the problem. Trust the instrument, not the size of the object.",
    badgeLabel: "Meazurex Mission",
    object: { label: "watermelon", emoji: "🍉", mass: 3.5, unit: "kg" },
    feedback: { correct: "Let's solve!", wrong: "Let's solve!" },
  };
}

// Activity A — Which Is Heavier?
function buildHeavierTask(): MassScaleTask {
  const [a, b] = pickMassPair();
  const heavier = a.mass > b.mass ? a : b;
  return {
    kind: "massScale",
    scene: "compare",
    precision: true,
    prompt: "Which object is heavier?",
    speakText: `Use the measurements. Which is heavier, the ${a.label} or the ${b.label}?`,
    badgeLabel: "Which Is Heavier?",
    items: shuffle([a, b]),
    options: shuffle([a.label, b.label]),
    correctOption: heavier.label,
    feedback: {
      correct: `Yes — the ${heavier.label} is ${fmtMass(heavier.mass, heavier.unit)}.`,
      wrong: `Use the readings — the ${heavier.label} weighs more.`,
    },
  };
}

// Activity B — Which Holds More?
function buildHoldsMoreTask(): CapTask {
  const [a, b] = pickCapPair();
  const more = a.value > b.value ? a : b;
  return {
    kind: "capacity",
    scene: "compareMore",
    precision: true,
    prompt: "Which container holds more?",
    speakText: `Use the measurements. Which holds more, the ${a.label} or the ${b.label}?`,
    badgeLabel: "Which Holds More?",
    compareItems: shuffle([a, b]),
    compareMode: "more",
    correctLabel: more.label,
    feedback: {
      correct: `Yes — the ${more.label} holds ${fmtCap(more.value, more.unit)}.`,
      wrong: `Use the readings — the ${more.label} holds more.`,
    },
  };
}

// Activity C — Science Challenge: how much heavier / how much more.
function buildMassDifferenceTask(asMcq = false): MassScaleTask {
  const [a, b] = pickMassPair();
  const heavier = a.mass > b.mass ? a : b;
  const lighter = heavier === a ? b : a;
  const diff = Number((heavier.mass - lighter.mass).toFixed(2));
  const step = heavier.unit === "kg" ? 1 : 50;
  const raw = Array.from(new Set([diff, diff + step, Math.max(step, diff - step)]));
  while (raw.length < 3) raw.push(raw[raw.length - 1]! + step);
  const options = shuffle(raw.slice(0, 3)).map((v) => `${Number(v.toFixed(2))} ${heavier.unit}`);
  return {
    kind: "massScale",
    scene: "difference",
    precision: true,
    prompt: `How much heavier is the ${heavier.label}?`,
    speakText: `The ${heavier.label} is ${fmtMass(heavier.mass, heavier.unit)}. The ${lighter.label} is ${fmtMass(lighter.mass, lighter.unit)}. How much heavier is the ${heavier.label}?`,
    badgeLabel: "How Much Heavier?",
    items: [heavier, lighter],
    options,
    correctOption: `${diff} ${heavier.unit}`,
    // Practice shows a number pad; the quiz omits these so it renders as MCQ.
    ...(asMcq ? {} : { answerValue: diff, answerUnit: heavier.unit }),
    feedback: {
      correct: `Yes — ${heavier.mass} minus ${lighter.mass} is ${diff} ${heavier.unit}.`,
      wrong: `Subtract the readings — the difference is ${diff} ${heavier.unit}.`,
    },
  };
}

function buildCapDifferenceTask(): CapTask {
  const [a, b] = pickCapPair();
  const hi = a.value > b.value ? a : b;
  const lo = hi === a ? b : a;
  const diff = Number((hi.value - lo.value).toFixed(2));
  return {
    kind: "capacity",
    scene: "howMuchMore",
    precision: true,
    prompt: `How much more does the ${hi.label} hold?`,
    speakText: `The ${hi.label} holds ${fmtCap(hi.value, hi.unit)}. The ${lo.label} holds ${fmtCap(lo.value, lo.unit)}. How much more does the ${hi.label} hold?`,
    badgeLabel: "How Much More?",
    compareItems: [hi, lo],
    answerValue: diff,
    answerUnit: hi.unit,
    feedback: {
      correct: `Yes — ${hi.value} minus ${lo.value} is ${diff} ${hi.unit}.`,
      wrong: `Subtract the readings — the difference is ${diff} ${hi.unit}.`,
    },
  };
}

function buildChallengeTask(): PracticeTask {
  return randInt(2) === 0 ? buildMassDifferenceTask() : buildCapDifferenceTask();
}

export function generateY4MeasurelandsWeek2Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "holdsMore") return buildHoldsMoreTask();
  if (activity === "challenge") return buildChallengeTask();
  return buildHeavierTask();
}

export function resetY4MeasurelandsWeek2Lesson3TaskSessionState() {
  lessonMemory.clear();
}

// Quiz contribution — all MCQ-safe (mass difference rendered as choices, not a keypad).
export function buildY4MeasurelandsWeek2Lesson3QuizTasks(): PracticeTask[] {
  return [
    buildHeavierTask(),
    buildHoldsMoreTask(),
    buildMassDifferenceTask(true),
    buildHeavierTask(),
    buildHoldsMoreTask(),
  ];
}
