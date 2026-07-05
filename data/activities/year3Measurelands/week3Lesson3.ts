import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// Measurelands · Level 3 · Week 3 · Lesson 3 — Compare Mass.
// AC9M3M01/AC9M3M02: use measured masses to compare, order, and find differences.

type MassScaleTask = Extract<PracticeTask, { kind: "massScale" }>;
type MassItem = NonNullable<MassScaleTask["object"]>;
type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };

const GRAM_ITEMS: MassItem[] = [
  { label: "paper clip", emoji: "📎", mass: 1, unit: "g" },
  { label: "pencil", emoji: "✏️", mass: 8, unit: "g" },
  { label: "spoon", emoji: "🥄", mass: 40, unit: "g" },
  { label: "orange", emoji: "🍊", mass: 160, unit: "g" },
  { label: "apple", emoji: "🍎", mass: 180, unit: "g" },
  { label: "toy car", emoji: "🚗", mass: 300, unit: "g" },
  { label: "small book", emoji: "📕", mass: 450, unit: "g" },
];

const KG_ITEMS: MassItem[] = [
  { label: "bag of sugar", emoji: "🛍️", mass: 1, unit: "kg" },
  { label: "rock", emoji: "🪨", mass: 2, unit: "kg" },
  { label: "pumpkin", emoji: "🎃", mass: 5, unit: "kg" },
  { label: "backpack", emoji: "🎒", mass: 6, unit: "kg" },
  { label: "suitcase", emoji: "🧳", mass: 10, unit: "kg" },
  { label: "bicycle", emoji: "🚲", mass: 14, unit: "kg" },
  { label: "dog", emoji: "🐕", mass: 18, unit: "kg" },
];

const ROTATION: Array<"compare" | "order" | "difference"> = [
  "compare",
  "order",
  "difference",
  "compare",
  "difference",
  "order",
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

function pickPool() {
  return randInt(2) === 0 ? GRAM_ITEMS : KG_ITEMS;
}

function pickPair(memory: LessonMemory, pool = pickPool()): [MassItem, MassItem] {
  const available = shuffle(pool).filter((item) => !memory.recent.includes(item.label));
  const [first, second] = available.length >= 2 ? available : shuffle(pool);
  memory.recent.push(first!.label, second!.label);
  if (memory.recent.length > 10) memory.recent.splice(0, memory.recent.length - 10);
  return [first!, second!];
}

function buildIntroTask(): MassScaleTask {
  return {
    kind: "massScale",
    scene: "intro",
    prompt: "Compare mass.",
    speakText: "Professor Gauge says: now that you can read a scale, use the measurements to solve problems.",
    badgeLabel: "Mass Works",
    feedback: { correct: "Let's compare masses.", wrong: "Let's compare masses." },
  };
}

function buildCompareTask(memory: LessonMemory): MassScaleTask {
  const [first, second] = pickPair(memory);
  const heavier = first.mass > second.mass ? first : second;
  return {
    kind: "massScale",
    scene: "compare",
    prompt: "Which is heavier?",
    speakText: `Which is heavier, the ${first.label} or the ${second.label}?`,
    badgeLabel: "Which Is Heavier?",
    items: shuffle([first, second]),
    options: shuffle([first.label, second.label]),
    correctOption: heavier.label,
    feedback: {
      correct: `Yes — ${massLabel(heavier)} is the greater mass.`,
      wrong: `Compare the measurements. The ${heavier.label} is heavier.`,
    },
  };
}

function buildOrderTask(memory: LessonMemory): MassScaleTask {
  const pool = pickPool();
  const items = shuffle(pool).slice(0, 3).sort((a, b) => a.mass - b.mass);
  memory.recent.push(...items.map((item) => item.label));
  if (memory.recent.length > 10) memory.recent.splice(0, memory.recent.length - 10);
  return {
    kind: "massScale",
    scene: "order",
    prompt: "Order lightest to heaviest.",
    speakText: "Tap the objects from lightest to heaviest.",
    badgeLabel: "Order the Masses",
    items: shuffle(items),
    orderedLabels: items.map((item) => item.label),
    feedback: {
      correct: "Good ordering — you used the mass measurements.",
      wrong: "Start with the smallest measurement.",
    },
  };
}

function buildDifferenceTask(memory: LessonMemory): MassScaleTask {
  const pool = pickPool();
  const [first, second] = pickPair(memory, pool);
  const heavier = first.mass > second.mass ? first : second;
  const lighter = heavier === first ? second : first;
  const difference = heavier.mass - lighter.mass;
  const options = shuffle([
    `${difference} ${heavier.unit}`,
    `${Math.max(1, difference - 1)} ${heavier.unit}`,
    `${difference + 1} ${heavier.unit}`,
  ]);
  return {
    kind: "massScale",
    scene: "difference",
    prompt: `How much heavier is the ${heavier.label}?`,
    speakText: `The ${heavier.label} is ${massLabel(heavier)}. The ${lighter.label} is ${massLabel(lighter)}. How much heavier is the ${heavier.label}?`,
    badgeLabel: "How Much Heavier?",
    items: [heavier, lighter],
    options,
    correctOption: `${difference} ${heavier.unit}`,
    feedback: {
      correct: `Yes — ${heavier.mass} minus ${lighter.mass} is ${difference} ${heavier.unit}.`,
      wrong: `Subtract the smaller mass from the larger mass. The difference is ${difference} ${heavier.unit}.`,
    },
  };
}

export function generateY3MeasurelandsWeek3Lesson3Task(
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
  if (activity === "order") return buildOrderTask(memory);
  if (activity === "difference") return buildDifferenceTask(memory);
  return buildCompareTask(memory);
}

export function resetY3MeasurelandsWeek3Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY3MeasurelandsWeek3Lesson3QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildCompareTask(seed),
    buildOrderTask(seed),
    buildDifferenceTask(seed),
    buildCompareTask(seed),
    buildDifferenceTask(seed),
  ];
}
