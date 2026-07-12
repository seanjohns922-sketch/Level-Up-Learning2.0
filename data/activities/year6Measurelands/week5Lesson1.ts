import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { latestTask, firstAfterTask, durationTask } from "@/data/activities/year6Measurelands/week5Common";

// ── Measurelands · Level 6 · Week 5 · Lesson 1 — "Plan the Journey" (AC9M6M04) ──
// Interpret and compare 24-hour timetables; choose the best by a requirement.
//   A. best     — latest service that still arrives by the deadline.
//   B. next     — next departure after you reach the platform.
//   C. duration — how long does a named service take?

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [latestTask, firstAfterTask, durationTask];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek5Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek5Lesson1TaskSessionState() {
  lessonMemory.clear();
}

export function buildY6MeasurelandsWeek5Lesson1QuizTasks(): PracticeTask[] {
  return [durationTask(), latestTask(), firstAfterTask(), durationTask(), latestTask()];
}
