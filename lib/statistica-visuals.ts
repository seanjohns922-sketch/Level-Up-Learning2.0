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
  },
};

export function getStatisticaLevelTheme(level: RealmLevelId) {
  return STATISTICA_LEVEL_THEMES[level] ?? STATISTICA_LEVEL_THEMES["Year 1"]!;
}
