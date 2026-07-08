import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { breakIntroTask, compositeSolveTask, compositeTotalTask, compositeMistakeTask } from "@/data/activities/year6Measurelands/week2Common";

// ── Measurelands · Level 6 · Week 2 · Lesson 2 — "Calculate Composite Area" ──
// Find each rectangle, then add. Opens with the strategy card.
//   A. compositeSolve   — break apart → area A → area B → total (separation anim).
//   B. compositeTotal   — add both rectangles; pick the total (traps: whole box / one piece).
//   C. compositeMistake — spot Professor Gauge's combine error.

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [
  () => compositeSolveTask("cells", "m²"),
  () => compositeTotalTask("cells", "m²"),
  () => compositeMistakeTask("cells", "m²"),
];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek2Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return breakIntroTask(); }
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek2Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY6MeasurelandsWeek2Lesson2QuizTasks(): PracticeTask[] {
  return [
    compositeTotalTask("cells", "m²"),
    compositeMistakeTask("cells", "m²"),
    compositeTotalTask("cells", "m²"),
    compositeMistakeTask("cells", "m²"),
    compositeTotalTask("cells", "m²"),
  ];
}
