"use client";

import RealmDashboardShell from "@/components/realms/dashboard/RealmDashboardShell";
import type {
  CanonicalRealmDashboardConfig,
  RealmDashboardDistrict,
  RealmDashboardWorld,
} from "@/components/realms/dashboard/types";
import { getCurriculumPlan } from "@/data/programs/genres";
import { getChanceHollowBackground } from "@/lib/chance-hollow-visuals";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { buildRealmProgramHref } from "@/lib/realms/realm-journey";

const CHANCE_LEVELS: Array<{ id: RealmLevelId; label: string }> = [
  { id: "Year 3", label: "Level 3" },
  { id: "Year 4", label: "Level 4" },
  { id: "Year 5", label: "Level 5" },
  { id: "Year 6", label: "Level 6" },
];

const DISTRICTS = [
  { left: "5%", top: "18%", color: "#fb7185", name: "CHANCE GATE", identity: "NAME" },
  { left: "67%", top: "18%", color: "#fbbf24", name: "OUTCOME CAVES", identity: "LIST" },
  { left: "calc(50% - 190px)", top: "56%", color: "#22d3ee", name: "TRIAL FALLS", identity: "TEST" },
] as const;

const LEVEL_5_DISTRICTS = [
  { left: "5%", top: "18%", color: "#fb7185", name: "OUTCOME VAULT", identity: "COMPARE" },
  { left: "67%", top: "18%", color: "#fbbf24", name: "FREQUENCY FORGE", identity: "RECORD" },
  { left: "calc(50% - 190px)", top: "56%", color: "#22d3ee", name: "ROLLER CITADEL", identity: "INVESTIGATE" },
] as const;

const LEVEL_6_DISTRICTS = [
  { left: "5%", top: "18%", color: "#22d3ee", name: "SCALE SANCTUM", identity: "CALIBRATE" },
  { left: "67%", top: "18%", color: "#d946ef", name: "SIMULATION SPIRE", identity: "SIMULATE" },
  { left: "calc(50% - 190px)", top: "56%", color: "#fbbf24", name: "MASTER CITADEL", identity: "INVESTIGATE" },
] as const;

function normalizeLevel(level: string): RealmLevelId {
  return CHANCE_LEVELS.some((entry) => entry.id === level) ? (level as RealmLevelId) : "Year 3";
}

