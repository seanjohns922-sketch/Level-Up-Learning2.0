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
import { Awning, Beacons, Block3, Door, FlatRoof, GlassFront, Pavement, Planter, Shelves, SignBoard, Tree, Trolley, Windows } from "./MainStreetItems";
import { useExplorer } from "./TowerDefenceModels";

type Props = { level: PremiumHomeLevel; night: boolean };
type V3 = [number, number, number];
const SLATE = "#3d4654", CONCRETE = "#cfccc4", ASPHALT = "#4a4f57", GLASS = "#bfe4ff", TIMBER = "#c98a52";
const SERVO_RED = "#e5484d", POLICE_BLUE = "#1f4fa8", HOSPITAL_TEAL = "#1aa39a", PIZZA_GREEN = "#2f8f4a", NEON_CYAN = "#3fe6ff", NEON_PINK = "#ff4fd8", EV_GREEN = "#36e07a";

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
function Canopy({ w, d, h, at = [0, 0], night }: { w: number; d: number; h: number; at?: [number, number]; night: boolean }) {
  return (
    <group position={[at[0], 0, at[1]]}>
      {[-1, 1].map((s) => <Block key={s} size={[0.35, h, 0.35]} pos={[s * (w / 2 - 0.6), h / 2, 0]} color="#f2f2f2" r={0.05} />)}
      <Block size={[w, 0.6, d]} pos={[0, h + 0.3, 0]} color="#f7f7f7" r={0.08} />
      <Block size={[w + 0.04, 0.24, d + 0.04]} pos={[0, h + 0.5, 0]} color={SERVO_RED} r={0.05} />
      <Glow size={[w - 0.4, 0.04, d - 0.4]} pos={[0, h - 0.02, 0]} color="#fff7d6" night={night} />
      <LightPool r={Math.min(w, d) / 2} color="#fff2c4" night={night} />
    </group>
  );
}
function Servo({ level, night }: Props) {
  return (
    <group>
      <Pavement w={13.8} d={11.8} color={ASPHALT} />
      <Canopy w={level === 1 ? 5.4 : 8.4} d={4.6} h={4.2} at={[level >= 3 ? -1.6 : 0, 2.6]} night={night} />
      {(level === 1 ? [-1.2, 1.2] : [-3.4, -1.2, 1.2, 3.4]).map((x) => <Pump key={x} pos={[x + (level >= 3 ? -1.6 : 0), 0.08, 2.6]} night={night} />)}
      {level === 1 ? (
        <group position={[0, 0.08, -3.4]}>
          <Block3 w={3} h={2.6} d={2.4} color="#f2f2f2" />
          <Glow size={[1.4, 1.0, 0.05]} pos={[0, 1.7, 1.23]} color={night ? WARM : GLASS} night={night} />
        </group>
      ) : (
        <group position={[level >= 3 ? -1.6 : 0, 0.08, -3.4]}>
          <Block3 w={7} h={3.4} d={4} color="#f7f7f7" />
          <GlassFront w={4.4} h={2.4} y={1.5} z={2.06} night={night}><Shelves w={4} z={-0.8} /></GlassFront>
          <Door x={2.8} z={2.06} glass night={night} />
          <FlatRoof w={7} d={4} y={3.6} color={SLATE} trim={SERVO_RED} />
          <SignBoard pos={[0, 4.3, 1.9]} w={3.2} colour={SERVO_RED} night={night}><Ball pos={[0, 0, 0]} r={0.2} color="#ffcc33" /></SignBoard>
        </group>
      )}
      {level >= 3 ? (
        // A car-wash bay beside the shop: brushes spin.
        <group position={[5.0, 0.08, -2.0]}>
          {[-1, 1].map((s) => <Block key={s} size={[0.3, 3.6, 5]} pos={[s * 1.6, 1.8, 0]} color="#f2f2f2" r={0.05} />)}
          <Block size={[3.6, 0.4, 5]} pos={[0, 3.8, 0]} color={SERVO_RED} r={0.05} />
          {[-1, 1].map((s) => <group key={s} position={[s * 1.1, 1.6, 0.8]}><Spin speed={s * 3}><mesh><cylinderGeometry args={[0.35, 0.35, 2.8, 14]} /><Mat color="#3aa0ff" rough={0.9} /></mesh></Spin></group>)}
        </group>
      ) : null}
      {level >= 4 ? (
        <group>
          {/* EV chargers that glow green, and a tall price pylon with lit panels. */}
          {[3.6, 5.6].map((x) => <group key={x} position={[x, 0.08, 3.6]}>
            <Block size={[0.6, 1.6, 0.4]} pos={[0, 0.8, 0]} color="#1f2328" r={0.08} />
            <NearGlow size={[0.36, 0.5, 0.04]} pos={[0, 1.15, 0.21]} colour={EV_GREEN} idle="#0f3a1f" />
          </group>)}
          <group position={[-6.2, 0.08, 4.8]}>
            <Block size={[0.5, 6, 0.5]} pos={[0, 3, 0]} color="#f2f2f2" r={0.05} />
            <Block size={[1.4, 2.4, 0.3]} pos={[0, 5.4, 0]} color={SERVO_RED} r={0.08} />
            {[4.8, 5.4, 6.0].map((y) => <Glow key={y} size={[1.0, 0.36, 0.05]} pos={[0, y, 0.17]} color="#ffcc33" night={night} />)}
          </group>
          <Glow size={[8.4, 0.08, 0.08]} pos={[-1.6, 4.85, 4.92]} color={NEON_CYAN} night={night} />
        </group>
      ) : null}
    </group>
  );
}

