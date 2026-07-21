"use client";

import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

export const STARPATH_DEMO_SELECTED_LEVEL_KEY = "levelup:demo:space:selected-level";
const STARPATH_DEMO_JOURNEY_KEY = "levelup:demo:space:journey-v1";

export type StarpathDemoJourney = {
  currentWeek: number;
  currentLesson: number;
};

type StarpathDemoJourneyMap = Partial<Record<RealmLevelId, StarpathDemoJourney>>;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, Math.trunc(value)));
}

function readJourneyMap(): StarpathDemoJourneyMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STARPATH_DEMO_JOURNEY_KEY);
    return raw ? (JSON.parse(raw) as StarpathDemoJourneyMap) : {};
  } catch {
    return {};
  }
}

export function readStarpathDemoJourney(level: RealmLevelId): StarpathDemoJourney {
  const saved = readJourneyMap()[level];
  return {
    currentWeek: clamp(Number(saved?.currentWeek ?? 1), 1, 8),
    currentLesson: clamp(Number(saved?.currentLesson ?? 1), 1, 3),
  };
}

export function writeStarpathDemoJourney(level: RealmLevelId, journey: StarpathDemoJourney) {
  if (typeof window === "undefined") return;
  const next = {
    ...readJourneyMap(),
    [level]: {
      currentWeek: clamp(journey.currentWeek, 1, 8),
      currentLesson: clamp(journey.currentLesson, 1, 3),
    },
  };
  window.localStorage.setItem(STARPATH_DEMO_JOURNEY_KEY, JSON.stringify(next));
}

export function writeStarpathDemoSelectedLevel(level: RealmLevelId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STARPATH_DEMO_SELECTED_LEVEL_KEY, level);
}
