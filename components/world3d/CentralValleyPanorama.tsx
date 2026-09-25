"use client";
import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { CentralWorldQuality } from "@/lib/world3d/central-world-config";
import { centralValleyAssets } from "@/lib/world3d/central-valley-panorama";

const vertexShader = `varying vec2 panoramaUv;
void main(){panoramaUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragmentShader = `
 uniform sampler2D section0,section1,section2,section3,section4,section5;
 uniform vec3 sky;
 varying vec2 panoramaUv;
 vec4 sampleSection(float index,vec2 uv){
  index=mod(index+6.,6.);
  if(abs(index-1.)<.1||abs(index-4.)<.1)uv.x=1.-uv.x;
  if(index<.5)return texture2D(section0,uv);
  if(index<1.5)return texture2D(section1,uv);
  if(index<2.5)return texture2D(section2,uv);
  if(index<3.5)return texture2D(section3,uv);
  if(index<4.5)return texture2D(section4,uv);
  return texture2D(section5,uv);
 }
 void main(){
  float position=fract(panoramaUv.x)*6.;
  float index=floor(position),local=fract(position);
  vec2 uv=vec2((local-.5)*.8+.5,panoramaUv.y);
  vec4 colour=sampleSection(index,uv);
  // Blend in one opaque pass: no transparent double-darkening or depth seams.
  if(local<.04)colour=mix(colour,sampleSection(index-1.,uv+vec2(.8,0.)),.5*(1.-local/.04));
  if(local>.96)colour=mix(colour,sampleSection(index+1.,uv-vec2(.8,0.)),.5*(local-.96)/.04);
  colour.rgb=mix(colour.rgb,sky,smoothstep(.86,1.,panoramaUv.y));
  gl_FragColor=vec4(colour.rgb,1.);
  #include <colorspace_fragment>
 }`;

/** Central hub only. Shared realm backdrops intentionally retain their own art. */
export function CentralValleyPanorama({quality}:{quality:CentralWorldQuality}) {
 const {gl}=useThree();
 const urls=useMemo(()=>centralValleyAssets(quality,gl.capabilities.maxTextureSize),[quality,gl]);
 const sources=useTexture(urls);
 const textures=useMemo(()=>sources.map(source=>{
  const texture=source.clone();
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.generateMipmaps=false;
  texture.minFilter=THREE.LinearFilter;
  texture.magFilter=THREE.LinearFilter;
  texture.anisotropy=Math.min(8,gl.capabilities.getMaxAnisotropy());
  texture.needsUpdate=true;
  return texture;
 }),[sources,gl]);
 useEffect(()=>()=>textures.forEach(texture=>texture.dispose()),[textures]);
 const uniforms=useMemo(()=>({
  section0:{value:textures[0]},section1:{value:textures[1]},section2:{value:textures[2]},
  section3:{value:textures[3]},section4:{value:textures[4]},section5:{value:textures[5]},
  sky:{value:new THREE.Color("#69afe4")},
 }),[textures]);
 const mesh=useRef<THREE.Mesh>(null);
 useFrame(({camera})=>{if(mesh.current){mesh.current.position.x=camera.position.x;mesh.current.position.z=camera.position.z;}});
 return <mesh ref={mesh} renderOrder={-1000} position={[0,24,0]} rotation={[0,Math.PI,0]} frustumCulled={false}>
  <cylinderGeometry args={[120,120,76,192,1,true]}/>
  <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} side={THREE.BackSide} depthWrite={false} depthTest={false} toneMapped={false}/>
 </mesh>;
}
