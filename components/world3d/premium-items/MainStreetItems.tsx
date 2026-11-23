"use client";
// Main Street: the town's buildings, four levels each. Corner shop, café, library, town hall, school and
// fire station. Units are world metres (the explorer stands about 2 m tall, doors are 2.6 m); the front
// faces +z. Windows glow after dark; a few things move (clock hands, steam, flashing fire lights).
import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import { DoubleSide, Shape, type Group, type Mesh, type MeshStandardMaterial } from "three";
import { Ball, Block, C, Mat } from "@/components/world3d/premium-homes/HomeKit";
import type { MAIN_STREET_STYLES, PremiumHomeLevel } from "@/lib/world3d/premium-homes";
import { Glow, LightPool, Puffs, Spin, StringLights, Sway, WARM } from "./ItemKit";

type Props = { level: PremiumHomeLevel; night: boolean };
type V3 = [number, number, number];
const BRICK = "#b5553c", BRICK_DARK = "#8e3f2c", RENDER = "#f3ede1", SANDSTONE = "#e2c99a", CONCRETE = "#cfccc4", SLATE = "#3d4654", GLASS = "#bfe4ff";
const TIMBER = "#c98a52", TIMBER_DARK = "#8f5a2e", FIRE_RED = "#d8282b", NEON_PINK = "#ff4fd8", NEON_CYAN = "#3fe6ff";

/* ───────── Shared building parts ───────── */
/** A row of windows on a wall facing +z: glass that glows warm at night, with white frames. */
function Windows({ x0, x1, y, z, n, w = 1.1, h = 1.3, night, frame = "#fffaf0" }: { x0: number; x1: number; y: number; z: number; n: number; w?: number; h?: number; night: boolean; frame?: string }) {
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const x = n === 1 ? (x0 + x1) / 2 : x0 + ((x1 - x0) * i) / (n - 1);
        return (
          <group key={i} position={[x, y, z]}>
            <Block size={[w + 0.16, h + 0.16, 0.06]} pos={[0, 0, 0]} color={frame} r={0.03} />
            <Glow size={[w, h, 0.05]} pos={[0, 0, 0.02]} color={night ? WARM : GLASS} night={night} />
            <Block size={[0.05, h, 0.07]} pos={[0, 0, 0.03]} color={frame} r={0.01} />
          </group>
        );
      })}
    </group>
  );
}
function Door({ x = 0, z, w = 1.3, h = 2.6, color = TIMBER_DARK, glass = false, night }: { x?: number; z: number; w?: number; h?: number; color?: string; glass?: boolean; night: boolean }) {
  return (
    <group position={[x, h / 2, z]}>
      <Block size={[w + 0.2, h + 0.15, 0.06]} pos={[0, 0.05, 0]} color="#fffaf0" r={0.03} />
      {glass ? <Glow size={[w, h, 0.05]} pos={[0, 0, 0.02]} color={night ? WARM : GLASS} night={night} /> : <Block size={[w, h, 0.07]} pos={[0, 0, 0.02]} color={color} r={0.03} />}
      {glass ? <Block size={[0.05, h, 0.08]} pos={[0, 0, 0.04]} color={SLATE} r={0.01} /> : <Ball pos={[w * 0.32, 0, 0.08]} r={0.05} color="#e8c46a" />}
    </group>
  );
}
/** A striped shop awning sloping out over the footpath. */
function Awning({ w, y, z, colours = [C.red, "#fff6e6"] }: { w: number; y: number; z: number; colours?: string[] }) {
  const n = Math.max(4, Math.round(w / 0.5));
  return (
    <group position={[0, y, z + 0.55]} rotation={[0.42, 0, 0]}>
      {Array.from({ length: n }, (_, i) => <Block key={i} size={[w / n + 0.005, 0.05, 1.3]} pos={[-w / 2 + (w / n) * (i + 0.5), 0, 0]} color={colours[i % colours.length]} r={0.01} />)}
      {Array.from({ length: n }, (_, i) => <mesh key={`v${i}`} position={[-w / 2 + (w / n) * (i + 0.5), -0.05, 0.66]} rotation={[-0.42, 0, 0]}><coneGeometry args={[w / n / 2, 0.22, 3]} /><Mat color={colours[i % colours.length]} /></mesh>)}
    </group>
  );
}
/** A flat roof with a parapet round its edge. */
function FlatRoof({ w, d, y, at = [0, 0], color = SLATE, trim = "#fffaf0" }: { w: number; d: number; y: number; at?: [number, number]; color?: string; trim?: string }) {
  return (
    <group position={[at[0], y, at[1]]}>
      <Block size={[w, 0.2, d]} pos={[0, 0.1, 0]} color={color} r={0.03} />
      <Block size={[w + 0.12, 0.5, 0.18]} pos={[0, 0.35, d / 2]} color={trim} r={0.03} />
      <Block size={[w + 0.12, 0.5, 0.18]} pos={[0, 0.35, -d / 2]} color={trim} r={0.03} />
      <Block size={[0.18, 0.5, d]} pos={[w / 2, 0.35, 0]} color={trim} r={0.03} />
      <Block size={[0.18, 0.5, d]} pos={[-w / 2, 0.35, 0]} color={trim} r={0.03} />
    </group>
  );
}
/** A pitched roof running along x. */
function GableRoof({ w, d, y, at = [0, 0], color = BRICK_DARK, rise = 1.6 }: { w: number; d: number; y: number; at?: [number, number]; color?: string; rise?: number }) {
  const slope = Math.hypot(d / 2 + 0.3, rise), angle = Math.atan2(rise, d / 2 + 0.3);
  return (
    <group position={[at[0], y, at[1]]}>
      {[-1, 1].map((s) => <Block key={s} size={[w + 0.5, 0.16, slope]} pos={[0, rise / 2, s * (d / 4 + 0.15)]} rot={[s * angle, 0, 0]} color={color} r={0.03} />)}
      {[-1, 1].map((s) => <mesh key={`g${s}`} position={[s * w / 2, 0, 0]} rotation={[0, s * Math.PI / 2, 0]}><shapeGeometry args={[gableShape(d, rise)]} /><meshStandardMaterial color={RENDER} side={DoubleSide} /></mesh>)}
    </group>
  );
}
function pediment(w: number, rise: number) {
  const shape = new Shape();
  shape.moveTo(-w / 2, 0); shape.lineTo(w / 2, 0); shape.lineTo(0, rise); shape.closePath();
  return shape;
}
function gableShape(d: number, rise: number) {
  // A triangle in the gable wall, base on the eaves.
  const shape = new Shape();
  shape.moveTo(-d / 2, 0); shape.lineTo(d / 2, 0); shape.lineTo(0, rise); shape.closePath();
  return shape;
}
/** A big see-through shop window: real glass in front of a lit room (warm after dark), with
 * whatever's inside drawn by the caller between the glass and the back wall. */
