// The basketball court's shooting game: where the hoops are at each level, how likely a shot is to go
// in from a distance, and the arc the ball flies. Pure, so it can be tested. Units are world metres.
import { PREMIUM_HOME_SPECS, type PremiumHomeLevel } from "./premium-homes";

/** The court is modelled at real size (a 3.05 m rim) and drawn bigger in the hub to match the explorer. */
export const COURT_SCALE = PREMIUM_HOME_SPECS.basketball.scale ?? 1;
/** Rim height in the court model; in the hub it is RIM_HEIGHT x COURT_SCALE. */
export const RIM_HEIGHT = 3.05;
/** The three-point line on our kid-sized court. */
export const THREE_POINT_RADIUS = 3.6;
/** Hoops in the court's own space (front of the plot is +z); the rim sits this far out from the backboard. */
export const HOOPS: Record<PremiumHomeLevel, readonly (readonly [number, number])[]> = {
  1: [[0, -2.2]],
  2: [[0, -3.6]],
  3: [[0, -5.6], [0, 5.6]],
  4: [[0, -5.6], [0, 5.6]],
};
/** The playing surface at each level, in the court's own space: centre (along z), width and depth. */
export const COURT_AREA: Record<PremiumHomeLevel, { z: number; w: number; d: number }> = {
  1: { z: -1, w: 8, d: 6.8 },
  2: { z: -0.6, w: 8.6, d: 8.6 },
  3: { z: 0, w: 8.6, d: 13.6 },
  4: { z: 0, w: 8.6, d: 13.6 },
};
/** The Shoot button shows anywhere on the playing surface, plus a step off it. */
export const courtReach = (level: PremiumHomeLevel) => Math.hypot(COURT_AREA[level].w, COURT_AREA[level].d) / 2 + 1;

/** The chance a shot goes in: lay-ups always do, then it falls off with distance (never below 15%). */
export function shotChance(distance: number) {
  if (distance <= 2) return 1;
  return Math.max(0.15, 1 - (distance - 2) * 0.11);
}
/** Two points, or three from outside the three-point line. */
export const shotPoints = (distance: number) => (distance > THREE_POINT_RADIUS ? 3 : 2);

export type Shot = { from: readonly [number, number, number]; to: readonly [number, number, number]; makes: boolean; points: number; duration: number };
/** Plans a shot from the explorer's hands to a hoop. `roll` is a random number in [0, 1). */
export function planShot(from: readonly [number, number, number], hoop: readonly [number, number], roll: number): Shot {
  const distance = Math.hypot(hoop[0] - from[0], hoop[1] - from[2]);
  // Distances are in the hub, so judge them as if on the real-size court.
  const makes = roll < shotChance(distance / COURT_SCALE);
  const rim = RIM_HEIGHT * COURT_SCALE;
  // A miss clangs off the rim, a little short and to one side.
  const to: [number, number, number] = makes ? [hoop[0], rim, hoop[1]] : [hoop[0] + 0.32, rim + 0.08, hoop[1] + 0.25];
  return { from, to, makes, points: makes ? shotPoints(distance / COURT_SCALE) : 0, duration: 0.7 + distance * 0.06 };
}
/** Where the ball is part-way through a shot (t from 0 to 1): a straight line plus a high arc. */
export function ballAt(shot: Shot, t: number): [number, number, number] {
  const k = Math.max(0, Math.min(1, t));
  const peak = 1.6 + Math.hypot(shot.to[0] - shot.from[0], shot.to[2] - shot.from[2]) * 0.18;
  return [
    shot.from[0] + (shot.to[0] - shot.from[0]) * k,
    shot.from[1] + (shot.to[1] - shot.from[1]) * k + 4 * peak * k * (1 - k),
    shot.from[2] + (shot.to[2] - shot.from[2]) * k,
  ];
}
/** The nearest hoop to a spot, from a list of hoop positions in world space. */
export function nearestHoop(x: number, z: number, hoops: readonly (readonly [number, number])[]) {
  let best: readonly [number, number] | null = null, bestDistance = Infinity;
  for (const hoop of hoops) {
    const distance = Math.hypot(hoop[0] - x, hoop[1] - z);
    if (distance < bestDistance) { best = hoop; bestDistance = distance; }
  }
  return best;
}

/** A placed court's centre and hoops in world space. The model is turned by +rotation about y. */
export function courtInWorld(placement: { gridX: number; gridZ: number; rotation: number }, level: PremiumHomeLevel, cellSize: number) {
  const x = placement.gridX * cellSize, z = placement.gridZ * cellSize, a = (placement.rotation * Math.PI) / 180;
  const cos = Math.cos(a), sin = Math.sin(a);
  const toWorld = (hx: number, hz: number): [number, number] => [x + (hx * cos + hz * sin) * COURT_SCALE, z + (-hx * sin + hz * cos) * COURT_SCALE];
  const [cx, cz] = toWorld(0, COURT_AREA[level].z);
  return { x: cx, z: cz, hoops: HOOPS[level].map(([hx, hz]) => toWorld(hx, hz)), reach: courtReach(level) * COURT_SCALE };
}
