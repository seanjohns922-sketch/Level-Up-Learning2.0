import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { playgroundInvestigation, campInvestigation, towerInvestigation } from "@/data/activities/year6Measurelands/week7Common";

// ── Measurelands · Level 6 · Week 7 · Lesson 3 — "Master Engineer Challenge" ──
// Bespoke multi-part investigations that combine strands, solved directly.
//   A. Community Playground — area, perimeter, volume.
//   B. School Camp          — time, capacity, conversion.
//   C. Observation Tower    — area, angle, volume.

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [playgroundInvestigation, campInvestigation, towerInvestigation];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek7Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek7Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY6MeasurelandsWeek7Lesson3QuizTasks(): PracticeTask[] {
  return [playgroundInvestigation(), campInvestigation(), towerInvestigation(), playgroundInvestigation(), campInvestigation()];
}
