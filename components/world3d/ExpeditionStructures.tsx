'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Box,Beam,Lantern,Stone,Trail } from './ExpeditionCrossroads';
import { EXPEDITION_TRAILS,crossroadsTerrain } from '@/lib/world3d/expedition-crossroads';
import { VOLCANO_ROUTE,VOLCANO_DOORS,VOLCANO_GATE,volcanoProjection } from '@/lib/world3d/volcano-expedition';
import Plaque from './WorldPlaque';
import ExpeditionDistanceDetail from './ExpeditionDistanceDetail';
import { AscentMarkers,Causeway,FinalBattleGate,SummitCrater,SummitDressing,SummitFloor,SummitGateway,VolcanoSea } from './VolcanoSummit';
import { LavaMaterial } from './VolcanicKit';
import type { SummitPoint } from '@/lib/world3d/number-summit';

function Crate({at,size=1}:{at:SummitPoint;size?:number}){return <group position={at} scale={size}><Box at={[0,.65,0]} size={[1.4,1.3,1.2]} colour="#766047"/>{[-.5,.5].map(x=><Box key={x} at={[x,.66,.62]} size={[.1,1.32,.08]} colour="#383e3d"/>)}<Beam a={[-.6,.1,.66]} b={[.6,1.2,.66]} width={.045} colour="#b29870"/></group>;}
function Banner({at,colour='#8d3e33'}:{at:SummitPoint;colour?:string}){const flag=useRef<THREE.Mesh>(null);useFrame(({clock})=>{if(flag.current)flag.current.rotation.y=Math.sin(clock.elapsedTime*1.8+at[0])*.08;});return <group position={at}><Beam a={[0,0,0]} b={[0,7,0]} width={.1} colour="#42494a"/><mesh ref={flag} position={[1.05,5.2,0]}><planeGeometry args={[2,2.7]}/><meshStandardMaterial color={colour} side={THREE.DoubleSide} roughness={1}/></mesh><mesh position={[1.05,5.2,.035]} rotation={[0,0,Math.PI/4]}><ringGeometry args={[.38,.58,4]}/><meshStandardMaterial color="#d8b680" side={THREE.DoubleSide}/></mesh></group>;}
function Watchtower({at}:{at:SummitPoint}){return <group position={at}>
 {[-2,2].flatMap(x=>[-2,2].map(z=><Beam key={`${x}${z}`} a={[x,0,z]} b={[x,9,z]} width={.27} colour="#5e5545"/>))}
 {[-2,2].map(z=><group key={z}><Beam a={[-2,0,z]} b={[2,6,z]} width={.14}/><Beam a={[2,0,z]} b={[-2,6,z]} width={.14}/></group>)}
 <Box at={[0,6,0]} size={[5,.45,5]} colour="#74634d"/>
 {[-2.3,2.3].map(x=><Box key={x} at={[x,7,0]} size={[.18,1.5,4.8]} colour="#665a47"/>)}
 <mesh position={[0,9,0]} rotation={[0,Math.PI/4,0]} castShadow><coneGeometry args={[4,2,4]}/><meshStandardMaterial color="#404e4e" roughness={.9}/></mesh>
 <Lantern at={[0,6.2,2]}/><Banner at={[-2,9,-1]} colour="#496e69"/>
 </group>;}
function Shelter({at}:{at:SummitPoint}){return <group position={at} rotation={[0,-.25,0]}>
 <Box at={[0,.15,0]} size={[10,.3,7]} colour="#555a52"/>
 {[-4.5,4.5].flatMap(x=>[-2.8,2.8].map(z=><Beam key={`${x}${z}`} a={[x,0,z]} b={[x,4.4,z]} width={.18}/>))}
 <Box at={[0,2,-3]} size={[9,4,.25]} colour="#5f6050"/>
 {[-1,1].map(side=><mesh key={side} position={[side*2.6,4.8,0]} rotation={[0,0,side*-.25]} castShadow><boxGeometry args={[5.6,.2,7.7]}/><meshStandardMaterial color="#435c59" roughness={.85}/></mesh>)}
 <Plaque at={[0,3.1,3.2]} title="FIELD WORKSHOP" subtitle="REPAIR · REGROUP · RETURN" width={5}/>
 <Crate at={[-3,.3,-1]}/><Crate at={[-1.5,.3,-1]} size={.8}/><Box at={[2,1.4,-1]} size={[3,.2,1.5]} colour="#8d7959"/><Lantern at={[2,1.5,-1]}/>
 </group>;}
