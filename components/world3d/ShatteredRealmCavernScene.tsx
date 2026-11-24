'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Bloom,EffectComposer,Vignette} from '@react-three/postprocessing';
import * as THREE from 'three';
import WorldPlaque from './WorldPlaque';
import {Brazier,Instances,StoneArch,addCrystalCluster,basaltTextures,crystalGeometry,rand,softDotTexture,useReducedMotion,type InstanceItem} from './VolcanicKit';
import {getRealmTheme} from '@/lib/useRealmTheme';
import {cave7WeekCount} from '@/lib/cave7-config';
import {cavernDarkness,cavernDoor} from '@/lib/world3d/shattered-realms';
import {EXPEDITION_TRAILS} from '@/lib/world3d/expedition-crossroads';
import type {ExpeditionRealm} from '@/lib/world3d/expedition-access';
import StarpathCavernSky from './StarpathCavernSky';
import MeasurelandsCavernSet from './MeasurelandsCavernSet';
import StatisticaCavernSet from './StatisticaCavernSet';
import PatternPeaksCavernSet from './PatternPeaksCavernSet';
import ChanceHollowCavernSet from './ChanceHollowCavernSet';
import NumberNexusCavernSet from './NumberNexusCavernSet';

// Level 7 cavern: a crystal-lit cave that grows darker towards the captive Core. Walkable
// floor and doorway positions come from lib/world3d/shattered-realms.ts.
const realmWeeks=(realm:ExpeditionRealm)=>Array.from({length:cave7WeekCount(realm)},(_,i)=>i+1);
const caveEnd=(realm:ExpeditionRealm)=>-31-(cave7WeekCount(realm)-1)*16;
const depthShade=(realm:ExpeditionRealm,z:number,light:string,dark:string)=>new THREE.Color(light).lerp(new THREE.Color(dark),cavernDarkness(z,realm)).getStyle();

/** Rock colours by depth. Starpath's open-sky cavern uses indigo stone so its starlight reads as night. */
const STONE={
 cave:{wall:['#4d5160','#434756','#1f2330'],top:['#3d404d','#1a1d28'],rock:['#5a5e6c','#2a2e3a'],spike:['#3b3e4b','#171a24'],floor:'#9aa0b2',sky:'#0b0d15'},
 sky:{wall:['#3d3a6e','#34305f','#15132c'],top:['#2f2b5c','#110f24'],rock:['#4b4784','#1f1c3d'],spike:['#3b3e4b','#171a24'],floor:'#8d8fc8',sky:'#070820'},
 canyon:{wall:['#a9774a','#93653d','#3a2617'],top:['#8a5f3a','#2c1d12'],rock:['#b98a5a','#4a3020'],spike:['#3b3e4b','#171a24'],floor:'#d9b98a',sky:'#3a2315'},
 archive:{wall:['#3e4658','#353c4d','#151821'],top:['#30364a','#12141c'],rock:['#4a5268','#20242f'],spike:['#3a4052','#161922'],floor:'#a3a9bd',sky:'#0c0e16'},
 peaks:{wall:['#5f7385','#536676','#1c2530'],top:['#4b5d6c','#18202a'],rock:['#7a8c9b','#2a3540'],spike:['#3b3e4b','#171a24'],floor:'#b8c6cf',sky:'#1a2a3c'},
 grotto:{wall:['#4f3d55','#45354b','#1b1420'],top:['#3e3044','#150f19'],rock:['#5d4a63','#251c2a'],spike:['#3f3245','#17111b'],floor:'#a998ad',sky:'#100b14'},
} as const;
type StoneLook=keyof typeof STONE;
/** Each realm's stone. Starpath, Measurelands and Pattern Peaks open the roof (night sky, dusk canyon,
 *  mountain pass); Statistica, Chance Hollow and Number Nexus stay roofed caves. */
