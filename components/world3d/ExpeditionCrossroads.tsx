'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import WorldPlaque from './WorldPlaque';
import ExpeditionForest from './ExpeditionForest';
import ExpeditionDistanceDetail from './ExpeditionDistanceDetail';
import * as THREE from 'three';
import { DetailedScenery } from './DetailedScenery';
import { EXPEDITION_TRAILS,TRAIL_SAMPLES,crossroadsTerrain,nearestTrail,trailThreat } from '@/lib/world3d/expedition-crossroads';
import type { SummitPoint } from '@/lib/world3d/number-summit';

export function Box({at,size,colour='#6b5945',rotation=0}:{at:SummitPoint;size:SummitPoint;colour?:string;rotation?:number}){
 return <mesh position={at} rotation={[0,rotation,0]} castShadow receiveShadow><boxGeometry args={size}/><meshLambertMaterial color={colour}/></mesh>;
}
export function Beam({a,b,width=.12,colour='#77634b'}:{a:SummitPoint;b:SummitPoint;width?:number;colour?:string}){
 const x=new THREE.Vector3(...a),y=new THREE.Vector3(...b),d=y.clone().sub(x);
 return <mesh position={x.add(y).multiplyScalar(.5)} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize())} castShadow><cylinderGeometry args={[width,width,d.length(),7]}/><meshLambertMaterial color={colour}/></mesh>;
}
export function Lantern({at}:{at:SummitPoint}){
 return <group position={at}><Box at={[0,.22,0]} size={[.48,.12,.48]} colour="#343f3c"/><Box at={[0,.75,0]} size={[.48,.12,.48]} colour="#343f3c"/><mesh position={[0,.48,0]}><boxGeometry args={[.3,.43,.3]}/><meshStandardMaterial color="#ffe0a1" emissive="#ffc36b" emissiveIntensity={1.3}/></mesh>{[-.18,.18].map(x=><Beam key={x} a={[x,.2,0]} b={[x,.8,0]} width={.035} colour="#39443e"/>)}</group>;
}
export function Stone({at,scale,colour='#818679'}:{at:SummitPoint;scale:SummitPoint;colour?:string}){
 return <mesh position={at} scale={scale} rotation={[.2,at[0],.15]} castShadow receiveShadow><dodecahedronGeometry args={[1,1]}/><meshLambertMaterial color={colour}/></mesh>;
}
export function Trail({points,colour='#b8a17c',layer=1}:{points:SummitPoint[];colour?:string;layer?:number}){
 const gravel=useMemo(()=>{const data=new Uint8Array(64*64*4);let seed=37;for(let i=0;i<64*64;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const grain=180+seed%70;data.set([grain,grain,grain,255],i*4);}const texture=new THREE.DataTexture(data,64,64);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;texture.needsUpdate=true;return texture;},[]);
 useEffect(()=>()=>gravel.dispose(),[gravel]);
 const geometry=useMemo(()=>{
  const vertices:number[]=[],indices:number[]=[],uv:number[]=[],colours:number[]=[];let distance=0;
  const samples:SummitPoint[]=[];points.slice(0,-1).forEach((a,i)=>{const b=points[i+1],steps=Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2]));for(let j=0;j<steps;j++){const t=j/steps;samples.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]);}});samples.push(points[points.length-1]);
  samples.forEach((p,i)=>{if(i>0)distance+=Math.hypot(p[0]-samples[i-1][0],p[2]-samples[i-1][2]);const a=samples[Math.max(0,i-1)],b=samples[Math.min(samples.length-1,i+1)],dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz),w=2.9+Math.sin(i*.4)*.13;for(const side of [-1,1]){vertices.push(p[0]-dz/len*w*side,p[1]+.08,p[2]+dx/len*w*side);uv.push(side===-1?0:2,distance*.35);const c=new THREE.Color('#ffffff').lerp(new THREE.Color('#868187'),trailThreat(p[0],p[2])*.65);colours.push(c.r,c.g,c.b);}if(i<samples.length-1&&Math.hypot(p[0],p[2]-65)>12){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));g.setIndex(indices);g.computeVertexNormals();return g;
 },[points]);
 return <mesh geometry={geometry} receiveShadow><meshLambertMaterial vertexColors color={colour} map={gravel} side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-layer} polygonOffsetUnits={-layer}/></mesh>;
}
function Waymark({index}:{index:number}){
 const t=EXPEDITION_TRAILS[index],p=TRAIL_SAMPLES[index][22],next=TRAIL_SAMPLES[index][24],angle=Math.atan2(next[0]-p[0],next[2]-p[2]);
 const label=useMemo(()=>{const c=document.createElement('canvas');c.width=2048;c.height=512;const ctx=c.getContext('2d')!;ctx.scale(2048/768,512/192);ctx.fillStyle='#101e25';ctx.fillRect(0,0,768,192);ctx.strokeStyle=t.colour;ctx.lineWidth=8;ctx.beginPath();ctx.arc(78,96,48,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff0c9';ctx.font='bold 60px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(index+1),78,100);ctx.font='bold 64px sans-serif';ctx.fillText(t.name,440,100,570);const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=16;map.generateMipmaps=false;map.minFilter=THREE.LinearFilter;map.magFilter=THREE.LinearFilter;return map;},[index,t.colour,t.name]);
 useEffect(()=>()=>label.dispose(),[label]);
 return <group position={[p[0]+Math.cos(angle)*3.2,p[1],p[2]-Math.sin(angle)*3.2]} rotation={[0,angle,0]}>
  {/* The post stops beneath the board, leaving both faces and the walking lane clear. */}
  <Beam a={[0,0,0]} b={[0,2.4,0]} width={.14}/><Lantern at={[0,3.6,0]}/>
  <Box at={[0,3,0]} size={[4.6,1.2,.22]} colour="#635947"/>
  {[0,Math.PI].map(a=><mesh key={a} rotation={[0,a,0]} position={[0,3,a===0?.15:-.15]}><planeGeometry args={[4.5,1.12]}/><meshBasicMaterial map={label} toneMapped={false} fog={false}/></mesh>)}
 </group>;
}
function Barrier({index}:{index:number}){
 const path=TRAIL_SAMPLES[index],p=path[58],n=path[60],angle=Math.atan2(n[0]-p[0],n[2]-p[2]);
 return <group position={p} rotation={[0,angle,0]}>
  {[-2.8,2.8].map(x=><group key={x}><Beam a={[x,0,0]} b={[x,2.1,0]} width={.17}/><Lantern at={[x,2.1,0]}/></group>)}
  <Beam a={[-2.8,.6,0]} b={[2.8,1.6,0]} width={.14}/><Beam a={[-2.8,1.6,0]} b={[2.8,.6,0]} width={.14}/>
  <WorldPlaque at={[0,4,0]} title={EXPEDITION_TRAILS[index].name.toUpperCase()} subtitle="LEVEL 7 · WEEKLY LESSONS" width={8} colour={EXPEDITION_TRAILS[index].colour}/>

 </group>;
}
function Quarry(){return <group position={[-123,3,108]}>
 <Box at={[0,.1,0]} size={[17,.2,13]} colour="#969084"/>
 {[[-5,0,-2],[-4,0,-5],[-6,0,3]].map((p,i)=><Box key={i} at={[p[0],1.2,p[2]]} size={[3,2.4,2.4]} colour="#a5a28e"/>)}
 <Beam a={[4,0,-3]} b={[4,13,-3]} width={.4} colour="#9f8557"/><Beam a={[4,12,-3]} b={[-5,12,-3]} width={.3} colour="#9f8557"/><Beam a={[4,4,-3]} b={[-4,12,-3]} width={.16}/><Beam a={[-4,12,-3]} b={[-4,4,-3]} width={.045} colour="#454d49"/>
 <Box at={[-4,3,-3]} size={[2,2,2]} colour="#aaa797"/>
 {[-1,1].map(x=><Beam key={x} a={[x*1.3,.12,8]} b={[x*1.3,.12,-7]} width={.08} colour="#666a62"/>)}
 </group>;}
