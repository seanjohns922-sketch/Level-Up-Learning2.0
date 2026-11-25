"use client";
// City Life, set 2: places to save up for, four levels each. Servo, car wash, pizza shop, supermarket,
// police station, hospital, vet & pet shop and dog park. Units are world metres (the explorer stands
// about 2 m tall, doors are 2.6 m); the front faces +z. Several react when the explorer comes close.
import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import { DoubleSide, type Group, type Mesh, type MeshStandardMaterial } from "three";
import { Animal } from "@/components/world3d/DetailedScenery";
import { Ball, Block, Mat } from "@/components/world3d/premium-homes/HomeKit";
import type { CITY_PLACES_STYLES, PremiumHomeLevel } from "@/lib/world3d/premium-homes";
import { Glow, LightPool, Puffs, Spin, StringLights, WARM } from "./ItemKit";
import { Awning, Beacons, Block3, Crate, Door, FlagPole, FlatRoof, GlassFront, Pavement, Planter, Shelves, SignBoard, Tree, Trolley, Windows } from "./MainStreetItems";
import { useExplorer } from "./TowerDefenceModels";

type Props = { level: PremiumHomeLevel; night: boolean };
type V3 = [number, number, number];
const SLATE = "#3d4654", CONCRETE = "#cfccc4", ASPHALT = "#4a4f57", GLASS = "#bfe4ff", TIMBER = "#c98a52";
const SERVO_RED = "#e5484d", MART_RED = "#d8282b", POLICE_BLUE = "#1f4fa8", POLICE_BRICK = "#d6c3a0", BRICK = "#b5553c", HOSPITAL_TEAL = "#1aa39a", PIZZA_GREEN = "#2f8f4a", NEON_CYAN = "#3fe6ff", NEON_PINK = "#ff4fd8", EV_GREEN = "#36e07a";

/* ───────── Shared bits ───────── */
/** A small car facing +z (models only: the explorer's own cars live elsewhere). */
function Car({ pos, colour, rot = 0 }: { pos: V3; colour: string; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Block size={[1.8, 0.7, 3.8]} pos={[0, 0.65, 0]} color={colour} r={0.18} />
      <Block size={[1.6, 0.6, 2.0]} pos={[0, 1.25, -0.2]} color={colour} r={0.2} />
      <Block size={[1.62, 0.42, 1.9]} pos={[0, 1.27, -0.2]} color="#1d2733" r={0.12} />
      {[1.2, -1.2].flatMap((z) => [-1, 1].map((s) => <mesh key={`${z}${s}`} position={[s * 0.85, 0.36, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.36, 0.36, 0.26, 16]} /><Mat color="#1d1f22" /></mesh>))}
    </group>
  );
}
/** Painted lines on a car park or bay. */
function BayLines({ x0, n, gap, z, len = 4 }: { x0: number; n: number; gap: number; z: number; len?: number }) {
  return <group>{Array.from({ length: n + 1 }, (_, i) => <Block key={i} size={[0.12, 0.01, len]} pos={[x0 + i * gap, 0.09, z]} color="#f2f2f2" r={0.004} />)}</group>;
}
/** A glowing screen that brightens while the explorer is close (pumps, chargers). */
function NearGlow({ size, pos, colour, idle, reach = 5 }: { size: V3; pos: V3; colour: string; idle: string; reach?: number }) {
  const { group, state } = useExplorer(reach);
  const pane = useRef<Mesh>(null);
  useFrame(() => {
    const material = pane.current?.material as MeshStandardMaterial | undefined;
    if (!material) return;
    const near = state.current.near;
    material.emissive.set(near ? colour : idle);
    material.emissiveIntensity = near ? 2.2 : 0.5;
  });
  return <group ref={group} position={pos}><mesh ref={pane}><boxGeometry args={size} /><meshStandardMaterial color={colour} emissive={idle} emissiveIntensity={0.5} /></mesh></group>;
}

