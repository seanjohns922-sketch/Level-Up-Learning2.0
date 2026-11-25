'use client';
// The open volcanic hall shared by the six Level 8 strongholds: a lava lake, a raised causeway with glowing
// parapets, island platforms for the weekly portals, a colonnade of obsidian columns with spanning arches, and
// far cliffs with lavafalls. Realm colour runs through the trims, crystals and floor cracks. Repeated parts are
// instanced and the stonework is merged, so the whole hall stays a handful of draw calls.
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {Instances,LavaMaterial,basaltTextures,crystalGeometry,rand,softDotTexture,useReducedMotion,type InstanceItem} from './VolcanicKit';
import {STRONGHOLD_BRIDGE,STRONGHOLD_CAUSEWAY,STRONGHOLD_CORE_PLAZA,STRONGHOLD_ISLAND,strongholdLayout,strongholdParapets} from '@/lib/world3d/number-stronghold';
import type {ExpeditionRealm} from '@/lib/world3d/expedition-access';
import type {SummitPoint} from '@/lib/world3d/number-summit';

type Layout=ReturnType<typeof strongholdLayout>;
export type Tone=(c:string)=>string;
const DEPTH=2.6,LAKE_Y=-1.7,WALL_X=36,COLUMN_X=9.4,PARAPET_H=1.15;
const tint=(colour:string,toward:string,amount:number)=>'#'+new THREE.Color(colour).lerp(new THREE.Color(toward),amount).getHexString();
const toned=<T extends {c:string}>(items:T[],tone:Tone)=>items.map(i=>({...i,c:tone(i.c)}));

/** Lava filling the hall floor, the light source for everything above it. */
export function LavaLake({layout}:{layout:Layout}){
 const length=layout.startZ-layout.backZ+40,mid=(layout.startZ+layout.backZ)/2;
 return <mesh position={[0,LAKE_Y,mid]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[WALL_X*2+8,length]}/><LavaMaterial scale={[8,length/10]} flow={.035} bright={1.05}/></mesh>;
}

/** Walkable tops and their sides as two merged meshes: tops take world-space UVs so the basalt runs continuously. */
function stoneGeometry(layout:Layout){
 const tops:THREE.BufferGeometry[]=[],sides:THREE.BufferGeometry[]=[];
 const slab=(w:number,d:number,x:number,z:number)=>{tops.push(new THREE.PlaneGeometry(w,d).rotateX(-Math.PI/2).translate(x,0,z));sides.push(new THREE.BoxGeometry(w,DEPTH,d).translate(x,-DEPTH/2-.02,z));};
 const disc=(r:number,n:number,x:number,z:number)=>{tops.push(new THREE.CircleGeometry(r,n).rotateZ(Math.PI/2).rotateX(-Math.PI/2).translate(x,0,z));sides.push(new THREE.CylinderGeometry(r,r*1.06,DEPTH,n).translate(x,-DEPTH/2-.02,z));};
 const causewayEnd=layout.coreZ+STRONGHOLD_CORE_PLAZA-1;
 slab(18,10,0,13);
 slab(STRONGHOLD_CAUSEWAY*2,8-causewayEnd,0,(8+causewayEnd)/2);
 disc(STRONGHOLD_CORE_PLAZA,12,0,layout.coreZ);
 for(const p of layout.portals){const [px,,pz]=p.position,side=Math.sign(px),inner=STRONGHOLD_CAUSEWAY,outer=Math.abs(px)-STRONGHOLD_ISLAND+.6;
  slab(outer-inner,STRONGHOLD_BRIDGE*2,side*(inner+outer)/2,pz);disc(STRONGHOLD_ISLAND,6,px,pz);}
 const top=mergeGeometries(tops),side=mergeGeometries(sides);tops.forEach(g=>g.dispose());sides.forEach(g=>g.dispose());
 const pos=top.getAttribute('position'),uv=top.getAttribute('uv');for(let i=0;i<pos.count;i++)uv.setXY(i,pos.getX(i)/3.2,pos.getZ(i)/3.2);uv.needsUpdate=true;
 return {top,side};
}

