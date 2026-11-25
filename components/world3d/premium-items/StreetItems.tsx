"use client";
// Street pieces: free at Level 1 (in the build picker's Street tab), upgraded with XP. Traffic lights, zebra
// crossing, wheelie bins, bike rack, Hills Hoist, water tank, shade sail and driveway hoop. Units are world
// metres (the explorer stands about 2 m tall); the front faces +z. Several react when the explorer is close.
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ReactNode } from "react";
import { BufferGeometry, DoubleSide, Float32BufferAttribute, type Group, type Mesh, type MeshStandardMaterial } from "three";
import { Ball, Block, Mat } from "@/components/world3d/premium-homes/HomeKit";
import type { PremiumHomeLevel, STREET_STYLES } from "@/lib/world3d/premium-homes";
import { Glow, LightPool, Sway, WARM } from "./ItemKit";
import { useExplorer } from "./TowerDefenceModels";

type Props = { level: PremiumHomeLevel; night: boolean };
type V3 = [number, number, number];
const POLE = "#4b5560", POLE_LIGHT = "#9aa4af", CONCRETE = "#cfccc4", TIMBER = "#c98a52";

function Post({ pos, h, r = 0.07, color = POLE }: { pos: V3; h: number; r?: number; color?: string }) {
  return <mesh position={[pos[0], pos[1] + h / 2, pos[2]]} castShadow><cylinderGeometry args={[r, r, h, 12]} /><Mat color={color} metal={0.3} rough={0.45} /></mesh>;
}

/* ───────── Traffic Lights (1 × 1) ───────── */
const LIGHT_COLOURS = ["#ff3b3b", "#ffb21a", "#36e07a"] as const;
/** Red, amber, green on a loop; while the explorer (or their car) comes up, it turns green for them. */
function LightHead({ pos, rot = 0, smart = false }: { pos: V3; rot?: number; smart?: boolean }) {
  const { group, state } = useExplorer(7);
  const lamps = useRef<Array<Mesh | null>>([]);
  const countdown = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime % 9;
    const on = state.current.near ? 2 : t < 4 ? 0 : t < 5 ? 1 : 2;
    lamps.current.forEach((lamp, i) => {
      const material = lamp?.material as MeshStandardMaterial | undefined;
      if (!material) return;
      material.emissive.set(i === on ? LIGHT_COLOURS[i] : "#111111");
      material.emissiveIntensity = i === on ? 2.6 : 0.2;
    });
    if (countdown.current) countdown.current.scale.x = on === 0 ? 1 - t / 4 : 0.001;
  });
  return (
    <group ref={group} position={pos} rotation={[0, rot, 0]}>
      <Block size={[0.42, 1.25, 0.32]} pos={[0, 0, 0]} color="#1f2328" r={0.06} />
      {LIGHT_COLOURS.map((colour, i) => (
        <group key={colour} position={[0, 0.38 - i * 0.38, 0.17]}>
          <mesh ref={(node) => { lamps.current[i] = node; }} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.13, 0.13, 0.04, 18]} /><meshStandardMaterial color={colour} emissive="#111111" /></mesh>
          <Block size={[0.32, 0.04, 0.18]} pos={[0, 0.14, 0.06]} color="#1f2328" r={0.01} />
        </group>
      ))}
      {smart ? <group position={[0, -0.85, 0.17]}><Block size={[0.4, 0.24, 0.05]} pos={[0, 0, 0]} color="#111" r={0.02} /><mesh ref={countdown} position={[0, 0, 0.03]}><boxGeometry args={[0.32, 0.12, 0.02]} /><meshStandardMaterial color="#ff3b3b" emissive="#ff3b3b" emissiveIntensity={2} /></mesh></group> : null}
    </group>
  );
}
function TrafficLights({ level, night }: Props) {
  return (
    <group>
      <Block size={[0.7, 0.12, 0.7]} pos={[0, 0.06, 0]} color={CONCRETE} r={0.03} />
      <Post pos={[0, 0, 0]} h={level >= 3 ? 4.2 : 3.4} r={0.08} color={level >= 4 ? "#2b313b" : POLE} />
      <LightHead pos={[0, level >= 3 ? 3.6 : 2.9, 0.1]} smart={level >= 4} />
      {level >= 3 ? <LightHead pos={[0, 3.6, -0.1]} rot={Math.PI} smart={level >= 4} /> : null}
      {level >= 2 ? <group position={[0, 1.15, 0.12]}>
        {/* The crossing button. */}
        <Block size={[0.24, 0.36, 0.14]} pos={[0, 0, 0]} color="#ffcc33" r={0.04} />
        <Ball pos={[0, -0.05, 0.08]} r={0.05} color="#1f2328" />
        <Block size={[0.16, 0.08, 0.02]} pos={[0, 0.1, 0.075]} color="#36e07a" r={0.01} glow={0.8} />
      </group> : null}
      {level >= 4 ? <group><Glow size={[0.18, 3.6, 0.18]} pos={[0, 2.1, 0]} color="#3fe6ff" night={night} /><LightPool r={0.95} color="#9be7ff" night={night} /></group> : null}
    </group>
  );
}

