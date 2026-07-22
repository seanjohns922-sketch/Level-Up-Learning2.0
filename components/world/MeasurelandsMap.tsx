"use client";

import RealmDashboardShell from "@/components/realms/dashboard/RealmDashboardShell";
import type { CanonicalRealmDashboardConfig } from "@/components/realms/dashboard/types";

type MeasurelandsYear = "Prep" | "Year 1" | "Year 2" | "Year 3" | "Year 4" | "Year 5" | "Year 6";
const PREP_BG_IMAGE = "/images/measurelands-home-bg.jpg";
const YEAR1_BG_IMAGE = "/images/measurelands-home-bg-y1.jpg";
const YEAR2_BG_IMAGE = "/images/measurelands-home-bg-y2.jpg";
const YEAR3_BG_IMAGE = "/images/measurelands-home-bg-y3.jpg";
const YEAR4_BG_IMAGE = "/images/measurelands-home-bg-y4.jpg";
const YEAR5_BG_IMAGE = "/images/measurelands-home-bg-y5.png";
const YEAR6_BG_IMAGE = "/images/measurelands-home-bg-y6.png";

const PREP_ZONES = [
  { id: "length", name: "LENGTH LANDS", sub: "WEEKS 1–2", weekStart: 1, weekEnd: 2, left: "7%", top: "14%", color: "#67e8f9" },
  { id: "balance", name: "BALANCE BASIN", sub: "WEEKS 3–4", weekStart: 3, weekEnd: 4, left: "10%", top: "56%", color: "#86efac" },
  { id: "tower", name: "TIMEWIELDER TOWER", sub: "WEEK 8", weekStart: 8, weekEnd: 8, left: "50%", top: "30%", color: "#fde68a" },
  { id: "capacity", name: "CAPACITY SPRINGS", sub: "WEEKS 5–6", weekStart: 5, weekEnd: 6, left: "70%", top: "15%", color: "#c4b5fd" },
  { id: "clockwork", name: "CLOCKWORK CROSSING", sub: "WEEK 7", weekStart: 7, weekEnd: 7, left: "69%", top: "57%", color: "#f9a8d4" },
] as const;

const YEAR1_ZONES = [
  { id: "length", name: "LENGTH TRAIL", sub: "WEEK 1", weekStart: 1, weekEnd: 1, left: "7%", top: "14%", color: "#67e8f9" },
  { id: "balance", name: "BALANCE BASIN", sub: "WEEK 2", weekStart: 2, weekEnd: 2, left: "10%", top: "56%", color: "#86efac" },
  { id: "capacity", name: "CAPACITY SPRINGS", sub: "WEEK 3", weekStart: 3, weekEnd: 3, left: "70%", top: "15%", color: "#c4b5fd" },
  { id: "duration", name: "DURATION DUNES", sub: "WEEK 4", weekStart: 4, weekEnd: 4, left: "50%", top: "30%", color: "#fde68a" },
  { id: "calendar-grove", name: "CALENDAR GROVE", sub: "WEEK 5", weekStart: 5, weekEnd: 5, left: "50%", top: "30%", color: "#a7f3d0" },
  { id: "calendar-quest", name: "CALENDAR QUEST", sub: "WEEK 6", weekStart: 6, weekEnd: 6, left: "50%", top: "30%", color: "#fcd34d" },
  { id: "time-journey", name: "TIME JOURNEY", sub: "WEEK 7", weekStart: 7, weekEnd: 7, left: "69%", top: "57%", color: "#f9a8d4" },
  { id: "time-builder", name: "TIME BUILDER", sub: "WEEK 8", weekStart: 8, weekEnd: 8, left: "50%", top: "30%", color: "#93c5fd" },
] as const;

