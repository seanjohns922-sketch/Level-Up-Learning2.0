'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Bloom,EffectComposer,Vignette} from '@react-three/postprocessing';
import * as THREE from 'three';
import WorldPlaque from './WorldPlaque';
import VillainRelief from './VillainRelief';
import {Embers,Instances,LavaMaterial,StoneArch,basaltTextures,crystalGeometry,rand,softDotTexture,useReducedMotion} from './VolcanicKit';
import {STRONGHOLD_REALMS,strongholdLayout} from '@/lib/world3d/number-stronghold';
import type {ExpeditionRealm} from '@/lib/world3d/expedition-access';
import type {SummitPoint} from '@/lib/world3d/number-summit';

// Volcanic interior shared by the six Level 8 strongholds: basalt halls lit by lava channels and
// crystals in the realm's colour, realm details along the walls, and the Fog's purple seal around
// the Core. Repeated parts are instanced.
const GOLD='#ffcf72',EMBER='#ff7a32',SEAL='#a463ff';
type Layout=ReturnType<typeof strongholdLayout>;
/** 0 at the entrance, 1 at the Core: the hall darkens and the lava builds in three stages. */
const depthAt=(layout:Layout,z:number)=>Math.max(0,Math.min(1,(layout.startZ-z)/(layout.startZ-layout.coreZ)));
const depthShade=(layout:Layout,z:number,light:string,dark:string)=>'#'+new THREE.Color(light).lerp(new THREE.Color(dark),depthAt(layout,z)).getHexString();
const tint=(colour:string,toward:string,amount:number)=>'#'+new THREE.Color(colour).lerp(new THREE.Color(toward),amount).getHexString();
export type PortalState='locked'|'current'|'completed';

/** Basalt floor, flagstone path, lava channels and their banks. */
function Floor({colour,layout}:{colour:string;layout:Layout}){
 const length=layout.startZ-layout.backZ,mid=(layout.startZ+layout.backZ)/2;
 const {map,glow}=useMemo(()=>basaltTextures([3,Math.round(length/9)]),[length]);
 const stone=useMemo(()=>new THREE.BoxGeometry(1,1,1),[]),rock=useMemo(()=>new THREE.IcosahedronGeometry(1,0),[]);
 const flatStone=useMemo(()=>new THREE.MeshStandardMaterial({roughness:.92,flatShading:true}),[]);
 const studMaterial=useMemo(()=>new THREE.MeshBasicMaterial({color:new THREE.Color(colour).multiplyScalar(2.2),toneMapped:false}),[colour]);
 const flags=useMemo(()=>{const out:{p:SummitPoint;s:SummitPoint;r?:SummitPoint;c:string}[]=[];let i=0;
  for(let z=13;z>layout.coreZ+8;z-=1.2)for(let lane=-1;lane<=1;lane++){i++;out.push({p:[lane*1.25+(rand(i)-.5)*.16,.05,z+(rand(i+50)-.5)*.2],s:[1.12,.12,1.05],r:[0,(rand(i+9)-.5)*.12,0],c:rand(i+3)>.5?'#4b4a4d':'#3d3b3f'});}
  for(const p of layout.portals){const sx=Math.sign(p.position[0]);for(let t=0;t<7;t++){i++;const x=sx*(2.2+t*.95),z=p.position[2]+5.4-t*.25;out.push({p:[x,.05,z],s:[1,.12,1.6],r:[0,sx*.25,0],c:rand(i)>.5?'#4b4a4d':'#3d3b3f'});}}
  return out;},[layout]);
 const studs=useMemo(()=>{const out:{p:SummitPoint;s:SummitPoint;c:string}[]=[];for(let z=12;z>layout.coreZ+10;z-=4)for(const x of [-2.2,2.2])out.push({p:[x,.13,z],s:[.12,.05,.12],c:'#ffffff'});return out;},[layout]);
 const banks=useMemo(()=>{const out:{p:SummitPoint;s:SummitPoint;r:SummitPoint;c:string}[]=[];let i=900;
  for(const side of [-1,1])for(const edge of [12.4,14.7])for(let z=18;z>layout.backZ;z-=1.25){i++;const s=.35+rand(i)*.55;out.push({p:[side*(edge+(rand(i+1)-.5)*.3),s*.3-.1,z+(rand(i+2)-.5)*.5],s:[s*1.3,s*.7,s],r:[rand(i+3)*3,rand(i+4)*3,rand(i+5)*3],c:rand(i+6)>.5?'#2a2324':'#3a2c29'});}
  return out;},[layout]);
 useEffect(()=>()=>{map.dispose();glow.dispose();stone.dispose();rock.dispose();flatStone.dispose();studMaterial.dispose();},[map,glow,stone,rock,flatStone,studMaterial]);
 return <>
 <mesh position={[0,0,mid]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[25,length]}/><meshStandardMaterial map={map} emissiveMap={glow} emissive="#ffffff" emissiveIntensity={.32} roughness={.9}/></mesh>
 <Instances geometry={stone} material={flatStone} items={flags}/>
 <Instances geometry={stone} material={studMaterial} items={studs}/>
 {[-1,1].map(side=><group key={side}>
  <mesh position={[side*13.55,-.25,mid]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[2.2,length]}/><LavaMaterial scale={[1.6,length/7]} flow={.05} edge={.8} bright={1.15}/></mesh>
  <mesh position={[side*16,-.05,mid]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[3,length]}/><meshStandardMaterial map={map} roughness={.95}/></mesh>
 </group>)}
 <Instances geometry={rock} material={flatStone} items={banks}/>
 </>;
}

