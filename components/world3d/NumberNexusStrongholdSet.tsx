'use client';
// Number Nexus' stronghold: the Integer Forge. An integer number line runs along the inside of both causeway
// parapets from 0 at the entrance, negatives on the left and positives on the right, so opposites face each
// other across the path. Powers-of-two monuments of obsidian cubes, lit through their seams, rise out of the
// lava opposite each island and grow 2¹ → 2⁵ down the hall. Code-drawn only.
import {useEffect,useMemo} from 'react';
import * as THREE from 'three';
import {Instances,type InstanceItem} from './VolcanicKit';
import {MonumentLabel,PLINTH_TOP,Plinths,monumentSlots} from './StrongholdSetKit';
import {STRONGHOLD_CAUSEWAY,strongholdLayout,strongholdParapets} from '@/lib/world3d/number-stronghold';
import type {SummitPoint} from '@/lib/world3d/number-summit';

const STEP=4,START_Z=8,LINE_Y=.6,LINE_H=.9,PX=40,CUBE=1.9;
const SUPERSCRIPT='⁰¹²³⁴⁵⁶⁷⁸⁹';

/** The whole number line for one side as a strip: a number every STEP units and a tick every unit. */
function numberStrip(count:number,sign:-1|1,colour:string){
 const length=count*STEP,c=document.createElement('canvas');c.width=Math.min(8192,Math.round(length*PX));c.height=Math.round(LINE_H*PX);
 const t=c.getContext('2d')!,unit=c.width/length;
 t.fillStyle='#0b1118';t.fillRect(0,0,c.width,c.height);t.textAlign='center';t.textBaseline='middle';t.fillStyle=colour;
 const at=(d:number)=>sign<0?d*unit:c.width-d*unit;
 for(let d=0;d<=length;d++)t.fillRect(at(d)-1,0,2,d%STEP?5:9);
 for(let i=0;i<count;i++){const n=i*sign;t.fillStyle=n===0?'#ffd36a':colour;t.font=`bold ${Math.round(c.height*.62)}px sans-serif`;t.fillText(n<0?`−${-n}`:String(n),at(i*STEP),c.height*.6);}
 const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;return map;
}
/** Cube offsets for 2^k cubes on a 2×2 footprint (2¹ is a single column of two). */
function monumentCubes(k:number):SummitPoint[]{
 const n=2**k,out:SummitPoint[]=[];
 if(k<2){for(let y=0;y<n;y++)out.push([0,y,0]);return out;}
 for(let i=0;i<n;i++)out.push([(i%2)-.5,Math.floor(i/4),(Math.floor(i/2)%2)-.5]);return out;
}
/** A parapet-length plane showing its slice [u0,u1] of the side's strip. */
function slicePlane(length:number,u0:number,u1:number){
 const g=new THREE.PlaneGeometry(length,LINE_H),uv=g.getAttribute('uv');
 for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)<.5?u0:u1);uv.needsUpdate=true;return g;
}

export default function NumberNexusStrongholdSet({colour,layout}:{colour:string;layout:ReturnType<typeof strongholdLayout>}){
 const runs=useMemo(()=>strongholdParapets('number').filter(r=>r.from-r.to>.2),[]);
 const end=Math.min(...runs.map(r=>r.to)),count=Math.floor((START_Z-end)/STEP)+1,length=count*STEP;
 const box=useMemo(()=>new THREE.BoxGeometry(1,1,1),[]);
 const obsidian=useMemo(()=>new THREE.MeshStandardMaterial({color:'#1a212c',roughness:.25,metalness:.4,flatShading:true}),[]);
 const seam=useMemo(()=>new THREE.MeshBasicMaterial({color:new THREE.Color(colour).multiplyScalar(1.25),toneMapped:false}),[colour]);
 const strips=useMemo(()=>({left:numberStrip(count,-1,'#c4fbef'),right:numberStrip(count,1,'#c4fbef')}),[count]);
 // Number line slices: each parapet run shows its own stretch of its side's strip, read from the entrance.
 const slices=useMemo(()=>runs.map(r=>{const a=(START_Z-r.from)/length,b=(START_Z-r.to)/length;
  return {key:`${r.side}${r.from}`,side:r.side,z:(r.from+r.to)/2,g:r.side<0?slicePlane(r.from-r.to,a,b):slicePlane(r.from-r.to,1-b,1-a)};}),[runs,length]);
 useEffect(()=>()=>{box.dispose();obsidian.dispose();seam.dispose();strips.left.dispose();strips.right.dispose();slices.forEach(s=>s.g.dispose());},[box,obsidian,seam,strips,slices]);

 // Monuments in the lava opposite each island, growing 2¹ → 2⁵ and repeating. A glowing core shows through the gaps.
 const monuments=useMemo(()=>monumentSlots(layout).map(slot=>{const k=1+slot.i%5;return {slot,k,at:slot.at,cubes:monumentCubes(k),layers:k<2?2:2**k/4};}),[layout]);
 const {cubes,cores}=useMemo(()=>{const cubes:InstanceItem[]=[],cores:InstanceItem[]=[];
  for(const m of monuments){const wide=m.k<2?1:2;
   for(const [x,y,z] of m.cubes)cubes.push({p:[m.at[0]+x*CUBE,PLINTH_TOP+CUBE/2+y*CUBE,m.at[2]+z*CUBE],s:[CUBE*.93,CUBE*.93,CUBE*.93],c:'#ffffff'});
   const span=wide*CUBE*.84;cores.push({p:[m.at[0],PLINTH_TOP+m.layers*CUBE/2,m.at[2]],s:[span,m.layers*CUBE*.95,span],c:'#ffffff'});}
  return {cubes,cores};},[monuments]);
 return <>
  <Plinths slots={monuments.map(m=>m.slot)} size={6.2}/>
  <Instances geometry={box} material={obsidian} items={cubes}/>
  <Instances geometry={box} material={seam} items={cores}/>
  {slices.map(s=><mesh key={s.key} geometry={s.g} position={[s.side*(STRONGHOLD_CAUSEWAY-.51),LINE_Y,s.z]} rotation={[0,s.side<0?Math.PI/2:-Math.PI/2,0]}><meshBasicMaterial map={s.side<0?strips.left:strips.right} toneMapped={false}/></mesh>)}
  {monuments.map(m=><MonumentLabel key={m.slot.i} slot={m.slot} colour={colour} y={PLINTH_TOP+m.layers*CUBE+1.4} text={`2${SUPERSCRIPT[m.k]} = ${2**m.k}`}/>)}
 </>;
}
