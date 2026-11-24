'use client';
import Level7JourneyLinks from '@/components/lesson/Level7JourneyLinks';
import {level7LiveHref} from '@/lib/level7-release';
import {getActiveStudentIdentity} from '@/lib/studentIdentity';
import {restoreStudentStateFromServer} from '@/lib/student-progress-sync';
import {readProgress} from '@/data/progress';
import {readProgramStore,getPlayableWeeks,getRecommendedAssignedWeek,getWeekProgress,isWeekCompleteForRealm,type ProgramProgressStore} from '@/lib/program-progress';
import {cave7WeekCount} from "@/lib/cave7-config";
import {Suspense,useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {Canvas} from '@react-three/fiber';
import * as THREE from 'three';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {getRealmTheme} from '@/lib/useRealmTheme';
import type {ExpeditionRealm} from '@/lib/world3d/expedition-access';
import {CAVERN_REALMS,cavernFloor,cavernHref,cavernNearest,cavernSpawn,cavernWeek,cavernWeekHref,studentCavernHref} from '@/lib/world3d/shattered-realms';
import {rememberWorld3DWeekEntry} from '@/lib/world3d/return-context';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import NumberSummitPlayer from './NumberSummitPlayer';
import {WorldJoystick,WorldLookJoystick,EMPTY_WORLD_MOVE_INPUT,EMPTY_WORLD_LOOK_INPUT} from './SharedWorldPlayer';
import ShatteredRealmCavernScene from './ShatteredRealmCavernScene';

const realmWeeks=(realm:ExpeditionRealm)=>Array.from({length:cave7WeekCount(realm)},(_,i)=>i+1);
/** Weeks the student has finished, so their doorways can glow as restored. */
const finishedWeeks=(store:ProgramProgressStore,realm:ExpeditionRealm)=>realmWeeks(realm).filter(w=>isWeekCompleteForRealm(getWeekProgress(store,'Year 7',w,realm),realm,w,'Year 7'));
export default function ShatteredRealmCavern({realm,week,live=false}:{realm:ExpeditionRealm;week:number;live?:boolean}){
 const router=useRouter(),theme=getRealmTheme(realm),definition=CAVERN_REALMS[realm];
 const storageKey=live?`lul:${getActiveStudentIdentity().studentId}:shattered-realms:week:${realm}`:`lul:shattered-realms:demo-week:${realm}`;
 const [playable,setPlayable]=useState<number[]>(live?[]:realmWeeks(realm)),[restoreError,setRestoreError]=useState(false),[liveCurrent,setLiveCurrent]=useState(week);
 // A real student's doorways wait for saved progress, so they never flash as locked while it loads.
 const [ready,setReady]=useState(!live),[finished,setFinished]=useState<number[]>(()=>live?[]:finishedWeeks(readProgramStore(),realm));
 useEffect(()=>{if(!live)return;let active=true;const id=getActiveStudentIdentity().studentId;if(!id)return;
  restoreStudentStateFromServer(id,realm).then(()=>{if(!active)return;const p=readProgress(realm),store=readProgramStore();
   if(p?.year!=='Year 7'||!p.placementComplete){router.replace(p?.year==='Year 8'?'/world/expedition/coming-soon':`/pretest?year=Year%207&realm_id=${realm}`);return;}
   setPlayable(getPlayableWeeks(store,'Year 7',p?.requiredWeeks,p?.optionalWeeks,realm,p?.teacherAdvancedWeeks,p?.assignedWeek));
   setLiveCurrent(cavernWeek(getRecommendedAssignedWeek(store,'Year 7',p?.assignedWeek,p?.requiredWeeks,realm,p?.teacherAdvancedWeeks),realm));
   setFinished(finishedWeeks(store,realm));setReady(true);
  }).catch(()=>{if(active)setRestoreError(true);});return()=>{active=false;};},[live,realm,router]);
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
 <Canvas fallback={<p className="cavern-help">3D cavern. Use Continue your mission to open the weekly page without walking.</p>} dpr={[1,1.5]} camera={{position:[0,5,12],fov:57,far:110}} gl={{antialias:false,powerPreference:'high-performance'}}>
 <Suspense fallback={null}><ShatteredRealmCavernScene realm={realm} position={position} unlockedWeeks={playable} finishedWeeks={finished} ready={ready} current={current}/></Suspense>
 <NumberSummitPlayer move={move} look={look} unlocked={1} volcanoOpen={false} spawn={spawn} spawnKey={spawnKey} paused={help} overview={false} position={position} onNearest={setNearest} onAltitude={()=>{}} floorResolver={(x,z)=>cavernFloor(x,z,realm)} nearestResolver={(x,z)=>cavernNearest(x,z,realm)}/>
 </Canvas>
 <header className="cavern-bar">
  <div className="cavern-title"><small>LEVEL 7 · THE SHATTERED REALMS</small><h1>{definition.name}</h1></div>
  <button className="cavern-primary" disabled={!ready||(live&&!playable.includes(current))} onClick={()=>enter(current)}>{ready?<>Continue · Week {current}</>:'Loading your journey…'}</button>
  <label className="cavern-jump"><span>Go to</span><select id="cavern-week" aria-label="Go to a week doorway" value={reviewWeek} onChange={e=>{const target=cavernWeek(e.target.value,realm);setReviewWeek(target);setSpawn(cavernSpawn(target));setSpawnKey(k=>k+1);setNearest(null);e.target.blur();}}>{realmWeeks(realm).map(w=><option key={w} value={w} disabled={live&&!playable.includes(w)}>Week {w}{finished.includes(w)?' · Done':live&&!playable.includes(w)?' · Locked':''}</option>)}</select></label>
  <ReadAloudBtn text={`${definition.name}. Level 7. ${definition.feature}. Walk the lit path to ${cave7WeekCount(realm)} week doorways. Finished weeks glow. Press E near a doorway to enter its week, or choose Continue to open Week ${current}. The Core remains captive until Level 8.`}/>
  <button className="cavern-icon" onClick={()=>{setHelp(v=>!v);setMove(EMPTY_WORLD_MOVE_INPUT);setLook(EMPTY_WORLD_LOOK_INPUT);}}>Help</button>
  <nav className="cavern-exits"><Link href={live?`/world/expedition?realm=${realm}`:`/demo-review/number-adventure/3d?realm=${realm}`}>Trails</Link><Level7JourneyLinks realm={realm} week={current} demo={!live} showCave={false}/></nav>
 </header>
 {restoreError&&<p className="cavern-alert" role="alert">We could not load your saved progress. Reload to try again.</p>}
 {!help&&<><WorldJoystick input={move} onChange={setMove}/><WorldLookJoystick onChange={setLook}/></>}
 {!help&&nearest!==null&&<div className="summit-action"><span>{definition.name} · Week {nearest}</span><button className="cavern-primary" disabled={live&&!playable.includes(nearest)} onClick={()=>enter(nearest)}>{live&&!playable.includes(nearest)?'Locked · ': 'Enter '}Week {nearest} <kbd>E</kbd></button></div>}
 {help&&<section className="cavern-help"><h2>Explore at your own pace</h2><p>WASD or arrow keys: walk. Drag: look around. Shift: run. Touch: use the two joysticks. E: enter a nearby week.</p><p>Week 1 is by the entrance. Finished weeks glow with a restored crystal. {live?'Complete each assigned week to open the next doorway.':'Demo preview: exploring does not complete lessons or unlock rewards.'}</p><p>The path grows darker, but signs and doorways stay lit. Pass the Level 7 post-test with 85% or above to unlock this realm’s Level 8 stronghold. The first qualifying realm opens the volcano.</p><ReadAloudBtn text="Use WASD or arrow keys to walk, drag to look, Shift to run, or the touch joysticks. Press E near a week doorway. Pass the Level 7 post-test with 85 percent or above to unlock this realm’s Level 8 stronghold. The first qualifying realm opens the volcano."/><button onClick={()=>setHelp(false)}>Back to the cavern</button></section>}
 </main>;
}
