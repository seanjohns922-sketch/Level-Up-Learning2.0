import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { layersTask, perLayerTask, totalTask } from "@/data/activities/year6Measurelands/week3Common";

// ── Measurelands · Level 6 · Week 3 · Lesson 2 — "Count the Layers" (AC9M6M03) ──
// The efficient idea: cubes per layer × number of layers. (This is base-area ×
// height structurally — the formula is not named until Year 7.)
//   A. layers   — how many layers?
//   B. perLayer — how many cubes per layer?
//   C. total    — total volume (cubes per layer × layers).

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [layersTask, perLayerTask, () => totalTask()];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek3Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek3Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY6MeasurelandsWeek3Lesson2QuizTasks(): PracticeTask[] {
  return [layersTask(), perLayerTask(), totalTask(), layersTask(), perLayerTask()];
}
