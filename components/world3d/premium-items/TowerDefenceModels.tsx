"use client";
// Protect the Tower: modern security tech, four levels each. Laser fence (joins up like a wall),
// laser gate, scanner tower, trip wire alarm, drone pad, robo guard dogs, patrol drone, sentry bot,
// and the Tower Shield over the real Tower. Units are world metres (the explorer is about 2 tall).
import { useFrame } from "@react-three/fiber";
import { createContext, useContext, useEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import { AdditiveBlending, BufferGeometry, DoubleSide, Float32BufferAttribute, Quaternion, Vector3, type Group, type Mesh, type MeshBasicMaterial } from "three";
import { Block } from "@/components/world3d/premium-homes/HomeKit";
import { defenceSounds } from "@/lib/audio/defence-sfx";
import { DEFENCE_REACT_DISTANCE, insideTripWire } from "@/lib/world3d/tower-defence";

export type TechLevel = 1 | 2 | 3 | 4;
const RED = "#ff3b4e", CYAN = "#3fe6ff", PINK = "#ff4fd8", GREEN = "#4dff8a", AMBER = "#ffb02e";
const UP = new Vector3(0, 1, 0), FORWARD = new Vector3(0, 0, 1);
/** The explorer's ground position in the hub, so defences can react to them (absent in previews). */
export const ExplorerPositionContext = createContext<MutableRefObject<{ x: number; z: number }> | null>(null);
type Nearby = { x: number; z: number; dist: number; near: boolean; entered: boolean };
const scratch = new Vector3();
/** Where the explorer is in this group's own space, refreshed every frame, and whether they're within `radius` metres. */
export function useExplorer(radius: number) {
  const explorer = useContext(ExplorerPositionContext);
  const group = useRef<Group>(null);
  const state = useRef<Nearby>({ x: 0, z: 0, dist: Infinity, near: false, entered: false });
  useFrame(() => {
    const s = state.current;
    s.entered = false;
    if (!explorer || !group.current) { s.near = false; return; }
    const origin = group.current.getWorldPosition(scratch);
    // Nearness is in world metres, however big the item is drawn; direction is in the item's own space.
    const worldDistance = Math.hypot(explorer.current.x - origin.x, explorer.current.z - origin.z);
    group.current.worldToLocal(scratch.set(explorer.current.x, origin.y, explorer.current.z));
    s.x = scratch.x; s.z = scratch.z; s.dist = Math.hypot(scratch.x, scratch.z);
    const near = worldDistance < radius;
    s.entered = near && !s.near;
    s.near = near;
  });
  return { group, state };
}
/** Turns an angle smoothly towards a target, the short way round. */
function turnTowards(current: number, target: number, step: number) {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + diff * Math.min(1, step);
}
const METAL = "#2e3440", METAL_LIGHT = "#8b94a6", WHITE = "#eef1f6";

/** A laser: a bright core with a soft glow round it. Bright without bloom. */
function Laser({ from, to, color, width = 0.03, pulse = 0 }: { from: [number, number, number]; to: [number, number, number]; color: string; width?: number; pulse?: number }) {
  const glow = useRef<MeshBasicMaterial>(null);
  useFrame(({ clock }) => { if (glow.current && pulse) glow.current.opacity = 0.25 + Math.sin(clock.elapsedTime * pulse) * 0.12; });
  const dx = to[0] - from[0], dy = to[1] - from[1], dz = to[2] - from[2];
  const len = Math.hypot(dx, dy, dz);
  const mid: [number, number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  // Cylinders run along y; turn them to point from -> to.
  const turn = new Quaternion().setFromUnitVectors(UP, new Vector3(dx, dy, dz).normalize());
  return (
    <group position={mid} quaternion={turn}>
      <mesh><cylinderGeometry args={[width, width, len, 8]} /><meshBasicMaterial color={WHITE} toneMapped={false} /></mesh>
      <mesh><cylinderGeometry args={[width * 3, width * 3, len, 10]} /><meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.85} /></mesh>
      <mesh><cylinderGeometry args={[width * 7, width * 7, len, 12]} /><meshBasicMaterial ref={glow} color={color} toneMapped={false} transparent opacity={0.25} blending={AdditiveBlending} depthWrite={false} /></mesh>
    </group>
  );
}
function Lamp({ pos, color, r = 0.06 }: { pos: [number, number, number]; color: string; r?: number }) {
  return <mesh position={pos}><sphereGeometry args={[r, 16, 12]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>;
}
/** A see-through light cone (searchlights, sirens, drone spotlights). */
function Cone({ length, radius, color, opacity = 0.18 }: { length: number; radius: number; color: string; opacity?: number }) {
  return <mesh position={[0, -length / 2, 0]}><coneGeometry args={[radius, length, 24, 1, true]} /><meshBasicMaterial color={color} transparent opacity={opacity} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} toneMapped={false} /></mesh>;
}
function Spin({ speed, axis = "y", children }: { speed: number; axis?: "x" | "y" | "z"; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame((_, d) => { if (ref.current) ref.current.rotation[axis] += d * speed; });
  return <group ref={ref}>{children}</group>;
}
function Bob({ amount = 0.12, speed = 2, phase = 0, children }: { amount?: number; speed?: number; phase?: number; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * speed + phase) * amount; });
  return <group ref={ref}>{children}</group>;
}
function Pulse({ color, children, min = 0.25, max = 0.6, speed = 3 }: { color: string; children: (m: ReactNode) => ReactNode; min?: number; max?: number; speed?: number }) {
  const ref = useRef<MeshBasicMaterial>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.opacity = min + (Math.sin(clock.elapsedTime * speed) * 0.5 + 0.5) * (max - min); });
  return <>{children(<meshBasicMaterial ref={ref} color={color} transparent opacity={max} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} toneMapped={false} />)}</>;
}

/* ───────── 1 · Laser fence ───────── */
function FencePost({ h, level, color }: { h: number; level: TechLevel; color: string }) {
  return (
    <group>
      <Block size={[0.8, 0.18, 0.8]} pos={[0, 0.09, 0]} color={METAL} r={0.05} />
      <Block size={[0.34, h, 0.34]} pos={[0, h / 2, 0]} color={level >= 3 ? WHITE : METAL_LIGHT} r={0.07} metal={0.5} rough={0.35} />
      <Block size={[0.46, 0.18, 0.46]} pos={[0, h + 0.09, 0]} color={METAL} r={0.05} />
      {level >= 2 ? <Lamp pos={[0, h + 0.26, 0]} color={color} r={0.13} /> : null}
      {level >= 4 ? <group position={[0, h * 0.55, 0]}><Spin speed={2}><mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.36, 0.035, 8, 32]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh></Spin></group> : null}
    </group>
  );
}
function SweepBeam({ h, color, from, to }: { h: number; color: string; from: number; to: number }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.position.y = 0.25 + (Math.sin(clock.elapsedTime * 1.6) * 0.5 + 0.5) * (h - 0.4); });
  return <group ref={ref}><Laser from={[from, 0, 0]} to={[to, 0, 0]} color={color} width={0.04} /></group>;
}
const FENCE_HEIGHT: Record<TechLevel, number> = { 1: 2.2, 2: 2.8, 3: 3.4, 4: 4.0 };
/** One cell of laser fence: a post, with beams running half a cell towards each joined neighbour
 * (the neighbour's beams meet them), like the old castle wall. */
