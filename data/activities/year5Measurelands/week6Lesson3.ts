import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { arriveInTimeTask, missionTask } from "@/data/activities/year5Measurelands/week6Common";

// ── Measurelands · Level 5 · Week 6 · Lesson 3 — "Plan the Journey" (AC9M5M03) ──
//   A. excursion — which service arrives before the excursion starts? (best ≠ earliest)
//   B. camp      — which service gets you to camp in time?
//   C. mission   — leaves at X, takes D — when does it arrive? (24-hour + elapsed)

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"excursion" | "camp" | "mission"> = ["excursion", "camp", "mission", "excursion", "camp", "mission"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY5MeasurelandsWeek6Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "camp") return arriveInTimeTask("camp");
  if (activity === "mission") return missionTask();
  return arriveInTimeTask("excursion");
}

export function resetY5MeasurelandsWeek6Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY5MeasurelandsWeek6Lesson3QuizTasks(): PracticeTask[] {
  return [arriveInTimeTask("excursion"), arriveInTimeTask("camp"), missionTask(), missionTask(), arriveInTimeTask("excursion")];
}
