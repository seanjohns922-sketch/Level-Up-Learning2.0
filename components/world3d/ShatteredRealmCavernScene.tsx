'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Bloom,EffectComposer,Vignette} from '@react-three/postprocessing';
import * as THREE from 'three';
import WorldPlaque from './WorldPlaque';
import {Box} from './ExpeditionCrossroads';
import {Brazier,Instances,StoneArch,addCrystalCluster,basaltTextures,crystalGeometry,rand,softDotTexture,useReducedMotion,type InstanceItem} from './VolcanicKit';
import {getRealmTheme} from '@/lib/useRealmTheme';
import {cave7WeekCount} from '@/lib/cave7-config';
import {cavernDarkness,cavernDoor} from '@/lib/world3d/shattered-realms';
import {EXPEDITION_TRAILS} from '@/lib/world3d/expedition-crossroads';
import type {ExpeditionRealm} from '@/lib/world3d/expedition-access';

// Level 7 cavern: a crystal-lit cave that grows darker towards the captive Core. Walkable
// floor and doorway positions come from lib/world3d/shattered-realms.ts.
const realmWeeks=(realm:ExpeditionRealm)=>Array.from({length:cave7WeekCount(realm)},(_,i)=>i+1);
const caveEnd=(realm:ExpeditionRealm)=>-31-(cave7WeekCount(realm)-1)*16;
const depthShade=(realm:ExpeditionRealm,z:number,light:string,dark:string)=>new THREE.Color(light).lerp(new THREE.Color(dark),cavernDarkness(z,realm)).getStyle();

function Crystal({x,y=1,z,colour,scale=1}:{x:number;y?:number;z:number;colour:string;scale?:number}){
 return <mesh position={[x,y,z]} scale={[.4*scale,1.5*scale,.4*scale]} rotation={[.1,0,.2]}><octahedronGeometry args={[1,0]}/><meshStandardMaterial color={colour} emissive={colour} emissiveIntensity={.9} flatShading/></mesh>;
}
/** Realm details beside each doorway. */
function Features({realm,colour,week}:{realm:ExpeditionRealm;colour:string;week:number}){
 return <group position={[0,0,-8-(week-1)*16]}>
 {realm==='number'&&<><WorldPlaque at={[5.8,3,-5]} title={`${week} · ${week*10} · ${week*100}`} subtitle="NUMBER STONES" width={3}/>{[0,1,2].map(i=><Crystal key={i} x={5.5+i*.45} z={-4-i*.65} colour={colour} scale={.5+i*.2}/>)}</>}
 {realm==='measurement'&&<><Box at={[5.9,.35,-5]} size={[1.6,.6,5]} colour="#907b58"/>{Array.from({length:8},(_,i)=><Box key={i} at={[5.9,.68,-7+i*.6]} size={[i%2?.5:1,.04,.08]} colour={colour}/>)}<WorldPlaque at={[-6,3,-5]} title="MEASURELANDS" subtitle="STONE SURVEY MARKERS" width={3}/></>}
 {realm==='space'&&<>{[0,1,2,3,4].map(i=><Crystal key={i} x={Math.sin(i*2)*4} y={9+Math.cos(i)*1.5} z={-3+i} colour={colour} scale={.3}/>)}<mesh position={[5.8,2,-5]}><icosahedronGeometry args={[1.3,0]}/><meshStandardMaterial color={colour} wireframe emissive={colour} emissiveIntensity={.9}/></mesh></>}
 {realm==='statistics'&&<>{[0,1,2].map(i=><group key={i}>{Array.from({length:i+2},(_,j)=><Crystal key={j} x={5.4+i*.6} z={-5+j*.6} colour={colour} scale={.45}/>)}</group>)}<WorldPlaque at={[-6,3,-5]} title="CRYSTAL RECORDS" subtitle="OBSERVE · GROUP · COMPARE" width={3.5}/></>}
 {realm==='pattern'&&<>{Array.from({length:6},(_,i)=><mesh key={i} position={[-5+i*2,9,-3]} rotation={[0,0,i%2?Math.PI/4:0]}><torusGeometry args={[.5,.12,4,i%2?4:12]}/><meshStandardMaterial color={i%2?colour:'#ddd5ef'} emissive={colour} emissiveIntensity={.5}/></mesh>)}</>}
 {realm==='chance'&&<>{[-1,1].map(side=><group key={side}><Box at={[side*5.8,1,-5]} size={[1.6,1.6,1.6]} colour="#ad9b9f"/>{[-.4,0,.4].map((y,i)=><mesh key={i} position={[side*5.8+(i%2?.3:-.3),1+y,-4.18]}><sphereGeometry args={[.1,8,6]}/><meshBasicMaterial color="#362732"/></mesh>)}<Box at={[side*6,.04,-2]} size={[.4,.04,6]} colour="#60899d"/><Box at={[side*5.5,.04,-3]} size={[1.4,.04,.3]} colour="#60899d"/><Box at={[side*5,.04,-1.6]} size={[.3,.04,3]} colour="#60899d"/></group>)}</>}
 </group>;
}