export function LaserFenceRun({ level, directions }: { level: TechLevel; directions: readonly (readonly [number, number])[] }) {
  const h = FENCE_HEIGHT[level], beams = level + 1, half = 1;
  const colors = level <= 2 ? [RED] : level === 3 ? [CYAN] : [PINK, CYAN];
  return (
    <group>
      <FencePost h={h} level={level} color={colors[0]} />
      {directions.map(([x, z]) => (
        <group key={`${x}:${z}`} rotation={[0, Math.atan2(-z, x), 0]}>
          {Array.from({ length: beams }, (_, i) => {
            const y = 0.3 + (i * (h - 0.45)) / Math.max(1, beams - 1);
            return <Laser key={i} from={[0.17, y, 0]} to={[half, y, 0]} color={colors[i % colors.length]} width={0.045} pulse={level >= 3 ? 4 + i : 0} />;
          })}
          {level >= 3 ? <Pulse color={level === 4 ? PINK : CYAN} min={0.04} max={0.12}>{(m) => <mesh position={[half / 2 + 0.05, h / 2 + 0.1, 0]} rotation={[0, 0, 0]}><planeGeometry args={[half - 0.1, h - 0.2]} />{m}</mesh>}</Pulse> : null}
          {level === 4 ? <SweepBeam h={h} color={WHITE} from={0.11} to={half} /> : null}
        </group>
      ))}
    </group>
  );
}
/** A short straight run, for previews and shop pictures. */
export function LaserFence({ level }: { level: TechLevel }) {
  return <group>{[-2, 0, 2].map((x, i) => <group key={x} position={[x, 0, 0]}><LaserFenceRun level={level} directions={i === 0 ? [[1, 0]] : i === 2 ? [[-1, 0]] : [[1, 0], [-1, 0]]} /></group>)}</group>;
}

/* ───────── 2 · Trip wire ───────── */
function Bollard({ led, h = 0.5 }: { led: string; h?: number }) {
  return <group><Block size={[0.26, h, 0.26]} pos={[0, h / 2, 0]} color={METAL} r={0.06} /><Block size={[0.28, 0.06, 0.28]} pos={[0, h * 0.7, 0]} color={AMBER} r={0.02} /><Lamp pos={[0, h + 0.03, 0]} color={led} r={0.05} /></group>;
}
function Siren({ h, big = false }: { h: number; big?: boolean }) {
  return (
    <group>
      <Block size={[0.18, h, 0.18]} pos={[0, h / 2, 0]} color={METAL} r={0.04} />
      <mesh position={[0, h + 0.14, 0]}><sphereGeometry args={[big ? 0.26 : 0.18, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={1.4} transparent opacity={0.85} /></mesh>
      <Block size={[big ? 0.6 : 0.42, 0.1, big ? 0.6 : 0.42]} pos={[0, h + 0.1, 0]} color={METAL} r={0.03} />
      <group position={[0, h + 0.24, 0]}><Spin speed={5}>{[0, Math.PI].map((r) => <group key={r} rotation={[0, r, Math.PI / 2]}><Cone length={big ? 1.9 : 1.2} radius={big ? 0.4 : 0.26} color={RED} opacity={0.14} /></group>)}</Spin></group>
    </group>
  );
}
function Eye() {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * 1.2) * 0.8; });
  return <group ref={ref}><Block size={[0.32, 0.22, 0.26]} pos={[0, 0, 0]} color={WHITE} r={0.08} /><Lamp pos={[0, 0, 0.14]} color={RED} r={0.06} /></group>;
}
/** A flashing red alarm light while the trip wire is going off. */
function AlarmFlash({ until, height }: { until: MutableRefObject<number>; height: number }) {
  const light = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!light.current) return;
    const on = clock.elapsedTime < until.current;
    light.current.visible = on;
    if (on) light.current.scale.setScalar(0.8 + Math.abs(Math.sin(clock.elapsedTime * 10)) * 0.6);
  });
  return <group ref={light} position={[0, height, 0]} visible={false}><mesh><sphereGeometry args={[0.6, 20, 14]} /><meshBasicMaterial color={RED} transparent opacity={0.35} blending={AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh><pointLight color={RED} intensity={6} distance={7} /></group>;
}
export function TripWire({ level }: { level: TechLevel }) {
  const square = level >= 3;
  // Stepping inside the wires sets the alarm off for three seconds.
  const { group, state } = useExplorer(3);
  const alarmUntil = useRef(0);
  useFrame(({ clock }) => {
    if (state.current.near && insideTripWire(state.current.x, state.current.z, square)) {
      if (clock.elapsedTime > alarmUntil.current) defenceSounds.alarm();
      alarmUntil.current = clock.elapsedTime + 3;
    }
  });
  const corners: [number, number][] = square ? [[-1.4, -1.4], [1.4, -1.4], [1.4, 1.4], [-1.4, 1.4]] : [[-1.5, 0], [1.5, 0]];
  const wires: [number, number, number][][] = [];
  const heights = level === 1 ? [0.2] : level === 2 ? [0.2, 0.45] : level === 3 ? [0.25] : [0.2, 0.45, 0.7];
  if (!square) for (const y of heights) wires.push([[-1.4, y, 0], [1.4, y, 0]]);
  else if (level === 3) for (const y of heights) wires.push([[-1.3, y, -1.3], [1.3, y, 1.3]], [[1.3, y, -1.3], [-1.3, y, 1.3]]);
  else {
    // Legendary: a box of lasers round the edge at two heights, plus the cross at ankle height.
    const ring: [number, number][] = [[-1.4, -1.4], [1.4, -1.4], [1.4, 1.4], [-1.4, 1.4]];
    for (const y of [0.35, 0.75]) ring.forEach(([x, z], i) => { const [x2, z2] = ring[(i + 1) % 4]; wires.push([[x, y, z], [x2, y, z2]]); });
    wires.push([[-1.3, 0.2, -1.3], [1.3, 0.2, 1.3]], [[1.3, 0.2, -1.3], [-1.3, 0.2, 1.3]]);
  }
  return (
    <group ref={group}>
      <group position={square ? [1.4, 0, -1.4] : [1.5, 0, 0]}><AlarmFlash until={alarmUntil} height={level === 4 ? 2.2 : 1.3} /></group>
      {corners.map(([x, z], i) => <group key={i} position={[x, 0, z]}><Bollard led={level === 4 ? PINK : RED} h={level === 4 ? 0.85 : 0.5} /></group>)}
      {wires.map(([a, b], i) => <Laser key={i} from={a} to={b} color={level === 4 ? PINK : RED} width={0.014} pulse={6} />)}
      {level >= 2 ? <group position={square ? [1.4, 0, -1.4] : [1.5, 0, 0]}><Siren h={level === 4 ? 1.9 : 1.0} big={level === 4} /></group> : null}
      {level >= 3 ? <group position={[-1.4, 1.25, -1.4]}><Block size={[0.08, 1.25, 0.08]} pos={[0, -0.62, 0]} color={METAL} r={0.02} /><Eye /></group> : null}
    </group>
  );
}

/* ───────── 3 · Scanner tower ───────── */
function Pan({ range = 0.9, speed = 0.9, children }: { range?: number; speed?: number; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * speed) * range; });
  return <group ref={ref}>{children}</group>;
}
function GroundScan({ max = 4, color = GREEN }: { max?: number; color?: string }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.5) % 1;
    if (!ref.current) return;
    ref.current.scale.setScalar(0.2 + t * max);
    (ref.current.material as MeshBasicMaterial).opacity = 0.7 * (1 - t);
  });
  return <mesh ref={ref} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.9, 1, 48]} /><meshBasicMaterial color={color} transparent opacity={0.6} toneMapped={false} depthWrite={false} side={DoubleSide} /></mesh>;
}
/** Spins, or turns to point at the explorer while they're close (the scanner locking on). */
function LockOnSpin({ speed, lock, offset = 0, children }: { speed: number; lock?: MutableRefObject<Nearby>; offset?: number; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const s = lock?.current;
    // A group turned by θ points its +x at (cos θ, -sin θ) on the ground.
    if (s?.near) ref.current.rotation.y = turnTowards(ref.current.rotation.y, Math.atan2(-s.z, s.x) + offset, delta * 5);
    else ref.current.rotation.y += delta * speed;
  });
  return <group ref={ref}>{children}</group>;
}
/** A fan-shaped laser sheet from the scanner head down to the ground, sweeping round. */
/** A laser sheet from the emitter down to the ground and out to `reach`, sweeping round: the beam always
 * lands on the ground, however high the emitter is (`drop` is its height above the ground). */
