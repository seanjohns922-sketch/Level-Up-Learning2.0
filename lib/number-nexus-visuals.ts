import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

export type NumberNexusExperienceMode = "guided-adventure" | "district-exploration";

export type NumberNexusLevelTheme = {
  level: RealmLevelId;
  experienceMode: NumberNexusExperienceMode;
  background: string;
  panoramaRotationY?: number;
  crispPanorama?: boolean;
  sky: string;
  fog: string;
  ambientLight: string;
  energyAccent: string;
  distantBeam: string;
};

export const NUMBER_NEXUS_LEVEL_THEMES: Record<RealmLevelId, NumberNexusLevelTheme> = {
  Prep: {
    level: "Prep",
    experienceMode: "guided-adventure",
    background: "/images/number-nexus-bg-prep.png",
    sky: "#174f50",
    fog: "#1d5554",
    ambientLight: "#d9fffa",
    energyAccent: "#5eead4",
    distantBeam: "#ccfbf1",
  },
  "Year 1": {
    level: "Year 1",
    experienceMode: "guided-adventure",
    background: "/images/number-nexus-bg-y1.png",
    sky: "#12474b",
    fog: "#174248",
    ambientLight: "#d5f8f5",
    energyAccent: "#2dd4bf",
    distantBeam: "#99f6e4",
  },
  "Year 2": {
    level: "Year 2",
    experienceMode: "guided-adventure",
    background: "/images/number-nexus-home-bg.jpg",
    sky: "#103f46",
    fog: "#163b42",
    ambientLight: "#d0f3f2",
    energyAccent: "#22d3c5",
    distantBeam: "#99f6e4",
  },
  "Year 3": {
    level: "Year 3",
    experienceMode: "district-exploration",
    background: "/images/number-nexus-home-bg-y3.jpg",
    sky: "#17484b",
    fog: "#12363a",
    ambientLight: "#cfe6ea",
    energyAccent: "#22d3c5",
    distantBeam: "#99f6e4",
  },
  "Year 4": {
    level: "Year 4",
    experienceMode: "district-exploration",
    background: "/images/number-nexus-home-bg-y4-v2.jpg",
    panoramaRotationY: Math.PI / 2,
    sky: "#102f3d",
    fog: "#102a34",
    ambientLight: "#d7edf4",
    energyAccent: "#38bdf8",
    distantBeam: "#a5f3fc",
  },
  "Year 5": {
    level: "Year 5",
    experienceMode: "district-exploration",
    background: "/images/number-nexus-home-bg-y5-v2.jpg",
    panoramaRotationY: Math.PI / 2,
    crispPanorama: true,
    sky: "#0d3b3b",
    fog: "#102f32",
    ambientLight: "#dcefe5",
    energyAccent: "#2dd4bf",
    distantBeam: "#f6c453",
  },
  "Year 6": {
    level: "Year 6",
    experienceMode: "district-exploration",
    background: "/images/number-nexus-home-bg-y6-v2.jpg",
    panoramaRotationY: Math.PI / 2,
    crispPanorama: true,
    sky: "#082f32",
    fog: "#092a2d",
    ambientLight: "#d5ece8",
    energyAccent: "#5eead4",
    distantBeam: "#ccfbf1",
  },
};

export function isNumberNexusLevel(value: string | null | undefined): value is RealmLevelId {
  return value != null && Object.prototype.hasOwnProperty.call(NUMBER_NEXUS_LEVEL_THEMES, value);
}

export function getNumberNexusLevelTheme(level: string | null | undefined): NumberNexusLevelTheme {
  return NUMBER_NEXUS_LEVEL_THEMES[isNumberNexusLevel(level) ? level : "Year 3"];
}
