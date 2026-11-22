"use client";
// City Life: everyday places, four levels each. Playground, cricket nets, park BBQ, cubby house,
// outdoor setting, bus stop, food truck and vending kiosk. Units are world metres (the explorer
// stands about 2 m tall); the front faces +z. Night glows use emissive panes and light pools only.
import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import { DoubleSide, type Group, type Mesh } from "three";
import { Ball, Block, C, Mat } from "@/components/world3d/premium-homes/HomeKit";
import type { CITY_LIFE_STYLES, PremiumHomeLevel } from "@/lib/world3d/premium-homes";
import { Glow, LightPool, Puffs, Spin, StringLights, Sway, WARM } from "./ItemKit";

type Props = { level: PremiumHomeLevel; night: boolean };
type V3 = [number, number, number];
const STEEL = "#8a96a3", STEEL_DARK = "#4b5560", RUBBER = "#c4563f", MULCH = "#8a5a3c", NEON_PINK = "#ff4fd8", NEON_CYAN = "#3fe6ff";
const PLAY = { teal: "#22c3b3", yellow: "#ffcc33", red: "#ff5e57", blue: "#4c8dff", purple: "#9a63ff" };
const TIMBER = "#c98a52", TIMBER_DARK = "#8f5a2e";
const BRICK = "#b5553c", CONCRETE = "#cfccc4";

/* ───────── Shared bits ───────── */
function Post({ pos, h, r = 0.07, color = STEEL, top = 0 }: { pos: [number, number]; h: number; r?: number; color?: string; top?: number }) {
  return <mesh position={[pos[0], top + h / 2, pos[1]]} castShadow><cylinderGeometry args={[r, r, h, 12]} /><Mat color={color} metal={0.3} rough={0.45} /></mesh>;
}
/** A thin rod between two points (chains, rails, ropes). */
function Rod({ from, to, r = 0.025, color = STEEL_DARK }: { from: V3; to: V3; r?: number; color?: string }) {
  const dx = to[0] - from[0], dy = to[1] - from[1], dz = to[2] - from[2];
  const length = Math.hypot(dx, dy, dz);
  const mid: V3 = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  // Point the cylinder's y axis along the rod.
  const yaw = Math.atan2(dx, dz), pitch = Math.acos(dy / length);
  return <group position={mid} rotation={[0, yaw, 0]}><mesh rotation={[pitch, 0, 0]}><cylinderGeometry args={[r, r, length, 8]} /><Mat color={color} metal={0.4} /></mesh></group>;
}
/** A flat pad on the ground: soft-fall rubber, a concrete slab, a deck. */
function Pad({ size, color, y = 0.04, round = false }: { size: [number, number]; color: string; y?: number; round?: boolean }) {
  return round
    ? <mesh position={[0, y / 2, 0]} receiveShadow><cylinderGeometry args={[size[0] / 2, size[0] / 2, y, 40]} /><Mat color={color} rough={0.95} /></mesh>
    : <Block size={[size[0], y, size[1]]} pos={[0, y / 2, 0]} color={color} r={Math.min(0.02, y / 2)} rough={0.95} />;
}
function PicnicTable({ pos = [0, 0, 0], rot = 0, color = TIMBER, length = 1.9 }: { pos?: V3; rot?: number; color?: string; length?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Block size={[length, 0.08, 0.8]} pos={[0, 1.0, 0]} color={color} r={0.03} />
      {[-1, 1].map((s) => <Block key={s} size={[length, 0.07, 0.34]} pos={[0, 0.58, s * 0.72]} color={color} r={0.03} />)}
      {[-1, 1].map((s) => <group key={s} position={[s * (length / 2 - 0.25), 0, 0]}>
        <Block size={[0.08, 1.05, 0.08]} pos={[0, 0.5, 0.3]} rot={[-0.42, 0, 0]} color={TIMBER_DARK} r={0.02} />
        <Block size={[0.08, 1.05, 0.08]} pos={[0, 0.5, -0.3]} rot={[0.42, 0, 0]} color={TIMBER_DARK} r={0.02} />
        <Block size={[0.08, 0.06, 1.7]} pos={[0, 0.52, 0]} color={TIMBER_DARK} r={0.02} />
      </group>)}
    </group>
  );
}
function Umbrella({ pos = [0, 0, 0], color = C.red, alt = "#fff6e6", r = 1.3, h = 2.7 }: { pos?: V3; color?: string; alt?: string; r?: number; h?: number }) {
  return (
    <group position={pos}>
      <Post pos={[0, 0]} h={h} r={0.04} color="#ececec" />
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[0, h - 0.1, 0]} rotation={[0, (i / 8) * Math.PI * 2, 0]}>
          <coneGeometry args={[r, 0.55, 2, 1, true, 0, Math.PI / 4]} />
          <meshStandardMaterial color={i % 2 ? alt : color} side={DoubleSide} roughness={0.7} />
        </mesh>
      ))}
      <Ball pos={[0, h + 0.2, 0]} r={0.06} color="#ececec" />
    </group>
  );
}
function Chair({ pos, rot = 0, color = "#3a3f4a", seat = 0.55 }: { pos: V3; rot?: number; color?: string; seat?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Block size={[0.5, 0.06, 0.5]} pos={[0, seat, 0]} color={color} r={0.03} />
      <Block size={[0.5, 0.55, 0.06]} pos={[0, seat + 0.3, -0.24]} color={color} r={0.03} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => <Block key={i} size={[0.04, seat, 0.04]} pos={[x * 0.21, seat / 2, z * 0.21]} color={STEEL_DARK} r={0.01} />)}
    </group>
  );
}
function Stool({ pos, color = PLAY.red }: { pos: V3; color?: string }) {
  return <group position={pos}><Post pos={[0, 0]} h={0.8} r={0.03} color={STEEL} /><mesh position={[0, 0.82, 0]}><cylinderGeometry args={[0.22, 0.22, 0.08, 16]} /><Mat color={color} /></mesh></group>;
}
/** Flat roof on four posts (shelters, pergolas). */
function Shelter({ w, d, h, color = TIMBER, roof = "#5a6470", slats = false, night, lights }: { w: number; d: number; h: number; color?: string; roof?: string; slats?: boolean; night: boolean; lights?: string[] }) {
  return (
    <group>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => <Block key={i} size={[0.16, h, 0.16]} pos={[x * (w / 2 - 0.1), h / 2, z * (d / 2 - 0.1)]} color={color} r={0.03} />)}
      {[-1, 1].map((z) => <Block key={z} size={[w, 0.16, 0.12]} pos={[0, h, z * (d / 2 - 0.1)]} color={color} r={0.03} />)}
      {slats
        ? Array.from({ length: Math.round(w / 0.45) }, (_, i) => <Block key={i} size={[0.08, 0.14, d + 0.3]} pos={[-w / 2 + 0.2 + i * 0.45, h + 0.14, 0]} color={color} r={0.02} />)
        : <Block size={[w + 0.4, 0.14, d + 0.4]} pos={[0, h + 0.15, 0]} color={roof} r={0.04} />}
      {lights ? <StringLights from={[-w / 2, h - 0.05, d / 2 - 0.1]} to={[w / 2, h - 0.05, d / 2 - 0.1]} night={night} n={Math.round(w * 3)} sag={0.22} colors={lights} /> : null}
    </group>
  );
}

