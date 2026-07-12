import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { optimiseBest, optimiseWhyBad, strategyBest } from "@/data/activities/year6Measurelands/week7Common";

// ── Measurelands · Level 6 · Week 7 · Lesson 2 — "Optimise the Solution" ───────
// Compare approaches; choose the most efficient. Justify.
//   A. most efficient — pick the smartest method.
//   B. which is better — why a slower method isn't best.
//   C. strategy check  — pick the right strategy for a fresh scenario.

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [optimiseBest, optimiseWhyBad, strategyBest];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek7Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek7Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY6MeasurelandsWeek7Lesson2QuizTasks(): PracticeTask[] {
  return [optimiseBest(), optimiseWhyBad(), optimiseBest(), strategyBest(), optimiseWhyBad()];
}