export function ExpeditionOutpost(){return <group>
 <Shelter at={[-13,0,82]}/><Watchtower at={[-16,0,94]}/><Watchtower at={[16,0,94]}/>
 {[-1,1].map(side=><group key={side}>
 {Array.from({length:7},(_,i)=><group key={i} position={[side*(7+i*1.7),0,96]}><Box at={[0,1,0]} size={[1.6,2,1.3]} colour={i%2?'#6f7568':'#626b62'}/><Beam a={[0,1.5,0]} b={[0,3.6,0]} width={.22} colour="#5e5545"/></group>)}
 <Lantern at={[side*6,2,96]}/></group>)}
 <Crate at={[12,0,84]} size={1.4}/><Crate at={[14,0,84]}/><Crate at={[12,1.8,84]} size={.8}/>
 <Plaque at={[0,7,99]} title="SIXFOLD OUTPOST" subtitle="HOLD THE LINE. RESTORE THE CORES." width={8}/>
 </group>;}
function Steam({at,count=10,scale=1}:{at:SummitPoint;count?:number;scale?:number}){
 const particles=useRef<THREE.Points>(null);
 const geometry=useMemo(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(count*3),3));return g;},[count]);
 const texture=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d')!;const gradient=ctx.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(214,220,215,.65)');gradient.addColorStop(.4,'rgba(198,209,202,.28)');gradient.addColorStop(1,'rgba(198,209,202,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);return new THREE.CanvasTexture(canvas);},[]);
 useEffect(()=>()=>{texture.dispose();geometry.dispose();},[texture,geometry]);
 useFrame(({clock})=>{const p=particles.current?.geometry.attributes.position;if(!p)return;for(let i=0;i<count;i++){const t=(clock.elapsedTime*.055+i/count)%1;p.setXYZ(i,Math.sin(i*4+t*2)*t*3,t*17,Math.cos(i*3+t)*t*2);}p.needsUpdate=true;});
 return <points ref={particles} geometry={geometry} position={at} scale={scale} frustumCulled={false}><pointsMaterial map={texture} size={6*scale} transparent opacity={.35} depthWrite={false} sizeAttenuation color="#abb6b4"/></points>;
}
export function NumberCavernEntrance(){return <group position={[-90,0,-25]}>
 {[-1,1].map(side=><group key={side}><Stone at={[side*9,6,-5]} scale={[6,11,7]} colour="#414957"/><mesh position={[side*6,2,1]} scale={[1,3,1]}><octahedronGeometry/><meshStandardMaterial color="#67cdb7" emissive="#286b66" emissiveIntensity={.7}/></mesh></group>)}
 <Stone at={[0,12,-6]} scale={[11,4,7]} colour="#414957"/>
 <Box at={[0,4,-9]} size={[12,9,.5]} colour="#111a25"/>
 </group>;}