/* ───────── Playground (5 × 5 squares) ───────── */
function SwingSet({ pos = [0, 0, 0], seats = 2, color = PLAY.blue }: { pos?: V3; seats?: number; color?: string }) {
  const w = seats * 1.0 + 0.6, h = 3.0;
  return (
    <group position={pos}>
      {[-1, 1].map((s) => <group key={s} position={[s * w / 2, 0, 0]}>
        <Block size={[0.1, h + 0.2, 0.1]} pos={[0, h / 2, 0.55]} rot={[-0.19, 0, 0]} color={color} r={0.03} />
        <Block size={[0.1, h + 0.2, 0.1]} pos={[0, h / 2, -0.55]} rot={[0.19, 0, 0]} color={color} r={0.03} />
      </group>)}
      <mesh position={[0, h, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.07, 0.07, w + 0.2, 12]} /><Mat color={color} metal={0.3} /></mesh>
      {Array.from({ length: seats }, (_, i) => (
        <group key={i} position={[-w / 2 + 0.8 + i * 1.0, h, 0]}>
          <Sway amount={0.35} speed={1.8 + i * 0.3}>
            <Rod from={[-0.2, 0, 0]} to={[-0.2, -2.35, 0]} r={0.015} />
            <Rod from={[0.2, 0, 0]} to={[0.2, -2.35, 0]} r={0.015} />
            <Block size={[0.5, 0.06, 0.24]} pos={[0, -2.38, 0]} color={i % 2 ? PLAY.yellow : PLAY.red} r={0.03} />
          </Sway>
        </group>
      ))}
    </group>
  );
}
function Slide({ pos = [0, 0, 0], rot = 0, height = 1.5, color = PLAY.yellow }: { pos?: V3; rot?: number; height?: number; color?: string }) {
  const run = height * 1.7, length = Math.hypot(run, height), angle = Math.atan2(height, run);
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <group position={[0, height / 2 + 0.12, run / 2]} rotation={[angle, 0, 0]}>
        <Block size={[0.6, 0.06, length]} pos={[0, 0, 0]} color={color} r={0.03} />
        {[-1, 1].map((s) => <Block key={s} size={[0.06, 0.2, length]} pos={[s * 0.3, 0.1, 0]} color={color} r={0.03} />)}
      </group>
      <Block size={[0.6, 0.06, 0.5]} pos={[0, 0.14, run + 0.2]} color={color} r={0.03} />
    </group>
  );
}
function Tower({ pos = [0, 0, 0], deck = 1.5, size = 1.4, color = PLAY.teal, roof = PLAY.red, night, glowRoof = false }: { pos?: V3; deck?: number; size?: number; color?: string; roof?: string; night: boolean; glowRoof?: boolean }) {
  const h = deck + 1.3;
  return (
    <group position={pos}>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => <Block key={i} size={[0.12, h, 0.12]} pos={[x * size / 2, h / 2, z * size / 2]} color={color} r={0.03} />)}
      <Block size={[size + 0.1, 0.1, size + 0.1]} pos={[0, deck, 0]} color={TIMBER} r={0.03} />
      {[-1, 1].map((x) => <Block key={x} size={[0.06, 0.6, size]} pos={[x * size / 2, deck + 0.35, 0]} color={color} r={0.02} />)}
      <mesh position={[0, h + 0.38, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[size * 0.85, 0.8, 4]} /><Mat color={roof} glow={glowRoof && night ? 1.2 : 0} /></mesh>
    </group>
  );
}
function Ladder({ pos, rot = 0, height }: { pos: V3; rot?: number; height: number }) {
  const rungs = Math.max(3, Math.round(height / 0.3));
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {[-1, 1].map((s) => <Block key={s} size={[0.06, height + 0.3, 0.06]} pos={[s * 0.25, (height + 0.3) / 2, 0]} rot={[-0.2, 0, 0]} color={STEEL} r={0.02} />)}
      {Array.from({ length: rungs }, (_, i) => <Block key={i} size={[0.5, 0.04, 0.04]} pos={[0, 0.25 + i * (height / rungs), 0.05 - i * 0.06]} color={STEEL} r={0.015} />)}
    </group>
  );
}
function Playground({ level, night }: Props) {
  if (level === 1) return (
    <group>
      <Pad size={[5.4, 4]} color={MULCH} />
      <SwingSet seats={2} />
    </group>
  );
  if (level === 2) return (
    <group>
      <Pad size={[8, 5.5]} color={RUBBER} />
      <SwingSet pos={[-1.9, 0, 0]} seats={2} />
      <group position={[2.2, 0, -1]}>
        <Tower deck={1.5} size={1.3} night={night} />
        <Slide pos={[0, 0, 0.65]} height={1.5} />
        <Ladder pos={[-0.95, 0, 0]} rot={-Math.PI / 2} height={1.5} />
      </group>
    </group>
  );
  if (level === 3) return (
    <group>
      <Pad size={[9.4, 8.4]} color={RUBBER} />
      <SwingSet pos={[-2.8, 0, 1.6]} seats={3} color={PLAY.purple} />
      <group position={[1.6, 0, -1.6]}>
        <Tower pos={[-1.2, 0, 0]} deck={1.8} size={1.4} night={night} />
        <Tower pos={[1.6, 0, 0]} deck={1.4} size={1.3} color={PLAY.blue} roof={PLAY.yellow} night={night} />
        {/* Monkey bars between the towers. */}
        {[-1, 1].map((z) => <Rod key={z} from={[-0.5, 2.5, z * 0.35]} to={[0.9, 2.5, z * 0.35]} r={0.04} color={PLAY.yellow} />)}
        {Array.from({ length: 5 }, (_, i) => <Rod key={i} from={[-0.4 + i * 0.27, 2.5, -0.35]} to={[-0.4 + i * 0.27, 2.5, 0.35]} r={0.03} color={STEEL} />)}
        <Slide pos={[-1.2, 0, 0.7]} height={1.8} color={PLAY.red} />
        {/* A climbing wall with coloured holds. */}
        <Block size={[1.3, 1.9, 0.12]} pos={[1.6, 0.95, 0.75]} rot={[-0.25, 0, 0]} color="#e9e2d0" r={0.04} />
        {Array.from({ length: 9 }, (_, i) => <Ball key={i} pos={[1.15 + (i % 3) * 0.45, 0.35 + Math.floor(i / 3) * 0.55, 0.92 - Math.floor(i / 3) * 0.13]} r={0.07} color={[PLAY.red, PLAY.teal, PLAY.yellow][i % 3]} />)}
      </group>
    </group>
  );
  return (
    <group>
      {/* Adventure playground: two tall towers joined by a rope bridge, a spiral tube slide, a spinning carousel and a flying fox. */}
      <Pad size={[9.8, 9.8]} color="#3fb5a6" />
      <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[3.2, 3.5, 48]} /><Mat color={PLAY.yellow} /></mesh>
      <Tower pos={[-2.6, 0, -2.6]} deck={2.4} size={1.6} color={PLAY.purple} roof={NEON_PINK} night={night} glowRoof />
      <Tower pos={[2.6, 0, -2.6]} deck={2.0} size={1.5} color={PLAY.blue} roof={NEON_CYAN} night={night} glowRoof />
      {/* Rope bridge with sagging planks. */}
      {Array.from({ length: 9 }, (_, i) => { const t = (i + 0.5) / 9; return <Block key={i} size={[0.3, 0.05, 0.7]} pos={[-1.8 + t * 3.6, 2.4 - 0.4 * t - Math.sin(t * Math.PI) * 0.3, -2.6]} color={TIMBER} r={0.02} />; })}
      {[-1, 1].map((z) => <Rod key={z} from={[-1.8, 3.1, -2.6 + z * 0.4]} to={[1.8, 2.7, -2.6 + z * 0.4]} r={0.025} color="#e8d9b5" />)}
      {/* Spiral tube slide wrapping the tall tower. */}
      {Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 1.6 + Math.PI * 0.2; return <mesh key={i} position={[-2.6 + Math.cos(a) * 1.35, 2.3 - i * 0.16, -2.6 + Math.sin(a) * 1.35]} rotation={[0, -a, 0.25]}><cylinderGeometry args={[0.36, 0.36, 0.42, 14, 1, true]} /><meshStandardMaterial color={i % 2 ? PLAY.yellow : PLAY.red} side={DoubleSide} roughness={0.5} /></mesh>; })}
      <Slide pos={[2.6, 0, -1.8]} height={2.0} color={PLAY.teal} />
      {/* Spinning carousel. */}
      <group position={[0, 0, 1.6]}>
        <Spin speed={0.9}>
          <mesh position={[0, 0.22, 0]} castShadow><cylinderGeometry args={[1.25, 1.3, 0.14, 28]} /><Mat color={PLAY.red} /></mesh>
          {Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2; return <group key={i}><Rod from={[Math.cos(a) * 1.0, 0.3, Math.sin(a) * 1.0]} to={[Math.cos(a) * 0.2, 1.05, Math.sin(a) * 0.2]} r={0.035} color={PLAY.yellow} /></group>; })}
          <Post pos={[0, 0]} h={1.15} r={0.06} color={PLAY.yellow} />
        </Spin>
      </group>
      {/* Flying fox: a cable with a seat that rides along it. */}
      <Post pos={[-4.4, 3.6]} h={3.2} r={0.1} color={PLAY.purple} /><Post pos={[4.4, 3.6]} h={2.4} r={0.1} color={PLAY.purple} />
      <Rod from={[-4.4, 3.2, 3.6]} to={[4.4, 2.4, 3.6]} r={0.02} color={STEEL_DARK} />
      <FlyingFoxSeat />
      <SwingSet pos={[0, 0, -0.9]} seats={2} color={PLAY.teal} />
      <StringLights from={[-2.6, 3.9, -2.6]} to={[2.6, 3.5, -2.6]} night={night} n={14} sag={0.5} colors={[NEON_PINK, NEON_CYAN, PLAY.yellow]} />
      <LightPool r={4.5} color={NEON_CYAN} night={night} />
    </group>
  );
}
function FlyingFoxSeat() {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (Math.sin(clock.elapsedTime * 0.5) + 1) / 2;
    ref.current.position.set(-4.1 + t * 8.2, 3.15 - t * 0.75, 3.6);
  });
  return <group ref={ref}><Rod from={[0, 0, 0]} to={[0, -1.2, 0]} r={0.015} /><mesh position={[0, -1.25, 0]}><cylinderGeometry args={[0.22, 0.22, 0.08, 16]} /><Mat color={PLAY.red} /></mesh></group>;
}