function LaserFan({ color, reach, drop, lock, offset }: { color: string; reach: number; drop: number; lock?: MutableRefObject<Nearby>; offset?: number }) {
  const sheet = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute([0, 0, 0, 0, -drop, 0, reach, -drop, 0], 3));
    return geometry;
  }, [reach, drop]);
  useEffect(() => () => sheet.dispose(), [sheet]);
  return (
    <LockOnSpin speed={1.4} lock={lock} offset={offset}>
      <mesh geometry={sheet}><meshBasicMaterial color={color} transparent opacity={0.26} blending={AdditiveBlending} side={DoubleSide} depthWrite={false} toneMapped={false} /></mesh>
      <Laser from={[0, 0, 0]} to={[reach, -drop, 0]} color={color} width={0.02} />
      <mesh position={[reach, -drop + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.18, 20]} /><meshBasicMaterial color={color} transparent opacity={0.8} blending={AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
    </LockOnSpin>
  );
}
/** A sensor arm that swings a spotlight across the ground. */
function SensorArm({ side, color, length }: { side: 1 | -1; color: string; length: number }) {
  return (
    <group rotation={[0, side === 1 ? 0 : Math.PI, 0]}>
      <Block size={[length, 0.12, 0.14]} pos={[length / 2, 0, 0]} color={WHITE} r={0.05} />
      <group position={[length, 0, 0]}>
        <Pan range={0.9} speed={side === 1 ? 0.9 : 1.1}>
          <Block size={[0.3, 0.24, 0.36]} pos={[0, -0.1, 0]} color={METAL} r={0.08} />
          <Lamp pos={[0, -0.18, 0.16]} color={color} r={0.07} />
          <group position={[0, -0.2, 0.1]} rotation={[-0.75, 0, 0]}><Cone length={4.4} radius={1.1} color={color} opacity={0.12} /></group>
        </Pan>
      </group>
    </group>
  );
}
/** Little satellites that orbit the holo-globe. */
function Satellites({ radius, color, count }: { radius: number; color: string; count: number }) {
  return <Spin speed={1.6}>{Array.from({ length: count }, (_, i) => { const a = (i / count) * Math.PI * 2; return <group key={i} position={[Math.cos(a) * radius, Math.sin(a * 2) * 0.15, Math.sin(a) * radius]}><Block size={[0.14, 0.08, 0.14]} pos={[0, 0, 0]} color={WHITE} r={0.03} /><Lamp pos={[0, 0, 0]} color={color} r={0.035} /></group>; })}</Spin>;
}
/** The Scanner Tower starts as a sleek tech tower and gets more spectacular with every level. */
export function ScannerTower({ level }: { level: TechLevel }) {
  // About half the Tower of Knowledge at every level (the item is scaled up in the hub); upgrades add detail.
  const h = [5.4, 5.2, 5.0, 4.8][level - 1];
  const color = level === 4 ? PINK : CYAN, accent = level === 4 ? AMBER : WHITE;
  const globe = [0.38, 0.46, 0.56, 0.66][level - 1];
  // The head sits here, so the laser sweeps fall exactly this far to reach the ground.
  const headHeight = h + globe * 0.9;
  const rings = level + 1;
  // Come close and every laser sweep swings round to lock on to the explorer.
  const { group, state } = useExplorer(DEFENCE_REACT_DISTANCE.scanner);
  useFrame(() => { if (state.current.entered) defenceSounds.lock(); });
  return (
    <group ref={group}>
      {/* Base: a plinth that becomes a glowing hex platform. */}
      {level >= 3
        ? <group><mesh position={[0, 0.12, 0]}><cylinderGeometry args={[1.25, 1.35, 0.24, 6]} /><meshStandardMaterial color={METAL} roughness={0.5} /></mesh><mesh position={[0, 0.245, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.95, 1.08, 6]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>{Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2 + Math.PI / 6; return <Lamp key={i} pos={[Math.cos(a) * 1.2, 0.26, Math.sin(a) * 1.2]} color={accent} r={0.05} />; })}</group>
        : <Block size={[1.1, 0.2, 1.1]} pos={[0, 0.1, 0]} color={METAL} r={0.06} />}
      {/* The tower: tapered white body ringed with light. */}
      <mesh position={[0, h / 2, 0]}><cylinderGeometry args={[0.16 + level * 0.02, 0.36 + level * 0.04, h, 24]} /><meshStandardMaterial color={WHITE} metalness={0.4} roughness={0.28} /></mesh>
      {Array.from({ length: rings }, (_, i) => { const f = 0.25 + (i * 0.6) / Math.max(1, rings - 1); return <mesh key={i} position={[0, h * f, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[(0.36 + level * 0.04) - f * (0.2 + level * 0.02), 0.03, 8, 32]} /><meshBasicMaterial color={i % 2 && level >= 3 ? accent : color} toneMapped={false} /></mesh>; })}
      {level >= 3 ? [0.2, 0.45, 0.7].map((f) => [-1, 1].map((sx) => <Block key={`${f}${sx}`} size={[0.04, h * 0.18, 0.04]} pos={[sx * (0.3 - f * 0.12), h * f, 0.18]} color={color} r={0.015} glow={2} />)) : null}
      {/* Head: holo-globe, then a radar halo, satellites, a floating crown. */}
      <group position={[0, h + globe * 0.9, 0]}>
        <Block size={[0.5, 0.12, 0.5]} pos={[0, -globe - 0.06, 0]} color={METAL} r={0.05} />
        <Spin speed={0.8}><mesh><icosahedronGeometry args={[globe, level >= 3 ? 2 : 1]} /><meshBasicMaterial color={color} wireframe toneMapped={false} /></mesh></Spin>
        <Lamp pos={[0, 0, 0]} color={color} r={globe * 0.42} />
        {level >= 2 ? <Spin speed={-1.4}><group rotation={[0.35, 0, 0]}><mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[globe + 0.28, 0.035, 8, 40]} /><meshBasicMaterial color={accent} toneMapped={false} /></mesh></group></Spin> : null}
        {level >= 3 ? <Satellites radius={globe + 0.55} color={accent} count={level === 4 ? 4 : 3} /> : null}
        {level === 4 ? <Bob amount={0.1} speed={1.5}><group position={[0, globe + 0.45, 0]}><Spin speed={1}>{Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return <Block key={i} size={[0.34, 0.14, 0.12]} pos={[Math.cos(a) * 0.9, 0, Math.sin(a) * 0.9]} rot={[0, -a, 0]} color={AMBER} r={0.03} glow={1.5} />; })}</Spin></group></Bob> : null}
        <LaserFan color={color} reach={[3.2, 3.8, 4.4, 5.0][level - 1]} drop={headHeight} lock={state} />
        {level >= 2 ? <group rotation={[0, Math.PI, 0]}><LaserFan color={level === 4 ? AMBER : GREEN} reach={[0, 3.2, 3.8, 4.4][level - 1]} drop={headHeight} lock={state} offset={-Math.PI} /></group> : null}
        {level === 4 ? <group rotation={[0, Math.PI / 2, 0]}><LaserFan color={CYAN} reach={4.4} drop={headHeight} lock={state} offset={-Math.PI / 2} /></group> : null}
      </group>
      {level >= 3 ? <group position={[0, h * 0.62, 0]}><SensorArm side={1} color={accent} length={0.9} /><SensorArm side={-1} color={accent} length={0.9} /></group> : null}
      {level === 4 ? <Laser from={[0, h + globe * 1.9, 0]} to={[0, h + 40, 0]} color={PINK} width={0.08} pulse={2.5} /> : null}
      <GroundScan max={[3, 3.4, 3.8, 4.2][level - 1]} color={color} />
      {level >= 3 ? <group rotation={[0, Math.PI / 3, 0]}><GroundScan max={[0, 0, 3.4, 3.8][level - 1]} color={accent} /></group> : null}
    </group>
  );
}