/* ───────── Servo (7 × 6 squares) ───────── */
function Pump({ pos, night }: { pos: V3; night: boolean }) {
  return (
    <group position={pos}>
      <Block size={[0.9, 0.2, 0.6]} pos={[0, 0.1, 0]} color={CONCRETE} r={0.03} />
      <Block size={[0.7, 1.8, 0.45]} pos={[0, 1.1, 0]} color="#f2f2f2" r={0.08} />
      <Block size={[0.72, 0.3, 0.47]} pos={[0, 1.85, 0]} color={SERVO_RED} r={0.06} />
      {/* The screen lights up when a car or explorer pulls in: filling up. */}
      <NearGlow size={[0.42, 0.3, 0.04]} pos={[0, 1.35, 0.24]} colour="#7dff8a" idle="#18402a" />
      <Block size={[0.12, 0.5, 0.12]} pos={[0.42, 1.0, 0.1]} color="#1f2328" r={0.03} />
      {night ? <pointLight position={[0, 1.6, 0.6]} color="#c8f7d2" intensity={1.2} distance={2.5} /> : null}
    </group>
  );
}
function Canopy({ w, d, h, at = [0, 0], night, dark = false }: { w: number; d: number; h: number; at?: [number, number]; night: boolean; dark?: boolean }) {
  return (
    <group position={[at[0], 0, at[1]]}>
      {[-1, 1].map((s) => <Block key={s} size={[0.35, h, 0.35]} pos={[s * (w / 2 - 0.6), h / 2, 0]} color={dark ? "#22262e" : "#f2f2f2"} r={0.05} />)}
      <Block size={[w, 0.6, d]} pos={[0, h + 0.3, 0]} color={dark ? "#15181d" : "#f7f7f7"} r={0.08} />
      <Block size={[w + 0.04, 0.24, d + 0.04]} pos={[0, h + 0.5, 0]} color={dark ? "#15181d" : SERVO_RED} r={0.05} />
      {dark ? [-1, 1].map((s) => <Glow key={s} size={[w + 0.06, 0.12, 0.06]} pos={[0, h + 0.45, s * (d / 2 + 0.03)]} color={NEON_CYAN} night={night} />) : null}
      <Glow size={[w - 0.4, 0.04, d - 0.4]} pos={[0, h - 0.02, 0]} color="#fff7d6" night={night} />
      <LightPool r={Math.min(w, d) / 2} color="#fff2c4" night={night} />
    </group>
  );
}
function Servo({ level, night }: Props) {
  if (level === 1) return (
    <group>
      {/* A country servo: two pumps under a little canopy and a tin kiosk. */}
      <Pavement w={7} d={6} color={ASPHALT} />
      <Canopy w={4.6} d={3.4} h={3.8} at={[0, 1.2]} night={night} />
      {[-1.1, 1.1].map((x) => <Pump key={x} pos={[x, 0.08, 1.2]} night={night} />)}
      <group position={[0, 0.08, -2.0]}>
        <Block3 w={3.2} h={2.6} d={1.8} color="#f2f2f2" />
        <Block size={[3.3, 0.5, 1.9]} pos={[0, 2.85, 0]} color={SERVO_RED} r={0.05} />
        <Glow size={[1.6, 1.0, 0.05]} pos={[-0.5, 1.6, 0.93]} color={night ? WARM : GLASS} night={night} />
        <Door x={1.0} z={0.92} w={0.9} h={2.1} glass night={night} />
      </group>
      <group position={[3.0, 0.08, -0.6]}>{[0, 1, 2].map((i) => <mesh key={i} position={[0, 0.15 + i * 0.26, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.3, 0.12, 8, 18]} /><Mat color="#1d1f22" /></mesh>)}</group>
    </group>
  );
  if (level === 2) return (
    <group>
      <Pavement w={11} d={9} color={ASPHALT} />
      <Canopy w={7} d={3.8} h={4.2} at={[0, 1.6]} night={night} />
      {[-2.2, 0, 2.2].map((x) => <Pump key={x} pos={[x, 0.08, 1.6]} night={night} />)}
      <group position={[0, 0.08, -2.6]}>
        <Block3 w={6.4} h={3.4} d={3.2} color="#f7f7f7" />
        <Block size={[6.5, 0.7, 3.3]} pos={[0, 3.25, 0]} color={SERVO_RED} r={0.05} />
        <GlassFront w={4} h={2.2} y={1.4} z={1.62} night={night}><Shelves w={3.6} z={-0.8} /></GlassFront>
        <Door x={2.6} z={1.62} w={1.1} glass night={night} />
        <Glow size={[2.4, 0.4, 0.05]} pos={[0, 3.25, 1.67]} color="#fff7d6" night={night} />
      </group>
      {/* Ice box and an air-and-water stand. */}
      <group position={[-4.6, 0.08, -0.4]}><Block size={[1.2, 1.1, 0.8]} pos={[0, 0.55, 0]} color="#3aa0ff" r={0.08} /><Block size={[1.0, 0.2, 0.05]} pos={[0, 0.8, 0.41]} color="#ffffff" r={0.02} /></group>
      <group position={[4.6, 0.08, -0.2]}><Block size={[0.4, 1.4, 0.4]} pos={[0, 0.7, 0]} color="#ffcc33" r={0.05} /><Ball pos={[0, 1.5, 0]} r={0.16} color="#1f2328" /></group>
    </group>
  );
  if (level === 3) return (
    <group>
      <Pavement w={13.8} d={11.8} color={ASPHALT} />
      {[-3, 3].map((x) => <Block key={x} size={[0.12, 0.01, 4]} pos={[x - 1.4, 0.09, 2.8]} color="#ffcc33" r={0.004} />)}
      <Canopy w={8.4} d={4.4} h={4.4} at={[-1.4, 2.6]} night={night} />
      {[-4.4, -2.4, -0.4, 1.6].map((x) => <Pump key={x} pos={[x, 0.08, 2.6]} night={night} />)}
      <Car pos={[-3.4, 0.08, 4.3]} colour="#4c8dff" rot={Math.PI / 2} />
      <group position={[-1.4, 0.08, -3.3]}>
        <Block3 w={8} h={3.8} d={4.2} color="#f7f7f7" />
        <Block size={[8.1, 0.8, 4.3]} pos={[0, 3.6, 0]} color={SERVO_RED} r={0.05} />
        <GlassFront w={5.2} h={2.4} y={1.5} z={2.12} night={night}><Shelves w={4.8} z={-0.8} /></GlassFront>
        <SlidingDoors pos={[3.2, 0.3, 2.16]} w={1.8} />
        <SignBoard pos={[0, 4.6, 2.0]} w={3.2} colour={SERVO_RED} night={night}><Ball pos={[0, 0, 0]} r={0.2} color="#ffcc33" /></SignBoard>
      </group>
      {/* The car-wash bay beside the shop: its brushes whirl when you drive in. */}
      <group position={[5.2, 0.08, -2.4]} rotation={[0, Math.PI / 2, 0]}>
        <Block size={[5.6, 3.6, 0.3]} pos={[0, 1.8, -1.6]} color="#f2f2f2" r={0.05} />
        <Block size={[5.6, 0.4, 3.6]} pos={[0, 3.8, 0]} color={SERVO_RED} r={0.05} />
        {[-2.6, 2.6].map((x) => <Block key={x} size={[0.3, 3.6, 0.3]} pos={[x, 1.8, 1.6]} color="#f2f2f2" r={0.05} />)}
        <WashBrushes x={[0]} len={3} foam={false} spread={1.1} />
      </group>
    </group>
  );
  return (
    <group>
      {/* Night-time super servo: charcoal and neon, EV chargers and a glowing price pylon. */}
      <Pavement w={13.8} d={11.8} color="#2d3138" />
      <Canopy w={8.4} d={4.6} h={4.6} at={[-1.4, 2.6]} night={night} dark />
      {[-4.4, -2.4, -0.4, 1.6].map((x) => <Pump key={x} pos={[x, 0.08, 2.6]} night={night} />)}
      <Car pos={[-3.4, 0.08, 4.3]} colour="#ff4fd8" rot={Math.PI / 2} />
      <group position={[-1.4, 0.08, -3.3]}>
        <Block3 w={8} h={4.0} d={4.2} color="#22262e" plinth="#15181d" />
        <GlassFront w={6} h={2.6} y={1.6} z={2.12} night={night} frame="#15181d"><Shelves w={5.6} z={-0.8} /></GlassFront>
        <SlidingDoors pos={[3.4, 0.3, 2.16]} w={1.4} />
        <Glow size={[8, 0.12, 0.1]} pos={[0, 4.15, 2.12]} color={NEON_CYAN} night={night} />
        <Glow size={[8, 0.12, 0.1]} pos={[0, 0.35, 2.12]} color={NEON_PINK} night={night} />
      </group>
      {[4.0, 5.8].map((x) => <group key={x} position={[x, 0.08, 3.6]}>
        <Block size={[0.7, 1.8, 0.5]} pos={[0, 0.9, 0]} color="#15181d" r={0.12} />
        <NearGlow size={[0.42, 0.6, 0.04]} pos={[0, 1.25, 0.26]} colour={EV_GREEN} idle="#0f3a1f" />
        <Glow size={[0.72, 0.06, 0.52]} pos={[0, 1.82, 0]} color={EV_GREEN} night={night} />
      </group>)}
      <Car pos={[4.9, 0.08, 1.0]} colour="#e9edf2" />
      <group position={[5.6, 0.08, -4.6]}>
        <Block size={[0.6, 6.4, 0.6]} pos={[0, 3.2, 0]} color="#22262e" r={0.06} />
        <Block size={[1.8, 3.0, 0.4]} pos={[0, 5.4, 0]} color="#15181d" r={0.1} />
        {[4.5, 5.2, 5.9].map((y) => <Glow key={y} size={[1.4, 0.44, 0.05]} pos={[0, y, 0.22]} color={y > 5.5 ? NEON_CYAN : "#ffcc33"} night={night} />)}
      </group>
      <LightPool r={5.4} color={NEON_CYAN} night={night} pos={[-1.4, 0, 2.6]} />
    </group>
  );
}