/* ───────── Car Wash (6 × 4 squares) ───────── */
/** Spinning brushes that whirl faster, with bubbles, while the explorer (or their car) is inside. */
function WashBrushes({ x, len, foam }: { x: number[]; len: number; foam: boolean }) {
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
        <group key={`${bx}${s}`} position={[bx, 1.6, s * 1.5]} ref={(node) => { brushes.current[i * 2 + (s + 1) / 2] = node; }}>
          <mesh><cylinderGeometry args={[0.5, 0.5, 2.8, 16]} /><Mat color={i % 2 ? "#ff6fb5" : "#3aa0ff"} rough={0.95} /></mesh>
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
      {/* A hose bay: wash pad, hose stand, bucket and a soapy puddle. */}
      <Pavement w={11.8} d={7.8} />
      <Block size={[6, 0.02, 4]} pos={[0, 0.09, 0]} color="#9bb3c4" r={0.005} />
      <group position={[-3.6, 0.08, -1.4]}>
        <Block size={[0.3, 2.2, 0.3]} pos={[0, 1.1, 0]} color={SLATE} r={0.04} />
        <mesh position={[0, 1.4, 0.3]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.35, 0.08, 8, 20]} /><Mat color="#2f8f4a" /></mesh>
      </group>
      <group position={[2.6, 0.08, 1.2]}><mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.3, 0.25, 0.6, 16]} /><Mat color="#ffcc33" /></mesh><Ball pos={[0, 0.65, 0]} r={0.22} color="#ffffff" /></group>
      <Car pos={[0, 0.08, 0]} colour="#4c8dff" rot={Math.PI / 2} />
      <Puffs pos={[0.6, 1.8, 0]} color="#ffffff" rise={0.8} size={0.18} />
    </group>
  );
  const len = 8;
  return (
    <group>
      <Pavement w={11.8} d={7.8} />
      <Block size={[11.6, 0.02, 3.4]} pos={[0, 0.09, 0]} color="#5a6470" r={0.005} />
      {/* The tunnel runs left to right: drive in one end, out the other. */}
      {/* Solid back wall; the front is pillars, a low wall and glass so you can watch the brushes. */}
      <Block size={[len, 4, 0.3]} pos={[0, 2, -2.2]} color={level >= 4 ? "#22202e" : "#f2f2f2"} r={0.05} />
      {[-len / 2, 0, len / 2].map((x) => <Block key={x} size={[0.4, 4, 0.4]} pos={[x === 0 ? 0 : x - Math.sign(x) * 0.2, 2, 2.2]} color={level >= 4 ? "#22202e" : "#f2f2f2"} r={0.05} />)}
      <Block size={[len, 0.9, 0.3]} pos={[0, 0.45, 2.2]} color={level >= 4 ? "#22202e" : "#f2f2f2"} r={0.05} />
      <mesh position={[0, 2.45, 2.2]}><planeGeometry args={[len - 0.4, 3.1]} /><meshStandardMaterial color="#cfe9ff" transparent opacity={0.18} roughness={0.05} depthWrite={false} /></mesh>
      <Block size={[len, 0.4, 4.7]} pos={[0, 4.2, 0]} color={level >= 4 ? "#16131f" : "#3aa0ff"} r={0.06} />
      <WashBrushes x={level >= 3 ? [-2.4, 0, 2.4] : [-1.4, 1.4]} len={len - 1} foam={level >= 3} />
      {level >= 3 ? [-3.4, 3.4].map((x) => <group key={x}>
        {/* Rainbow foam arches. */}
        {["#ff5e57", "#ffcc33", "#7ac943", "#3aa0ff", "#9a63ff"].map((colour, i) => <Block key={colour} size={[0.12, 0.12, 4.2]} pos={[x + (i - 2) * 0.16, 3.7, 0]} color={colour} r={0.03} glow={0.3} />)}
      </group>) : null}
      {level >= 4 ? <group>
        {[-1, 1].map((s) => <Glow key={s} size={[len, 0.08, 0.08]} pos={[0, 3.9, s * 2.06]} color={NEON_PINK} night={night} />)}
        {[-1, 1].map((s) => <Glow key={`c${s}`} size={[len, 0.08, 0.08]} pos={[0, 0.5, s * 2.06]} color={NEON_CYAN} night={night} />)}
        <SignBoard pos={[0, 4.9, 2.3]} w={3.4} colour="#16131f" night={night}><Ball pos={[0, 0, 0]} r={0.24} color={NEON_CYAN} glow={0.6} /></SignBoard>
      </group> : null}
      <Car pos={[-3.9, 0.08, 0]} colour="#ff9f45" rot={Math.PI / 2} />
      <LightPool r={3.6} color={level >= 4 ? NEON_CYAN : "#cfe9ff"} night={night} />
    </group>
  );
}

