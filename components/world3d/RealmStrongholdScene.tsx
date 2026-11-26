'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Bloom,EffectComposer,Vignette} from '@react-three/postprocessing';
import * as THREE from 'three';
import WorldPlaque from './WorldPlaque';
import VillainRelief from './VillainRelief';
import StrongholdSeal from './StrongholdSeal';
import NumberNexusStrongholdSet from './NumberNexusStrongholdSet';
import MeasurelandsStrongholdSet from './MeasurelandsStrongholdSet';
import StarpathStrongholdSet from './StarpathStrongholdSet';
import StatisticaStrongholdSet from './StatisticaStrongholdSet';
import PatternPeaksStrongholdSet from './PatternPeaksStrongholdSet';
import ChanceHollowStrongholdSet from './ChanceHollowStrongholdSet';
import {Brazier,DONE_GOLD,Embers,StoneArch,WeekSign,rand,softDotTexture,useReducedMotion} from './VolcanicKit';
import {CavernRoof,Colonnade,EntranceGate,FarWalls,HallCrystals,HallLights,LavaLake,Stonework,type Tone} from './StrongholdHall';
import {STRONGHOLD_BRIDGE,STRONGHOLD_REALMS,strongholdLayout} from '@/lib/world3d/number-stronghold';
import type {ExpeditionRealm} from '@/lib/world3d/expedition-access';
import type {SummitPoint} from '@/lib/world3d/number-summit';

// The six Level 8 strongholds: the shared open hall (StrongholdHall), each week's portal on its island,
// the realm's own set pieces, and the Core under the Fog's purple seal at the far end.
const SEAL='#a463ff';
type Layout=ReturnType<typeof strongholdLayout>;
const tint=(colour:string,toward:string,amount:number)=>'#'+new THREE.Color(colour).lerp(new THREE.Color(toward),amount).getHexString();
/** Each stronghold's look: stone hue, floor tint, the realm energy in the floor cracks, and the colour of the light from below. */
const STONE_TINT:Record<ExpeditionRealm,{tint:string;floor:string;cracks:string;hall:string}>={
 number:{tint:'#3d6f9c',floor:'#a9c2dc',cracks:'#45e6c8',hall:'#4fc9c0'},
 measurement:{tint:'#8a6a3a',floor:'#e2d2b2',cracks:'#ffc65c',hall:'#ffa94a'},
 space:{tint:'#4a4fa0',floor:'#b9bde8',cracks:'#8c9dff',hall:'#8f86ff'},
 statistics:{tint:'#3d7a4a',floor:'#b6d8ba',cracks:'#84e070',hall:'#7fd88a'},
 pattern:{tint:'#2f5f9a',floor:'#a6c4e6',cracks:'#4fc3ff',hall:'#5aaeff'},
 chance:{tint:'#8a3a5c',floor:'#e2b7c6',cracks:'#ff7d9a',hall:'#ff6f9a'},
};
const toneFor=(realm:ExpeditionRealm):Tone=>{const t=STONE_TINT[realm],h={h:0,s:0,l:0};new THREE.Color(t.tint).getHSL(h);
 return c=>{const l={h:0,s:0,l:0};new THREE.Color(c).getHSL(l);return '#'+new THREE.Color().setHSL(h.h,h.s*.55,l.l*1.1).getHexString();};};
/** How much of the seal still stands: whole before Week 1, a cracked remnant once every week is finished (the battle breaks the rest).
 *  It breaks fastest early on, so the first weeks visibly open it. */
export const sealStrength=(finished:number,weeks:number)=>Math.max(.15,1-Math.sqrt(Math.min(finished,weeks)/weeks)*.85);
export type PortalState='locked'|'current'|'completed';

/** A week's portal at the far side of its island, turned toward the causeway, with its sign on the island beside the bridge. */
function Portal({week,at,state,colour,done,final}:{week:number;at:SummitPoint;state:PortalState;colour:string;done:string;final:boolean}){
 const side=Math.sign(at[0]),label=state==='completed'?'COMPLETE ✓':state==='current'?(final?'FINAL WEEK':'CONTINUE HERE'):'LOCKED',lit=state==='completed'?done:state==='current'?colour:'#a4706a';
 return <>
  <group position={[at[0]+side*1.7,0,at[2]]} rotation={[0,Math.atan2(-side,.55),0]}>
   <StoneArch colour={state==='completed'?done:colour} open={state!=='locked'} seed={week} brightness={state==='completed'?1.3:1.9} rim={state==='locked'?'#c4502e':undefined}/>
   {state==='current'&&<><Brazier at={[-3.2,0,1.6]} colour={colour} scale={.85}/><Brazier at={[3.2,0,1.6]} colour={colour} scale={.85}/><pointLight position={[0,3,2.4]} color={colour} intensity={36} distance={15} decay={1.6}/></>}
  </group>
  <WeekSign at={[at[0]-side*3.1,0,at[2]+STRONGHOLD_BRIDGE+.9]} title={final?`WEEK ${week} · FINAL`:`WEEK ${week}`} subtitle={label} colour={lit} restored={state==='completed'}/>
 </>;
}