/** Jagged basalt walls, the back wall and a stalactite ceiling. Invisible boxes keep the camera inside. */
function Cavern({recovered,colour,layout,position}:{recovered:boolean;colour:string;layout:Layout;position:React.RefObject<THREE.Vector3>}){
 const length=layout.startZ-layout.backZ+8,mid=(layout.startZ+layout.backZ)/2
 const lavaLights=useRef<THREE.Group>(null),realmLight=useRef<THREE.PointLight>(null);
 useFrame(()=>{const z=position.current?.z??0,d=depthAt(layout,z);lavaLights.current?.children.forEach((l,i)=>{l.position.z=z-6-(i>>1)*22;(l as THREE.PointLight).intensity=80+d*70;});if(realmLight.current)realmLight.current.position.z=z-14;});
 const rock=useMemo(()=>new THREE.IcosahedronGeometry(1,0),[]),cone=useMemo(()=>new THREE.ConeGeometry(1,1,6).rotateX(Math.PI),[]);
 const material=useMemo(()=>new THREE.MeshStandardMaterial({roughness:.95,flatShading:true}),[]);
 const walls=useMemo(()=>{const out:{p:SummitPoint;s:SummitPoint;r:SummitPoint;c:string}[]=[];let i=2000;
  for(const side of [-1,1]){
   for(let z=20;z>layout.backZ-4;z-=2.8){i++;const h=7+rand(i)*7;out.push({p:[side*(17.4+rand(i+1)*1.2),h*.45,z],s:[2.6+rand(i+2)*1.4,h,2.4+rand(i+3)*1.2],r:[rand(i+4)*.4,rand(i+5)*3,side*(.08+rand(i+6)*.12)],c:depthShade(layout,z,rand(i+7)>.5?'#3d3332':'#2f2829','#1d1718')});}
   for(let z=19;z>layout.backZ-4;z-=3.6){i++;out.push({p:[side*(15.2+rand(i)*1.5),13+rand(i+1)*4,z],s:[3+rand(i+2)*2,4+rand(i+3)*3,3],r:[rand(i+4),rand(i+5)*3,-side*(.35+rand(i+6)*.3)],c:depthShade(layout,z,'#2a2425','#151112')});}
   for(let z=17;z>layout.backZ;z-=4.4){i++;out.push({p:[side*(15.6+rand(i)*.6),.6,z],s:[1.6+rand(i+1),1.2+rand(i+2),1.6],r:[rand(i+3)*3,rand(i+4)*3,0],c:depthShade(layout,z,'#4a3934','#2f2421')});}
  }
  for(let x=-18;x<=18;x+=3.2){i++;const h=12+rand(i)*10;out.push({p:[x,h*.45,layout.backZ-2-rand(i+1)*2],s:[3.4,h,3],r:[rand(i+2)*.3,rand(i+3)*3,rand(i+4)*.2],c:'#2a2425'});}
  for(let x=-18;x<=18;x+=3.6){i++;out.push({p:[x,8+rand(i)*6,22+rand(i+1)*2],s:[3.4,10,3],r:[0,rand(i+2)*3,0],c:'#241f20'});}
  return out;},[layout]);
 const spikes=useMemo(()=>{const out:{p:SummitPoint;s:SummitPoint;r:SummitPoint;c:string}[]=[];let i=4000;
  for(let z=18;z>layout.backZ-2;z-=2.1)for(let n=0;n<5;n++){i++;const len=1.5+rand(i)*5.5,r=.35+rand(i+1)*.9;out.push({p:[(rand(i+2)-.5)*30,20.5-len/2,z+(rand(i+3)-.5)*2],s:[r,len,r],r:[0,rand(i+4)*3,0],c:depthShade(layout,z,rand(i+5)>.6?'#3a2f2e':'#211c1d','#120e0f')});}
  return out;},[layout]);
 useEffect(()=>()=>{rock.dispose();cone.dispose();material.dispose();},[rock,cone,material]);
 return <>
 <Instances geometry={rock} material={material} items={walls}/>
 <Instances geometry={cone} material={material} items={spikes}/>
 <mesh position={[0,21,mid]} rotation={[Math.PI/2,0,0]}><planeGeometry args={[40,length]}/><meshStandardMaterial color="#120e0f" roughness={1}/></mesh>
 {[-1,1].map(side=><mesh key={side} visible={false} position={[side*16.5,8,mid]} userData={{cameraObstacle:true}}><boxGeometry args={[2,20,length]}/></mesh>)}
 <mesh visible={false} position={[0,10,layout.backZ]} userData={{cameraObstacle:true}}><boxGeometry args={[34,20,2]}/></mesh>
 <mesh visible={false} position={[0,20.8,mid]} userData={{cameraObstacle:true}}><boxGeometry args={[34,.5,length]}/></mesh>
 {/* Lava and crystal light travel with the explorer, so a long hall costs the same as a short one. */}
 <group ref={lavaLights}>{[0,1].map(k=>[-1,1].map(side=><pointLight key={`${k}${side}`} position={[side*12.4,1.6,0]} color={EMBER} intensity={95} distance={42} decay={1.6}/>))}</group>
 <pointLight ref={realmLight} position={[0,9,0]} color={colour} intensity={recovered?70:40} distance={34} decay={1.7}/>
 </>;
}

