"use client";
// Roads & Cars: painted roads that draw their own kerbs and lines, four cars to drive, and a carport
// to park in. Units are world metres (the explorer stands about 2 m tall); cars face +x.
import { createContext, useContext, useLayoutEffect, useMemo, useRef } from "react";
import { DoubleSide, Object3D, type InstancedMesh } from "three";
import { KERB_INSET, roadPieces } from "@/lib/world3d/roads";
import { Ball, Block, Mat } from "@/components/world3d/premium-homes/HomeKit";
import type { CentralWorldGroundTile } from "@/lib/world3d/central-world-layout";
import type { CarStyle } from "@/lib/world3d/cars";
import { Glow, LightPool, WARM } from "./ItemKit";

type V3 = [number, number, number];
const TYRE = "#1b1d21", RIM = "#c9ced6", GLASS = "#20344a", KERB = "#d6d2c8", ASPHALT = "#34383f", LINE = "#f4f1e8", CENTRE = "#ffcc33";

/* ───────── Roads ───────── */
/** One instanced mesh of boxes: every kerb (or line, or square) is a single draw call. */
function Strips({ items, size, y, color, rough = 0.9 }: { items: ReadonlyArray<{ x: number; z: number; alongX?: boolean }>; size: V3; y: number; color: string; rough?: number }) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const place = new Object3D();
    items.forEach((item, i) => {
      place.position.set(item.x, y, item.z);
      place.rotation.set(0, item.alongX === false ? Math.PI / 2 : 0, 0);
      place.updateMatrix();
      mesh.setMatrixAt(i, place.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items, y]);
  if (!items.length) return null;
  return <instancedMesh key={items.length} ref={ref} args={[undefined, undefined, items.length]} receiveShadow castShadow={size[1] > 0.05}><boxGeometry args={size} /><Mat color={color} rough={rough} /></instancedMesh>;
}
/** Every painted road square, with kerbs where it meets anything else and a dashed centre line down two-lane roads. */
export function RoadNetwork({ tiles, cell = 2, night }: { tiles: readonly CentralWorldGroundTile[]; cell?: number; night: boolean }) {
  const pieces = useMemo(() => roadPieces(tiles, cell), [tiles, cell]);
  const pools = useMemo(() => pieces.squares.filter((_, i) => i % 6 === 0), [pieces]);
  return (
    <group>
      <Strips items={pieces.squares} size={[cell + 0.02, 0.1, cell + 0.02]} y={0.06} color={ASPHALT} rough={0.92} />
      <Strips items={pieces.kerbs} size={[cell, 0.16, KERB_INSET * 2]} y={0.1} color={KERB} />
      <Strips items={pieces.edgeLines} size={[cell, 0.006, 0.08]} y={0.113} color={LINE} />
      <Strips items={pieces.dashes} size={[cell * 0.32, 0.006, 0.1]} y={0.113} color={CENTRE} />
      {night ? pools.map((square) => <LightPool key={`${square.x}:${square.z}`} r={1.6} color={WARM} night pos={[square.x, 0, square.z]} />) : null}
    </group>
  );
}

/* ───────── Cars ───────── */
function Wheel({ pos, r = 0.42, w = 0.3, chunky = false }: { pos: V3; r?: number; w?: number; chunky?: boolean }) {
  return (
    <group position={pos} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow><cylinderGeometry args={[r, r, w, 22]} /><Mat color={TYRE} rough={0.9} /></mesh>
      <mesh><cylinderGeometry args={[r * 0.55, r * 0.55, w + 0.02, 14]} /><Mat color={RIM} metal={0.7} rough={0.3} /></mesh>
      {chunky ? Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return <Block key={i} size={[0.12, w + 0.02, 0.08]} pos={[Math.cos(a) * r, 0, Math.sin(a) * r]} rot={[0, -a, 0]} color={TYRE} r={0.02} />; }) : null}
    </group>
  );
}
/** Headlights, tail lights and (after dark) a pool of light on the road ahead. */
function CarLights({ front, back, y, half, night }: { front: number; back: number; y: number; half: number; night: boolean }) {
  return (
    <group>
      {[-1, 1].map((s) => <Glow key={`h${s}`} size={[0.05, 0.16, 0.34]} pos={[front, y, s * half]} color="#fff7d6" night={night} />)}
      {[-1, 1].map((s) => <Glow key={`t${s}`} size={[0.05, 0.14, 0.3]} pos={[back, y, s * half]} color="#ff3b30" night={night} />)}
      {night ? <LightPool r={2.6} color="#fff2c4" night pos={[front + 2.6, 0, 0]} /> : null}
    </group>
  );
}
function Windows({ size, pos, rot }: { size: V3; pos: V3; rot?: V3 }) {
  return <Block size={size} pos={pos} rot={rot} color={GLASS} r={0.06} rough={0.15} metal={0.3} />;
}

