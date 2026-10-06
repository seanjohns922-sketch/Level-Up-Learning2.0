'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {rand,useReducedMotion} from './VolcanicKit';
import type {ExpeditionRealm} from '@/lib/world3d/expedition-access';

// Placeholder stone carving of each realm's guardian on the Core chamber's back wall. When the
// Core is recovered the carving breaks apart and its eyes go dark. Shapes are stand-ins until the
// villains' designs are agreed.
type V3=[number,number,number];
type Piece={geometry:THREE.BufferGeometry;at:V3;rotation?:V3;scale?:V3};

const curve=(points:V3[],radius:number)=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),32,radius,5,false);

/** The robed figure shared by every guardian: cloak, torso, head, arms raised over the Core. */
function bodyPieces(realm:ExpeditionRealm):Piece[]{
 const roundHead=realm==='chance'||realm==='statistics';
 return [
  {geometry:new THREE.ConeGeometry(4.4,8,7),at:[0,4,0],scale:[1,1,.35]},
  {geometry:new THREE.DodecahedronGeometry(1,0),at:[0,8.6,.2],scale:[3,2.6,1]},
  {geometry:realm==='space'?new THREE.OctahedronGeometry(1.8,0):new THREE.DodecahedronGeometry(1.55,0),at:[0,12.6,.4],scale:roundHead?[1,1.05,.8]:[1,1.15,.8]},
  ...[-1,1].flatMap((side):Piece[]=>[
   {geometry:new THREE.BoxGeometry(1,5.2,1),at:[side*3.6,10.4,.3],rotation:[0,0,side*.95]},
   {geometry:new THREE.DodecahedronGeometry(.85,0),at:[side*5.8,12.2,.5]},
  ]),
 ];
}

/** Each guardian's distinguishing detail. */
function accessoryPieces(realm:ExpeditionRealm):Piece[]{
 switch(realm){
  case 'number':return [
   {geometry:new THREE.ConeGeometry(2.1,3.2,6),at:[0,14.2,.2]},
   ...[-1,1].flatMap(side=>[0,1].map(k=>({geometry:curve([[side*5.8,12.2,.5],[side*7.4,13.8+k*1.4,.4],[side*8.6,11.5+k*2.6,.3],[side*9.6,13+k*3,.2]],.22),at:[0,0,0] as V3}))),
  ];
  case 'measurement':return [
   {geometry:new THREE.BoxGeometry(3.4,.9,2),at:[0,14.2,.3]},
   {geometry:new THREE.BoxGeometry(5.2,.45,.3),at:[-2.2,11.2,1.3],rotation:[0,0,.35]},
   {geometry:new THREE.BoxGeometry(5.2,.45,.3),at:[2.6,11.4,1.3],rotation:[0,0,-.6]},
  ];
  case 'space':return [
   {geometry:new THREE.TetrahedronGeometry(.9,0),at:[-4.4,15,.6]},
   {geometry:new THREE.BoxGeometry(1.1,1.1,1.1),at:[4.6,15.4,.6],rotation:[.6,.4,.3]},
   {geometry:new THREE.IcosahedronGeometry(.8,0),at:[0,16.4,.4]},
  ];
  case 'statistics':return [
   ...[0,1,2,3,4].map(k=>({geometry:new THREE.BoxGeometry(.45,.8+rand(k+40)*1.8,.45),at:[-1.1+k*.55,14.6+rand(k+40)*.9,.4] as V3})),
   ...[0,1,2,3].map(k=>({geometry:new THREE.BoxGeometry(.6,.6,.6),at:[(k%2?1:-1)*(4+k*.6),5+k*1.6,.6] as V3,rotation:[k,k*.7,0] as V3})),
  ];
  case 'pattern':return [
   ...[0,1,2].map(k=>({geometry:new THREE.BoxGeometry(2.6-k*.7,.5,1.2),at:[0,14.1+k*.5,.3] as V3})),
   ...[-1,1].flatMap(side=>[0,1].map(k=>({geometry:new THREE.TorusGeometry(.5,.14,5,10),at:[side*(6.4+k*.8),11.4-k*.9,.5] as V3,rotation:[0,k*1.4,.4] as V3}))),
  ];
  case 'chance':return [-1,0,1].flatMap(k=>[
   {geometry:curve([[k*.8,13.6,.3],[k*1.8,15.4,.3],[k*3.2,15.8,.3],[k*3.6,14.6,.3]],.32),at:[0,0,0] as V3},
   {geometry:new THREE.SphereGeometry(.42,8,6),at:[k*3.6,14.3,.3] as V3},
  ]);
 }
}