export type IslandState='locked'|'current'|'completed';
/** Causeway, plazas, bridges and islands, with parapets and glowing realm-colour trims. Island rims show each week's state. */
export function Stonework({realm,layout,colour,tone,floor,cracks,islands}:{realm:ExpeditionRealm;layout:Layout;colour:string;tone:Tone;floor:string;cracks:string;islands:{at:SummitPoint;rim:string}[]}){
 const {top,side}=useMemo(()=>stoneGeometry(layout),[layout]);
 const neutral=cracks!=='#ffffff',{map,glow}=useMemo(()=>basaltTextures([1,1],neutral),[neutral]);
 const box=useMemo(()=>new THREE.BoxGeometry(1,1,1),[]),hex=useMemo(()=>new THREE.TorusGeometry(STRONGHOLD_ISLAND-.3,.09,4,6).rotateZ(Math.PI/2).rotateX(Math.PI/2),[]);
 const sideMaterial=useMemo(()=>new THREE.MeshStandardMaterial({color:tone('#2c2628'),roughness:.9,flatShading:true}),[tone]);
 const wall=useMemo(()=>new THREE.MeshStandardMaterial({roughness:.75,flatShading:true}),[]);
 const trim=useMemo(()=>new THREE.MeshBasicMaterial({color:new THREE.Color(colour).multiplyScalar(1.15),toneMapped:false}),[colour]);
 const rimMaterial=useMemo(()=>new THREE.MeshBasicMaterial({toneMapped:false}),[]);
 const runs=useMemo(()=>strongholdParapets(realm),[realm]);
 const {parapets,trims}=useMemo(()=>{const parapets:InstanceItem[]=[],trims:InstanceItem[]=[];
  for(const r of runs){const len=r.from-r.to,z=(r.from+r.to)/2;if(len<=.2)continue;
   parapets.push({p:[r.side*(STRONGHOLD_CAUSEWAY-.25),PARAPET_H/2,z],s:[.5,PARAPET_H,len],c:'#3a3436'});
   trims.push({p:[r.side*(STRONGHOLD_CAUSEWAY-.47),PARAPET_H+.01,z],s:[.07,.04,len],c:'#ffffff'});
   trims.push({p:[r.side*(STRONGHOLD_CAUSEWAY+.03),-.12,z],s:[.08,.08,len],c:'#ffffff'});}
  return {parapets:toned(parapets,tone),trims};},[runs,tone]);
 const rims=useMemo(()=>islands.map(i=>({p:[i.at[0],.05,i.at[2]] as SummitPoint,s:[1,1,1] as SummitPoint,c:i.rim})),[islands]);
 useEffect(()=>()=>{top.dispose();side.dispose();map.dispose();glow.dispose();box.dispose();hex.dispose();sideMaterial.dispose();wall.dispose();trim.dispose();rimMaterial.dispose();},[top,side,map,glow,box,hex,sideMaterial,wall,trim,rimMaterial]);
 return <>
  <mesh geometry={top}><meshStandardMaterial color={floor} map={map} emissiveMap={glow} emissive={cracks} emissiveIntensity={.38} roughness={.85}/></mesh>
  <mesh geometry={side} material={sideMaterial}/>
  <Instances geometry={box} material={wall} items={parapets}/>
  <Instances geometry={box} material={trim} items={trims}/>
  <Instances geometry={hex} material={rimMaterial} items={rims}/>
 </>;
}

