'use client';
import {level7LiveHref} from '@/lib/level7-release';
import {LEVEL8_LIVE,level8StrongholdHref} from '@/lib/level8-release';
import {getActiveStudentIdentity} from '@/lib/studentIdentity';
import {restoreStudentStateFromServer} from '@/lib/student-progress-sync';
import {readProgress} from '@/data/progress';
import {readProgramStore,getPlayableWeeks,getRecommendedAssignedWeek,getWeekProgress,isWeekCompleteForRealm,type ProgramProgressStore} from '@/lib/program-progress';
import {cave7WeekCount} from "@/lib/cave7-config";
import {Suspense,useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {Canvas} from '@react-three/fiber';
import * as THREE from 'three';
import {useRouter} from 'next/navigation';
import {getRealmTheme} from '@/lib/useRealmTheme';
import type {ExpeditionRealm} from '@/lib/world3d/expedition-access';
import {CAVERN_REALMS,cavernFloor,cavernHref,cavernNearest,cavernSpawn,cavernWeek,cavernWeekHref,studentCavernHref} from '@/lib/world3d/shattered-realms';
import {rememberWorld3DWeekEntry} from '@/lib/world3d/return-context';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {CalendarDays,CircleHelp,X} from 'lucide-react';
import {WorldHUD} from './WorldHUD';
import {WorldInteractionPrompt} from './WorldInteractionPrompt';
import {joinSpeechParts,WorldVoiceButton} from './WorldVoiceButton';
import NumberSummitPlayer from './NumberSummitPlayer';
import {KeyboardWorldAction,WorldJoystick,WorldLookJoystick,EMPTY_WORLD_MOVE_INPUT,EMPTY_WORLD_LOOK_INPUT} from './SharedWorldPlayer';
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
   if(p?.year!=='Year 7'||!p.placementComplete){router.replace(p?.year==='Year 8'?(LEVEL8_LIVE?level8StrongholdHref(realm):'/world/expedition/coming-soon'):`/pretest?year=Year%207&realm_id=${realm}`);return;}
   setPlayable(getPlayableWeeks(store,'Year 7',p?.requiredWeeks,p?.optionalWeeks,realm,p?.teacherAdvancedWeeks,p?.assignedWeek));
   setLiveCurrent(cavernWeek(getRecommendedAssignedWeek(store,'Year 7',p?.assignedWeek,p?.requiredWeeks,realm,p?.teacherAdvancedWeeks),realm));
   setFinished(finishedWeeks(store,realm));setReady(true);
  }).catch(()=>{if(active)setRestoreError(true);});return()=>{active=false;};},[live,realm,router]);
 const [spawn,setSpawn]=useState(()=>cavernSpawn(week)),[spawnKey,setSpawnKey]=useState(0),[nearest,setNearest]=useState<number|null>(null),[panel,setPanel]=useState<'help'|'weeks'|null>(null),[demoCurrent]=useState(()=>{try{return cavernWeek(sessionStorage.getItem(storageKey)??week,realm);}catch{return week;}});
 const [move,setMove]=useState(EMPTY_WORLD_MOVE_INPUT),[look,setLook]=useState(EMPTY_WORLD_LOOK_INPUT);
 const position=useRef(new THREE.Vector3(...spawn));
 const current=live?liveCurrent:demoCurrent,weeks=realmWeeks(realm);
 function enter(target:number){
  if(live&&!playable.includes(target))return;
  try{sessionStorage.setItem(storageKey,String(target));}catch{/* optional preview resume */}
  rememberWorld3DWeekEntry({realmId:realm,level:'Year 7',districtId:'shattered-realms',week:target,spawnPointId:`week-${target}`,returnHref:live?studentCavernHref(realm,target):cavernHref(realm,target)});
  router.push(live?level7LiveHref(realm,target,'week'):cavernWeekHref(realm,target));
 }
 function openPanel(next:'help'|'weeks'|null){setPanel(next);setMove(EMPTY_WORLD_MOVE_INPUT);setLook(EMPTY_WORLD_LOOK_INPUT);}
 /** Walk to a week's doorway (the fast-travel list); entering still happens at the door or with Continue. */
 function goToDoor(target:number){setSpawn(cavernSpawn(target));setSpawnKey(k=>k+1);setNearest(null);openPanel(null);}
 useEffect(()=>{const key=(event:KeyboardEvent)=>{if(event.key==='Escape')setPanel(null);};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 const status=(w:number)=>!ready?'Loading':finished.includes(w)?'Complete':w===current?'Continue here':live&&!playable.includes(w)?'Locked':'Open';
 const styles=useMemo(()=>({'--cavern-accent':theme.accentText,'--cavern-border':theme.borderRing,'--cavern-surface':theme.cardSurface,'--cavern-cta':theme.ctaGradientCss}) as CSSProperties,[theme]);
 const doorOpen=nearest!==null&&ready&&(!live||playable.includes(nearest));
 return <main data-world3d-root data-cavern-realm={realm} className="summit-world cavern-world" style={styles}>
 <Canvas fallback={<p className="cavern-help">3D cavern. Use Continue to open the weekly page without walking.</p>} dpr={[1,1.5]} camera={{position:[0,5,12],fov:57,far:110}} gl={{antialias:false,powerPreference:'high-performance'}}>
 <Suspense fallback={null}><ShatteredRealmCavernScene realm={realm} position={position} unlockedWeeks={playable} finishedWeeks={finished} ready={ready} current={current}/></Suspense>
 <NumberSummitPlayer move={move} look={look} unlocked={1} volcanoOpen={false} spawn={spawn} spawnKey={spawnKey} paused={panel!==null} overview={false} position={position} onNearest={setNearest} onAltitude={()=>{}} floorResolver={(x,z)=>cavernFloor(x,z,realm)} nearestResolver={(x,z)=>cavernNearest(x,z,realm)}/>
 </Canvas>
 {/* The same world display as the Central Hub and the realm worlds: logo, mission card, stats and dock. */}
 <WorldHUD context="realm" realmId={realm} preview={!live}
  mission={{eyebrow:'LEVEL 7 · THE SHATTERED REALMS',title:definition.name,detail:ready?`${finished.length} of ${weeks.length} weeks complete · ${definition.feature}`:'Loading your journey…'}}
  navActions={[{key:'weeks',label:'Weeks',icon:<CalendarDays size={16}/>,onClick:()=>openPanel('weeks')},{key:'help',label:'Help',icon:<CircleHelp size={16}/>,onClick:()=>openPanel('help')}]}
  primaryAction={{label:'TRAILS',icon:'map',onClick:()=>router.push(live?`/world/expedition?realm=${realm}`:`/demo-review/number-adventure/3d?realm=${realm}`)}}
  primaryLabel={ready?`CONTINUE · WEEK ${current}`:'LOADING…'} primaryDisabled={!ready||(live&&!playable.includes(current))} onQuickStart={()=>enter(current)}/>
 {restoreError&&<p className="cavern-alert" role="alert">We could not load your saved progress. Reload to try again.</p>}
 {panel===null&&<><WorldJoystick input={move} onChange={setMove}/><WorldLookJoystick onChange={setLook}/></>}
 {panel===null&&nearest!==null&&<WorldInteractionPrompt location={`${definition.name} · Week ${nearest}`} status={status(nearest)} actionLabel="ENTER WEEK" disabled={!doorOpen} onAction={()=>enter(nearest)}/>}
 <KeyboardWorldAction enabled={panel===null&&doorOpen} onAction={()=>{if(nearest!==null)enter(nearest);}}/>
 {panel==='weeks'&&<div className="worldTeleportBackdrop" role="dialog" aria-modal="true" aria-label={`${definition.name} weeks`}>
  <section className="worldTeleportPanel">
   <header><div><span>LEVEL 7 · {definition.name.toUpperCase()}</span><h2>WEEKS</h2></div><div className="worldTeleportHeaderActions"><WorldVoiceButton text={`${definition.name} weeks. Choose a week to walk to its doorway.`} label="Read weeks"/><button type="button" onClick={()=>openPanel(null)} aria-label="Close weeks"><X size={20}/></button></div></header>
   <div className="worldTeleportGrid">{weeks.map(w=>{const locked=live&&!playable.includes(w),label=status(w);return <div key={w} className={`worldTeleportTile ${locked?'worldTeleportTileDisabled':''}`} style={{borderColor:finished.includes(w)?'#ffd36a':theme.accentText}}>
    <WorldVoiceButton text={joinSpeechParts([`Week ${w}`,label])} compact className="worldTeleportTileRead" label={`Read week ${w}`}/>
    <strong>Week {w}</strong><span style={{color:finished.includes(w)?'#ffd36a':theme.accentText}}>{label}</span><small>{locked?'LOCKED':'WALK TO DOOR'}</small>
    <button type="button" disabled={locked} onClick={()=>goToDoor(w)} aria-label={`${locked?'Locked':'Walk to'} week ${w}`}><span>{locked?'Locked':'Go'}</span></button>
   </div>;})}</div>
  </section>
 </div>}
 {panel==='help'&&<section className="cavern-help"><h2>Explore at your own pace</h2><p>WASD or arrow keys: walk. Drag: look around. Shift: run. Touch: use the two joysticks. E: enter a nearby week.</p><p>Week 1 is by the entrance. Finished weeks glow with a restored crystal. {live?'Complete each assigned week to open the next doorway.':'Demo preview: exploring does not complete lessons or unlock rewards.'}</p><p>The path grows darker, but signs and doorways stay lit. Pass the Level 7 post-test with 85% or above to unlock this realm’s Level 8 stronghold. The first qualifying realm opens the volcano.</p><ReadAloudBtn text="Use WASD or arrow keys to walk, drag to look, Shift to run, or the touch joysticks. Press E near a week doorway. Pass the Level 7 post-test with 85 percent or above to unlock this realm’s Level 8 stronghold. The first qualifying realm opens the volcano."/><button onClick={()=>openPanel(null)}>Back to the cavern</button></section>}
 </main>;
}
