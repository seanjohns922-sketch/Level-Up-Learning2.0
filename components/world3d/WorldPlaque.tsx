'use client';
import {useMemo,useEffect} from 'react';
import * as THREE from 'three';
import type {SummitPoint} from '@/lib/world3d/number-summit';
export default function WorldPlaque({at,title,subtitle,width=6,colour='#d8c59d'}:{at:SummitPoint;title:string;subtitle:string;width?:number;colour?:string}){
 const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=2048;c.height=512;const t=c.getContext('2d')!;t.scale(2,2);t.fillStyle='#101e25';t.fillRect(0,0,1024,256);t.strokeStyle=colour;t.lineWidth=8;t.strokeRect(12,12,1000,232);t.textAlign='center';t.fillStyle='#fff8e7';t.font='bold 76px sans-serif';t.fillText(title,512,112,940);t.font='bold 40px sans-serif';t.fillStyle='#f1eee2';t.fillText(subtitle,512,190,930);const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=16;map.generateMipmaps=false;map.minFilter=THREE.LinearFilter;map.magFilter=THREE.LinearFilter;return map;},[title,subtitle,colour]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 return <group position={at}>{[0,Math.PI].map(angle=><mesh key={angle} rotation={[0,angle,0]} position={[0,0,angle===0?.015:-.015]}><planeGeometry args={[width,width/4]}/><meshBasicMaterial map={texture} toneMapped={false} fog={false}/></mesh>)}</group>;
}