function GlassFront({ w, h, y, z, depth = 1.2, night, frame = SLATE, children }: { w: number; h: number; y: number; z: number; depth?: number; night: boolean; frame?: string; children?: ReactNode }) {
  return (
    <group position={[0, y, z]}>
      {/* The bay's sides and top, so it reads as a glass room stepping out from the building. */}
      {[-1, 1].map((s) => <Block key={s} size={[0.16, h + 0.2, depth]} pos={[s * (w / 2 + 0.08), 0, -depth / 2]} color={frame} r={0.02} />)}
      <Block size={[w + 0.32, 0.18, depth]} pos={[0, h / 2 + 0.09, -depth / 2]} color={frame} r={0.02} />
      <mesh position={[0, 0, -depth]}><planeGeometry args={[w, h]} /><meshStandardMaterial color={night ? "#ffe2a6" : "#f4efe6"} emissive="#ffd27a" emissiveIntensity={night ? 1.1 : 0.15} /></mesh>
      <Block size={[w, 0.06, depth]} pos={[0, -h / 2 + 0.03, -depth / 2]} color="#d9d4c9" r={0.01} />
      {children}
      <mesh position={[0, 0, 0.02]}><planeGeometry args={[w, h]} /><meshStandardMaterial color="#cfe9ff" transparent opacity={0.22} roughness={0.05} metalness={0.2} depthWrite={false} /></mesh>
    </group>
  );
}
/** Shop shelves seen through the window: rows of colourful goods. */
function Shelves({ w, rows = 3, h = 2.2, z }: { w: number; rows?: number; h?: number; z: number }) {
  return (
    <group position={[0, 0, z]}>
      {Array.from({ length: rows }, (_, r) => <group key={r} position={[0, -h / 2 + 0.4 + (r * (h - 0.6)) / Math.max(1, rows - 1), 0]}>
        <Block size={[w, 0.06, 0.4]} pos={[0, 0, 0]} color="#e2ddd2" r={0.01} />
        {Array.from({ length: Math.round(w / 0.32) }, (_, i) => <Block key={i} size={[0.22, 0.3, 0.22]} pos={[-w / 2 + 0.2 + i * 0.32, 0.18, 0]} color={["#e5484d", "#ffcc33", "#4c8dff", "#7ac943", "#ff9f45", "#9a63ff"][(i + r) % 6]} r={0.03} />)}
      </group>)}
    </group>
  );
}

/** A box building with walls of one colour, sitting on a plinth. */
function Block3({ w, h, d, pos = [0, 0, 0], color, plinth = "#a7a39a" }: { w: number; h: number; d: number; pos?: V3; color: string; plinth?: string }) {
  return (
    <group position={pos}>
      <Block size={[w + 0.12, 0.3, d + 0.12]} pos={[0, 0.15, 0]} color={plinth} r={0.03} />
      <Block size={[w, h, d]} pos={[0, h / 2 + 0.2, 0]} color={color} r={0.05} />
    </group>
  );
}
/** A glowing sign panel with a little picture on it (no lettering). */
function SignBoard({ pos, w, h = 0.8, colour, night, children }: { pos: V3; w: number; h?: number; colour: string; night: boolean; children?: ReactNode }) {
  return (
    <group position={pos}>
      <Block size={[w, h, 0.14]} pos={[0, 0, 0]} color={colour} r={0.08} />
      <Glow size={[w - 0.2, 0.05, 0.02]} pos={[0, -h / 2 + 0.1, 0.08]} color="#fff7d6" night={night} />
      <group position={[0, 0.02, 0.1]}>{children}</group>
    </group>
  );
}
function Pavement({ w, d, z = 0, color = CONCRETE }: { w: number; d: number; z?: number; color?: string }) {
  return <Block size={[w, 0.08, d]} pos={[0, 0.04, z]} color={color} r={0.02} rough={0.95} />;
}
function FlagPole({ pos, h = 6, colour = "#1f6fd6" }: { pos: V3; h?: number; colour?: string }) {
  return (
    <group position={pos}>
      <mesh position={[0, h / 2, 0]}><cylinderGeometry args={[0.05, 0.06, h, 10]} /><Mat color="#e6e6e6" metal={0.5} /></mesh>
      <Ball pos={[0, h + 0.05, 0]} r={0.08} color="#e8c46a" />
      <group position={[0, h - 0.5, 0]}><Sway amount={0.25} axis="x" speed={2.2}><Block size={[0.03, 0.75, 1.2]} pos={[0, 0, 0.62]} color={colour} r={0.01} /></Sway></group>
    </group>
  );
}
function Clock({ pos, r = 0.7, night, rot = 0 }: { pos: V3; r?: number; night: boolean; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[r + 0.1, r + 0.1, 0.12, 32]} /><Mat color="#e8c46a" metal={0.5} /></mesh>
      <mesh position={[0, 0, 0.07]}><circleGeometry args={[r, 32]} /><meshStandardMaterial color="#fffaf0" emissive="#fff2c4" emissiveIntensity={night ? 1.6 : 0.1} /></mesh>
      <group position={[0, 0, 0.1]}><Spin speed={-0.05} axis="z"><Block size={[0.06, r * 0.55, 0.02]} pos={[0, r * 0.27, 0]} color="#1f2328" r={0.01} /></Spin></group>
      <group position={[0, 0, 0.12]}><Spin speed={-0.6} axis="z"><Block size={[0.04, r * 0.8, 0.02]} pos={[0, r * 0.4, 0]} color="#1f2328" r={0.01} /></Spin></group>
    </group>
  );
}
function Tree({ pos, s = 1 }: { pos: V3; s?: number }) {
  return <group position={pos} scale={s}><mesh position={[0, 0.9, 0]}><cylinderGeometry args={[0.12, 0.16, 1.8, 10]} /><Mat color="#7a5230" /></mesh><Ball pos={[0, 2.2, 0]} r={0.9} color="#4fa64a" /><Ball pos={[0.4, 2.6, 0.2]} r={0.6} color="#5cb855" /></group>;
}
function Planter({ pos }: { pos: V3 }) {
  return <group position={pos}><Block size={[0.8, 0.5, 0.5]} pos={[0, 0.25, 0]} color="#8b8f97" r={0.05} />{[-0.2, 0.05, 0.25].map((x) => <Ball key={x} pos={[x, 0.6, 0]} r={0.16} color={x > 0 ? C.pink : "#ffcc33"} />)}</group>;
}