/* ───────── Cricket nets (3 × 6 squares, the pitch runs along z) ───────── */
function Stumps({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      {[-0.11, 0, 0.11].map((x) => <mesh key={x} position={[x, 0.36, 0]} castShadow><cylinderGeometry args={[0.025, 0.025, 0.72, 8]} /><Mat color="#f2e6c8" /></mesh>)}
      {[-0.055, 0.055].map((x) => <Block key={x} size={[0.11, 0.025, 0.03]} pos={[x, 0.735, 0]} color="#e8d6a8" r={0.01} />)}
    </group>
  );
}
function Bat({ pos, rot = [0, 0, 0] }: { pos: V3; rot?: V3 }) {
  return <group position={pos} rotation={rot}><Block size={[0.11, 0.6, 0.04]} pos={[0, 0.3, 0]} color="#e9cf9a" r={0.03} /><mesh position={[0, 0.78, 0]}><cylinderGeometry args={[0.025, 0.025, 0.36, 8]} /><Mat color="#1f2a44" /></mesh></group>;
}
function Pitch({ length, color = "#e3d6a6" }: { length: number; color?: string }) {
  return (
    <group>
      <Block size={[2.2, 0.04, length]} pos={[0, 0.03, 0]} color={color} r={0.01} rough={0.95} />
      {[-1, 1].map((end) => <group key={end}>
        <Block size={[2.0, 0.005, 0.05]} pos={[0, 0.055, end * (length / 2 - 1.2)]} color="#ffffff" r={0.002} />
        {[-0.75, 0.75].map((x) => <Block key={x} size={[0.04, 0.005, 1.0]} pos={[x, 0.055, end * (length / 2 - 0.8)]} color="#ffffff" r={0.002} />)}
      </group>)}
    </group>
  );
}
function NetCage({ length, width = 3.4, height = 3.2, z = 0 }: { length: number; width?: number; height?: number; z?: number }) {
  const net = <meshStandardMaterial color="#20262d" transparent opacity={0.32} side={DoubleSide} roughness={1} depthWrite={false} />;
  return (
    <group position={[0, 0, z]}>
      {[-1, 1].map((x) => <mesh key={x} position={[x * width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[length, height]} />{net}</mesh>)}
      <mesh position={[0, height / 2, -length / 2]}><planeGeometry args={[width, height]} />{net}</mesh>
      <mesh position={[0, height, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[width, length]} />{net}</mesh>
      {[-1, 1].flatMap((x) => [-0.5, 0, 0.5].map((t) => <Post key={`${x}${t}`} pos={[x * width / 2, t * length]} h={height} r={0.05} color={STEEL_DARK} />))}
    </group>
  );
}
function CricketNets({ level, night }: Props) {
  if (level === 1) return (
    <group>
      <Block size={[3.4, 0.03, 8]} pos={[0, 0.02, 0]} color="#7fd06a" r={0.01} rough={1} />
      <Stumps pos={[0, 0, -2.8]} />
      <Bat pos={[0.55, 0, -2.6]} rot={[0, 0, 0.35]} />
      <Ball pos={[-0.4, 0.06, 1.5]} r={0.06} color={C.red} />
    </group>
  );
  if (level === 2) return (
    <group>
      <Pitch length={10} />
      <Stumps pos={[0, 0, -4.4]} /><Stumps pos={[0, 0, 4.4]} />
      <Bat pos={[0.55, 0, -4.1]} rot={[0, 0, 0.35]} />
      <Ball pos={[0.3, 0.06, 2.5]} r={0.06} color={C.red} />
    </group>
  );
  if (level === 3) return (
    <group>
      <Pitch length={11} color="#3e9b52" />
      <NetCage length={6} z={-2.4} />
      <Stumps pos={[0, 0, -4.8]} /><Stumps pos={[0, 0, 4.8]} />
      <Bat pos={[0.55, 0, -4.5]} rot={[0, 0, 0.35]} />
      <Block size={[1.6, 0.45, 0.5]} pos={[-2.4, 0.22, 2.5]} color={TIMBER} r={0.05} />
    </group>
  );
  return (
    <group>
      {/* Two lanes under nets, a bowling machine firing balls down one lane, floodlights and a scoreboard. */}
      {[-1, 1].map((lane) => <group key={lane} position={[lane * 1.7, 0, 0]}>
        <Pitch length={11.4} color="#2f8f4a" />
        <NetCage length={9} width={3.2} height={3.4} z={-1.1} />
        <Stumps pos={[0, 0, -5]} />
      </group>)}
      <group position={[-1.7, 0, 3.8]}>
        <Block size={[0.7, 0.8, 0.7]} pos={[0, 0.4, 0]} color="#2c3440" r={0.08} />
        <mesh position={[0, 1.0, -0.1]} rotation={[0.25, 0, 0]}><cylinderGeometry args={[0.28, 0.28, 0.2, 20]} /><Mat color={PLAY.yellow} /></mesh>
        <Glow size={[0.3, 0.12, 0.02]} pos={[0, 0.6, 0.36]} color={NEON_CYAN} night={night} />
      </group>
      <BowledBall />
      {[-1, 1].map((x) => <group key={x} position={[x * 3.4, 0, 3.6]}>
        <Post pos={[0, 0]} h={5.2} r={0.08} color={STEEL_DARK} />
        <Glow size={[0.9, 0.5, 0.18]} pos={[0, 5.3, 0]} rot={[0.5, 0, 0]} color="#f4fbff" night={night} />
      </group>)}
      <group position={[3.2, 0, -4.6]}>
        <Post pos={[0, 0]} h={1.6} r={0.06} color={STEEL_DARK} />
        <Block size={[1.4, 0.8, 0.12]} pos={[0, 2.0, 0]} color="#16202b" r={0.04} />
        <Glow size={[1.1, 0.5, 0.02]} pos={[0, 2.0, 0.07]} color="#ffb020" night={night} />
      </group>
      <LightPool r={5.2} color="#e9f6ff" night={night} />
    </group>
  );
}
function BowledBall() {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.elapsedTime * 0.7) % 1;
    // Out of the machine, one bounce on the pitch, through to the stumps.
    const z = 3.6 - t * 8.5;
    const bounce = t < 0.55 ? 1.0 - t * 1.75 : Math.sin(((t - 0.55) / 0.45) * Math.PI) * 0.5;
    ref.current.position.set(-1.7, 0.08 + Math.max(0, bounce), z);
  });
  return <mesh ref={ref}><sphereGeometry args={[0.07, 14, 10]} /><Mat color={C.red} /></mesh>;
}

