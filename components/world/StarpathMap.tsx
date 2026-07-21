"use client";

import { useEffect } from "react";
import RealmDashboardShell from "@/components/realms/dashboard/RealmDashboardShell";
import type {
  CanonicalRealmDashboardConfig,
  RealmDashboardDistrict,
  RealmDashboardWorld,
} from "@/components/realms/dashboard/types";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import {
  readStarpathDemoJourney,
  writeStarpathDemoSelectedLevel,
} from "@/lib/starpath-demo-state";
import {
  getStarpathLevelForYear,
  type StarpathLevelDefinition,
  type StarpathLevelId,
} from "@/lib/starpath-levels";
import { buildStarpathProgramHref, buildStarpathWorldHref } from "@/lib/starpath-routes";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { getStarpathBackground } from "@/lib/starpath-visuals";

const DISTRICT_NAMES: Record<RealmLevelId, readonly [string, string, string, string]> = {
  Prep: ["Shape Sector", "Position Passage", "Adventure Orbit", "Graduation Galaxy"],
  "Year 1": ["Shape Station", "Object Orbit", "Direction Deck", "Explorer Expanse"],
  "Year 2": ["Shape Systems", "Mapmaker Moon", "Movement Module", "Navigator Nexus"],
  "Year 3": ["Object Observatory", "Mapmaker's Reach", "Transformation Crossing", "Spatial Mission"],
  "Year 4": ["Composite Citadel", "Grid Gardens", "Symmetry Spire", "Design Frontier"],
  "Year 5": ["Prism Port", "Coordinate Crossing", "Transformation Station", "Spatial Design Lab"],
  "Year 6": ["Cross-section Observatory", "Cartesian Quadrants", "Tessellation Array", "Orbital Investigation"],
};

const DISTRICT_POSITIONS = [
  { left: "4%", top: "14%", color: "#8fe7ff" },
  { left: "5%", top: "58%", color: "#c4b5fd" },
  { left: "68%", top: "14%", color: "#fbcfe8" },
  { left: "68%", top: "58%", color: "#fde68a" },
] as const;

function definitionForYear(level: RealmLevelId): StarpathLevelDefinition {
  return getStarpathLevelForYear(level);
}

function starpathLevelId(level: RealmLevelId): StarpathLevelId {
  return definitionForYear(level).id;
}

function getStarpathDistricts(level: RealmLevelId): readonly RealmDashboardDistrict[] {
  const program = getStarpathProgram(starpathLevelId(level));
  return DISTRICT_POSITIONS.map((position, index) => {
    const weekStart = index * 2 + 1;
    const weekEnd = weekStart + 1;
    return {
      id: `space-${starpathLevelId(level)}-district-${index + 1}`,
      name: DISTRICT_NAMES[level][index],
      sub: `WEEKS ${weekStart}–${weekEnd}`,
      weekStart,
      weekEnd,
      left: position.left,
      top: position.top,
      color: position.color,
      tagline: `${program.weeks[weekStart - 1].title} · ${program.weeks[weekEnd - 1].title}`,
    };
  });
}

function getStarpathWorld(level: RealmLevelId): RealmDashboardWorld {
  const definition = definitionForYear(level);
  return {
    bgImage: getStarpathBackground(level),
    levelLabel: definition.displayLabel.toUpperCase(),
    zones: getStarpathDistricts(level),
  };
}

