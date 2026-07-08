import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { formulaIntroTask, l3Calc, l3Choose, l3Mistake } from "@/data/activities/year6Measurelands/week1Common";

// ── Measurelands · Level 6 · Week 1 · Lesson 3 — "Area Investigations" (AC9M6M02) ──
// Apply the formula to real spaces (school hall, court, playground…), always in m².
//   A. calcDims  — how much flooring / turf (length × width).
//   B. chooseArea — pick the correct area (perimeter / added-sides traps).
//   C. mistakeDims — check an architect's quote for the error.

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [l3Calc, l3Choose, l3Mistake];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek1Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return formulaIntroTask(); }
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek1Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY6MeasurelandsWeek1Lesson3QuizTasks(): PracticeTask[] {
  return [l3Calc(), l3Choose(), l3Mistake(), l3Calc(), l3Choose()];
}