/** Cave floor, flagstone path, rock walls, stalactites and crystal clusters. One draw call per kind. */
function CaveShell({realm,colour}:{realm:ExpeditionRealm;colour:string}){
 const end=caveEnd(realm),length=22-end+8,mid=(22+end-8)/2;
 const {map}=useMemo(()=>basaltTextures([2,Math.round(length/9)]),[length]);
 const rock=useMemo(()=>new THREE.IcosahedronGeometry(1,0),[]),box=useMemo(()=>new THREE.BoxGeometry(1,1,1),[]),cone=useMemo(()=>new THREE.ConeGeometry(1,1,6).rotateX(Math.PI),[]),crystal=useMemo(()=>crystalGeometry(),[]);
 const stone=useMemo(()=>new THREE.MeshStandardMaterial({roughness:.95,flatShading:true}),[]);
 const glass=useMemo(()=>new THREE.MeshStandardMaterial({color:'#ffffff',emissive:colour,emissiveIntensity:1.3,roughness:.25,flatShading:true}),[colour]);
 const studs=useMemo(()=>new THREE.MeshBasicMaterial({color:new THREE.Color(colour).multiplyScalar(2),toneMapped:false}),[colour]);
 const walls=useMemo(()=>{const out:InstanceItem[]=[];let i=0;
  for(const side of [-1,1]){
   for(let z=18;z>end-6;z-=2.6){i++;const h=6+rand(i)*6;out.push({p:[side*(10.6+rand(i+1)*1.2),h*.45,z],s:[2.4+rand(i+2)*1.3,h,2.3+rand(i+3)*1.1],r:[rand(i+4)*.4,rand(i+5)*3,side*(.08+rand(i+6)*.12)],c:depthShade(realm,z,rand(i+7)>.5?'#4d5160':'#434756','#1f2330')});}
   for(let z=17;z>end-6;z-=3.4){i++;out.push({p:[side*(9+rand(i)*1.4),11+rand(i+1)*2.5,z],s:[2.6+rand(i+2)*1.6,3.4+rand(i+3)*2.4,2.8],r:[rand(i+4),rand(i+5)*3,-side*(.35+rand(i+6)*.3)],c:depthShade(realm,z,'#3d404d','#1a1d28')});}
   for(let z=16;z>end-6;z-=4.1){i++;out.push({p:[side*(8.6+rand(i)*.6),.45,z],s:[1.2+rand(i+1)*.8,.9+rand(i+2)*.7,1.3],r:[rand(i+3)*3,rand(i+4)*3,0],c:depthShade(realm,z,'#5a5e6c','#2a2e3a')});}
  }
  for(let x=-10;x<=10;x+=3){i++;out.push({p:[x,6,end-7-rand(i)*1.5],s:[3,12,2.6],r:[rand(i+1)*.3,rand(i+2)*3,0],c:'#1b1e29'});}
  return out;},[end,realm]);
 const spikes=useMemo(()=>{const out:InstanceItem[]=[];let i=500;for(let z=17;z>end-6;z-=2.2)for(let n=0;n<4;n++){i++;const len=1.2+rand(i)*4,r=.3+rand(i+1)*.7;out.push({p:[(rand(i+2)-.5)*20,14.6-len/2,z+(rand(i+3)-.5)*2],s:[r,len,r],r:[0,rand(i+4)*3,0],c:depthShade(realm,z,'#3b3e4b','#171a24')});}return out;},[end,realm]);
 const flags=useMemo(()=>{const out:InstanceItem[]=[];let i=900;for(let z=14;z>end+2;z-=1.2)for(let lane=-1;lane<=1;lane++){i++;out.push({p:[lane*1.2+(rand(i)-.5)*.14,.04,z+(rand(i+50)-.5)*.2],s:[1.1,.1,1.04],r:[0,(rand(i+9)-.5)*.12,0],c:rand(i+3)>.5?'#5d5f69':'#4f515b'});}return out;},[end]);
 const marks=useMemo(()=>{const out:InstanceItem[]=[];for(let z=12;z>end+2;z-=4)for(const x of [-2.1,2.1])out.push({p:[x,.1,z],s:[.12,.05,.12],c:'#ffffff'});return out;},[end]);
 const crystals=useMemo(()=>{const out:InstanceItem[]=[],palette=['#ffffff','#e6fff9','#d2f3ff'];let s=0;
  for(let z=12;z>end;z-=6.5)for(const side of [-1,1]){s++;addCrystalCluster(out,[side*(8.4+rand(s)*.8),.05,z+rand(s+1)*2],.8+rand(s+2)*.7,s,palette);}
  for(let z=6;z>end;z-=13){s++;addCrystalCluster(out,[(rand(s)-.5)*12,14.2,z],1,s,palette,true);}
  return out;},[end]);
 useEffect(()=>()=>{map.dispose();rock.dispose();box.dispose();cone.dispose();crystal.dispose();stone.dispose();glass.dispose();studs.dispose();},[map,rock,box,cone,crystal,stone,glass,studs]);
 return <>
  <mesh position={[0,0,mid]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[18,length]}/><meshStandardMaterial map={map} color="#9aa0b2" roughness={.95}/></mesh>
  <mesh position={[0,15.2,mid]} rotation={[Math.PI/2,0,0]}><planeGeometry args={[26,length]}/><meshStandardMaterial color="#0f111a" roughness={1}/></mesh>
  <Instances geometry={rock} material={stone} items={walls}/>
  <Instances geometry={cone} material={stone} items={spikes}/>
  <Instances geometry={box} material={stone} items={flags}/>
  <Instances geometry={box} material={studs} items={marks}/>
  <Instances geometry={crystal} material={glass} items={crystals}/>
  {[-1,1].map(side=><mesh key={side} visible={false} position={[side*10,7,mid]} userData={{cameraObstacle:true}}><boxGeometry args={[2,16,length]}/></mesh>)}
  <mesh visible={false} position={[0,15,mid]} userData={{cameraObstacle:true}}><boxGeometry args={[24,.5,length]}/></mesh>
 </>;
}

