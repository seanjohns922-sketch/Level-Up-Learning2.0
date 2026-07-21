import type { CSSProperties, ReactNode } from "react";
import type { ProgressRealmScope, StudentProgress } from "@/data/progress";
import type { LegendRealmId } from "@/data/legends";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

export type RealmDistrictState = "complete" | "completed" | "open" | "current" | "locked";

export type RealmDashboardLevelOption<TLevel extends string = RealmLevelId> = {
  id: TLevel;
  label: string;
  state: "locked" | "available" | "current" | "reviewing";
};

// Kept as a public read model for realm adapters and diagnostics. The canonical
// shell derives this state internally, but future realms can use the same shape
// while their persistence adapters are introduced.
export type RealmDashboardState = {
  level: RealmLevelId;
  currentWeek: number;
  completedWeeks: number[];
  playableWeeks: number[];
  globalXp: number | null;
  reviewMode: boolean;
  towerFloorsLit: number;
  towerTotalFloors: number;
};

export type RealmDashboardZone = {
  id: string;
  name: string;
  sub: string;
  weekStart: number;
  weekEnd: number;
  left: string;
  top: string;
  color: string;
};

export type RealmDashboardDistrict = RealmDashboardZone & {
  tagline: string;
};

export type RealmDashboardWorld = {
  bgImage: string;
  levelLabel: string;
  zones: readonly RealmDashboardZone[];
};

export type RealmDashboardTheme = {
  pageBackground: string;
  accent: string;
  accentRgb: string;
  secondaryAccent: string;
  secondaryRgb: string;
  mutedAccent: string;
  pathText: string;
  text: string;
  navBackground: string;
  navBorder: string;
  realmChipBackground: string;
  realmChipBorder: string;
  atmosphericOverlay: string;
  atmosphericGlow: string;
  sceneFocusOverlay: string;
  focusGlow: string;
  transitionGlow: string;
  launchOverlay: string;
  districtBackground: string;
  districtActiveBackground: string;
  hudBackground: string;
  hudBorder: string;
  hudShadow: string;
  hudIconBackground: string;
  hudIconBorder: string;
  hudIconShadow: string;
  hudTextShadow: string;
  guidePanelBackground: string;
  guideIconBackground: string;
  actionBackground: string;
  actionText: string;
  pulseRgb: string;
  particleColors: readonly string[];
};

export type CanonicalRealmDashboardConfig = {
  realmId: LegendRealmId;
  storageRealmId: ProgressRealmScope;
  slug: string;
  displayName: string;
  realmMark: string;
  districtTagline: string;
  guidedTagline: string;
  totalWeeks: number;
  maxLevelIndex?: number;
  districtModeLevels: readonly RealmLevelId[];
  worldForLevel: (level: RealmLevelId) => RealmDashboardWorld;
  districtsForLevel: (level: RealmLevelId) => readonly RealmDashboardDistrict[];
  theme: RealmDashboardTheme;
  labels: {
    loading: string;
    guideName: string;
    guideIcon: string;
    guideWelcome: string;
    start: string;
    continue: string;
    currentPath: string;
    districtOpen: string;
    districtLocked: string;
    districtComplete: string;
  };
  avatar: {
    height: number;
    glowColor: string;
    floatAnimation: string;
    positionStyle?: CSSProperties;
  };
};

export type RealmDashboardShellProps = {
  config: CanonicalRealmDashboardConfig;
  level: RealmLevelId;
  progress?: StudentProgress | null;
  avatar?: ReactNode;
};
