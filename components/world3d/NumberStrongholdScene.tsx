'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Bloom,EffectComposer,Vignette} from '@react-three/postprocessing';
import * as THREE from 'three';
import WorldPlaque from './WorldPlaque';
import {Embers,Instances,StoneArch,basaltTextures,crystalGeometry,lavaTexture,rand,softDotTexture,useReducedMotion} from './VolcanicKit';
import {STRONGHOLD_PORTALS} from '@/lib/world3d/number-stronghold';
import type {SummitPoint} from '@/lib/world3d/number-summit';

// Volcanic interior for the Number Nexus stronghold: basalt halls lit by lava channels and
// number crystals, with Confusion Creeper's vines sealing the Core. Repeated parts are instanced.
const CORE_Z=-74,TEAL='#45e6c8',GOLD='#ffcf72',EMBER='#ff7a32',SEAL='#a463ff';
export type PortalState='locked'|'current'|'completed';

/** Basalt floor, flagstone path, lava channels and their banks. */
function Floor(){
 const reduced=useReducedMotion();
 const {map,glow}=useMemo(()=>basaltTextures([3,12]),[]),lava=useMemo(()=>lavaTexture([1,7]),[]);
 const stone=useMemo(()=>new THREE.BoxGeometry(1,1,1),[]),rock=useMemo(()=>new THREE.IcosahedronGeometry(1,0),[]);
 const flatStone=useMemo(()=>new THREE.MeshStandardMaterial({roughness:.92,flatShading:true}),[]);
 const studMaterial=useMemo(()=>new THREE.MeshBasicMaterial({color:new THREE.Color(TEAL).multiplyScalar(2.2),toneMapped:false}),[]);
 const flags=useMemo(()=>{const out:{p:SummitPoint;s:SummitPoint;r?:SummitPoint;c:string}[]=[];let i=0;
  for(let z=13;z>-66;z-=1.2)for(let lane=-1;lane<=1;lane++){i++;out.push({p:[lane*1.25+(rand(i)-.5)*.16,.05,z+(rand(i+50)-.5)*.2],s:[1.12,.12,1.05],r:[0,(rand(i+9)-.5)*.12,0],c:rand(i+3)>.5?'#4b4a4d':'#3d3b3f'});}
  for(const p of STRONGHOLD_PORTALS){const sx=Math.sign(p.position[0]);for(let t=0;t<7;t++){i++;const x=sx*(2.2+t*.95),z=p.position[2]+5.4-t*.25;out.push({p:[x,.05,z],s:[1,.12,1.6],r:[0,sx*.25,0],c:rand(i)>.5?'#4b4a4d':'#3d3b3f'});}}
  return out;},[]);
 const studs=useMemo(()=>{const out:{p:SummitPoint;s:SummitPoint;c:string}[]=[];for(let z=12;z>-64;z-=4)for(const x of [-2.2,2.2])out.push({p:[x,.13,z],s:[.12,.05,.12],c:'#ffffff'});return out;},[]);
 const banks=useMemo(()=>{const out:{p:SummitPoint;s:SummitPoint;r:SummitPoint;c:string}[]=[];let i=900;
  for(const side of [-1,1])for(const edge of [12.4,14.7])for(let z=18;z>-86;z-=1.25){i++;const s=.35+rand(i)*.55;out.push({p:[side*(edge+(rand(i+1)-.5)*.3),s*.3-.1,z+(rand(i+2)-.5)*.5],s:[s*1.3,s*.7,s],r:[rand(i+3)*3,rand(i+4)*3,rand(i+5)*3],c:rand(i+6)>.5?'#2a2324':'#3a2c29'});}
  return out;},[]);
 const lavaMaterial=useRef<THREE.MeshBasicMaterial>(null);
 useFrame((_,delta)=>{const m=lavaMaterial.current?.map;if(m&&!reduced.current)m.offset.y-=Math.min(delta,.05)*.035;});
 useEffect(()=>()=>{map.dispose();glow.dispose();lava.dispose();stone.dispose();rock.dispose();flatStone.dispose();studMaterial.dispose();},[map,glow,lava,stone,rock,flatStone,studMaterial]);
 return <>
 <mesh position={[0,0,-34]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[25,108]}/><meshStandardMaterial map={map} emissiveMap={glow} emissive="#ffffff" emissiveIntensity={.8} roughness={.9}/></mesh>
 <Instances geometry={stone} material={flatStone} items={flags}/>
 <Instances geometry={stone} material={studMaterial} items={studs}/>
 {[-1,1].map(side=><group key={side}>
  <mesh position={[side*13.55,-.25,-34]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[2.2,108]}/><meshBasicMaterial ref={side<0?lavaMaterial:undefined} map={lava} color={new THREE.Color(1.6,1.25,1.1)} toneMapped={false}/></mesh>
  <mesh position={[side*16,-.05,-34]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[3,108]}/><meshStandardMaterial map={map} roughness={.95}/></mesh>
 </group>)}
 <Instances geometry={rock} material={flatStone} items={banks}/>
 </>;
}

