import type { EconomyItem } from "@/lib/economy";
import { CENTRAL_WORLD_CONFIG } from "./central-world-config";

export type CentralWorldPlacement = {
  placementId?: string;
  itemId: string;
  gridX: number;
  gridZ: number;
  rotation: 0 | 90 | 180 | 270;
  // Optional recolour applied to the item's paint surface. Persisted alongside
  // the placement; undefined means the item's default colours.
  tint?: string;
  // Interactive open/closed state (e.g. a drawbridge). Persisted; undefined
  // means the item's default (down/closed).
  state?: "up" | "down";
};

export type CentralWorldGroundType = "path" | "road" | "stone" | "water";
export type CentralWorldGroundTile = { gridX: number; gridZ: number; tileType: CentralWorldGroundType };

// The buildable grid reaches back to enclose the Tower of Knowledge (base around
// world z -46) and left far enough to reach My Home (world x -60), so kids can
// wall and moat around both landmarks.
export const CENTRAL_WORLD_GRID = { cellSize: 2, minX: -34, maxX: 30, minZ: -31, maxZ: 28 } as const;
const STORAGE_PREFIX = "lul:central-world:layout:v1";
const GROUND_STORAGE_PREFIX = "lul:central-world:ground:v2";
const LEGACY_GROUND_STORAGE_PREFIX = "lul:central-world:ground:v1";

export const CENTRAL_WORLD_HOME_KEY = "central_world_player_home";
export const CENTRAL_WORLD_HOME_ITEM: EconomyItem = {
  item_key: CENTRAL_WORLD_HOME_KEY, name: "My Home", description: "Move your home to a clear space, then build a path to its door.",
  category: "decoration", realm_id: null, rarity: "common", price: 0, icon: "home", accent: "#efbd61",
  purchasable: false, discoverable: false, active: true, sort_order: -1,
  metadata: { marketplaceCategory: "home", gridSize: "7x7" },
};
export const DEFAULT_HOME_PLACEMENT: CentralWorldPlacement = {
  itemId: CENTRAL_WORLD_HOME_KEY, placementId: CENTRAL_WORLD_HOME_KEY, gridX: -30, gridZ: 12, rotation: 90,
};

export function getCentralWorldHome(placements: CentralWorldPlacement[]) {
  return placements.find(p => p.itemId === CENTRAL_WORLD_HOME_KEY) ?? DEFAULT_HOME_PLACEMENT;
}

// Derive every home destination from one saved transform; +z is its doorway.
export function getCentralWorldHomeAnchors(home: CentralWorldPlacement) {
  const angle = home.rotation * Math.PI / 180;
  const position = gridToWorld(home.gridX, home.gridZ);
  const point = (forward: number): [number, number, number] => [position[0] + Math.sin(angle) * forward, 0.75, position[2] + Math.cos(angle) * forward];
  return { position, rotationY: angle, entrance: point(6.5), exit: point(8) };
}

function normaliseHomes(placements: CentralWorldPlacement[]) {
  const stored = getCentralWorldHome(placements);
  const anchors = getCentralWorldHomeAnchors(stored);
  const valid = Number.isInteger(stored.gridX) && Number.isInteger(stored.gridZ)
    && stored.gridX >= CENTRAL_WORLD_GRID.minX + 3 && stored.gridX <= CENTRAL_WORLD_GRID.maxX - 3
    && stored.gridZ >= CENTRAL_WORLD_GRID.minZ + 3 && stored.gridZ <= CENTRAL_WORLD_GRID.maxZ - 3
    && [0, 90, 180, 270].includes(stored.rotation) && reachablePoint(anchors.exit) && reachablePoint(anchors.entrance);
  return [...placements.filter(p => p.itemId !== CENTRAL_WORLD_HOME_KEY), { ...(valid ? stored : DEFAULT_HOME_PLACEMENT), placementId: CENTRAL_WORLD_HOME_KEY }];
}

function homeAccessCells(home: CentralWorldPlacement) {
  const { exit } = getCentralWorldHomeAnchors(home);
  const x = Math.round(exit[0] / CENTRAL_WORLD_GRID.cellSize), z = Math.round(exit[2] / CENTRAL_WORLD_GRID.cellSize);
  return home.rotation === 90 || home.rotation === 270
    ? [`${x}:${z - 1}`, `${x}:${z}`, `${x}:${z + 1}`]
    : [`${x - 1}:${z}`, `${x}:${z}`, `${x + 1}:${z}`];
}

