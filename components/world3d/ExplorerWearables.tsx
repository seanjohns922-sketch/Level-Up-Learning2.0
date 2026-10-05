"use client";
import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import type {AvatarOutfit} from '@/components/avatar/StudentAvatar';
import {AccessoryBox,AccessoryTube,AccessoryGem,AccessoryPlate} from './ExplorerAccessoryParts';
type Outfit=Required<AvatarOutfit>;
function makeVisorLens(){
 const positions:number[]=[],indices:number[]=[];
 for(let row=0;row<2;row++)for(let i=0;i<=32;i++){
  const u=i/16-1;
  const y=row===0?.037+.01*(1-u*u):-.037+.022*Math.exp(-Math.pow(u/.18,2));
  positions.push(u*.215,y,.013-.053*u*u);
 }
 for(let i=0;i<32;i++)indices.push(i,i+33,i+1,i+1,i+33,i+34);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
const visorLens=makeVisorLens();

export function ExplorerHeadAccessories({o}:{o:Outfit}){
 const c=o.hatColor,dark=new THREE.Color(c).multiplyScalar(.6).getStyle();
 return <group name="head-accessories">
  {o.hat!=='none'&&<group name={`hat-${o.hat}`} position={[0,o.hat==='crown'?0:-.1,0]}>
   {['beanie','cap'].includes(o.hat)&&<mesh position={[0,1.4,0]} scale={[.406,.28,.365]} castShadow><sphereGeometry args={[1,36,24,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color={c} roughness={o.hat==='beanie'?.95:.7}/></mesh>}
   {o.hat==='beanie'&&<><mesh position={[0,1.415,0]} castShadow><cylinderGeometry args={[.407,.4,.105,40]}/><meshStandardMaterial color={c} roughness={.95}/></mesh>{Array.from({length:32},(_,i)=>{const a=i/32*Math.PI*2;return <AccessoryTube key={i} points={[[Math.cos(a)*.409,1.37,Math.sin(a)*.409],[Math.cos(a)*.409,1.46,Math.sin(a)*.409]]} radius={.003} colour={dark}/>;})}<mesh position={[0,1.71,0]} castShadow><sphereGeometry args={[.063,20,16]}/><meshStandardMaterial color={c} roughness={1}/></mesh></>}
   {o.hat==='cap'&&<><mesh position={[0,1.405,.26]} scale={[.34,.022,.3]} castShadow><sphereGeometry args={[1,32,16]}/><meshStandardMaterial color={dark}/></mesh><AccessoryTube points={[[0,1.68,0],[0,1.62,.22],[0,1.43,.365]]} radius={.004} colour={dark}/><mesh position={[0,1.685,0]}><sphereGeometry args={[.022,12,8]}/><meshStandardMaterial color={dark}/></mesh></>}
   {o.hat==='explorer'&&<><mesh position={[0,1.41,0]} scale={[1,.085,.88]} castShadow><cylinderGeometry args={[.52,.52,.13,48]}/><meshStandardMaterial color={c}/></mesh><mesh position={[0,1.54,0]} scale={[1,1,.87]} castShadow><cylinderGeometry args={[.29,.37,.25,32]}/><meshStandardMaterial color={c}/></mesh><mesh position={[0,1.445,0]} scale={[1,1,.87]}><cylinderGeometry args={[.364,.373,.065,32]}/><meshStandardMaterial color={dark}/></mesh><group position={[0,1.445,.33]}><AccessoryBox width={.1} height={.058} depth={.015} colour="#d4ad54"/></group></>}
   {o.hat==='wizard'&&<><mesh position={[0,1.41,0]} scale={[1,.08,.88]} castShadow><cylinderGeometry args={[.49,.49,.15,48]}/><meshStandardMaterial color={c}/></mesh><mesh position={[.035,1.7,0]} rotation={[0,0,-.1]} castShadow><coneGeometry args={[.36,.63,40]}/><meshStandardMaterial color={c} roughness={.85}/></mesh>{[[0,1.58,.275],[.09,1.79,.15],[-.13,1.55,.27]].map((p,i)=><group key={i} position={p as [number,number,number]}><AccessoryGem colour="#fde68a" size={i===0?.055:.03}/></group>)}</>}
   {o.hat==='crown'&&<><mesh position={[0,1.49,0]}><cylinderGeometry args={[.393,.39,.09,40,1,true]}/><meshStandardMaterial color="#e9af35" metalness={.72} roughness={.27} side={THREE.DoubleSide}/></mesh>{Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return <group key={i} rotation={[0,a,0]}><group position={[0,1.51,.38]}><AccessoryPlate points={[[-.14,0],[0,.19],[.14,0]]} colour="#f6ca55" depth={.018} metalness={.7}/><group position={[0,.075,.033]}><AccessoryGem colour={i%2?'#38bdf8':'#ef4444'} size={.028}/></group></group></group>;})}</>}
  </group>}
  {o.glasses!=='none'&&<group name={`glasses-${o.glasses}`} position={[0,1.16,.373]}>
   {o.glasses==='round'?[-1,1].map(side=><mesh key={side} position={[side*.115,0,0]}><torusGeometry args={[.077,.009,8,32]}/><meshStandardMaterial color={o.glassesColor} metalness={.45}/></mesh>):o.glasses==='shades'?[-1,1].map(side=><group key={side} position={[side*.115,0,0]}><AccessoryBox width={.175} height={.115} depth={.018} colour={o.glassesColor}/><AccessoryTube points={[[-.055,.029,.019],[-.008,.04,.022],[.04,.033,.019]]} radius={.004} colour="#c1dcdf"/></group>):<><mesh name="visor-lens" geometry={visorLens} dispose={null}><meshStandardMaterial color={o.glassesColor} transparent opacity={.22} depthWrite={false} roughness={.18} metalness={.1} side={THREE.DoubleSide}/></mesh><AccessoryTube points={[[-.215,.037,-.04],[-.12,.044,-.004],[0,.047,.013],[.12,.044,-.004],[.215,.037,-.04]]} radius={.005} colour={o.glassesColor}/><AccessoryTube points={[[-.17,.026,-.018],[-.12,.03,.001],[-.07,.034,.011]]} radius={.0025} colour="#c5f4ff"/></>}
   {o.glasses!=='visor'&&<AccessoryTube points={[[-.037,.008,0],[0,.022,.004],[.037,.008,0]]} radius={.008} colour={o.glassesColor}/>}
   {[-1,1].map(side=><AccessoryTube key={side} points={[[side*.194,.018,0],[side*.29,.022,-.105],[side*.344,-.006,-.29]]} radius={.008} colour={o.glassesColor}/>)}
  </group>}
 </group>;
}

function capeGeometry(){
 const points:number[]=[],indices:number[]=[];
 for(let r=0;r<=18;r++)for(let c=0;c<=20;c++){
  const t=r/18,u=c/20*2-1;
  points.push(u*(.26+.22*t),.72-1.24*t-.025*(1-u*u)*t,-.3-.1*t+.025*Math.cos(u*5*Math.PI)*Math.sin(t*Math.PI/2));
 }
 for(let r=0;r<18;r++)for(let c=0;c<20;c++){const a=r*21+c,b=a+21;indices.push(a,b,a+1,a+1,b,b+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
const capeMesh=capeGeometry();
export function ExplorerBodyAccessories({o,movingRef}:{o:Outfit;movingRef?:React.MutableRefObject<boolean>}){
 const cape=useRef<THREE.Group>(null);
 useFrame(({clock},delta)=>{if(cape.current)cape.current.rotation.x=THREE.MathUtils.lerp(cape.current.rotation.x,movingRef?.current?-.035-Math.sin(clock.elapsedTime*7)*.018:0,1-Math.exp(-delta*10));});
 const packed=o.backpack!=='none',strap=new THREE.Color(o.backpackColor).multiplyScalar(.58).getStyle();
 return <group name="body-accessories">
  {o.cape!=='none'&&<group name={`cape-${o.cape}`} ref={cape}>
   <mesh geometry={capeMesh} dispose={null} castShadow receiveShadow><meshStandardMaterial color={o.capeColor} roughness={.95} side={THREE.DoubleSide}/></mesh>
   {[-1,1].map(side=><group key={side}><AccessoryTube points={[[side*.26,.72,-.3],[side*.29,.76,-.06],[side*.21,.7,.23]]} radius={.024} colour={o.capeColor}/><group position={[side*.21,.7,.25]}><AccessoryGem colour={o.cape==='royal'?'#f5cd70':o.capeColor} size={.036}/></group></group>)}
   {o.cape==='royal'&&<AccessoryTube points={[[-.47,-.52,-.4],[0,-.548,-.41],[.47,-.52,-.4]]} radius={.016} colour="#f5cd70"/>}
  </group>}
  {packed&&<group name={`backpack-${o.backpack}`}>
   <group position={[0,.44,-.39]}><AccessoryBox width={.48} height={.52} depth={.26} colour={o.backpackColor}/></group>
   <group position={[0,.39,-.55]}><AccessoryBox width={.34} height={.2} depth={.08} colour={strap}/></group>
   <AccessoryTube points={[[-.1,.72,-.39],[-.08,.79,-.39],[.08,.79,-.39],[.1,.72,-.39]]} radius={.016} colour={strap}/>
   <AccessoryTube points={[[-.145,.49,-.6],[.145,.49,-.6]]} radius={.006} colour="#e1c58c"/>
   {[-1,1].map(side=><AccessoryTube key={side} points={[[side*.16,.64,-.35],[side*.24,.75,-.035],[side*.26,.62,.22],[side*.23,.25,.22],[side*.21,.24,-.28]]} radius={.027} colour={strap}/>)}
   {o.backpack==='rocket'&&[-1,1].map(side=><group key={side} position={[side*.26,.43,-.41]}><mesh castShadow><capsuleGeometry args={[.075,.28,8,16]}/><meshStandardMaterial color={o.backpackColor} metalness={.4}/></mesh><mesh position={[0,-.22,0]}><cylinderGeometry args={[.06,.045,.07,16]}/><meshStandardMaterial color="#384253" metalness={.65}/></mesh><mesh position={[0,-.31,0]} rotation={[Math.PI,0,0]}><coneGeometry args={[.045,.16,16]}/><meshStandardMaterial color="#fb923c" emissive="#f97316" emissiveIntensity={.65}/></mesh></group>)}
  </group>}
 </group>;
}
