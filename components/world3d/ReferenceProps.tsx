"use client";
import { useMemo, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box, Ball, Pole, Ring } from "./DetailedScenery";

const timber="#92704c",metal="#414d46",cream="#ded3b5";
function Cloth({color,width=1,height=.6}:{color:string;width?:number;height?:number}){
 const geometry=useMemo(()=>{
  const g=new THREE.PlaneGeometry(width,height,16,8),p=g.getAttribute("position");
  for(let i=0;i<p.count;i++){const x=p.getX(i)+width/2;p.setZ(i,Math.sin(x*8)*.06*(x/width));}
  g.computeVertexNormals();return g;
 },[width,height]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry} castShadow><meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={.94}/></mesh>;
}
export const REFERENCE_PROP_KEYS=new Set(["toadstool","log","fence","mailbox","flag","umbrella","signpost","balloons","castle_banner","torch","chest"]);
export function ReferenceProp({assetKey,tint}:{assetKey:string;tint?:string}){
 if(assetKey==="fence")return <group>{[-.92,.92].map(x=><group key={x}><Box p={[x,.55,0]} s={[.14,1.1,.14]}/><mesh position={[x,1.14,0]} rotation={[0,Math.PI/4,0]}><coneGeometry args={[.11,.12,4]}/><meshStandardMaterial color={timber}/></mesh></group>)}{[.35,.8].map(y=><Box key={y} p={[0,y,0]} s={[1.9,.12,.08]} c={tint??timber}/>)}{[-.92,.92].flatMap(x=>[.35,.8].map(y=><Ball key={`${x}-${y}`} p={[x,y,.083]} s={[.025,.025,.008]} c={metal}/>))}</group>;
 if(assetKey==="toadstool")return <group>{[0,1,2].map(i=><group key={i} position={[(i-1)*.25,0,i%2*.2]} scale={i===1?1:.6}><Pole a={[0,0,0]} b={[.02,.4,0]} radius={.065} c={cream}/><mesh position={[.02,.4,0]} scale={[1,.38,1]}><sphereGeometry args={[.3,24,12,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color={tint??"#b4664e"} roughness={.85} side={THREE.DoubleSide}/></mesh><Ring p={[.02,.4,0]} radius={.27} tube={.014} c="#d9c8a6"/>{Array.from({length:7},(_,j)=><Ball key={j} p={[.02+Math.cos(j*2.4)*.17,.48,Math.sin(j*2.4)*.17]} s={[.027,.012,.025]} c={cream}/>)}</group>)}</group>;
 if(assetKey==="log")return <group><Pole a={[-.85,.24,0]} b={[.85,.24,0]} radius={.24} c="#755439"/>{[-1,1].map(side=><group key={side} position={[side*.86,.24,0]} rotation={[0,0,Math.PI/2]}><mesh><cylinderGeometry args={[.215,.215,.02,20]}/><meshStandardMaterial color="#bea277"/></mesh>{[.055,.105,.16,.205].map(radius=><Ring key={radius} p={[0,side*.015,0]} radius={radius} tube={.005} c="#8d714f"/>)}</group>)}<Pole a={[-.2,.3,0]} b={[-.35,.62,.25]} radius={.065}/>{Array.from({length:10},(_,i)=>{const a=i*Math.PI/5;return <Pole key={i} a={[-.8,.24+Math.cos(a)*.22,Math.sin(a)*.22]} b={[.8,.24+Math.cos(a)*.21,Math.sin(a)*.21]} radius={.016} c={i%2?"#957150":"#59452e"}/>;})}</group>;
 if(assetKey==="mailbox")return <group><Box p={[0,.52,0]} s={[.09,1.04,.09]}/><Box p={[0,.93,0]} s={[.44,.32,.56]} c={tint??"#7c8773"}/><mesh position={[0,1.09,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.22,.22,.56,24,1,false,0,Math.PI]}/><meshStandardMaterial color={tint??"#7c8773"} side={THREE.DoubleSide}/></mesh><Box p={[0,1.02,.29]} s={[.29,.025,.025]} c="#323d36"/><Box p={[0,.89,.3]} s={[.16,.065,.01]} c={cream}/><Pole a={[.235,.97,0]} b={[.235,1.3,0]} radius={.012} c="#b0714e"/><Box p={[.235,1.28,.06]} s={[.025,.09,.13]} c="#b0714e"/></group>;
 if(assetKey==="flag"||assetKey==="castle_banner")return <group><Box p={[0,.055,0]} s={[.3,.11,.3]} c="#8f917c"/><Pole a={[0,0,0]} b={[0,2.65,0]} radius={.025} c={metal}/><Ball p={[0,2.68,0]} s={[.055,.055,.055]} c="#bc9e60"/>{assetKey==="flag"?<group position={[.52,2.18,0]}><Cloth color={tint??"#607d81"}/></group>:<group><Pole a={[-.44,2.47,0]} b={[.44,2.47,0]} radius={.022}/><group position={[0,1.85,0]}><Cloth color={tint??"#445f68"} width={.72} height={1.16}/></group><mesh position={[0,1.9,.08]}><ringGeometry args={[.12,.15,6]}/><meshStandardMaterial color="#b89c63"/></mesh></group>}</group>;
 if(assetKey==="umbrella")return <group><Box p={[0,.05,0]} s={[.45,.1,.45]} c="#8a8a79"/><Pole a={[0,0,0]} b={[0,2.3,0]} radius={.026} c={timber}/>{Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return <group key={i}><mesh position={[0,1.98,0]}><coneGeometry args={[1.1,.5,1,1,true,a,Math.PI/6]}/><meshStandardMaterial color={i%2?cream:tint??"#8a9a7e"} roughness={.95} side={THREE.DoubleSide}/></mesh><Pole a={[0,2.24,0]} b={[Math.sin(a)*1.1,1.73,Math.cos(a)*1.1]} radius={.012} c="#ae9470"/></group>;})}<Ball p={[0,2.29,0]} s={[.06,.07,.06]} c={timber}/></group>;
 if(assetKey==="signpost")return <group><Box p={[0,.72,0]} s={[.1,1.44,.1]}/><Box p={[.12,1.25,0]} s={[.84,.25,.07]} c={tint??timber}/><Box p={[-.1,.94,0]} s={[.78,.22,.07]} c={tint??"#9c8056"}/>{[.94,1.25].map(y=><Ball key={y} p={[0,y,.046]} s={[.021,.021,.008]} c={metal}/>)}<Pole a={[-.2,1.26,.045]} b={[.31,1.26,.045]} radius={.012} c={cream}/><Pole a={[.31,1.26,.045]} b={[.2,1.33,.045]} radius={.012} c={cream}/></group>;
 if(assetKey==="balloons")return <group><Box p={[0,.04,0]} s={[.2,.08,.2]} c="#9a8461"/>{[-1,0,1].map((i)=><group key={i}><Pole a={[0,.05,0]} b={[i*.28,1.4+Math.abs(i)*.14,0]} radius={.007} c="#d2c5a2"/><Ball p={[i*.28,1.7+Math.abs(i)*.14,0]} s={[.23,.29,.23]} c={tint??["#b68066","#839681","#c7ad71"][i+1]}/><mesh position={[i*.28,1.41+Math.abs(i)*.14,0]}><coneGeometry args={[.035,.065,8]}/><meshStandardMaterial color={tint??"#bba478"}/></mesh></group>)}</group>;
 if(assetKey==="torch")return <group><Pole a={[0,0,0]} b={[0,1.35,0]} radius={.045} c={timber}/>{[1.18,1.3].map(y=><Ring key={y} p={[0,y,0]} radius={.1} tube={.035} c={metal}/>)}{[0,1,2].map(i=><mesh key={i} position={[(i-1)*.04,1.47+i*.04,0]} scale={[1,2,1]} rotation={[0,0,(i-1)*.12]}><sphereGeometry args={[.07,10,8]}/><meshStandardMaterial color={i===1?"#e4c788":tint??"#c68b40"} emissive="#cd842e" emissiveIntensity={.6}/></mesh>)}</group>;
 if(assetKey==="chest")return <group>{Array.from({length:6},(_,i)=><Box key={i} p={[(i-2.5)*.16,.27,0]} s={[.15,.5,.58]} c={tint??timber}/>)}<mesh position={[0,.51,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.29,.29,.96,24,1,false,0,Math.PI]}/><meshStandardMaterial color={tint??"#805d3e"}/></mesh>{[-.32,.32].map(x=><group key={x}><Box p={[x,.3,.3]} s={[.065,.56,.025]} c={metal}/><Box p={[x,.3,-.3]} s={[.065,.56,.025]} c={metal}/>{[.12,.44].map(y=><Ball key={y} p={[x,y,.32]} s={[.025,.025,.01]} c="#baa471"/>)}</group>)}<Box p={[0,.42,.32]} s={[.14,.18,.045]} c="#b49a61"/><Ball p={[0,.43,.348]} s={[.018,.025,.01]} c={metal}/></group>;
 return null;
}