/** Jagged basalt walls, the back wall and a stalactite ceiling. Invisible boxes keep the camera inside. */
function Cavern({recovered}:{recovered:boolean}){
 const rock=useMemo(()=>new THREE.IcosahedronGeometry(1,0),[]),cone=useMemo(()=>new THREE.ConeGeometry(1,1,6).rotateX(Math.PI),[]);
 const material=useMemo(()=>new THREE.MeshStandardMaterial({roughness:.95,flatShading:true}),[]);
 const walls=useMemo(()=>{const out:{p:SummitPoint;s:SummitPoint;r:SummitPoint;c:string}[]=[];let i=2000;
  for(const side of [-1,1]){
   for(let z=20;z>-90;z-=2.8){i++;const h=7+rand(i)*7;out.push({p:[side*(17.4+rand(i+1)*1.2),h*.45,z],s:[2.6+rand(i+2)*1.4,h,2.4+rand(i+3)*1.2],r:[rand(i+4)*.4,rand(i+5)*3,side*(.08+rand(i+6)*.12)],c:rand(i+7)>.5?'#3a302f':'#2c2627'});}
   for(let z=19;z>-90;z-=3.6){i++;out.push({p:[side*(15.2+rand(i)*1.5),13+rand(i+1)*4,z],s:[3+rand(i+2)*2,4+rand(i+3)*3,3],r:[rand(i+4),rand(i+5)*3,-side*(.35+rand(i+6)*.3)],c:'#262122'});}
   for(let z=17;z>-86;z-=4.4){i++;out.push({p:[side*(15.6+rand(i)*.6),.6,z],s:[1.6+rand(i+1),1.2+rand(i+2),1.6],r:[rand(i+3)*3,rand(i+4)*3,0],c:'#463733'});}
  }
  for(let x=-18;x<=18;x+=3.2){i++;const h=12+rand(i)*10;out.push({p:[x,h*.45,-88-rand(i+1)*2],s:[3.4,h,3],r:[rand(i+2)*.3,rand(i+3)*3,rand(i+4)*.2],c:'#2a2425'});}
  for(let x=-18;x<=18;x+=3.6){i++;out.push({p:[x,8+rand(i)*6,22+rand(i+1)*2],s:[3.4,10,3],r:[0,rand(i+2)*3,0],c:'#241f20'});}
  return out;},[]);
 const spikes=useMemo(()=>{const out:{p:SummitPoint;s:SummitPoint;r:SummitPoint;c:string}[]=[];let i=4000;
  for(let z=18;z>-88;z-=2.1)for(let n=0;n<5;n++){i++;const len=1.5+rand(i)*5.5,r=.35+rand(i+1)*.9;out.push({p:[(rand(i+2)-.5)*30,20.5-len/2,z+(rand(i+3)-.5)*2],s:[r,len,r],r:[0,rand(i+4)*3,0],c:rand(i+5)>.6?'#3a2f2e':'#211c1d'});}
  return out;},[]);
 useEffect(()=>()=>{rock.dispose();cone.dispose();material.dispose();},[rock,cone,material]);
 return <>
 <Instances geometry={rock} material={material} items={walls}/>
 <Instances geometry={cone} material={material} items={spikes}/>
 <mesh position={[0,21,-34]} rotation={[Math.PI/2,0,0]}><planeGeometry args={[40,116]}/><meshStandardMaterial color="#120e0f" roughness={1}/></mesh>
 {[-1,1].map(side=><mesh key={side} visible={false} position={[side*16.5,8,-34]} userData={{cameraObstacle:true}}><boxGeometry args={[2,20,112]}/></mesh>)}
 <mesh visible={false} position={[0,10,-86]} userData={{cameraObstacle:true}}><boxGeometry args={[34,20,2]}/></mesh>
 <mesh visible={false} position={[0,20.8,-34]} userData={{cameraObstacle:true}}><boxGeometry args={[34,.5,116]}/></mesh>
 {/* Warm lava light from the channels, cool light from the crystal seams. */}
 {[6,-30].map(z=>[-1,1].map(side=><pointLight key={`${z}${side}`} position={[side*12.4,1.6,z]} color={EMBER} intensity={95} distance={42} decay={1.6}/>))}
 <pointLight position={[0,9,-16]} color={TEAL} intensity={recovered?70:40} distance={34} decay={1.7}/>
 </>;
}

