import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { constructTask, CONTEXTS, choose } from "@/data/activities/year5Measurelands/week7Common";

// ── Measurelands · Level 5 · Week 7 · Lesson 3 — "Construct Angles" (AC9M5M04) ──
//   A. build 45° — drag the arm to build a 45° angle.
//   B. build 120° — build a 120° angle.
//   C. engineer challenge — construct an angle for a bridge / roof / ramp / road.

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"build45" | "build120" | "challenge"> = ["build45", "build120", "challenge", "build45", "build120", "challenge"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY5MeasurelandsWeek7Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "build45") return constructTask(45, choose(CONTEXTS));
  if (activity === "build120") return constructTask(120, choose(CONTEXTS));
  return constructTask();
}

export function resetY5MeasurelandsWeek7Lesson3TaskSessionState() {
  lessonMemory.clear();
}

// Construct is interactive but determinate (must hit the target to Build), so it
// is quiz-safe.
export function buildY5MeasurelandsWeek7Lesson3QuizTasks(): PracticeTask[] {
  return [constructTask(45), constructTask(90), constructTask(120), constructTask(60), constructTask(135)];
}