const LOOK:Record<ExpeditionRealm,StoneLook>={number:'cave',space:'sky',measurement:'canyon',statistics:'archive',pattern:'peaks',chance:'grotto'};
const OPEN_ROOF:ReadonlySet<StoneLook>=new Set(['sky','canyon','peaks']);
/** The set dressing that gives each realm's cavern its subject. */
const REALM_SET={number:NumberNexusCavernSet,space:StarpathCavernSky,measurement:MeasurelandsCavernSet,statistics:StatisticaCavernSet,pattern:PatternPeaksCavernSet,chance:ChanceHollowCavernSet} satisfies Record<ExpeditionRealm,React.ComponentType<{colour:string;start:number;end:number}>>;
/** Cave floor, flagstone path, rock walls, stalactites and crystal clusters. One draw call per kind.
 *  Open-roof looks leave out the ceiling, stalactites and hanging crystals so the sky shows through. */
function CaveShell({realm,colour,look='cave'}:{realm:ExpeditionRealm;colour:string;look?:StoneLook}){
 const tone=STONE[look],openSky=OPEN_ROOF.has(look);
 const end=caveEnd(realm),length=22-end+8,mid=(22+end-8)/2;
 const {map}=useMemo(()=>basaltTextures([2,Math.round(length/9)]),[length]);
 const rock=useMemo(()=>new THREE.IcosahedronGeometry(1,0),[]),box=useMemo(()=>new THREE.BoxGeometry(1,1,1),[]),cone=useMemo(()=>new THREE.ConeGeometry(1,1,6).rotateX(Math.PI),[]),crystal=useMemo(()=>crystalGeometry(),[]);
 const stone=useMemo(()=>new THREE.MeshStandardMaterial({roughness:.95,flatShading:true}),[]);
 const glass=useMemo(()=>new THREE.MeshStandardMaterial({color:'#ffffff',emissive:colour,emissiveIntensity:1.3,roughness:.25,flatShading:true}),[colour]);
 const studs=useMemo(()=>new THREE.MeshBasicMaterial({color:new THREE.Color(colour).multiplyScalar(2),toneMapped:false}),[colour]);
 const walls=useMemo(()=>{const out:InstanceItem[]=[];let i=0;
  for(const side of [-1,1]){
   for(let z=18;z>end-6;z-=2.6){i++;const h=6+rand(i)*6;out.push({p:[side*(10.6+rand(i+1)*1.2),h*.45,z],s:[2.4+rand(i+2)*1.3,h,2.3+rand(i+3)*1.1],r:[rand(i+4)*.4,rand(i+5)*3,side*(.08+rand(i+6)*.12)],c:depthShade(realm,z,rand(i+7)>.5?tone.wall[0]:tone.wall[1],tone.wall[2])});}
   if(!openSky)for(let z=17;z>end-6;z-=3.4){i++;out.push({p:[side*(9+rand(i)*1.4),11+rand(i+1)*2.5,z],s:[2.6+rand(i+2)*1.6,3.4+rand(i+3)*2.4,2.8],r:[rand(i+4),rand(i+5)*3,-side*(.35+rand(i+6)*.3)],c:depthShade(realm,z,tone.top[0],tone.top[1])});}
   for(let z=16;z>end-6;z-=4.1){i++;out.push({p:[side*(8.6+rand(i)*.6),.45,z],s:[1.2+rand(i+1)*.8,.9+rand(i+2)*.7,1.3],r:[rand(i+3)*3,rand(i+4)*3,0],c:depthShade(realm,z,tone.rock[0],tone.rock[1])});}
  }
  for(let x=-10;x<=10;x+=3){i++;out.push({p:[x,6,end-7-rand(i)*1.5],s:[3,12,2.6],r:[rand(i+1)*.3,rand(i+2)*3,0],c:'#1b1e29'});}
  return out;},[end,realm,tone,openSky]);
 const spikes=useMemo(()=>{const out:InstanceItem[]=[];if(openSky)return out;let i=500;for(let z=17;z>end-6;z-=2.2)for(let n=0;n<4;n++){i++;const len=1.2+rand(i)*4,r=.3+rand(i+1)*.7;out.push({p:[(rand(i+2)-.5)*20,14.6-len/2,z+(rand(i+3)-.5)*2],s:[r,len,r],r:[0,rand(i+4)*3,0],c:depthShade(realm,z,tone.spike[0],tone.spike[1])});}return out;},[end,realm,openSky,tone]);
 const flags=useMemo(()=>{const out:InstanceItem[]=[];let i=900;for(let z=14;z>end+2;z-=1.2)for(let lane=-1;lane<=1;lane++){i++;out.push({p:[lane*1.2+(rand(i)-.5)*.14,.04,z+(rand(i+50)-.5)*.2],s:[1.1,.1,1.04],r:[0,(rand(i+9)-.5)*.12,0],c:rand(i+3)>.5?'#5d5f69':'#4f515b'});}return out;},[end]);
 const marks=useMemo(()=>{const out:InstanceItem[]=[];for(let z=12;z>end+2;z-=4)for(const x of [-2.1,2.1])out.push({p:[x,.1,z],s:[.12,.05,.12],c:'#ffffff'});return out;},[end]);
 const crystals=useMemo(()=>{const out:InstanceItem[]=[],palette=['#ffffff','#e6fff9','#d2f3ff'];let s=0;
  for(let z=12;z>end;z-=6.5)for(const side of [-1,1]){s++;addCrystalCluster(out,[side*(8.4+rand(s)*.8),.05,z+rand(s+1)*2],.8+rand(s+2)*.7,s,palette);}
  if(!openSky)for(let z=6;z>end;z-=13){s++;addCrystalCluster(out,[(rand(s)-.5)*12,14.2,z],1,s,palette,true);}
  return out;},[end,openSky]);
 useEffect(()=>()=>{map.dispose();rock.dispose();box.dispose();cone.dispose();crystal.dispose();stone.dispose();glass.dispose();studs.dispose();},[map,rock,box,cone,crystal,stone,glass,studs]);
 return <>
  <mesh position={[0,0,mid]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[18,length]}/><meshStandardMaterial map={map} color={tone.floor} roughness={.95}/></mesh>
  {!openSky&&<mesh position={[0,15.2,mid]} rotation={[Math.PI/2,0,0]}><planeGeometry args={[26,length]}/><meshStandardMaterial color="#0f111a" roughness={1}/></mesh>}
  <Instances geometry={rock} material={stone} items={walls}/>
  <Instances geometry={cone} material={stone} items={spikes}/>
  <Instances geometry={box} material={stone} items={flags}/>
  <Instances geometry={box} material={studs} items={marks}/>
  <Instances geometry={crystal} material={glass} items={crystals}/>
  {[-1,1].map(side=><mesh key={side} visible={false} position={[side*10,7,mid]} userData={{cameraObstacle:true}}><boxGeometry args={[2,16,length]}/></mesh>)}
  {!openSky&&<mesh visible={false} position={[0,15,mid]} userData={{cameraObstacle:true}}><boxGeometry args={[24,.5,length]}/></mesh>}
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
  <WorldPlaque at={[0,7.4,3.6]} title="THE CORE IS STILL CAPTIVE" subtitle="LEVEL 8 · THE FINAL BATTLE" width={8} colour="#c59bff"/>
 </group>;
}

