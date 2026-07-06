import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { pickTemp, readOptions, matchSet, shuffle } from "@/data/activities/year4Measurelands/week3Common";

// ── Measurelands · Level 4 · Week 3 · Lesson 2 — "Read the Temperature" (AC9M4M01) ──
// Read carefully between the major markings (still whole degrees).
// THREE rotating activities:
//   A. read   — read the thermometer.
//   B. match  — three thermometers; choose the one showing the correct reading.
//   C. verify — Professor Gauge's reading vs the thermometer; is he right?

type TempTask = Extract<PracticeTask, { kind: "temperature" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"read" | "match" | "verify"> = ["read", "match", "verify", "read", "match", "verify"];

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
    prompt: "Every line on the thermometer matters.",
    speakText:
      "Professor Gauge says: every line on the thermometer matters. Read carefully between the numbered marks — the top of the liquid tells you the exact temperature.",
    badgeLabel: "Meazurex Mission",
    introValue: 24,
    feedback: { correct: "Let's read!", wrong: "Let's read!" },
  };
}

// Activity A — Read the Thermometer (values that fall between the 10° labels).
function buildReadTask(): TempTask {
  const value = pickTemp(11, 38);
  const { options, correct } = readOptions(value);
  return {
    kind: "temperature",
    scene: "read",
    display: "analog",
    prompt: "What temperature does the thermometer show?",
    speakText: "Read carefully. What temperature does the thermometer show?",
    badgeLabel: "Read the Temperature",
    value,
    options,
    correctNumber: correct,
    feedback: {
      correct: `Yes — the liquid is on ${value}°C.`,
      wrong: `Count the marks above the label — it's ${value}°C.`,
    },
  };
}

// Activity B — Choose the Correct Reading (three thermometers).
function buildMatchTask(): TempTask {
  const value = pickTemp(11, 38);
  const { thermometers, correctId } = matchSet(value);
  return {
    kind: "temperature",
    scene: "match",
    prompt: `Which thermometer reads exactly ${value}°C?`,
    speakText: `Which thermometer reads exactly ${value} degrees Celsius?`,
    badgeLabel: "Choose the Correct Reading",
    targetValue: value,
    thermometers,
    correctId,
    feedback: {
      correct: `Yes — that reads ${value}°C.`,
      wrong: `Read each one carefully — find ${value}°C.`,
    },
  };
}

// Activity C — Professor Gauge's Mistake.
function buildVerifyTask(): TempTask {
  const value = pickTemp(11, 38);
  const delta = shuffle([4, -4, 5, -5, 3, -3]).find((d) => value + d >= 0 && value + d <= 45)!;
  const claim = value + delta;
  const { options, correct } = readOptions(value);
  if (!options.includes(claim) && options.length >= 3) options[options.length - 1] = claim; // make his claim tappable-wrong
  return {
    kind: "temperature",
    scene: "read",
    display: "analog",
    prompt: "What is the correct reading?",
    speakText: `Professor Gauge read ${claim} degrees. Read the thermometer yourself. What is the correct reading?`,
    badgeLabel: "Professor Gauge's Mistake",
    value,
    statement: `Professor Gauge read ${claim}°C.`,
    options: shuffle(options),
    correctNumber: correct,
    feedback: {
      correct: `Yes — it really reads ${value}°C, not ${claim}°C.`,
      wrong: `Don't trust the claim — read the liquid. It's ${value}°C.`,
    },
  };
}

export function generateY4MeasurelandsWeek3Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "match") return buildMatchTask();
  if (activity === "verify") return buildVerifyTask();
  return buildReadTask();
}

export function resetY4MeasurelandsWeek3Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY4MeasurelandsWeek3Lesson2QuizTasks(): PracticeTask[] {
  return [buildReadTask(), buildMatchTask(), buildVerifyTask(), buildReadTask(), buildVerifyTask()];
}