/* ───────── Pizza Shop (6 × 5 squares) ───────── */
function Oven({ pos, night }: { pos: V3; night: boolean }) {
  return (
    <group position={pos}>
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
  const w = level === 1 ? 5 : 8;
  return (
    <group>
      <Pavement w={11.8} d={9.8} />
      <group position={[0, 0.08, -2.2]}>
        <Block3 w={w} h={level >= 3 ? 4 : 3.4} d={4.6} color={level >= 2 ? "#f3ede1" : "#fff6e6"} />
        <FlatRoof w={w} d={4.6} y={level >= 3 ? 4.2 : 3.6} color={SLATE} trim={PIZZA_GREEN} />
        <Awning w={w - 0.6} y={level >= 3 ? 3.4 : 2.9} z={2.3} colours={[PIZZA_GREEN, "#fff6e6", "#d8282b", "#fff6e6"]} />
        <GlassFront w={level === 1 ? 2.4 : 3.6} h={2.0} y={1.4} z={2.32} night={night}><Oven pos={[0, -1.0, -0.9]} night={night} /></GlassFront>
        {level >= 2 ? <Door x={w / 2 - 1.1} z={2.32} glass night={night} /> : null}
        {level >= 3 ? <Windows x0={-w / 2 + 1.2} x1={w / 2 - 1.2} y={3.3} z={2.32} n={3} w={0.9} h={0.5} night={night} /> : null}
      </group>
      {level >= 2 ? [-3.2, 3.2].map((x) => <group key={x} position={[x, 0.08, 2.6]}>
        <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.6, 0.6, 0.06, 20]} /><Mat color="#f2f2f2" /></mesh>
        <Block size={[0.08, 0.5, 0.08]} pos={[0, 0.25, 0]} color={SLATE} r={0.02} />
        <Block size={[0.06, 2.6, 0.06]} pos={[0, 1.3, 0]} color="#e6e6e6" r={0.02} />
        <mesh position={[0, 2.5, 0]}><coneGeometry args={[1.1, 0.5, 8, 1, true]} /><meshStandardMaterial color={x < 0 ? "#d8282b" : PIZZA_GREEN} side={DoubleSide} /></mesh>
      </group>) : null}
      {level >= 3 ? <group position={[0, 0.08, 2.4]}><DeliveryScooter r={1.6} /></group> : null}
      {level >= 4 ? <group>
        <Slice pos={[0, 6.2, -2.0]} s={1.3} glow={night} />
        <StringLights from={[-5.6, 3.2, 4.6]} to={[5.6, 3.2, 4.6]} night={night} n={12} colors={[WARM, "#ff7a1a", "#7dff8a"]} />
        {[-5.6, 5.6].map((x) => <Block key={x} size={[0.12, 3.2, 0.12]} pos={[x, 1.6, 4.6]} color={SLATE} r={0.03} />)}
      </group> : null}
      <LightPool r={3.4} color="#ffb35a" night={night} pos={[0, 0, 1.6]} />
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
  const w = level === 1 ? 9 : level === 2 ? 12 : 14;
  const d = level === 1 ? 5 : 7;
  const z = level >= 3 ? -3.2 : -1.6;
  return (
    <group>
      <Pavement w={17.8} d={13.8} color={level >= 3 ? ASPHALT : CONCRETE} />
      {level >= 3 ? <group><Block size={[17.6, 0.02, 1.6]} pos={[0, 0.09, z + d / 2 + 0.9]} color={CONCRETE} r={0.005} /><BayLines x0={-7.5} n={6} gap={2.5} z={4.6} /></group> : null}
      <group position={[0, 0.08, z]}>
        <Block3 w={w} h={level >= 2 ? 5 : 4} d={d} color="#f7f7f7" />
        <FlatRoof w={w} d={d} y={level >= 2 ? 5.2 : 4.2} color={SLATE} trim="#e5484d" />
        <GlassFront w={w * 0.32} h={2.6} y={1.6} z={d / 2 + 0.02} night={night}><Shelves w={w * 0.3} z={-0.8} /></GlassFront>
        <group position={[-w * 0.3, 0, 0]}><GlassFront w={w * 0.24} h={2.6} y={1.6} z={d / 2 + 0.02} night={night}><Shelves w={w * 0.22} rows={2} z={-0.8} /></GlassFront></group>
        <SlidingDoors pos={[w * 0.3, 0.3, d / 2 + 0.06]} />
        <Block size={[w + 0.3, 0.14, 1.6]} pos={[0, 3.5, d / 2 + 0.8]} color="#e5484d" r={0.04} />
        <SignBoard pos={[0, level >= 2 ? 4.6 : 3.8, d / 2 + 0.1]} w={level >= 2 ? 5 : 3.4} colour="#e5484d" night={night}>
          <Trolley pos={[0, -0.55, 0]} />
        </SignBoard>
        {level >= 4 ? <group>
          {[-w / 2 + 2, -w / 2 + 5, w / 2 - 5, w / 2 - 2].map((x) => <group key={x} position={[x, 5.5, -0.6]} rotation={[-0.35, 0, 0]}><Block size={[2.4, 0.08, 1.6]} pos={[0, 0, 0]} color="#1f3b6e" r={0.02} metal={0.4} rough={0.3} /></group>)}
          <Glow size={[w, 0.1, 0.1]} pos={[0, 5.0, d / 2 + 0.08]} color="#ffcc33" night={night} />
        </group> : null}
      </group>
      {level >= 2 ? [[-6.5, 1.2], [-5.9, 1.2], [-5.3, 1.2]].map(([x, zz]) => <Trolley key={x} pos={[x, 0.08, zz + (level >= 3 ? 0 : 1.5)]} />) : null}
      {level >= 3 ? <group><Car pos={[-3.75, 0.08, 4.6]} colour="#4c8dff" /><Car pos={[1.25, 0.08, 4.6]} colour="#ffcc33" /><Car pos={[6.25, 0.08, 4.6]} colour="#7ac943" /></group> : null}
      {level >= 3 ? [-7.8, 7.8].map((x) => <Tree key={x} pos={[x, 0.08, 1.0]} s={0.9} />) : null}
      <LightPool r={5} color="#fff2c4" night={night} pos={[0, 0, level >= 3 ? 0.6 : 2.4]} />
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
  const w = level === 1 ? 5 : 8;
  return (
    <group>
      <Pavement w={11.8} d={9.8} />
      <group position={[level >= 3 ? -1 : 0, 0.08, -2.0]}>
        <Block3 w={w} h={level >= 2 ? 4.4 : 3.4} d={5} color="#eef1f6" />
        <Block size={[w + 0.04, 0.5, 5.04]} pos={[0, 1.2, 0]} color={POLICE_BLUE} r={0.03} />
        <FlatRoof w={w} d={5} y={level >= 2 ? 4.6 : 3.6} color={SLATE} trim={POLICE_BLUE} />
        <Door z={2.52} glass night={night} />
        <Windows x0={-w / 2 + 1.2} x1={w / 2 - 1.2} y={level >= 2 ? 3.3 : 2.7} z={2.52} n={level >= 2 ? 4 : 2} w={0.9} h={0.8} night={night} />
        <BlueLamp pos={[0, level >= 2 ? 4.2 : 3.2, 2.62]} night={night} />
        {level >= 4 ? <group position={[0, level >= 2 ? 4.7 : 3.7, 0]}>
          {/* A rooftop helipad. */}
          <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[2.2, 2.2, 0.12, 32]} /><Mat color="#2b313b" /></mesh>
          <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.7, 1.9, 32]} /><meshStandardMaterial color="#ffcc33" emissive="#ffcc33" emissiveIntensity={night ? 1.2 : 0.2} /></mesh>
        </group> : null}
      </group>
      {level >= 2 ? <PatrolCar pos={[level >= 3 ? 1.6 : 2.6, 0.08, 2.8]} rot={Math.PI / 2} flashing={level >= 4} /> : null}
      {level >= 3 ? <group position={[4.6, 0.08, -2.6]}>
        <Block3 w={2} h={7.0} d={2} color={POLICE_BLUE} />
        <Block size={[2.6, 1.6, 2.6]} pos={[0, 8.0, 0]} color="#eef1f6" r={0.06} />
        <Glow size={[2.2, 0.8, 0.05]} pos={[0, 8.0, 1.32]} color={night ? WARM : GLASS} night={night} />
        <BlueLamp pos={[0, 9.1, 0]} night={night} />
      </group> : null}
      {level >= 4 ? <PatrolCar pos={[-2.8, 0.08, 2.8]} rot={Math.PI / 2} flashing /> : null}
      <LightPool r={3.6} color="#9fc2ff" night={night} pos={[0, 0, 1.8]} />
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
  const w = level <= 2 ? 8 : 12;
  const h = level === 1 ? 3.6 : level === 2 ? 4.6 : 7.4;
  return (
    <group>
      <Pavement w={15.8} d={11.8} />
      <group position={[0, 0.08, -2.4]}>
        <Block3 w={w} h={h} d={6} color="#f7f7f7" />
        <FlatRoof w={w} d={6} y={h + 0.2} color={SLATE} trim={HOSPITAL_TEAL} />
        <Block size={[w + 0.04, 0.3, 6.04]} pos={[0, 1.0, 0]} color={HOSPITAL_TEAL} r={0.03} />
        <Door z={3.02} w={2.2} glass night={night} />
        <Block size={[3.4, 0.16, 1.8]} pos={[0, 3.0, 3.9]} color={HOSPITAL_TEAL} r={0.04} />
        <Windows x0={-w / 2 + 1.2} x1={w / 2 - 1.2} y={2.2} z={3.02} n={level <= 2 ? 2 : 4} w={1.0} h={0.9} night={night} />
        {level >= 2 ? <Windows x0={-w / 2 + 1.2} x1={w / 2 - 1.2} y={3.8} z={3.02} n={level <= 2 ? 4 : 6} w={0.9} h={0.8} night={night} /> : null}
        {level >= 3 ? <Windows x0={-w / 2 + 1.2} x1={w / 2 - 1.2} y={5.6} z={3.02} n={6} w={0.9} h={0.8} night={night} /> : null}
        <HSign pos={[w / 2 - 1.2, h - 0.6, 3.1]} night={night} />
        {level >= 4 ? <group position={[-2, h + 0.3, 0]}>
          <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[2.6, 2.6, 0.12, 32]} /><Mat color="#2b313b" /></mesh>
          <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[2.1, 2.3, 32]} /><meshStandardMaterial color="#ffcc33" emissive="#ffcc33" emissiveIntensity={night ? 1.2 : 0.2} /></mesh>
          <Helicopter y={0.12} />
        </group> : null}
      </group>
      {level >= 2 ? <Ambulance pos={[-4.8, 0.08, 2.8]} rot={Math.PI / 2} /> : null}
      {level >= 3 ? [5.2, 6.8].map((x) => <Tree key={x} pos={[x, 0.08, 3.6]} s={0.8} />) : null}
      <LightPool r={4.4} color="#cfeeff" night={night} pos={[0, 0, 2.2]} />
    </group>
  );
}