/** Clusters of glowing crystals in the realm's colour along the walls and ceiling. */
function Crystals({recovered,colour,layout}:{recovered:boolean;colour:string;layout:Layout}){
 const reduced=useReducedMotion();
 const geometry=useMemo(()=>crystalGeometry(),[]);
 const material=useMemo(()=>new THREE.MeshStandardMaterial({color:tint(colour,'#ffffff',.55),emissive:colour,emissiveIntensity:.7,roughness:.25,metalness:.1,flatShading:true}),[colour]);
 const items=useMemo(()=>{const out:{p:SummitPoint;s:SummitPoint;r:SummitPoint;c:string}[]=[];let i=6000;
  const cluster=(x:number,y:number,z:number,size:number,down=false)=>{for(let n=0;n<6;n++){i++;const lean=(rand(i)-.5)*1.1,turn=rand(i+1)*Math.PI*2,s=size*(.55+rand(i+2)*.7);out.push({p:[x+(rand(i+3)-.5)*size*.8,y,z+(rand(i+4)-.5)*size*.8],s:[s,s*(1+rand(i+5)*.9),s],r:[down?Math.PI+lean:lean,turn,(rand(i+6)-.5)*1.1],c:rand(i+7)>.75?'#ffffff':rand(i+8)>.5?tint(colour,'#ffffff',.5):tint(colour,'#000000',.1)});}};
  for(let z=14;z>layout.coreZ-6;z-=7.5)for(const side of [-1,1]){i++;if(rand(i+40)<depthAt(layout,z)*.55)continue;cluster(side*(14.9+rand(i)*.6),.1,z+rand(i+1)*2,1.1+rand(i+2)*.9);}
  for(let z=10;z>layout.coreZ-6;z-=11){i++;cluster((rand(i)-.5)*18,19.2,z,1.3,true);}
  for(const side of [-1,1])for(let z=4;z>layout.coreZ;z-=19){i++;cluster(side*16,7+rand(i)*5,z,.9);}
  return out;},[colour,layout]);
 useFrame(({clock})=>{material.emissiveIntensity=(recovered?1.2:.7)+(reduced.current?0:Math.sin(clock.elapsedTime*.8)*.1);});
 useEffect(()=>()=>{geometry.dispose();material.dispose();},[geometry,material]);
 return <Instances geometry={geometry} material={material} items={items}/>;
}

