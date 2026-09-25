'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Box,Beam,Lantern,Stone,Trail } from './ExpeditionCrossroads';
import { EXPEDITION_TRAILS,crossroadsTerrain } from '@/lib/world3d/expedition-crossroads';
import { VOLCANO_ROUTE,VOLCANO_DOORS,VOLCANO_GATE,volcanoProjection } from '@/lib/world3d/volcano-expedition';
import Plaque from './WorldPlaque';
import ExpeditionDistanceDetail from './ExpeditionDistanceDetail';
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
function Gear({at,radius=2}:{at:SummitPoint;radius?:number}){const gear=useRef<THREE.Group>(null);useFrame((_,dt)=>{if(gear.current)gear.current.rotation.z+=Math.min(dt,.05)*.18;});return <group ref={gear} position={at}>
 <mesh rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[radius,radius,.45,20]}/><meshStandardMaterial color="#697779" metalness={.7} roughness={.6}/></mesh>
 {Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return <mesh key={i} position={[Math.cos(a)*radius,Math.sin(a)*radius,0]} rotation={[0,0,a]} castShadow><boxGeometry args={[.65,.45,.55]}/><meshStandardMaterial color="#485557" metalness={.65} roughness={.55}/></mesh>;})}
 <mesh rotation={[Math.PI/2,0,0]} position={[0,0,.3]}><cylinderGeometry args={[radius*.3,radius*.3,.25,12]}/><meshStandardMaterial color="#bd8b4c" metalness={.6}/></mesh>
 </group>;}
function Steam({at,count=10,scale=1}:{at:SummitPoint;count?:number;scale?:number}){
 const particles=useRef<THREE.Points>(null);
 const geometry=useMemo(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(count*3),3));return g;},[count]);
 const texture=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d')!;const gradient=ctx.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(214,220,215,.65)');gradient.addColorStop(.4,'rgba(198,209,202,.28)');gradient.addColorStop(1,'rgba(198,209,202,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);return new THREE.CanvasTexture(canvas);},[]);
 useEffect(()=>()=>{texture.dispose();geometry.dispose();},[texture,geometry]);
 useFrame(({clock})=>{const p=particles.current?.geometry.attributes.position;if(!p)return;for(let i=0;i<count;i++){const t=(clock.elapsedTime*.055+i/count)%1;p.setXYZ(i,Math.sin(i*4+t*2)*t*3,t*17,Math.cos(i*3+t)*t*2);}p.needsUpdate=true;});
 return <points ref={particles} geometry={geometry} position={at} scale={scale} frustumCulled={false}><pointsMaterial map={texture} size={6*scale} transparent opacity={.35} depthWrite={false} sizeAttenuation color="#abb6b4"/></points>;
}
function Factory({at,width=14,height=11}:{at:SummitPoint;width?:number;height?:number}){return <group position={at}>
 <Box at={[0,height/2,0]} size={[width,height,8]} colour="#414e50"/>
 {Array.from({length:Math.floor(width/2)},(_,i)=><Box key={i} at={[-width/2+1+i*2,height/2,4.08]} size={[.12,height,.16]} colour="#687071"/>)}
 <Box at={[0,height+.25,0]} size={[width+1,.5,9]} colour="#303c40"/>
 {[-1,1].map(x=><group key={x}><Box at={[x*(width/2-2),height*.65,4.13]} size={[2,2,.12]} colour="#dc9658"/><Box at={[x*(width/2-2),height*.65,4.22]} size={[.12,2,.1]} colour="#283437"/></group>)}
 <Box at={[0,2.5,4.15]} size={[4,5,.25]} colour="#202c31"/><Gear at={[0,height*.72,4.5]} radius={1.4}/>
 <Beam a={[-width/2+2,height,0]} b={[-width/2+2,height+9,0]} width={1} colour="#3e494a"/><Steam at={[-width/2+2,height+9,0]}/>
 <Banner at={[width/2+1,0,3]}/>
 </group>;}
export function FoundryDistrict(){return <group>
 <Factory at={[-107,0,-30]} width={12} height={10}/><Factory at={[-73,0,-36]} width={12} height={15}/>

 </group>;}
