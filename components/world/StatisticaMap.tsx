"use client";

import RealmDashboardShell from "@/components/realms/dashboard/RealmDashboardShell";
import type {
  CanonicalRealmDashboardConfig,
  RealmDashboardDistrict,
  RealmDashboardWorld,
} from "@/components/realms/dashboard/types";
import { getCurriculumPlan } from "@/data/programs/genres";
import { LEVEL_CATALOG } from "@/lib/level-catalog";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { getStatisticaBackground } from "@/lib/statistica-visuals";

const STATISTICA_LEVELS = LEVEL_CATALOG.filter((level) => level.id !== "Prep") as Array<{
  id: RealmLevelId;
  label: string;
}>;

const DISTRICT_POSITIONS = [
  { left: "4%", top: "14%", color: "#5eead4", name: "DATA GROVES", identity: "COLLECT" },
  { left: "5%", top: "58%", color: "#a7f3d0", name: "CHART CRYSTALS", identity: "REPRESENT" },
  { left: "68%", top: "14%", color: "#93c5fd", name: "PATTERN TERRACES", identity: "COMPARE" },
  { left: "68%", top: "58%", color: "#fde68a", name: "INSIGHT OBSERVATORY", identity: "INVESTIGATE" },
] as const;

function normalizeLevel(level: string): RealmLevelId {
  return STATISTICA_LEVELS.some((entry) => entry.id === level) ? (level as RealmLevelId) : "Year 1";
}

function levelLabel(level: RealmLevelId) {
  return STATISTICA_LEVELS.find((entry) => entry.id === level)?.label.toUpperCase() ?? "LEVEL 1";
}

function buildStatisticaPreviewHref(level: RealmLevelId, week = 1) {
  return `/statistica?teacher_preview=1&level=${encodeURIComponent(level)}&week=${week}`;
}

function buildStatisticaLessonPreviewHref(level: RealmLevelId, week: number, lesson: number) {
  return `/statistica/lesson/${encodeURIComponent(level)}/${week}/${lesson}?teacher_preview=1`;
}

