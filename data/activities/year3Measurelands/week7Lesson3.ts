import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { buildIntro, buildCompareWalk, buildWhichPath, buildTrace, POOLS } from "@/data/activities/year3Measurelands/week7Common";

// ── Measurelands · L3 · Week 7 · Lesson 3 — "Explore Perimeter" (Apply) ──
// Recognise & compare perimeter in real life. compareWalk · whichPath · trace.
type Mem = { introShown: boolean; cursor: number };
const mem = new Map<string, Mem>();
const ROTATION: Array<"compareWalk" | "whichPath" | "trace"> = ["compareWalk", "whichPath", "trace", "compareWalk", "trace", "whichPath"];
function get(id: string): Mem { const e = mem.get(id); if (e) return e; const c: Mem = { introShown: false, cursor: 0 }; mem.set(id, c); return c; }

export function generateY3MeasurelandsWeek7Lesson3Task(lessonId: string, _d: Difficulty): PracticeTask {
  const m = get(lessonId);
  if (!m.introShown) { m.introShown = true; return { ...buildIntro(), prompt: "Perimeter is everywhere!", speakText: "Professor Gauge says: everything has an outside edge. Gardens, playgrounds, fences, football ovals — they all have a perimeter." }; }
  const a = ROTATION[m.cursor % ROTATION.length]!; m.cursor += 1;
  if (a === "whichPath") return buildWhichPath(POOLS.ALL);
  if (a === "trace") return buildTrace(POOLS.ALL);
  return buildCompareWalk(POOLS.ALL);
}
export function resetY3MeasurelandsWeek7Lesson3TaskSessionState() { mem.clear(); }
export function buildY3MeasurelandsWeek7Lesson3QuizTasks(): PracticeTask[] {
  return [buildCompareWalk(POOLS.ALL), buildWhichPath(POOLS.ALL), buildCompareWalk(POOLS.ALL), buildWhichPath(POOLS.ALL), buildCompareWalk(POOLS.ALL)];
}