/* ───────── Corner Shop (5 × 4 squares) ───────── */
function Crate({ pos, colour }: { pos: V3; colour: string }) {
  return <group position={pos}><Block size={[0.6, 0.3, 0.45]} pos={[0, 0.15, 0]} color={TIMBER} r={0.03} />{[-0.15, 0, 0.15].map((x) => <Ball key={x} pos={[x, 0.36, 0]} r={0.09} color={colour} />)}</group>;
}
function CornerShop({ level, night }: Props) {
  if (level === 1) return (
    <group>
      {/* A fruit and veg stall with a striped canopy. */}
      <Pavement w={5} d={3.4} />
      <Block size={[3.2, 0.9, 1.2]} pos={[0, 0.53, 0]} color={TIMBER} r={0.05} />
      {[[-1.1, C.red], [-0.4, "#ffcc33"], [0.35, "#7ac943"], [1.05, "#ff9f45"]].map(([x, c]) => <Crate key={x as number} pos={[x as number, 0.98, 0.1]} colour={c as string} />)}
      {[-1.5, 1.5].map((x) => <Block key={x} size={[0.1, 2.6, 0.1]} pos={[x, 1.3, -0.5]} color={TIMBER_DARK} r={0.02} />)}
      <Awning w={3.6} y={2.5} z={-1.0} colours={["#2f8f4a", "#fff6e6"]} />
      <StringLights from={[-1.5, 2.55, -0.5]} to={[1.5, 2.55, -0.5]} night={night} n={8} sag={0.15} />
    </group>
  );
  if (level === 2) return (
    <group>
      <Pavement w={9} d={7} />
      <Block3 w={7} h={3.8} d={5} pos={[0, 0, -0.6]} color={RENDER} />
      <FlatRoof w={7} d={5} y={4.0} at={[0, -0.6]} color={SLATE} trim="#2f8f4a" />
      <group position={[0, 0, 1.92]}>
        <Door x={-2.2} z={0} glass night={night} />
        <Windows x0={0} x1={2.2} y={1.7} z={0} n={2} w={1.7} h={1.8} night={night} />
      </group>
      <Awning w={7.2} y={3.1} z={1.4} colours={["#2f8f4a", "#fff6e6"]} />
      <SignBoard pos={[0, 3.75, 2.0]} w={4} colour="#2f8f4a" night={night}><Ball pos={[0, 0, 0]} r={0.22} color={C.red} /></SignBoard>
      {[[-1, C.red], [0, "#ffcc33"], [1, "#7ac943"]].map(([x, c]) => <Crate key={x as number} pos={[(x as number) * 0.8 + 1.2, 0.08, 2.9]} colour={c as string} />)}
    </group>
  );
  if (level === 3) return (
    <group>
      <Pavement w={9.6} d={7.6} />
      <Block3 w={8.4} h={4.4} d={4.2} pos={[0, 0, -1.5]} color="#f7f5f0" />
      <FlatRoof w={8.4} d={5.4} y={4.6} at={[0, -0.9]} color={SLATE} trim="#ff9f45" />
      {/* A glass shop front with sliding doors and trolleys outside. */}
      <GlassFront w={7.6} h={3.0} y={1.8} z={1.82} night={night}><Shelves w={7.0} z={-0.8} h={2.6} /></GlassFront>
      <group position={[0, 0, 1.82]}>{[-2.5, 0, 2.5].map((x) => <Block key={x} size={[0.12, 3.0, 0.1]} pos={[x, 1.8, 0.04]} color={SLATE} r={0.02} />)}</group>
      <SignBoard pos={[0, 4.15, 1.95]} w={5.2} h={0.9} colour="#ff9f45" night={night}><Block size={[0.5, 0.4, 0.05]} pos={[0, 0, 0]} color="#fff" r={0.06} /></SignBoard>
      {[0, 1, 2].map((i) => <Trolley key={i} pos={[2.6 + i * 0.25, 0.08, 2.9]} />)}
      <Planter pos={[-3.6, 0.08, 2.9]} />
    </group>
  );
  return (
    <group>
      {/* Supermarket: a big glass front, a glowing roof sign, a trolley bay and a short car-park strip. */}
      <Pavement w={9.9} d={7.9} color="#9ea3a9" />
      {[-3, -1, 1, 3].map((x) => <Block key={x} size={[0.1, 0.01, 1.6]} pos={[x, 0.09, 3.0]} color="#fff" r={0.004} />)}
      <Block3 w={9.4} h={5.4} d={4.0} pos={[0, 0, -1.9]} color="#f2f3f5" />
      <FlatRoof w={9.4} d={5.6} y={5.6} at={[0, -1.1]} color={SLATE} trim="#e5484d" />
      <GlassFront w={8.6} h={3.6} y={2.1} z={1.72} depth={1.6} night={night}><Shelves w={8.0} rows={4} z={-1.1} h={3.2} /></GlassFront>
      <group position={[0, 0, 1.72]}>
        {[-3.2, -1.1, 1.1, 3.2].map((x) => <Block key={x} size={[0.14, 3.6, 0.1]} pos={[x, 2.1, 0.04]} color={SLATE} r={0.02} />)}
        <Block size={[2.0, 0.14, 1.2]} pos={[0, 3.1, 0.6]} color="#e5484d" r={0.03} />
      </group>
      <group position={[0, 6.4, 0.6]}>
        <Block size={[5.4, 1.2, 0.3]} pos={[0, 0, 0]} color="#e5484d" r={0.15} />
        <Glow size={[4.8, 0.6, 0.05]} pos={[0, 0.05, 0.17]} color="#fff7d6" night={night} />
      </group>
      <Block size={[1.6, 1.0, 0.9]} pos={[3.9, 0.58, 2.6]} color="#3a3f4a" r={0.05} />
      {[0, 1, 2].map((i) => <Trolley key={i} pos={[3.5 + i * 0.25, 0.12, 2.6]} />)}
      <LightPool r={4} color={WARM} night={night} pos={[0, 0, 2.5]} />
    </group>
  );
}
function Trolley({ pos }: { pos: V3 }) {
  return <group position={pos}><Block size={[0.5, 0.45, 0.75]} pos={[0, 0.65, 0]} color="#c9ced6" r={0.03} metal={0.6} /><Block size={[0.5, 0.05, 0.05]} pos={[0, 0.95, -0.4]} color="#e5484d" r={0.02} />{[[-0.2, -0.3], [0.2, -0.3], [-0.2, 0.3], [0.2, 0.3]].map(([x, z], i) => <Ball key={i} pos={[x, 0.08, z]} r={0.06} color="#1f2328" />)}</group>;
}

