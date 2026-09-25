"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CentralWorldGroundTile } from "@/lib/world3d/central-world-layout";
import { buildWorldWater } from "@/lib/world3d/world-water";

export function WorldWater({tiles}:{tiles:CentralWorldGroundTile[]}) {
  const geometry=useMemo(()=>buildWorldWater(tiles),[tiles]);
  const reducedMotion=useRef(false);
  const ripples=useMemo(()=>{
    const size=128,data=new Uint8Array(size*size*4);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const v=Math.round(155+32*Math.sin((x+y)*Math.PI/16)+17*Math.sin((x-y*2)*Math.PI/32));
      data.set([v,v,v,255],(y*size+x)*4);
    }
    const texture=new THREE.DataTexture(data,size,size);
    texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
    texture.magFilter=texture.minFilter=THREE.LinearFilter;
    texture.repeat.set(.65,.65);texture.needsUpdate=true;
    return texture;
  },[]);
  useEffect(()=>{
    const query=window.matchMedia("(prefers-reduced-motion: reduce)");
    const update=()=>{reducedMotion.current=query.matches;};
    update();query.addEventListener("change",update);
    return ()=>query.removeEventListener("change",update);
  },[]);
  useEffect(()=>()=>{geometry.surface.dispose();geometry.edge.dispose();},[geometry]);
  useEffect(()=>()=>ripples.dispose(),[ripples]);
  useFrame((_,delta)=>{
    if(!reducedMotion.current){
      ripples.offset.set((ripples.offset.x+Math.min(delta,.05)*.018)%1, (ripples.offset.y+Math.min(delta,.05)*.01)%1);
    }
  });
  return <group>
    <mesh geometry={geometry.edge} receiveShadow><meshStandardMaterial color="#9caa88" roughness={.95}/></mesh>
    <mesh geometry={geometry.surface} receiveShadow><meshStandardMaterial color="#4e9998" roughness={.28} metalness={.22} bumpMap={ripples} bumpScale={.085}/></mesh>
  </group>;
}
