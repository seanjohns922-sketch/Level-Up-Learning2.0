// Swimming: every bit of water in the hub is deep enough to swim in. Painted water and placed
// Swimming Lakes are dug out under the grass; walking in, the explorer sinks gently from a paddle at
// the edge to floating with the water at their shoulders. Pure, so it can be tested. Units are metres.
import type { EconomyItem } from "@/lib/economy";
import { placementCentre, type CentralWorldGroundTile, type CentralWorldPlacement } from "./central-world-layout";
import { premiumHomeStyle } from "./premium-homes";
import { sampleOrganicField, type OrganicField } from "./organic-path";
import { buildWaterField } from "./world-water";

/** The water surface in painted water and lakes, a little under the grass. */
export const SWIM_SURFACE_Y = -0.18;
/** The dug-out bed under painted water and lakes. */
export const SWIM_BED_Y = -1.9;
/** How far a floating explorer's feet hang under the surface: the water reaches their shoulders. */
export const SWIM_FLOAT_DEPTH = 1.3;
/** How far in from the bank the water takes to get that deep. */
export const SWIM_SHELVE = 1.2;
/** Swimming is slower than walking. */
export const SWIM_SPEED = 0.55;
/** Water deeper than this (under the surface, at the feet) counts as swimming rather than paddling. */
export const SWIM_FROM_DEPTH = 0.6;
/** The Swimming Lake's water: an oval this many metres across (x) and deep (z) before rotation. */
export const LAKE_WATER_SIZE: readonly [number, number] = [15, 10];

export type WaterOval = { x: number; z: number; rx: number; rz: number };
/** Painted water (the same shape as its drawn surface) and each placed lake's oval. */
export type WaterAreas = { painted: OrganicField | null; ovals: readonly WaterOval[] };

type PlacedLake = { x: number; z: number; rotation: number };
/** A placed Swimming Lake's water, turned with the lake. */
export function lakeOval({ x, z, rotation }: PlacedLake): WaterOval {
  const turned = rotation % 180 !== 0, [w, d] = LAKE_WATER_SIZE;
  return { x, z, rx: (turned ? d : w) / 2, rz: (turned ? w : d) / 2 };
}

/** The painted water, plus each placed Swimming Lake's oval. */
export function buildWaterAreas(tiles: CentralWorldGroundTile[], lakes: readonly PlacedLake[] = []): WaterAreas {
  return { painted: tiles.some((tile) => tile.tileType === "water") ? buildWaterField(tiles) : null, ovals: lakes.map(lakeOval) };
}

/** Metres from (x, z) in to the bank of an oval lake; 0 outside it. */
function distanceInsideOval({ x: cx, z: cz, rx, rz }: WaterOval, x: number, z: number) {
  const r = Math.hypot((x - cx) / rx, (z - cz) / rz);
  return r >= 1 ? 0 : (1 - r) * Math.min(rx, rz);
}

/** How far in from the bank a spot is (0 on dry land). */
export function waterReach(areas: WaterAreas, x: number, z: number) {
  let reach = areas.painted ? Math.max(0, sampleOrganicField(areas.painted, x, z)) : 0;
  for (const oval of areas.ovals) reach = Math.max(reach, distanceInsideOval(oval, x, z));
  return reach;
}

/** Where the explorer's feet sit in the water at a spot, or null on dry land: shelving in from the bank. */
export function swimFeetY(areas: WaterAreas, x: number, z: number): number | null {
  const reach = waterReach(areas, x, z);
  if (reach <= 0) return null;
  return SWIM_SURFACE_Y - SWIM_FLOAT_DEPTH * Math.min(1, reach / SWIM_SHELVE);
}

/** Wraps a ground-height function so explorers sink into the water instead of walking across it. */
export function withSwimming(areas: WaterAreas, ground: (x: number, z: number) => number) {
  if (!areas.painted && !areas.ovals.length) return ground;
  return (x: number, z: number) => {
    const feet = swimFeetY(areas, x, z), land = ground(x, z);
    return feet === null ? land : Math.min(land, feet);
  };
}

/** The water's surface at a spot when the explorer is swimming there (deep enough), else null. */
export function swimSurfaceAt(areas: WaterAreas, x: number, z: number): number | null {
  const feet = swimFeetY(areas, x, z);
  return feet !== null && SWIM_SURFACE_Y - feet > SWIM_FROM_DEPTH ? SWIM_SURFACE_Y : null;
}

/** Where each placed Swimming Lake's water is: its centre and turn. */
export function placedLakes(placements: readonly CentralWorldPlacement[], itemsById: ReadonlyMap<string, EconomyItem>): PlacedLake[] {
  return placements.flatMap((placement) => {
    const item = itemsById.get(placement.itemId);
    if (!item || premiumHomeStyle(item.metadata.worldAssetKey) !== "swimming_lake") return [];
    const [x, , z] = placementCentre(placement, item);
    return [{ x, z, rotation: placement.rotation }];
  });
}
