"use client";
import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CENTRAL_WORLD_CUSTOMISATION_CATALOG as items } from "@/lib/world3d/central-world-customisation-catalog";
import { RewardPlotObject } from "./CentralWorldEnvironment";
import { SceneryFinish } from "./DetailedScenery";
import { SizedWorldModel, type ModelMeasurement } from "./SizedWorldModel";
import type { EconomyItem } from "@/lib/economy";
type Exported = { key: string; name: string; png: string };
function Product({item,onReady}:{item:EconomyItem;onReady:(row:Exported)=>void}) {
 const {camera,gl,scene}=useThree(),sent=useRef(false);
 const [measurement,setMeasurement]=useState<ModelMeasurement|null>(null);
 const measure=useCallback((value:ModelMeasurement)=>setMeasurement(value),[]);
 useLayoutEffect(()=>{
  if(!measurement)return;
  const [w,h,d]=measurement.size,centre=new THREE.Vector3(0,h/2,0),extent=Math.max(w,h,d);
  camera.position.copy(centre).add(new THREE.Vector3(.9,.65,1).normalize().multiplyScalar(extent*3));camera.lookAt(centre);camera.updateMatrixWorld();
  const inverse=camera.quaternion.clone().invert();let half=0;
  for(const x of [-w/2,w/2])for(const y of [-h/2,h/2])for(const z of [-d/2,d/2]){const p=new THREE.Vector3(x,y,z).applyQuaternion(inverse);half=Math.max(half,Math.abs(p.y),Math.abs(p.x)/1.25);}
  // R3F owns this mutable Three camera; fitting its frustum is an imperative scene update.
  // eslint-disable-next-line react-hooks/immutability
  const ortho=camera as THREE.OrthographicCamera;half*=1.14;ortho.top=half;ortho.bottom=-half;ortho.left=-half*1.25;ortho.right=half*1.25;ortho.updateProjectionMatrix();

 },[measurement,camera]);
 useEffect(()=>{
  if(!measurement)return;
  const timer=setTimeout(()=>{if(sent.current)return;gl.render(scene,camera);sent.current=true;onReady({key:String(item.metadata.worldAssetKey),name:item.name,png:gl.domElement.toDataURL("image/png")});},650);
  return ()=>clearTimeout(timer);
 },[measurement,gl,scene,camera,item,onReady]);
 const extent=measurement?Math.max(...measurement.size):20;
 return <>
  <color attach="background" args={["#e9e6dc"]}/><ambientLight intensity={.9}/><hemisphereLight args={["#e7f1ff","#908772",1.4]}/>
  <directionalLight position={[-extent,extent*2,extent*1.5]} intensity={2.3} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-extent} shadow-camera-right={extent} shadow-camera-top={extent} shadow-camera-bottom={-extent} shadow-camera-far={extent*6} shadow-normalBias={.035}/>
  <directionalLight position={[extent,extent*.7,-extent]} intensity={.7} color="#d5eaff"/>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.015,0]} receiveShadow><planeGeometry args={[1000,1000]}/><meshStandardMaterial color="#e9e6dc" roughness={1}/></mesh>
  <SizedWorldModel item={item} onMeasured={measure}><SceneryFinish assetKey={String(item.metadata.worldAssetKey)}><RewardPlotObject item={item} tier={Number(item.metadata.tier??1)} accent={item.accent}/></SceneryFinish></SizedWorldModel>
 </>;
}
export default function MarketplaceArtReview(){
 const [rows,setRows]=useState<Exported[]>([]),[running,setRunning]=useState(false);
 const capture=useCallback((row:Exported)=>setRows(previous=>previous.some(r=>r.key===row.key)?previous:[...previous,row]),[]);
 const current=items[rows.length];
 return <main style={{padding:24,background:"#f5f2e9",color:"#263a32",minHeight:"100vh"}}>
  <h1>World shop photography</h1><p>Renders the actual placeable models with consistent lighting and framing.</p>
  <button onClick={()=>{setRows([]);setRunning(true);}}>Render all shop images</button>
  <p role="status">{rows.length} / {items.length} captured {running&&current?`· ${current.name}`:""}</p>
  {running&&current&&<div style={{width:800,height:640}}><Canvas orthographic dpr={1} shadows gl={{antialias:true,preserveDrawingBuffer:true}} camera={{near:.1,far:2000,position:[20,15,24]}}><Suspense fallback={null}><Product key={current.item_key} item={current} onReady={capture}/></Suspense></Canvas></div>}
  {rows.length===items.length&&<button onClick={()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(rows)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="reliq-world-shop-renders.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}>Download shop images</button>}
 </main>;
}
