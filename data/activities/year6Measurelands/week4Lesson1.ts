import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { introTask, climbTask, convertTask, mistakeTask } from "@/data/activities/year6Measurelands/week4Common";

// ── Measurelands · Level 6 · Week 4 · Lesson 1 — "The Metric Ladder" (Length) ──
// AC9M6M01. Build the ×10/×100/×1000 structure with length units.
//   Intro: the metric ladder (powers of 10).
//   A. climb   — step up/down the ladder to the goal unit.
//   B. convert — type the converted value (ladder as support).
//   C. mistake — spot Gauge's wrong-power / wrong-direction conversion.

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [() => climbTask("length"), () => convertTask("length"), () => mistakeTask("length")];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek4Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return introTask(); }
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek4Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// Weekly quiz — convert + mistake are determinate (climb is a guided tool).
export function buildY6MeasurelandsWeek4Lesson1QuizTasks(): PracticeTask[] {
  return [convertTask("length"), mistakeTask("length"), convertTask("length"), mistakeTask("length"), convertTask("length")];
}
