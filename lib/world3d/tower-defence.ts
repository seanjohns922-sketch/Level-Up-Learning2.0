// Protect the Tower behaviour that isn't drawing: where the laser fence's beams run, so the explorer
// can't walk through them, and when the explorer is close enough for a defence to react. Pure, so tested.
import { boundaryDirections } from "./world-connections";
import { CENTRAL_WORLD_GRID, type CentralWorldPlacement } from "./central-world-layout";

/** A beam in world metres, from (x1, z1) to (x2, z2). */
export type FenceBeam = readonly [number, number, number, number];

/** Each fence cell's beams run half a cell towards every joined neighbour (or along its own line when alone). */
export function laserFenceBeams(fence: readonly CentralWorldPlacement[]): FenceBeam[] {
  const half = CENTRAL_WORLD_GRID.cellSize / 2;
  return fence.flatMap((placement) => {
    const x = placement.gridX * CENTRAL_WORLD_GRID.cellSize, z = placement.gridZ * CENTRAL_WORLD_GRID.cellSize;
    return boundaryDirections(placement, fence as CentralWorldPlacement[]).map(([dx, dz]): FenceBeam => [x, z, x + dx * half, z + dz * half]);
  });
}

function distanceToBeam(x: number, z: number, [x1, z1, x2, z2]: FenceBeam) {
  const dx = x2 - x1, dz = z2 - z1, lengthSq = dx * dx + dz * dz;
  const t = lengthSq ? Math.max(0, Math.min(1, ((x - x1) * dx + (z - z1) * dz) / lengthSq)) : 0;
  return Math.hypot(x - (x1 + t * dx), z - (z1 + t * dz));
}

/** The beam the explorer would walk into at (x, z), or null. `reach` is the explorer's half-width. */
export function laserFenceHit(x: number, z: number, beams: readonly FenceBeam[], reach = 0.6): FenceBeam | null {
  return beams.find((beam) => distanceToBeam(x, z, beam) < reach) ?? null;
}

/** How close the explorer must be for each defence to react, in metres. */
export const DEFENCE_REACT_DISTANCE = {
  laserGate: 3.5,
  scanner: 9,
  droneEscort: 9,
  guardDog: 5,
  patrolDrone: 10,
  sentryBot: 6,
} as const;

/** Trip wires catch the explorer anywhere inside their wire box (Levels 3 and 4 are square). */
export function insideTripWire(localX: number, localZ: number, square: boolean) {
  return Math.abs(localX) < 1.6 && Math.abs(localZ) < (square ? 1.6 : 0.45);
}