export const STARPATH_DASHBOARD_CONFIG = {
  realmId: "starpath-realm",
  storageRealmId: "space",
  slug: "starpath-realm",
  displayName: "Starpath",
  realmMark: "✦",
  districtTagline: "SPATIAL REASONING DISTRICTS",
  guidedTagline: "CHART A COURSE THROUGH SPACE",
  totalWeeks: 8,
  districtModeLevels: ["Year 3", "Year 4", "Year 5", "Year 6"],
  worldForLevel: getStarpathWorld,
  districtsForLevel: getStarpathDistricts,
  theme: {
    pageBackground: "#070a1b",
    accent: "#8fe7ff",
    accentRgb: "143,231,255",
    secondaryAccent: "#c4b5fd",
    secondaryRgb: "196,181,253",
    mutedAccent: "rgba(224,231,255,0.72)",
    pathText: "rgba(207,250,254,0.92)",
    text: "#f8fbff",
    navBackground: "rgba(5,8,28,0.76)",
    navBorder: "rgba(143,231,255,0.18)",
    realmChipBackground: "rgba(49,46,129,0.48)",
    realmChipBorder: "rgba(143,231,255,0.34)",
    atmosphericOverlay: "linear-gradient(180deg, rgba(5,8,28,0.6) 0%, rgba(5,8,28,0.1) 42%, rgba(5,8,28,0.88) 100%)",
    atmosphericGlow: "radial-gradient(ellipse 68% 58% at 50% 38%, rgba(139,92,246,0.17) 0%, transparent 72%)",
    sceneFocusOverlay: "radial-gradient(ellipse 34% 38% at 50% 40%, rgba(8,11,32,0.1) 0%, rgba(8,11,32,0.04) 40%, transparent 74%)",
    focusGlow: "rgba(143,231,255,0.54)",
    transitionGlow: "linear-gradient(180deg, rgba(143,231,255,0) 0%, rgba(139,92,246,0.2) 58%, rgba(143,231,255,0.28) 100%)",
    launchOverlay: "radial-gradient(circle at 50% 60%, rgba(143,231,255,0.66) 0%, rgba(139,92,246,0.28) 28%, rgba(5,8,28,0.96) 72%)",
    districtBackground: "linear-gradient(135deg, rgba(8,11,32,0.8), rgba(30,27,75,0.52))",
    districtActiveBackground: "linear-gradient(135deg, rgba(30,27,75,0.9), rgba(76,29,149,0.68))",
    hudBackground: "linear-gradient(180deg, rgba(16,22,52,0.92) 0%, rgba(8,11,32,0.96) 100%)",
    hudBorder: "1.5px solid rgba(143,231,255,0.3)",
    hudShadow: "0 0 18px rgba(143,231,255,0.14), 0 6px 22px rgba(0,0,0,0.64), inset 0 1px 0 rgba(255,255,255,0.06)",
    hudIconBackground: "radial-gradient(circle at 50% 35%, rgba(143,231,255,0.24) 0%, rgba(49,46,129,0.2) 55%, rgba(5,8,28,0) 100%)",
    hudIconBorder: "1px solid rgba(143,231,255,0.3)",
    hudIconShadow: "inset 0 0 14px rgba(143,231,255,0.14), 0 0 18px rgba(139,92,246,0.18)",
    hudTextShadow: "0 0 10px rgba(143,231,255,0.46)",
    guidePanelBackground: "linear-gradient(180deg, rgba(49,46,129,0.84) 0%, rgba(15,23,42,0.9) 100%)",
    guideIconBackground: "radial-gradient(circle at 50% 35%, #e9d5ff 0%, #7c3aed 78%)",
    actionBackground: "linear-gradient(135deg, #11183f 0%, #312e81 40%, #7c3aed 72%, #8fe7ff 100%)",
    actionText: "#f8fbff",
    pulseRgb: "143,231,255",
    particleColors: ["#8fe7ff", "#c4b5fd", "#fbcfe8", "#fde68a", "#a5b4fc"],
  },
  labels: {
    loading: "CHARTING STARPATH…",
    guideName: "GEOSPIN",
    guideIcon: "🪐",
    guideWelcome: "Welcome, Space Explorer. Your voyage is ready.",
    start: "START VOYAGE",
    continue: "CONTINUE VOYAGE",
    currentPath: "CURRENT PATH",
    districtOpen: "· OPEN DISTRICT",
    districtLocked: "· LOCKED",
    districtComplete: "· COMPLETE",
  },
  avatar: {
    height: 188,
    glowColor: "rgba(143,231,255,0.36)",
    floatAnimation: "realm-character-float 4.6s ease-in-out infinite",
  },
  demo: {
    only: true,
    unlockAllDistricts: true,
    readJourney: readStarpathDemoJourney,
    buildLevelHref: (level: RealmLevelId) => buildStarpathWorldHref({ selectedLevel: starpathLevelId(level) }),
    buildLessonHref: (level: RealmLevelId, week: number) =>
      buildStarpathProgramHref({ selectedLevel: starpathLevelId(level) }, week),
  },
} satisfies CanonicalRealmDashboardConfig;

export default function StarpathMap({ level }: { level: RealmLevelId }) {
  useEffect(() => {
    writeStarpathDemoSelectedLevel(level);
  }, [level]);

  return <RealmDashboardShell config={STARPATH_DASHBOARD_CONFIG} level={level} progress={null} />;
}