function reachablePoint([x, , z]: [number, number, number]) {
  const bounds = CENTRAL_WORLD_CONFIG.playableBounds, ellipse = CENTRAL_WORLD_CONFIG.roamEllipse;
  return x >= bounds.minX && x <= bounds.maxX && z >= bounds.minZ && z <= bounds.maxZ
    && (x / ellipse.radiusX) ** 2 + ((z - ellipse.centerZ) / ellipse.radiusZ) ** 2 <= 1;
}

// Preserve the familiar routes on first load, but as ordinary paintable tiles.
// v2 saves (including an empty array) take precedence so erasing is permanent.
export function centralWorldStarterPaths(): CentralWorldGroundTile[] {
  const cells = new Map<string, CentralWorldGroundTile>();
  for (const points of [CENTRAL_WORLD_CONFIG.pathPoints, CENTRAL_WORLD_CONFIG.myHomePathPoints]) {
    let previous: { gridX: number; gridZ: number } | null = null;
    for (let i = 1; i < points.length; i++) {
      const [ax, az] = points[i - 1], [bx, bz] = points[i];
      const steps = Math.ceil(Math.hypot(bx - ax, bz - az) * 2);
      for (let step = 0; step <= steps; step++) {
        const gridX = Math.round((ax + (bx - ax) * step / steps) / CENTRAL_WORLD_GRID.cellSize) || 0;
        const gridZ = Math.round((az + (bz - az) * step / steps) / CENTRAL_WORLD_GRID.cellSize) || 0;
        if (previous && previous.gridX !== gridX && previous.gridZ !== gridZ) {
          cells.set(`${gridX}:${previous.gridZ}`, { gridX, gridZ: previous.gridZ, tileType: "path" });
        }
        cells.set(`${gridX}:${gridZ}`, { gridX, gridZ, tileType: "path" });
        previous = { gridX, gridZ };
      }
    }
  }
  return [...cells.values()];
}

export function parseGridSize(item: EconomyItem): [number, number] {
  const value = typeof item.metadata.gridSize === "string" ? item.metadata.gridSize : "3x3";
  const match = /^(\d+)x(\d+)$/.exec(value);
  return match ? [Number(match[1]), Number(match[2])] : [3, 3];
}

export function rotatedGridSize(item: EconomyItem, rotation: CentralWorldPlacement["rotation"]): [number, number] {
  const [width, depth] = parseGridSize(item);
  return rotation === 90 || rotation === 270 ? [depth, width] : [width, depth];
}

export function gridToWorld(gridX: number, gridZ: number): [number, number, number] {
  return [gridX * CENTRAL_WORLD_GRID.cellSize, 0, gridZ * CENTRAL_WORLD_GRID.cellSize];
}

// True when the placement's footprint (its whole grid span, not just the centre
// cell) covers the given cell — so a tap anywhere on a large object can select
// or erase it, not only its exact middle.
export function placementOccupiesCell(placement: CentralWorldPlacement, item: EconomyItem, gridX: number, gridZ: number) {
  const [width, depth] = rotatedGridSize(item, placement.rotation);
  const startX = placement.gridX - Math.floor(width / 2);
  const startZ = placement.gridZ - Math.floor(depth / 2);
  return gridX >= startX && gridX < startX + width && gridZ >= startZ && gridZ < startZ + depth;
}

function occupiedCells(placement: CentralWorldPlacement, item: EconomyItem) {
  const [width, depth] = rotatedGridSize(item, placement.rotation);
  const cells: string[] = [];
  const startX = placement.gridX - Math.floor(width / 2);
  const startZ = placement.gridZ - Math.floor(depth / 2);
  for (let x = 0; x < width; x += 1) for (let z = 0; z < depth; z += 1) cells.push(`${startX + x}:${startZ + z}`);
  if (placement.itemId === CENTRAL_WORLD_HOME_KEY) cells.push(...homeAccessCells(placement));
  return cells;
}

export function isCentralWorldProtectedCell(gridX: number, gridZ: number) {
  const x = gridX * CENTRAL_WORLD_GRID.cellSize;
  const z = gridZ * CENTRAL_WORLD_GRID.cellSize;
  // Tower base + its doorway approach only (was a broad corridor). Everything
  // else behind and around the tower is now buildable, so it can be fortified.
  if (z >= -56 && z <= -31 && Math.abs(x) <= 9) return true;
  // Keep the central arrival point clear; the old path corridors are editable.
  if (z >= 16 && z <= 20 && Math.abs(x) <= 2) return true;
  return false;
}

