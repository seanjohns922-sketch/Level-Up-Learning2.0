import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { labSetTask, labReadTask, compareTask, choose } from "@/data/activities/year6Measurelands/week4Common";
import type { Measure } from "@/data/activities/year6Measurelands/metricLadders";

// ── Measurelands · Level 6 · Week 4 · Lesson 2 — "Mass & Capacity Lab" ────────
// AC9M6M01. Convert mass (dial scale, g↔kg) and capacity (jug, mL↔L) by using
// the instruments.
//   A. set     — weigh / pour a target given in kg or L.
//   B. read    — read the instrument in g / mL, convert to kg / L.
//   C. compare — which is greater (across units)?

type LessonMemory = { cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const mc = (): Measure => choose<Measure>(["mass", "capacity"]);
const ROTATION: Array<() => PracticeTask> = [() => labSetTask(mc()), () => labReadTask(mc()), () => compareTask(mc())];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek4Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek4Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY6MeasurelandsWeek4Lesson2QuizTasks(): PracticeTask[] {
  return [labReadTask("mass"), compareTask("capacity"), labReadTask("capacity"), compareTask("mass"), labReadTask("mass")];
}
