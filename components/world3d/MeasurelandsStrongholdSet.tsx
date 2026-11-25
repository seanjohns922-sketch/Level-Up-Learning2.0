'use client';
// Measurelands' stronghold: the Surveyor's Forge. Obsidian prisms with glowing gold edges (volume = area of
// base × height) alternate with standing gold circles that show their radius and diameter (C = 2πr, A = πr²).
import {useEffect,useMemo} from 'react';
import * as THREE from 'three';
import {MonumentLabel,PLINTH_TOP,Plinths,faceCauseway,monumentSlots,useSetMaterials} from './StrongholdSetKit';
import type {strongholdLayout} from '@/lib/world3d/number-stronghold';

const PRISMS=[{sides:3,r:2.3,h:5,turn:0,label:'V = Ah'},{sides:6,r:2,h:6,turn:0,label:'V = Ah'},{sides:4,r:2.4,h:4.6,turn:Math.PI/4,label:'V = lwh'},{sides:40,r:1.9,h:6.4,turn:0,label:'V = πr²h'}];
const CIRCLES=['C = 2πr','A = πr²','C = πd'];
const RING=2.8,RING_Y=PLINTH_TOP+3.6;

export default function MeasurelandsStrongholdSet({colour,layout}:{colour:string;layout:ReturnType<typeof strongholdLayout>}){
 const slots=useMemo(()=>monumentSlots(layout),[layout]);
 const {obsidian,glow,line}=useSetMaterials(colour);
 const prisms=useMemo(()=>PRISMS.map(p=>{const g=new THREE.CylinderGeometry(p.r,p.r,p.h,p.sides);return {g,edges:new THREE.EdgesGeometry(g,20)};}),[]);
 const ring=useMemo(()=>new THREE.TorusGeometry(RING,.16,8,72),[]),rod=useMemo(()=>new THREE.BoxGeometry(1,1,1),[]),dot=useMemo(()=>new THREE.SphereGeometry(.22,12,8),[]);
 const disc=useMemo(()=>new THREE.CircleGeometry(RING-.1,64),[]),discMaterial=useMemo(()=>new THREE.MeshBasicMaterial({color:colour,transparent:true,opacity:.14,toneMapped:false,side:THREE.DoubleSide,depthWrite:false}),[colour]);
 useEffect(()=>()=>{prisms.forEach(p=>{p.g.dispose();p.edges.dispose();});ring.dispose();rod.dispose();dot.dispose();disc.dispose();discMaterial.dispose();},[prisms,ring,rod,dot,disc,discMaterial]);
 return <>
  <Plinths slots={slots} size={5.6}/>
  {slots.map(s=>{if(s.i%2===0){const k=(s.i/2)%PRISMS.length,p=PRISMS[k];
   return <group key={s.i}>
    <group position={[s.at[0],PLINTH_TOP+p.h/2,s.at[2]]} rotation={[0,faceCauseway(s.side)+p.turn,0]}>
     <mesh geometry={prisms[k].g} material={obsidian}/><lineSegments geometry={prisms[k].edges} material={line}/>
    </group>
    <MonumentLabel text={p.label} colour={colour} slot={s} y={PLINTH_TOP+p.h+1.5}/>
   </group>;}
   const label=CIRCLES[((s.i-1)/2)%CIRCLES.length],area=label.startsWith('A');
   return <group key={s.i}>
    <group position={[s.at[0],RING_Y,s.at[2]]} rotation={[0,faceCauseway(s.side),0]}>
     <mesh geometry={ring} material={glow}/>
     {area&&<mesh geometry={disc} material={discMaterial}/>}
     <mesh geometry={rod} material={glow} position={[RING/2*Math.cos(.5),RING/2*Math.sin(.5),.05]} rotation={[0,0,.5]} scale={[RING,.09,.09]}/>
     {label==='C = πd'&&<mesh geometry={rod} material={glow} position={[0,0,.05]} scale={[RING*2,.06,.06]}/>}
     <mesh geometry={dot} material={glow}/>
     <mesh geometry={rod} material={obsidian} position={[0,-(RING+RING_Y-PLINTH_TOP)/2,-.1]} scale={[.5,RING_Y-PLINTH_TOP-RING,.5]}/>
    </group>
    <MonumentLabel text={label} colour={colour} slot={s} y={RING_Y+RING+1.4}/>
   </group>;})}
 </>;
}
