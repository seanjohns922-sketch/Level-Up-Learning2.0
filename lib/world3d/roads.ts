// Smart roads: from the road squares a learner paints, where the kerbs, edge lines and centre dashes go.
// Kerbs and a white edge line run wherever road meets something else; a two-lane road (exactly two
// squares across) gets a dashed centre line down the middle. Pure, so it can be tested.
import type { CentralWorldGroundTile } from "./central-world-layout";

/** A strip on the ground: its centre (world metres) and whether it runs along x (else along z). */
export type RoadStrip = { x: number; z: number; alongX: boolean };
export type RoadPieces = { squares: Array<{ x: number; z: number }>; kerbs: RoadStrip[]; edgeLines: RoadStrip[]; dashes: RoadStrip[] };

const SIDES = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;
export const KERB_INSET = 0.12;
export const EDGE_LINE_INSET = 0.36;

export function roadPieces(tiles: readonly CentralWorldGroundTile[], cell: number): RoadPieces {
  const roads = tiles.filter((tile) => tile.tileType === "road");
  const set = new Set(roads.map((t) => `${t.gridX}:${t.gridZ}`));
  const has = (x: number, z: number) => set.has(`${x}:${z}`);
  const pieces: RoadPieces = { squares: [], kerbs: [], edgeLines: [], dashes: [] };
  for (const { gridX, gridZ } of roads) {
    const x = gridX * cell, z = gridZ * cell;
    pieces.squares.push({ x, z });
    for (const [dx, dz] of SIDES) {
      const alongX = dx === 0;
      if (!has(gridX + dx, gridZ + dz)) {
        pieces.kerbs.push({ x: x + dx * (cell / 2 - KERB_INSET), z: z + dz * (cell / 2 - KERB_INSET), alongX });
        pieces.edgeLines.push({ x: x + dx * (cell / 2 - EDGE_LINE_INSET), z: z + dz * (cell / 2 - EDGE_LINE_INSET), alongX });
        continue;
      }
      // The shared edge of a road exactly two squares across is its middle. Draw it once, from the
      // square on the -x / -z side, as two dashes per square.
      const twoLane = !has(gridX - dx, gridZ - dz) && !has(gridX + 2 * dx, gridZ + 2 * dz);
      if (!twoLane || dx + dz < 0) continue;
      for (const t of [-0.25, 0.25]) {
        pieces.dashes.push(alongX ? { x: x + t * cell, z: z + dz * cell / 2, alongX } : { x: x + dx * cell / 2, z: z + t * cell, alongX });
      }
    }
  }
  return pieces;
}
