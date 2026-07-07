import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { findTask, compareTask, detectiveTask } from "@/data/activities/year5Measurelands/week6Common";

// ── Measurelands · Level 5 · Week 6 · Lesson 2 — "Read Timetables" (AC9M5M03) ──
//   A. find      — which service goes to X? (tap the row)
//   B. compare   — which service arrives first? (tap the row)
//   C. detective — how long is the journey? (MCQ)

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"find" | "compare" | "detective"> = ["find", "compare", "detective", "find", "compare", "detective"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY5MeasurelandsWeek6Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "compare") return compareTask();
  if (activity === "detective") return detectiveTask();
  return findTask();
}

export function resetY5MeasurelandsWeek6Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY5MeasurelandsWeek6Lesson2QuizTasks(): PracticeTask[] {
  return [findTask(), compareTask(), detectiveTask(), findTask(), detectiveTask()];
}