/* ───────── Zebra Crossing (3 × 2, laid across a road) ───────── */
/** The stripes light up while the explorer is on or beside them. */
function Stripes({ n, w, raised }: { n: number; w: number; raised: boolean }) {
  const { group, state } = useExplorer(3);
  const glow = useRef<Array<Mesh | null>>([]);
  useFrame(() => {
    for (const stripe of glow.current) {
      const material = stripe?.material as MeshStandardMaterial | undefined;
      if (material) material.emissiveIntensity = state.current.near ? 1.4 : 0.05;
    }
  });
  const y = raised ? 0.2 : 0.07;
  return (
    <group ref={group}>
      {Array.from({ length: n }, (_, i) => <mesh key={i} ref={(node) => { glow.current[i] = node; }} position={[-w / 2 + (w / n) * (i + 0.5), y, 0]}><boxGeometry args={[(w / n) * 0.55, 0.02, 3.2]} /><meshStandardMaterial color="#f7f7f7" emissive="#fffbe0" emissiveIntensity={0.05} /></mesh>)}
    </group>
  );
}
/** The yellow-topped poles at each end (flashing at Level 3 and up). */
function CrossingPole({ pos, flashing, night }: { pos: V3; flashing: boolean; night: boolean }) {
  const top = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const material = top.current?.material as MeshStandardMaterial | undefined;
    if (material) material.emissiveIntensity = flashing ? (Math.floor(clock.elapsedTime * 1.6) % 2 ? 2.4 : 0.2) : night ? 0.8 : 0.1;
  });
  return (
    <group position={pos}>
      <Post pos={[0, 0, 0]} h={2.4} r={0.06} color="#f2f2f2" />
      {[0.5, 0.9, 1.3, 1.7].map((y) => <mesh key={y} position={[0, y, 0]}><cylinderGeometry args={[0.065, 0.065, 0.2, 12]} /><Mat color="#1f2328" /></mesh>)}
      <mesh ref={top} position={[0, 2.55, 0]}><sphereGeometry args={[0.22, 16, 12]} /><meshStandardMaterial color="#ffb21a" emissive="#ffb21a" emissiveIntensity={0.1} /></mesh>
    </group>
  );
}
function ZebraCrossing({ level, night }: Props) {
  return (
    <group>
      {level >= 4 ? <Block size={[5.8, 0.18, 3.6]} pos={[0, 0.09, 0]} color="#5a6470" r={0.05} /> : null}
      <Stripes n={6} w={5.4} raised={level >= 4} />
      {level >= 2 ? [-1, 1].map((s) => <CrossingPole key={s} pos={[s * 2.75, 0, s * 1.75]} flashing={level >= 3} night={night} />) : null}
      {level >= 4 ? [-1, 1].map((s) => <Glow key={s} size={[5.6, 0.04, 0.08]} pos={[0, 0.2, s * 1.72]} color="#3fe6ff" night={night} />) : null}
    </group>
  );
}