/* ───────── Park BBQ (3 × 3 squares) ───────── */
function Barbecue({ pos = [0, 0, 0], rot = 0, night, sizzle = true }: { pos?: V3; rot?: number; night: boolean; sizzle?: boolean }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Block size={[1.3, 0.9, 0.8]} pos={[0, 0.45, 0]} color={BRICK} r={0.05} />
      {[0.25, 0.55].map((y) => <Block key={y} size={[1.32, 0.02, 0.82]} pos={[0, y, 0]} color="#d8c8b8" r={0.005} />)}
      <Block size={[1.1, 0.06, 0.62]} pos={[0, 0.93, 0]} color="#2f3338" r={0.02} metal={0.6} rough={0.3} />
      {[-0.3, -0.1, 0.1, 0.3].map((x) => <mesh key={x} position={[x, 0.99, 0.05]} rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.035, 0.2, 4, 8]} /><Mat color="#9c4a2b" /></mesh>)}
      <Block size={[0.12, 0.06, 0.12]} pos={[0.5, 0.75, 0.42]} color="#c9c9c9" r={0.02} />
      {sizzle ? <Puffs pos={[0, 1.0, 0]} rise={1.2} size={0.14} /> : null}
      <Glow size={[0.9, 0.01, 0.4]} pos={[0, 0.965, 0]} color="#ff7a2a" night={night} />
    </group>
  );
}
function ParkBBQ({ level, night }: Props) {
  if (level === 1) return <group><Pad size={[2.2, 1.6]} color={CONCRETE} y={0.06} /><Barbecue night={night} /></group>;
  if (level === 2) return (
    <group>
      <Pad size={[5, 4]} color={CONCRETE} y={0.06} />
      <Barbecue pos={[0, 0, -1.3]} night={night} />
      <PicnicTable pos={[0, 0, 0.9]} />
      <group position={[2.0, 0, -1.3]}><mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.28, 0.25, 0.9, 16]} /><Mat color="#2f6b3f" /></mesh></group>
    </group>
  );
  if (level === 3) return (
    <group>
      <Pad size={[5.6, 5]} color={CONCRETE} y={0.06} />
      <Shelter w={5} d={4.4} h={2.8} roof="#3f6b4a" night={night} />
      <Barbecue pos={[-1.2, 0, -1.5]} night={night} />
      <Block size={[1.0, 0.9, 0.6]} pos={[0.6, 0.45, -1.6]} color="#d9d6cf" r={0.04} />
      <Block size={[0.5, 0.05, 0.36]} pos={[0.6, 0.92, -1.6]} color="#9fb7c9" r={0.02} metal={0.5} />
      <PicnicTable pos={[0, 0, 0.8]} length={2.4} />
    </group>
  );
  return (
    <group>
      {/* BBQ pavilion: a skillion roof, two barbecues, a long table, a fridge and festoon lights. */}
      <Pad size={[5.9, 5.9]} color="#bfb9ad" y={0.08} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => <Block key={i} size={[0.2, z < 0 ? 3.4 : 2.9, 0.2]} pos={[x * 2.6, (z < 0 ? 3.4 : 2.9) / 2, z * 2.6]} color="#2c3440" r={0.04} />)}
      <Block size={[5.9, 0.16, 5.9]} pos={[0, 3.2, 0]} rot={[-0.09, 0, 0]} color="#e8e2d4" r={0.05} />
      <Glow size={[5.6, 0.04, 0.1]} pos={[0, 3.05, 2.6]} color={WARM} night={night} />
      <Barbecue pos={[-1.5, 0, -2.0]} night={night} />
      <Barbecue pos={[0.1, 0, -2.0]} night={night} sizzle={false} />
      <Block size={[0.8, 1.6, 0.7]} pos={[1.8, 0.8, -2.0]} color="#f2f2f2" r={0.06} />
      <Glow size={[0.5, 0.06, 0.02]} pos={[1.8, 1.3, -1.64]} color={NEON_CYAN} night={night} />
      <PicnicTable pos={[0, 0, 0.9]} length={3.2} color="#d59a5c" />
      <StringLights from={[-2.6, 2.9, 2.6]} to={[2.6, 2.9, 2.6]} night={night} n={16} sag={0.3} colors={[WARM]} r={0.05} />
      <StringLights from={[-2.6, 3.0, -0.2]} to={[2.6, 3.0, -0.2]} night={night} n={16} sag={0.3} colors={[WARM]} r={0.05} />
      <LightPool r={3.6} color={WARM} night={night} />
    </group>
  );
}

/* ───────── Cubby house (3 × 3 squares) ───────── */
function CubbyRoom({ w = 2.0, d = 1.8, h = 1.7, wall = "#fff1d9", roof = PLAY.red, night, door = true }: { w?: number; d?: number; h?: number; wall?: string; roof?: string; night: boolean; door?: boolean }) {
  return (
    <group>
      <Block size={[w, h, d]} pos={[0, h / 2, 0]} color={wall} r={0.05} />
      {Array.from({ length: Math.round(h / 0.22) }, (_, i) => <Block key={i} size={[w + 0.02, 0.02, d + 0.02]} pos={[0, 0.2 + i * 0.22, 0]} color="#e6d3b5" r={0.005} />)}
      {[-1, 1].map((s) => <Block key={s} size={[w + 0.5, 0.1, d * 0.62]} pos={[0, h + 0.45, s * d * 0.27]} rot={[s * 0.62, 0, 0]} color={roof} r={0.04} />)}
      {door ? <Block size={[0.6, 1.1, 0.06]} pos={[-w * 0.2, 0.55, d / 2 + 0.01]} color={TIMBER_DARK} r={0.04} /> : null}
      <Glow size={[0.55, 0.45, 0.04]} pos={[w * 0.22, h * 0.6, d / 2 + 0.02]} color={night ? WARM : "#bfe4ff"} night={night} />
      <Block size={[0.7, 0.14, 0.18]} pos={[w * 0.22, h * 0.6 - 0.32, d / 2 + 0.1]} color={TIMBER} r={0.03} />
      {[-0.2, 0, 0.2].map((x) => <Ball key={x} pos={[w * 0.22 + x, h * 0.6 - 0.2, d / 2 + 0.12]} r={0.07} color={[C.pink, PLAY.yellow, C.red][Math.round(x * 5 + 1)]} />)}
    </group>
  );
}
function CubbyHouse({ level, night }: Props) {
  if (level === 1) return (
    <group>
      {/* A cardboard box fort with a blanket roof and a flag. */}
      <Block size={[1.4, 1.1, 1.2]} pos={[-0.3, 0.55, 0]} color="#c9a46b" r={0.03} />
      <Block size={[1.0, 0.9, 1.0]} pos={[0.9, 0.45, 0.1]} color="#d6b37a" r={0.03} />
      <Block size={[0.8, 0.7, 0.8]} pos={[-0.2, 1.45, -0.05]} color="#bf9a60" r={0.03} />
      <Block size={[0.5, 0.6, 0.03]} pos={[-0.4, 0.4, 0.61]} color="#3a2a18" r={0.02} />
      <Block size={[1.8, 0.04, 1.4]} pos={[0.2, 1.12, 0]} rot={[0, 0, 0.08]} color="#5b8def" r={0.02} />
      <Post pos={[-0.2, -0.05]} h={0.9} r={0.02} color={TIMBER_DARK} top={1.8} />
      <Sway amount={0.2} axis="z" speed={2.4}><Block size={[0.45, 0.3, 0.02]} pos={[0.03, 2.55, -0.05]} color={C.red} r={0.01} /></Sway>
    </group>
  );
  if (level === 2) return <group><Pad size={[3.2, 2.8]} color="#7fd06a" y={0.03} /><CubbyRoom night={night} /></group>;
  if (level === 3) return (
    <group position={[0, 0, -0.7]}>
      {/* On stilts, with a ladder, a slide and a sandpit underneath; set back so the slide stays on the plot. */}
      <Block size={[2.6, 0.2, 2.6]} pos={[0, 0.1, 0]} color="#e9d9a8" r={0.05} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => <Block key={i} size={[0.14, 1.3, 0.14]} pos={[x * 0.95, 0.65, z * 0.85]} color={TIMBER_DARK} r={0.03} />)}
      <Block size={[2.2, 0.12, 2.0]} pos={[0, 1.3, 0]} color={TIMBER} r={0.03} />
      <group position={[0, 1.36, 0]}><CubbyRoom night={night} roof={PLAY.blue} wall="#fff8e8" /></group>
      <Ladder pos={[-1.25, 0, 0.6]} rot={-Math.PI / 2} height={1.3} />
      <Slide pos={[0.6, 0, 1.0]} height={1.3} color={PLAY.yellow} />
    </group>
  );
  return (
    <group position={[0, 0, -1.45]}>
      {/* Two-storey lookout cubby: a rope ladder, a deck with a telescope, a spinning weathervane and fairy lights. */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => <Block key={i} size={[0.16, 1.5, 0.16]} pos={[x * 1.15, 0.75, z * 1.15]} color={TIMBER_DARK} r={0.03} />)}
      <Block size={[2.8, 0.14, 2.8]} pos={[0, 1.5, 0]} color={TIMBER} r={0.03} />
      <group position={[0, 1.57, -0.2]}><CubbyRoom w={2.2} d={1.8} h={1.6} night={night} roof={PLAY.purple} wall="#fdf3ff" /></group>
      {/* Lookout deck on the roof line. */}
      <Block size={[1.4, 0.1, 1.2]} pos={[0, 3.55, -0.2]} color={TIMBER} r={0.03} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => <Block key={i} size={[0.06, 0.6, 0.06]} pos={[x * 0.65, 3.88, -0.2 + z * 0.55]} color={TIMBER_DARK} r={0.02} />)}
      <group position={[0.3, 3.6, 0.2]} rotation={[0, 0, 0.35]}><mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2 - 0.4]}><cylinderGeometry args={[0.05, 0.08, 0.6, 12]} /><Mat color={GOLDISH} metal={0.6} /></mesh></group>
      <group position={[-0.5, 4.2, -0.2]}><Post pos={[0, 0]} h={0.6} r={0.02} color={STEEL_DARK} /><group position={[0, 0.62, 0]}><Spin speed={1.4}><Block size={[0.5, 0.04, 0.04]} pos={[0, 0, 0]} color={GOLDISH} r={0.01} /><Block size={[0.04, 0.04, 0.5]} pos={[0, 0, 0]} color={GOLDISH} r={0.01} /></Spin></group></group>
      {/* Rope ladder and a slide off the deck. */}
      {Array.from({ length: 5 }, (_, i) => <Block key={i} size={[0.5, 0.04, 0.06]} pos={[-1.5, 0.25 + i * 0.28, 0.9]} color={TIMBER} r={0.015} />)}
      {[-1, 1].map((s) => <Rod key={s} from={[-1.5 + s * 0.25, 1.5, 0.9]} to={[-1.5 + s * 0.25, 0.05, 0.9]} r={0.015} color="#e8d9b5" />)}
      <Slide pos={[0.7, 0, 1.4]} height={1.5} color={PLAY.teal} />
      <StringLights from={[-1.4, 1.45, 1.4]} to={[1.4, 1.45, 1.4]} night={night} n={12} sag={0.18} colors={[WARM, C.pink, PLAY.teal]} />
      <LightPool r={2.6} color={WARM} night={night} />
    </group>
  );
}
const GOLDISH = "#ffc933";

