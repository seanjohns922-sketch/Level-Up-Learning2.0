import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { anyItinerary, latestTask, convert24Task } from "@/data/activities/year6Measurelands/week5Common";

// ── Measurelands · Level 6 · Week 5 · Lesson 3 — "Master Time Mission" ─────────
// AC9M6M04. One rich investigation combining 24-hour time, elapsed time and
// timetables.
//   A. itinerary — airport / camp / carnival multi-leg mission.
//   B. best      — choose the best service by a requirement.
//   C. convert   — 12 → 24-hour conversion.

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [anyItinerary, latestTask, convert24Task];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek5Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek5Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY6MeasurelandsWeek5Lesson3QuizTasks(): PracticeTask[] {
  return [latestTask(), convert24Task(), latestTask(), convert24Task(), latestTask()];
}
