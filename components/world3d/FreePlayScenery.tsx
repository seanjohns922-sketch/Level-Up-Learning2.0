"use client";

import * as THREE from "three";
import { Ball, Box, Pole, Ring } from "./DetailedScenery";

type V = [number, number, number];
const wood = "#926b45", darkWood = "#634a34", stone = "#aaa38e", metal = "#485b59";
export const FREE_PLAY_SCENERY_KEYS = new Set([
  "fruit_tree", "flower_pots", "mushroom_cluster", "hedge_arch",
  "hopscotch", "sandpit", "seesaw", "small_slide",
  "shield_decoration", "supply_wagon", "training_dummy", "stone_steps",
  "small_jetty", "rowboat", "fishing_rod_stand", "lifebuoy",
]);

function Cylinder({ p, radius, height, color, top = radius }: { p: V; radius: number; height: number; color: string; top?: number }) {
  return <mesh position={p} castShadow receiveShadow><cylinderGeometry args={[top, radius, height, 16]} /><meshStandardMaterial color={color} roughness={.85} /></mesh>;
}

function FlowerPot({ tint }: { tint: string }) {
  return <group>
    <Cylinder p={[0,.2,0]} radius={.19} top={.26} height={.4} color="#b66b49" />
    <Ring p={[0,.4,0]} radius={.25} tube={.035} c="#c88460" />
    <Cylinder p={[0,.395,0]} radius={.22} height={.02} color="#594534" />
    {[-1,0,1].map((i) => <group key={i} position={[i*.12,0,i===0?.08:-.04]}>
      <Pole a={[0,.4,0]} b={[0,.75-Math.abs(i)*.08,0]} radius={.015} c="#47753b" />
      <Ball p={[.065,.52,0]} s={[.09,.025,.04]} c="#608a44" />
      <group position={[0,.75-Math.abs(i)*.08,0]}>
        {Array.from({length:5},(_,j) => <Ball key={j} p={[Math.cos(j*Math.PI*.4)*.08,Math.sin(j*Math.PI*.4)*.08,0]} s={[.065,.06,.025]} c={tint} />)}
        <Ball p={[0,0,.025]} s={[.035,.035,.025]} c="#f8cc55" />
      </group>
    </group>)}
  </group>;
}

const digitSegments: Record<number, string> = {1:"bc",2:"abdeg",3:"abcdg",4:"bcfg",5:"acdfg",6:"acdefg",7:"abc",8:"abcdefg"};
function ChalkNumber({ value }: { value: number }) {
  const segments: Record<string, [number,number,boolean]> = {a:[0,-.13,true],b:[.08,-.065,false],c:[.08,.065,false],d:[0,.13,true],e:[-.08,.065,false],f:[-.08,-.065,false],g:[0,0,true]};
  return <group>{[...digitSegments[value]].map(key => {const [x,z,horizontal]=segments[key];return <Box key={key} p={[x,.012,z]} s={horizontal?[.14,.006,.025]:[.025,.006,.11]} c="#fff5dd" />;})}</group>;
}

function WagonWheel({ x, z }: { x: number; z: number }) {
  return <group position={[x,.3,z]} rotation={[0,0,Math.PI/2]}>
    <Ring p={[0,0,0]} radius={.27} tube={.045} c={darkWood} />
    <Cylinder p={[0,0,0]} radius={.07} height={.14} color={metal} />
    {[0,1,2,3].map(i => <Pole key={i} a={[Math.cos(i*Math.PI/4)*-.25,0,Math.sin(i*Math.PI/4)*-.25]} b={[Math.cos(i*Math.PI/4)*.25,0,Math.sin(i*Math.PI/4)*.25]} radius={.018} c={wood} />)}
  </group>;
}

const shieldShape = new THREE.Shape();
shieldShape.moveTo(-.36,.45); shieldShape.lineTo(.36,.45); shieldShape.lineTo(.31,-.12);
shieldShape.quadraticCurveTo(.2,-.4,0,-.53); shieldShape.quadraticCurveTo(-.2,-.4,-.31,-.12); shieldShape.closePath();

