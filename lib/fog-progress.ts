// ── Fog of Forgetfulness / Tower of Knowledge progress ──────────────────────
// The overarching narrative: the Fog of Forgetfulness has dimmed the world and
// the Tower of Knowledge. Passing post-tests (= proving retention) pushes the
// Fog back and relights the Tower, floor by floor.
//
// ONE GLOBAL TOWER for the whole journey: 7 floors = the 7 legends (Prep→Y6).
// A floor lights when its post-test is passed. We derive the count from the
// cumulative unlocked-legend list (explicit unlocks + every level before the
// student's current year), so it's instant and needs no extra persistence.

import { readProgress } from "@/data/progress";
import { getEffectiveUnlockedLegendIds } from "@/data/legends";

/** Total floors of the Tower of Knowledge (Prep → Year 6). */
export const TOWER_FLOORS = 7;

export type FogProgress = {
  /** Floors of the Tower currently relit (= post-tests passed). */
  floorsLit: number;
  /** Total floors. */
  totalFloors: number;
  /** 0..1 — how much of the Tower is restored / fog cleared. */
  fraction: number;
};

export function computeFogProgress(
  year: string | null | undefined,
  unlockedLegends: string[] | null | undefined
): FogProgress {
  const legendIds = getEffectiveUnlockedLegendIds(year, unlockedLegends);
  const floorsLit = Math.min(TOWER_FLOORS, legendIds.length);
  return {
    floorsLit,
    totalFloors: TOWER_FLOORS,
    fraction: TOWER_FLOORS > 0 ? floorsLit / TOWER_FLOORS : 0,
  };
}

/** Read the active student's fog/tower progress from local progress. */
export function getFogProgress(): FogProgress {
  const progress = readProgress();
  return computeFogProgress(progress?.year, progress?.unlockedLegends);
}
