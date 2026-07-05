import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { buildIntro, buildWhichPart, buildCover, buildCountSquares, POOLS } from "@/data/activities/year3Measurelands/week8Common";

// ── Measurelands · L3 · Week 8 · Lesson 1 — "Cover the Space" (Understand) ──
// Area = the inside space. whichPart · cover · countSquares (simple shapes).
type Mem = { introShown: boolean; cursor: number };
const mem = new Map<string, Mem>();
const ROTATION: Array<"whichPart" | "cover" | "countSquares"> = ["whichPart", "cover", "countSquares", "cover", "whichPart", "countSquares"];
function get(id: string): Mem { const e = mem.get(id); if (e) return e; const c: Mem = { introShown: false, cursor: 0 }; mem.set(id, c); return c; }

export function generateY3MeasurelandsWeek8Lesson1Task(lessonId: string, _d: Difficulty): PracticeTask {
  const m = get(lessonId);
  if (!m.introShown) { m.introShown = true; return buildIntro(); }
  const a = ROTATION[m.cursor % ROTATION.length]!; m.cursor += 1;
  if (a === "cover") return buildCover(POOLS.SIMPLE);
  if (a === "countSquares") return buildCountSquares(POOLS.SIMPLE);
  return buildWhichPart(POOLS.SIMPLE);
}
export function resetY3MeasurelandsWeek8Lesson1TaskSessionState() { mem.clear(); }
export function buildY3MeasurelandsWeek8Lesson1QuizTasks(): PracticeTask[] {
  return [buildWhichPart(POOLS.SIMPLE), buildCountSquares(POOLS.SIMPLE), buildWhichPart(POOLS.SIMPLE), buildCountSquares(POOLS.SIMPLE), buildWhichPart(POOLS.SIMPLE)];
}
