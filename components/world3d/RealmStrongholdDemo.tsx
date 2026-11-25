'use client';
import {level8Background,level8DemoHref} from '@/lib/level8-routes';
import {Suspense,useEffect,useRef,useState} from 'react';
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
import RealmStrongholdScene from './RealmStrongholdScene';
import {SHATTER_SECONDS} from './StrongholdSeal';
import {DONE_GOLD} from './VolcanicKit';
import {KeyboardWorldAction,WorldJoystick,WorldLookJoystick,EMPTY_WORLD_MOVE_INPUT,EMPTY_WORLD_LOOK_INPUT} from './SharedWorldPlayer';
import {STRONGHOLD_REALMS,STRONGHOLD_SUMMIT_RETURN,strongholdFloor,strongholdLayout,strongholdNearest,strongholdPortalSpot,strongholdStory,type StrongholdStory} from '@/lib/world3d/number-stronghold';
import type {ExpeditionRealm} from '@/lib/world3d/expedition-access';
import type {SummitPoint} from '@/lib/world3d/number-summit';

/** The realm's painted stronghold behind each story card: under the Fog's purple while sealed, bright once the Core is free. */
function StoryArt({realm,recovery=false,colour,label}:{realm:ExpeditionRealm;recovery?:boolean;colour:string;label:string}){
 return <div className={`stronghold-story-art ${recovery?'is-free':''}`} role="img" aria-label={label} style={{backgroundImage:`url(${level8Background(realm)})`,'--story-glow':colour} as React.CSSProperties}/>;
}

/** True when the student arrives straight from winning the final battle (`?victory=1`). */
function wonBattle(){try{return new URLSearchParams(window.location.search).get('victory')==='1';}catch{return false;}}

/** Week a student came back from (`?week=` on the stronghold link), so they reappear at its portal. */
function returnWeek(weeks:number){try{const w=Number(new URLSearchParams(window.location.search).get('week'));return Number.isInteger(w)&&w>=1&&w<=weeks?w:null;}catch{return null;}}