/* ───────── Café (4 × 4 squares) ───────── */
function CoffeeCup({ pos, s = 1 }: { pos: V3; s?: number }) {
  return <group position={pos} scale={s}><mesh><cylinderGeometry args={[0.18, 0.14, 0.3, 16]} /><Mat color="#fff" /></mesh><mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.08, 0.025, 8, 16]} /><Mat color="#fff" /></mesh></group>;
}
function CafeTable({ pos }: { pos: V3 }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.04, 0.04, 0.9, 8]} /><Mat color={SLATE} /></mesh>
      <mesh position={[0, 0.92, 0]}><cylinderGeometry args={[0.38, 0.38, 0.04, 20]} /><Mat color="#f4efe6" /></mesh>
      {[-0.6, 0.6].map((x) => <group key={x} position={[x, 0, 0]}><Block size={[0.4, 0.05, 0.4]} pos={[0, 0.5, 0]} color={TIMBER} r={0.02} /><Block size={[0.4, 0.45, 0.05]} pos={[0, 0.75, x > 0 ? 0.18 : -0.18]} color={TIMBER} r={0.02} />{[[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]].map(([a, b], i) => <Block key={i} size={[0.04, 0.5, 0.04]} pos={[a, 0.25, b]} color={SLATE} r={0.01} />)}</group>)}
      <CoffeeCup pos={[0.1, 1.06, 0]} s={0.6} />
    </group>
  );
}
function Cafe({ level, night }: Props) {
  if (level === 1) return (
    <group>
      {/* A coffee window in a little kiosk, with a stool bench. */}
      <Pavement w={4.6} d={4} />
      <Block3 w={2.6} h={2.8} d={2.2} pos={[0, 0, -0.6]} color="#2f6b4f" />
      <Block size={[2.8, 0.14, 2.4]} pos={[0, 3.1, -0.6]} color="#f4efe6" r={0.03} />
      <Block size={[1.6, 1.0, 0.05]} pos={[0, 1.8, 0.52]} color="#2f2318" r={0.02} />
      <Glow size={[1.5, 0.9, 0.02]} pos={[0, 1.8, 0.53]} color={night ? WARM : "#ffe6b8"} night={night} />
      <Block size={[2.0, 0.08, 0.4]} pos={[0, 1.25, 0.7]} color={TIMBER} r={0.02} />
      <Awning w={2.8} y={2.7} z={-0.1} colours={["#2f6b4f", "#f4efe6"]} />
      <Puffs pos={[0.5, 1.4, 0.6]} rise={0.8} size={0.08} color="#ffffff" />
      <CafeTable pos={[1.2, 0.08, 1.6]} />
    </group>
  );
  if (level === 2) return (
    <group>
      <Pavement w={7.6} d={7.6} />
      <Block3 w={6} h={3.8} d={4.4} pos={[0, 0, -1.2]} color={BRICK} />
      <FlatRoof w={6} d={4.4} y={4.0} at={[0, -1.2]} color={SLATE} trim="#f4efe6" />
      <group position={[0, 0, 1.02]}>
        <Door x={-1.9} z={0} glass night={night} />
        <Windows x0={0.2} x1={2.0} y={1.8} z={0} n={2} w={1.4} h={1.8} night={night} />
      </group>
      <Awning w={6.2} y={3.1} z={0.5} colours={["#1f6f5a", "#f4efe6"]} />
      <SignBoard pos={[0, 3.7, 1.1]} w={3} colour="#1f6f5a" night={night}><CoffeeCup pos={[0, 0, 0]} /></SignBoard>
      <CafeTable pos={[-1.6, 0.08, 2.6]} /><CafeTable pos={[1.4, 0.08, 2.6]} />
      <Puffs pos={[2.2, 4.4, -2.4]} rise={1.2} size={0.12} color="#ffffff" />
    </group>
  );
  if (level === 3) return (
    <group>
      {/* Two storeys with an upstairs terrace under umbrellas. */}
      <Pavement w={7.8} d={7.8} />
      <Block3 w={6.4} h={6.6} d={4.6} pos={[0, 0, -1.4]} color={BRICK} />
      <group position={[0, 0, 0.92]}>
        <Door x={-2.0} z={0} glass night={night} />
        <Windows x0={0.2} x1={2.2} y={1.8} z={0} n={2} w={1.5} h={1.9} night={night} />
        <Windows x0={-2.2} x1={2.2} y={5.0} z={0} n={3} w={1.2} h={1.4} night={night} />
      </group>
      <Awning w={6.6} y={3.2} z={0.4} colours={["#1f6f5a", "#f4efe6"]} />
      {/* Roof terrace. */}
      <FlatRoof w={6.4} d={4.6} y={6.8} at={[0, -1.4]} color="#c98a52" trim="#f4efe6" />
      {[-1.6, 1.6].map((x) => <group key={x} position={[x, 7.0, -1.4]}><CafeTable pos={[0, 0, 0]} /><mesh position={[0, 2.4, 0]}><coneGeometry args={[1.1, 0.5, 8, 1, true]} /><meshStandardMaterial color={x < 0 ? "#1f6f5a" : "#f4efe6"} side={DoubleSide} /></mesh><mesh position={[0, 1.4, 0]}><cylinderGeometry args={[0.03, 0.03, 2.0, 8]} /><Mat color="#e6e6e6" /></mesh></group>)}
      <SignBoard pos={[0, 3.8, 1.0]} w={3.2} colour="#1f6f5a" night={night}><CoffeeCup pos={[0, 0, 0]} /></SignBoard>
      <CafeTable pos={[-1.6, 0.08, 2.6]} /><CafeTable pos={[1.5, 0.08, 2.6]} />
    </group>
  );
  return (
    <group>
      {/* Rooftop café: a neon coffee-cup sign, a glass upper floor, rooftop seating and festoon lights. */}
      <Pavement w={7.9} d={7.9} color="#b9b4aa" />
      <Block3 w={6.6} h={3.6} d={4.8} pos={[0, 0, -1.5]} color={BRICK} />
      <group position={[0, 3.8, -1.5]}>
        <Block size={[6.6, 3.0, 3.6]} pos={[0, 1.5, -0.6]} color="#2a2f36" r={0.05} />
        <GlassFront w={6.2} h={2.4} y={1.5} z={2.42} night={night}>{[-1.8, 0, 1.8].map((x) => <group key={x}><Glow size={[0.4, 0.4, 0.4]} pos={[x, 0.8, -0.6]} color={WARM} night={night} round /><Block size={[0.9, 0.06, 0.9]} pos={[x, -0.3, -0.6]} color={TIMBER} r={0.02} /></group>)}</GlassFront>
      </group>
      <group position={[0, 0, 0.92]}>
        <Door x={-2.1} z={0} glass night={night} />
        <Windows x0={0.3} x1={2.3} y={1.8} z={0} n={2} w={1.5} h={1.9} night={night} />
      </group>
      <Awning w={6.8} y={3.1} z={0.4} colours={["#16131f", NEON_PINK]} />
      <FlatRoof w={6.6} d={4.8} y={6.9} at={[0, -1.5]} color={TIMBER} trim="#2a2f36" />
      {[-1.8, 0, 1.8].map((x) => <CafeTable key={x} pos={[x, 7.1, -1.0]} />)}
      {[-3.1, 3.1].map((x) => <mesh key={x} position={[x, 8.6, -1.5]}><cylinderGeometry args={[0.04, 0.04, 3.0, 8]} /><Mat color="#2a2f36" /></mesh>)}
      <StringLights from={[-3.1, 9.9, -1.5]} to={[3.1, 9.9, -1.5]} night={night} n={16} sag={0.4} colors={[WARM]} r={0.05} />
      {/* The neon cup on the corner. */}
      <group position={[2.7, 5.6, 1.1]}>
        <Block size={[1.4, 1.4, 0.16]} pos={[0, 0, 0]} color="#16131f" r={0.2} />
        <group position={[0, 0, 0.12]}><mesh><torusGeometry args={[0.38, 0.05, 8, 24]} /><meshStandardMaterial color={NEON_PINK} emissive={NEON_PINK} emissiveIntensity={night ? 4 : 1.2} /></mesh><Puffs pos={[0, 0.3, 0]} rise={0.5} size={0.06} color="#ffffff" /></group>
      </group>
      <CafeTable pos={[-1.6, 0.08, 2.6]} /><CafeTable pos={[1.5, 0.08, 2.6]} />
      <LightPool r={3.6} color={WARM} night={night} pos={[0, 0, 2.2]} />
    </group>
  );
}