/** The captive Core at the end of the cavern, held by the same purple seal the student meets in Level 8. */
function CaptiveCore({realm,colour}:{realm:ExpeditionRealm;colour:string}){
 const reduced=useReducedMotion(),core=useRef<THREE.Group>(null),rings=useRef<THREE.Group>(null),dot=useMemo(()=>softDotTexture(),[]);
 useFrame(({clock})=>{const t=reduced.current?0:clock.elapsedTime;if(core.current){core.current.rotation.y=t*.4;core.current.position.y=4+Math.sin(t*.9)*.15;}if(rings.current)rings.current.children.forEach((r,i)=>{r.rotation.x=t*(.3+i*.15)+i;r.rotation.y=t*(.2-i*.1);});});
 useEffect(()=>()=>dot.dispose(),[dot]);
 const seal=new THREE.Color('#a463ff').multiplyScalar(2);
 return <group position={[0,0,caveEnd(realm)]}>
  <mesh position={[0,.06,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[3.2,3.45,48]}/><meshBasicMaterial color={seal} toneMapped={false}/></mesh>
  <group ref={core} position={[0,4,0]}>
   <mesh scale={[1,1.9,1]}><octahedronGeometry args={[1,0]}/><meshStandardMaterial color={colour} emissive={colour} emissiveIntensity={1.4} roughness={.2} flatShading/></mesh>
   <sprite scale={[5,5,1]}><spriteMaterial map={dot} color={colour} transparent opacity={.4} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}/></sprite>
  </group>
  <group ref={rings} position={[0,4,0]}>{[0,1].map(i=><mesh key={i}><torusGeometry args={[2.3+i*.25,.06,6,48]}/><meshBasicMaterial color={seal} toneMapped={false}/></mesh>)}</group>
  {Array.from({length:9},(_,i)=>{const a=-Math.PI*.42+i*Math.PI*.105;return <mesh key={i} position={[Math.sin(a)*3.4,3.6,Math.cos(a)*3.4]}><cylinderGeometry args={[.08,.08,7.2,6]}/><meshStandardMaterial color="#5b5866" metalness={.6} roughness={.4}/></mesh>;})}
  <pointLight position={[0,4,2]} color="#a463ff" intensity={30} distance={16} decay={1.7}/>
  <WorldPlaque at={[0,9.2,1.5]} title="THE CORE IS STILL CAPTIVE" subtitle="LEVEL 8 · THE FINAL BATTLE" width={8} colour="#c59bff"/>
 </group>;
}

