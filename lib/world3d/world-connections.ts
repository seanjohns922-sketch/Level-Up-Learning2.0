import type { CentralWorldPlacement } from "./central-world-layout";
export const CONNECTED_BOUNDARY_KEYS=new Set(["fence","picket_fence","rope_fence","stone_wall","castle_wall"]);
export type BoundaryDirection=[number,number];
export function boundaryDirections(placement:CentralWorldPlacement, neighbours:CentralWorldPlacement[]):BoundaryDirection[]{
 const directions:BoundaryDirection[]=[[1,0],[-1,0],[0,1],[0,-1]];
 const connected=directions.filter(([x,z])=>neighbours.some(other=>other.itemId===placement.itemId&&other.gridX===placement.gridX+x&&other.gridZ===placement.gridZ+z));
 if(!connected.length)return placement.rotation===90||placement.rotation===270?[[0,1],[0,-1]]:[[1,0],[-1,0]];
 if(connected.length===1)return [connected[0],[-connected[0][0],-connected[0][1]]];
 return connected;
}
/** Fill skipped pointer cells with a cardinal route, so even quick drags connect. */
export function gridStroke(from:{gridX:number;gridZ:number},to:{gridX:number;gridZ:number}){
 const cells:{gridX:number;gridZ:number}[]=[];
 let x=from.gridX,z=from.gridZ;
 const steps=Math.max(Math.abs(to.gridX-x),Math.abs(to.gridZ-z));
 for(let i=1;i<=steps;i++){
  const nx=Math.round(from.gridX+(to.gridX-from.gridX)*i/steps);
  const nz=Math.round(from.gridZ+(to.gridZ-from.gridZ)*i/steps);
  if(nx!==x){x=nx;cells.push({gridX:x,gridZ:z});}
  if(nz!==z){z=nz;cells.push({gridX:x,gridZ:z});}
 }
 return cells;
}

/** Session-independent IDs prevent a newly placed copy replacing a saved one. */
export function newWorldPlacementId(itemId:string){return itemId+"-"+crypto.randomUUID();}