/* ───────── Library (5 × 4 squares) ───────── */
function Books({ pos, n = 8, h = 0.32 }: { pos: V3; n?: number; h?: number }) {
  return <group position={pos}>{Array.from({ length: n }, (_, i) => <Block key={i} size={[0.07, h * (0.8 + (i % 3) * 0.1), 0.22]} pos={[-n * 0.04 + i * 0.08, h / 2, 0]} color={[C.red, "#2f6fd6", "#ffcc33", "#2f8f4a", "#9a63ff"][i % 5]} r={0.01} />)}</group>;
}
function Library({ level, night }: Props) {
  if (level === 1) return (
    <group>
      {/* A little free library on a post, a reading bench and a tree. */}
      <Pavement w={4.6} d={3.6} color="#d8cdb8" />
      <group position={[-0.8, 0, 0]}>
        <mesh position={[0, 0.7, 0]}><cylinderGeometry args={[0.07, 0.07, 1.4, 10]} /><Mat color={TIMBER_DARK} /></mesh>
        <Block size={[0.9, 0.8, 0.6]} pos={[0, 1.8, 0]} color="#2f6fd6" r={0.06} />
        <Glow size={[0.7, 0.55, 0.02]} pos={[0, 1.8, 0.31]} color={night ? WARM : GLASS} night={night} />
        <Books pos={[0, 1.55, 0.05]} n={7} h={0.28} />
        <mesh position={[0, 2.38, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[0.72, 0.45, 4]} /><Mat color={C.red} /></mesh>
      </group>
      <group position={[1.0, 0, 0.3]}><Block size={[1.6, 0.08, 0.45]} pos={[0, 0.5, 0]} color={TIMBER} r={0.02} /><Block size={[1.6, 0.4, 0.06]} pos={[0, 0.78, -0.2]} color={TIMBER} r={0.02} />{[-0.7, 0.7].map((x) => <Block key={x} size={[0.06, 0.5, 0.4]} pos={[x, 0.25, 0]} color={SLATE} r={0.02} />)}</group>
      <Tree pos={[1.4, 0.08, -1.1]} s={0.9} />
    </group>
  );
  if (level === 2) return (
    <group>
      <Pavement w={9} d={7.4} />
      <Block3 w={7.2} h={4.0} d={5} pos={[0, 0, -0.9]} color={BRICK} />
      <GableRoof w={7.2} d={5} y={4.2} at={[0, -0.9]} color={SLATE} rise={1.8} />
      {/* Front steps and a round-topped door. */}
      {[0, 1].map((i) => <Block key={i} size={[2.4 - i * 0.4, 0.18, 0.5]} pos={[0, 0.09 + i * 0.18, 2.0 - i * 0.35]} color={CONCRETE} r={0.02} />)}
      <group position={[0, 0.3, 1.62]}><Door z={0} night={night} /></group>
      <Windows x0={-2.6} x1={-1.4} y={2.2} z={1.62} n={2} w={0.9} h={1.6} night={night} />
      <Windows x0={1.4} x1={2.6} y={2.2} z={1.62} n={2} w={0.9} h={1.6} night={night} />
      <SignBoard pos={[0, 3.7, 1.7]} w={2.6} colour="#2f6fd6" night={night}><Books pos={[0, -0.15, 0]} n={6} h={0.3} /></SignBoard>
      <Tree pos={[-3.6, 0.08, 2.4]} s={0.9} />
    </group>
  );
  if (level === 3) return (
    <group>
      {/* Two storeys of sandstone, columns at the door and tall arched windows. */}
      <Pavement w={9.6} d={7.6} />
      <Block3 w={8.2} h={6.8} d={5.4} pos={[0, 0, -1.0]} color={SANDSTONE} />
      <FlatRoof w={8.2} d={5.4} y={7.0} at={[0, -1.0]} color={SLATE} trim="#f3ede1" />
      {[0, 1, 2].map((i) => <Block key={i} size={[3.6 - i * 0.4, 0.18, 0.5]} pos={[0, 0.09 + i * 0.18, 2.3 - i * 0.35]} color={CONCRETE} r={0.02} />)}
      {[-1.4, -0.5, 0.5, 1.4].map((x) => <mesh key={x} position={[x, 2.4, 2.0]}><cylinderGeometry args={[0.18, 0.2, 4.2, 14]} /><Mat color="#fffaf0" /></mesh>)}
      <Block size={[3.6, 0.5, 0.9]} pos={[0, 4.6, 1.85]} color="#fffaf0" r={0.04} />
      <group position={[0, 0.5, 1.72]}><Door z={0} glass night={night} /></group>
      <Windows x0={-3.3} x1={-2.3} y={2.4} z={1.72} n={2} w={0.8} h={2.4} night={night} />
      <Windows x0={2.3} x1={3.3} y={2.4} z={1.72} n={2} w={0.8} h={2.4} night={night} />
      <Windows x0={-3.2} x1={3.2} y={5.6} z={1.72} n={5} w={0.9} h={1.6} night={night} />
      <Tree pos={[-3.9, 0.08, 2.8]} s={0.9} /><Tree pos={[3.9, 0.08, 2.8]} s={0.9} />
    </group>
  );
  return (
    <group>
      {/* Glass city library: a glass atrium with a glowing wall of books inside and a reading lawn out front. */}
      <Pavement w={9.9} d={7.9} color="#d8d4ca" />
      <Block3 w={9.2} h={7.6} d={4.0} pos={[0, 0, -1.9]} color="#2a2f36" />
      {[-1, 1].map((s) => <Block key={s} size={[0.3, 7.6, 1.62]} pos={[s * 4.45, 4.0, 0.91]} color="#2a2f36" r={0.03} />)}
      <group position={[0, 0, 1.72]}>
        <mesh position={[0, 3.9, 0.02]}><planeGeometry args={[8.6, 7.0]} /><meshStandardMaterial color="#cfe9ff" transparent opacity={0.2} roughness={0.05} metalness={0.2} depthWrite={false} /></mesh>
        <mesh position={[0, 3.9, -1.0]}><planeGeometry args={[8.6, 7.0]} /><meshStandardMaterial color={night ? "#ffe2a6" : "#f4efe6"} emissive="#ffd27a" emissiveIntensity={night ? 1.0 : 0.12} /></mesh>
        {[-2.9, 0, 2.9].map((x) => <Block key={x} size={[0.14, 7.0, 0.1]} pos={[x, 3.9, 0.04]} color="#2a2f36" r={0.02} />)}
        <Block size={[8.6, 0.12, 0.1]} pos={[0, 3.9, 0.05]} color="#2a2f36" r={0.02} />
      </group>
      {/* The book wall seen through the glass. */}
      {[1.2, 2.6, 4.0, 5.4, 6.8].map((y) => <group key={y}><Block size={[8.2, 0.08, 0.5]} pos={[0, y, 0.95]} color={TIMBER} r={0.02} /><Books pos={[-2.6, y + 0.04, 1.0]} n={20} h={0.6} /><Books pos={[2.6, y + 0.04, 1.0]} n={20} h={0.6} /></group>)}
      <FlatRoof w={9.2} d={5.6} y={7.8} at={[0, -1.1]} color={SLATE} trim="#2a2f36" />
      <Glow size={[9.2, 0.08, 0.08]} pos={[0, 8.15, 1.72]} color={NEON_CYAN} night={night} />
      <Block size={[3.0, 0.06, 1.6]} pos={[-2.6, 0.12, 3.0]} color="#5cb855" r={0.02} />
      {[-3.4, -1.8].map((x) => <Block key={x} size={[0.6, 0.3, 0.6]} pos={[x, 0.3, 3.0]} color={[C.red, "#ffcc33"][x < -2 ? 0 : 1]} r={0.15} />)}
      <Tree pos={[3.9, 0.08, 2.8]} s={0.9} />
      <LightPool r={4} color={WARM} night={night} pos={[0, 0, 2.6]} />
    </group>
  );
}

/* ───────── Town Hall (6 × 5 squares) ───────── */
function TownHall({ level, night }: Props) {
  if (level === 1) return (
    <group>
      {/* A rotunda in the square with a notice board. */}
      <Pavement w={8} d={8} color="#d8cdb8" />
      <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[2.4, 2.5, 0.5, 8]} /><Mat color={CONCRETE} /></mesh>
      {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return <mesh key={i} position={[Math.cos(a) * 2.1, 1.75, Math.sin(a) * 2.1]}><cylinderGeometry args={[0.08, 0.08, 2.5, 8]} /><Mat color="#fffaf0" /></mesh>; })}
      <mesh position={[0, 3.4, 0]}><coneGeometry args={[2.8, 1.4, 8]} /><Mat color="#2f6b4f" /></mesh>
      <Ball pos={[0, 4.2, 0]} r={0.14} color="#e8c46a" />
      <StringLights from={[-2.1, 2.95, 0.4]} to={[2.1, 2.95, 0.4]} night={night} n={10} sag={0.2} />
      <group position={[3.0, 0, 2.6]}><Block size={[0.08, 1.8, 0.08]} pos={[-0.6, 0.9, 0]} color={TIMBER_DARK} r={0.02} /><Block size={[0.08, 1.8, 0.08]} pos={[0.6, 0.9, 0]} color={TIMBER_DARK} r={0.02} /><Block size={[1.4, 1.0, 0.1]} pos={[0, 1.4, 0]} color={TIMBER} r={0.03} />{[[-0.3, 1.5, "#fff"], [0.25, 1.35, "#ffcc33"]].map(([x, y, c]) => <Block key={x as number} size={[0.4, 0.4, 0.02]} pos={[x as number, y as number, 0.06]} color={c as string} r={0.01} />)}</group>
    </group>
  );
  if (level === 2) return (
    <group>
      <Pavement w={11} d={9} />
      <Block3 w={8.4} h={4.4} d={5.6} pos={[0, 0, -1.2]} color={SANDSTONE} />
      <GableRoof w={8.4} d={5.6} y={4.6} at={[0, -1.2]} color="#2f6b4f" rise={2.0} />
      {[0, 1].map((i) => <Block key={i} size={[3.0 - i * 0.4, 0.18, 0.5]} pos={[0, 0.09 + i * 0.18, 2.1 - i * 0.35]} color={CONCRETE} r={0.02} />)}
      <group position={[0, 0.3, 1.62]}><Door z={0} w={1.6} night={night} /></group>
      <Windows x0={-3.2} x1={-1.6} y={2.4} z={1.62} n={2} w={0.9} h={1.8} night={night} />
      <Windows x0={1.6} x1={3.2} y={2.4} z={1.62} n={2} w={0.9} h={1.8} night={night} />
      <FlagPole pos={[-4.6, 0.08, 3.2]} h={6} />
      <Planter pos={[2.6, 0.08, 3.4]} />
    </group>
  );
  if (level === 3) return (
    <group>
      {/* A clock tower rising from the middle. */}
      <Pavement w={11.6} d={9.6} />
      <Block3 w={9.6} h={4.8} d={6} pos={[0, 0, -1.4]} color={SANDSTONE} />
      <FlatRoof w={9.6} d={6} y={5.0} at={[0, -1.4]} color={SLATE} trim="#fffaf0" />
      <group position={[0, 0, -0.6]}>
        <Block size={[2.6, 6.0, 2.6]} pos={[0, 8.0, 0]} color={SANDSTONE} r={0.05} />
        <Clock pos={[0, 9.4, 1.32]} night={night} />
        <mesh position={[0, 12.0, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[2.1, 2.4, 4]} /><Mat color="#2f6b4f" /></mesh>
        <Ball pos={[0, 13.3, 0]} r={0.16} color="#e8c46a" />
      </group>
      {[0, 1, 2].map((i) => <Block key={i} size={[3.4 - i * 0.4, 0.18, 0.5]} pos={[0, 0.09 + i * 0.18, 2.1 - i * 0.35]} color={CONCRETE} r={0.02} />)}
      <group position={[0, 0.5, 1.62]}><Door z={0} w={1.6} night={night} /></group>
      <Windows x0={-4.0} x1={-1.8} y={2.6} z={1.62} n={3} w={0.8} h={1.9} night={night} />
      <Windows x0={1.8} x1={4.0} y={2.6} z={1.62} n={3} w={0.8} h={1.9} night={night} />
      <FlagPole pos={[-5.0, 0.08, 3.6]} h={6} />
    </group>
  );
  return (
    <group>
      {/* Grand civic centre: a dome, a glowing clock, columns and a fountain plaza out front. */}
      <Pavement w={11.9} d={9.9} color="#d8cdb8" />
      <Block3 w={10.4} h={5.6} d={6.2} pos={[0, 0, -1.6]} color="#f3ede1" />
      <FlatRoof w={10.4} d={6.2} y={5.8} at={[0, -1.6]} color={SLATE} trim="#e8c46a" />
      {[-3.0, -1.8, -0.6, 0.6, 1.8, 3.0].map((x) => <mesh key={x} position={[x, 2.9, 1.7]}><cylinderGeometry args={[0.2, 0.22, 5.2, 14]} /><Mat color="#fffaf0" /></mesh>)}
      {/* The beam across the columns and a triangular pediment on top. */}
      <Block size={[7.0, 0.5, 1.0]} pos={[0, 5.75, 1.7]} color="#fffaf0" r={0.04} />
      <mesh position={[0, 6.0, 1.3]}><extrudeGeometry args={[pediment(7.0, 1.3), { depth: 0.8, bevelEnabled: false }]} /><Mat color="#fffaf0" /></mesh>
      <group position={[0, 6.0, -1.6]}>
        <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[2.4, 2.4, 2.4, 24]} /><Mat color="#f3ede1" /></mesh>
        <mesh position={[0, 2.4, 0]}><sphereGeometry args={[2.4, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><Mat color="#5aa38c" metal={0.4} rough={0.35} /></mesh>
        <Clock pos={[0, 1.2, 2.42]} r={0.85} night={night} />
        <Ball pos={[0, 4.95, 0]} r={0.2} color="#e8c46a" />
        <Glow size={[0.3, 0.3, 0.3]} pos={[0, 5.3, 0]} color="#fff2c4" night={night} round />
      </group>
      {[0, 1, 2].map((i) => <Block key={i} size={[6.4 - i * 0.6, 0.18, 0.6]} pos={[0, 0.09 + i * 0.18, 2.6 - i * 0.4]} color={CONCRETE} r={0.02} />)}
      <group position={[0, 0.5, 1.42]}><Door z={0} w={1.8} h={3.0} glass night={night} /></group>
      {/* Fountain plaza. */}
      <group position={[0, 0.08, 3.8]}>
        <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.95, 1.0, 0.5, 24, 1, true]} /><meshStandardMaterial color="#c9c2b4" side={DoubleSide} /></mesh>
        <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.9, 24]} /><meshStandardMaterial color="#5ec8ff" emissive="#1b6fa3" emissiveIntensity={night ? 0.8 : 0.1} /></mesh>
        <mesh position={[0, 0.9, 0]}><cylinderGeometry args={[0.12, 0.18, 1.0, 10]} /><Mat color="#c9c2b4" /></mesh>
        <Puffs pos={[0, 1.4, 0]} rise={0.6} size={0.12} color="#dff3ff" rate={0.8} />
      </group>
      <FlagPole pos={[-5.4, 0.08, 3.6]} h={6.5} /><FlagPole pos={[5.4, 0.08, 3.6]} h={6.5} colour={C.red} />
      <LightPool r={4.6} color={WARM} night={night} pos={[0, 0, 3]} />
    </group>
  );
}

