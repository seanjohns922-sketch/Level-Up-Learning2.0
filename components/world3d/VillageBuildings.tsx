"use client";
import * as THREE from "three";
import { Box, Ball, Pole } from "./DetailedScenery";
import { VILLAGE_BUILDINGS, villageStyle, type VillageStyle } from "@/lib/world3d/village-buildings";
const timber = "#76533c", trim = "#f1dfbd", glass = "#426e7c";
function Window({ x, y, z, wide = 1 }: { x: number; y: number; z: number; wide?: number }) {
 return <group position={[x,y,z]}>
  <Box p={[0,0,0]} s={[wide+0.2,1.5,.13]} c={trim}/><Box p={[0,0,.08]} s={[wide,1.28,.05]} c={glass}/>
  <Box p={[0,0,.12]} s={[.055,1.3,.05]} c={trim}/><Box p={[0,0,.12]} s={[wide,.055,.05]} c={trim}/>
  <Box p={[0,-.78,.11]} s={[wide+.3,.12,.28]} c={trim}/>
 </group>;
}
function Roof({ w, d, y, style }: { w:number; d:number; y:number; style:VillageStyle }) {
 const rise=style==="castle"?2:style==="country"?1.55:1.05;
 const gable=new THREE.Shape();gable.moveTo(-w/2,0);gable.lineTo(w/2,0);gable.lineTo(0,rise);gable.closePath();
 const angle=Math.atan2(rise,w/2),length=Math.hypot(w/2,rise);
 return <group>
  <mesh position={[0,y,-d/2]} castShadow><extrudeGeometry args={[gable,{depth:d,bevelEnabled:false}]}/><meshStandardMaterial color={style==="castle"?"#dbc8a4":trim}/></mesh>
  {[-1,1].map(side=><Box key={side} p={[side*w/4,y+rise/2,0]} s={[length+.22,.24,d+.65]} r={[0,0,-side*angle]} c={style==="country"?"#ab6044":"#485d6c"}/>)}
  <Box p={[0,y+rise,.0]} s={[.24,.23,d+.75]} c={style==="country"?"#8f4c38":"#344957"}/>
  {/* Timber gable braces close the roof silhouette without heavy tiny details. */}
  {[-1,1].map(side=><Pole key={side} a={[side*w/2,y,d/2+.2]} b={[0,y+rise,d/2+.2]} radius={.12} c={trim}/>)}
 </group>;
}
function Balcony({ w, y, z }: {w:number;y:number;z:number}) {
 return <group>
  <Box p={[0,y,z]} s={[w,.2,1.1]} c={trim}/><Box p={[0,y+1,z+.5]} s={[w,.1,.1]} c={trim}/>
  {Array.from({length:Math.ceil(w/.45)},(_,i)=><Box key={i} p={[-w/2+.18+i*(w-.36)/(Math.ceil(w/.45)-1),y+.52,z+.5]} s={[.07,.95,.07]} c={trim}/>)}
 </group>;
}
type Palette = { style: VillageStyle; wall: string };
function Door({x=0,z,y=.25,arched=false}:{x?:number;z:number;y?:number;arched?:boolean}) {
 return <group position={[x,y,z]}>
  <Box p={[0,1.15,0]} s={[1.6,2.3,.22]} c={trim}/><Box p={[0,1.1,.14]} s={[1.3,2.2,.12]} c={timber}/>
  <Box p={[0,1.1,.22]} s={[.045,2.15,.05]} c={trim}/><Ball p={[.44,1.1,.23]} s={[.07,.07,.07]} c="#dcb764"/>
  {arched&&<mesh position={[0,2.2,.08]}><torusGeometry args={[.73,.14,6,20,Math.PI]}/><meshStandardMaterial color={trim}/></mesh>}
 </group>;
}
function Steps({w=2.2,z,x=0}:{w?:number;z:number;x?:number}) {
 return <group>{[0,1,2].map(i=><Box key={i} p={[x,.09+i*.08,z-i*.26]} s={[w,.18+i*.16,.65]} c="#c6bea9"/>)}</group>;
}
function Chimney({x,y,z}:{x:number;y:number;z:number}) {
 return <group><Box p={[x,y,z]} s={[.65,1.6,.75]} c="#b1a08c"/><Box p={[x,y+.85,z]} s={[.85,.18,.95]} c={trim}/></group>;
}
function Shell({w,d,h,p=[0,0,0],palette,roof=true}:{w:number;d:number;h:number;p?:[number,number,number];palette:Palette;roof?:boolean}) {
 const beam=palette.style==="castle"?timber:trim;
 return <group position={p}>
  <Box p={[0,h/2+.25,0]} s={[w,h,d]} c={palette.wall}/>
  <Box p={[0,.38,0]} s={[w+.16,.22,d+.16]} c={trim}/>
  <Box p={[0,h+.22,0]} s={[w+.2,.16,d+.2]} c={beam}/>
  {[-1,1].map(side=><Box key={side} p={[side*(w/2-.1),h/2+.25,d/2+.06]} s={[.2,h,.17]} c={beam}/>)}
  {palette.style==="castle"&&h>4&&<group>
   <Box p={[0,3,d/2+.1]} s={[w,.18,.18]} c={timber}/>
   {[-1,1].map(side=><Pole key={side} a={[side*(w/2-.2),3.2,d/2+.1]} b={[side*(w/2-1),h-.1,d/2+.1]} radius={.09} c={timber}/>)}
  </group>}
  {palette.style!=="castle"&&Array.from({length:Math.floor(h/.45)},(_,i)=><Box key={i} p={[0,.7+i*.45,d/2+.015]} s={[w,.025,.025]} c={trim}/>)}
  {roof&&<Roof w={w+.25} d={d} y={h+.4} style={palette.style}/>}
 </group>;
}
function SideWindows({x,z=0,ys=[1.8],positions=[-1.4,1.4]}:{x:number;z?:number;ys?:number[];positions?:number[]}) {
 return <group position={[x,0,z]} rotation={[0,x>0?Math.PI/2:-Math.PI/2,0]}>{ys.map(y=><group key={y}>{positions.map(offset=><Window key={offset} x={offset} y={y} z={.08}/>)}</group>)}</group>;
}
function ArchWindow({x,y,z}:{x:number;y:number;z:number}) {
 return <group position={[x,y,z]}>
  <Box p={[0,0,0]} s={[1.4,2,.15]} c={trim}/><Box p={[0,0,.1]} s={[1.12,1.9,.06]} c={glass}/>
  <mesh position={[0,1,.02]}><circleGeometry args={[.7,20,0,Math.PI]}/><meshStandardMaterial color={trim}/></mesh>
  <mesh position={[0,1,.1]}><circleGeometry args={[.56,20,0,Math.PI]}/><meshStandardMaterial color={glass}/></mesh>
  <Box p={[0,.2,.15]} s={[.07,2.5,.05]} c={trim}/><Box p={[0,.15,.15]} s={[1.1,.07,.05]} c={trim}/>
 </group>;
}
function Awning({w,z,y=2.9,x=0}:{w:number;z:number;y?:number;x?:number}) {
 return <group>{Array.from({length:10},(_,i)=><Box key={i} p={[x+(i-4.5)*w/10,y,z]} s={[w/10,.14,1.45]} r={[.17,0,0]} c={i%2?trim:"#447d6b"}/>)}</group>;
}
function Table({x,z}:{x:number;z:number}) {
 return <group position={[x,0,z]}>
  <mesh position={[0,.95,0]} castShadow><cylinderGeometry args={[.55,.55,.13,16]}/><meshStandardMaterial color={timber}/></mesh>
  <Pole a={[0,.2,0]} b={[0,.95,0]} radius={.09}/>
  {[-1,1].map(side=><group key={side}><Box p={[side*.8,.58,0]} s={[.5,.12,.5]} c={timber}/><Box p={[side*1.02,.95,0]} s={[.1,.7,.5]} c={timber}/>{[-1,1].map(leg=><Pole key={leg} a={[side*.8,.1,leg*.18]} b={[side*.8,.58,leg*.18]} radius={.04}/>)}</group>)}
 </group>;
}
function HipRoof({w,d,y,rise=1.4,c="#485d6c"}:{w:number;d:number;y:number;rise?:number;c?:string}) {
 return <mesh position={[0,y+rise/2,0]} scale={[w/Math.SQRT2,1,d/Math.SQRT2]} rotation={[0,Math.PI/4,0]} castShadow><coneGeometry args={[1,rise,4]}/><meshStandardMaterial color={c}/></mesh>;
}
/** Shared architectural details, with a separate massing/layout for every design. */
export function VillageBuilding({assetKey,style:rawStyle,tint}:{assetKey:string;style?:VillageStyle;tint?:string}) {
 const spec=VILLAGE_BUILDINGS.find(item=>item.key===assetKey);if(!spec)return null;
 const style=spec.kind==="apartments"?"coastal":villageStyle(rawStyle),palette={style,wall:tint??(style==="castle"?"#dbc8a4":style==="country"?"#91a284":"#91b8cb")};
 const foundation=(w:number,d:number,z=0)=><Box p={[0,.12,z]} s={[w,.24,d]} c="#b9b3a0"/>;
 if(assetKey==="village_cottage")return <group>
  {foundation(8,7,.5)}<Shell w={6.4} d={4.7} h={2.7} palette={palette}/>
  <Door x={-1} z={2.5} arched={style==="castle"}/><Window x={1.45} y={1.7} z={2.45} wide={1.35}/>
  <SideWindows x={3.22} positions={[0]}/><Chimney x={-2.2} y={4} z={-.8}/>
  <group position={[-1,0,3]}><Roof w={2.7} d={1.5} y={2.55} style={style}/>{[-1,1].map(side=><Pole key={side} a={[side*1.15,.25,.65]} b={[side*1.15,2.6,.65]} radius={.09} c={trim}/>)}</group>
  <Steps x={-1} z={3.8}/>
 </group>;
 if(assetKey==="village_family_house")return <group>
  {foundation(9.4,9,.5)}<Shell w={7.6} d={5.9} h={5.6} palette={palette}/>
  <Door x={-1.9} z={3.08} arched={style==="castle"}/>
  {[1.6,4.55].map(y=><group key={y}>{[-2.1,.2,2.4].map(x=>y<2&&x<0?null:<Window key={x} x={x} y={y} z={3.08}/>)}</group>)}
  <SideWindows x={3.82} ys={[1.7,4.55]}/><Chimney x={2.6} y={7} z={-1.5}/>
  <Balcony w={6.5} y={3} z={3.6}/>
  <Box p={[0,2.96,3.7]} s={[8.3,.18,1.6]} c={style==="country"?"#ab6044":"#485d6c"}/>
  {[-3.5,0,3.5].map(x=><Pole key={x} a={[x,.25,4.2]} b={[x,3,4.2]} radius={.1} c={trim}/>)}
  <Steps x={-1.9} z={4.7}/>
 </group>;
 if(assetKey==="village_townhouse")return <group>
  {foundation(5.7,8.4,.3)}<Shell w={4.3} d={5.8} h={6.2} palette={palette}/>
  <Door x={-1.1} z={3.04} arched={style==="castle"}/><Steps x={-1.1} w={1.8} z={3.85}/>
  {/* A projecting, three-sided bay makes the narrow frontage recognisable. */}
  <Box p={[.85,1.65,3.2]} s={[1.65,2.55,.8]} c={palette.wall}/><Window x={.85} y={1.7} z={3.66} wide={1.2}/>
  {[-1,1].map(side=><group key={side} position={[.85+side*.8,0,3.28]} rotation={[0,side*Math.PI/2,0]}><Window x={0} y={1.7} z={.04} wide={.45}/></group>)}
  <Box p={[.85,3.08,3.25]} s={[1.9,.18,1]} c={trim}/>
  {[-1.1,1.1].map(x=><Window key={x} x={x} y={4.9} z={3.04}/>)}<SideWindows x={2.17} ys={[1.7,4.9]}/>
  <group position={[0,6.6,3.04]}><mesh><circleGeometry args={[.42,20]}/><meshStandardMaterial color={glass}/></mesh><mesh><torusGeometry args={[.43,.09,6,20]}/><meshStandardMaterial color={trim}/></mesh></group>
  <Chimney x={1.35} y={7.4} z={-1.7}/>
 </group>;
 if(spec.kind==="manor")return <group>
  {foundation(15.6,11,.5)}<Shell w={6.4} d={6.2} h={6.4} p={[0,0,-1.1]} palette={palette}/>
  {[-1,1].map(side=><group key={side} position={[side*4.7,0,.3]}>
   <Shell w={3.4} d={7} h={5.7} palette={palette}/>
   {[1.8,4.6].map(y=><Window key={y} x={0} y={y} z={3.62} wide={1.45}/>)}
   <SideWindows x={side*1.72} ys={[1.8,4.6]} positions={[-2,0,2]}/>
   <Chimney x={side*.85} y={7} z={-1.8}/>
  </group>)}
  <Door z={2.15} arched/><Window x={0} y={5.25} z={2.15} wide={1.6}/>
  {[-1,1].map(side=><Pole key={side} a={[side*1.7,.25,3.2]} b={[side*1.7,4,3.2]} radius={.22} c={trim}/>)}
  <group position={[0,0,2.8]}><Roof w={4.3} d={1.7} y={4} style={style}/></group><Steps w={4.5} z={4.5}/>
 </group>;
 if(spec.kind==="shop")return <group>
  {foundation(10,8,.8)}<Shell w={8.6} d={4.8} h={3.15} palette={palette} roof={false}/>
  <group position={[0,0,-.3]}><Roof w={8.8} d={4.3} y={3.25} style={style}/></group>
  {/* Broad false-front sign and covered trading veranda, not a house facade. */}
  <Box p={[0,4.05,2.53]} s={[8.8,1.55,.3]} c={palette.wall}/><Box p={[0,4.9,2.53]} s={[9.1,.2,.5]} c={trim}/>
  <Box p={[0,3.92,2.75]} s={[4.5,.65,.1]} c={timber}/>
  <Door z={2.58}/>{[-1,1].map(side=><Window key={side} x={side*2.6} y={1.75} z={2.57} wide={2.55}/>)}
  <Awning w={9.2} z={3.15}/>{[-4.25,4.25].map(x=><Pole key={x} a={[x,.25,3.9]} b={[x,2.8,3.9]} radius={.1} c={trim}/>)}
  {[-1,1].map(side=><group key={side}><Box p={[side*2.9,.65,3.7]} s={[1.8,.8,.85]} c={timber}/>{[0,1,2,3,4].map(i=><Ball key={i} p={[side*2.9+(i-2)*.3,1.14,3.7]} s={[.17,.17,.17]} c={i%2?"#dfb352":"#cb594a"}/>)}</group>)}
  <Steps z={4.45}/><SideWindows x={4.32} positions={[0]}/>
 </group>;
 if(spec.kind==="cafe")return <group>
  {foundation(10.6,10,1)}<Shell w={6} d={5.2} h={5.2} p={[-1.5,0,-.8]} palette={palette} roof={false}/>
  <group position={[-1.5,0,-.8]}><HipRoof w={6.5} d={5.7} y={5.45} c={style==="country"?"#ab6044":"#485d6c"}/></group>
  {/* Round corner shopfront with its own roof and an open terrace. */}
  <mesh position={[1.7,1.8,1.2]} castShadow><cylinderGeometry args={[1.8,1.8,3.2,12]}/><meshStandardMaterial color={palette.wall}/></mesh>
  <mesh position={[1.7,3.8,1.2]} castShadow><coneGeometry args={[2.05,1,12]}/><meshStandardMaterial color={style==="country"?"#ab6044":"#485d6c"}/></mesh>
  <group position={[2.82,0,2.38]} rotation={[0,Math.PI/4,0]}><Door z={0}/><Steps z={.9} w={1.8}/></group>
  {[-3.5,-1].map(x=><group key={x}><Window x={x} y={1.65} z={1.91} wide={1.7}/><Window x={x} y={4.15} z={1.91}/></group>)}
  <Awning x={-2.25} w={4.8} z={2.5}/><Table x={-3.35} z={4}/><Table x={-.8} z={4.2}/>
  <group position={[-2.3,3.3,2.1]}><Box p={[0,0,0]} s={[.65,.42,.2]} c={trim}/><mesh position={[.4,0,0]}><torusGeometry args={[.16,.055,6,12]}/><meshStandardMaterial color={trim}/></mesh><Box p={[0,-.26,0]} s={[.95,.07,.3]} c={trim}/></group>
  <SideWindows x={-4.52} z={-.8} ys={[1.7,4.15]}/><SideWindows x={1.52} z={-.8} ys={[4.15]}/>
 </group>;
 if(spec.kind==="library")return <group>
  {foundation(12.4,10,.4)}<Shell w={7.4} d={7} h={4.5} p={[-1,0,0]} palette={palette}/>
  {[-3.4,1.4].map(x=><ArchWindow key={x} x={x} y={2.2} z={3.62}/>)}
  <Door x={-1} z={3.65} arched/><Steps x={-1} w={3.2} z={4.65}/>
  {/* Octagonal reading room and tall arched glazing. */}
  <mesh position={[3.6,2.65,-.6]} castShadow><cylinderGeometry args={[1.8,1.8,4.8,8]}/><meshStandardMaterial color={palette.wall}/></mesh>
  <mesh position={[3.6,5.9,-.6]} rotation={[0,Math.PI/8,0]} castShadow><coneGeometry args={[2.1,1.7,8]}/><meshStandardMaterial color="#485d6c"/></mesh>
  <ArchWindow x={3.6} y={2.15} z={1.12}/><group position={[5.3,0,-.6]} rotation={[0,Math.PI/2,0]}><ArchWindow x={0} y={2.15} z={0}/></group>
  <group position={[-1,4.6,3.64]}>{[-1,1].map(side=><Box key={side} p={[side*.36,0,.03]} s={[.7,.85,.18]} r={[0,0,side*.14]} c="#e5bb67"/>)}</group>
 </group>;
 if(spec.kind==="hall")return <group>
  {foundation(14,10,.5)}
  {[-1,1].map(side=><group key={side} position={[side*4.1,0,-.5]}><Shell w={4.5} d={6.5} h={4.2} palette={palette}/>{[-1,1].map(x=><ArchWindow key={x} x={x*1.05} y={2.1} z={3.38}/>)}</group>)}
  <Shell w={3.6} d={5.8} h={7.3} p={[0,0,.4]} palette={palette} roof={false}/>
  <SideWindows x={6.37} z={-.5} ys={[2.2]} positions={[-1.8,1.8]}/>
  <Door z={3.44} arched/><Steps w={4} z={4.55}/>
  <mesh position={[0,5.5,3.4]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.86,.86,.15,24]}/><meshStandardMaterial color={trim}/></mesh>
  <Pole a={[0,5.5,3.5]} b={[0,6.1,3.5]} radius={.045} c={timber}/><Pole a={[0,5.5,3.5]} b={[.42,5.3,3.5]} radius={.045} c={timber}/>
  {[-1,1].map(x=>[-1,1].map(z=><Pole key={x+":"+z} a={[x*1.25,7.55,.4+z*1.7]} b={[x*1.25,9.25,.4+z*1.7]} radius={.15} c={trim}/>))}
  <mesh position={[0,8.3,.4]}><cylinderGeometry args={[.32,.6,.8,16]}/><meshStandardMaterial color="#c7a24d"/></mesh>
  <group position={[0,0,.4]}><HipRoof w={3.7} d={4.6} y={9.2} rise={1.2} c="#507d73"/></group>
 </group>;
 // City silhouette: broad podium, tall residential shaft and stepped penthouse.
 return <group>
  {foundation(11.8,11.6,.4)}<Shell w={10} d={8.8} h={3.2} palette={palette} roof={false}/>
  <Shell w={7.8} d={7} h={25.2} p={[0,3.2,-.5]} palette={palette} roof={false}/>
  <Door z={4.56}/><Box p={[0,3,5]} s={[3.8,.2,1.5]} c={glass}/>
  {[-3.2,3.2].map(x=><Window key={x} x={x} y={1.8} z={4.54} wide={2.2}/>)}
  {Array.from({length:9},(_,floor)=><group key={floor}>
   {[-2.5,0,2.5].map(x=><Window key={x} x={x} y={4.9+floor*2.8} z={3.1}/>)}
   <SideWindows x={3.92} z={-.5} ys={[4.9+floor*2.8]} positions={[-2,0,2]}/>
   <Balcony w={5.6} y={3.55+floor*2.8} z={3.6}/>
  </group>)}
  <Shell w={5.6} d={5} h={1.7} p={[0,28.5,-.8]} palette={palette} roof={false}/>
  <Box p={[0,30.5,-.8]} s={[6,.3,5.4]} c={glass}/><Pole a={[1.7,30.7,-.8]} b={[1.7,32.6,-.8]} radius={.07} c={trim}/>
 </group>;
}
