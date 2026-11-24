'use client';
// Statistica's own cavern: a crystal data archive. Bar-chart pillars stand on plinths with their axes,
// dot plots glow beside the path and line graphs of light span it overhead, the displays Statistica
// teaches. Code-drawn only; instance colours multiply the shared white materials.
import {useEffect,useMemo} from 'react';
import {Line} from '@react-three/drei';
import * as THREE from 'three';
import {Instances,type InstanceItem} from './VolcanicKit';

/** Bar heights for each chart along the archive, in metres of crystal. */
const CHARTS=[[2,3.6,2.8,4.4,1.6],[1.2,2.2,3.8,4.2,3],[4,3.2,2.4,1.8,1.2],[1.6,2.8,4.6,2.8,1.6],[3,1.4,3.8,2.2,4.2]];
/** Dot counts for each dot plot (one column per value). */
const DOTS=[[1,3,5,4,2,1],[2,4,6,3,1],[1,2,4,6,4,2,1],[3,5,2,2,4]];

export default function StatisticaCavernSet({colour,start,end}:{colour:string;start:number;end:number}){
 const box=useMemo(()=>new THREE.BoxGeometry(1,1,1),[]),ball=useMemo(()=>new THREE.SphereGeometry(1,10,8),[]);
 const glass=useMemo(()=>new THREE.MeshStandardMaterial({emissive:colour,emissiveIntensity:.55,roughness:.25,flatShading:true}),[colour]);
 const stone=useMemo(()=>new THREE.MeshStandardMaterial({roughness:.9}),[]);
 const glow=useMemo(()=>new THREE.MeshBasicMaterial({toneMapped:false}),[]);
 useEffect(()=>()=>{box.dispose();ball.dispose();glass.dispose();stone.dispose();glow.dispose();},[box,ball,glass,stone,glow]);

 const {bars,plinths,axes}=useMemo(()=>{const bars:InstanceItem[]=[],plinths:InstanceItem[]=[],axes:InstanceItem[]=[];let i=0;
  for(let z=start-8;z>end+8;z-=14,i++){const side=i%2?1:-1,x=side*7.4,chart=CHARTS[i%CHARTS.length],w=chart.length*.95;
   plinths.push({p:[x,.15,z],s:[1.4,.3,w+.6],c:'#3a3f52'});
   axes.push({p:[x-side*.62,.32,z],s:[.06,.06,w+.4],c:'#ffffff'},{p:[x-side*.62,2.6,z+w/2+.2],s:[.06,4.6,.06],c:'#ffffff'});
   chart.forEach((h,k)=>bars.push({p:[x,.3+h/2,z+w/2-.48-k*.95],s:[.72,h,.72],c:k%2?'#ffd1c9':'#ffffff'}));}
  return {bars,plinths,axes};},[start,end]);

 const dots=useMemo(()=>{const out:InstanceItem[]=[];let i=0;
  for(let z=start-15;z>end+8;z-=14,i++){const side=i%2?-1:1,counts=DOTS[i%DOTS.length];
   counts.forEach((n,k)=>{for(let d=0;d<n;d++)out.push({p:[side*5.1,.2+d*.3,z+(k-(counts.length-1)/2)*.34],s:[.12,.12,.12],c:colour});});}
  return out;},[start,end,colour]);

 const graphs=useMemo(()=>{const out:THREE.Vector3[][]=[];let i=0;
  for(let z=start-22;z>end+12;z-=28,i++){const pts:THREE.Vector3[]=[];for(let k=0;k<7;k++)pts.push(new THREE.Vector3(-6+k*2,8.2+Math.sin(k*1.3+i)*1.1+k*.25,z));out.push(pts);}
  return out;},[start,end]);

 return <>
  <Instances geometry={box} material={stone} items={plinths}/>
  <Instances geometry={box} material={glass} items={bars}/>
  <Instances geometry={box} material={glow} items={axes}/>
  <Instances geometry={ball} material={glow} items={dots}/>
  {graphs.map((pts,i)=><group key={i}>
   <Line points={pts} color={colour} lineWidth={3} fog={false} toneMapped={false}/>
   {pts.map((p,k)=><mesh key={k} position={p} geometry={ball} material={glow} scale={.2}/>)}
  </group>)}
 </>;
}
