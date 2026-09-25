"use client";
import { useTexture } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { CentralWorldQuality } from "@/lib/world3d/central-world-config";
import { Tree } from "./DetailedScenery";

// Even the inner edge is beyond the furthest corner of the editable grid.
// These are scenery, never obstacles in a student's building space.
const INNER_RADIUS=94,OUTER_RADIUS=134;
export function CentralMeadowRim({quality}:{quality:CentralWorldQuality}){
 const source=useTexture("/images/central-world-grass-tile.png");
 const texture=useMemo(()=>{const t=source.clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(20,20);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;t.needsUpdate=true;return t;},[source]);
 const geometry=useMemo(()=>{
  const positions:number[]=[],uvs:number[]=[],indices:number[]=[];
  const segments=128,rings=8;
  for(let ring=0;ring<=rings;ring++)for(let i=0;i<=segments;i++){
   const angle=i/segments*Math.PI*2,t=ring/rings,r=INNER_RADIUS+(OUTER_RADIUS-INNER_RADIUS)*t;
   const rise=Math.sin(t*Math.PI)*(.8+2*Math.pow(Math.sin(angle*3+.7),2));
   const x=Math.sin(angle)*r,z=Math.cos(angle)*r;
   positions.push(x,.012+rise,z);uvs.push(x/270+.5,.5-z/270);
  }
  for(let ring=0;ring<rings;ring++)for(let i=0;i<segments;i++){
   const a=ring*(segments+1)+i,b=a+segments+1;
   indices.push(a,a+1,b,a+1,b+1,b);
  }
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
 },[]);
 useEffect(()=>()=>{texture.dispose();geometry.dispose();},[texture,geometry]);
 const rocks=useRef<THREE.InstancedMesh>(null),count=quality==="low"?14:30;
 useLayoutEffect(()=>{
  if(!rocks.current)return;
  const object=new THREE.Object3D();
  for(let i=0;i<count;i++){
   const angle=i*2.399963,r=100+(i%4)*3;
   object.position.set(Math.sin(angle)*r,.5,Math.cos(angle)*r);
   object.rotation.set(i*.17,i*.73,i*.09);object.scale.set(1.3+i%3,.9+(i%4)*.3,1.1+(i%5)*.3);object.updateMatrix();
   rocks.current.setMatrixAt(i,object.matrix);
  }
  rocks.current.instanceMatrix.needsUpdate=true;
  rocks.current.computeBoundingSphere();
 },[count]);
 return <group>
  <mesh geometry={geometry} receiveShadow><meshStandardMaterial map={texture} color="#edfacb" roughness={1} transparent depthWrite={false} onBeforeCompile={shader=>{
   shader.vertexShader="varying float rimRadius;\n"+shader.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\nrimRadius=length(position.xz);");
   shader.fragmentShader="varying float rimRadius;\n"+shader.fragmentShader.replace("#include <alphamap_fragment>","#include <alphamap_fragment>\ndiffuseColor.a *= 1.0-smoothstep(106.0,134.0,rimRadius);");
  }}/></mesh>
  <instancedMesh ref={rocks} args={[undefined,undefined,count]} receiveShadow><dodecahedronGeometry args={[1,1]}/><meshStandardMaterial color="#858b72" roughness={1}/></instancedMesh>
  {quality!=="low"&&Array.from({length:8},(_,i)=>{const angle=i*.83+.2;return <group key={i} position={[Math.sin(angle)*108,1,Math.cos(angle)*108]} scale={2.2+(i%3)*.25}><Tree variant="pine_tree"/></group>;})}
 </group>;
}