function Doorway({week,unlocked,current,colour}:{week:number;unlocked:boolean;current:boolean;colour:string}){
 const p=cavernDoor(week),side=week%2===1?-1:1;
 return <group position={p} rotation={[0,side===-1?Math.PI/2:-Math.PI/2,0]}>
  <group scale={.82}><StoneArch colour={colour} open={unlocked} seed={week} brightness={current?1.8:1.3}/></group>
  <WorldPlaque at={[0,8.6,.4]} title={`WEEK ${week}`} subtitle={!unlocked?'LOCKED':current?'CONTINUE HERE':'ENTER WEEK'} width={4.8} colour={unlocked?colour:'#a8a8ad'}/>
  {current&&<Brazier at={[-3.3,0,1.3]} colour={colour} scale={.8}/>}
  {current&&<Brazier at={[3.3,0,1.3]} colour={colour} scale={.8}/>}
 </group>;
}

export default function ShatteredRealmCavernScene({realm,position,unlockedWeeks,current}:{realm:ExpeditionRealm;position:React.RefObject<THREE.Vector3>;unlockedWeeks:number[];current:number}){
 // The trail colours keep each cavern consistent with its trail gate and summit gateway.
 const colour=EXPEDITION_TRAILS.find(t=>t.id===realm)?.colour??getRealmTheme(realm).accentText;
 const ambient=useRef<THREE.AmbientLight>(null),fog=useRef<THREE.Fog>(null),glow=useRef<THREE.PointLight>(null);
 const sections=useRef<(THREE.Group|null)[]>([]);
 const currentDoor=cavernDoor(current);
 // Lighting dims with depth; one realm-coloured light travels with the explorer so nearby crystals and doorways glow.
 useFrame(()=>{const here=position.current!,depth=cavernDarkness(here.z,realm);
  if(ambient.current)ambient.current.intensity=.55-depth*.3;
  if(fog.current){fog.current.near=18-depth*6;fog.current.far=70-depth*18;}
  if(glow.current)glow.current.position.set(here.x*.5,5,here.z-6);
  sections.current.forEach((g,i)=>{if(g)g.visible=Math.abs(here.z-cavernDoor(i+1)[2])<65;});});
 return <>
  <color attach="background" args={['#0b0d15']}/><fog ref={fog} attach="fog" args={['#0b0d15',18,70]}/>
  <ambientLight ref={ambient} intensity={.55} color="#b4bdd6"/><hemisphereLight args={['#7d8cad','#1d1a22',.7]}/>
  <pointLight ref={glow} color={colour} intensity={45} distance={30} decay={1.6}/>
  <pointLight position={[currentDoor[0]*.6,3.5,currentDoor[2]]} color={colour} intensity={40} distance={16} decay={1.6}/>
  <CaveShell realm={realm} colour={colour}/>
  {realmWeeks(realm).map((week,i)=><group key={week} ref={g=>{sections.current[i]=g;}}>
   <Doorway week={week} unlocked={unlockedWeeks.includes(week)} current={week===current} colour={colour}/>
   <Features realm={realm} colour={colour} week={week}/>
  </group>)}
  <CaptiveCore realm={realm} colour={colour}/>
  <EffectComposer multisampling={0}>
   <Bloom intensity={.8} luminanceThreshold={.62} luminanceSmoothing={.25} mipmapBlur radius={.65}/>
   <Vignette offset={.28} darkness={.7} eskil={false}/>
  </EffectComposer>
 </>;
}
