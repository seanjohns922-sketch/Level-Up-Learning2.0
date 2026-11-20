"use client";
// Realm karts: one per maths realm, with parts (spoilers, wheels, a trail). Modelled about one
// unit long with the front at +z; the race scales it up.
import { Sparkles } from "@react-three/drei";
import { Ball, Block, Mat, type V3 } from "@/components/world3d/premium-homes/HomeKit";

function Glowing({ color, night, day = 0.6 }: { color: string; night: boolean; day?: number }) {
  return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={night ? 2.6 : day} roughness={0.4} />;
}

export const REALM_KARTS = {
  number: { name: "Number Nexus", body: "#14b8a6", trim: "#10b981", accent: "#5eead4" },
  measurement: { name: "Measurelands", body: "#b8893a", trim: "#d6b86c", accent: "#fff1c4" },
  space: { name: "Starpath", body: "#7c3aed", trim: "#06b6d4", accent: "#a5f3fc" },
  statistics: { name: "Statistica", body: "#a83e4b", trim: "#f2bc45", accent: "#f2bc45" },
  pattern: { name: "Pattern Peaks", body: "#059669", trim: "#7c3aed", accent: "#6ee7b7" },
  chance: { name: "Chance Hollow", body: "#be3455", trim: "#fbbf24", accent: "#fb7185" },
} as const;
export type RealmKey = keyof typeof REALM_KARTS;
export type KartParts = { spoiler?: "none" | "wing" | "fin" | "jet"; wheels?: "classic" | "chunky" | "neon"; trail?: boolean };

function Emblem({ realm, color }: { realm: RealmKey; color: string }) {
  if (realm === "number") return <group>{[[-0.07, 0], [0.07, 0]].map(([x], i) => <Block key={i} size={[0.05, 0.16, 0.02]} pos={[x, 0, 0]} color={color} r={0.01} />)}<Block size={[0.18, 0.04, 0.02]} pos={[0, 0.03, 0]} color={color} r={0.01} /></group>;
  if (realm === "measurement") return <group>{[0, 1, 2, 3].map((i) => <Block key={i} size={[0.025, i % 2 ? 0.08 : 0.14, 0.02]} pos={[-0.09 + i * 0.06, 0.02, 0]} color={color} r={0.005} />)}</group>;
  if (realm === "space") return <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 0.02, 5]} /><Mat color={color} /></mesh>;
  if (realm === "statistics") return <group>{[0.06, 0.12, 0.09].map((h, i) => <Block key={i} size={[0.04, h, 0.02]} pos={[-0.06 + i * 0.06, h / 2 - 0.06, 0]} color={color} r={0.005} />)}</group>;
  if (realm === "pattern") return <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 0.02, 3]} /><Mat color={color} /></mesh>;
  return <group><Block size={[0.15, 0.15, 0.02]} pos={[0, 0, 0]} color={color} r={0.03} />{[[-0.04, 0.04], [0.04, -0.04], [0, 0]].map(([x, y], i) => <Ball key={i} pos={[x, y, 0.012]} r={0.015} color="#222" />)}</group>;
}
function Wheel({ pos, kind, night, color }: { pos: V3; kind: KartParts["wheels"]; night: boolean; color: string }) {
  const r = kind === "chunky" ? 0.15 : 0.12, w = kind === "chunky" ? 0.16 : 0.11;
  return (
    <group position={pos}>
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[r, r, w, 18]} /><Mat color="#1a1a1a" rough={0.9} /></mesh>
      <mesh position={[pos[0] > 0 ? w / 2 + 0.005 : -w / 2 - 0.005, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[r * 0.55, r * 0.55, 0.01, 14]} />{kind === "neon" ? <Glowing color={color} night={night} day={1} /> : <Mat color="#c9ccd4" metal={0.6} rough={0.3} />}</mesh>
    </group>
  );
}
export function RealmKart({ realm, parts = {}, night = false, driver = true }: { realm: RealmKey; parts?: KartParts; night?: boolean; driver?: boolean }) {
  const k = REALM_KARTS[realm];
  const wheels = parts.wheels ?? "classic";
  const lift = wheels === "chunky" ? 0.03 : 0;
  return (
    <group position={[0, lift, 0]}>
      <Block size={[0.52, 0.12, 0.92]} pos={[0, 0.16, 0]} color="#2a2d36" r={0.04} />
      <Block size={[0.46, 0.16, 0.62]} pos={[0, 0.26, 0.05]} color={k.body} r={0.08} />
      <Block size={[0.36, 0.12, 0.3]} pos={[0, 0.25, 0.46]} rot={[0.25, 0, 0]} color={k.body} r={0.06} />
      <Block size={[0.58, 0.07, 0.16]} pos={[0, 0.17, 0.56]} color={k.trim} r={0.03} />
      <Block size={[0.3, 0.3, 0.07]} pos={[0, 0.42, -0.18]} rot={[-0.2, 0, 0]} color="#1a1c22" r={0.04} />
      <Block size={[0.06, 0.18, 0.04]} pos={[0, 0.38, 0.2]} color="#1a1c22" r={0.02} />
      <mesh position={[0, 0.48, 0.2]} rotation={[0.6, 0, 0]}><torusGeometry args={[0.08, 0.018, 8, 18]} /><Mat color="#1a1c22" /></mesh>
      <group position={[0, 0.3, 0.62]}><Emblem realm={realm} color={k.accent} /></group>
      {[-0.17, 0.17].map((x) => <Block key={x} size={[0.04, 0.1, 0.4]} pos={[x * 1.6, 0.22, 0.02]} color={k.trim} r={0.02} />)}
      {[-0.29, 0.29].flatMap((x) => [-0.3, 0.32].map((z) => <Wheel key={`${x}${z}`} pos={[x, 0.12, z]} kind={wheels} night={night} color={k.accent} />))}
      {parts.spoiler === "wing" ? <group><Block size={[0.6, 0.04, 0.16]} pos={[0, 0.5, -0.42]} color={k.trim} r={0.02} />{[-0.18, 0.18].map((x) => <Block key={x} size={[0.03, 0.2, 0.03]} pos={[x, 0.38, -0.4]} color="#1a1c22" r={0.01} />)}</group> : null}
      {parts.spoiler === "fin" ? <Block size={[0.04, 0.28, 0.3]} pos={[0, 0.48, -0.36]} color={k.trim} r={0.02} /> : null}
      {parts.spoiler === "jet" ? <group>{[-0.12, 0.12].map((x) => <group key={x}><mesh position={[x, 0.3, -0.5]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.07, 0.09, 0.22, 14]} /><Mat color="#9aa0aa" metal={0.6} rough={0.3} /></mesh><mesh position={[x, 0.3, -0.64]} rotation={[-Math.PI / 2, 0, 0]}><coneGeometry args={[0.06, 0.2, 12]} /><Glowing color={k.accent} night={night} day={1.4} /></mesh></group>)}</group> : null}
      {parts.trail ? <Sparkles count={14} scale={[0.4, 0.2, 0.8]} position={[0, 0.2, -0.8]} size={5} speed={1.2} color={k.accent} /> : null}
      {driver ? <group position={[0, 0.3, -0.04]}><Block size={[0.24, 0.22, 0.16]} pos={[0, 0.12, 0]} color="#fff" r={0.06} /><Ball pos={[0, 0.34, 0.02]} r={0.11} color={k.trim} /><Block size={[0.18, 0.06, 0.04]} pos={[0, 0.34, 0.11]} color="#1a1c22" r={0.02} /></group> : null}
    </group>
  );
}

