'use client';
import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import WorldPlaque from './WorldPlaque';
export default function TowerExpeditionPortal({reducedMotion}:{reducedMotion:boolean}){
 const ring=useRef<THREE.Mesh>(null);
 useFrame((_,delta)=>{if(ring.current&&!reducedMotion)ring.current.rotation.z+=Math.min(delta,.05)*.18;});
 return <group position={[0,0,-1]}>
 <mesh position={[0,.16,0]}><cylinderGeometry args={[3.8,4.2,.3,32]}/><meshStandardMaterial color="#263642"/></mesh>
 <mesh ref={ring} position={[0,3.8,0]}><torusGeometry args={[3.1,.24,8,48]}/><meshStandardMaterial color="#eccb83" emissive="#ba8746" emissiveIntensity={.6}/></mesh>
 <mesh position={[0,3.8,0]}><circleGeometry args={[2.9,48]}/><meshBasicMaterial color="#465991" transparent opacity={.82} side={THREE.DoubleSide}/></mesh>
 <mesh position={[0,3.8,.04]}><torusGeometry args={[2.3,.045,6,48]}/><meshBasicMaterial color="#8de8ed"/></mesh>
 <WorldPlaque at={[0,8,0]} title="THE SHATTERED REALMS" subtitle="LEVELS 7 & 8" width={7}/>
 </group>;
}