/** City Hatch: a bright little hatchback. */
function Hatchback({ color, night }: { color: string; night: boolean }) {
  return (
    <group>
      <Block size={[3.8, 0.75, 1.8]} pos={[0, 0.7, 0]} color={color} r={0.28} />
      <Block size={[2.3, 0.72, 1.62]} pos={[-0.25, 1.38, 0]} color={color} r={0.3} />
      <Windows size={[2.0, 0.5, 1.66]} pos={[-0.25, 1.4, 0]} />
      <Windows size={[0.06, 0.62, 1.5]} pos={[0.86, 1.36, 0]} rot={[0, 0, 0.5]} />
      <Block size={[3.84, 0.22, 1.84]} pos={[0, 0.42, 0]} color="#2a2d33" r={0.1} />
      {[[1.25, 1], [1.25, -1], [-1.25, 1], [-1.25, -1]].map(([x, z], i) => <Wheel key={i} pos={[x, 0.42, z * 0.82]} />)}
      <CarLights front={1.91} back={-1.91} y={0.82} half={0.6} night={night} />
    </group>
  );
}
/** Aussie Ute: a cab and a tray, roo bar up front and a surfboard in the back. */
function Ute({ color, night }: { color: string; night: boolean }) {
  return (
    <group>
      <Block size={[4.8, 0.8, 1.95]} pos={[0, 0.78, 0]} color={color} r={0.22} />
      <Block size={[1.9, 0.85, 1.85]} pos={[0.55, 1.55, 0]} color={color} r={0.26} />
      <Windows size={[1.6, 0.58, 1.89]} pos={[0.55, 1.58, 0]} />
      {/* The open tray. */}
      <Block size={[2.1, 0.08, 1.75]} pos={[-1.25, 1.22, 0]} color="#2a2d33" r={0.02} />
      {[-1, 1].map((s) => <Block key={s} size={[2.2, 0.32, 0.1]} pos={[-1.2, 1.36, s * 0.9]} color={color} r={0.04} />)}
      <Block size={[0.1, 0.32, 1.9]} pos={[-2.3, 1.36, 0]} color={color} r={0.04} />
      <group position={[-1.2, 1.5, 0.15]} rotation={[0, 0, 0.12]}><Block size={[2.4, 0.08, 0.55]} pos={[0, 0, 0]} color="#ffd166" r={0.04} /><Block size={[2.2, 0.085, 0.08]} pos={[0, 0, 0]} color="#ef476f" r={0.02} /></group>
      {/* Roo bar. */}
      <Block size={[0.12, 0.7, 1.7]} pos={[2.48, 0.85, 0]} color="#8a96a3" r={0.04} metal={0.6} />
      {[-0.5, 0.5].map((z) => <Block key={z} size={[0.1, 0.1, 0.1]} pos={[2.46, 1.24, z]} color="#8a96a3" r={0.03} metal={0.6} />)}
      <Block size={[4.84, 0.24, 1.99]} pos={[0, 0.46, 0]} color="#2a2d33" r={0.1} />
      {[[1.55, 1], [1.55, -1], [-1.55, 1], [-1.55, -1]].map(([x, z], i) => <Wheel key={i} pos={[x, 0.45, z * 0.88]} r={0.45} />)}
      <CarLights front={2.41} back={-2.41} y={0.9} half={0.66} night={night} />
    </group>
  );
}
/** Adventure 4WD: tall and boxy, chunky tyres, a roof rack with a kayak and a spare wheel on the back. */
function FourWheelDrive({ color, night }: { color: string; night: boolean }) {
  return (
    <group>
      <Block size={[4.4, 1.0, 2.0]} pos={[0, 0.95, 0]} color={color} r={0.2} />
      <Block size={[3.2, 0.9, 1.92]} pos={[-0.35, 1.85, 0]} color={color} r={0.18} />
      <Windows size={[2.9, 0.6, 1.96]} pos={[-0.35, 1.9, 0]} />
      <Windows size={[0.06, 0.62, 1.7]} pos={[1.24, 1.88, 0]} rot={[0, 0, 0.2]} />
      {/* Roof rack with a kayak. */}
      {[-1.4, -0.35, 0.7].map((x) => <Block key={x} size={[0.08, 0.08, 1.9]} pos={[x, 2.36, 0]} color="#2a2d33" r={0.02} />)}
      <mesh position={[-0.35, 2.55, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.42]} castShadow><capsuleGeometry args={[0.3, 2.8, 6, 16]} /><Mat color="#ff7a1a" /></mesh>
      {/* Spare wheel on the back door. */}
      <group position={[-2.3, 1.15, 0]} rotation={[0, 0, Math.PI / 2]}><Wheel pos={[0, 0, 0]} r={0.42} w={0.28} chunky /></group>
      <Block size={[4.44, 0.3, 2.04]} pos={[0, 0.52, 0]} color="#2a2d33" r={0.1} />
      {[[1.4, 1], [1.4, -1], [-1.4, 1], [-1.4, -1]].map(([x, z], i) => <Wheel key={i} pos={[x, 0.5, z * 0.9]} r={0.52} w={0.38} chunky />)}
      <CarLights front={2.21} back={-2.21} y={1.1} half={0.7} night={night} />
    </group>
  );
}
/** Volt GT: a low electric sports car with a spoiler and neon underglow. */
function SportsCar({ color, night }: { color: string; night: boolean }) {
  return (
    <group>
      <Block size={[4.6, 0.55, 1.95]} pos={[0, 0.55, 0]} color={color} r={0.25} />
      <mesh position={[1.25, 0.82, 0]} rotation={[0, 0, -0.16]} castShadow><boxGeometry args={[2.0, 0.12, 1.85]} /><Mat color={color} rough={0.3} metal={0.3} /></mesh>
      <Block size={[2.0, 0.55, 1.7]} pos={[-0.35, 1.05, 0]} color={color} r={0.26} />
      <Windows size={[1.9, 0.42, 1.74]} pos={[-0.3, 1.08, 0]} />
      <Windows size={[0.06, 0.5, 1.5]} pos={[0.6, 1.02, 0]} rot={[0, 0, 0.9]} />
      {/* Rear spoiler. */}
      {[-0.6, 0.6].map((z) => <Block key={z} size={[0.1, 0.32, 0.08]} pos={[-2.05, 0.98, z]} color="#16131f" r={0.02} />)}
      <Block size={[0.5, 0.06, 1.9]} pos={[-2.1, 1.16, 0]} color="#16131f" r={0.02} />
      <Block size={[4.62, 0.12, 1.97]} pos={[0, 0.3, 0]} color="#16131f" r={0.05} />
      {/* Neon underglow. */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[4.2, 1.7]} /><meshBasicMaterial color="#3fe6ff" transparent opacity={night ? 0.55 : 0.25} toneMapped={false} side={DoubleSide} depthWrite={false} /></mesh>
      <Glow size={[4.3, 0.04, 0.04]} pos={[0, 0.28, 0.99]} color="#3fe6ff" night={night} />
      <Glow size={[4.3, 0.04, 0.04]} pos={[0, 0.28, -0.99]} color="#3fe6ff" night={night} />
      {[[1.45, 1], [1.45, -1], [-1.45, 1], [-1.45, -1]].map(([x, z], i) => <Wheel key={i} pos={[x, 0.38, z * 0.86]} r={0.38} w={0.32} />)}
      <CarLights front={2.31} back={-2.31} y={0.62} half={0.7} night={night} />
    </group>
  );
}