/* ───────── 5 · Drone pad ───────── */
function Drone({ spot, color }: { spot?: boolean; color: string }) {
  return (
    <group scale={2.6}>
      <Block size={[0.42, 0.14, 0.42]} pos={[0, 0, 0]} color={WHITE} r={0.06} />
      <Lamp pos={[0, -0.02, 0.22]} color={color} r={0.05} />
      {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, z], i) => (
        <group key={i} position={[x * 0.3, 0.06, z * 0.3]}>
          <Block size={[0.24, 0.04, 0.04]} pos={[-x * 0.1, -0.02, -z * 0.1]} rot={[0, Math.atan2(z, x) + Math.PI / 2, 0]} color={METAL} r={0.01} />
          <Spin speed={30}><Block size={[0.3, 0.012, 0.05]} pos={[0, 0.03, 0]} color={METAL_LIGHT} r={0.005} /></Spin>
        </group>
      ))}
      {spot ? <Cone length={1.4} radius={0.4} color={color} opacity={0.14} /> : null}
    </group>
  );
}
/** Escorting: while the explorer is near, an orbit's centre glides over to them (never more than `leash` away). */
function useEscortCentre(follow: MutableRefObject<Nearby> | undefined, leash: number) {
  const centre = useRef({ x: 0, z: 0 });
  useFrame((_, delta) => {
    const s = follow?.current, c = centre.current;
    let tx = 0, tz = 0;
    if (s?.near) { const k = Math.min(1, leash / Math.max(0.001, s.dist)); tx = s.x * k; tz = s.z * k; }
    const step = Math.min(1, delta * 1.6);
    c.x += (tx - c.x) * step; c.z += (tz - c.z) * step;
  });
  return centre;
}
function Orbit({ radius, speed, phase, height, follow, children }: { radius: number; speed: number; phase: number; height: number; follow?: MutableRefObject<Nearby>; children: ReactNode }) {
  const ref = useRef<Group>(null);
  const centre = useEscortCentre(follow, 6);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const a = clock.elapsedTime * speed + phase, lift = follow?.current.near ? 1.4 : 0;
    ref.current.position.set(centre.current.x + Math.cos(a) * radius, height + lift + Math.sin(a * 2) * 0.15, centre.current.z + Math.sin(a) * radius);
    ref.current.rotation.y = -a;
  });
  return <group ref={ref} userData={{ flying: true }}>{children}</group>;
}
export function DronePad({ level }: { level: TechLevel }) {
  const color = level === 4 ? PINK : CYAN;
  // Walk past and the drones fly over to escort you.
  const { group, state } = useExplorer(DEFENCE_REACT_DISTANCE.droneEscort);
  return (
    <group ref={group}>
      <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[1.2, 1.3, 0.16, 6]} /><meshStandardMaterial color={METAL} roughness={0.6} /></mesh>
      <mesh position={[0, 0.165, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.6, 0.68, 6]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
      {Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2 + Math.PI / 6; return <Lamp key={i} pos={[Math.cos(a) * 1.05, 0.18, Math.sin(a) * 1.05]} color={color} r={0.04} />; })}
      {level >= 3 ? <group position={[1.0, 0, -0.9]}><Block size={[0.18, 1.6, 0.18]} pos={[0, 0.8, 0]} color={WHITE} r={0.05} /><Lamp pos={[0, 1.66, 0]} color={GREEN} r={0.08} /></group> : null}
      {/* Car-sized drones patrol wide, high loops round their pad (they fly over nearby builds). */}
      {Array.from({ length: level }, (_, i) => <Orbit key={i} radius={[3.2, 3.6, 4.0, 4.4][level - 1] - (i % 2) * 0.8} speed={0.32} phase={(i / level) * Math.PI * 2} height={3.2 + (i % 2) * 0.9} follow={state}><Drone color={color} spot={level === 4} /></Orbit>)}
    </group>
  );
}

/* ───────── 6 · Laser gate ───────── */
function Curtain({ w, h, color }: { w: number; h: number; color: string }) {
  const lines = useRef<Group>(null);
  useFrame(({ clock }) => { if (lines.current) lines.current.position.y = ((clock.elapsedTime * 0.6) % 0.3); });
  return (
    <group>
      <Pulse color={color} min={0.12} max={0.3} speed={2.5}>{(m) => <mesh position={[0, h / 2, 0]}><planeGeometry args={[w, h]} />{m}</mesh>}</Pulse>
      <group ref={lines}>{Array.from({ length: Math.floor(h / 0.3) }, (_, i) => <mesh key={i} position={[0, 0.1 + i * 0.3, 0.005]}><planeGeometry args={[w, 0.025]} /><meshBasicMaterial color={color} transparent opacity={0.55} toneMapped={false} side={DoubleSide} /></mesh>)}</group>
    </group>
  );
}
export function LaserGate({ level }: { level: TechLevel }) {
  const w = [2.4, 2.6, 3.0, 3.4][level - 1], h = [2.2, 2.5, 2.9, 3.3][level - 1];
  const color = level === 1 ? RED : level === 4 ? PINK : CYAN;
  // The lasers drop into the floor as the explorer walks up, and rise again behind them.
  const { group, state } = useExplorer(DEFENCE_REACT_DISTANCE.laserGate);
  const door = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!door.current) return;
    const target = state.current.near ? 0.001 : 1, y = door.current.scale.y;
    door.current.scale.y = y + (target - y) * Math.min(1, delta * 6);
    door.current.visible = door.current.scale.y > 0.02;
  });
  return (
    <group ref={group}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (w / 2 + 0.22), 0, 0]}>
          <Block size={[0.44, h, 0.5]} pos={[0, h / 2, 0]} color={level >= 3 ? WHITE : METAL_LIGHT} r={0.08} metal={0.3} />
          {Array.from({ length: level + 1 }, (_, i) => <Block key={i} size={[0.05, 0.16, 0.52]} pos={[-s * 0.2, 0.4 + i * 0.4, 0]} color={color} r={0.02} glow={2} />)}
          {level >= 3 ? <group position={[s * 0.5, 0, 0]}><Block size={[0.3, h * 0.7, 0.3]} pos={[0, h * 0.35, 0]} color={METAL} r={0.06} /><Lamp pos={[0, h * 0.7 + 0.08, 0]} color={color} r={0.09} /></group> : null}
          {level === 4 ? <group position={[0, h * 0.6, 0]}><Spin speed={2.2}><mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.38, 0.03, 8, 32]} /><meshBasicMaterial color={CYAN} toneMapped={false} /></mesh></Spin></group> : null}
        </group>
      ))}
      {level === 4
        ? <mesh position={[0, h, 0]}><torusGeometry args={[w / 2 + 0.22, 0.12, 12, 40, Math.PI]} /><meshStandardMaterial color={WHITE} emissive={PINK} emissiveIntensity={0.6} /></mesh>
        : <Block size={[w + 0.9, 0.36, 0.56]} pos={[0, h + 0.18, 0]} color={METAL} r={0.08} />}
      {level >= 2 ? <Lamp pos={[0, h + (level === 4 ? w / 2 + 0.3 : 0.4), 0]} color={color} r={0.12} /> : null}
      <group ref={door}>
        {level === 1
          ? [-0.8, -0.27, 0.27, 0.8].map((x) => <Laser key={x} from={[x * w / 2.4, 0.05, 0]} to={[x * w / 2.4, h - 0.05, 0]} color={RED} width={0.016} pulse={5} />)
          : <Curtain w={w} h={h} color={color} />}
      </group>
    </group>
  );
}