function getDistricts(level: RealmLevelId): readonly RealmDashboardDistrict[] {
  const plan = getCurriculumPlan(level, "probability");
  const districts = level === "Year 6" ? LEVEL_6_DISTRICTS : level === "Year 5" ? LEVEL_5_DISTRICTS : DISTRICTS;
  return districts.map((position, index) => {
    const weekStart = index * 2 + 1;
    const weekEnd = weekStart + 1;
    const focus = plan
      .filter((week) => week.week === weekStart || week.week === weekEnd)
      .map((week) => week.topic)
      .join(" / ");
    return {
      id: `chance-${level.toLowerCase().replace(/\s+/g, "-")}-district-${index + 1}`,
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
    bgImage: getChanceHollowBackground(level),
    levelLabel: `LEVEL ${level.replace("Year ", "")}`,
    zones: getDistricts(level),
  };
}

export const CHANCE_HOLLOW_DASHBOARD_CONFIG = {
  realmId: "chance-hollow",
  storageRealmId: "chance",
  slug: "chance-hollow",
  displayName: "Chance Hollow",
  realmMark: "CH",
  districtTagline: "PROBABILITY HOLLOW DISTRICTS",
  guidedTagline: "FOLLOW THE CHANCE TRAIL",
  totalWeeks: 6,
  minLevelIndex: 3,
  maxLevelIndex: 6,
  districtModeLevels: ["Year 3", "Year 4", "Year 5", "Year 6"],
  worldForLevel: getWorld,
  districtsForLevel: getDistricts,
  theme: {
    pageBackground: "#17111b",
    backgroundFilter: "brightness(1.08) saturate(1.12) contrast(1.04)",
    accent: "#fb7185",
    accentRgb: "251,113,133",
    secondaryAccent: "#fbbf24",
    secondaryRgb: "251,191,36",
    mutedAccent: "rgba(255,230,238,0.76)",
    pathText: "rgba(255,248,244,0.96)",
    text: "#fff7ed",
    navBackground: "rgba(31,18,32,0.92)",
    navBorder: "rgba(251,191,36,0.28)",
    realmChipBackground: "rgba(251,113,133,0.16)",
    realmChipBorder: "rgba(251,113,133,0.48)",
    atmosphericOverlay: "linear-gradient(180deg, rgba(26,12,30,0.28) 0%, rgba(26,12,30,0.08) 45%, rgba(12,10,18,0.66) 100%)",
    atmosphericGlow: "radial-gradient(ellipse 74% 58% at 50% 34%, rgba(251,191,36,0.18) 0%, rgba(251,113,133,0.11) 42%, transparent 76%)",
    sceneFocusOverlay: "radial-gradient(ellipse 36% 42% at 50% 43%, rgba(34,211,238,0.09) 0%, transparent 74%)",
    centerStageOverlay: "radial-gradient(circle at 50% 50%, rgba(37,22,42,0.55) 0%, rgba(37,22,42,0.2) 54%, transparent 100%)",
    focusGlow: "rgba(251,113,133,0.52)",
    transitionGlow: "linear-gradient(180deg, transparent 0%, rgba(251,191,36,0.1) 58%, rgba(34,211,238,0.16) 100%)",
    launchOverlay: "radial-gradient(circle at 50% 60%, rgba(251,113,133,0.72) 0%, rgba(251,191,36,0.28) 28%, rgba(18,12,23,0.97) 72%)",
    districtBackground: "linear-gradient(135deg, rgba(31,18,32,0.92), rgba(63,36,44,0.78))",
    districtActiveBackground: "linear-gradient(135deg, rgba(136,45,64,0.94), rgba(94,60,28,0.88))",
    districtMinHeight: 124,
    hudBackground: "linear-gradient(180deg, rgba(31,18,32,0.96), rgba(17,12,22,0.98))",
    hudBorder: "1.5px solid rgba(251,191,36,0.32)",
    hudShadow: "0 10px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
    hudIconBackground: "radial-gradient(circle at 50% 35%, rgba(251,113,133,0.34), rgba(31,18,32,0.08) 72%)",
    hudIconBorder: "1px solid rgba(251,113,133,0.44)",
    hudIconShadow: "inset 0 0 14px rgba(251,113,133,0.12), 0 0 16px rgba(251,191,36,0.12)",
    hudTextShadow: "0 1px 8px rgba(0,0,0,0.58)",
    guidePanelBackground: "linear-gradient(180deg, rgba(70,32,45,0.94), rgba(31,18,32,0.97))",
    guideIconBackground: "radial-gradient(circle at 50% 35%, #fff7ed 0%, #fbbf24 54%, #fb7185 100%)",
    actionBackground: "linear-gradient(135deg, #be3455 0%, #fb7185 48%, #fbbf24 100%)",
    actionText: "#fff7ed",
    pulseRgb: "251,113,133",
    particleColors: ["#fb7185", "#fbbf24", "#22d3ee", "#f9a8d4", "#fff7ed"],
    fogOverlay: "linear-gradient(180deg, rgba(45,25,50,0.46), rgba(35,22,38,0.24) 45%, rgba(18,12,23,0.58))",
    fogBadgeBackground: "linear-gradient(145deg, rgba(31,18,32,0.9), rgba(68,39,46,0.86))",
    fogBadgeBorder: "1px solid rgba(251,191,36,0.32)",
  },
  labels: {
    loading: "OPENING CHANCE HOLLOW",
    guideName: "CHANZIA",
    guideIcon: "CH",
    guideWelcome: "The first chance trail is ready.",
    start: "START THE TRAIL",
    continue: "CONTINUE THE TRAIL",
    currentPath: "CURRENT TRAIL",
    districtOpen: "- OPEN DISTRICT",
    districtLocked: "- LOCKED",
    districtComplete: "- COMPLETE",
  },
  avatar: {
    height: 188,
    glowColor: "rgba(251,113,133,0.34)",
    floatAnimation: "realm-character-float 4.6s ease-in-out infinite",
  },
  demo: {
    unlockAllDistricts: true,
    readJourney: () => ({ currentWeek: 1, currentLesson: 1 }),
    buildLevelHref: (level: RealmLevelId) => `/chance-hollow?teacher_preview=1&level=${encodeURIComponent(level)}`,
    buildProgramHref: (level, week) => buildRealmProgramHref({
      realmId: "chance",
      year: level,
      week,
      preview: true,
    }),
    buildPretestHref: (level) => `/pretest?year=${encodeURIComponent(level)}&realm_id=chance&teacher_preview=1`,
    buildPosttestHref: (level) => `/posttest?year=${encodeURIComponent(level)}&realm_id=chance&teacher_preview=1`,
  },
} satisfies CanonicalRealmDashboardConfig;

export default function ChanceHollowMap({ level }: { level: string }) {
  return <RealmDashboardShell config={CHANCE_HOLLOW_DASHBOARD_CONFIG} level={normalizeLevel(level)} />;
}