export default function RealmStrongholdDemo({realm}:{realm:ExpeditionRealm}){
 const router=useRouter();
 const info=STRONGHOLD_REALMS[realm],story_=strongholdStory(realm),Guardian=info.guardian[0].toUpperCase()+info.guardian.slice(1);
 const layout=strongholdLayout(realm),portals=layout.portals,coreId=layout.coreId,weeks=layout.weeks;
 const recoveredKey=`reliq:demo:${realm}-core-recovered`,progressKey=`reliq:demo:${realm}-stronghold:progress`;
 const [arrival]=useState(()=>returnWeek(weeks)),[victory]=useState(wonBattle);
 const [move,setMove]=useState(EMPTY_WORLD_MOVE_INPUT),[look,setLook]=useState(EMPTY_WORLD_LOOK_INPUT);
 const [spawn,setSpawn]=useState<SummitPoint>(()=>victory?strongholdPortalSpot(realm,coreId):arrival?strongholdPortalSpot(realm,arrival):[0,0,10]),[spawnKey,setSpawnKey]=useState(0),[nearest,setNearest]=useState<number|null>(null);
 // Demo review only: the week in progress is chosen in the Weeks panel. Earlier weeks count as finished.
 const [current,setCurrent]=useState(()=>{try{return Math.min(coreId,Math.max(1,Number(sessionStorage.getItem(progressKey))||3));}catch{return 3;}});
 const [recovered,setRecovered]=useState(()=>{try{return sessionStorage.getItem(recoveredKey)==='true';}catch{return false;}});
 const [story,setStory]=useState<StrongholdStory|null>(arrival||victory?null:'entrance'),[panel,setPanel]=useState<'weeks'|'help'|null>(null),[shattering,setShattering]=useState(false);
 const position=useRef(new THREE.Vector3(...spawn)),dialog=useRef<HTMLElement>(null),timers=useRef<number[]>([]);
 const paused=story!==null||panel!==null||shattering,finished=Math.min(weeks,current-1);
 function stop(){setMove(EMPTY_WORLD_MOVE_INPUT);setLook(EMPTY_WORLD_LOOK_INPUT);}
 function close(){setStory(null);setPanel(null);stop();}
 function open(next:'weeks'|'help'){stop();setPanel(next);}
 function goTo(target:number){setSpawn(strongholdPortalSpot(realm,target));setSpawnKey(k=>k+1);setNearest(null);close();}
 function preview(next:number){setCurrent(next);try{sessionStorage.setItem(progressKey,String(next));}catch{/* optional preview state */}}
 /** A portal opens its week page directly, as a Level 7 cave door does; the Core chamber opens the battle story. */
 function enter(target:number){stop();if(target===coreId){if(current>weeks)setStory(recovered?'recovery':'battle');return;}if(target>current)return;router.push(level8DemoHref(realm,target,'week'));}
 /** The victory: stand before the Core, watch the seal shatter, then the Core shines and the recovery story follows. */
 function recover(){close();setSpawn(strongholdPortalSpot(realm,coreId));setSpawnKey(k=>k+1);setShattering(true);
  timers.current.push(window.setTimeout(()=>{setRecovered(true);try{sessionStorage.setItem(recoveredKey,'true');}catch{/* optional preview state */}},SHATTER_SECONDS*1000));
  timers.current.push(window.setTimeout(()=>{setShattering(false);setStory('recovery');},SHATTER_SECONDS*1000+1600));}
 useEffect(()=>()=>timers.current.forEach(window.clearTimeout),[]);
 // Back from a won battle: once the hall has had a moment to appear, the seal shatters. The flag is removed so a reload doesn't replay it.
 const recoverLater=useRef(recover);useEffect(()=>{recoverLater.current=recover;});
 useEffect(()=>{if(!victory)return;window.history.replaceState(null,'',window.location.pathname);const id=window.setTimeout(()=>recoverLater.current(),1500);return()=>window.clearTimeout(id);},[victory]);
 // Story dialogs take focus for keyboard users; closing returns it to the world so WASD walks straight away.
 useEffect(()=>{if(story)dialog.current?.querySelector<HTMLElement>('.stronghold-actions>*')?.focus();else if(document.activeElement instanceof HTMLElement&&document.activeElement!==document.body)document.activeElement.blur();},[story]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key!=='Escape')return;setStory(null);setPanel(null);setMove(EMPTY_WORLD_MOVE_INPUT);setLook(EMPTY_WORLD_LOOK_INPUT);};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 const status=(w:number)=>w===coreId?(recovered?'Restored':current>weeks?'Open':`Finish all ${weeks} weeks first`):w<current?'Complete':w===current?'Continue here':'Locked';
 const doorOpen=nearest!==null&&(nearest===coreId?current>weeks:nearest<=current);
 const tabs=[{key:'weeks',label:'Weeks',icon:<CalendarDays size={16}/>,onClick:()=>open('weeks')},{key:'story',label:'Story',icon:<BookOpen size={16}/>,onClick:()=>{stop();setStory('entrance');}},{key:'help',label:'Help',icon:<CircleHelp size={16}/>,onClick:()=>open('help')}];
 const storyPanel=story?story_[story]:null;
 const artLabel=story==='recovery'?`The ${info.core} shines as the Fog clears.`:`A glowing ${info.core} trapped inside the Fog’s purple seal.`;
 const battleFacts=['30 questions','Every answer strikes the seal','85% shatters it'];
 return <main className="summit-world stronghold-world" data-world3d-root data-stronghold={`${realm}-demo`} style={{'--stronghold-accent':info.colour} as React.CSSProperties}>
 <Canvas dpr={1} camera={{position:[0,5,18],fov:58,near:.1,far:160}} gl={{antialias:false,powerPreference:'high-performance'}} fallback={<p className="stronghold-fallback">3D stronghold. Use Continue to open the weekly page without walking.</p>}><Suspense fallback={null}><RealmStrongholdScene realm={realm} unlocked={current} recovered={recovered} shattering={shattering} position={position}/><NumberSummitPlayer move={move} look={look} unlocked={1} volcanoOpen={false} spawn={spawn} spawnKey={spawnKey} paused={paused} overview={false} position={position} onNearest={setNearest} onAltitude={()=>{}} floorResolver={(x,z)=>strongholdFloor(x,z,realm)} nearestResolver={(x,z)=>strongholdNearest(x,z,realm)}/></Suspense></Canvas>
 {/* The same world display as the Central Hub, the realm worlds and the Level 7 caves. */}
 <WorldHUD context="realm" realmId={realm} preview
  mission={{eyebrow:'LEVEL 8 · THE FINAL BATTLE',title:`${info.name} stronghold`,detail:recovered?'The Core is free · The Fog is clearing':`${finished} of ${weeks} weeks complete · Break ${info.guardian}’s seal`}}
  navActions={tabs}
  primaryAction={{label:'SUMMIT',icon:'map',onClick:()=>router.push(STRONGHOLD_SUMMIT_RETURN)}}
  primaryLabel={current>weeks?'THE CORE CHAMBER':`CONTINUE · WEEK ${current}`} onQuickStart={()=>current>weeks?goTo(coreId):enter(current)}/>
 {!paused&&<><WorldJoystick input={move} onChange={setMove}/><WorldLookJoystick onChange={setLook}/></>}
 {!paused&&nearest!==null&&<WorldInteractionPrompt location={nearest===coreId?`${info.name} · The Core chamber`:`${info.name} · Week ${nearest}`} status={status(nearest)} actionLabel={nearest===coreId?'ENTER THE CORE CHAMBER':'ENTER WEEK'} disabled={!doorOpen} onAction={()=>enter(nearest)}/>}
 <KeyboardWorldAction enabled={!paused&&doorOpen} onAction={()=>{if(nearest!==null)enter(nearest);}}/>
 {panel==='weeks'&&<div className="worldTeleportBackdrop" role="dialog" aria-modal="true" aria-label={`${info.name} weeks`}>
  <section className="worldTeleportPanel">
   <header><div><span>LEVEL 8 · {info.name.toUpperCase()} STRONGHOLD</span><h2>WEEKS</h2></div><div className="worldTeleportHeaderActions"><WorldVoiceButton text={`${info.name} stronghold weeks. Choose a week to walk to its portal.`} label="Read weeks"/><button type="button" onClick={close} aria-label="Close weeks"><X size={20}/></button></div></header>
   <label className="stronghold-preview">Demo review · preview progress<select value={current} onChange={e=>preview(Number(e.target.value))}>{[...portals.map(p=>p.week),coreId].map(w=><option key={w} value={w}>{w===1?'Week 1 open':w===coreId?`All ${weeks} weeks complete · Core chamber open`:`Weeks 1–${w-1} complete · Week ${w} open`}</option>)}</select></label>
   <div className="worldTeleportGrid">{[...portals.map(p=>p.week),coreId].map(w=>{const core=w===coreId,locked=!core&&w>current,done=core?recovered:w<current,label=status(w);return <div key={w} className={`worldTeleportTile ${locked?'worldTeleportTileDisabled':''}`} style={{borderColor:done?DONE_GOLD:info.colour}}>
    <WorldVoiceButton text={joinSpeechParts([core?'The Core chamber':`Week ${w}`,label])} compact className="worldTeleportTileRead" label={core?'Read the Core chamber':`Read week ${w}`}/>
    <strong>{core?'Core chamber':`Week ${w}`}</strong><span style={{color:done?DONE_GOLD:info.colour}}>{label}</span><small>{locked?'LOCKED':core?'WALK TO THE CORE':'WALK TO PORTAL'}</small>
    <button type="button" disabled={locked} onClick={()=>goTo(w)} aria-label={`${locked?'Locked':'Walk to'} ${core?'the Core chamber':`week ${w}`}`}><span>{locked?'Locked':'Go'}</span></button>
   </div>;})}</div>
  </section>
 </div>}
 {(story||panel==='help')&&<div className="stronghold-backdrop" onClick={e=>{if(e.target===e.currentTarget)close();}}><section ref={dialog} className="stronghold-panel" role="dialog" aria-modal="true" aria-labelledby="stronghold-panel-title">
 {storyPanel?<><StoryArt realm={realm} recovery={story==='recovery'} colour={info.colour} label={artLabel}/><small>THE FOG OF FORGETFULNESS</small><h2 id="stronghold-panel-title">{storyPanel.title}</h2><p>{storyPanel.text}</p><ReadAloudBtn text={`${storyPanel.title}. ${storyPanel.text} ${artLabel} ${story==='battle'?battleFacts.join('. '):''}`}/>{story==='battle'&&<ul className="stronghold-facts">{battleFacts.map(f=><li key={f}>{f}</li>)}</ul>}
  <div className="stronghold-actions">{story==='battle'?<><Link href={level8DemoHref(realm,weeks,'posttest')}>Begin the battle</Link><button onClick={recover}>Preview the victory</button><button onClick={close}>Not yet</button></>:<button onClick={close}>Continue →</button>}</div></>
 :<><small>{info.name.toUpperCase()} STRONGHOLD</small><h2 id="stronghold-panel-title">Explore the stronghold</h2><p>WASD or arrow keys: walk. Drag: look around. Shift: run. Touch: use the two joysticks. E: enter a nearby week.</p><p>Week 1 is by the entrance. Finished weeks glow gold. {Guardian} guards the {info.core} for the Fog of Forgetfulness, and each finished week brings you closer to breaking its seal.</p><ReadAloudBtn text={`Use WASD or arrow keys to walk, drag to look, Shift to run, or the touch joysticks. Press E near a week portal. Finished weeks glow gold. ${Guardian} guards the ${info.core} for the Fog of Forgetfulness.`}/><div className="stronghold-actions"><button onClick={close}>Back to the stronghold</button><button onClick={()=>{setPanel(null);setStory('opening');}}>Replay the volcano opening</button></div></>}
 </section></div>}
 </main>;
}
