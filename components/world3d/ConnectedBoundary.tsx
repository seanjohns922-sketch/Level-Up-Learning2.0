"use client";
import { WORLD_ITEM_PRESENTATION } from "@/lib/world3d/world-item-presentation";
import { Box, Pole } from "./DetailedScenery";
import { Rope } from "./CollectionScenery";
import { Wall } from "./FortressScenery";
import { boundaryDirections } from "@/lib/world3d/world-connections";
import type { CentralWorldPlacement } from "@/lib/world3d/central-world-layout";
export function ConnectedBoundary({assetKey,placement,neighbours}:{assetKey:string;placement:CentralWorldPlacement;neighbours:CentralWorldPlacement[]}){
 const directions=boundaryDirections(placement,neighbours);
 const tint=placement.tint,stone=assetKey==="stone_wall",castle=assetKey==="castle_wall",rope=assetKey==="rope_fence",picket=assetKey==="picket_fence";
 const targetHeight=WORLD_ITEM_PRESENTATION[assetKey]?.height??1.6;
 const height=castle?targetHeight-.39:targetHeight;
 return <group rotation={[0,-placement.rotation*Math.PI/180,0]} scale={[1,stone||castle?1:targetHeight/1.14,1]}>
  {stone||castle?<Box p={[0,height/2,0]} s={[.35,height,.35]} c={tint??"#a59c85"}/>:<Box p={[0,.57,0]} s={[.12,1.14,.12]} c={tint??"#96744e"}/>}
  {directions.map(([x,z])=><group key={x+":"+z} rotation={[0,Math.atan2(-z,x),0]}>
   {stone||castle?<group position={[.5,0,0]}><Wall width={1} height={height} depth={castle?1.35:.6} battlements={castle} tint={tint}/></group>:
    <group>
     <Box p={[1,.57,0]} s={[.07,1.14,.1]} c={tint??"#96744e"}/>
     {rope?[.4,.85].map(y=><Rope key={y} a={[0,y,0]} b={[1,y,0]}/>):[.35,.8].map(y=><Box key={y} p={[.5,y,0]} s={[1,.1,.075]} c={tint??(picket?"#d4cbb3":"#96744e")}/>)}
     {picket&&[.2,.4,.6,.8].map(v=><group key={v}><Box p={[v,.51,0]} s={[.11,.95,.05]} c={tint??"#d4cbb3"}/><Pole a={[v,.98,0]} b={[v,1.07,0]} radius={.055} c={tint??"#d4cbb3"}/></group>)}
    </group>}
  </group>)}
 </group>;
}