/** Clusters of glowing number crystals along the walls and ceiling. */
function Crystals({recovered}:{recovered:boolean}){
 const reduced=useReducedMotion();
 const geometry=useMemo(()=>crystalGeometry(),[]);
 const material=useMemo(()=>new THREE.MeshStandardMaterial({color:'#9ff9e6',emissive:TEAL,emissiveIntensity:1.4,roughness:.25,metalness:.1,flatShading:true}),[]);
 const items=useMemo(()=>{const out:{p:SummitPoint;s:SummitPoint;r:SummitPoint;c:string}[]=[];let i=6000;
  const cluster=(x:number,y:number,z:number,size:number,down=false)=>{for(let n=0;n<6;n++){i++;const lean=(rand(i)-.5)*1.1,turn=rand(i+1)*Math.PI*2,s=size*(.55+rand(i+2)*.7);out.push({p:[x+(rand(i+3)-.5)*size*.8,y,z+(rand(i+4)-.5)*size*.8],s:[s,s*(1+rand(i+5)*.9),s],r:[down?Math.PI+lean:lean,turn,(rand(i+6)-.5)*1.1],c:rand(i+7)>.75?'#c9fff4':rand(i+8)>.5?'#6ff3dc':'#42c9d6'});}};
  for(let z=14;z>-80;z-=7.5)for(const side of [-1,1]){i++;cluster(side*(14.9+rand(i)*.6),.1,z+rand(i+1)*2,1.1+rand(i+2)*.9);}
  for(let z=10;z>-80;z-=11){i++;cluster((rand(i)-.5)*18,19.2,z,1.3,true);}
  for(const side of [-1,1])for(let z=4;z>-76;z-=19){i++;cluster(side*16,7+rand(i)*5,z,.9);}
  return out;},[]);
 useFrame(({clock})=>{material.emissiveIntensity=(recovered?2:1.4)+(reduced.current?0:Math.sin(clock.elapsedTime*.8)*.25);});
 useEffect(()=>()=>{geometry.dispose();material.dispose();},[geometry,material]);
 return <Instances geometry={geometry} material={material} items={items}/>;
}

