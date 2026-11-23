"use client";
// Sports: tennis court, soccer pitch, footy goals and netball court, four levels each. Units are world
// metres (the explorer stands about 2 m tall); the playing length runs along z. Floodlights, scoreboards
// and court lines glow after dark.
import type { ReactNode } from "react";
import { DoubleSide } from "three";
import { Ball, Block, Mat } from "@/components/world3d/premium-homes/HomeKit";
import type { PremiumHomeLevel, SPORTS_STYLES } from "@/lib/world3d/premium-homes";
import { Glow, LightPool, Sway } from "./ItemKit";

type Props = { level: PremiumHomeLevel; night: boolean };
type V3 = [number, number, number];
const STEEL = "#8a96a3", STEEL_DARK = "#4b5560", LINE = "#ffffff", NET = "#20262d";
const GRASS = "#5cb34d", GRASS_LIGHT = "#6cc35a";

/* ───────── Shared parts ───────── */
/** A flat playing surface. */
function Surface({ w, d, color, y = 0.06 }: { w: number; d: number; color: string; y?: number }) {
  return <Block size={[w, y, d]} pos={[0, y / 2, 0]} color={color} r={Math.min(0.02, y / 2)} rough={0.9} />;
}
/** A painted line on the surface, along x or z. */
function Line({ from, to, y = 0.065, w = 0.08, night }: { from: [number, number]; to: [number, number]; y?: number; w?: number; night: boolean }) {
  const dx = to[0] - from[0], dz = to[1] - from[1], len = Math.hypot(dx, dz);
  return <Block size={[dx === 0 ? w : len, 0.006, dz === 0 ? w : len]} pos={[(from[0] + to[0]) / 2, y, (from[1] + to[1]) / 2]} color={LINE} r={0.002} glow={night ? 0.6 : 0} />;
}
/** A rectangle of lines. */
function Box2({ w, d, z = 0, night }: { w: number; d: number; z?: number; night: boolean }) {
  return <group>
    <Line from={[-w / 2, z - d / 2]} to={[w / 2, z - d / 2]} night={night} /><Line from={[-w / 2, z + d / 2]} to={[w / 2, z + d / 2]} night={night} />
    <Line from={[-w / 2, z - d / 2]} to={[-w / 2, z + d / 2]} night={night} /><Line from={[w / 2, z - d / 2]} to={[w / 2, z + d / 2]} night={night} />
  </group>;
}
function Floodlight({ pos, h = 8, night, face = 0 }: { pos: V3; h?: number; night: boolean; face?: number }) {
  return (
    <group position={pos}>
      <mesh position={[0, h / 2, 0]}><cylinderGeometry args={[0.1, 0.14, h, 10]} /><Mat color={STEEL_DARK} metal={0.4} /></mesh>
      <group position={[0, h, 0]} rotation={[0, face, 0]}>
        <Block size={[1.6, 0.9, 0.2]} pos={[0, 0, 0]} rot={[0.4, 0, 0]} color="#1f2328" r={0.04} />
        <Glow size={[1.4, 0.7, 0.04]} pos={[0, -0.04, 0.12]} rot={[0.4, 0, 0]} color="#f4fbff" night={night} />
      </group>
    </group>
  );
}
function Stand({ pos, w, rows = 3, rot = 0, crowd = false }: { pos: V3; w: number; rows?: number; rot?: number; crowd?: boolean }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {Array.from({ length: rows }, (_, i) => <Block key={i} size={[w, 0.45, 0.8]} pos={[0, 0.25 + i * 0.45, -i * 0.8]} color={i % 2 ? "#4c8dff" : "#2f6fd6"} r={0.03} />)}
      {crowd ? Array.from({ length: Math.floor(w / 0.7) * rows }, (_, i) => { const r = i % rows, c = Math.floor(i / rows); return <Ball key={i} pos={[-w / 2 + 0.35 + c * 0.7, 0.75 + r * 0.45, -r * 0.8]} r={0.2} color={["#ff5e57", "#ffcc33", "#4ade80", "#ff7ac8", "#f4f4f4"][i % 5]} />; }) : null}
    </group>
  );
}
function Scoreboard({ pos, w = 3, night, rot = 0 }: { pos: V3; w?: number; night: boolean; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {[-1, 1].map((s) => <mesh key={s} position={[s * w * 0.35, 1.5, 0]}><cylinderGeometry args={[0.08, 0.08, 3, 8]} /><Mat color={STEEL_DARK} /></mesh>)}
      <Block size={[w, 1.4, 0.2]} pos={[0, 3.6, 0]} color="#16202b" r={0.06} />
      <Glow size={[w * 0.4, 0.9, 0.04]} pos={[-w * 0.24, 3.6, 0.12]} color="#ffb020" night={night} />
      <Glow size={[w * 0.4, 0.9, 0.04]} pos={[w * 0.24, 3.6, 0.12]} color="#3fe6ff" night={night} />
    </group>
  );
}
/** A chain-link fence run (see-through mesh between posts). */
function Fence({ from, to, h = 3 }: { from: [number, number]; to: [number, number]; h?: number }) {
  const dx = to[0] - from[0], dz = to[1] - from[1], len = Math.hypot(dx, dz), posts = Math.max(2, Math.round(len / 3) + 1);
  return (
    <group>
      <mesh position={[(from[0] + to[0]) / 2, h / 2, (from[1] + to[1]) / 2]} rotation={[0, Math.atan2(dx, dz) + Math.PI / 2, 0]}><planeGeometry args={[len, h]} /><meshStandardMaterial color={NET} transparent opacity={0.28} side={DoubleSide} depthWrite={false} /></mesh>
      {Array.from({ length: posts }, (_, i) => { const t = i / (posts - 1); return <mesh key={i} position={[from[0] + dx * t, h / 2, from[1] + dz * t]}><cylinderGeometry args={[0.05, 0.05, h, 8]} /><Mat color={STEEL} metal={0.4} /></mesh>; })}
    </group>
  );
}
function Bench({ pos, rot = 0 }: { pos: V3; rot?: number }) {
  return <group position={pos} rotation={[0, rot, 0]}><Block size={[2.2, 0.08, 0.45]} pos={[0, 0.5, 0]} color="#c98a52" r={0.02} /><Block size={[2.2, 1.6, 0.06]} pos={[0, 1.1, -0.35]} color="#9fd3ff" r={0.02} /><Block size={[2.3, 0.08, 0.8]} pos={[0, 1.9, -0.05]} color={STEEL_DARK} r={0.02} />{[-1, 1].map((s) => <Block key={s} size={[0.06, 1.9, 0.06]} pos={[s * 1.1, 0.95, -0.35]} color={STEEL_DARK} r={0.01} />)}</group>;
}

