'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {Beam} from './ExpeditionCrossroads';
import {Brazier,Embers,Instances,LavaMaterial,StoneArch,basaltTextures,rand,softDotTexture,useReducedMotion,type InstanceItem} from './VolcanicKit';
import {VOLCANO_GATE,VOLCANO_ROUTE} from '@/lib/world3d/volcano-expedition';
import {SEA_LEVEL} from '@/lib/world3d/expedition-crossroads';
import type {SummitPoint} from '@/lib/world3d/number-summit';

// The Level 8 volcano: the Final Battle gate, the ascent and the summit crater. Walkable floors
// are defined in lib/world3d/volcano-expedition.ts; these pieces only dress them.
const CX=0,CY=70,CZ=-130,BASALT=['#2e2829','#3a3132','#463b39'];

/** Monumental basalt gate at the foot of the volcano. Sealed: iron bars and a red rune. Open: a gold rune and lit braziers. */
export function FinalBattleGate({open}:{open:boolean}){
 const rock=useMemo(()=>new THREE.IcosahedronGeometry(1,0),[]),material=useMemo(()=>new THREE.MeshStandardMaterial({roughness:.95,flatShading:true}),[]);
 const pillars=useMemo(()=>{const out:InstanceItem[]=[];let i=100;
  for(const side of [-1,1]){for(let level=0;level<5;level++){i++;const s=2.1-level*.18;out.push({p:[side*(5.6+(rand(i)-.5)*.4),.9+level*2.15,(rand(i+1)-.5)*.5],s:[s,1.5+rand(i+2)*.4,s*.95],r:[rand(i+3)*.4,rand(i+4)*3,side*.06],c:BASALT[level%3]});}
   for(let k=0;k<4;k++){i++;out.push({p:[side*(7.6+rand(i)*1.4),.6+rand(i+1)*.6,-1+rand(i+2)*2.5],s:[1.2+rand(i+3),1+rand(i+4),1.2],r:[rand(i+5)*3,rand(i+6)*3,0],c:BASALT[k%3]});}}
  for(let k=0;k<7;k++){i++;const a=Math.PI*(.12+k*.126);out.push({p:[Math.cos(a)*5.4,10.2+Math.sin(a)*4.6,0],s:[.5,1.4+rand(i)*.9,.5],r:[0,0,a-Math.PI/2+(rand(i+1)-.5)*.3],c:'#2a2425'});}
  return out;},[]);
 const spikes=useMemo(()=>new THREE.ConeGeometry(1,1,5).translate(0,.5,0),[]);
 const rune=new THREE.Color(open?'#ffc76b':'#ff4a2a').multiplyScalar(open?2.4:1.8);
 useEffect(()=>()=>{rock.dispose();material.dispose();spikes.dispose();},[rock,material,spikes]);
 return <group position={VOLCANO_GATE}>
  <Instances geometry={rock} material={material} items={pillars.slice(0,-7)} obstacle/>
  <Instances geometry={spikes} material={material} items={pillars.slice(-7)}/>
  <mesh position={[0,10.2,0]}><torusGeometry args={[5.4,1.05,5,14,Math.PI]}/><meshStandardMaterial color="#3a3132" roughness={.9} flatShading/></mesh>
  <mesh position={[0,15.2,.2]}><boxGeometry args={[1.9,2.1,2.4]}/><meshStandardMaterial color="#463b39" roughness={.85} flatShading/></mesh>
  <mesh position={[0,15.2,1.42]}><ringGeometry args={[.45,.62,6]}/><meshBasicMaterial color={rune} toneMapped={false}/></mesh>
  <mesh position={[0,10.2,.05]}><torusGeometry args={[4.25,.08,6,40,Math.PI]}/><meshBasicMaterial color={rune} toneMapped={false}/></mesh>
  {!open&&<>
   {Array.from({length:11},(_,i)=>{const x=-4.1+i*.82,top=10.2+Math.sqrt(Math.max(0,4.25*4.25-x*x))-.1;return <Beam key={i} a={[x,0,0]} b={[x,top,0]} width={.1} colour="#1d2124"/>;})}
   {[2.6,6.2].map(y=><Beam key={y} a={[-4.25,y,0]} b={[4.25,y,0]} width={.09} colour="#1d2124"/>)}
   <mesh position={[0,6,.2]}><ringGeometry args={[1.25,1.42,6]}/><meshBasicMaterial color={rune} toneMapped={false} side={THREE.DoubleSide}/></mesh>
   <mesh position={[0,6,.2]} rotation={[0,0,Math.PI/6]}><ringGeometry args={[.7,.8,3]}/><meshBasicMaterial color={rune} toneMapped={false} side={THREE.DoubleSide}/></mesh>
  </>}
  <Brazier at={[-8.2,0,2.4]} scale={1.4} light/><Brazier at={[8.2,0,2.4]} scale={1.4} light/>
 </group>;
}

