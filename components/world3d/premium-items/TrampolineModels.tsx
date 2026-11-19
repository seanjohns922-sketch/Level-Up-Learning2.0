"use client";
// Trampoline: four levels, from a mini trampoline to a glowing trampoline park. The avatar bounces on it.
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { useRef, type ReactNode } from "react";
import type { Group } from "three";
import { Ball, Block, C, M, Mat, type V3 } from "@/components/world3d/premium-homes/HomeKit";

type Props = { night: boolean };
const NEON_PINK = "#ff4fd8";
const NEON_BLUE = "#3fd0ff";

function Glowing({ color, night, day = 0.6, strength = 2.6 }: { color: string; night: boolean; day?: number; strength?: number }) {
  return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={night ? strength : day} roughness={0.4} />;
}
function Neon({ size, pos, color, night, rot }: { size: V3; pos: V3; color: string; night: boolean; rot?: V3 }) {
  return <mesh position={pos} rotation={rot}><boxGeometry args={size} /><Glowing color={color} night={night} /></mesh>;
}
function Legendary({ scale, pos, color = C.gold }: { scale: V3; pos: V3; color?: string }) {
  return <Sparkles count={50} scale={scale} position={pos} size={6} speed={0.4} color={color} />;
}
function GoldRing({ r, night }: { r: number; night: boolean }) {
  return <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[r, r + 0.09, 56]} /><meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={night ? 2 : 0.7} /></mesh>;
}
function Slab({ w, d, color = M.concrete, h = 0.12 }: { w: number; d: number; color?: string; h?: number }) {
  return <Block size={[w, h, d]} pos={[0, h / 2, 0]} color={color} r={0.04} />;
}
function Bob({ children, amount = 0.08, speed = 1.5 }: { children: ReactNode; amount?: number; speed?: number }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * speed) * amount; });
  return <group ref={ref}>{children}</group>;
}
function Kid({ pos, shirt, rot = 0 }: { pos: V3; shirt: string; rot?: number }) {
  return <group position={pos} rotation={[0, rot, 0]}><Block size={[0.2, 0.3, 0.14]} pos={[0, 0.42, 0]} color={shirt} r={0.06} />{[-0.05, 0.05].map((x) => <Block key={x} size={[0.07, 0.26, 0.08]} pos={[x, 0.14, 0]} color="#2d3a5a" r={0.03} />)}<Ball pos={[0, 0.7, 0]} r={0.12} color="#f2c49a" /><Ball pos={[0, 0.76, -0.02]} r={0.12} color="#4a2f1a" scale={[1, 0.6, 1]} /></group>;
}
function Tramp({ r, pos = [0, 0, 0] as V3, net = false, pad = C.blue, mat = "#26262e" }: { r: number; pos?: V3; net?: boolean; pad?: string; mat?: string }) {
  return (
    <group position={pos}>
      {Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2; return <Block key={i} size={[0.06, 0.55, 0.06]} pos={[Math.cos(a) * r * 0.92, 0.27, Math.sin(a) * r * 0.92]} color="#9aa0aa" r={0.02} />; })}
      <mesh position={[0, 0.55, 0]}><cylinderGeometry args={[r * 0.88, r * 0.88, 0.04, 32]} /><Mat color={mat} /></mesh>
      <mesh position={[0, 0.57, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[r * 0.94, 0.08, 10, 36]} /><Mat color={pad} /></mesh>
      {net ? <>{Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return <Block key={i} size={[0.04, 1.3, 0.04]} pos={[Math.cos(a) * r, 1.2, Math.sin(a) * r]} color={pad} r={0.015} />; })}<mesh position={[0, 1.2, 0]}><cylinderGeometry args={[r, r, 1.2, 32, 1, true]} /><meshStandardMaterial color="#20232c" transparent opacity={0.25} side={2} /></mesh><mesh position={[0, 1.85, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[r, 0.03, 6, 36]} /><Mat color={pad} /></mesh></> : null}
    </group>
  );
}
function Trampoline1() { return <Tramp r={0.7} />; }
function Trampoline2() { return <group><Tramp r={1.05} net /><Bob amount={0.25} speed={3}><Kid pos={[0, 0.9, 0]} shirt={C.yellow} /></Bob></group>; }
function Trampoline3() {
  return (
    <group>
      <Tramp r={1.0} net pad={C.teal} pos={[-0.7, 0, 0]} />
      <group position={[1.2, 0, 0]}><Block size={[1.3, 0.5, 1.3]} pos={[0, 0.25, 0]} color={M.charcoal} r={0.06} />{Array.from({ length: 18 }, (_, i) => <Block key={i} size={[0.2, 0.2, 0.2]} pos={[-0.45 + (i % 5) * 0.22, 0.58, -0.45 + Math.floor(i / 5) * 0.28]} rot={[i, i * 2, 0]} color={[C.red, C.yellow, C.blue, C.pink][i % 4]} r={0.06} />)}</group>
      <Bob amount={0.25} speed={3}><Kid pos={[-0.7, 0.9, 0]} shirt={C.red} /></Bob>
      <Sparkles count={12} scale={[3, 1.5, 2]} position={[0, 1.2, 0]} size={4} speed={0.4} color={C.gold} />
    </group>
  );
}
function Trampoline4({ night }: Props) {
  return (
    <group>
      <Slab w={3.6} d={3.0} color="#2b2f3d" h={0.16} />
      {[[-1.1, -0.65], [0, -0.65], [1.1, -0.65], [-1.1, 0.65], [0, 0.65], [1.1, 0.65]].map(([x, z], i) => (
        <group key={i} position={[x, 0.16, z]}>
          <Block size={[1.0, 0.14, 1.0]} pos={[0, 0.07, 0]} color={[NEON_BLUE, NEON_PINK, C.yellow][i % 3]} r={0.05} glow={night ? 1.2 : 0.3} />
          <Block size={[0.82, 0.04, 0.82]} pos={[0, 0.15, 0]} color="#1f2230" r={0.02} />
        </group>
      ))}
      {[0, 1].map((i) => <Bob key={i} amount={0.35} speed={2.6 + i}><Kid pos={[i ? 1.1 : -1.1, 0.5 + i * 0.2, i ? 0.65 : -0.65]} shirt={i ? C.gold : C.purple} /></Bob>)}
      <Block size={[3.6, 0.3, 0.1]} pos={[0, 0.3, -1.5]} color={M.charcoal} r={0.04} />
      <Neon size={[3.4, 0.06, 0.04]} pos={[0, 0.42, -1.44]} color={NEON_PINK} night={night} />
      {night ? <pointLight position={[0, 1.6, 0]} color={NEON_BLUE} intensity={4} distance={6} /> : null}
      <GoldRing r={2.1} night={night} />
      <Legendary scale={[3.6, 2.4, 3]} pos={[0, 1.4, 0]} color={NEON_BLUE} />
    </group>
  );
}

export const TRAMPOLINE_MODELS = [Trampoline1, Trampoline2, Trampoline3, Trampoline4] as const;