/* ───────── Car Wash (6 × 4 squares) ───────── */
/** Spinning brushes that whirl faster, with bubbles, while the explorer (or their car) is inside. */
function WashBrushes({ x, len, foam, spread = 1.5, glow = false }: { x: number[]; len: number; foam: boolean; spread?: number; glow?: boolean }) {
  const { group, state } = useExplorer(4.5);
  const brushes = useRef<Array<Group | null>>([]);
  const bubbles = useRef<Group>(null);
  useFrame((_, delta) => {
    const speed = state.current.near ? 9 : 1.5;
    brushes.current.forEach((brush, i) => { if (brush) brush.rotation.y += delta * speed * (i % 2 ? -1 : 1); });
    if (bubbles.current) bubbles.current.visible = state.current.near || foam;
  });
  return (
    <group ref={group}>
      {x.flatMap((bx, i) => [-1, 1].map((s) => (
        <group key={`${bx}${s}`} position={[bx, 1.6, s * spread]} ref={(node) => { brushes.current[i * 2 + (s + 1) / 2] = node; }}>
          <mesh><cylinderGeometry args={[0.5, 0.5, 2.8, 16]} /><Mat color={i % 2 ? "#ff6fb5" : "#3aa0ff"} rough={0.95} glow={glow ? 0.5 : 0} /></mesh>
          {[0, 1, 2, 3].map((k) => <Block key={k} size={[1.1, 2.6, 0.08]} pos={[0, 0, 0]} rot={[0, (k * Math.PI) / 4, 0]} color={i % 2 ? "#ff9fd0" : "#7cc4ff"} r={0.02} />)}
        </group>
      )))}
      <group ref={bubbles}>
        {Array.from({ length: Math.round(len) }, (_, i) => <Puffs key={i} pos={[-len / 2 + i + 0.5, 2.6, (i % 3) - 1]} color="#ffffff" rise={1.2} size={0.22} rate={0.6} />)}
      </group>
    </group>
  );
}
function CarWash({ level, night }: Props) {
  if (level === 1) return (
    <group>
      {/* A hose bay under a timber shade: wash pad, hose reel, bucket and a soapy car. */}
      <Pavement w={7.4} d={5.4} />
      <Block size={[5, 0.02, 3.4]} pos={[0, 0.09, 0]} color="#9bb3c4" r={0.005} />
      {[-1, 1].flatMap((x) => [-1, 1].map((z) => <Block key={`${x}${z}`} size={[0.18, 2.8, 0.18]} pos={[x * 2.6, 1.4, z * 1.8]} color={TIMBER} r={0.03} />))}
      <Block size={[5.6, 0.16, 4.0]} pos={[0, 2.9, 0]} color="#3aa0ff" r={0.04} />
      <group position={[-3.2, 0.08, -2.0]}><Block size={[0.24, 1.6, 0.24]} pos={[0, 0.8, 0]} color={SLATE} r={0.04} /><mesh position={[0, 1.1, 0.24]}><torusGeometry args={[0.3, 0.07, 8, 20]} /><Mat color="#2f8f4a" /></mesh></group>
      <group position={[2.4, 0.08, 1.9]}><mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.3, 0.25, 0.6, 16]} /><Mat color="#ffcc33" /></mesh><Ball pos={[0, 0.65, 0]} r={0.22} color="#ffffff" /></group>
      <Car pos={[0, 0.08, 0]} colour="#4c8dff" rot={Math.PI / 2} />
      <Puffs pos={[0.6, 1.8, 0]} color="#ffffff" rise={0.8} size={0.18} />
    </group>
  );
  const len = level === 2 ? 6.4 : 8;
  const wall = level >= 4 ? "#1b1a26" : level === 3 ? "#1aa39a" : "#f2f2f2";
  const roof = level >= 4 ? "#120f1c" : level === 3 ? "#ffcc33" : "#3aa0ff";
  return (
    <group>
      <Pavement w={level === 2 ? 10 : 11.8} d={level === 2 ? 6.6 : 7.8} color={level >= 4 ? "#2d3138" : CONCRETE} />
      <Block size={[level === 2 ? 9.8 : 11.6, 0.02, 3.4]} pos={[0, 0.09, 0]} color="#5a6470" r={0.005} />
      {/* The tunnel runs left to right: a solid back wall; pillars, a low wall and glass at the front so you see the brushes. */}
      <Block size={[len, 4, 0.3]} pos={[0, 2, -2.2]} color={wall} r={0.05} />
      {[-len / 2 + 0.2, 0, len / 2 - 0.2].map((x) => <Block key={x} size={[0.4, 4, 0.4]} pos={[x, 2, 2.2]} color={wall} r={0.05} />)}
      <Block size={[len, 0.9, 0.3]} pos={[0, 0.45, 2.2]} color={wall} r={0.05} />
      <mesh position={[0, 2.45, 2.2]}><planeGeometry args={[len - 0.4, 3.1]} /><meshStandardMaterial color="#cfe9ff" transparent opacity={0.16} roughness={0.05} depthWrite={false} /></mesh>
      <Block size={[len + 0.4, 0.5, 4.9]} pos={[0, 4.25, 0]} color={roof} r={0.08} />
      {/* Stripes along the roof edge. */}
      {Array.from({ length: Math.round(len / 0.8) }, (_, i) => <Block key={i} size={[0.4, 0.5, 0.06]} pos={[-len / 2 + 0.4 + i * 0.8, 4.25, 2.47]} color={level >= 4 ? NEON_PINK : i % 2 ? "#ffffff" : wall} r={0.02} glow={level >= 4 ? 0.8 : 0} />)}
      <WashBrushes x={level >= 3 ? [-2.4, 0, 2.4] : [-1.3, 1.3]} len={len - 1} foam={level >= 3} glow={level >= 4} />
      {level >= 3 ? [-len / 2 + 0.5, len / 2 - 0.5].map((x) => <group key={x}>
        {/* Rainbow foam arches at each end. */}
        {["#ff5e57", "#ffcc33", "#7ac943", "#3aa0ff", "#9a63ff"].map((colour, i) => <Block key={colour} size={[0.14, 0.14, 4.2]} pos={[x + (i - 2) * 0.17, 3.7, 0]} color={colour} r={0.03} glow={level >= 4 ? 0.8 : 0.25} />)}
      </group>) : null}
      {level >= 3 ? <group position={[-5.2, 0.08, -2.9]}>
        {/* Pay kiosk. */}
        <Block size={[0.9, 1.6, 0.7]} pos={[0, 0.8, 0]} color={level >= 4 ? "#15181d" : "#f2f2f2"} r={0.1} />
        <NearGlow size={[0.5, 0.4, 0.04]} pos={[0, 1.2, 0.36]} colour={level >= 4 ? NEON_CYAN : "#7dff8a"} idle="#14303a" />
      </group> : null}
      {level >= 4 ? <group>
        {[-1, 1].map((s) => <Glow key={s} size={[len, 0.08, 0.08]} pos={[0, 0.95, s * 2.06]} color={NEON_CYAN} night={night} />)}
        <SignBoard pos={[0, 5.2, 2.3]} w={3.6} colour="#120f1c" night={night}><Ball pos={[0, 0, 0]} r={0.26} color={NEON_CYAN} glow={0.8} /></SignBoard>
      </group> : <SignBoard pos={[0, 4.95, 2.3]} w={2.8} colour={wall} night={night}><Ball pos={[0, 0, 0]} r={0.22} color="#ffffff" /></SignBoard>}
      <Car pos={[level === 2 ? -3.0 : -3.9, 0.08, 0]} colour={level >= 4 ? "#ffcc33" : "#ff9f45"} rot={Math.PI / 2} />
      <LightPool r={3.8} color={level >= 4 ? NEON_PINK : "#cfe9ff"} night={night} />
    </group>
  );
}

