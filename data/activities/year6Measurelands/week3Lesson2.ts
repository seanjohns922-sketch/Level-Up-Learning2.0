import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { formulaTask, layersTask, perLayerTask, totalTask } from "@/data/activities/year6Measurelands/week3Common";

// ── Measurelands · Level 6 · Week 3 · Lesson 2 — "Count the Layers" (AC9M6M03) ──
// The efficient idea: cubes per layer × number of layers. After the structure is
// clear, the formula Volume = length × width × height is EXPOSED (not required —
// count layers or use the formula, both work).
//   Reveal: the volume formula.
//   A. layers   — how many layers?
//   B. perLayer — how many cubes per layer?
//   C. total    — total volume (cubes per layer × layers, or the formula).

type LessonMemory = { formulaShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [layersTask, perLayerTask, () => totalTask()];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { formulaShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek3Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  // Show layers → perLayer first (build the structure), then reveal the formula.
  if (memory.cursor === 2 && !memory.formulaShown) { memory.formulaShown = true; return formulaTask(); }
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