/** Faint number glyphs drifting through the halls: the Number Nexus signature. */
function FloatingNumerals(){
 const reduced=useReducedMotion();
 const glyphs=['π','√2','−7','¾','2³','%','0.5','10⁻¹','√9','−½','4²','1.25'];
 const sprites=useMemo(()=>glyphs.map((g,i)=>{const c=document.createElement('canvas');c.width=c.height=256;const t=c.getContext('2d')!;t.font='bold 120px sans-serif';t.textAlign='center';t.textBaseline='middle';t.shadowColor='#7affe4';t.shadowBlur=26;t.fillStyle='#d8fff6';t.fillText(g,128,132);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  const side=i%2?1:-1;return {tex,base:[side*(8+rand(i+70)*5),5+rand(i+71)*9,12-i*7.2] as SummitPoint,phase:rand(i+72)*6,scale:1.4+rand(i+73)*1.2};}),[]);// eslint-disable-line react-hooks/exhaustive-deps
 const group=useRef<THREE.Group>(null);
 useFrame(({clock})=>{if(reduced.current||!group.current)return;group.current.children.forEach((s,i)=>{const d=sprites[i];s.position.y=d.base[1]+Math.sin(clock.elapsedTime*.4+d.phase)*.6;});});
 useEffect(()=>()=>sprites.forEach(s=>s.tex.dispose()),[sprites]);
 return <group ref={group}>{sprites.map((s,i)=><sprite key={i} position={s.base} scale={[s.scale,s.scale,1]}><spriteMaterial map={s.tex} transparent opacity={.5} depthWrite={false} color={new THREE.Color(1.6,1.6,1.6)} toneMapped={false}/></sprite>)}</group>;
}

