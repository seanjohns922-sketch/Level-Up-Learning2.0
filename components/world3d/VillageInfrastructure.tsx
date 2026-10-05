"use client";
import { Box, Ball, Pole } from "./DetailedScenery";
const stone = "#b8ad97", edge = "#887f6e", iron = "#394d45";
function Paving({ size = 2 }: { size?: number }) {
 return <group><Box p={[0,.025,0]} s={[size,.05,size]} c={edge}/>{Array.from({length:16},(_,i)=><Box key={i} p={[(i%4-1.5)*size/4,.055,(Math.floor(i/4)-1.5)*size/4]} s={[size/4-.014,.05,size/4-.014]} c={i%3===0?"#c5bba6":stone}/>)}</group>;
}
function Lantern({x,tint}:{x:number;tint?:string}) {
 return <group position={[x,2.5,0]}><Box p={[0,0,0]} s={[.3,.4,.3]} c={tint??"#efd794"}/>{[-1,1].flatMap(a=>[-1,1].map(b=><Box key={`${a}:${b}`} p={[a*.16,0,b*.16]} s={[.028,.44,.028]} c={iron}/>))}<Box p={[0,-.23,0]} s={[.4,.06,.4]} c={iron}/><mesh position={[0,.28,0]} rotation={[0,Math.PI/4,0]} castShadow><coneGeometry args={[.3,.18,4]}/><meshStandardMaterial color={iron}/></mesh></group>;
}
export function VillageInfrastructure({assetKey,tint}:{assetKey:string;tint?:string}) {
 if(assetKey==="village_plaza")return <group><Paving/>{[-1,1].flatMap(side=>[0,1].map(axis=><Box key={`${side}:${axis}`} p={axis?[0,.071,side*.88]:[side*.88,.071,0]} s={axis?[1.8,.018,.035]:[.035,.018,1.8]} c={tint??"#718578"}/>))}</group>;
 if(assetKey.startsWith("canal_")) {
  // Every connection has the same water level, width and bank position.
  const ends=assetKey==="canal_straight"?[0,2]:assetKey==="canal_corner"?[0,1]:[0,1,2];
  return <group><Box p={[0,.025,0]} s={[2,.05,2]} c={edge}/><Box p={[0,.095,0]} s={[1.96,.07,1.96]} c={tint??"#609f9d"}/>{[0,1,2,3].map(side=><group key={side} rotation={[0,side*Math.PI/2,0]}>{ends.includes(side)?[-1,1].map(x=><Box key={x} p={[x*.85,.15,.65]} s={[.3,.14,.7]} c={stone}/>):<Box p={[0,.15,.85]} s={[2,.14,.3]} c={stone}/>}</group>)}{[-1,1].map(z=><Box key={z} p={[z*.16,.134,z*.25]} s={[.38,.006,.018]} c="#b9dbd0"/>)}</group>;
 }
 if(assetKey==="village_footbridge")return <group>{Array.from({length:12},(_,i)=>{const x=(i-5.5)/3,y=.12+Math.sin(i/11*Math.PI)*.28;return <group key={i}><Box p={[x,y,0]} s={[1/3,.16,1.65]} c={i%2?stone:"#c4bba5"}/>{[-1,1].map(z=><group key={z}><Box p={[x,y+.45,z*.88]} s={[1/3,.15,.15]} c={tint??edge}/>{i%2===0&&<Box p={[x,y+.22,z*.88]} s={[.12,.4,.15]} c={stone}/>}</group>)}</group>;})}{[-1,1].flatMap(x=>[-1,1].map(z=><Box key={`${x}:${z}`} p={[x*1.88,.4,z*.88]} s={[.24,.8,.24]} c={stone}/>))}</group>;
 if(assetKey==="garden_gate")return <group>{[-1,1].map(x=><group key={x}><Box p={[x*.93,.52,0]} s={[.14,1.04,.16]} c={stone}/><Ball p={[x*.93,1.1,0]} s={[.1,.1,.1]} c={stone}/></group>)}{[.25,.8].map(y=><Box key={y} p={[0,y,0]} s={[1.74,.06,.06]} c={tint??iron}/>)}{Array.from({length:9},(_,i)=><Pole key={i} a={[(i-4)*.2,.12,0]} b={[(i-4)*.2,.9+.12*Math.cos((i-4)/4*Math.PI/2),0]} radius={.018} c={tint??iron}/>)}<Ball p={[.62,.6,.065]} s={[.045,.045,.035]} c="#bc9957"/></group>;
 if(assetKey==="corner_flower_bed")return <group>{[[0,-.7],[-.7,0]].map(([x,z],i)=><group key={i} position={[x,0,z]} rotation={[0,i*Math.PI/2,0]}><Box p={[0,.12,0]} s={[2,.24,.6]} c={stone}/><Box p={[0,.25,0]} s={[1.85,.035,.45]} c="#5e513a"/>{Array.from({length:6},(_,j)=><group key={j} position={[(j-2.5)*.3,0,0]}><Pole a={[0,.26,0]} b={[0,.49,0]} radius={.015} c="#63855b"/><Ball p={[0,.39,0]} s={[.12,.055,.1]} c="#78905e"/>{Array.from({length:5},(_,k)=><Ball key={k} p={[Math.cos(k*1.256)*.07,.53,Math.sin(k*1.256)*.07]} s={[.065,.035,.065]} c={tint??(j%2?"#bd889e":"#e1bf71")}/>)}<Ball p={[0,.56,0]} s={[.035,.025,.035]} c="#e4cf83"/></group>)}</group>)}</group>;
 if(assetKey==="double_street_lantern")return <group><Box p={[0,.12,0]} s={[.45,.24,.45]} c={stone}/><Pole a={[0,.2,0]} b={[0,2.85,0]} radius={.06} c={iron}/><Pole a={[-.58,2.83,0]} b={[.58,2.83,0]} radius={.045} c={iron}/><Ball p={[0,2.93,0]} s={[.07,.07,.07]} c="#b59a62"/><Lantern x={-.58} tint={tint}/><Lantern x={.58} tint={tint}/></group>;
 return null;
}
