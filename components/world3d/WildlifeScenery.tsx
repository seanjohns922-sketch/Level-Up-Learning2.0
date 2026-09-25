"use client";
import { Ball, Pole, Box, Tree, Animal, Roof } from "./DetailedScenery";
import * as THREE from "three";
const fur="#8c7a61",cream="#c9bda2",dark="#343b32";
function Eyes({x=.12,y=.7,z=.4}:{x?:number;y?:number;z?:number}){return <group>{[-1,1].map(side=><group key={side}><Ball p={[side*x,y,z]} s={[.021,.025,.018]} c={dark}/><Ball p={[side*x,y+.009,z+.014]} s={[.006,.006,.005]} c="#eee3c8"/></group>)}</group>;}
function Bird({variant,tint}:{variant:string;tint?:string}){
 const emu=variant==="emu",cockatoo=variant==="cockatoo";
 const c=tint??(emu?"#746f5c":cockatoo?"#dedccd":"#988667");
 return <group>
 <Ball p={[0,emu?.85:.35,0]} s={emu?[.34,.46,.44]:[.16,.25,.2]} c={c}/>
 {emu?<group><Pole a={[0,1,0]} b={[0,1.63,.22]} radius={.065} c="#555e55"/><Ball p={[0,1.68,.25]} s={[.105,.13,.13]} c="#52615a"/><Eyes x={.081} y={1.72} z={.32}/></group>:<group><Ball p={[0,.62,.09]} s={[.17,.18,.18]} c={cockatoo?c:cream}/><Eyes x={.126} y={.65} z={.19}/>{!cockatoo&&[-1,1].map(side=><Ball key={side} p={[side*.137,.652,.07]} s={[.03,.043,.15]} c="#5f5341"/>)}</group>}
 <mesh position={[0,emu?1.65:.56,emu?.4:.3]} rotation={[Math.PI/2+(cockatoo?.5:0),0,0]}><coneGeometry args={[cockatoo?.065:.045,cockatoo?.13:emu?.19:.3,12]}/><meshStandardMaterial color={dark}/></mesh>
 {[-1,1].map(side=><group key={side}><Pole a={[side*(emu?.16:.06),emu?.7:.21,0]} b={[side*(emu?.16:.06),.05,.06]} radius={emu?.027:.013} c="#615f4e"/>{[-1,0,1].map(toe=><Pole key={toe} a={[side*(emu?.16:.06),.035,.045]} b={[side*(emu?.16:.06)+toe*(emu?.055:.025),.018,emu?.23:.13]} radius={emu?.011:.006} c="#625d4d"/>)}{Array.from({length:emu?14:7},(_,i)=><mesh key={i} position={[side*(emu?.27:.145),emu?.86+i*.008:.37-i*.014,-.05-i*.018]} rotation={[.25,side*.1,side*.13]} scale={[emu?.09:.043,emu?.27:.2,emu?.065:.032]} castShadow><sphereGeometry args={[1,10,8]}/><meshStandardMaterial color={i%2?c:emu?"#8b8169":cockatoo?"#cbcbb9":"#6d7566"} roughness={.98}/></mesh>)}</group>)}
 {!emu&&Array.from({length:5},(_,i)=><mesh key={i} position={[(i-2)*.035,.21,-.23]} rotation={[-.65,0,0]} scale={[.029,.19,.018]}><sphereGeometry args={[1,10,8]}/><meshStandardMaterial color={cockatoo?cream:"#7f7155"}/></mesh>)}
 {cockatoo&&Array.from({length:5},(_,i)=><Pole key={i} a={[0,.76,.08-i*.026]} b={[0,.93-i*.02,.13-i*.055]} radius={.016} c="#c9b65d"/>)}
 </group>;
}
export function NativeAnimal({variant,tint}:{variant:string;tint?:string}){
 if(["emu","cockatoo","kookaburra"].includes(variant))return <Bird variant={variant} tint={tint}/>;
 if(variant==="kangaroo")return <group><Ball p={[0,.84,0]} s={[.27,.48,.28]} c={tint??"#ab8660"}/><Ball p={[0,.84,.21]} s={[.19,.32,.07]} c={cream}/><Pole a={[0,1.02,.05]} b={[0,1.45,.2]} radius={.12} c={tint??"#ab8660"}/><Ball p={[0,1.53,.27]} s={[.13,.18,.22]} c={tint??"#ab8660"}/><Ball p={[0,1.46,.45]} s={[.08,.065,.09]} c="#6b6050"/><Eyes x={.1} y={1.57} z={.36}/>{[-1,1].map(side=><group key={side}><mesh position={[side*.12,1.83,.17]} rotation={[0,0,-side*.2]} scale={[.055,.23,.045]}><sphereGeometry args={[1,14,10]}/><meshStandardMaterial color={tint??"#947957"}/></mesh><Ball p={[side*.12,1.83,.207]} s={[.03,.16,.012]} c="#bea18a"/><Ball p={[side*.23,.43,-.08]} s={[.2,.32,.23]} c={tint??"#ab8660"}/><Pole a={[side*.24,.36,-.02]} b={[side*.23,.12,.17]} radius={.075} c={fur}/><Ball p={[side*.24,.07,.37]} s={[.085,.06,.28]} c={fur}/><Pole a={[side*.2,1.05,.18]} b={[side*.16,.78,.4]} radius={.045} c={tint??"#ab8660"}/></group>)}<Pole a={[0,.55,-.15]} b={[0,.17,-.73]} radius={.15} c={tint??"#ab8660"}/><Pole a={[0,.17,-.7]} b={[0,.055,-1.22]} radius={.07} c={tint??"#ab8660"}/></group>;
 if(variant==="koala")return <group><Ball p={[0,.36,0]} s={[.23,.32,.21]} c={tint??"#8c9288"}/><Ball p={[0,.4,.17]} s={[.16,.23,.08]} c="#bdbeb0"/><Ball p={[0,.72,.05]} s={[.26,.25,.22]} c={tint??"#959b91"}/>{[-1,1].map(side=><group key={side}><Ball p={[side*.245,.85,.025]} s={[.15,.17,.075]} c="#afb4a9"/><Ball p={[side*.245,.85,.09]} s={[.095,.11,.015]} c="#cecfc0"/><Pole a={[side*.2,.5,.08]} b={[side*.18,.35,.29]} radius={.07} c={tint??"#8c9288"}/><Ball p={[side*.15,.12,.1]} s={[.1,.13,.12]} c={tint??"#8c9288"}/></group>)}<Ball p={[0,.7,.255]} s={[.065,.095,.04]} c="#404a41"/><Eyes x={.12} y={.75} z={.24}/></group>;
 if(variant==="wombat")return <group><Ball p={[0,.35,0]} s={[.34,.31,.48]} c={tint??fur}/><Ball p={[0,.36,.42]} s={[.26,.25,.24]} c={tint??"#9a876b"}/><Ball p={[0,.31,.62]} s={[.13,.085,.07]} c="#514a3b"/><Eyes x={.17} y={.43} z={.58}/>{[-1,1].map(side=><group key={side}><Ball p={[side*.18,.59,.35]} s={[.07,.1,.05]} c={tint??fur}/>{[-.3,.28].map(z=><Ball key={z} p={[side*.24,.12,z]} s={[.105,.14,.15]} c={tint??fur}/>)}</group>)}</group>;
 if(variant==="echidna")return <group><Ball p={[0,.22,0]} s={[.25,.2,.32]} c={tint??"#635b45"}/><Pole a={[0,.17,.23]} b={[0,.1,.57]} radius={.04} c="#8b7c5e"/><Eyes x={.09} y={.2} z={.3}/>{Array.from({length:70},(_,i)=>{const a=i*2.39996,h=.2+((i*37)%67)/67*1.15;const p=new THREE.Vector3(Math.cos(a)*Math.sin(h)*.24,Math.cos(h)*.18+.19,Math.sin(a)*Math.sin(h)*.29);const direction=new THREE.Vector3(p.x,p.y-.17,p.z).normalize().multiplyScalar(.12);return <Pole key={i} a={[p.x,p.y,p.z]} b={[p.x+direction.x,p.y+direction.y,p.z+direction.z]} radius={.012} c={i%3?"#b4a37d":"#70634a"}/>;})}{[-1,1].flatMap(x=>[-1,1].map(z=><Ball key={`${x}-${z}`} p={[x*.18,.045,z*.18]} s={[.08,.04,.1]} c="#61543f"/>))}</group>;
 return <Animal variant={variant} tint={tint}/>;
}
export const WILDLIFE_KEYS=new Set(["kangaroo","koala","wombat","emu","kookaburra","echidna","cockatoo","rabbit","duck","platypus","blue_heeler","bilby"]);
export function WildlifeScenery({assetKey,tint}:{assetKey:string;tint?:string}){
 if(assetKey==="koala"||assetKey==="kookaburra")return <group><Tree variant="gum_tree"/><group position={assetKey==="koala"?[.1,.95,.16]:[.48,1.75,.05]} scale={assetKey==="koala"?.22:.16}><NativeAnimal variant={assetKey} tint={tint}/></group></group>;
 return <NativeAnimal variant={assetKey} tint={tint}/>;
}
export function AustralianHabitat({assetKey}:{assetKey:string}){
 if(assetKey==="wildlife_habitat")return <group>{[-1,1].map(side=><group key={side} position={[side*.85,0,side*.3]}><Tree variant="gum_tree"/><group position={[.04,1,.18]} scale={.18}><NativeAnimal variant="koala"/></group></group>)}</group>;
 if(assetKey==="bunny_garden")return <group>{[-1,1].map(side=><group key={side} position={[side*.7,0,0]}><Ball p={[0,.2,0]} s={[.55,.23,.5]} c="#ae8d61"/><Ball p={[0,.12,.43]} s={[.16,.13,.03]} c="#484132"/><group position={[.18,0,.67]} scale={.3}><NativeAnimal variant="bilby"/></group></group>)}<group position={[1.5,0,-.2]} scale={.3}><Tree variant="gum_tree"/></group></group>;
 if(assetKey==="pet_sanctuary")return <group>
  {[-1,1].flatMap(side=>[-13.94,-9,-4.5,0,4.5,9,13.94].map(x=><Pole key={`${side}-${x}`} a={[x,0,side*10.9]} b={[x,1.4,side*10.9]} radius={.06}/>))}
  {[-1,1].flatMap(side=>[.5,1.1].map(y=><Pole key={`${side}-${y}`} a={[-13.94,y,side*10.9]} b={[13.94,y,side*10.9]} radius={.04}/>))}
  {[-1,1].flatMap(side=>[.5,1.1].map(y=><Pole key={`${side}-${y}`} a={[side*13.94,y,-10.9]} b={[side*13.94,y,10.9]} radius={.04}/>))}
  <group position={[-6,0,-3]} scale={3.1}><Tree variant="gum_tree"/></group>
  <group position={[5,0,3]} scale={1.15}><NativeAnimal variant="kangaroo"/></group>
  <group position={[2,0,5]} scale={.75}><NativeAnimal variant="kangaroo"/></group>
 </group>;
 const roo=assetKey==="pet_sanctuary";
 return <group>{[-1,1].flatMap(side=>[-1.9,0,1.9].map(x=><Pole key={`${side}-${x}`} a={[x,0,side*1.6]} b={[x,.7,side*1.6]} radius={.045}/>))}{[-1,1].flatMap(side=>[.3,.6].map(y=><Pole key={`${side}-${y}`} a={[-1.9,y,side*1.6]} b={[1.9,y,side*1.6]} radius={.025}/>))}<group position={[-1,0,-.6]}>{roo?<group scale={.7}><Tree variant="gum_tree"/></group>:<group><Box p={[0,.45,0]} s={[.8,.9,.8]} c="#a58b66"/><Box p={[0,.3,.415]} s={[.33,.6,.025]} c="#4a4a37"/><Roof y={.97} width={1.1} depth={1}/></group>}</group><group position={[.5,0,.25]} scale={roo?.85:1}><NativeAnimal variant={roo?"kangaroo":"blue_heeler"}/></group>{roo&&<group position={[-.7,0,.65]} scale={.52}><NativeAnimal variant="kangaroo"/></group>}</group>;
}
