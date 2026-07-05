import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { buildIntro, buildRead, buildMatchClock, buildBuild } from "@/data/activities/year3Measurelands/week6Common";

// ── Measurelands · L3 · Week 6 · Lesson 3 — "Build Any Time" (Apply) ──
// AC9M3M04: build and match any time to the nearest minute. build · matchClock · read.
const STEP = 1;
type Mem = { introShown: boolean; cursor: number };
const mem = new Map<string, Mem>();
const ROTATION: Array<"build" | "matchClock" | "read"> = ["build", "matchClock", "read", "build", "read", "matchClock"];
function get(id: string): Mem { const e = mem.get(id); if (e) return e; const c: Mem = { introShown: false, cursor: 0 }; mem.set(id, c); return c; }

export function generateY3MeasurelandsWeek6Lesson3Task(lessonId: string, _d: Difficulty): PracticeTask {
  const m = get(lessonId);
  if (!m.introShown) { m.introShown = true; return buildIntro("Become the Time Master!", "Professor Gauge says: now it's your turn. Build the time, then read and match analog and digital clocks. Check both hands every time."); }
  const a = ROTATION[m.cursor % ROTATION.length]!; m.cursor += 1;
  if (a === "matchClock") return buildMatchClock(STEP);
  if (a === "read") return buildRead(STEP);
  return buildBuild(STEP);
}
export function resetY3MeasurelandsWeek6Lesson3TaskSessionState() { mem.clear(); }
export function buildY3MeasurelandsWeek6Lesson3QuizTasks(): PracticeTask[] {
  return [buildRead(STEP), buildRead(STEP), buildRead(STEP), buildRead(STEP), buildRead(STEP)];
}
