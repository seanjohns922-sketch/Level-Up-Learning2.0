import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  WEEK2_HEAVY_OBJECTS,
  WEEK2_LIGHT_OBJECTS,
  WEEK2_MASS_OBJECTS,
  toWeek2MassCompareObject,
} from "./week2MassObjects";

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
const TEACHING_MOMENTS: NonNullable<CompareTask["teachingMoments"]> = [
  {
    id: "rock-feather",
    title: "Heavier and Lighter",
    left: { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.rock, "gold") },
    right: { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.feather, "sky") },
    narration: "The rock is heavier. The feather is lighter.",
  },
  {
    id: "elephant-apple",
    title: "Which Pushes Down More?",
    left: { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.elephant, "leaf") },
    right: { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.apple, "rose") },
    narration: "The elephant is heavier. The apple is lighter.",
  },
  {
    id: "backpack-coin",
    title: "Heavy or Light?",
    left: { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.backpack, "violet") },
    right: { ...toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.coin, "teal") },
    narration: "The backpack is heavier. The coin is lighter.",
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
  let heavy = choose(WEEK2_HEAVY_OBJECTS);
  let light = choose(WEEK2_LIGHT_OBJECTS);
  let guard = 0;
  while (`${heavy.id}-${light.id}` === memory.lastSetId && guard++ < 20) {
    heavy = choose(WEEK2_HEAVY_OBJECTS);
    light = choose(WEEK2_LIGHT_OBJECTS);
  }
  memory.lastSetId = `${heavy.id}-${light.id}`;
  const acc = shuffle(ACCENTS);
  return [toWeek2MassCompareObject(heavy, acc[0]!), toWeek2MassCompareObject(light, acc[1]!)];
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
  const pool = fromHeavy ? WEEK2_HEAVY_OBJECTS : WEEK2_LIGHT_OBJECTS;
  let thing = choose(pool);
  let guard = 0;
  while (thing.id === memory.lastSetId && guard++ < 20) thing = choose(pool);
  memory.lastSetId = thing.id;
  const correctBin = thing.weight >= 5 ? "heavy" : "light";

  return {
    kind: "measurementCompare", scene: "sort",
    prompt: "Is it heavy or light?", speakText: `Is the ${thing.label.toLowerCase()} heavy or light?`,
    badgeLabel: "Heavy or Light Sort",
    objects: [toWeek2MassCompareObject(thing, choose(ACCENTS))],
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