/* ───────── Pizza Shop (6 × 5 squares) ───────── */
function Oven({ pos, night, small = false }: { pos: V3; night: boolean; small?: boolean }) {
  return (
    <group position={pos} scale={small ? 0.6 : 1}>
      <mesh position={[0, 0.7, 0]}><sphereGeometry args={[0.9, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><Mat color="#b5553c" /></mesh>
      <Block size={[2.0, 0.7, 1.8]} pos={[0, 0.35, 0]} color="#8e3f2c" r={0.06} />
      <Glow size={[0.7, 0.5, 0.05]} pos={[0, 0.95, 0.86]} color="#ff7a1a" night />
      {night ? <pointLight position={[0, 1, 1.2]} color="#ff9a3a" intensity={2.4} distance={4} /> : null}
      <Puffs pos={[0, 1.8, 0]} color="#cfcfcf" rise={1.6} />
    </group>
  );
}
function Slice({ pos, s = 1, glow = false }: { pos: V3; s?: number; glow?: boolean }) {
  return (
    <group position={pos} scale={s}>
      <mesh rotation={[0, 0, Math.PI]}><coneGeometry args={[0.9, 1.8, 3]} /><Mat color="#ffcc33" glow={glow ? 0.6 : 0} /></mesh>
      <Block size={[1.6, 0.25, 0.3]} pos={[0, 0.9, 0]} color="#c98a52" r={0.08} />
      {[[-0.2, 0.3], [0.25, 0.1], [0, -0.3]].map(([x, y], i) => <Ball key={i} pos={[x, y, 0.16]} r={0.13} color="#d8282b" />)}
    </group>
  );
}
/** The delivery scooter loops the forecourt. */
function DeliveryScooter({ r }: { r: number }) {
  return (
    <Spin speed={0.9}>
      <group position={[r, 0, 0]} rotation={[0, 0, 0]}>
        <Block size={[0.5, 0.5, 1.4]} pos={[0, 0.55, 0]} color={PIZZA_GREEN} r={0.15} />
        <Block size={[0.6, 0.5, 0.6]} pos={[0, 1.05, -0.35]} color="#d8282b" r={0.08} />
        {[0.55, -0.55].map((z) => <mesh key={z} position={[0, 0.25, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.24, 0.24, 0.16, 14]} /><Mat color="#1d1f22" /></mesh>)}
      </group>
    </Spin>
  );
}
function PizzaShop({ level, night }: Props) {
  if (level === 1) return (
    <group>
      {/* A brick takeaway hut with a hatch onto the glowing oven. */}
      <Pavement w={6} d={5} />
      <group position={[0, 0.08, -0.8]}>
        <Block3 w={3.6} h={2.8} d={2.6} color={BRICK} />
        <Block size={[3.8, 0.24, 2.8]} pos={[0, 3.1, 0]} color={PIZZA_GREEN} r={0.04} />
        <GlassFront w={1.8} h={1.0} y={1.6} z={1.32} depth={1.4} night={night}><Oven pos={[0, -0.8, -0.8]} night={night} small /></GlassFront>
        <Block size={[2.2, 0.08, 0.4]} pos={[0, 1.08, 1.5]} color={TIMBER} r={0.02} />
        <Awning w={3.4} y={2.55} z={0.8} colours={[PIZZA_GREEN, "#fff6e6", "#d8282b", "#fff6e6"]} />
      </group>
      {/* A chalk menu board out the front. */}
      <group position={[2.2, 0.08, 1.4]} rotation={[0, -0.4, 0]}><Block size={[0.8, 1.1, 0.06]} pos={[0, 0.65, 0]} rot={[-0.2, 0, 0]} color="#1f2328" r={0.03} />{[0.85, 0.65, 0.45].map((y) => <Block key={y} size={[0.5, 0.04, 0.02]} pos={[0, y, 0.06]} rot={[-0.2, 0, 0]} color="#ffffff" r={0.005} />)}</group>
    </group>
  );
  if (level === 2) return (
    <group>
      <Pavement w={9} d={7.6} />
      <group position={[0, 0.08, -1.4]}>
        <Block3 w={6.6} h={3.8} d={4} color={BRICK} />
        <FlatRoof w={6.6} d={4} y={4.0} color={SLATE} trim={PIZZA_GREEN} />
        <GlassFront w={3.6} h={2.0} y={1.4} z={2.02} night={night}><Oven pos={[0, -1.0, -0.9]} night={night} /></GlassFront>
        <Door x={2.5} z={2.02} w={1.1} glass night={night} />
        <Awning w={6.8} y={3.0} z={1.6} colours={[PIZZA_GREEN, "#fff6e6", "#d8282b", "#fff6e6"]} />
        <SignBoard pos={[0, 3.75, 2.1]} w={2.8} colour={PIZZA_GREEN} night={night}><Slice pos={[0, 0, 0.04]} s={0.25} /></SignBoard>
      </group>
      <PizzaTable pos={[-2.6, 0.08, 2.4]} colour="#d8282b" />
      <PizzaTable pos={[2.4, 0.08, 2.4]} colour={PIZZA_GREEN} />
    </group>
  );
  return (
    <group>
      {/* Two storeys of brick with green-shuttered windows and a flower balcony; the scooter loops out the front. */}
      <Pavement w={11.8} d={9.8} color={level >= 4 ? "#b9b4aa" : CONCRETE} />
      <group position={[0, 0.08, -2.2]}>
        <Block3 w={8} h={6.8} d={4.6} color={BRICK} />
        <GlassFront w={4.4} h={2.2} y={1.5} z={2.32} night={night}><Oven pos={[0, -1.1, -0.9]} night={night} /></GlassFront>
        <Door x={3.1} z={2.32} w={1.1} glass night={night} />
        <Awning w={8.2} y={3.2} z={1.9} colours={level >= 4 ? ["#16131f", "#d8282b"] : [PIZZA_GREEN, "#fff6e6", "#d8282b", "#fff6e6"]} />
        {[-2.4, 0, 2.4].map((x) => <group key={x} position={[x, 5.2, 2.32]}>
          <Windows x0={0} x1={0} y={0} z={0} n={1} w={1.0} h={1.3} night={night} />
          {[-1, 1].map((s) => <Block key={s} size={[0.42, 1.3, 0.06]} pos={[s * 0.78, 0, 0.04]} color={PIZZA_GREEN} r={0.02} />)}
        </group>)}
        {/* Balcony with flowers. */}
        <Block size={[8.2, 0.14, 0.8]} pos={[0, 4.2, 2.7]} color="#e6e1d6" r={0.03} />
        {Array.from({ length: 14 }, (_, i) => <Block key={i} size={[0.05, 0.6, 0.05]} pos={[-3.9 + i * 0.6, 4.55, 3.06]} color="#2a2f36" r={0.01} />)}
        <Block size={[8.2, 0.06, 0.06]} pos={[0, 4.85, 3.06]} color="#2a2f36" r={0.01} />
        {[-3.2, -1.6, 1.6, 3.2].map((x) => <group key={x} position={[x, 4.3, 2.75]}><Block size={[0.9, 0.3, 0.3]} pos={[0, 0.15, 0]} color={TIMBER} r={0.03} />{[-0.25, 0, 0.25].map((dx) => <Ball key={dx} pos={[dx, 0.42, 0]} r={0.14} color={dx ? "#ff5e57" : "#ffcc33"} />)}</group>)}
        <FlatRoof w={8} d={4.6} y={7.0} color={level >= 4 ? TIMBER : SLATE} trim={level >= 4 ? "#2a2f36" : PIZZA_GREEN} />
        <SignBoard pos={[0, 3.9, 2.4]} w={3.2} colour={level >= 4 ? "#16131f" : PIZZA_GREEN} night={night}><Slice pos={[0, 0, 0.04]} s={0.28} glow={level >= 4} /></SignBoard>
        {level >= 4 ? <group>
          {/* Rooftop terrace with festoon lights and a giant spinning slice. */}
          {[-2.4, 2.4].map((x) => <PizzaTable key={x} pos={[x, 7.2, -0.6]} colour={x < 0 ? "#d8282b" : PIZZA_GREEN} />)}
          {[-3.8, 3.8].map((x) => <Block key={x} size={[0.08, 2.8, 0.08]} pos={[x, 8.6, 1.9]} color="#2a2f36" r={0.02} />)}
          <StringLights from={[-3.8, 9.9, 1.9]} to={[3.8, 9.9, 1.9]} night={night} n={14} sag={0.4} colors={[WARM, "#ff7a1a"]} r={0.05} />
          <group position={[0, 8.4, -1.6]}><Spin speed={0.6}><Slice pos={[0, 0, 0]} s={1.1} glow={night} /></Spin></group>
        </group> : null}
      </group>
      <group position={[0, 0.08, 2.6]}><DeliveryScooter r={1.6} /></group>
      <PizzaTable pos={[-4.0, 0.08, 2.8]} colour="#d8282b" />
      <PizzaTable pos={[4.0, 0.08, 2.8]} colour={PIZZA_GREEN} />
      {level >= 4 ? <StringLights from={[-5.6, 3.0, 4.6]} to={[5.6, 3.0, 4.6]} night={night} n={12} colors={[WARM, "#ff7a1a", "#7dff8a"]} /> : null}
      {level >= 4 ? [-5.6, 5.6].map((x) => <Block key={x} size={[0.1, 3.0, 0.1]} pos={[x, 1.5, 4.6]} color="#2a2f36" r={0.03} />) : null}
      <LightPool r={3.6} color="#ffb35a" night={night} pos={[0, 0, 1.8]} />
    </group>
  );
}

/** An outdoor table with two stools and a market umbrella. */
function PizzaTable({ pos, colour }: { pos: V3; colour: string }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.75, 0]}><cylinderGeometry args={[0.6, 0.6, 0.06, 20]} /><Mat color="#f2f2f2" /></mesh>
      <Block size={[0.08, 0.75, 0.08]} pos={[0, 0.37, 0]} color={SLATE} r={0.02} />
      {[-1, 1].map((s) => <mesh key={s} position={[s * 0.85, 0.45, 0]}><cylinderGeometry args={[0.22, 0.2, 0.06, 14]} /><Mat color={TIMBER} /></mesh>)}
      <Block size={[0.05, 2.6, 0.05]} pos={[0, 1.3, 0]} color="#e6e6e6" r={0.02} />
      <mesh position={[0, 2.5, 0]}><coneGeometry args={[1.1, 0.5, 8, 1, true]} /><meshStandardMaterial color={colour} side={DoubleSide} /></mesh>
    </group>
  );
}