/* ───────── 7 · Robo guard dog (premium) ───────── */
/** Walks a circle; while the explorer is near it stops and turns to face them (the model faces +x). */
function Patrol({ radius, speed, watch, origin = [0, 0], children }: { radius: number; speed: number; watch?: MutableRefObject<Nearby>; origin?: readonly [number, number]; children: ReactNode }) {
  const ref = useRef<Group>(null);
  const angle = useRef(0);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const s = watch?.current;
    if (s?.near) {
      const dx = s.x - origin[0] - ref.current.position.x, dz = s.z - origin[1] - ref.current.position.z;
      ref.current.rotation.y = turnTowards(ref.current.rotation.y, Math.atan2(-dz, dx), delta * 6);
      return;
    }
    angle.current += delta * speed;
    const a = angle.current;
    ref.current.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    ref.current.rotation.y = turnTowards(ref.current.rotation.y, -a, delta * 6);
  });
  return <group ref={ref}>{children}</group>;
}
/** Eyes that blink every few seconds. */
function Blink({ children, every = 3.2 }: { children: ReactNode; every?: number }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.scale.y = (clock.elapsedTime % every) < 0.12 ? 0.1 : 1; });
  return <group ref={ref}>{children}</group>;
}
const dogLook = (level: TechLevel) => ({
  shell: level === 1 ? "#c9ced8" : WHITE,
  panel: level === 4 ? "#2a1640" : METAL,
  glow: level === 4 ? PINK : level === 1 ? AMBER : CYAN,
  trim: level === 4 ? CYAN : level >= 2 ? CYAN : AMBER,
});
/** A two-part leg (thigh, knee, shin, paw) that walks. */
function DogLeg({ x, z, phase, front, look, hover }: { x: number; z: number; phase: number; front: boolean; look: ReturnType<typeof dogLook>; hover: boolean }) {
  const hip = useRef<Group>(null), knee = useRef<Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 8 + phase;
    if (hip.current) hip.current.rotation.x = Math.sin(t) * 0.45;
    if (knee.current) knee.current.rotation.x = (front ? -1 : 1) * (0.55 + Math.max(0, Math.cos(t)) * 0.5);
  });
  return (
    <group ref={hip} position={[x, 0.58, z]}>
      <Block size={[0.13, 0.28, 0.15]} pos={[0, -0.12, 0]} color={look.shell} r={0.06} />
      <group ref={knee} position={[0, -0.26, 0]}>
        <mesh><sphereGeometry args={[0.065, 14, 10]} /><meshStandardMaterial color={look.panel} metalness={0.5} roughness={0.3} /></mesh>
        <Block size={[0.09, 0.26, 0.1]} pos={[0, -0.13, 0]} color={look.panel} r={0.04} />
        <group rotation={[(front ? 1 : -1) * 0.55, 0, 0]}><Block size={[0.13, 0.06, 0.17]} pos={[0, -0.28, 0.02]} color={look.shell} r={0.03} /></group>
        {hover ? <mesh position={[0, -0.33, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.09, 20]} /><meshBasicMaterial color={look.glow} toneMapped={false} /></mesh> : null}
      </group>
    </group>
  );
}
/** The tail wags, twice as fast while the explorer is near. */
const DogWatchContext = createContext<MutableRefObject<Nearby> | null>(null);
function Wag({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);
  const watch = useContext(DogWatchContext);
  const phase = useRef(0);
  useFrame((_, delta) => { if (!ref.current) return; phase.current += delta * (watch?.current.near ? 26 : 12); ref.current.rotation.y = Math.sin(phase.current) * (watch?.current.near ? 0.8 : 0.5); });
  return <group ref={ref}>{children}</group>;
}
function RoboDog({ level }: { level: TechLevel }) {
  const look = dogLook(level), s = [1.15, 1.3, 1.45, 1.6][level - 1];
  return (
    // Modelled facing +z; turned to walk along its patrol circle.
    <group scale={s} rotation={[0, Math.PI / 2, 0]}>
      <group position={[0, level === 4 ? 0.12 : 0, 0]}>
        {([[-0.17, 0.27, 0, true], [0.17, 0.27, Math.PI, true], [-0.17, -0.27, Math.PI, false], [0.17, -0.27, 0, false]] as const).map(([x, z, p, f], i) => <DogLeg key={i} x={x} z={z} phase={p} front={f} look={look} hover={level === 4} />)}
        {/* Torso: a rounded shell over dark side panels, a light strip down the spine. */}
        <Block size={[0.46, 0.26, 0.82]} pos={[0, 0.66, 0]} color={look.panel} r={0.11} metal={0.4} rough={0.35} />
        <Block size={[0.5, 0.16, 0.74]} pos={[0, 0.76, 0]} color={look.shell} r={0.08} />
        <Block size={[0.06, 0.03, 0.6]} pos={[0, 0.85, 0]} color={look.glow} r={0.015} glow={2.5} />
        {level >= 3 ? [-1, 1].map((sx) => <Block key={sx} size={[0.04, 0.16, 0.36]} pos={[sx * 0.25, 0.68, 0.05]} color={look.trim} r={0.02} glow={1.2} />) : null}
        {level >= 3 ? <group position={[0, 0.9, -0.15]}><Block size={[0.2, 0.08, 0.22]} pos={[0, 0, 0]} color={look.panel} r={0.04} /><Spin speed={3}><Block size={[0.1, 0.04, 0.1]} pos={[0, 0.06, 0]} color={look.glow} r={0.02} glow={2} /></Spin></group> : null}
        {/* Collar and tag. */}
        <mesh position={[0, 0.78, 0.36]} rotation={[0.35, 0, 0]}><torusGeometry args={[0.15, 0.03, 8, 24]} /><meshStandardMaterial color={look.glow} emissive={look.glow} emissiveIntensity={1.2} /></mesh>
        {/* Head: rounded helmet, dark screen face, blinking eyes, ears with lit tips, a little snout. */}
        <group position={[0, 0.98, 0.48]} rotation={[-0.15, 0, 0]}>
          <Block size={[0.36, 0.3, 0.34]} pos={[0, 0, 0]} color={look.shell} r={0.13} />
          <Block size={[0.3, 0.17, 0.05]} pos={[0, 0.01, 0.16]} color="#0b0d18" r={0.06} />
          <Blink>{[-0.07, 0.07].map((x) => <Block key={x} size={[0.06, 0.07, 0.02]} pos={[x, 0.02, 0.19]} color={look.glow} r={0.03} glow={3} />)}</Blink>
          <Block size={[0.16, 0.1, 0.14]} pos={[0, -0.1, 0.17]} color={look.shell} r={0.05} />
          <Ballish pos={[0, -0.07, 0.25]} r={0.03} color="#14161c" />
          {[-1, 1].map((sx) => <group key={sx} position={[sx * 0.13, 0.17, -0.04]} rotation={[-0.2, 0, sx * -0.35]}><Block size={[0.08, 0.17, 0.05]} pos={[0, 0.06, 0]} color={look.panel} r={0.03} /><Lamp pos={[0, 0.16, 0]} color={look.glow} r={0.025} /></group>)}
          {level >= 3 ? <group position={[0, -0.02, 0.2]}><Cone length={1.6} radius={0.32} color={look.glow} opacity={0.1} /></group> : null}
        </group>
        <group position={[0, 0.8, -0.42]}><Wag><group rotation={[-0.9, 0, 0]}><Block size={[0.04, 0.24, 0.04]} pos={[0, 0.11, 0]} color={look.panel} r={0.02} /><Lamp pos={[0, 0.25, 0]} color={look.glow} r={0.04} /></group></Wag></group>
        {level === 4 ? <Pulse color={PINK} min={0.08} max={0.22}>{(m) => <mesh position={[0, 0.7, 0]}><sphereGeometry args={[0.75, 24, 16]} />{m}</mesh>}</Pulse> : null}
      </group>
    </group>
  );
}
function Ballish({ pos, r, color }: { pos: [number, number, number]; r: number; color: string }) {
  return <mesh position={pos}><sphereGeometry args={[r, 12, 10]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>;
}
/** A modern dog pod: rounded shell, arched glowing doorway, name plate; a charging pad from Level 3. */
function Kennel({ level }: { level: TechLevel }) {
  const look = dogLook(level);
  return (
    <group scale={1.2}>
      <Block size={[1.3, 0.12, 1.2]} pos={[0, 0.06, 0]} color={look.panel} r={0.05} />
      <mesh position={[0, 0.12, 0]} scale={[0.72, 0.62, 0.62]}><sphereGeometry args={[1, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={look.shell} roughness={0.4} /></mesh>
      <mesh position={[0, 0.12, 0.6]} scale={[0.28, 0.4, 1]}><circleGeometry args={[1, 24, 0, Math.PI]} /><meshStandardMaterial color="#0b0d18" /></mesh>
      <mesh position={[0, 0.12, 0.61]} scale={[0.3, 0.43, 1]}><ringGeometry args={[0.92, 1, 32, 1, 0, Math.PI]} /><meshBasicMaterial color={look.glow} toneMapped={false} side={DoubleSide} /></mesh>
      <Block size={[0.34, 0.1, 0.03]} pos={[0, 0.66, 0.42]} rot={[-0.6, 0, 0]} color={look.glow} r={0.02} glow={1.5} />
      {level >= 2 ? <Block size={[0.5, 0.03, 0.3]} pos={[0, 0.74, -0.08]} rot={[0.4, 0, 0]} color="#1d2b4a" r={0.01} metal={0.6} rough={0.2} /> : null}
      {level >= 3 ? <group position={[0, 0.02, 1.15]}><mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.42, 32]} /><meshStandardMaterial color={look.panel} /></mesh><mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.32, 0.4, 32]} /><meshBasicMaterial color={look.glow} toneMapped={false} /></mesh></group> : null}
    </group>
  );
}
export function GuardDog({ level }: { level: TechLevel }) {
  // Walk up and they stop, turn to you, bark, then wag.
  const { group, state } = useExplorer(DEFENCE_REACT_DISTANCE.guardDog);
  useFrame(() => { if (state.current.entered) defenceSounds.bark(); });
  return (
    <DogWatchContext.Provider value={state}>
      <group ref={group}>
        <group position={[-1.7, 0, -1.3]} rotation={[0, 0.45, 0]}><Kennel level={level} /></group>
        <group position={[0.9, 0, 0.5]}><Patrol radius={0.95} speed={0.85} watch={state} origin={[0.9, 0.5]}><RoboDog level={level} /></Patrol></group>
        {level >= 2 ? <group position={[-0.75, 0, 0.1]}><Patrol radius={0} speed={0} watch={state} origin={[-0.75, 0.1]}><RoboDog level={level} /></Patrol></group> : null}
      </group>
    </DogWatchContext.Provider>
  );
}