function Portal({week,at,state,colour,done,final}:{week:number;at:SummitPoint;state:PortalState;colour:string;done:string;final:boolean}){
 const label=state==='completed'?'COMPLETED · REVISIT ANY TIME':state==='current'?(final?'FINAL WEEK · THEN THE CORE':'CONTINUE HERE'):`LOCKED · PASS WEEK ${week-1}’S QUIZ`;
 return <group position={at} rotation={[0,-Math.sign(at[0])*.45,0]}>
  <StoneArch colour={state==='completed'?done:colour} open={state!=='locked'} seed={week} brightness={state==='completed'?1.15:1.6} rim={state==='locked'?'#c4502e':undefined}/>
  {state==='current'&&<pointLight position={[0,3,2.2]} color={colour} intensity={30} distance={13} decay={1.6}/>}
  <WorldPlaque at={[0,10.1,.3]} title={final?`WEEK ${week} · FINAL`:`WEEK ${week}`} subtitle={label} width={6.4} colour={state==='completed'?done:state==='current'?colour:'#a4706a'}/>
 </group>;
}

const SHAFT_VERTEX=`varying float vY;varying float vFacing;void main(){vY=uv.y;vec4 mv=modelViewMatrix*vec4(position,1.);vec3 n=normalize(normalMatrix*normal);vFacing=abs(dot(n,normalize(-mv.xyz)));gl_Position=projectionMatrix*mv;}`;
const SHAFT_FRAGMENT=`varying float vY;varying float vFacing;void main(){float a=pow(vFacing,2.5)*smoothstep(0.,.25,vY)*smoothstep(1.,.45,vY)*.32;gl_FragColor=vec4(vec3(.55,1.,.9)*a*2.,a);}`;
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
function CoreChamber({recovered,colour,core:coreName,guardian,coreZ:CORE_Z}:{recovered:boolean;colour:string;core:string;guardian:string;coreZ:number}){
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
  {!recovered&&<>
   <group ref={rings} position={[0,5.6,CORE_Z]}>{[0,1,2].map(i=><mesh key={i}><torusGeometry args={[3.1+i*.25,.07,6,64]}/><meshBasicMaterial color={new THREE.Color(SEAL).multiplyScalar(2)} toneMapped={false}/></mesh>)}</group>
   {vines.map((g,i)=><mesh key={i} geometry={g}><meshStandardMaterial ref={i===0?vineMat:undefined} color="#25102f" emissive="#7a2bc4" emissiveIntensity={.6} roughness={.6} flatShading/></mesh>)}
   {thorns.map((t,i)=><mesh key={i} position={t.p} rotation={t.r}><coneGeometry args={[.09,.45,4]}/><meshStandardMaterial color="#3b1650" emissive="#8a33d6" emissiveIntensity={.5}/></mesh>)}
   <pointLight position={[0,4,CORE_Z]} color={SEAL} intensity={55} distance={26} decay={1.7}/>
   {Array.from({length:12},(_,i)=>{const a=i*Math.PI/6,r=4+rand(i+500)*4;return <sprite key={i} position={[Math.sin(a)*r,.9+rand(i+501),CORE_Z+Math.cos(a)*r]} scale={[7,3.2,1]}><spriteMaterial map={dot} color="#6b2fa8" transparent opacity={.32} depthWrite={false}/></sprite>;})}
  </>}
  {recovered&&<mesh position={[0,11,CORE_Z]}><cylinderGeometry args={[1.6,4.2,22,40,1,true]}/><shaderMaterial transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} toneMapped={false} vertexShader={SHAFT_VERTEX} fragmentShader={SHAFT_FRAGMENT}/></mesh>}
  <mesh position={[0,9,CORE_Z-11]}><torusGeometry args={[9,1.1,5,16,Math.PI]}/><meshStandardMaterial color="#3a3233" roughness={.9} flatShading/></mesh>
  <WorldPlaque at={[0,17.6,CORE_Z-5]} title={recovered?`${coreName.toUpperCase()} RESTORED`:'THE CORE CHAMBER'} subtitle={recovered?'THE FOG IS CLEARING':`${guardian.toUpperCase()}’S SEAL`} width={10} colour={recovered?colour:'#c59bff'}/>
 </group>;
}