/* ───────── Outdoor setting (3 × 3 squares) ───────── */
function DeckChair({ pos, rot = 0, stripe = C.blue }: { pos: V3; rot?: number; stripe?: string }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Block size={[0.62, 0.05, 1.0]} pos={[0, 0.42, 0]} rot={[0.5, 0, 0]} color="#f7f2e6" r={0.02} />
      {[-0.15, 0.15].map((x) => <Block key={x} size={[0.1, 0.055, 1.0]} pos={[x, 0.425, 0]} rot={[0.5, 0, 0]} color={stripe} r={0.02} />)}
      {[-1, 1].map((s) => <Block key={s} size={[0.04, 0.04, 1.1]} pos={[s * 0.33, 0.35, 0.05]} rot={[0.5, 0, 0]} color={TIMBER} r={0.01} />)}
      {[-1, 1].map((s) => <Block key={s} size={[0.04, 0.04, 0.9]} pos={[s * 0.33, 0.3, 0.15]} rot={[-0.55, 0, 0]} color={TIMBER} r={0.01} />)}
    </group>
  );
}
function RoundTable({ pos = [0, 0, 0], r = 0.55, color = "#f2f2f2" }: { pos?: V3; r?: number; color?: string }) {
  return <group position={pos}><Post pos={[0, 0]} h={0.95} r={0.04} color={STEEL_DARK} /><mesh position={[0, 0.98, 0]} castShadow><cylinderGeometry args={[r, r, 0.05, 28]} /><Mat color={color} /></mesh></group>;
}
function OutdoorSetting({ level, night }: Props) {
  if (level === 1) return (
    <group>
      <DeckChair pos={[-0.6, 0, 0]} rot={0.15} />
      <DeckChair pos={[0.75, 0, 0]} rot={-0.15} stripe={C.red} />
      <RoundTable pos={[0.05, 0, -0.55]} r={0.25} color={TIMBER} />
      <mesh position={[0.05, 1.08, -0.55]}><cylinderGeometry args={[0.05, 0.04, 0.16, 12]} /><Mat color="#ff9f45" /></mesh>
    </group>
  );
  if (level === 2) return (
    <group>
      <Pad size={[3.6, 3.6]} color="#d8cdb8" y={0.04} />
      <RoundTable r={0.6} />
      {[0, 1, 2, 3].map((i) => { const a = (i / 4) * Math.PI * 2 + Math.PI / 4; return <Chair key={i} pos={[Math.cos(a) * 0.95, 0, Math.sin(a) * 0.95]} rot={-a - Math.PI / 2} />; })}
      <Umbrella color={C.teal} />
    </group>
  );
  if (level === 3) return (
    <group>
      <Block size={[5.4, 0.18, 5.0]} pos={[0, 0.09, 0]} color={TIMBER} r={0.03} />
      <group position={[0, 0.18, 0]}>
        <Shelter w={5} d={4.6} h={2.6} slats night={night} lights={[WARM]} />
        <Block size={[2.2, 0.06, 0.95]} pos={[0, 0.95, 0]} color="#f4efe6" r={0.03} />
        {[-1, 1].map((s) => <Block key={s} size={[0.08, 0.9, 0.8]} pos={[s * 0.95, 0.45, 0]} color={STEEL_DARK} r={0.02} />)}
        {[-0.7, 0, 0.7].flatMap((x) => [-1, 1].map((z) => <Chair key={`${x}${z}`} pos={[x, 0, z * 0.85]} rot={z > 0 ? Math.PI : 0} color="#2d3a35" />))}
        {[[-2.2, -2.0], [2.2, -2.0]].map(([x, z], i) => <group key={i} position={[x, 0, z]}><Block size={[0.6, 0.6, 0.6]} pos={[0, 0.3, 0]} color="#c9c2b4" r={0.05} /><Ball pos={[0, 0.85, 0]} r={0.38} color="#4fa64a" /></group>)}
      </group>
    </group>
  );
  return (
    <group>
      {/* Outdoor kitchen: a deck, a pergola, a stone bench with a barbecue and a glowing pizza oven, bar stools and festoon lights. */}
      <Block size={[5.8, 0.2, 5.8]} pos={[0, 0.1, 0]} color="#b97a45" r={0.03} />
      <group position={[0, 0.2, 0]}>
        <Shelter w={5.4} d={5.2} h={2.8} slats color="#2c3440" night={night} lights={[WARM]} />
        <Block size={[4.2, 0.95, 0.75]} pos={[0, 0.48, -2.0]} color="#8b8f97" r={0.05} />
        <Block size={[4.3, 0.08, 0.85]} pos={[0, 0.99, -2.0]} color="#f2efe8" r={0.03} />
        <Barbecue pos={[-1.2, 0.06, -2.0]} night={night} />
        {/* Pizza oven with a glowing mouth. */}
        <group position={[1.3, 1.03, -2.0]}>
          <mesh castShadow><sphereGeometry args={[0.55, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><Mat color="#c56a3a" /></mesh>
          <mesh position={[0, 0.18, 0.5]} rotation={[0, 0, 0]}><circleGeometry args={[0.2, 20, 0, Math.PI]} /><meshStandardMaterial color="#ff8a3d" emissive="#ff5a1a" emissiveIntensity={night ? 4 : 1.5} /></mesh>
          <mesh position={[0.2, 0.7, -0.15]}><cylinderGeometry args={[0.07, 0.07, 0.5, 10]} /><Mat color="#3a3f4a" /></mesh>
          <Puffs pos={[0.2, 0.95, -0.15]} rise={1.0} size={0.1} />
        </group>
        {[-1.2, -0.4, 0.4, 1.2].map((x) => <Stool key={x} pos={[x, 0, -1.25]} color={[PLAY.red, PLAY.teal, PLAY.yellow, PLAY.purple][Math.round((x + 1.2) / 0.8)]} />)}
        <RoundTable pos={[0, 0, 1.2]} r={0.65} />
        {[0, 1, 2].map((i) => { const a = (i / 3) * Math.PI * 2; return <Chair key={i} pos={[Math.cos(a) * 1.05, 0, 1.2 + Math.sin(a) * 1.05]} rot={-a - Math.PI / 2} color="#2d3a35" />; })}
        <StringLights from={[-2.7, 2.7, 0]} to={[2.7, 2.7, 0]} night={night} n={14} sag={0.3} colors={[WARM]} r={0.05} />
      </group>
      <LightPool r={3.4} color={WARM} night={night} />
    </group>
  );
}

/* ───────── Bus stop (5 × 3 squares: a kerb along the front, the shelter behind) ───────── */
function Kerb({ w, roadDepth = 2.2 }: { w: number; roadDepth?: number }) {
  return (
    <group>
      <Block size={[w, 0.03, roadDepth]} pos={[0, 0.02, 3 - roadDepth / 2]} color="#3c4148" r={0.01} rough={0.9} />
      {Array.from({ length: Math.floor(w / 1.6) }, (_, i) => <Block key={i} size={[0.8, 0.005, 0.1]} pos={[-w / 2 + 0.8 + i * 1.6, 0.04, 3 - roadDepth + 0.25]} color={PLAY.yellow} r={0.002} />)}
      <Block size={[w, 0.18, 0.25]} pos={[0, 0.09, 3 - roadDepth - 0.1]} color="#bdb8ad" r={0.02} />
      <Block size={[w, 0.16, 6 - roadDepth - 0.2]} pos={[0, 0.08, -(roadDepth + 0.2) / 2]} color={CONCRETE} r={0.02} />
    </group>
  );
}
function BusSign({ pos, night, h = 2.8 }: { pos: V3; night: boolean; h?: number }) {
  return (
    <group position={pos}>
      <Post pos={[0, 0]} h={h} r={0.05} color={STEEL} />
      <Block size={[0.62, 0.62, 0.06]} pos={[0, h - 0.1, 0]} color="#1f8f4e" r={0.08} />
      <Glow size={[0.36, 0.2, 0.02]} pos={[0, h - 0.06, 0.04]} color="#ffffff" night={night} />
      <Block size={[0.4, 0.55, 0.04]} pos={[0, h - 0.85, 0]} color="#f4f4f4" r={0.03} />
    </group>
  );
}
function GlassShelter({ w = 3.2, h = 2.6, night, screen = false, roofGlow }: { w?: number; h?: number; night: boolean; screen?: boolean; roofGlow?: string }) {
  const glass = <meshStandardMaterial color="#bfe4ff" transparent opacity={0.28} roughness={0.1} metalness={0.1} depthWrite={false} />;
  return (
    <group>
      {[-1, 1].map((x) => <Block key={x} size={[0.1, h, 0.1]} pos={[x * w / 2, h / 2, 0.55]} color={STEEL_DARK} r={0.02} />)}
      {[-1, 1].map((x) => <Block key={x} size={[0.1, h, 0.1]} pos={[x * w / 2, h / 2, -0.55]} color={STEEL_DARK} r={0.02} />)}
      <mesh position={[0, h / 2, -0.55]}><planeGeometry args={[w, h - 0.2]} />{glass}</mesh>
      <mesh position={[-w / 2, h / 2, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[1.1, h - 0.2]} />{glass}</mesh>
      <Block size={[w + 0.5, 0.12, 1.6]} pos={[0, h + 0.06, 0]} color="#2f3a46" r={0.04} />
      {roofGlow ? <Glow size={[w + 0.5, 0.04, 0.06]} pos={[0, h, 0.8]} color={roofGlow} night={night} /> : null}
      <Block size={[w * 0.7, 0.06, 0.4]} pos={[0, 0.5, -0.25]} color={TIMBER} r={0.02} />
      <Block size={[0.06, 0.5, 0.3]} pos={[-w * 0.3, 0.25, -0.25]} color={STEEL_DARK} r={0.01} />
      <Block size={[0.06, 0.5, 0.3]} pos={[w * 0.3, 0.25, -0.25]} color={STEEL_DARK} r={0.01} />
      {/* An advert panel on the end wall. */}
      <Glow size={[0.05, 1.5, 0.9]} pos={[w / 2 + 0.03, 1.3, 0]} color={night ? "#ffb3e8" : "#ffd6f2"} night={night} />
      {screen ? <group position={[0.5, h - 0.45, 0.5]}><Block size={[1.2, 0.36, 0.08]} pos={[0, 0, 0]} color="#101820" r={0.03} /><Glow size={[1.1, 0.28, 0.02]} pos={[0, 0, 0.05]} color="#ffb020" night={night} /></group> : null}
    </group>
  );
}
function Bus({ night }: { night: boolean }) {
  const doors = useRef<Group>(null);
  const blink = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Doors fold open and shut every few seconds; the indicator blinks while they're open.
    const open = Math.max(0, Math.sin(t * 0.6));
    doors.current?.children.forEach((door, i) => { door.position.x = (i ? 1 : -1) * (0.3 + open * 0.28); });
    if (blink.current) blink.current.visible = open > 0.1 && Math.floor(t * 3) % 2 === 0;
  });
  return (
    <group>
      <Block size={[8.4, 2.8, 2.3]} pos={[0, 1.65, 0]} color="#f2f2f2" r={0.3} />
      <Block size={[8.42, 0.5, 2.32]} pos={[0, 0.65, 0]} color="#1f8f4e" r={0.2} />
      <Block size={[8.42, 0.2, 2.32]} pos={[0, 2.6, 0]} color="#1f8f4e" r={0.08} />
      {Array.from({ length: 5 }, (_, i) => <Glow key={i} size={[1.2, 0.8, 0.04]} pos={[-3.2 + i * 1.5, 1.85, 1.16]} color={night ? WARM : "#9fd3ff"} night={night} />)}
      <Glow size={[0.04, 1.1, 1.9]} pos={[4.21, 1.8, 0]} color={night ? WARM : "#9fd3ff"} night={night} />
      <Glow size={[0.04, 0.3, 1.6]} pos={[4.22, 2.75, 0]} color="#ffb020" night={night} />
      <group ref={doors} position={[3.0, 1.35, 1.17]}>{[0, 1].map((i) => <Block key={i} size={[0.56, 2.1, 0.04]} pos={[0, 0, 0]} color="#bfe4ff" r={0.03} />)}</group>
      {[-2.8, 2.8].flatMap((x) => [-1, 1].map((z) => <mesh key={`${x}${z}`} position={[x, 0.45, z * 1.12]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.45, 0.45, 0.3, 20]} /><Mat color="#1d1f22" /></mesh>))}
      {[-1, 1].map((z) => <Glow key={z} size={[0.04, 0.22, 0.32]} pos={[4.22, 0.8, z * 0.8]} color="#fff7d6" night={night} />)}
      <mesh ref={blink} position={[4.0, 0.8, 1.17]}><boxGeometry args={[0.2, 0.12, 0.04]} /><meshBasicMaterial color="#ffa21f" toneMapped={false} /></mesh>
    </group>
  );
}
function BusStop({ level, night }: Props) {
  if (level === 1) return <group><Kerb w={9.6} /><BusSign pos={[0, 0.16, 0.6]} night={night} /></group>;
  if (level === 2) return <group><Kerb w={9.6} /><group position={[0.3, 0.16, -0.6]}><GlassShelter night={night} /></group><BusSign pos={[-2.6, 0.16, 0.6]} night={night} /></group>;
  if (level === 3) return (
    <group>
      <Kerb w={9.6} />
      <group position={[0.3, 0.16, -0.6]}><GlassShelter w={4} night={night} screen roofGlow={NEON_CYAN} /></group>
      <BusSign pos={[-3.0, 0.16, 0.6]} night={night} />
      <group position={[3.4, 0.16, -0.2]}><mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.28, 0.25, 1.0, 16]} /><Mat color="#2f3a46" /></mesh></group>
      <LightPool r={2.6} color={NEON_CYAN} night={night} pos={[0.3, 0, -0.2]} />
    </group>
  );
  return (
    <group>
      {/* Transit hub: a long glowing canopy, screens, and a bus pulled in at the kerb with its doors opening. */}
      <Kerb w={9.8} roadDepth={2.6} />
      <group position={[0, 0.16, -1.2]}>
        {[-3.6, 0, 3.6].map((x) => <Block key={x} size={[0.18, 3.2, 0.18]} pos={[x, 1.6, -0.5]} color="#2c3440" r={0.04} />)}
        <Block size={[9.4, 0.18, 2.6]} pos={[0, 3.3, 0.3]} rot={[0.06, 0, 0]} color="#e8eef3" r={0.06} />
        <Glow size={[9.4, 0.05, 0.08]} pos={[0, 3.22, 1.6]} color={NEON_CYAN} night={night} />
        <group position={[-1.8, 0, 0]}><GlassShelter w={3} h={2.5} night={night} screen /></group>
        <group position={[2.4, 0, 0]}><Block size={[0.5, 2.2, 0.5]} pos={[0, 1.1, -0.2]} color="#16202b" r={0.06} /><Glow size={[0.4, 1.6, 0.02]} pos={[0, 1.3, 0.06]} color="#7df9ff" night={night} /></group>
      </group>
      <group position={[0, 0.03, 1.7]}><Bus night={night} /></group>
      <LightPool r={4} color={NEON_CYAN} night={night} pos={[0, 0, -0.6]} />
    </group>
  );
}