type DoorState='loading'|'locked'|'open'|'current'|'done';
const DOOR_LABEL:Record<DoorState,string>={loading:'',locked:'LOCKED',open:'ENTER WEEK',current:'CONTINUE HERE',done:'COMPLETE ✓'};
const DONE_GOLD='#ffd36a';
/** A slowly turning crystal on a finished week's sign: the student's progress, visible from the path. */
function RestoredCrystal({colour}:{colour:string}){
 const reduced=useReducedMotion(),ref=useRef<THREE.Mesh>(null);
 useFrame(({clock})=>{if(ref.current&&!reduced.current)ref.current.rotation.y=clock.elapsedTime*.8;});
 return <group position={[0,4.75,0]}><mesh ref={ref} scale={[.32,.62,.32]}><octahedronGeometry args={[1,0]}/><meshStandardMaterial color={colour} emissive={colour} emissiveIntensity={2} flatShading/></mesh><pointLight color={colour} intensity={12} distance={9} decay={1.6}/></group>;
}
function Doorway({week,state,colour}:{week:number;state:DoorState;colour:string}){
 const p=cavernDoor(week),side=week%2===1?-1:1,lit=state==='done'?DONE_GOLD:state==='locked'||state==='loading'?'#a8a8ad':colour;
 return <>
  <group position={p} rotation={[0,side===-1?Math.PI/2:-Math.PI/2,0]}>
   <group scale={.82}><StoneArch colour={state==='done'?DONE_GOLD:colour} open={state!=='locked'} seed={week} brightness={state==='current'?1.8:state==='done'?1.6:1.3}/></group>
   {state==='current'&&<Brazier at={[-3.3,0,1.3]} colour={colour} scale={.8}/>}
   {state==='current'&&<Brazier at={[3.3,0,1.3]} colour={colour} scale={.8}/>}
  </group>
  {/* Eye-level sign between the path and the doorway, facing the student as they walk in. */}
  <group position={[side*3.9,0,p[2]+2.2]}>
   <mesh position={[0,1.2,0]}><boxGeometry args={[.14,2.4,.14]}/><meshStandardMaterial color="#3b3a44" roughness={.8}/></mesh>
   <WorldPlaque at={[0,2.85,0]} title={`WEEK ${week}`} subtitle={DOOR_LABEL[state]} width={3.2} colour={lit}/>
   {state==='done'&&<RestoredCrystal colour={DONE_GOLD}/>}
  </group>
 </>;
}