/** Lava spilling down the rock walls into the channels below. */
function Lavafalls({layout}:{layout:Layout}){
 const dot=useMemo(()=>softDotTexture(),[]);
 const falls=useMemo(()=>{const spots:[number,number][]=[];for(let z=15,k=0;z>layout.coreZ-6;k++){spots.push([k%2?1:-1,z+(rand(k+70)-.5)*3]);z-=10-depthAt(layout,z)*5;}
  return spots.map(([side,z],k)=>{const pos:number[]=[],uv:number[]=[],idx:number[]=[],n=26,top=11+rand(k+60)*5;
   for(let s=0;s<=n;s++){const t=s/n,x=side*(15.2-1.3*Math.pow(t,1.4)+Math.sin(t*7+k)*.22),y=top*(1-t),cz=z+Math.sin(t*5+k*2)*.45,w=.75+.8*t+Math.sin(t*11+k)*.12;
    pos.push(x,y,cz-w,x,y,cz+w);uv.push(0,t*top/4,1,t*top/4);if(s<n){const a=s*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);return {g,base:[side*13.9,.3,z] as SummitPoint,wall:[side*15.7,top*.55,z] as SummitPoint,top};});},[layout]);
 useEffect(()=>()=>{dot.dispose();falls.forEach(f=>f.g.dispose());},[dot,falls]);
 return <>{falls.map((f,i)=><group key={i}>
  <mesh geometry={f.g}><LavaMaterial scale={[1.6,.8]} flow={.55} edge={.9} bright={1.3} side={THREE.DoubleSide}/></mesh>
  <sprite position={f.wall} scale={[5,f.top*1.1,1]}><spriteMaterial map={dot} color="#ff6a24" transparent opacity={.28} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false}/></sprite>
  <sprite position={f.base} scale={[4.2,2,1]}><spriteMaterial map={dot} color="#ff7a32" transparent opacity={.55} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false}/></sprite>
 </group>)}</>;
}

