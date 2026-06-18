// ── Brain-break frequency ───────────────────────────────────────────────────
// School feedback: kids LIKE the mid-lesson mini-games but there are "too many",
// especially at older levels. Teachers can set a class default and override
// individual students (Frequent / Normal / Minimal). Frequency also tapers by
// level. This module is the single source of truth for "how many breaks, when".

export type BrainBreakFrequency = "frequent" | "normal" | "minimal";

export const BRAIN_BREAK_FREQUENCIES: BrainBreakFrequency[] = ["frequent", "normal", "minimal"];

export function isBrainBreakFrequency(value: unknown): value is BrainBreakFrequency {
  return value === "frequent" || value === "normal" || value === "minimal";
}

/** Per-student override wins, else class default, else "normal". */
export function resolveBrainBreakFrequency(
  studentValue?: string | null,
  classValue?: string | null
): BrainBreakFrequency {
  if (isBrainBreakFrequency(studentValue)) return studentValue;
  if (isBrainBreakFrequency(classValue)) return classValue;
  return "normal";
}

/**
 * How many brain breaks a 9-minute lesson should have.
 *
 *               junior (Ground–Level 2)   senior (Level 3–6)
 *   Frequent              2                        2
 *   Normal                2                        1
 *   Minimal               1                        1
 *
 * (levelNumber: Prep/Year1 = 1, Year2 = 2, Year3+ = 3…)
 */
export function brainBreakCount(
  levelNumber: number | undefined,
  frequency: BrainBreakFrequency
): number {
  const senior = (levelNumber ?? 1) >= 3;
  if (frequency === "frequent") return 2;
  if (frequency === "minimal") return 1;
  return senior ? 1 : 2; // normal
}

/**
 * Seconds-left thresholds at which to trigger each break in a 540s lesson.
 *   1 break  → 4:30 in (midpoint)
 *   2 breaks → 6 min in and 3 min in (the original cadence)
 */
export function getBrainBreakSchedule(
  levelNumber: number | undefined,
  frequency: BrainBreakFrequency
): number[] {
  const count = brainBreakCount(levelNumber, frequency);
  if (count <= 0) return [];
  if (count === 1) return [270];
  return [360, 180];
}

export const BRAIN_BREAK_FREQUENCY_LABEL: Record<BrainBreakFrequency, string> = {
  frequent: "Frequent",
  normal: "Normal",
  minimal: "Minimal",
};
