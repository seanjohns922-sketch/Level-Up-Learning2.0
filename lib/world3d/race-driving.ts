// Racing on a learner's own Race Kit track: the course read from what they placed and painted,
// the kart's movement each frame, and lap timing through the start line. Pure, so it can be tested.
import { CENTRAL_WORLD_GRID, type CentralWorldGroundTile, type CentralWorldPlacement } from "./central-world-layout";
import { RACE_SCALE, TRACK_TILE } from "./race-kit";

/** World metres per second. Full speed needs tarmac; grass is slow. */
export const KART_TOP_SPEED = 17;
export const KART_OFF_TRACK_SPEED = 6.5;
export const KART_BOOST_SPEED = 26;
export const KART_REVERSE_SPEED = 5;
const ACCELERATION = 14;
const BRAKING = 26;
const COASTING = 6;
/** Radians per second at full lock. */
const STEERING = 2.5;
const GRAVITY = 24;
const JUMP_SPEED = 8.5;
const BOOST_SECONDS = 1.3;
/** A lap only counts once the kart has been this far from the start line. */
export const LAP_ARM_DISTANCE = 14;
const KART_RADIUS = 0.8;

type Frame = { x: number; z: number; cos: number; sin: number };
type Box = Frame & { halfX: number; halfZ: number };
type Bridge = Frame & { halfWidth: number; halfLength: number; height: number };
export type RaceStart = Frame & { halfWidth: number };
export type RaceCourse = { track: ReadonlySet<string>; boosts: Box[]; jumps: Box[]; bridges: Bridge[]; solids: Box[] };

export type PlacedRaceItem = { assetKey: string; gridX: number; gridZ: number; rotation: CentralWorldPlacement["rotation"] };

const cell = CENTRAL_WORLD_GRID.cellSize;
const cellKey = (x: number, z: number) => `${Math.round(x / cell)}:${Math.round(z / cell)}`;

function frame({ gridX, gridZ, rotation }: PlacedRaceItem): Frame {
  const a = (rotation * Math.PI) / 180;
  return { x: gridX * cell, z: gridZ * cell, cos: Math.cos(a), sin: Math.sin(a) };
}
/** A world point in a piece's own frame (the model is turned by +rotation about y). */
function toLocal(f: Frame, x: number, z: number) {
  const dx = x - f.x, dz = z - f.z;
  return { lx: dx * f.cos - dz * f.sin, lz: dx * f.sin + dz * f.cos };
}
function toWorld(f: Frame, lx: number, lz: number) {
  return { x: f.x + lx * f.cos + lz * f.sin, z: f.z - lx * f.sin + lz * f.cos };
}
const inBox = (b: Box, x: number, z: number, pad = 0) => {
  const { lx, lz } = toLocal(b, x, z);
  return Math.abs(lx) <= b.halfX + pad && Math.abs(lz) <= b.halfZ + pad;
};

/** Sizes in model units, from the Race Kit models (one unit is one build cell). */
const SOLID_SIZES: Record<string, [number, number]> = {
  race_tyres: [0.9, 0.15],
  race_grandstand: [1.9, 0.7],
  race_floodlight: [0.15, 0.15],
  race_podium: [0.58, 0.2],
};
const PAD = 0.45, BRIDGE = { halfWidth: 0.52, halfLength: 1.8, height: 0.9 };
const START_HALF_WIDTH = 1.75;

/** The course: painted tarmac plus the placed pieces that change how the kart drives. */
export function buildRaceCourse(items: readonly PlacedRaceItem[], tiles: readonly CentralWorldGroundTile[]): RaceCourse {
  const course: RaceCourse = { track: new Set(tiles.filter((t) => t.tileType === TRACK_TILE).map((t) => `${t.gridX}:${t.gridZ}`)), boosts: [], jumps: [], bridges: [], solids: [] };
  for (const item of items) {
    const f = frame(item), s = RACE_SCALE;
    if (item.assetKey === "race_boost") course.boosts.push({ ...f, halfX: PAD * s, halfZ: PAD * s });
    else if (item.assetKey === "race_jump") course.jumps.push({ ...f, halfX: PAD * s, halfZ: PAD * s });
    else if (item.assetKey === "race_bridge") course.bridges.push({ ...f, halfWidth: BRIDGE.halfWidth * s, halfLength: BRIDGE.halfLength * s, height: BRIDGE.height * s });
    else if (SOLID_SIZES[item.assetKey]) course.solids.push({ ...f, halfX: SOLID_SIZES[item.assetKey][0] * s, halfZ: SOLID_SIZES[item.assetKey][1] * s });
  }
  return course;
}

export function raceStartLine(start: PlacedRaceItem): RaceStart {
  return { ...frame(start), halfWidth: START_HALF_WIDTH * RACE_SCALE };
}
/** Karts line up just behind the line, facing the start lights (the model's -z). */
export function raceGridPosition(start: RaceStart) {
  const { x, z } = toWorld(start, 0, 3);
  return { x, z, heading: Math.atan2(-start.sin, -start.cos) };
}
/** Where the explorer steps out after a race: beside the gantry, close enough to race again. */
export function raceExitPosition(start: RaceStart) {
  return toWorld(start, start.halfWidth + 2, 1);
}

function bridgeDeck(b: Bridge, x: number, z: number) {
  const { lx, lz } = toLocal(b, x, z);
  if (Math.abs(lx) > b.halfWidth || Math.abs(lz) > b.halfLength) return null;
  return Math.sin(((lz + b.halfLength) / (2 * b.halfLength)) * Math.PI) * b.height;
}
/** Height of the course itself at a spot: a bridge deck, or 0. */
export function courseHeight(course: RaceCourse, x: number, z: number) {
  let best = 0;
  for (const b of course.bridges) best = Math.max(best, bridgeDeck(b, x, z) ?? 0);
  return best;
}
export function onTrack(course: RaceCourse, x: number, z: number) {
  return course.track.has(cellKey(x, z)) || course.bridges.some((b) => bridgeDeck(b, x, z) !== null);
}