/* ───────── Supermarket (9 × 7 squares) ───────── */
function DoorPane({ w, h }: { w: number; h: number }) {
  return <group><mesh><planeGeometry args={[w, h]} /><meshStandardMaterial color="#cfe9ff" transparent opacity={0.45} roughness={0.05} depthWrite={false} /></mesh><Block size={[w, 0.06, 0.04]} pos={[0, -h / 2 + 0.03, 0]} color={SLATE} r={0.01} /></group>;
}
/** Glass doors that slide open as the explorer walks up. */
function SlidingDoors({ pos, w = 2.4, h = 2.6 }: { pos: V3; w?: number; h?: number }) {
  const { group, state } = useExplorer(4);
  const left = useRef<Group>(null), right = useRef<Group>(null);
  useFrame((_, delta) => {
    const target = state.current.near ? w / 2 - 0.1 : 0;
    for (const [door, side] of [[left.current, -1], [right.current, 1]] as const) {
      if (!door) continue;
      door.position.x += (side * (w / 4 + target) - door.position.x) * Math.min(1, delta * 6);
    }
  });
  return (
    <group ref={group} position={pos}>
      <Block size={[w + 0.3, h + 0.2, 0.08]} pos={[0, h / 2, -0.06]} color={SLATE} r={0.02} />
      <mesh position={[0, h / 2, -0.03]}><planeGeometry args={[w, h]} /><meshStandardMaterial color="#ffe9b8" emissive="#ffd27a" emissiveIntensity={0.4} /></mesh>
      <group ref={left} position={[-w / 4, h / 2, 0.02]}><DoorPane w={w / 2} h={h} /></group>
      <group ref={right} position={[w / 4, h / 2, 0.02]}><DoorPane w={w / 2} h={h} /></group>
    </group>
  );
}
function Supermarket({ level, night }: Props) {
  if (level === 1) return (
    <group>
      {/* A mini mart with fruit crates out the front. */}
      <Pavement w={9} d={7} />
      <group position={[0, 0.08, -1.2]}>
        <Block3 w={6.4} h={3.4} d={4} color="#f7f7f7" />
        <Block size={[6.5, 0.6, 4.1]} pos={[0, 3.3, 0]} color={MART_RED} r={0.05} />
        <GlassFront w={3.6} h={2.1} y={1.4} z={2.02} night={night}><Shelves w={3.2} z={-0.8} /></GlassFront>
        <SlidingDoors pos={[2.4, 0.3, 2.06]} w={1.4} h={2.3} />
        <Awning w={6.6} y={2.8} z={1.6} colours={[MART_RED, "#ffffff"]} />
      </group>
      {[-2.4, -1.6, -0.8].map((x, i) => <Crate key={x} pos={[x, 0.08, 1.5]} colour={["#e5484d", "#ffcc33", "#7ac943"][i]} />)}
    </group>
  );
  const big = level >= 3;
  const w = big ? 13 : 10, d = big ? 6.4 : 5.6, z = big ? -3.4 : -1.4, h = big ? 5.2 : 4.6;
  return (
    <group>
      <Pavement w={big ? 17.8 : 14} d={big ? 13.8 : 10} color={big ? ASPHALT : CONCRETE} />
      {big ? <group><Block size={[17.6, 0.02, 1.8]} pos={[0, 0.09, z + d / 2 + 1.0]} color={CONCRETE} r={0.005} /><BayLines x0={-7.5} n={6} gap={2.5} z={4.6} /></group> : null}
      <group position={[0, 0.08, z]}>
        <Block3 w={w} h={h} d={d} color={level >= 4 ? "#eef1f6" : "#f7f7f7"} />
        {/* Brick ends, a red fascia and a big glass front full of shelves. */}
        {[-1, 1].map((s) => <Block key={s} size={[1.4, h, d + 0.06]} pos={[s * (w / 2 - 0.7), h / 2 + 0.2, 0]} color={BRICK} r={0.04} />)}
        <Block size={[w + 0.1, 0.9, d + 0.1]} pos={[0, h - 0.1, 0]} color={MART_RED} r={0.05} />
        <GlassFront w={w * 0.42} h={2.8} y={1.7} z={d / 2 + 0.02} night={night}><Shelves w={w * 0.4} z={-0.8} /></GlassFront>
        <group position={[-w * 0.24, 0, 0]}><GlassFront w={w * 0.18} h={2.8} y={1.7} z={d / 2 + 0.02} night={night}><Shelves w={w * 0.16} rows={2} z={-0.8} /></GlassFront></group>
        <SlidingDoors pos={[w * 0.3, 0.3, d / 2 + 0.06]} />
        {/* Entrance canopy. */}
        <Block size={[3.4, 0.18, 2.0]} pos={[w * 0.3, 3.3, d / 2 + 1.0]} color={MART_RED} r={0.04} />
        {[-1.5, 1.5].map((x) => <Block key={x} size={[0.14, 3.2, 0.14]} pos={[w * 0.3 + x, 1.6, d / 2 + 1.9]} color={SLATE} r={0.03} />)}
        <SignBoard pos={[-0.6, h + 0.6, d / 2 + 0.1]} w={big ? 5.4 : 4.4} h={1.0} colour={MART_RED} night={night}><Trolley pos={[0, -0.55, 0]} /></SignBoard>
        {level >= 4 ? <group>
          {[-w / 2 + 2.2, -w / 2 + 5, w / 2 - 5, w / 2 - 2.2].map((x) => <group key={x} position={[x, h + 0.35, -0.8]} rotation={[-0.35, 0, 0]}><Block size={[2.4, 0.08, 1.8]} pos={[0, 0, 0]} color="#1f3b6e" r={0.02} metal={0.4} rough={0.3} /></group>)}
          <Glow size={[w, 0.12, 0.1]} pos={[0, h - 0.6, d / 2 + 0.08]} color="#ffcc33" night={night} />
        </group> : null}
      </group>
      {/* Trolley bay. */}
      <group position={[big ? -6.8 : -5.6, 0.08, big ? 1.4 : 2.4]}>
        <Block size={[2.4, 0.06, 1.2]} pos={[0, 0.03, 0]} color="#c9ced6" r={0.02} />
        {[-0.7, 0, 0.7].map((x) => <Trolley key={x} pos={[x, 0, 0]} />)}
        <Block size={[2.6, 0.12, 1.4]} pos={[0, 2.2, 0]} color={MART_RED} r={0.03} />
        {[-1.2, 1.2].map((x) => <Block key={x} size={[0.08, 2.2, 0.08]} pos={[x, 1.1, -0.6]} color={SLATE} r={0.02} />)}
      </group>
      {big ? <group><Car pos={[-3.75, 0.08, 4.6]} colour="#4c8dff" /><Car pos={[1.25, 0.08, 4.6]} colour="#ffcc33" /><Car pos={[6.25, 0.08, 4.6]} colour="#7ac943" /></group> : null}
      {big ? [-7.8, 7.8].map((x) => <Tree key={x} pos={[x, 0.08, 1.0]} s={0.9} />) : null}
      {level >= 4 ? <group position={[7.6, 0.08, -5.4]}>
        {/* A tall pylon sign that glows at night. */}
        <Block size={[0.5, 7, 0.5]} pos={[0, 3.5, 0]} color={SLATE} r={0.05} />
        <Block size={[1.6, 1.6, 0.4]} pos={[0, 7.4, 0]} color={MART_RED} r={0.12} />
        <Glow size={[1.2, 1.2, 0.05]} pos={[0, 7.4, 0.22]} color="#fff7d6" night={night} />
      </group> : null}
      <LightPool r={5.2} color="#fff2c4" night={night} pos={[0, 0, big ? 0.6 : 2.2]} />
    </group>
  );
}

/* ───────── Police Station (6 × 5 squares) ───────── */
function PatrolCar({ pos, rot = 0, flashing = false }: { pos: V3; rot?: number; flashing?: boolean }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Car pos={[0, 0, 0]} colour="#f7f7f7" />
      <Block size={[1.82, 0.22, 3.82]} pos={[0, 0.7, 0]} color={POLICE_BLUE} r={0.06} />
      <Beacons pos={[0, 1.62, -0.2]} w={1.0} on={flashing} />
    </group>
  );
}
function BlueLamp({ pos, night }: { pos: V3; night: boolean }) {
  return <group position={pos}><Block size={[0.5, 0.6, 0.5]} pos={[0, 0, 0]} color="#ffffff" r={0.08} /><Glow size={[0.4, 0.4, 0.52]} pos={[0, 0, 0]} color="#4c8dff" night={night} /></group>;
}
function PoliceStation({ level, night }: Props) {
  if (level === 1) return (
    <group>
      {/* A little blue-and-white police post with its lamp. */}
      <Pavement w={6} d={5} />
      <group position={[0, 0.08, -0.8]}>
        <Block3 w={3.6} h={3.0} d={2.8} color="#eef1f6" />
        <Block size={[3.62, 0.5, 2.82]} pos={[0, 1.3, 0]} color={POLICE_BLUE} r={0.03} />
        <Block size={[3.8, 0.3, 3.0]} pos={[0, 3.35, 0]} color={POLICE_BLUE} r={0.05} />
        <Door z={1.42} w={1.1} glass night={night} />
        <BlueLamp pos={[0, 3.85, 0]} night={night} />
      </group>
      <group position={[2.3, 0.08, 1.4]}><Block size={[1.4, 0.1, 0.4]} pos={[0, 0.48, 0]} color={TIMBER} r={0.03} />{[-0.55, 0.55].map((x) => <Block key={x} size={[0.08, 0.45, 0.35]} pos={[x, 0.24, 0]} color={SLATE} r={0.02} />)}</group>
    </group>
  );
  if (level === 2) return (
    <group>
      <Pavement w={9.6} d={7.8} />
      <group position={[0, 0.08, -1.6]}>
        <Block3 w={7} h={4.2} d={4.2} color={POLICE_BRICK} />
        <Block size={[7.04, 0.6, 4.24]} pos={[0, 3.9, 0]} color={POLICE_BLUE} r={0.03} />
        <FlatRoof w={7} d={4.2} y={4.4} color={SLATE} trim="#eef1f6" />
        {/* Steps up to the front door and the blue lamp over it. */}
        <Block size={[2.2, 0.3, 0.8]} pos={[0, 0.15, 2.5]} color={CONCRETE} r={0.02} />
        <Door z={2.12} w={1.4} glass night={night} />
        <BlueLamp pos={[0, 3.2, 2.4]} night={night} />
        <Windows x0={-2.6} x1={-1.4} y={2.2} z={2.12} n={2} w={0.8} h={1.2} night={night} />
        <Windows x0={1.4} x1={2.6} y={2.2} z={2.12} n={2} w={0.8} h={1.2} night={night} />
      </group>
      <PatrolCar pos={[2.4, 0.08, 2.4]} rot={Math.PI / 2} />
    </group>
  );
  return (
    <group>
      {/* Two storeys with a flagpole and a lookout tower; at Legendary a rooftop helipad and flashing patrol cars. */}
      <Pavement w={11.8} d={9.8} color={level >= 4 ? "#a7a39a" : CONCRETE} />
      <group position={[-1, 0.08, -2.0]}>
        <Block3 w={7.8} h={6.8} d={5} color={level >= 4 ? "#e9edf2" : POLICE_BRICK} />
        <Block size={[7.84, 0.6, 5.04]} pos={[0, 3.6, 0]} color={POLICE_BLUE} r={0.03} />
        <FlatRoof w={7.8} d={5} y={7.0} color={SLATE} trim={POLICE_BLUE} />
        <Block size={[2.4, 0.3, 0.8]} pos={[0, 0.15, 2.9]} color={CONCRETE} r={0.02} />
        <Door z={2.52} w={1.6} glass night={night} />
        <BlueLamp pos={[0, 3.2, 2.8]} night={night} />
        <Windows x0={-3} x1={-1.6} y={2.2} z={2.52} n={2} w={0.9} h={1.3} night={night} />
        <Windows x0={1.6} x1={3} y={2.2} z={2.52} n={2} w={0.9} h={1.3} night={night} />
        <Windows x0={-3} x1={3} y={5.4} z={2.52} n={5} w={0.9} h={1.3} night={night} />
        {level >= 4 ? <group position={[0, 7.2, 0]}>
          <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[2.3, 2.3, 0.12, 32]} /><Mat color="#2b313b" /></mesh>
          <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.8, 2.0, 32]} /><meshStandardMaterial color="#ffcc33" emissive="#ffcc33" emissiveIntensity={night ? 1.4 : 0.25} /></mesh>
          <Glow size={[7.8, 0.1, 0.1]} pos={[0, -0.2, 2.56]} color="#4c8dff" night={night} />
        </group> : null}
      </group>
      <group position={[4.4, 0.08, -2.4]}>
        <Block3 w={2.2} h={8.4} d={2.2} color={POLICE_BLUE} />
        <Block size={[2.8, 1.8, 2.8]} pos={[0, 9.4, 0]} color="#eef1f6" r={0.06} />
        <Glow size={[2.4, 0.9, 0.05]} pos={[0, 9.4, 1.42]} color={night ? WARM : GLASS} night={night} />
        <BlueLamp pos={[0, 10.6, 0]} night={night} />
      </group>
      <FlagPole pos={[-5.2, 0.08, 1.4]} h={6} colour={POLICE_BLUE} />
      <PatrolCar pos={[1.4, 0.08, 2.9]} rot={Math.PI / 2} flashing={level >= 4} />
      <PatrolCar pos={[-2.8, 0.08, 2.9]} rot={Math.PI / 2} flashing={level >= 4} />
      <LightPool r={3.8} color="#9fc2ff" night={night} pos={[0, 0, 2.0]} />
    </group>
  );
}

