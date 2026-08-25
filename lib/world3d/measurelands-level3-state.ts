"use client";

import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { getRealmWorldState, type RealmWorldDistrictDefinition } from "@/lib/world3d/realm-world-state";

export const MEASURELANDS_LEVEL_3_DISTRICTS: readonly RealmWorldDistrictDefinition[] = [
  { id: "ruler-district", label: "Ruler District", weeks: [1, 2], accent: "#e1b45e", motif: "Length & Distance" },
  { id: "measure-lab", label: "Measure Lab", weeks: [3, 4], accent: "#b79ad8", motif: "Mass & Capacity" },
  { id: "timeworks", label: "Timeworks", weeks: [5, 6], accent: "#efc96f", motif: "Duration & Time" },
  { id: "explorer-district", label: "Explorer District", weeks: [7, 8], accent: "#d99ab8", motif: "Perimeter & Area" },
] as const;

export function getMeasurelandsWorldState(options: { preview?: boolean; level?: RealmLevelId } = {}) {
  return getRealmWorldState({
    realmId: "measurement",
    level: options.level ?? "Year 3",
    totalWeeks: 8,
    districts: MEASURELANDS_LEVEL_3_DISTRICTS,
    preview: options.preview,
  });
}
