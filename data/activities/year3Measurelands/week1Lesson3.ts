import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 3 · Week 1 · Lesson 3 — "Measurement Detective" ──
// Application lesson: students use ruler measurements to compare, find
// differences, choose correct readings, and detect common measurement mistakes.

type RulerTask = Extract<PracticeTask, { kind: "rulerMeasure" }>;

const OBJECTS: Array<{ label: string; icon: string; min: number; max: number }> = [
  { label: "pencil", icon: "✏️", min: 8, max: 17 },
  { label: "marker", icon: "🖊️", min: 10, max: 14 },
  { label: "crayon", icon: "🖍️", min: 4, max: 9 },
  { label: "glue stick", icon: "🧴", min: 7, max: 12 },
  { label: "spoon", icon: "🥄", min: 11, max: 17 },
  { label: "toothbrush", icon: "🪥", min: 11, max: 18 },
  { label: "paintbrush", icon: "🖌️", min: 10, max: 18 },
  { label: "ruler", icon: "📏", min: 12, max: 20 },
  { label: "toy car", icon: "🚗", min: 5, max: 10 },
  { label: "leaf", icon: "🍃", min: 5, max: 12 },
  { label: "feather", icon: "🪶", min: 6, max: 15 },
  { label: "stick", icon: "🪵", min: 8, max: 20 },
  { label: "scissors", icon: "✂️", min: 9, max: 16 },
];

const MAX_RULER = 20;
const ROTATION: Array<"difference" | "correctMeasurement" | "detective"> = [
  "difference",
  "correctMeasurement",
  "detective",
  "difference",
  "detective",
  "correctMeasurement",
];

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
const lessonMemory = new Map<string, LessonMemory>();

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created = { introShown: false, cursor: 0, recent: [] };
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

function remember(memory: LessonMemory, key: string) {
  memory.recent.push(key);
  if (memory.recent.length > 6) memory.recent.shift();
}

function pickObject(memory: LessonMemory): { label: string; icon: string; lengthCm: number } {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const spec = OBJECTS[randInt(OBJECTS.length)]!;
    const lengthCm = spec.min + randInt(spec.max - spec.min + 1);
    const key = `${spec.label}-${lengthCm}`;
    if (!memory.recent.includes(key)) {
      remember(memory, key);
      return { label: spec.label, icon: spec.icon, lengthCm };
    }
  }
  const fallback = OBJECTS[0]!;
  return { label: fallback.label, icon: fallback.icon, lengthCm: fallback.min };
}

function rulerFor(lengthCm: number): number {
  return Math.min(MAX_RULER, lengthCm + 2 + randInt(3));
}

function optionsAround(answer: number, min = 1, max = MAX_RULER): number[] {
  const candidates = new Set<number>([answer]);
  [answer - 2, answer - 1, answer + 1, answer + 2].forEach((value) => {
    if (value >= min && value <= max) candidates.add(value);
  });
  let fill = 1;
  while (candidates.size < 3) {
    candidates.add(Math.min(max, Math.max(min, answer + fill)));
    fill += 1;
  }
  return shuffle(Array.from(candidates).slice(0, 3));
}

function buildIntroTask(): RulerTask {
  return {
    kind: "rulerMeasure",
    scene: "intro",
    prompt: "Use ruler measurements to solve problems.",
    speakText:
      "Professor Gauge says: real measurers don't stop after measuring. They use the measurements to solve problems.",
    badgeLabel: "Detective Brief",
    rulerCm: 14,
    object: { label: "pencil", icon: "✏️", lengthCm: 12 },
    feedback: {
      correct: "Use the measurements to solve the mystery.",
      wrong: "Use the measurements to solve the mystery.",
    },
  };
}