function getStatisticaDistricts(level: RealmLevelId): readonly RealmDashboardDistrict[] {
  const plan = getCurriculumPlan(level, "statistics");
  return DISTRICT_POSITIONS.map((position, index) => {
    const weekStart = index * 2 + 1;
    const weekEnd = weekStart + 1;
    const first = plan.find((week) => week.week === weekStart);
    const second = plan.find((week) => week.week === weekEnd);
    const focus = [first?.topic, second?.topic].filter(Boolean).join(" / ");
    return {
      id: `statistics-${level.toLowerCase().replace(/\s+/g, "-")}-district-${index + 1}`,
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

function getStatisticaWorld(level: RealmLevelId): RealmDashboardWorld {
  return {
    bgImage: getStatisticaBackground(level),
    levelLabel: levelLabel(level),
    zones: getStatisticaDistricts(level),
  };
}

export const STATISTICA_DASHBOARD_CONFIG = {
  realmId: "statistica",
  storageRealmId: "statistics",
  slug: "statistica",
  displayName: "Statistica",
  realmMark: "ST",
  districtTagline: "DATA WORLD DISTRICTS",
  guidedTagline: "FOLLOW THE DATA TRAIL",
  totalWeeks: 8,
  maxLevelIndex: 6,
  districtModeLevels: ["Year 3", "Year 4", "Year 5", "Year 6"],
  worldForLevel: getStatisticaWorld,
  districtsForLevel: getStatisticaDistricts,
  theme: {
    pageBackground: "#06151a",
    accent: "#5eead4",
    accentRgb: "94,234,212",
    secondaryAccent: "#a7f3d0",
    secondaryRgb: "167,243,208",
    mutedAccent: "rgba(204,251,241,0.7)",
    pathText: "rgba(204,251,241,0.9)",
    text: "#f2fffb",
    navBackground: "rgba(4,18,24,0.78)",
    navBorder: "rgba(94,234,212,0.18)",
    realmChipBackground: "rgba(15,118,110,0.34)",
    realmChipBorder: "rgba(94,234,212,0.34)",
    atmosphericOverlay: "linear-gradient(180deg, rgba(2,10,18,0.56) 0%, rgba(2,10,18,0.1) 42%, rgba(2,10,18,0.78) 100%)",
    atmosphericGlow: "radial-gradient(ellipse 70% 60% at 50% 38%, rgba(20,184,166,0.18) 0%, transparent 72%)",
    sceneFocusOverlay: "radial-gradient(ellipse 34% 38% at 50% 40%, rgba(3,37,41,0.1) 0%, rgba(3,37,41,0.04) 40%, transparent 74%)",
    focusGlow: "rgba(94,234,212,0.56)",
    transitionGlow: "linear-gradient(180deg, rgba(94,234,212,0) 0%, rgba(20,184,166,0.18) 58%, rgba(167,243,208,0.28) 100%)",
    launchOverlay: "radial-gradient(circle at 50% 60%, rgba(94,234,212,0.7) 0%, rgba(20,184,166,0.28) 28%, rgba(2,10,18,0.96) 72%)",
    districtBackground: "linear-gradient(135deg, rgba(6,20,28,0.72), rgba(15,35,54,0.48))",
    districtActiveBackground: "linear-gradient(135deg, rgba(15,118,110,0.76), rgba(8,47,73,0.62))",
    hudBackground: "linear-gradient(180deg, rgba(4,24,31,0.92) 0%, rgba(2,10,18,0.96) 100%)",
    hudBorder: "1.5px solid rgba(94,234,212,0.28)",
    hudShadow: "0 0 18px rgba(94,234,212,0.12), 0 6px 22px rgba(0,0,0,0.64), inset 0 1px 0 rgba(255,255,255,0.06)",
    hudIconBackground: "radial-gradient(circle at 50% 35%, rgba(94,234,212,0.24) 0%, rgba(15,118,110,0.18) 55%, rgba(2,10,18,0) 100%)",
    hudIconBorder: "1px solid rgba(94,234,212,0.3)",
    hudIconShadow: "inset 0 0 14px rgba(94,234,212,0.14), 0 0 18px rgba(20,184,166,0.16)",
    hudTextShadow: "0 0 10px rgba(94,234,212,0.44)",
    guidePanelBackground: "linear-gradient(180deg, rgba(15,118,110,0.8) 0%, rgba(15,23,42,0.9) 100%)",
    guideIconBackground: "radial-gradient(circle at 50% 35%, #ccfbf1 0%, #14b8a6 78%)",
    actionBackground: "linear-gradient(135deg, #052e2b 0%, #0f766e 40%, #14b8a6 72%, #a7f3d0 100%)",
    actionText: "#f2fffb",
    pulseRgb: "94,234,212",
    particleColors: ["#5eead4", "#a7f3d0", "#93c5fd", "#fde68a", "#ccfbf1"],
  },
  labels: {
    loading: "OPENING STATISTICA",
    guideName: "DATA GUIDE",
    guideIcon: "ST",
    guideWelcome: "Welcome, Data Explorer. Your trail is ready.",
    start: "START ADVENTURE",
    continue: "CONTINUE ADVENTURE",
    currentPath: "CURRENT PATH",
    districtOpen: "- OPEN DISTRICT",
    districtLocked: "- LOCKED",
    districtComplete: "- COMPLETE",
  },
  avatar: {
    height: 188,
    glowColor: "rgba(94,234,212,0.36)",
    floatAnimation: "realm-character-float 4.6s ease-in-out infinite",
  },
  demo: {
    only: true,
    unlockAllDistricts: true,
    readJourney: () => ({ currentWeek: 1, currentLesson: 1 }),
    buildLevelHref: (level: RealmLevelId) => buildStatisticaPreviewHref(level),
    buildLessonHref: buildStatisticaLessonPreviewHref,
  },
} satisfies CanonicalRealmDashboardConfig;

export default function StatisticaMap({ level }: { level: string }) {
  return <RealmDashboardShell config={STATISTICA_DASHBOARD_CONFIG} level={normalizeLevel(level)} />;
}