const YEAR2_ZONES = [
  { id: "unit-count", name: "UNIT COUNT CANYON", sub: "WEEK 1", weekStart: 1, weekEnd: 1, left: "7%", top: "14%", color: "#67e8f9" },
  { id: "balance", name: "BALANCE BASIN", sub: "WEEK 2", weekStart: 2, weekEnd: 2, left: "10%", top: "56%", color: "#86efac" },
  { id: "capacity", name: "CAPACITY SPRINGS", sub: "WEEK 3", weekStart: 3, weekEnd: 3, left: "70%", top: "15%", color: "#c4b5fd" },
  { id: "closer-count", name: "CLOSER COUNT", sub: "WEEK 4", weekStart: 4, weekEnd: 4, left: "50%", top: "30%", color: "#fde68a" },
  { id: "clock-one", name: "CLOCK TOWER I", sub: "WEEK 5", weekStart: 5, weekEnd: 5, left: "50%", top: "30%", color: "#a7f3d0" },
  { id: "clock-two", name: "CLOCK TOWER II", sub: "WEEK 6", weekStart: 6, weekEnd: 6, left: "50%", top: "30%", color: "#fcd34d" },
  { id: "calendar-keep", name: "CALENDAR KEEP", sub: "WEEK 7", weekStart: 7, weekEnd: 7, left: "69%", top: "57%", color: "#f9a8d4" },
  { id: "challenge", name: "MEASUREMENT CHALLENGE", sub: "WEEK 8", weekStart: 8, weekEnd: 8, left: "50%", top: "30%", color: "#93c5fd" },
] as const;

const YEAR3_ZONES = [
  { id: "ruler-ridge", name: "RULER RIDGE", sub: "WEEK 1", weekStart: 1, weekEnd: 1, left: "7%", top: "14%", color: "#67e8f9" },
  { id: "metre-mountain", name: "METRE MOUNTAIN", sub: "WEEK 2", weekStart: 2, weekEnd: 2, left: "10%", top: "56%", color: "#86efac" },
  { id: "mass-works", name: "MASS WORKS", sub: "WEEK 3", weekStart: 3, weekEnd: 3, left: "70%", top: "15%", color: "#c4b5fd" },
  { id: "capacity-lab", name: "CAPACITY LAB", sub: "WEEK 4", weekStart: 4, weekEnd: 4, left: "50%", top: "30%", color: "#fde68a" },
  { id: "duration-lab", name: "DURATION LAB", sub: "WEEK 5", weekStart: 5, weekEnd: 5, left: "50%", top: "30%", color: "#a7f3d0" },
  { id: "minute-clockworks", name: "MINUTE CLOCKWORKS", sub: "WEEK 6", weekStart: 6, weekEnd: 6, left: "50%", top: "30%", color: "#fcd34d" },
  { id: "perimeter-preview", name: "PERIMETER PREVIEW", sub: "WEEK 7", weekStart: 7, weekEnd: 7, left: "69%", top: "57%", color: "#f9a8d4" },
  { id: "area-preview", name: "AREA PREVIEW", sub: "WEEK 8", weekStart: 8, weekEnd: 8, left: "50%", top: "30%", color: "#93c5fd" },
] as const;

const YEAR4_ZONES = [
  { id: "precision", name: "PRECISION MEASURING", sub: "WEEK 1", weekStart: 1, weekEnd: 1, left: "7%", top: "14%", color: "#67e8f9" },
  { id: "scales-jugs", name: "SCALES & JUGS", sub: "WEEK 2", weekStart: 2, weekEnd: 2, left: "10%", top: "56%", color: "#86efac" },
  { id: "temperature", name: "TEMPERATURE", sub: "WEEK 3", weekStart: 3, weekEnd: 3, left: "70%", top: "15%", color: "#c4b5fd" },
  { id: "perimeter", name: "PERIMETER", sub: "WEEK 4", weekStart: 4, weekEnd: 4, left: "50%", top: "30%", color: "#fde68a" },
  { id: "area", name: "AREA", sub: "WEEK 5", weekStart: 5, weekEnd: 5, left: "50%", top: "30%", color: "#a7f3d0" },
  { id: "time-problems", name: "TIME PROBLEMS", sub: "WEEK 6", weekStart: 6, weekEnd: 6, left: "50%", top: "30%", color: "#fcd34d" },
  { id: "angles", name: "ANGLES", sub: "WEEK 7", weekStart: 7, weekEnd: 7, left: "69%", top: "57%", color: "#f9a8d4" },
  { id: "investigations", name: "MEASUREMENT INVESTIGATIONS", sub: "WEEK 8", weekStart: 8, weekEnd: 8, left: "50%", top: "30%", color: "#93c5fd" },
] as const;