function Observatory(){return <group position={[-123,3,40]}>
 <mesh position={[0,3,0]} castShadow><cylinderGeometry args={[5,5,6,16]}/><meshStandardMaterial color="#afa9a1" roughness={.85}/></mesh>
 <mesh position={[0,6,0]} castShadow><sphereGeometry args={[5.1,24,12,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#71858e" metalness={.45} roughness={.55}/></mesh>
 <Beam a={[0,7,0]} b={[4,10,0]} width={.65} colour="#5f707c"/>
 {Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return <Box key={i} at={[Math.sin(a)*4.8,3.8,Math.cos(a)*4.8]} size={[1,1.8,.12]} colour="#485b66" rotation={a}/>;})}
 </group>;}
function Station(){return <group position={[92,3,22]} rotation={[0,-.3,0]}>
 <Box at={[0,2,0]} size={[9,4,6]} colour="#887855"/>
 <mesh position={[0,4.4,0]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[4.3,4.3,10,3]}/><meshStandardMaterial color="#415e57" roughness={.9}/></mesh>
 {[-2.5,2.5].map(x=><Box key={x} at={[x,2.5,3.04]} size={[1.8,1.7,.12]} colour="#bbd2c7"/>)}
 <Box at={[0,1.4,3.1]} size={[1.4,2.8,.15]} colour="#4d5848"/>
 <Beam a={[7,0,0]} b={[7,10,0]} width={.09}/><mesh position={[7,10,0]} rotation={[.6,0,.5]}><sphereGeometry args={[1.7,16,8,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#d0d4c6" side={THREE.DoubleSide}/></mesh>
 </group>;}
function Ruins(){return <group position={[122,3,63]}>
 {[0,1,2].map(i=><group key={i} position={[0,i*1.6,-i*4]}><Box at={[0,.5,0]} size={[15-i*2,1,5]} colour="#969783"/>{[-4,4].map(x=><Box key={x} at={[x,3,0]} size={[1,5,1.1]} colour="#b0b19b"/>)}<Box at={[0,5.5,0]} size={[9,1,1.3]} colour="#a3a48f"/></group>)}
 </group>;}
function Cavern(){return <group position={[110,3,107]} rotation={[0,-Math.PI/2,0]}>
 {[-1,1].map(x=><Stone key={x} at={[x*5,4,0]} scale={[4,7,6]} colour="#626f6c"/>)}<Stone at={[0,9,0]} scale={[7,4,6]} colour="#74807a"/>
 <mesh position={[0,4,-2]}><circleGeometry args={[5,24]}/><meshBasicMaterial color="#203c39" side={THREE.DoubleSide}/></mesh>
 <Lantern at={[-3,1,3]}/><Lantern at={[3,1,3]}/>
 </group>;}
function Campfire(){
 const flame=useRef<THREE.Mesh>(null);useFrame(s=>{if(flame.current)flame.current.scale.y=.85+Math.sin(s.clock.elapsedTime*8)*.12;});
 return <group position={[-8,0,72]}>{Array.from({length:9},(_,i)=>{const a=i*Math.PI*2/9;return <Stone key={i} at={[Math.cos(a)*1.2,.22,Math.sin(a)*1.2]} scale={[.45,.3,.4]}/>;})}<Beam a={[-.7,.2,-.4]} b={[.7,.2,.4]} width={.22}/><Beam a={[-.7,.2,.4]} b={[.7,.2,-.4]} width={.22}/><mesh ref={flame} position={[0,.8,0]}><coneGeometry args={[.45,1.3,7]}/><meshStandardMaterial color="#ffbc65" emissive="#ee863d" emissiveIntensity={1.4}/></mesh><Box at={[0,.45,3]} size={[4,.35,.7]} colour="#766146"/><Box at={[3,.45,0]} size={[.7,.35,3.5]} colour="#766146"/></group>;
}
function Arrival(){return <group position={[0,0,100]}>
 {[-3.2,3.2].map(x=><group key={x}><Box at={[x,2.7,0]} size={[1.1,5.4,1.4]} colour="#898d7c"/><Box at={[x,5.5,0]} size={[1.5,.4,1.8]} colour="#a4a48e"/></group>)}
 <Box at={[0,5.8,0]} size={[7.5,.8,1.4]} colour="#949781"/>
 <mesh position={[0,2.7,0]}><planeGeometry args={[5.3,5.2]}/><meshStandardMaterial color="#94d9cf" emissive="#64bcb3" emissiveIntensity={.5} transparent opacity={.3} side={THREE.DoubleSide}/></mesh>
 <WorldPlaque at={[0,7,0]} title="THE TOWER PASSAGE" subtitle="ONE ARRIVAL · SIX EXPEDITIONS" width={7}/>

 </group>;}
function Scenery(){
 return <><ExpeditionForest/>
 {TRAIL_SAMPLES.map((path,k)=>path.filter((_,i)=>i%7===0).map((p,i)=>{const side=i%2?1:-1;return <Stone key={`${k}-${i}`} at={[p[0]+side*3.8,p[1]-.1,p[2]+.6]} scale={[.45+i%3*.2,.3,.5]} colour={k===1?'#98959e':'#969889'}/>;}))}
 </>;
}
export default function ExpeditionCrossroads(){
 const ground=useMemo(()=>{const g=new THREE.PlaneGeometry(440,450,180,180);g.rotateX(-Math.PI/2);g.translate(0,0,-40);const p=g.attributes.position,colours:number[]=[];for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,crossroadsTerrain(x,z));const c=new THREE.Color(z<-25&&x>-65?'#41494a':nearestTrail(x,z).distance>8?'#59634e':'#687352');c.lerp(new THREE.Color('#62666a'),trailThreat(x,z)*.55);c.multiplyScalar(.9+.1*Math.sin(x*.8+z*.4));colours.push(c.r,c.g,c.b);}g.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));g.computeVertexNormals();return g;},[]);
 return <group>
 <mesh geometry={ground} receiveShadow><meshLambertMaterial vertexColors/></mesh>
 {TRAIL_SAMPLES.map((p,i)=><Trail key={i} points={p} layer={i+1}/>)}<Trail points={[[0,0,102],[0,0,84],[0,0,74],[0,0,65]]}/>
 <mesh position={[0,.085,65]} rotation={[-Math.PI/2,0,0]} receiveShadow><circleGeometry args={[12.6,48]}/><meshStandardMaterial color="#b7a786" roughness={1}/></mesh>
 {EXPEDITION_TRAILS.map((_,i)=><Waymark key={i} index={i}/>)}{[0,1,2,3,4,5].map(i=><Barrier key={i} index={i}/>)}
 <Arrival/><Campfire/>
 <group position={[10,0,77]} scale={1.4}><DetailedScenery assetKey="flower_bed" tint="#c3ae71"/></group>
 <group position={[-11,0,69]} rotation={[0,1,0]} scale={1.6}><DetailedScenery assetKey="bench"/></group>
 <group position={[6,0,76]} scale={1.5}><DetailedScenery assetKey="shrub"/></group>
 <group position={[-8,0,80]} rotation={[0,.35,0]}><Box at={[0,.6,0]} size={[2.2,1.2,1.4]} colour="#8e7755"/>{[-.85,.85].map(x=><Box key={x} at={[x,.65,0]} size={[.12,1.3,1.5]} colour="#4c5345"/>)}<Box at={[0,1.24,0]} size={[2.3,.13,1.5]} colour="#9b835c"/><Lantern at={[.6,1.35,0]}/></group>
 <group position={[9,0,79]}><Box at={[0,1,0]} size={[3,.18,1.7]} colour="#927956"/>{[-1,1].flatMap(x=>[-.55,.55].map(z=><Beam key={`${x}-${z}`} a={[x,0,z]} b={[x,1,z]} width={.1}/>))}<Box at={[0,1.11,0]} size={[1.9,.03,1.2]} colour="#d6c69a"/><Lantern at={[1,1.12,0]}/></group>
 <Scenery/><ExpeditionDistanceDetail x={-123} z={108}><Quarry/></ExpeditionDistanceDetail><ExpeditionDistanceDetail x={-123} z={40}><Observatory/></ExpeditionDistanceDetail><ExpeditionDistanceDetail x={92} z={22}><Station/></ExpeditionDistanceDetail><ExpeditionDistanceDetail x={122} z={63}><Ruins/></ExpeditionDistanceDetail><ExpeditionDistanceDetail x={110} z={107}><Cavern/></ExpeditionDistanceDetail>
 <group position={[8,0,73]}><Beam a={[0,0,0]} b={[0,3.4,0]} width={.15}/><Beam a={[4,0,0]} b={[4,3.4,0]} width={.15}/><Box at={[2,2.4,0]} size={[4.4,2,.25]} colour="#5e5a44"/><WorldPlaque at={[2,2.4,.16]} title="SIXFOLD OUTPOST" subtitle="SIX TERRITORIES · ONE FINAL ASCENT" width={4}/></group>
 </group>;
}
