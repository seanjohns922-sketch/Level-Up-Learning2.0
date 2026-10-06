'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type {SummitPoint} from '@/lib/world3d/number-summit';

// Shared volcanic pieces for the Level 8 volcano, summit and strongholds.
export const rand=(i:number)=>{const n=Math.sin(i*12.9898+78.233)*43758.5453;return n-Math.floor(n);};

export function useReducedMotion(){
 const reduced=useRef(false);
 useEffect(()=>{const q=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{reduced.current=q.matches;};update();q.addEventListener('change',update);return()=>q.removeEventListener('change',update);},[]);
 return reduced;
}

export type InstanceItem={p:SummitPoint;s:SummitPoint;r?:SummitPoint;c:string};
/** One instanced mesh from a list of transforms and colours. */
export function Instances({geometry,material,items,obstacle=false}:{geometry:THREE.BufferGeometry;material:THREE.Material;items:InstanceItem[];obstacle?:boolean}){
 const ref=useRef<THREE.InstancedMesh>(null);
 useEffect(()=>{const m=ref.current;if(!m)return;const d=new THREE.Object3D(),c=new THREE.Color();items.forEach((it,i)=>{d.position.set(...it.p);d.scale.set(...it.s);d.rotation.set(...(it.r??[0,0,0]));d.updateMatrix();m.setMatrixAt(i,d.matrix);m.setColorAt(i,c.set(it.c));});m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.computeBoundingSphere();},[items]);
 return <instancedMesh ref={ref} args={[geometry,material,items.length]} userData={obstacle?{cameraObstacle:true}:undefined}/>;
}

/** Basalt plates with thin cracks; the glow map lights only some cracks. */
export function basaltTextures(repeat:[number,number]){
 const size=512,map=new Uint8Array(size*size*4),glow=new Uint8Array(size*size*4);
 const hash=(x:number,y:number)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const px=x/size*6,py=y/size*6;let f1=9,f2=9,cell=0;
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const cx=(Math.floor(px)+i+6)%6,cy=(Math.floor(py)+j+6)%6,ox=Math.floor(px)+i,oy=Math.floor(py)+j;const d=Math.hypot(px-ox-hash(cx,cy),py-oy-hash(cx+31,cy+7));if(d<f1){f2=f1;f1=d;cell=hash(cx+3,cy+11);}else if(d<f2)f2=d;}
  const crack=1-THREE.MathUtils.smoothstep(f2-f1,.012,.06),grain=hash(x,y)*14,k=(y*size+x)*4;
  const base=34+cell*18+grain-crack*26;
  map[k]=base+4;map[k+1]=base;map[k+2]=base+2;map[k+3]=255;
  const hot=crack*(cell>.72?1:cell>.45?.28:.08);glow[k]=255*hot;glow[k+1]=95*hot;glow[k+2]=30*hot;glow[k+3]=255;
 }
 const make=(d:Uint8Array)=>{const t=new THREE.DataTexture(d,size,size);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat);t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t;};
 return {map:make(map),glow:make(glow)};
}

/** Molten lava under drifting crust plates. Scroll its offset to make it flow. */
export function lavaTexture(repeat:[number,number]){
 const w=128,h=512,data=new Uint8Array(w*h*4);
 const hash=(x:number,y:number)=>{const n=Math.sin(x*91.7+y*231.3)*43758.5453;return n-Math.floor(n);};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const px=x/w*2,py=y/h*16;let f1=9,f2=9;
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const cx=(Math.floor(px)+i+2)%2,cy=(Math.floor(py)+j+16)%16,ox=Math.floor(px)+i,oy=Math.floor(py)+j;const d=Math.hypot(px-ox-hash(cx,cy),py-oy-hash(cx+5,cy+9));if(d<f1){f2=f1;f1=d;}else if(d<f2)f2=d;}
  const molten=1-THREE.MathUtils.smoothstep(f2-f1,.05,.32),k=(y*w+x)*4;
  data[k]=60+195*molten;data[k+1]=18+150*molten*molten;data[k+2]=8+50*molten*molten*molten;data[k+3]=255;
 }
 const t=new THREE.DataTexture(data,w,h);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.LinearFilter;t.needsUpdate=true;return t;
}

