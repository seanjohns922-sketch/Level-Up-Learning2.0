'use client';
// Starpath's stronghold: the Mirror Observatory. Stars fill the dark above the hall. Monuments alternate between
// congruent shape pairs (a triangle and its reflection, rotation or translation) and tablets showing two parallel
// lines cut by a transversal, with matching angle arcs (corresponding, alternate, co-interior).
import {useEffect,useMemo} from 'react';
import * as THREE from 'three';
import {MonumentLabel,PLINTH_TOP,Plinths,faceCauseway,monumentSlots,useSetMaterials} from './StrongholdSetKit';
import {rand} from './VolcanicKit';
import type {strongholdLayout} from '@/lib/world3d/number-stronghold';

const MOVES=['REFLECTION','ROTATION','TRANSLATION'] as const;
/** Angle arcs at the top and bottom intersections, as [start, length] in radians. The transversal runs at 60°. */
const ANGLES=[{label:'CORRESPONDING ∠',top:[0,Math.PI/3],bottom:[0,Math.PI/3]},{label:'ALTERNATE ∠',top:[Math.PI,Math.PI/3],bottom:[0,Math.PI/3]},{label:'CO-INTERIOR ∠',top:[4*Math.PI/3,2*Math.PI/3],bottom:[0,Math.PI/3]}] as const;
const LINE_A=1.9,LINE_B=4.4,MID=(LINE_A+LINE_B)/2,SLOPE=Math.tan(Math.PI/3);

function Stars({layout}:{layout:ReturnType<typeof strongholdLayout>}){
 const geometry=useMemo(()=>{const pts:number[]=[];for(let i=0;i<1600;i++)pts.push((rand(i)-.5)*120,46+rand(i+5000)*40,layout.startZ+20-rand(i+9000)*(layout.startZ-layout.backZ+40));const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));return g;},[layout]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <points geometry={geometry}><pointsMaterial color="#e8ecff" size={.55} sizeAttenuation fog={false} toneMapped={false}/></points>;
}

export default function StarpathStrongholdSet({colour,layout}:{colour:string;layout:ReturnType<typeof strongholdLayout>}){
 const slots=useMemo(()=>monumentSlots(layout),[layout]);
 const {obsidian,glow,line}=useSetMaterials(colour);
 const triangle=useMemo(()=>{const s=new THREE.Shape();s.moveTo(-1.1,0);s.lineTo(1.3,0);s.lineTo(-.5,3.1);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.5,bevelEnabled:false});return {g,edges:new THREE.EdgesGeometry(g)};},[]);
 const rod=useMemo(()=>new THREE.BoxGeometry(1,1,1),[]),tablet=useMemo(()=>new THREE.BoxGeometry(6.4,5.6,.4),[]);
 const arcs=useMemo(()=>ANGLES.map(a=>({top:new THREE.RingGeometry(.55,.75,24,1,a.top[0],a.top[1]),bottom:new THREE.RingGeometry(.55,.75,24,1,a.bottom[0],a.bottom[1])})),[]);
 const arcMaterial=useMemo(()=>new THREE.MeshBasicMaterial({color:'#ffd36a',toneMapped:false,side:THREE.DoubleSide}),[]);
 useEffect(()=>()=>{triangle.g.dispose();triangle.edges.dispose();rod.dispose();tablet.dispose();arcs.forEach(a=>{a.top.dispose();a.bottom.dispose();});arcMaterial.dispose();},[triangle,rod,tablet,arcs,arcMaterial]);
 return <>
  <Stars layout={layout}/>
  <Plinths slots={slots} size={6.4}/>
  {slots.map(s=>{const turn=faceCauseway(s.side);
   if(s.i%2===0){const move=MOVES[(s.i/2)%MOVES.length];
    // The image: mirrored across the glowing line, turned a quarter, or slid along.
    const image=move==='REFLECTION'?{p:[1.3,0,0],r:0,sx:-1}:move==='ROTATION'?{p:[3.6,0,0],r:Math.PI/2,sx:1}:{p:[2.2,1.2,0],r:0,sx:1};
    return <group key={s.i}>
     <group position={[s.at[0],PLINTH_TOP,s.at[2]]} rotation={[0,turn,0]}>
      <group position={[-1.5,.4,0]}><mesh geometry={triangle.g} material={obsidian}/><lineSegments geometry={triangle.edges} material={line}/></group>
      <group position={[-1.5+image.p[0],.4+image.p[1],0]} rotation={[0,0,image.r]} scale={[image.sx,1,1]}><mesh geometry={triangle.g} material={obsidian}/><lineSegments geometry={triangle.edges} material={line}/></group>
      {move==='REFLECTION'&&<mesh geometry={rod} material={glow} position={[-1.5+.65,2,.25]} scale={[.07,4.2,.07]}/>}
     </group>
     <MonumentLabel text={move} colour={colour} slot={s} y={PLINTH_TOP+5.6}/>
    </group>;}
   const k=((s.i-1)/2)%ANGLES.length,a=ANGLES[k],xTop=(LINE_B-MID)/SLOPE,xBottom=(LINE_A-MID)/SLOPE;
   return <group key={s.i}>
    <group position={[s.at[0],PLINTH_TOP,s.at[2]]} rotation={[0,turn,0]}>
     <mesh geometry={tablet} material={obsidian} position={[0,3.2,-.3]}/>
     {[LINE_A,LINE_B].map(y=><mesh key={y} geometry={rod} material={glow} position={[0,y,0]} scale={[5.6,.1,.1]}/>)}
     <mesh geometry={rod} material={glow} position={[0,MID,0]} rotation={[0,0,Math.PI/3]} scale={[5.4,.1,.1]}/>
     <mesh geometry={arcs[k].top} material={arcMaterial} position={[xTop,LINE_B,.08]}/>
     <mesh geometry={arcs[k].bottom} material={arcMaterial} position={[xBottom,LINE_A,.08]}/>
    </group>
    <MonumentLabel text={a.label} colour={colour} slot={s} y={PLINTH_TOP+7.2}/>
   </group>;})}
 </>;
}