export default function VillainRelief({realm,recovered,z}:{realm:ExpeditionRealm;recovered:boolean;z:number}){
 const reduced=useReducedMotion();
 const pieces=useMemo(()=>[...bodyPieces(realm),...accessoryPieces(realm)],[realm]);
 // Where each piece comes to rest once the carving breaks.
 const falls=useMemo(()=>pieces.map((p,i):{to:V3;spin:V3}=>({to:[p.at[0]*1.15+(rand(i+11)-.5)*3,.45+rand(i+12)*.6,p.at[2]+1.5+rand(i+13)*3],spin:[(rand(i+14)-.5)*2.5,(rand(i+15)-.5)*2.5,(rand(i+16)-.5)*2.5]})),[pieces]);
 const material=useMemo(()=>new THREE.MeshStandardMaterial({color:'#5b4f53',roughness:.9,flatShading:true}),[]);
 const eyeMaterial=useMemo(()=>new THREE.MeshBasicMaterial({color:new THREE.Color('#e48bff').multiplyScalar(3),toneMapped:false,transparent:true}),[]);
 const group=useRef<THREE.Group>(null),eyes=useRef<THREE.Group>(null),progress=useRef(recovered?1:0);
 useFrame(({clock},delta)=>{
  const target=recovered?1:0,step=Math.min(delta,.05)*(reduced.current?10:.55);
  progress.current=target>progress.current?Math.min(target,progress.current+step):Math.max(target,progress.current-step);
  const p=progress.current,e=p*p*(3-2*p);
  group.current?.children.forEach((child,i)=>{const piece=pieces[i],fall=falls[i];if(!piece||!fall)return;
   child.position.set(...piece.at.map((v,k)=>v+(fall.to[k]-v)*e) as V3);
   const r=piece.rotation??[0,0,0];child.rotation.set(r[0]+fall.spin[0]*e,r[1]+fall.spin[1]*e,r[2]+fall.spin[2]*e);});
  const t=reduced.current?0:clock.elapsedTime,blink=(t%7)>6.82?.08:1;
  eyes.current?.children.forEach(eye=>{eye.scale.y=blink*.55;((eye as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity=1-Math.min(1,p*3);});
 });
 useEffect(()=>()=>{pieces.forEach(p=>p.geometry.dispose());material.dispose();eyeMaterial.dispose();},[pieces,material,eyeMaterial]);
 return <group position={[0,-7,z]} scale={1.3}>
  {/* Seal light rakes across the carving so it reads against the dark wall. */}
  <pointLight position={[0,11,4]} color="#b48aff" intensity={recovered?10:70} distance={20} decay={1.5}/>
  <group ref={group}>{pieces.map((p,i)=><mesh key={i} geometry={p.geometry} material={material} position={p.at} rotation={p.rotation??[0,0,0]} scale={p.scale??[1,1,1]}/>)}</group>
  <group ref={eyes} position={[0,12.8,1.75]}>{[-.62,.62].map(x=><mesh key={x} position={[x,0,0]} rotation={[0,0,x*.3]} scale={[1,.55,1]} material={eyeMaterial}><circleGeometry args={[.42,20]}/></mesh>)}</group>
 </group>;
}
