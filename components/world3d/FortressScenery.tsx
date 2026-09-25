"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { CASTLE_WALL_HEIGHT } from "@/lib/world3d/world-item-presentation";
import { Box, Pole, Roof } from "./DetailedScenery";
type Block={p:[number,number,number];s:[number,number,number];yaw?:number};
function Blocks({blocks,tint="#aaa18b"}:{blocks:Block[];tint?:string}){
 const ref=useRef<THREE.InstancedMesh>(null);
 useLayoutEffect(()=>{if(!ref.current)return;const dummy=new THREE.Object3D(),color=new THREE.Color();blocks.forEach((b,i)=>{dummy.position.set(...b.p);dummy.scale.set(...b.s);dummy.rotation.set(0,b.yaw??0,0);dummy.updateMatrix();ref.current!.setMatrixAt(i,dummy.matrix);ref.current!.setColorAt(i,color.set(tint).multiplyScalar(.84+((i*31)%17)/100));});ref.current.instanceMatrix.needsUpdate=true;if(ref.current.instanceColor)ref.current.instanceColor.needsUpdate=true;},[blocks,tint]);
 return <instancedMesh ref={ref} args={[undefined,undefined,blocks.length]} castShadow receiveShadow><boxGeometry args={[1,1,1]}/><meshStandardMaterial roughness={.98}/></instancedMesh>;
}
export function Wall({width=2,height=3,depth=.55,tint,battlements=true}:{width?:number;height?:number;depth?:number;tint?:string;battlements?:boolean}){
 const blocks=useMemo(()=>{const result:Block[]=[];const rows=Math.ceil(height/.27);for(let row=0;row<rows;row++){const cols=Math.ceil(width/.5),step=width/cols;for(let col=-1;col<cols;col++){const left=Math.max(-width/2,-width/2+step*(col+(row%2)*.5)),right=Math.min(width/2,-width/2+step*(col+1+(row%2)*.5));if(right-left>.02)result.push({p:[(left+right)/2,height/rows*(row+.5),0],s:[right-left-.012,height/rows-.016,depth]});}}return result;},[width,height,depth]);
 return <group><Blocks blocks={blocks} tint={tint}/><Box p={[0,height-.05,0]} s={[width,.13,depth+.09]} c={tint??"#a29982"}/>{battlements&&Array.from({length:Math.ceil(width/.65)},(_,i)=>{const count=Math.ceil(width/.65);return <Box key={i} p={[(i/(count-1||1)-.5)*(width-.3),height+.19,0]} s={[.3,.4,depth+.06]} c={tint??"#a59c85"}/>;})}</group>;
}
function Turret({height=3.2,radius=.6,roof=true,tint}:{height?:number;radius?:number;roof?:boolean;tint?:string}){
 const blocks=useMemo(()=>{const result:Block[]=[];const rows=Math.ceil(height/.26);for(let row=0;row<rows;row++)for(let col=0;col<14;col++){const a=(col+(row%2)*.5)*Math.PI/7;result.push({p:[Math.sin(a)*radius,height/rows*(row+.5),Math.cos(a)*radius],s:[radius*.44,height/rows-.014,.22],yaw:a});}return result;},[height,radius]);
 return <group><Blocks blocks={blocks} tint={tint}/>{Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return <Box key={i} p={[Math.sin(a)*radius,height+.17,Math.cos(a)*radius]} s={[.22,.35,.22]} r={[0,a,0]} c={tint??"#a59c85"}/>;})}{roof&&[0,1,2,3].map(i=><mesh key={i} position={[0,height+.4+i*.28,0]} castShadow><coneGeometry args={[radius*1.3*(1-i*.2),.5,16]}/><meshStandardMaterial color={i%2?"#4d6563":"#5d7470"} roughness={.9}/></mesh>)}{[0,Math.PI/2,Math.PI,Math.PI*1.5].map(a=><group key={a} rotation={[0,a,0]}><Box p={[0,height*.65,radius+.115]} s={[.1,.55,.012]} c="#3f473a"/><Box p={[0,height*.65-.3,radius+.13]} s={[.22,.07,.08]} c={tint??"#aaa18b"}/></group>)}</group>;
}
function Arch({tint}:{tint?:string}){
 const shape=useMemo(()=>{const s=new THREE.Shape();s.moveTo(-.9,0);s.lineTo(-.9,1.4);s.absarc(0,1.4,.9,Math.PI,0,true);s.lineTo(.9,0);s.lineTo(.62,0);s.lineTo(.62,1.4);s.absarc(0,1.4,.62,0,Math.PI,false);s.lineTo(-.62,0);s.closePath();return s;},[]);
 return <group><mesh position={[0,0,-.34]} castShadow><extrudeGeometry args={[shape,{depth:.68,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.018,bevelThickness:.018,curveSegments:20}]}/><meshStandardMaterial color={tint??"#b6ab91"} roughness={.95}/></mesh>{[-.4,-.2,0,.2,.4].map(x=><Pole key={x} a={[x,.1,0]} b={[x,1.92,0]} radius={.015} c="#4b5347"/>)}{[.5,1.15,1.65].map(y=><Box key={y} p={[0,y,0]} s={[1.2,.035,.04]} c="#4b5347"/>)}</group>;
}
export const FORTRESS_SCENERY_KEYS=new Set(["castle_wall","castle_corner","castle_gate","castle_turret","castle_keep","stone_wall","wood_gate"]);
export function FortressScenery({assetKey,tint}:{assetKey:string;tint?:string}){
 if(assetKey==="castle_wall")return <Wall height={CASTLE_WALL_HEIGHT-.39} depth={1.35} tint={tint}/>;
 if(assetKey==="castle_corner")return <group><Wall height={CASTLE_WALL_HEIGHT-.39} depth={1.35} tint={tint}/><group rotation={[0,Math.PI/2,0]}><Wall height={CASTLE_WALL_HEIGHT-.39} depth={1.35} tint={tint}/></group></group>;
 if(assetKey==="castle_gate")return <group>{[-1.5,1.5].map(x=><group key={x} position={[x,0,0]}><Turret height={3} radius={.57} roof={false} tint={tint}/></group>)}<Arch tint={tint}/><group position={[0,2.32,0]}><Wall width={2.3} height={.6} depth={.65} tint={tint}/></group></group>;
 if(assetKey==="castle_turret")return <Turret tint={tint}/>;
 if(assetKey==="castle_keep")return <group><Box p={[0,1.8,0]} s={[2.7,3.6,2.7]} c={tint??"#aaa18b"}/>{[-1,1].map(side=><group key={side}><group position={[0,0,side*1.37]}><Wall width={2.7} height={3.6} depth={.15} tint={tint}/></group><group position={[side*1.37,0,0]} rotation={[0,Math.PI/2,0]}><Wall width={2.7} height={3.6} depth={.15} tint={tint}/></group></group>)}{[-1,1].flatMap(x=>[-1,1].map(z=><group key={String(x)+z} position={[x*1.35,0,z*1.35]}><Turret height={3.8} radius={.36} tint={tint}/></group>))}<group position={[0,0,1.5]}><Box p={[0,.9,.05]} s={[1.2,1.8,.08]} c="#796044"/><Arch tint={tint}/></group>{[-.9,.9].map(x=><Box key={x} p={[x,2.7,1.46]} s={[.16,.62,.025]} c="#454b3d"/>)}<Roof y={3.65} width={2.1} depth={2.1}/></group>;
 if(assetKey==="stone_wall")return <Wall height={1.8} depth={.6} tint={tint} battlements={false}/>;
 return <group>{[-.9,.9].map(x=><Box key={x} p={[x,.6,0]} s={[.13,1.2,.13]} c="#8a704c"/>)}{[.3,.6,.9].map(y=><Box key={y} p={[0,y,0]} s={[1.7,.12,.07]} c={tint??"#9c8057"}/>)}<Pole a={[-.8,.2,0]} b={[.8,1,0]} radius={.035}/><Box p={[.68,.86,.065]} s={[.18,.05,.035]} c="#4d594c"/></group>;
}
