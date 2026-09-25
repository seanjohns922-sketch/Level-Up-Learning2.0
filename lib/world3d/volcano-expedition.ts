import type { SummitPoint } from './number-summit';

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
export function volcanoProjection(x:number,z:number){
 let best={distance:Infinity,height:0,segment:0};
 for(let i=0;i<VOLCANO_ROUTE.length-1;i++){
  const a=VOLCANO_ROUTE[i],b=VOLCANO_ROUTE[i+1],dx=b[0]-a[0],dz=b[2]-a[2],length=dx*dx+dz*dz;
  if(length===0)continue;
  const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/length));
  const distance=Math.hypot(x-a[0]-t*dx,z-a[2]-t*dz);
  if(distance<best.distance)best={distance,height:a[1]+(b[1]-a[1])*t,segment:i};
 }
 return best;
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
