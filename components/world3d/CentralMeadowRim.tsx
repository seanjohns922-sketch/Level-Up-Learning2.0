"use client";
import { CENTRAL_MEADOW_MAP_FRAGMENT, CENTRAL_MEADOW_SHADER_COMMON } from "@/lib/world3d/central-meadow-colour";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { CENTRAL_WORLD_CONFIG } from "@/lib/world3d/central-world-config";

// Even the inner edge is beyond the furthest corner of the editable grid.
// Keep only the grassy terrain; students add their own trees and rocks.
const { rimInnerRadius: INNER_RADIUS, rimOuterRadius: OUTER_RADIUS, radius: MEADOW_RADIUS, fadeStart: FADE_START } = CENTRAL_WORLD_CONFIG.meadow;
export function CentralMeadowRim(){
 const source=useTexture("/images/central-world-grass-tile.png");
 const texture=useMemo(()=>{const t=source.clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(20*MEADOW_RADIUS/135,20*MEADOW_RADIUS/135);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;t.needsUpdate=true;return t;},[source]);
 const geometry=useMemo(()=>{
  const positions:number[]=[],uvs:number[]=[],indices:number[]=[];
  const segments=128,rings=8;
  for(let ring=0;ring<=rings;ring++)for(let i=0;i<=segments;i++){
   const angle=i/segments*Math.PI*2,t=ring/rings,r=INNER_RADIUS+(OUTER_RADIUS-INNER_RADIUS)*t;
   const rise=Math.sin(t*Math.PI)*(.8+2*Math.pow(Math.sin(angle*3+.7),2));
   const x=Math.sin(angle)*r,z=Math.cos(angle)*r;
   positions.push(x,.012+rise,z);uvs.push(x/(MEADOW_RADIUS*2)+.5,.5-z/(MEADOW_RADIUS*2));
  }
  for(let ring=0;ring<rings;ring++)for(let i=0;i<segments;i++){
   const a=ring*(segments+1)+i,b=a+segments+1;
   indices.push(a,a+1,b,a+1,b+1,b);
  }
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
 },[]);
 useEffect(()=>()=>{texture.dispose();geometry.dispose();},[texture,geometry]);
 return <group>
  <mesh geometry={geometry} receiveShadow><meshStandardMaterial map={texture} color="#edfacb" roughness={1} transparent depthWrite={false} onBeforeCompile={shader=>{
   shader.fragmentShader=shader.fragmentShader.replace("#include <common>", "#include <common>\n" + CENTRAL_MEADOW_SHADER_COMMON).replace("#include <map_fragment>",CENTRAL_MEADOW_MAP_FRAGMENT);
   shader.vertexShader="varying float rimRadius;\n"+shader.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\nrimRadius=length(position.xz);");
   shader.fragmentShader="varying float rimRadius;\n"+shader.fragmentShader.replace("#include <alphamap_fragment>",`#include <alphamap_fragment>\ndiffuseColor.a *= 1.0-smoothstep(${FADE_START.toFixed(1)},${OUTER_RADIUS.toFixed(1)},rimRadius);`);
  }}/></mesh>
 </group>;
}