function Portal({week,at,state}:{week:number;at:SummitPoint;state:PortalState}){
 const label=state==='completed'?'COMPLETED · REVISIT ANY TIME':state==='current'?'CONTINUE HERE':`LOCKED · PASS WEEK ${week-1}’S QUIZ`;
 return <group position={at} rotation={[0,-Math.sign(at[0])*.45,0]}>
  <StoneArch colour={state==='completed'?GOLD:TEAL} open={state!=='locked'} seed={week} brightness={state==='completed'?1.15:1.6} rim={state==='locked'?'#c4502e':undefined}/>
  {state==='current'&&<pointLight position={[0,3,2.2]} color={TEAL} intensity={30} distance={13} decay={1.6}/>}
  <WorldPlaque at={[0,10.1,.3]} title={`WEEK ${week}`} subtitle={label} width={6.4} colour={state==='completed'?GOLD:state==='current'?'#74e6cf':'#a4706a'}/>
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

/** The Core chamber: a rune circle, the floating Core, the seal and Confusion Creeper's vines. */
function CoreChamber({recovered}:{recovered:boolean}){
 const reduced=useReducedMotion();
 const circle=useMemo(()=>magicCircleTexture(),[]),dot=useMemo(()=>softDotTexture(),[]);
 const core=useRef<THREE.Group>(null),rings=useRef<THREE.Group>(null),runes=useRef<THREE.Mesh>(null),eyes=useRef<THREE.Group>(null),vineMat=useRef<THREE.MeshStandardMaterial>(null);
 const vines=useMemo(()=>{const out:THREE.TubeGeometry[]=[];
  for(let v=0;v<7;v++){const a0=v*Math.PI*2/7,pts:THREE.Vector3[]=[];for(let k=0;k<=9;k++){const t=k/9,a=a0+t*2.6,r=6.6-t*5.1;pts.push(new THREE.Vector3(Math.cos(a)*r,.1+t*5.3+Math.sin(k*1.7+v)*.25,CORE_Z+Math.sin(a)*r));}out.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),48,.17-v%3*.025,6,false));}
  for(let v=0;v<6;v++){const x0=-13+v*5.2,pts:THREE.Vector3[]=[];for(let k=0;k<=8;k++){const t=k/8;pts.push(new THREE.Vector3(x0+Math.sin(t*5+v)*1.6,t*17,-85.3+Math.sin(t*3+v)*.4));}out.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,.3,6,false));}
  return out;},[]);
 const thorns=useMemo(()=>{const out:{p:SummitPoint;r:SummitPoint}[]=[];vines.slice(0,7).forEach((g,v)=>{const path=g.parameters.path;for(let k=1;k<8;k++){const t=k/8,p=path.getPointAt(t),tan=path.getTangentAt(t);out.push({p:[p.x,p.y,p.z],r:[Math.atan2(tan.z,tan.y)+(k%2?1:-1),v,0]});}});return out;},[vines]);
 useFrame(({clock},delta)=>{const t=reduced.current?0:clock.elapsedTime;
  if(core.current){core.current.rotation.y+=reduced.current?0:Math.min(delta,.05)*.45;core.current.position.y=5.6+Math.sin(t*.9)*.18;}
  if(rings.current)rings.current.children.forEach((r,i)=>{r.rotation.x=t*(.3+i*.12)+i;r.rotation.y=t*(.22-i*.08);});
  if(runes.current)runes.current.rotation.z=t*.06;
  if(vineMat.current)vineMat.current.emissiveIntensity=.55+Math.sin(t*1.4)*.3;
  if(eyes.current){const blink=(t%7)>6.82?.08:1;eyes.current.children.forEach(e=>{e.scale.y=blink*.55;});eyes.current.position.y=12.5+Math.sin(t*.5)*.15;}
 });
 useEffect(()=>()=>{circle.dispose();dot.dispose();vines.forEach(v=>v.dispose());},[circle,dot,vines]);
 const coreColour=recovered?'#c8fff2':TEAL;
 return <group>
  <mesh position={[0,.03,CORE_Z]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[7.5,10]}/><meshStandardMaterial color="#2b2629" roughness={.8} flatShading/></mesh>
  <mesh ref={runes} position={[0,.07,CORE_Z]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[13,13]}/><meshBasicMaterial map={circle} transparent depthWrite={false} color={new THREE.Color(recovered?TEAL:SEAL).multiplyScalar(recovered?2:1.5)} toneMapped={false}/></mesh>
  {[1,2,3,4].map(i=>{const a=i*Math.PI/3+Math.PI/6,x=Math.sin(a)*10.2,z=CORE_Z+Math.cos(a)*10.2;return <group key={i} position={[x,0,z]}>
   <mesh position={[0,4.5-(i%3)*1.2,0]} scale={[1,1,1]}><cylinderGeometry args={[.9,1.15,9-(i%3)*2.4,6]}/><meshStandardMaterial color="#3d3536" roughness={.9} flatShading/></mesh>
   <mesh position={[0,8.4-(i%3)*2.4,0]}><cylinderGeometry args={[.95,.95,.25,6]}/><meshBasicMaterial color={new THREE.Color(recovered?TEAL:SEAL).multiplyScalar(1.8)} toneMapped={false}/></mesh>
  </group>;})}
  <group ref={core} position={[0,5.6,CORE_Z]}>
   <mesh scale={[1.25,2.4,1.25]}><octahedronGeometry args={[1,0]}/><meshStandardMaterial color={coreColour} emissive={coreColour} emissiveIntensity={recovered?3.2:1.2} roughness={.15} flatShading/></mesh>
   <mesh scale={[.75,1.5,.75]} rotation={[0,Math.PI/4,0]}><octahedronGeometry args={[1,0]}/><meshBasicMaterial color={new THREE.Color(recovered?'#ffffff':'#7cf6dd').multiplyScalar(recovered?3:1.6)} toneMapped={false}/></mesh>
   <sprite scale={recovered?[9,9,1]:[5,5,1]}><spriteMaterial map={dot} color={new THREE.Color(coreColour).multiplyScalar(recovered?1.4:.8)} transparent opacity={recovered?.75:.45} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}/></sprite>
  </group>
  <pointLight position={[0,5,CORE_Z+2]} color={recovered?'#9fffe9':TEAL} intensity={recovered?160:45} distance={34} decay={1.6}/>
  {!recovered&&<>
   <group ref={rings} position={[0,5.6,CORE_Z]}>{[0,1,2].map(i=><mesh key={i}><torusGeometry args={[3.1+i*.25,.07,6,64]}/><meshBasicMaterial color={new THREE.Color(SEAL).multiplyScalar(2)} toneMapped={false}/></mesh>)}</group>
   {vines.map((g,i)=><mesh key={i} geometry={g}><meshStandardMaterial ref={i===0?vineMat:undefined} color="#25102f" emissive="#7a2bc4" emissiveIntensity={.6} roughness={.6} flatShading/></mesh>)}
   {thorns.map((t,i)=><mesh key={i} position={t.p} rotation={t.r}><coneGeometry args={[.09,.45,4]}/><meshStandardMaterial color="#3b1650" emissive="#8a33d6" emissiveIntensity={.5}/></mesh>)}
   <group ref={eyes} position={[0,12.5,-84.6]}>{[-1.5,1.5].map(x=><mesh key={x} position={[x,0,0]} rotation={[0,0,x*.18]} scale={[1,.55,1]}><circleGeometry args={[.62,24]}/><meshBasicMaterial color={new THREE.Color('#e48bff').multiplyScalar(3)} toneMapped={false}/></mesh>)}</group>
   <pointLight position={[0,4,CORE_Z]} color={SEAL} intensity={55} distance={26} decay={1.7}/>
   {Array.from({length:12},(_,i)=>{const a=i*Math.PI/6,r=4+rand(i+500)*4;return <sprite key={i} position={[Math.sin(a)*r,.9+rand(i+501),CORE_Z+Math.cos(a)*r]} scale={[7,3.2,1]}><spriteMaterial map={dot} color="#6b2fa8" transparent opacity={.32} depthWrite={false}/></sprite>;})}
  </>}
  {recovered&&<mesh position={[0,11,CORE_Z]}><cylinderGeometry args={[1.6,4.2,22,40,1,true]}/><shaderMaterial transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} toneMapped={false} vertexShader={SHAFT_VERTEX} fragmentShader={SHAFT_FRAGMENT}/></mesh>}
  <mesh position={[0,9,-85]}><torusGeometry args={[9,1.1,5,16,Math.PI]}/><meshStandardMaterial color="#3a3233" roughness={.9} flatShading/></mesh>
  <WorldPlaque at={[0,15.4,-80]} title={recovered?'NUMBER CORE RESTORED':'THE CORE CHAMBER'} subtitle={recovered?'THE FOG IS CLEARING':'CONFUSION CREEPER’S SEAL'} width={10} colour={recovered?'#87e6d2':'#c59bff'}/>
 </group>;
}

