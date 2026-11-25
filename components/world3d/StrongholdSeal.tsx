'use client';
// The Fog's seal around a stronghold's Core: a shell of purple crystal shards with glowing cracks. Each finished week
// knocks shards away and makes the cracks burn brighter, so students can watch the seal weaken from the causeway.
// When the battle is won the remaining shards blast outward in a flash and fade, and the Core is free.
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {rand,softDotTexture,useReducedMotion} from './VolcanicKit';

const SHELL_RADIUS=3.5,SEAL='#a463ff';
/** How long the seal takes to shatter. */
export const SHATTER_SECONDS=2.4;

const VERTEX=`attribute vec3 aCentre;attribute vec3 aBary;attribute float aSeed;uniform float uShatter;uniform float uStrength;uniform float uTime;
varying vec3 vBary;varying float vFade;
void main(){
 vBary=aBary;
 // Shards the student's progress has broken away are collapsed to nothing; the rest tremble more as the seal weakens.
 float kept=step(1.-uStrength,aSeed);
 float tremble=(1.-uStrength)*.06*sin(uTime*7.+aSeed*40.);
 vec3 dir=normalize(aCentre);
 float burst=uShatter*uShatter*(14.+aSeed*10.);
 vec3 p=aCentre+(position-aCentre)*kept*(1.-uShatter*.7)+dir*(tremble+burst)+vec3(0.,-uShatter*uShatter*4.,0.);
 vFade=kept*(1.-smoothstep(.55,1.,uShatter));
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
}`;
const FRAGMENT=`uniform vec3 uColour;uniform vec3 uCrack;uniform float uStrength;varying vec3 vBary;varying float vFade;
void main(){
 if(vFade<=.001)discard;
 float edge=min(min(vBary.x,vBary.y),vBary.z);
 float crack=1.-smoothstep(.0,.05+(1.-uStrength)*.05,edge);
 vec3 c=mix(uColour*.55,uCrack*(1.4+(1.-uStrength)*1.6),crack);
 gl_FragColor=vec4(c,(.32+crack*.68)*vFade);
}`;

/** Separate every face of a subdivided icosahedron into its own shard, with its centre, barycentric corners and a seed (low seeds break first). */
function shardGeometry(){
 const source=new THREE.IcosahedronGeometry(SHELL_RADIUS,1).toNonIndexed(),pos=source.getAttribute('position');
 const centre:number[]=[],bary:number[]=[],seed:number[]=[];
 for(let f=0;f<pos.count/3;f++){
  const cx=(pos.getX(f*3)+pos.getX(f*3+1)+pos.getX(f*3+2))/3,cy=(pos.getY(f*3)+pos.getY(f*3+1)+pos.getY(f*3+2))/3,cz=(pos.getZ(f*3)+pos.getZ(f*3+1)+pos.getZ(f*3+2))/3;
  // Shards facing the causeway (+z) break first, so a growing hole opens toward the student; a little noise keeps the edge ragged.
  const s=.72*(.5-.5*cz/Math.hypot(cx,cy,cz))+.28*rand(f+700);
  for(let k=0;k<3;k++){centre.push(cx,cy,cz);bary.push(k===0?1:0,k===1?1:0,k===2?1:0);seed.push(s);}
 }
 source.setAttribute('aCentre',new THREE.Float32BufferAttribute(centre,3));source.setAttribute('aBary',new THREE.Float32BufferAttribute(bary,3));source.setAttribute('aSeed',new THREE.Float32BufferAttribute(seed,1));
 return source;
}

/**
 * strength: 1 for an untouched seal down to a small remainder once every week is finished (the battle breaks the rest).
 * shattering: set when the battle is won; the burst plays once and then the seal is gone.
 */
export default function StrongholdSeal({at,strength,shattering,recovered,colour}:{at:[number,number,number];strength:number;shattering:boolean;recovered:boolean;colour:string}){
 const reduced=useReducedMotion(),geometry=useMemo(()=>shardGeometry(),[]),dot=useMemo(()=>softDotTexture(),[]);
 // Strength and the shatter progress are written every frame, so the uniforms are created once.
 const uniforms=useMemo(()=>({uShatter:{value:0},uStrength:{value:1},uTime:{value:0},uColour:{value:new THREE.Color(SEAL)},uCrack:{value:new THREE.Color('#e6c8ff')}}),[]);
 const material=useRef<THREE.ShaderMaterial>(null),flash=useRef<THREE.Sprite>(null),light=useRef<THREE.PointLight>(null),started=useRef<number|null>(null);
 useEffect(()=>()=>{geometry.dispose();dot.dispose();},[geometry,dot]);
 useEffect(()=>{if(!shattering)started.current=null;},[shattering]);
 useFrame(({clock})=>{
  const t=clock.elapsedTime,u=material.current?.uniforms;if(!u)return;u.uTime.value=reduced.current?0:t;u.uStrength.value=strength;
  let s=0;if(shattering){started.current??=t;s=Math.min(1,(t-started.current)/(reduced.current?.4:SHATTER_SECONDS));}
  u.uShatter.value=s;
  // A white-hot flash in the realm's colour at the moment the seal gives way.
  const burst=shattering?Math.sin(Math.min(1,s*1.6)*Math.PI):0;
  if(flash.current){flash.current.visible=burst>.01;flash.current.scale.setScalar(4+burst*26);(flash.current.material as THREE.SpriteMaterial).opacity=burst*.9;}
  if(light.current)light.current.intensity=burst*420;
 });
 if(recovered&&!shattering)return null;
 return <group position={at}>
  <mesh geometry={geometry}><shaderMaterial ref={material} uniforms={uniforms} vertexShader={VERTEX} fragmentShader={FRAGMENT} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} toneMapped={false}/></mesh>
  <sprite ref={flash} visible={false}><spriteMaterial map={dot} color={new THREE.Color(colour).lerp(new THREE.Color('#ffffff'),.5)} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}/></sprite>
  <pointLight ref={light} color={colour} intensity={0} distance={60} decay={1.4}/>
 </group>;
}
