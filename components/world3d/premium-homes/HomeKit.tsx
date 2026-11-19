"use client";
// Shared parts for the premium homes: walls, roofs, windows, doors, lights and garden details.
// Units: one door is about 0.86 tall; PremiumHome scales the finished model to world metres.
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Sparkles } from "@react-three/drei";
import { useMemo, useRef, type ReactNode } from "react";
import { ExtrudeGeometry, Shape, type Mesh, type MeshStandardMaterial } from "three";

export type V3 = [number, number, number];

export const C = {
  grass: "#6ad35f", grassEdge: "#4fb348", dirt: "#9a6a40", stone: "#c9ccd4", stoneDark: "#9da3b0",
  trim: "#fffaf0", timber: "#d18a4a", timberDark: "#a3622d", cream: "#fff1d9", butter: "#ffe3a3", mint: "#c9f2dc", blush: "#ffd9d6",
  red: "#ff5e57", redDark: "#d9433d", blue: "#4c8dff", blueDark: "#3570d6", purple: "#9a63ff", purpleDark: "#7a46e0", teal: "#2fc3b0", tealDark: "#21a090",
  gold: "#ffc933", glass: "#a8e4ff", glow: "#ffcf6b", door: "#8f5a32", leaf: "#48c25a", leaf2: "#7fdc6c", pink: "#ff86b8", yellow: "#ffe14d", white: "#ffffff",
  bread: "#e7a456", crust: "#c27a35", choc: "#7a4a2a",
};

export const M = { white: "#f7f6f2", charcoal: "#3a3f4a", slate: "#565d6b", wood: "#c98a52", woodDark: "#9c6334", concrete: "#d9d6cf", teal: "#2fc3b0", pool: "#4fd6ff", led: "#ffd98a" };
export function Mat({ color, glow = 0, rough = 0.62, metal = 0.02, opacity }: { color: string; glow?: number; rough?: number; metal?: number; opacity?: number }) {
  return <meshStandardMaterial color={color} roughness={rough} metalness={metal} emissive={glow ? color : "#000"} emissiveIntensity={glow} transparent={opacity !== undefined} opacity={opacity ?? 1} />;
}
export function Block({ size, pos, color, r = 0.06, glow = 0, rot, rough, metal }: { size: V3; pos: V3; color: string; r?: number; glow?: number; rot?: V3; rough?: number; metal?: number }) {
  return (
    <RoundedBox args={size} radius={Math.min(r, ...size.map((s) => s / 2 - 0.001))} smoothness={3} position={pos} rotation={rot} castShadow receiveShadow>
      <Mat color={color} glow={glow} rough={rough} metal={metal} />
    </RoundedBox>
  );
}
export function Ball({ pos, r, color, glow = 0, scale }: { pos: V3; r: number; color: string; glow?: number; scale?: V3 }) {
  return <mesh castShadow receiveShadow position={pos} scale={scale}><sphereGeometry args={[r, 24, 18]} /><Mat color={color} glow={glow} /></mesh>;
}
export function Walls({ w, h, d, color, y = 0, plinth = true, planks }: { w: number; h: number; d: number; color: string; y?: number; plinth?: boolean; planks?: string }) {
  return (
    <group position={[0, y, 0]}>
      {plinth ? <Block size={[w + 0.14, 0.26, d + 0.14]} pos={[0, 0.13, 0]} color={C.stoneDark} r={0.05} /> : null}
      <Block size={[w, h, d]} pos={[0, h / 2 + (plinth ? 0.2 : 0), 0]} color={color} r={0.04} />
      {planks ? Array.from({ length: Math.floor(h / 0.22) }, (_, i) => (
        <Block key={i} size={[w + 0.02, 0.04, d + 0.02]} pos={[0, (plinth ? 0.2 : 0) + 0.2 + i * 0.22, 0]} color={planks} r={0.015} />
      )) : null}
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => (
        <Block key={`${sx}${sz}`} size={[0.12, h, 0.12]} pos={[sx * (w / 2), h / 2 + (plinth ? 0.2 : 0), sz * (d / 2)]} color={C.trim} r={0.03} />
      )))}
      <Block size={[w + 0.12, 0.1, d + 0.12]} pos={[0, h + (plinth ? 0.2 : 0), 0]} color={C.trim} r={0.03} />
    </group>
  );
}

