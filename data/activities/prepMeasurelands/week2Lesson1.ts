import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Ground · Week 2 · Lesson 1 — "Heavy or Light?" ──
// AC9MFM01 (Ground, no formal units): compare mass using heavier / lighter.
//   A — Heavy or Light?        (scene "pair", tap the heavier)
//   B — Lightest Explorer      (scene "pair", tap the lighter)
//   C — Meazurex's Mass Sorter (scene "trio", tap the heaviest / lightest)

type CompareTask = Extract<PracticeTask, { kind: "measurementCompare" }>;
type MObj = CompareTask["objects"][number];
type Accent = MObj["accent"];

type LessonMemory = { introShown: boolean; cursor: number; lastSetId: string | null };

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastSetId: null };
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
function choose<T>(items: T[]): T {
  return items[randInt(items.length)]!;
}

const ACCENTS: Accent[] = ["rose", "gold", "teal", "sky", "violet", "leaf"];

// Object weights are real-world obvious (a brick is heavy, a feather is light).
type Thing = { id: string; label: string; icon: string; weight: number };
const HEAVY: Thing[] = [
  { id: "brick", label: "Brick", icon: "🧱", weight: 8 },
  { id: "watermelon", label: "Watermelon", icon: "🍉", weight: 9 },
  { id: "elephant", label: "Elephant", icon: "🐘", weight: 10 },
  { id: "rock", label: "Rock", icon: "🪨", weight: 8 },
  { id: "truck", label: "Truck", icon: "🚚", weight: 10 },
  { id: "anvil", label: "Anvil", icon: "🪨", weight: 9 },
];
const MEDIUM: Thing[] = [
  { id: "apple", label: "Apple", icon: "🍎", weight: 4 },
  { id: "book", label: "Book", icon: "📕", weight: 5 },
  { id: "backpack", label: "Backpack", icon: "🎒", weight: 5 },
  { id: "bicycle", label: "Bicycle", icon: "🚲", weight: 6 },
  { id: "dog", label: "Dog", icon: "🐕", weight: 5 },
  { id: "rabbit", label: "Rabbit", icon: "🐰", weight: 4 },
];
const LIGHT: Thing[] = [
  { id: "feather", label: "Feather", icon: "🪶", weight: 1 },
  { id: "leaf", label: "Leaf", icon: "🍃", weight: 1 },
  { id: "pencil", label: "Pencil", icon: "✏️", weight: 2 },
  { id: "eraser", label: "Eraser", icon: "🧽", weight: 1 },
  { id: "flower", label: "Flower", icon: "🌸", weight: 2 },
  { id: "balloon", label: "Balloon", icon: "🎈", weight: 1 },
];

function toObj(thing: Thing, accent: Accent): MObj {
  return { id: thing.id, label: thing.label, icon: thing.icon, compareValue: thing.weight, axis: "mass", accent };
}

const TEACHING_MOMENTS: NonNullable<CompareTask["teachingMoments"]> = [
  {
    id: "feather-brick",
    title: "Heavier and Lighter",
    left: { label: "Brick", icon: "🧱", compareValue: 8, axis: "mass", accent: "gold" },
    right: { label: "Feather", icon: "🪶", compareValue: 1, axis: "mass", accent: "sky" },
    narration: "The brick is heavier. The feather is lighter.",
  },
  {
    id: "apple-watermelon",
    title: "Which Weighs More?",
    left: { label: "Watermelon", icon: "🍉", compareValue: 9, axis: "mass", accent: "leaf" },
    right: { label: "Apple", icon: "🍎", compareValue: 4, axis: "mass", accent: "rose" },
    narration: "The watermelon is heavier. The apple is lighter.",
  },
];

function buildIntroTask(): CompareTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "Let’s explore heavy and light!",
    speakText:
      "Meazurex has arrived at the Balance Basin. The Fog of Forgetfulness has mixed everything up, so nobody knows what is heavy and what is light. Let's become Mass Explorers and compare carefully.",
    badgeLabel: "Meazurex Mission",
    introIcon: "⚖️",
    introBody: [
      "The Fog of Forgetfulness has mixed up the Balance Basin.",
      "Some things are heavy. Some things are light.",
      "Let's become Mass Explorers and compare carefully.",
    ],
    objects: [],
    teachingMoments: TEACHING_MOMENTS,
    correctOptionId: "continue",
    feedback: { correct: "Let's start comparing!", wrong: "Let's get ready." },
  };
}