function buildDifferenceTask(memory: LessonMemory): RulerTask {
  const first = pickObject(memory);
  let second = pickObject(memory);
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const difference = Math.abs(first.lengthCm - second.lengthCm);
    if (difference >= 1 && difference <= 8) break;
    second = pickObject(memory);
  }
  if (first.lengthCm === second.lengthCm) {
    second = { ...second, lengthCm: Math.max(2, second.lengthCm - 2) };
  }
  if (Math.abs(first.lengthCm - second.lengthCm) > 8) {
    const targetDifference = 3 + randInt(4);
    second = {
      ...second,
      lengthCm:
        first.lengthCm + targetDifference <= MAX_RULER
          ? first.lengthCm + targetDifference
          : first.lengthCm - targetDifference,
    };
  }
  const longer = first.lengthCm > second.lengthCm ? first : second;
  const shorter = first.lengthCm > second.lengthCm ? second : first;
  const difference = longer.lengthCm - shorter.lengthCm;
  return {
    kind: "rulerMeasure",
    scene: "compare",
    prompt: `How many centimetres longer is the ${longer.label}?`,
    speakText: `The ${longer.label} is ${longer.lengthCm} centimetres. The ${shorter.label} is ${shorter.lengthCm} centimetres. How many centimetres longer is the ${longer.label}?`,
    badgeLabel: "Find the Difference",
    rulerCm: rulerFor(longer.lengthCm),
    compareObjects: shuffle([longer, shorter]),
    compareMode: "longer",
    correctLabel: longer.label,
    differenceOptions: optionsAround(difference, 1, 8),
    correctDifference: difference,
    feedback: {
      correct: `Yes — ${longer.lengthCm} cm minus ${shorter.lengthCm} cm is ${difference} cm.`,
      wrong: `Compare the centimetres: ${longer.lengthCm} cm minus ${shorter.lengthCm} cm is ${difference} cm.`,
    },
  };
}

function buildCorrectMeasurementTask(memory: LessonMemory): RulerTask {
  const object = pickObject(memory);
  return {
    kind: "rulerMeasure",
    scene: "measure",
    prompt: `Which measurement is correct for the ${object.label}?`,
    speakText: `Which measurement is correct for the ${object.label}? Check where it starts and where it finishes.`,
    badgeLabel: "Check the Reading",
    rulerCm: rulerFor(object.lengthCm),
    object,
    options: optionsAround(object.lengthCm),
    correctAnswer: object.lengthCm,
    feedback: {
      correct: `Yes — the ${object.label} reaches ${object.lengthCm} cm.`,
      wrong: `Check the ruler carefully. The ${object.label} reaches ${object.lengthCm} cm.`,
    },
  };
}

function buildDetectiveTask(memory: LessonMemory): RulerTask {
  const object = pickObject(memory);
  const displayedMeasurement =
    object.lengthCm + (object.lengthCm <= 16 ? 3 + randInt(2) : -(3 + randInt(2)));
  return {
    kind: "rulerMeasure",
    scene: "measure",
    prompt: "Professor Gauge says something isn't right. What's wrong?",
    speakText: `Professor Gauge wrote ${displayedMeasurement} centimetres for the ${object.label}. Check the ruler. What's wrong?`,
    badgeLabel: "Detective Challenge",
    rulerCm: rulerFor(object.lengthCm),
    object,
    displayedMeasurement,
    detectiveOptions: shuffle([
      "The measurement is incorrect.",
      "The ruler is broken.",
      "The object is upside down.",
    ]),
    correctDetectiveAnswer: "The measurement is incorrect.",
    feedback: {
      correct: `Correct — the ${object.label} reaches ${object.lengthCm} cm, not ${displayedMeasurement} cm.`,
      wrong: `Check the start and the finish. The ${object.label} reaches ${object.lengthCm} cm, so the written measurement is incorrect.`,
    },
  };
}

export function generateY3MeasurelandsWeek1Lesson3Task(
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
  if (activity === "correctMeasurement") return buildCorrectMeasurementTask(memory);
  if (activity === "detective") return buildDetectiveTask(memory);
  return buildDifferenceTask(memory);
}

export function resetY3MeasurelandsWeek1Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY3MeasurelandsWeek1Lesson3QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildDifferenceTask(seed),
    buildCorrectMeasurementTask(seed),
    buildDetectiveTask(seed),
    buildDifferenceTask(seed),
    buildCorrectMeasurementTask(seed),
  ];
}
