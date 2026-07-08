import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { rowsTask, columnsTask, predictTask, formulaRevealTask, arrayMcqTask } from "@/data/activities/year6Measurelands/week1Common";

// ── Measurelands · Level 6 · Week 1 · Lesson 1 — "Discover the Formula" (AC9M6M02) ──
// Discovery before instruction. Students count rows, count columns, then PREDICT
// rows × columns (commit) and the grid reveals to confirm — the "aha". Only after
// they've predicted does the formula Area = length × width get named (earned).
//   Opening arc: rows → columns → predict → formulaReveal.
//   Then rotate: predict / rows / columns.

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const OPENING: Array<() => PracticeTask> = [rowsTask, columnsTask, predictTask, formulaRevealTask];
const ROTATION: Array<() => PracticeTask> = [predictTask, rowsTask, columnsTask];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek1Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const i = memory.cursor;
  memory.cursor += 1;
  if (i < OPENING.length) return OPENING[i]!();
  return ROTATION[(i - OPENING.length) % ROTATION.length]!();
}

export function resetY6MeasurelandsWeek1Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// Weekly quiz needs determinate answers → rows × columns MCQ.
export function buildY6MeasurelandsWeek1Lesson1QuizTasks(): PracticeTask[] {
  return [arrayMcqTask(), arrayMcqTask(), arrayMcqTask(), arrayMcqTask(), arrayMcqTask()];
}
