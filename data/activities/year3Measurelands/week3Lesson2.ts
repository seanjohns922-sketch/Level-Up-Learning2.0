import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// Measurelands · Level 3 · Week 3 · Lesson 2 — Read the Scale.
// AC9M3M01/AC9M3M02: read formal mass from marked scales.

type MassScaleTask = Extract<PracticeTask, { kind: "massScale" }>;
type MassItem = NonNullable<MassScaleTask["object"]>;
type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };

const SCALE_OBJECTS: MassItem[] = [
  { label: "apple", emoji: "🍎", mass: 250, unit: "g" },
  { label: "loaf of bread", emoji: "🍞", mass: 500, unit: "g" },
  { label: "small book", emoji: "📕", mass: 750, unit: "g" },
  { label: "bag of sugar", emoji: "🛍️", mass: 1, unit: "kg" },
  { label: "rock", emoji: "🪨", mass: 2, unit: "kg" },
  { label: "backpack", emoji: "🎒", mass: 5, unit: "kg" },
  { label: "suitcase", emoji: "🧳", mass: 12, unit: "kg" },
  { label: "dog", emoji: "🐕", mass: 18, unit: "kg" },
];

const ROTATION: Array<"read" | "match" | "realistic"> = [
  "read",
  "match",
  "realistic",
  "read",
  "match",
  "realistic",
];

const lessonMemory = new Map<string, LessonMemory>();

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

function massLabel(item: Pick<MassItem, "mass" | "unit">) {
  return `${item.mass} ${item.unit}`;
}

function pickObject(memory: LessonMemory, pool = SCALE_OBJECTS): MassItem {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const object = pool[randInt(pool.length)]!;
    if (!memory.recent.includes(object.label)) {
      memory.recent.push(object.label);
      if (memory.recent.length > 8) memory.recent.shift();
      return object;
    }
  }
  return pool[randInt(pool.length)]!;
}

function distractorMasses(object: MassItem): MassItem[] {
  const masses =
    object.unit === "g"
      ? shuffle([object.mass - 250, object.mass + 250, object.mass + 500].filter((mass) => mass > 0 && mass <= 1000))
      : shuffle([object.mass - 1, object.mass + 1, object.mass + 3].filter((mass) => mass > 0 && mass <= 20));
  return masses.slice(0, 2).map((mass) => ({ ...object, mass }));
}

function buildIntroTask(): MassScaleTask {
  return {
    kind: "massScale",
    scene: "intro",
    prompt: "Read the scale.",
    speakText: "Professor Gauge says: real measurers do not guess. They read the number on the scale.",
    badgeLabel: "Mass Works",
    feedback: { correct: "Let's read scales.", wrong: "Let's read scales." },
  };
}

function buildReadTask(memory: LessonMemory): MassScaleTask {
  const object = pickObject(memory);
  const options = shuffle([object, ...distractorMasses(object)]).map(massLabel);
  return {
    kind: "massScale",
    scene: "read",
    prompt: "What mass is shown?",
    speakText: `Read the scale. What mass is shown for the ${object.label}?`,
    badgeLabel: "Read the Scale",
    object,
    options,
    correctOption: massLabel(object),
    feedback: {
      correct: `Yes — the scale reads ${massLabel(object)}.`,
      wrong: `Read the scale carefully. It shows ${massLabel(object)}.`,
    },
  };
}

function buildMatchTask(memory: LessonMemory): MassScaleTask {
  const object = pickObject(memory);
  const scales = shuffle([object, ...distractorMasses(object)]).map((scale, index) => ({
    id: `${scale.mass}-${scale.unit}-${index}`,
    mass: scale.mass,
    unit: scale.unit,
    scaleType: scale.unit === "g" ? ("dial" as const) : ("digital" as const),
  }));
  const correct = scales.find((scale) => scale.mass === object.mass && scale.unit === object.unit)!;
  return {
    kind: "massScale",
    scene: "match",
    prompt: `Find ${massLabel(object)}.`,
    speakText: `Which scale shows ${massLabel(object)} for the ${object.label}?`,
    badgeLabel: "Match the Scale",
    object,
    scales,
    correctOptionId: correct.id,
    feedback: {
      correct: `Yes — that scale shows ${massLabel(object)}.`,
      wrong: `Look for the scale that reads ${massLabel(object)}.`,
    },
  };
}

function buildRealisticTask(memory: LessonMemory): MassScaleTask {
  const object = pickObject(memory);
  const wrongUnit = object.unit === "g" ? "kg" : "g";
  const wrongMass = `${object.mass} ${wrongUnit}`;
  const wildMass = object.unit === "g" ? `${Math.max(2, Math.round(object.mass / 100))} kg` : `${object.mass} g`;
  return {
    kind: "massScale",
    scene: "realistic",
    prompt: `Which mass feels right for a ${object.label}?`,
    speakText: `Which mass feels right for a ${object.label}?`,
    badgeLabel: "Feels Right",
    object,
    options: shuffle([massLabel(object), wrongMass, wildMass]),
    correctOption: massLabel(object),
    feedback: {
      correct: `Yes — ${massLabel(object)} is sensible for a ${object.label}.`,
      wrong: `Think about the object. ${massLabel(object)} is the sensible mass.`,
    },
  };
}

export function generateY3MeasurelandsWeek3Lesson2Task(
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
  if (activity === "match") return buildMatchTask(memory);
  if (activity === "realistic") return buildRealisticTask(memory);
  return buildReadTask(memory);
}

export function resetY3MeasurelandsWeek3Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY3MeasurelandsWeek3Lesson2QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildReadTask(seed),
    buildMatchTask(seed),
    buildRealisticTask(seed),
    buildReadTask(seed),
    buildMatchTask(seed),
  ];
}
