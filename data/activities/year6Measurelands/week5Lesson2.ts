import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { excursionItinerary, carnivalItinerary, howLongTask, finishTask } from "@/data/activities/year6Measurelands/week5Common";

// ── Measurelands · Level 6 · Week 5 · Lesson 2 — "Multi-Step Time Problems" ────
// AC9M6M04. Combine several time calculations into one investigation.
//   A. itinerary — multi-leg plan (excursion / carnival), step by step.
//   B. howLong   — elapsed time of a session.
//   C. finish    — finish time from a start + duration.

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [
  () => (Math.random() < 0.5 ? excursionItinerary() : carnivalItinerary()),
  howLongTask,
  finishTask,
];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek5Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek5Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY6MeasurelandsWeek5Lesson2QuizTasks(): PracticeTask[] {
  return [howLongTask(), finishTask(), howLongTask(), finishTask(), howLongTask()];
}
