"use client";
// Small shared pieces for premium world items: glowing panes, string lights, light pools, smoke and
// simple motion. Units are world metres (the explorer stands about 2 m tall).
import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import { AdditiveBlending, CanvasTexture, type Group, type Mesh, type MeshBasicMaterial } from "three";
import { Ball, Block } from "@/components/world3d/premium-homes/HomeKit";

export const WARM = "#ffd27a";

/** A white-to-clear radial gradient, made once and shared by every light pool. */
let poolTexture: CanvasTexture | null = null;
export function lightPoolTexture() {
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

/** A soft pool of light on the ground, after dark only (no real light, so lots of them stay fast). */
export function LightPool({ r, color, night, pos = [0, 0, 0] }: { r: number; color: string; night: boolean; pos?: [number, number, number] }) {
  if (!night) return null;
  return <mesh position={[pos[0], 0.03, pos[2]]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[r * 2, r * 2]} /><meshBasicMaterial map={lightPoolTexture()} color={color} transparent opacity={0.55} blending={AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>;
}

/** A glowing pane or bulb: brighter after dark. */
export function Glow({ size, pos, color, night, round = false, rot }: { size: [number, number, number]; pos: [number, number, number]; color: string; night: boolean; round?: boolean; rot?: [number, number, number] }) {
  return round
    ? <mesh position={pos}><sphereGeometry args={[size[0], 18, 14]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={night ? 3 : 0.8} roughness={0.3} /></mesh>
    : <Block size={size} pos={pos} rot={rot} color={color} r={Math.min(...size) / 3} glow={night ? 3 : 0.8} />;
}

export function Spin({ speed, children, axis = "y" }: { speed: number; children: ReactNode; axis?: "x" | "y" | "z" }) {
  const ref = useRef<Group>(null);
  useFrame((_, d) => { if (ref.current) ref.current.rotation[axis] += d * speed; });
  return <group ref={ref}>{children}</group>;
}

/** Floats gently up and down. */
export function Bob({ amount = 0.08, speed = 1.6, children }: { amount?: number; speed?: number; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * speed) * amount; });
  return <group ref={ref}>{children}</group>;
}

/** Rocks back and forth about its own origin (a swing seat, a sign in the wind). */
export function Sway({ amount, speed = 1.6, axis = "x", children }: { amount: number; speed?: number; axis?: "x" | "z"; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation[axis] = Math.sin(clock.elapsedTime * speed) * amount; });
  return <group ref={ref}>{children}</group>;
}

/** Little bulbs strung between two points, sagging in the middle. */
export function StringLights({ from, to, night, n = 9, sag = 0.18, colors = [WARM], r = 0.035 }: { from: [number, number, number]; to: [number, number, number]; night: boolean; n?: number; sag?: number; colors?: string[]; r?: number }) {
  return <group>{Array.from({ length: n }, (_, i) => { const t = (i + 0.5) / n; return <Ball key={i} pos={[from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t - Math.sin(t * Math.PI) * sag, from[2] + (to[2] - from[2]) * t]} r={r} color={colors[i % colors.length]} glow={night ? 3 : 0.6} />; })}</group>;
}

/** Soft puffs rising from a point: barbecue smoke, steam from a food truck. */
export function Puffs({ pos, color = "#d8d8d8", rise = 1.4, size = 0.16, rate = 0.35 }: { pos: [number, number, number]; color?: string; rise?: number; size?: number; rate?: number }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    ref.current?.children.forEach((child, i) => {
      const t = (clock.elapsedTime * rate + i / 4) % 1;
      child.position.set(Math.sin(t * 4 + i) * 0.08, t * rise, 0);
      child.scale.setScalar(size * (0.4 + t));
      ((child as Mesh).material as MeshBasicMaterial).opacity = 0.24 * (1 - t);
    });
  });
  return <group ref={ref} position={pos}>{[0, 1, 2, 3].map((i) => <mesh key={i}><sphereGeometry args={[1, 10, 8]} /><meshBasicMaterial color={color} transparent opacity={0.3} depthWrite={false} /></mesh>)}</group>;
}
