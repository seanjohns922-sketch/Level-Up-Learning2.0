'use client';
import {level7LiveHref} from '@/lib/level7-release';
import {getActiveStudentIdentity} from '@/lib/studentIdentity';
import {restoreStudentStateFromServer} from '@/lib/student-progress-sync';
import {readProgress} from '@/data/progress';
import {readProgramStore,getPlayableWeeks,getRecommendedAssignedWeek} from '@/lib/program-progress';
import {cave7WeekCount} from "@/lib/cave7-config";
import {Suspense,useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {getRealmTheme} from '@/lib/useRealmTheme';
import type {ExpeditionRealm} from '@/lib/world3d/expedition-access';
import {CAVERN_REALMS,cavernDarkness,cavernDoor,cavernFloor,cavernHref,cavernNearest,cavernSpawn,cavernWeek,cavernWeekHref,studentCavernHref} from '@/lib/world3d/shattered-realms';
import {rememberWorld3DWeekEntry} from '@/lib/world3d/return-context';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import NumberSummitPlayer from './NumberSummitPlayer';
import {WorldJoystick,WorldLookJoystick,EMPTY_WORLD_MOVE_INPUT,EMPTY_WORLD_LOOK_INPUT} from './SharedWorldPlayer';
import WorldPlaque from './WorldPlaque';
import {Box,Stone} from './ExpeditionCrossroads';

const realmWeeks=(realm:ExpeditionRealm)=>Array.from({length:cave7WeekCount(realm)},(_,i)=>i+1);
function Crystal({x,y=1,z,colour,scale=1}:{x:number;y?:number;z:number;colour:string;scale?:number}){
 return <mesh position={[x,y,z]} scale={[.4*scale,1.5*scale,.4*scale]} rotation={[.1,0,.2]}><octahedronGeometry args={[1,0]}/><meshStandardMaterial color={colour} emissive={colour} emissiveIntensity={.55}/></mesh>;
}
function Features({realm,colour,week}:{realm:ExpeditionRealm;colour:string;week:number}){
 return <group position={[0,0,-8-(week-1)*16]}>
 {realm==='number'&&<><WorldPlaque at={[5.8,3,-5]} title={`${week} · ${week*10} · ${week*100}`} subtitle="NUMBER STONES" width={3}/>{[0,1,2].map(i=><Crystal key={i} x={5.5+i*.45} z={-4-i*.65} colour={colour} scale={.5+i*.2}/>)}</>}
 {realm==='measurement'&&<><Box at={[5.9,.35,-5]} size={[1.6,.6,5]} colour="#907b58"/>{Array.from({length:8},(_,i)=><Box key={i} at={[5.9,.68,-7+i*.6]} size={[i%2?.5:1,.04,.08]} colour={colour}/>)}<WorldPlaque at={[-6,3,-5]} title="MEASURELANDS" subtitle="STONE SURVEY MARKERS" width={3}/></>}
 {realm==='space'&&<>{[0,1,2,3,4].map(i=><Crystal key={i} x={Math.sin(i*2)*4} y={9+Math.cos(i)*1.5} z={-3+i} colour={colour} scale={.3}/>)}<mesh position={[5.8,2,-5]}><icosahedronGeometry args={[1.3,0]}/><meshStandardMaterial color={colour} wireframe emissive={colour} emissiveIntensity={.7}/></mesh></>}
 {realm==='statistics'&&<>{[0,1,2].map(i=><group key={i}>{Array.from({length:i+2},(_,j)=><Crystal key={j} x={5.4+i*.6} z={-5+j*.6} colour={colour} scale={.45}/>)}</group>)}<WorldPlaque at={[-6,3,-5]} title="CRYSTAL RECORDS" subtitle="OBSERVE · GROUP · COMPARE" width={3.5}/></>}
 {realm==='pattern'&&<>{Array.from({length:6},(_,i)=><mesh key={i} position={[-5+i*2,9,-3]} rotation={[0,0,i%2?Math.PI/4:0]}><torusGeometry args={[.5,.12,4,i%2?4:12]}/><meshStandardMaterial color={i%2?colour:'#ddd5ef'} emissive={colour} emissiveIntensity={.3}/></mesh>)}</>}
 {realm==='chance'&&<>{[-1,1].map(side=><group key={side}><Box at={[side*5.8,1,-5]} size={[1.6,1.6,1.6]} colour="#ad9b9f"/>{[-.4,0,.4].map((y,i)=><mesh key={i} position={[side*5.8+(i%2?.3:-.3),1+y,-4.18]}><sphereGeometry args={[.1,8,6]}/><meshBasicMaterial color="#362732"/></mesh>)}<Box at={[side*6,.04,-2]} size={[.4,.04,6]} colour="#60899d"/><Box at={[side*5.5,.04,-3]} size={[1.4,.04,.3]} colour="#60899d"/><Box at={[side*5,.04,-1.6]} size={[.3,.04,3]} colour="#60899d"/></group>)}</>}
 </group>;
}
function CavernScene({realm,position,unlockedWeeks}:{realm:ExpeditionRealm;position:React.RefObject<THREE.Vector3>;unlockedWeeks:number[]}){
 const theme=getRealmTheme(realm),light=useRef<THREE.AmbientLight>(null),fog=useRef<THREE.Fog>(null);
 const sections=useRef<(THREE.Group|null)[]>([]);
 useFrame(()=>{const z=position.current!.z,depth=cavernDarkness(z,realm);if(light.current)light.current.intensity=.9-depth*.52;if(fog.current){fog.current.near=22-depth*8;fog.current.far=76-depth*20;}sections.current.forEach((g,i)=>{if(g)g.visible=Math.abs(z-cavernDoor(i+1)[2])<65;});});
 return <>
 <color attach="background" args={['#10131c']}/><fog ref={fog} attach="fog" args={['#10131c',22,76]}/>
 <ambientLight ref={light} intensity={.9}/><hemisphereLight args={['#adb8d1','#242129',1]}/><directionalLight position={[2,10,8]} intensity={.8}/>
 <Box at={[0,-.35,-96]} size={[16,.7,232]} colour="#47444b"/>
 <Box at={[0,.025,-96]} size={[7,.04,228]} colour="#7f7468"/>
 {realmWeeks(realm).map((week,i)=>{const p=cavernDoor(week),side=week%2===1?-1:1,unlocked=unlockedWeeks.includes(week);return <group key={week} ref={g=>{sections.current[i]=g;}}>
 {[-1,1].map(s=><group key={s}>{[0,1,2].map(j=><Stone key={j} at={[s*10,4+j*.2,p[2]-6+j*5]} scale={[3.4,7+(j%2),3.7]} colour={i<4?'#50535c':i<8?'#3b414d':'#2a303e'}/>)}</group>)}
 <mesh position={[0,5.5,p[2]-6]}><torusGeometry args={[9,.9,5,16,Math.PI]}/><meshStandardMaterial color="#484551" roughness={1}/></mesh>
 <Box at={[0,14,p[2]]} size={[22,2,17]} colour="#343540"/>
 <group position={p} rotation={[0,side===-1?Math.PI/2:-Math.PI/2,0]}>
 <Box at={[0,2.8,-.2]} size={[4.8,5.6,.5]} colour="#101523"/>
 {[-2.4,2.4].map(x=><Box key={x} at={[x,2.9,0]} size={[.6,5.8,.8]} colour="#85828b"/>)}
 <Box at={[0,5.8,0]} size={[5.4,.7,.8]} colour="#85828b"/>
 <Box at={[0,2.5,.09]} size={[3.9,4.8,.05]} colour={unlocked?theme.ctaTo:'#23252b'}/>
 {!unlocked&&[-1.5,-.75,0,.75,1.5].map(x=><Box key={x} at={[x,2.5,.18]} size={[.18,4.8,.2]} colour="#737580"/>)}
 <WorldPlaque at={[0,5,.5]} title={`WEEK ${week}`} subtitle={unlocked?"ENTER WEEK":"LOCKED"} width={4.5} colour={unlocked?theme.accentText:"#a8a8ad"}/>
 </group>
 {[-1,1].map(s=><Crystal key={s} x={s*4.6} z={p[2]+4} colour={theme.accentText} scale={.6}/>)}
 <Features realm={realm} colour={theme.accentText} week={week}/>
 </group>;})}
 <group position={[0,0,-31-(cave7WeekCount(realm)-1)*16]}><Box at={[0,5,-3]} size={[18,10,2]} colour="#242532"/><Crystal x={0} y={4} z={0} colour={theme.accentText} scale={2}/>{[-3,-2,-1,0,1,2,3].map(x=><Box key={x} at={[x,3.6,2]} size={[.16,7.2,.18]} colour="#90909b"/>)}<WorldPlaque at={[0,8,3]} title="THE CORE IS STILL CAPTIVE" subtitle="LEVEL 8 · THE FINAL BATTLE" width={8}/></group>
 </>;
}
export default function ShatteredRealmCavern({realm,week,live=false}:{realm:ExpeditionRealm;week:number;live?:boolean}){
 const router=useRouter(),theme=getRealmTheme(realm),definition=CAVERN_REALMS[realm];
 const storageKey=live?`lul:${getActiveStudentIdentity().studentId}:shattered-realms:week:${realm}`:`lul:shattered-realms:demo-week:${realm}`;
 const [playable,setPlayable]=useState<number[]>(live?[]:realmWeeks(realm)),[restoreError,setRestoreError]=useState(false),[liveCurrent,setLiveCurrent]=useState(week);
 useEffect(()=>{if(!live)return;let active=true;const id=getActiveStudentIdentity().studentId;if(!id)return;
  restoreStudentStateFromServer(id,realm).then(()=>{if(!active)return;const p=readProgress(realm),store=readProgramStore();
   setPlayable(getPlayableWeeks(store,'Year 7',p?.requiredWeeks,p?.optionalWeeks,realm,p?.teacherAdvancedWeeks,p?.assignedWeek));
   setLiveCurrent(cavernWeek(getRecommendedAssignedWeek(store,'Year 7',p?.assignedWeek,p?.requiredWeeks,realm,p?.teacherAdvancedWeeks),realm));
  }).catch(()=>{if(active)setRestoreError(true);});return()=>{active=false;};},[live,realm]);
 const [reviewWeek,setReviewWeek]=useState(week);
 const [spawn,setSpawn]=useState(()=>cavernSpawn(week)),[spawnKey,setSpawnKey]=useState(0),[nearest,setNearest]=useState<number|null>(null),[help,setHelp]=useState(false),[demoCurrent]=useState(()=>{try{return cavernWeek(sessionStorage.getItem(storageKey)??week,realm);}catch{return week;}});
 const [move,setMove]=useState(EMPTY_WORLD_MOVE_INPUT),[look,setLook]=useState(EMPTY_WORLD_LOOK_INPUT);
 const position=useRef(new THREE.Vector3(...spawn)),action=useRef(()=>{});
 const current=live?liveCurrent:demoCurrent;
 function enter(target:number){
  if(live&&!playable.includes(target))return;
  try{sessionStorage.setItem(storageKey,String(target));}catch{/* optional preview resume */}
  rememberWorld3DWeekEntry({realmId:realm,level:'Year 7',districtId:'shattered-realms',week:target,spawnPointId:`week-${target}`,returnHref:live?studentCavernHref(realm,target):cavernHref(realm,target)});
  router.push(live?level7LiveHref(realm,target,'week'):cavernWeekHref(realm,target));
 }
 useEffect(()=>{action.current=()=>{if(!help&&nearest!==null)enter(nearest);};});
 useEffect(()=>{const key=(event:KeyboardEvent)=>{if(event.key==='Escape')setHelp(false);if((event.target as HTMLElement)?.closest('button,a,select,input'))return;if(event.key.toLowerCase()==='e'&&!event.repeat){event.preventDefault();action.current();}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 const styles=useMemo(()=>({'--cavern-accent':theme.accentText,'--cavern-border':theme.borderRing,'--cavern-surface':theme.cardSurface,'--cavern-cta':theme.ctaGradientCss}) as CSSProperties,[theme]);
 return <main data-world3d-root data-cavern-realm={realm} className="summit-world cavern-world" style={styles}>
 <Canvas fallback={<p className="cavern-help">3D cavern. Use Continue your mission to open the weekly page without walking.</p>} dpr={1} camera={{position:[0,5,12],fov:55,far:100}} gl={{antialias:false,powerPreference:'high-performance'}}>
 <Suspense fallback={null}><CavernScene realm={realm} position={position} unlockedWeeks={playable}/></Suspense>
 <NumberSummitPlayer move={move} look={look} unlocked={1} volcanoOpen={false} spawn={spawn} spawnKey={spawnKey} paused={help} overview={false} position={position} onNearest={setNearest} onAltitude={()=>{}} floorResolver={(x,z)=>cavernFloor(x,z,realm)} nearestResolver={(x,z)=>cavernNearest(x,z,realm)}/>
 </Canvas>
 <header className="cavern-header"><div><small>THE SHATTERED REALMS · LEVEL 7</small><h1>{definition.name}</h1></div><Link href={live?`/world/expedition?realm=${realm}`:`/demo-review/number-adventure/3d?realm=${realm}`}>Back to the trails</Link></header>
 <section className="cavern-mission"><p className="cavern-kicker">YOUR NEXT STEP</p><h2>Follow the light deeper into the cavern.</h2><p>{definition.feature}. Each doorway opens your familiar weekly lesson page.</p><button className="cavern-primary" disabled={live&&!playable.includes(current)} onClick={()=>enter(current)}>Continue your mission · Week {current}</button><ReadAloudBtn text={`${definition.name}. Level 7. ${definition.feature}. Follow the lit path to ${cave7WeekCount(realm)} weekly doorways. Press E near a doorway to enter its week, or choose Continue your mission to open Week ${current}. The Core remains captive until Level 8. ${live?'Complete your assigned weeks to move deeper into the cavern.':`All ${cave7WeekCount(realm)} weeks are available for demo review.`}`}/></section>
 <aside className="cavern-review"><strong>{live?'YOUR JOURNEY':'DEMO PREVIEW'}</strong>{restoreError&&<p>We could not load your saved progress. Reload to try again.</p>}<label htmlFor="cavern-week">Explore a week doorway</label><select id="cavern-week" value={reviewWeek} onChange={e=>{const target=cavernWeek(e.target.value,realm);setReviewWeek(target);setSpawn(cavernSpawn(target));setSpawnKey(k=>k+1);setNearest(null);e.target.blur();}}>{realmWeeks(realm).map(w=><option key={w} value={w} disabled={live&&!playable.includes(w)}>Week {w}{live&&!playable.includes(w)?' · Locked':''}</option>)}</select><p>{live?'Complete each assigned week to open the next doorway.':'Exploring does not complete lessons or unlock rewards.'}</p><button onClick={()=>{setHelp(v=>!v);setMove(EMPTY_WORLD_MOVE_INPUT);setLook(EMPTY_WORLD_LOOK_INPUT);}}>Controls & mission</button></aside>
 {!help&&<><WorldJoystick input={move} onChange={setMove}/><WorldLookJoystick onChange={setLook}/></>}
 {!help&&nearest!==null&&<div className="summit-action"><span>{definition.name} · Week {nearest}</span><button className="cavern-primary" disabled={live&&!playable.includes(nearest)} onClick={()=>enter(nearest)}>{live&&!playable.includes(nearest)?'Locked · ': 'Enter '}Week {nearest} <kbd>E</kbd></button></div>}
 {help&&<section className="cavern-help"><h2>Explore at your own pace</h2><p>WASD or arrow keys: walk. Drag: look around. Shift: run. Touch: use the two joysticks. E: enter a nearby week.</p><p>Week 1 is by the entrance. The path grows darker, but signs and doorways stay lit. Pass the Level 7 post-test with 85% or above to unlock this realm’s Level 8 stronghold. The first qualifying realm opens the volcano.</p><ReadAloudBtn text="Use WASD or arrow keys to walk, drag to look, Shift to run, or the touch joysticks. Press E near a week doorway. Pass the Level 7 post-test with 85 percent or above to unlock this realm’s Level 8 stronghold. The first qualifying realm opens the volcano."/><button onClick={()=>setHelp(false)}>Back to the cavern</button></section>}
 </main>;
}
