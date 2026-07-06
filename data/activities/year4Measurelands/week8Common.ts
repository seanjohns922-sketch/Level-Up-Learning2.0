import type { PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 4 · Week 8 — shared helpers ──────────────────────────
// Week 8 "Measurement Missions" is the Level 4 capstone. It introduces NO new
// mechanics: every activity either poses a "choose the right measurement"
// decision (the reusable toolChoice card) or pulls a real solve-task from an
// earlier Level 4 week's quiz builder. These helpers keep that composition tidy.

export function randInt(n: number): number {
  return Math.floor(Math.random() * n);
}

export function choose<T>(items: T[]): T {
  return items[randInt(items.length)]!;
}

export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1);
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

/** Pick one fresh, render-safe task from an earlier week's quiz-task builder. */
export function pull(build: () => PracticeTask[]): PracticeTask {
  return choose(build());
}