/** Realm details set against the walls between the weekly portals. */
function RealmFeatures({realm,colour,layout}:{realm:ExpeditionRealm;colour:string;layout:Layout}){
 const reduced=useReducedMotion(),spin=useRef<THREE.Group>(null);
 const glow=new THREE.Color(colour).multiplyScalar(.9),stone='#3d3536';
 useFrame(({clock})=>{const t=reduced.current?0:clock.elapsedTime;
  spin.current?.children.forEach((c,i)=>{c.rotation.y=t*(.3+i%3*.1);c.rotation.x=t*.2+i;});});
 const spots=[4,...layout.portals.slice(0,-1).filter((_,i)=>i%2===0).map(p=>p.position[2]-7)].flatMap((z,k)=>[-1,1].map(side=>({x:side*10.6,z,side,k})));
 if(realm==='measurement')return <group>{spots.map(({x,z,side,k})=><group key={`${x}${z}`} position={[x,0,z]}>
  {/* Marked survey pillar with glowing graduations. */}
  <mesh position={[0,3.5,0]}><cylinderGeometry args={[.4,.5,7,8]}/><meshStandardMaterial color={stone} roughness={.9} flatShading/></mesh>
  {Array.from({length:13},(_,j)=><mesh key={j} position={[0,.6+j*.5,0]}><cylinderGeometry args={[j%2?.47:.53,j%2?.47:.53,j%2?.05:.1,12]}/><meshBasicMaterial color={glow} toneMapped={false}/></mesh>)}
  {k%2===0&&<group position={[-side*2.2,0,0]}><mesh position={[0,.15,0]}><boxGeometry args={[.5,.3,4.4]}/><meshStandardMaterial color="#4a403c" flatShading/></mesh>{Array.from({length:9},(_,j)=><mesh key={j} position={[0,.32,-2+j*.5]}><boxGeometry args={[j%2?.25:.45,.03,.06]}/><meshBasicMaterial color={glow} toneMapped={false}/></mesh>)}</group>}
  {k%2===1&&<mesh position={[-side*.3,5.6,0]} rotation={[0,side*Math.PI/2,0]}><torusGeometry args={[1.5,.07,6,32,Math.PI]}/><meshBasicMaterial color={glow} toneMapped={false}/></mesh>}
 </group>)}</group>;
 if(realm==='space')return <group>
  <group ref={spin}>{spots.map(({x,z},i)=>{const shapes=[<tetrahedronGeometry key="t" args={[1.1,0]}/>,<octahedronGeometry key="o" args={[1.1,0]}/>,<icosahedronGeometry key="i" args={[1.1,0]}/>,<dodecahedronGeometry key="d" args={[1.1,0]}/>,<boxGeometry key="b" args={[1.4,1.4,1.4]}/>];return <group key={i} position={[x*.9,7.5+(i%3),z]}>
   <mesh>{shapes[i%5]}<meshStandardMaterial color={tint(colour,'#000000',.55)} emissive={colour} emissiveIntensity={.25} flatShading/></mesh>
   <mesh scale={1.03}>{shapes[i%5]}<meshBasicMaterial color={tint(colour,'#000000',.2)} wireframe/></mesh>
  </group>;})}</group>
  <Constellations colour={colour} layout={layout}/>
 </group>;
 if(realm==='statistics')return <group>{spots.map(({x,z,side,k})=><group key={`${x}${z}`} position={[x,0,z]} rotation={[0,side*Math.PI/2,0]}>
  {/* A crystal bar chart: grouped records of different heights. */}
  <mesh position={[0,.2,0]}><boxGeometry args={[4.6,.4,1.4]}/><meshStandardMaterial color={stone} flatShading/></mesh>
  {[2,3.4,4.6,2.8,1.4].map((h,j)=>{const height=h*(.7+((k+j)%3)*.15);return <mesh key={j} position={[-1.8+j*.9,.4+height/2,0]}><boxGeometry args={[.6,height,.6]}/><meshStandardMaterial color={tint(colour,'#ffffff',.3)} emissive={colour} emissiveIntensity={.45} roughness={.3} flatShading/></mesh>;})}
  {[0,1,2,3,4,5].map(j=><mesh key={j} position={[-2.5+j,.55,.9]}><sphereGeometry args={[.13,8,6]}/><meshBasicMaterial color={glow} toneMapped={false}/></mesh>)}
 </group>)}</group>;
 if(realm==='pattern')return <group>{Array.from({length:Math.floor((10-layout.coreZ-8)/12)},(_,i)=>10-i*12).map((z,i)=><group key={z} position={[0,0,z]}>
  {/* Repeating carved arches; the inlay alternates in a two-step pattern. */}
  <mesh><torusGeometry args={[6.6,.55,5,18,Math.PI]}/><meshStandardMaterial color={i%2?'#463d3d':'#3a3335'} roughness={.9} flatShading/></mesh>
  <mesh position={[0,0,.5]}><torusGeometry args={[6.6,.06,4,40,Math.PI]}/><meshBasicMaterial color={i%2?'#cfc6bd':glow}/></mesh>
 </group>)}</group>;
 if(realm==='chance')return <group>
  {spots.map(({x,z,side,k})=><group key={`${x}${z}`} position={[x,0,z]}>
   {/* Dice stones, coloured counters and a probability spinner. */}
   <group position={[0,.7,0]} rotation={[0,k*.7,0]}><mesh><boxGeometry args={[1.4,1.4,1.4]}/><meshStandardMaterial color="#b9aeb0" roughness={.7} flatShading/></mesh>{[[-.35,.35],[0,0],[.35,-.35]].map(([a,b],j)=><mesh key={j} position={[a,b,.71]}><circleGeometry args={[.12,12]}/><meshBasicMaterial color="#2b1f27"/></mesh>)}</group>
   {['#ff5d73','#4fa8ff','#ffd24f','#6fe08a','#ff5d73'].map((c,j)=><mesh key={j} position={[-side*(.9+j*.35),.22,(j-2)*.55]}><sphereGeometry args={[.22,10,8]}/><meshStandardMaterial color={tint(c,'#3d3536',.3)} roughness={.5}/></mesh>)}
   {k%2===0&&<group position={[side*.2,4.6,0]} rotation={[0,-side*Math.PI/2,0]}>{['#ff5d73','#4fa8ff','#ffd24f','#6fe08a'].map((c,j)=><mesh key={j}><circleGeometry args={[1.4,24,j*Math.PI/2,Math.PI/2]}/><meshStandardMaterial color={tint(c,'#3d3536',.35)} roughness={.7} side={THREE.DoubleSide}/></mesh>)}<mesh position={[0,0,.02]} rotation={[0,0,.6]}><boxGeometry args={[.12,1.3,.04]}/><meshBasicMaterial color="#ffffff"/></mesh></group>}
  </group>)}
  <Mist layout={layout}/>
 </group>;
 return null;
}
function Constellations({colour,layout}:{colour:string;layout:Layout}){
 const geometry=useMemo(()=>{const pts:number[]=[];for(let c=0;c<Math.floor((12-layout.coreZ)/13);c++){const cx=(rand(c+800)-.5)*20,cz=12-c*13,stars=Array.from({length:5},(_,j)=>[cx+(rand(c*9+j)-.5)*6,19.4,cz+(rand(c*9+j+4)-.5)*6]);for(let j=0;j<4;j++)pts.push(...stars[j],...stars[j+1]);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));return g;},[layout]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <><lineSegments geometry={geometry}><lineBasicMaterial color={tint(colour,'#000000',.15)} transparent opacity={.7}/></lineSegments><points geometry={geometry}><pointsMaterial size={.3} color="#e8ecff"/></points></>;
}
function Mist({layout}:{layout:Layout}){
 const dot=useMemo(()=>softDotTexture(),[]);
 useEffect(()=>()=>dot.dispose(),[dot]);
 return <>{Array.from({length:Math.floor((14-layout.coreZ)/4)},(_,i)=><sprite key={i} position={[(rand(i+900)-.5)*20,.8+rand(i+901)*.8,14-i*4]} scale={[9,3,1]}><spriteMaterial map={dot} color="#b8aab0" transparent opacity={.12} depthWrite={false}/></sprite>)}</>;
}