export function DrawbridgeChains({deckRef}:{deckRef?: React.RefObject<THREE.Group|null>}){
 const ref=useRef<THREE.InstancedMesh>(null),last=useRef(Number.NaN);
 const write=useCallback((angle:number)=>{
  if(!ref.current)return;
  const dummy=new THREE.Object3D();let index=0;
  for(const side of [-1,1]){
   const start=new THREE.Vector3(side*.95,2.75,-.35);
   const end=new THREE.Vector3(side*.95,.72-Math.sin(angle)*3.3,.05+Math.cos(angle)*3.3);
   const orientation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),end.clone().sub(start).normalize());
   for(let i=0;i<20;i++){dummy.position.copy(start).lerp(end,i/19);dummy.position.y-=Math.sin(i/19*Math.PI)*.07;dummy.quaternion.copy(orientation);dummy.rotateY(i%2*Math.PI/2);dummy.scale.set(.7,1,1);dummy.updateMatrix();ref.current.setMatrixAt(index++,dummy.matrix);}
  }
  ref.current.instanceMatrix.needsUpdate=true;last.current=angle;
 },[]);
 useLayoutEffect(()=>{write(0);},[write]);
 useFrame(()=>{const angle=deckRef?.current?.rotation.x??0;if(Math.abs(angle-last.current)>.0001)write(angle);});
 return <instancedMesh ref={ref} args={[undefined,undefined,40]} castShadow frustumCulled={false}><torusGeometry args={[.067,.012,5,10]}/><meshStandardMaterial color="#53594c" metalness={.45} roughness={.7}/></instancedMesh>;
}
