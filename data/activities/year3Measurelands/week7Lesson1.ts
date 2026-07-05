import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { buildIntro, buildTrace, buildWhichPath, buildMissingSide, POOLS } from "@/data/activities/year3Measurelands/week7Common";

// ── Measurelands · L3 · Week 7 · Lesson 1 — "Around the Edge" (Understand) ──
// Perimeter = the outside boundary. whichPath · trace · missingSide (simple shapes).
type Mem = { introShown: boolean; cursor: number };
const mem = new Map<string, Mem>();
const ROTATION: Array<"whichPath" | "trace" | "missingSide"> = ["whichPath", "trace", "missingSide", "trace", "whichPath", "missingSide"];
function get(id: string): Mem { const e = mem.get(id); if (e) return e; const c: Mem = { introShown: false, cursor: 0 }; mem.set(id, c); return c; }

export function generateY3MeasurelandsWeek7Lesson1Task(lessonId: string, _d: Difficulty): PracticeTask {
  const m = get(lessonId);
  if (!m.introShown) { m.introShown = true; return buildIntro(); }
  const a = ROTATION[m.cursor % ROTATION.length]!; m.cursor += 1;
  if (a === "trace") return buildTrace(POOLS.SIMPLE);
  if (a === "missingSide") return buildMissingSide(POOLS.SIMPLE);
  return buildWhichPath(POOLS.SIMPLE);
}
export function resetY3MeasurelandsWeek7Lesson1TaskSessionState() { mem.clear(); }
export function buildY3MeasurelandsWeek7Lesson1QuizTasks(): PracticeTask[] {
  return [buildWhichPath(POOLS.SIMPLE), buildWhichPath(POOLS.SIMPLE), buildWhichPath(POOLS.SIMPLE), buildWhichPath(POOLS.SIMPLE), buildWhichPath(POOLS.SIMPLE)];
}