/* ───────── Tennis court (12 × 6 squares; 24 × 12 m) ───────── */
function TennisNet({ w, night }: { w: number; night: boolean }) {
  return (
    <group>
      {[-1, 1].map((s) => <mesh key={s} position={[s * (w / 2 + 0.3), 0.55, 0]}><cylinderGeometry args={[0.05, 0.05, 1.1, 8]} /><Mat color={STEEL_DARK} /></mesh>)}
      <mesh position={[0, 0.5, 0]}><planeGeometry args={[w + 0.6, 0.9]} /><meshStandardMaterial color={NET} transparent opacity={0.55} side={DoubleSide} depthWrite={false} /></mesh>
      <Block size={[w + 0.6, 0.06, 0.04]} pos={[0, 0.96, 0]} color={LINE} r={0.01} glow={night ? 0.6 : 0} />
    </group>
  );
}
function TennisLines({ w, d, night }: { w: number; d: number; night: boolean }) {
  return <group><Box2 w={w} d={d} night={night} /><Box2 w={w * 0.75} d={d} night={night} /><Line from={[-w * 0.375, -d * 0.27]} to={[w * 0.375, -d * 0.27]} night={night} /><Line from={[-w * 0.375, d * 0.27]} to={[w * 0.375, d * 0.27]} night={night} /><Line from={[0, -d * 0.27]} to={[0, d * 0.27]} night={night} /></group>;
}
function Tennis({ level, night }: Props) {
  if (level === 1) return (
    <group>
      {/* A backyard hit-up wall and a painted half court. */}
      <Surface w={8} d={9} color="#3f7d4a" />
      <Block size={[7, 3, 0.4]} pos={[0, 1.5, -4.2]} color="#e2d6c4" r={0.05} />
      <Line from={[-3.5, -4.0]} to={[3.5, -4.0]} night={night} y={0.9} />
      <Line from={[-3, 0]} to={[3, 0]} night={night} /><Line from={[0, 0]} to={[0, 3.5]} night={night} />
      <Ball pos={[1.2, 0.12, 1.5]} r={0.11} color="#d7f04a" />
      <group position={[-1.5, 0.06, 2.5]} rotation={[0, 0.4, 0]}><Block size={[0.04, 0.6, 0.3]} pos={[0, 0.3, 0]} color="#ff5e57" r={0.05} /><Block size={[0.05, 0.4, 0.05]} pos={[0, -0.1, 0]} color="#3a3f4a" r={0.01} /></group>
    </group>
  );
  const W = level === 2 ? 10 : 11, D = 22;
  return (
    <group>
      <Surface w={level === 4 ? 23.8 : 14} d={level === 4 ? 11.8 : 11.8} color={level === 4 ? "#2a5ea8" : "#3f7d4a"} />
      {/* The court runs across x here so it fits its 24 x 12 m plot. */}
      <group rotation={[0, Math.PI / 2, 0]}>
        <Surface w={W} d={D} color={level === 4 ? "#3576d0" : "#4f9a5c"} y={0.065} />
        <TennisLines w={W - 1} d={D - 1} night={night} />
        <TennisNet w={W - 1} night={night} />
      </group>
      {level >= 3 ? <>
        {/* An umpire's chair beside the net, and a fence round the court. */}
        <group position={[0, 0.06, 5.0]}><Block size={[0.8, 0.08, 0.8]} pos={[0, 2.2, 0]} color="#3a3f4a" r={0.02} />{[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => <Block key={i} size={[0.06, 2.2, 0.06]} pos={[x * 0.35, 1.1, z * 0.35]} color={STEEL} r={0.01} />)}<Block size={[0.8, 0.8, 0.08]} pos={[0, 2.6, -0.4]} color="#3a3f4a" r={0.02} /></group>
        <Fence from={[-11.8, -5.8]} to={[11.8, -5.8]} /><Fence from={[-11.8, 5.8]} to={[-3, 5.8]} /><Fence from={[3, 5.8]} to={[11.8, 5.8]} />
        <Fence from={[-11.8, -5.8]} to={[-11.8, 5.8]} /><Fence from={[11.8, -5.8]} to={[11.8, 5.8]} />
      </> : null}
      {level === 4 ? <>
        <Stand pos={[0, 0, -3.6]} w={10} crowd rot={0} />
        {[-11, 11].map((x) => <Floodlight key={x} pos={[x, 0, -5.3]} night={night} h={8} />)}
        <Scoreboard pos={[-8.5, 0, 4.8]} w={2.6} night={night} rot={Math.PI} />
        <LightPool r={10} color="#e9f6ff" night={night} />
      </> : null}
      <Ball pos={[2, 0.17, 1]} r={0.11} color="#d7f04a" />
    </group>
  );
}

