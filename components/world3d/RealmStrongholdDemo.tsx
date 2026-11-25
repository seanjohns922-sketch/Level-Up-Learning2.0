'use client';
import {level8DemoHref} from '@/lib/level8-routes';
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
import {DONE_GOLD} from './VolcanicKit';
import {KeyboardWorldAction,WorldJoystick,WorldLookJoystick,EMPTY_WORLD_MOVE_INPUT,EMPTY_WORLD_LOOK_INPUT} from './SharedWorldPlayer';
import {STRONGHOLD_REALMS,STRONGHOLD_SUMMIT_RETURN,strongholdFloor,strongholdLayout,strongholdNearest,strongholdPortalSpot,strongholdStory,type StrongholdStory} from '@/lib/world3d/number-stronghold';
import type {ExpeditionRealm} from '@/lib/world3d/expedition-access';
import type {SummitPoint} from '@/lib/world3d/number-summit';

function StoryArt({recovery=false,colour,label}:{recovery?:boolean;colour:string;label:string}){const light=new THREE.Color(colour).lerp(new THREE.Color('#ffffff'),.6).getStyle();return <svg viewBox="0 0 400 180" role="img" aria-label={label}>
 <defs><radialGradient id="sa-glow" cx="50%" cy="48%" r="45%"><stop offset="0" stopColor={recovery?light:colour} stopOpacity=".75"/><stop offset="1" stopColor={colour} stopOpacity="0"/></radialGradient><linearGradient id="sa-lava" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ff8a3d" stopOpacity="0"/><stop offset="1" stopColor="#ff6a2a" stopOpacity=".55"/></linearGradient></defs>
 <rect width="400" height="180" fill={recovery?'#10201f':'#160d10'}/><rect y="110" width="400" height="70" fill="url(#sa-lava)" opacity={recovery?.35:1}/>
 <path d="M0 0h400v18l-14 26-10-22-16 34-12-30-18 20-14-28-20 40-12-34-16 24-14-30-22 36-10-26-18 30-14-34-16 28-12-22-20 38-14-30-18 26-16-34-14 22-12-30-18 40-14-28-16 22L0 30Z" fill="#0a0708"/>
 <path d="M0 180V96l30-12 22 20 18-30 26 18 6 88Zm400 0V90l-28-10-20 22-22-26-24 20-6 84Z" fill="#231a1b"/>
 <ellipse cx="200" cy="162" rx="92" ry="12" fill={recovery?'#24312f':'#2a1a33'}/>
 <circle cx="200" cy="88" r="80" fill="url(#sa-glow)"/>
 {recovery&&<g stroke={light} strokeWidth="3" strokeLinecap="round" opacity=".9"><path d="m138 40-16-16m124 16 16-16M112 92H86m202 0h26M200 14V2M150 140l-14 12m114-12 14 12"/></g>}
 <path d="m200 26 34 60-34 66-34-66Z" fill={recovery?light:colour}/><path d="m200 26v126l-34-66Z" fill={recovery?'#ffffff':light}/>
 {!recovery&&<><g fill="none" stroke="#a463ff" strokeWidth="3" opacity=".85"><ellipse cx="200" cy="88" rx="74" ry="24" transform="rotate(-22 200 88)"/><ellipse cx="200" cy="88" rx="74" ry="24" transform="rotate(38 200 88)"/></g>
 <g fill="none" stroke="#5b2490" strokeWidth="7" strokeLinecap="round"><path d="M110 168c20-34 50-20 62-54s-6-38 14-56"/><path d="M292 168c-20-30-56-16-64-52s10-40-12-58"/><path d="M160 172c8-26 30-30 34-46"/></g>
 <g fill="#e48bff"><ellipse cx="184" cy="12" rx="7" ry="3.5" transform="rotate(10 184 12)"/><ellipse cx="216" cy="12" rx="7" ry="3.5" transform="rotate(-10 216 12)"/></g></>}
</svg>;}

/** Week a student came back from (`?week=` on the stronghold link), so they reappear at its portal. */
function returnWeek(weeks:number){try{const w=Number(new URLSearchParams(window.location.search).get('week'));return Number.isInteger(w)&&w>=1&&w<=weeks?w:null;}catch{return null;}}