/* ───────── 8 · Patrol drone (premium) ───────── */
function FigureEight({ size, height, speed, follow, children }: { size: number; height: number; speed: number; follow?: MutableRefObject<Nearby>; children: ReactNode }) {
  const ref = useRef<Group>(null);
  // Spotting the explorer, the patrol shifts over them and tightens its loop.
  const centre = useEscortCentre(follow, 8);
  const tight = useRef(1);
  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    tight.current += ((follow?.current.near ? 0.45 : 1) - tight.current) * Math.min(1, delta * 2);
    const t = clock.elapsedTime * speed, r = size * tight.current;
    const dx = Math.cos(t) * r, dz = Math.cos(t * 2) * r * 0.9;
    ref.current.position.set(centre.current.x + Math.sin(t) * r, height + Math.sin(t * 3) * 0.12, centre.current.z + Math.sin(t * 2) * r * 0.45);
    ref.current.rotation.y = Math.atan2(dx, dz);
    ref.current.rotation.z = -Math.cos(t) * 0.22;
  });
  return <group ref={ref} userData={{ flying: true }}>{children}</group>;
}
/** A camera ball under the drone that keeps looking around. */
function Gimbal({ color }: { color: string }) {
  return <Pan range={0.8} speed={1.3}><mesh><sphereGeometry args={[0.1, 16, 12]} /><meshStandardMaterial color="#14161c" metalness={0.4} roughness={0.3} /></mesh><Lamp pos={[0, -0.02, 0.09]} color={color} r={0.035} /></Pan>;
}
function QuadDrone({ level }: { level: TechLevel }) {
  const shell = level === 1 ? "#c9ced8" : WHITE, glow = level === 1 ? AMBER : CYAN;
  return (
    <group>
      {/* Body: a rounded shell over a dark belly, a light strip round the middle. */}
      <Block size={[0.5, 0.12, 0.62]} pos={[0, -0.03, 0]} color={METAL} r={0.06} />
      <mesh position={[0, 0.03, 0]} scale={[0.27, 0.12, 0.34]}><sphereGeometry args={[1, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={shell} roughness={0.3} metalness={0.15} /></mesh>
      <Block size={[0.52, 0.025, 0.64]} pos={[0, 0.0, 0]} color={glow} r={0.012} glow={2} />
      {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, z], i) => (
        <group key={i} position={[x * 0.44, 0.04, z * 0.44]}>
          <Block size={[0.46, 0.05, 0.07]} pos={[-x * 0.17, -0.02, -z * 0.17]} rot={[0, Math.atan2(z, x) + Math.PI / 2, 0]} color={METAL} r={0.02} />
          <mesh><cylinderGeometry args={[0.05, 0.06, 0.09, 14]} /><meshStandardMaterial color={METAL} metalness={0.5} /></mesh>
          <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.2, 0.02, 8, 28]} /><meshStandardMaterial color={shell} /></mesh>
          <Spin speed={32}><Block size={[0.36, 0.01, 0.05]} pos={[0, 0.05, 0]} color="#5a6273" r={0.004} /></Spin>
          <Lamp pos={[0, -0.05, 0]} color={z < 0 ? RED : GREEN} r={0.025} />
        </group>
      ))}
      <group position={[0, -0.14, 0.15]}><Gimbal color={glow} /></group>
      {level >= 2 ? <group position={[0, -0.16, 0.15]}><Cone length={2.6} radius={0.7} color="#fff6c8" opacity={0.12} /></group> : null}
      {/* The patrol drone flies about 3.4 of its own units up, so its scan reaches the ground below. */}
      {level === 3 ? <group position={[0, -0.16, 0]}><LaserFan color={GREEN} reach={2.2} drop={3.3} /></group> : null}
    </group>
  );
}
function JetDrone() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.75]}><capsuleGeometry args={[0.2, 0.62, 10, 20]} /><meshStandardMaterial color={WHITE} metalness={0.35} roughness={0.22} /></mesh>
      <mesh position={[0, 0.1, 0.18]} scale={[0.15, 0.09, 0.24]}><sphereGeometry args={[1, 20, 14]} /><meshStandardMaterial color="#141a33" metalness={0.6} roughness={0.1} /></mesh>
      <Block size={[0.44, 0.02, 0.5]} pos={[0, -0.02, 0]} color={PINK} r={0.01} glow={2.5} />
      {[-1, 1].map((sx) => (
        <group key={sx}>
          <Block size={[0.62, 0.04, 0.26]} pos={[sx * 0.4, -0.02, -0.06]} rot={[0, sx * 0.25, 0]} color={METAL} r={0.02} />
          <group position={[sx * 0.72, 0, -0.12]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.13, 0.13, 0.12, 20, 1, true]} /><meshStandardMaterial color={WHITE} side={DoubleSide} /></mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.13, 0.02, 8, 24]} /><meshBasicMaterial color={CYAN} toneMapped={false} /></mesh>
            <Spin speed={40} axis="z"><Block size={[0.22, 0.03, 0.01]} pos={[0, 0, 0]} color="#5a6273" r={0.005} /></Spin>
          </group>
        </group>
      ))}
      {[-1, 1].map((sx) => <Block key={sx} size={[0.03, 0.16, 0.16]} pos={[sx * 0.1, 0.12, -0.36]} rot={[0.3, 0, sx * 0.3]} color={PINK} r={0.01} glow={1} />)}
      <group position={[0, 0, -0.5]} rotation={[-Math.PI / 2, 0, 0]}><Cone length={0.9} radius={0.12} color={PINK} opacity={0.55} /></group>
      <group position={[0, -0.18, 0.2]}><Gimbal color={PINK} /></group>
      <group position={[0, -0.2, 0.2]}><Cone length={3.2} radius={0.85} color="#fff6c8" opacity={0.1} /></group>
    </group>
  );
}
export function PatrolDrone({ level }: { level: TechLevel }) {
  const ring = level === 4 ? PINK : level === 1 ? AMBER : CYAN;
  const drone = level === 4 ? <JetDrone /> : <QuadDrone level={level} />;
  const { group, state } = useExplorer(DEFENCE_REACT_DISTANCE.patrolDrone);
  return (
    <group ref={group}>
      {/* A small beacon marks where it patrols from. */}
      <Block size={[0.5, 0.12, 0.5]} pos={[0, 0.06, 0]} color={METAL} r={0.05} />
      <Lamp pos={[0, 0.16, 0]} color={ring} r={0.07} />
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.45, 0.52, 32]} /><meshBasicMaterial color={ring} toneMapped={false} /></mesh>
      <FigureEight size={[5, 5.2, 5.4, 5.6][level - 1]} height={[4.2, 4.6, 5.0, 5.4][level - 1]} speed={0.35} follow={state}><group scale={level === 4 ? 1.25 : 1.45}>{drone}</group></FigureEight>
      {level >= 3 ? <FigureEight size={[0, 0, 4.4, 4.6][level - 1]} height={[0, 0, 3.6, 4.2][level - 1]} speed={-0.3} follow={state}><group scale={level === 4 ? 1.25 : 1.45}>{drone}</group></FigureEight> : null}
    </group>
  );
}