/* ───────── Hospital (8 × 6 squares) ───────── */
/** A plain "H" sign made of blocks (hospitals use H, not a cross). */
function HSign({ pos, s = 1, night }: { pos: V3; s?: number; night: boolean }) {
  return (
    <group position={pos} scale={s}>
      <Block size={[1.4, 1.4, 0.14]} pos={[0, 0, 0]} color="#1f6fd6" r={0.12} />
      {[-0.3, 0.3].map((x) => <Block key={x} size={[0.18, 0.9, 0.05]} pos={[x, 0, 0.09]} color="#ffffff" r={0.02} glow={night ? 0.9 : 0} />)}
      <Block size={[0.6, 0.18, 0.05]} pos={[0, 0, 0.09]} color="#ffffff" r={0.02} glow={night ? 0.9 : 0} />
    </group>
  );
}
function Ambulance({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Block size={[2.0, 1.9, 4.6]} pos={[0, 1.35, -0.3]} color="#f7f7f7" r={0.15} />
      <Block size={[2.0, 1.0, 1.2]} pos={[0, 0.9, 2.3]} color="#f7f7f7" r={0.15} />
      <Block size={[1.8, 0.5, 0.6]} pos={[0, 1.6, 2.4]} color="#1d2733" r={0.1} />
      <Block size={[2.02, 0.3, 5.82]} pos={[0, 1.0, 0.2]} color={HOSPITAL_TEAL} r={0.05} />
      {[1.8, -1.8].flatMap((z) => [-1, 1].map((s) => <mesh key={`${z}${s}`} position={[s * 0.9, 0.4, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.4, 0.4, 0.28, 16]} /><Mat color="#1d1f22" /></mesh>))}
      <Beacons pos={[0, 2.38, 1.6]} w={1.2} />
    </group>
  );
}
/** The rescue helicopter comes in to land on the roof and lifts off again. */
function Helicopter({ y }: { y: number }) {
  const body = useRef<Group>(null);
  useFrame(({ clock }) => { if (body.current) body.current.position.y = y + Math.max(0, Math.sin(clock.elapsedTime * 0.35)) * 3; });
  return (
    <group ref={body}>
      <Block size={[1.6, 1.4, 3.0]} pos={[0, 0.9, 0]} color="#e5484d" r={0.5} />
      <Block size={[1.3, 0.8, 1.0]} pos={[0, 1.1, 1.2]} color="#1d2733" r={0.3} />
      <Block size={[0.3, 0.3, 2.4]} pos={[0, 1.1, -2.4]} color="#e5484d" r={0.1} />
      {[-1, 1].map((s) => <Block key={s} size={[0.08, 0.08, 2.6]} pos={[s * 0.7, 0.1, 0]} color={SLATE} r={0.02} />)}
      <group position={[0, 1.75, 0]}><Spin speed={14}><Block size={[5.4, 0.05, 0.25]} pos={[0, 0, 0]} color="#2b313b" r={0.02} /><Block size={[0.25, 0.05, 5.4]} pos={[0, 0, 0]} color="#2b313b" r={0.02} /></Spin></group>
    </group>
  );
}
function Hospital({ level, night }: Props) {
  if (level === 1) return (
    <group>
      {/* A friendly town clinic. */}
      <Pavement w={8} d={6} />
      <group position={[0, 0.08, -1.0]}>
        <Block3 w={5.6} h={3.4} d={3.6} color="#f7f7f7" />
        <Block size={[5.64, 0.4, 3.64]} pos={[0, 1.0, 0]} color={HOSPITAL_TEAL} r={0.03} />
        <FlatRoof w={5.6} d={3.6} y={3.6} color={SLATE} trim={HOSPITAL_TEAL} />
        <Door z={1.82} w={1.4} glass night={night} />
        <Windows x0={-2} x1={-1.2} y={2.1} z={1.82} n={2} w={0.6} h={0.8} night={night} />
        <HSign pos={[1.8, 2.4, 1.9]} s={0.8} night={night} />
      </group>
      <Planter pos={[-3.0, 0.08, 1.8]} /><Planter pos={[3.0, 0.08, 1.8]} />
    </group>
  );
  const w = level === 2 ? 9 : 11.6;
  const floors = level === 2 ? 2 : 3;
  const h = 0.6 + floors * 2.4;
  return (
    <group>
      <Pavement w={level === 2 ? 12.4 : 15.8} d={level === 2 ? 9.4 : 11.8} />
      <group position={[level === 2 ? 0 : 1.4, 0.08, -2.4]}>
        <Block3 w={w} h={h} d={6} color="#f7f7f7" />
        {Array.from({ length: floors }, (_, f) => <Block key={f} size={[w + 0.04, 0.24, 6.04]} pos={[0, 0.5 + (f + 1) * 2.4, 0]} color={HOSPITAL_TEAL} r={0.02} />)}
        {Array.from({ length: floors }, (_, f) => <Windows key={f} x0={-w / 2 + 1.1} x1={w / 2 - 1.1} y={1.6 + f * 2.4} z={3.02} n={level === 2 ? 5 : 7} w={0.8} h={1.0} night={night} />)}
        <FlatRoof w={w} d={6} y={h + 0.2} color={SLATE} trim={HOSPITAL_TEAL} />
        {/* Glass entrance atrium with a canopy. */}
        <group position={[-w / 2 + 2.2, 0, 3.0]}>
          <Block size={[3.2, 3.4, 1.6]} pos={[0, 1.9, 0.6]} color="#cfe9ff" r={0.05} />
          <Glow size={[3.0, 3.0, 0.04]} pos={[0, 1.9, 1.42]} color={night ? WARM : "#e8f6ff"} night={night} />
          <Block size={[4.2, 0.2, 2.6]} pos={[0, 3.7, 1.0]} color={HOSPITAL_TEAL} r={0.05} />
        </group>
        <HSign pos={[w / 2 - 1.3, h - 0.9, 3.12]} s={1.2} night={night} />
      </group>
      <Ambulance pos={[level === 2 ? -4.6 : -5.0, 0.08, 2.6]} rot={Math.PI / 2} />
      {level >= 3 ? [5.4, 7.0].map((x) => <Tree key={x} pos={[x, 0.08, 3.8]} s={0.8} />) : null}
      {level >= 4 ? <group position={[-4.9, 0.08, -2.4]}>
        {/* A tall teal wing with the rooftop helipad: the rescue helicopter comes and goes. */}
        <Block3 w={5.6} h={10.6} d={6} color="#e9f7f5" />
        {[2.6, 5.0, 7.4, 9.8].map((y) => <Windows key={y} x0={-1.8} x1={1.8} y={y} z={3.02} n={3} w={0.8} h={1.0} night={night} />)}
        <Glow size={[0.12, 10.4, 0.12]} pos={[2.82, 5.4, 3.02]} color={HOSPITAL_TEAL} night={night} />
        <group position={[0, 10.8, 0]}>
          <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[2.6, 2.6, 0.12, 32]} /><Mat color="#2b313b" /></mesh>
          <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[2.1, 2.3, 32]} /><meshStandardMaterial color="#ffcc33" emissive="#ffcc33" emissiveIntensity={night ? 1.4 : 0.25} /></mesh>
          <Helicopter y={0.12} />
        </group>
      </group> : null}
      <LightPool r={4.6} color="#cfeeff" night={night} pos={[0, 0, 2.2]} />
    </group>
  );
}