/* ───────── School (7 × 5 squares) ───────── */
function Cola({ w, d, pos, colour = "#2f6fd6" }: { w: number; d: number; pos: V3; colour?: string }) {
  // A COLA: the covered outdoor learning area every Aussie school has.
  return (
    <group position={pos}>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => <mesh key={i} position={[x * (w / 2 - 0.15), 1.6, z * (d / 2 - 0.15)]}><cylinderGeometry args={[0.1, 0.1, 3.2, 10]} /><Mat color={STEEL_GREY} /></mesh>)}
      <mesh position={[0, 3.3, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[d / 2, d / 2, w, 24, 1, true, 0, Math.PI]} /><meshStandardMaterial color={colour} side={DoubleSide} /></mesh>
      <Block size={[w * 0.6, 0.45, 0.4]} pos={[0, 0.3, 0]} color={TIMBER} r={0.03} />
    </group>
  );
}
const STEEL_GREY = "#8a96a3";
function Hopscotch({ pos }: { pos: V3 }) {
  return <group position={pos}>{[0, 1, 2, 3, 4].map((i) => <Block key={i} size={[0.6, 0.005, 0.6]} pos={[i % 2 ? 0.32 : 0, 0.01, -i * 0.62]} color={["#ffcc33", "#ff7ac8", "#4c8dff", "#7ac943", "#ff9f45"][i]} r={0.002} />)}</group>;
}
function School({ level, night }: Props) {
  if (level === 1) return (
    <group>
      {/* A portable classroom on stilts with a ramp, and a hopscotch. */}
      <Pavement w={9} d={7} color="#cfc6b4" />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => <Block key={i} size={[0.2, 0.7, 0.2]} pos={[x * 2.8, 0.35, z * 1.4 - 1]} color={CONCRETE} r={0.02} />)}
      <Block size={[6.2, 3.2, 3.4]} pos={[0, 2.3, -1]} color="#f2e7c9" r={0.06} />
      <Block size={[6.4, 0.18, 3.6]} pos={[0, 3.95, -1]} color="#2f6b4f" r={0.03} />
      <group position={[0, 0.7, 0.72]}><Door x={-1.8} z={0} h={2.3} color="#2f6fd6" night={night} /><Windows x0={-0.2} x1={2.2} y={1.5} z={0} n={3} w={0.8} h={1.1} night={night} /></group>
      <Block size={[1.2, 0.08, 2.6]} pos={[-1.8, 0.38, 1.9]} rot={[-0.26, 0, 0]} color={CONCRETE} r={0.02} />
      <Hopscotch pos={[2.6, 0.08, 2.8]} />
      <FlagPole pos={[-3.9, 0.08, 2.6]} h={5} />
    </group>
  );
  if (level === 2) return (
    <group>
      <Pavement w={13} d={9} color="#cfc6b4" />
      <Block3 w={10} h={3.8} d={5} pos={[0, 0, -1.6]} color={BRICK} />
      <FlatRoof w={10} d={5} y={4.0} at={[0, -1.6]} color="#2f6b4f" trim="#fffaf0" />
      <group position={[0, 0, 0.92]}>
        <Door x={0} z={0} w={1.6} glass night={night} />
        <Windows x0={-4.2} x1={-1.6} y={2.0} z={0} n={3} w={1.0} h={1.4} night={night} />
        <Windows x0={1.6} x1={4.2} y={2.0} z={0} n={3} w={1.0} h={1.4} night={night} />
      </group>
      <SignBoard pos={[0, 3.6, 1.05]} w={3.0} colour="#2f6fd6" night={night}><Block size={[0.5, 0.36, 0.05]} pos={[0, 0, 0]} color="#ffcc33" r={0.04} /></SignBoard>
      <Hopscotch pos={[3.6, 0.08, 3.4]} />
      {/* Handball court lines. */}
      <group position={[-3.2, 0.09, 2.9]}>{[[0, 0, 3, 0.06], [0, 0, 0.06, 2.2]].map(([x, z, w, d], i) => <Block key={i} size={[w, 0.005, d]} pos={[x, 0, z]} color="#fff" r={0.002} />)}<Block size={[3, 0.005, 2.2]} pos={[0, -0.003, 0]} color="#c4563f" r={0.002} /></group>
      <FlagPole pos={[-5.8, 0.08, 3.6]} h={6} />
    </group>
  );
  if (level === 3) return (
    <group>
      {/* Two blocks joined by a covered walkway, and a COLA with seats. */}
      <Pavement w={13.6} d={9.6} color="#cfc6b4" />
      <Block3 w={6} h={3.8} d={5} pos={[-3.4, 0, -1.8]} color={BRICK} />
      <FlatRoof w={6} d={5} y={4.0} at={[-3.4, -1.8]} color="#2f6b4f" trim="#fffaf0" />
      <Block3 w={5} h={6.8} d={5} pos={[3.8, 0, -1.8]} color="#e9e2d0" />
      <FlatRoof w={5} d={5} y={7.0} at={[3.8, -1.8]} color="#2f6fd6" trim="#fffaf0" />
      <Windows x0={-5.6} x1={-1.2} y={2.0} z={0.72} n={4} w={0.9} h={1.4} night={night} />
      <group position={[3.8, 0, 0.72]}><Door z={0} glass night={night} /><Windows x0={-1.6} x1={1.6} y={5.2} z={0} n={3} w={1.0} h={1.4} night={night} /></group>
      <Block size={[1.4, 0.12, 2.2]} pos={[0.2, 3.0, -0.4]} color="#2f6fd6" r={0.03} />
      <Cola w={5} d={3.4} pos={[-3.0, 0.08, 2.8]} />
      <FlagPole pos={[6.2, 0.08, 3.8]} h={6.5} />
    </group>
  );
  return (
    <group>
      {/* Big school: two storeys with solar panels, a glowing entry, a COLA, a garden and a mural wall. */}
      <Pavement w={13.9} d={9.9} color="#cfc6b4" />
      <Block3 w={12.6} h={6.8} d={5.4} pos={[0, 0, -2.0]} color="#f2efe8" />
      <FlatRoof w={12.6} d={5.4} y={7.0} at={[0, -2.0]} color={SLATE} trim="#2f6fd6" />
      {Array.from({ length: 6 }, (_, i) => <Block key={i} size={[1.6, 0.06, 1.0]} pos={[-4.6 + i * 1.84, 7.55, -2.4]} rot={[-0.35, 0, 0]} color="#1f3a6b" r={0.02} metal={0.5} rough={0.3} />)}
      <group position={[0, 0, 0.72]}>
        <Glow size={[3.0, 5.6, 0.05]} pos={[0, 3.2, 0]} color={night ? WARM : GLASS} night={night} />
        <Block size={[3.4, 0.3, 1.6]} pos={[0, 3.0, 0.8]} color="#2f6fd6" r={0.04} />
        <Windows x0={-5.6} x1={-2.4} y={2.0} z={0} n={3} w={0.9} h={1.4} night={night} />
        <Windows x0={2.4} x1={5.6} y={2.0} z={0} n={3} w={0.9} h={1.4} night={night} />
        <Windows x0={-5.6} x1={-2.4} y={5.2} z={0} n={3} w={0.9} h={1.4} night={night} />
        <Windows x0={2.4} x1={5.6} y={5.2} z={0} n={3} w={0.9} h={1.4} night={night} />
      </group>
      {/* A mural of colour blocks on the end wall. */}
      {Array.from({ length: 6 }, (_, i) => <Block key={i} size={[0.05, 1.6, 0.8]} pos={[6.33, 1.5 + (i % 2) * 1.7, -3.8 + Math.floor(i / 2) * 0.9]} color={["#ff7ac8", "#ffcc33", "#4c8dff", "#7ac943", "#ff9f45", "#9a63ff"][i]} r={0.02} />)}
      <Cola w={5.2} d={3.4} pos={[-3.8, 0.08, 3.0]} colour="#ffcc33" />
      <group position={[3.2, 0.08, 3.4]}>{[-1.2, 0, 1.2].map((x) => <group key={x}><Block size={[1.0, 0.4, 1.4]} pos={[x, 0.2, 0]} color={TIMBER} r={0.04} />{[-0.3, 0.3].map((z) => <Ball key={z} pos={[x, 0.55, z]} r={0.22} color="#5cb855" />)}</group>)}</group>
      <FlagPole pos={[6.4, 0.08, 3.6]} h={7} />
      <LightPool r={4.4} color={WARM} night={night} pos={[0, 0, 2.4]} />
    </group>
  );
}