/* ───────── Soccer pitch (14 × 9 squares; 28 × 18 m) ───────── */
function SoccerGoal({ z, w = 4, h = 2, night }: { z: number; w?: number; h?: number; night: boolean }) {
  const back = Math.sign(z) * 1.0;
  return (
    <group position={[0, 0, z]}>
      {[-1, 1].map((s) => <mesh key={s} position={[s * w / 2, h / 2, 0]}><cylinderGeometry args={[0.07, 0.07, h, 10]} /><Mat color={LINE} glow={night ? 0.5 : 0} /></mesh>)}
      <mesh position={[0, h, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.07, 0.07, w, 10]} /><Mat color={LINE} glow={night ? 0.5 : 0} /></mesh>
      <mesh position={[0, h / 2, back]}><planeGeometry args={[w, h]} /><meshStandardMaterial color="#e8eef3" transparent opacity={0.35} side={DoubleSide} depthWrite={false} /></mesh>
      <mesh position={[0, h, back / 2]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[w, Math.abs(back)]} /><meshStandardMaterial color="#e8eef3" transparent opacity={0.35} side={DoubleSide} depthWrite={false} /></mesh>
    </group>
  );
}
function Stripes({ w, d, n = 8 }: { w: number; d: number; n?: number }) {
  return <group>{Array.from({ length: n }, (_, i) => <Block key={i} size={[w, 0.004, d / n]} pos={[0, 0.067, -d / 2 + (d / n) * (i + 0.5)]} color={i % 2 ? GRASS : GRASS_LIGHT} r={0.001} />)}</group>;
}
function Soccer({ level, night }: Props) {
  if (level === 1) return (
    <group>
      {/* Two little goals on the grass and a ball. */}
      <Surface w={14} d={18} color={GRASS} y={0.04} />
      <group scale={0.6}><SoccerGoal z={-13} night={night} /><SoccerGoal z={13} night={night} /></group>
      <Ball pos={[0.5, 0.25, 1]} r={0.22} color="#f4f4f4" /><Ball pos={[0.5, 0.25, 1]} r={0.1} color="#1f2328" scale={[1, 1, 1.9]} />
    </group>
  );
  const w = level === 2 ? 14 : 15, d = level === 2 ? 22 : 26;
  return (
    <group>
      {/* The pitch runs across x so it fits the 28 x 18 m plot. */}
      <Surface w={27.8} d={17.8} color={level === 4 ? "#3f8f3a" : GRASS} y={0.05} />
      <group rotation={[0, Math.PI / 2, 0]}>
        <Stripes w={w} d={d} />
        <Box2 w={w - 1} d={d - 1} night={night} />
        <Line from={[-(w - 1) / 2, 0]} to={[(w - 1) / 2, 0]} night={night} />
        <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[2.0, 2.1, 40]} /><meshStandardMaterial color={LINE} emissive={LINE} emissiveIntensity={night ? 0.6 : 0} /></mesh>
        {[-1, 1].map((s) => <Box2 key={s} w={7} d={3.5} z={s * ((d - 1) / 2 - 1.75)} night={night} />)}
        <SoccerGoal z={-(d - 1) / 2} night={night} /><SoccerGoal z={(d - 1) / 2} night={night} />
        {level >= 3 ? [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => <group key={i} position={[x * (w - 1) / 2, 0, z * (d - 1) / 2]}><mesh position={[0, 0.7, 0]}><cylinderGeometry args={[0.03, 0.03, 1.4, 6]} /><Mat color="#f4f4f4" /></mesh><Sway amount={0.3} axis="x" speed={3}><Block size={[0.02, 0.35, 0.45]} pos={[0, 1.2, 0.23]} color="#ff7a1a" r={0.01} /></Sway></group>) : null}
      </group>
      {level >= 3 ? <><Bench pos={[-4, 0, -8.2]} /><Bench pos={[4, 0, -8.2]} /></> : null}
      {level === 4 ? <>
        <Stand pos={[0, 0, 7.8]} w={16} rows={2} crowd rot={Math.PI} />
        {[[-13.4, -7.9], [13.4, -7.9], [-13.4, 7.9], [13.4, 7.9]].map(([x, z]) => <Floodlight key={`${x}${z}`} pos={[x, 0, z]} night={night} h={10} face={Math.atan2(-x, -z)} />)}
        <Scoreboard pos={[13.0, 0, 0]} w={3} night={night} rot={-Math.PI / 2} />
        <LightPool r={12} color="#e9f6ff" night={night} />
      </> : null}
      <Ball pos={[0.5, 0.27, 1]} r={0.22} color="#f4f4f4" />
    </group>
  );
}

