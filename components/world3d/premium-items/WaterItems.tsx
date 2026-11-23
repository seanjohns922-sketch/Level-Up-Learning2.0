"use client";
// The Swimming Lake: four levels, from a swimming hole to a lagoon with a waterslide. Units are world metres
// (the explorer stands about 2 m tall). Its water sits in a dug-out bed below the grass (the hub cuts the
// grass away over it), deep enough that swimmers float with the water at their shoulders.
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ReactNode } from "react";
import { CatmullRomCurve3, DoubleSide, TubeGeometry, Vector3, type Mesh } from "three";
import { Ball, Block, Mat } from "@/components/world3d/premium-homes/HomeKit";
import type { PremiumHomeLevel, WATER_STYLES } from "@/lib/world3d/premium-homes";
import { LAKE_WATER_SIZE, SWIM_BED_Y, SWIM_SURFACE_Y } from "@/lib/world3d/swimming";
import { Bob, Glow, LightPool, Sway, StringLights, WARM } from "./ItemKit";

type Props = { level: PremiumHomeLevel; night: boolean };
type V3 = [number, number, number];
const SAND = "#ecd39a", ROCK = "#8d8f88", TIMBER = "#a8743f", TIMBER_DARK = "#7a4f28";

function Water({ w, d, night, glow }: { w: number; d: number; night: boolean; glow: boolean }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.position.y = SWIM_SURFACE_Y + Math.sin(clock.elapsedTime * 1.3) * 0.015; });
  return <group scale={[w / 2, 1, d / 2]}>
    {/* The dug-out bed: sides and a sandy floor, seen through the water. */}
    <mesh position={[0, (SWIM_BED_Y + 0.02) / 2, 0]}><cylinderGeometry args={[1, 0.86, -SWIM_BED_Y + 0.02, 48, 1, true]} /><meshStandardMaterial color="#5f8f7a" side={DoubleSide} roughness={1} /></mesh>
    <mesh position={[0, SWIM_BED_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.86, 48]} /><meshStandardMaterial color="#c9b27a" roughness={1} /></mesh>
    <mesh ref={ref} position={[0, SWIM_SURFACE_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1, 64]} /><meshStandardMaterial color={glow && night ? "#2ec4e8" : "#38a9d6"} transparent opacity={0.74} roughness={0.08} metalness={0.1} emissive={glow ? "#1aa8d8" : "#0b4a66"} emissiveIntensity={glow ? (night ? 1.1 : 0.25) : 0.15} depthWrite={false} /></mesh>
    {/* A soft bank around the edge. */}
    <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1, 1.07, 64]} /><meshStandardMaterial color="#6f9c55" roughness={1} /></mesh>
  </group>;
}
function Rock({ pos, s = 1 }: { pos: V3; s?: number }) {
  return <mesh position={pos} scale={[s * 1.2, s * 0.7, s]} castShadow receiveShadow><dodecahedronGeometry args={[0.5, 0]} /><meshStandardMaterial color={ROCK} flatShading roughness={0.9} /></mesh>;
}
function Reeds({ pos }: { pos: V3 }) {
  return <group position={pos}>{Array.from({ length: 6 }, (_, i) => <Block key={i} size={[0.04, 0.8 + (i % 3) * 0.25, 0.04]} pos={[(i % 3) * 0.12 - 0.12, 0.45, Math.floor(i / 3) * 0.12]} rot={[0, 0, (i % 2 ? 1 : -1) * 0.12]} color={i % 2 ? "#6f9c3f" : "#5b8a32"} r={0.01} />)}</group>;
}
function Palm({ pos, h = 4.5 }: { pos: V3; h?: number }) {
  return <group position={pos}>
    <mesh position={[0, h / 2, 0]} rotation={[0, 0, 0.12]} castShadow><cylinderGeometry args={[0.14, 0.22, h, 10]} /><Mat color="#9a7a52" /></mesh>
    {Array.from({ length: 7 }, (_, i) => { const a = (i / 7) * Math.PI * 2; return <Block key={i} size={[1.9, 0.04, 0.42]} pos={[0.28 + Math.cos(a) * 0.8, h - 0.15, Math.sin(a) * 0.8]} rot={[0, -a, -0.45]} color={i % 2 ? "#3f9a45" : "#4fae50"} r={0.02} />; })}
  </group>;
}
function Umbrella({ pos, color }: { pos: V3; color: string }) {
  return <group position={pos}>
    <Block size={[0.05, 2.2, 0.05]} pos={[0, 1.1, 0]} color="#f4f4f4" r={0.01} />
    <mesh position={[0, 2.25, 0]} castShadow><coneGeometry args={[1.2, 0.45, 12]} /><Mat color={color} /></mesh>
    <Block size={[0.7, 0.03, 1.5]} pos={[0.8, 0.03, 0.4]} color="#ff7ac8" r={0.01} />
  </group>;
}
function PatrolFlag({ pos }: { pos: V3 }) {
  return <group position={pos}>
    <Block size={[0.05, 2.4, 0.05]} pos={[0, 1.2, 0]} color="#e8e8e8" r={0.01} />
    <Sway amount={0.12} axis="z" speed={2.2}><group position={[0.4, 2.15, 0]}><Block size={[0.8, 0.25, 0.02]} pos={[0, 0.13, 0]} color="#e5302a" r={0.005} /><Block size={[0.8, 0.25, 0.02]} pos={[0, -0.12, 0]} color="#ffcf1a" r={0.005} /></group></Sway>
  </group>;
}
function BuoyLine({ from, to, n = 9 }: { from: [number, number]; to: [number, number]; n?: number }) {
  return <Bob amount={0.03} speed={1.4}>{Array.from({ length: n }, (_, i) => { const t = i / (n - 1); return <Ball key={i} pos={[from[0] + (to[0] - from[0]) * t, SWIM_SURFACE_Y + 0.05, from[1] + (to[1] - from[1]) * t]} r={0.13} color={i % 2 ? "#ffcf1a" : "#e5302a"} />; })}</Bob>;
}
function Jetty({ x, z, len, night, board = false }: { x: number; z: number; len: number; night: boolean; board?: boolean }) {
  return <group position={[x, 0, z]}>
    <Block size={[1.8, 0.14, len]} pos={[0, 0.2, -len / 2]} color={TIMBER} r={0.02} />
    {Array.from({ length: Math.floor(len / 1.6) + 1 }, (_, i) => [-0.8, 0.8].map((px) => <mesh key={`${i}${px}`} position={[px, -0.7, -i * 1.6 - 0.1]} castShadow><cylinderGeometry args={[0.09, 0.09, 1.9, 8]} /><Mat color={TIMBER_DARK} /></mesh>))}
    {board ? <group position={[0, 0.3, -len - 0.3]}>
      <Block size={[0.55, 0.08, 1.8]} pos={[0, 0.1, -0.5]} color="#2fb8c9" r={0.03} />
      <Block size={[0.5, 0.25, 0.3]} pos={[0, -0.02, 0.2]} color="#e8e8e8" r={0.03} />
    </group> : null}
    {/* A lifesaver ring on a post. */}
    <Block size={[0.08, 1.2, 0.08]} pos={[0.82, 0.85, -0.3]} color="#e8e8e8" r={0.01} />
    <mesh position={[0.82, 1.15, -0.22]}><torusGeometry args={[0.28, 0.08, 10, 22]} /><Mat color="#ff6a2a" /></mesh>
    {night ? <><Glow size={[0.1, 0, 0]} pos={[-0.82, 1.15, -len + 0.3]} round color={WARM} night={night} /><Block size={[0.06, 0.9, 0.06]} pos={[-0.82, 0.7, -len + 0.3]} color={TIMBER_DARK} r={0.01} /></> : null}
  </group>;
}
function Waterslide({ night }: { night: boolean }) {
  // A tower on the bank and a smooth curling chute that drops into the lake.
  const chute = useMemo(() => {
    const pts = [[0, 4.1, -0.6], [-1.4, 3.6, -1.6], [-2.6, 2.8, -0.8], [-2.4, 2.0, 0.8], [-1.0, 1.4, 1.2], [-1.6, 0.7, -0.6], [-3.4, 0.1, -2.6], [-4.6, SWIM_SURFACE_Y + 0.1, -3.6]];
    return new TubeGeometry(new CatmullRomCurve3(pts.map(([x, y, z]) => new Vector3(x, y, z))), 120, 0.5, 16, false);
  }, []);
  return <group position={[6.2, 0, 4.2]}>
    {[[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]].map(([x, z]) => <Block key={`${x}${z}`} size={[0.14, 4, 0.14]} pos={[x, 2, z]} color="#f4f4f4" r={0.03} />)}
    <Block size={[1.7, 0.16, 1.7]} pos={[0, 4, 0]} color="#2fb8c9" r={0.04} />
    <Block size={[1.7, 0.6, 0.06]} pos={[0, 4.4, 0.82]} color="#f4f4f4" r={0.02} />
    {Array.from({ length: 9 }, (_, i) => <Block key={i} size={[0.9, 0.06, 0.22]} pos={[0.85, 0.3 + i * 0.42, 0.4 - i * 0.12]} color="#e8e8e8" r={0.02} />)}
    <mesh geometry={chute} castShadow><meshStandardMaterial color="#ff5e8a" roughness={0.25} emissive="#ff5e8a" emissiveIntensity={night ? 0.35 : 0} /></mesh>
  </group>;
}
function Inflatable({ pos, kind }: { pos: V3; kind: "donut" | "flamingo" }) {
  return <Bob amount={0.05} speed={1.2}><group position={[pos[0], SWIM_SURFACE_Y + 0.08, pos[2]]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.5, 0.2, 12, 24]} /><Mat color={kind === "donut" ? "#ff9ac8" : "#ff6fa8"} rough={0.3} /></mesh>
    {kind === "flamingo" ? <><mesh position={[0, 0.5, -0.4]} rotation={[0.2, 0, 0]}><cylinderGeometry args={[0.09, 0.12, 1.0, 10]} /><Mat color="#ff6fa8" rough={0.3} /></mesh><Ball pos={[0, 1.0, -0.28]} r={0.16} color="#ff6fa8" /><Ball pos={[0, 0.95, -0.1]} r={0.06} scale={[1, 0.7, 1.6]} color="#1f2328" /></> : [0, 1, 2, 3, 4].map((i) => <Block key={i} size={[0.12, 0.03, 0.04]} pos={[Math.cos(i * 1.3) * 0.5, 0.2, Math.sin(i * 1.3) * 0.5]} rot={[0, i, 0]} color={["#ffcf4a", "#4fd6ff", "#7dd36b"][i % 3]} r={0.01} />)}
  </group></Bob>;
}
function LifeguardTower({ pos }: { pos: V3 }) {
  return <group position={pos}>
    {[[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].map(([x, z]) => <Block key={`${x}${z}`} size={[0.12, 2.4, 0.12]} pos={[x, 1.2, z]} color="#f4f4f4" r={0.02} />)}
    <Block size={[1.6, 0.14, 1.6]} pos={[0, 2.4, 0]} color="#e5302a" r={0.03} />
    <Block size={[1.6, 0.8, 1.6]} pos={[0, 2.85, 0]} color="#ffcf1a" r={0.04} />
    <Block size={[1.1, 0.4, 0.02]} pos={[0, 2.95, 0.81]} color="#1f2328" r={0.01} />
    <Block size={[1.9, 0.1, 1.9]} pos={[0, 3.3, 0]} color="#e5302a" r={0.03} />
  </group>;
}

export function SwimmingLakeModel({ level, night }: Props) {
  const [w, d] = LAKE_WATER_SIZE;
  return <group>
    <Water w={w} d={d} night={night} glow={level === 4} />
    {/* Level 1, the swimming hole: rocks, reeds and a rope swing from a branch. */}
    {[[-6.8, 0, -1.8, 1.4], [-7.4, 0, 0.6, 1], [4.2, 0, -4.4, 1.2], [6.8, 0, -1.6, 0.9], [-3.6, 0, 4.6, 0.8]].map(([x, y, z, s], i) => <Rock key={i} pos={[x, y + 0.2, z]} s={s} />)}
    <Reeds pos={[-5.6, 0, 3.4]} /><Reeds pos={[5.6, 0, -3.2]} /><Reeds pos={[-2.4, 0, -4.9]} />
    {level === 1 ? <group position={[-6.4, 0, -3.2]}>
      <mesh position={[0, 2.6, 0]} castShadow><cylinderGeometry args={[0.28, 0.4, 5.2, 10]} /><Mat color="#e8e2d6" /></mesh>
      <Block size={[3.2, 0.22, 0.22]} pos={[1.5, 4.6, 0.3]} rot={[0, -0.4, 0.15]} color="#e8e2d6" r={0.08} />
      <Sway amount={0.3} speed={1.3}><group position={[2.6, 4.7, 0.9]}><Block size={[0.03, 3.4, 0.03]} pos={[0, -1.7, 0]} color="#c9a36a" r={0.01} /><mesh position={[0, -3.4, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.2, 0.06, 8, 18]} /><Mat color="#1f2328" /></mesh></group></Sway>
      {[[-1, 4.2, 0.8, 1.4], [0.8, 5.0, -0.4, 1.6], [2.2, 5.1, 1.2, 1.2]].map(([x, y, z, r], i) => <mesh key={i} position={[x, y, z]} castShadow><icosahedronGeometry args={[r, 1]} /><meshStandardMaterial color={["#7c9a52", "#8aa95e", "#6c8a47"][i]} flatShading roughness={0.75} /></mesh>)}
    </group> : null}
    {/* Level 2 adds a sandy beach, an umbrella and a buoy line. */}
    {level >= 2 ? <>
      <mesh position={[0, 0.03, 4.6]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.38, 1]}><circleGeometry args={[6.4, 40, Math.PI, Math.PI]} /><meshStandardMaterial color={SAND} roughness={1} /></mesh>
      <Umbrella pos={[-2.6, 0, 5.6]} color="#2fb8c9" />
      <BuoyLine from={[-5.6, -1.4]} to={[5.6, -1.4]} />
    </> : null}
    {/* Level 3 adds a jetty with a diving board and the red-and-yellow patrol flags. */}
    {level >= 3 ? <>
      <Jetty x={3.6} z={5.4} len={5.2} night={night} board />
      <PatrolFlag pos={[-4.6, 0, 5.4]} /><PatrolFlag pos={[1.4, 0, 5.6]} />
    </> : null}
    {/* Level 4, the lagoon: a waterslide, palms, floaties, a lifeguard tower and glowing water. */}
    {level === 4 ? <>
      <Waterslide night={night} />
      <Palm pos={[-8.4, 0, 1.2]} /><Palm pos={[-6.6, 0, -4.2]} h={5.2} /><Palm pos={[7.8, 0, -3.6]} h={4.8} />
      <Inflatable pos={[-2.4, 0, -0.8]} kind="flamingo" /><Inflatable pos={[1.6, 0, 1.6]} kind="donut" />
      <LifeguardTower pos={[-6.4, 0, 4.9]} />
      <StringLights from={[-8.4, 3.8, 1.2]} to={[-6.4, 3.3, 4.9]} night={night} n={12} sag={0.5} colors={["#ff7ac8", "#ffd27a", "#7fe3ff"]} />
      <StringLights from={[-6.4, 3.3, 4.9]} to={[6.2, 4.2, 4.2]} night={night} n={12} sag={0.5} colors={["#ffd27a", "#9dff8a", "#ff7ac8"]} />
      <LightPool r={4} color="#3fd6ff" night={night} pos={[0, 0, 0]} />
      {night ? <pointLight position={[0, 0.6, 0]} intensity={6} distance={14} color="#3fd6ff" /> : null}
    </> : null}
  </group>;
}

export const WATER_MODELS = { swimming_lake: SwimmingLakeModel } as const satisfies Record<(typeof WATER_STYLES)[number], (props: Props) => ReactNode>;
