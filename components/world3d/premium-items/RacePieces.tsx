"use client";
// Race Kit pieces and the painted tarmac track. Pieces are modelled in build cells (one unit = one 2 m cell)
// and scaled to world metres. Kerbs line the track from kit Level 2; at Level 4 everything goes neon.
import { useFrame } from "@react-three/fiber";
import { createContext, useContext, useMemo, useRef } from "react";
import type { Group, Mesh } from "three";
import { Ball, Block, C, M, Mat } from "@/components/world3d/premium-homes/HomeKit";
import type { KitLevel } from "@/lib/world3d/build-kits";
import { RACE_SCALE } from "@/lib/world3d/race-kit";
import { CENTRAL_WORLD_GRID, gridToWorld, type CentralWorldGroundTile } from "@/lib/world3d/central-world-layout";

const NEON_PINK = "#ff4fd8";
const NEON_BLUE = "#3fd0ff";

/** Race Kit level and time of day, read by the track and every race piece. */
export const RaceKitWorldContext = createContext<{ level: KitLevel; night: boolean }>({ level: 1, night: false });

function Glowing({ color, night, day = 0.6 }: { color: string; night: boolean; day?: number }) {
  return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={night ? 2.6 : day} roughness={0.4} />;
}
function StartLine({ w = 1, night, neon = false }: { w?: number; night: boolean; neon?: boolean }) {
  return (
    <group>
      {/* The gantry clears a kart with the explorer in it (about 3.6 m in the hub). */}
      {[-1, 1].map((s) => <Block key={s} size={[0.1, 1.8, 0.1]} pos={[s * (w / 2 + 0.15), 0.9, 0]} color={M.charcoal} r={0.03} />)}
      <Block size={[w + 0.5, 0.24, 0.12]} pos={[0, 1.8, 0]} color="#16181f" r={0.03} />
      {Array.from({ length: 5 }, (_, i) => <Ball key={i} pos={[-0.3 + i * 0.15, 1.8, 0.07]} r={0.04} color={i < 3 ? C.red : "#3dff6a"} glow={night ? 3 : 1} />)}
      {Array.from({ length: 10 }, (_, i) => <Block key={`c${i}`} size={[w / 10, 0.01, 0.1]} pos={[-w / 2 + (i + 0.5) * (w / 10), 0.09, (i % 2) * 0.1 - 0.05]} color={i % 2 ? C.white : "#111"} r={0.002} />)}
      {neon ? <mesh position={[0, 1.95, 0]}><boxGeometry args={[w + 0.5, 0.04, 0.04]} /><Glowing color={NEON_PINK} night={night} /></mesh> : null}
    </group>
  );
}
function TyreStack({ n = 4 }: { n?: number }) {
  return <group>{Array.from({ length: n }, (_, i) => [0, 1].map((r) => <mesh key={`${i}${r}`} position={[(i - (n - 1) / 2) * 0.22, 0.07 + r * 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.09, 0.04, 8, 14]} /><Mat color={r ? C.white : "#1a1a1a"} /></mesh>))}</group>;
}
function MiniGrandstand({ w = 1.6, rows = 3, roof = C.red }: { w?: number; rows?: number; roof?: string }) {
  return <group>{Array.from({ length: rows }, (_, r) => <Block key={r} size={[w, 0.2, 0.3]} pos={[0, 0.1 + r * 0.2, -r * 0.28]} color={r % 2 ? C.white : "#c9ccd4"} r={0.03} />)}{Array.from({ length: rows }, (_, r) => Array.from({ length: Math.round(w / 0.3) }, (_, k) => <Ball key={`${r}${k}`} pos={[-w / 2 + 0.15 + k * 0.3, 0.28 + r * 0.2, -r * 0.28]} r={0.055} color={[C.red, C.blue, C.yellow, C.pink, C.teal][(r + k) % 5]} />))}<Block size={[w + 0.2, 0.06, rows * 0.3 + 0.2]} pos={[0, rows * 0.2 + 0.6, -(rows - 1) * 0.14]} color={roof} r={0.02} />{[-1, 1].map((s) => <Block key={s} size={[0.05, rows * 0.2 + 0.6, 0.05]} pos={[s * w / 2, (rows * 0.2 + 0.6) / 2, -(rows - 1) * 0.28]} color={M.charcoal} r={0.015} />)}</group>;
}
function JumpRamp({ color = C.yellow }: { color?: string }) {
  return <group><Block size={[0.9, 0.06, 0.8]} pos={[0, 0.16, 0]} rot={[-0.35, 0, 0]} color={color} r={0.02} />{[-1, 1].map((s) => <Block key={s} size={[0.05, 0.28, 0.7]} pos={[s * 0.43, 0.13, 0]} color={M.charcoal} r={0.02} />)}{Array.from({ length: 3 }, (_, i) => <Block key={i} size={[0.7, 0.005, 0.06]} pos={[0, 0.21 - i * 0.07 + 0.01, -0.2 + i * 0.2]} rot={[-0.35, 0, 0]} color="#222" r={0.002} />)}</group>;
}
function BoostPad({ night }: { night: boolean }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.children.forEach((c, i) => { const m = (c as Mesh).material as { emissiveIntensity?: number }; if (m) m.emissiveIntensity = (night ? 2 : 0.8) + Math.sin(clock.elapsedTime * 6 - i) * 0.9; }); });
  return <group><Block size={[0.8, 0.03, 0.8]} pos={[0, 0.095, 0]} color="#1a1c22" r={0.01} /><group ref={ref}>{[0, 1, 2].map((i) => <mesh key={i} position={[0, 0.115, -0.22 + i * 0.22]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}><planeGeometry args={[0.32, 0.08]} /><meshStandardMaterial color={NEON_BLUE} emissive={NEON_BLUE} emissiveIntensity={1} /></mesh>)}</group></group>;
}
function TrackBridge({ len = 3, h = 0.9, night, neon = false }: { len?: number; h?: number; night: boolean; neon?: boolean }) {
  const n = 12;
  return <group>{Array.from({ length: n }, (_, i) => { const t = i / (n - 1), y = Math.sin(t * Math.PI) * h, z = -len / 2 + t * len; const slope = Math.cos(t * Math.PI) * Math.PI * h / len; return <group key={i}><Block size={[1, 0.08, len / n + 0.05]} pos={[0, y + 0.08, z]} rot={[-Math.atan(slope), 0, 0]} color={neon ? "#241c45" : "#3a3f4a"} r={0.02} />{[-0.52, 0.52].map((x) => <Block key={x} size={[0.05, 0.16, len / n + 0.05]} pos={[x, y + 0.18, z]} rot={[-Math.atan(slope), 0, 0]} color={neon ? NEON_PINK : C.white} r={0.015} glow={neon && night ? 2 : 0} />)}{y > 0.25 ? <Block size={[0.14, y, 0.14]} pos={[0, y / 2, z]} color={C.stone} r={0.03} /> : null}</group>; })}</group>;
}
function Floodlight({ h = 2.6, night, color = "#fff3c4" }: { h?: number; night: boolean; color?: string }) {
  return <group><Block size={[0.1, h, 0.1]} pos={[0, h / 2, 0]} color={M.charcoal} r={0.03} /><Block size={[0.44, 0.18, 0.22]} pos={[0, h, 0]} color={M.charcoal} r={0.04} /><Block size={[0.36, 0.12, 0.03]} pos={[0, h - 0.02, 0.11]} color={color} r={0.015} glow={night ? 3 : 0.3} />{night ? <pointLight position={[0, h - 0.2, 0.4]} color={color} intensity={2.5} distance={4} /> : null}</group>;
}
function Podium() {
  return <group>{[[0, 0.42, C.gold], [-0.38, 0.3, "#c9ccd4"], [0.38, 0.2, "#c46a4f"]].map(([x, h, col], i) => <group key={i}><Block size={[0.36, h as number, 0.36]} pos={[x as number, (h as number) / 2, 0]} color={C.white} r={0.03} /><Block size={[0.2, 0.12, 0.02]} pos={[x as number, (h as number) - 0.12, 0.19]} color={col as string} r={0.03} /></group>)}<group position={[0, 0.42, 0]}><mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.09, 0.05, 0.16, 14]} /><Mat color={C.gold} metal={0.6} rough={0.25} /></mesh><Block size={[0.06, 0.06, 0.06]} pos={[0, 0.03, 0]} color={C.gold} r={0.02} /></group></group>;
}

