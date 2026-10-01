'use client';
import {Suspense,useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {getRealmTheme} from '@/lib/useRealmTheme';
import type {ExpeditionRealm} from '@/lib/world3d/expedition-access';
import {CAVERN_REALMS,CAVERN_WEEK_COUNT,cavernDarkness,cavernDoor,cavernFloor,cavernHref,cavernNearest,cavernSpawn,cavernWeek,cavernWeekHref} from '@/lib/world3d/shattered-realms';
import {rememberWorld3DWeekEntry} from '@/lib/world3d/return-context';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import NumberSummitPlayer from './NumberSummitPlayer';
import {WorldJoystick,WorldLookJoystick,EMPTY_WORLD_MOVE_INPUT,EMPTY_WORLD_LOOK_INPUT} from './SharedWorldPlayer';
import WorldPlaque from './WorldPlaque';
import {Box,Stone} from './ExpeditionCrossroads';

const WEEKS=Array.from({length:CAVERN_WEEK_COUNT},(_,i)=>i+1);
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
function CavernScene({realm,position}:{realm:ExpeditionRealm;position:React.RefObject<THREE.Vector3>}){
 const theme=getRealmTheme(realm),light=useRef<THREE.AmbientLight>(null),fog=useRef<THREE.Fog>(null);
 const sections=useRef<(THREE.Group|null)[]>([]);
 useFrame(()=>{const z=position.current!.z,depth=cavernDarkness(z);if(light.current)light.current.intensity=.9-depth*.52;if(fog.current){fog.current.near=22-depth*8;fog.current.far=76-depth*20;}sections.current.forEach((g,i)=>{if(g)g.visible=Math.abs(z-cavernDoor(i+1)[2])<65;});});
 return <>
 <color attach="background" args={['#10131c']}/><fog ref={fog} attach="fog" args={['#10131c',22,76]}/>
 <ambientLight ref={light} intensity={.9}/><hemisphereLight args={['#adb8d1','#242129',1]}/><directionalLight position={[2,10,8]} intensity={.8}/>
 <Box at={[0,-.35,-96]} size={[16,.7,232]} colour="#47444b"/>
 <Box at={[0,.025,-96]} size={[7,.04,228]} colour="#7f7468"/>
 {WEEKS.map((week,i)=>{const p=cavernDoor(week),side=week%2===1?-1:1;return <group key={week} ref={g=>{sections.current[i]=g;}}>
 {[-1,1].map(s=><group key={s}>{[0,1,2].map(j=><Stone key={j} at={[s*10,4+j*.2,p[2]-6+j*5]} scale={[3.4,7+(j%2),3.7]} colour={i<4?'#50535c':i<8?'#3b414d':'#2a303e'}/>)}</group>)}
 <mesh position={[0,5.5,p[2]-6]}><torusGeometry args={[9,.9,5,16,Math.PI]}/><meshStandardMaterial color="#484551" roughness={1}/></mesh>
 <Box at={[0,14,p[2]]} size={[22,2,17]} colour="#343540"/>
 <group position={p} rotation={[0,side===-1?Math.PI/2:-Math.PI/2,0]}>
 <Box at={[0,2.8,-.2]} size={[4.8,5.6,.5]} colour="#101523"/>
 {[-2.4,2.4].map(x=><Box key={x} at={[x,2.9,0]} size={[.6,5.8,.8]} colour="#85828b"/>)}
 <Box at={[0,5.8,0]} size={[5.4,.7,.8]} colour="#85828b"/>
 <Box at={[0,2.5,.09]} size={[3.9,4.8,.05]} colour={theme.ctaTo}/>
 <WorldPlaque at={[0,5,.5]} title={`WEEK ${week}`} subtitle="WEEKLY LESSONS" width={4.5} colour={theme.accentText}/>
 </group>
 {[-1,1].map(s=><Crystal key={s} x={s*4.6} z={p[2]+4} colour={theme.accentText} scale={.6}/>)}
 <Features realm={realm} colour={theme.accentText} week={week}/>
 </group>;})}
 <group position={[0,0,-207]}><Box at={[0,5,-3]} size={[18,10,2]} colour="#242532"/><Crystal x={0} y={4} z={0} colour={theme.accentText} scale={2}/>{[-3,-2,-1,0,1,2,3].map(x=><Box key={x} at={[x,3.6,2]} size={[.16,7.2,.18]} colour="#90909b"/>)}<WorldPlaque at={[0,8,3]} title="THE CORE IS STILL CAPTIVE" subtitle="LEVEL 8 · THE FINAL BATTLE" width={8}/></group>
 </>;
}
export default function ShatteredRealmCavern({realm,week}:{realm:ExpeditionRealm;week:number}){
 const router=useRouter(),theme=getRealmTheme(realm),definition=CAVERN_REALMS[realm];
 const storageKey=`lul:shattered-realms:demo-week:${realm}`;
 const [reviewWeek,setReviewWeek]=useState(week);
 const [spawn,setSpawn]=useState(()=>cavernSpawn(week)),[spawnKey,setSpawnKey]=useState(0),[nearest,setNearest]=useState<number|null>(null),[help,setHelp]=useState(false),[current]=useState(()=>{try{return cavernWeek(sessionStorage.getItem(storageKey)??week);}catch{return week;}});
 const [move,setMove]=useState(EMPTY_WORLD_MOVE_INPUT),[look,setLook]=useState(EMPTY_WORLD_LOOK_INPUT);
 const position=useRef(new THREE.Vector3(...spawn)),action=useRef(()=>{});
 function enter(target:number){
  try{sessionStorage.setItem(storageKey,String(target));}catch{/* optional preview resume */}
  rememberWorld3DWeekEntry({realmId:realm,level:'Year 7',districtId:'shattered-realms',week:target,spawnPointId:`week-${target}`,returnHref:cavernHref(realm,target)});
  router.push(cavernWeekHref(realm,target));
 }
 useEffect(()=>{action.current=()=>{if(!help&&nearest!==null)enter(nearest);};});
 useEffect(()=>{const key=(event:KeyboardEvent)=>{if(event.key==='Escape')setHelp(false);if((event.target as HTMLElement)?.closest('button,a,select,input'))return;if(event.key.toLowerCase()==='e'&&!event.repeat){event.preventDefault();action.current();}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 const styles=useMemo(()=>({'--cavern-accent':theme.accentText,'--cavern-border':theme.borderRing,'--cavern-surface':theme.cardSurface,'--cavern-cta':theme.ctaGradientCss}) as CSSProperties,[theme]);
 return <main data-world3d-root data-cavern-realm={realm} className="summit-world cavern-world" style={styles}>
 <Canvas fallback={<p className="cavern-help">3D cavern. Use Continue your mission to open the weekly page without walking.</p>} dpr={1} camera={{position:[0,5,12],fov:55,far:100}} gl={{antialias:false,powerPreference:'high-performance'}}>
 <Suspense fallback={null}><CavernScene realm={realm} position={position}/></Suspense>
 <NumberSummitPlayer move={move} look={look} unlocked={1} volcanoOpen={false} spawn={spawn} spawnKey={spawnKey} paused={help} overview={false} position={position} onNearest={setNearest} onAltitude={()=>{}} floorResolver={cavernFloor} nearestResolver={cavernNearest}/>
 </Canvas>
 <header className="cavern-header"><div><small>THE SHATTERED REALMS · LEVEL 7</small><h1>{definition.name}</h1></div><Link href={`/demo-review/number-adventure/3d?realm=${realm}`}>Back to the trails</Link></header>
 <section className="cavern-mission"><p className="cavern-kicker">YOUR NEXT STEP</p><h2>Follow the light deeper into the cavern.</h2><p>{definition.feature}. Each doorway opens your familiar weekly lesson page.</p><button className="cavern-primary" onClick={()=>enter(current)}>Continue your mission · Week {current}</button><ReadAloudBtn text={`${definition.name}. Level 7. ${definition.feature}. Follow the lit path to twelve weekly doorways. Press E near a doorway to enter its week, or choose Continue your mission to open Week ${current}. The Core remains captive until Level 8. Lessons are coming soon.`}/></section>
 <aside className="cavern-review"><strong>DEMO PREVIEW</strong><label htmlFor="cavern-week">Explore a week doorway</label><select id="cavern-week" value={reviewWeek} onChange={e=>{const target=cavernWeek(e.target.value);setReviewWeek(target);setSpawn(cavernSpawn(target));setSpawnKey(k=>k+1);setNearest(null);e.target.blur();}}>{WEEKS.map(w=><option key={w} value={w}>Week {w}</option>)}</select><p>Exploring does not complete lessons or unlock rewards.</p><button onClick={()=>{setHelp(v=>!v);setMove(EMPTY_WORLD_MOVE_INPUT);setLook(EMPTY_WORLD_LOOK_INPUT);}}>Controls & mission</button></aside>
 {!help&&<><WorldJoystick input={move} onChange={setMove}/><WorldLookJoystick onChange={setLook}/></>}
 {!help&&nearest!==null&&<div className="summit-action"><span>{definition.name} · Week {nearest}</span><button className="cavern-primary" onClick={()=>enter(nearest)}>Enter Week {nearest} <kbd>E</kbd></button></div>}
 {help&&<section className="cavern-help"><h2>Explore at your own pace</h2><p>WASD or arrow keys: walk. Drag: look around. Shift: run. Touch: use the two joysticks. E: enter a nearby week.</p><p>Week 1 is by the entrance. The path grows darker, but signs and doorways stay lit. Pass the Level 7 post-test with 85% or above to unlock this realm’s Level 8 stronghold. The first qualifying realm opens the volcano.</p><ReadAloudBtn text="Use WASD or arrow keys to walk, drag to look, Shift to run, or the touch joysticks. Press E near a week doorway. Pass the Level 7 post-test with 85 percent or above to unlock this realm’s Level 8 stronghold. The first qualifying realm opens the volcano."/><button onClick={()=>setHelp(false)}>Back to the cavern</button></section>}
 </main>;
}
