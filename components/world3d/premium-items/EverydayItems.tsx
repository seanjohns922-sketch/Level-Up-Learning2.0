"use client";
// The everyday keepers, four levels each: lamp post, bench, fence (joins up like a wall), mailbox and
// campfire. Units are world metres. Lamps glow with a light pool on the ground (no real lights, so a
// street full of them stays fast); only the campfire casts real light at night.
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { useRef, type ReactNode } from "react";
import { AdditiveBlending, CanvasTexture, Color, DoubleSide, type Group, type Mesh, type MeshBasicMaterial, type MeshStandardMaterial } from "three";
import { Ball, Block, C, M, Mat } from "@/components/world3d/premium-homes/HomeKit";
import type { PremiumHomeLevel } from "@/lib/world3d/premium-homes";

type Level = PremiumHomeLevel;
type Props = { level: Level; night: boolean };
const IRON = "#24302b", GOLD = "#ffc933", WARM = "#ffd27a", CRYSTAL = "#7df9ff", PINK = "#ff4fd8", TIMBER = "#a8703f", TIMBER_DARK = "#7a4d28";

/** A white-to-clear radial gradient, made once and shared by every light pool. */
let poolTexture: CanvasTexture | null = null;
function lightPoolTexture() {
  if (poolTexture || typeof document === "undefined") return poolTexture;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const g = canvas.getContext("2d")!, gradient = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.45, "rgba(255,255,255,0.45)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gradient;
  g.fillRect(0, 0, 128, 128);
  poolTexture = new CanvasTexture(canvas);
  return poolTexture;
}
/** A soft pool of light on the ground under a lamp, after dark only. */
function LightPool({ r, color, night }: { r: number; color: string; night: boolean }) {
  if (!night) return null;
  return <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[r * 2, r * 2]} /><meshBasicMaterial map={lightPoolTexture()} color={color} transparent opacity={0.55} blending={AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>;
}
/** A glowing pane or bulb: brighter after dark. */
function Glow({ size, pos, color, night, round = false }: { size: [number, number, number]; pos: [number, number, number]; color: string; night: boolean; round?: boolean }) {
  return round
    ? <mesh position={pos}><sphereGeometry args={[size[0], 18, 14]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={night ? 3 : 0.8} roughness={0.3} /></mesh>
    : <Block size={size} pos={pos} color={color} r={Math.min(...size) / 3} glow={night ? 3 : 0.8} />;
}
function Spin({ speed, children }: { speed: number; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * speed; });
  return <group ref={ref}>{children}</group>;
}
function Bob({ amount = 0.08, speed = 1.6, children }: { amount?: number; speed?: number; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * speed) * amount; });
  return <group ref={ref}>{children}</group>;
}
/** Little bulbs strung between two points, sagging in the middle. */
function StringLights({ from, to, night, n = 9, sag = 0.18, colors = [WARM] }: { from: [number, number, number]; to: [number, number, number]; night: boolean; n?: number; sag?: number; colors?: string[] }) {
  return <group>{Array.from({ length: n }, (_, i) => { const t = (i + 0.5) / n; return <Ball key={i} pos={[from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t - Math.sin(t * Math.PI) * sag, from[2] + (to[2] - from[2]) * t]} r={0.035} color={colors[i % colors.length]} glow={night ? 3 : 0.6} />; })}</group>;
}

