import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 3 (Year 3) · Week 3 · Lesson 2 — "Choose g or kg" ──
// AC9M3M01: choose the most sensible formal mass unit for familiar objects.
// No conversions. Students reason from real-world mass intuition.

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
const ROTATION: Array<"chooseUnit" | "sort" | "mistakeCheck"> = [
  "chooseUnit",
  "sort",
  "mistakeCheck",
  "chooseUnit",
  "mistakeCheck",
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

function taskObject(object: ObjectSpec, showMass = false) {
  return {
    imageSrc: object.imageSrc,
    label: object.label,
    unit: object.unit,
    sensibleMass: showMass ? object.sensibleMass : undefined,
  };
}

function unitOption(unit: Unit) {
  return unit === "kg" ? "Kilograms (kg)" : "Grams (g)";
}

function buildIntroTask(): MassUnitTask {
  return {
    kind: "massUnit",
    scene: "intro",
    prompt: "Choose g or kg.",
    speakText:
      "Professor Gauge says: good measurers choose the unit that makes the most sense. Use grams for lighter objects and kilograms for heavier objects.",
    badgeLabel: "Mass Works",
    statement: "Small, lighter objects use grams. Heavier objects use kilograms.",
    feedback: { correct: "Choose the sensible unit.", wrong: "Choose the sensible unit." },
  };
}

function buildChooseUnitTask(memory: LessonMemory): MassUnitTask {
  const object = pickObject(memory);
  return {
    kind: "massUnit",
    scene: "chooseUnit",
    prompt: `Which unit for a ${object.label}?`,
    speakText: `Would you measure a ${object.label} in grams or kilograms?`,
    badgeLabel: "Which Unit?",
    object: taskObject(object),
    options: ["Grams (g)", "Kilograms (kg)"],
    correctOption: unitOption(object.unit),
    feedback: {
      correct: object.unit === "kg" ? `Yes — kilograms suit a ${object.label}.` : `Yes — grams suit a ${object.label}.`,
      wrong: object.unit === "kg" ? `A ${object.label} is heavier, so kilograms is more sensible.` : `A ${object.label} is lighter, so grams is more sensible.`,
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
    prompt: "Sort into g or kg.",
    speakText: "Sort each object into grams or kilograms. Choose the unit that makes sense for its mass.",
    badgeLabel: "Sort the Objects",
    items,
    feedback: {
      correct: "Good sorting — those units make sense.",
      wrong: "Think about how heavy the object would be.",
    },
  };
}

function buildMistakeTask(memory: LessonMemory, forceCorrectStatement = false): MassUnitTask {
  const object = pickObject(memory);
  const statementIsCorrect = forceCorrectStatement || randInt(4) === 0;
  const shownMass = statementIsCorrect ? object.sensibleMass : object.distractorMass;
  const noGrams = "No — grams would be more sensible.";
  const noKilograms = "No — kilograms would be more sensible.";
  const correctOption = statementIsCorrect
    ? "Yes."
    : object.unit === "g"
      ? noGrams
      : noKilograms;

  return {
    kind: "massUnit",
    scene: "mistakeCheck",
    prompt: "Is Professor Gauge correct?",
    speakText: `Professor Gauge says: this ${object.label} weighs ${shownMass}. Is he correct?`,
    badgeLabel: "Gauge's Mistake",
    object: taskObject(object),
    statement: `This ${object.label} weighs ${shownMass}.`,
    options: shuffle(["Yes.", noGrams, noKilograms]),
    correctOption,
    feedback: {
      correct: statementIsCorrect
        ? `Yes — ${shownMass} is sensible for a ${object.label}.`
        : `Correct — a ${object.label} should use ${unitOption(object.unit).toLowerCase()}.`,
      wrong: statementIsCorrect
        ? `${shownMass} is sensible for a ${object.label}.`
        : `${shownMass} is not sensible for a ${object.label}. Choose ${unitOption(object.unit).toLowerCase()}.`,
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
  if (activity === "sort") return buildSortTask(memory);
  if (activity === "mistakeCheck") return buildMistakeTask(memory);
  return buildChooseUnitTask(memory);
}

export function resetY3MeasurelandsWeek3Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY3MeasurelandsWeek3Lesson2QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildChooseUnitTask(seed),
    buildMistakeTask(seed),
    buildSortTask(seed),
    buildChooseUnitTask(seed),
    buildMistakeTask(seed, true),
  ];
}