const YEAR5_ZONES = [
  { id: "level5-week1", name: "LEVEL 5 WEEK 1", sub: "COMING SOON", weekStart: 1, weekEnd: 1, left: "7%", top: "14%", color: "#67e8f9" },
  { id: "level5-week2", name: "LEVEL 5 WEEK 2", sub: "COMING SOON", weekStart: 2, weekEnd: 2, left: "10%", top: "56%", color: "#86efac" },
  { id: "level5-week3", name: "LEVEL 5 WEEK 3", sub: "COMING SOON", weekStart: 3, weekEnd: 3, left: "70%", top: "15%", color: "#c4b5fd" },
  { id: "level5-week4", name: "LEVEL 5 WEEK 4", sub: "COMING SOON", weekStart: 4, weekEnd: 4, left: "50%", top: "30%", color: "#fde68a" },
  { id: "level5-week5", name: "LEVEL 5 WEEK 5", sub: "COMING SOON", weekStart: 5, weekEnd: 5, left: "50%", top: "30%", color: "#a7f3d0" },
  { id: "level5-week6", name: "LEVEL 5 WEEK 6", sub: "COMING SOON", weekStart: 6, weekEnd: 6, left: "50%", top: "30%", color: "#fcd34d" },
  { id: "level5-week7", name: "LEVEL 5 WEEK 7", sub: "COMING SOON", weekStart: 7, weekEnd: 7, left: "69%", top: "57%", color: "#f9a8d4" },
  { id: "level5-week8", name: "LEVEL 5 WEEK 8", sub: "COMING SOON", weekStart: 8, weekEnd: 8, left: "50%", top: "30%", color: "#93c5fd" },
] as const;

const YEAR6_ZONES = [
  { id: "level6-week1", name: "LEVEL 6 WEEK 1", sub: "COMING SOON", weekStart: 1, weekEnd: 1, left: "7%", top: "14%", color: "#67e8f9" },
  { id: "level6-week2", name: "LEVEL 6 WEEK 2", sub: "COMING SOON", weekStart: 2, weekEnd: 2, left: "10%", top: "56%", color: "#86efac" },
  { id: "level6-week3", name: "LEVEL 6 WEEK 3", sub: "COMING SOON", weekStart: 3, weekEnd: 3, left: "70%", top: "15%", color: "#c4b5fd" },
  { id: "level6-week4", name: "LEVEL 6 WEEK 4", sub: "COMING SOON", weekStart: 4, weekEnd: 4, left: "50%", top: "30%", color: "#fde68a" },
  { id: "level6-week5", name: "LEVEL 6 WEEK 5", sub: "COMING SOON", weekStart: 5, weekEnd: 5, left: "50%", top: "30%", color: "#a7f3d0" },
  { id: "level6-week6", name: "LEVEL 6 WEEK 6", sub: "COMING SOON", weekStart: 6, weekEnd: 6, left: "50%", top: "30%", color: "#fcd34d" },
  { id: "level6-week7", name: "LEVEL 6 WEEK 7", sub: "COMING SOON", weekStart: 7, weekEnd: 7, left: "69%", top: "57%", color: "#f9a8d4" },
  { id: "level6-week8", name: "LEVEL 6 WEEK 8", sub: "COMING SOON", weekStart: 8, weekEnd: 8, left: "50%", top: "30%", color: "#93c5fd" },
] as const;

