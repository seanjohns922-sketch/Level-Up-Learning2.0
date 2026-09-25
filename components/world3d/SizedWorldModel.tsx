"use client";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import type { EconomyItem } from "@/lib/economy";
import { parseGridSize } from "@/lib/world3d/central-world-layout";
import { measureLocalModel } from "@/lib/world3d/world-model-bounds";
import { fitWorldItem, getItemPresentation } from "@/lib/world3d/world-item-presentation";

export function SizedWorldModel({item,children}:{item:EconomyItem;children:ReactNode}){
 const root=useRef<THREE.Group>(null),content=useRef<THREE.Group>(null);
 useLayoutEffect(()=>{
  if(!root.current||!content.current)return;
  root.current.scale.setScalar(1);content.current.position.set(0,0,0);
  const bounds = measureLocalModel(root.current);
  if(bounds.isEmpty())return;
  const size=bounds.getSize(new THREE.Vector3()),[w,d]=parseGridSize(item);
  root.current.scale.setScalar(fitWorldItem(size,[w*2,d*2],getItemPresentation(item)));
  content.current.position.set(-(bounds.min.x+bounds.max.x)/2, -bounds.min.y, -(bounds.min.z+bounds.max.z)/2);
 },[item]);
 return <group ref={root}><group ref={content}>{children}</group></group>;
}
