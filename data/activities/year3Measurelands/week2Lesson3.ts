import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 3 (Year 3) · Week 2 · Lesson 3 — "Estimate then Measure" ──
// AC9M3M01: estimate a length, then measure with the right unit, then compare.
// Estimation is rewarded by closeness, not right/wrong. THREE rotating activities:
//   A. estimate     — estimate a cm object → reveal on the ruler → closeness medal.
//   B. bestEstimate — pick the most sensible estimate (cm/m distractors).
//   C. challenge     — choose cm or m → estimate → measure/reveal → medal (full cycle).

type EstimateTask = Extract<PracticeTask, { kind: "estimateMeasure" }>;
type UnitTask = Extract<PracticeTask, { kind: "unitChoice" }>;

// Small objects measured in cm (kept ≤18 so the ruler reveal fits cleanly).
const CM_OBJECTS: Array<{ label: string; icon: string; length: number }> = [
  { label: "pencil", icon: "✏️", length: 15 },
  { label: "marker", icon: "🖊️", length: 13 },
  { label: "crayon", icon: "🖍️", length: 9 },
  { label: "spoon", icon: "🥄", length: 13 },
  { label: "toothbrush", icon: "🪥", length: 16 },
  { label: "paintbrush", icon: "🖌️", length: 16 },
  { label: "toy car", icon: "🚗", length: 8 },
  { label: "key", icon: "🔑", length: 6 },
  { label: "pair of scissors", icon: "✂️", length: 13 },
];

// Long objects measured in whole metres.
const M_OBJECTS: Array<{ label: string; icon: string; length: number }> = [
  { label: "door", icon: "🚪", length: 2 },
  { label: "broom", icon: "🧹", length: 1 },
  { label: "ladder", icon: "🪜", length: 3 },
  { label: "tree", icon: "🌳", length: 4 },
  { label: "guitar", icon: "🎸", length: 1 },
  { label: "bicycle", icon: "🚲", length: 2 },
  { label: "canoe", icon: "🛶", length: 4 },
  { label: "bed", icon: "🛏️", length: 2 },
];

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"estimate" | "bestEstimate" | "challenge"> = [
  "estimate", "bestEstimate", "challenge", "bestEstimate", "estimate", "challenge",
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
function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}
function pick<T extends { label: string }>(pool: T[], memory: LessonMemory): T {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const obj = pool[randInt(pool.length)]!;
    if (!memory.recent.includes(obj.label)) {
      memory.recent.push(obj.label);
      if (memory.recent.length > 6) memory.recent.shift();
      return obj;
    }
  }
  return pool[randInt(pool.length)]!;
}

// Three sensible estimate options around the true length (the real value is one
// of them, so an exact 🎯 is possible). All whole, all realistic, all distinct.
function estimateOptions(length: number, unit: "cm" | "m"): number[] {
  if (unit === "m") {
    const opts = new Set<number>([length, Math.max(1, length - 1), length + 1]);
    while (opts.size < 3) opts.add(length + 1 + randInt(2));
    return shuffle([...opts]);
  }
  const d1 = 2 + randInt(3); // 2–4
  const d2 = 2 + randInt(3);
  const opts = new Set<number>([length, Math.max(1, length - d1), length + d2]);
  while (opts.size < 3) opts.add(length + 1 + randInt(4));
  return shuffle([...opts]);
}

function buildIntroTask(): EstimateTask {
  return {
    kind: "estimateMeasure",
    scene: "intro",
    prompt: "Real measurers estimate first, then check.",
    speakText:
      "Professor Gauge says: real measurers don't always measure first. They make a sensible estimate, then they measure to check how close they were. Estimate first, measure second, compare afterwards.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's estimate!", wrong: "Let's estimate!" },
  };
}

// Activity A — estimate a cm object, then reveal on the ruler.
function buildEstimateTask(memory: LessonMemory): EstimateTask {
  const object = pick(CM_OBJECTS, memory);
  return {
    kind: "estimateMeasure",
    scene: "estimate",
    prompt: `How long do you think the ${object.label} is?`,
    speakText: `Look at the ${object.label}. How long do you think it is in centimetres? Make a sensible estimate, then we'll measure it.`,
    badgeLabel: "Make Your Estimate",
    unit: "cm",
    object,
    estimateOptions: estimateOptions(object.length, "cm"),
    feedback: { correct: "Nice estimating!", wrong: "Nice estimating!" },
  };
}

// Activity C — the full cycle: choose cm or m, estimate, then reveal + medal.
function buildChallengeTask(memory: LessonMemory): EstimateTask {
  const useM = randInt(2) === 0;
  const object = useM ? pick(M_OBJECTS, memory) : pick(CM_OBJECTS, memory);
  const unit: "cm" | "m" = useM ? "m" : "cm";
  return {
    kind: "estimateMeasure",
    scene: "estimate",
    prompt: `Estimate Challenge: the ${object.label}`,
    speakText: `Estimate challenge. First choose the sensible unit for the ${object.label}, then estimate its length, then measure to check.`,
    badgeLabel: "Estimate Challenge",
    unit,
    object,
    estimateOptions: estimateOptions(object.length, unit),
    chooseUnitFirst: true,
    feedback: { correct: "Full cycle complete!", wrong: "Choose the sensible unit first." },
  };
}

// Activity B — pick the most sensible estimate (cm / m distractors).
function buildBestEstimateTask(memory: LessonMemory): UnitTask {
  const useM = randInt(2) === 0;
  const object = useM ? pick(M_OBJECTS, memory) : pick(CM_OBJECTS, memory);
  let correct: string;
  let distractors: string[];
  if (useM) {
    correct = `${object.length} m`;
    distractors = [`${15 + randInt(21)} cm`, `${object.length * 10 + randInt(8)} m`]; // small cm, huge m
  } else {
    correct = `${object.length} cm`;
    distractors = [`${2 + randInt(3)} m`, `${object.length} m`]; // both clearly too big
  }
  return {
    kind: "unitChoice",
    scene: "bestEstimate",
    prompt: `Which is the most sensible estimate for the ${object.label}?`,
    speakText: `Which is the most sensible estimate for the ${object.label}?`,
    badgeLabel: "Choose the Best Estimate",
    object: { label: object.label, icon: object.icon },
    options: shuffle([correct, ...distractors]),
    correctOption: correct,
    feedback: {
      correct: `Yes — a ${object.label} is about ${correct}.`,
      wrong: `Think about its size — a ${object.label} is about ${correct}.`,
    },
  };
}

export function generateY3MeasurelandsWeek2Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "bestEstimate") return buildBestEstimateTask(memory);
  if (activity === "challenge") return buildChallengeTask(memory);
  return buildEstimateTask(memory);
}

export function resetY3MeasurelandsWeek2Lesson3TaskSessionState() {
  lessonMemory.clear();
}

// Weekly-quiz contribution: 5 single-answer questions. Uses "best estimate"
// (a clean MCQ); the open estimate/challenge flow doesn't map to one answer.
export function buildY3MeasurelandsWeek2Lesson3QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildBestEstimateTask(seed),
    buildBestEstimateTask(seed),
    buildBestEstimateTask(seed),
    buildBestEstimateTask(seed),
    buildBestEstimateTask(seed),
  ];
}
