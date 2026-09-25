'use client';
import { useEffect, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TrialStudentAvatar, type WorldMoveInput, type WorldLookInput } from './SharedWorldPlayer';
import { TRAIL_SAMPLES, nearestTrail } from '@/lib/world3d/expedition-crossroads';
import { summitFloor, type SummitPoint } from '@/lib/world3d/number-summit';

export default function NumberSummitPlayer({move,look,unlocked,volcanoOpen,spawn,spawnKey,paused,overview,position,onNearest,onAltitude}:{move:WorldMoveInput;look:WorldLookInput;unlocked:number;volcanoOpen:boolean;spawn:SummitPoint;spawnKey:number;paused:boolean;overview:boolean;position:MutableRefObject<THREE.Vector3>;onNearest:(index:number|null)=>void;onAltitude:(height:number)=>void}){
 const group=useRef<THREE.Group>(null),keys=useRef(new Set<string>()),moving=useRef(false),sprinting=useRef(false),yaw=useRef(0),pitch=useRef(.04),nearest=useRef<number|null>(null),lastHeight=useRef(-1),snapCamera=useRef(true);
 const {camera,gl}=useThree();
 const nextMetrics=useRef(0);
 useEffect(()=>{const g=group.current;if(g){g.position.set(spawn[0],spawn[1]+.75,spawn[2]);position.current.copy(g.position);}const trail=nearestTrail(spawn[0],spawn[2]);if(trail.distance<6&&trail.progress>.7&&spawn[1]<5){const p=TRAIL_SAMPLES[trail.trail][60];yaw.current=Math.atan2(spawn[0]-p[0],spawn[2]-p[2]);}else yaw.current=0;if(g)g.rotation.y=yaw.current+Math.PI;nearest.current=null;pitch.current=.04;keys.current.clear();snapCamera.current=true;},[spawn,spawnKey,position]);
 useEffect(()=>{
  const down=(e:KeyboardEvent)=>{if((e.target as HTMLElement)?.closest('button,input,select,[role="dialog"]'))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.current.add(e.key.toLowerCase());};
  const up=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase());const clear=()=>keys.current.clear();
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
  return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);};
 },[]);
 useEffect(()=>{if(paused||overview)keys.current.clear();},[paused,overview]);
 useEffect(()=>{
  let drag=false,x=0,y=0;const canvas=gl.domElement;
  const down=(e:PointerEvent)=>{if(e.pointerType==='touch'||paused||overview)return;drag=true;x=e.clientX;y=e.clientY;canvas.setPointerCapture(e.pointerId);};
  const move=(e:PointerEvent)=>{if(!drag)return;yaw.current-=(e.clientX-x)*.005;pitch.current=THREE.MathUtils.clamp(pitch.current-(e.clientY-y)*.004,-.65,.65);x=e.clientX;y=e.clientY;};
  const up=()=>{drag=false;};canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);window.addEventListener('blur',up);
  return()=>{canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);window.removeEventListener('blur',up);};
 },[gl,paused,overview]);
 useFrame((state,rawDelta)=>{
  const g=group.current;if(!g)return;const delta=Math.min(rawDelta,.05);
  if(overview){snapCamera.current=true;const t=state.clock.elapsedTime*.035;camera.position.set(Math.sin(t)*12+6,66,135);camera.lookAt(0,4,49);moving.current=false;return;}
  if(!paused){
   yaw.current-=look.x*look.magnitude*2*delta;pitch.current=THREE.MathUtils.clamp(pitch.current+look.y*look.magnitude*delta,-.65,.65);
   const f=new THREE.Vector3(-Math.sin(yaw.current),0,-Math.cos(yaw.current)),r=new THREE.Vector3(Math.cos(yaw.current),0,-Math.sin(yaw.current));
   const k=keys.current;let mx=(k.has('d')||k.has('arrowright')||move.right?1:0)-(k.has('a')||k.has('arrowleft')||move.left?1:0)+(move.analogX??0),mz=(k.has('w')||k.has('arrowup')||move.up?1:0)-(k.has('s')||k.has('arrowdown')||move.down?1:0)+(move.analogY??0);
   const amount=Math.min(1,Math.hypot(mx,mz));if(amount){const length=Math.hypot(mx,mz);mx/=length;mz/=length;}
   const direction=f.multiplyScalar(mz).addScaledVector(r,mx);sprinting.current=Boolean(k.has('shift')||move.sprint);const distance=delta*(sprinting.current?12:5.2)*amount;
   if(amount>0){
   const next=g.position.clone().addScaledVector(direction,distance);let floor=summitFloor(next.x,next.z,unlocked,volcanoOpen,g.position.y-.75);
   if(floor!==null&&Math.abs(floor-(g.position.y-.75))<1.2){g.position.set(next.x,floor+.75,next.z);moving.current=amount>0;if(amount)g.rotation.y=Math.atan2(direction.x,direction.z);}else {moving.current=false;floor=summitFloor(g.position.x,g.position.z,unlocked,volcanoOpen,g.position.y-.75);if(floor!==null)g.position.y=floor+.75;}
   }else moving.current=false;
  }else moving.current=false;
  position.current.copy(g.position);
  if(process.env.NODE_ENV==='development'&&state.clock.elapsedTime>nextMetrics.current){nextMetrics.current=state.clock.elapsedTime+1;const root=document.querySelector('[data-world3d-root]');root?.setAttribute('data-render-stats',JSON.stringify({calls:gl.info.render.calls,triangles:gl.info.render.triangles,geometries:gl.info.memory.geometries}));}
  const desired=new THREE.Vector3(g.position.x+Math.sin(yaw.current)*10,g.position.y+4.4-pitch.current*7,g.position.z+Math.cos(yaw.current)*10);
  if(snapCamera.current){camera.position.copy(desired);snapCamera.current=false;}else camera.position.lerp(desired,1-Math.exp(-delta*5));camera.lookAt(g.position.x,g.position.y+1.6,g.position.z);
  let close:number|null=null;TRAIL_SAMPLES.forEach((path,i)=>{const p=path[58];if(Math.hypot(g.position.x-p[0],g.position.z-p[2])<6&&Math.abs(g.position.y-.75-p[1])<2)close=i;});
  if(close!==nearest.current){nearest.current=close;onNearest(close);}
  const altitude=Math.max(0,Math.round(g.position.y-.75));if(altitude!==lastHeight.current){lastHeight.current=altitude;onAltitude(altitude);}
 });
 return <group ref={group} position={[spawn[0],spawn[1]+.75,spawn[2]]} rotation={[0,Math.PI,0]}><mesh position={[0,-.7,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.72,16]}/><meshBasicMaterial color="#182128" transparent opacity={.22} depthWrite={false}/></mesh><TrialStudentAvatar movingRef={moving} sprintingRef={sprinting}/></group>;
}
