import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { parkPlan, sportsGroundPlan, communityGardenPlan } from "@/data/activities/year6Measurelands/week8Common";

// ── Measurelands · Level 6 · Week 8 · Lesson 1 — "Design the Community Park" ──
// Plan: identify the right measurement for each need, then calculate it. Three
// rotating civic projects, answers carried forward.
//   A. Community Park   — plan → area, plan → perimeter.
//   B. Sports Ground    — plan → area, plan → volume.
//   C. Community Garden — plan → perimeter, plan → convert.

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [parkPlan, sportsGroundPlan, communityGardenPlan];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek8Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek8Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// Week 8 has no weekly quiz — completing Lesson 3 unlocks the Level 6 Post-Test.
export function buildY6MeasurelandsWeek8Lesson1QuizTasks(): PracticeTask[] {
  return [];
}
