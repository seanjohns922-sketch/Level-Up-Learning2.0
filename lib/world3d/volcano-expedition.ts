import type { SummitPoint } from './number-summit';
import { createSegmentGrid } from './segment-grid';

export const VOLCANO_CENTRE = [0, -130] as const;
export const VOLCANO_GATE: SummitPoint = [4, 0, 34];
export const VOLCANO_SUMMIT: SummitPoint = [0, 70, -108];
// One continuous seventh route, independent of all six Level 7 missions.
export const VOLCANO_ROUTE: SummitPoint[] = [
 [0,0,65],[3,0,48],[4,0,34],[3,0,15],[0,0,-10],[0,0,-36],
 ...Array.from({length:97},(_,i):SummitPoint=>{
  const t=i/96,angle=t*Math.PI*2,r=94-68*t;
  return [Math.sin(angle)*r,70*t,-130+Math.cos(angle)*r];
 }),[0,70,-108],
];
/** The whole expedition map, which every terrain lookup falls inside. */
export const EXPEDITION_BOUNDS={minX:-240,maxX:240,minZ:-290,maxZ:210};
const ROUTE_SEGMENTS=VOLCANO_ROUTE.slice(0,-1).map((a,i)=>({ax:a[0],az:a[2],bx:VOLCANO_ROUTE[i+1][0],bz:VOLCANO_ROUTE[i+1][2],ay:a[1],by:VOLCANO_ROUTE[i+1][1]}));
const nearestRouteSegment=createSegmentGrid(ROUTE_SEGMENTS,EXPEDITION_BOUNDS,5);
/** The nearest point on the volcano route: its distance, height and segment. */
export function volcanoProjection(x:number,z:number){
 const {segment,t,distance}=nearestRouteSegment(x,z),s=ROUTE_SEGMENTS[segment];
 return {distance,height:s.ay+(s.by-s.ay)*t,segment};
}
export function volcanoFloor(x:number,z:number,open:boolean):number|null{
 if(!open&&z<34)return null;
 const radius=Math.hypot(x,z+130);
 if(open&&radius>=8.5&&radius<24.5)return 70;
 const p=volcanoProjection(x,z);
 return p.distance<3.3?p.height:null;
}
export function volcanoHeight(x:number,z:number){
 const r=Math.hypot(x,z+130);
 if(r<8)return 62;
 if(r<25)return 69.9;
 const angle=Math.atan2(x,z+130),slope=Math.max(0,Math.min(1,(r-25)/12));
 return Math.max(-1,70*(94-r)/68+(Math.sin(angle*13+r*.045)*2.4+Math.cos(angle*7)*1.8)*slope);
}
export const VOLCANO_DOORS=Array.from({length:6},(_,i):SummitPoint=>{
 const a=(i+.5)*Math.PI/3;return [Math.sin(a)*18,70,-130+Math.cos(a)*18];
});
