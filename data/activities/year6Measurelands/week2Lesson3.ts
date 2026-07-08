import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { breakIntroTask, l3Solve, l3Total, l3Mistake } from "@/data/activities/year6Measurelands/week2Common";

// ── Measurelands · Level 6 · Week 2 · Lesson 3 — "Architect Challenges" ──────
// Real spaces (playground, garden, sports complex…), all in m². Opens with the
// strategy card, then rotates break-&-solve / total / spot-the-mistake.

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [l3Solve, l3Total, l3Mistake];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek2Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return breakIntroTask(); }
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek2Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY6MeasurelandsWeek2Lesson3QuizTasks(): PracticeTask[] {
  return [l3Total(), l3Mistake(), l3Total(), l3Mistake(), l3Total()];
}
