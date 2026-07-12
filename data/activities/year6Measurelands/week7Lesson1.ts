import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { strategyBest, toolBest, strategyWhyBad } from "@/data/activities/year6Measurelands/week7Common";

// ── Measurelands · Level 6 · Week 7 · Lesson 1 — "Choose the Strategy" ─────────
// Analyse a scenario and pick the right strategy/tool before calculating.
//   A. what do you need? — pick the strategy (perimeter/area/volume/time…).
//   B. choose the tool   — pick the right instrument.
//   C. Gauge's choice    — explain why his strategy is wrong.

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [strategyBest, toolBest, strategyWhyBad];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek7Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek7Lesson1TaskSessionState() {
  lessonMemory.clear();
}

export function buildY6MeasurelandsWeek7Lesson1QuizTasks(): PracticeTask[] {
  return [strategyBest(), toolBest(), strategyWhyBad(), strategyBest(), toolBest()];
}