/* ───────── Food truck (4 × 3 squares) ───────── */
function Truck({ body = "#ff9f45", trim = "#ffffff", night, neon }: { body?: string; trim?: string; night: boolean; neon?: string }) {
  return (
    <group>
      <Block size={[4.6, 2.5, 2.2]} pos={[-0.4, 1.65, 0]} color={body} r={0.25} />
      <Block size={[1.5, 1.9, 2.2]} pos={[2.5, 1.35, 0]} color={body} r={0.25} />
      <Glow size={[0.04, 0.8, 1.8]} pos={[3.26, 1.75, 0]} color={night ? WARM : "#9fd3ff"} night={night} />
      <Block size={[4.62, 0.3, 2.22]} pos={[-0.4, 0.7, 0]} color={trim} r={0.1} />
      {/* Serving hatch with its awning propped open. */}
      <Block size={[2.6, 1.0, 0.04]} pos={[-0.6, 1.95, 1.11]} color="#2f2318" r={0.03} />
      <Glow size={[2.4, 0.85, 0.02]} pos={[-0.6, 1.95, 1.12]} color={night ? WARM : "#ffe6b8"} night={night} />
      <Block size={[2.9, 0.06, 0.9]} pos={[-0.6, 2.6, 1.5]} rot={[-0.35, 0, 0]} color={trim} r={0.02} />
      <Block size={[2.7, 0.08, 0.4]} pos={[-0.6, 1.42, 1.3]} color="#d9d6cf" r={0.02} />
      {neon ? <Glow size={[2.0, 0.4, 0.04]} pos={[-0.6, 3.15, 1.11]} color={neon} night={night} /> : null}
      {[-2.0, 1.9].flatMap((x) => [-1, 1].map((z) => <mesh key={`${x}${z}`} position={[x, 0.45, z * 1.08]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.42, 0.42, 0.28, 20]} /><Mat color="#1d1f22" /></mesh>))}
    </group>
  );
}
function MenuBoard({ pos, night }: { pos: V3; night: boolean }) {
  return <group position={pos}><Block size={[0.06, 1.1, 0.7]} pos={[0, 0.55, 0.25]} rot={[0.15, 0, 0]} color="#2a2f35" r={0.02} /><Block size={[0.06, 1.1, 0.7]} pos={[0, 0.55, -0.25]} rot={[-0.15, 0, 0]} color="#2a2f35" r={0.02} /><Glow size={[0.02, 0.7, 0.5]} pos={[0.05, 0.65, 0.3]} color="#fff2c4" night={night} /></group>;
}
function FoodTruck({ level, night }: Props) {
  if (level === 1) return (
    <group>
      {/* A coffee cart on a trike, with an umbrella. */}
      <Block size={[1.4, 1.0, 0.9]} pos={[0, 0.85, 0]} color="#3f6b4a" r={0.1} />
      <Block size={[1.45, 0.06, 0.95]} pos={[0, 1.38, 0]} color="#e9e2d0" r={0.02} />
      <Block size={[0.4, 0.45, 0.35]} pos={[-0.3, 1.63, 0]} color={STEEL} r={0.06} metal={0.6} />
      {[-1, 1].map((z) => <mesh key={z} position={[0.55, 0.35, z * 0.5]}><torusGeometry args={[0.32, 0.04, 8, 20]} /><Mat color="#1d1f22" /></mesh>)}
      <mesh position={[-1.1, 0.35, 0]}><torusGeometry args={[0.32, 0.04, 8, 20]} /><Mat color="#1d1f22" /></mesh>
      <Umbrella pos={[0.2, 0.4, 0]} color="#3f6b4a" alt="#f4efe6" r={1.0} h={2.1} />
      <Puffs pos={[-0.3, 1.9, 0]} rise={0.8} size={0.08} color="#ffffff" />
    </group>
  );
  if (level === 2) return (
    <group>
      <Pad size={[7.6, 5.4]} color={CONCRETE} y={0.04} />
      <group position={[0, 0, -0.6]}><Truck night={night} /></group>
      <MenuBoard pos={[2.4, 0, 1.6]} night={night} />
      <Puffs pos={[-1.6, 3.0, -0.6]} rise={1.0} size={0.12} color="#ffffff" />
    </group>
  );
  if (level === 3) return (
    <group>
      <Pad size={[7.8, 5.8]} color={CONCRETE} y={0.04} />
      <group position={[0, 0, -1.3]}><Truck body="#4c8dff" night={night} /></group>
      {[[-2.3, 1.6], [0.6, 1.9]].map(([x, z], i) => <group key={i} position={[x, 0, z]}><RoundTable r={0.5} /><Chair pos={[-0.75, 0, 0]} rot={Math.PI / 2} /><Chair pos={[0.75, 0, 0]} rot={-Math.PI / 2} /><Umbrella color={i ? C.red : PLAY.yellow} r={1.1} h={2.5} /></group>)}
      <MenuBoard pos={[3.1, 0, 0.9]} night={night} />
      <StringLights from={[-3.6, 3.4, 0.2]} to={[3.6, 3.4, 0.2]} night={night} n={18} sag={0.4} colors={[C.red, PLAY.yellow, PLAY.teal, C.blue]} />
      {[-3.6, 3.6].map((x) => <Post key={x} pos={[x, 0.2]} h={3.4} r={0.05} color={TIMBER_DARK} />)}
      <Puffs pos={[-1.8, 3.0, -1.3]} rise={1.0} size={0.12} color="#ffffff" />
    </group>
  );
  return (
    <group>
      {/* Night-market truck: a neon sign, glowing menus, festoon lights on poles, tables and steam. */}
      <Pad size={[7.9, 5.9]} color="#3b3f47" y={0.05} />
      <group position={[0, 0, -1.4]}><Truck body="#22202e" trim={NEON_PINK} night={night} neon={NEON_CYAN} /></group>
      {[-1.6, -0.6, 0.4].map((x) => <Glow key={x} size={[0.8, 0.5, 0.04]} pos={[x, 2.9, -0.3]} color={["#ffb020", NEON_PINK, NEON_CYAN][Math.round((x + 1.6))]} night={night} />)}
      {[[-2.4, 1.5], [0, 1.9], [2.4, 1.5]].map(([x, z], i) => <group key={i} position={[x, 0, z]}><RoundTable r={0.5} color="#2f3a46" /><Stool pos={[-0.7, 0, 0]} color={NEON_PINK} /><Stool pos={[0.7, 0, 0]} color={NEON_CYAN} /></group>)}
      {[-3.7, 3.7].map((x) => <Post key={x} pos={[x, 0.4]} h={3.8} r={0.06} color={STEEL_DARK} />)}
      <StringLights from={[-3.7, 3.8, 0.4]} to={[3.7, 3.8, 0.4]} night={night} n={22} sag={0.5} colors={[WARM]} r={0.055} />
      <StringLights from={[-3.7, 3.8, 0.4]} to={[0, 3.6, -2.6]} night={night} n={12} sag={0.3} colors={[WARM]} r={0.055} />
      <StringLights from={[3.7, 3.8, 0.4]} to={[0, 3.6, -2.6]} night={night} n={12} sag={0.3} colors={[WARM]} r={0.055} />
      <Puffs pos={[-1.8, 3.0, -1.4]} rise={1.2} size={0.14} color="#ffffff" />
      <LightPool r={4} color={NEON_PINK} night={night} />
    </group>
  );
}