export default function RealmStrongholdDemo({realm}:{realm:ExpeditionRealm}){
 const router=useRouter();
 const info=STRONGHOLD_REALMS[realm],story_=strongholdStory(realm),Guardian=info.guardian[0].toUpperCase()+info.guardian.slice(1);
 const layout=strongholdLayout(realm),portals=layout.portals,coreId=layout.coreId,weeks=layout.weeks;
 const recoveredKey=`reliq:demo:${realm}-core-recovered`,progressKey=`reliq:demo:${realm}-stronghold:progress`;
 const [arrival]=useState(()=>returnWeek(weeks));
 const [move,setMove]=useState(EMPTY_WORLD_MOVE_INPUT),[look,setLook]=useState(EMPTY_WORLD_LOOK_INPUT);
 const [spawn,setSpawn]=useState<SummitPoint>(()=>arrival?strongholdPortalSpot(realm,arrival):[0,0,10]),[spawnKey,setSpawnKey]=useState(0),[nearest,setNearest]=useState<number|null>(null);
 // Demo review only: the week in progress is chosen in the Weeks panel. Earlier weeks count as finished.
 const [current,setCurrent]=useState(()=>{try{return Math.min(coreId,Math.max(1,Number(sessionStorage.getItem(progressKey))||3));}catch{return 3;}});
 const [recovered,setRecovered]=useState(()=>{try{return sessionStorage.getItem(recoveredKey)==='true';}catch{return false;}});
 const [story,setStory]=useState<StrongholdStory|null>(arrival?null:'entrance'),[panel,setPanel]=useState<'weeks'|'help'|null>(null);
 const position=useRef(new THREE.Vector3(...spawn)),dialog=useRef<HTMLElement>(null);
 const paused=story!==null||panel!==null,finished=Math.min(weeks,current-1);
 function stop(){setMove(EMPTY_WORLD_MOVE_INPUT);setLook(EMPTY_WORLD_LOOK_INPUT);}
 function close(){setStory(null);setPanel(null);stop();}
 function open(next:'weeks'|'help'){stop();setPanel(next);}
 function goTo(target:number){setSpawn(strongholdPortalSpot(realm,target));setSpawnKey(k=>k+1);setNearest(null);close();}
 function preview(next:number){setCurrent(next);try{sessionStorage.setItem(progressKey,String(next));}catch{/* optional preview state */}}
 /** A portal opens its week page directly, as a Level 7 cave door does; the Core chamber opens the battle story. */
 function enter(target:number){stop();if(target===coreId){if(current>weeks)setStory(recovered?'recovery':'battle');return;}if(target>current)return;router.push(level8DemoHref(realm,target,'week'));}
 function recover(){setRecovered(true);setStory('recovery');try{sessionStorage.setItem(recoveredKey,'true');}catch{/* optional preview state */}}
 // Story dialogs take focus for keyboard users; closing returns it to the world so WASD walks straight away.
 useEffect(()=>{if(story)dialog.current?.querySelector<HTMLElement>('.stronghold-actions>*')?.focus();else if(document.activeElement instanceof HTMLElement&&document.activeElement!==document.body)document.activeElement.blur();},[story]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key!=='Escape')return;setStory(null);setPanel(null);setMove(EMPTY_WORLD_MOVE_INPUT);setLook(EMPTY_WORLD_LOOK_INPUT);};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 const status=(w:number)=>w===coreId?(recovered?'Restored':current>weeks?'Open':`Finish all ${weeks} weeks first`):w<current?'Complete':w===current?'Continue here':'Locked';
 const doorOpen=nearest!==null&&(nearest===coreId?current>weeks:nearest<=current);
 const tabs=[{key:'weeks',label:'Weeks',icon:<CalendarDays size={16}/>,onClick:()=>open('weeks')},{key:'story',label:'Story',icon:<BookOpen size={16}/>,onClick:()=>{stop();setStory('entrance');}},{key:'help',label:'Help',icon:<CircleHelp size={16}/>,onClick:()=>open('help')}];
 const storyPanel=story?story_[story]:null;
 const artLabel=story==='recovery'?`The ${info.core} shines as the Fog clears.`:`A glowing ${info.core} trapped inside the Fog’s purple seal.`;
 const battleNote='The final post-test is the battle. Score 85% or more to break the seal and recover the Core.';
 return <main className="summit-world stronghold-world" data-world3d-root data-stronghold={`${realm}-demo`} style={{'--stronghold-accent':info.colour} as React.CSSProperties}>
 <Canvas dpr={1} camera={{position:[0,5,18],fov:58,near:.1,far:160}} gl={{antialias:false,powerPreference:'high-performance'}} fallback={<p className="stronghold-fallback">3D stronghold. Use Continue to open the weekly page without walking.</p>}><Suspense fallback={null}><RealmStrongholdScene realm={realm} unlocked={current} recovered={recovered} position={position}/><NumberSummitPlayer move={move} look={look} unlocked={1} volcanoOpen={false} spawn={spawn} spawnKey={spawnKey} paused={paused} overview={false} position={position} onNearest={setNearest} onAltitude={()=>{}} floorResolver={(x,z)=>strongholdFloor(x,z,realm)} nearestResolver={(x,z)=>strongholdNearest(x,z,realm)}/></Suspense></Canvas>
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
 {storyPanel?<><StoryArt recovery={story==='recovery'} colour={info.colour} label={artLabel}/><small>THE FOG OF FORGETFULNESS</small><h2 id="stronghold-panel-title">{storyPanel.title}</h2><p>{storyPanel.text}</p><ReadAloudBtn text={`${storyPanel.title}. ${storyPanel.text} ${artLabel} ${story==='battle'?battleNote:''}`}/>{story==='battle'&&<p className="stronghold-note">{battleNote}</p>}
  <div className="stronghold-actions"><button onClick={close}>{story==='battle'?'Back to the stronghold':'Continue →'}</button>{story==='battle'&&<><Link href={level8DemoHref(realm,weeks,'posttest')}>Take the post-test</Link><button onClick={recover}>Preview Core recovery</button></>}</div></>
 :<><small>{info.name.toUpperCase()} STRONGHOLD</small><h2 id="stronghold-panel-title">Explore the stronghold</h2><p>WASD or arrow keys: walk. Drag: look around. Shift: run. Touch: use the two joysticks. E: enter a nearby week.</p><p>Week 1 is by the entrance. Finished weeks glow gold. {Guardian} guards the {info.core} for the Fog of Forgetfulness, and each finished week brings you closer to breaking its seal.</p><ReadAloudBtn text={`Use WASD or arrow keys to walk, drag to look, Shift to run, or the touch joysticks. Press E near a week portal. Finished weeks glow gold. ${Guardian} guards the ${info.core} for the Fog of Forgetfulness.`}/><div className="stronghold-actions"><button onClick={close}>Back to the stronghold</button><button onClick={()=>{setPanel(null);setStory('opening');}}>Replay the volcano opening</button></div></>}
 </section></div>}
 </main>;
}
