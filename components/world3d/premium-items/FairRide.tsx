"use client";
// Fair Ride: four levels, from a grand carousel to a giant neon fair.
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { useRef, type ReactNode } from "react";
import type { Group } from "three";
import { Ball, Block, C, FairyLights, M, Mat, type V3 } from "@/components/world3d/premium-homes/HomeKit";
import { LightPool } from "@/components/world3d/premium-items/ItemKit";

type Props = { night: boolean };
const NEON_PINK = "#ff4fd8";
const NEON_BLUE = "#3fd0ff";
const CRYSTAL = "#7df9ff";

function Glowing({ color, night, day = 0.6, strength = 2.6 }: { color: string; night: boolean; day?: number; strength?: number }) {
  return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={night ? strength : day} roughness={0.4} />;
}
function Spin({ children, speed = 0.4 }: { children: ReactNode; speed?: number }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * speed; });
  return <group ref={ref}>{children}</group>;
}
function Legendary({ scale, pos, color = C.gold }: { scale: V3; pos: V3; color?: string }) {
  return <Sparkles count={70} scale={scale} position={pos} size={8} speed={0.35} color={color} />;
}
function Floodlight({ pos, h, night, color = "#fff3c4" }: { pos: V3; h: number; night: boolean; color?: string }) {
  return <group position={pos}><Block size={[0.14, h, 0.14]} pos={[0, h / 2, 0]} color={M.charcoal} r={0.04} /><Block size={[0.6, 0.24, 0.3]} pos={[0, h, 0]} color={M.charcoal} r={0.05} /><Block size={[0.5, 0.04, 0.22]} pos={[0, h - 0.13, 0]} color={color} r={0.01} glow={night ? 3 : 0.3} /><Block size={[0.5, 0.16, 0.04]} pos={[0, h - 0.02, 0.15]} color={color} r={0.02} glow={night ? 3 : 0.3} /><LightPool r={3.2} color={color} night={night} /></group>;
}
function Horse({ color }: { color: string }) {
  return <group><Ball pos={[0, 0, 0]} r={0.2} color={color} scale={[0.7, 0.75, 1.4]} /><Ball pos={[0, 0.2, 0.26]} r={0.12} color={color} scale={[0.8, 1, 1.2]} />{[-0.08, 0.08].flatMap((x) => [-0.14, 0.14].map((z) => <Block key={`${x}${z}`} size={[0.05, 0.24, 0.05]} pos={[x, -0.2, z]} rot={[z > 0 ? -0.5 : 0.5, 0, 0]} color={color} r={0.02} />))}<Block size={[0.06, 0.06, 0.16]} pos={[0, 0.16, 0.14]} color={C.gold} r={0.02} /></group>;
}
function Carousel({ r, night }: { r: number; night: boolean }) {
  const cols = [C.white, C.yellow, C.pink, C.teal, C.purple, C.white];
  const n = Math.round(r * 5);
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}><cylinderGeometry args={[r, r * 1.04, 0.36, 40]} /><Mat color={C.white} /></mesh>
      <mesh position={[0, 0.37, 0]}><cylinderGeometry args={[r * 0.98, r * 0.98, 0.02, 40]} /><Mat color="#c08552" /></mesh>
      <Block size={[0.3, r * 1.3, 0.3]} pos={[0, 0.37 + r * 0.65, 0]} color={C.gold} r={0.08} metal={0.4} rough={0.35} />
      <Spin speed={0.5}>
        <group>
          {Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; const rr = r * 0.78; return <group key={i} position={[Math.cos(a) * rr, 0, Math.sin(a) * rr]}><Block size={[0.04, r * 1.3, 0.04]} pos={[0, 0.37 + r * 0.65, 0]} color={C.gold} r={0.015} metal={0.5} rough={0.3} /><group position={[0, 0.75 + (i % 2) * 0.15, 0]} rotation={[0, -a, 0]}><Horse color={cols[i % cols.length]} /></group></group>; })}
          {Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return <Block key={`c${i}`} size={[r * 0.42, 0.06, r * 1.04]} pos={[Math.cos(a) * r * 0.48, 0.42 + r * 1.32, Math.sin(a) * r * 0.48]} rot={[0, -a + Math.PI / 2, 0.38]} color={i % 2 ? C.white : C.red} r={0.02} />; })}
          {Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return <Ball key={`l${i}`} pos={[Math.cos(a) * r * 0.98, 0.28 + r * 1.32 - r * 0.38, Math.sin(a) * r * 0.98]} r={0.05} color={C.glow} glow={night ? 3 : 0.5} />; })}
        </group>
      </Spin>
      <mesh position={[0, 0.5 + r * 1.62, 0]}><coneGeometry args={[0.25, 0.5, 12]} /><Mat color={C.gold} metal={0.4} rough={0.35} /></mesh>
      <Block size={[0.5, 0.36, 0.04]} pos={[0, 0.5 + r * 1.95, 0]} color={C.red} r={0.03} />
    </group>
  );
}
function Gondola({ color }: { color: string }) {
  return <group><Block size={[0.04, 0.32, 0.04]} pos={[0, -0.16, 0]} color={C.trim} r={0.015} /><Block size={[0.56, 0.44, 0.5]} pos={[0, -0.55, 0]} color={color} r={0.12} /><Block size={[0.44, 0.2, 0.52]} pos={[0, -0.48, 0]} color="#bfe9ff" r={0.04} /><mesh position={[0, -0.3, 0]}><coneGeometry args={[0.42, 0.2, 4]} /><Mat color={C.white} /></mesh></group>;
}
function FerrisWheel({ r, cars, night, neon = false }: { r: number; cars: number; night: boolean; neon?: boolean }) {
  const wheel = useRef<Group>(null);
  useFrame((_, dt) => {
    if (!wheel.current) return;
    wheel.current.rotation.z += dt * 0.12;
    for (const child of wheel.current.children) if (child.userData.gondola) child.rotation.z = -wheel.current.rotation.z;
  });
  const colours = neon ? [C.gold, NEON_PINK, NEON_BLUE, C.purple, C.teal] : [C.red, C.yellow, C.blue, C.teal, C.pink, C.purple];
  const rim = (rr: number, color: string) => <mesh><torusGeometry args={[rr, 0.08, 10, 72]} />{neon ? <Glowing color={color} night={night} /> : <Mat color={C.white} />}</mesh>;
  return (
    <group>
      {[-1, 1].flatMap((sx) => [-0.55, 0.55].map((z) => <Block key={`${sx}${z}`} size={[0.2, r * 1.15, 0.2]} pos={[sx * r * 0.32, r * 0.55, z]} rot={[0, 0, -sx * 0.32]} color={neon ? "#2d2450" : C.white} r={0.06} />))}
      <group position={[0, r * 1.08, 0]}>
        <group ref={wheel}>
          {[-0.3, 0.3].map((z) => <group key={z} position={[0, 0, z]}>{rim(r, NEON_PINK)}{rim(r * 0.6, NEON_BLUE)}</group>)}
          {Array.from({ length: cars }, (_, i) => <Block key={`s${i}`} size={[0.07, r * 2, 0.07]} pos={[0, 0, 0]} rot={[0, 0, (i / cars) * Math.PI]} color={neon ? "#cfc6ff" : C.white} r={0.02} />)}
          {Array.from({ length: cars }, (_, i) => { const a = (i / cars) * Math.PI * 2; return <group key={i} position={[Math.cos(a) * r, Math.sin(a) * r, 0]} userData={{ gondola: true }}><Gondola color={colours[i % colours.length]} /></group>; })}
          {neon ? Array.from({ length: cars * 2 }, (_, i) => { const a = (i / (cars * 2)) * Math.PI * 2; return <Ball key={`b${i}`} pos={[Math.cos(a) * r * 1.04, Math.sin(a) * r * 1.04, 0.32]} r={0.07} color={i % 2 ? C.glow : CRYSTAL} glow={night ? 3 : 0.8} />; }) : null}
        </group>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.3, 0.3, 1.3, 16]} /><Mat color={C.gold} metal={0.5} rough={0.3} /></mesh>
      </group>
    </group>
  );
}
function SwingRide({ h, night }: { h: number; night: boolean }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.9; });
  return (
    <group>
      <mesh castShadow position={[0, 0.15, 0]}><cylinderGeometry args={[1.6, 1.7, 0.3, 32]} /><Mat color={C.white} /></mesh>
      <mesh castShadow position={[0, h / 2, 0]}><cylinderGeometry args={[0.18, 0.26, h, 16]} /><Mat color={C.purple} /></mesh>
      <group ref={ref} position={[0, h, 0]}>
        <mesh><coneGeometry args={[1.5, 0.6, 24]} /><Mat color={C.teal} /></mesh>
        {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <group key={i} position={[Math.cos(a) * 1.3, -0.3, Math.sin(a) * 1.3]} rotation={[Math.sin(a) * 0.45, 0, -Math.cos(a) * 0.45]}><Block size={[0.02, 1.2, 0.02]} pos={[0, -0.6, 0]} color="#ddd" r={0.006} /><Block size={[0.24, 0.06, 0.2]} pos={[0, -1.2, 0]} color={[C.red, C.yellow, C.blue, C.pink][i % 4]} r={0.03} /></group>; })}
        {Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return <Ball key={`l${i}`} pos={[Math.cos(a) * 1.45, -0.28, Math.sin(a) * 1.45]} r={0.05} color={C.glow} glow={night ? 3 : 0.4} />; })}
      </group>
    </group>
  );
}
function TicketBooth({ pos, color = C.red }: { pos: V3; color?: string }) {
  return <group position={pos}><Block size={[0.8, 0.9, 0.7]} pos={[0, 0.45, 0]} color={C.white} r={0.06} /><Block size={[0.5, 0.3, 0.04]} pos={[0, 0.6, 0.36]} color="#bfe9ff" r={0.02} /><mesh position={[0, 1.1, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[0.66, 0.4, 4]} /><Mat color={color} /></mesh></group>;
}
function Plaza({ w, d, color = M.concrete }: { w: number; d: number; color?: string }) {
  return <Block size={[w, 0.12, d]} pos={[0, 0.06, 0]} color={color} r={0.06} />;
}
function Fair1({ night }: Props) { return <group><Plaza w={5.6} d={5.6} /><Carousel r={2.2} night={night} /></group>; }
function Fair2({ night }: Props) { return <group><Plaza w={9.4} d={5.8} /><group position={[-2.3, 0.12, 0]}><Carousel r={2.2} night={night} /></group><group position={[2.6, 0.12, 0]}><SwingRide h={3.2} night={night} /></group><TicketBooth pos={[0.2, 0.12, 2.4]} /></group>; }
function Fair3({ night }: Props) {
  return (
    <group>
      <Plaza w={12.6} d={8} />
      <group position={[0, 0.12, -1.6]}><FerrisWheel r={4.4} cars={12} night={night} /></group>
      <group position={[-4.4, 0.12, 2]}><Carousel r={1.8} night={night} /></group>
      <group position={[4.4, 0.12, 2]}><SwingRide h={3.0} night={night} /></group>
      <TicketBooth pos={[0, 0.12, 3.2]} color={C.purple} />
      <FairyLights from={[-6, 2.2, 3.8]} to={[6, 2.2, 3.8]} sag={0.4} night={night} n={18} />
      {[-6, 6].map((x) => <Block key={x} size={[0.12, 2.3, 0.12]} pos={[x, 1.15, 3.8]} color={C.timberDark} r={0.04} />)}
    </group>
  );
}
function Fair4({ night }: Props) {
  return (
    <group>
      <Plaza w={16} d={10} color="#2b2f3d" />
      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[4.4, 4.6, 80]} /><Glowing color={NEON_PINK} night={night} /></mesh>
      <group position={[0, 0.12, -2.2]}><FerrisWheel r={6.4} cars={16} night={night} neon /></group>
      <group position={[-5.8, 0.12, 2.4]}><Carousel r={2.0} night={night} /></group>
      <group position={[5.8, 0.12, 2.4]}><SwingRide h={3.6} night={night} /></group>
      <TicketBooth pos={[-1.6, 0.12, 4.2]} color={C.gold} /><TicketBooth pos={[1.6, 0.12, 4.2]} color={C.gold} />
      {[[-7.6, 4.6], [7.6, 4.6], [-7.6, -4.6], [7.6, -4.6]].map(([x, z], i) => <Floodlight key={i} pos={[x, 0.12, z]} h={4} night={night} color={i % 2 ? NEON_BLUE : NEON_PINK} />)}
      <FairyLights from={[-7.6, 3.6, 4.6]} to={[7.6, 3.6, 4.6]} sag={0.6} night={night} n={24} />
      {night ? <pointLight position={[0, 6, 2]} color={NEON_PINK} intensity={8} distance={14} /> : null}
      <Legendary scale={[15, 14, 8]} pos={[0, 6, -1]} color={NEON_PINK} />
    </group>
  );
}

export const FAIR_RIDE_MODELS = [Fair1, Fair2, Fair3, Fair4] as const;