/* ───────── Vet & Pet Shop (5 × 4 squares) ───────── */
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
  const w = level === 1 ? 5 : 6;
  return (
    <group>
      <Pavement w={9.8} d={7.8} />
      <group position={[level >= 3 ? -1.6 : 0, 0.08, -1.6]}>
        <Block3 w={w} h={level >= 4 ? 6.2 : 3.4} d={4} color={level >= 2 ? "#e9f6ff" : "#fff6e6"} />
        <FlatRoof w={w} d={4} y={level >= 4 ? 6.4 : 3.6} color={SLATE} trim="#ff9f45" />
        <Awning w={w - 0.6} y={2.9} z={2.0} colours={["#ff9f45", "#fff6e6"]} />
        <GlassFront w={level === 1 ? 2.6 : 3.4} h={1.8} y={1.4} z={2.02} night={night}>
          {/* Puppies tumbling in the window. */}
          <group position={[0, -0.85, -0.6]}>
            {[[-0.8, "#c08552"], [0, "#78888c"], [0.8, "#f2e2c8"]].map(([x, coat], i) => <group key={i} position={[x as number, 0, 0]}><Spin speed={0.6 + i * 0.3}><Puppy pos={[0.15, 0, 0]} coat={coat as string} s={0.55} /></Spin></group>)}
          </group>
        </GlassFront>
        <Door x={w / 2 - 0.9} z={2.02} w={1.1} glass night={night} />
        <SignBoard pos={[0, 3.25, 2.1]} w={2.6} h={0.6} colour="#ff9f45" night={night}>
          {/* A paw print. */}
          <Ball pos={[0, -0.06, 0]} r={0.14} color="#ffffff" />{[-0.16, 0, 0.16].map((x) => <Ball key={x} pos={[x, 0.14, 0]} r={0.06} color="#ffffff" />)}
        </SignBoard>
        {level >= 2 ? <group position={[-w / 2 + 0.8, 0, 2.02]}><Block size={[0.9, 0.9, 0.06]} pos={[0, 2.0, 0]} color="#ffffff" r={0.06} /><Block size={[0.5, 0.14, 0.03]} pos={[0, 2.0, 0.04]} color="#2f8f4a" r={0.01} /><Block size={[0.14, 0.5, 0.03]} pos={[0, 2.0, 0.04]} color="#2f8f4a" r={0.01} /></group> : null}
        {level >= 4 ? <Windows x0={-w / 2 + 1} x1={w / 2 - 1} y={4.8} z={2.02} n={4} w={0.8} h={0.9} night={night} /> : null}
      </group>
      {level >= 3 ? <group position={[3.0, 0.08, 0]}>
        <Block size={[3.4, 0.02, 7.2]} pos={[0, 0.02, 0]} color="#7fb84f" r={0.005} />
        <YardFence w={3.4} d={7.2} />
        <FollowPuppy yard={[3.4, 7.2]} />
        <Ball pos={[0.8, 0.2, -2]} r={0.18} color="#ffcc33" />
      </group> : null}
      {level >= 2 ? <Planter pos={[-3.8, 0.08, 2.6]} /> : null}
      <LightPool r={3} color="#ffd9a8" night={night} pos={[0, 0, 1.6]} />
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
  return (
    <group>
      <Block size={[11.8, 0.06, 11.8]} pos={[0, 0.03, 0]} color="#7fb84f" r={0.01} rough={0.95} />
      <YardFence w={11.6} d={11.6} colour={level >= 3 ? "#5c6b78" : TIMBER} />
      <Block size={[2.2, 0.02, 1.4]} pos={[0, 0.07, 5.2]} color={CONCRETE} r={0.004} />
      <group position={[-4.4, 0.06, -4.4]}>
        <Block size={[1.8, 0.1, 0.5]} pos={[0, 0.55, 0]} color={TIMBER} r={0.03} />{[-0.7, 0.7].map((x) => <Block key={x} size={[0.1, 0.5, 0.4]} pos={[x, 0.25, 0]} color={SLATE} r={0.02} />)}
      </group>
      <group position={[4.4, 0.06, -4.4]}><mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.35, 0.3, 0.2, 16]} /><Mat color="#c9ced6" metal={0.5} /></mesh><mesh position={[0, 0.19, 0]}><cylinderGeometry args={[0.3, 0.3, 0.02, 16]} /><Mat color="#3aa0ff" /></mesh></group>
      {level === 1 ? <group><Puppy pos={[1, 0.06, 1]} coat="#c08552" s={0.9} rot={0.6} /><Ball pos={[2, 0.2, 2.4]} r={0.18} color="#ffcc33" /></group> : <RunningDogs r={3.4} n={level >= 4 ? 4 : level >= 3 ? 3 : 2} jumps />}
      {level >= 2 ? [0, 1, 2, 3].map((i) => <Hurdle key={i} pos={[Math.cos((i / 4) * Math.PI * 2 + 0.4) * 3.4, 0.06, Math.sin((i / 4) * Math.PI * 2 + 0.4) * 3.4]} rot={-(i / 4) * Math.PI * 2 - 0.4 + Math.PI / 2} />) : null}
      {level >= 3 ? <group>
        {/* A splash pad in the middle with little jets. */}
        <mesh position={[0, 0.07, 0]}><cylinderGeometry args={[1.6, 1.6, 0.04, 32]} /><Mat color="#6fc8ff" rough={0.2} /></mesh>
        {[0, 1, 2, 3, 4].map((i) => <Puffs key={i} pos={[Math.cos(i * 1.26) * 0.9, 0.3, Math.sin(i * 1.26) * 0.9]} color="#bfe8ff" rise={1.0} size={0.12} rate={0.8} />)}
      </group> : null}
      {level >= 4 ? <group position={[4.0, 0.06, 3.8]}>
        {/* The dog café: a kiosk with festoon lights. */}
        <Block size={[2.4, 2.4, 2.0]} pos={[0, 1.2, 0]} color="#f3ede1" r={0.06} />
        <Block size={[2.8, 0.2, 2.4]} pos={[0, 2.5, 0]} color="#ff9f45" r={0.05} />
        <Glow size={[1.6, 0.8, 0.05]} pos={[0, 1.4, 1.02]} color={night ? WARM : GLASS} night={night} />
        <StringLights from={[-1.4, 2.6, 1.2]} to={[-5.4, 2.4, 1.2]} night={night} n={8} colors={[WARM, NEON_PINK, NEON_CYAN]} />
      </group> : null}
      {level >= 4 ? [-5.2, 5.2].map((x) => <group key={x} position={[x, 0, -5.2]}><Block size={[0.12, 3.6, 0.12]} pos={[0, 1.8, 0]} color={SLATE} r={0.03} /><Glow size={[0.5, 0.2, 0.5]} pos={[0, 3.6, 0]} color="#fff7d6" night={night} round /></group>) : null}
      {level >= 3 ? <Tree pos={[-4.6, 0.06, 3.6]} s={0.9} /> : null}
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
