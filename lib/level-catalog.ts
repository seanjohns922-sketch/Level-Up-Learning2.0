import type { StudentProgress } from "@/data/progress";
import { getEffectiveUnlockedLegendIds, getLegendForYear, type LegendRealmId } from "@/data/legends";

// The single source of truth for the 7 progression levels (Ground → Level 6).
// Shared by the retired Choose-Level screen and the in-realm "Levels" drawer so
// unlock rules never drift between them.
export type LevelCatalogEntry = { id: string; label: string; icon: string };

export const LEVEL_CATALOG: LevelCatalogEntry[] = [
  { id: "Prep", label: "Ground Level", icon: "sprout" },
  { id: "Year 1", label: "Level 1", icon: "numbers" },
  { id: "Year 2", label: "Level 2", icon: "tiles" },
  { id: "Year 3", label: "Level 3", icon: "bolt" },
  { id: "Year 4", label: "Level 4", icon: "rocket" },
  { id: "Year 5", label: "Level 5", icon: "trophy" },
  { id: "Year 6", label: "Level 6", icon: "crown" },
];

export function levelIndexForYear(year: string | null | undefined): number {
  return LEVEL_CATALOG.findIndex((level) => level.id === year);
}

export function levelLabelForYear(year: string | null | undefined): string {
  const match = LEVEL_CATALOG.find((level) => level.id === year);
  if (match) return match.label;
  if (year?.startsWith("Year")) return `Level ${year.replace("Year ", "").trim()}`;
  return year ?? "Level 1";
}

// A level is unlocked when it's the student's current level, a level they've
// already passed (its legend is unlocked and it sits below the current level),
// or when access is force-open (demo / preview). Mirrors the original logic in
// the retired Choose-Level screen.
export function isLevelUnlocked(
  year: string,
  progress: StudentProgress | null | undefined,
  opts: { forceOpen?: boolean; realmId?: LegendRealmId } = {}
): boolean {
  if (opts.forceOpen) return true;
  const currentYear = progress?.year ?? "Year 1";
  if (year === currentYear) return true;

  const realmId = opts.realmId ?? "number-nexus";
  const currentIndex = levelIndexForYear(currentYear);
  const yearIndex = levelIndexForYear(year);
  const passedLegendIds = new Set(
    getEffectiveUnlockedLegendIds(progress?.year, progress?.unlockedLegends, realmId).filter(Boolean)
  );
  const legendId = getLegendForYear(year, realmId).id;
  return passedLegendIds.has(legendId) && yearIndex < currentIndex;
}