/** Small free decorations. These are scenery, not playable equipment or vehicles. */
export function FreePlayScenery({ assetKey, tint }: { assetKey: string; tint?: string }) {
  const paint = tint ?? "#498f86";
  if (assetKey === "fruit_tree") return <group>
    <Pole a={[0,0,0]} b={[0,2.25,0]} radius={.17} c={wood} />
    {[-1,1].map(side => <Pole key={side} a={[0,1.25,0]} b={[side*.65,2.1,.1]} radius={.07} c={wood} />)}
    {[[0,2.55,0],[-.6,2.1,0],[.6,2.1,0],[0,2.1,-.55],[0,2.1,.55]].map((p,i) => <Ball key={i} p={p as V} s={[.7,.68,.65]} c={tint ?? (i%2?"#5a873d":"#6c9843")} />)}
    {Array.from({length:12},(_,i) => {const a=i*2.4;return <group key={i} position={[Math.sin(a)*1.2,1.95+(i%3)*.2,Math.cos(a)*1.15]}><Ball p={[0,0,0]} s={[.105,.11,.105]} c={i%3?"#ce5740":"#edb84b"} /><Pole a={[0,.09,0]} b={[.015,.16,0]} radius={.013} /></group>;})}
  </group>;
  if (assetKey === "flower_pots") return <group>{[-1,0,1].map((i) => <group key={i} position={[i*.56,0,i===0?-.16:.12]} scale={i===0?1:.8}><FlowerPot tint={tint ?? ["#dda244","#cc708f","#9478bf"][i+1]} /></group>)}</group>;
  if (assetKey === "mushroom_cluster") return <group>{Array.from({length:5},(_,i) => <group key={i} position={[Math.sin(i*2.4)*.4,0,Math.cos(i*2.4)*.4]} scale={.65+(i%3)*.2}>
    <Cylinder p={[0,.2,0]} radius={.065} height={.4} color="#e9dcc1" />
    <mesh position={[0,.4,0]} castShadow><sphereGeometry args={[.24,16,8,0,Math.PI*2,0,Math.PI/2]} /><meshStandardMaterial color={tint ?? "#b95948"} /></mesh>
    {[0,1,2].map(j => <Ball key={j} p={[Math.sin(j*2.1)*.13,.59,Math.cos(j*2.1)*.13]} s={[.035,.015,.035]} c="#f6e7c9" />)}
  </group>)}</group>;
  if (assetKey === "hedge_arch") return <group>
    {[-1,1].map(side => <group key={side}><Box p={[side*1.05,.15,0]} s={[.6,.3,.7]} c={stone} /><Pole a={[side*1.05,0,0]} b={[side*1.05,2.2,0]} radius={.07} />{[.55,1.05,1.55,2.05].map(y => <Ball key={y} p={[side*1.05,y,0]} s={[.36,.45,.36]} c={tint??"#547b3b"} />)}</group>)}
    {Array.from({length:7},(_,i) => {const a=i*Math.PI/6;return <Ball key={i} p={[Math.cos(a)*1.05,2.05+Math.sin(a)*.65,0]} s={[.36,.35,.36]} c={tint??"#658b46"} />;})}
  </group>;
  if (assetKey === "hopscotch") return <group>
    <Box p={[0,.025,0]} s={[1.5,.05,3.65]} c="#65716b" />
    {[[0,1.35],[0,.83],[-.27,.31],[.27,.31],[0,-.21],[-.27,-.73],[.27,-.73],[0,-1.25]].map(([x,z],i) => <group key={i} position={[x,.054,z]}>
      <Box p={[0,0,0]} s={[.49,.012,.49]} c={tint??(i%2?"#c08b54":"#669c94")} />
      {[-.245,.245].map(v => <group key={v}><Box p={[v,.01,0]} s={[.018,.008,.49]} c="#f4e7cd" /><Box p={[0,.01,v]} s={[.49,.008,.018]} c="#f4e7cd" /></group>)}<ChalkNumber value={i+1} />
    </group>)}
  </group>;
  if (assetKey === "sandpit") return <group>
    <Box p={[0,.1,0]} s={[2.1,.2,2.1]} c="#e3ca8d" />
    {[-1.12,1.12].map(v => <group key={v}><Box p={[v,.18,0]} s={[.2,.36,2.44]} c={tint??wood} /><Box p={[0,.18,v]} s={[2.44,.36,.2]} c={tint??wood} /></group>)}
    <Cylinder p={[.55,.35,.4]} radius={.17} top={.21} height={.3} color="#5b9fa6" /><Ring p={[.55,.51,.4]} radius={.2} tube={.025} c="#f4d783" />
    <Pole a={[-.5,.2,.2]} b={[-.65,.7,.2]} radius={.018} c={wood} /><Box p={[-.48,.22,.2]} s={[.14,.19,.03]} c="#c46b4b" />
    <Ball p={[-.15,.21,-.4]} s={[.4,.13,.3]} c="#ecd59c" />
  </group>;
  if (assetKey === "seesaw") return <group>
    {[-.28,.28].map(z => <group key={z}><Pole a={[-.35,0,z]} b={[0,.66,z]} radius={.07} c={metal} /><Pole a={[.35,0,z]} b={[0,.66,z]} radius={.07} c={metal} /></group>)}
    <group position={[0,.66,0]} rotation={[0,0,.12]}><Box p={[0,0,0]} s={[3.1,.13,.2]} c={wood} />{[-1,1].map(side => <group key={side}><Box p={[side*1.28,.1,0]} s={[.45,.1,.48]} c={paint} /><Pole a={[side*.96,.06,0]} b={[side*.96,.43,0]} radius={.035} c={metal} /><Pole a={[side*.96,.43,-.16]} b={[side*.96,.43,.16]} radius={.03} c={metal} /></group>)}</group>
  </group>;
  if (assetKey === "small_slide") return <group>
    {[-.37,.37].map(x => <group key={x}><Pole a={[x,0,-.85]} b={[x,1.7,-.85]} radius={.045} c={metal} /><Pole a={[x,0,-1.5]} b={[x,1.7,-.85]} radius={.045} c={metal} /></group>)}
    {[.3,.6,.9,1.2,1.5].map(y => <Pole key={y} a={[-.37,y,-1.5+y*.65/1.7]} b={[.37,y,-1.5+y*.65/1.7]} radius={.035} c={wood} />)}
    <Box p={[0,1.66,-.75]} s={[.8,.1,.5]} c={paint} />
    <group position={[0,.95,.4]} rotation={[.6,0,0]}><Box p={[0,0,0]} s={[.72,.07,2.65]} c={tint??"#d39b48"} />{[-.38,.38].map(x => <Box key={x} p={[x,.11,0]} s={[.08,.25,2.65]} c={paint} />)}</group>
    {[-.4,.4].map(x => <Pole key={x} a={[x,1.7,-.95]} b={[x,2.12,-.65]} radius={.035} c={metal} />)}
  </group>;
  if (assetKey === "shield_decoration") return <group>
    <Box p={[0,.08,0]} s={[.8,.16,.55]} c={stone} /><Pole a={[0,.1,0]} b={[0,1.35,0]} radius={.055} />
    <mesh position={[0,1,.02]} castShadow><extrudeGeometry args={[shieldShape,{depth:.09,bevelEnabled:false}]} /><meshStandardMaterial color={paint} roughness={.65} /></mesh>
    <Box p={[0,1,.12]} s={[.07,.75,.02]} c="#eac776" /><Box p={[0,1.1,.12]} s={[.57,.07,.02]} c="#eac776" />
  </group>;
  if (assetKey === "supply_wagon") return <group>
    {[-.62,.62].flatMap(x => [-.65,.65].map(z => <WagonWheel key={`${x}:${z}`} x={x} z={z} />))}
    <Box p={[0,.5,0]} s={[1.15,.12,1.8]} c={wood} />
    {[.68,.88].map(y => <group key={y}>{[-.58,.58].map(x => <Box key={x} p={[x,y,0]} s={[.07,.16,1.8]} c={tint??wood} />)}{[-.88,.88].map(z => <Box key={z} p={[0,y,z]} s={[1.2,.16,.07]} c={tint??wood} />)}</group>)}
    <Box p={[-.25,.78,-.3]} s={[.45,.45,.5]} c="#b19468" /><Cylinder p={[.26,.83,.26]} radius={.24} height={.55} color="#bfa779" />
    <Pole a={[0,.5,.9]} b={[0,.6,1.6]} radius={.045} /><Pole a={[-.28,.6,1.6]} b={[.28,.6,1.6]} radius={.035} />
  </group>;
  if (assetKey === "training_dummy") return <group>
    <Box p={[0,.07,0]} s={[.9,.14,.7]} c={wood} /><Pole a={[0,.1,0]} b={[0,1.75,0]} radius={.055} />
    <Pole a={[-.65,1.18,0]} b={[.65,1.18,0]} radius={.075} c="#bda16b" />
    <Ball p={[0,1.05,0]} s={[.3,.45,.2]} c={tint??"#c1a874"} /><Ball p={[0,1.68,0]} s={[.2,.23,.19]} c="#d5bc86" />
    {[.82,1.15].map(y => <Ring key={y} p={[0,y,0]} radius={.27} tube={.025} c={darkWood} />)}
    <Ball p={[0,1.1,.195]} s={[.12,.12,.025]} c="#b35d49" />
  </group>;
  if (assetKey === "stone_steps") return <group>{[0,1,2,3].map(i => <group key={i}>
    <Box p={[0,(i+1)*.13,-i*.38]} s={[1.65,(i+1)*.26,.4]} c={tint??(i%2?"#aaa38e":"#999482")} />
    <Box p={[0,(i+1)*.26+.02,-i*.38]} s={[1.72,.04,.43]} c={tint??"#b6ae97"} />
  </group>)}</group>;
  if (assetKey === "small_jetty") return <group>
    {[-.7,.7].flatMap(x => [-1.2,1.2].map(z => <group key={`${x}:${z}`}><Pole a={[x,0,z]} b={[x,.9,z]} radius={.065} /><Cylinder p={[x,.93,z]} radius={.09} height={.09} color={darkWood} /></group>))}
    {[-.55,.55].map(x => <Box key={x} p={[x,.33,0]} s={[.12,.16,2.9]} c={darkWood} />)}
    {Array.from({length:13},(_,i) => <Box key={i} p={[0,.45,(i-6)*.22]} s={[1.65,.09,.205]} c={tint??(i%2?wood:"#a18057")} />)}
    <Pole a={[-.7,.8,-1.2]} b={[-.7,.8,1.2]} radius={.025} c="#c6b18a" />
  </group>;
  if (assetKey === "rowboat") return <group>
    <mesh position={[0,.45,0]} scale={[.65,.4,1.45]} castShadow receiveShadow><sphereGeometry args={[1,24,12,0,Math.PI*2,Math.PI/2,Math.PI/2]} /><meshStandardMaterial color={tint??"#89704c"} side={THREE.DoubleSide} roughness={.85} /></mesh>
    <mesh position={[0,.45,0]} rotation={[Math.PI/2,0,0]} scale={[.65,1.45,1]} castShadow><torusGeometry args={[1,.045,6,32]} /><meshStandardMaterial color={darkWood} /></mesh>
    {[-.55,.4].map(z => <Box key={z} p={[0,.39,z]} s={[1.08,.08,.23]} c={wood} />)}
    {[-1,1].map(side => <group key={side}><Pole a={[side*.15,.5,-.75]} b={[side*.9,.55,.8]} radius={.022} c={wood} /><Ball p={[side*.92,.55,.84]} s={[.12,.035,.3]} c="#b29666" /></group>)}
  </group>;
  if (assetKey === "fishing_rod_stand") return <group>
    {[-.36,.36].map(x => <Pole key={x} a={[x,0,0]} b={[x,1.1,0]} radius={.04} />)}
    <Box p={[0,.08,0]} s={[1,.16,.6]} c={wood} /><Box p={[0,.95,0]} s={[.9,.08,.14]} c={tint??wood} />
    {[-1,0,1].map(i => <group key={i}><Pole a={[i*.25,.15,.05]} b={[i*.25+.13,2,-.2]} radius={.013} c={i%2?"#927451":metal} /><Ball p={[i*.25,.52,.08]} s={[.065,.065,.04]} c={paint} /><Pole a={[i*.25+.13,2,-.2]} b={[i*.25+.2,.9,-.2]} radius={.003} c="#c7ccba" /><Ball p={[i*.25+.2,.9,-.2]} s={[.025,.055,.025]} c="#d77952" /></group>)}
  </group>;
  if (assetKey === "lifebuoy") return <group>
    <Box p={[0,.07,0]} s={[.6,.14,.55]} c={wood} /><Pole a={[0,0,0]} b={[0,1.6,0]} radius={.045} />
    <group position={[0,1.02,.07]} rotation={[Math.PI/2,0,0]}><Ring p={[0,0,0]} radius={.35} tube={.1} c={tint??"#dd7749"} />{[0,1,2,3].map(i => <group key={i} rotation={[0,i*Math.PI/2,0]}><Box p={[.35,0,0]} s={[.16,.19,.13]} c="#f3e6ce" /></group>)}</group>
  </group>;
  return null;
}
