/** Relic Rider physics and tracks. A side-on stunt bike: two wheels and a body
 *  point held in a rigid triangle (Verlet integration), rolling over a terrain
 *  made of line segments. Throttle drives the back wheel along the ground;
 *  leaning tips the bike, on the ground or in the air. A crash is the rider's
 *  head touching the ground or falling into a pit. A full turn in the air is a
 *  flip and takes a second off the clock. Pure maths, no rendering. */

export type Vec = { x: number; y: number };
export type Segment = { a: Vec; b: Vec };
export type Track = { name: string; polylines: Vec[][]; finishX: number; pits: Array<{ x0: number; x1: number }>; par: number };
export type Controls = { throttle: boolean; brake: boolean; leanBack: boolean; leanForward: boolean };

type Particle = { p: Vec; prev: Vec };
export type Bike = {
  rear: Particle; front: Particle; body: Particle;
  grounded: boolean; airTurn: number; lastAngle: number;
  crashed: boolean; finished: boolean; flips: number;
};

export const WHEEL_R = 0.42;
const WHEELBASE = 1.7;
const BODY_UP = 0.95; // body point above the wheel line
const GRAVITY = -24;
const ENGINE = 34;
const BRAKE = 30;
const LEAN = 16;
const MAX_SPEED = 26;

const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y });
const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });
const mul = (a: Vec, k: number): Vec => ({ x: a.x * k, y: a.y * k });
const len = (a: Vec) => Math.hypot(a.x, a.y);
const norm = (a: Vec) => { const l = len(a) || 1; return { x: a.x / l, y: a.y / l }; };

// ── Tracks ────────────────────────────────────────────────────────────────
type Piece = ["flat", number] | ["ramp", number, number] | ["hill", number, number] | ["gap", number] | ["steps", number, number, number];

function buildTrack(name: string, pieces: Piece[]): Track {
  const polylines: Vec[][] = [];
  const pits: Array<{ x0: number; x1: number }> = [];
  let line: Vec[] = [{ x: -8, y: 0 }, { x: 0, y: 0 }];
  let x = 0, y = 0;
  for (const piece of pieces) {
    if (piece[0] === "flat") { x += piece[1]; line.push({ x, y }); }
    else if (piece[0] === "ramp") { x += piece[1]; y += piece[2]; line.push({ x, y }); }
    else if (piece[0] === "hill") {
      const [, length, height] = piece; const x0 = x, y0 = y;
      for (let i = 1; i <= 16; i += 1) { const t = i / 16; line.push({ x: x0 + length * t, y: y0 + Math.sin(t * Math.PI) * height }); }
      x += length;
    } else if (piece[0] === "steps") {
      const [, count, run, rise] = piece;
      for (let i = 0; i < count; i += 1) { x += run * 0.3; y += rise; line.push({ x, y }); x += run * 0.7; line.push({ x, y }); }
    } else {
      polylines.push(line);
      pits.push({ x0: x, x1: x + piece[1] });
      x += piece[1];
      line = [{ x, y }];
    }
  }
  x += 14; line.push({ x, y });
  polylines.push(line);
  const finishX = x - 6;
  return { name, polylines, finishX, pits, par: Math.round((finishX / 13) * 10) / 10 };
}

export const RIDER_TRACKS: Track[] = [
  buildTrack("Castle Courtyard", [["flat", 30], ["ramp", 8, 2], ["flat", 6], ["ramp", 8, -2], ["flat", 20], ["hill", 14, 2.5], ["flat", 30]]),
  buildTrack("The First Leap", [["flat", 24], ["ramp", 8, 2.2], ["gap", 7], ["flat", 4], ["ramp", 6, -2.2], ["flat", 22], ["hill", 12, 3], ["flat", 26]]),
  buildTrack("Rolling Ramparts", [["flat", 18], ["hill", 18, 2.6], ["flat", 6], ["hill", 18, 3], ["flat", 10], ["ramp", 10, 3], ["gap", 8], ["flat", 4], ["ramp", 10, -3], ["flat", 26]]),
  buildTrack("Fire Pit Run", [["flat", 20], ["ramp", 10, 3], ["gap", 10], ["flat", 6], ["ramp", 10, -3], ["flat", 12], ["ramp", 8, 2.5], ["gap", 9], ["flat", 20]]),
  buildTrack("Tower Steps", [["flat", 18], ["steps", 5, 5, 0.9], ["flat", 8], ["ramp", 12, -4.5], ["flat", 14], ["hill", 16, 4], ["flat", 24]]),
  buildTrack("The Great Jump", [["flat", 24], ["ramp", 14, 5], ["gap", 11], ["flat", 8], ["ramp", 14, -5], ["flat", 16], ["hill", 16, 2.6], ["flat", 6], ["hill", 16, 2.6], ["flat", 24]]),
  buildTrack("Broken Bridge", [["flat", 16], ["ramp", 8, 2], ["gap", 7], ["flat", 5], ["ramp", 5, 1.2], ["gap", 6], ["flat", 6], ["ramp", 8, -3.2], ["flat", 12], ["ramp", 10, 3.5], ["gap", 11], ["flat", 22]]),
  buildTrack("Guardian's Gauntlet", [["flat", 18], ["hill", 16, 2.2], ["flat", 12], ["ramp", 12, 4], ["gap", 10], ["flat", 6], ["steps", 4, 5, 0.8], ["ramp", 14, -7.2], ["flat", 10], ["ramp", 10, 3], ["gap", 11], ["flat", 24]]),
];

export function trackSegments(track: Track): Segment[] {
  const out: Segment[] = [];
  for (const line of track.polylines) for (let i = 0; i + 1 < line.length; i += 1) out.push({ a: line[i], b: line[i + 1] });
  return out;
}