const SHAFT_VERTEX=`varying float vY;varying float vFacing;void main(){vY=uv.y;vec4 mv=modelViewMatrix*vec4(position,1.);vec3 n=normalize(normalMatrix*normal);vFacing=abs(dot(n,normalize(-mv.xyz)));gl_Position=projectionMatrix*mv;}`;
const SHAFT_FRAGMENT=`uniform vec3 uColour;varying float vY;varying float vFacing;void main(){float a=pow(vFacing,2.5)*smoothstep(0.,.25,vY)*smoothstep(1.,.45,vY)*.32;gl_FragColor=vec4(uColour*a*2.,a);}`;
function magicCircleTexture(){
 const c=document.createElement('canvas');c.width=c.height=1024;const t=c.getContext('2d')!;t.translate(512,512);t.strokeStyle='#fff';t.fillStyle='#fff';t.lineCap='round';
 for(const [r,w] of [[490,10],[455,4],[330,6],[300,3],[170,5]] as const){t.lineWidth=w;t.beginPath();t.arc(0,0,r,0,Math.PI*2);t.stroke();}
 t.font='bold 58px sans-serif';t.textAlign='center';t.textBaseline='middle';
 for(let i=0;i<10;i++){t.save();t.rotate(i*Math.PI/5);t.fillText(String(i),0,-392);t.restore();}
 for(let i=0;i<40;i++){t.save();t.rotate(i*Math.PI/20);t.lineWidth=i%4?3:6;t.beginPath();t.moveTo(0,-300);t.lineTo(0,i%4?-318:-330);t.stroke();t.restore();}
 t.lineWidth=5;t.beginPath();for(let i=0;i<=6;i++){const a=i*Math.PI*2/6*2;t.lineTo(Math.sin(a)*300,-Math.cos(a)*300);}t.stroke();
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}

