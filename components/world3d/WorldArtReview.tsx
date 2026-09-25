"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { useState } from "react";
import { CENTRAL_WORLD_STARTER_SCENERY } from "@/lib/world3d/central-world-editor-catalog";
import { CENTRAL_WORLD_CUSTOMISATION_CATALOG } from "@/lib/world3d/central-world-customisation-catalog";
import { getItemPresentation } from "@/lib/world3d/world-item-presentation";
import { RewardPlotObject } from "./CentralWorldEnvironment";
import { SizedWorldModel } from "./SizedWorldModel";
import { SceneryFinish, Box, Ball } from "./DetailedScenery";
import { WorldWater } from "./WorldWater";
import { OrganicPaths } from "./OrganicPaths";
const groups = ["trees_plants","rocks_water","furniture_fun","animals","fortress","rewards","water"];
const waterExamples = [
 ...Array.from({length:15},(_,i)=>({gridX:-9+Math.round(Math.sin(i*.45)),gridZ:i-7,tileType:"water" as const})),
 ...Array.from({length:7},(_,x)=>Array.from({length:7},(_,z)=>({gridX:x-3,gridZ:z-3,tileType:"water" as const}))).flat(),
 ...Array.from({length:9},(_,x)=>Array.from({length:9},(_,z)=>({gridX:x+6,gridZ:z-4,tileType:"water" as const}))).flat().filter(t=>t.gridX<=7||t.gridX>=13||Math.abs(t.gridZ)>=3),
];
export default function WorldArtReview() {
 const [category,setCategory]=useState("trees_plants"),[selection,setSelection]=useState("");
 const items=category==="rewards"?CENTRAL_WORLD_CUSTOMISATION_CATALOG:CENTRAL_WORLD_STARTER_SCENERY.filter(i=>i.metadata.worldSceneryGroup===category);
 const selected=items.find(i=>i.item_key===selection),shown=selected?[selected]:items;
 const height=selected?getItemPresentation(selected).height:0,distance=Math.max(7,height*2.1);
 return <main style={{height:"100dvh",background:"#cad1bf",color:"#23372b"}}>
  <div style={{position:"absolute",zIndex:2,padding:16,background:"#f2eddf",borderRadius:12,margin:12,maxWidth:"calc(100% - 24px)"}}>
   <b>World scenery · {CENTRAL_WORLD_STARTER_SCENERY.length} free items · {CENTRAL_WORLD_CUSTOMISATION_CATALOG.length} Australian rewards</b>
   <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:8}}>{groups.map(g=><button key={g} onClick={()=>{setCategory(g);setSelection("");}} style={{padding:8,background:category===g?"#526e58":"#e1dccd",color:category===g?"white":"#23372b",border:0,borderRadius:6}}>{g.replaceAll("_"," ")}</button>)}</div>
   <select aria-label="Inspect an item" value={selection} onChange={e=>setSelection(e.target.value)} style={{padding:8,marginTop:8,width:"100%",background:"#fffaf0",border:"1px solid #a8ad98",borderRadius:6}}><option value="">View category together</option>{items.map(item=><option key={item.item_key} value={item.item_key}>{item.name}</option>)}</select>
   <div style={{marginTop:6,fontSize:12}}>{selected?"Grid: 2 m squares · figure: avatar height · drag to orbit":"Choose an item for a close look · drag to orbit · scroll to zoom"}</div>
  </div>
  <Canvas key={selection} shadows camera={{position:selected?[distance*.75,distance*.55,distance]:[28,34,46],fov:42}}>
   <color attach="background" args={["#cad1bf"]}/><ambientLight intensity={.85}/><directionalLight position={[8,20,12]} intensity={1.85} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-28} shadow-camera-right={28} shadow-camera-top={28} shadow-camera-bottom={-28} shadow-bias={-.0001}/>
   <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[100,100]}/><meshStandardMaterial color="#7d8e64" roughness={1}/></mesh>
   {category==="water"?<WorldWater tiles={waterExamples}/>:selected?<group><gridHelper position={[0,.012,0]} args={[24,12,"#9ea68b","#8c9877"]}/><group position={[-3,0,0]}><Box p={[0,1.15,0]} s={[.65,.8,.32]} c="#757d6c"/><Ball p={[0,1.93,0]} s={[.25,.27,.24]} c="#a6ab96"/>{[-1,1].map(side=><group key={side}><Box p={[side*.2,.4,0]} s={[.22,.8,.27]} c="#626f60"/><Box p={[side*.45,1.1,0]} s={[.18,.8,.22]} c="#757d6c"/></group>)}<Html center position={[0,2.6,0]} style={{whiteSpace:"nowrap",fontSize:11}}>Avatar height</Html></group></group>:<OrganicPaths tiles={Array.from({length:18},(_,i)=>({gridX:i-9,gridZ:7+Math.round(Math.sin(i*.35)),tileType:"path" as const}))}/>}
   {shown.map((item,i)=><group key={item.item_key} position={selected?[0,0,0]:[(i%5-2)*10,0,(Math.floor(i/5)-1)*12]}>
    <SizedWorldModel item={item}><SceneryFinish assetKey={String(item.metadata.worldAssetKey)}><RewardPlotObject item={item} accent={item.accent} tier={Number(item.metadata.tier??1)}/></SceneryFinish></SizedWorldModel>
    {!selected&&<Html center position={[0,.15,3]}><button onClick={()=>setSelection(item.item_key)} style={{whiteSpace:"nowrap",fontSize:11,background:"#f3eedde8",padding:"4px 7px",borderRadius:4,border:0,color:"#263f2d",cursor:"pointer"}}>{item.name}</button></Html>}
   </group>)}
   <OrbitControls target={selected?[0,Math.max(.5,height*.38),0]:[0,0,3]} maxPolarAngle={Math.PI/2.1}/>
  </Canvas>
 </main>;
}
