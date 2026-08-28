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
import { buildRealmProgramHref } from "@/lib/realms/realm-journey";

const STATISTICA_LEVELS = LEVEL_CATALOG.filter((level) => level.id !== "Prep") as Array<{
  id: RealmLevelId;
  label: string;
}>;

// Statistics is a 6-week strand (3 districts x 2 weeks): Collect -> Represent
// -> Investigate. Two flank the title at the top corners; the third is centred
// between them, above the avatar, for a symmetric triangle. Cards are ~380px
// wide and anchored by their top-left corner, so the centre card is offset by
// half a card width from 50%.
const DISTRICT_POSITIONS = [
  { left: "4%", top: "13%", color: "#79b85a", name: "DATA GROVES", identity: "COLLECT" },
  { left: "68%", top: "13%", color: "#59add1", name: "CHART CRYSTALS", identity: "REPRESENT" },
  { left: "calc(50% - 190px)", top: "53%", color: "#f2bc45", name: "INSIGHT OBSERVATORY", identity: "INVESTIGATE" },
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
  totalWeeks: 6,
  maxLevelIndex: 6,
  districtModeLevels: ["Year 3", "Year 4", "Year 5", "Year 6"],
  worldForLevel: getStatisticaWorld,
  districtsForLevel: getStatisticaDistricts,
  theme: {
    pageBackground: "#14231d",
    backgroundFilter: "brightness(1.13) saturate(1.16) contrast(1.02)",
    accent: "#f06b64",
    accentRgb: "240,107,100",
    secondaryAccent: "#f2bc45",
    secondaryRgb: "242,188,69",
    mutedAccent: "rgba(238,240,217,0.74)",
    pathText: "rgba(255,244,223,0.94)",
    text: "#fffaf2",
    navBackground: "rgba(18,49,42,0.9)",
    navBorder: "rgba(242,188,69,0.28)",
    realmChipBackground: "rgba(240,107,100,0.16)",
    realmChipBorder: "rgba(240,107,100,0.48)",
    atmosphericOverlay: "linear-gradient(180deg, rgba(13,34,29,0.32) 0%, rgba(13,34,29,0.05) 44%, rgba(20,30,24,0.58) 100%)",
    atmosphericGlow: "radial-gradient(ellipse 74% 58% at 50% 30%, rgba(242,188,69,0.2) 0%, rgba(121,184,90,0.08) 38%, transparent 74%)",
    sceneFocusOverlay: "radial-gradient(ellipse 36% 40% at 50% 42%, rgba(255,244,223,0.08) 0%, rgba(255,244,223,0.02) 46%, transparent 76%)",
    centerStageOverlay: "radial-gradient(circle at 50% 50%, rgba(31,56,45,0.58) 0%, rgba(31,56,45,0.24) 50%, rgba(31,56,45,0) 100%)",
    focusGlow: "rgba(240,107,100,0.5)",
    transitionGlow: "linear-gradient(180deg, rgba(242,188,69,0) 0%, rgba(242,188,69,0.13) 58%, rgba(121,184,90,0.2) 100%)",
    launchOverlay: "radial-gradient(circle at 50% 60%, rgba(242,188,69,0.72) 0%, rgba(240,107,100,0.3) 28%, rgba(18,49,42,0.96) 72%)",
    districtBackground: "linear-gradient(135deg, rgba(18,49,42,0.86), rgba(46,66,48,0.7))",
    districtActiveBackground: "linear-gradient(135deg, rgba(124,50,55,0.9), rgba(99,79,43,0.82))",
    hudBackground: "linear-gradient(180deg, rgba(18,49,42,0.94) 0%, rgba(10,31,26,0.97) 100%)",
    hudBorder: "1.5px solid rgba(242,188,69,0.34)",
    hudShadow: "0 0 0 1px rgba(240,107,100,0.08), 0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
    hudIconBackground: "radial-gradient(circle at 50% 35%, rgba(240,107,100,0.3) 0%, rgba(93,52,44,0.24) 55%, rgba(18,49,42,0) 100%)",
    hudIconBorder: "1px solid rgba(240,107,100,0.42)",
    hudIconShadow: "inset 0 0 14px rgba(240,107,100,0.14), 0 0 14px rgba(242,188,69,0.12)",
    hudTextShadow: "0 1px 8px rgba(77,24,27,0.5)",
    guidePanelBackground: "linear-gradient(180deg, rgba(39,91,67,0.92) 0%, rgba(18,49,42,0.95) 100%)",
    guideIconBackground: "radial-gradient(circle at 50% 35%, #fff4df 0%, #f2bc45 76%, #e27758 100%)",
    actionBackground: "linear-gradient(135deg, #a83e4b 0%, #e85d63 52%, #f2bc45 100%)",
    actionText: "#fffaf2",
    pulseRgb: "240,107,100",
    particleColors: ["#f06b64", "#f2bc45", "#79b85a", "#59add1", "#fff4df"],
    fogOverlay: "linear-gradient(180deg, rgba(48,68,55,0.46) 0%, rgba(34,55,45,0.24) 45%, rgba(25,45,37,0.52) 100%)",
    fogBadgeBackground: "linear-gradient(145deg, rgba(18,49,42,0.88), rgba(44,63,42,0.82))",
    fogBadgeBorder: "1px solid rgba(242,188,69,0.32)",
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
    glowColor: "rgba(240,107,100,0.32)",
    floatAnimation: "realm-character-float 4.6s ease-in-out infinite",
  },
  demo: {
    only: true,
    unlockAllDistricts: true,
    readJourney: () => ({ currentWeek: 1, currentLesson: 1 }),
    buildLevelHref: (level: RealmLevelId) => buildStatisticaPreviewHref(level),
    buildProgramHref: (level, week) => buildRealmProgramHref({
      realmId: "statistics",
      year: level,
      week,
      preview: true,
    }),
  },
} satisfies CanonicalRealmDashboardConfig;

export default function StatisticaMap({ level }: { level: string }) {
  return <RealmDashboardShell config={STATISTICA_DASHBOARD_CONFIG} level={normalizeLevel(level)} />;
}
