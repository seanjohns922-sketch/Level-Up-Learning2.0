import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

export const STARPATH_BACKGROUNDS: Record<RealmLevelId, string> = {
  Prep: "/images/starpath-home-bg-ground.png",
  "Year 1": "/images/starpath-home-bg-y1.png",
  "Year 2": "/images/starpath-home-bg-y2.png",
  "Year 3": "/images/starpath-home-bg-y3.png",
  "Year 4": "/images/starpath-home-bg-y4.png",
  "Year 5": "/images/starpath-home-bg-y5.png",
  "Year 6": "/images/starpath-home-bg-y6.png",
};

export function getStarpathBackground(level: RealmLevelId) {
  return STARPATH_BACKGROUNDS[level];
}

export type StarpathLevelTheme = {
  level: RealmLevelId;
  background: string;
  backBackground?: string;
  groundAsset?: string;
  panoramaY?: number;
  panoramaHeight?: number;
  panoramaOverlap?: number;
  panoramaEdgeFade?: number;
  sky: string;
  fog: string;
  ambientLight: string;
  keyLight: string;
  accent: string;
  secondaryAccent: string;
  panoramaRotation: number;
};

const LEVEL_ACCENTS: Record<RealmLevelId, Pick<StarpathLevelTheme, "sky" | "fog" | "ambientLight" | "keyLight" | "accent" | "secondaryAccent" | "panoramaRotation">> = {
  Prep: { sky: "#101a42", fog: "#25365b", ambientLight: "#c8dcff", keyLight: "#fff0cc", accent: "#a7e9ff", secondaryAccent: "#e8b9ff", panoramaRotation: Math.PI },
  "Year 1": { sky: "#101a42", fog: "#25365b", ambientLight: "#c8dcff", keyLight: "#fff0cc", accent: "#a7e9ff", secondaryAccent: "#e8b9ff", panoramaRotation: Math.PI },
  "Year 2": { sky: "#10173b", fog: "#26355d", ambientLight: "#c5d9ff", keyLight: "#f9e8c8", accent: "#8fe7ff", secondaryAccent: "#d5b4ff", panoramaRotation: Math.PI },
  "Year 3": { sky: "#11183f", fog: "#29365c", ambientLight: "#cadcff", keyLight: "#fff0d4", accent: "#8fe7ff", secondaryAccent: "#f3b7ff", panoramaRotation: Math.PI },
  "Year 4": { sky: "#101535", fog: "#293354", ambientLight: "#cbd8ff", keyLight: "#f8e4cf", accent: "#92ddff", secondaryAccent: "#f4b5e5", panoramaRotation: Math.PI },
  "Year 5": { sky: "#0d1230", fog: "#252d4d", ambientLight: "#c6d3ff", keyLight: "#f5e6d2", accent: "#9edbff", secondaryAccent: "#c9b7ff", panoramaRotation: Math.PI },
  "Year 6": { sky: "#0b102a", fog: "#222a46", ambientLight: "#cbd5ff", keyLight: "#f5e8d8", accent: "#b5e6ff", secondaryAccent: "#d8baff", panoramaRotation: Math.PI },
};

export const STARPATH_LEVEL_THEMES = Object.fromEntries(
  (Object.keys(STARPATH_BACKGROUNDS) as RealmLevelId[]).map((level) => [
    level,
    { level, background: STARPATH_BACKGROUNDS[level], ...LEVEL_ACCENTS[level] },
  ]),
) as Record<RealmLevelId, StarpathLevelTheme>;

STARPATH_LEVEL_THEMES.Prep = {
  ...STARPATH_LEVEL_THEMES.Prep,
  background: "/images/starpath-panorama-ground-front-4k.jpg",
  backBackground: "/images/starpath-panorama-ground-rear-4k.jpg",
  groundAsset: "/images/starpath-ground-glass-floor-2k.jpg",
  panoramaY: 24.7,
  panoramaHeight: 62,
  panoramaRotation: 0,
};

STARPATH_LEVEL_THEMES["Year 1"] = {
  ...STARPATH_LEVEL_THEMES["Year 1"],
  background: "/images/starpath-panorama-y1-front-4k.jpg",
  backBackground: "/images/starpath-panorama-y1-rear-4k.jpg",
  groundAsset: "/images/starpath-y1-constellation-glass-floor-2k.jpg",
  panoramaY: 24.7,
  panoramaHeight: 62,
  panoramaRotation: 0,
};

STARPATH_LEVEL_THEMES["Year 2"] = {
  ...STARPATH_LEVEL_THEMES["Year 2"],
  background: "/images/starpath-panorama-y1-front-4k.jpg",
  backBackground: "/images/starpath-panorama-y1-rear-4k.jpg",
  groundAsset: "/images/starpath-y1-constellation-glass-floor-2k.jpg",
  panoramaY: 24.7,
  panoramaHeight: 62,
  panoramaRotation: 0,
};

STARPATH_LEVEL_THEMES["Year 3"] = {
  ...STARPATH_LEVEL_THEMES["Year 3"],
  background: "/images/starpath-panorama-y3-front.jpg",
  backBackground: "/images/starpath-panorama-y3-rear.jpg",
};

STARPATH_LEVEL_THEMES["Year 4"] = {
  ...STARPATH_LEVEL_THEMES["Year 4"],
  background: "/images/starpath-panorama-y45-front-4k.jpg",
  backBackground: "/images/starpath-panorama-y45-rear-4k.jpg",
  groundAsset: "/images/starpath-y45-crystal-floor-2k.jpg",
  panoramaY: 24.7,
  panoramaHeight: 62,
  panoramaOverlap: 0.14,
  panoramaEdgeFade: 0.045,
  panoramaRotation: 0,
};

STARPATH_LEVEL_THEMES["Year 5"] = {
  ...STARPATH_LEVEL_THEMES["Year 5"],
  background: "/images/starpath-panorama-y45-front-4k.jpg",
  backBackground: "/images/starpath-panorama-y45-rear-4k.jpg",
  groundAsset: "/images/starpath-y45-crystal-floor-2k.jpg",
  panoramaY: 24.7,
  panoramaHeight: 62,
  panoramaOverlap: 0.14,
  panoramaEdgeFade: 0.045,
  panoramaRotation: 0,
};

STARPATH_LEVEL_THEMES["Year 6"] = {
  ...STARPATH_LEVEL_THEMES["Year 6"],
  background: "/images/starpath-panorama-y6-front-4k.jpg",
  backBackground: "/images/starpath-panorama-y6-rear-4k.jpg",
  groundAsset: "/images/starpath-y6-constellation-floor-2k.jpg",
  panoramaY: 24.7,
  panoramaHeight: 62,
  panoramaOverlap: 0.14,
  panoramaEdgeFade: 0.045,
  panoramaRotation: 0,
};

export function getStarpathLevelTheme(level: RealmLevelId) {
  return STARPATH_LEVEL_THEMES[level];
}
