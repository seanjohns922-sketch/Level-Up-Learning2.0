import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { introTask, lineFind, lineWhich, lineMistake } from "@/data/activities/year6Measurelands/week6Common";

// ── Measurelands · Level 6 · Week 6 · Lesson 1 — "Angles on a Straight Line" ──
// (Enrichment; foundation for Year 7 AC9M7SP03.) Missing angles that total 180°.
//   Intro: straight line = 180°, around a point = 360°.
//   A. find    — type the missing angle (reason, then check with the protractor).
//   B. which   — which answer is correct?
//   C. mistake — what's wrong with Professor Gauge's answer?

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [lineFind, lineWhich, lineMistake];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek6Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return introTask(); }
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek6Lesson1TaskSessionState() {
  lessonMemory.clear();
}

export function buildY6MeasurelandsWeek6Lesson1QuizTasks(): PracticeTask[] {
  return [lineFind(), lineWhich(), lineMistake(), lineFind(), lineWhich()];
}
