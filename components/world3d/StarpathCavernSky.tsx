'use client';
// Starpath's own cavern: the roof opens onto a starfield, constellations trace the shapes Starpath
// teaches, geometric solids drift along the walls and a coordinate grid glows across the floor.
// Built from code-drawn shapes only (no downloaded models); everything sits behind the realm's walls.
import {useEffect,useMemo,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Grid,Line} from '@react-three/drei';
import * as THREE from 'three';
import {rand,softDotTexture,useReducedMotion} from './VolcanicKit';
import type {SummitPoint} from '@/lib/world3d/number-summit';

const STAR='#e8ecff';
/** Constellation outlines in the sky plane (x across the cave, z along it), one per stretch of path. */
const SHAPES:{name:string;points:[number,number][];close:boolean}[]=[
 {name:'triangle',points:[[-6,0],[6,0],[0,9]],close:true},
 {name:'square',points:[[-5,-5],[5,-5],[5,5],[-5,5]],close:true},
 {name:'hexagon',points:Array.from({length:6},(_,i)=>[Math.cos(i*Math.PI/3)*6.5,Math.sin(i*Math.PI/3)*6.5] as [number,number]),close:true},
 {name:'cube',points:[[-5,-5],[3,-5],[3,3],[-5,3],[-5,-5],[-2,-2],[6,-2],[6,6],[-2,6],[-2,-2],[6,-2],[3,-5],[3,3],[6,6],[-2,6],[-5,3]],close:false},
 {name:'kite',points:[[0,-7],[5,0],[0,8],[-5,0]],close:true},
 {name:'pentagon',points:Array.from({length:5},(_,i)=>[Math.cos(i*2*Math.PI/5+Math.PI/2)*6.5,Math.sin(i*2*Math.PI/5+Math.PI/2)*6.5] as [number,number]),close:true},
];

/** The starfield follows the camera so the sky never runs out at the far end of the cave. */
function SkyDome({colour}:{colour:string}){
 const group=useRef<THREE.Group>(null),{camera}=useThree(),dot=useMemo(()=>softDotTexture(),[]);
 useFrame(()=>{group.current?.position.set(camera.position.x,0,camera.position.z);});
 useEffect(()=>()=>dot.dispose(),[dot]);
 const nebulae=useMemo(()=>Array.from({length:7},(_,i)=>({p:[(rand(i)-.5)*60,26+rand(i+3)*12,(rand(i+5)-.5)*60] as SummitPoint,s:30+rand(i+7)*24,c:i%2?colour:'#4d6bff'})),[colour]);
 // Stars on the upper half of a dome around the explorer, some brighter than others.
 const stars=useMemo(()=>{const n=1800,pos=new Float32Array(n*3),col=new Float32Array(n*3),c=new THREE.Color();
  for(let i=0;i<n;i++){const a=rand(i*3+1)*Math.PI*2,u=.12+rand(i*3+2)*.88,r=52+rand(i*3+3)*18,h=Math.sqrt(1-u*u);
   pos.set([Math.cos(a)*h*r,u*r,Math.sin(a)*h*r],i*3);c.set(rand(i+9)>.85?'#c9b8ff':'#ffffff').multiplyScalar(.55+rand(i+11)*.6);col.set([c.r,c.g,c.b],i*3);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));return g;},[]);
 useEffect(()=>()=>stars.dispose(),[stars]);
 return <group ref={group}>
  <points geometry={stars}><pointsMaterial map={dot} size={.9} sizeAttenuation vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} toneMapped={false}/></points>
  {nebulae.map((n,i)=><sprite key={i} position={n.p} scale={[n.s,n.s*.6,1]}><spriteMaterial map={dot} color={n.c} transparent opacity={.26} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} toneMapped={false}/></sprite>)}
 </group>;
}