/** A gable roof: solid gable prism, two slabs with shingle rows, a ridge cap. Ridge runs along x. */
export function GableRoof({ front, w, d, ...rest }: { front?: boolean; w: number; d: number; h: number; y: number; color: string; shade: string; ridge?: string }) {
  return front
    ? <group rotation={[0, Math.PI / 2, 0]}><SideGable w={d} d={w} {...rest} /></group>
    : <SideGable w={w} d={d} {...rest} />;
}
export function SideGable({ w, d, h, y, color, shade, ridge = C.trim }: { w: number; d: number; h: number; y: number; color: string; shade: string; ridge?: string }) {
  const prism = useMemo(() => {
    const s = new Shape();
    s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(0, h); s.closePath();
    const g = new ExtrudeGeometry(s, { depth: w - 0.02, bevelEnabled: false });
    g.translate(0, 0, -(w - 0.02) / 2);
    return g;
  }, [w, d, h]);
  const over = 0.22;
  const half = d / 2 + over;
  const slope = Math.atan2(h, d / 2);
  const len = Math.hypot(half, h * (half / (d / 2)));
  const rows = Math.max(4, Math.round(len / 0.17));
  const slab = (side: 1 | -1) => (
    <group position={[0, h / 2, (side * d) / 4]} rotation={[side * slope, 0, 0]}>
      <Block size={[w + over * 2, 0.1, len]} pos={[0, 0.05, side * 0.02]} color={color} r={0.04} />
      {Array.from({ length: rows }, (_, i) => (
        <Block key={i} size={[w + over * 2 + 0.02, 0.06, len / rows + 0.04]} pos={[0, 0.12, side * (len / 2 - (i + 0.5) * (len / rows))]} rot={[side * -0.08, 0, 0]} color={i % 2 ? color : shade} r={0.025} />
      ))}
    </group>
  );
  return (
    <group position={[0, y, 0]}>
      <mesh geometry={prism} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow><Mat color={C.trim} /></mesh>
      {slab(1)}{slab(-1)}
      <Block size={[w + over * 2 + 0.06, 0.14, 0.2]} pos={[0, h + 0.1, 0]} color={ridge} r={0.06} />
    </group>
  );
}
export function Window({ pos, w = 0.5, h = 0.55, night, shutters, box, round }: { pos: V3; w?: number; h?: number; night: boolean; shutters?: string; box?: boolean; round?: boolean }) {
  const glass = night ? C.glow : C.glass;
  return (
    <group position={pos}>
      {round ? (
        <>
          <mesh castShadow position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[w / 2 + 0.07, w / 2 + 0.07, 0.08, 28]} /><Mat color={C.trim} /></mesh>
          <mesh position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[w / 2, w / 2, 0.02, 28]} /><Mat color={glass} glow={night ? 2 : 0.08} rough={0.15} /></mesh>
          <Block size={[0.04, w, 0.03]} pos={[0, 0, 0.09]} color={C.trim} r={0.01} /><Block size={[w, 0.04, 0.03]} pos={[0, 0, 0.09]} color={C.trim} r={0.01} />
        </>
      ) : (
        <>
          <Block size={[w + 0.14, h + 0.14, 0.08]} pos={[0, 0, 0.02]} color={C.trim} r={0.03} />
          <Block size={[w, h, 0.03]} pos={[0, 0, 0.06]} color={glass} r={0.01} glow={night ? 2 : 0.08} rough={0.15} />
          <Block size={[0.04, h, 0.03]} pos={[0, 0, 0.08]} color={C.trim} r={0.01} />
          <Block size={[w, 0.04, 0.03]} pos={[0, 0, 0.08]} color={C.trim} r={0.01} />
          <Block size={[w + 0.26, 0.07, 0.16]} pos={[0, -h / 2 - 0.08, 0.07]} color={C.trim} r={0.025} />
        </>
      )}
      {shutters ? [-1, 1].map((s) => (
        <group key={s} position={[s * (w / 2 + 0.17), 0, 0.04]}>
          <Block size={[0.2, h + 0.08, 0.05]} pos={[0, 0, 0]} color={shutters} r={0.025} />
          {[-0.16, 0, 0.16].map((yy) => <Block key={yy} size={[0.16, 0.025, 0.02]} pos={[0, yy * (h / 0.55), 0.03]} color={C.trim} r={0.008} />)}
        </group>
      )) : null}
      {box ? (
        <group position={[0, -h / 2 - 0.2, 0.12]}>
          <Block size={[w + 0.1, 0.16, 0.18]} pos={[0, 0, 0]} color={C.timberDark} r={0.03} />
          {Array.from({ length: 5 }, (_, i) => <Ball key={i} pos={[-w / 2 + 0.05 + i * (w / 4), 0.12, 0.02]} r={0.065} color={[C.pink, C.yellow, C.red, C.white, C.purple][i]} />)}
          {Array.from({ length: 4 }, (_, i) => <Ball key={`l${i}`} pos={[-w / 2 + 0.15 + i * (w / 4), 0.09, -0.03]} r={0.06} color={C.leaf} />)}
        </group>
      ) : null}
    </group>
  );
}
export function Lantern({ pos, night, s = 1 }: { pos: V3; night: boolean; s?: number }) {
  return (
    <group position={pos} scale={s}>
      <Block size={[0.05, 0.16, 0.12]} pos={[0, 0.08, -0.06]} color="#3b3f55" r={0.02} />
      <Block size={[0.16, 0.2, 0.16]} pos={[0, -0.05, 0.04]} color={night ? C.glow : "#fff1c4"} r={0.04} glow={night ? 3 : 0.2} />
      <Block size={[0.2, 0.05, 0.2]} pos={[0, 0.07, 0.04]} color="#3b3f55" r={0.02} />
    </group>
  );
}
export function Door({ pos, night, color = C.door, w = 0.5, h = 0.86, lantern = true, step = true }: { pos: V3; night: boolean; color?: string; w?: number; h?: number; lantern?: boolean; step?: boolean }) {
  return (
    <group position={pos}>
      <Block size={[w + 0.16, h + 0.1, 0.08]} pos={[0, h / 2, 0.02]} color={C.trim} r={0.03} />
      <Block size={[w, h, 0.05]} pos={[0, h / 2 - 0.02, 0.06]} color={color} r={0.03} />
      {[0.24, 0.6].map((yy) => <Block key={yy} size={[w - 0.16, 0.22, 0.02]} pos={[0, yy * (h / 0.86), 0.095]} color={color} r={0.02} />)}
      <Ball pos={[w / 2 - 0.09, h / 2, 0.11]} r={0.035} color={C.gold} />
      {step ? <Block size={[w + 0.4, 0.1, 0.36]} pos={[0, -0.03, 0.22]} color={C.stone} r={0.04} /> : null}
      {lantern ? <Lantern pos={[w / 2 + 0.24, h - 0.05, 0.06]} night={night} /> : null}
    </group>
  );
}
export function Smoke({ pos }: { pos: V3 }) {
  const refs = useRef<(Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      const t = (clock.elapsedTime * 0.35 + i / 4) % 1;
      m.position.set(Math.sin(t * 5 + i) * 0.08, t * 1.1, 0);
      m.scale.setScalar(0.12 + t * 0.22);
      (m.material as MeshStandardMaterial).opacity = 0.55 * (1 - t);
    });
  });
  return <group position={pos}>{[0, 1, 2, 3].map((i) => <mesh key={i} ref={(m) => { refs.current[i] = m; }}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.4} roughness={1} depthWrite={false} /></mesh>)}</group>;
}
export function Chimney({ pos, h = 0.9, smoke = true }: { pos: V3; h?: number; smoke?: boolean }) {
  return (
    <group position={pos}>
      <Block size={[0.34, h, 0.34]} pos={[0, h / 2, 0]} color="#c46a4f" r={0.04} />
      {Array.from({ length: Math.floor(h / 0.16) }, (_, i) => <Block key={i} size={[0.36, 0.02, 0.36]} pos={[0, 0.12 + i * 0.16, 0]} color="#a8553e" r={0.01} />)}
      <Block size={[0.44, 0.1, 0.44]} pos={[0, h + 0.05, 0]} color={C.stoneDark} r={0.03} />
      {smoke ? <Smoke pos={[0, h + 0.2, 0]} /> : null}
    </group>
  );
}
export function Bush({ pos, s = 1, flowers }: { pos: V3; s?: number; flowers?: string }) {
  return (
    <group position={pos} scale={s}>
      <Ball pos={[0, 0.24, 0]} r={0.28} color={C.leaf} /><Ball pos={[0.22, 0.18, 0.05]} r={0.2} color={C.leaf2} /><Ball pos={[-0.2, 0.17, 0.02]} r={0.19} color={C.leaf2} />
      {flowers ? [[0.1, 0.45, 0.15], [-0.15, 0.36, 0.18], [0.25, 0.3, 0.15]].map((p, i) => <Ball key={i} pos={p as V3} r={0.05} color={flowers} />) : null}
    </group>
  );
}
export function Picket({ pos, n = 5, rot = 0 }: { pos: V3; n?: number; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {Array.from({ length: n }, (_, i) => (
        <group key={i} position={[(i - (n - 1) / 2) * 0.2, 0, 0]}>
          <Block size={[0.11, 0.5, 0.05]} pos={[0, 0.25, 0]} color={C.trim} r={0.03} />
          <mesh position={[0, 0.53, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[0.08, 0.1, 4]} /><Mat color={C.trim} /></mesh>
        </group>
      ))}
      <Block size={[n * 0.2, 0.06, 0.04]} pos={[0, 0.32, -0.04]} color={C.trim} r={0.02} />
    </group>
  );
}
export function Stones({ from, to }: { from: number; to: number }) {
  const n = Math.max(2, Math.round((to - from) / 0.34));
  return <>{Array.from({ length: n }, (_, i) => <Block key={i} size={[0.42, 0.06, 0.26]} pos={[(i % 2 ? 0.05 : -0.05), 0.03, from + (i + 0.5) * ((to - from) / n)]} color={C.stone} r={0.03} />)}</>;
}
export function GoldSparkle({ scale, pos }: { scale: V3; pos: V3 }) {
  return <Sparkles count={36} scale={scale} position={pos} size={5} speed={0.35} color={C.gold} />;
}
export function FlatRoof({ w, d, y, color = M.charcoal, over = 0.18 }: { w: number; d: number; y: number; color?: string; over?: number }) {
  return (
    <group position={[0, y, 0]}>
      <Block size={[w + over * 2, 0.14, d + over * 2]} pos={[0, 0.07, 0]} color={color} r={0.03} />
      <Block size={[w + over * 2, 0.05, 0.05]} pos={[0, 0.16, d / 2 + over - 0.03]} color={color} r={0.015} />
    </group>
  );
}
export function GlassWall({ w, h, pos, night, cols = 3, frame = M.charcoal, lit = 1 }: { w: number; h: number; pos: V3; night: boolean; cols?: number; frame?: string; lit?: number }) {
  return (
    <group position={pos}>
      <Block size={[w + 0.08, h + 0.08, 0.06]} pos={[0, 0, 0]} color={frame} r={0.02} />
      <Block size={[w, h, 0.04]} pos={[0, 0, 0.03]} color={night ? M.led : "#bfe9ff"} r={0.01} glow={night ? 1.5 * lit : 0.06} rough={0.08} metal={0.1} />
      {Array.from({ length: cols - 1 }, (_, i) => <Block key={i} size={[0.035, h, 0.03]} pos={[-w / 2 + (i + 1) * (w / cols), 0, 0.06]} color={frame} r={0.01} />)}
    </group>
  );
}
export function GlassRail({ w, pos, rot = 0 }: { w: number; pos: V3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.2, 0]}><boxGeometry args={[w, 0.4, 0.03]} /><meshStandardMaterial color="#d8f3ff" transparent opacity={0.4} roughness={0.05} /></mesh>
      <Block size={[w + 0.02, 0.04, 0.05]} pos={[0, 0.41, 0]} color={M.charcoal} r={0.015} />
    </group>
  );
}
export function Slats({ w, h, pos, color = M.wood }: { w: number; h: number; pos: V3; color?: string }) {
  const n = Math.round(w / 0.11);
  return <group position={pos}>{Array.from({ length: n }, (_, i) => <Block key={i} size={[0.07, h, 0.05]} pos={[-w / 2 + (i + 0.5) * (w / n), 0, 0]} color={i % 3 ? color : M.woodDark} r={0.015} />)}</group>;
}
export function Solar({ pos, n = 3, rotX = -0.35 }: { pos: V3; n?: number; rotX?: number }) {
  return <group position={pos}>{Array.from({ length: n }, (_, i) => <group key={i} position={[(i - (n - 1) / 2) * 0.5, 0, 0]} rotation={[rotX, 0, 0]}><Block size={[0.46, 0.04, 0.62]} pos={[0, 0.1, 0]} color="#22345a" r={0.015} metal={0.4} rough={0.25} />{[-0.15, 0.15].map((z) => <Block key={z} size={[0.46, 0.045, 0.012]} pos={[0, 0.105, z]} color="#9fb3d8" r={0.004} />)}</group>)}</group>;
}
export function Pool({ w, d, pos, night, glow = false }: { w: number; d: number; pos: V3; night: boolean; glow?: boolean }) {
  return (
    <group position={pos}>
      <Block size={[w + 0.24, 0.16, d + 0.24]} pos={[0, 0.08, 0]} color={M.concrete} r={0.04} />
      <Block size={[w, 0.04, d]} pos={[0, 0.15, 0]} color={M.pool} r={0.02} glow={night || glow ? 1.1 : 0.25} rough={0.05} />
      {night ? <pointLight position={[0, 0.5, 0]} color={M.pool} intensity={2} distance={2.5} /> : null}
    </group>
  );
}
export function LedStrip({ w, pos, night }: { w: number; pos: V3; night: boolean }) {
  return <Block size={[w, 0.03, 0.03]} pos={pos} color={M.led} r={0.01} glow={night ? 3 : 0.4} />;
}
export function Deck({ w, d, pos }: { w: number; d: number; pos: V3 }) {
  const n = Math.round(w / 0.16);
  return <group position={pos}><Block size={[w, 0.12, d]} pos={[0, 0.06, 0]} color={M.woodDark} r={0.03} />{Array.from({ length: n }, (_, i) => <Block key={i} size={[w / n - 0.02, 0.03, d]} pos={[-w / 2 + (i + 0.5) * (w / n), 0.13, 0]} color={M.wood} r={0.01} />)}</group>;
}
export function Planter({ pos, w = 0.8 }: { pos: V3; w?: number }) {
  return <group position={pos}><Block size={[w, 0.3, 0.32]} pos={[0, 0.15, 0]} color={M.charcoal} r={0.04} />{Array.from({ length: Math.round(w / 0.22) }, (_, i) => <Ball key={i} pos={[-w / 2 + 0.12 + i * 0.22, 0.38, 0]} r={0.13} color={i % 2 ? C.leaf : C.leaf2} />)}</group>;
}
export function BigTrunk({ h, r = 0.4, glow = false }: { h: number; r?: number; glow?: boolean }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}><cylinderGeometry args={[r * 0.8, r * 1.15, h, 14]} /><Mat color={glow ? "#7a5aa8" : C.timberDark} rough={0.9} /></mesh>
      {[0, 1.3, 2.6, 3.9, 5.2].map((a) => <mesh key={a} castShadow position={[Math.cos(a) * r * 1.05, 0.18, Math.sin(a) * r * 1.05]} rotation={[Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9]}><cylinderGeometry args={[0.07, 0.14, 0.55, 8]} /><Mat color={glow ? "#6a4a98" : C.timberDark} /></mesh>)}
      {glow ? <Sparkles count={20} scale={[1, h, 1]} position={[0, h / 2, 0]} size={3} speed={0.3} color="#c58bff" /> : null}
    </group>
  );
}
export function LeafCloud({ y, r, color = C.leaf, color2 = C.leaf2, glow = 0 }: { y: number; r: number; color?: string; color2?: string; glow?: number }) {
  const pts: [number, number, number, number][] = [[0, 0, 0, 1], [0.6, -0.15, 0.2, 0.7], [-0.6, -0.1, -0.1, 0.72], [0.1, 0.35, -0.4, 0.65], [-0.2, 0.25, 0.5, 0.6], [0.45, 0.3, -0.25, 0.55]];
  return <group position={[0, y, 0]}>{pts.map(([x, yy, z, s], i) => <Ball key={i} pos={[x * r, yy * r, z * r]} r={r * s * 0.75} color={i % 2 ? color : color2} glow={glow} />)}</group>;
}
export function Pod({ pos, w = 1.1, h = 0.8, d = 1.0, roof = C.teal, roofShade = C.tealDark, night, wall = "#e6a868" }: { pos: V3; w?: number; h?: number; d?: number; roof?: string; roofShade?: string; night: boolean; wall?: string }) {
  return (
    <group position={pos}>
      <Block size={[w + 0.5, 0.12, d + 0.5]} pos={[0, 0, 0]} color={C.timber} r={0.04} />
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <Block key={`${sx}${sz}`} size={[0.06, 0.35, 0.06]} pos={[sx * (w / 2 + 0.22), 0.2, sz * (d / 2 + 0.22)]} color={C.timberDark} r={0.02} />))}
      {[-1, 1].map((sz) => <Block key={sz} size={[w + 0.5, 0.04, 0.04]} pos={[0, 0.36, sz * (d / 2 + 0.22)]} color={C.timberDark} r={0.015} />)}
      <Walls w={w} h={h} d={d} color={wall} planks={C.timber} plinth={false} y={0.06} />
      <GableRoof front w={w} d={d} h={0.6} y={h + 0.06} color={roof} shade={roofShade} />
      <Door pos={[-w / 4, 0.06, d / 2]} night={night} w={0.32} h={0.55} lantern={false} step={false} />
      <Window pos={[w / 4, h * 0.6, d / 2 + 0.01]} w={0.26} h={0.28} night={night} />
    </group>
  );
}
export function RopeLadder({ from, to, x, z }: { from: number; to: number; x: number; z: number }) {
  const n = Math.round((to - from) / 0.22);
  return <group position={[x, 0, z]}>{[-0.15, 0.15].map((dx) => <Block key={dx} size={[0.03, to - from, 0.03]} pos={[dx, (from + to) / 2, 0]} color="#d8c08e" r={0.01} />)}{Array.from({ length: n }, (_, i) => <Block key={i} size={[0.32, 0.04, 0.05]} pos={[0, from + 0.15 + i * 0.22, 0]} color={C.timber} r={0.015} />)}</group>;
}
export function Slide({ top, pos, rot = 0, color = C.yellow }: { top: number; pos: V3; rot?: number; color?: string }) {
  const len = top / Math.sin(0.7);
  return <group position={pos} rotation={[0, rot, 0]}><Block size={[0.42, 0.06, len]} pos={[0, top / 2, (Math.cos(0.7) * len) / 2]} rot={[0.7, 0, 0]} color={color} r={0.03} />{[-0.22, 0.22].map((x) => <Block key={x} size={[0.04, 0.12, len]} pos={[x, top / 2 + 0.06, (Math.cos(0.7) * len) / 2]} rot={[0.7, 0, 0]} color={color} r={0.02} />)}</group>;
}
export function FairyLights({ from, to, sag = 0.25, night, n = 9 }: { from: V3; to: V3; sag?: number; night: boolean; n?: number }) {
  const cols = [C.glow, C.pink, "#7df9ff", C.yellow];
  return <>{Array.from({ length: n }, (_, i) => { const t = i / (n - 1); return <Ball key={i} pos={[from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t - Math.sin(t * Math.PI) * sag, from[2] + (to[2] - from[2]) * t]} r={0.045} color={cols[i % 4]} glow={night ? 3 : 0.5} />; })}</>;
}
export function Facade({ w, floors, fh, d, color, night, balcony, rail = true, seed = 1 }: { w: number; floors: number; fh: number; d: number; color: string; night: boolean; balcony?: string; rail?: boolean; seed?: number }) {
  const cols = Math.max(2, Math.round(w / 0.7));
  return (
    <group>
      {Array.from({ length: floors }, (_, f) => (
        <group key={f} position={[0, 0.3 + f * fh, 0]}>
          {Array.from({ length: cols }, (_, c) => {
            const lit = night && ((f * 7 + c * 3 + seed) % 5 !== 0);
            const x = -w / 2 + (c + 0.5) * (w / cols);
            return (
              <group key={c} position={[x, fh * 0.5, d / 2]}>
                <Block size={[w / cols - 0.18, fh * 0.55, 0.05]} pos={[0, 0, 0.01]} color={M.charcoal} r={0.015} />
                <Block size={[w / cols - 0.24, fh * 0.5, 0.03]} pos={[0, 0, 0.04]} color={lit ? M.led : "#bfe9ff"} r={0.01} glow={lit ? 1.6 : 0.06} rough={0.1} />
                {balcony ? <><Block size={[w / cols - 0.1, 0.06, 0.32]} pos={[0, -fh * 0.32, 0.18]} color={balcony} r={0.02} />{rail ? <GlassRail w={w / cols - 0.1} pos={[0, -fh * 0.3, 0.33]} /> : null}</> : null}
              </group>
            );
          })}
          <Block size={[w + 0.04, 0.05, d + 0.04]} pos={[0, 0, 0]} color={color === M.white ? M.concrete : M.white} r={0.015} />
        </group>
      ))}
    </group>
  );
}
export function Apartment({ w, d, floors, fh = 0.62, color, night, balcony, roof, entrance = true, seed }: { w: number; d: number; floors: number; fh?: number; color: string; night: boolean; balcony?: string; roof?: ReactNode; entrance?: boolean; seed?: number }) {
  const h = floors * fh + 0.3;
  return (
    <group>
      <Block size={[w + 0.2, 0.3, d + 0.2]} pos={[0, 0.15, 0]} color={M.concrete} r={0.04} />
      <Block size={[w, h - 0.3, d]} pos={[0, 0.3 + (h - 0.3) / 2, 0]} color={color} r={0.05} />
      <Facade w={w} floors={floors} fh={fh} d={d} color={color} night={night} balcony={balcony} seed={seed} />
      <FlatRoof w={w} d={d} y={h} color={M.charcoal} over={0.08} />
      {entrance ? <group position={[0, 0.3, d / 2]}><Block size={[0.8, 0.06, 0.6]} pos={[0, fh * 0.75, 0.3]} color={M.charcoal} r={0.02} /><Block size={[0.5, fh * 0.7, 0.04]} pos={[0, fh * 0.35, 0.03]} color={night ? M.led : "#9fd8ef"} r={0.01} glow={night ? 1.4 : 0.05} /></group> : null}
      <group position={[0, h + 0.14, 0]}>{roof}</group>
    </group>
  );
}