/* ───────── Vending & ATM (2 × 2 squares) ───────── */
function VendingMachine({ pos = [0, 0, 0], body = "#d83a3a", night, snacks = false }: { pos?: V3; body?: string; night: boolean; snacks?: boolean }) {
  return (
    <group position={pos}>
      <Block size={[1.1, 2.3, 0.85]} pos={[0, 1.15, 0]} color={body} r={0.08} />
      <Glow size={[0.72, 1.4, 0.03]} pos={[-0.12, 1.35, 0.43]} color={night ? "#e8f6ff" : "#d6eeff"} night={night} />
      {Array.from({ length: 12 }, (_, i) => <Block key={i} size={[0.13, snacks ? 0.16 : 0.24, 0.06]} pos={[-0.38 + (i % 4) * 0.18, 0.85 + Math.floor(i / 4) * 0.45, 0.42]} color={[PLAY.yellow, PLAY.teal, C.red, PLAY.purple, "#ff9f45"][i % 5]} r={0.03} />)}
      <Block size={[0.2, 0.6, 0.04]} pos={[0.4, 1.4, 0.43]} color="#1f2328" r={0.02} />
      <Glow size={[0.14, 0.08, 0.02]} pos={[0.4, 1.55, 0.45]} color="#44ff9a" night={night} />
      <Block size={[0.7, 0.2, 0.06]} pos={[-0.12, 0.35, 0.43]} color="#1f2328" r={0.03} />
    </group>
  );
}
function Atm({ pos = [0, 0, 0], night }: { pos?: V3; night: boolean }) {
  return (
    <group position={pos}>
      <Block size={[0.85, 2.0, 0.7]} pos={[0, 1.0, 0]} color="#2f3a46" r={0.08} />
      <Block size={[0.7, 0.25, 0.3]} pos={[0, 1.95, 0.35]} color="#3d4a58" r={0.04} />
      <Glow size={[0.45, 0.32, 0.02]} pos={[0, 1.45, 0.36]} color="#5fd7ff" night={night} />
      <Block size={[0.5, 0.12, 0.25]} pos={[0, 1.08, 0.4]} rot={[0.4, 0, 0]} color="#c9ced6" r={0.02} />
      <Glow size={[0.3, 0.03, 0.02]} pos={[0, 0.85, 0.36]} color="#44ff9a" night={night} />
      <Glow size={[0.6, 0.18, 0.02]} pos={[0, 2.0, 0.51]} color="#ffb020" night={night} />
    </group>
  );
}
function VendingKiosk({ level, night }: Props) {
  if (level === 1) return <group><Pad size={[1.8, 1.4]} color={CONCRETE} y={0.06} /><VendingMachine pos={[0, 0.06, 0]} night={night} /></group>;
  if (level === 2) return (
    <group>
      <Pad size={[3.4, 1.8]} color={CONCRETE} y={0.06} />
      <VendingMachine pos={[-0.7, 0.06, 0]} night={night} />
      <VendingMachine pos={[0.55, 0.06, 0]} body="#2f6fd6" night={night} snacks />
      <group position={[1.45, 0.06, 0.2]}><mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.24, 0.22, 0.9, 14]} /><Mat color="#3a3f4a" /></mesh></group>
    </group>
  );
  if (level === 3) return (
    <group>
      <Pad size={[3.8, 3.6]} color={CONCRETE} y={0.06} />
      {/* A little kiosk booth with an awning, plus a drinks machine and an ATM. */}
      <group position={[0, 0.06, -0.9]}>
        <Block size={[2.0, 2.4, 1.4]} pos={[0, 1.2, 0]} color="#f4efe6" r={0.06} />
        <Block size={[1.6, 0.9, 0.04]} pos={[0, 1.5, 0.71]} color="#2f2318" r={0.02} />
        <Glow size={[1.5, 0.8, 0.02]} pos={[0, 1.5, 0.72]} color={night ? WARM : "#ffe6b8"} night={night} />
        <Block size={[2.2, 0.06, 0.8]} pos={[0, 2.25, 1.0]} rot={[-0.3, 0, 0]} color={C.red} r={0.02} />
        <Block size={[1.8, 0.08, 0.35]} pos={[0, 1.02, 0.85]} color={TIMBER} r={0.02} />
      </group>
      <VendingMachine pos={[-1.3, 0.06, 0.9]} night={night} />
      <Atm pos={[1.2, 0.06, 0.9]} night={night} />
      <LightPool r={2.0} color={WARM} night={night} pos={[0, 0, 0.6]} />
    </group>
  );
  return (
    <group>
      {/* 24/7 corner kiosk: a glass booth with neon trim, a glowing roof sign, an ATM and machines. */}
      <Pad size={[3.9, 3.9]} color="#3b3f47" y={0.07} />
      <group position={[0, 0.07, -0.6]}>
        <Block size={[3.4, 0.18, 2.2]} pos={[0, 2.9, 0]} color="#22202e" r={0.06} />
        <Glow size={[3.4, 0.06, 0.06]} pos={[0, 2.8, 1.1]} color={NEON_PINK} night={night} />
        {[-1, 1].flatMap((x) => [-1, 1].map((z) => <Block key={`${x}${z}`} size={[0.1, 2.8, 0.1]} pos={[x * 1.6, 1.4, z * 1.0]} color="#22202e" r={0.02} />))}
        <mesh position={[0, 1.4, 1.0]}><planeGeometry args={[3.1, 2.6]} /><meshStandardMaterial color="#bfe4ff" transparent opacity={0.22} roughness={0.1} depthWrite={false} /></mesh>
        <Block size={[2.6, 1.0, 0.5]} pos={[0, 0.5, 0.3]} color="#2f3a46" r={0.04} />
        {Array.from({ length: 8 }, (_, i) => <Block key={i} size={[0.24, 0.3, 0.2]} pos={[-1.05 + i * 0.3, 1.8, -0.6]} color={[PLAY.yellow, PLAY.teal, C.red, PLAY.purple][i % 4]} r={0.04} />)}
        <group position={[0, 3.3, 0.4]}>
          <Block size={[1.8, 0.7, 0.14]} pos={[0, 0, 0]} color="#16131f" r={0.06} />
          <Glow size={[1.5, 0.45, 0.04]} pos={[0, 0, 0.08]} color={NEON_CYAN} night={night} />
        </group>
      </group>
      <VendingMachine pos={[-1.35, 0.07, 1.2]} body="#7a46e0" night={night} />
      <Atm pos={[1.3, 0.07, 1.2]} night={night} />
      <LightPool r={2.6} color={NEON_CYAN} night={night} />
    </group>
  );
}

/** Each City Life item's model by level, in world metres. Names, prices and plots live in lib/world3d/premium-homes.ts. */
export const CITY_LIFE_MODELS = {
  playground: Playground,
  cricket_nets: CricketNets,
  park_bbq: ParkBBQ,
  cubby_house: CubbyHouse,
  outdoor_setting: OutdoorSetting,
  bus_stop: BusStop,
  food_truck: FoodTruck,
  vending_kiosk: VendingKiosk,
} as const satisfies Record<(typeof CITY_LIFE_STYLES)[number], (props: Props) => ReactNode>;
