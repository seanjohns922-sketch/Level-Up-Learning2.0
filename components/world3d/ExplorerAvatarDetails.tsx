"use client";
import type { AvatarOutfit } from "@/components/avatar/StudentAvatar";
function Ball({p,s,c}:{p:[number,number,number];s:[number,number,number];c:string}){return <mesh position={p} scale={s} castShadow><sphereGeometry args={[1,20,14]}/><meshStandardMaterial color={c} roughness={.72}/></mesh>;}
export function ExplorerAvatarHead({o}:{o:Required<AvatarOutfit>}){
 const style=o.hairStyle,curly=["curls","afro","curlyPony"].includes(style),long=["long","bob","locs","braids","twists"].includes(style);
 return <group>
  <Ball p={[0,1.12,0]} s={[.32,.36,.29]} c={o.skin}/>{[-1,1].map(side=><Ball key={side} p={[side*.32,1.1,0]} s={[.055,.09,.055]} c={o.skin}/>)}
  {style!=="bald"&&<group><mesh position={[0,1.14,-.025]} castShadow><sphereGeometry args={[.335,24,16,0,Math.PI*2,0,style==="buzz"?1.1:1.62]}/><meshStandardMaterial color={o.hair} roughness={.86}/></mesh>
  {curly?Array.from({length:13},(_,i)=>{const a=i*2.39996;return <Ball key={i} p={[Math.sin(a)*.25,1.4+(i%3)*.055,Math.cos(a)*.22]} s={[.12,.115,.12]} c={i%3?o.hair:o.hairShade}/>;}):!["buzz","waves"].includes(style)&&[-1,0,1].map(i=><Ball key={i} p={[i*.13,1.39+Math.abs(i)*.02,.2]} s={[.14,style==="spiky"?.16:.08,.095]} c={o.hair}/>)}
  {long&&[-1,1].map(side=><group key={side}>{Array.from({length:style==="locs"||style==="twists"?4:1},(_,i)=><Ball key={i} p={[side*(.27+i*.015),style==="bob"?1.05:.98,-.08+i*.06]} s={[.08,style==="bob"?.2:.32,.09]} c={i%2?o.hairShade:o.hair}/>)}</group>)}
  {["ponytail","curlyPony","braids"].includes(style)&&<Ball p={[0,1.12,-.33]} s={[.13,.35,.13]} c={o.hair}/>}
  {style==="bun"&&<Ball p={[0,1.57,-.1]} s={[.16,.16,.16]} c={o.hair}/>}
  {["spaceBuns","pigtails"].includes(style)&&[-1,1].map(side=><Ball key={side} p={[side*.3,style==="spaceBuns"?1.46:1.05,-.08]} s={[.13,style==="spaceBuns"?.13:.25,.14]} c={o.hair}/>)}
  </group>}
  {[-1,1].map(side=><group key={side}><Ball p={[side*.115,1.16,.268]} s={[.048,.063,.02]} c="#fffaf3"/>{o.face==="wink"&&side===1?<mesh position={[side*.115,1.16,.292]}><boxGeometry args={[.08,.014,.008]}/><meshStandardMaterial color={o.hairShade}/></mesh>:<group><Ball p={[side*.115,1.156,.288]} s={[.029,.042,.01]} c="#51422d"/><Ball p={[side*.115,1.156,.298]} s={[.015,.028,.005]} c="#15202c"/><Ball p={[side*.115+.01,1.175,.302]} s={[.008,.009,.004]} c="#ffffff"/></group>}<mesh position={[side*.11,1.25,.27]} rotation={[0,0,side*(o.face==="determined"?.2:-.08)]}><boxGeometry args={[.09,.013,.01]}/><meshStandardMaterial color={o.hairShade}/></mesh></group>)}
  <Ball p={[0,1.075,.291]} s={[.035,.044,.035]} c={o.skin}/><mesh position={[0,1.005,.272]} rotation={[0,0,Math.PI]}><torusGeometry args={[.065,.008,6,16,Math.PI]}/><meshStandardMaterial color={o.skinShade}/></mesh>
  {o.face==="freckles"&&[-1,1].flatMap(side=>[0,1,2].map(i=><Ball key={`${side}:${i}`} p={[side*(.17+i*.025),1.08+(i%2)*.02,.257]} s={[.006,.006,.004]} c={o.skinShade}/>))}
 </group>;
}
export function ExplorerCharacterGear({held}:{held:string}){
 if(held==="meazurex_timewielder_staff")return <group><mesh position={[0,.43,0]}><cylinderGeometry args={[.018,.018,1.45,12]}/><meshStandardMaterial color="#c99d44" metalness={.7} roughness={.3}/></mesh>{[.13,.22,.3].map(r=><mesh key={r} position={[0,1.12,0]}><torusGeometry args={[r,.012,8,48]}/><meshStandardMaterial color="#e5bb56" metalness={.6}/></mesh>)}<Ball p={[0,1.12,0]} s={[.08,.08,.04]} c="#a06cf0"/>{Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return <mesh key={i} position={[Math.cos(a)*.24,1.12+Math.sin(a)*.24,0]} rotation={[0,0,a]}><boxGeometry args={[.1,.012,.018]}/><meshStandardMaterial color="#e5bb56"/></mesh>;})}{[-1,1].map(side=><group key={side}><mesh position={[side*.24,.78,0]}><cylinderGeometry args={[.006,.006,.3,6]}/><meshStandardMaterial color="#e5bb56"/></mesh><mesh position={[side*.24,.6,0]}><octahedronGeometry args={[.06]}/><meshStandardMaterial color="#9459dc"/></mesh></group>)}</group>;
 if(held==="numbot_equationator_calculator")return <group><mesh position={[0,.15,0]}><boxGeometry args={[.32,.47,.065]}/><meshStandardMaterial color="#234251"/></mesh><mesh position={[0,.29,.036]}><boxGeometry args={[.25,.1,.015]}/><meshStandardMaterial color="#5fb098"/></mesh>{Array.from({length:12},(_,i)=><mesh key={i} position={[(i%3-1)*.08,.19-Math.floor(i/3)*.065,.04]}><boxGeometry args={[.054,.045,.02]}/><meshStandardMaterial color="#bcc9cb"/></mesh>)}</group>;
 if(held==="geospin_starweaver_orb")return <group position={[0,.28,0]}><Ball p={[0,0,0]} s={[.17,.17,.17]} c="#975cec"/>{[0,1,2].map(i=><mesh key={i} rotation={[i*.8,i*.5,0]}><torusGeometry args={[.25,.009,6,40]}/><meshStandardMaterial color="#eed599"/></mesh>)}</group>;
 return null;
}
