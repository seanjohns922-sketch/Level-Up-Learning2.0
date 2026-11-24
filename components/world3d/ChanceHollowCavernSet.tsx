'use client';
// Chance Hollow's own cavern: a grotto of giant dice, spinners and glowing water channels that fork
// like probability trees, the tools Chance Hollow teaches. Code-drawn only; instance colours
// multiply the shared white materials.
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {Instances,rand,useReducedMotion,type InstanceItem} from './VolcanicKit';

/** Pip positions on a unit face for each value, as (u, v) offsets. */
const PIPS:Record<number,[number,number][]>={1:[[0,0]],2:[[-.25,-.25],[.25,.25]],3:[[-.25,-.25],[0,0],[.25,.25]],4:[[-.25,-.25],[.25,-.25],[-.25,.25],[.25,.25]],5:[[-.25,-.25],[.25,-.25],[0,0],[-.25,.25],[.25,.25]],6:[[-.25,-.27],[.25,-.27],[-.25,0],[.25,0],[-.25,.27],[.25,.27]]};
const SECTORS=['#ff6b8b','#ffd166','#5ad1ff','#9b8cff','#7ee0a1','#ff9f5a'];

/** A spinner on a post facing the explorer as they walk in; its arrow turns slowly. */
function Spinner({at,parts}:{at:[number,number,number];parts:number}){
 const reduced=useReducedMotion(),arrow=useRef<THREE.Group>(null);
 useFrame(({clock})=>{if(arrow.current&&!reduced.current)arrow.current.rotation.z=clock.elapsedTime*.6;});
 return <group position={at}>
  <mesh position={[0,-1.9,0]}><cylinderGeometry args={[.12,.14,3.8,8]}/><meshStandardMaterial color="#3b3340"/></mesh>
  {Array.from({length:parts},(_,k)=><mesh key={k} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[1.8,1.8,.12,24,1,false,k*2*Math.PI/parts,2*Math.PI/parts]}/><meshStandardMaterial color={SECTORS[k%SECTORS.length]} emissive={SECTORS[k%SECTORS.length]} emissiveIntensity={.35}/></mesh>)}
  <group ref={arrow} position={[0,0,.12]}><mesh position={[0,.72,0]}><boxGeometry args={[.16,1.44,.06]}/><meshBasicMaterial color="#ffffff"/></mesh><mesh><cylinderGeometry args={[.14,.14,.1,12]}/><meshBasicMaterial color="#ffffff"/></mesh></group>
 </group>;
}

export default function ChanceHollowCavernSet({colour,start,end}:{colour:string;start:number;end:number}){
 const box=useMemo(()=>new THREE.BoxGeometry(1,1,1),[]);
 const ivory=useMemo(()=>new THREE.MeshStandardMaterial({roughness:.35,emissive:colour,emissiveIntensity:.08}),[colour]);
 const ink=useMemo(()=>new THREE.MeshBasicMaterial(),[]);
 const water=useMemo(()=>new THREE.MeshBasicMaterial({color:'#7fe3ff',transparent:true,opacity:.75,toneMapped:false}),[]);
 useEffect(()=>()=>{box.dispose();ivory.dispose();ink.dispose();water.dispose();},[box,ivory,ink,water]);

 // Giant dice along the walls, turned only about the vertical so the top and path-facing faces read.
 const {dice,pips}=useMemo(()=>{const dice:InstanceItem[]=[],pips:InstanceItem[]=[];let i=0;
  for(let z=start-6;z>end+8;z-=9,i++){const side=i%2?1:-1,s=1.3+rand(i)*.4,x=side*(7.6-s/2),y=s/2,top=1+Math.floor(rand(i+3)*6),front=1+((top+1+Math.floor(rand(i+5)*4))%6);
   dice.push({p:[x,y,z],s:[s,s,s],c:i%3?'#fff8ee':'#ffe0ea'});
   for(const [u,v] of PIPS[top])pips.push({p:[x+u*s,y+s/2+.01,z+v*s],s:[.15*s,.02,.15*s],c:'#2a1d2e'});
   for(const [u,v] of PIPS[front])pips.push({p:[x-side*(s/2+.01),y+v*s,z+u*s],s:[.02,.15*s,.15*s],c:'#2a1d2e'});}
  return {dice,pips};},[start,end]);

 // Water channels on the floor that split twice, like a two-step probability tree.
 const channels=useMemo(()=>{const out:InstanceItem[]=[];let i=0;
  const seg=(x1:number,z1:number,x2:number,z2:number)=>{const len=Math.hypot(x2-x1,z2-z1);out.push({p:[(x1+x2)/2,.03,(z1+z2)/2],s:[.22,.03,len],r:[0,Math.atan2(x2-x1,z2-z1),0],c:'#ffffff'});};
  for(let z=start-12;z>end+10;z-=18,i++){const side=i%2?-1:1,x=side*4.6;
   seg(x,z,x,z-2.2);for(const a of [-1,1]){const bx=x+a*1.1,bz=z-4;seg(x,z-2.2,bx,bz);for(const b of [-1,1])seg(bx,bz,bx+b*.55,bz-1.8);}}
  return out;},[start,end]);

 const spinners=useMemo(()=>{const out:{at:[number,number,number];parts:number}[]=[];let i=0;
  for(let z=start-18;z>end+14;z-=24,i++){const side=i%2?1:-1;out.push({at:[side*5.4,3.8,z],parts:[4,3,6,5][i%4]});}
  return out;},[start,end]);

 return <>
  <Instances geometry={box} material={ivory} items={dice}/>
  <Instances geometry={box} material={ink} items={pips}/>
  <Instances geometry={box} material={water} items={channels}/>
  {spinners.map((s,i)=><Spinner key={i} {...s}/>)}
 </>;
}