function CraterFortress(){
 const ref=useRef<THREE.InstancedMesh>(null);
 const bricks=useMemo(()=>{const matrices:THREE.Matrix4[]=[];const dummy=new THREE.Object3D();for(let row=0;row<7;row++)for(let i=0;i<42;i++){
 const a=(i+(row%2)*.5)*Math.PI*2/42;
 // A real opening in the southern wall admits the mountain trail.
 if(Math.cos(a)>.96)continue;
 dummy.position.set(Math.sin(a)*26,70+row*1.3+.65,-130+Math.cos(a)*26);dummy.rotation.set(0,a,0);dummy.scale.set(3.7,1.22,1.8);dummy.updateMatrix();matrices.push(dummy.matrix.clone());
 }for(let i=0;i<32;i++){const a=i*Math.PI/16;if(Math.cos(a)>.96)continue;dummy.position.set(Math.sin(a)*26,80,-130+Math.cos(a)*26);dummy.rotation.set(0,a,0);dummy.scale.set(2.4,2,2);dummy.updateMatrix();matrices.push(dummy.matrix.clone());}return matrices;},[]);
 useEffect(()=>{if(!ref.current)return;bricks.forEach((m,i)=>{ref.current!.setMatrixAt(i,m);ref.current!.setColorAt(i,new THREE.Color(i%3===0?'#556064':'#414e52'));});ref.current.instanceMatrix.needsUpdate=true;if(ref.current.instanceColor)ref.current.instanceColor.needsUpdate=true;},[bricks]);
 return <><instancedMesh ref={ref} args={[undefined,undefined,bricks.length]} frustumCulled={false} castShadow receiveShadow><boxGeometry/><meshStandardMaterial roughness={.95}/></instancedMesh>
 <pointLight position={[0,69,-130]} color="#f69b4b" intensity={85} distance={45} decay={1.5}/>
 {Array.from({length:24},(_,i)=>{const a=i*Math.PI/12;return <mesh key={i} position={[Math.sin(a)*15,70.03,-130+Math.cos(a)*15]} rotation={[-Math.PI/2,0,-a]} receiveShadow><planeGeometry args={[.09,12]}/><meshStandardMaterial color="#303d40"/></mesh>;})}
 </>;
}
function LavaSeams(){
 const material=useRef<THREE.MeshStandardMaterial>(null);
 const texture=useMemo(()=>{
  const width=256,height=512,data=new Uint8Array(width*height*4);
  const hash=(x:number,y:number)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
  const noise=(x:number,y:number)=>{const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(ix,iy),hash(ix+1,iy),sx),THREE.MathUtils.lerp(hash(ix,iy+1),hash(ix+1,iy+1),sx),sy);};
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const u=x/(width-1),v=y/height;
   // Stretched, uneven cooled plates with narrow hot cracks between them.
   const px=u*4+noise(u*5,v*12)*.8,py=v*14;let first=10,second=10;
   for(let iy=-1;iy<=1;iy++)for(let ix=-1;ix<=1;ix++){const cx=Math.floor(px)+ix,cy=Math.floor(py)+iy;const d=Math.hypot(px-cx-hash(cx,cy),py-cy-hash(cx+51,cy+17));if(d<first){second=first;first=d;}else if(d<second)second=d;}
   const cracks=1-THREE.MathUtils.smoothstep(second-first,.035,.2);
   const pools=THREE.MathUtils.smoothstep(noise(u*4,v*10),.32,.76);
   const edge=THREE.MathUtils.smoothstep(Math.min(u,1-u),.015,.2);
   const heat=Math.min(1,(cracks*.38+pools*1.1)*edge);
   const crust=new THREE.Color('#282322').lerp(new THREE.Color('#593328'),noise(u*29,v*63));
   const molten=new THREE.Color('#af3010').lerp(new THREE.Color('#ef711b'),THREE.MathUtils.smoothstep(heat,.2,.75));
   molten.lerp(new THREE.Color('#ffc16b'),THREE.MathUtils.smoothstep(heat,.85,1)*.65);
   crust.lerp(molten,THREE.MathUtils.smoothstep(heat,.12,.68));
   const grain=.9+noise(u*90,v*170)*.1;crust.multiplyScalar(grain).convertLinearToSRGB();
   const k=(y*width+x)*4;data[k]=Math.round(crust.r*255);data[k+1]=Math.round(crust.g*255);data[k+2]=Math.round(crust.b*255);data[k+3]=255;
  }
  const map=new THREE.DataTexture(data,width,height);map.colorSpace=THREE.SRGBColorSpace;map.wrapT=THREE.RepeatWrapping;map.minFilter=THREE.LinearMipmapLinearFilter;map.magFilter=THREE.LinearFilter;map.generateMipmaps=true;map.anisotropy=4;map.needsUpdate=true;return map;
 },[]);
 const geometry=useMemo(()=>{
  const vertices:number[]=[],uv:number[]=[],indices:number[]=[];
  // Uneven spacing and winding channels follow the volcano's actual surface.
  const angles=[.06,.49,1.08,1.68,2.04,2.67,3.11,3.7,4.12,4.77,5.24,5.83];
  angles.forEach((angle,river)=>{for(let r=27;r<94;r+=1.25){
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
 useFrame(({clock},delta)=>{texture.offset.y-=Math.min(delta,.05)*.018;if(material.current)material.current.emissiveIntensity=.52+Math.sin(clock.elapsedTime*.35)*.04;});
 useEffect(()=>()=>{texture.dispose();geometry.dispose();},[texture,geometry]);
 return <mesh geometry={geometry}><meshStandardMaterial ref={material} map={texture} emissiveMap={texture} emissive="#ffffff" emissiveIntensity={.52} roughness={.95} side={THREE.DoubleSide}/></mesh>;
}
export function VolcanoExpedition({open,unlockedRealms}:{open:boolean;unlockedRealms:string[]}){return <group>
 <Trail points={VOLCANO_ROUTE} colour="#777269" layer={8}/><LavaSeams/>
 <group position={VOLCANO_GATE}>
 {[-4.3,4.3].map(x=><group key={x}><Box at={[x,3.5,0]} size={[2,7,3]} colour="#465050"/><Box at={[x,7.2,0]} size={[2.6,.6,3.6]} colour="#68716d"/><Lantern at={[x,7.6,0]}/></group>)}
 <Box at={[0,7,0]} size={[10,1,2.5]} colour="#4f5957"/>
 {!open&&Array.from({length:9},(_,i)=><Beam key={i} a={[-3.4+i*.85,0,0]} b={[-3.4+i*.85,6.5,0]} width={.11} colour="#27373d"/>)}
 <Plaque at={[0,8.8,1.4]} title="THE FINAL BATTLE" subtitle={open?'LEVEL 8 · GATE OPEN':'SEALED · FINISH ANY LEVEL 7'} width={9} colour={open?'#8dcbb5':'#d5a176'}/>
 <Banner at={[-6,0,1]}/><Banner at={[6,0,1]}/>
 </group>
 <ExpeditionDistanceDetail x={0} z={-115} distance={150}>
 {/* Basalt ribs, ember vents and guardrails follow the actual walkable ascent. */}
 {VOLCANO_ROUTE.filter((_,i)=>i>7&&i%6===0).map((p,i)=>{const a=Math.atan2(p[0],p[2]+130),outside:SummitPoint=[p[0]+Math.sin(a)*3.7,p[1],p[2]+Math.cos(a)*3.7];return <group key={i}><Box at={[outside[0],outside[1]+.6,outside[2]]} size={[.7,1.2,.7]} colour="#535b58"/>{i%3===0&&<Lantern at={[outside[0],outside[1]+1.3,outside[2]]}/>}</group>;})}
 {Array.from({length:12},(_,i)=>{const a=i*Math.PI/6,r=72;return <group key={i}><Stone at={[Math.sin(a)*r,15,-130+Math.cos(a)*r]} scale={[5,10+i%3*3,5]} colour="#384345"/>{i%3===0&&<Steam at={[Math.sin(a)*r,23,-130+Math.cos(a)*r]} count={7} scale={1.4}/>}</group>;})}
 {/* The central lava pit is physically excluded from the summit walking floor. */}
 <mesh position={[0,62.4,-130]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[8,48]}/><meshStandardMaterial color="#f1893d" emissive="#ef652b" emissiveIntensity={2}/></mesh>
 <mesh position={[0,70,-130]} rotation={[-Math.PI/2,0,0]} receiveShadow><ringGeometry args={[8.5,25,64]}/><meshStandardMaterial color="#555c58" roughness={.95}/></mesh>
 {Array.from({length:32},(_,i)=>{const a=i*Math.PI/16;return <Box key={i} at={[Math.sin(a)*8.7,70.7,-130+Math.cos(a)*8.7]} size={[1.5,1.4,1.5]} colour="#333f41"/>;})}
 {VOLCANO_DOORS.map((p,i)=>{const angle=(i+.5)*Math.PI/3,t=EXPEDITION_TRAILS[i],active=unlockedRealms.includes(t.id);return <group key={t.id} position={p} rotation={[0,angle+Math.PI,0]}>
 {[-3.1,3.1].map(x=><group key={x}><Box at={[x,4,0]} size={[1.6,8,2.2]} colour="#303c42"/><Box at={[x,8.4,0]} size={[2.1,1,2.7]} colour="#505d5e"/></group>)}
 <Box at={[0,7.5,0]} size={[7.2,1.6,2]} colour="#404d51"/>
 <mesh position={[0,3.5,0]}><planeGeometry args={[4.7,6.4]}/><meshStandardMaterial color={t.colour} emissive={t.colour} emissiveIntensity={active?1:.15} transparent opacity={active?.7:.18} side={THREE.DoubleSide}/></mesh>
 {!active&&[-1.7,-.85,0,.85,1.7].map(x=><Beam key={x} a={[x,.2,.1]} b={[x,6.7,.1]} width={.09} colour="#4a5052"/>)}
 <Plaque at={[0,9.7,.8]} title={t.name.toUpperCase()} subtitle={active?'CORE STRONGHOLD · PREVIEW':'LEVEL 8 · FINISH THIS REALM’S LEVEL 7'} width={7} colour={t.colour}/>
 <Banner at={[4,0,0]} colour={t.colour}/>
 </group>;})}
 <CraterFortress/><Steam at={[0,63,-130]} count={12} scale={2}/>
 </ExpeditionDistanceDetail>
 </group>;}
