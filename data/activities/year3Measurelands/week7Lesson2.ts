import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { buildIntro, buildTrace, buildMissingSide, buildWhichPath, POOLS } from "@/data/activities/year3Measurelands/week7Common";

// ── Measurelands · L3 · Week 7 · Lesson 2 — "Trace the Boundary" (Follow) ──
// Follow the whole perimeter. trace(finish) · missingSide · whichPath (L-shapes too).
type Mem = { introShown: boolean; cursor: number };
const mem = new Map<string, Mem>();
const ROTATION: Array<"finish" | "missingSide" | "whichPath"> = ["finish", "missingSide", "whichPath", "missingSide", "finish", "whichPath"];
function get(id: string): Mem { const e = mem.get(id); if (e) return e; const c: Mem = { introShown: false, cursor: 0 }; mem.set(id, c); return c; }

export function generateY3MeasurelandsWeek7Lesson2Task(lessonId: string, _d: Difficulty): PracticeTask {
  const m = get(lessonId);
  if (!m.introShown) { m.introShown = true; return { ...buildIntro(), prompt: "Perimeter means ALL the way around.", speakText: "Professor Gauge says: perimeter means all the way around. Follow every outside edge — never cut across the shape." }; }
  const a = ROTATION[m.cursor % ROTATION.length]!; m.cursor += 1;
  if (a === "missingSide") return buildMissingSide(POOLS.ALL);
  if (a === "whichPath") return buildWhichPath(POOLS.ALL);
  return buildTrace(POOLS.ALL, true);
}
export function resetY3MeasurelandsWeek7Lesson2TaskSessionState() { mem.clear(); }
export function buildY3MeasurelandsWeek7Lesson2QuizTasks(): PracticeTask[] {
  return [buildWhichPath(POOLS.ALL), buildWhichPath(POOLS.ALL), buildWhichPath(POOLS.ALL), buildWhichPath(POOLS.ALL), buildWhichPath(POOLS.ALL)];
}