function Constellation({index,z,colour}:{index:number;z:number;colour:string}){
 const shape=SHAPES[index%SHAPES.length],x=(index%2?1:-1)*2.5,y=19;
 const pts=shape.points.map(([a,b])=>new THREE.Vector3(x+a,y,z+b));
 const line=shape.close?[...pts,pts[0]]:pts;
 const unique=pts.filter((p,i)=>pts.findIndex(q=>q.distanceTo(p)<.01)===i);
 return <group>
  <Line points={line} color={colour} lineWidth={3} transparent opacity={.9} fog={false} toneMapped={false}/>
  {unique.map((p,i)=><mesh key={i} position={p}><sphereGeometry args={[.42,10,8]}/><meshBasicMaterial color={STAR} fog={false} toneMapped={false}/></mesh>)}
 </group>;
}

const SOLIDS=[
 ()=>new THREE.BoxGeometry(1.5,1.5,1.5),
 ()=>new THREE.TetrahedronGeometry(1.2),
 ()=>new THREE.OctahedronGeometry(1.1),
 ()=>new THREE.CylinderGeometry(.95,.95,1.6,3),   // triangular prism
 ()=>new THREE.ConeGeometry(1.1,1.7,4),           // square pyramid
 ()=>new THREE.DodecahedronGeometry(1),
];
/** A glass solid with bright edges, turning slowly: the 3D objects students meet in Starpath. */
type SolidKit={geometry:THREE.BufferGeometry;edges:THREE.EdgesGeometry};
function FloatingSolid({kit,at,colour,seed}:{kit:SolidKit;at:SummitPoint;colour:string;seed:number}){
 const reduced=useReducedMotion(),ref=useRef<THREE.Group>(null);
 useFrame(({clock})=>{const g=ref.current;if(!g||reduced.current)return;const t=clock.elapsedTime+seed;g.rotation.set(t*.25,t*.4,0);g.position.y=at[1]+Math.sin(t*.7)*.25;});
 return <group ref={ref} position={at} scale={1.45}>
  <mesh geometry={kit.geometry}><meshStandardMaterial color={colour} emissive={colour} emissiveIntensity={.8} transparent opacity={.4} depthWrite={false} roughness={.2}/></mesh>
  <lineSegments geometry={kit.edges}><lineBasicMaterial color={STAR} toneMapped={false}/></lineSegments>
 </group>;
}

export default function StarpathCavernSky({colour,start,end}:{colour:string;start:number;end:number}){
 const solids=useMemo(()=>{const out:{at:SummitPoint;kind:number;seed:number}[]=[];let i=0;
  for(let z=start-6;z>end+6;z-=9){const side=i%2?1:-1;out.push({at:[side*(7.4+rand(i)*.8),3.6+rand(i+1)*2.4,z],kind:i,seed:rand(i+2)*10});i++;}
  return out;},[start,end]);
 // Each solid shape is built once and shared by every copy along the cave.
 const kits=useMemo(()=>SOLIDS.map(make=>{const geometry=make();return {geometry,edges:new THREE.EdgesGeometry(geometry)};}),[]);
 useEffect(()=>()=>kits.forEach(k=>{k.geometry.dispose();k.edges.dispose();}),[kits]);
 const skies=useMemo(()=>{const out:number[]=[];for(let z=start-14;z>end;z-=30)out.push(z);return out;},[start,end]);
 return <>
  <SkyDome colour={colour}/>
  {skies.map((z,i)=><Constellation key={z} index={i} z={z} colour={colour}/>)}
  {solids.map((s,i)=><FloatingSolid key={i} kit={kits[s.kind%kits.length]} at={s.at} colour={colour} seed={s.seed}/>)}
  {/* A faint coordinate plane under the path: Starpath's grids and axes. */}
  <Grid position={[0,.015,(start+end)/2]} args={[18,start-end]} cellSize={1} cellThickness={.6} cellColor="#3d3a78" sectionSize={4} sectionThickness={1.2} sectionColor={colour} fadeDistance={46} fadeStrength={1.4} followCamera={false} infiniteGrid={false}/>
 </>;
}