/* ───────── Wheelie Bins (2 × 1) ───────── */
const LIDS = ["#d8282b", "#ffcc33", "#2f8f4a"] as const;
/** A bin whose lid flips open when the explorer bumps up to it. */
function Bin({ pos, lid }: { pos: V3; lid: string }) {
  const { group, state } = useExplorer(1.8);
  const hinge = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!hinge.current) return;
    const target = state.current.near ? -1.6 : 0;
    hinge.current.rotation.x += (target - hinge.current.rotation.x) * Math.min(1, delta * 6);
  });
  return (
    <group ref={group} position={pos}>
      <Block size={[0.6, 1.0, 0.7]} pos={[0, 0.55, 0]} color="#2b313b" r={0.06} />
      {[-0.22, 0.22].map((x) => <mesh key={x} position={[x, 0.1, -0.3]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.1, 0.1, 0.08, 12]} /><Mat color="#111" /></mesh>)}
      <group ref={hinge} position={[0, 1.08, -0.36]}><Block size={[0.64, 0.07, 0.74]} pos={[0, 0, 0.37]} color={lid} r={0.03} /></group>
    </group>
  );
}
function WheelieBins({ level, night }: Props) {
  const bins = level === 1 ? [LIDS[0]] : [...LIDS];
  return (
    <group>
      {level >= 3 ? <group>
        {/* A timber bin bay round the back and sides. */}
        <Block size={[3.4, 0.08, 1.6]} pos={[0, 0.04, -0.1]} color={CONCRETE} r={0.02} />
        <Block size={[3.4, 1.3, 0.08]} pos={[0, 0.65, -0.86]} color={TIMBER} r={0.02} />
        {[-1, 1].map((s) => <Block key={s} size={[0.08, 1.3, 1.5]} pos={[s * 1.7, 0.65, -0.1]} color={TIMBER} r={0.02} />)}
      </group> : null}
      {bins.map((lid, i) => <Bin key={lid} pos={[(i - (bins.length - 1) / 2) * 0.85, 0.04, 0]} lid={lid} />)}
      {level >= 4 ? <group position={[0, 0, -0.86]}>
        {/* Recycling station: a sorting sign with glowing coloured slots. */}
        <Block size={[2.6, 0.5, 0.1]} pos={[0, 1.65, 0]} color="#2b313b" r={0.04} />
        {LIDS.map((colour, i) => <Glow key={colour} size={[0.6, 0.2, 0.04]} pos={[(i - 1) * 0.85, 1.65, 0.07]} color={colour} night={night} />)}
      </group> : null}
    </group>
  );
}

/* ───────── Bike Rack (2 × 1) ───────── */
function Bike({ pos, colour, rot = 0 }: { pos: V3; colour: string; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {[-0.42, 0.42].map((z) => <mesh key={z} position={[0, 0.34, z]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.3, 0.03, 8, 20]} /><Mat color="#1f2328" /></mesh>)}
      <Block size={[0.05, 0.05, 0.8]} pos={[0, 0.58, 0]} color={colour} r={0.02} rot={[0.15, 0, 0]} />
      <Block size={[0.05, 0.5, 0.05]} pos={[0, 0.5, -0.18]} color={colour} r={0.02} rot={[-0.3, 0, 0]} />
      <Block size={[0.05, 0.45, 0.05]} pos={[0, 0.55, 0.35]} color={colour} r={0.02} rot={[0.3, 0, 0]} />
      <Block size={[0.12, 0.05, 0.22]} pos={[0, 0.8, -0.25]} color="#1f2328" r={0.02} />
      <Block size={[0.45, 0.04, 0.04]} pos={[0, 0.82, 0.42]} color="#1f2328" r={0.01} />
    </group>
  );
}
function Scooter({ pos, colour, night }: { pos: V3; colour: string; night: boolean }) {
  return (
    <group position={pos}>
      <Block size={[0.16, 0.06, 0.8]} pos={[0, 0.14, 0]} color={colour} r={0.02} />
      {[-0.32, 0.32].map((z) => <mesh key={z} position={[0, 0.1, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.09, 0.09, 0.05, 12]} /><Mat color="#111" /></mesh>)}
      <Block size={[0.05, 0.95, 0.05]} pos={[0, 0.6, 0.36]} color={POLE_LIGHT} r={0.02} />
      <Block size={[0.4, 0.04, 0.04]} pos={[0, 1.06, 0.36]} color="#111" r={0.01} />
      <Glow size={[0.1, 0.06, 0.03]} pos={[0, 0.9, 0.4]} color="#36e07a" night={night} />
    </group>
  );
}
function BikeRack({ level, night }: Props) {
  const colours = ["#ff5e57", "#4c8dff", "#ffcc33", "#9a63ff"];
  return (
    <group>
      <Block size={[3.6, 0.06, 1.6]} pos={[0, 0.03, 0]} color={CONCRETE} r={0.02} />
      {[-1.2, -0.4, 0.4, 1.2].map((x) => <mesh key={x} position={[x, 0.42, 0]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.36, 0.035, 8, 20, Math.PI]} /><Mat color={POLE_LIGHT} metal={0.6} /></mesh>)}
      {level >= 2 ? [-1.2, -0.4, 0.4].map((x, i) => <Bike key={x} pos={[x + 0.12, 0.03, 0]} colour={colours[i]} />) : null}
      {level >= 3 ? <group>
        {[-1, 1].map((s) => <Post key={s} pos={[s * 1.7, 0, -0.65]} h={2.4} r={0.05} />)}
        <Block size={[3.7, 0.08, 1.7]} pos={[0, 2.45, -0.05]} rot={[0.12, 0, 0]} color="#2f8f4a" r={0.02} />
      </group> : null}
      {level >= 4 ? <group>
        <Scooter pos={[1.3, 0.03, 0.05]} colour="#3fe6ff" night={night} />
        <Glow size={[3.4, 0.05, 0.05]} pos={[0, 2.35, 0.75]} color="#36e07a" night={night} />
        <LightPool r={1.6} color="#b9ffd2" night={night} />
      </group> : null}
    </group>
  );
}