const LAVA_VERTEX=`#include <fog_pars_vertex>
varying vec2 vUv;
void main(){vUv=uv;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`;
// Domain-warped noise gives cooled crust broken by irregular glowing cracks and slowly churning hot
// pools. The surface drifts along v at uFlow; uEdge darkens the banks of channels and falls.
const LAVA_FRAGMENT=`uniform float uTime;uniform vec2 uScale;uniform float uFlow;uniform float uEdge;uniform float uBright;
varying vec2 vUv;
#include <fog_pars_fragment>
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
 vec2 p=vUv*uScale;p.y-=uTime*uFlow;
 vec2 q=vec2(fbm(p+vec2(0.,uTime*.04)),fbm(p+vec2(5.2,1.3)-uTime*.03));
 float n=fbm(p+2.4*q);
 float pools=smoothstep(.5,.78,n);
 float cracks=1.-smoothstep(0.,.045,abs(fbm(p*1.7+q*1.4)-.5));
 float heat=max(pools,cracks*.75);
 float edge=abs(vUv.x-.5)*2.;heat*=1.-uEdge*smoothstep(.5,1.,edge);
 vec3 col=mix(vec3(.035,.012,.008),vec3(.32,.04,.01),smoothstep(0.,.3,heat)*.85+.1*noise(p*9.));
 col=mix(col,vec3(.95,.24,.02),smoothstep(.25,.6,heat));
 col=mix(col,vec3(1.,.6,.12),smoothstep(.6,.88,heat));
 col=mix(col,vec3(1.,.9,.55),smoothstep(.9,1.,heat));
 gl_FragColor=vec4(col*uBright,1.);
 #include <fog_fragment>
}`;
/** Animated molten lava. Use as a mesh's material; uv.y runs along the flow and uv.x across it. */
export function LavaMaterial({scale=[1,1],flow=.05,edge=0,bright=1.2,side=THREE.FrontSide}:{scale?:[number,number];flow?:number;edge?:number;bright?:number;side?:THREE.Side}){
 const reduced=useReducedMotion(),material=useRef<THREE.ShaderMaterial>(null);
 const [sx,sy]=scale;
 const uniforms=useMemo(()=>THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uTime:{value:0},uScale:{value:new THREE.Vector2(sx,sy)},uFlow:{value:flow},uEdge:{value:edge},uBright:{value:bright}}]),[sx,sy,flow,edge,bright]);
 useFrame((_,delta)=>{const u=material.current?.uniforms;if(u&&!reduced.current)u.uTime.value+=Math.min(delta,.05);});
 return <shaderMaterial ref={material} attach="material" vertexShader={LAVA_VERTEX} fragmentShader={LAVA_FRAGMENT} uniforms={uniforms} fog toneMapped={false} side={side}/>;
}

/** Six-sided crystal with a pointed tip, standing on its base. */
export function crystalGeometry(){
 const prism=new THREE.CylinderGeometry(.2,.25,1.5,6,1).translate(0,.75,0),tip=new THREE.ConeGeometry(.2,.55,6).translate(0,1.775,0);
 const g=mergeGeometries([prism.toNonIndexed(),tip.toNonIndexed()]);prism.dispose();tip.dispose();g.computeVertexNormals();return g;
}
/** Adds a splayed cluster of crystals to `out`. */
export function addCrystalCluster(out:InstanceItem[],[x,y,z]:SummitPoint,size:number,seed:number,colours:string[],down=false){
 for(let n=0;n<6;n++){const i=seed*7+n,lean=(rand(i)-.5)*1.1,s=size*(.55+rand(i+2)*.7);out.push({p:[x+(rand(i+3)-.5)*size*.8,y,z+(rand(i+4)-.5)*size*.8],s:[s,s*(1+rand(i+5)*.9),s],r:[down?Math.PI+lean:lean,rand(i+1)*Math.PI*2,(rand(i+6)-.5)*1.1],c:colours[Math.floor(rand(i+7)*colours.length)]});}
}

