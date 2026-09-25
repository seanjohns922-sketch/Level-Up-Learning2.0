import type { CentralWorldGroundTile } from "./central-world-layout";
import { buildOrganicPath } from "./organic-path";

/** Reuse the curved union mesher with a wider radius, filling dense lake interiors.
 * Other painted surfaces remain cut-outs, including islands and paths. */
export function buildWorldWater(tiles: CentralWorldGroundTile[]) {
  return buildOrganicPath(tiles.map(tile => ({
    ...tile, tileType: tile.tileType === "water" ? "path" : "stone",
  })), 1.5);
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