/* ───────── Hills Hoist (2 × 2) ───────── */
/** The clothesline idles round in the breeze and spins fast when the explorer runs into it. */
function SpinningHead({ children }: { children: ReactNode }) {
  const { group, state } = useExplorer(2.2);
  const head = useRef<Group>(null);
  const speed = useRef(0.2);
  useFrame((_, delta) => {
    speed.current += ((state.current.near ? 4 : 0.2) - speed.current) * Math.min(1, delta * 2);
    if (head.current) head.current.rotation.y += speed.current * delta;
  });
  return <group ref={group}><group ref={head}>{children}</group></group>;
}
function HillsHoist({ level, night }: Props) {
  const arm = 1.75;
  const washing = level >= 3 ? ["#ff5e57", "#ffcc33", "#3aa0ff", "#ff6fb5", "#7ac943", "#ff9f45"] : ["#f7f7f7", "#9fd3ff", "#ffcc33", "#ff9fb5"];
  return (
    <group>
      <Post pos={[0, 0, 0]} h={2.3} r={0.05} color={POLE_LIGHT} />
      <group position={[0, 2.2, 0]}>
        <SpinningHead>
          {[0, 1, 2, 3].map((i) => <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
            <Block size={[arm, 0.04, 0.04]} pos={[arm / 2, 0.15, 0]} rot={[0, 0, 0.1]} color={POLE_LIGHT} r={0.01} />
          </group>)}
          {/* Lines in rings, then what's pegged on them. */}
          {[0.6, 1.1, 1.6].map((r) => [0, 1, 2, 3].map((i) => <Block key={`${r}${i}`} size={[r * 1.414, 0.01, 0.01]} pos={[Math.cos((i + 0.5) * Math.PI / 2) * r * 0.707, 0.2, Math.sin((i + 0.5) * Math.PI / 2) * r * 0.707]} rot={[0, -(i + 0.5) * Math.PI / 2 + Math.PI / 2, 0]} color="#e6e6e6" r={0.002} />))}
          {level >= 2 ? washing.map((colour, i) => {
            const a = (i / washing.length) * Math.PI * 2;
            const big = level >= 3;
            return <group key={colour} position={[Math.cos(a) * 1.1, 0.2, Math.sin(a) * 1.1]} rotation={[0, -a, 0]}><Sway amount={0.2} speed={2 + i * 0.3}><Block size={[0.03, big ? 0.9 : 0.5, big ? 0.6 : 0.4]} pos={[0, big ? -0.45 : -0.25, 0]} color={colour} r={0.01} /></Sway></group>;
          }) : null}
          {level >= 4 ? [0, 1, 2, 3].map((i) => <Glow key={i} size={[0.1, 0.1, 0.1]} pos={[Math.cos(i * Math.PI / 2) * arm * 0.95, 0.32, Math.sin(i * Math.PI / 2) * arm * 0.95]} color={WARM} night={night} round />) : null}
        </SpinningHead>
      </group>
      {level >= 4 ? <LightPool r={1.8} color={WARM} night={night} /> : null}
    </group>
  );
}

