import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { pickTemp, readOptions, matchSet, shuffle, choose, randInt, CITIES } from "@/data/activities/year4Measurelands/week3Common";

// ── Measurelands · Level 4 · Week 3 · Lesson 1 — "Meet the Thermometer" (AC9M4M01) ──
// Recognise °C and build temperature intuition (hotter = higher). New reusable
// MeasurelandsThermometer.
// THREE rotating activities:
//   A. read    — read the thermometer (°C options).
//   B. match   — three thermometers; tap the one showing the target temp.
//   C. warmer  — two places; tap the warmer (or colder) one.

type TempTask = Extract<PracticeTask, { kind: "temperature" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"read" | "match" | "warmer"> = ["read", "match", "warmer", "read", "match", "warmer"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function buildIntroTask(): TempTask {
  return {
    kind: "temperature",
    scene: "intro",
    prompt: "Scientists use thermometers to measure temperature.",
    speakText:
      "Professor Gauge says: scientists use thermometers to measure how hot or cold something is, in degrees Celsius. Ice is zero degrees. A room is about twenty degrees. A sunny day is about thirty degrees. Higher means warmer.",
    badgeLabel: "Meazurex Mission",
    introValue: 20,
    feedback: { correct: "Let's read!", wrong: "Let's read!" },
  };
}

// Activity A — Read the Thermometer.
function buildReadTask(): TempTask {
  const value = pickTemp(5, 35);
  const { options, correct } = readOptions(value);
  return {
    kind: "temperature",
    scene: "read",
    display: randInt(4) === 0 ? "digital" : "analog",
    prompt: "What temperature does the thermometer show?",
    speakText: "Read the thermometer. What temperature does it show?",
    badgeLabel: "Read the Thermometer",
    value,
    options,
    correctNumber: correct,
    feedback: {
      correct: `Yes — it reads ${value}°C.`,
      wrong: `Read the top of the liquid — it's ${value}°C.`,
    },
  };
}

// Activity B — Which Thermometer Matches?
function buildMatchTask(): TempTask {
  const value = pickTemp(5, 35);
  const { thermometers, correctId } = matchSet(value);
  return {
    kind: "temperature",
    scene: "match",
    prompt: `Which thermometer shows ${value}°C?`,
    speakText: `Which thermometer shows ${value} degrees Celsius?`,
    badgeLabel: "Which Thermometer Matches?",
    targetValue: value,
    thermometers,
    correctId,
    feedback: {
      correct: `Yes — that one reads ${value}°C.`,
      wrong: `Look for the liquid on ${value}°C.`,
    },
  };
}

// Activity C — Hotter or Colder?
function buildWarmerTask(): TempTask {
  const a = pickTemp(5, 20);
  let b = pickTemp(21, 36);
  if (b === a) b = a + 5;
  const askWarmer = randInt(2) === 0;
  const target = askWarmer ? (a > b ? a : b) : a < b ? a : b;
  const [c1, c2] = shuffle([
    { id: "a", label: choose(CITIES), value: a },
    { id: "b", label: choose(CITIES.filter((c) => c)), value: b },
  ]);
  // ensure distinct labels
  if (c1.label === c2.label) c2.label = CITIES.find((c) => c !== c1.label)!;
  const correct = c1.value === target ? c1 : c2;
  return {
    kind: "temperature",
    scene: "compare",
    prompt: askWarmer ? "Which place is warmer?" : "Which place is colder?",
    speakText: askWarmer ? "Which place is warmer? Use the temperatures." : "Which place is colder? Use the temperatures.",
    badgeLabel: askWarmer ? "Which Is Warmer?" : "Which Is Colder?",
    items: [c1, c2],
    correctLabel: correct.label,
    feedback: {
      correct: `Yes — ${correct.label} at ${correct.value}°C.`,
      wrong: askWarmer ? "The higher temperature is warmer." : "The lower temperature is colder.",
    },
  };
}

export function generateY4MeasurelandsWeek3Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "match") return buildMatchTask();
  if (activity === "warmer") return buildWarmerTask();
  return buildReadTask();
}

export function resetY4MeasurelandsWeek3Lesson1TaskSessionState() {
  lessonMemory.clear();
}

export function buildY4MeasurelandsWeek3Lesson1QuizTasks(): PracticeTask[] {
  return [buildReadTask(), buildMatchTask(), buildWarmerTask(), buildReadTask(), buildMatchTask()];
}
