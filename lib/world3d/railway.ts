import { TRAIN_DESIGNS, isTrainAsset } from "./train-catalogue";
import type { CentralWorldPlacement } from './central-world-layout';
import type { EconomyItem } from '../economy';
export const RAIL_KEYS = new Set(['rail_straight','rail_corner','rail_train',...TRAIN_DESIGNS.map(d=>d.key)]);
// Five fixed two-metre cells across the station's front row (inside its 5x3 plot).
export const STATION_TRACK_CENTRES = [-4,-2,0,2,4] as const;
export const STATION_TRACK_Z = 2;
export function stationRailPlacements(station:CentralWorldPlacement):CentralWorldPlacement[]{
 return STATION_TRACK_CENTRES.map(x=>{const [dx,dz]=rotateRail([x,STATION_TRACK_Z],station.rotation);return {...station,gridX:station.gridX+dx/2,gridZ:station.gridZ+dz/2};});
}
type Point=[number,number];
export type RailSegment={placement:CentralWorldPlacement;asset:string;reverse:boolean};
/** Existing track beneath a train; the train must not add a second route segment. */
export function trainTrackSupport(train:CentralWorldPlacement,placements:CentralWorldPlacement[],items:Map<string,EconomyItem>){
 for(const source of placements){
  const asset=String(items.get(source.itemId)?.metadata.worldAssetKey??'');
  const candidates=asset==='railway_station'?stationRailPlacements(source):asset==='rail_straight'||asset==='rail_corner'?[source]:[];
  const placement=candidates.find(p=>p.gridX===train.gridX&&p.gridZ===train.gridZ);
  if(placement)return {source,placement,asset:asset==='railway_station'?'rail_straight':asset,reverse:false};
 }
 return null;
}
export function rotateRail([x,z]:Point,degrees:number):Point {const a=degrees*Math.PI/180;return [Math.round((x*Math.cos(a)+z*Math.sin(a))*1e6)/1e6,Math.round((-x*Math.sin(a)+z*Math.cos(a))*1e6)/1e6];}
export function railPoint(asset:string,t:number):Point {
 if(asset!=='rail_corner')return [-1+2*t,0];
 // Quarter circle centred on the north-west corner of a two-metre tile.
 const a=t*Math.PI/2;return [-1+Math.sin(a),-1+Math.cos(a)];
}
function ports(p:CentralWorldPlacement,asset:string){return [railPoint(asset,0),railPoint(asset,1)].map(v=>{const [x,z]=rotateRail(v,p.rotation);return [p.gridX*2+x,p.gridZ*2+z] as Point;});}
const key=(p:Point)=>p.map(n=>n.toFixed(4)).join(':');
export function railwayRoute(start:CentralWorldPlacement,placements:CentralWorldPlacement[],items:Map<string,EconomyItem>):RailSegment[]{
 const rails=placements.flatMap(placement=>{
  const asset=String(items.get(placement.itemId)?.metadata.worldAssetKey??'');
  if(isTrainAsset(asset) && (asset!=='rail_train'||trainTrackSupport(placement,placements,items)))return [];
  return asset==='railway_station'?stationRailPlacements(placement).map(placement=>({placement,asset:'rail_straight'})):RAIL_KEYS.has(asset)?[{placement,asset}]:[];
 });
 const endpoints=new Map<string,Array<{index:number;end:number}>>();
 rails.forEach((r,index)=>ports(r.placement,r.asset).forEach((point,end)=>{const k=key(point);endpoints.set(k,[...(endpoints.get(k)??[]),{index,end}]);}));
 const support=trainTrackSupport(start,placements,items);
 if(isTrainAsset(items.get(start.itemId)?.metadata.worldAssetKey)&&items.get(start.itemId)?.metadata.worldAssetKey!=='rail_train'&&!support)return [];
 const first=rails.findIndex(r=>support?r.placement.gridX===support.placement.gridX&&r.placement.gridZ===support.placement.gridZ:r.placement===start);if(first<0)return [];
 const route:RailSegment[]=[],seen=new Set<number>();let index=first,entry=0;
 while(!seen.has(index)){
  seen.add(index);const r=rails[index];route.push({...r,reverse:entry===1});
  const joins=endpoints.get(key(ports(r.placement,r.asset)[1-entry]))??[];if(joins.length!==2)return [];
  const next=joins.find(j=>j.index!==index);if(!next)return [];
  index=next.index;entry=next.end;
 }
 return index===first&&entry===0&&route.length>=4?route:[];
}
export function segmentLength(segment:RailSegment){return segment.asset==='rail_corner'?Math.PI/2:2;}
export function routePosition(route:RailSegment[],distance:number){
 const total=route.reduce((sum,s)=>sum+segmentLength(s),0);let d=((distance%total)+total)%total;
 for(const segment of route){const length=segmentLength(segment);if(d<=length){const t=segment.reverse?1-d/length:d/length;const local=railPoint(segment.asset,t),next=railPoint(segment.asset,Math.max(0,Math.min(1,t+(segment.reverse?-.001:.001))));const v=rotateRail(local,segment.placement.rotation),dv=rotateRail([next[0]-local[0],next[1]-local[1]],segment.placement.rotation);return {x:segment.placement.gridX*2+v[0],z:segment.placement.gridZ*2+v[1],yaw:Math.atan2(dv[0],dv[1])};}d-=length;}
 return {x:0,z:0,yaw:0};
}
/** Stop beside the front edge of the station's reserved footprint, not inside its building. */
export function stationStopDistances(route:RailSegment[],placements:CentralWorldPlacement[],items:Map<string,EconomyItem>){
 const stations=placements.filter(p=>items.get(p.itemId)?.metadata.worldAssetKey==='railway_station');
 const stops:number[]=[];
 for(const station of stations){
  const grid=String(items.get(station.itemId)?.metadata.gridSize??'5x3').split('x').map(Number);
  const width=Number.isFinite(grid[0])?grid[0]:5,depth=Number.isFinite(grid[1])?grid[1]:3;
  let distance=0,best:{offset:number;gap:number}|null=null;
  for(const segment of route){const length=segmentLength(segment),mid=routePosition([segment],length/2);
   const [x,z]=rotateRail([mid.x-station.gridX*2,mid.z-station.gridZ*2],-station.rotation);
   if(segment.asset!=='rail_corner' && (segment.placement.rotation-station.rotation)%180===0 && (Math.abs(z-(depth+1))<.2 || (segment.placement.itemId===station.itemId && Math.abs(z-STATION_TRACK_Z)<.2)) && Math.abs(x)<=width && (!best||Math.abs(x)<best.gap))best={offset:distance+length/2,gap:Math.abs(x)};
   distance+=length;
  }
  if(best&&!stops.includes(best.offset))stops.push(best.offset);
 }
 return stops.sort((a,b)=>a-b);
}