/* ───────── Fire Station (6 × 5 squares) ───────── */
/** Red and blue lights that flash in turn. */
function Beacons({ pos, w = 1.2, on = true }: { pos: V3; w?: number; on?: boolean }) {
  const red = useRef<Mesh>(null), blue = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!on) return;
    const flip = Math.floor(clock.elapsedTime * 4) % 2 === 0;
    (red.current?.material as MeshStandardMaterial | undefined)?.emissive.set(flip ? "#ff2a2a" : "#3a0505");
    (blue.current?.material as MeshStandardMaterial | undefined)?.emissive.set(flip ? "#08143a" : "#2a6bff");
  });
  return (
    <group position={pos}>
      <Block size={[w, 0.1, 0.3]} pos={[0, 0, 0]} color="#1f2328" r={0.03} />
      <mesh ref={red} position={[-w / 4, 0.12, 0]}><boxGeometry args={[w / 2.4, 0.16, 0.26]} /><meshStandardMaterial color="#ff4545" emissive="#ff2a2a" emissiveIntensity={2} /></mesh>
      <mesh ref={blue} position={[w / 4, 0.12, 0]}><boxGeometry args={[w / 2.4, 0.16, 0.26]} /><meshStandardMaterial color="#4c8dff" emissive="#2a6bff" emissiveIntensity={2} /></mesh>
    </group>
  );
}
/** A fire truck facing +z; at Legendary its ladder lifts and lowers. */
function FireTruck({ pos, ladder = false, raise = false, night }: { pos: V3; ladder?: boolean; raise?: boolean; night: boolean }) {
  const boom = useRef<Group>(null);
  useFrame(({ clock }) => { if (boom.current && raise) boom.current.rotation.x = -0.15 - (Math.sin(clock.elapsedTime * 0.4) + 1) * 0.35; });
  return (
    <group position={pos}>
      <Block size={[2.2, 1.9, 5.6]} pos={[0, 1.45, 0]} color={FIRE_RED} r={0.2} />
      <Block size={[2.2, 1.0, 1.6]} pos={[0, 2.85, 2.0]} color={FIRE_RED} r={0.2} />
      <Glow size={[1.9, 0.7, 0.04]} pos={[0, 2.9, 2.81]} color={night ? WARM : "#9fd3ff"} night={night} />
      <Block size={[2.22, 0.24, 5.62]} pos={[0, 1.0, 0]} color="#f2f2f2" r={0.08} />
      {[-1, 1].map((s) => <Block key={s} size={[0.04, 0.8, 3.4]} pos={[s * 1.11, 1.7, -0.8]} color="#c9ced6" r={0.02} metal={0.5} />)}
      {[1.8, -1.8].flatMap((z) => [-1, 1].map((s) => <mesh key={`${z}${s}`} position={[s * 1.0, 0.5, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.5, 0.5, 0.36, 20]} /><Mat color="#1d1f22" /></mesh>))}
      {[-0.7, 0.7].map((x) => <Glow key={x} size={[0.3, 0.2, 0.04]} pos={[x, 1.3, 2.82]} color="#fff7d6" night={night} />)}
      <Beacons pos={[0, 3.4, 2.1]} w={1.6} />
      {ladder ? (
        <group position={[0, 2.55, -2.0]}>
          <group ref={boom} rotation={[-0.15, 0, 0]}>
            {[-0.35, 0.35].map((x) => <Block key={x} size={[0.08, 0.1, 5.4]} pos={[x, 0, 2.6]} color="#c9ced6" r={0.02} metal={0.5} />)}
            {Array.from({ length: 12 }, (_, i) => <Block key={i} size={[0.7, 0.05, 0.05]} pos={[0, 0, 0.3 + i * 0.44]} color="#c9ced6" r={0.01} />)}
          </group>
        </group>
      ) : null}
    </group>
  );
}
function BayDoor({ x, w, h, open, z, night }: { x: number; w: number; h: number; open: boolean; z: number; night: boolean }) {
  return open
    ? <Glow size={[w, h, 0.04]} pos={[x, h / 2 + 0.3, z]} color={night ? WARM : "#4a3f37"} night={night} />
    : <group>{Array.from({ length: 6 }, (_, i) => <Block key={i} size={[w, h / 6 - 0.03, 0.06]} pos={[x, 0.3 + (h / 6) * (i + 0.5), z]} color={FIRE_RED} r={0.02} />)}</group>;
}
function FireStation({ level, night }: Props) {
  if (level === 1) return (
    <group>
      {/* A hose shed with a hydrant and a hose reel. */}
      <Pavement w={8} d={6} />
      <Block3 w={4} h={3.0} d={3} pos={[0, 0, -1.2]} color={FIRE_RED} />
      <GableRoof w={4} d={3} y={3.2} at={[0, -1.2]} color="#2a2f36" rise={1.0} />
      <BayDoor x={0} w={2.6} h={2.4} open={false} z={0.32} night={night} />
      <group position={[2.6, 0.08, 1.4]}><mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.2, 0.24, 0.9, 14]} /><Mat color={FIRE_RED} /></mesh><Ball pos={[0, 0.95, 0]} r={0.2} color={FIRE_RED} /><mesh position={[0, 0.6, 0.22]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.07, 0.07, 0.2, 10]} /><Mat color="#e8c46a" /></mesh></group>
      <group position={[-2.6, 0, 1.0]}><mesh position={[0, 0.9, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.55, 0.55, 0.3, 20]} /><Mat color="#ffcc33" /></mesh><Block size={[0.1, 1.0, 0.1]} pos={[0, 0.5, 0]} color={SLATE} r={0.02} /></group>
    </group>
  );
  if (level === 2) return (
    <group>
      <Pavement w={11} d={9} />
      <Block size={[3.4, 0.01, 4]} pos={[-1.4, 0.09, 2.4]} color="#c4563f" r={0.004} />
      <Block3 w={7.4} h={4.4} d={6} pos={[0, 0, -1.4]} color={BRICK} />
      <FlatRoof w={7.4} d={6} y={4.6} at={[0, -1.4]} color={SLATE} trim="#fffaf0" />
      <BayDoor x={-1.4} w={3.0} h={3.4} open z={1.62} night={night} />
      <group position={[2.2, 0, 1.62]}><Door z={0} night={night} /><Windows x0={0} x1={0} y={3.4} z={0} n={1} w={1.0} h={0.8} night={night} /></group>
      <FireTruck pos={[-1.4, 0.08, 1.6]} night={night} />
      <SignBoard pos={[0, 4.4, 1.7]} w={3.4} colour={FIRE_RED} night={night}><Ball pos={[0, 0, 0]} r={0.22} color="#ffcc33" /></SignBoard>
    </group>
  );
  if (level === 3) return (
    <group>
      {/* Two bays, two trucks, and a hose-drying tower. */}
      <Pavement w={11.6} d={9.6} />
      <Block3 w={8.6} h={4.6} d={6} pos={[-0.6, 0, -1.6]} color={BRICK} />
      <FlatRoof w={8.6} d={6} y={4.8} at={[-0.6, -1.6]} color={SLATE} trim="#fffaf0" />
      <BayDoor x={-3.0} w={3.0} h={3.6} open z={1.42} night={night} />
      <BayDoor x={0.6} w={3.0} h={3.6} open={false} z={1.42} night={night} />
      <FireTruck pos={[-3.0, 0.08, 1.4]} night={night} />
      <group position={[4.6, 0, -1.6]}>
        <Block3 w={2.2} h={9.0} d={2.2} color={BRICK_DARK} />
        <Windows x0={0} x1={0} y={7.6} z={1.12} n={1} w={1.0} h={1.0} night={night} />
        <Block size={[2.6, 0.2, 2.6]} pos={[0, 9.4, 0]} color={SLATE} r={0.03} />
      </group>
      <SignBoard pos={[-1.2, 4.6, 1.5]} w={3.4} colour={FIRE_RED} night={night}><Ball pos={[0, 0, 0]} r={0.22} color="#ffcc33" /></SignBoard>
    </group>
  );
  return (
    <group>
      {/* Big station: three bays, a ladder truck that lifts its ladder, flashing beacons on the roof and a lookout tower. */}
      <Pavement w={11.9} d={9.9} color="#a7a39a" />
      {[-3.8, 0, 3.8].map((x) => <Block key={x} size={[3.2, 0.01, 3.8]} pos={[x, 0.09, 3.0]} color="#c4563f" r={0.004} />)}
      <Block3 w={11.6} h={5.0} d={5.8} pos={[0, 0, -2.0]} color={BRICK} />
      <FlatRoof w={11.6} d={5.8} y={5.2} at={[0, -2.0]} color={SLATE} trim="#fffaf0" />
      {[-3.8, 0, 3.8].map((x) => <BayDoor key={x} x={x} w={3.2} h={3.8} open z={0.92} night={night} />)}
      <Glow size={[11.6, 0.1, 0.08]} pos={[0, 4.6, 0.96]} color="#ff4545" night={night} />
      <FireTruck pos={[-3.8, 0.08, 1.4]} night={night} />
      <FireTruck pos={[0, 0.08, 1.6]} ladder raise night={night} />
      <FireTruck pos={[3.8, 0.08, 1.4]} night={night} />
      <group position={[0, 5.8, -2.0]}>
        <Block size={[2.6, 2.4, 2.6]} pos={[0, 1.2, 0]} color={BRICK_DARK} r={0.05} />
        <Glow size={[2.0, 1.0, 0.05]} pos={[0, 1.4, 1.32]} color={night ? WARM : GLASS} night={night} />
        <Block size={[3.0, 0.2, 3.0]} pos={[0, 2.5, 0]} color={SLATE} r={0.03} />
        <Beacons pos={[0, 2.7, 0]} w={1.8} />
      </group>
      <LightPool r={4.8} color="#ff6a5a" night={night} pos={[0, 0, 2.6]} />
    </group>
  );
}

/** How much bigger each level stands than it's modelled: the supermarket, town hall and school grow
 * well past the houses at their top levels, as they would in a real town. */
type Growth = readonly [number, number, number, number];
const CIVIC_GROWTH: Growth = [1, 1, 1.3, 1.6];
function grown(Model: (props: Props) => ReactNode, growth: Growth) {
  const Grown = ({ level, night }: Props) => <group scale={growth[level - 1]}><Model level={level} night={night} /></group>;
  Grown.displayName = `Grown${Model.name}`;
  return Grown;
}

/** Each Main Street building's model by level, in world metres. Names, prices and plots live in lib/world3d/premium-homes.ts. */
export const MAIN_STREET_MODELS = {
  corner_shop: grown(CornerShop, CIVIC_GROWTH),
  cafe: Cafe,
  library: Library,
  town_hall: grown(TownHall, CIVIC_GROWTH),
  school: grown(School, CIVIC_GROWTH),
  fire_station: FireStation,
} as const satisfies Record<(typeof MAIN_STREET_STYLES)[number], (props: Props) => ReactNode>;
