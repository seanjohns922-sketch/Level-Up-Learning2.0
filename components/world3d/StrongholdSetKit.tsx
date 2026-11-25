'use client';
// Shared pieces for the six stronghold sets: where the maths monuments stand (in the lava opposite each island),
// which way they face (toward the causeway, turned slightly to the entrance), their plinths and their labels.
import {useEffect,useMemo} from 'react';
import * as THREE from 'three';
import {Instances,type InstanceItem} from './VolcanicKit';
import type {strongholdLayout} from '@/lib/world3d/number-stronghold';
import type {SummitPoint} from '@/lib/world3d/number-summit';

export const LAKE_Y=-1.7;
/** Top of a monument plinth: monuments stand on this. */
export const PLINTH_TOP=.1;
export type Slot={at:SummitPoint;side:-1|1;i:number};
/** One monument per island, standing in the lava on the opposite side of the causeway. The final week's slot is left open before the Core. */
export function monumentSlots(layout:ReturnType<typeof strongholdLayout>):Slot[]{
 return layout.portals.slice(0,-1).map((p,i)=>({at:[-p.position[0],0,p.position[2]],side:(p.position[0]>0?-1:1) as -1|1,i}));
}
/** Y rotation that turns a monument's front (+z) toward the causeway and slightly toward the entrance. */
export const faceCauseway=(side:-1|1)=>side<0?Math.PI/2-.35:-Math.PI/2+.35;

/** A plaque texture: the text scaled to fit, on dark stone with a realm-colour border. */
export function labelTexture(text:string,colour:string){
 const c=document.createElement('canvas');c.width=512;c.height=192;const t=c.getContext('2d')!;
 t.fillStyle='#0b1118';t.fillRect(0,0,512,192);t.strokeStyle=colour;t.lineWidth=10;t.strokeRect(8,8,496,176);
 let size=100;t.font=`bold ${size}px sans-serif`;while(t.measureText(text).width>440&&size>40){size-=4;t.font=`bold ${size}px sans-serif`;}
 t.fillStyle='#fff6e2';t.textAlign='center';t.textBaseline='middle';t.fillText(text,256,104);
 const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;return map;
}
/** A floating plaque above a monument, facing the causeway. */
export function MonumentLabel({text,colour,slot,y}:{text:string;colour:string;slot:Slot;y:number}){
 const map=useMemo(()=>labelTexture(text,colour),[text,colour]);
 useEffect(()=>()=>map.dispose(),[map]);
 return <mesh position={[slot.at[0],y,slot.at[2]]} rotation={[0,faceCauseway(slot.side),0]}><planeGeometry args={[4.4,1.65]}/><meshBasicMaterial map={map} toneMapped={false} side={THREE.DoubleSide}/></mesh>;
}
/** Square obsidian plinths rising out of the lava under each monument. */
export function Plinths({slots,size}:{slots:Slot[];size:number}){
 const box=useMemo(()=>new THREE.BoxGeometry(1,1,1),[]),material=useMemo(()=>new THREE.MeshStandardMaterial({color:'#262a33',roughness:.8,flatShading:true}),[]);
 const items=useMemo<InstanceItem[]>(()=>slots.map(s=>({p:[s.at[0],PLINTH_TOP-1.2,s.at[2]],s:[size,2.4,size],r:[0,faceCauseway(s.side),0],c:'#ffffff'})),[slots,size]);
 useEffect(()=>()=>{box.dispose();material.dispose();},[box,material]);
 return <Instances geometry={box} material={material} items={items}/>;
}
/** Shared obsidian and realm-glow materials for a set. */
export function useSetMaterials(colour:string){
 const materials=useMemo(()=>({
  obsidian:new THREE.MeshStandardMaterial({color:'#1c2029',roughness:.28,metalness:.4,flatShading:true}),
  glow:new THREE.MeshBasicMaterial({color:new THREE.Color(colour).multiplyScalar(1.3),toneMapped:false}),
  line:new THREE.LineBasicMaterial({color:new THREE.Color(colour).multiplyScalar(1.5),toneMapped:false}),
 }),[colour]);
 useEffect(()=>()=>{materials.obsidian.dispose();materials.glow.dispose();materials.line.dispose();},[materials]);
 return materials;
}