/* ───────── Lamp post ───────── */
function Lantern({ night, color = WARM, s = 1 }: { night: boolean; color?: string; s?: number }) {
  return (
    <group scale={s}>
      <Block size={[0.32, 0.06, 0.32]} pos={[0, 0, 0]} color={IRON} r={0.02} />
      {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, z], i) => <Block key={i} size={[0.03, 0.42, 0.03]} pos={[x * 0.13, 0.24, z * 0.13]} color={IRON} r={0.01} />)}
      <Glow size={[0.24, 0.38, 0.24]} pos={[0, 0.24, 0]} color={color} night={night} />
      <mesh position={[0, 0.52, 0]}><coneGeometry args={[0.24, 0.22, 4]} /><Mat color={IRON} metal={0.4} /></mesh>
      <Ball pos={[0, 0.66, 0]} r={0.04} color={GOLD} />
    </group>
  );
}
function LampPost({ level, night }: Props) {
  if (level === 1) return (
    <group>
      <Block size={[0.4, 0.3, 0.4]} pos={[0, 0.15, 0]} color={IRON} r={0.06} />
      <mesh position={[0, 1.7, 0]}><cylinderGeometry args={[0.06, 0.09, 3.1, 14]} /><Mat color={IRON} metal={0.4} rough={0.4} /></mesh>
      {[0.5, 2.9].map((y) => <mesh key={y} position={[0, y, 0]}><torusGeometry args={[0.1, 0.025, 8, 18]} /><Mat color={IRON} /></mesh>)}
      <group position={[0, 3.25, 0]}><Lantern night={night} /></group>
      <LightPool r={2.2} color={WARM} night={night} />
    </group>
  );
  if (level === 2) return (
    <group>
      <Block size={[0.5, 0.36, 0.5]} pos={[0, 0.18, 0]} color={IRON} r={0.08} />
      <mesh position={[0, 1.85, 0]}><cylinderGeometry args={[0.07, 0.11, 3.4, 16]} /><Mat color={IRON} metal={0.4} rough={0.4} /></mesh>
      {/* Curled arms carry two lanterns; a basket of flowers hangs from the middle. */}
      {[-1, 1].map((s) => <group key={s}>
        <Block size={[0.72, 0.05, 0.05]} pos={[s * 0.36, 3.48, 0]} color={IRON} r={0.02} />
        <Block size={[0.05, 0.4, 0.05]} pos={[s * 0.28, 3.3, 0]} rot={[0, 0, s * 0.7]} color={IRON} r={0.02} />
        <mesh position={[s * 0.62, 3.56, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.08, 0.02, 8, 16]} /><Mat color={IRON} /></mesh>
        <group position={[s * 0.7, 2.92, 0]}><Block size={[0.03, 0.5, 0.03]} pos={[0, 0.3, 0]} color={IRON} r={0.01} /><Lantern night={night} s={0.9} /></group>
      </group>)}
      <group position={[0, 2.55, 0.12]}><mesh><sphereGeometry args={[0.22, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} /><Mat color={TIMBER_DARK} /></mesh>{[C.pink, C.yellow, C.white, C.purple, C.red, C.pink].map((c, i) => <Ball key={i} pos={[Math.cos(i) * 0.15, 0.03, Math.sin(i) * 0.15]} r={0.07} color={c} />)}</group>
      <Ball pos={[0, 3.6, 0]} r={0.08} color={GOLD} />
      <LightPool r={2.8} color={WARM} night={night} />
    </group>
  );
  if (level === 3) return (
    <group>
      {/* A smart city lamp: a white pole, an LED halo, a banner and a planter at its foot. */}
      <Block size={[0.9, 0.42, 0.9]} pos={[0, 0.21, 0]} color={M.concrete} r={0.1} />
      {[[-0.25, 0.2], [0.2, -0.22], [0.25, 0.25], [-0.2, -0.25]].map(([x, z], i) => <Ball key={i} pos={[x, 0.5, z]} r={0.13} color={C.leaf} />)}
      <mesh position={[0, 2.2, 0]}><cylinderGeometry args={[0.07, 0.1, 3.6, 18]} /><meshStandardMaterial color={M.white} metalness={0.3} roughness={0.3} /></mesh>
      <Block size={[0.7, 0.08, 0.08]} pos={[0.28, 3.95, 0]} color={M.white} r={0.03} />
      <group position={[0.6, 3.8, 0]}><mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.3, 0.05, 10, 32]} /><meshStandardMaterial color="#e8fbff" emissive="#bff4ff" emissiveIntensity={night ? 3 : 0.9} /></mesh><mesh rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.27, 28]} /><meshStandardMaterial color="#1d2b3a" side={DoubleSide} /></mesh></group>
      <Block size={[0.04, 1.0, 0.5]} pos={[0.08, 2.9, 0.27]} color={C.blue} r={0.02} />
      <Block size={[0.045, 0.3, 0.5]} pos={[0.08, 3.1, 0.27]} color={C.yellow} r={0.02} />
      <group position={[0.6, 0, 0]}><LightPool r={2.6} color="#bff4ff" night={night} /></group>
    </group>
  );
  return (
    <group>
      {/* Legendary: a gold post holding a floating crystal orb with sparkles round it. */}
      <Block size={[0.7, 0.2, 0.7]} pos={[0, 0.1, 0]} color={IRON} r={0.08} />
      <Block size={[0.5, 0.3, 0.5]} pos={[0, 0.35, 0]} color={GOLD} r={0.08} metal={0.6} rough={0.3} />
      <mesh position={[0, 2.0, 0]}><cylinderGeometry args={[0.07, 0.1, 3.2, 18]} /><meshStandardMaterial color={GOLD} metalness={0.7} roughness={0.25} /></mesh>
      {[0.9, 1.9, 2.9].map((y) => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.12, 0.025, 8, 20]} /><meshStandardMaterial color={CRYSTAL} emissive={CRYSTAL} emissiveIntensity={night ? 2.5 : 0.8} /></mesh>)}
      {[0, 1, 2].map((i) => <group key={i} rotation={[0, (i / 3) * Math.PI * 2, 0]}><Block size={[0.04, 0.5, 0.04]} pos={[0.16, 3.65, 0]} rot={[0, 0, -0.5]} color={GOLD} r={0.015} /></group>)}
      <group position={[0, 4.1, 0]}>
        <Bob><Spin speed={0.7}><mesh><octahedronGeometry args={[0.32, 0]} /><meshStandardMaterial color={CRYSTAL} emissive={CRYSTAL} emissiveIntensity={night ? 3.2 : 1.2} roughness={0.15} transparent opacity={0.92} /></mesh></Spin></Bob>
        <Spin speed={-1.4}><mesh rotation={[Math.PI / 2.3, 0, 0]}><torusGeometry args={[0.5, 0.018, 8, 40]} /><meshBasicMaterial color={GOLD} toneMapped={false} /></mesh></Spin>
      </group>
      <Sparkles count={20} scale={[1.4, 1.4, 1.4]} position={[0, 4.1, 0]} size={4} speed={0.6} color={CRYSTAL} />
      <LightPool r={3} color={CRYSTAL} night={night} />
    </group>
  );
}

