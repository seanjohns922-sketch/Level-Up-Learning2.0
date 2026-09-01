import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

export type StatisticaLevelTheme = {
  level: RealmLevelId;
  background: string;
  sky: string;
  fog: string;
  ambientLight: string;
  sunLight: string;
  accent: string;
  secondaryAccent: string;
  ledgeSide: string;
  floorStyle?: "terrace" | "cliffTerrace" | "summitTerrace";
  cliffSide?: string;
  waterGlow?: string;
};

export const STATISTICA_BACKGROUNDS: Partial<Record<RealmLevelId, string>> = {
  "Year 1": "/images/statistica-home-y1.png",
  "Year 2": "/images/statistica-home-y2.png",
  "Year 3": "/images/statistica-home-y3.png",
  "Year 4": "/images/statistica-home-y4.png",
  "Year 5": "/images/statistica-home-y5.png",
  "Year 6": "/images/statistica-home-y6.png",
};

export function getStatisticaBackground(level: RealmLevelId) {
  return STATISTICA_BACKGROUNDS[level] ?? STATISTICA_BACKGROUNDS["Year 1"]!;
}

export const STATISTICA_LEVEL_THEMES: Partial<Record<RealmLevelId, StatisticaLevelTheme>> = {
  "Year 1": {
    level: "Year 1",
    background: "/images/statistica-home-y1.png",
    sky: "#7ec9c8",
    fog: "#8db99a",
    ambientLight: "#fff4d8",
    sunLight: "#ffe08a",
    accent: "#f06b64",
    secondaryAccent: "#f2bc45",
    ledgeSide: "#b4b09d",
  },
  "Year 2": {
    level: "Year 2",
    background: "/images/statistica-home-y2.png",
    sky: "#8cced4",
    fog: "#7ea98c",
    ambientLight: "#f4fff1",
    sunLight: "#ffd985",
    accent: "#4fa7c9",
    secondaryAccent: "#f2b84b",
    ledgeSide: "#b9b09a",
  },
  "Year 3": {
    level: "Year 3",
    background: "/images/statistica-home-y3.png",
    sky: "#75b7d1",
    fog: "#6f9989",
    ambientLight: "#eefbf7",
    sunLight: "#ffc76e",
    accent: "#7f6dd9",
    secondaryAccent: "#46b883",
    ledgeSide: "#b9b09a",
  },
  "Year 4": {
    level: "Year 4",
    background: "/images/statistica-home-y4.png",
    sky: "#7fbcc5",
    fog: "#7b978b",
    ambientLight: "#f6f2df",
    sunLight: "#f6cf86",
    accent: "#c48742",
    secondaryAccent: "#4eb4bd",
    ledgeSide: "#b9b09a",
  },
  "Year 5": {
    level: "Year 5",
    background: "/images/statistica-home-y5.png",
    sky: "#82b9ca",
    fog: "#7d9294",
    ambientLight: "#f4f6e8",
    sunLight: "#ffd48a",
    accent: "#57bfd4",
    secondaryAccent: "#caa76c",
    ledgeSide: "#9ca5a0",
    floorStyle: "cliffTerrace",
    cliffSide: "#667b82",
    waterGlow: "#8fdde7",
  },
  "Year 6": {
    level: "Year 6",
    background: "/images/statistica-home-y6.png",
    sky: "#8ed4d8",
    fog: "#89a29a",
    ambientLight: "#fff3d6",
    sunLight: "#ffe18f",
    accent: "#36c7d4",
    secondaryAccent: "#d6b35c",
    ledgeSide: "#a2aaa7",
    floorStyle: "summitTerrace",
    cliffSide: "#6f8389",
    waterGlow: "#7ee8ef",
  },
};

export function getStatisticaLevelTheme(level: RealmLevelId) {
  return STATISTICA_LEVEL_THEMES[level] ?? STATISTICA_LEVEL_THEMES["Year 1"]!;
}
