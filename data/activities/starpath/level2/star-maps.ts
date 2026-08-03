// Level 2 · Star Maps. Simple 2D top-view maps of Starpath, built from named
// locations placed on a small grid. Landmark icons reuse the shipped
// PositionObjectVisual set, so the map is composed of already-verified art.

export const LEVEL_TWO_ARTWORK = "/images/starpath-home-bg-y2.png";

export type MapLocationId =
  | "crystal-caves"
  | "planet-plaza"
  | "moon-maze"
  | "constellation-crossing"
  | "asteroid-pass"
  | "nebula-station"
  | "rocket-base"
  | "flag-point"
  | "alien-outpost";

export const MAP_LOCATIONS: Record<MapLocationId, { label: string; object: string }> = {
  "crystal-caves": { label: "Crystal Caves", object: "crystal" },
  "planet-plaza": { label: "Planet Plaza", object: "planet" },
  "moon-maze": { label: "Moon Maze", object: "moon" },
  "constellation-crossing": { label: "Constellation Crossing", object: "star" },
  "asteroid-pass": { label: "Asteroid Pass", object: "cave" },
  "nebula-station": { label: "Nebula Station", object: "satellite" },
  "rocket-base": { label: "Rocket Base", object: "rocket" },
  "flag-point": { label: "Flag Point", object: "flag" },
  "alien-outpost": { label: "Alien Outpost", object: "alien" },
};

export type StarMapPlacement = { id: MapLocationId; r: number; c: number };
export type StarMap = {
  id: string;
  label: string;
  cols: number;
  rows: number;
  placements: StarMapPlacement[];
};

// Maps use a wide 8x4 grid so they read like a real map (landscape, like the
// Level 1 mission grid) rather than a square. Landmarks are spread across the
// width, always with at least one same-row and one same-column pair so the
// "relative position" tasks (left/right, above/below) have aligned pairs to
// reason about. Placements are kept within reach of the bottom-left start
// (route length <= 7 moves) so Week 7 path lessons stay Year-2 friendly.
const STAR_MAPS: Record<string, StarMap> = {
  "sector-1": {
    id: "sector-1",
    label: "Sector 1",
    cols: 8,
    rows: 4,
    placements: [
      { id: "crystal-caves", r: 0, c: 0 },
      { id: "planet-plaza", r: 0, c: 4 },
      { id: "constellation-crossing", r: 1, c: 2 },
      { id: "nebula-station", r: 1, c: 5 },
      { id: "moon-maze", r: 3, c: 4 },
      { id: "rocket-base", r: 2, c: 6 },
    ],
  },
  "sector-2": {
    id: "sector-2",
    label: "Sector 2",
    cols: 8,
    rows: 4,
    placements: [
      { id: "rocket-base", r: 0, c: 1 },
      { id: "flag-point", r: 0, c: 4 },
      { id: "moon-maze", r: 1, c: 1 },
      { id: "planet-plaza", r: 2, c: 0 },
      { id: "asteroid-pass", r: 2, c: 6 },
      { id: "constellation-crossing", r: 3, c: 4 },
    ],
  },
  "sector-3": {
    id: "sector-3",
    label: "Sector 3",
    cols: 8,
    rows: 4,
    placements: [
      { id: "moon-maze", r: 0, c: 0 },
      { id: "alien-outpost", r: 0, c: 4 },
      { id: "planet-plaza", r: 1, c: 2 },
      { id: "crystal-caves", r: 2, c: 6 },
      { id: "flag-point", r: 2, c: 2 },
      { id: "nebula-station", r: 3, c: 2 },
    ],
  },
};

export function getStarMap(id: string): StarMap {
  return STAR_MAPS[id] ?? STAR_MAPS["sector-1"]!;
}

export function listStarMaps(): StarMap[] {
  return Object.values(STAR_MAPS);
}

// Landmarks with resolved label + icon for a map, ready for a task.
export function mapLandmarks(map: StarMap): Array<{ id: string; label: string; object: string; r: number; c: number }> {
  return map.placements.map((placement) => ({
    id: placement.id,
    label: MAP_LOCATIONS[placement.id].label,
    object: MAP_LOCATIONS[placement.id].object,
    r: placement.r,
    c: placement.c,
  }));
}
