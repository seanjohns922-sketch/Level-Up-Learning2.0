"use client";

import RealmDashboardShell from "@/components/realms/dashboard/RealmDashboardShell";
import type {
  CanonicalRealmDashboardConfig,
  RealmDashboardDistrict,
  RealmDashboardWorld,
} from "@/components/realms/dashboard/types";
import { readProgress, type StudentProgress } from "@/data/progress";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

const BACKGROUNDS: Record<RealmLevelId, string> = {
  Prep: "/images/number-nexus-bg-prep.png",
  "Year 1": "/images/number-nexus-bg-y1.png",
  "Year 2": "/images/number-nexus-bg-y1.png",
  "Year 3": "/images/number-nexus-home-bg.jpg",
  "Year 4": "/images/number-nexus-home-bg.jpg",
  "Year 5": "/images/number-nexus-bg-y5.png",
  "Year 6": "/images/number-nexus-bg-y6.png",
};

const LEVEL_LABELS: Record<RealmLevelId, string> = {
  Prep: "GROUND LEVEL",
  "Year 1": "LEVEL 1",
  "Year 2": "LEVEL 2",
  "Year 3": "LEVEL 3",
  "Year 4": "LEVEL 4",
  "Year 5": "LEVEL 5",
  "Year 6": "LEVEL 6",
};

const NUMBER_NEXUS_DISTRICTS = [
  {
    id: "counting",
    name: "COUNTING DISTRICT",
    sub: "WEEKS 1-3",
    weekStart: 1,
    weekEnd: 3,
    left: "3%",
    top: "12%",
    color: "#14b8a6",
    tagline: "FOUNDATIONS AND NUMBER SENSE",
  },
  {
    id: "bridge",
    name: "NUMBER BRIDGE",
    sub: "WEEKS 4-6",
    weekStart: 4,
    weekEnd: 6,
    left: "3%",
    top: "56%",
    color: "#22d3ee",
    tagline: "CONNECT AND APPLY",
  },
  {
    id: "tower",
    name: "LEGEND TOWER",
    sub: "WEEK 12",
    weekStart: 12,
    weekEnd: 12,
    left: "50%",
    top: "36%",
    color: "#fbbf24",
    tagline: "FINAL MASTERY",
  },
  {
    id: "core",
    name: "CALCULATION CORE",
    sub: "WEEKS 7-9",
    weekStart: 7,
    weekEnd: 9,
    left: "72%",
    top: "12%",
    color: "#f472b6",
    tagline: "CALCULATE AND REASON",
  },
  {
    id: "mastery",
    name: "MASTERY SECTOR",
    sub: "WEEKS 10-11",
    weekStart: 10,
    weekEnd: 11,
    left: "72%",
    top: "56%",
    color: "#a78bfa",
    tagline: "CONSOLIDATE AND MASTER",
  },
] as const satisfies readonly RealmDashboardDistrict[];

function getNumberNexusWorld(level: RealmLevelId): RealmDashboardWorld {
  return {
    bgImage: BACKGROUNDS[level],
    levelLabel: LEVEL_LABELS[level],
    zones: NUMBER_NEXUS_DISTRICTS,
  };
}

