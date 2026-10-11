"use client";
import { TRAIN_CARRIAGE_SPACING, TRAIN_RAIL_Y } from "@/lib/world3d/world-scale";
import { TrainUnit } from "./TrainModels";
import { trainDesign, isTrainAsset } from "@/lib/world3d/train-catalogue";
export { RailTrack } from "./RailTrack";
import {useMemo,useRef,useState} from 'react';
import {useFrame} from '@react-three/fiber';
import {Html} from '@react-three/drei';
import type {Group} from 'three';
import type {EconomyItem} from '@/lib/economy';
import type {CentralWorldPlacement} from '@/lib/world3d/central-world-layout';
import {railwayRoute,routePosition,segmentLength,trainConsistCapacity,stationStopDistances,trainTrackSupport,rotateRail} from '@/lib/world3d/railway';
export function StarterTrain(){return <TrainUnit asset="train_steam"/>;}
export function ParkedTrain({start,placements,items}:{start:CentralWorldPlacement;placements:CentralWorldPlacement[];items:Map<string,EconomyItem>}){
 const segment=trainTrackSupport(start,placements,items)??{placement:start,asset:'rail_train',reverse:false};
 const pose=routePosition([segment],segmentLength(segment)/2);
 const [x,z]=rotateRail([pose.x-start.gridX*2,pose.z-start.gridZ*2],-start.rotation);
 return <group position={[x,TRAIN_RAIL_Y,z]} rotation={[0,pose.yaw-start.rotation*Math.PI/180,0]}>{items.get(start.itemId)?.metadata.worldAssetKey==="rail_train"?<StarterTrain/>:<TrainUnit asset={String(items.get(start.itemId)?.metadata.worldAssetKey)}/>}</group>;
}
function TrainOnRoute({start,placements,items,editing}:{start:CentralWorldPlacement;placements:CentralWorldPlacement[];items:Map<string,EconomyItem>;editing:boolean}){
 const asset=String(items.get(start.itemId)?.metadata.worldAssetKey??"rail_train");
 const design=trainDesign(asset);
 const carriageRefs=useRef<Array<Group|null>>([]);
 const root=useRef<Group>(null),distance=useRef(0),wait=useRef(0),[running,setRunning]=useState(true),[speed,setSpeed]=useState(1);
 const route=useMemo(()=>railwayRoute(start,placements,items),[start,placements,items]);
 const carriageCount=useMemo(()=>trainConsistCapacity(route,design?.cars??0),[route,design]);
 const stops=useMemo(()=>stationStopDistances(route,placements,items),[route,placements,items]);const total=route.reduce((s,r)=>s+segmentLength(r),0);
 useFrame((_,delta)=>{if(!root.current)return;
 const segment=trainTrackSupport(start,placements,items)??{placement:start,asset:'rail_train',reverse:false};
 if(!route.length||editing){const pose=routePosition([segment],segmentLength(segment)/2);root.current.position.set(pose.x,TRAIN_RAIL_Y,pose.z);root.current.rotation.y=pose.yaw;distance.current=segmentLength(segment)/2;}
 else {
  if(running){if(wait.current>0)wait.current=Math.max(0,wait.current-delta);else{const step=Math.min(delta,.1)*speed,old=distance.current%total;const stop=stops.filter(s=>((s-old+total)%total)>1e-5&&((s-old+total)%total)<=step).sort((a,b)=>((a-old+total)%total)-((b-old+total)%total))[0];if(stop!==undefined){distance.current=stop;wait.current=3;}else distance.current=(old+step)%total;}}
  const pose=routePosition(route,distance.current);root.current.position.set(pose.x,TRAIN_RAIL_Y,pose.z);root.current.rotation.y=pose.yaw;
 }
 carriageRefs.current.forEach((car,i)=>{if(!car)return;car.visible=i<carriageCount;if(route.length){const pose=routePosition(route,distance.current-(i+1)*TRAIN_CARRIAGE_SPACING);car.position.set(pose.x,TRAIN_RAIL_Y,pose.z);car.rotation.y=pose.yaw;}});
 });
 return <><group ref={root}>{asset==="rail_train"?<StarterTrain/>:<TrainUnit asset={asset}/>}</group>{Array.from({length:design?.cars??0},(_,i)=><group key={i} ref={node=>{carriageRefs.current[i]=node;}}><TrainUnit asset={asset} car={i+1}/></group>)}<Html position={[start.gridX*2,1.7,start.gridZ*2]} center distanceFactor={12}><div style={{background:'#203a32',color:'white',padding:8,borderRadius:8,width:190,fontSize:12,pointerEvents:editing?'none':'auto'}} onPointerDown={e=>e.stopPropagation()}>{!route.length?'Connect the track into a closed loop.':<><button onClick={()=>setRunning(!running)}>{running?'Pause train':'Start train'}</button><label style={{display:'block'}}>Speed <select aria-label="Train speed" value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={.6}>Slow</option><option value={1}>Normal</option><option value={1.8}>Fast</option></select></label><span>{stops.length?'Station stop connected':'Connect track to either end of the station’s rails.'}</span></>}{route.length>0&&carriageCount<(design?.cars??0)&&<span style={{display:'block'}}>Extend your loop to show every carriage.</span>}{editing&&<span style={{display:'block'}}>Paused while building</span>}</div></Html></>;
}
export function WorldRailway({placements,items,editing}:{placements:CentralWorldPlacement[];items:Map<string,EconomyItem>;editing:boolean}){return <>{placements.filter(p=>isTrainAsset(items.get(p.itemId)?.metadata.worldAssetKey)).map((start,i)=><TrainOnRoute key={start.placementId??i} start={start} placements={placements} items={items} editing={editing}/>)}</>;}
