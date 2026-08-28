import type { EconomyItem } from "@/lib/economy";

export type CentralWorldPlacement = {
  itemId: string;
  gridX: number;
  gridZ: number;
  rotation: 0 | 90 | 180 | 270;
};

export const CENTRAL_WORLD_GRID = { cellSize: 2, minX: -21, maxX: 21, minZ: -13, maxZ: 25 } as const;
const STORAGE_PREFIX = "lul:central-world:layout:v1";

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

function occupiedCells(placement: CentralWorldPlacement, item: EconomyItem) {
  const [width, depth] = rotatedGridSize(item, placement.rotation);
  const cells: string[] = [];
  const startX = placement.gridX - Math.floor(width / 2);
  const startZ = placement.gridZ - Math.floor(depth / 2);
  for (let x = 0; x < width; x += 1) for (let z = 0; z < depth; z += 1) cells.push(`${startX + x}:${startZ + z}`);
  return cells;
}

function isProtectedCell(gridX: number, gridZ: number) {
  const x = gridX * CENTRAL_WORLD_GRID.cellSize;
  const z = gridZ * CENTRAL_WORLD_GRID.cellSize;
  if (z <= -13 && Math.abs(x) <= 12) return true;
  if (x >= -38 && x <= -20 && z >= -13 && z <= 2) return true;
  if (z >= 13 && Math.abs(x) <= 5) return true;
  if (z > -13 && z < 13 && Math.abs(x - Math.sin(z * 0.16)) <= 4.5) return true;
  return false;
}

export function validateCentralWorldPlacement(placement: CentralWorldPlacement, item: EconomyItem, placements: CentralWorldPlacement[], itemsById: Map<string, EconomyItem>) {
  const cells = occupiedCells(placement, item);
  for (const key of cells) {
    const [x, z] = key.split(":").map(Number);
    if (x < CENTRAL_WORLD_GRID.minX || x > CENTRAL_WORLD_GRID.maxX || z < CENTRAL_WORLD_GRID.minZ || z > CENTRAL_WORLD_GRID.maxZ || isProtectedCell(x, z)) return false;
  }
  const occupied = new Set<string>();
  for (const existing of placements) {
    const existingItem = itemsById.get(existing.itemId);
    if (existingItem) occupiedCells(existing, existingItem).forEach((cell) => occupied.add(cell));
  }
  return cells.every((cell) => !occupied.has(cell));
}

export function readCentralWorldPlacements(scope: string) {
  if (typeof window === "undefined") return [] as CentralWorldPlacement[];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(`${STORAGE_PREFIX}:${scope}`) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is CentralWorldPlacement => typeof entry?.itemId === "string" && Number.isInteger(entry?.gridX) && Number.isInteger(entry?.gridZ) && [0, 90, 180, 270].includes(entry?.rotation));
  } catch { return []; }
}

export function writeCentralWorldPlacements(scope: string, placements: CentralWorldPlacement[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(`${STORAGE_PREFIX}:${scope}`, JSON.stringify(placements));
}
