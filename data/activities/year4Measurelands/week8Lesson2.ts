import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { pull } from "@/data/activities/year4Measurelands/week8Common";
import { buildY4MeasurelandsWeek2Lesson1QuizTasks } from "@/data/activities/year4Measurelands/week2Lesson1";
import { buildY4MeasurelandsWeek2Lesson2QuizTasks } from "@/data/activities/year4Measurelands/week2Lesson2";
import { buildY4MeasurelandsWeek2Lesson3QuizTasks } from "@/data/activities/year4Measurelands/week2Lesson3";
import { buildY4MeasurelandsWeek3Lesson2QuizTasks } from "@/data/activities/year4Measurelands/week3Lesson2";
import { buildY4MeasurelandsWeek3Lesson3QuizTasks } from "@/data/activities/year4Measurelands/week3Lesson3";

// ── Measurelands · Level 4 · Week 8 · Lesson 2 — "Science Investigation" ──────
// Capstone application (AC9M4M01). Students measure like scientists: read a
// scale, a jug and a thermometer, then compare the readings to make decisions.
// No new mechanics — reuses the Scale (Week 2), Jug (Week 2) and Thermometer
// (Week 3) reading + comparison tasks, rotated across all three instruments.
//   A. read    — read an instrument (rotates scale → jug → thermometer).
//   B. compare — compare readings (heavier / holds more / warmer).
//   C. mission — a science decision using measurements.

type MassScaleTask = Extract<PracticeTask, { kind: "massScale" }>;

type LessonMemory = { introShown: boolean; cursor: number; readCursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"read" | "compare" | "mission"> = ["read", "compare", "mission", "read", "compare", "mission"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, readCursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function buildIntroTask(): MassScaleTask {
  return {
    kind: "massScale",
    scene: "intro",
    precision: true,
    scaleType: "dial",
    prompt: "Scientists measure with more than one tool.",
    speakText:
      "Professor Gauge says: in the science lab you use many instruments together. Read the scale, the jug and the thermometer carefully, then compare your readings to work out the answer.",
    badgeLabel: "Meazurex Mission",
    object: { label: "beaker of rocks", emoji: "🪨", mass: 1.5, unit: "kg" },
    feedback: { correct: "Let's investigate!", wrong: "Let's investigate!" },
  };
}

// Activity A — Read an instrument (rotate scale → jug → thermometer).
const READ_BUILDERS: Array<() => PracticeTask[]> = [
  buildY4MeasurelandsWeek2Lesson1QuizTasks, // scale (mass)
  buildY4MeasurelandsWeek2Lesson2QuizTasks, // jug (capacity)
  buildY4MeasurelandsWeek3Lesson2QuizTasks, // thermometer (temperature)
];

function buildReadTask(memory: LessonMemory): PracticeTask {
  const build = READ_BUILDERS[memory.readCursor % READ_BUILDERS.length]!;
  memory.readCursor += 1;
  return pull(build);
}

// Activity B — Compare readings (mass / capacity / temperature).
function buildCompareTask(): PracticeTask {
  return pull(Math.random() < 0.5 ? buildY4MeasurelandsWeek2Lesson3QuizTasks : buildY4MeasurelandsWeek3Lesson3QuizTasks);
}

// Activity C — Science mission (a decision using measurements).
function buildMissionTask(): PracticeTask {
  return pull(Math.random() < 0.5 ? buildY4MeasurelandsWeek3Lesson3QuizTasks : buildY4MeasurelandsWeek2Lesson3QuizTasks);
}

export function generateY4MeasurelandsWeek8Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "compare") return buildCompareTask();
  if (activity === "mission") return buildMissionTask();
  return buildReadTask(memory);
}

export function resetY4MeasurelandsWeek8Lesson2TaskSessionState() {
  lessonMemory.clear();
}

// Week 8 has NO weekly quiz — the capstone flows straight into the Level 4
// Post-Test. This builder exists only to satisfy the registry contract.
export function buildY4MeasurelandsWeek8Lesson2QuizTasks(): PracticeTask[] {
  return [];
}
