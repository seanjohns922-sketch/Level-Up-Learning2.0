'use client';
import {useMemo,useRef,type MutableRefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {trailThreat} from '@/lib/world3d/expedition-crossroads';

export default function ExpeditionAtmosphere({position}:{position:MutableRefObject<THREE.Vector3>}){
 const sun=useRef<THREE.DirectionalLight>(null),sky=useRef<THREE.HemisphereLight>(null);
 const danger=useRef(0),target=useRef(0),nextSample=useRef(0),heat=useRef(0),heatTarget=useRef(0);
 const colours=useMemo(()=>({clear:new THREE.Color('#9aabb2'),threat:new THREE.Color('#39404c'),warm:new THREE.Color('#ffe6bf'),cold:new THREE.Color('#a5b2d0'),ash:new THREE.Color('#4a2d28'),ember:new THREE.Color('#ffa77a')}),[]);
 useFrame(({scene,clock},delta)=>{
  if(clock.elapsedTime>nextSample.current){const p=position.current;target.current=p.z<-35&&p.x>-70?.95:trailThreat(p.x,p.z);heatTarget.current=p.z<0&&p.x>-70?Math.max(0,Math.min(1,(p.y-3)/35)):0;nextSample.current=clock.elapsedTime+.2;}
  danger.current=THREE.MathUtils.damp(danger.current,target.current,1.3,Math.min(delta,.1));
  heat.current=THREE.MathUtils.damp(heat.current,heatTarget.current,1.3,Math.min(delta,.1));
 const t=danger.current,v=heat.current;
  // Climbing the volcano trades the cold storm light for ash and ember light.
  if(scene.background instanceof THREE.Color)scene.background.copy(colours.clear).lerp(colours.threat,t).lerp(colours.ash,v);
  if(scene.fog instanceof THREE.Fog){scene.fog.color.copy(colours.clear).lerp(colours.threat,t).lerp(colours.ash,v);scene.fog.near=130-t*65+v*30;scene.fog.far=350-t*110+v*40;}
  if(sun.current){sun.current.intensity=2.1-t*.95;sun.current.color.copy(colours.warm).lerp(colours.cold,t).lerp(colours.ember,v);sun.current.intensity+=v*.35;}
  if(sky.current)sky.current.intensity=1.25-t*.2;
 });
 return <><color attach="background" args={['#9aabb2']}/><fog attach="fog" args={['#9aabb2',130,350]}/><ambientLight intensity={.25} color="#bcc7d4"/><hemisphereLight ref={sky} args={['#c6d5df','#414936',1.25]}/><directionalLight ref={sun} position={[-35,80,45]} color="#ffe6bf" intensity={2.1}/></>;
}
