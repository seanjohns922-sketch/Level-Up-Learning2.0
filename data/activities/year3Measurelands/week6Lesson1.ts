import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { buildIntro, buildRead, buildMatchClock, buildBuild } from "@/data/activities/year3Measurelands/week6Common";

// ── Measurelands · L3 · Week 6 · Lesson 1 — "Five-Minute Time" (Learn) ──
// AC9M3M04: read analog clocks in five-minute intervals. read · matchClock · build.
const STEP = 5;
type Mem = { introShown: boolean; cursor: number };
const mem = new Map<string, Mem>();
const ROTATION: Array<"read" | "matchClock" | "build"> = ["read", "matchClock", "build", "read", "build", "matchClock"];
function get(id: string): Mem { const e = mem.get(id); if (e) return e; const c: Mem = { introShown: false, cursor: 0 }; mem.set(id, c); return c; }

export function generateY3MeasurelandsWeek6Lesson1Task(lessonId: string, _d: Difficulty): PracticeTask {
  const m = get(lessonId);
  if (!m.introShown) { m.introShown = true; return buildIntro("Read the clock in five-minute steps!", "Professor Gauge teaches one strategy. Look at the long minute hand, count around the clock in fives, then read the short hour hand."); }
  const a = ROTATION[m.cursor % ROTATION.length]!; m.cursor += 1;
  if (a === "matchClock") return buildMatchClock(STEP);
  if (a === "build") return buildBuild(STEP);
  return buildRead(STEP);
}
export function resetY3MeasurelandsWeek6Lesson1TaskSessionState() { mem.clear(); }
export function buildY3MeasurelandsWeek6Lesson1QuizTasks(): PracticeTask[] {
  return [buildRead(STEP), buildRead(STEP), buildRead(STEP), buildRead(STEP), buildRead(STEP)];
}
