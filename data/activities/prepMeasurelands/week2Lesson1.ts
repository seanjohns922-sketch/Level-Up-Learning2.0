import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Ground · Week 2 · Lesson 1 — "Heavy or Light?" ──
// AC9MFM01 (Ground, no formal units): compare mass using heavier / lighter.
//   A — Which Is Heavier?   (scene "pair", tap the heavier)
//   B — Which Is Lighter?   (scene "pair", tap the lighter)
//   C — Heavy or Light Sort (scene "sort", drop one object into Heavy / Light)
// Objects have obviously different masses (heavy ≥ 7, light ≤ 3) so every
// question has exactly one defensible answer.

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

// Object mass is real-world obvious. Heavy ≥ 7, light ≤ 3 — never ambiguous.
type Thing = { id: string; label: string; icon: string; weight: number };

const HEAVY: Thing[] = [
  { id: "rock", label: "Rock", icon: "🪨", weight: 8 },
  { id: "brick", label: "Brick", icon: "🧱", weight: 8 },
  { id: "elephant", label: "Elephant", icon: "🐘", weight: 10 },
  { id: "truck", label: "Truck", icon: "🚚", weight: 10 },
  { id: "watermelon", label: "Watermelon", icon: "🍉", weight: 8 },
  { id: "bowling", label: "Bowling Ball", icon: "🎳", weight: 9 },
  { id: "backpack", label: "Backpack", icon: "🎒", weight: 7 },
  { id: "boot", label: "Boot", icon: "🥾", weight: 7 },
  { id: "chair", label: "Chair", icon: "🪑", weight: 8 },
  { id: "horse", label: "Horse", icon: "🐎", weight: 10 },
  { id: "car", label: "Car", icon: "🚗", weight: 10 },
  { id: "bucket", label: "Bucket", icon: "🪣", weight: 7 },
  { id: "treasure", label: "Treasure Chest", icon: "🧰", weight: 9 },
  { id: "bicycle", label: "Bicycle", icon: "🚲", weight: 7 },
];

const LIGHT: Thing[] = [
  { id: "feather", label: "Feather", icon: "🪶", weight: 1 },
  { id: "leaf", label: "Leaf", icon: "🍃", weight: 1 },
  { id: "pencil", label: "Pencil", icon: "✏️", weight: 2 },
  { id: "eraser", label: "Eraser", icon: "🧽", weight: 2 },
  { id: "flower", label: "Flower", icon: "🌸", weight: 2 },
  { id: "balloon", label: "Balloon", icon: "🎈", weight: 1 },
  { id: "coin", label: "Coin", icon: "🪙", weight: 2 },
  { id: "strawberry", label: "Strawberry", icon: "🍓", weight: 2 },
  { id: "tennis", label: "Tennis Ball", icon: "🎾", weight: 3 },
  { id: "spoon", label: "Spoon", icon: "🥄", weight: 2 },
  { id: "cup", label: "Cup", icon: "🥤", weight: 3 },
  { id: "mouse", label: "Mouse", icon: "🐭", weight: 3 },
  { id: "butterfly", label: "Butterfly", icon: "🦋", weight: 1 },
  { id: "apple", label: "Apple", icon: "🍎", weight: 3 },
];

function toObj(thing: Thing, accent: Accent): MObj {
  return { id: thing.id, label: thing.label, icon: thing.icon, compareValue: thing.weight, axis: "mass", accent };
}

const TEACHING_MOMENTS: NonNullable<CompareTask["teachingMoments"]> = [
  {
    id: "rock-feather",
    title: "Heavier and Lighter",
    left: { label: "Rock", icon: "🪨", compareValue: 8, axis: "mass", accent: "gold" },
    right: { label: "Feather", icon: "🪶", compareValue: 1, axis: "mass", accent: "sky" },
    narration: "The rock is heavier. The feather is lighter.",
  },
  {
    id: "elephant-car",
    title: "Which Pushes Down More?",
    left: { label: "Elephant", icon: "🐘", compareValue: 10, axis: "mass", accent: "leaf" },
    right: { label: "Toy Car", icon: "🚗", compareValue: 3, axis: "mass", accent: "rose" },
    narration: "The elephant is heavier. The toy car is lighter.",
  },
  {
    id: "chest-coin",
    title: "Heavy or Light?",
    left: { label: "Treasure Chest", icon: "🧰", compareValue: 9, axis: "mass", accent: "violet" },
    right: { label: "Coin", icon: "🪙", compareValue: 1, axis: "mass", accent: "teal" },
    narration: "The treasure chest is heavier. The coin is lighter.",
  },
];

