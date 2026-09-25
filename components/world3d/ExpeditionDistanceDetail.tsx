'use client';
import {useRef,type ReactNode} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
/** The terrain stays visible; small distant props do not need to submit draw calls. */
export default function ExpeditionDistanceDetail({x,z,distance=100,children}:{x:number;z:number;distance?:number;children:ReactNode}){
 const root=useRef<THREE.Group>(null),next=useRef(0);
 useFrame(({camera,clock})=>{if(root.current&&clock.elapsedTime>next.current){root.current.visible=Math.hypot(camera.position.x-x,camera.position.z-z)<distance;next.current=clock.elapsedTime+.25;}});
 return <group ref={root}>{children}</group>;
}
