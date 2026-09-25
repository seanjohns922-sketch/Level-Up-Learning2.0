"use client";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import type { EconomyItem } from "@/lib/economy";
import { parseGridSize } from "@/lib/world3d/central-world-layout";
import { measureLocalModel } from "@/lib/world3d/world-model-bounds";
import { fitWorldItemScale, getItemPresentation } from "@/lib/world3d/world-item-presentation";

export type ModelMeasurement = {key:string; name:string; size:[number,number,number]; native:[number,number,number]; footprint:[number,number]};
export function SizedWorldModel({item,children,onMeasured}:{item:EconomyItem;children:ReactNode;onMeasured?:(measurement:ModelMeasurement)=>void}){
 const root=useRef<THREE.Group>(null),content=useRef<THREE.Group>(null);
 useLayoutEffect(()=>{
  if(!root.current||!content.current)return;
  root.current.scale.setScalar(1);content.current.position.set(0,0,0);
  const bounds = measureLocalModel(root.current);
  if(bounds.isEmpty())return;
  const size=bounds.getSize(new THREE.Vector3()),[w,d]=parseGridSize(item);
  root.current.scale.set(...fitWorldItemScale(size,[w*2,d*2],getItemPresentation(item)));
  content.current.position.set(-(bounds.min.x+bounds.max.x)/2, -bounds.min.y, -(bounds.min.z+bounds.max.z)/2);
  onMeasured?.({key:String(item.metadata.worldAssetKey),name:item.name,native:[size.x,size.y,size.z],size:[size.x*root.current.scale.x,size.y*root.current.scale.y,size.z*root.current.scale.z],footprint:[w*2,d*2]});
 },[item,onMeasured]);
 return <group ref={root}><group ref={content}>{children}</group></group>;
}
