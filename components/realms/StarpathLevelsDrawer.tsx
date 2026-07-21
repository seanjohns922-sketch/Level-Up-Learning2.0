"use client";

import { STARPATH_LEVELS, type StarpathLevelId } from "@/lib/starpath-levels";
import { buildStarpathWorldHref } from "@/lib/starpath-routes";
import RealmLevelSelector from "./dashboard/RealmLevelSelector";
import type { RealmDashboardLevelOption } from "./dashboard/types";

export default function StarpathLevelsDrawer({
  selectedLevel,
  accent = "#9be7ff",
}: {
  selectedLevel: StarpathLevelId;
  accent?: string;
  openDirection?: "down" | "right";
}) {
  const options: RealmDashboardLevelOption<StarpathLevelId>[] = STARPATH_LEVELS.map((level) => ({
    id: level.id,
    label: level.displayLabel,
    state: level.id === selectedLevel ? "current" : "available",
  }));

  function selectLevel(level: StarpathLevelId) {
    if (level === selectedLevel) return;
    window.location.assign(buildStarpathWorldHref({ selectedLevel: level, placementLevel: null }));
  }

  return <RealmLevelSelector levels={options} selectedLevel={selectedLevel} accent={accent} onSelect={selectLevel} />;
}