// Pick a heavy/light pair with a clear weight gap (>= 3).
function pickPair(memory: LessonMemory): [MObj, MObj] {
  const heavyPool = [...HEAVY, ...MEDIUM];
  const lightPool = [...LIGHT, ...MEDIUM];
  let heavy = choose(heavyPool);
  let light = choose(lightPool);
  let guard = 0;
  while ((heavy.weight - light.weight < 3 || heavy.id === light.id || `${heavy.id}-${light.id}` === memory.lastSetId) && guard++ < 20) {
    heavy = choose(heavyPool);
    light = choose(lightPool);
  }
  memory.lastSetId = `${heavy.id}-${light.id}`;
  const acc = shuffle(ACCENTS);
  return [toObj(heavy, acc[0]!), toObj(light, acc[1]!)];
}

// Activity A — Which is heavier?
function buildHeavierTask(memory: LessonMemory): CompareTask {
  const [heavy, light] = pickPair(memory);
  return {
    kind: "measurementCompare", scene: "pair", targetMode: "heavier",
    prompt: "Which is heavier?", speakText: "Which is heavier?", badgeLabel: "Heavy or Light?",
    objects: shuffle([heavy, light]), correctOptionId: heavy.id,
    feedback: { correct: "Great comparing!", wrong: "Let's try another one." },
  };
}

// Activity B — Which is lighter?
function buildLighterTask(memory: LessonMemory): CompareTask {
  const [heavy, light] = pickPair(memory);
  return {
    kind: "measurementCompare", scene: "pair", targetMode: "lighter",
    prompt: "Which is lighter?", speakText: "Which is lighter?", badgeLabel: "Lightest Explorer",
    objects: shuffle([heavy, light]), correctOptionId: light.id,
    feedback: { correct: "Featherweight find!", wrong: "Let's try another one." },
  };
}

// Activity C — tap the heaviest / lightest of three (always distinct weights).
function buildMassSorterTask(memory: LessonMemory): CompareTask {
  const acc = shuffle(ACCENTS);
  let light = choose(LIGHT);
  let medium = choose(MEDIUM);
  let heavy = choose(HEAVY);
  let guard = 0;
  // Guarantee strictly increasing, clearly-separated weights.
  while ((!(light.weight < medium.weight && medium.weight < heavy.weight) || `${light.id}-${medium.id}-${heavy.id}` === memory.lastSetId) && guard++ < 20) {
    light = choose(LIGHT);
    medium = choose(MEDIUM);
    heavy = choose(HEAVY);
  }
  memory.lastSetId = `${light.id}-${medium.id}-${heavy.id}`;
  const trio = [toObj(light, acc[0]!), toObj(medium, acc[1]!), toObj(heavy, acc[2]!)];
  const wantHeaviest = Math.random() < 0.5;

  return {
    kind: "measurementCompare", scene: "trio",
    targetMode: wantHeaviest ? "heaviest" : "lightest",
    prompt: wantHeaviest ? "Tap the heaviest object." : "Tap the lightest object.",
    speakText: wantHeaviest ? "Tap the heaviest object." : "Tap the lightest object.",
    badgeLabel: "Meazurex's Mass Sorter",
    objects: shuffle(trio),
    correctOptionId: wantHeaviest ? heavy.id : light.id,
    feedback: { correct: "Wonderful sorting!", wrong: "Let's try another one." },
  };
}

export function generatePrepMeasurelandsWeek2Lesson1Task(
  lessonId: string,
  _difficulty: Difficulty,
): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }

  const rotation = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;

  if (rotation === "A") return buildHeavierTask(memory);
  if (rotation === "B") return buildLighterTask(memory);
  return buildMassSorterTask(memory);
}

export function resetPrepMeasurelandsWeek2Lesson1TaskSessionState() {
  lessonMemory.clear();
}