/* ───────── Footy goals (10 × 8 squares; 20 × 16 m) ───────── */
/** AFL goals: two tall goal posts in the middle and two shorter behind posts either side. */
function FootyPosts({ z = 0, padded = false, night }: { z?: number; padded?: boolean; night: boolean }) {
  return (
    <group position={[0, 0, z]}>
      {[[-1.6, 7], [1.6, 7], [-4.8, 4], [4.8, 4]].map(([x, h]) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, h / 2, 0]}><cylinderGeometry args={[0.1, 0.12, h, 12]} /><Mat color={LINE} glow={night ? 0.5 : 0} /></mesh>
          {padded ? <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.28, 0.28, 2.4, 14]} /><Mat color={Math.abs(x) < 2 ? "#e5484d" : "#2f6fd6"} /></mesh> : null}
        </group>
      ))}
    </group>
  );
}
function Footy({ level, night }: Props) {
  if (level === 1) return (
    <group>
      {/* Backyard goals: four posts at the end of the yard and a footy. */}
      <Surface w={12} d={10} color={GRASS} y={0.04} />
      <group scale={0.55}><FootyPosts z={-8} night={night} /></group>
      <Ball pos={[0.6, 0.2, 1.4]} r={0.18} color="#c0392b" scale={[1, 1, 1.6]} />
    </group>
  );
  return (
    <group>
      <Surface w={19.8} d={15.8} color={level === 4 ? "#3f8f3a" : GRASS} y={0.05} />
      <Stripes w={19.8} d={15.8} n={6} />
      {/* The goal square and the arc of the 50. */}
      <Box2 w={6.4} d={3} z={-5.6} night={night} />
      <mesh position={[0, 0.07, -7.4]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[9, 9.12, 48, 1, Math.PI * 1.2, Math.PI * 0.6]} /><meshStandardMaterial color={LINE} emissive={LINE} emissiveIntensity={night ? 0.6 : 0} /></mesh>
      <FootyPosts z={-7.1} padded={level >= 3} night={night} />
      {level >= 3 ? <>
        <Fence from={[-9.8, -7.8]} to={[9.8, -7.8]} h={4} />
        <Bench pos={[-7, 0, 6.6]} rot={Math.PI} /><Bench pos={[7, 0, 6.6]} rot={Math.PI} />
      </> : null}
      {level === 4 ? <>
        <Stand pos={[-7.6, 0, 0]} w={10} crowd rot={Math.PI / 2} />
        <Stand pos={[7.6, 0, 0]} w={10} crowd rot={-Math.PI / 2} />
        <Scoreboard pos={[0, 0, 6.8]} w={4} night={night} rot={Math.PI} />
        {[[-9.4, -6.9], [9.4, -6.9]].map(([x, z]) => <Floodlight key={x} pos={[x, 0, z]} night={night} h={11} face={Math.atan2(-x, 6)} />)}
        <LightPool r={10} color="#e9f6ff" night={night} />
      </> : null}
      <Ball pos={[0.6, 0.22, 2.4]} r={0.18} color="#c0392b" scale={[1, 1, 1.6]} />
    </group>
  );
}