const YEAR3_DISTRICTS = [
  {
    id: "ruler-district",
    name: "RULER DISTRICT",
    sub: "WEEKS 1–2",
    weekStart: 1,
    weekEnd: 2,
    left: "4%",
    top: "14%",
    color: "#67e8f9",
    tagline: "length, metres, and measured paths",
  },
  {
    id: "measure-lab",
    name: "MEASURE LAB",
    sub: "WEEKS 3–4",
    weekStart: 3,
    weekEnd: 4,
    left: "5%",
    top: "58%",
    color: "#c4b5fd",
    tagline: "mass, capacity, and accuracy",
  },
  {
    id: "timeworks",
    name: "TIMEWORKS",
    sub: "WEEKS 5–6",
    weekStart: 5,
    weekEnd: 6,
    left: "68%",
    top: "14%",
    color: "#fde68a",
    tagline: "duration, minutes, and clockwork",
  },
  {
    id: "explorer-district",
    name: "EXPLORER DISTRICT",
    sub: "WEEKS 7–8",
    weekStart: 7,
    weekEnd: 8,
    left: "68%",
    top: "58%",
    color: "#f9a8d4",
    tagline: "perimeter and area previews",
  },
] as const;

const YEAR4_DISTRICTS = [
  {
    id: "precision-forge",
    name: "PRECISION FORGE",
    sub: "WEEKS 1–2",
    weekStart: 1,
    weekEnd: 2,
    left: "4%",
    top: "14%",
    color: "#67e8f9",
    tagline: "precision, scales, and measuring jugs",
  },
  {
    id: "boundary-lab",
    name: "BOUNDARY LAB",
    sub: "WEEKS 3–4",
    weekStart: 3,
    weekEnd: 4,
    left: "5%",
    top: "58%",
    color: "#c4b5fd",
    tagline: "temperature and perimeter",
  },
  {
    id: "space-timeworks",
    name: "SPACE TIMEWORKS",
    sub: "WEEKS 5–6",
    weekStart: 5,
    weekEnd: 6,
    left: "68%",
    top: "14%",
    color: "#fde68a",
    tagline: "area and time problems",
  },
  {
    id: "explorer-trials",
    name: "EXPLORER TRIALS",
    sub: "WEEKS 7–8",
    weekStart: 7,
    weekEnd: 8,
    left: "68%",
    top: "58%",
    color: "#f9a8d4",
    tagline: "angles and investigations",
  },
] as const;

const YEAR5_DISTRICTS = [
  {
    id: "calibration-works",
    name: "CALIBRATION WORKS",
    sub: "WEEKS 1–2",
    weekStart: 1,
    weekEnd: 2,
    left: "4%",
    top: "14%",
    color: "#67e8f9",
    tagline: "Level 5 measurement path coming soon",
  },
  {
    id: "measure-foundry",
    name: "MEASURE FOUNDRY",
    sub: "WEEKS 3–4",
    weekStart: 3,
    weekEnd: 4,
    left: "5%",
    top: "58%",
    color: "#c4b5fd",
    tagline: "Level 5 measurement path coming soon",
  },
  {
    id: "time-laboratory",
    name: "TIME LABORATORY",
    sub: "WEEKS 5–6",
    weekStart: 5,
    weekEnd: 6,
    left: "68%",
    top: "14%",
    color: "#fde68a",
    tagline: "Level 5 measurement path coming soon",
  },
  {
    id: "calibrator-trials",
    name: "CALIBRATOR TRIALS",
    sub: "WEEKS 7–8",
    weekStart: 7,
    weekEnd: 8,
    left: "68%",
    top: "58%",
    color: "#f9a8d4",
    tagline: "Level 5 measurement path coming soon",
  },
] as const;