/* ───────── 9 · Sentry bot (premium) ───────── */
/** Rolls to and fro along its patch; while the explorer is near it stops and turns to face them (the model faces +z). */
function Wobble({ watch, children }: { watch?: MutableRefObject<Nearby>; children: ReactNode }) {
  const ref = useRef<Group>(null);
  const t = useRef(0);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const s = watch?.current;
    if (s?.near) { ref.current.rotation.y = turnTowards(ref.current.rotation.y, Math.atan2(s.x - ref.current.position.x, s.z - ref.current.position.z), delta * 5); return; }
    t.current += delta;
    ref.current.rotation.y = turnTowards(ref.current.rotation.y, Math.sin(t.current * 0.8) * 0.35, delta * 4);
    ref.current.position.x = Math.sin(t.current * 0.5) * 0.3;
  });
  return <group ref={ref}>{children}</group>;
}
function Wave({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.z = -2.6 + Math.sin(clock.elapsedTime * 5) * 0.3; });
  return <group ref={ref}>{children}</group>;
}
function Arm({ side, look, waving, shield }: { side: 1 | -1; look: { shell: string; panel: string; glow: string }; waving?: boolean; shield?: boolean }) {
  const arm = (
    <group>
      <mesh><sphereGeometry args={[0.1, 16, 12]} /><meshStandardMaterial color={look.panel} metalness={0.4} /></mesh>
      <Block size={[0.13, 0.3, 0.13]} pos={[0, -0.17, 0]} color={look.shell} r={0.06} />
      <mesh position={[0, -0.34, 0]}><sphereGeometry args={[0.07, 14, 10]} /><meshStandardMaterial color={look.panel} /></mesh>
      <Block size={[0.12, 0.26, 0.12]} pos={[0, -0.48, 0]} color={look.shell} r={0.05} />
      <Block size={[0.15, 0.13, 0.13]} pos={[0, -0.66, 0]} color={look.panel} r={0.06} />
      {shield ? <group position={[side * 0.12, -0.45, 0.12]} rotation={[0, side * 0.5, 0]}><Pulse color={PINK} min={0.25} max={0.5}>{(m) => <mesh><circleGeometry args={[0.36, 6]} />{m}</mesh>}</Pulse><mesh><ringGeometry args={[0.33, 0.37, 6]} /><meshBasicMaterial color={PINK} toneMapped={false} side={DoubleSide} /></mesh></group> : null}
    </group>
  );
  return <group position={[side * 0.42, 0, 0]}>{waving ? <Wave>{arm}</Wave> : <group rotation={[0, 0, side * 0.12]}>{arm}</group>}</group>;
}
export function SentryBot({ level }: { level: TechLevel }) {
  const look = { shell: level === 1 ? "#c9ced8" : WHITE, panel: level === 4 ? "#2a1640" : METAL, glow: level === 4 ? PINK : level === 1 ? AMBER : CYAN };
  const s = [0.95, 1.15, 1.35, 1.55][level - 1], hover = level >= 3;
  // Get close and it turns to you, blinks and beeps hello.
  const { group, state } = useExplorer(DEFENCE_REACT_DISTANCE.sentryBot);
  useFrame(() => { if (state.current.entered) defenceSounds.beep(); });
  return (
    <group ref={group}>
    <Wobble watch={state}>
      <group scale={s}>
        {/* Base: chunky wheels, then a hover disc with a glowing underside from Level 3. */}
        {hover
          ? <Bob amount={0.06} speed={2.2}><group position={[0, 0.3, 0]}><mesh><cylinderGeometry args={[0.42, 0.34, 0.16, 28]} /><meshStandardMaterial color={look.panel} metalness={0.4} /></mesh><mesh position={[0, -0.09, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.3, 0.04, 8, 32]} /><meshBasicMaterial color={look.glow} toneMapped={false} /></mesh><group position={[0, -0.1, 0]}><Cone length={0.3} radius={0.32} color={look.glow} opacity={0.25} /></group></group></Bob>
          : <group>{[-1, 1].map((sx) => <group key={sx} position={[sx * 0.26, 0.17, 0]}><mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.17, 0.17, 0.14, 22]} /><meshStandardMaterial color="#14161c" roughness={0.8} /></mesh><mesh position={[sx * 0.075, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.08, 0.08, 0.01, 18]} /><meshStandardMaterial color={look.glow} emissive={look.glow} emissiveIntensity={1} /></mesh></group>)}<Block size={[0.4, 0.12, 0.4]} pos={[0, 0.24, 0]} color={look.panel} r={0.05} /></group>}
        <group position={[0, hover ? 0.42 : 0.32, 0]}>
          {/* Torso: rounded shell with a lit chest badge and chevron stripes. */}
          <mesh position={[0, 0.36, 0]} scale={[0.36, 0.38, 0.28]}><sphereGeometry args={[1, 28, 20]} /><meshStandardMaterial color={look.shell} roughness={0.35} metalness={0.1} /></mesh>
          <Block size={[0.32, 0.12, 0.04]} pos={[0, 0.2, 0.25]} color={look.panel} r={0.03} />
          {[-0.08, 0, 0.08].map((x) => <Block key={x} size={[0.05, 0.05, 0.02]} pos={[x, 0.2, 0.275]} rot={[0, 0, Math.PI / 4]} color={look.glow} r={0.01} glow={2} />)}
          <mesh position={[0, 0.42, 0.27]}><circleGeometry args={[0.07, 20]} /><meshBasicMaterial color={look.glow} toneMapped={false} /></mesh>
          {level >= 3 ? [-1, 1].map((sx) => <Block key={sx} size={[0.2, 0.1, 0.22]} pos={[sx * 0.32, 0.62, 0]} color={look.panel} r={0.05} />) : null}
          {level >= 3 ? <Block size={[0.3, 0.32, 0.14]} pos={[0, 0.4, -0.3]} color={look.panel} r={0.05} /> : null}
          <group position={[0, 0.62, 0]}><Arm side={-1} look={look} waving={level !== 4} /><Arm side={1} look={look} shield={level === 4} /></group>
          {/* Head: big friendly helmet, dark screen face, blinking eyes, antenna. */}
          <group position={[0, 0.98, 0]}>
            <Block size={[0.58, 0.44, 0.48]} pos={[0, 0, 0]} color={look.shell} r={0.2} />
            <Block size={[0.48, 0.28, 0.05]} pos={[0, -0.01, 0.23]} color="#0b0d18" r={0.1} />
            <Blink every={2.8}>{[-0.11, 0.11].map((x) => <Block key={x} size={[0.09, 0.11, 0.02]} pos={[x, 0.01, 0.265]} color={look.glow} r={0.045} glow={3} />)}</Blink>
            {[-1, 1].map((sx) => <mesh key={sx} position={[sx * 0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.09, 0.09, 0.06, 18]} /><meshStandardMaterial color={look.panel} /></mesh>)}
            <Block size={[0.03, 0.16, 0.03]} pos={[0.14, 0.28, 0]} color={look.panel} r={0.01} /><Lamp pos={[0.14, 0.38, 0]} color={look.glow} r={0.035} />
            {level >= 2 ? <group position={[-0.08, 0.27, 0]}><mesh><sphereGeometry args={[0.08, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={1.6} transparent opacity={0.9} /></mesh>{level >= 3 ? <group position={[0, 0.05, 0]}><Spin speed={5}><group rotation={[0, 0, Math.PI / 2]}><Cone length={0.9} radius={0.18} color={RED} opacity={0.14} /></group></Spin></group> : null}</group> : null}
          </group>
        </group>
        {level >= 3 ? <GroundScan max={2.2} color={look.glow} /> : null}
      </group>
    </Wobble>
    </group>
  );
}

