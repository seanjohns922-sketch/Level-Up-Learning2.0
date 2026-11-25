'use client';
// Statistica's stronghold: the Data Vault. Glowing bar charts on obsidian tablets carry a gold line at their mean,
// alternating with box plots (min 2, Q1 8, median 12, Q3 16, max 20) on a scaled axis.
import {useEffect,useMemo} from 'react';
import * as THREE from 'three';
import {Instances,type InstanceItem} from './VolcanicKit';
import {MonumentLabel,PLINTH_TOP,Plinths,faceCauseway,monumentSlots,useSetMaterials,type Slot} from './StrongholdSetKit';
import type {strongholdLayout} from '@/lib/world3d/number-stronghold';

/** Each data set's mean is a whole number, shown by the gold line and the label. */
const DATA=[[4,7,5,9,5],[3,8,6,6,2],[9,4,7,5,10]];
const BOX_LABELS=['MEDIAN = 12','RANGE = 18','IQR = 8'];
const BAR=.55,GAP=1.05,BARS_Y=.6,AXIS=[-3,3] as const;
/** The box plot's axis runs 0–20 across the tablet. */
const ax=(v:number)=>AXIS[0]+v*(AXIS[1]-AXIS[0])/20;
const PLOT={min:2,q1:8,median:12,q3:16,max:20},PLOT_Y=3;

/** Places a point given in a monument's own frame (front = +z) into the world. */
function toWorld(s:Slot,x:number,y:number,z:number):[number,number,number]{const r=faceCauseway(s.side),c=Math.cos(r),n=Math.sin(r);return [s.at[0]+x*c+z*n,PLINTH_TOP+y,s.at[2]-x*n+z*c];}

export default function StatisticaStrongholdSet({colour,layout}:{colour:string;layout:ReturnType<typeof strongholdLayout>}){
 const slots=useMemo(()=>monumentSlots(layout),[layout]);
 const {obsidian,glow}=useSetMaterials(colour);
 const box=useMemo(()=>new THREE.BoxGeometry(1,1,1),[]),tablet=useMemo(()=>new THREE.BoxGeometry(6.8,6.2,.4),[]);
 const bars=useMemo(()=>new THREE.MeshStandardMaterial({emissive:colour,emissiveIntensity:.75,roughness:.3,flatShading:true}),[colour]);
 const gold=useMemo(()=>new THREE.MeshBasicMaterial({color:'#ffd36a',toneMapped:false}),[]);
 // Every bar, axis, whisker and box as instances placed in each monument's frame.
 const {barItems,glowItems,goldItems}=useMemo(()=>{const barItems:InstanceItem[]=[],glowItems:InstanceItem[]=[],goldItems:InstanceItem[]=[];
  const put=(list:InstanceItem[],s:Slot,x:number,y:number,z:number,w:number,h:number,d:number,c='#ffffff')=>list.push({p:toWorld(s,x,y,z),s:[w,h,d],r:[0,faceCauseway(s.side),0],c});
  for(const s of slots){
   if(s.i%2===0){const data=DATA[(s.i/2)%DATA.length],mean=data.reduce((a,b)=>a+b,0)/data.length;
    data.forEach((v,j)=>put(barItems,s,(j-2)*GAP,BARS_Y+v*.25,.05,BAR,v*.5,BAR,j%2?'#d6ffd0':'#ffffff'));
    put(glowItems,s,0,BARS_Y-.05,.1,5.6,.08,.08);put(glowItems,s,-2.8,BARS_Y+2.6,.1,.08,5.3,.08);
    put(goldItems,s,0,BARS_Y+mean*.5,.4,5.8,.09,.09);}
   else{put(glowItems,s,0,PLOT_Y-1.4,.1,ax(20)-ax(0),.07,.07);for(let v=0;v<=20;v+=2)put(glowItems,s,ax(v),PLOT_Y-1.4,.1,.05,v%10?.18:.34,.05);
    put(glowItems,s,(ax(PLOT.min)+ax(PLOT.q1))/2,PLOT_Y,.1,ax(PLOT.q1)-ax(PLOT.min),.08,.08);put(glowItems,s,(ax(PLOT.q3)+ax(PLOT.max))/2,PLOT_Y,.1,ax(PLOT.max)-ax(PLOT.q3),.08,.08);
    for(const v of [PLOT.min,PLOT.max])put(glowItems,s,ax(v),PLOT_Y,.1,.08,.7,.08);
    put(barItems,s,(ax(PLOT.q1)+ax(PLOT.median))/2,PLOT_Y,.05,ax(PLOT.median)-ax(PLOT.q1)-.04,1.4,.3);put(barItems,s,(ax(PLOT.median)+ax(PLOT.q3))/2,PLOT_Y,.05,ax(PLOT.q3)-ax(PLOT.median)-.04,1.4,.3,'#d6ffd0');
    put(goldItems,s,ax(PLOT.median),PLOT_Y,.25,.1,1.6,.1);}}
  return {barItems,glowItems,goldItems};},[slots]);
 useEffect(()=>()=>{box.dispose();tablet.dispose();bars.dispose();gold.dispose();},[box,tablet,bars,gold]);
 return <>
  <Plinths slots={slots} size={7}/>
  {slots.map(s=><mesh key={s.i} geometry={tablet} material={obsidian} position={toWorld(s,0,3.2,-.35)} rotation={[0,faceCauseway(s.side),0]}/>)}
  <Instances geometry={box} material={bars} items={barItems}/>
  <Instances geometry={box} material={glow} items={glowItems}/>
  <Instances geometry={box} material={gold} items={goldItems}/>
  {slots.map(s=>{const data=DATA[(s.i/2)%DATA.length];return <MonumentLabel key={s.i} slot={s} colour={colour} y={PLINTH_TOP+7.4} text={s.i%2===0?`MEAN = ${data.reduce((a,b)=>a+b,0)/data.length}`:BOX_LABELS[((s.i-1)/2)%BOX_LABELS.length]}/>;})}
 </>;
}