const emberSpawn=(i:number):SummitPoint=>{const side=i%2?1:-1;return [side*(12.6+rand(i+300)*2)+(rand(i+305)>.8?-side*rand(i+306)*10:0),0,18-rand(i+302)*104];};
export default function NumberStrongholdScene({unlocked,recovered}:{unlocked:number;recovered:boolean}){
 const fogColour=recovered?'#0c1615':'#140b0b';
 return <>
 <color attach="background" args={[fogColour]}/><fog attach="fog" args={[fogColour,16,recovered?120:86]}/>
 <ambientLight intensity={.32} color="#b9c6d6"/><hemisphereLight args={['#4b6f78','#3b1a0e',.7]}/>
 <directionalLight position={[4,20,10]} intensity={.45} color="#9fc9d4"/>
 <Floor/><Cavern recovered={recovered}/><Crystals recovered={recovered}/><FloatingNumerals/><Embers count={240} height={17} colour={recovered?'#9fffe6':'#ffa04d'} spawn={emberSpawn}/>
 {STRONGHOLD_PORTALS.map(p=><Portal key={p.week} week={p.week} at={p.position} state={p.week<unlocked?'completed':p.week===unlocked?'current':'locked'}/>)}
 <CoreChamber recovered={recovered}/>
 <EffectComposer multisampling={0}>
  <Bloom intensity={.95} luminanceThreshold={.62} luminanceSmoothing={.25} mipmapBlur radius={.7}/>
  <Vignette offset={.28} darkness={.75} eskil={false}/>
 </EffectComposer>
 </>;
}
