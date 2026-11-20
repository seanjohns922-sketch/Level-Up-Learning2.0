// The basketball court's shooting game: where the hoops are at each level, how likely a shot is to go
// in from a distance, and the arc the ball flies. Pure, so it can be tested. Units are world metres.
import type { PremiumHomeLevel } from "./premium-homes";

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
/** How near the court's centre the explorer must be for the Shoot button. */
export const COURT_REACH: Record<PremiumHomeLevel, number> = { 1: 5, 2: 6.5, 3: 9, 4: 9 };

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
  const makes = roll < shotChance(distance);
  // A miss clangs off the rim, a little short and to one side.
  const to: [number, number, number] = makes ? [hoop[0], RIM_HEIGHT, hoop[1]] : [hoop[0] + 0.32, RIM_HEIGHT + 0.08, hoop[1] + 0.25];
  return { from, to, makes, points: makes ? shotPoints(distance) : 0, duration: 0.7 + distance * 0.06 };
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
  const hoops = HOOPS[level].map(([hx, hz]): [number, number] => [x + hx * cos + hz * sin, z - hx * sin + hz * cos]);
  return { x, z, hoops, reach: COURT_REACH[level] };
}
