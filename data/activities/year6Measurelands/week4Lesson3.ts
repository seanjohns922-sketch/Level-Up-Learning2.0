import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { l3Read, l3Compare, l3Mistake } from "@/data/activities/year6Measurelands/week4Common";

// ── Measurelands · Level 6 · Week 4 · Lesson 3 — "Lab Challenges" (AC9M6M01) ──
// Decimal representations + real problems across all three measures.
//   A. read    — read a decimal amount, convert (real contexts).
//   B. compare — which is greater / more?
//   C. mistake — check a conversion in a real situation.

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [l3Read, l3Compare, l3Mistake];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek4Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek4Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY6MeasurelandsWeek4Lesson3QuizTasks(): PracticeTask[] {
  return [l3Read(), l3Compare(), l3Mistake(), l3Read(), l3Compare()];
}
