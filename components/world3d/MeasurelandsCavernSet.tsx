'use client';
// Measurelands' own cavern: a sandstone surveyor's canyon. Giant rulers edge the path, brass protractor
// arches span it, and prisms built from checkered unit cubes stand along the walls: the measuring tools
// and volumes Measurelands teaches. Code-drawn only; each kind of part is one instanced draw call, and
// instance colours multiply the shared white materials.
import {useEffect,useMemo} from 'react';
import * as THREE from 'three';
import {Instances,type InstanceItem} from './VolcanicKit';

const WOOD='#d2a35c',INK='#2b1c10',BRASS='#e0b955';
/** Rectangular prisms as cube counts (length × height × depth), cycled along the canyon. */
const PRISMS:[number,number,number][]=[[3,2,2],[2,3,2],[4,1,2],[3,3,1],[2,2,2],[4,2,1]];

export default function MeasurelandsCavernSet({colour,start,end}:{colour:string;start:number;end:number}){
 const box=useMemo(()=>new THREE.BoxGeometry(1,1,1),[]);
 const wood=useMemo(()=>new THREE.MeshStandardMaterial({roughness:.7}),[]);
 const ink=useMemo(()=>new THREE.MeshBasicMaterial(),[]);
 const brass=useMemo(()=>new THREE.MeshStandardMaterial({color:BRASS,metalness:.6,roughness:.35,emissive:BRASS,emissiveIntensity:.25}),[]);
 const glass=useMemo(()=>new THREE.MeshStandardMaterial({emissive:colour,emissiveIntensity:.12,roughness:.45,flatShading:true}),[colour]);
 const arc=useMemo(()=>new THREE.TorusGeometry(6.4,.16,6,40,Math.PI),[]);
 useEffect(()=>()=>{box.dispose();wood.dispose();ink.dispose();brass.dispose();glass.dispose();arc.dispose();},[box,wood,ink,brass,glass,arc]);

 // A ruler board along each edge of the path, with a tick every half unit and a long tick every 2.
 const {boards,ticks}=useMemo(()=>{const boards:InstanceItem[]=[],ticks:InstanceItem[]=[],len=start-end;
  for(const side of [-1,1]){boards.push({p:[side*2.45,.07,(start+end)/2],s:[.62,.12,len],c:WOOD});
   for(let z=start,n=0;z>end;z-=.5,n++){const long=n%4===0;ticks.push({p:[side*(2.45-side*(long?.05:.16)),.135,z],s:[long?.5:.26,.012,.04],c:INK});}}
  return {boards,ticks};},[start,end]);

 // Brass protractor arches over the path, with degree ticks every 15°.
 const arches=useMemo(()=>{const out:number[]=[];for(let z=start-20;z>end+18;z-=32)out.push(z);return out;},[start,end]);
 const degreeTicks=useMemo(()=>{const out:InstanceItem[]=[];for(const z of arches)for(let d=15;d<180;d+=15){const a=d*Math.PI/180,r=6.05,long=d%45===0;
  out.push({p:[Math.cos(a)*r,Math.sin(a)*r,z],s:[long?.7:.4,.07,.07],r:[0,0,a],c:'#ffffff'});}return out;},[arches]);

 // Unit-cube prisms against the walls: each cube drawn separately so its units can be counted.
 const cubes=useMemo(()=>{const out:InstanceItem[]=[];let i=0;
  for(let z=start-10;z>end+6;z-=13,i++){const [l,h,d]=PRISMS[i%PRISMS.length],side=i%2?1:-1,x0=side*(7.6-d*.5);
   for(let a=0;a<l;a++)for(let b=0;b<h;b++)for(let c=0;c<d;c++)out.push({p:[x0+side*(c-(d-1)/2)*.9,.45+b*.9,z+(a-(l-1)/2)*.9],s:[.84,.84,.84],c:(a+b+c)%2?'#f0a531':'#ffe2a3'});}
  return out;},[start,end]);

 return <>
  <Instances geometry={box} material={wood} items={boards}/>
  <Instances geometry={box} material={ink} items={ticks}/>
  {arches.map(z=><mesh key={z} geometry={arc} material={brass} position={[0,0,z]}/>)}
  <Instances geometry={box} material={brass} items={degreeTicks}/>
  <Instances geometry={box} material={glass} items={cubes}/>
 </>;
}
