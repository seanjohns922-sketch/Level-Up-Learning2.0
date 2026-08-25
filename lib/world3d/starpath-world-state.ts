"use client";

import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { getRealmWorldState, type RealmWorldDistrictDefinition } from "@/lib/world3d/realm-world-state";

const DISTRICT_NAMES: Record<RealmLevelId, readonly [string, string, string, string]> = {
  Prep: ["Shape Sector", "Position Passage", "Adventure Orbit", "Graduation Galaxy"],
  "Year 1": ["Shape Station", "Object Orbit", "Direction Deck", "Explorer Expanse"],
  "Year 2": ["Shape Systems", "Mapmaker Moon", "Movement Module", "Navigator Nexus"],
  "Year 3": ["Object Observatory", "Mapmaker's Reach", "Transformation Crossing", "Spatial Mission"],
  "Year 4": ["Composite Citadel", "Grid Gardens", "Symmetry Spire", "Design Frontier"],
  "Year 5": ["Prism Port", "Coordinate Crossing", "Transformation Station", "Spatial Design Lab"],
  "Year 6": ["Cross-section Observatory", "Cartesian Quadrants", "Tessellation Array", "Orbital Investigation"],
};

const DISTRICT_MOTIFS: Record<RealmLevelId, readonly [string, string, string, string]> = {
  Prep: ["Shapes", "Positions", "Space Scenes", "Graduation"],
  "Year 1": ["Shapes", "Objects", "Directions", "Exploration"],
  "Year 2": ["Shape Features", "Maps", "Pathways", "Navigation"],
  "Year 3": ["3D Objects", "Maps", "Landmarks", "Missions"],
  "Year 4": ["Composite Forms", "Grid References", "Symmetry", "Spatial Design"],
  "Year 5": ["Nets", "Coordinates", "Transformations", "Spatial Design"],
  "Year 6": ["Cross-sections", "Cartesian Space", "Tessellations", "Investigation"],
};

const ACCENTS = ["#8fe7ff", "#c4b5fd", "#f4b8df", "#fde68a"] as const;

export function getStarpathDistrictDefinitions(level: RealmLevelId): readonly RealmWorldDistrictDefinition[] {
  return DISTRICT_NAMES[level].map((label, index) => ({
    id: `starpath-district-${index + 1}`,
    label,
    weeks: [index * 2 + 1, index * 2 + 2],
    accent: ACCENTS[index],
    motif: DISTRICT_MOTIFS[level][index],
  }));
}

export function getStarpathWorldState(options: { preview?: boolean; level?: RealmLevelId } = {}) {
  const level = options.level ?? "Year 3";
  return getRealmWorldState({
    realmId: "space",
    level,
    totalWeeks: 8,
    districts: getStarpathDistrictDefinitions(level),
    preview: options.preview,
  });
}
