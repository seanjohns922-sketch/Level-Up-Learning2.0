import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { campInvestigation, playgroundInvestigation, towerInvestigation } from "@/data/activities/year6Measurelands/week7Common";

// ── Measurelands · Level 6 · Week 8 · Lesson 3 — "Master Measurelands Mission" ─
// Justify a coherent solution across the Year 6 Measurement descriptors before
// the Level 6 Post-Test unlocks.

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

export function generateY6MeasurelandsWeek8Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek8Lesson3TaskSessionState() {
  lessonMemory.clear();
}

// Week 8 has no weekly quiz — completing this lesson unlocks the Level 6 Post-Test.
export function buildY6MeasurelandsWeek8Lesson3QuizTasks(): PracticeTask[] {
  return [];
}
