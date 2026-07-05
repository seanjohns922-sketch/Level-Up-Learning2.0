import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { buildIntro, buildCountSquares, buildCompareArea, buildOrderArea, POOLS } from "@/data/activities/year3Measurelands/week8Common";

// ── Measurelands · L3 · Week 8 · Lesson 2 — "Count the Squares" (Count) ──
// countSquares · compareArea · orderArea (all shapes).
type Mem = { introShown: boolean; cursor: number };
const mem = new Map<string, Mem>();
const ROTATION: Array<"countSquares" | "compareArea" | "orderArea"> = ["countSquares", "compareArea", "orderArea", "compareArea", "countSquares", "orderArea"];
function get(id: string): Mem { const e = mem.get(id); if (e) return e; const c: Mem = { introShown: false, cursor: 0 }; mem.set(id, c); return c; }

export function generateY3MeasurelandsWeek8Lesson2Task(lessonId: string, _d: Difficulty): PracticeTask {
  const m = get(lessonId);
  if (!m.introShown) { m.introShown = true; return { ...buildIntro(), prompt: "Area is measured by counting equal squares.", speakText: "Professor Gauge says: area is measured by counting equal squares. No multiplying — just careful counting." }; }
  const a = ROTATION[m.cursor % ROTATION.length]!; m.cursor += 1;
  if (a === "compareArea") return buildCompareArea(POOLS.ALL);
  if (a === "orderArea") return buildOrderArea(POOLS.ALL);
  return buildCountSquares(POOLS.ALL);
}
export function resetY3MeasurelandsWeek8Lesson2TaskSessionState() { mem.clear(); }
export function buildY3MeasurelandsWeek8Lesson2QuizTasks(): PracticeTask[] {
  return [buildCountSquares(POOLS.ALL), buildCompareArea(POOLS.ALL), buildCountSquares(POOLS.ALL), buildCompareArea(POOLS.ALL), buildCountSquares(POOLS.ALL)];
}