/* ───────── Water Tank (2 × 2) ───────── */
function Tank({ pos, r, h, colour }: { pos: V3; r: number; h: number; colour: string }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[r + 0.1, r + 0.1, 0.2, 24]} /><Mat color={CONCRETE} /></mesh>
      <mesh position={[0, 0.3 + h / 2, 0]} castShadow><cylinderGeometry args={[r, r, h, 28]} /><Mat color={colour} metal={0.35} rough={0.45} /></mesh>
      {/* Corrugated ribs. */}
      {Array.from({ length: Math.round(h / 0.18) }, (_, i) => <mesh key={i} position={[0, 0.4 + i * 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[r + 0.005, 0.012, 4, 28]} /><Mat color={colour} metal={0.4} /></mesh>)}
      <mesh position={[0, 0.3 + h + 0.12, 0]}><coneGeometry args={[r + 0.04, 0.3, 28]} /><Mat color={colour} metal={0.35} /></mesh>
      <mesh position={[0.25, 0.35, r]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 0.2, 10]} /><Mat color="#c9ced6" metal={0.6} /></mesh>
    </group>
  );
}
function WaterTank({ level, night }: Props) {
  const green = "#6f8f6a";
  return (
    <group>
      {level === 1 ? <Tank pos={[0, 0, 0]} r={0.8} h={1.5} colour={green} /> : <Tank pos={[level >= 3 ? -0.75 : 0, 0, level >= 3 ? -0.7 : 0]} r={level >= 3 ? 0.95 : 1.3} h={level >= 3 ? 2.0 : 2.1} colour={green} />}
      {level >= 3 ? <group>
        <Tank pos={[0.85, 0, -0.75]} r={0.85} h={1.7} colour="#b9c2c9" />
        <Block size={[0.5, 0.4, 0.4]} pos={[0.9, 0.2, 0.8]} color="#2f6fd6" r={0.05} />
        <Block size={[1.6, 0.06, 0.06]} pos={[0.1, 0.35, 0.15]} color="#1f2328" r={0.02} />
      </group> : null}
      {level >= 4 ? <group>
        <group position={[-0.75, 2.75, -0.7]} rotation={[-0.4, 0, 0]}><Block size={[1.2, 0.05, 0.8]} pos={[0, 0, 0]} color="#1f3b6e" r={0.02} metal={0.4} rough={0.3} /></group>
        {/* A little veggie garden it waters. */}
        <Block size={[1.8, 0.3, 0.6]} pos={[-0.7, 0.15, 1.3]} color={TIMBER} r={0.04} />
        {[-1.3, -0.9, -0.5, -0.1].map((x, i) => <Ball key={x} pos={[x, 0.42, 1.3]} r={0.14} color={i % 2 ? "#4fa64a" : "#ff7a1a"} />)}
        <Glow size={[0.12, 0.6, 0.04]} pos={[0.4, 1.2, 0.26]} color="#3aa0ff" night={night} />
      </group> : null}
    </group>
  );
}

/* ───────── Shade Sail (3 × 3) ───────── */
/** A taut triangle of fabric between three points. */
function Sail({ a, b, c, colour, glow = 0 }: { a: V3; b: V3; c: V3; colour: string; glow?: number }) {
  // Keyed by the corner numbers, so the shape is built once, not on every render.
  const corners = [...a, ...b, ...c].join(",");
  const geometry = useMemo(() => {
    const shape = new BufferGeometry();
    shape.setAttribute("position", new Float32BufferAttribute(corners.split(",").map(Number), 3));
    shape.computeVertexNormals();
    return shape;
  }, [corners]);
  return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={colour} side={DoubleSide} roughness={0.8} emissive={colour} emissiveIntensity={glow} /></mesh>;
}
function ShadeSail({ level, night }: Props) {
  const h = level >= 3 ? 3.6 : 3.0, low = level >= 3 ? 2.8 : 2.4, e = 2.7;
  const glow = level >= 4 && night ? 0.25 : 0;
  return (
    <group>
      {[[-e, -e, h], [e, -e, low], [e, e, h], [-e, e, low]].map(([x, z, ph]) => <group key={`${x}${z}`}><Post pos={[x, 0, z]} h={ph} r={0.06} color={POLE_LIGHT} /><Block size={[0.3, 0.06, 0.3]} pos={[x, 0.03, z]} color={CONCRETE} r={0.02} /></group>)}
      <Sail a={[-e, h, -e]} b={[e, low, -e]} c={[-e, low, e]} colour={level >= 2 ? "#ff7a1a" : "#2fc3b0"} glow={glow} />
      {level >= 2 ? <Sail a={[e, h, e]} b={[-e, low - 0.1, e]} c={[e, low - 0.1, -e]} colour="#2fc3b0" glow={glow} /> : null}
      {level >= 3 ? <Sail a={[0, h + 0.4, 0]} b={[-e, low + 0.2, -e]} c={[e, low + 0.2, -e]} colour="#ffcc33" glow={glow} /> : null}
      {/* Something to sit under. */}
      <Block size={[1.6, 0.1, 0.45]} pos={[0, 0.5, 0]} color={TIMBER} r={0.03} />
      {[-0.65, 0.65].map((x) => <Block key={x} size={[0.08, 0.45, 0.4]} pos={[x, 0.24, 0]} color={POLE} r={0.02} />)}
      {level >= 4 ? <group>
        {[[-e, -e], [e, -e], [e, e], [-e, e]].map(([x, z]) => <Glow key={`${x}${z}`} size={[0.14, 0.14, 0.14]} pos={[x * 0.9, low - 0.1, z * 0.9]} color={WARM} night={night} round />)}
        <LightPool r={2.6} color={WARM} night={night} />
      </group> : null}
    </group>
  );
}

