"use client";

import RealmDashboardShell from "@/components/realms/dashboard/RealmDashboardShell";
import type {
  CanonicalRealmDashboardConfig,
  RealmDashboardDistrict,
  RealmDashboardWorld,
} from "@/components/realms/dashboard/types";
import { getPatternPeaksSpineForYearLabel } from "@/data/programs/patternPeaks";
import { LEVEL_CATALOG } from "@/lib/level-catalog";
import { getPatternPeaksBackground } from "@/lib/pattern-peaks-visuals";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

const PATTERN_LEVELS = LEVEL_CATALOG.filter((level) => {
  const number = Number(level.id.replace("Year ", ""));
  return Number.isInteger(number) && number >= 3;
}) as Array<{ id: RealmLevelId; label: string }>;

const DISTRICTS = [
  { left: "4%", top: "18%", color: "#39d9a0", name: "SEQUENCE PASS", identity: "NOTICE" },
  { left: "69%", top: "17%", color: "#b899ff", name: "RULEWORKS", identity: "CONNECT" },
  { left: "7%", top: "57%", color: "#ffcc62", name: "EQUATION RIDGE", identity: "SOLVE" },
  { left: "66%", top: "56%", color: "#ff7b72", name: "SUMMIT LAB", identity: "JUSTIFY" },
] as const;

function normalizeLevel(level: string): RealmLevelId {
  return PATTERN_LEVELS.some((entry) => entry.id === level) ? (level as RealmLevelId) : "Year 3";
}

function levelLabel(level: RealmLevelId) {
  return PATTERN_LEVELS.find((entry) => entry.id === level)?.label.toUpperCase() ?? "LEVEL 3";
}

function previewHref(level: RealmLevelId) {
  return `/pattern-peaks?teacher_preview=1&level=${encodeURIComponent(level)}`;
}

function getDistricts(level: RealmLevelId): readonly RealmDashboardDistrict[] {
  const spine = getPatternPeaksSpineForYearLabel(level);
  return DISTRICTS.map((position, index) => {
    const weekStart = index * 2 + 1;
    const weekEnd = weekStart + 1;
    const focus = spine
      .filter((week) => week.week === weekStart || week.week === weekEnd)
      .map((week) => week.topic)
      .join(" / ");
    return {
      id: `pattern-${level.toLowerCase().replace(/\s+/g, "-")}-district-${index + 1}`,
      name: position.name,
      sub: `WEEKS ${weekStart}-${weekEnd}`,
      weekStart,
      weekEnd,
      left: position.left,
      top: position.top,
      color: position.color,
      tagline: `${position.identity} - ${focus}`,
    };
  });
}

function getWorld(level: RealmLevelId): RealmDashboardWorld {
  return {
    bgImage: getPatternPeaksBackground(level),
    levelLabel: levelLabel(level),
    zones: getDistricts(level),
  };
}