// ── Bike ──────────────────────────────────────────────────────────────────
export function newBike(): Bike {
  const rear = { x: 0, y: WHEEL_R }, front = { x: WHEELBASE, y: WHEEL_R }, body = { x: WHEELBASE * 0.45, y: WHEEL_R + BODY_UP };
  return {
    rear: { p: rear, prev: { ...rear } }, front: { p: front, prev: { ...front } }, body: { p: body, prev: { ...body } },
    grounded: true, airTurn: 0, lastAngle: 0, crashed: false, finished: false, flips: 0,
  };
}

export function bikeAngle(bike: Bike) {
  const d = sub(bike.front.p, bike.rear.p);
  return Math.atan2(d.y, d.x);
}

/** The rider's head: above the body point, perpendicular to the wheel line. */
export function headOf(bike: Bike): Vec {
  const along = norm(sub(bike.front.p, bike.rear.p));
  const up = { x: -along.y, y: along.x };
  return add(bike.body.p, add(mul(up, 0.75), mul(along, -0.1)));
}

function closest(p: Vec, s: Segment): Vec {
  const ab = sub(s.b, s.a);
  const t = Math.max(0, Math.min(1, ((p.x - s.a.x) * ab.x + (p.y - s.a.y) * ab.y) / (ab.x * ab.x + ab.y * ab.y || 1)));
  return add(s.a, mul(ab, t));
}

function nearSegments(segments: Segment[], x: number) {
  return segments.filter((s) => Math.max(s.a.x, s.b.x) > x - 3 && Math.min(s.a.x, s.b.x) < x + 3);
}

function constrain(a: Particle, b: Particle, rest: number) {
  const d = sub(b.p, a.p);
  const l = len(d) || 1;
  const diff = (l - rest) / l / 2;
  a.p = add(a.p, mul(d, diff));
  b.p = sub(b.p, mul(d, diff));
}

/** Push a wheel out of the ground; returns the ground's direction under it, or null. */
function collideWheel(w: Particle, segments: Segment[]): Vec | null {
  let tangent: Vec | null = null;
  for (const s of nearSegments(segments, w.p.x)) {
    const c = closest(w.p, s);
    const d = sub(w.p, c);
    const dist = len(d);
    if (dist < WHEEL_R) {
      const n = dist > 1e-6 ? mul(d, 1 / dist) : { x: 0, y: 1 };
      w.p = add(c, mul(n, WHEEL_R));
      // remove velocity into the ground, keep rolling speed (slight friction)
      const v = sub(w.p, w.prev);
      const vn = v.x * n.x + v.y * n.y;
      const t = { x: n.y, y: -n.x };
      const vt = (v.x * t.x + v.y * t.y) * 0.99985; // rolling resistance (applied every sub-step)
      const newV = add(mul(t, vt), mul(n, Math.max(0, vn) * 0.1));
      w.prev = sub(w.p, newV);
      tangent = t.x >= 0 ? t : mul(t, -1);
    }
  }
  return tangent;
}

function push(w: Particle, accel: Vec, dt: number) {
  w.prev = sub(w.prev, mul(accel, dt * dt));
}

/** Advance the bike by dt seconds (sub-stepped). */
export function stepBike(bike: Bike, track: Track, segments: Segment[], controls: Controls, dt: number) {
  if (bike.crashed || bike.finished) return bike;
  const steps = 6;
  const h = dt / steps;
  for (let s = 0; s < steps; s += 1) {
    for (const part of [bike.rear, bike.front, bike.body]) {
      const v = sub(part.p, part.prev);
      const speed = len(v) / h;
      const capped = speed > MAX_SPEED ? mul(v, MAX_SPEED / speed) : v;
      part.prev = { ...part.p };
      part.p = add(add(part.p, capped), { x: 0, y: GRAVITY * h * h });
    }
    const rearGround = collideWheel(bike.rear, segments);
    const frontGround = collideWheel(bike.front, segments);
    bike.grounded = Boolean(rearGround || frontGround);
    if (rearGround && controls.throttle) push(bike.rear, mul(rearGround, ENGINE), h);
    if (rearGround && controls.brake) push(bike.rear, mul(rearGround, -BRAKE), h);
    // lean: push the wheels in opposite directions across the bike
    const along = norm(sub(bike.front.p, bike.rear.p));
    const up = { x: -along.y, y: along.x };
    const lean = (controls.leanBack ? 1 : 0) - (controls.leanForward ? 1 : 0);
    if (lean) {
      const k = LEAN * (bike.grounded ? 0.55 : 1) * lean;
      push(bike.front, mul(up, k), h);
      push(bike.rear, mul(up, -k), h);
    }
    for (let i = 0; i < 4; i += 1) {
      constrain(bike.rear, bike.front, WHEELBASE);
      constrain(bike.rear, bike.body, Math.hypot(WHEELBASE * 0.45, BODY_UP));
      constrain(bike.front, bike.body, Math.hypot(WHEELBASE * 0.55, BODY_UP));
    }
  }
  // flips: count a full turn made while off the ground
  const angle = bikeAngle(bike);
  let delta = angle - bike.lastAngle;
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  bike.lastAngle = angle;
  if (!bike.grounded) {
    bike.airTurn += delta;
    if (Math.abs(bike.airTurn) >= Math.PI * 2 - 0.35) { bike.flips += 1; bike.airTurn = 0; }
  } else bike.airTurn = 0;
  // crash: head hits the ground, or a fall into a pit
  const head = headOf(bike);
  for (const seg of nearSegments(segments, head.x)) {
    if (len(sub(head, closest(head, seg))) < 0.32) bike.crashed = true;
  }
  if (bike.body.p.y < -14) bike.crashed = true;
  if (bike.rear.p.x >= track.finishX) bike.finished = true;
  return bike;
}
