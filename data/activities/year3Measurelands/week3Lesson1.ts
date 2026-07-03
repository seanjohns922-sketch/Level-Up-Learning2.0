import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 3 (Year 3) · Week 3 · Lesson 1 — "Meet Grams and Kilograms" ──
// AC9M3M01: recognise grams (g) and kilograms (kg) as sensible formal mass units.
// No conversions. This lesson builds unit intuition from familiar benchmarks.

type MassUnitTask = Extract<PracticeTask, { kind: "massUnit" }>;
type Unit = "g" | "kg";
type ObjectSpec = {
  label: string;
  imageSrc: string;
  unit: Unit;
  sensibleMass: string;
  distractorMass: string;
};

const GRAM_OBJECTS: ObjectSpec[] = [
  { label: "coin", imageSrc: "/images/measurelands/week2-3d/coin.png", unit: "g", sensibleMass: "6 g", distractorMass: "6 kg" },
  { label: "feather", imageSrc: "/images/measurelands/week2-3d/feather-v2.png", unit: "g", sensibleMass: "3 g", distractorMass: "3 kg" },
  { label: "pencil", imageSrc: "/images/measurelands/week2-3d/pencil.png", unit: "g", sensibleMass: "8 g", distractorMass: "8 kg" },
  { label: "eraser", imageSrc: "/images/measurelands/everyday-3d/object-eraser.png", unit: "g", sensibleMass: "25 g", distractorMass: "25 kg" },
  { label: "spoon", imageSrc: "/images/measurelands/week2-3d/spoon.png", unit: "g", sensibleMass: "40 g", distractorMass: "40 kg" },
  { label: "apple", imageSrc: "/images/measurelands/week2-3d/apple.png", unit: "g", sensibleMass: "180 g", distractorMass: "180 kg" },
  { label: "orange", imageSrc: "/images/measurelands/week2-3d/orange.png", unit: "g", sensibleMass: "160 g", distractorMass: "160 kg" },
  { label: "toy car", imageSrc: "/images/measurelands/everyday-3d/object-car.png", unit: "g", sensibleMass: "300 g", distractorMass: "300 kg" },
];

const KILOGRAM_OBJECTS: ObjectSpec[] = [
  { label: "lunchbox", imageSrc: "/images/measurelands/week2-3d/lunchbox.png", unit: "kg", sensibleMass: "1 kg", distractorMass: "1 g" },
  { label: "rock", imageSrc: "/images/measurelands/week2-3d/rock.png", unit: "kg", sensibleMass: "2 kg", distractorMass: "2 g" },
  { label: "brick", imageSrc: "/images/measurelands/week2-3d/brick.png", unit: "kg", sensibleMass: "3 kg", distractorMass: "3 g" },
  { label: "watermelon", imageSrc: "/images/measurelands/week2-3d/watermelon.png", unit: "kg", sensibleMass: "4 kg", distractorMass: "4 g" },
  { label: "pumpkin", imageSrc: "/images/measurelands/week2-3d/pumpkin.png", unit: "kg", sensibleMass: "5 kg", distractorMass: "5 g" },
  { label: "backpack", imageSrc: "/images/measurelands/week2-3d/backpack.png", unit: "kg", sensibleMass: "5 kg", distractorMass: "5 g" },
  { label: "chair", imageSrc: "/images/measurelands/week2-3d/chair.png", unit: "kg", sensibleMass: "6 kg", distractorMass: "6 g" },
  { label: "desk", imageSrc: "/images/measurelands/everyday-3d/object-desk.png", unit: "kg", sensibleMass: "20 kg", distractorMass: "20 g" },
];

const OBJECTS = [...GRAM_OBJECTS, ...KILOGRAM_OBJECTS];
const ROTATION: Array<"chooseUnit" | "sort" | "sensibleMeasure"> = [
  "chooseUnit",
  "sort",
  "sensibleMeasure",
  "chooseUnit",
  "sensibleMeasure",
  "sort",
];

type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };
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