/* ───────── Bench ───────── */
function Slats({ w, color, back = true }: { w: number; color: string; back?: boolean }) {
  return (
    <group>
      {[0, 1, 2].map((i) => <Block key={`s${i}`} size={[w, 0.05, 0.13]} pos={[0, 0.46, -0.16 + i * 0.15]} color={color} r={0.02} />)}
      {back ? [0, 1].map((i) => <Block key={`b${i}`} size={[w, 0.13, 0.05]} pos={[0, 0.66 + i * 0.18, -0.27 - i * 0.03]} rot={[-0.18, 0, 0]} color={color} r={0.02} />) : null}
    </group>
  );
}
function BenchFrame({ w, color = IRON, arms = false }: { w: number; color?: string; arms?: boolean }) {
  return (
    <group>
      {[-1, 1].map((s) => <group key={s} position={[s * (w / 2 - 0.08), 0, 0]}>
        <Block size={[0.07, 0.44, 0.07]} pos={[0, 0.22, 0.17]} color={color} r={0.02} />
        <Block size={[0.07, 0.9, 0.07]} pos={[0, 0.45, -0.24]} rot={[-0.15, 0, 0]} color={color} r={0.02} />
        <Block size={[0.07, 0.07, 0.48]} pos={[0, 0.42, -0.03]} color={color} r={0.02} />
        {arms ? <Block size={[0.1, 0.06, 0.5]} pos={[0, 0.66, 0]} color={TIMBER} r={0.02} /> : null}
        {arms ? <Block size={[0.06, 0.24, 0.06]} pos={[0, 0.54, 0.2]} color={color} r={0.02} /> : null}
      </group>)}
    </group>
  );
}
function Planter({ x, flowers }: { x: number; flowers: string[] }) {
  return <group position={[x, 0, 0]}><Block size={[0.42, 0.42, 0.42]} pos={[0, 0.21, 0]} color={M.slate} r={0.06} /><Ball pos={[0, 0.5, 0]} r={0.2} color={C.leaf} />{flowers.map((c, i) => <Ball key={i} pos={[Math.cos(i * 2.1) * 0.13, 0.62, Math.sin(i * 2.1) * 0.13]} r={0.06} color={c} />)}</group>;
}
function Swing({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.x = Math.sin(clock.elapsedTime * 1.3) * 0.12; });
  return <group ref={ref}>{children}</group>;
}
function Bench({ level, night }: Props) {
  if (level === 1) return <group><BenchFrame w={1.7} /><Slats w={1.7} color={TIMBER} /></group>;
  if (level === 2) return <group><BenchFrame w={1.8} arms /><Slats w={1.8} color="#b97a45" /><Planter x={-1.25} flowers={[C.pink, C.yellow, C.white]} /><Planter x={1.25} flowers={[C.purple, C.red, C.yellow]} /></group>;
  if (level === 3) return (
    <group>
      {/* A pergola over the bench, fairy lights along it, a cushion and a little side lamp. */}
      <BenchFrame w={1.8} arms /><Slats w={1.8} color="#b97a45" />
      <Block size={[1.2, 0.08, 0.36]} pos={[0, 0.51, -0.02]} color={C.teal} r={0.04} />
      {[[-1.05, -0.5], [1.05, -0.5], [-1.05, 0.5], [1.05, 0.5]].map(([x, z], i) => <Block key={i} size={[0.1, 2.3, 0.1]} pos={[x, 1.15, z]} color={TIMBER_DARK} r={0.03} />)}
      {[-0.5, 0.5].map((z) => <Block key={z} size={[2.4, 0.1, 0.12]} pos={[0, 2.32, z]} color={TIMBER_DARK} r={0.03} />)}
      {Array.from({ length: 7 }, (_, i) => <Block key={i} size={[0.08, 0.08, 1.3]} pos={[-1.05 + i * 0.35, 2.42, 0]} color={TIMBER} r={0.02} />)}
      <StringLights from={[-1.05, 2.25, 0.5]} to={[1.05, 2.25, 0.5]} night={night} n={11} sag={0.12} />
      {[[-0.6, 2.5, 0.2], [0.3, 2.5, -0.3], [0.8, 2.5, 0.35]].map(([x, y, z], i) => <Ball key={i} pos={[x, y, z]} r={0.16} color={C.leaf2} />)}
      <group position={[1.4, 0, 0.1]}><Block size={[0.06, 0.9, 0.06]} pos={[0, 0.45, 0]} color={IRON} r={0.02} /><Glow size={[0.12, 0.12, 0.12]} pos={[0, 0.98, 0]} color={WARM} night={night} round /></group>
      <LightPool r={1.6} color={WARM} night={night} />
    </group>
  );
  return (
    <group>
      {/* Legendary: a canopy swing seat that gently swings, with glowing bulbs and a gold frame. */}
      {[-1.15, 1.15].map((x) => <group key={x}><Block size={[0.1, 2.5, 0.1]} pos={[x, 1.25, -0.55]} rot={[0.12, 0, 0]} color={GOLD} r={0.03} metal={0.6} rough={0.3} /><Block size={[0.1, 2.5, 0.1]} pos={[x, 1.25, 0.55]} rot={[-0.12, 0, 0]} color={GOLD} r={0.03} metal={0.6} rough={0.3} /></group>)}
      <Block size={[2.5, 0.1, 0.1]} pos={[0, 2.45, 0]} color={GOLD} r={0.03} metal={0.6} rough={0.3} />
      <mesh position={[0, 2.62, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.65, 0.65, 2.5, 3, 1, true, -Math.PI / 6, Math.PI / 3 * 2]} /><meshStandardMaterial color={C.cream} side={DoubleSide} /></mesh>
      {Array.from({ length: 6 }, (_, i) => <Block key={i} size={[0.42, 0.025, 0.04]} pos={[-1.05 + i * 0.42, 2.25, 0.58]} color={i % 2 ? C.pink : C.teal} r={0.01} />)}
      <StringLights from={[-1.15, 2.35, 0.6]} to={[1.15, 2.35, 0.6]} night={night} n={12} sag={0.08} colors={[WARM, PINK, CRYSTAL]} />
      <group position={[0, 2.4, 0]}>
        <Swing>
          {[-0.85, 0.85].map((x) => <Block key={x} size={[0.025, 1.65, 0.025]} pos={[x, -0.82, 0]} color={IRON} r={0.01} />)}
          <group position={[0, -2.1, 0]}>
            <Slats w={1.8} color="#d9a066" />
            <Block size={[1.6, 0.1, 0.36]} pos={[0, 0.52, -0.02]} color={C.purple} r={0.05} />
            {[-0.55, 0.55].map((x) => <Block key={x} size={[0.36, 0.3, 0.12]} pos={[x, 0.72, -0.2]} rot={[-0.2, 0, 0]} color={x < 0 ? C.pink : C.teal} r={0.05} />)}
          </group>
        </Swing>
      </group>
      <LightPool r={1.8} color={PINK} night={night} />
    </group>
  );
}