/** Guard stones and braziers along the outside edge of the ascent. */
export function AscentMarkers(){
 const rock=useMemo(()=>new THREE.IcosahedronGeometry(1,0),[]),material=useMemo(()=>new THREE.MeshStandardMaterial({roughness:.95,flatShading:true}),[]);
 const {stones,braziers}=useMemo(()=>{const stones:InstanceItem[]=[],braziers:SummitPoint[]=[];
  VOLCANO_ROUTE.forEach((p,i)=>{if(i<8||i%3)return;const a=Math.atan2(p[0],p[2]-CZ),outside:SummitPoint=[p[0]+Math.sin(a)*3.9,p[1],p[2]+Math.cos(a)*3.9];
   if(i%18===0){braziers.push(outside);return;}
   const s=.55+rand(i)*.5;stones.push({p:[outside[0],outside[1]+s*.45,outside[2]],s:[s,s*1.3,s],r:[rand(i+1)*3,rand(i+2)*3,0],c:BASALT[i%3]});});
  return {stones,braziers};},[]);
 useEffect(()=>()=>{rock.dispose();material.dispose();},[rock,material]);
 return <><Instances geometry={rock} material={material} items={stones}/>{braziers.map((p,i)=><Brazier key={i} at={p}/>)}</>;
}

/** Basalt summit ring with glowing cracks. */
export function SummitFloor(){
 const {map,glow}=useMemo(()=>basaltTextures([7,7]),[]);
 useEffect(()=>()=>{map.dispose();glow.dispose();},[map,glow]);
 return <mesh position={[CX,CY+.01,CZ]} rotation={[-Math.PI/2,0,0]} receiveShadow><ringGeometry args={[8.5,25,72,4]}/><meshStandardMaterial map={map} emissiveMap={glow} emissive="#ffffff" emissiveIntensity={.45} roughness={.9}/></mesh>;
}

const craterEmber=(i:number):SummitPoint=>{const a=rand(i+40)*Math.PI*2,r=Math.sqrt(rand(i+41))*7;return [CX+Math.cos(a)*r,CY-.7,CZ+Math.sin(a)*r];};
/** Molten crater with a jagged rim, a heat glow and rising embers. */
export function SummitCrater(){
 const dot=useMemo(()=>softDotTexture(),[]);
 const rock=useMemo(()=>new THREE.IcosahedronGeometry(1,0),[]),material=useMemo(()=>new THREE.MeshStandardMaterial({roughness:.95,flatShading:true}),[]);
 const rim=useMemo(()=>{const out:InstanceItem[]=[];for(let i=0;i<44;i++){const a=i/44*Math.PI*2+rand(i)*.05,r=8.9+(rand(i+1)-.5)*.5,h=.5+rand(i+2)*1.1;out.push({p:[CX+Math.sin(a)*r,CY+h*.35,CZ+Math.cos(a)*r],s:[.6+rand(i+3)*.4,h,.6+rand(i+4)*.35],r:[rand(i+5)*.4,a,rand(i+6)*.3],c:BASALT[i%3]});}return out;},[]);
 useEffect(()=>()=>{dot.dispose();rock.dispose();material.dispose();},[dot,rock,material]);
 return <group>
  <mesh position={[CX,CY-.75,CZ]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[8.5,48]}/><LavaMaterial scale={[5,5]} flow={.03} bright={1.2}/></mesh>
  <mesh position={[CX,CY-.3,CZ]}><cylinderGeometry args={[8.6,8.5,1,40,1,true]}/><meshStandardMaterial color="#231d1e" roughness={.95} side={THREE.BackSide} flatShading/></mesh>
  <Instances geometry={rock} material={material} items={rim}/>
  <sprite position={[CX,CY+3,CZ]} scale={[30,14,1]}><spriteMaterial map={dot} color={new THREE.Color('#ff7a2e').multiplyScalar(1.3)} transparent opacity={.55} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}/></sprite>
  <Embers count={150} spawn={craterEmber} height={28} colour="#ff9a4a" size={.5}/>
 </group>;
}

/** A realm gateway: stone archway in the realm's colour, open when that realm's Level 8 is unlocked. */
export function SummitGateway({colour,open,seed}:{colour:string;open:boolean;seed:number}){
 return <group><StoneArch colour={colour} open={open} seed={seed} brightness={1.5}/>
  {open&&<pointLight position={[0,3.4,2.4]} color={colour} intensity={24} distance={12} decay={1.6}/>}
 </group>;
}

