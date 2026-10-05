"use client";
import {Suspense,useEffect,useRef,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {DEFAULT_OUTFIT,type AvatarOutfit} from '@/components/avatar/StudentAvatar';
import {WEAPONS} from '@/components/avatar/WeaponArt';
import {REFERENCE_HAIR_STYLES} from '@/lib/avatar/explorer-hair-geometry';
import {ExplorerAvatarModel} from '@/components/world3d/SharedWorldPlayer';
const INITIAL:Required<AvatarOutfit>={...DEFAULT_OUTFIT,top:'realm_codemaster',shirt:'#30263f',shirtTrim:'#b79860',pants:'#292536',shoes:'#494052',shoeStyle:'boots',hairStyle:'sidepart',hat:'explorer',hatColor:'#bd9556',glasses:'round',backpack:'explorer',backpackColor:'#526d50',cape:'royal',capeColor:'#68498c',held:'explorers_spear'};
function Model({o,walking,sprinting}:{o:Required<AvatarOutfit>;walking:boolean;sprinting:boolean}){
 const moving=useRef(walking),running=useRef(sprinting);
 useEffect(()=>{moving.current=walking;running.current=sprinting;},[walking,sprinting]);
 return <group position={[0,.73,0]}><ExplorerAvatarModel avatar={o} movingRef={moving} sprintingRef={running}/></group>;
}
const choices={hairStyle:[...REFERENCE_HAIR_STYLES,'buzz','bald'],hat:['none','beanie','cap','explorer','crown','wizard'],glasses:['none','round','shades','visor'],cape:['none','hero','royal'],backpack:['none','explorer','rocket'],held:['none',...Object.keys(WEAPONS)]};
export default function Page(){
 const [o,setO]=useState(INITIAL),[walking,setWalking]=useState(false),[sprinting,setSprinting]=useState(false);
 return <main className="min-h-screen bg-slate-950 p-6 text-white"><h1 className="text-2xl font-bold">Avatar accessories — 3D fit review</h1><p className="my-2 text-slate-300">Rotate to check the sides and back. These are the same models used in the world.</p><div className="grid gap-6 lg:grid-cols-[280px_1fr]"><section className="space-y-3">{Object.entries(choices).map(([slot,items])=><label key={slot} className="block text-sm">{slot==='hairStyle'?'Hair':slot==='held'?'Held item':slot.charAt(0).toUpperCase()+slot.slice(1)}<select className="mt-1 block w-full rounded bg-slate-800 p-2" value={o[slot as keyof typeof choices]} onChange={e=>setO({...o,[slot]:e.target.value})}>{items.map(item=><option key={item} value={item}>{item.replaceAll('_',' ')}</option>)}</select></label>)}{(['hatColor','glassesColor','capeColor','backpackColor','hair'] as const).map(slot=><label key={slot} className="flex justify-between">{slot.replace('Color',' colour')}<input type="color" value={o[slot]} onChange={e=>setO({...o,[slot]:e.target.value})}/></label>)}<label className="block"><input type="checkbox" checked={walking} onChange={e=>setWalking(e.target.checked)}/> Walk</label><label className="block"><input type="checkbox" checked={sprinting} onChange={e=>{setSprinting(e.target.checked);if(e.target.checked)setWalking(true);}}/> Run</label><button className="rounded bg-slate-700 px-4 py-2" onClick={()=>setO(INITIAL)}>Reset</button></section><div className="h-[80vh] min-h-[500px] overflow-hidden rounded-2xl"><Canvas shadows camera={{position:[3,2,5],fov:35}} dpr={[1,1.5]}><color attach="background" args={['#293140']}/><ambientLight intensity={.9}/><directionalLight position={[-3,5,4]} intensity={2} castShadow/><directionalLight position={[3,3,-4]} intensity={1}/><Suspense fallback={null}><Model o={o} walking={walking} sprinting={sprinting}/></Suspense><mesh rotation={[-Math.PI/2,0,0]} receiveShadow position={[0,-.015,0]}><planeGeometry args={[20,20]}/><meshStandardMaterial color="#414958"/></mesh><OrbitControls target={[0,1.2,0]} minDistance={2.8} maxDistance={8}/></Canvas></div></div></main>;
}