const YEAR6_DISTRICTS = [
  {
    id: "timewielder-gate",
    name: "TIMEWIELDER GATE",
    sub: "WEEKS 1–2",
    weekStart: 1,
    weekEnd: 2,
    left: "4%",
    top: "14%",
    color: "#67e8f9",
    tagline: "Level 6 measurement path coming soon",
  },
  {
    id: "calibration-halls",
    name: "CALIBRATION HALLS",
    sub: "WEEKS 3–4",
    weekStart: 3,
    weekEnd: 4,
    left: "5%",
    top: "58%",
    color: "#c4b5fd",
    tagline: "Level 6 measurement path coming soon",
  },
  {
    id: "chronometer-spire",
    name: "CHRONOMETER SPIRE",
    sub: "WEEKS 5–6",
    weekStart: 5,
    weekEnd: 6,
    left: "68%",
    top: "14%",
    color: "#fde68a",
    tagline: "Level 6 measurement path coming soon",
  },
  {
    id: "mastery-observatory",
    name: "MASTERY OBSERVATORY",
    sub: "WEEKS 7–8",
    weekStart: 7,
    weekEnd: 8,
    left: "68%",
    top: "58%",
    color: "#f9a8d4",
    tagline: "Level 6 measurement path coming soon",
  },
] as const;

function getMeasurelandsWorldConfig(year: MeasurelandsYear) {
  if (year === "Year 6") {
    return { bgImage: YEAR6_BG_IMAGE, levelLabel: "LEVEL 6", zones: YEAR6_ZONES };
  }
  if (year === "Year 5") {
    return { bgImage: YEAR5_BG_IMAGE, levelLabel: "LEVEL 5", zones: YEAR5_ZONES };
  }
  if (year === "Year 4") {
    return { bgImage: YEAR4_BG_IMAGE, levelLabel: "LEVEL 4", zones: YEAR4_ZONES };
  }
  if (year === "Year 3") {
    return { bgImage: YEAR3_BG_IMAGE, levelLabel: "LEVEL 3", zones: YEAR3_ZONES };
  }
  if (year === "Year 2") {
    return { bgImage: YEAR2_BG_IMAGE, levelLabel: "LEVEL 2", zones: YEAR2_ZONES };
  }
  if (year === "Year 1") {
    return { bgImage: YEAR1_BG_IMAGE, levelLabel: "LEVEL 1", zones: YEAR1_ZONES };
  }
  return { bgImage: PREP_BG_IMAGE, levelLabel: "GROUND LEVEL", zones: PREP_ZONES };
}

function getMeasurelandsDistricts(year: MeasurelandsYear) {
  if (year === "Year 6") return YEAR6_DISTRICTS;
  if (year === "Year 5") return YEAR5_DISTRICTS;
  if (year === "Year 4") return YEAR4_DISTRICTS;
  return YEAR3_DISTRICTS;
}

