"use client";

import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { getRealmWorldState, type RealmWorldDistrictDefinition } from "@/lib/world3d/realm-world-state";

export const CHANCE_HOLLOW_DISTRICTS: readonly RealmWorldDistrictDefinition[] = [
  { id: "chance-gate", label: "Chance Gate", weeks: [1, 2], accent: "#fb7185", motif: "Name the Chance" },
  { id: "outcome-caves", label: "Outcome Caves", weeks: [3, 4], accent: "#fbbf24", motif: "List the Outcomes" },
  { id: "trial-falls", label: "Trial Falls", weeks: [5, 6], accent: "#22d3ee", motif: "Test and Compare" },
] as const;

export const CHANCE_HOLLOW_LEVEL_4_DISTRICTS: readonly RealmWorldDistrictDefinition[] = [
  { id: "chance-gate", label: "Chance Gate", weeks: [1, 2], accent: "#22d3ee", motif: "Equal Chances and Tools" },
  { id: "outcome-caves", label: "Outcome Caves", weeks: [3, 4], accent: "#d946ef", motif: "Linked Events and Fair Games" },
  { id: "trial-falls", label: "Trial Falls", weeks: [5, 6], accent: "#fbbf24", motif: "Compare, Predict and Test" },
] as const;

export const CHANCE_HOLLOW_LEVEL_5_DISTRICTS: readonly RealmWorldDistrictDefinition[] = [
  { id: "outcome-vault", label: "Outcome Vault", weeks: [1, 2], accent: "#d946ef", motif: "Complete and Compare Outcomes" },
  { id: "frequency-forge", label: "Frequency Forge", weeks: [3, 4], accent: "#22d3ee", motif: "Dice Combinations and Frequency" },
  { id: "roller-citadel", label: "Roller Citadel", weeks: [5, 6], accent: "#fbbf24", motif: "Evidence and Investigation" },
] as const;

export function getChanceHollowWorldState(options: { preview?: boolean; level?: RealmLevelId } = {}) {
  const level = options.level ?? "Year 3";
  return getRealmWorldState({
    realmId: "chance",
    level,
    totalWeeks: 6,
    districts: level === "Year 5"
      ? CHANCE_HOLLOW_LEVEL_5_DISTRICTS
      : level === "Year 4"
        ? CHANCE_HOLLOW_LEVEL_4_DISTRICTS
        : CHANCE_HOLLOW_DISTRICTS,
    preview: options.preview,
  });
}
