import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  unitOption,
  Y3_GRAM_MASS_OBJECTS,
  Y3_KILOGRAM_MASS_OBJECTS,
  Y3_MASS_OBJECTS,
  type Y3MassObject,
} from "@/data/activities/year3Measurelands/massObjects";

// Measurelands · Level 3 · Week 3 · Lesson 1 — Meet Grams and Kilograms.
// AC9M3M01: recognise grams and kilograms as sensible formal mass units.

type MassUnitTask = Extract<PracticeTask, { kind: "massUnit" }>;
type LessonMemory = { introShown: boolean; cursor: number; recent: string[] };

const ROTATION: Array<"chooseUnit" | "sort" | "mistakeCheck"> = [
  "chooseUnit",
  "sort",
  "mistakeCheck",
  "chooseUnit",
  "mistakeCheck",
  "sort",
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

function pickObject(memory: LessonMemory, pool = Y3_MASS_OBJECTS): Y3MassObject {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const object = pool[randInt(pool.length)]!;
    if (!memory.recent.includes(object.label)) {
      memory.recent.push(object.label);
      if (memory.recent.length > 12) memory.recent.shift();
      return object;
    }
  }
  return pool[randInt(pool.length)]!;
}

function taskObject(object: Y3MassObject, showMass = false) {
  return {
    emoji: object.emoji,
    label: object.label,
    unit: object.unit,
    sensibleMass: showMass ? object.sensibleMass : undefined,
  };
}

function buildIntroTask(): MassUnitTask {
  return {
    kind: "massUnit",
    scene: "intro",
    prompt: "Meet grams and kilograms.",
    speakText:
      "Professor Gauge says: grams measure lighter objects. Kilograms measure heavier objects. Choose the unit that makes sense.",
    badgeLabel: "Mass Works",
    statement: "Choose the unit that fits the object.",
    feedback: { correct: "Let's choose sensible mass units.", wrong: "Let's choose sensible mass units." },
  };
}

function buildChooseUnitTask(memory: LessonMemory): MassUnitTask {
  const object = pickObject(memory);
  return {
    kind: "massUnit",
    scene: "chooseUnit",
    prompt: `Would you use g or kg for a ${object.label}?`,
    speakText: `Would you measure a ${object.label} in grams or kilograms?`,
    badgeLabel: "Which Unit?",
    object: taskObject(object),
    options: ["Grams (g)", "Kilograms (kg)"],
    correctOption: unitOption(object.unit),
    feedback: {
      correct: `Yes — ${unitOption(object.unit).toLowerCase()} suits a ${object.label}.`,
      wrong:
        object.unit === "kg"
          ? `A ${object.label} is heavier, so kilograms is more sensible.`
          : `A ${object.label} is lighter, so grams is more sensible.`,
    },
  };
}

function buildSortTask(memory: LessonMemory): MassUnitTask {
  const grams = shuffle(Y3_GRAM_MASS_OBJECTS).slice(0, 3);
  const kilograms = shuffle(Y3_KILOGRAM_MASS_OBJECTS).slice(0, 3);
  const items = shuffle([...grams, ...kilograms]).map((object) => taskObject(object));
  memory.recent = items.map((item) => item.label).slice(-12);

  return {
    kind: "massUnit",
    scene: "sort",
    prompt: "Sort into grams or kilograms.",
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
  const correctOption = statementIsCorrect
    ? "Yes."
    : object.unit === "g"
      ? "No — grams would be more sensible."
      : "No — kilograms would be more sensible.";

  return {
    kind: "massUnit",
    scene: "mistakeCheck",
    prompt: "Is Professor Gauge correct?",
    speakText: `Professor Gauge says: this ${object.label} weighs ${shownMass}. Is he correct?`,
    badgeLabel: "Gauge's Mistake",
    object: taskObject(object),
    statement: `This ${object.label} weighs ${shownMass}.`,
    options: shuffle(["Yes.", "No — grams would be more sensible.", "No — kilograms would be more sensible."]),
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
  if (activity === "mistakeCheck") return buildMistakeTask(memory);
  return buildChooseUnitTask(memory);
}

export function resetY3MeasurelandsWeek3Lesson1TaskSessionState() {
  lessonMemory.clear();
}

export function buildY3MeasurelandsWeek3Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, recent: [] };
  return [
    buildChooseUnitTask(seed),
    buildMistakeTask(seed),
    buildSortTask(seed),
    buildChooseUnitTask(seed),
    buildMistakeTask(seed, true),
  ];
}
