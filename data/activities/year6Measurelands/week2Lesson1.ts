import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { splitChooseTask, splitDragTask, splitWorksTask } from "@/data/activities/year6Measurelands/week2Common";

// ── Measurelands · Level 6 · Week 2 · Lesson 1 — "Break the Shape" (AC9M6M02) ──
// The strategy, not a formula: break a hard shape into rectangles.
//   A. splitChoose — tap the cut that makes two rectangles.
//   B. splitDrag   — slide a cut to a rectangle split, then Split (separation anim).
//   C. splitWorks  — pick the split where BOTH parts are rectangles.

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [splitChooseTask, splitDragTask, splitWorksTask];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek2Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek2Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// Determinate MCQ for the weekly quiz.
export function buildY6MeasurelandsWeek2Lesson1QuizTasks(): PracticeTask[] {
  return [splitWorksTask(), splitWorksTask(), splitWorksTask(), splitWorksTask(), splitWorksTask()];
}
