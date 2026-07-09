import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { introTask, buildTask, countTask, completeTask } from "@/data/activities/year6Measurelands/week3Common";

// ── Measurelands · Level 6 · Week 3 · Lesson 1 — "Build Volume" (AC9M6M03) ────
// Construct prisms one cube at a time; the layer-by-layer build teaches that
// volume is made of cubic units stacked in layers.
//   Intro: area vs volume (cubic units).
//   A. build    — tap-to-build, layer by layer (predict-first after the first).
//   B. count    — how many cubes (including hidden)?
//   C. complete — finish a partly-built prism.

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<(round: number) => PracticeTask> = [
  (round) => buildTask(round > 0), // predict-first on later rounds
  () => countTask(),
  () => completeTask(),
];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek3Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return introTask(); }
  const i = memory.cursor;
  memory.cursor += 1;
  const round = Math.floor(i / ROTATION.length);
  return ROTATION[i % ROTATION.length]!(round);
}

export function resetY6MeasurelandsWeek3Lesson1TaskSessionState() {
  lessonMemory.clear();
}

export function buildY6MeasurelandsWeek3Lesson1QuizTasks(): PracticeTask[] {
  return [countTask(), countTask(), countTask(), countTask(), countTask()];
}
