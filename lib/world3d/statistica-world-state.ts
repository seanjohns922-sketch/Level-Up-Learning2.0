"use client";

import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { getRealmWorldState, type RealmWorldDistrictDefinition } from "@/lib/world3d/realm-world-state";

export const STATISTICA_DISTRICTS: readonly RealmWorldDistrictDefinition[] = [
  { id: "data-groves", label: "Data Groves", weeks: [1, 2], accent: "#79b85a", motif: "Collect & Record" },
  { id: "chart-crystals", label: "Chart Crystals", weeks: [3, 4], accent: "#59add1", motif: "Represent & Compare" },
  { id: "insight-observatory", label: "Insight Observatory", weeks: [5, 6], accent: "#f2bc45", motif: "Interpret & Investigate" },
] as const;

export function getStatisticaWorldState(options: { preview?: boolean; level?: RealmLevelId } = {}) {
  return getRealmWorldState({
    realmId: "statistics",
    level: options.level ?? "Year 1",
    totalWeeks: 6,
    districts: STATISTICA_DISTRICTS,
    preview: options.preview,
  });
}