/** The Core chamber: a rune circle, the floating Core, the Fog's seal and its creeping vines. */
function CoreChamber({recovered,strength,shattering,colour,core:coreName,guardian,coreZ:CORE_Z}:{recovered:boolean;strength:number;shattering:boolean;colour:string;core:string;guardian:string;coreZ:number}){
 const reduced=useReducedMotion();
 const circle=useMemo(()=>magicCircleTexture(),[]),dot=useMemo(()=>softDotTexture(),[]);
 const core=useRef<THREE.Group>(null),rings=useRef<THREE.Group>(null),runes=useRef<THREE.Mesh>(null),vineMat=useRef<THREE.MeshStandardMaterial>(null);
 const vines=useMemo(()=>{const out:THREE.TubeGeometry[]=[];
  for(let v=0;v<7;v++){const a0=v*Math.PI*2/7,pts:THREE.Vector3[]=[];for(let k=0;k<=9;k++){const t=k/9,a=a0+t*2.6,r=6.6-t*5.1;pts.push(new THREE.Vector3(Math.cos(a)*r,.1+t*5.3+Math.sin(k*1.7+v)*.25,CORE_Z+Math.sin(a)*r));}out.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),48,.17-v%3*.025,6,false));}
  return out;},[CORE_Z]);
 const thorns=useMemo(()=>{const out:{p:SummitPoint;r:SummitPoint}[]=[];vines.slice(0,7).forEach((g,v)=>{const path=g.parameters.path;for(let k=1;k<8;k++){const t=k/8,p=path.getPointAt(t),tan=path.getTangentAt(t);out.push({p:[p.x,p.y,p.z],r:[Math.atan2(tan.z,tan.y)+(k%2?1:-1),v,0]});}});return out;},[vines]);
 useFrame(({clock},delta)=>{const t=reduced.current?0:clock.elapsedTime;
  if(core.current){core.current.rotation.y+=reduced.current?0:Math.min(delta,.05)*.45;core.current.position.y=5.6+Math.sin(t*.9)*.18;}
  if(rings.current)rings.current.children.forEach((r,i)=>{r.rotation.x=t*(.3+i*.12)+i;r.rotation.y=t*(.22-i*.08);});
  if(runes.current)runes.current.rotation.z=t*.06;
  if(vineMat.current)vineMat.current.emissiveIntensity=.55+Math.sin(t*1.4)*.3;
 });
 useEffect(()=>()=>{circle.dispose();dot.dispose();vines.forEach(v=>v.dispose());},[circle,dot,vines]);
 const coreColour=recovered?tint(colour,'#ffffff',.6):colour;
 // A beam over the Core, visible from the entrance: the Fog's purple while sealed, the realm's colour once free.
 const beam=useMemo(()=>({uColour:{value:new THREE.Color(recovered?tint(colour,'#ffffff',.3):SEAL)}}),[recovered,colour]);
 return <group>
  <mesh position={[0,.03,CORE_Z]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[7.5,10]}/><meshStandardMaterial color="#2b2629" roughness={.8} flatShading/></mesh>
  <mesh ref={runes} position={[0,.07,CORE_Z]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[13,13]}/><meshBasicMaterial map={circle} transparent depthWrite={false} color={new THREE.Color(recovered?colour:SEAL).multiplyScalar(recovered?2:1.5)} toneMapped={false}/></mesh>
  {[1,2,3,4].map(i=>{const a=i*Math.PI/3+Math.PI/6,x=Math.sin(a)*10.2,z=CORE_Z+Math.cos(a)*10.2;return <group key={i} position={[x,0,z]}>
   <mesh position={[0,4.5-(i%3)*1.2,0]} scale={[1,1,1]}><cylinderGeometry args={[.9,1.15,9-(i%3)*2.4,6]}/><meshStandardMaterial color="#3d3536" roughness={.9} flatShading/></mesh>
   <mesh position={[0,8.4-(i%3)*2.4,0]}><cylinderGeometry args={[.95,.95,.25,6]}/><meshBasicMaterial color={new THREE.Color(recovered?colour:SEAL).multiplyScalar(1.8)} toneMapped={false}/></mesh>
  </group>;})}
  <group ref={core} position={[0,5.6,CORE_Z]}>
   <mesh scale={[1.25,2.4,1.25]}><octahedronGeometry args={[1,0]}/><meshStandardMaterial color={coreColour} emissive={coreColour} emissiveIntensity={recovered?3.2:1.2} roughness={.15} flatShading/></mesh>
   <mesh scale={[.75,1.5,.75]} rotation={[0,Math.PI/4,0]}><octahedronGeometry args={[1,0]}/><meshBasicMaterial color={new THREE.Color(recovered?'#ffffff':tint(colour,'#ffffff',.4)).multiplyScalar(recovered?3:1.6)} toneMapped={false}/></mesh>
   <sprite scale={recovered?[9,9,1]:[5,5,1]}><spriteMaterial map={dot} color={new THREE.Color(coreColour).multiplyScalar(recovered?1.4:.8)} transparent opacity={recovered?.75:.45} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}/></sprite>
  </group>
  <pointLight position={[0,5,CORE_Z+2]} color={recovered?tint(colour,'#ffffff',.4):colour} intensity={recovered?160:45} distance={34} decay={1.6}/>
  <StrongholdSeal at={[0,5.6,CORE_Z]} strength={strength} shattering={shattering} recovered={recovered} colour={colour}/>
  {!recovered&&!shattering&&<>
   {/* The seal's rings and vines thin out as weeks are finished. */}
   <group ref={rings} position={[0,5.6,CORE_Z]}>{[0,1,2].slice(0,Math.ceil(3*strength)).map(i=><mesh key={i}><torusGeometry args={[3.1+i*.25,.07,6,64]}/><meshBasicMaterial color={new THREE.Color(SEAL).multiplyScalar(2)} toneMapped={false}/></mesh>)}</group>
   {vines.slice(0,Math.ceil(vines.length*strength)).map((g,i)=><mesh key={i} geometry={g}><meshStandardMaterial ref={i===0?vineMat:undefined} color="#25102f" emissive="#7a2bc4" emissiveIntensity={.6} roughness={.6} flatShading/></mesh>)}
   {thorns.slice(0,Math.ceil(thorns.length*strength)).map((t,i)=><mesh key={i} position={t.p} rotation={t.r}><coneGeometry args={[.09,.45,4]}/><meshStandardMaterial color="#3b1650" emissive="#8a33d6" emissiveIntensity={.5}/></mesh>)}
   <pointLight position={[0,4,CORE_Z]} color={SEAL} intensity={55} distance={26} decay={1.7}/>
   {Array.from({length:12},(_,i)=>{const a=i*Math.PI/6,r=4+rand(i+500)*4;return <sprite key={i} position={[Math.sin(a)*r,.9+rand(i+501),CORE_Z+Math.cos(a)*r]} scale={[7,3.2,1]}><spriteMaterial map={dot} color="#6b2fa8" transparent opacity={.32} depthWrite={false}/></sprite>;})}
  </>}
  <mesh position={[0,40,CORE_Z]}><cylinderGeometry args={recovered?[2.2,4.6,80,40,1,true]:[1.4,3.2,80,40,1,true]}/><shaderMaterial transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} toneMapped={false} uniforms={beam} vertexShader={SHAFT_VERTEX} fragmentShader={SHAFT_FRAGMENT}/></mesh>
  <mesh position={[0,9,CORE_Z-11]}><torusGeometry args={[9,1.1,5,16,Math.PI]}/><meshStandardMaterial color="#3a3233" roughness={.9} flatShading/></mesh>
  <WorldPlaque at={[0,10.4,CORE_Z-5.5]} title={recovered?`${coreName.toUpperCase()} RESTORED`:'THE CORE CHAMBER'} subtitle={recovered?'THE FOG IS CLEARING':`${guardian.toUpperCase()}’S SEAL`} width={10} colour={recovered?colour:'#c59bff'}/>
 </group>;
}

