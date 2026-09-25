"use client";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { CentralWorldEnvironment } from "./CentralWorldEnvironment";
import { WorldPanorama } from "./WorldPanorama";
import type { CentralWorldQuality } from "@/lib/world3d/central-world-config";

function Aim({angle}:{angle:number}){
 const {camera}=useThree();
 useEffect(()=>{const a=angle*Math.PI/180;camera.position.set(Math.sin(a)*.02,4,18+Math.cos(a)*.02);camera.lookAt(Math.sin(a)*100,8,18+Math.cos(a)*100);},[camera,angle]);
 return null;
}
export default function CentralPanoramaReview(){
 const [angle,setAngle]=useState(180),[quality,setQuality]=useState<CentralWorldQuality>("high"),[original,setOriginal]=useState(false);
 return <main style={{height:"100dvh",background:"#69afe4"}}>
  <div style={{position:"absolute",zIndex:2,top:12,left:12,padding:12,background:"#f3eedf",color:"#24382a",borderRadius:8,maxWidth:"calc(100% - 24px)"}}>
   <b>Central hub · stylised valley review</b><div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
   <button onClick={()=>setOriginal(!original)}>{original?"Show sharper stylised valley":"Compare original"}</button>
   <select aria-label="Panorama quality" value={quality} onChange={e=>setQuality(e.target.value as CentralWorldQuality)}><option value="high">High detail</option><option value="medium">Medium</option><option value="low">Lightweight</option></select>
   {[0,60,120,180,240,300].map(value=><button key={value} onClick={()=>setAngle(value)}>{value}°</button>)}
   <button onClick={()=>setAngle((angle+30)%360)}>Turn 30°</button></div>
   <p style={{margin:"8px 0 0",fontSize:12}}>{original?"Original 3584 px wrap":"Sharper stylised valley · six detailed sections"} · same camera and hub</p>
  </div>
  <Canvas camera={{position:[0,4,18],fov:60}} dpr={quality==="low"?1:[1,1.5]}>
   <color attach="background" args={["#69afe4"]}/><fog attach="fog" args={["#a8af8d",90,300]}/>
   <ambientLight intensity={.9}/><hemisphereLight args={["#c4def0","#697b43",1.3]}/><directionalLight position={[30,60,-40]} intensity={2.2}/>
   <Suspense fallback={null}><CentralWorldEnvironment quality={quality} entranceActive={false} homeActive={false}/>
   {original&&<group><WorldPanorama asset="/images/central-world-valley-panorama.png" radius={74} height={76} y={31} rotationY={Math.PI} follow/></group>}</Suspense>
   <Aim angle={angle}/>
  </Canvas>
 </main>;
}