function pickObject(memory: LessonMemory, pool = OBJECTS): ObjectSpec {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const object = pool[randInt(pool.length)]!;
    if (!memory.recent.includes(object.label)) {
      memory.recent.push(object.label);
      if (memory.recent.length > 6) memory.recent.shift();
      return object;
    }
  }
  return pool[randInt(pool.length)]!;
}

function taskObject(object: ObjectSpec) {
  return {
    imageSrc: object.imageSrc,
    label: object.label,
    unit: object.unit,
    sensibleMass: object.sensibleMass,
  };
}

function buildIntroTask(): MassUnitTask {
  return {
    kind: "massUnit",
    scene: "intro",
    prompt: "Meet grams and kilograms.",
    speakText:
      "Professor Gauge says: balance cubes helped us compare mass. Today we use grams and kilograms. Grams are for lighter objects. Kilograms are for heavier objects.",
    badgeLabel: "Mass Works",
    feedback: { correct: "Let's measure mass!", wrong: "Let's measure mass!" },
  };
}

function buildChooseUnitTask(memory: LessonMemory): MassUnitTask {
  const object = pickObject(memory);
  const correct = object.unit === "kg" ? "Kilograms (kg)" : "Grams (g)";
  return {
    kind: "massUnit",
    scene: "chooseUnit",
    prompt: `Measure a ${object.label} in...`,
    speakText: `Would you measure a ${object.label} in grams or kilograms?`,
    badgeLabel: "Grams or Kilograms?",
    object: taskObject(object),
    options: ["Grams (g)", "Kilograms (kg)"],
    correctOption: correct,
    feedback: {
      correct: object.unit === "kg" ? `Yes — a ${object.label} is heavy enough for kilograms.` : `Yes — a ${object.label} is light enough for grams.`,
      wrong: object.unit === "kg" ? `A ${object.label} is heavier, so kilograms is the sensible unit.` : `A ${object.label} is lighter, so grams is the sensible unit.`,
    },
  };
}

function buildSortTask(memory: LessonMemory): MassUnitTask {
  const grams = shuffle(GRAM_OBJECTS).slice(0, 3);
  const kilograms = shuffle(KILOGRAM_OBJECTS).slice(0, 3);
  const items = shuffle([...grams, ...kilograms]).map((object) => ({
    imageSrc: object.imageSrc,
    label: object.label,
    unit: object.unit,
  }));
  memory.recent = items.map((item) => item.label).slice(-6);
  return {
    kind: "massUnit",
    scene: "sort",
    prompt: "Sort the objects.",
    speakText: "Sort each object into grams or kilograms. Lighter objects use grams. Heavier objects use kilograms.",
    badgeLabel: "Sort by Unit",
    items,
    feedback: {
      correct: "All sorted — good mass unit choices.",
      wrong: "Think about how heavy the object would feel.",
    },
  };
}

function buildSensibleMeasureTask(memory: LessonMemory): MassUnitTask {
  const object = pickObject(memory);
  return {
    kind: "massUnit",
    scene: "sensibleMeasure",
    prompt: `Which feels right for a ${object.label}?`,
    speakText: `Which measurement feels right for a ${object.label}?`,
    badgeLabel: "Feels Right?",
    object: taskObject(object),
    options: shuffle([object.sensibleMass, object.distractorMass]),
    correctOption: object.sensibleMass,
    feedback: {
      correct: `Yes — ${object.sensibleMass} is sensible for a ${object.label}.`,
      wrong: `${object.distractorMass} is not sensible for a ${object.label}. Try ${object.sensibleMass}.`,
    },
  };
}

export function generateY3MeasurelandsWeek3Lesson1Task(
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
  if (activity === "sort") return buildSortTask(memory);
  if (activity === "sensibleMeasure") return buildSensibleMeasureTask(memory);
  return buildChooseUnitTask(memory);
}

export function resetY3MeasurelandsWeek3Lesson1TaskSessionState() {
  lessonMemory.clear();
}

export function buildY3MeasurelandsWeek3Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildChooseUnitTask(seed),
    buildSensibleMeasureTask(seed),
    buildChooseUnitTask(seed),
    buildSensibleMeasureTask(seed),
    buildSortTask(seed),
  ];
}
