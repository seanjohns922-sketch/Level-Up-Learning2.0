"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { useState, useCallback } from "react";
import { CENTRAL_WORLD_STARTER_SCENERY } from "@/lib/world3d/central-world-editor-catalog";
import { CENTRAL_WORLD_CUSTOMISATION_CATALOG } from "@/lib/world3d/central-world-customisation-catalog";
import { parseGridSize } from "@/lib/world3d/central-world-layout";
import { getItemPresentation } from "@/lib/world3d/world-item-presentation";
import { RewardPlotObject } from "./CentralWorldEnvironment";
import { SizedWorldModel, type ModelMeasurement } from "./SizedWorldModel";
import { SceneryFinish, Box, Ball } from "./DetailedScenery";
import { WorldWater } from "./WorldWater";
import { OrganicPaths } from "./OrganicPaths";
const allItems=[...CENTRAL_WORLD_STARTER_SCENERY,...CENTRAL_WORLD_CUSTOMISATION_CATALOG];
const groups = ["trees_plants","rocks_water","furniture_fun","animals","fortress","rewards","water","scale comparison"];
const waterExamples = [
 ...Array.from({length:15},(_,i)=>({gridX:-9+Math.round(Math.sin(i*.45)),gridZ:i-7,tileType:"water" as const})),
 ...Array.from({length:7},(_,x)=>Array.from({length:7},(_,z)=>({gridX:x-3,gridZ:z-3,tileType:"water" as const}))).flat(),
 ...Array.from({length:9},(_,x)=>Array.from({length:9},(_,z)=>({gridX:x+6,gridZ:z-4,tileType:"water" as const}))).flat().filter(t=>t.gridX<=7||t.gridX>=13||Math.abs(t.gridZ)>=3),
];
export default function WorldArtReview() {
 const [audit,setAudit]=useState(false),[measurements,setMeasurements]=useState<ModelMeasurement[]>([]);
 const onMeasured=useCallback((measurement:ModelMeasurement)=>{setTimeout(()=>setMeasurements(previous=>previous.some(row=>row.key===measurement.key)?previous:[...previous,measurement]),50);},[]);
 const [category,setCategory]=useState("trees_plants"),[selection,setSelection]=useState("");
 const comparison=category==="scale comparison";
 const comparisonKeys=["sports_stadium","backyard_pool","water_park","birch_tree","clubhouse"];
 const items=comparison?comparisonKeys.map(key=>allItems.find(i=>i.metadata.worldAssetKey===key)!):category==="rewards"?CENTRAL_WORLD_CUSTOMISATION_CATALOG:CENTRAL_WORLD_STARTER_SCENERY.filter(i=>i.metadata.worldSceneryGroup===category);
 const selected=audit?allItems[measurements.length]:items.find(i=>i.item_key===selection),shown=audit?(selected?[selected]:[]):selected?[selected]:items;
 const height=selected?getItemPresentation(selected).height:0,distance=Math.max(7,height*2.1,selected?Math.max(...parseGridSize(selected))*3:0);
 const comparisonPositions:[number,number,number][]=[[0,0,0],[43,0,15],[47,0,-12],[-42,0,0],[44,0,32]];
 const spacing=Math.max(10,...items.map(item=>Math.max(...parseGridSize(item))*2+4));
 const galleryDistance=Math.max(46,spacing*4.7);
 return <main style={{height:"100dvh",background:"#cad1bf",color:"#23372b"}}>
  <div style={{position:"absolute",zIndex:2,padding:16,background:"#f2eddf",borderRadius:12,margin:12,maxWidth:"calc(100% - 24px)"}}>
   <button onClick={()=>{setMeasurements([]);setAudit(!audit);}} style={{padding:8,marginRight:12}}>{audit?"Close size audit":"Measure all 122 models"}</button>
   {audit&&<div style={{maxHeight:300,overflow:"auto"}}><b>Measured {measurements.length} / {allItems.length} actual models</b><button onClick={()=>{const blob=new Blob([JSON.stringify(measurements,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="world-item-measurements.json";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}>Download measurements</button><table><thead><tr><th>Item</th><th>Width × height × depth (m)</th><th>Reserved land (m)</th></tr></thead><tbody>{measurements.map(row=><tr key={row.key}><td>{row.name}</td><td>{row.size.map(v=>v.toFixed(2)).join(" × ")}</td><td>{row.footprint.join(" × ")}</td></tr>)}</tbody></table></div>}
   <b>World scenery · {CENTRAL_WORLD_STARTER_SCENERY.length} free items · {CENTRAL_WORLD_CUSTOMISATION_CATALOG.length} Australian rewards</b>
   <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:8}}>{groups.map(g=><button key={g} onClick={()=>{setCategory(g);setSelection("");}} style={{padding:8,background:category===g?"#526e58":"#e1dccd",color:category===g?"white":"#23372b",border:0,borderRadius:6}}>{g.replaceAll("_"," ")}</button>)}</div>
   <select aria-label="Inspect an item" value={selection} onChange={e=>setSelection(e.target.value)} style={{padding:8,marginTop:8,width:"100%",background:"#fffaf0",border:"1px solid #a8ad98",borderRadius:6}}><option value="">View category together</option>{items.map(item=><option key={item.item_key} value={item.item_key}>{item.name}</option>)}</select>
   <div style={{marginTop:6,fontSize:12}}>{selected?"Grid: 2 m squares · figure: avatar height · drag to orbit":"Choose an item for a close look · scale comparison uses one camera for all items"}</div>
  </div>
  <Canvas key={category+":"+selection} shadows camera={{position:selected?[distance*.75,distance*.55,distance]:comparison?[95,100,120]:[galleryDistance*.6,galleryDistance*.74,galleryDistance],fov:42}}>
   <color attach="background" args={["#cad1bf"]}/><ambientLight intensity={.85}/><directionalLight position={[8,20,12]} intensity={1.85} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-28} shadow-camera-right={28} shadow-camera-top={28} shadow-camera-bottom={-28} shadow-bias={-.0001}/>
   <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[600,600]}/><meshStandardMaterial color="#7d8e64" roughness={1}/></mesh>
   {category==="water"?<WorldWater tiles={waterExamples}/>:selected?<group><gridHelper position={[0,.012,0]} args={[24,12,"#9ea68b","#8c9877"]}/><group position={[-Math.max(3,parseGridSize(selected)[0]+2),0,0]}><Box p={[0,1.15,0]} s={[.65,.8,.32]} c="#757d6c"/><Ball p={[0,1.93,0]} s={[.25,.27,.24]} c="#a6ab96"/>{[-1,1].map(side=><group key={side}><Box p={[side*.2,.4,0]} s={[.22,.8,.27]} c="#626f60"/><Box p={[side*.45,1.1,0]} s={[.18,.8,.22]} c="#757d6c"/></group>)}<Html center position={[0,2.6,0]} style={{whiteSpace:"nowrap",fontSize:11}}>Avatar height</Html></group></group>:!comparison&&<OrganicPaths tiles={Array.from({length:18},(_,i)=>({gridX:i-9,gridZ:7+Math.round(Math.sin(i*.35)),tileType:"path" as const}))}/>}
   {shown.map((item,i)=><group key={item.item_key} position={selected?[0,0,0]:comparison?comparisonPositions[i]:[(i%5-2)*spacing,0,(Math.floor(i/5)-1)*spacing]}>
    <SizedWorldModel item={item} onMeasured={audit?onMeasured:undefined}><SceneryFinish assetKey={String(item.metadata.worldAssetKey)}><RewardPlotObject item={item} accent={item.accent} tier={Number(item.metadata.tier??1)}/></SceneryFinish></SizedWorldModel>
    {!selected&&<Html center position={[0,.15,3]}><button onClick={()=>setSelection(item.item_key)} style={{whiteSpace:"nowrap",fontSize:11,background:"#f3eedde8",padding:"4px 7px",borderRadius:4,border:0,color:"#263f2d",cursor:"pointer"}}>{item.name}</button></Html>}
   </group>)}
   <OrbitControls target={selected?[0,Math.max(.5,height*.38),0]:[0,0,3]} maxPolarAngle={Math.PI/2.1}/>
  </Canvas>
 </main>;
}