function buildIntroTask(): CompareTask {
  return {
    kind: "measurementCompare",
    scene: "intro",
    prompt: "Welcome to Balance Basin!",
    speakText:
      "Welcome to Balance Basin! Today we're going to discover which things are heavy and which things are light. When something is heavier, it pushes down more. When something is lighter, it stays higher. Let's look carefully and spot the heavy objects!",
    badgeLabel: "Meazurex Mission",
    introIcon: "⚖️",
    introBody: [
      "A giant golden scale is wobbling at Balance Basin!",
      "When something is heavier, it pushes down. When something is lighter, it stays up high.",
      "Let's spot the heavy and light objects.",
    ],
    objects: [],
    teachingMoments: TEACHING_MOMENTS,
    correctOptionId: "continue",
    feedback: { correct: "Let's start comparing!", wrong: "Let's get ready." },
  };
}

// A heavy + a light object → guaranteed clear difference, no repeat of last set.
function pickPair(memory: LessonMemory): [MObj, MObj] {
  let heavy = choose(HEAVY);
  let light = choose(LIGHT);
  let guard = 0;
  while (`${heavy.id}-${light.id}` === memory.lastSetId && guard++ < 20) {
    heavy = choose(HEAVY);
    light = choose(LIGHT);
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
    prompt: "Which is heavier?", speakText: "Which is heavier?", badgeLabel: "Which Is Heavier?",
    objects: shuffle([heavy, light]), correctOptionId: heavy.id,
    feedback: { correct: choose(["Great spotting!", "That's heavier!", "Excellent!"]), wrong: "Look carefully at the scale." },
  };
}

// Activity B — Which is lighter?
function buildLighterTask(memory: LessonMemory): CompareTask {
  const [heavy, light] = pickPair(memory);
  return {
    kind: "measurementCompare", scene: "pair", targetMode: "lighter",
    prompt: "Which is lighter?", speakText: "Which is lighter?", badgeLabel: "Which Is Lighter?",
    objects: shuffle([heavy, light]), correctOptionId: light.id,
    feedback: { correct: choose(["You found the lighter object!", "Nice work!"]), wrong: "Look carefully at the scale." },
  };
}

// Activity C — Heavy or Light Sort: drop one object into the right basket.
function buildSortTask(memory: LessonMemory): CompareTask {
  const fromHeavy = Math.random() < 0.5;
  const pool = fromHeavy ? HEAVY : LIGHT;
  let thing = choose(pool);
  let guard = 0;
  while (thing.id === memory.lastSetId && guard++ < 20) thing = choose(pool);
  memory.lastSetId = thing.id;
  const correctBin = thing.weight >= 5 ? "heavy" : "light";

  return {
    kind: "measurementCompare", scene: "sort",
    prompt: "Is it heavy or light?", speakText: `Is the ${thing.label.toLowerCase()} heavy or light?`,
    badgeLabel: "Heavy or Light Sort",
    objects: [toObj(thing, choose(ACCENTS))],
    bins: [
      { id: "heavy", label: "Heavy", icon: "🪨" },
      { id: "light", label: "Light", icon: "🪶" },
    ],
    correctOptionId: correctBin,
    feedback: { correct: choose(["Great sorting!", "Excellent!"]), wrong: "Look carefully — does it push down or stay up?" },
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
  return buildSortTask(memory);
}

export function resetPrepMeasurelandsWeek2Lesson1TaskSessionState() {
  lessonMemory.clear();
}
