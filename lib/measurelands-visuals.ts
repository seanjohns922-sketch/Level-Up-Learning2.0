import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

export type MeasurelandsLevelTheme = {
  level: RealmLevelId;
  background: string;
  backBackground?: string;
  groundAsset?: string;
  panoramaY?: number;
  panoramaHeight?: number;
  panoramaBlend?: number;
  sky: string;
  fog: string;
  ambientLight: string;
  sunLight: string;
  accent: string;
  secondaryAccent: string;
};

export const MEASURELANDS_LEVEL_THEMES: Record<RealmLevelId, MeasurelandsLevelTheme> = {
  Prep: { level: "Prep", background: "/images/measurelands-panorama-ground-front-4k.jpg", backBackground: "/images/measurelands-panorama-ground-rear-4k.jpg", groundAsset: "/images/measurelands-ground-garden-cobblestone-2k.jpg", panoramaY: 18, sky: "#8fc4ef", fog: "#c5ad82", ambientLight: "#fff0d1", sunLight: "#ffd48a", accent: "#d6a64a", secondaryAccent: "#8b5b36" },
  "Year 1": { level: "Year 1", background: "/images/measurelands-panorama-ground-front-4k.jpg", backBackground: "/images/measurelands-panorama-ground-rear-4k.jpg", groundAsset: "/images/measurelands-ground-garden-cobblestone-2k.jpg", panoramaY: 18, sky: "#8fc4ef", fog: "#c5ad82", ambientLight: "#fff0d1", sunLight: "#ffd48a", accent: "#d6a64a", secondaryAccent: "#8b5b36" },
  "Year 2": { level: "Year 2", background: "/images/measurelands-panorama-y2-front-4k.jpg", backBackground: "/images/measurelands-panorama-y2-rear-4k.jpg", groundAsset: "/images/measurelands-ground-y2-ruler-road-2k.jpg", panoramaY: 18, sky: "#8fc4ef", fog: "#a9a37d", ambientLight: "#fff1d2", sunLight: "#ffd174", accent: "#e4b648", secondaryAccent: "#75502e" },
  "Year 3": { level: "Year 3", background: "/images/measurelands-panorama-y3-360-4k.jpg", sky: "#9fc9ee", fog: "#9eac94", ambientLight: "#fff0d1", sunLight: "#ffd27d", accent: "#d6a64a", secondaryAccent: "#6d452d" },
  "Year 4": { level: "Year 4", background: "/images/measurelands-panorama-y4-front-4k.jpg", backBackground: "/images/measurelands-panorama-y4-rear-4k.jpg", groundAsset: "/images/measurelands-ground-y4-scholar-plaza-2k.jpg", panoramaY: 21, panoramaHeight: 60, sky: "#d8c8bd", fog: "#a68b70", ambientLight: "#fff0d6", sunLight: "#f4c472", accent: "#d8aa4c", secondaryAccent: "#6b4730" },
  "Year 5": { level: "Year 5", background: "/images/measurelands-panorama-y5-front-4k.jpg", backBackground: "/images/measurelands-panorama-y5-rear-4k.jpg", groundAsset: "/images/measurelands-ground-y5-moonlit-courtyard-2k.jpg", panoramaY: 21, panoramaHeight: 60, sky: "#102b58", fog: "#273652", ambientLight: "#9bb8e8", sunLight: "#ffd58e", accent: "#66d9ff", secondaryAccent: "#b48a4f" },
  "Year 6": { level: "Year 6", background: "/images/measurelands-panorama-y6-front-4k.jpg", backBackground: "/images/measurelands-panorama-y6-rear-4k.jpg", groundAsset: "/images/measurelands-ground-y6-proportion-academy-2k.jpg", panoramaY: 21, panoramaHeight: 60, panoramaBlend: 0.055, sky: "#d8b58a", fog: "#a08161", ambientLight: "#ffe6bf", sunLight: "#ffd071", accent: "#e2b44d", secondaryAccent: "#745033" },
};

export function getMeasurelandsLevelTheme(level: RealmLevelId) {
  return MEASURELANDS_LEVEL_THEMES[level];
}