export function softDotTexture(){const c=document.createElement('canvas');c.width=c.height=128;const t=c.getContext('2d')!;const g=t.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#fff');g.addColorStop(.35,'#ffffffaa');g.addColorStop(1,'#fff0');t.fillStyle=g;t.fillRect(0,0,128,128);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex;}

/** Rising embers. Pass a stable, module-level `spawn` so the particles are built once. */
export function Embers({count,spawn,height,colour,size=.24}:{count:number;spawn:(i:number)=>SummitPoint;height:number;colour:string;size?:number}){
 const reduced=useReducedMotion();
 const {geometry,base,speeds}=useMemo(()=>{const pos=new Float32Array(count*3),base=new Float32Array(count*3),speeds=new Float32Array(count);for(let i=0;i<count;i++){const p=spawn(i);base.set(p,i*3);pos.set([p[0],p[1]+rand(i+301)*height,p[2]],i*3);speeds[i]=.5+rand(i+303)*1.3;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));return {geometry:g,base,speeds};},[count,height,spawn]);
 const material=useMemo(()=>new THREE.PointsMaterial({size,map:softDotTexture(),transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}),[size]);
 useEffect(()=>{material.color.set(colour).multiplyScalar(1.8);},[colour,material]);
 useFrame(({clock},delta)=>{if(reduced.current)return;const a=geometry.getAttribute('position') as THREE.BufferAttribute,p=a.array as Float32Array,dt=Math.min(delta,.05);for(let i=0;i<count;i++){p[i*3+1]+=speeds[i]*dt;p[i*3]+=Math.sin(clock.elapsedTime*1.3+i)*dt*.15;if(p[i*3+1]>base[i*3+1]+height){p[i*3]=base[i*3];p[i*3+1]=base[i*3+1];p[i*3+2]=base[i*3+2];}}a.needsUpdate=true;});
 useEffect(()=>()=>{geometry.dispose();material.map?.dispose();material.dispose();},[geometry,material]);
 return <points geometry={geometry} material={material} frustumCulled={false}/>;
}

/** A stone brazier with a flickering flame. Only pass `light` where the extra light is worth its cost. */
export function Brazier({at,colour='#ff7a2a',scale=1,light=false}:{at:SummitPoint;colour?:string;scale?:number;light?:boolean}){
 const reduced=useReducedMotion(),flame=useRef<THREE.Group>(null),lamp=useRef<THREE.PointLight>(null),seed=at[0]*3.1+at[2]*1.7;
 const dot=useMemo(()=>softDotTexture(),[]);
 useFrame(({clock})=>{if(reduced.current)return;const t=clock.elapsedTime+seed,f=1+Math.sin(t*9)*.09+Math.sin(t*23)*.06;if(flame.current)flame.current.children.forEach((c,i)=>{c.scale.set(1,f*(1+Math.sin(t*(7+i*3)+i)*.12),1);c.rotation.y=t*(.6+i*.4);});if(lamp.current)lamp.current.intensity=26*f;});
 useEffect(()=>()=>dot.dispose(),[dot]);
 const tongues:[number,number,number,string,number][]=[[.36,1.05,0,colour,.55],[.2,.8,.12,colour,.5],[.2,.75,-.12,colour,.5],[.16,.55,0,'#ffd07a',.85]];
 return <group position={at} scale={scale}>
  <mesh position={[0,.55,0]} userData={{cameraObstacle:true}}><cylinderGeometry args={[.32,.5,1.1,6]}/><meshStandardMaterial color="#2f2a2b" roughness={.9} flatShading/></mesh>
  <mesh position={[0,1.25,0]}><cylinderGeometry args={[.7,.38,.4,8]}/><meshStandardMaterial color="#3d3536" roughness={.85} flatShading/></mesh>
  <mesh position={[0,1.46,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.6,16]}/><meshBasicMaterial color="#ff5a1a" toneMapped={false}/></mesh>
  <group ref={flame} position={[0,1.45,0]}>{tongues.map(([r,h,x,c,o],i)=><mesh key={i} position={[x,h/2,0]}><coneGeometry args={[r,h,8,1,true]}/><meshBasicMaterial color={c} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false}/></mesh>)}</group>
  <sprite position={[0,1.9,0]} scale={[2.6,2.6,1]}><spriteMaterial map={dot} color={colour} transparent opacity={.45} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false}/></sprite>
  {light&&<pointLight ref={lamp} position={[0,2.3,0]} color={colour} intensity={26} distance={16} decay={1.6}/>}
 </group>;
}