export const NUMBER_NEXUS_SHARED_PREVIEW_CONFIG = {
  realmId: "number-nexus",
  storageRealmId: "number",
  slug: "number-nexus",
  displayName: "Number Nexus",
  realmMark: "⚡",
  districtTagline: "NUMBER MASTERY DISTRICTS",
  guidedTagline: "BUILD NUMBER POWER",
  totalWeeks: 12,
  districtModeLevels: ["Year 3", "Year 4", "Year 5", "Year 6"],
  worldForLevel: getNumberNexusWorld,
  districtsForLevel: () => NUMBER_NEXUS_DISTRICTS,
  theme: {
    pageBackground: "#020810",
    accent: "#5eead4",
    accentRgb: "94,234,212",
    secondaryAccent: "#fbbf24",
    secondaryRgb: "251,191,36",
    mutedAccent: "rgba(148,163,184,0.72)",
    pathText: "rgba(153,246,228,0.92)",
    text: "#f8fafc",
    navBackground: "rgba(2,6,16,0.72)",
    navBorder: "rgba(94,234,212,0.1)",
    realmChipBackground: "rgba(14,118,110,0.28)",
    realmChipBorder: "rgba(94,234,212,0.28)",
    atmosphericOverlay: "linear-gradient(180deg, rgba(2,10,22,0.58) 0%, rgba(1,20,28,0.12) 38%, rgba(1,10,18,0.08) 55%, rgba(2,8,18,0.88) 100%)",
    atmosphericGlow: "radial-gradient(ellipse 64% 58% at 50% 36%, rgba(14,184,166,0.07) 0%, transparent 72%)",
    sceneFocusOverlay: "radial-gradient(ellipse 36% 40% at 50% 42%, rgba(2,8,16,0.08) 0%, transparent 72%)",
    focusGlow: "rgba(45,212,191,0.6)",
    transitionGlow: "linear-gradient(180deg, rgba(94,234,212,0) 0%, rgba(94,234,212,0.12) 55%, rgba(20,184,166,0.3) 100%)",
    launchOverlay: "radial-gradient(circle at 50% 60%, rgba(94,234,212,0.68) 0%, rgba(20,184,166,0.28) 25%, rgba(2,8,16,0.96) 70%)",
    districtBackground: "linear-gradient(135deg, rgba(2,12,22,0.78), rgba(8,28,38,0.52))",
    districtActiveBackground: "linear-gradient(135deg, rgba(5,46,48,0.9), rgba(13,86,83,0.68))",
    hudBackground: "linear-gradient(180deg, rgba(8,20,32,0.92) 0%, rgba(2,8,16,0.95) 100%)",
    hudBorder: "1.5px solid rgba(94,234,212,0.32)",
    hudShadow: "0 0 18px rgba(20,184,166,0.18), 0 6px 22px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)",
    hudIconBackground: "radial-gradient(circle at 50% 35%, rgba(45,212,191,0.32) 0%, rgba(13,148,136,0.18) 55%, rgba(2,8,16,0) 100%)",
    hudIconBorder: "1px solid rgba(94,234,212,0.28)",
    hudIconShadow: "inset 0 0 14px rgba(20,184,166,0.25), 0 0 18px rgba(20,184,166,0.18)",
    hudTextShadow: "0 0 10px rgba(20,184,166,0.55)",
    guidePanelBackground: "linear-gradient(180deg, rgba(8,30,44,0.84) 0%, rgba(2,15,26,0.9) 100%)",
    guideIconBackground: "radial-gradient(circle at 50% 35%, #99f6e4 0%, #0f766e 78%)",
    actionBackground: "linear-gradient(135deg, #071b22 0%, #0f766e 40%, #14b8a6 72%, #5eead4 100%)",
    actionText: "#f8fafc",
    pulseRgb: "94,234,212",
    particleColors: ["#14b8a6", "#818cf8", "#f472b6", "#a78bfa", "#22d3ee"],
  },
  labels: {
    loading: "INITIALISING NUMBER NEXUS PREVIEW…",
    guideName: "NEXUS GUIDE",
    guideIcon: "⚡",
    guideWelcome: "Your next number mission is ready.",
    start: "START ADVENTURE",
    continue: "CONTINUE ADVENTURE",
    currentPath: "CURRENT PATH",
    districtOpen: "· OPEN DISTRICT",
    districtLocked: "· LOCKED",
    districtComplete: "· COMPLETE",
  },
  avatar: {
    height: 196,
    glowColor: "rgba(20,184,166,0.32)",
    floatAnimation: "realm-character-float 4.5s ease-in-out infinite",
  },
  internalPreview: {
    buildLevelHref: (level: RealmLevelId) =>
      `/number-nexus/shared-preview?level=${encodeURIComponent(level)}`,
  },
} satisfies CanonicalRealmDashboardConfig;

export default function NumberNexusSharedPreview({
  level,
  progress,
}: {
  level?: RealmLevelId;
  progress?: StudentProgress | null;
}) {
  const canonicalProgress = progress === undefined ? readProgress("number") : progress;
  const resolvedLevel = level ?? (canonicalProgress?.year as RealmLevelId | undefined) ?? "Year 1";
  return (
    <RealmDashboardShell
      config={NUMBER_NEXUS_SHARED_PREVIEW_CONFIG}
      level={resolvedLevel}
      progress={canonicalProgress}
    />
  );
}