export const CAR_MODELS = { hatch: Hatchback, ute: Ute, four_wd: FourWheelDrive, sports: SportsCar } as const satisfies Record<CarStyle, unknown>;
export function Car({ style, colour, night }: { style: CarStyle; colour: string; night: boolean }) {
  const Model = CAR_MODELS[style];
  return <Model color={colour} night={night} />;
}

/** What a placed carport shows: the learner's car parked under it, unless they're out driving it. */
export const CarWorldContext = createContext<{ style: CarStyle | null; colour: string; night: boolean; driving: boolean }>({ style: null, colour: "#ff5e57", night: false, driving: false });
export function PlacedCarport() {
  const { style, colour, night, driving } = useContext(CarWorldContext);
  return <Carport night={night}>{style && !driving ? <group position={[0, 0.09, 0]}><Car style={style} colour={colour} night={night} /></group> : null}</Carport>;
}

/* ───────── Carport ───────── */
/** A driveway and carport: walk up, tap DRIVE. The car parked here is the one you drive. */
export function Carport({ night, children }: { night: boolean; children?: React.ReactNode }) {
  return (
    <group>
      {/* Sized to its 3 x 2 squares (6 x 4 m). */}
      <Block size={[5.9, 0.08, 3.8]} pos={[0, 0.05, 0]} color="#c9c5bb" r={0.02} rough={0.95} />
      {[-1, 1].flatMap((x) => [-1, 1].map((z) => <Block key={`${x}${z}`} size={[0.14, 2.7, 0.14]} pos={[x * 2.7, 1.35, z * 1.7]} color="#2c3440" r={0.03} />))}
      <Block size={[5.96, 0.14, 3.96]} pos={[0, 2.75, 0]} color="#e8e2d4" r={0.04} />
      <Glow size={[0.5, 0.05, 0.5]} pos={[0, 2.66, 0]} color={WARM} night={night} />
      {night ? <LightPool r={2.4} color={WARM} night /> : null}
      <Ball pos={[2.7, 1.2, 1.79]} r={0.08} color="#44ff9a" glow={night ? 3 : 1} />
      {children}
    </group>
  );
}