/** Pairs of obsidian columns rising out of the lava every other gap between portals, each pair joined by an arch over the causeway. */
export function Colonnade({layout,colour,tone}:{layout:Layout;colour:string;tone:Tone}){
 const column=useMemo(()=>new THREE.CylinderGeometry(1.05,1.4,36,6),[]),band=useMemo(()=>new THREE.CylinderGeometry(1.22,1.22,.32,6),[]);
 const arch=useMemo(()=>new THREE.TorusGeometry(COLUMN_X,.75,5,20,Math.PI),[]);
 const stone=useMemo(()=>new THREE.MeshStandardMaterial({roughness:.4,metalness:.25,flatShading:true}),[]);
 const glow=useMemo(()=>new THREE.MeshBasicMaterial({color:new THREE.Color(colour).multiplyScalar(1.4),toneMapped:false}),[colour]);
 const {columns,bands,arches}=useMemo(()=>{const columns:InstanceItem[]=[],bands:InstanceItem[]=[],arches:InstanceItem[]=[];
  layout.portals.slice(0,-1).forEach((p,i)=>{if(i%2)return;const z=p.position[2]-STRONGHOLD_ISLAND-2.4;
   for(const side of [-1,1]){columns.push({p:[side*COLUMN_X,16,z],s:[1,1,1],c:tone('#26232a')});for(const y of [4.5,10.5])bands.push({p:[side*COLUMN_X,y,z],s:[1,1,1],c:'#ffffff'});}
   arches.push({p:[0,19,z],s:[1,1,1],c:tone('#2f2a30')});});
  return {columns,bands,arches};},[layout,tone]);
 useEffect(()=>()=>{column.dispose();band.dispose();arch.dispose();stone.dispose();glow.dispose();},[column,band,arch,stone,glow]);
 return <>
  <Instances geometry={column} material={stone} items={columns} obstacle/>
  <Instances geometry={band} material={glow} items={bands}/>
  <Instances geometry={arch} material={stone} items={arches}/>
 </>;
}

/** Far cliffs around the lake, rock spires standing in it, and lava pouring down the cliffs. */
export function FarWalls({layout,tone}:{layout:Layout;tone:Tone}){
 const rock=useMemo(()=>new THREE.IcosahedronGeometry(1,0),[]),material=useMemo(()=>new THREE.MeshStandardMaterial({roughness:.95,flatShading:true}),[]);
 const dot=useMemo(()=>softDotTexture(),[]);
 const rocks=useMemo(()=>{const out:InstanceItem[]=[];let i=2000;
  for(const side of [-1,1])for(let z=layout.startZ+14;z>layout.backZ-14;z-=4.2){i++;const h=26+rand(i)*26;out.push({p:[side*(WALL_X+rand(i+1)*5),h*.4,z],s:[4+rand(i+2)*3,h,4+rand(i+3)*2],r:[rand(i+4)*.3,rand(i+5)*3,side*(.06+rand(i+6)*.1)],c:rand(i+7)>.5?'#3a3031':'#2b2426'});}
  for(let x=-WALL_X;x<=WALL_X;x+=4.5){i++;const h=30+rand(i)*24;out.push({p:[x,h*.4,layout.backZ-6-rand(i+1)*4],s:[5,h,4],r:[rand(i+2)*.2,rand(i+3)*3,0],c:'#2b2426'});i++;out.push({p:[x,h*.35,layout.startZ+16+rand(i)*3],s:[5,h*.8,4],r:[0,rand(i+2)*3,0],c:'#262022'});}
  for(let z=layout.startZ-10;z>layout.coreZ;z-=11){i++;const side=rand(i)>.5?1:-1,h=10+rand(i+1)*16;out.push({p:[side*(19+rand(i+2)*11),LAKE_Y+h*.4,z+(rand(i+3)-.5)*6],s:[2+rand(i+4)*2,h,2+rand(i+5)*2],r:[rand(i+6)*.3,rand(i+7)*3,(rand(i+8)-.5)*.3],c:'#2e2729'});}
  return toned(out,tone);},[layout,tone]);
 const falls=useMemo(()=>{const out:{g:THREE.BufferGeometry;glow:SummitPoint;base:SummitPoint;top:number}[]=[];
  for(let z=layout.startZ-4,k=0;z>layout.backZ;z-=17,k++){const side=k%2?1:-1,top=20+rand(k+60)*14,cz0=z+(rand(k+70)-.5)*6,pos:number[]=[],uv:number[]=[],idx:number[]=[],n=30;
   for(let s=0;s<=n;s++){const t=s/n,x=side*(WALL_X-3.2-2.6*Math.pow(t,1.5)+Math.sin(t*6+k)*.4),y=LAKE_Y+(top-LAKE_Y)*(1-t),cz=cz0+Math.sin(t*4+k*2)*.8,w=1.3+1.6*t+Math.sin(t*9+k)*.2;
    pos.push(x,y,cz-w,x,y,cz+w);uv.push(0,t*top/5,1,t*top/5);if(s<n){const a=s*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);
   out.push({g,glow:[side*(WALL_X-3),top*.5,cz0],base:[side*(WALL_X-5.8),LAKE_Y+.6,cz0],top});}
  return out;},[layout]);
 useEffect(()=>()=>{rock.dispose();material.dispose();dot.dispose();falls.forEach(f=>f.g.dispose());},[rock,material,dot,falls]);
 return <>
  <Instances geometry={rock} material={material} items={rocks}/>
  {falls.map((f,i)=><group key={i}>
   <mesh geometry={f.g}><LavaMaterial scale={[1.4,.7]} flow={.5} edge={.9} bright={1.35} side={THREE.DoubleSide}/></mesh>
   <sprite position={f.glow} scale={[10,f.top*1.2,1]}><spriteMaterial map={dot} color="#ff6a24" transparent opacity={.3} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} fog={false}/></sprite>
   <sprite position={f.base} scale={[9,4,1]}><spriteMaterial map={dot} color="#ff8a3a" transparent opacity={.6} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false}/></sprite>
  </group>)}
 </>;
}

