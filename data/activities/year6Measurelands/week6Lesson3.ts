import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { investigateTask, anyWhich, anyMistake } from "@/data/activities/year6Measurelands/week6Common";

// ── Measurelands · Level 6 · Week 6 · Lesson 3 — "Angle Investigations" ────────
// (Enrichment; foundation for Year 7 AC9M7SP03.) Engineering diagrams combining
// 180° and 360° reasoning. Reason, don't measure.
//   A. investigate — missing angle in a real structure (type it).
//   B. which       — which answer is correct?
//   C. mistake     — spot the reasoning error.

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [investigateTask, anyWhich, anyMistake];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek6Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek6Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY6MeasurelandsWeek6Lesson3QuizTasks(): PracticeTask[] {
  return [investigateTask(), anyWhich(), anyMistake(), investigateTask(), anyWhich()];
}
