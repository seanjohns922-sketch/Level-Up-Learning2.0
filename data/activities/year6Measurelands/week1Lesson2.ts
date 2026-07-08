import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { l2Calc, l2Choose, l2Mistake } from "@/data/activities/year6Measurelands/week1Common";

// ── Measurelands · Level 6 · Week 1 · Lesson 2 — "Calculate Area" (AC9M6M02) ──
// Use the formula on labelled rectangles (no grid — the squares only "peek" back
// after a miss). Square-unit notation cm²/m² is introduced here.
//   A. calcDims  — calculate area from length × width.
//   B. chooseArea — pick the correct area (traps: perimeter / added sides).
//   C. mistakeDims — find the error in Professor Gauge's working.

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [l2Calc, l2Choose, l2Mistake];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek1Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek1Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY6MeasurelandsWeek1Lesson2QuizTasks(): PracticeTask[] {
  return [l2Choose(), l2Calc(), l2Mistake(), l2Choose(), l2Calc()];
}