/** Realm-colour crystal clusters at the foot of the cliffs, behind each island's portal and around the Core plaza. */
export function HallCrystals({layout,colour,recovered}:{layout:Layout;colour:string;recovered:boolean}){
 const reduced=useReducedMotion(),geometry=useMemo(()=>crystalGeometry(),[]);
 const material=useMemo(()=>new THREE.MeshStandardMaterial({color:tint(colour,'#ffffff',.55),emissive:colour,emissiveIntensity:.8,roughness:.25,metalness:.1,flatShading:true}),[colour]);
 const items=useMemo(()=>{const out:InstanceItem[]=[];let i=6000;
  const cluster=(x:number,y:number,z:number,size:number)=>{for(let n=0;n<7;n++){i++;const s=size*(.5+rand(i)*.8);out.push({p:[x+(rand(i+1)-.5)*size,y,z+(rand(i+2)-.5)*size],s:[s,s*(1.2+rand(i+3)),s],r:[(rand(i+4)-.5)*1.1,rand(i+5)*6.3,(rand(i+6)-.5)*1.1],c:rand(i+7)>.7?'#ffffff':tint(colour,'#ffffff',rand(i+8)*.5)});}};
  for(const side of [-1,1])for(let z=layout.startZ;z>layout.backZ;z-=9){i++;cluster(side*(WALL_X-4.5-rand(i)*2),LAKE_Y,z+rand(i+1)*4,2.4+rand(i+2)*1.6);}
  for(const p of layout.portals){const [px,,pz]=p.position,side=Math.sign(px);cluster(px+side*3.2,0,pz-2.6,1);cluster(px+side*3.2,0,pz+2.6,.8);}
  for(let a=0;a<8;a++){const t=a/8*Math.PI*2+.3;cluster(Math.sin(t)*(STRONGHOLD_CORE_PLAZA-1.2),0,layout.coreZ+Math.cos(t)*(STRONGHOLD_CORE_PLAZA-1.2),1.2);}
  return out;},[colour,layout]);
 useFrame(({clock})=>{material.emissiveIntensity=(recovered?1.3:.8)+(reduced.current?0:Math.sin(clock.elapsedTime*.8)*.12);});
 useEffect(()=>()=>{geometry.dispose();material.dispose();},[geometry,material]);
 return <Instances geometry={geometry} material={material} items={items}/>;
}

/** Light that travels with the explorer: lava glow from below on both sides and the realm's light above. */
export function HallLights({position,colour,hall,recovered}:{position:React.RefObject<THREE.Vector3>;colour:string;hall:string;recovered:boolean}){
 const group=useRef<THREE.Group>(null);
 useFrame(()=>{const z=position.current?.z??0;group.current?.position.set(0,0,z);});
 return <group ref={group}>
  {[-1,1].map(side=><pointLight key={side} position={[side*8,-.4,-6]} color={hall} intensity={70} distance={34} decay={1.5}/>)}
  <pointLight position={[0,-.4,-30]} color={hall} intensity={60} distance={40} decay={1.5}/>
  <pointLight position={[0,11,-12]} color={colour} intensity={recovered?80:48} distance={42} decay={1.6}/>
 </group>;
}
