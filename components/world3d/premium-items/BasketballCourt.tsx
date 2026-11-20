"use client";
// The basketball court set piece, four levels: a driveway hoop, a half court, a floodlit full court
// with stands and a scoreboard, then a neon arena. Units are world metres; hoops face the court centre.
import { Html, Sparkles } from "@react-three/drei";
import { createContext, useContext } from "react";
import { DoubleSide } from "three";
import { Ball, Block } from "@/components/world3d/premium-homes/HomeKit";
import { HOOPS, RIM_HEIGHT, THREE_POINT_RADIUS } from "@/lib/world3d/basketball";
import type { PremiumHomeLevel } from "@/lib/world3d/premium-homes";

const ORANGE = "#ff7a1a", NEON_BLUE = "#3fd0ff", NEON_PINK = "#ff4fd8", STEEL = "#3a3f4a", WHITE = "#f7f6f2";

/** The learner's points this visit, shown on the scoreboards (absent in shop pictures). */
export const BasketballScoreContext = createContext<number>(0);

function Line({ w, d, x = 0, z = 0, color }: { w: number; d: number; x?: number; z?: number; color: string }) {
  return <mesh position={[x, 0.072, z]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[w, d]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={color === NEON_BLUE || color === NEON_PINK ? 1.4 : 0} /></mesh>;
}
/** Part of a ring painted on the floor; ring angle θ lands at (cos θ, -sin θ) on the ground. */
function Arc({ r, z, start, length, color, width = 0.07 }: { r: number; z: number; start: number; length: number; color: string; width?: number }) {
  return <mesh position={[0, 0.073, z]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[r - width / 2, r + width / 2, 48, 1, start, length]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={color === NEON_BLUE || color === NEON_PINK ? 1.4 : 0} side={DoubleSide} /></mesh>;
}
/** Painted markings for one end: the key, free-throw circle and three-point arc, facing +z from `z`. */
function EndMarkings({ z, dir, color, paint }: { z: number; dir: 1 | -1; color: string; paint: string }) {
  const key = 3.2, keyW = 2.8, baseline = z - dir * 1.0;
  return (
    <group>
      <mesh position={[0, 0.068, baseline + dir * key / 2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[keyW, key]} /><meshStandardMaterial color={paint} /></mesh>
      <Line w={keyW} d={0.07} z={baseline + dir * key} color={color} />
      <Line w={0.07} d={key} x={-keyW / 2} z={baseline + dir * key / 2} color={color} />
      <Line w={0.07} d={key} x={keyW / 2} z={baseline + dir * key / 2} color={color} />
      <Arc r={1.2} z={baseline + dir * key} start={dir === 1 ? Math.PI : 0} length={Math.PI} color={color} />
      <Arc r={THREE_POINT_RADIUS} z={z} start={dir === 1 ? Math.PI : 0} length={Math.PI} color={color} />
    </group>
  );
}
function CourtFloor({ w, d, z = 0, colour, line, paint, ends }: { w: number; d: number; z?: number; colour: string; line: string; paint: string; ends: readonly (readonly [number, number])[] }) {
  return (
    <group position={[0, 0, z]}>
      <Block size={[w + 0.6, 0.06, d + 0.6]} pos={[0, 0.03, 0]} color="#5d6470" r={0.02} />
      <mesh position={[0, 0.064, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[w, d]} /><meshStandardMaterial color={colour} roughness={0.7} /></mesh>
      {[-1, 1].map((s) => <Line key={`s${s}`} w={0.07} d={d} x={s * w / 2} color={line} />)}
      {[-1, 1].map((s) => <Line key={`b${s}`} w={w} d={0.07} z={s * d / 2} color={line} />)}
      {ends.length === 2 ? <><Line w={w} d={0.07} color={line} /><Arc r={1.2} z={0} start={0} length={Math.PI * 2} color={line} /></> : null}
      {ends.map(([, hz]) => <EndMarkings key={hz} z={hz - z} dir={hz - z < 0 ? 1 : -1} color={line} paint={paint} />)}
    </group>
  );
}
/** A hoop: pole and arm behind a backboard, an orange rim with a net. Faces +z (rotate for the far end). */
function Hoop({ x, z, facing, glow }: { x: number; z: number; facing: 1 | -1; glow?: string }) {
  return (
    <group position={[x, 0, z]} rotation={[0, facing === 1 ? 0 : Math.PI, 0]}>
      <Block size={[0.22, RIM_HEIGHT + 0.6, 0.22]} pos={[0, (RIM_HEIGHT + 0.6) / 2, -1.25]} color={glow ? "#1d1f2b" : STEEL} r={0.06} metal={0.4} />
      <Block size={[0.14, 0.14, 0.9]} pos={[0, RIM_HEIGHT + 0.45, -0.85]} color={glow ? "#1d1f2b" : STEEL} r={0.04} />
      <Block size={[1.8, 1.05, 0.06]} pos={[0, RIM_HEIGHT + 0.4, -0.4]} color={WHITE} r={0.03} />
      {[[0.25, 0.6], [-0.2, 0.6]].map(([y, w], i) => <Block key={i} size={[w, 0.04, 0.07]} pos={[0, RIM_HEIGHT + y, -0.37]} color={glow ?? ORANGE} r={0.01} glow={glow ? 2 : 0} />)}
      {[-0.3, 0.3].map((sx) => <Block key={sx} size={[0.04, 0.45, 0.07]} pos={[sx, RIM_HEIGHT + 0.025, -0.37]} color={glow ?? ORANGE} r={0.01} glow={glow ? 2 : 0} />)}
      <mesh position={[0, RIM_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.23, 0.02, 8, 28]} /><meshStandardMaterial color={glow ?? ORANGE} emissive={glow ?? "#000"} emissiveIntensity={glow ? 2 : 0} metalness={0.4} /></mesh>
      <mesh position={[0, RIM_HEIGHT - 0.22, 0]}><cylinderGeometry args={[0.23, 0.14, 0.42, 14, 3, true]} /><meshStandardMaterial color="#ffffff" wireframe transparent opacity={0.85} /></mesh>
      <Block size={[0.06, 0.06, 0.4]} pos={[0, RIM_HEIGHT, -0.2]} color={glow ?? ORANGE} r={0.01} />
    </group>
  );
}
function Basketball({ pos }: { pos: [number, number, number] }) {
  return <group position={pos}><Ball pos={[0, 0, 0]} r={0.12} color={ORANGE} />{[0, Math.PI / 2].map((r) => <mesh key={r} rotation={[0, r, 0]}><torusGeometry args={[0.121, 0.006, 6, 24]} /><meshStandardMaterial color="#2a1a10" /></mesh>)}</group>;
}
function Floodlight({ x, z, h, night, neon }: { x: number; z: number; h: number; night: boolean; neon: boolean }) {
  const lamp = neon ? NEON_BLUE : "#fff3c4";
  return (
    <group position={[x, 0, z]}>
      <Block size={[0.16, h, 0.16]} pos={[0, h / 2, 0]} color={STEEL} r={0.05} />
      <Block size={[0.9, 0.5, 0.2]} pos={[0, h, 0]} rot={[0.4, x > 0 ? -0.6 : 0.6, 0]} color={STEEL} r={0.05} />
      <Block size={[0.78, 0.38, 0.03]} pos={[0, h, 0.11]} rot={[0.4, x > 0 ? -0.6 : 0.6, 0]} color={lamp} r={0.02} glow={night ? 3 : 0.6} />
      {night ? <pointLight position={[-x * 0.2, h - 0.4, -z * 0.2]} color={lamp} intensity={10} distance={14} /> : null}
    </group>
  );
}
function Stands({ x, rows, length, neon }: { x: number; rows: number; length: number; neon: boolean }) {
  const crowd = ["#ff5e57", "#4c8dff", "#ffe14d", "#ff86b8", "#2fc3b0", "#9a63ff"];
  return (
    <group position={[x, 0, 0]} rotation={[0, x > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
      {Array.from({ length: rows }, (_, r) => <Block key={r} size={[length, 0.4, 0.55]} pos={[0, 0.2 + r * 0.4, -r * 0.5]} color={neon ? (r % 2 ? "#2a2440" : "#3a3060") : r % 2 ? "#d9d6cf" : "#c9ccd4"} r={0.04} />)}
      {Array.from({ length: rows }, (_, r) => Array.from({ length: Math.floor(length / 0.6) }, (_, k) => (k + r) % 3 === 0 ? null : <Ball key={`${r}${k}`} pos={[-length / 2 + 0.3 + k * 0.6, 0.62 + r * 0.4, -r * 0.5]} r={0.16} color={crowd[(r * 3 + k) % crowd.length]} />))}
      {neon ? <Block size={[length, 0.06, 0.06]} pos={[0, 0.42, 0.29]} color={NEON_PINK} r={0.02} glow={2.4} /> : null}
    </group>
  );
}
function Scoreboard({ x, z, neon }: { x: number; z: number; neon: boolean }) {
  const score = useContext(BasketballScoreContext);
  return (
    <group position={[x, 0, z]} rotation={[0, x > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
      {[-0.8, 0.8].map((sx) => <Block key={sx} size={[0.14, 3.2, 0.14]} pos={[sx, 1.6, 0]} color={STEEL} r={0.04} />)}
      <Block size={[2.4, 1.3, 0.25]} pos={[0, 3.6, 0]} color="#14161c" r={0.08} />
      <Block size={[2.5, 0.12, 0.3]} pos={[0, 4.28, 0]} color={neon ? NEON_PINK : ORANGE} r={0.03} glow={neon ? 2 : 0.4} />
      <Html transform position={[0, 3.6, 0.14]} scale={0.32} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ font: "900 64px ui-monospace, monospace", color: neon ? NEON_BLUE : "#ffcf3a", textShadow: `0 0 18px ${neon ? NEON_BLUE : "#ff9d00"}`, letterSpacing: "0.08em", minWidth: 200, textAlign: "center" }}>{String(score).padStart(3, "0")}</div>
      </Html>
    </group>
  );
}

function Level1() {
  // A driveway hoop on a concrete pad.
  return (
    <group>
      <Block size={[6, 0.06, 6]} pos={[0, 0.03, -0.6]} color="#c9c6be" r={0.02} />
      <EndMarkings z={HOOPS[1][0][1]} dir={1} color={WHITE} paint="#d86a3f" />
      <Hoop x={0} z={HOOPS[1][0][1]} facing={1} />
      <Basketball pos={[1.1, 0.2, 0.9]} />
      <Block size={[0.5, 0.4, 0.5]} pos={[-2.3, 0.28, 1.6]} color="#4c8dff" r={0.08} />
      <Basketball pos={[-2.3, 0.6, 1.6]} />
    </group>
  );
}
function Level2() {
  // A painted half court with a bench and a ball rack.
  return (
    <group>
      <CourtFloor w={8} d={8} z={-0.6} colour="#c4553a" line={WHITE} paint="#2f6fb8" ends={[HOOPS[2][0]]} />
      <Hoop x={0} z={HOOPS[2][0][1]} facing={1} />
      <group position={[-4.7, 0, 1.5]} rotation={[0, Math.PI / 2, 0]}><Block size={[2.4, 0.08, 0.5]} pos={[0, 0.5, 0]} color="#c98a52" r={0.03} />{[-1, 1].map((s) => <Block key={s} size={[0.08, 0.5, 0.45]} pos={[s * 1.05, 0.25, 0]} color={STEEL} r={0.02} />)}</group>
      <group position={[4.6, 0, 2]}><Block size={[0.9, 0.08, 0.4]} pos={[0, 0.5, 0]} color={STEEL} r={0.02} />{[-0.3, 0, 0.3].map((x) => <Basketball key={x} pos={[x, 0.66, 0]} />)}</group>
      <Basketball pos={[0.8, 0.2, 1.2]} />
    </group>
  );
}
function Level3({ night }: { night: boolean }) {
  // A full floodlit court with stands and a scoreboard.
  return (
    <group>
      <CourtFloor w={8} d={13} colour="#2f6fb8" line={WHITE} paint="#c4553a" ends={HOOPS[3]} />
      {HOOPS[3].map(([x, z]) => <Hoop key={z} x={x} z={z} facing={z < 0 ? 1 : -1} />)}
      {[[-4.9, -6.6], [4.9, -6.6], [-4.9, 6.6], [4.9, 6.6]].map(([x, z]) => <Floodlight key={`${x}${z}`} x={x} z={z} h={6} night={night} neon={false} />)}
      <Stands x={-5.2} rows={3} length={9} neon={false} />
      <Scoreboard x={5.4} z={0} neon={false} />
      <Basketball pos={[0.6, 0.2, 0.8]} />
    </group>
  );
}
function Level4({ night }: { night: boolean }) {
  // The neon arena: glowing lines and rims, stands both sides, an overhead light rig.
  return (
    <group>
      <CourtFloor w={8} d={13} colour="#241c45" line={NEON_BLUE} paint="#3a1d5c" ends={HOOPS[4]} />
      {HOOPS[4].map(([x, z]) => <Hoop key={z} x={x} z={z} facing={z < 0 ? 1 : -1} glow={NEON_PINK} />)}
      <Stands x={-5.2} rows={4} length={10} neon />
      <Stands x={5.2} rows={4} length={10} neon />
      <Scoreboard x={0.01} z={-7.4} neon />
      {[-6.6, 6.6].map((z) => [-4.4, 4.4].map((x) => <group key={`${x}${z}`}><Block size={[0.12, 7.2, 0.12]} pos={[x, 3.6, z]} color="#1d1f2b" r={0.04} /><Block size={[0.04, 6.8, 0.04]} pos={[x, 3.6, z + (z < 0 ? 0.08 : -0.08)]} color={NEON_BLUE} r={0.01} glow={2} /></group>))}
      {[-6.6, 6.6].map((z) => <group key={z}><Block size={[9, 0.14, 0.14]} pos={[0, 7.2, z]} color="#1d1f2b" r={0.04} /><Block size={[8.8, 0.04, 0.04]} pos={[0, 7.1, z]} color={NEON_PINK} r={0.01} glow={2} /></group>)}
      {[-4.4, 4.4].map((x) => <group key={x}><Block size={[0.14, 0.14, 13.5]} pos={[x, 7.2, 0]} color="#1d1f2b" r={0.04} /><Block size={[0.04, 0.04, 13.2]} pos={[x, 7.1, 0]} color={NEON_PINK} r={0.01} glow={2} /></group>)}
      {[-4.4, 4.4].flatMap((x) => [-3, 0, 3].map((z) => <Block key={`${x}${z}`} size={[0.4, 0.25, 0.4]} pos={[x, 6.95, z]} color={z === 0 ? NEON_PINK : NEON_BLUE} r={0.05} glow={night ? 3 : 1.2} />))}
      {night ? <pointLight position={[0, 6.5, 0]} color={NEON_PINK} intensity={14} distance={16} /> : null}
      <Sparkles count={60} scale={[8, 5, 12]} position={[0, 4, 0]} size={6} speed={0.5} color={NEON_BLUE} />
      <Basketball pos={[0.6, 0.2, 0.8]} />
    </group>
  );
}

/** The court at a level, centred on its plot. */
export function BasketballCourt({ level, night = false }: { level: PremiumHomeLevel; night?: boolean }) {
  if (level === 1) return <Level1 />;
  if (level === 2) return <Level2 />;
  if (level === 3) return <Level3 night={night} />;
  return <Level4 night={night} />;
}