/** Each realm's own monuments, standing in the lava opposite the islands. */
const REALM_SET={number:NumberNexusStrongholdSet,measurement:MeasurelandsStrongholdSet,space:StarpathStrongholdSet,statistics:StatisticaStrongholdSet,pattern:PatternPeaksStrongholdSet,chance:ChanceHollowStrongholdSet} satisfies Record<ExpeditionRealm,React.ComponentType<{colour:string;layout:Layout}>>;

/** weekStates: each week's portal (index 0 is Week 1). finished: how many weeks are done, which weakens the seal. */
export default function RealmStrongholdScene({realm,weekStates,finished,recovered,shattering,position}:{realm:ExpeditionRealm;weekStates:PortalState[];finished:number;recovered:boolean;shattering:boolean;position:React.RefObject<THREE.Vector3>}){
 const r=STRONGHOLD_REALMS[realm],colour=r.colour,done=realm==='measurement'?'#fff1cf':DONE_GOLD;
 const layout=useMemo(()=>strongholdLayout(realm),[realm]),tone=useMemo(()=>toneFor(realm),[realm]),look=STONE_TINT[realm],RealmSet=REALM_SET[realm];
 const state=(week:number):PortalState=>weekStates[week-1]??'locked';
 const islands=useMemo(()=>layout.portals.map(p=>{const s=weekStates[p.week-1]??'locked';return {at:p.position,rim:new THREE.Color(s==='completed'?done:s==='current'?colour:'#8a3a2a').multiplyScalar(s==='locked'?.9:1.6).getStyle()};}),[layout,weekStates,done,colour]);
 const emberSpawn=useMemo(()=>(i:number):SummitPoint=>{const side=i%2?1:-1;return [side*(5+rand(i+300)*28),-1.2,layout.startZ-rand(i+302)*(layout.startZ-layout.backZ)];},[layout]);
 const fogColour=recovered?'#0c1615':'#1a0c0a';
 return <>
 <color attach="background" args={[fogColour]}/><fog attach="fog" args={[fogColour,34,recovered?280:240]}/>
 <ambientLight intensity={.26} color="#b9c6d6"/><hemisphereLight args={['#2a3550','#c2481a',.6]}/>
 <directionalLight position={[6,40,10]} intensity={.35} color="#9fc9d4"/>
 <LavaLake layout={layout}/>
 <Stonework realm={realm} layout={layout} colour={colour} tone={tone} floor={look.floor} cracks={look.cracks} islands={islands}/>
 <Colonnade layout={layout} colour={colour} tone={tone}/>
 <CavernRoof layout={layout} tone={tone} beam={recovered?colour:'#a463ff'}/>
 <EntranceGate colour={colour} tone={tone} name={r.name}/>
 <FarWalls layout={layout} tone={tone}/>
 <HallCrystals layout={layout} colour={colour} recovered={recovered}/>
 <HallLights position={position} colour={colour} hall={look.hall} recovered={recovered}/>
 <RealmSet colour={colour} layout={layout}/>
 <Embers count={Math.round((layout.startZ-layout.backZ)*2.3)} height={22} colour={recovered?tint(colour,'#ffffff',.5):'#ffa04d'} spawn={emberSpawn}/>
 {layout.portals.map(p=><Portal key={p.week} week={p.week} at={p.position} colour={colour} done={done} final={p.week===layout.weeks} state={state(p.week)}/>)}
 <CoreChamber recovered={recovered} strength={sealStrength(finished,layout.weeks)} shattering={shattering} colour={colour} core={r.core} guardian={r.guardian} coreZ={layout.coreZ}/>
 <VillainRelief realm={realm} recovered={recovered} z={layout.coreZ-10.2}/>
 <EffectComposer multisampling={0}>
  <Bloom intensity={.65} luminanceThreshold={.78} luminanceSmoothing={.2} mipmapBlur radius={.65}/>
  <Vignette offset={.28} darkness={.7} eskil={false}/>
 </EffectComposer>
 </>;
}
