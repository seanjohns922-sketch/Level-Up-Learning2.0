import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { buildIntro, buildRead, buildMatchClock, buildSpotTime } from "@/data/activities/year3Measurelands/week6Common";

// ── Measurelands · L3 · Week 6 · Lesson 2 — "Read to the Minute" (Read) ──
// AC9M3M04: read analog clocks to the nearest minute. read · matchClock · spotTime.
const STEP = 1;
type Mem = { introShown: boolean; cursor: number };
const mem = new Map<string, Mem>();
const ROTATION: Array<"read" | "matchClock" | "spotTime"> = ["read", "matchClock", "spotTime", "read", "spotTime", "matchClock"];
function get(id: string): Mem { const e = mem.get(id); if (e) return e; const c: Mem = { introShown: false, cursor: 0 }; mem.set(id, c); return c; }

export function generateY3MeasurelandsWeek6Lesson2Task(lessonId: string, _d: Difficulty): PracticeTask {
  const m = get(lessonId);
  if (!m.introShown) { m.introShown = true; return buildIntro("Read the clock to the nearest minute!", "Professor Gauge says: first find the nearest five-minute number, then count the extra minute marks."); }
  const a = ROTATION[m.cursor % ROTATION.length]!; m.cursor += 1;
  if (a === "matchClock") return buildMatchClock(STEP);
  if (a === "spotTime") return buildSpotTime(STEP);
  return buildRead(STEP);
}
export function resetY3MeasurelandsWeek6Lesson2TaskSessionState() { mem.clear(); }
export function buildY3MeasurelandsWeek6Lesson2QuizTasks(): PracticeTask[] {
  return [buildRead(STEP), buildSpotTime(STEP), buildRead(STEP), buildSpotTime(STEP), buildRead(STEP)];
}
