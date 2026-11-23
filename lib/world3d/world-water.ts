import type { CentralWorldGroundTile } from "./central-world-layout";
import { buildOrganicField, buildOrganicPath } from "./organic-path";

const WATER_RADIUS = 1.5;
/** Water strokes are meshed like paths; every other painted surface is a cut-out (islands, paths). */
const asStrokes = (tiles: CentralWorldGroundTile[]) => tiles.map(tile => ({ ...tile, tileType: tile.tileType === "water" ? "path" as const : "stone" as const }));

/** Reuse the curved union mesher with a wider radius, filling dense lake interiors.
 * Other painted surfaces remain cut-outs, including islands and paths. */
export function buildWorldWater(tiles: CentralWorldGroundTile[]) {
  return buildOrganicPath(asStrokes(tiles), WATER_RADIUS);
}

/** The same shape as the water's surface, as distances in from its bank (for swimming depth). */
export function buildWaterField(tiles: CentralWorldGroundTile[]) {
  return buildOrganicField(asStrokes(tiles), WATER_RADIUS);
}

export function waterBrushCells(gridX:number, gridZ:number, width:number) {
  const radius=width===5?2:width===3?1:0;
  const cells:{gridX:number;gridZ:number}[]=[];
  for(let z=-radius;z<=radius;z++)for(let x=-radius;x<=radius;x++){
    if(radius===2&&x*x+z*z>5)continue;
    cells.push({gridX:gridX+x,gridZ:gridZ+z});
  }
  return cells;
}
