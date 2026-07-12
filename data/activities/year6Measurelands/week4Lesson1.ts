import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { introTask, labSetTask, labReadTask, compareTask } from "@/data/activities/year6Measurelands/week4Common";

// ── Measurelands · Level 6 · Week 4 · Lesson 1 — "Length Lab" (AC9M6M01) ──────
// Convert length by USING a tape measure marked in cm.
//   Intro: welcome to the Measurement Lab.
//   A. set     — drag the tape to a length given in m ("Set 1.5 m").
//   B. read    — read the tape in cm, convert to m.
//   C. compare — which length is greater (across units)?

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<() => PracticeTask> = [() => labSetTask("length"), () => labReadTask("length"), () => compareTask("length")];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

export function generateY6MeasurelandsWeek4Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return introTask(); }
  const task = ROTATION[memory.cursor % ROTATION.length]!();
  memory.cursor += 1;
  return task;
}

export function resetY6MeasurelandsWeek4Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// Weekly quiz — read + compare are determinate (set is a hands-on tool).
export function buildY6MeasurelandsWeek4Lesson1QuizTasks(): PracticeTask[] {
  return [labReadTask("length"), compareTask("length"), labReadTask("length"), compareTask("length"), labReadTask("length")];
}