/* ───────── Fence (one cell; joins to its neighbours) ───────── */
const FENCE_HEIGHT: Record<Level, number> = { 1: 1.15, 2: 1.0, 3: 1.4, 4: 1.3 };
function FenceSpan({ level, night }: { level: Level; night: boolean }) {
  // Runs along +x from the post to the cell edge (1 m); the neighbour's span meets it.
  const h = FENCE_HEIGHT[level];
  if (level === 1) return <group>{[0.38, 0.85].map((y) => <Block key={y} size={[1.0, 0.1, 0.07]} pos={[0.5, y, 0]} color={TIMBER} r={0.03} />)}</group>;
  if (level === 2) return (
    <group>
      {[0.3, 0.72].map((y) => <Block key={y} size={[1.0, 0.07, 0.05]} pos={[0.5, y, -0.04]} color={M.white} r={0.02} />)}
      {[0.22, 0.5, 0.78].map((x) => <group key={x}><Block size={[0.11, h - 0.12, 0.04]} pos={[x, (h - 0.12) / 2, 0]} color={M.white} r={0.02} /><mesh position={[x, h - 0.06, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[0.08, 0.14, 4]} /><Mat color={M.white} /></mesh></group>)}
    </group>
  );
  if (level === 3) return <group>{Array.from({ length: 6 }, (_, i) => <Block key={i} size={[1.0, 0.16, 0.06]} pos={[0.5, 0.18 + i * 0.21, 0]} color={i % 2 ? "#3b3f45" : "#2f3338"} r={0.02} />)}</group>;
  return (
    <group>
      <Block size={[1.0, 0.1, 0.12]} pos={[0.5, 0.1, 0]} color={IRON} r={0.03} />
      <Block size={[0.96, 0.03, 0.13]} pos={[0.5, 0.17, 0]} color={CRYSTAL} r={0.01} glow={night ? 2.6 : 0.8} />
      <mesh position={[0.5, h / 2 + 0.1, 0]}><boxGeometry args={[0.98, h - 0.25, 0.03]} /><meshStandardMaterial color="#cdefff" transparent opacity={0.35} metalness={0.2} roughness={0.05} /></mesh>
      <Block size={[1.0, 0.06, 0.08]} pos={[0.5, h - 0.05, 0]} color={GOLD} r={0.02} metal={0.6} rough={0.3} />
    </group>
  );
}
function FencePost({ level, night }: { level: Level; night: boolean }) {
  const h = FENCE_HEIGHT[level];
  if (level === 1) return <group><Block size={[0.14, h, 0.14]} pos={[0, h / 2, 0]} color={TIMBER_DARK} r={0.03} /><mesh position={[0, h + 0.04, 0]}><coneGeometry args={[0.1, 0.1, 4]} /><Mat color={TIMBER_DARK} /></mesh></group>;
  if (level === 2) return <group><Block size={[0.13, h + 0.08, 0.13]} pos={[0, (h + 0.08) / 2, 0]} color={M.white} r={0.03} /><Ball pos={[0, h + 0.14, 0]} r={0.07} color={M.white} /></group>;
  if (level === 3) return <group><Block size={[0.14, h + 0.1, 0.14]} pos={[0, (h + 0.1) / 2, 0]} color="#1f2226" r={0.03} /><Block size={[0.18, 0.08, 0.18]} pos={[0, h + 0.14, 0]} color="#1f2226" r={0.02} /><Glow size={[0.12, 0.06, 0.12]} pos={[0, h + 0.2, 0]} color={WARM} night={night} /></group>;
  return (
    <group>
      <Block size={[0.16, h + 0.1, 0.16]} pos={[0, (h + 0.1) / 2, 0]} color={GOLD} r={0.04} metal={0.6} rough={0.3} />
      <group position={[0, h + 0.32, 0]}><Bob amount={0.04}><Spin speed={0.8}><mesh><octahedronGeometry args={[0.13, 0]} /><meshStandardMaterial color={CRYSTAL} emissive={CRYSTAL} emissiveIntensity={night ? 3 : 1.1} /></mesh></Spin></Bob></group>
    </group>
  );
}
/** One fence cell: a post, with spans running half a cell towards each joined neighbour. */
export function EverydayFenceRun({ level, night, directions }: { level: Level; night: boolean; directions: readonly (readonly [number, number])[] }) {
  return <group><FencePost level={level} night={night} />{directions.map(([x, z]) => <group key={`${x}:${z}`} rotation={[0, Math.atan2(-z, x), 0]}><FenceSpan level={level} night={night} /></group>)}</group>;
}
function FenceSample({ level, night }: Props) {
  return <group>{[-2, 0, 2].map((x, i) => <group key={x} position={[x, 0, 0]}><EverydayFenceRun level={level} night={night} directions={i === 0 ? [[1, 0]] : i === 2 ? [[-1, 0]] : [[1, 0], [-1, 0]]} /></group>)}</group>;
}

/* ───────── Mailbox ───────── */
function Letter({ pos, rot = 0 }: { pos: [number, number, number]; rot?: number }) {
  return <group position={pos} rotation={[0, 0, rot]}><Block size={[0.22, 0.14, 0.01]} pos={[0, 0, 0]} color={M.white} r={0.005} /><Block size={[0.05, 0.04, 0.012]} pos={[0.07, 0.03, 0]} color={C.red} r={0.004} /></group>;
}
function Flag({ up = true }: { up?: boolean }) {
  return <group position={[0.2, 0.05, 0.1]} rotation={[0, 0, up ? 0 : -Math.PI / 2]}><Block size={[0.025, 0.32, 0.025]} pos={[0, 0.16, 0]} color={IRON} r={0.01} /><Block size={[0.02, 0.1, 0.14]} pos={[0, 0.27, 0.07]} color={C.red} r={0.01} /></group>;
}
/** A little delivery drone that flies out and back with a letter (Legendary mailbox). */
function MailDrone({ night }: { night: boolean }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 0.6;
    ref.current.position.set(Math.sin(t) * 0.7, 2.1 + Math.sin(t * 2) * 0.25, Math.cos(t) * 0.45);
    ref.current.rotation.y = t;
  });
  return (
    <group ref={ref}>
      <Block size={[0.26, 0.08, 0.26]} pos={[0, 0, 0]} color={M.white} r={0.04} />
      <Ball pos={[0, -0.01, 0.14]} r={0.03} color={CRYSTAL} glow={night ? 3 : 1} />
      {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, z], i) => <group key={i} position={[x * 0.18, 0.05, z * 0.18]}><Spin speed={30}><Block size={[0.18, 0.008, 0.03]} pos={[0, 0, 0]} color={M.slate} r={0.003} /></Spin></group>)}
      <Letter pos={[0, -0.13, 0]} />
    </group>
  );
}
function Mailbox({ level, night }: Props) {
  if (level === 1) return (
    <group>
      <Block size={[0.09, 1.0, 0.09]} pos={[0, 0.5, 0]} color={TIMBER_DARK} r={0.02} />
      <group position={[0, 1.0, 0]}>
        <Block size={[0.32, 0.26, 0.5]} pos={[0, 0.13, 0]} color={C.red} r={0.08} />
        <mesh position={[0, 0.26, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.16, 0.16, 0.5, 18, 1, false, 0, Math.PI]} /><Mat color={C.red} /></mesh>
        <Block size={[0.2, 0.03, 0.01]} pos={[0, 0.16, 0.255]} color="#111" r={0.005} />
        <Flag />
      </group>
    </group>
  );
  if (level === 2) return (
    <group>
      {/* A tiny house: walls, a roof, a round window, a number and the flag. */}
      <Block size={[0.1, 0.95, 0.1]} pos={[0, 0.48, 0]} color={M.white} r={0.02} />
      <Block size={[0.4, 0.08, 0.5]} pos={[0, 0.98, 0]} color={M.white} r={0.02} />
      <group position={[0, 1.02, 0]}>
        <Block size={[0.36, 0.32, 0.46]} pos={[0, 0.16, 0]} color={C.butter} r={0.04} />
        {[-1, 1].map((s) => <Block key={s} size={[0.04, 0.3, 0.56]} pos={[s * 0.13, 0.43, 0]} rot={[0, 0, s * 0.75]} color={C.red} r={0.02} />)}
        <Block size={[0.08, 0.06, 0.02]} pos={[0, 0.16, 0.235]} color="#111" r={0.01} />
        <mesh position={[0, 0.34, 0.235]}><circleGeometry args={[0.05, 16]} /><meshStandardMaterial color={C.glass} emissive={WARM} emissiveIntensity={night ? 1.5 : 0} /></mesh>
        <Block size={[0.14, 0.07, 0.015]} pos={[0, 0.06, 0.24]} color={GOLD} r={0.01} />
        <Letter pos={[0, 0.25, 0.24]} rot={0.1} />
        <Flag />
      </group>
      <Ball pos={[0.18, 0.12, 0.15]} r={0.12} color={C.leaf} />
    </group>
  );
  if (level === 3) return (
    <group>
      {/* A brick pillar with a parcel locker, a lamp on top and a house number. */}
      <Block size={[0.6, 1.25, 0.6]} pos={[0, 0.63, 0]} color="#b4553c" r={0.04} />
      {Array.from({ length: 6 }, (_, i) => <Block key={i} size={[0.62, 0.02, 0.62]} pos={[0, 0.18 + i * 0.2, 0]} color="#d9c3b0" r={0.005} />)}
      <Block size={[0.7, 0.08, 0.7]} pos={[0, 1.29, 0]} color={M.concrete} r={0.03} />
      <Block size={[0.4, 0.3, 0.03]} pos={[0, 0.95, 0.31]} color={IRON} r={0.03} />
      <Block size={[0.24, 0.025, 0.01]} pos={[0, 1.0, 0.325]} color="#666" r={0.005} />
      <Block size={[0.44, 0.42, 0.03]} pos={[0, 0.42, 0.31]} color={M.charcoal} r={0.03} />
      <Ball pos={[0.15, 0.42, 0.33]} r={0.02} color={GOLD} />
      <Block size={[0.22, 0.1, 0.015]} pos={[0, 0.72, 0.32]} color={GOLD} r={0.01} />
      <group position={[0, 1.33, 0]}><Lantern night={night} s={0.85} /></group>
      <LightPool r={1.4} color={WARM} night={night} />
    </group>
  );
  return (
    <group>
      {/* Legendary: a delivery-drone station with a landing pad and a drone bringing the mail. */}
      <Block size={[0.7, 0.18, 0.7]} pos={[0, 0.09, 0]} color={M.charcoal} r={0.05} />
      <mesh position={[0, 0.75, 0]}><cylinderGeometry args={[0.2, 0.27, 1.15, 20]} /><meshStandardMaterial color={M.white} metalness={0.3} roughness={0.25} /></mesh>
      <Block size={[0.32, 0.12, 0.02]} pos={[0, 0.85, 0.25]} color="#111" r={0.02} />
      <Block size={[0.3, 0.025, 0.015]} pos={[0, 0.85, 0.262]} color={CRYSTAL} r={0.008} glow={night ? 3 : 1} />
      <mesh position={[0, 1.36, 0]}><cylinderGeometry args={[0.42, 0.42, 0.07, 6]} /><meshStandardMaterial color={M.charcoal} /></mesh>
      <mesh position={[0, 1.4, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.24, 0.3, 6]} /><meshBasicMaterial color={CRYSTAL} toneMapped={false} /></mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => <Ball key={i} pos={[Math.cos(i * Math.PI / 3) * 0.38, 1.41, Math.sin(i * Math.PI / 3) * 0.38]} r={0.025} color={i % 2 ? PINK : CRYSTAL} glow={night ? 3 : 1} />)}
      <MailDrone night={night} />
      <LightPool r={1.5} color={CRYSTAL} night={night} />
    </group>
  );
}

