'use client';
import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Link from 'next/link';
import { ArrowUpRight, Compass, Mountain, RotateCcw, X } from 'lucide-react';
import { WorldJoystick, WorldLookJoystick, EMPTY_WORLD_MOVE_INPUT, EMPTY_WORLD_LOOK_INPUT } from './SharedWorldPlayer';
import NumberSummitEnvironment from './NumberSummitEnvironment';
import NumberSummitPlayer from './NumberSummitPlayer';
import ExpeditionTrailMap from './ExpeditionTrailMap';
import { VOLCANO_GATE,VOLCANO_SUMMIT,VOLCANO_DOORS,volcanoProjection } from '@/lib/world3d/volcano-expedition';
import type { SummitPoint } from '@/lib/world3d/number-summit';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import { EXPEDITION_START,EXPEDITION_TRAILS,TRAIL_SAMPLES,nearestTrail } from '@/lib/world3d/expedition-crossroads';
class SummitErrorBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<div className="summit-fallback"><h2>The expedition could not open</h2><p>Try reloading in a browser with WebGL enabled.</p><a href="/world/tower">Back to tower</a></div>:this.props.children;}
}
type Dialog='menu'|'help'|'map'|'pass'|{realm:number;level:7|8}|null;
import type {ExpeditionAccess,ExpeditionRealm} from '@/lib/world3d/expedition-access';
export default function NumberAdventure3DWorld({access}:{access?:ExpeditionAccess}){
 const preview=!access,exitHref=preview?'/demo-review':'/world/tower';
 const [mapPosition,setMapPosition]=useState<[number,number]>([0,87]);
 const [started,setStarted]=useState(false),[previewVolcano,setVolcanoOpen]=useState(false),[dialog,setDialog]=useState<Dialog>(null);
 const volcanoOpen=preview?previewVolcano:access.level8.length>0;
 const [move,setMove]=useState(EMPTY_WORLD_MOVE_INPUT),[look,setLook]=useState(EMPTY_WORLD_LOOK_INPUT);
 const [nearest,setNearest]=useState<number|null>(null),[nearVolcano,setNearVolcano]=useState<number|null>(null);
 const [trailIndex,setTrailIndex]=useState<number|null>(null),[onVolcano,setOnVolcano]=useState(false),[altitude,setAltitude]=useState(0);
 const [spawn,setSpawn]=useState<SummitPoint>(EXPEDITION_START),[spawnKey,setSpawnKey]=useState(0);
 const position=useRef(new THREE.Vector3(0,.75,87)),action=useRef<()=>void>(()=>{}),actionButton=useRef<HTMLButtonElement>(null);
 function stop(){setMove(EMPTY_WORLD_MOVE_INPUT);setLook(EMPTY_WORLD_LOOK_INPUT);}
 function open(d:Dialog){if(d==='map')setMapPosition([position.current.x,position.current.z]);setDialog(d);stop();}
 function travel(target:SummitPoint){setSpawn([...target]);setSpawnKey(n=>n+1);setNearest(null);setNearVolcano(null);open(null);}
 function interact(){if(dialog||!started)return;if(nearVolcano!==null)open(nearVolcano===-1?'pass':{realm:nearVolcano,level:8});else if(nearest!==null)open({realm:nearest,level:7});}
 useEffect(()=>{action.current=interact;});
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key.toLowerCase()==='e'&&!e.repeat&&!e.ctrlKey&&!e.metaKey){e.preventDefault();action.current();}if(e.key==='Escape')setDialog(null);};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 useEffect(()=>{const timer=setInterval(()=>{const here=position.current,root=document.querySelector<HTMLElement>('[data-summit-altitude]');if(root)root.dataset.summitPosition=JSON.stringify(here.toArray());const vp=volcanoProjection(here.x,here.z);setOnVolcano((vp.distance<7&&here.z<48)||Math.hypot(here.x,here.z+130)<25);let nearby:number|null=Math.hypot(here.x-VOLCANO_GATE[0],here.z-VOLCANO_GATE[2])<7?-1:null;if(here.y>65)VOLCANO_DOORS.forEach((p,i)=>{if(Math.hypot(here.x-p[0],here.z-p[2])<5)nearby=i;});setNearVolcano(nearby);const n=nearestTrail(here.x,here.z);setTrailIndex(n.distance<6&&n.progress>.12?n.trail:null);},150);return()=>clearInterval(timer);},[]);
 const activeRealm=nearest===null?null:EXPEDITION_TRAILS[nearest];
 const lesson=typeof dialog==='object'&&dialog!==null?dialog:null;
 const lessonUnlocked=!lesson||preview||access[lesson.level===7?'level7':'level8'].includes(EXPEDITION_TRAILS[lesson.realm].id as ExpeditionRealm);
 return <main data-world3d-root data-summit-altitude={altitude} className="summit-world">
 <SummitErrorBoundary><Canvas dpr={1} camera={{position:[60,42,80],fov:52,near:.1,far:360}} gl={{antialias:false,alpha:false,powerPreference:'high-performance'}}>
 <Suspense fallback={null}><NumberSummitEnvironment volcanoOpen={volcanoOpen} unlockedStrongholds={access?.level8??[]} position={position}/></Suspense>
 <NumberSummitPlayer move={move} look={look} unlocked={1} volcanoOpen={volcanoOpen} spawn={spawn} spawnKey={spawnKey} paused={dialog!==null} overview={!started} position={position} onNearest={setNearest} onAltitude={setAltitude}/>
 </Canvas></SummitErrorBoundary>
 {!started?<div className="summit-intro"><div className="summit-intro-top"><span>{preview?'THE CORE EXPEDITION / WORLD PREVIEW':'THE CORE EXPEDITION'}</span><Link href={exitHref}>{preview?'Exit preview':'Return to tower'} <X size={16}/></Link></div>
 <section className="summit-title"><p className="summit-eyebrow"><Mountain size={16}/> THE OCCUPIED TERRITORIES</p><h1>Six territories.<br/>One final ascent.</h1><p className="summit-intro-copy">Follow your realm’s trail to Level 7 weekly lessons.<br/>Complete Level 7 to open the volcano.</p><button className="summit-primary" onClick={()=>setStarted(true)}>Enter the crossroads <ArrowUpRight size={22}/></button><div className="summit-intro-note"><ReadAloudBtn text="Six trails lead to six realm lesson gates. Complete a realm’s Level 7 to unlock the volcano and its Level 8 stronghold. "/><span>{preview?'Design preview · Explore all six approaches':'Your next adventure starts here'}</span></div></section></div>:<>
 <header className="summit-hud"><div className="summit-brand"><Mountain size={24}/><div><small>{onVolcano?'ASHEN PASS · LEVEL 8':trailIndex===null?'SIXFOLD BASE CAMP':EXPEDITION_TRAILS[trailIndex].name.toUpperCase()}</small><strong>The Core Expedition</strong></div></div><button className="summit-icon-button" aria-label="Open expedition menu" onClick={()=>open('menu')}><Compass size={21}/></button></header>
 <aside className="summit-objective"><span className="summit-eyebrow">YOUR NEXT STEP</span><strong>{onVolcano?'Follow the ascent to the six Level 8 strongholds':trailIndex===null?'Choose a Level 7 realm trail':`Reach the ${EXPEDITION_TRAILS[trailIndex].name} lesson gate`}</strong>{trailIndex!==null&&!onVolcano&&<p className="expedition-route-note">{EXPEDITION_TRAILS[trailIndex].description}</p>}</aside>
 <div className="summit-controls"><button onClick={()=>open('map')}>Trail map</button><button onClick={()=>open('help')}>Controls</button>{preview&&<span>DESIGN PREVIEW</span>}</div>
 {!dialog&&<><WorldJoystick input={move} onChange={setMove}/><WorldLookJoystick onChange={setLook}/></>}
 {!dialog&&(nearVolcano!==null||activeRealm)&&<div className="summit-action"><span>{nearVolcano===-1?'The Ashen Pass':nearVolcano!==null?EXPEDITION_TRAILS[nearVolcano].name:activeRealm?.name}</span><button ref={actionButton} onClick={interact} className="summit-primary">{nearVolcano===-1?'Inspect the pass':`Enter Level ${nearVolcano!==null?8:7} lessons`}<kbd>E</kbd></button></div>}
 </>}
 {dialog&&<div className="summit-modal-backdrop" onKeyDown={e=>{if(e.key!=='Tab')return;const controls=e.currentTarget.querySelectorAll<HTMLElement>('button,a[href]');const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}><section className="summit-modal" role="dialog" aria-modal="true" aria-labelledby="summit-dialog-title"><button autoFocus className="summit-close" aria-label="Close dialog" onClick={()=>{open(null);actionButton.current?.focus();}}><X size={20}/></button>
 {lesson?<><p className="summit-eyebrow">WEEKLY LESSON ENTRANCE</p><h2 id="summit-dialog-title">{EXPEDITION_TRAILS[lesson.realm].name} · Level {lesson.level}</h2>{!lessonUnlocked?<p>Score 85% or above on this realm’s Level 6 post-test to unlock its Level 7 trail. Complete its Level 7 programme to unlock the Level 8 stronghold.</p>:<p>This is where you’ll enter this realm’s weekly lessons. Complete the programme to {lesson.level===7?'unlock its Level 8 stronghold on the volcano':'face the final boss and recover its stolen Core'}.</p>}<ReadAloudBtn text={`This is the ${EXPEDITION_TRAILS[lesson.realm].name} Level ${lesson.level} weekly lesson entrance. The weekly lessons are coming soon.`}/><p className="summit-disclaimer">Level {lesson.level} weekly lessons are coming soon. You can explore the expedition while they are being prepared.</p><button className="summit-primary" onClick={()=>open(null)}>Back to the trail</button></>:dialog==='map'?<ExpeditionTrailMap position={mapPosition} volcanoOpen={volcanoOpen}/>:dialog==='pass'?<><p className="summit-eyebrow">THE SEVENTH ROUTE</p><h2 id="summit-dialog-title">The Ashen Pass</h2><p>Complete any realm’s Level 7 to open this pass. Each summit gateway unlocks when you complete that realm’s Level 7.</p>{preview&&!volcanoOpen&&<button className="summit-primary" onClick={()=>{setVolcanoOpen(true);open(null);}}>Open pass for design preview</button>}{preview&&<p className="summit-disclaimer">Preview access only. Student progress is unchanged.</p>}</>:dialog==='help'?<><h2 id="summit-dialog-title">Explore the expedition</h2><ul className="summit-help"><li><strong>WASD or arrow keys</strong>Walk the trail</li><li><strong>Drag the world</strong>Look around</li><li><strong>Shift / Run</strong>Move faster</li><li><strong>E / action button</strong>Enter a lesson gate</li><li><strong>Touch</strong>Left joystick moves. Right joystick looks.</li></ul></>:<><p className="summit-eyebrow">EXPEDITION MENU</p><h2 id="summit-dialog-title">The Core Expedition</h2><button className="summit-menu-reset" onClick={()=>travel([0,0,75])}>Return to the crossroads</button>{preview&&<div className="expedition-preview-shortcuts"><strong>Design review shortcuts</strong>{EXPEDITION_TRAILS.map((t,i)=><button key={t.id} onClick={()=>travel(TRAIL_SAMPLES[i][57])}>Preview {t.name} gate</button>)}<button onClick={()=>{setVolcanoOpen(true);travel([4,0,39]);}}>Preview volcano ascent</button><button onClick={()=>{setVolcanoOpen(true);travel(VOLCANO_SUMMIT);}}>Preview summit strongholds</button><small>Preview access only · Does not complete learning or award rewards.</small></div>}<button className="summit-menu-reset" onClick={()=>{setVolcanoOpen(false);setStarted(false);travel(EXPEDITION_START);}}><RotateCcw size={16}/> {preview?'Restart preview':'Return to arrival'}</button><Link className="summit-menu-exit" href={exitHref}>{preview?'Exit to Demo Review':'Return to tower'}</Link></>}
 </section></div>}
 </main>;
}
