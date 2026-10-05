"use client";
import {useMemo,useRef,useState} from 'react';
import {useFrame} from '@react-three/fiber';
import {Html} from '@react-three/drei';
import type {Group} from 'three';
import type {EconomyItem} from '@/lib/economy';
import type {CentralWorldPlacement} from '@/lib/world3d/central-world-layout';
import {railPoint,railwayRoute,routePosition,segmentLength,stationStopDistances} from '@/lib/world3d/railway';
function Box({p,s,c}:{p:[number,number,number];s:[number,number,number];c:string}){return <mesh position={p} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c} roughness={.7}/></mesh>;}
export function StarterTrain(){return <group><Box p={[0,.3,0]} s={[.66,.18,1.25]} c="#243c39"/><Box p={[0,.63,-.34]} s={[.66,.62,.48]} c="#b23e38"/><Box p={[0,.98,-.34]} s={[.8,.1,.64]} c="#e5bc65"/><Box p={[0,.68,-.075]} s={[.44,.27,.018]} c="#ace1eb"/><mesh position={[0,.54,.2]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.23,.23,.63,16]}/><meshStandardMaterial color="#347367"/></mesh><Box p={[0,.87,.35]} s={[.14,.42,.14]} c="#263934"/>{[-1,1].flatMap(side=>[-.4,.35].map(z=><mesh key={`${side}:${z}`} position={[side*.32,.22,z]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.17,.17,.07,12]}/><meshStandardMaterial color="#293b3c"/></mesh>))}<Box p={[0,.55,.55]} s={[.17,.17,.035]} c="#ffe7a4"/></group>;}
export function RailTrack({asset}:{asset:string}){
 const n=asset==='rail_corner'?16:8;
 return <group>{Array.from({length:n},(_,i)=>{const a=railPoint(asset,i/n),b=railPoint(asset,(i+1)/n),angle=Math.atan2(b[0]-a[0],b[1]-a[1]),length=Math.hypot(b[0]-a[0],b[1]-a[1]);return <group key={i} position={[(a[0]+b[0])/2,0,(a[1]+b[1])/2]} rotation={[0,angle,0]}>{i%2===0&&<Box p={[0,.035,0]} s={[.95,.07,.14]} c="#80634a"/>}{[-1,1].map(side=><Box key={side} p={[side*.28,.095,0]} s={[.045,.07,length+.025]} c="#73817e"/>)}</group>;})}</group>;
}
function TrainOnRoute({start,placements,items,editing}:{start:CentralWorldPlacement;placements:CentralWorldPlacement[];items:Map<string,EconomyItem>;editing:boolean}){
 const root=useRef<Group>(null),distance=useRef(0),wait=useRef(0),[running,setRunning]=useState(true),[speed,setSpeed]=useState(1);
 const route=useMemo(()=>railwayRoute(start,placements,items),[start,placements,items]);
 const stops=useMemo(()=>stationStopDistances(route,placements,items),[route,placements,items]);const total=route.reduce((s,r)=>s+segmentLength(r),0);
 useFrame((_,delta)=>{if(!root.current)return;if(!route.length){root.current.position.set(start.gridX*2,.05,start.gridZ*2);root.current.rotation.y=start.rotation*Math.PI/180+Math.PI/2;return;}
 if(running&&!editing){if(wait.current>0)wait.current=Math.max(0,wait.current-delta);else{const step=Math.min(delta,.1)*speed,old=distance.current%total;const stop=stops.filter(s=>((s-old+total)%total)>1e-5&&((s-old+total)%total)<=step).sort((a,b)=>((a-old+total)%total)-((b-old+total)%total))[0];if(stop!==undefined){distance.current=stop;wait.current=3;}else distance.current=(old+step)%total;}}
 const p=routePosition(route,distance.current);root.current.position.set(p.x,.05,p.z);root.current.rotation.y=p.yaw;});
 return <><group ref={root}><StarterTrain/></group><Html position={[start.gridX*2,1.7,start.gridZ*2]} center distanceFactor={12}><div style={{background:'#203a32',color:'white',padding:8,borderRadius:8,width:190,fontSize:12,pointerEvents:editing?'none':'auto'}} onPointerDown={e=>e.stopPropagation()}>{!route.length?'Connect the track into a closed loop.':<><button onClick={()=>setRunning(!running)}>{running?'Pause train':'Start train'}</button><label style={{display:'block'}}>Speed <select aria-label="Train speed" value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={.6}>Slow</option><option value={1}>Normal</option><option value={1.8}>Fast</option></select></label><span>{stops.length?'Station stop connected':'Run straight track along the station’s front edge.'}</span></>}{editing&&<span style={{display:'block'}}>Paused while building</span>}</div></Html></>;
}
export function WorldRailway({placements,items,editing}:{placements:CentralWorldPlacement[];items:Map<string,EconomyItem>;editing:boolean}){return <>{placements.filter(p=>items.get(p.itemId)?.metadata.worldAssetKey==='rail_train').map((start,i)=><TrainOnRoute key={start.placementId??i} start={start} placements={placements} items={items} editing={editing}/>)}</>;}