/* ───────── Campfire ───────── */
/** Flickering flames; the Legendary fire cycles through magic colours. */
function Flames({ size, magic, night }: { size: number; magic: boolean; night: boolean }) {
  const ref = useRef<Group>(null);
  const colour = useRef(new Color());
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime;
    g.children.forEach((child, i) => {
      const mesh = child as Mesh;
      mesh.scale.y = 1 + Math.sin(t * (7 + i) + i * 2) * 0.18;
      mesh.scale.x = mesh.scale.z = 1 + Math.sin(t * (5 + i) + i) * 0.08;
      const material = mesh.material as MeshStandardMaterial;
      if (magic) { colour.current.setHSL(((t * 0.08 + i * 0.07) % 1), 0.9, 0.6); material.color.copy(colour.current); material.emissive.copy(colour.current); }
      material.emissiveIntensity = (night ? 2.6 : 1.4) + Math.sin(t * 11 + i) * 0.4;
    });
  });
  const tongues: [number, number, number, number, string][] = [[0, 0, 0.5, 0.2, "#ff7a1a"], [0.1, 0.06, 0.38, 0.13, "#ffb02e"], [-0.1, -0.05, 0.4, 0.14, "#ff9020"], [0.02, -0.1, 0.32, 0.11, "#ffd34d"], [-0.06, 0.09, 0.3, 0.1, "#ffe08a"]];
  return (
    <group ref={ref} scale={size}>
      {tongues.map(([x, z, h, r, c], i) => <mesh key={i} position={[x, h / 2 + 0.05, z]}><coneGeometry args={[r, h, 10]} /><meshStandardMaterial color={c} emissive={c} emissiveIntensity={2} transparent opacity={0.9} /></mesh>)}
    </group>
  );
}
function Logs() {
  return <group>{[0, 1, 2, 3].map((i) => <mesh key={i} position={[0, 0.1, 0]} rotation={[0.35, (i / 4) * Math.PI * 2, 0]}><cylinderGeometry args={[0.055, 0.065, 0.62, 10]} /><Mat color={TIMBER_DARK} /></mesh>)}<Ball pos={[0, 0.08, 0]} r={0.12} color="#ff5a1f" glow={2} /></group>;
}
function StoneRing({ r, n, color = "#8b8f97" }: { r: number; n: number; color?: string }) {
  return <group>{Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return <Ball key={i} pos={[Math.cos(a) * r, 0.07, Math.sin(a) * r]} r={0.11} scale={[1.2, 0.75, 1]} color={i % 3 ? color : "#a3a7ae"} />; })}</group>;
}
function LogSeat({ angle, r }: { angle: number; r: number }) {
  return <group rotation={[0, angle, 0]}><group position={[r, 0, 0]}><mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.2, 0.2, 1.1, 14]} /><Mat color={TIMBER} /></mesh><mesh position={[0, 0.2, 0.555]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.19, 14]} /><Mat color="#e0b47a" /></mesh></group></group>;
}
function Marshmallow({ angle }: { angle: number }) {
  return <group rotation={[0, angle, 0]}><Block size={[0.015, 0.015, 0.8]} pos={[0.55, 0.45, 0]} rot={[0, Math.PI / 2, 0.5]} color={TIMBER} r={0.005} /><Block size={[0.07, 0.07, 0.07]} pos={[0.2, 0.62, 0]} color={C.cream} r={0.025} /></group>;
}
function FireGlow({ night, color = "#ff8a3d", strength = 1 }: { night: boolean; color?: string; strength?: number }) {
  return <>{night ? <pointLight position={[0, 0.8, 0]} color={color} intensity={6 * strength} distance={7} /> : null}<LightPool r={1.6 * strength} color={color} night={night} /></>;
}
function Smoke() {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    ref.current?.children.forEach((child, i) => {
      const t = (clock.elapsedTime * 0.35 + i / 4) % 1;
      child.position.set(Math.sin(t * 4 + i) * 0.08, 0.7 + t * 1.4, 0);
      child.scale.setScalar(0.06 + t * 0.16);
      ((child as Mesh).material as MeshBasicMaterial).opacity = 0.22 * (1 - t);
    });
  });
  return <group ref={ref}>{[0, 1, 2, 3].map((i) => <mesh key={i}><sphereGeometry args={[1, 10, 8]} /><meshBasicMaterial color="#d8d8d8" transparent opacity={0.3} depthWrite={false} /></mesh>)}</group>;
}
function Campfire({ level, night }: Props) {
  if (level === 1) return <group><StoneRing r={0.42} n={10} /><Logs /><Flames size={1} magic={false} night={night} /><Smoke /><FireGlow night={night} /></group>;
  if (level === 2) return (
    <group>
      <StoneRing r={0.45} n={11} /><Logs /><Flames size={1.1} magic={false} night={night} /><Smoke />
      <LogSeat angle={0.3} r={1.35} /><LogSeat angle={Math.PI + 0.3} r={1.35} />
      <Marshmallow angle={0.6} /><Marshmallow angle={2.8} />
      <FireGlow night={night} strength={1.1} />
    </group>
  );
  if (level === 3) return (
    <group>
      {/* A stone fire pit, a seat circle, a kettle on a tripod and string lights on poles. */}
      <mesh position={[0, 0.14, 0]}><cylinderGeometry args={[0.62, 0.68, 0.28, 18, 1, true]} /><meshStandardMaterial color="#8b8f97" side={DoubleSide} roughness={0.9} /></mesh>
      <mesh position={[0, 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.5, 0.68, 24]} /><Mat color="#a3a7ae" /></mesh>
      <group position={[0, 0.15, 0]}><Logs /><Flames size={1.2} magic={false} night={night} /></group><Smoke />
      {[[-1, 1], [1, 1], [0, -1]].map(([sx, sz], i) => <group key={i}><Block size={[0.03, 1.0, 0.03]} pos={[sx * 0.22, 0.6, sz * 0.13]} rot={[sz * -0.2, 0, sx * -0.2]} color={IRON} r={0.01} /></group>)}
      <group position={[0, 0.98, 0]}><mesh position={[0, 0.0, 0]}><sphereGeometry args={[0.12, 16, 12]} /><Mat color={M.slate} metal={0.5} /></mesh><Block size={[0.12, 0.03, 0.03]} pos={[0.13, 0.03, 0]} rot={[0, 0, 0.5]} color={M.slate} r={0.01} /></group>
      {[0, 1, 2, 3, 4].map((i) => { const a = (i / 5) * Math.PI * 2 + 0.3; return <group key={i} position={[Math.cos(a) * 1.5, 0, Math.sin(a) * 1.5]}><Block size={[0.62, 0.36, 0.36]} pos={[0, 0.18, 0]} rot={[0, -a, 0]} color="#9ea2a9" r={0.08} /></group>; })}
      {[[-1.8, -1.8], [1.8, -1.8]].map(([x, z], i) => <Block key={i} size={[0.07, 2.2, 0.07]} pos={[x, 1.1, z]} color={TIMBER_DARK} r={0.02} />)}
      <StringLights from={[-1.8, 2.15, -1.8]} to={[1.8, 2.15, -1.8]} night={night} n={12} sag={0.3} colors={[WARM, C.pink, C.teal, C.yellow]} />
      <FireGlow night={night} strength={1.3} />
    </group>
  );
  return (
    <group>
      {/* Legendary: magic flames that change colour, glowing runes in the stone and sparks rising. */}
      <StoneRing r={0.6} n={12} color="#5b5f7a" />
      {Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2; return <mesh key={i} position={[Math.cos(a) * 1.0, 0.03, Math.sin(a) * 1.0]} rotation={[-Math.PI / 2, 0, a]}><ringGeometry args={[0.1, 0.14, 3]} /><meshBasicMaterial color={i % 2 ? CRYSTAL : PINK} toneMapped={false} /></mesh>; })}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.18, 1.24, 48]} /><meshBasicMaterial color={CRYSTAL} toneMapped={false} /></mesh>
      <Logs /><Flames size={1.5} magic night={night} />
      <Sparkles count={40} scale={[1, 3, 1]} position={[0, 1.6, 0]} size={5} speed={1.2} color={GOLD} />
      {[0.4, Math.PI + 0.4, Math.PI / 2 + 0.4].map((a) => <LogSeat key={a} angle={a} r={1.55} />)}
      <FireGlow night={night} color={PINK} strength={1.4} />
    </group>
  );
}

/** Each everyday style's model by level, in world metres. */
export const EVERYDAY_MODELS = {
  lamp_post: LampPost,
  bench: Bench,
  fence: FenceSample,
  mailbox: Mailbox,
  campfire: Campfire,
} as const;
