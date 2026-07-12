import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { pointFind, pointWhich, pointMistake } from "@/data/activities/year6Measurelands/week6Common";

// ── Measurelands · Level 6 · Week 6 · Lesson 2 — "Angles Around a Point" ──────
// (Enrichment; foundation for Year 7 AC9M7SP03.) Missing angles that total 360°.
//   A. find    — type the missing angle around a point.
//   B. which   — which answer is correct?
//   C. mistake — what's wrong with Professor Gauge's answer?

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [pointFind, pointWhich, pointMistake];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek6Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek6Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY6MeasurelandsWeek6Lesson2QuizTasks(): PracticeTask[] {
  return [pointFind(), pointWhich(), pointMistake(), pointFind(), pointWhich()];
}