/* ───────── Netball court (12 × 7 squares; 24 × 14 m) ───────── */
function NetballRing({ z, h = 3.05, night }: { z: number; h?: number; night: boolean }) {
  const inward = -Math.sign(z);
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, h / 2, 0]}><cylinderGeometry args={[0.07, 0.09, h, 10]} /><Mat color={STEEL_DARK} /></mesh>
      <mesh position={[0, h, inward * 0.35]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.2, 0.025, 8, 24]} /><Mat color="#e5484d" glow={night ? 0.8 : 0} /></mesh>
      <mesh position={[0, h - 0.15, inward * 0.35]}><cylinderGeometry args={[0.2, 0.12, 0.3, 14, 1, true]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.6} side={DoubleSide} depthWrite={false} /></mesh>
    </group>
  );
}
function NetballLines({ w, d, night }: { w: number; d: number; night: boolean }) {
  return (
    <group>
      <Box2 w={w} d={d} night={night} />
      <Line from={[-w / 2, -d / 6]} to={[w / 2, -d / 6]} night={night} /><Line from={[-w / 2, d / 6]} to={[w / 2, d / 6]} night={night} />
      <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.45, 0.53, 32]} /><meshStandardMaterial color={LINE} emissive={LINE} emissiveIntensity={night ? 0.6 : 0} /></mesh>
      {/* The shooting circles curve in from each baseline. */}
      {[-1, 1].map((s) => <mesh key={s} position={[0, 0.07, s * d / 2]} rotation={[-Math.PI / 2, 0, s > 0 ? 0 : Math.PI]}><ringGeometry args={[4.9, 5.0, 36, 1, 0, Math.PI]} /><meshStandardMaterial color={LINE} emissive={LINE} emissiveIntensity={night ? 0.6 : 0} /></mesh>)}
    </group>
  );
}
function Netball({ level, night }: Props) {
  if (level === 1) return (
    <group>
      {/* A single ring on a post over the driveway. */}
      <Surface w={7} d={7} color="#bdb8ad" />
      <NetballRing z={-3.0} night={night} />
      <mesh position={[0, 0.07, -3]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[2.9, 3.0, 28, 1, Math.PI, Math.PI]} /><meshStandardMaterial color={LINE} /></mesh>
      <Ball pos={[0.8, 0.18, 0.5]} r={0.12} color="#ffcc33" />
    </group>
  );
  const half = level === 2;
  return (
    <group>
      <Surface w={23.8} d={13.8} color={level === 4 ? "#1f2a44" : "#9aa0a6"} />
      <group rotation={[0, Math.PI / 2, 0]}>
        <Surface w={half ? 11 : 12} d={half ? 11 : 22} color={level === 4 ? "#2f6fd6" : level === 3 ? "#3f8f6a" : "#4c8dff"} y={0.065} />
        <group position={[0, 0, half ? -5.5 : 0]}>{half ? <><Box2 w={10} d={10} z={5} night={night} /><mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, Math.PI]}><ringGeometry args={[4.9, 5.0, 36, 1, 0, Math.PI]} /><meshStandardMaterial color={LINE} /></mesh></> : <NetballLines w={11} d={21} night={night} />}</group>
        {half ? <NetballRing z={-5.3} night={night} /> : <><NetballRing z={-10.6} night={night} /><NetballRing z={10.6} night={night} /></>}
      </group>
      {level >= 3 ? <><Bench pos={[0, 0, -6.4]} /><Fence from={[-11.8, 6.8]} to={[11.8, 6.8]} h={2.4} /></> : null}
      {level === 4 ? <>
        <Stand pos={[0, 0, 5.7]} w={12} rows={2} crowd rot={Math.PI} />
        {[[-11.4, -5.9], [11.4, -5.9], [-11.4, 5.9], [11.4, 5.9]].map(([x, z]) => <Floodlight key={`${x}${z}`} pos={[x, 0, z]} night={night} h={8} face={Math.atan2(-x, -z)} />)}
        <Scoreboard pos={[8, 0, -6.2]} w={2.6} night={night} />
        <LightPool r={10} color="#e9f6ff" night={night} />
      </> : null}
      <Ball pos={[1.2, 0.18, 0.6]} r={0.12} color="#ffcc33" />
    </group>
  );
}

/** Each sport's model by level, in world metres. */
export const SPORTS_MODELS = {
  tennis: Tennis,
  soccer: Soccer,
  footy: Footy,
  netball: Netball,
} as const satisfies Record<(typeof SPORTS_STYLES)[number], (props: Props) => ReactNode>;