export default function RealmStrongholdScene({realm,unlocked,recovered,position}:{realm:ExpeditionRealm;unlocked:number;recovered:boolean;position:React.RefObject<THREE.Vector3>}){
 const r=STRONGHOLD_REALMS[realm],colour=r.colour,done=realm==='measurement'?'#fff1cf':GOLD;
 const layout=useMemo(()=>strongholdLayout(realm),[realm]);
 const emberSpawn=useMemo(()=>(i:number):SummitPoint=>{const side=i%2?1:-1;return [side*(12.6+rand(i+300)*2)+(rand(i+305)>.8?-side*rand(i+306)*10:0),0,layout.startZ-rand(i+302)*(layout.startZ-layout.backZ)];},[layout]);
 const fogColour=recovered?'#0c1615':'#140b0b',fog=useRef<THREE.Fog>(null),ambient=useRef<THREE.AmbientLight>(null);
 // The hall closes in as students go deeper: the far fog draws nearer and the ambient light falls.
 useFrame(()=>{const d=depthAt(layout,position.current?.z??0);if(fog.current){fog.current.near=16-d*4;fog.current.far=(recovered?120:86)-d*22;}if(ambient.current)ambient.current.intensity=.32-d*.12;});
 return <>
 <color attach="background" args={[fogColour]}/><fog ref={fog} attach="fog" args={[fogColour,16,recovered?120:86]}/>
 <ambientLight ref={ambient} intensity={.32} color="#b9c6d6"/><hemisphereLight args={['#4b6f78','#3b1a0e',.7]}/>
 <directionalLight position={[4,20,10]} intensity={.45} color="#9fc9d4"/>
 <Floor colour={colour} layout={layout}/><Cavern recovered={recovered} colour={colour} layout={layout} position={position}/><Crystals recovered={recovered} colour={colour} layout={layout}/><Lavafalls layout={layout}/>
 <RealmFeatures realm={realm} colour={colour} layout={layout}/>
 <Embers count={Math.round((layout.startZ-layout.backZ)*2.3)} height={17} colour={recovered?tint(colour,'#ffffff',.5):'#ffa04d'} spawn={emberSpawn}/>
 {layout.portals.map(p=><Portal key={p.week} week={p.week} at={p.position} colour={colour} done={done} final={p.week===layout.weeks} state={p.week<unlocked?'completed':p.week===unlocked?'current':'locked'}/>)}
 <CoreChamber recovered={recovered} colour={colour} core={r.core} guardian={r.guardian} coreZ={layout.coreZ}/>
 <VillainRelief realm={realm} recovered={recovered} z={layout.coreZ-10.2}/>
 <EffectComposer multisampling={0}>
  <Bloom intensity={.55} luminanceThreshold={.8} luminanceSmoothing={.2} mipmapBlur radius={.6}/>
  <Vignette offset={.28} darkness={.75} eskil={false}/>
 </EffectComposer>
 </>;
}