/* ───────── Vet & Pet Shop (5 × 4 squares) ───────── */
/** A paw-print sign that glows after dark. */
function PawSign({ pos, night }: { pos: V3; night: boolean }) {
  return (
    <SignBoard pos={pos} w={2.4} h={0.6} colour="#ff9f45" night={night}>
      <Ball pos={[0, -0.06, 0]} r={0.14} color="#ffffff" glow={night ? 0.6 : 0} />{[-0.16, 0, 0.16].map((x) => <Ball key={x} pos={[x, 0.14, 0]} r={0.06} color="#ffffff" glow={night ? 0.6 : 0} />)}
    </SignBoard>
  );
}
function Puppy({ pos, coat, rot = 0, s = 0.75 }: { pos: V3; coat?: string; rot?: number; s?: number }) {
  return <group position={pos} rotation={[0, rot, 0]} scale={s}><Animal variant="blue_heeler" tint={coat} /></group>;
}
/** A puppy in the play yard trots over to the explorer (never past the fence) and back again. */
function FollowPuppy({ yard }: { yard: [number, number] }) {
  const { group, state } = useExplorer(6);
  const pup = useRef<Group>(null);
  useFrame(({ clock }, delta) => {
    const p = pup.current;
    if (!p) return;
    const s = state.current;
    const home: [number, number] = [Math.sin(clock.elapsedTime * 0.7) * yard[0] * 0.3, Math.cos(clock.elapsedTime * 0.7) * yard[1] * 0.3];
    const target: [number, number] = s.near ? [Math.max(-yard[0] / 2 + 0.4, Math.min(yard[0] / 2 - 0.4, s.x)), Math.max(-yard[1] / 2 + 0.4, Math.min(yard[1] / 2 - 0.4, s.z))] : home;
    const dx = target[0] - p.position.x, dz = target[1] - p.position.z;
    const step = Math.min(1, delta * 2.5);
    p.position.x += dx * step; p.position.z += dz * step;
    if (Math.hypot(dx, dz) > 0.05) p.rotation.y = Math.atan2(dx, dz);
    p.position.y = Math.abs(Math.sin(clock.elapsedTime * 8)) * 0.08;
  });
  return <group ref={group}><group ref={pup}><Puppy pos={[0, 0, 0]} coat="#c08552" s={0.8} /></group></group>;
}
function YardFence({ w, d, colour = TIMBER }: { w: number; d: number; colour?: string }) {
  return (
    <group>
      {[-1, 1].map((s) => <Block key={`x${s}`} size={[w, 0.7, 0.08]} pos={[0, 0.45, s * d / 2]} color={colour} r={0.02} />)}
      {[-1, 1].map((s) => <Block key={`z${s}`} size={[0.08, 0.7, d]} pos={[s * w / 2, 0.45, 0]} color={colour} r={0.02} />)}
    </group>
  );
}
function VetPetShop({ level, night }: Props) {
  const front = (w: number, h: number) => (
    <GlassFront w={w} h={h} y={1.4} z={0} night={night}>
      {/* Puppies tumbling in the window. */}
      <group position={[0, -h / 2 + 0.05, -0.6]}>
        {[[-0.8, "#c08552"], [0, "#78888c"], [0.8, "#f2e2c8"]].map(([x, coat], i) => <group key={i} position={[(x as number) * (w / 3), 0, 0]}><Spin speed={0.6 + i * 0.3}><Puppy pos={[0.15, 0, 0]} coat={coat as string} s={0.55} /></Spin></group>)}
      </group>
    </GlassFront>
  );
  if (level === 1) return (
    <group>
      <Pavement w={5.6} d={4.6} />
      <group position={[0, 0.08, -0.6]}>
        <Block3 w={4} h={3.0} d={2.6} color="#ffd9a8" />
        {/* Timber board front, a striped awning and a paw sign. */}
        {Array.from({ length: 9 }, (_, i) => <Block key={i} size={[0.42, 3.0, 0.06]} pos={[-1.8 + i * 0.45, 1.7, 1.32]} color={i % 2 ? "#e9b77b" : "#f2c48d"} r={0.01} />)}
        <group position={[-0.5, 0, 1.4]}>{front(2.2, 1.5)}</group>
        <Door x={1.4} z={1.4} w={0.9} h={2.2} color="#ff9f45" night={night} />
        <Awning w={4.2} y={2.75} z={0.9} colours={["#ff9f45", "#fff6e6"]} />
        <PawSign pos={[0, 3.45, 1.35]} night={night} />
      </group>
    </group>
  );
  const shopW = level >= 3 ? 5.6 : 6.4;
  const x = level >= 3 ? -2.0 : 0;
  return (
    <group>
      <Pavement w={level === 2 ? 8.4 : 9.8} d={level === 2 ? 6.6 : 7.8} />
      <group position={[x, 0.08, -1.4]}>
        <Block3 w={shopW} h={level >= 4 ? 6.4 : 3.6} d={4} color={level >= 4 ? "#bfeee2" : "#e3f6ef"} />
        {/* A timber-clad ground floor. */}
        {Array.from({ length: Math.round(shopW / 0.45) }, (_, i) => <Block key={i} size={[0.42, 3.2, 0.06]} pos={[-shopW / 2 + 0.25 + i * 0.45, 1.8, 2.02]} color={i % 2 ? "#c98a52" : "#d99a62"} r={0.01} />)}
        <group position={[-0.6, 0, 2.1]}>{front(3.0, 1.8)}</group>
        <Door x={shopW / 2 - 0.9} z={2.1} w={1.1} glass night={night} />
        <Awning w={shopW + 0.2} y={3.1} z={1.6} colours={["#ff9f45", "#fff6e6"]} />
        <PawSign pos={[0, 3.9, 2.05]} night={night} />
        {/* The vet's green cross. */}
        <group position={[-shopW / 2 + 0.5, 2.6, 2.12]}><Block size={[0.7, 0.7, 0.06]} pos={[0, 0, 0]} color="#ffffff" r={0.06} /><Block size={[0.4, 0.12, 0.03]} pos={[0, 0, 0.04]} color="#2f8f4a" r={0.01} glow={night ? 0.8 : 0} /><Block size={[0.12, 0.4, 0.03]} pos={[0, 0, 0.04]} color="#2f8f4a" r={0.01} glow={night ? 0.8 : 0} /></group>
        {level >= 4 ? <group>
          {/* Pet hotel upstairs: round lit windows and a bone sign on the roof. */}
          {[-1.8, 0, 1.8].map((wx) => <group key={wx} position={[wx, 5.0, 2.02]}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.55, 0.55, 0.08, 24]} /><Mat color="#ffffff" /></mesh><mesh position={[0, 0, 0.05]}><circleGeometry args={[0.45, 24]} /><meshStandardMaterial color={night ? "#ffe2a6" : GLASS} emissive={WARM} emissiveIntensity={night ? 1.2 : 0.1} /></mesh></group>)}
          <FlatRoof w={shopW} d={4} y={6.6} color={SLATE} trim="#ff9f45" />
          <group position={[0, 7.6, 0]}><Block size={[2.2, 0.5, 0.3]} pos={[0, 0, 0]} color="#ffffff" r={0.2} glow={night ? 0.6 : 0} />{[-1, 1].flatMap((s) => [-1, 1].map((t) => <Ball key={`${s}${t}`} pos={[s * 1.1, t * 0.22, 0]} r={0.26} color="#ffffff" glow={night ? 0.6 : 0} />))}</group>
        </group> : <FlatRoof w={shopW} d={4} y={3.8} color={SLATE} trim="#ff9f45" />}
      </group>
      {level >= 3 ? <group position={[2.9, 0.08, 0.2]}>
        {/* Play yard: a kennel, a ball and a puppy that trots over to you. */}
        <Block size={[3.6, 0.02, 7]} pos={[0, 0.02, 0]} color="#7fb84f" r={0.005} />
        <YardFence w={3.6} d={7} colour="#ff9f45" />
        <group position={[0.9, 0, -2.6]}><Block size={[1.2, 0.9, 1.0]} pos={[0, 0.45, 0]} color="#ff5e57" r={0.05} /><Block size={[1.4, 0.12, 1.2]} pos={[0, 1.0, 0]} rot={[0, 0, 0.2]} color="#2a2f36" r={0.03} /><Block size={[0.5, 0.6, 0.04]} pos={[0, 0.35, 0.51]} color="#1f2328" r={0.02} /></group>
        <FollowPuppy yard={[3.6, 7]} />
        <Ball pos={[-0.9, 0.2, 2.2]} r={0.18} color="#ffcc33" />
      </group> : null}
      {level === 2 ? <Planter pos={[-3.4, 0.08, 2.4]} /> : null}
      <LightPool r={3.2} color="#ffd9a8" night={night} pos={[0, 0, 1.6]} />
    </group>
  );
}

