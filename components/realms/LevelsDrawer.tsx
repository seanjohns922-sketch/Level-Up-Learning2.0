"use client";

import type { StudentProgress } from "@/data/progress";
import type { LegendRealmId } from "@/data/legends";
import { buildRealmLevelHref, isLevelUnlocked, LEVEL_CATALOG } from "@/lib/level-catalog";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { enterReviewMode, exitReviewMode } from "@/lib/review-mode";
import RealmLevelSelector from "./dashboard/RealmLevelSelector";
import type { RealmDashboardLevelOption } from "./dashboard/types";

// Shared realm adapter: placement controls availability, while selecting an
// earlier level enters review mode without changing the placed level.
export default function LevelsDrawer({
  realmId,
  progress,
  viewingYear,
  isPreview,
  accent = "#5eead4",
  maxLevelIndex,
}: {
  realmId: "number-nexus" | "measurelands";
  progress: StudentProgress | null;
  viewingYear: string;
  isPreview: boolean;
  accent?: string;
  openDirection?: "down" | "right";
  maxLevelIndex?: number;
}) {
  const visibleLevels = typeof maxLevelIndex === "number"
    ? LEVEL_CATALOG.slice(0, maxLevelIndex + 1)
    : LEVEL_CATALOG;
  const currentYear = progress?.year;
  const legendRealm: LegendRealmId = realmId === "measurelands" ? "measurelands" : "number-nexus";
  const options: RealmDashboardLevelOption[] = visibleLevels.map((level) => {
    const unlocked = isLevelUnlocked(level.id, progress, { forceOpen: isPreview, realmId: legendRealm });
    const isPlaced = !!currentYear && level.id === currentYear;
    const isViewing = level.id === viewingYear;
    const isEarlier = !!currentYear && LEVEL_CATALOG.findIndex((candidate) => candidate.id === level.id)
      < LEVEL_CATALOG.findIndex((candidate) => candidate.id === currentYear);
    return {
      id: level.id as RealmLevelId,
      label: level.label,
      state: !unlocked ? "locked" : isViewing && isEarlier && !isPreview
        ? "reviewing" : isPlaced ? "current" : "available",
    };
  });

  function selectLevel(targetYear: RealmLevelId) {
    if (targetYear === viewingYear) return;
    const { href, review } = buildRealmLevelHref(realmId, targetYear, currentYear, isPreview);
    if (review) enterReviewMode(realmId, targetYear);
    else exitReviewMode();
    window.location.assign(href);
  }

  return (
    <RealmLevelSelector
      levels={options}
      selectedLevel={viewingYear as RealmLevelId}
      accent={accent}
      onSelect={selectLevel}
    />
  );
}