export type KartState = { x: number; z: number; y: number; heading: number; speed: number; vy: number; airborne: boolean; boost: number };
export type KartInput = { throttle: number; steer: number };
export type KartWorld = { groundHeightAt?: (x: number, z: number) => number; canDriveAt: (x: number, z: number) => boolean };

export function newKart(x: number, z: number, heading: number): KartState {
  return { x, z, y: 0, heading, speed: 0, vy: 0, airborne: false, boost: 0 };
}

const approach = (value: number, target: number, rate: number) => value < target ? Math.min(target, value + rate) : Math.max(target, value - rate);

/** One frame of driving. Throttle and steer run from -1 to 1 (steer +1 turns right). */
export function stepKart(kart: KartState, input: KartInput, course: RaceCourse, world: KartWorld, dt: number): KartState {
  const throttle = Math.max(-1, Math.min(1, input.throttle)), steer = Math.max(-1, Math.min(1, input.steer));
  const tarmac = onTrack(course, kart.x, kart.z);
  let boost = Math.max(0, kart.boost - dt);
  if (!kart.airborne && course.boosts.some((b) => inBox(b, kart.x, kart.z))) boost = BOOST_SECONDS;
  const top = boost > 0 ? KART_BOOST_SPEED : tarmac ? KART_TOP_SPEED : KART_OFF_TRACK_SPEED;

  let speed = kart.speed;
  if (boost > 0 && speed < top) speed = approach(speed, top, ACCELERATION * 3 * dt);
  else if (throttle > 0) speed = speed < 0 ? approach(speed, 0, BRAKING * dt) : approach(speed, top * throttle, (speed > top ? BRAKING : ACCELERATION) * dt);
  else if (throttle < 0) speed = speed > 0 ? approach(speed, 0, BRAKING * dt) : approach(speed, -KART_REVERSE_SPEED, ACCELERATION * dt);
  else speed = approach(speed, 0, (speed > top ? BRAKING : COASTING) * dt);

  // Steering needs the kart to be rolling, and flips when reversing, like a real car.
  const grip = kart.airborne ? 0.3 : Math.min(1, Math.abs(speed) / 5);
  const heading = kart.heading - steer * STEERING * grip * Math.sign(speed || 1) * dt;

  let x = kart.x + Math.sin(heading) * speed * dt;
  let z = kart.z + Math.cos(heading) * speed * dt;
  const blocked = (px: number, pz: number) => !world.canDriveAt(px, pz) || course.solids.some((s) => inBox(s, px, pz, KART_RADIUS));
  if (blocked(x, z)) {
    // Slide along what was hit if one direction is free, otherwise bounce off it.
    if (!blocked(x, kart.z)) z = kart.z;
    else if (!blocked(kart.x, z)) x = kart.x;
    else { x = kart.x; z = kart.z; }
    speed *= x === kart.x && z === kart.z ? -0.35 : 0.7;
  }

  const ground = (world.groundHeightAt?.(x, z) ?? 0) + courseHeight(course, x, z);
  let y = kart.y, vy = kart.vy, airborne = kart.airborne;
  if (!airborne && speed > 4 && course.jumps.some((j) => inBox(j, x, z))) { airborne = true; vy = JUMP_SPEED * Math.min(1.25, speed / KART_TOP_SPEED + 0.35); }
  if (airborne) {
    vy -= GRAVITY * dt;
    y += vy * dt;
    if (y <= ground) { y = ground; vy = 0; airborne = false; }
  } else if (ground < y - 0.6) {
    // Off the edge of a bridge: fall rather than snap down.
    airborne = true; vy = 0;
  } else y = ground;
  return { x, z, y, heading, speed, vy, airborne, boost };
}

/* ───────── Laps ───────── */

export type LapState = { armed: boolean; laps: number; lapStartedAt: number; lastLap: number | null; bestLap: number | null };
export function newLaps(startedAt: number, bestLap: number | null = null): LapState {
  return { armed: false, laps: 0, lapStartedAt: startedAt, lastLap: null, bestLap };
}

/** Records a lap when the kart crosses the start line forwards, after going far enough round.
 * `time` is in seconds. Returns the same state when nothing changed. */
export function updateLaps(laps: LapState, start: RaceStart, from: { x: number; z: number }, to: { x: number; z: number }, time: number): LapState {
  const a = toLocal(start, from.x, from.z), b = toLocal(start, to.x, to.z);
  let next = laps;
  if (!laps.armed && Math.hypot(b.lx, b.lz) > LAP_ARM_DISTANCE) next = { ...laps, armed: true };
  // Forwards is towards the model's -z: from the grid side (+z) across the line.
  const crossed = a.lz > 0 && b.lz <= 0 && Math.abs(b.lx) <= start.halfWidth + 1;
  if (!crossed || !next.armed) return next;
  const lap = time - next.lapStartedAt;
  return { armed: false, laps: next.laps + 1, lapStartedAt: time, lastLap: lap, bestLap: next.bestLap === null ? lap : Math.min(next.bestLap, lap) };
}

export function formatLapTime(seconds: number | null) {
  if (seconds === null || !Number.isFinite(seconds)) return "--:--.--";
  const m = Math.floor(seconds / 60), s = seconds - m * 60;
  return `${m}:${s.toFixed(2).padStart(5, "0")}`;
}