/* ───────── Dog Park (6 × 6 squares) ───────── */
/** Dogs run laps of the park, leaping each jump on the way round. */
function RunningDogs({ r, n, jumps }: { r: number; n: number; jumps: boolean }) {
  const dogs = useRef<Array<Group | null>>([]);
  useFrame(({ clock }) => {
    dogs.current.forEach((dog, i) => {
      if (!dog) return;
      const a = clock.elapsedTime * 0.8 + (i / n) * Math.PI * 2;
      dog.position.set(Math.cos(a) * r, jumps ? Math.max(0, Math.sin(a * 4)) * 0.6 : Math.abs(Math.sin(clock.elapsedTime * 8 + i)) * 0.06, Math.sin(a) * r);
      dog.rotation.y = -a;
    });
  });
  return <group>{Array.from({ length: n }, (_, i) => <group key={i} ref={(node) => { dogs.current[i] = node; }}><Puppy pos={[0, 0, 0]} coat={["#c08552", "#78888c", "#2b2b2b", "#f2e2c8"][i % 4]} s={0.9} /></group>)}</group>;
}
function Hurdle({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return <group position={pos} rotation={[0, rot, 0]}>{[-0.6, 0.6].map((x) => <Block key={x} size={[0.08, 0.8, 0.08]} pos={[x, 0.4, 0]} color="#f2f2f2" r={0.02} />)}<Block size={[1.3, 0.08, 0.08]} pos={[0, 0.55, 0]} color="#ff5e57" r={0.02} /></group>;
}
function DogPark({ level, night }: Props) {
  const size = level === 1 ? 8 : 11.6;
  return (
    <group>
      <Block size={[size + 0.2, 0.06, size + 0.2]} pos={[0, 0.03, 0]} color="#7fc04f" r={0.01} rough={0.95} />
      {/* A path loop of coloured surfacing round the middle (from Level 2). */}
      {level >= 2 ? <mesh position={[0, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[2.9, 3.9, 48]} /><meshStandardMaterial color={level >= 4 ? "#f3a54a" : "#d8b98a"} roughness={0.95} /></mesh> : null}
      <YardFence w={size} d={size} colour={level >= 3 ? "#2f8f4a" : TIMBER} />
      {/* Gate with a sign. */}
      <group position={[0, 0.06, size / 2]}><Block size={[1.8, 0.04, 0.06]} pos={[0, 0.9, 0]} color="#ffffff" r={0.01} /><Block size={[1.2, 0.5, 0.08]} pos={[0, 1.35, 0]} color={level >= 3 ? "#2f8f4a" : TIMBER} r={0.05} /><Ball pos={[0, 1.35, 0.06]} r={0.12} color="#ffffff" /></group>
      <group position={[-size / 2 + 1.4, 0.06, -size / 2 + 1.0]}><Block size={[1.8, 0.1, 0.5]} pos={[0, 0.55, 0]} color={TIMBER} r={0.03} />{[-0.7, 0.7].map((x) => <Block key={x} size={[0.1, 0.5, 0.4]} pos={[x, 0.25, 0]} color={SLATE} r={0.02} />)}</group>
      <group position={[size / 2 - 1.2, 0.06, -size / 2 + 1.0]}><mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.35, 0.3, 0.2, 16]} /><Mat color="#c9ced6" metal={0.5} /></mesh><mesh position={[0, 0.19, 0]}><cylinderGeometry args={[0.3, 0.3, 0.02, 16]} /><Mat color="#3aa0ff" /></mesh></group>
      <Tree pos={[-size / 2 + 1.4, 0.06, size / 2 - 1.6]} s={level === 1 ? 0.8 : 1} />
      {level === 1 ? <group><Puppy pos={[1, 0.06, 0.6]} coat="#c08552" s={0.9} rot={0.6} /><Ball pos={[1.8, 0.2, 1.8]} r={0.18} color="#ffcc33" /></group> : <RunningDogs r={3.4} n={level >= 4 ? 4 : level >= 3 ? 3 : 2} jumps />}
      {level >= 2 ? [0, 1, 2, 3].map((i) => <Hurdle key={i} pos={[Math.cos((i / 4) * Math.PI * 2 + 0.4) * 3.4, 0.06, Math.sin((i / 4) * Math.PI * 2 + 0.4) * 3.4]} rot={-(i / 4) * Math.PI * 2 - 0.4 + Math.PI / 2} />) : null}
      {level >= 2 ? <group position={[3.6, 0.06, 4.4]}>
        {/* A rainbow agility tunnel. */}
        {["#ff5e57", "#ffcc33", "#7ac943", "#3aa0ff", "#9a63ff"].map((colour, i) => <mesh key={colour} position={[-1 + i * 0.5, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.55, 0.55, 0.48, 18, 1, true, 0, Math.PI]} /><meshStandardMaterial color={colour} side={DoubleSide} /></mesh>)}
      </group> : null}
      {level >= 3 ? <group>
        {/* A splash pad with little jets, weave poles and a tyre jump. */}
        <mesh position={[0, 0.07, 0]}><cylinderGeometry args={[1.8, 1.8, 0.05, 32]} /><Mat color="#6fc8ff" rough={0.2} /></mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => <Puffs key={i} pos={[Math.cos(i * 1.05) * 1.1, 0.3, Math.sin(i * 1.05) * 1.1]} color="#bfe8ff" rise={1.2} size={0.12} rate={0.8} />)}
        {Array.from({ length: 6 }, (_, i) => <Block key={i} size={[0.06, 0.9, 0.06]} pos={[-4.6 + i * 0.5, 0.5, -1.6]} color={i % 2 ? "#ffffff" : "#ff5e57"} r={0.02} />)}
        <group position={[-3.6, 0.06, 2.6]}>{[-0.7, 0.7].map((x) => <Block key={x} size={[0.1, 1.6, 0.1]} pos={[x, 0.8, 0]} color={SLATE} r={0.02} />)}<Block size={[1.5, 0.1, 0.1]} pos={[0, 1.6, 0]} color={SLATE} r={0.02} /><mesh position={[0, 0.95, 0]}><torusGeometry args={[0.42, 0.1, 10, 24]} /><Mat color="#1f2328" /></mesh></group>
      </group> : null}
      {level >= 4 ? <group position={[3.8, 0.06, -3.6]}>
        {/* The dog café: a striped kiosk with festoon lights and a bone on the roof. */}
        <Block size={[2.6, 2.4, 2.0]} pos={[0, 1.2, 0]} color="#f3ede1" r={0.06} />
        <Awning w={2.8} y={2.2} z={0.6} colours={["#ff9f45", "#fff6e6"]} />
        <Block size={[2.9, 0.2, 2.3]} pos={[0, 2.5, 0]} color="#ff9f45" r={0.05} />
        <Glow size={[1.6, 0.8, 0.05]} pos={[0, 1.4, 1.02]} color={night ? WARM : GLASS} night={night} />
        <group position={[0, 3.0, 0]}><Block size={[1.2, 0.3, 0.2]} pos={[0, 0, 0]} color="#ffffff" r={0.12} />{[-1, 1].flatMap((s) => [-1, 1].map((t) => <Ball key={`${s}${t}`} pos={[s * 0.6, t * 0.13, 0]} r={0.16} color="#ffffff" />))}</group>
        <StringLights from={[-1.4, 2.6, 1.2]} to={[-5.2, 2.4, 3.0]} night={night} n={9} colors={[WARM, NEON_PINK, NEON_CYAN]} />
      </group> : null}
      {level >= 4 ? [-5.2, 5.2].map((x) => <group key={x} position={[x, 0, 5.2]}><Block size={[0.12, 3.4, 0.12]} pos={[0, 1.7, 0]} color={SLATE} r={0.03} /><Glow size={[0.5, 0.2, 0.5]} pos={[0, 3.4, 0]} color="#fff7d6" night={night} round /></group>) : null}
      <LightPool r={5} color="#fff2c4" night={night && level >= 4} />
    </group>
  );
}

/** Each City Life set 2 place's model by level, in world metres. Names, prices and plots live in lib/world3d/premium-homes.ts. */
export const CITY_PLACES_MODELS = {
  servo: Servo,
  car_wash: CarWash,
  pizza_shop: PizzaShop,
  supermarket: Supermarket,
  police_station: PoliceStation,
  hospital: Hospital,
  vet_pet_shop: VetPetShop,
  dog_park: DogPark,
} as const satisfies Record<(typeof CITY_PLACES_STYLES)[number], (props: Props) => ReactNode>;
