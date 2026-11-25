'use client';
// Chance Hollow's stronghold: the Fortune Forge. Giant obsidian dice with glowing pips (opposite faces sum to 7)
// rest tilted on their plinths, alternating with standing spinners whose pink sectors give the labelled probability.
import {useEffect,useMemo} from 'react';
import * as THREE from 'three';
import {Instances,type InstanceItem} from './VolcanicKit';
import {MonumentLabel,PLINTH_TOP,Plinths,faceCauseway,monumentSlots,useSetMaterials} from './StrongholdSetKit';
import type {strongholdLayout} from '@/lib/world3d/number-stronghold';

const DIE=3.2,PIP=.3;
const DICE_LABELS=['P(6) = 1/6','P(even) = 1/2','P(1 or 2) = 1/3'];
/** Spinner sectors: how many, and which are pink, so the label is exact. */
const SPINNERS=[{n:4,pink:[0],label:'P(pink) = 1/4'},{n:3,pink:[0],label:'P(pink) = 1/3'},{n:6,pink:[0,2,4],label:'P(pink) = 1/2'}];
const SPIN_R=2.6,SPIN_Y=PLINTH_TOP+4;
/** Pip positions on a face, in units of a third of the face. */
const PIPS:Record<number,[number,number][]>={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[-1,0],[-1,1],[1,-1],[1,0],[1,1]]};
/** Face value → outward normal axis; opposite faces sum to 7. */
const FACES:[number,[number,number,number]][]=[[1,[0,0,1]],[6,[0,0,-1]],[2,[1,0,0]],[5,[-1,0,0]],[3,[0,1,0]],[4,[0,-1,0]]];

function diePips():InstanceItem[]{
 const out:InstanceItem[]=[],h=DIE/2+.02,step=DIE/3.4;
 for(const [value,[nx,ny,nz]] of FACES)for(const [a,b] of PIPS[value]){
  const p:[number,number,number]=nz?[a*step,b*step,nz*h]:nx?[nx*h,b*step,a*step]:[a*step,ny*h,b*step];
  out.push({p,s:[1,1,1],r:nz?[Math.PI/2,0,0]:nx?[0,0,Math.PI/2]:[0,0,0],c:'#ffffff'});}
 return out;
}

export default function ChanceHollowStrongholdSet({colour,layout}:{colour:string;layout:ReturnType<typeof strongholdLayout>}){
 const slots=useMemo(()=>monumentSlots(layout),[layout]);
 const {obsidian,glow}=useSetMaterials(colour);
 const cube=useMemo(()=>new THREE.BoxGeometry(DIE,DIE,DIE),[]),pip=useMemo(()=>new THREE.CylinderGeometry(PIP,PIP,.06,16),[]),pips=useMemo(()=>diePips(),[]);
 const post=useMemo(()=>new THREE.BoxGeometry(.5,1,.5),[]),pointer=useMemo(()=>new THREE.ConeGeometry(.3,1.6,4),[]);
 const sectors=useMemo(()=>SPINNERS.map(sp=>Array.from({length:sp.n},(_,j)=>new THREE.CircleGeometry(SPIN_R,24,j*Math.PI*2/sp.n+.01,Math.PI*2/sp.n-.02))),[]);
 const pink=useMemo(()=>new THREE.MeshBasicMaterial({color:new THREE.Color(colour).multiplyScalar(1.2),toneMapped:false,side:THREE.DoubleSide}),[colour]);
 const pale=useMemo(()=>new THREE.MeshStandardMaterial({color:'#3a3440',roughness:.5,side:THREE.DoubleSide}),[]);
 useEffect(()=>()=>{cube.dispose();pip.dispose();post.dispose();pointer.dispose();sectors.flat().forEach(g=>g.dispose());pink.dispose();pale.dispose();},[cube,pip,post,pointer,sectors,pink,pale]);
 return <>
  <Plinths slots={slots} size={6}/>
  {slots.map(s=>{const turn=faceCauseway(s.side);
   if(s.i%2===0)return <group key={s.i}>
    {/* Resting on an edge, turned so three faces show from the causeway. */}
    <group position={[s.at[0],PLINTH_TOP+DIE*.62,s.at[2]]} rotation={[.35,turn+.6+s.i*.4,.25]}>
     <mesh geometry={cube} material={obsidian}/><Instances geometry={pip} material={glow} items={pips}/>
    </group>
    <MonumentLabel text={DICE_LABELS[(s.i/2)%DICE_LABELS.length]} colour={colour} slot={s} y={PLINTH_TOP+DIE*1.4+1.2}/>
   </group>;
   const k=((s.i-1)/2)%SPINNERS.length,sp=SPINNERS[k];
   return <group key={s.i}>
    <group position={[s.at[0],SPIN_Y,s.at[2]]} rotation={[0,turn,0]}>
     {sectors[k].map((g,j)=><mesh key={j} geometry={g} material={sp.pink.includes(j)?pink:pale}/>)}
     <mesh geometry={pointer} material={obsidian} position={[0,.7,.08]} rotation={[0,0,-.5]}/>
     <mesh geometry={post} material={obsidian} position={[0,-(SPIN_Y-PLINTH_TOP)/2,-.2]} scale={[1,SPIN_Y-PLINTH_TOP,1]}/>
    </group>
    <MonumentLabel text={sp.label} colour={colour} slot={s} y={SPIN_Y+SPIN_R+1.3}/>
   </group>;})}
 </>;
}