/* ───────── 10 · Tower Shield (covers the real Tower) ───────── */
const FLASH_SPOTS = Array.from({ length: 28 }, (_, i) => ({ a: (i * 137.5 * Math.PI) / 180, h: ((i * 0.618) % 1) * 0.85 + 0.05 }));
/** Hex tiles that flash at random across the shield (Legendary). */
function FlashTiles({ rx, ry, color }: { rx: number; ry: number; color: string }) {
  const tiles = useRef<Group>(null);
  useFrame(({ clock }) => {
    tiles.current?.children.forEach((child, i) => {
      const m = (child as Mesh).material as MeshBasicMaterial;
      m.opacity = Math.max(0, Math.sin(clock.elapsedTime * 2 + i * 1.7)) * 0.6;
    });
  });
  return (
    <group ref={tiles}>
      {FLASH_SPOTS.map(({ a, h }, i) => {
        const phi = Math.acos(1 - h * 1.0), y = Math.cos(phi) * ry, r = Math.sin(phi) * rx;
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        return <mesh key={i} position={[x, y, z]} quaternion={new Quaternion().setFromUnitVectors(FORWARD, new Vector3(x / rx / rx, y / ry / ry, z / rx / rx).normalize())}><circleGeometry args={[1.6, 6]} /><meshBasicMaterial color={color} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} toneMapped={false} /></mesh>;
      })}
    </group>
  );
}
function RisingRings({ rx, ry, color, count = 3 }: { rx: number; ry: number; color: string; count?: number }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    ref.current?.children.forEach((child, i) => {
      const t = ((clock.elapsedTime * 0.18) + i / count) % 1;
      const y = t * ry * 0.96, r = rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2));
      child.position.y = y;
      child.scale.setScalar(Math.max(0.01, r));
      ((child as Mesh).material as MeshBasicMaterial).opacity = 0.7 * (1 - t);
    });
  });
  return <group ref={ref}>{Array.from({ length: count }, (_, i) => <mesh key={i} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1, 0.012, 6, 64]} /><meshBasicMaterial color={color} transparent opacity={0.6} toneMapped={false} /></mesh>)}</group>;
}
/** A bright flash over the whole shell when the explorer walks through it. */
function ShieldRipple({ watch, color }: { watch: MutableRefObject<Nearby>; color: string }) {
  const mesh = useRef<Mesh>(null);
  const inside = useRef<boolean | null>(null), flash = useRef(0);
  useFrame((_, delta) => {
    const now = watch.current.dist < 1;
    if (inside.current !== null && now !== inside.current) flash.current = 1;
    inside.current = now;
    flash.current = Math.max(0, flash.current - delta * 1.6);
    if (!mesh.current) return;
    mesh.current.visible = flash.current > 0;
    (mesh.current.material as MeshBasicMaterial).opacity = flash.current * 0.35;
  });
  return <mesh ref={mesh} visible={false}><sphereGeometry args={[1.003, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshBasicMaterial color={color} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} toneMapped={false} /></mesh>;
}
export function TowerShield({ level }: { level: TechLevel }) {
  const rx = 15, ry = 62, color = level === 4 ? PINK : CYAN, accent = level === 4 ? AMBER : WHITE;
  const pylons = level === 1 ? 4 : level === 2 ? 4 : level === 3 ? 6 : 8;
  // Measured inside the shell's own (unit sphere) space, so distance 1 is the shield's surface.
  const { group, state } = useExplorer(1);
  return (
    <group>
      {/* Emitter pylons round the base, each beaming up into the shield. */}
      {Array.from({ length: pylons }, (_, i) => {
        const a = (i / pylons) * Math.PI * 2 + Math.PI / 4, x = Math.cos(a) * (rx - 1.2), z = Math.sin(a) * (rx - 1.2), ph = [1.6, 2.4, 3.2, 4][level - 1];
        return (
          <group key={i} position={[x, 0, z]}>
            <Block size={[1.4, 0.4, 1.4]} pos={[0, 0.2, 0]} color={METAL} r={0.1} />
            <mesh position={[0, ph / 2 + 0.4, 0]}><cylinderGeometry args={[0.25, 0.45, ph, 16]} /><meshStandardMaterial color={WHITE} metalness={0.3} roughness={0.3} /></mesh>
            <Lamp pos={[0, ph + 0.6, 0]} color={color} r={0.35} />
            {level >= 2 ? <Laser from={[0, ph + 0.6, 0]} to={[-x * 0.3, ph + 9, -z * 0.3]} color={color} width={0.06} pulse={3} /> : null}
          </group>
        );
      })}
      {/* The shell: a hex wire skin over a soft glow, shaped round the tall Tower. */}
      <group scale={[rx, ry, rx]} ref={group}>
        <ShieldRipple watch={state} color={accent} />
        <mesh><icosahedronGeometry args={[1, level === 1 ? 3 : level === 2 ? 4 : 5]} /><meshBasicMaterial color={color} wireframe transparent opacity={level === 1 ? 0.22 : 0.35} toneMapped={false} /></mesh>
        <Pulse color={color} min={level === 1 ? 0.04 : 0.06} max={level === 1 ? 0.08 : 0.14} speed={1.6}>{(m) => <mesh><sphereGeometry args={[0.995, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />{m}</mesh>}</Pulse>
        {level >= 3 ? <mesh scale={0.94}><icosahedronGeometry args={[1, 2]} /><meshBasicMaterial color={accent} wireframe transparent opacity={0.12} toneMapped={false} /></mesh> : null}
      </group>
      {level >= 2 ? <RisingRings rx={rx} ry={ry} color={color} count={level >= 3 ? 4 : 2} /> : null}
      {level >= 3 ? [0.35, 0.6].map((f, i) => <group key={f} position={[0, ry * f, 0]}><Spin speed={i ? -0.4 : 0.3}><group rotation={[0.25 * (i ? -1 : 1), 0, 0]}><mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[rx * Math.sqrt(1 - f * f) + 2.5, 0.12, 8, 80]} /><meshBasicMaterial color={accent} toneMapped={false} /></mesh>{[0, Math.PI].map((r) => <group key={r} rotation={[0, r, 0]}><Lamp pos={[rx * Math.sqrt(1 - f * f) + 2.5, 0, 0]} color={color} r={0.5} /></group>)}</group></Spin></group>) : null}
      {level === 4 ? <FlashTiles rx={rx} ry={ry} color={accent} /> : null}
      {level === 4 ? <Laser from={[0, ry, 0]} to={[0, ry + 80, 0]} color={PINK} width={0.25} pulse={2} /> : null}
    </group>
  );
}

/** Each Protect the Tower style's model, by level. */
export const DEFENCE_MODELS = {
  laser_fence: LaserFence,
  laser_gate: LaserGate,
  scanner: ScannerTower,
  trip_wire: TripWire,
  drone_pad: DronePad,
  guard_dog: GuardDog,
  patrol_drone: PatrolDrone,
  sentry_bot: SentryBot,
  tower_shield: TowerShield,
} as const;