/** A placed Race Kit piece at world scale. */
export function PlacedRacePiece({ assetKey }: { assetKey: string }) {
  const { level, night } = useContext(RaceKitWorldContext);
  const neon = level >= 4;
  const piece = (() => {
    switch (assetKey) {
      case "race_start": return <StartLine w={3} night={night} neon={neon} />;
      case "race_tyres": return <TyreStack n={8} />;
      case "race_grandstand": return <group position={[0, 0, 0.4]}><MiniGrandstand w={3.6} rows={4} roof={neon ? C.purple : C.red} /></group>;
      case "race_jump": return <JumpRamp color={neon ? NEON_PINK : C.yellow} />;
      case "race_boost": return <BoostPad night={night} />;
      case "race_bridge": return <TrackBridge len={3.6} h={0.9} night={night} neon={neon} />;
      case "race_floodlight": return <Floodlight night={night} color={neon ? NEON_BLUE : "#fff3c4"} />;
      case "race_podium": return <Podium />;
      default: return null;
    }
  })();
  return piece ? <group scale={RACE_SCALE}>{piece}</group> : null;
}

/** Painted tarmac: one slab per cell, white dashes, red-and-white kerbs on open edges from Level 2, neon edges at Level 4. */
export function RaceTrackTiles({ tiles }: { tiles: CentralWorldGroundTile[] }) {
  const { level, night } = useContext(RaceKitWorldContext);
  const cell = CENTRAL_WORLD_GRID.cellSize;
  const neon = level >= 4, kerbs = level >= 2;
  const track = useMemo(() => tiles.filter((tile) => tile.tileType === "track"), [tiles]);
  const occupied = useMemo(() => new Set(track.map((tile) => `${tile.gridX}:${tile.gridZ}`)), [track]);
  return (
    <group>
      {track.map((tile) => {
        const [x, , z] = gridToWorld(tile.gridX, tile.gridZ);
        const edges = ([[1, 0], [-1, 0], [0, 1], [0, -1]] as const).filter(([dx, dz]) => !occupied.has(`${tile.gridX + dx}:${tile.gridZ + dz}`));
        return (
          <group key={`${tile.gridX}:${tile.gridZ}`} position={[x, 0, z]}>
            <Block size={[cell + 0.02, 0.1, cell + 0.02]} pos={[0, 0.07, 0]} color={neon ? "#241c45" : "#3a3f4a"} r={0.02} rough={0.85} />
            {(tile.gridX + tile.gridZ) % 2 === 0 ? <Block size={[0.12, 0.01, cell * 0.4]} pos={[0, 0.125, 0]} color={neon ? NEON_BLUE : "#e9e9e9"} r={0.004} glow={neon && night ? 2 : 0} /> : null}
            {edges.map(([dx, dz], i) => neon
              ? <mesh key={i} position={[dx * cell * 0.5, 0.15, dz * cell * 0.5]}><boxGeometry args={[dx ? 0.12 : cell, 0.1, dz ? 0.12 : cell]} /><Glowing color={i % 2 ? NEON_PINK : NEON_BLUE} night={night} /></mesh>
              : kerbs ? <Block key={i} size={[dx ? 0.2 : cell, 0.12, dz ? 0.2 : cell]} pos={[dx * cell * 0.5, 0.12, dz * cell * 0.5]} color={(tile.gridX + tile.gridZ + i) % 2 ? C.red : C.white} r={0.03} /> : null)}
          </group>
        );
      })}
    </group>
  );
}
