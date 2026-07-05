import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { buildIntro, buildBuildArea, buildSameArea, buildCover, POOLS } from "@/data/activities/year3Measurelands/week8Common";

// ── Measurelands · L3 · Week 8 · Lesson 3 — "Build the Area" (Build) ──
// buildArea · sameArea · cover. Same area, different shape is the payoff.
type Mem = { introShown: boolean; cursor: number };
const mem = new Map<string, Mem>();
const ROTATION: Array<"buildArea" | "sameArea" | "cover"> = ["buildArea", "sameArea", "cover", "buildArea", "cover", "sameArea"];
function get(id: string): Mem { const e = mem.get(id); if (e) return e; const c: Mem = { introShown: false, cursor: 0 }; mem.set(id, c); return c; }

export function generateY3MeasurelandsWeek8Lesson3Task(lessonId: string, _d: Difficulty): PracticeTask {
  const m = get(lessonId);
  if (!m.introShown) { m.introShown = true; return { ...buildIntro(), prompt: "Different shapes can cover the same space!", speakText: "Professor Gauge says: different shapes can still cover the same amount of space. A rectangle and an L-shape can both have the same area." }; }
  const a = ROTATION[m.cursor % ROTATION.length]!; m.cursor += 1;
  if (a === "sameArea") return buildSameArea(POOLS.ALL);
  if (a === "cover") return buildCover(POOLS.ALL);
  return buildBuildArea();
}
export function resetY3MeasurelandsWeek8Lesson3TaskSessionState() { mem.clear(); }
export function buildY3MeasurelandsWeek8Lesson3QuizTasks(): PracticeTask[] {
  return [buildSameArea(POOLS.ALL), buildSameArea(POOLS.ALL), buildSameArea(POOLS.ALL), buildSameArea(POOLS.ALL), buildSameArea(POOLS.ALL)];
}