/** Rock spires behind each gateway and braziers around the ring. Angles avoid the trail's entry at the south. */
export function SummitDressing({doorAngles}:{doorAngles:number[]}){
 const rock=useMemo(()=>new THREE.IcosahedronGeometry(1,0),[]),material=useMemo(()=>new THREE.MeshStandardMaterial({roughness:.95,flatShading:true}),[]);
 const spires=useMemo(()=>{const out:InstanceItem[]=[];let i=700;doorAngles.forEach(a=>{for(let level=0;level<4;level++){i++;const s=2.6-level*.5,r=29+rand(i)*.8;out.push({p:[CX+Math.sin(a)*r,CY+2+level*3.6,CZ+Math.cos(a)*r],s:[s,2.4,s],r:[rand(i+1)*.3,rand(i+2)*3,rand(i+3)*.3],c:BASALT[level%3]});}});return out;},[doorAngles]);
 const braziers=useMemo(()=>[1,2,3,4,5].map(i=>{const a=i*Math.PI/3;return [CX+Math.sin(a)*21.5,CY,CZ+Math.cos(a)*21.5] as SummitPoint;}).concat([-.3,.3].map(a=>[CX+Math.sin(a)*24,CY,CZ+Math.cos(a)*24] as SummitPoint)),[]);
 useEffect(()=>()=>{rock.dispose();material.dispose();},[rock,material]);
 return <><Instances geometry={rock} material={material} items={spires} obstacle/>{braziers.map((p,i)=><Brazier key={i} at={p} scale={1.2} light={i<5}/>)}</>;
}

/** Tileable ripple normals built from whole-number sine waves, so the pattern wraps seamlessly. */
function rippleNormals(){
 const size=256,data=new Uint8Array(size*size*4),waves=[[3,1,.5],[1,4,.35],[5,-3,.22],[-7,2,.15],[9,7,.08]] as const;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size;let dx=0,dy=0;
  for(const [kx,ky,a] of waves){const phase=Math.PI*2*(kx*u+ky*v)+kx;dx+=a*kx*Math.cos(phase);dy+=a*ky*Math.cos(phase);}
  const n=new THREE.Vector3(-dx*.05,-dy*.05,1).normalize(),k=(y*size+x)*4;
  data[k]=(n.x*.5+.5)*255;data[k+1]=(n.y*.5+.5)*255;data[k+2]=(n.z*.5+.5)*255;data[k+3]=255;
 }
 const t=new THREE.DataTexture(data,size,size);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(60,60);t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;
}
function radialGlow(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d')!,r=g.createRadialGradient(128,128,70,128,128,128);r.addColorStop(0,'#ff7a32ff');r.addColorStop(.35,'#ff5a1a66');r.addColorStop(1,'#ff5a1a00');g.fillStyle=r;g.fillRect(0,0,256,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}

/** The sea around the volcano: dark water with moving ripples, lit orange where it meets the island. */
export function VolcanoSea(){
 const reduced=useReducedMotion(),water=useRef<THREE.MeshStandardMaterial>(null);
 const normals=useMemo(()=>rippleNormals(),[]),glow=useMemo(()=>radialGlow(),[]);
 useFrame((_,delta)=>{const n=water.current?.normalMap;if(n&&!reduced.current){const d=Math.min(delta,.05);n.offset.x+=d*.004;n.offset.y+=d*.0025;}});
 useEffect(()=>()=>{normals.dispose();glow.dispose();},[normals,glow]);
 return <group>
  <mesh position={[CX,SEA_LEVEL,CZ]} rotation={[-Math.PI/2,0,0]} receiveShadow><circleGeometry args={[340,96]}/><meshStandardMaterial ref={water} color="#1f5262" roughness={.12} metalness={.3} normalMap={normals} normalScale={new THREE.Vector2(.7,.7)}/></mesh>
  <mesh position={[CX,SEA_LEVEL+.03,CZ]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[260,260]}/><meshBasicMaterial map={glow} transparent opacity={.38} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}/></mesh>
 </group>;
}

/** Stone edging, boulders and braziers along the causeway from the gate to the island. */
export function Causeway(){
 const rock=useMemo(()=>new THREE.IcosahedronGeometry(1,0),[]),block=useMemo(()=>new THREE.BoxGeometry(1,1,1),[]),material=useMemo(()=>new THREE.MeshStandardMaterial({roughness:.95,flatShading:true}),[]);
 const {walls,boulders}=useMemo(()=>{const walls:InstanceItem[]=[],boulders:InstanceItem[]=[];let i=1200;
  for(let z=6;z>-38;z-=1.6)for(const side of [-1,1]){i++;walls.push({p:[side*3.6,-.2,z],s:[.7,1.1+rand(i)*.3,1.5],r:[0,(rand(i+1)-.5)*.1,0],c:BASALT[i%3]});
   if(rand(i+2)>.35){const s=.7+rand(i+3)*1.1;boulders.push({p:[side*(4.6+rand(i+4)*1.4),SEA_LEVEL-.2,z+(rand(i+5)-.5)*1.4],s:[s*1.3,s,s],r:[rand(i+6)*3,rand(i+7)*3,0],c:BASALT[(i+1)%3]});}}
  return {walls,boulders};},[]);
 useEffect(()=>()=>{rock.dispose();block.dispose();material.dispose();},[rock,block,material]);
 return <><Instances geometry={block} material={material} items={walls}/><Instances geometry={rock} material={material} items={boulders}/>
  {[-4,-20,-34].flatMap(z=>[-1,1].map(side=><Brazier key={`${z}${side}`} at={[side*3.6,.35,z]} scale={.9}/>))}
 </>;
}
