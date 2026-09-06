"use client";

import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { getRealmWorldState, type RealmWorldDistrictDefinition } from "@/lib/world3d/realm-world-state";

export const PATTERN_PEAKS_DISTRICTS: readonly RealmWorldDistrictDefinition[] = [
  { id: "sequence-pass", label: "Sequence Pass", weeks: [1, 2], accent: "#39d9a0", motif: "Notice & Continue" },
  { id: "ruleworks", label: "Ruleworks", weeks: [3, 4], accent: "#b899ff", motif: "Connect Rules" },
  { id: "equation-ridge", label: "Equation Ridge", weeks: [5, 6], accent: "#ffcc62", motif: "Solve Unknowns" },
  { id: "summit-lab", label: "Summit Lab", weeks: [7, 8], accent: "#ff7b72", motif: "Justify Patterns" },
] as const;

export function getPatternPeaksWorldState(options: { preview?: boolean; level?: RealmLevelId } = {}) {
  return getRealmWorldState({
    realmId: "pattern",
    level: options.level ?? "Year 3",
    totalWeeks: 8,
    districts: PATTERN_PEAKS_DISTRICTS,
    preview: options.preview,
  });
}