export function validateCentralWorldPlacement(placement: CentralWorldPlacement, item: EconomyItem, placements: CentralWorldPlacement[], itemsById: Map<string, EconomyItem>, groundTiles: CentralWorldGroundTile[] = []) {
  if (placement.itemId === CENTRAL_WORLD_HOME_KEY) {
    const anchors = getCentralWorldHomeAnchors(placement);
    if (!reachablePoint(anchors.entrance) || !reachablePoint(anchors.exit)) return false;
  }
  const cells = occupiedCells(placement, item);
  for (const key of cells) {
    const [x, z] = key.split(":").map(Number);
    if (x < CENTRAL_WORLD_GRID.minX || x > CENTRAL_WORLD_GRID.maxX || z < CENTRAL_WORLD_GRID.minZ || z > CENTRAL_WORLD_GRID.maxZ || isCentralWorldProtectedCell(x, z)) return false;
  }
  const occupied = new Set<string>();
  if (placement.itemId === CENTRAL_WORLD_HOME_KEY) {
    for (const tile of groundTiles) if (tile.tileType === "water") occupied.add(`${tile.gridX}:${tile.gridZ}`);
  }
  for (const existing of normaliseHomes(placements)) {
    if (placement.itemId === CENTRAL_WORLD_HOME_KEY && existing.itemId === CENTRAL_WORLD_HOME_KEY) continue;
    const existingItem = existing.itemId === CENTRAL_WORLD_HOME_KEY ? CENTRAL_WORLD_HOME_ITEM : itemsById.get(existing.itemId);
    // Do not guess an unloaded reward footprint when deciding where a home fits.
    if (!existingItem) return false;
    occupiedCells(existing, existingItem).forEach((cell) => occupied.add(cell));
  }
  return cells.every((cell) => !occupied.has(cell));
}

export function readCentralWorldPlacements(scope: string) {
  if (typeof window === "undefined") return normaliseHomes([]);
  try {
    const parsed = JSON.parse(window.localStorage.getItem(`${STORAGE_PREFIX}:${scope}`) ?? "[]");
    if (!Array.isArray(parsed)) return normaliseHomes([]);
    return normaliseHomes(parsed
      .filter((entry): entry is CentralWorldPlacement => typeof entry?.itemId === "string" && Number.isInteger(entry?.gridX) && Number.isInteger(entry?.gridZ) && [0, 90, 180, 270].includes(entry?.rotation))
      // Backfill a stable id for older placements saved before ids existed, so a
      // moved item can always be matched (and excluded) by placementId — vital
      // now that many identical scenery items can share an itemId.
      .map((entry, index) => (entry.placementId ? entry : { ...entry, placementId: `${entry.itemId}-legacy-${index}` })));
  } catch { return normaliseHomes([]); }
}

export function writeCentralWorldPlacements(scope: string, placements: CentralWorldPlacement[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(`${STORAGE_PREFIX}:${scope}`, JSON.stringify(normaliseHomes(placements)));
}

export function validateCentralWorldGroundCell(gridX: number, gridZ: number, placements: CentralWorldPlacement[] = [], tileType?: CentralWorldGroundType) {
  if (gridX < CENTRAL_WORLD_GRID.minX || gridX > CENTRAL_WORLD_GRID.maxX || gridZ < CENTRAL_WORLD_GRID.minZ || gridZ > CENTRAL_WORLD_GRID.maxZ || isCentralWorldProtectedCell(gridX, gridZ)) return false;
  const home = getCentralWorldHome(placements);
  if (placementOccupiesCell(home, CENTRAL_WORLD_HOME_ITEM, gridX, gridZ)) return false;
  return tileType !== "water" || !homeAccessCells(home).includes(`${gridX}:${gridZ}`);
}

export function readCentralWorldGroundTiles(scope: string) {
  if (typeof window === "undefined") return centralWorldStarterPaths();
  const clean = (raw: string): CentralWorldGroundTile[] => {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Invalid ground layout");
    return parsed.filter((entry): entry is CentralWorldGroundTile => Number.isInteger(entry?.gridX) && Number.isInteger(entry?.gridZ) && ["path", "road", "stone", "water"].includes(entry?.tileType));
  };
  try {
    const current = window.localStorage.getItem(`${GROUND_STORAGE_PREFIX}:${scope}`);
    if (current !== null) return clean(current);
    const legacy = clean(window.localStorage.getItem(`${LEGACY_GROUND_STORAGE_PREFIX}:${scope}`) ?? "[]");
    const merged = new Map(centralWorldStarterPaths().map(tile => [`${tile.gridX}:${tile.gridZ}`, tile]));
    for (const tile of legacy) merged.set(`${tile.gridX}:${tile.gridZ}`, tile);
    return [...merged.values()];
  } catch { return centralWorldStarterPaths(); }
}

export function writeCentralWorldGroundTiles(scope: string, tiles: CentralWorldGroundTile[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(`${GROUND_STORAGE_PREFIX}:${scope}`, JSON.stringify(tiles));
}