function CraterFortress(){
 const ref=useRef<THREE.InstancedMesh>(null);
 const bricks=useMemo(()=>{const matrices:THREE.Matrix4[]=[];const dummy=new THREE.Object3D();for(let row=0;row<7;row++)for(let i=0;i<42;i++){
 const a=(i+(row%2)*.5)*Math.PI*2/42;
 // A real opening in the southern wall admits the mountain trail.
 if(Math.cos(a)>.96)continue;
 dummy.position.set(Math.sin(a)*26,70+row*1.3+.65,-130+Math.cos(a)*26);dummy.rotation.set(0,a,0);dummy.scale.set(3.7,1.22,1.8);dummy.updateMatrix();matrices.push(dummy.matrix.clone());
 }for(let i=0;i<32;i++){const a=i*Math.PI/16;if(Math.cos(a)>.96)continue;dummy.position.set(Math.sin(a)*26,80,-130+Math.cos(a)*26);dummy.rotation.set(0,a,0);dummy.scale.set(2.4,2,2);dummy.updateMatrix();matrices.push(dummy.matrix.clone());}return matrices;},[]);
 useEffect(()=>{if(!ref.current)return;bricks.forEach((m,i)=>{ref.current!.setMatrixAt(i,m);ref.current!.setColorAt(i,new THREE.Color(i%3===0?'#463b39':'#2e2829'));});ref.current.instanceMatrix.needsUpdate=true;if(ref.current.instanceColor)ref.current.instanceColor.needsUpdate=true;},[bricks]);
 return <><instancedMesh ref={ref} userData={{cameraObstacle:true}} args={[undefined,undefined,bricks.length]} frustumCulled={false} castShadow receiveShadow><boxGeometry/><meshStandardMaterial roughness={.95}/></instancedMesh>
 <pointLight position={[0,69,-130]} color="#f69b4b" intensity={85} distance={45} decay={1.5}/>
 </>;
}
const SEAM_ANGLES=[.06,.49,1.08,1.68,2.04,2.67,3.11,3.7,4.12,4.77,5.24,5.83];
/** Lava flows down the volcano's flanks, following its real surface. */
function LavaSeams(){
 const geometry=useMemo(()=>{
  const vertices:number[]=[],uv:number[]=[],indices:number[]=[];
  // Uneven spacing and winding channels follow the volcano's actual surface.
  SEAM_ANGLES.forEach((angle,river)=>{for(let r=27;r<94;r+=1.25){
   const point=(radius:number,lateral:number)=>{
    const a=angle+Math.sin(radius*.085+river*2)*.065+Math.sin(radius*.19+river)*.018;
    const halfWidth=2.1+Math.sin(radius*.13+river)*.8+Math.sin(radius*.31+river*4)*.25+(radius-27)*.015;
    return [Math.sin(a)*radius+Math.cos(a)*lateral*halfWidth,-130+Math.cos(a)*radius-Math.sin(a)*lateral*halfWidth];
   };
   for(let j=0;j<4;j++){
    const corners=[point(r,j/2-1),point(r,(j+1)/2-1),point(r+1.25,j/2-1),point(r+1.25,(j+1)/2-1)];
    if(corners.some(([x,z])=>volcanoProjection(x,z).distance<4.1))continue;
    const k=vertices.length/3;
    corners.forEach(([x,z],i)=>{vertices.push(x,crossroadsTerrain(x,z)+.18,z);uv.push((j+i%2)/4,(r+(i>1?1.25:0))/24+river*.37);});
    indices.push(k,k+2,k+1,k+1,k+2,k+3);
   }
  }});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
 },[]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry}><LavaMaterial scale={[1.4,7]} flow={.035} edge={1} bright={1.35} side={THREE.DoubleSide}/></mesh>;
}
export function VolcanoExpedition({open,unlockedRealms,recoveredRealms=[]}:{open:boolean;unlockedRealms:string[];recoveredRealms?:string[]}){return <group>
 <Trail points={VOLCANO_ROUTE} colour="#6a605c" layer={8}/><LavaSeams/>
 <VolcanoSea/><Causeway/>
 {/* Steam rises where the lava flows meet the sea. */}
 {SEAM_ANGLES.slice(1).map(a=><Steam key={a} at={[Math.sin(a)*96,-1.2,-130+Math.cos(a)*96]} count={6} scale={1.3}/>)}
 <FinalBattleGate open={open}/>
 <group position={VOLCANO_GATE}>
 <Plaque at={[0,18.2,1.4]} title="THE FINAL BATTLE" subtitle={open?'LEVEL 8 · GATE OPEN':'SEALED · FINISH ANY LEVEL 7'} width={9} colour={open?'#ffc76b':'#d5a176'}/>
 <Banner at={[-10.5,0,1]}/><Banner at={[10.5,0,1]}/>
 </group>
 <ExpeditionDistanceDetail x={0} z={-115} distance={150}>
 <AscentMarkers/>
 {Array.from({length:12},(_,i)=>{const a=i*Math.PI/6,r=72;return <group key={i}><Stone at={[Math.sin(a)*r,15,-130+Math.cos(a)*r]} scale={[5,10+i%3*3,5]} colour="#2f2a2a"/>{i%3===0&&<Steam at={[Math.sin(a)*r,23,-130+Math.cos(a)*r]} count={7} scale={1.4}/>}</group>;})}
 {/* The central lava pit is physically excluded from the summit walking floor. */}
 <SummitCrater/><SummitFloor/>
 <pointLight position={[0,73,-130]} color="#ff8c3c" intensity={220} distance={65} decay={2}/>
 <SummitDressing doorAngles={VOLCANO_DOORS.map((_,i)=>(i+.5)*Math.PI/3)}/>
 {VOLCANO_DOORS.map((p,i)=>{const angle=(i+.5)*Math.PI/3,t=EXPEDITION_TRAILS[i],active=unlockedRealms.includes(t.id);return <group key={t.id} position={p} rotation={[0,angle+Math.PI,0]}>
 <SummitGateway colour={t.colour} open={active} seed={i}/>
 <Plaque at={[0,10.6,.6]} title={t.name.toUpperCase()} subtitle={active?'ENTER STRONGHOLD':'LOCKED · COMPLETE LEVEL 7'} width={8.5} colour={t.colour}/>
 {recoveredRealms.includes(t.id)&&<mesh position={[0,13.2,0]} scale={[.8,1.4,.8]}><octahedronGeometry/><meshStandardMaterial color={t.colour} emissive={t.colour} emissiveIntensity={2}/></mesh>}
 </group>;})}
 <CraterFortress/><Steam at={[0,63,-130]} count={12} scale={2}/>
 </ExpeditionDistanceDetail>
 </group>;}
