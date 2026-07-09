import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { compareTask, packingTask, capacityTask } from "@/data/activities/year6Measurelands/week3Common";

// ── Measurelands · Level 6 · Week 3 · Lesson 3 — "Volume Problems" (AC9M6M03) ──
// Real prisms (crates, tanks, boxes) plus the volume↔capacity link (1 cm³ = 1 mL).
//   A. compare  — which box holds more?
//   B. packing  — how many cubes fit inside?
//   C. capacity — how much water can it hold (cm³ = mL)?

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [compareTask, packingTask, capacityTask];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek3Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek3Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY6MeasurelandsWeek3Lesson3QuizTasks(): PracticeTask[] {
  return [compareTask(), packingTask(), capacityTask(), compareTask(), capacityTask()];
}