export const PATTERN_PEAKS_DASHBOARD_CONFIG = {
  realmId: "pattern-peaks",
  storageRealmId: "pattern",
  slug: "pattern-peaks",
  displayName: "Pattern Peaks",
  realmMark: "PP",
  districtTagline: "ALGEBRA MOUNTAIN DISTRICTS",
  guidedTagline: "FOLLOW THE PATTERN TRAIL",
  totalWeeks: 8,
  minLevelIndex: 3,
  maxLevelIndex: 6,
  districtModeLevels: ["Year 3", "Year 4", "Year 5", "Year 6"],
  worldForLevel: getWorld,
  districtsForLevel: getDistricts,
  theme: {
    pageBackground: "#10161d",
    backgroundFilter: "brightness(1.04) saturate(1.08) contrast(1.04)",
    accent: "#39d9a0",
    accentRgb: "57,217,160",
    secondaryAccent: "#ffcc62",
    secondaryRgb: "255,204,98",
    mutedAccent: "rgba(225,232,241,0.76)",
    pathText: "rgba(245,248,252,0.96)",
    text: "#f8fafc",
    navBackground: "rgba(13,18,26,0.92)",
    navBorder: "rgba(57,217,160,0.3)",
    realmChipBackground: "rgba(184,153,255,0.16)",
    realmChipBorder: "rgba(184,153,255,0.48)",
    atmosphericOverlay: "linear-gradient(180deg, rgba(8,14,23,0.16) 0%, rgba(8,14,23,0.03) 42%, rgba(8,14,23,0.62) 100%)",
    atmosphericGlow: "radial-gradient(ellipse 72% 56% at 50% 36%, rgba(57,217,160,0.18) 0%, rgba(184,153,255,0.08) 44%, transparent 76%)",
    sceneFocusOverlay: "radial-gradient(ellipse 36% 42% at 50% 43%, rgba(255,204,98,0.09) 0%, transparent 74%)",
    centerStageOverlay: "radial-gradient(circle at 50% 50%, rgba(21,34,44,0.5) 0%, rgba(21,34,44,0.18) 54%, transparent 100%)",
    focusGlow: "rgba(57,217,160,0.52)",
    transitionGlow: "linear-gradient(180deg, transparent 0%, rgba(184,153,255,0.1) 58%, rgba(57,217,160,0.18) 100%)",
    launchOverlay: "radial-gradient(circle at 50% 60%, rgba(57,217,160,0.7) 0%, rgba(184,153,255,0.28) 28%, rgba(10,15,23,0.97) 72%)",
    districtBackground: "linear-gradient(135deg, rgba(16,26,34,0.9), rgba(34,39,57,0.78))",
    districtActiveBackground: "linear-gradient(135deg, rgba(29,79,66,0.94), rgba(64,46,91,0.88))",
    hudBackground: "linear-gradient(180deg, rgba(13,20,29,0.96), rgba(8,13,20,0.98))",
    hudBorder: "1.5px solid rgba(57,217,160,0.34)",
    hudShadow: "0 10px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
    hudIconBackground: "radial-gradient(circle at 50% 35%, rgba(184,153,255,0.32), rgba(25,35,47,0.08) 72%)",
    hudIconBorder: "1px solid rgba(184,153,255,0.44)",
    hudIconShadow: "inset 0 0 14px rgba(184,153,255,0.12), 0 0 16px rgba(57,217,160,0.12)",
    hudTextShadow: "0 1px 8px rgba(0,0,0,0.58)",
    guidePanelBackground: "linear-gradient(180deg, rgba(42,31,67,0.94), rgba(15,24,31,0.97))",
    guideIconBackground: "radial-gradient(circle at 50% 35%, #fff1bd 0%, #ffcc62 50%, #8b5cf6 100%)",
    actionBackground: "linear-gradient(135deg, #188a6b 0%, #30c996 48%, #8060d4 100%)",
    actionText: "#ffffff",
    pulseRgb: "57,217,160",
    particleColors: ["#39d9a0", "#b899ff", "#ffcc62", "#ff7b72", "#e8f4ff"],
    fogOverlay: "linear-gradient(180deg, rgba(26,35,43,0.46), rgba(20,27,36,0.24) 45%, rgba(12,18,26,0.58))",
    fogBadgeBackground: "linear-gradient(145deg, rgba(16,26,34,0.9), rgba(55,42,74,0.86))",
    fogBadgeBorder: "1px solid rgba(184,153,255,0.34)",
  },
  labels: {
    loading: "OPENING PATTERN PEAKS",
    guideName: "WIGGLECODE",
    guideIcon: "PP",
    guideWelcome: "The first pattern trail is ready.",
    start: "START THE CLIMB",
    continue: "CONTINUE THE CLIMB",
    currentPath: "CURRENT TRAIL",
    districtOpen: "- OPEN DISTRICT",
    districtLocked: "- LOCKED",
    districtComplete: "- COMPLETE",
  },
  avatar: {
    height: 188,
    glowColor: "rgba(57,217,160,0.34)",
    floatAnimation: "realm-character-float 4.6s ease-in-out infinite",
  },
  demo: {
    only: true,
    unlockAllDistricts: true,
    readJourney: () => ({ currentWeek: 1, currentLesson: 1 }),
    buildLevelHref: previewHref,
    buildProgramHref: (level, week) => `/pattern-peaks/program?teacher_preview=1&level=${encodeURIComponent(level)}&week=${week}`,
  },
} satisfies CanonicalRealmDashboardConfig;

export default function PatternPeaksMap({ level }: { level: string }) {
  return <RealmDashboardShell config={PATTERN_PEAKS_DASHBOARD_CONFIG} level={normalizeLevel(level)} />;
}
