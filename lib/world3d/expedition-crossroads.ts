import { volcanoHeight,volcanoProjection } from './volcano-expedition';
import type { SummitPoint } from './number-summit';

export const CROSSROADS: SummitPoint = [0, 0, 65];
export const EXPEDITION_START: SummitPoint = [0, 0, 87];
export const EXPEDITION_TRAILS = [
 {id:'measurement',name:'Measurelands',landmark:'The Quarry Road',colour:'#d7b46e',description:'Cranes, stone bridges and the surveyor’s quarry.',points:[[0,0,65],[-17,0,74],[-49,1,91],[-85,2,95],[-120,3,110]]},
 {id:'space',name:'Starpath',landmark:'Observatory Ridge',colour:'#b39bd6',description:'Follow the old stone steps towards the observatory.',points:[[0,0,65],[-18,0,60],[-50,1,48],[-85,2,58],[-120,3,42]]},
 {id:'number',name:'Number Nexus',landmark:'The Foundry Trail',colour:'#65cbb7',description:'Follow the foundry trail to your Level 7 weekly lessons.',points:[[0,0,65],[-12,0,52],[-30,0,20],[-60,0,-8],[-90,0,-25]]},
 {id:'statistics',name:'Statistica',landmark:'Forest Research Station',colour:'#83b984',description:'An expedition through the forest to the research station.',points:[[0,0,65],[14,0,52],[37,1,34],[66,2,43],[90,3,25]]},
 {id:'patterns',name:'Pattern Peaks',landmark:'The Ancient Terraces',colour:'#64ac9f',description:'A winding climb through repeating arches and mountain ruins.',points:[[0,0,65],[19,0,63],[48,1,64],[80,2,78],[121,3,67]]},
 {id:'chance',name:'Chance Hollow',landmark:'The Mistfall Cavern',colour:'#c78697',description:'Follow the creek into a lantern-lit cavern.',points:[[0,0,65],[12,0,79],[34,1,100],[69,2,113],[106,3,107]]},
] as const;

// The renderer, terrain and movement controller all use these same curved routes.
export function sampleTrail(points:readonly (readonly number[])[]):SummitPoint[]{
 const out:SummitPoint[]=[];
 for(let i=0;i<points.length-1;i++)for(let j=0;j<16;j++){
  const t=j/16,p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];
  out.push([0,1,2].map(k=>.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t*t+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t*t*t)) as SummitPoint);
 }
 out.push([...points[points.length-1]] as SummitPoint);return out;
}
export const TRAIL_SAMPLES=EXPEDITION_TRAILS.map(t=>sampleTrail(t.points));
export function nearestTrail(x:number,z:number){
 let best={distance:Infinity,height:0,trail:0,progress:0};
 TRAIL_SAMPLES.forEach((points,trail)=>{for(let i=0;i<points.length-1;i++){
  const a=points[i],b=points[i+1],dx=b[0]-a[0],dz=b[2]-a[2],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz)));
  const distance=Math.hypot(x-a[0]-t*dx,z-a[2]-t*dz);
  if(distance<best.distance)best={distance,height:a[1]+t*(b[1]-a[1]),trail,progress:(i+t)/(points.length-1)};
 }});return best;
}
export function crossroadsFloor(x:number,z:number):number|null{
 if(Math.hypot(x+8,z-72)<1.55)return null;
 if(Math.hypot(x,z-65)<13)return 0;
 if(Math.hypot(x,z-65)<20)return crossroadsTerrain(x,z)+.07;
 if(Math.abs(x)<3.2&&z>=65&&z<=102)return 0;
 const n=nearestTrail(x,z);
 // Every trail can be explored up to its visible barrier. Number is open.
 if(n.distance<5.5&&n.progress<.91)return n.distance<=3?n.height:crossroadsTerrain(x,z)+.07;
 return null;
}
export function crossroadsTerrain(x:number,z:number){
 // Continuous wooded ridgelines screen neighbouring expeditions from player height.
 // Keep the shared clearing open; carve each route through the same height field.
 const radius=Math.hypot(x,z-65);
 const enclosure=Math.max(0,Math.min(1,(radius-17)/13));
 const northFade=Math.max(0,Math.min(1,(z-5)/10));
 let h=-.9+Math.sin(x*.11)*.65+Math.cos(z*.08)*.7;
 const trailheadFade=Math.max(0,Math.min(1,(Math.hypot(x+90,z+25)-10)/5));
 h+=(16+Math.sin(x*.06+z*.045)*3)*enclosure*northFade*trailheadFade;
 const n=nearestTrail(x,z),blend=Math.max(0,Math.min(1,(n.distance-5.8)/5));
 h=n.height-.07+(h-(n.height-.07))*blend;
 const camp=Math.max(0,Math.min(1,(Math.hypot(x,z-65)-13)/7));h=-.07+(h+.07)*camp;
 if(z>=65&&z<110){const arrival=Math.max(0,Math.min(1,(Math.abs(x)-4)/10));h=-.07+(h+.07)*arrival;}
 const volcanic=volcanoHeight(x,z);
 if(z<5)h=Math.max(h,volcanic);
 const v=volcanoProjection(x,z);
 if(v.distance<11){const blend=Math.max(0,Math.min(1,(v.distance-4)/7));h=v.height-.09+(h-v.height+.09)*blend;}
 if(x<-80&&z<-18)h=-.12;
 return h;
}

// Shared by terrain colour, vegetation and the smoothly changing scene lighting.
export function trailThreat(x:number,z:number){
 const n=nearestTrail(x,z);
 const t=Math.max(0,Math.min(1,(n.progress-.18)/.68));
 return t*t*(3-2*t);
}