const ARCH_RADIUS=2.25,ARCH_SPRING=5.05;
function archShape(){const s=new THREE.Shape();s.moveTo(-ARCH_RADIUS,0);s.lineTo(-ARCH_RADIUS,ARCH_SPRING);s.absarc(0,ARCH_SPRING,ARCH_RADIUS,Math.PI,0,true);s.lineTo(ARCH_RADIUS,0);s.closePath();return new THREE.ShapeGeometry(s,24);}
const PORTAL_VERTEX=`varying vec2 vPos;void main(){vPos=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
// A dark, still doorway with a faint drift of the realm's colour: no glow, no bloom.
const PORTAL_FRAGMENT=`uniform float uTime;uniform vec3 uA;uniform vec3 uB;varying vec2 vPos;
void main(){vec2 p=(vPos-vec2(0.,3.))/3.2;float r=length(p);
float depth=smoothstep(1.3,0.,r),ripple=.5+.5*sin(r*9.-uTime*.7);
vec3 col=vec3(.016,.018,.024)+uB*(depth*.09+depth*ripple*.03);
gl_FragColor=vec4(col,1.);}`;

/**
 * Carved stone archway. Open archways hold a swirling portal in `colour`; sealed ones are a stone
 * door with a dim rune in the same colour. The front faces local +z.
 */
export function StoneArch({colour,open,seed=0,brightness=1.6,rim}:{colour:string;open:boolean;seed?:number;brightness?:number;rim?:string}){
 const reduced=useReducedMotion();
 const shape=useMemo(()=>archShape(),[]),block=useMemo(()=>new THREE.BoxGeometry(1,1,1),[]);
 const surface=useRef<THREE.ShaderMaterial>(null);
 const uniforms=useMemo(()=>({uTime:{value:seed*2},uA:{value:new THREE.Color()},uB:{value:new THREE.Color()}}),[seed]);
 useEffect(()=>{uniforms.uA.value.set(colour).multiplyScalar(.12);uniforms.uB.value.set(colour).multiplyScalar(brightness);},[colour,brightness,uniforms]);
 useFrame(({clock})=>{const u=surface.current?.uniforms;if(u&&!reduced.current)u.uTime.value=clock.elapsedTime+seed*2;});
 useEffect(()=>()=>{shape.dispose();block.dispose();},[shape,block]);
 const rimColour=new THREE.Color(rim??colour).multiplyScalar(open?.75:.4);
 const stones:[number,number,number,number][]=[[-2.95,.95,1.3,1.9],[-2.9,2.8,1.15,1.8],[-2.85,4.4,1.1,1.5],[2.95,.95,1.3,1.9],[2.9,2.8,1.15,1.8],[2.85,4.4,1.1,1.5]];
 return <group>
  <mesh geometry={block} position={[0,.18,0]} scale={[7.6,.36,2.8]}><meshStandardMaterial color="#3e3739" roughness={.9} flatShading/></mesh>
  {stones.map(([x,y,w,h],i)=><mesh key={i} geometry={block} position={[x,y,0]} scale={[w,h,1.5]} rotation={[0,(rand(i+seed*10)-.5)*.2,(rand(i+seed*10+3)-.5)*.06]} userData={{cameraObstacle:true}}><meshStandardMaterial color={i%2?'#3a3335':'#463d3d'} roughness={.92} flatShading/></mesh>)}
  <mesh position={[0,ARCH_SPRING+.35,0]}><torusGeometry args={[2.85,.62,5,12,Math.PI]}/><meshStandardMaterial color="#433b3c" roughness={.9} flatShading/></mesh>
  <mesh geometry={block} position={[0,ARCH_SPRING+3.45,0]} scale={[1.1,1.2,1.5]}><meshStandardMaterial color="#4d4344" roughness={.85} flatShading/></mesh>
  <mesh position={[0,ARCH_SPRING+3.45,.76]}><circleGeometry args={[.32,6]}/><meshBasicMaterial color={rimColour} toneMapped={false}/></mesh>
  <mesh position={[0,ARCH_SPRING+.35,.02]}><torusGeometry args={[ARCH_RADIUS+.05,.07,6,40,Math.PI]}/><meshBasicMaterial color={rimColour} toneMapped={false}/></mesh>
  {[-1,1].map(s=><mesh key={s} geometry={block} position={[s*(ARCH_RADIUS+.05),.35+ARCH_SPRING/2,.02]} scale={[.14,ARCH_SPRING,.14]}><meshBasicMaterial color={rimColour} toneMapped={false}/></mesh>)}
  {open?<>
   <mesh geometry={shape} position={[0,.35,0]}><shaderMaterial ref={surface} vertexShader={PORTAL_VERTEX} fragmentShader={PORTAL_FRAGMENT} uniforms={uniforms} toneMapped={false} side={THREE.DoubleSide}/></mesh>
  </>:<>
   <mesh geometry={shape} position={[0,.35,0]}><meshStandardMaterial color="#252022" roughness={.95} flatShading side={THREE.DoubleSide}/></mesh>
   {[1,-1].map(side=><group key={side} position={[0,3.3,side*.03]} rotation={[0,side>0?0:Math.PI,0]}>
    <mesh><ringGeometry args={[.95,1.08,6]}/><meshBasicMaterial color={rimColour} toneMapped={false}/></mesh>
    <mesh rotation={[0,0,Math.PI/6]}><ringGeometry args={[.55,.62,3]}/><meshBasicMaterial color={rimColour} toneMapped={false}/></mesh>
   </group>)}
  </>}
 </group>;
}
