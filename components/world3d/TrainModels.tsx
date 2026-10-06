"use client";
import { trainDesign } from '@/lib/world3d/train-catalogue';
import { Box, Ball, Pole } from './DetailedScenery';
const dark='#253640',glass='#9bdde9',brass='#dcb968';
function Drum({p,r,h,c,axis='y'}:{p:[number,number,number];r:number;h:number;c:string;axis?:'x'|'y'|'z'}){return <mesh position={p} rotation={axis==='x'?[0,0,Math.PI/2]:axis==='z'?[Math.PI/2,0,0]:[0,0,0]} castShadow><cylinderGeometry args={[r,r,h,20]}/><meshStandardMaterial color={c} roughness={.4} metalness={.3}/></mesh>;}
function Wheels(){return <group>{[-1,1].flatMap(side=>[-.48,.43].map(z=><group key={`${side}:${z}`}><Drum p={[side*.3,.18,z]} r={.18} h={.095} c={dark} axis="x"/><Drum p={[side*.355,.18,z]} r={.075} h={.012} c={brass} axis="x"/>{[0,1,2].map(i=><Box key={i} p={[side*.365,.18,z]} s={[.014,.27,.023]} r={[i*Math.PI/3,0,0]} c="#7c8b91"/>)}</group>))}<Box p={[0,.28,0]} s={[.64,.12,1.42]} c={dark}/>{[-.78,.78].map(z=><Box key={z} p={[0,.25,z]} s={[.14,.075,.22]} c="#647681"/>)}</group>;}
function Windows({z=0,count=3}:{z?:number;count?:number}){return <group>{[-1,1].flatMap(side=>Array.from({length:count},(_,i)=><group key={`${side}:${i}`}><Box p={[side*.345,.74,z+(i-(count-1)/2)*.29]} s={[.024,.28,.23]} c={brass}/><Box p={[side*.36,.75,z+(i-(count-1)/2)*.29]} s={[.012,.22,.18]} c={glass}/></group>))}</group>;}
function Lamp({p,c='#ffe7a6'}:{p:[number,number,number];c?:string}){return <group position={p}><Drum p={[0,0,0]} r={.105} h={.09} c={brass} axis="z"/><Ball p={[0,0,.055]} s={[.075,.075,.025]} c={c}/></group>;}
function Crystal({p,c,h=.45}:{p:[number,number,number];c:string;h?:number}){return <mesh position={p} castShadow><octahedronGeometry args={[h,0]}/><meshStandardMaterial color={c} metalness={.35} roughness={.23}/></mesh>;}
/** Each unit faces +Z. Carriages share the same rail gauge and independent route positions. */
export function TrainUnit({asset,car=0}:{asset:string;car?:number}){
 const design=trainDesign(asset);const style=design?.style??'steam',colour=design?.colour??'#347367',trim=design?.trim??brass;
 const carriage=car>0;
 return <group><Wheels/>
  {carriage? <group>
   {style==='freight'?<group><Box p={[0,.46,0]} s={[.72,.28,1.25]} c={car===1?'#895d3d':'#52717c'}/>{car===1?[-.21,0,.21].map(x=><Drum key={x} p={[x,.68,0]} r={.13} h={1.1} c="#b58b53" axis="z"/>):<group><Box p={[0,.75,0]} s={[.65,.55,1.15]} c="#617e87"/>{[-.46,-.23,0,.23,.46].map(z=><Box key={z} p={[0,.75,z]} s={[.68,.56,.024]} c={trim}/>)}</group>}</group>:
   <group><Box p={[0,.61,0]} s={[.68,.58,1.3]} c={colour}/><Windows/><Box p={[0,.98,0]} s={[.77,.12,1.4]} c={trim}/>{style==='space'?<Ball p={[0,1.11,0]} s={[.28,.23,.36]} c={glass}/>:style==='pattern'?[-.4,0,.4].map(z=><Crystal key={z} p={[0,1.17,z]} h={.22} c={trim}/>):style==='number'?<Box p={[0,1.18,0]} s={[.4,.4,.4]} r={[0,.6,0]} c={trim}/>:style==='measurement'?<group>{[-.4,0,.4].map(z=><Pole key={z} a={[-.3,1.08,z]} b={[.3,1.08,z]} radius={.028} c={brass}/>)}</group>:style==='statistics'?<group>{[.2,.35,.5].map((h,i)=><Box key={h} p={[(i-1)*.2,1+h/2,0]} s={[.12,h,.25]} c={trim}/>)}</group>:style==='chance'?<group><Box p={[0,1.23,0]} s={[.4,.4,.4]} r={[0,.25,0]} c="#f8e9cd"/>{[-.1,.1].map(x=><Ball key={x} p={[x,1.24,.21]} s={[.035,.035,.018]} c={colour}/>)}</group>:null}</group>}
  </group>:<group>
   {['steam','measurement','chance'].includes(style)?<group>
    <Drum p={[0,.59,.19]} r={.27} h={.86} c={colour} axis="z"/>{[-.12,.25,.52].map(z=><Drum key={z} p={[0,.59,z]} r={.279} h={.045} c={trim} axis="z"/>)}
    <Box p={[0,.66,-.45]} s={[.69,.65,.48]} c={colour}/><Windows z={-.45} count={1}/><Box p={[0,1.03,-.45]} s={[.82,.095,.66]} c={trim}/>
    <Drum p={[0,1,.4]} r={.095} h={.39} c={dark}/><Drum p={[0,1.21,.4]} r={.14} h={.08} c={trim}/><Drum p={[0,.91,.02]} r={.11} h={.16} c={trim}/>
    {[-1,1].map(side=><Pole key={side} a={[side*.38,.24,-.48]} b={[side*.38,.24,.43]} radius={.025} c={trim}/>)}
    {style==='measurement'?<group>{[-1,1].map(side=><group key={side}><Drum p={[side*.29,.6,.05]} r={.2} h={.04} c={brass} axis="x"/>{[0,1,2,3].map(i=><Box key={i} p={[side*.32,.6,.05]} s={[.025,.33,.045]} r={[i*Math.PI/4,0,0]} c="#694629"/>)}</group>)}</group>:style==='chance'?<group><Ball p={[0,1.07,-.45]} s={[.39,.23,.3]} c={colour}/>{[-.3,.3].map(x=><Lamp key={x} p={[x,.76,.57]} c={trim}/>)}</group>:null}
   </group>:style==='express'||style==='space'?<group>
    <Box p={[0,.59,-.14]} s={[.68,.48,1.08]} c={colour}/><Ball p={[0,.58,.39]} s={[.34,.25,.45]} c={colour}/><Ball p={[0,.8,.05]} s={[.28,.12,.37]} c={glass}/><Box p={[0,.46,0]} s={[.7,.08,1.22]} c={trim}/>
    {style==='space'?<group>{[-1,1].map(side=><group key={side}><Box p={[side*.38,.62,-.43]} s={[.08,.42,.48]} r={[0,0,-side*.5]} c={trim}/><Drum p={[side*.22,.64,-.69]} r={.12} h={.22} c={trim} axis="z"/></group>)}<Crystal p={[0,.98,-.35]} h={.2} c={trim}/></group>:<group><Pole a={[0,.89,-.5]} b={[0,1.17,-.18]} radius={.025} c={dark}/><Pole a={[0,1.17,-.18]} b={[0,.94,.1]} radius={.025} c={dark}/><Box p={[0,1.18,-.18]} s={[.48,.025,.09]} c={dark}/></group>}
   </group>:<group>
    <Box p={[0,.55,.22]} s={[.65,.43,.81]} c={colour}/><Box p={[0,.7,-.39]} s={[.69,.72,.58]} c={colour}/><Box p={[0,1.08,-.39]} s={[.79,.09,.68]} c={trim}/><Windows z={-.4} count={1}/><Box p={[0,.86,-.075]} s={[.49,.24,.022]} c={glass}/>
    {style==='freight'?<group>{[-.15,0,.15,.3,.45].map(z=><Box key={z} p={[0,.67,z]} s={[.68,.025,.05]} c={trim}/>)}<Pole a={[-.39,.4,-.6]} b={[-.39,.4,.62]} radius={.025} c={trim}/></group>:style==='number'?<group><Box p={[0,.94,.24]} s={[.37,.37,.37]} r={[0,.65,0]} c={trim}/>{[-1,1].map(side=><Box key={side} p={[side*.332,.57,.2]} s={[.015,.055,.65]} c={trim}/>)}</group>:style==='pattern'?<group>{[-.12,.2,.48].map((z,i)=><Crystal key={z} p={[0,.92+(i%2)*.1,z]} h={.2} c={i%2?colour:trim}/>)}</group>:style==='statistics'?<group><Pole a={[0,.8,.2]} b={[0,1.15,.2]} radius={.025} c={trim}/><mesh position={[0,1.18,.2]} rotation={[.4,0,0]}><sphereGeometry args={[.25,16,8,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color={trim}/></mesh></group>:<Box p={[0,.5,.2]} s={[.68,.12,.8]} c={trim}/>}
   </group>}
   <Lamp p={[0,.53,.73]}/><Box p={[0,.29,.74]} s={[.77,.12,.1]} c={trim}/>
  </group>}
 </group>;
}
