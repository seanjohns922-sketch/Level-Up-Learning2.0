'use client';
// Pattern Peaks' own cavern: a mountain pass of repeating arches. Each arch carries the next odd number
// of lights (1, 3, 5, 7 …) and wall panels show growing tile patterns (1, 3, 6, 10), the sequences
// Pattern Peaks teaches. Code-drawn only; instance colours multiply the shared white materials.
import {useEffect,useMemo} from 'react';
import * as THREE from 'three';
import {Instances,type InstanceItem} from './VolcanicKit';

const ARCH_R=5.6;

export default function PatternPeaksCavernSet({colour,start,end}:{colour:string;start:number;end:number}){
 const box=useMemo(()=>new THREE.BoxGeometry(1,1,1),[]),ball=useMemo(()=>new THREE.SphereGeometry(1,10,8),[]);
 const arc=useMemo(()=>new THREE.TorusGeometry(ARCH_R,.13,6,36,Math.PI),[]);
 const rim=useMemo(()=>new THREE.MeshStandardMaterial({color:'#8fa3b3',roughness:.6,emissive:colour,emissiveIntensity:.12}),[colour]);
 const glow=useMemo(()=>new THREE.MeshBasicMaterial({toneMapped:false}),[]);
 const tile=useMemo(()=>new THREE.MeshStandardMaterial({emissive:colour,emissiveIntensity:.5,roughness:.4}),[colour]);
 useEffect(()=>()=>{box.dispose();ball.dispose();arc.dispose();rim.dispose();glow.dispose();tile.dispose();},[box,ball,arc,rim,glow,tile]);

 // One arch every 16 steps; arch n carries 2n − 1 lights spread over its top.
 const arches=useMemo(()=>{const out:number[]=[];for(let z=start-6;z>end+16;z-=16)out.push(z);return out;},[start,end]);
 const lights=useMemo(()=>{const out:InstanceItem[]=[];arches.forEach((z,n)=>{const count=Math.min(2*n+1,13);
  for(let k=0;k<count;k++){const a=count===1?Math.PI/2:Math.PI*(.18+.64*k/(count-1));out.push({p:[Math.cos(a)*ARCH_R,Math.sin(a)*ARCH_R,z],s:[.17,.17,.17],c:colour});}});
  return out;},[arches,colour]);

 // Triangular-number tile panels (1, 3, 6, 10) on alternating walls, each stage a little further along.
 const tiles=useMemo(()=>{const out:InstanceItem[]=[];let i=0;
  for(let z=start-12;z>end+16;z-=20,i++){const side=i%2?1:-1;
   for(let stage=1;stage<=4;stage++){const z0=z+4.2-(stage-1)*2.8;
    for(let row=0;row<stage;row++)for(let col=0;col<=row;col++)out.push({p:[side*8,.7+(stage-1-row)*.62,z0-(col-row/2)*.62],s:[.12,.54,.54],c:(row+col)%2?'#ffffff':'#d7f7e8'});}}
  return out;},[start,end]);

 return <>
  {arches.map(z=><mesh key={z} geometry={arc} material={rim} position={[0,0,z]}/>)}
  <Instances geometry={ball} material={glow} items={lights}/>
  <Instances geometry={box} material={tile} items={tiles}/>
 </>;
}