export const MEASURELANDS_DASHBOARD_CONFIG = {
  realmId: "measurelands",
  storageRealmId: "measurement",
  slug: "measurelands",
  displayName: "Measurelands",
  realmMark: "⚗",
  districtTagline: "FORMAL MEASUREMENT DISTRICTS",
  guidedTagline: "MASTER MEASUREMENT · BALANCE THE WORLD",
  totalWeeks: 8,
  districtModeLevels: ["Year 3", "Year 4", "Year 5", "Year 6"],
  worldForLevel: getMeasurelandsWorldConfig,
  districtsForLevel: getMeasurelandsDistricts,
  theme: {
    pageBackground: "#17100a",
    accent: "#d6a64a",
    accentRgb: "214,166,74",
    secondaryAccent: "#e6c079",
    secondaryRgb: "214,166,74",
    mutedAccent: "rgba(243,227,191,0.72)",
    pathText: "rgba(243,227,191,0.82)",
    text: "#fff7ed",
    navBackground: "rgba(23,16,10,0.78)",
    navBorder: "rgba(214,166,74,0.16)",
    realmChipBackground: "rgba(74,47,30,0.55)",
    realmChipBorder: "rgba(214,166,74,0.36)",
    atmosphericOverlay: "linear-gradient(180deg, rgba(20,8,0,0.52) 0%, rgba(15,6,0,0.1) 42%, rgba(10,4,0,0.85) 100%)",
    atmosphericGlow: "radial-gradient(ellipse 68% 58% at 50% 38%, rgba(251,191,36,0.05) 0%, transparent 72%)",
    sceneFocusOverlay: "radial-gradient(ellipse 34% 38% at 50% 40%, rgba(20,8,0,0.12) 0%, rgba(20,8,0,0.06) 38%, transparent 72%)",
    focusGlow: "rgba(200,160,48,0.6)",
    transitionGlow: "linear-gradient(180deg, rgba(253,230,138,0) 0%, rgba(253,230,138,0.16) 55%, rgba(251,191,36,0.32) 100%)",
    launchOverlay: "radial-gradient(circle at 50% 60%, rgba(253,230,138,0.7) 0%, rgba(253,230,138,0.28) 25%, rgba(5,8,24,0.95) 70%)",
    districtBackground: "linear-gradient(135deg, rgba(19,9,2,0.68), rgba(36,16,3,0.42))",
    districtActiveBackground: "linear-gradient(135deg, rgba(62,32,4,0.82), rgba(83,39,8,0.62))",
    hudBackground: "linear-gradient(180deg, rgba(28,14,2,0.92) 0%, rgba(15,6,0,0.95) 100%)",
    hudBorder: "1.5px solid rgba(251,191,36,0.28)",
    hudShadow: "0 0 18px rgba(251,191,36,0.12), 0 6px 22px rgba(0,0,0,0.64), inset 0 1px 0 rgba(255,255,255,0.05)",
    hudIconBackground: "radial-gradient(circle at 50% 35%, rgba(251,191,36,0.22) 0%, rgba(120,53,15,0.18) 55%, rgba(15,6,0,0) 100%)",
    hudIconBorder: "1px solid rgba(251,191,36,0.28)",
    hudIconShadow: "inset 0 0 14px rgba(251,191,36,0.14), 0 0 18px rgba(251,191,36,0.1)",
    hudTextShadow: "0 0 10px rgba(251,191,36,0.4)",
    guidePanelBackground: "linear-gradient(180deg, rgba(76,29,149,0.78) 0%, rgba(30,27,75,0.85) 100%)",
    guideIconBackground: "radial-gradient(circle at 50% 35%, #fde68a 0%, #b45309 75%)",
    actionBackground: "linear-gradient(135deg, #2a1a04 0%, #5c3d0e 38%, #8b6520 72%, #c8a030 100%)",
    actionText: "#faf0d0",
    pulseRgb: "200,160,48",
    particleColors: ["#67e8f9", "#fde68a", "#c4b5fd", "#86efac", "#f9a8d4"],
  },
  labels: {
    loading: "INITIALISING MEASURELANDS…",
    guideName: "MEAZUREX",
    guideIcon: "🧙",
    guideWelcome: "Welcome, young measurer! Your adventure begins.",
    start: "START ADVENTURE",
    continue: "CONTINUE ADVENTURE",
    currentPath: "CURRENT PATH",
    districtOpen: "· OPEN DISTRICT",
    districtLocked: "· LOCKED",
    districtComplete: "· MASTERED",
  },
  avatar: {
    height: 188,
    glowColor: "rgba(253,230,138,0.34)",
    floatAnimation: "realm-character-float 4.6s ease-in-out infinite",
  },
} satisfies CanonicalRealmDashboardConfig;

export default function MeasurelandsMap({ year = "Prep" }: { year?: MeasurelandsYear }) {
  return <RealmDashboardShell config={MEASURELANDS_DASHBOARD_CONFIG} level={year} />;
}