/* ───────── Driveway Hoop (1 × 2) ───────── */
function DrivewayHoop({ level, night }: Props) {
  const rim = 3.05;
  return (
    <group>
      <Block size={[1.8, 0.06, 3.8]} pos={[0, 0.03, 0]} color="#8e959c" r={0.02} />
      <group position={[0, 0, -1.6]}>
        <Block size={[0.5, 0.1, 0.5]} pos={[0, 0.05, 0]} color={CONCRETE} r={0.02} />
        <Post pos={[0, 0, 0]} h={rim + (level >= 2 ? 0.7 : 0.1)} r={0.07} color={level >= 4 ? "#2b313b" : POLE} />
        <Block size={[0.06, 0.06, 0.5]} pos={[0, rim, 0.25]} color={POLE} r={0.02} />
        {level >= 2 ? <group position={[0, rim + 0.35, 0.5]}>
          <Block size={[1.4, 0.95, 0.05]} pos={[0, 0, 0]} color="#f7f7f7" r={0.03} />
          <Block size={[0.5, 0.36, 0.06]} pos={[0, -0.18, 0.01]} color="#ff7a1a" r={0.01} />
          <Block size={[0.44, 0.3, 0.07]} pos={[0, -0.18, 0.015]} color="#f7f7f7" r={0.01} />
        </group> : null}
        <mesh position={[0, rim, 0.75]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.23, 0.02, 8, 24]} /><Mat color="#ff7a1a" metal={0.4} /></mesh>
        {level >= 3 ? <mesh position={[0, rim - 0.22, 0.75]}><cylinderGeometry args={[0.23, 0.15, 0.42, 12, 1, true]} /><meshStandardMaterial color="#f7f7f7" wireframe /></mesh> : null}
        {level >= 3 ? <Glow size={[0.3, 0.12, 0.12]} pos={[0, rim + 1.0, 0.3]} color={WARM} night={night} /> : null}
        {level >= 4 ? <group position={[0, rim + 1.1, 0.53]}>
          <Block size={[0.9, 0.36, 0.06]} pos={[0, 0, 0]} color="#111" r={0.03} />
          {[-0.22, 0.22].map((x) => <Glow key={x} size={[0.3, 0.22, 0.03]} pos={[x, 0, 0.04]} color="#ff3b3b" night />)}
        </group> : null}
      </group>
      <Ball pos={[0.5, 0.15, 0.8]} r={0.12} color="#ff7a1a" />
      {level >= 3 ? <LightPool r={1.4} color={WARM} night={night} pos={[0, 0, -0.6]} /> : null}
    </group>
  );
}

/** Each street piece's model by level, in world metres. Names, prices and plots live in lib/world3d/premium-homes.ts. */
export const STREET_MODELS = {
  traffic_lights: TrafficLights,
  zebra_crossing: ZebraCrossing,
  wheelie_bins: WheelieBins,
  bike_rack: BikeRack,
  hills_hoist: HillsHoist,
  water_tank: WaterTank,
  shade_sail: ShadeSail,
  driveway_hoop: DrivewayHoop,
} as const satisfies Record<(typeof STREET_STYLES)[number], (props: Props) => ReactNode>;
