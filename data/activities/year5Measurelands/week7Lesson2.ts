import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { readTask, whichScaleTask, mistakeTask } from "@/data/activities/year5Measurelands/week7Common";

// ── Measurelands · Level 5 · Week 7 · Lesson 2 — "Measure Angles" (AC9M5M04) ──
//   A. read       — read the protractor (correct scale glowing).
//   B. whichScale — read from the glowing baseline (student picks the scale).
//   C. mistake    — what mistake did Professor Gauge make?

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"read" | "whichScale" | "mistake"> = ["read", "whichScale", "mistake", "read", "whichScale", "mistake"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY5MeasurelandsWeek7Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "whichScale") return whichScaleTask();
  if (activity === "mistake") return mistakeTask();
  return readTask();
}

export function resetY5MeasurelandsWeek7Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY5MeasurelandsWeek7Lesson2QuizTasks(): PracticeTask[] {
  return [readTask(), whichScaleTask(), mistakeTask(), readTask(), whichScaleTask()];
}