export default function ShatteredRealmCavernScene({realm,position,unlockedWeeks,finishedWeeks,ready,current}:{realm:ExpeditionRealm;position:React.RefObject<THREE.Vector3>;unlockedWeeks:number[];finishedWeeks:number[];ready:boolean;current:number}){
 // The trail colours keep each cavern consistent with its trail gate and summit gateway.
 const colour=EXPEDITION_TRAILS.find(t=>t.id===realm)?.colour??getRealmTheme(realm).accentText;
 const look=LOOK[realm],skyColour=STONE[look].sky,RealmSet=REALM_SET[realm];
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
  <color attach="background" args={[skyColour]}/><fog ref={fog} attach="fog" args={[skyColour,18,70]}/>
  <ambientLight ref={ambient} intensity={.55} color="#b4bdd6"/><hemisphereLight args={['#7d8cad','#1d1a22',.7]}/>
  <pointLight ref={glow} color={colour} intensity={45} distance={30} decay={1.6}/>
  <pointLight position={[currentDoor[0]*.6,3.5,currentDoor[2]]} color={colour} intensity={40} distance={16} decay={1.6}/>
  <CaveShell realm={realm} colour={colour} look={look}/>
  <RealmSet colour={colour} start={14} end={caveEnd(realm)}/>
  {realmWeeks(realm).map((week,i)=><group key={week} ref={g=>{sections.current[i]=g;}}>
   <Doorway week={week} state={!ready?'loading':finishedWeeks.includes(week)?'done':week===current?'current':unlockedWeeks.includes(week)?'open':'locked'} colour={colour}/>
  </group>)}
  <CaptiveCore realm={realm} colour={colour}/>
  <EffectComposer multisampling={0}>
   <Bloom intensity={.8} luminanceThreshold={.62} luminanceSmoothing={.25} mipmapBlur radius={.65}/>
   <Vignette offset={.28} darkness={.7} eskil={false}/>
  </EffectComposer>
 </>;
}
