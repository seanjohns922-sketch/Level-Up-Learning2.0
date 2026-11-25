'use client';
// Pattern Peaks' stronghold: the Rule Forge. Straight-line graphs burn on gridded obsidian tablets, with glowing
// points wherever the line passes through whole-number coordinates, alternating with staircases of cubes that grow
// as the triangular numbers (1 + 2 + 3 + 4 = 10).
import {useEffect,useMemo} from 'react';
import * as THREE from 'three';
import {Instances,type InstanceItem} from './VolcanicKit';
import {MonumentLabel,PLINTH_TOP,Plinths,faceCauseway,monumentSlots,useSetMaterials,type Slot} from './StrongholdSetKit';
import type {strongholdLayout} from '@/lib/world3d/number-stronghold';

/** y = mx + c on a 0–6 grid. */
const LINES=[{m:1,c:1,label:'y = x + 1'},{m:2,c:0,label:'y = 2x'},{m:-1,c:6,label:'y = 6 − x'},{m:3,c:-2,label:'y = 3x − 2'}];
const STAIRS=[4,3,5];
const UNIT=.85,ORIGIN={x:-2.55,y:.9},CUBE=1.1;
const gx=(x:number)=>ORIGIN.x+x*UNIT,gy=(y:number)=>ORIGIN.y+y*UNIT;
function toWorld(s:Slot,x:number,y:number,z:number):[number,number,number]{const r=faceCauseway(s.side),c=Math.cos(r),n=Math.sin(r);return [s.at[0]+x*c+z*n,PLINTH_TOP+y,s.at[2]-x*n+z*c];}

export default function PatternPeaksStrongholdSet({colour,layout}:{colour:string;layout:ReturnType<typeof strongholdLayout>}){
 const slots=useMemo(()=>monumentSlots(layout),[layout]);
 const {obsidian,glow}=useSetMaterials(colour);
 const box=useMemo(()=>new THREE.BoxGeometry(1,1,1),[]),dot=useMemo(()=>new THREE.SphereGeometry(.17,12,8),[]),tablet=useMemo(()=>new THREE.BoxGeometry(6.6,6.6,.4),[]);
 const faint=useMemo(()=>new THREE.MeshBasicMaterial({color:new THREE.Color(colour).multiplyScalar(.45),toneMapped:false}),[colour]);
 const gold=useMemo(()=>new THREE.MeshBasicMaterial({color:'#ffd36a',toneMapped:false}),[]);
 const {grid,axes,lines,points,cubes,cores}=useMemo(()=>{const grid:InstanceItem[]=[],axes:InstanceItem[]=[],lines:InstanceItem[]=[],points:InstanceItem[]=[],cubes:InstanceItem[]=[],cores:InstanceItem[]=[];
  const put=(list:InstanceItem[],s:Slot,x:number,y:number,z:number,size:[number,number,number],roll=0)=>list.push({p:toWorld(s,x,y,z),s:size,r:[0,faceCauseway(s.side),roll],c:'#ffffff'});
  for(const s of slots){
   if(s.i%2===0){const {m,c}=LINES[(s.i/2)%LINES.length];
    for(let k=0;k<=6;k++){put(k?grid:axes,s,gx(k),gy(3),.05,[k?.03:.07,6*UNIT,.03]);put(k?grid:axes,s,gx(3),gy(k),.05,[6*UNIT,k?.03:.07,.03]);}
    // The visible part of the line inside the grid, from where it enters to where it leaves.
    const xs=[0,6,(0-c)/m,(6-c)/m].filter(x=>x>=0&&x<=6&&m*x+c>=-1e-9&&m*x+c<=6+1e-9).sort((a,b)=>a-b),x0=xs[0],x1=xs[xs.length-1];
    const ax=gx(x0),ay=gy(m*x0+c),bx=gx(x1),by=gy(m*x1+c);put(lines,s,(ax+bx)/2,(ay+by)/2,.12,[Math.hypot(bx-ax,by-ay),.1,.1],Math.atan2(by-ay,bx-ax));
    for(let x=0;x<=6;x++){const y=m*x+c;if(y>=0&&y<=6)points.push({p:toWorld(s,gx(x),gy(y),.2),s:[1,1,1],c:'#ffffff'});}}
   else{const n=STAIRS[((s.i-1)/2)%STAIRS.length];
    for(let col=0;col<n;col++){const x=(col-(n-1)/2)*CUBE;for(let h=0;h<=col;h++)put(cubes,s,x,.6+h*CUBE,0,[CUBE*.92,CUBE*.92,CUBE*.92]);put(cores,s,x,.05+(col+1)*CUBE/2,0,[CUBE*.8,(col+1)*CUBE*.94,CUBE*.8]);}}}
  return {grid,axes,lines,points,cubes,cores};},[slots]);
 useEffect(()=>()=>{box.dispose();dot.dispose();tablet.dispose();faint.dispose();gold.dispose();},[box,dot,tablet,faint,gold]);
 return <>
  <Plinths slots={slots} size={6.8}/>
  {slots.filter(s=>s.i%2===0).map(s=><mesh key={s.i} geometry={tablet} material={obsidian} position={toWorld(s,0,3.4,-.3)} rotation={[0,faceCauseway(s.side),0]}/>)}
  <Instances geometry={box} material={faint} items={grid}/>
  <Instances geometry={box} material={glow} items={axes}/>
  <Instances geometry={box} material={glow} items={lines}/>
  <Instances geometry={dot} material={gold} items={points}/>
  <Instances geometry={box} material={obsidian} items={cubes}/>
  <Instances geometry={box} material={glow} items={cores}/>
  {slots.map(s=>{const n=STAIRS[((s.i-1)/2)%STAIRS.length];return <MonumentLabel key={s.i} slot={s} colour={colour} y={PLINTH_TOP+(s.i%2===0?7.6:n*CUBE+2)} text={s.i%2===0?LINES[(s.i/2)%LINES.length].label:`${Array.from({length:n},(_,k)=>k+1).join(' + ')} = ${n*(n+1)/2}`}/>;})}
 </>;
}
