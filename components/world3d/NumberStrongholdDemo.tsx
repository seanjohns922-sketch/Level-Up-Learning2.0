'use client';
import {Suspense,useEffect,useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import Link from 'next/link';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import NumberSummitPlayer from './NumberSummitPlayer';
import WorldPlaque from './WorldPlaque';
import {WorldJoystick,WorldLookJoystick,EMPTY_WORLD_MOVE_INPUT,EMPTY_WORLD_LOOK_INPUT} from './SharedWorldPlayer';
import {STRONGHOLD_PORTALS,STRONGHOLD_STORY,STRONGHOLD_SUMMIT_RETURN,strongholdFloor,strongholdNearest,type StrongholdStory} from '@/lib/world3d/number-stronghold';
import type {SummitPoint} from '@/lib/world3d/number-summit';

function Rock({at,size}:{at:SummitPoint;size:SummitPoint}){return <mesh position={at} userData={{cameraObstacle:true}}><boxGeometry args={size}/><meshStandardMaterial color="#26383a" roughness={.9}/></mesh>;}
function Crystal({at,scale=1,recovered=false}:{at:SummitPoint;scale?:number;recovered?:boolean}){
 const ref=useRef<THREE.Mesh>(null);
 useFrame(({clock})=>{if(ref.current){ref.current.rotation.y=clock.elapsedTime*.35;ref.current.position.y=at[1]+Math.sin(clock.elapsedTime)*.12;}});
 return <mesh ref={ref} position={at} scale={[scale,scale*1.8,scale]}><octahedronGeometry args={[1,0]}/><meshStandardMaterial color={recovered?'#d4fff3':'#52d9c0'} emissive="#37c6a6" emissiveIntensity={recovered?2:1}/></mesh>;
}
function Portal({week,at,available}:{week:number;at:SummitPoint;available:boolean}){
 const surface=useRef<THREE.Mesh>(null);
 useFrame(({clock})=>{if(surface.current){const m=surface.current.material as THREE.MeshStandardMaterial;m.emissiveIntensity=available?.65+Math.sin(clock.elapsedTime*1.6+week)*.2:0;}});
 return <group position={at}>
 {[-2.8,2.8].map(x=><Rock key={x} at={[x,3,0]} size={[1,6,1.5]}/>)}
 <Rock at={[0,6,0]} size={[6.8,1,1.8]}/>
 <mesh ref={surface} position={[0,2.8,0]}><planeGeometry args={[4.5,5.3]}/><meshStandardMaterial color={available?'#4ed8c2':'#354347'} emissive="#24c7ae" transparent opacity={available?.76:1} side={THREE.DoubleSide}/></mesh>
 <WorldPlaque at={[0,7.6,.1]} title={`WEEK ${week}`} subtitle={available?'ENTER WEEK':'PASS THE PREVIOUS WEEK'} width={7} colour={available?'#74e6cf':'#92a2a0'}/>
 <Crystal at={[-3.4,1.2,1]} scale={.5}/><Crystal at={[3.4,1.2,1]} scale={.5}/>
 </group>;
}
function Scene({unlocked,recovered}:{unlocked:number;recovered:boolean}){
 return <>
 <color attach="background" args={['#0b1c21']}/><fog attach="fog" args={['#0b1c21',25,recovered?125:95]}/>
 <ambientLight intensity={.85}/><hemisphereLight args={['#c1ece4','#4a302a',1.8]}/><directionalLight position={[6,16,4]} intensity={2} color="#b2e2d6"/>
 <Rock at={[0,-.55,-32]} size={[29,1,104]}/>
 {[-1,1].map(side=><group key={side}>
 <Rock at={[side*16,6,-32]} size={[3,13,104]}/>
 <mesh position={[side*13,-.01,-32]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[1.2,98]}/><meshStandardMaterial color="#f69749" emissive="#ff6727" emissiveIntensity={2} side={THREE.DoubleSide}/></mesh>
 {Array.from({length:9},(_,i)=><group key={i}><Rock at={[side*14,5,-i*11+12]} size={[2,10,2]}/><Crystal at={[side*12,1.8,-i*11+12]} scale={.65+(i%3)*.15}/></group>)}
 </group>)}
 {[5,-20,-43,-66].map(z=><group key={z}><Rock at={[0,11,z]} size={[31,1.5,2]}/><pointLight position={[0,6,z]} color="#ff9d54" intensity={24} distance={25} decay={2}/></group>)}
 {STRONGHOLD_PORTALS.map(p=><Portal key={p.week} week={p.week} at={p.position} available={p.week<=unlocked}/>)}
 {Array.from({length:16},(_,i)=><mesh key={i} position={[0,.02,12-i*5.5]} rotation={[-Math.PI/2,0,Math.PI/4]}><planeGeometry args={[.3,.3]}/><meshBasicMaterial color="#9de8d4"/></mesh>)}
 <Rock at={[0,6,-83]} size={[30,13,2]}/>
 <mesh position={[0,.4,-74]}><cylinderGeometry args={[4,5,.8,8]}/><meshStandardMaterial color="#50676a" metalness={.45} roughness={.4}/></mesh>
 <Crystal at={[0,4,-74]} scale={2} recovered={recovered}/><pointLight position={[0,4,-72]} color="#5effce" intensity={recovered?100:35} distance={30}/>
 {!recovered&&[0,1,2].map(i=><mesh key={i} position={[0,4,-74]} rotation={[i*.65,.4+i*.8,.2]}><torusGeometry args={[3.2,.09,8,48]}/><meshStandardMaterial color="#ae82dc" emissive="#8763b4" emissiveIntensity={.6}/></mesh>)}
 <WorldPlaque at={[0,9,-79]} title={recovered?'NUMBER CORE RESTORED':'THE CORE CHAMBER'} subtitle={recovered?'THE FOG IS CLEARING':'CONFUSION CREEPER’S SEAL'} width={12} colour="#87e6d2"/>
 </>;
}
function StoryArt({recovery=false}:{recovery?:boolean}){return <svg viewBox="0 0 400 180" role="img" aria-label={recovery?'The Number Core shines as the Fog clears.':'A glowing Number Core inside Confusion Creeper’s purple seal.'}><path d="M0 180 55 70 105 150 160 25 220 160 285 65 330 140 400 40V180" fill="#253d41"/><ellipse cx="200" cy="155" rx="90" ry="15" fill="#173c3e"/>{!recovery&&<g fill="none" stroke="#ae86de" strokeWidth="4"><ellipse cx="200" cy="90" rx="86" ry="32" transform="rotate(-25 200 90)"/><ellipse cx="200" cy="90" rx="86" ry="32" transform="rotate(50 200 90)"/></g>}<path d="m200 25 38 62-38 66-38-66Z" fill="#5ae2c3"/><path d="m200 25 0 128-38-66Z" fill="#b1ffeb"/>{recovery&&<g stroke="#a5ffe7" strokeWidth="3"><path d="m130 40-18-18m158 18 18-18M105 100H75m220 0h30M200 12V0"/></g>}</svg>;}

export default function NumberStrongholdDemo(){
 const [move,setMove]=useState(EMPTY_WORLD_MOVE_INPUT),[look,setLook]=useState(EMPTY_WORLD_LOOK_INPUT);
 const [spawn,setSpawn]=useState<SummitPoint>([0,0,10]),[spawnKey,setSpawnKey]=useState(0),[nearest,setNearest]=useState<number|null>(null);
 const [unlocked,setUnlocked]=useState(2),[recovered,setRecovered]=useState(()=>{try{return sessionStorage.getItem('reliq:demo:number-core-recovered')==='true';}catch{return false;}}),[story,setStory]=useState<StrongholdStory|null>('entrance');
 const [week,setWeek]=useState<number|null>(null),[help,setHelp]=useState(false),[notice,setNotice]=useState('');
 const position=useRef(new THREE.Vector3(0,.75,10)),action=useRef<()=>void>(()=>{}),dialog=useRef<HTMLElement>(null),continueButton=useRef<HTMLButtonElement>(null);
 const paused=story!==null||week!==null||help;
 function stop(){setMove(EMPTY_WORLD_MOVE_INPUT);setLook(EMPTY_WORLD_LOOK_INPUT);}
 function travel(target:number){const portal=STRONGHOLD_PORTALS.find(p=>p.week===target);setSpawn(portal?[portal.position[0],0,portal.position[2]+4]:[0,0,-66]);setSpawnKey(k=>k+1);setNearest(null);setNotice('');stop();}
 function enter(target:number){stop();if(target===4){setStory(recovered?'recovery':'battle');return;}if(target>unlocked){setNotice(`Week ${target} is locked. Pass the previous week’s quiz with 80% or more.`);return;}setWeek(target);setNotice('');try{sessionStorage.setItem('reliq:demo:number-stronghold:week',String(target));}catch{}}
 useEffect(()=>{action.current=()=>{if(!paused&&nearest!==null)enter(nearest);};});
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.target as HTMLElement)?.closest('button,a,input,select,[role="dialog"]'))return;if(e.key.toLowerCase()==='e'&&!e.repeat)action.current();};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 useEffect(()=>{if(paused){dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();}else continueButton.current?.focus();},[paused,story,week]);
 function close(){setStory(null);setWeek(null);setHelp(false);stop();}
 function recover(){setRecovered(true);setStory('recovery');try{sessionStorage.setItem('reliq:demo:number-core-recovered','true');}catch{}}
 function resume(){let target=unlocked;try{target=Number(sessionStorage.getItem('reliq:demo:number-stronghold:week'))||unlocked;}catch{}travel(Math.min(unlocked,Math.max(1,target)));}
 const panel=story?STRONGHOLD_STORY[story]:null;
 return <main className="summit-world stronghold-world" data-world3d-root data-stronghold="number-demo">
 <Canvas dpr={1} camera={{position:[0,5,18],fov:55,near:.1,far:150}} gl={{antialias:false}} fallback={<p>Use the week buttons to explore without 3D.</p>}><Suspense fallback={null}><Scene unlocked={unlocked} recovered={recovered}/><NumberSummitPlayer move={move} look={look} unlocked={1} volcanoOpen={false} spawn={spawn} spawnKey={spawnKey} paused={paused} overview={false} position={position} onNearest={setNearest} onAltitude={()=>{}} floorResolver={strongholdFloor} nearestResolver={strongholdNearest}/></Suspense></Canvas>
 <header className="stronghold-header"><div><small>THE FINAL BATTLE · LEVEL 8</small><h1>Number Nexus stronghold</h1></div><nav aria-label="Journey"><Link href={STRONGHOLD_SUMMIT_RETURN}>Back to summit</Link><Link href="/demo-review">Back to review</Link><Link href="/world">Central hub</Link></nav></header>
 <aside className="stronghold-objective"><small>RECOVER THE NUMBER CORE</small><h2>{recovered?'The Fog is clearing.':'Break Confusion Creeper’s seal.'}</h2><button ref={continueButton} onClick={resume}>Continue my mission →</button><button onClick={()=>{stop();setHelp(true);}}>Story & controls</button></aside>
 <aside className="stronghold-review"><strong>DEMO PROTOTYPE</strong><p>Three sample portals—not the final curriculum length. No student progress or rewards are changed.</p><label>Preview progression<select value={unlocked} onChange={e=>setUnlocked(Number(e.target.value))}><option value={1}>Week 1 open</option><option value={2}>Week 1 complete · Week 2 open</option><option value={3}>All sample weeks open</option></select></label><div className="stronghold-week-buttons">{STRONGHOLD_PORTALS.map(p=><button key={p.week} onClick={()=>travel(p.week)}>Visit W{p.week}</button>)}<button onClick={()=>travel(4)}>Core chamber</button></div><button onClick={()=>{stop();setStory('opening');}}>Replay volcano opening</button></aside>
 {!paused&&<><WorldJoystick input={move} onChange={setMove}/><WorldLookJoystick onChange={setLook}/>{nearest!==null&&<div className="summit-action"><button className="summit-primary" onClick={()=>enter(nearest)}>{nearest===4?'Inspect the Core':`Enter Week ${nearest}${nearest>unlocked?' · Locked':''}`} <kbd>E</kbd></button></div>}</>}
 {notice&&<div className="stronghold-notice" role="status">{notice}<ReadAloudBtn text={notice}/><button onClick={()=>setNotice('')}>Dismiss</button></div>}
 {paused&&<div className="stronghold-backdrop" onKeyDown={e=>{if(e.key==='Escape'){close();return;}if(e.key!=='Tab')return;const elements=dialog.current?.querySelectorAll<HTMLElement>('button,a[href],select');if(!elements?.length)return;const first=elements[0],last=elements[elements.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}><section ref={dialog} className={`stronghold-panel ${week?'stronghold-week-panel':''}`} role="dialog" aria-modal="true" aria-labelledby="stronghold-panel-title">
 {panel?<><StoryArt recovery={story==='recovery'}/><small>THE FOG OF FORGETFULNESS</small><h2 id="stronghold-panel-title">{panel.title}</h2><p>{panel.text}</p><ReadAloudBtn text={`${panel.title}. ${panel.text} ${story==='recovery'?'The Number Core shines as the Fog clears.':'A glowing Number Core inside Confusion Creeper’s purple seal.'} ${story==='battle'?'The final post-test will use the familiar assessment screen. Score 85 percent or more to recover the Core. Below that, practise and return. This prototype previews the story only.':''}`}/>{story==='battle'&&<p className="stronghold-note">The final post-test will use the familiar assessment screen. Score 85% or more to recover the Core. Below that, practise and return. This prototype previews the story only.</p>}<div className="stronghold-actions"><button onClick={close}>Continue →</button><button onClick={close}>Skip story</button>{story==='battle'&&<button onClick={recover}>Preview Core recovery</button>}</div></>:week?<><small>NUMBER NEXUS · LEVEL 8 · WEEK {week}</small><h2 id="stronghold-panel-title">Your weekly mission</h2><p>The familiar three-lesson structure, inside the volcanic stronghold.</p><ReadAloudBtn text={`Number Nexus. Level 8. Week ${week}. Three lessons and a weekly quiz. Video coming soon. Learn, practise, reflect. Lesson content is awaiting curriculum review. The weekly quiz has 15 questions, five per lesson. Score 80 percent or more to open the next week. Navigation preview only. No sample lesson scores are saved.`}/><div className="stronghold-video">Video coming soon</div><div className="stronghold-lessons">{[1,2,3].map(l=><article key={l}><small>LESSON {l}</small><h3>Learn · practise · reflect</h3><p>Content awaiting curriculum review.</p></article>)}<article><small>WEEKLY QUIZ</small><h3>15 questions</h3><p>Five per lesson. Score 80%+ to open the next week.</p></article></div><p className="stronghold-note">Navigation preview only. No sample lesson scores are saved.</p><div className="stronghold-actions"><button onClick={close}>Back to stronghold</button><Link href={STRONGHOLD_SUMMIT_RETURN}>Back to summit</Link><Link href="/world">Central hub</Link></div></>:<><h2 id="stronghold-panel-title">Explore the stronghold</h2><p>Walk with WASD or arrow keys. Drag to look. Use the touch joysticks on a tablet. Press E near a doorway to enter.</p><p>Confusion Creeper guards the Number Core for the Fog of Forgetfulness. Each completed week brings you closer to breaking its seal.</p><ReadAloudBtn text="Walk with WASD or arrow keys. Drag to look. Use touch joysticks on a tablet. Press E near a doorway. Confusion Creeper guards the Number Core for the Fog of Forgetfulness."/><div className="stronghold-actions"><button onClick={close}>Return to the path</button><button onClick={()=>{setHelp(false);setStory('entrance');}}>Replay introduction</button></div><div className="stronghold-week-buttons">{STRONGHOLD_PORTALS.map(p=><button key={p.week} disabled={p.week>unlocked} onClick={()=>{setHelp(false);enter(p.week);}}>Open Week {p.week}{p.week>unlocked?' · Locked':''}</button>)}</div></>}
 </section></div>}
 </main>;
}
