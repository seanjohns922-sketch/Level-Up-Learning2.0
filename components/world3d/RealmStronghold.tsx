'use client';
import {level8Background,level8DemoHref} from '@/lib/level8-routes';
import {level8LiveHref,level8StrongholdHref} from '@/lib/level8-release';
import {readProgress} from '@/data/progress';
import {getActiveStudentIdentity} from '@/lib/studentIdentity';
import {restoreStudentStateFromServer} from '@/lib/student-progress-sync';
import {getPlayableWeeks,getRecommendedAssignedWeek,getWeekProgress,hasCompletedRequiredWeeks,isWeekCompleteForRealm,readProgramStore} from '@/lib/program-progress';
import {rememberWorld3DWeekEntry} from '@/lib/world3d/return-context';
import {studentCavernHref} from '@/lib/world3d/shattered-realms';
import {Suspense,useEffect,useMemo,useRef,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import * as THREE from 'three';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {BookOpen,CalendarDays,CircleHelp,X} from 'lucide-react';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {WorldHUD} from './WorldHUD';
import {WorldInteractionPrompt} from './WorldInteractionPrompt';
import {joinSpeechParts,WorldVoiceButton} from './WorldVoiceButton';
import NumberSummitPlayer from './NumberSummitPlayer';
import RealmStrongholdScene,{type PortalState} from './RealmStrongholdScene';
import {SHATTER_SECONDS} from './StrongholdSeal';
import {DONE_GOLD} from './VolcanicKit';
import {KeyboardWorldAction,WorldJoystick,WorldLookJoystick,EMPTY_WORLD_MOVE_INPUT,EMPTY_WORLD_LOOK_INPUT} from './SharedWorldPlayer';
import {STRONGHOLD_LIVE_SUMMIT,STRONGHOLD_REALMS,STRONGHOLD_SUMMIT_RETURN,strongholdFloor,strongholdLayout,strongholdNearest,strongholdPortalSpot,strongholdStory,type StrongholdStory} from '@/lib/world3d/number-stronghold';
import type {ExpeditionRealm} from '@/lib/world3d/expedition-access';
import type {SummitPoint} from '@/lib/world3d/number-summit';

/** The halls have a lit roof and towering columns, so the camera rests tilted up a little more than on the summit. */
const STRONGHOLD_CAMERA_TILT=.32;

/** The realm's painted stronghold behind each story card: under the Fog's purple while sealed, bright once the Core is free. */
function StoryArt({realm,recovery=false,colour,label}:{realm:ExpeditionRealm;recovery?:boolean;colour:string;label:string}){
 return <div className={`stronghold-story-art ${recovery?'is-free':''}`} role="img" aria-label={label} style={{backgroundImage:`url(${level8Background(realm)})`,'--story-glow':colour} as React.CSSProperties}/>;
}

/** True when the student arrives straight from winning the final battle (`?victory=1`). */
function wonBattle(){try{return new URLSearchParams(window.location.search).get('victory')==='1';}catch{return false;}}

/** Week a student came back from (`?week=` on the stronghold link), so they reappear at its portal. */
function returnWeek(weeks:number){try{const w=Number(new URLSearchParams(window.location.search).get('week'));return Number.isInteger(w)&&w>=1&&w<=weeks?w:null;}catch{return null;}}

/** Where a student stands in the stronghold: finished and open weeks, the week to continue, and the Core chamber. */
type Hall={finished:number[];open:number[];current:number;coreOpen:boolean;recovered:boolean};
const weekList=(weeks:number)=>Array.from({length:weeks},(_,i)=>i+1);

/** Demo review: weeks before the chosen one count as finished. */
function demoHall(chosen:number,weeks:number,recovered:boolean):Hall{
 const all=weekList(weeks);
 return {finished:all.filter(w=>w<chosen),open:all.filter(w=>w<=chosen),current:Math.min(chosen,weeks),coreOpen:chosen>weeks,recovered};
}

/** A real student: the same canonical week gates as the Level 7 caves and the earlier realm maps. The Core chamber
 * opens once every assigned week is finished, the same rule the post-test uses. */
function liveHall(realm:ExpeditionRealm,weeks:number,recovered:boolean):Hall|null{
 const p=readProgress(realm),store=readProgramStore();
 if(p?.year!=='Year 8')return null;
 const required=p.requiredWeeks?.length?p.requiredWeeks:weekList(weeks);
 return {
  finished:weekList(weeks).filter(w=>isWeekCompleteForRealm(getWeekProgress(store,'Year 8',w,realm),realm,w,'Year 8')),
  open:getPlayableWeeks(store,'Year 8',p.requiredWeeks,p.optionalWeeks,realm,p.teacherAdvancedWeeks,p.assignedWeek),
  current:Math.min(weeks,getRecommendedAssignedWeek(store,'Year 8',p.assignedWeek,p.requiredWeeks,realm,p.teacherAdvancedWeeks)),
  coreOpen:recovered||p.status==='PASSED'||hasCompletedRequiredWeeks(store,'Year 8',required,realm,p.teacherAdvancedWeeks),
  recovered,
 };
}

/**
 * live: a real student's stronghold, from their saved progress. `recovered` is the server's word that they have
 * mastered Level 8 (85%+ on its pre- or post-test). Without `live` it is the demo review, with a progress picker.
 */
export default function RealmStronghold({realm,live=false,recovered:serverRecovered=false}:{realm:ExpeditionRealm;live?:boolean;recovered?:boolean}){
 const router=useRouter();
 const info=STRONGHOLD_REALMS[realm],story_=strongholdStory(realm),Guardian=info.guardian[0].toUpperCase()+info.guardian.slice(1);
 const layout=strongholdLayout(realm),portals=layout.portals,coreId=layout.coreId,weeks=layout.weeks;
 const recoveredKey=`reliq:demo:${realm}-core-recovered`,progressKey=`reliq:demo:${realm}-stronghold:progress`;
 const weekHref=(w:number)=>live?level8LiveHref(realm,w,'week'):level8DemoHref(realm,w,'week');
 const [arrival]=useState(()=>returnWeek(weeks)),[victory]=useState(wonBattle);
 const [move,setMove]=useState(EMPTY_WORLD_MOVE_INPUT),[look,setLook]=useState(EMPTY_WORLD_LOOK_INPUT);
 const [spawn,setSpawn]=useState<SummitPoint>(()=>victory?strongholdPortalSpot(realm,coreId):arrival?strongholdPortalSpot(realm,arrival):[0,0,10]),[spawnKey,setSpawnKey]=useState(0),[nearest,setNearest]=useState<number|null>(null);
 // Demo review only: the week in progress is chosen in the Weeks panel. Earlier weeks count as finished.
 const [chosen,setChosen]=useState(()=>{try{return Math.min(coreId,Math.max(1,Number(sessionStorage.getItem(progressKey))||3));}catch{return 3;}});
 const [liveProgress,setLiveProgress]=useState<Hall|null>(null),[restoreError,setRestoreError]=useState(false);
 // Whether the Core shows as free. A won battle starts sealed so the student can watch it shatter.
 const [recovered,setRecovered]=useState(()=>{if(live)return serverRecovered&&!victory;try{return sessionStorage.getItem(recoveredKey)==='true';}catch{return false;}});
 const demo=useMemo(()=>demoHall(chosen,weeks,recovered),[chosen,weeks,recovered]);
 const hall=live?liveProgress:demo,ready=hall!==null;
 const current=hall?.current??1,coreOpen=hall?.coreOpen??false,finished=hall?.finished.length??0;
 const isOpen=(w:number)=>hall?.open.includes(w)??false;
 // A real student's portals wait for their saved progress, so they never flash as locked while it loads.
 useEffect(()=>{if(!live)return;let active=true;const id=getActiveStudentIdentity().studentId;if(!id){router.replace('/login');return;}
  restoreStudentStateFromServer(id,realm).then(()=>{if(!active)return;const p=readProgress(realm);
   // Passing Level 7 opens the stronghold; the Level 8 pre-test comes first, as the Level 7 pre-test does in the caves.
   const pretest=`/pretest?year=Year%208&realm_id=${realm}`;
   if(p?.year!=='Year 8'){router.replace(p?.year==='Year 7'?(p.status==='PASSED'?pretest:studentCavernHref(realm)):'/world/tower');return;}
   if(!p.placementComplete&&p.status!=='PASSED'){router.replace(pretest);return;}
   setLiveProgress(liveHall(realm,weeks,serverRecovered));
  }).catch(()=>{if(active)setRestoreError(true);});return()=>{active=false;};},[live,realm,router,weeks,serverRecovered]);
 const [story,setStory]=useState<StrongholdStory|null>(arrival||victory?null:'entrance'),[panel,setPanel]=useState<'weeks'|'help'|null>(null),[shattering,setShattering]=useState(false);
 const position=useRef(new THREE.Vector3(...spawn)),dialog=useRef<HTMLElement>(null),timers=useRef<number[]>([]);
 const paused=story!==null||panel!==null||shattering;
 function stop(){setMove(EMPTY_WORLD_MOVE_INPUT);setLook(EMPTY_WORLD_LOOK_INPUT);}
 function close(){setStory(null);setPanel(null);stop();}
 function open(next:'weeks'|'help'){stop();setPanel(next);}
 function goTo(target:number){setSpawn(strongholdPortalSpot(realm,target));setSpawnKey(k=>k+1);setNearest(null);close();}
 function preview(next:number){setChosen(next);try{sessionStorage.setItem(progressKey,String(next));}catch{/* optional preview state */}}
 /** A portal opens its week page directly, as a Level 7 cave door does; the Core chamber opens the battle story. */
 function enter(target:number){stop();if(target===coreId){if(coreOpen)setStory(recovered?'recovery':'battle');return;}if(!isOpen(target))return;
  if(live)rememberWorld3DWeekEntry({realmId:realm,level:'Year 8',districtId:'stronghold',week:target,spawnPointId:`week-${target}`,returnHref:level8StrongholdHref(realm,{week:target})});
  router.push(weekHref(target));}
 /** The victory: stand before the Core, watch the seal shatter, then the Core shines and the recovery story follows. */
 function recover(){close();setSpawn(strongholdPortalSpot(realm,coreId));setSpawnKey(k=>k+1);setShattering(true);
  timers.current.push(window.setTimeout(()=>{setRecovered(true);if(!live)try{sessionStorage.setItem(recoveredKey,'true');}catch{/* optional preview state */}},SHATTER_SECONDS*1000));
  timers.current.push(window.setTimeout(()=>{setShattering(false);setStory('recovery');},SHATTER_SECONDS*1000+1600));}
 useEffect(()=>()=>timers.current.forEach(window.clearTimeout),[]);
 // Back from a won battle: once the hall has had a moment to appear, the seal shatters. The flag is removed so a reload
 // doesn't replay it. A real student's seal only shatters when the server confirms the battle was won.
 const recoverLater=useRef(recover);useEffect(()=>{recoverLater.current=recover;});
 const celebrate=victory&&ready&&(!live||serverRecovered);
 useEffect(()=>{if(!victory||!ready)return;window.history.replaceState(null,'',window.location.pathname);if(!celebrate)return;const id=window.setTimeout(()=>recoverLater.current(),1500);return()=>window.clearTimeout(id);},[victory,ready,celebrate]);
 // Story dialogs take focus for keyboard users; closing returns it to the world so WASD walks straight away.
 useEffect(()=>{if(story)dialog.current?.querySelector<HTMLElement>('.stronghold-actions>*')?.focus();else if(document.activeElement instanceof HTMLElement&&document.activeElement!==document.body)document.activeElement.blur();},[story]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key!=='Escape')return;setStory(null);setPanel(null);setMove(EMPTY_WORLD_MOVE_INPUT);setLook(EMPTY_WORLD_LOOK_INPUT);};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 const status=(w:number)=>!hall?'Loading':w===coreId?(recovered?'Restored':coreOpen?'Open':`Finish all ${weeks} weeks first`):hall.finished.includes(w)?'Complete':w===current?'Continue here':isOpen(w)?'Open':'Locked';
 const doorOpen=nearest!==null&&ready&&(nearest===coreId?coreOpen:isOpen(nearest));
 const weekStates=useMemo(()=>weekList(weeks).map((w):PortalState=>hall?.finished.includes(w)?'completed':hall?.open.includes(w)?'current':'locked'),[hall,weeks]);
 const tabs=[{key:'weeks',label:'Weeks',icon:<CalendarDays size={16}/>,onClick:()=>open('weeks')},{key:'story',label:'Story',icon:<BookOpen size={16}/>,onClick:()=>{stop();setStory('entrance');}},{key:'help',label:'Help',icon:<CircleHelp size={16}/>,onClick:()=>open('help')}];
 const storyPanel=story?story_[story]:null;
 const artLabel=story==='recovery'?`The ${info.core} shines as the Fog clears.`:`A glowing ${info.core} trapped inside the Fog’s purple seal.`;
 const battleFacts=['30 questions','Every answer strikes the seal','85% shatters it'];
 return <main className="summit-world stronghold-world" data-world3d-root data-stronghold={`${realm}-${live?'live':'demo'}`} style={{'--stronghold-accent':info.colour} as React.CSSProperties}>
 <Canvas dpr={1} camera={{position:[0,5,18],fov:58,near:.1,far:160}} gl={{antialias:false,powerPreference:'high-performance'}} fallback={<p className="stronghold-fallback">3D stronghold. Use Continue to open the weekly page without walking.</p>}><Suspense fallback={null}><RealmStrongholdScene realm={realm} weekStates={weekStates} finished={finished} recovered={recovered} shattering={shattering} position={position}/><NumberSummitPlayer move={move} look={look} unlocked={1} volcanoOpen={false} spawn={spawn} spawnKey={spawnKey} paused={paused} overview={false} position={position} onNearest={setNearest} onAltitude={()=>{}} floorResolver={(x,z)=>strongholdFloor(x,z,realm)} nearestResolver={(x,z)=>strongholdNearest(x,z,realm)} restPitch={STRONGHOLD_CAMERA_TILT}/></Suspense></Canvas>
 {/* The same world display as the Central Hub, the realm worlds and the Level 7 caves. */}
 <WorldHUD context="realm" realmId={realm} preview={!live}
  mission={{eyebrow:'LEVEL 8 · THE FINAL BATTLE',title:`${info.name} stronghold`,detail:recovered?'The Core is free · The Fog is clearing':`${finished} of ${weeks} weeks complete · Break ${info.guardian}’s seal`}}
  navActions={tabs}
  primaryAction={{label:'SUMMIT',icon:'map',onClick:()=>router.push(live?STRONGHOLD_LIVE_SUMMIT:STRONGHOLD_SUMMIT_RETURN)}}
  primaryLabel={!ready?'LOADING…':coreOpen?'THE CORE CHAMBER':`CONTINUE · WEEK ${current}`} primaryDisabled={!ready} onQuickStart={()=>coreOpen?goTo(coreId):enter(current)}/>
 {restoreError&&<p className="cavern-alert" role="alert">We could not load your saved progress. Reload to try again.</p>}
 {!paused&&<><WorldJoystick input={move} onChange={setMove}/><WorldLookJoystick onChange={setLook}/></>}
 {!paused&&nearest!==null&&<WorldInteractionPrompt location={nearest===coreId?`${info.name} · The Core chamber`:`${info.name} · Week ${nearest}`} status={status(nearest)} actionLabel={nearest===coreId?'ENTER THE CORE CHAMBER':'ENTER WEEK'} disabled={!doorOpen} onAction={()=>enter(nearest)}/>}
 <KeyboardWorldAction enabled={!paused&&doorOpen} onAction={()=>{if(nearest!==null)enter(nearest);}}/>
 {panel==='weeks'&&<div className="worldTeleportBackdrop" role="dialog" aria-modal="true" aria-label={`${info.name} weeks`}>
  <section className="worldTeleportPanel">
   <header><div><span>LEVEL 8 · {info.name.toUpperCase()} STRONGHOLD</span><h2>WEEKS</h2></div><div className="worldTeleportHeaderActions"><WorldVoiceButton text={`${info.name} stronghold weeks. Choose a week to walk to its portal.`} label="Read weeks"/><button type="button" onClick={close} aria-label="Close weeks"><X size={20}/></button></div></header>
   {!live&&<label className="stronghold-preview">Demo review · preview progress<select value={current} onChange={e=>preview(Number(e.target.value))}>{[...portals.map(p=>p.week),coreId].map(w=><option key={w} value={w}>{w===1?'Week 1 open':w===coreId?`All ${weeks} weeks complete · Core chamber open`:`Weeks 1–${w-1} complete · Week ${w} open`}</option>)}</select></label>}
   <div className="worldTeleportGrid">{[...portals.map(p=>p.week),coreId].map(w=>{const core=w===coreId,locked=core?!coreOpen:!isOpen(w),done=core?recovered:hall?.finished.includes(w)??false,label=status(w);return <div key={w} className={`worldTeleportTile ${locked?'worldTeleportTileDisabled':''}`} style={{borderColor:done?DONE_GOLD:info.colour}}>
    <WorldVoiceButton text={joinSpeechParts([core?'The Core chamber':`Week ${w}`,label])} compact className="worldTeleportTileRead" label={core?'Read the Core chamber':`Read week ${w}`}/>
    <strong>{core?'Core chamber':`Week ${w}`}</strong><span style={{color:done?DONE_GOLD:info.colour}}>{label}</span><small>{locked?'LOCKED':core?'WALK TO THE CORE':'WALK TO PORTAL'}</small>
    <button type="button" disabled={locked} onClick={()=>goTo(w)} aria-label={`${locked?'Locked':'Walk to'} ${core?'the Core chamber':`week ${w}`}`}><span>{locked?'Locked':'Go'}</span></button>
   </div>;})}</div>
  </section>
 </div>}
 {(story||panel==='help')&&<div className="stronghold-backdrop" onClick={e=>{if(e.target===e.currentTarget)close();}}><section ref={dialog} className="stronghold-panel" role="dialog" aria-modal="true" aria-labelledby="stronghold-panel-title">
 {storyPanel?<><StoryArt realm={realm} recovery={story==='recovery'} colour={info.colour} label={artLabel}/><small>THE FOG OF FORGETFULNESS</small><h2 id="stronghold-panel-title">{storyPanel.title}</h2><p>{storyPanel.text}</p><ReadAloudBtn text={`${storyPanel.title}. ${storyPanel.text} ${artLabel} ${story==='battle'?battleFacts.join('. '):''}`}/>{story==='battle'&&<ul className="stronghold-facts">{battleFacts.map(f=><li key={f}>{f}</li>)}</ul>}
  <div className="stronghold-actions">{story==='battle'?<><Link href={live?level8LiveHref(realm,weeks,'posttest'):level8DemoHref(realm,weeks,'posttest')}>Begin the battle</Link>{!live&&<button onClick={recover}>Preview the victory</button>}<button onClick={close}>Not yet</button></>:<button onClick={close}>Continue →</button>}</div></>
 :<><small>{info.name.toUpperCase()} STRONGHOLD</small><h2 id="stronghold-panel-title">Explore the stronghold</h2><p>WASD or arrow keys: walk. Drag: look around. Shift: run. Touch: use the two joysticks. E: enter a nearby week.</p><p>Week 1 is by the entrance. Finished weeks glow gold. {Guardian} guards the {info.core} for the Fog of Forgetfulness, and each finished week brings you closer to breaking its seal.</p><ReadAloudBtn text={`Use WASD or arrow keys to walk, drag to look, Shift to run, or the touch joysticks. Press E near a week portal. Finished weeks glow gold. ${Guardian} guards the ${info.core} for the Fog of Forgetfulness.`}/><div className="stronghold-actions"><button onClick={close}>Back to the stronghold</button><button onClick={()=>{setPanel(null);setStory('opening');}}>Replay the volcano opening</button></div></>}
 </section></div>}
 </main>;
}
