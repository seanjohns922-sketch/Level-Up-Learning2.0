// The Sports set's games: where each court's goal, ring or target is at each level, how likely a shot
// is to score from a distance, what it's worth, and the button that plays it. Pure, so it can be
// tested. Units are world metres; targets are in the model's own space (front of the plot is +z).
import { ballAt, type Shot } from "./basketball";
import type { PremiumHomeLevel } from "./premium-homes";

export const SPORT_KINDS = ["tennis", "soccer", "footy", "netball"] as const;
export type SportKind = (typeof SPORT_KINDS)[number];
type Target = readonly [number, number, number];

/** Where you aim at each level: the goal mouth, the netball ring, the far service court or the hit-up wall. */
export const SPORT_TARGETS: Record<SportKind, Record<PremiumHomeLevel, readonly Target[]>> = {
  tennis: { 1: [[0, 1.5, -4.0]], 2: [[-5, 0.12, 0], [5, 0.12, 0]], 3: [[-5, 0.12, 0], [5, 0.12, 0]], 4: [[-5, 0.12, 0], [5, 0.12, 0]] },
  soccer: { 1: [[0, 0.6, -7.8], [0, 0.6, 7.8]], 2: [[-10.5, 1, 0], [10.5, 1, 0]], 3: [[-12.5, 1, 0], [12.5, 1, 0]], 4: [[-12.5, 1, 0], [12.5, 1, 0]] },
  footy: { 1: [[0, 2, -4.4]], 2: [[0, 3.5, -7.1]], 3: [[0, 3.5, -7.1]], 4: [[0, 3.5, -7.1]] },
  netball: { 1: [[0, 3.05, -2.65]], 2: [[-4.95, 3.05, 0]], 3: [[-10.25, 3.05, 0], [10.25, 3.05, 0]], 4: [[-10.25, 3.05, 0], [10.25, 3.05, 0]] },
};
/** The button each sport shows when you're on it. */
export const SPORT_ACTION: Record<SportKind, string> = { tennis: "SERVE", soccer: "KICK", footy: "KICK", netball: "SHOOT" };

/** The chance a shot scores from a distance (metres): close is easy, long is a long shot, never hopeless. */
export function sportChance(kind: SportKind, distance: number) {
  switch (kind) {
    case "netball": return distance <= 2 ? 1 : Math.max(0.15, 1 - (distance - 2) * 0.12);
    case "soccer": return Math.max(0.2, 1 - Math.max(0, distance - 5) * 0.05);
    case "footy": return Math.max(0.2, 1 - Math.max(0, distance - 8) * 0.06);
    case "tennis": return 0.8;
  }
}

export type SportShot = Shot & { sport: SportKind; label: string };
/**
 * Plans a shot from where the explorer stands to a target. `roll` and `roll2` are random numbers in
 * [0, 1): the first decides if it scores, the second whether a missed footy kick is still a behind.
 */
export function planSportShot(kind: SportKind, from: readonly [number, number, number], target: Target, roll: number, roll2 = 1): SportShot {
  const distance = Math.hypot(target[0] - from[0], target[2] - from[2]);
  const makes = roll < sportChance(kind, distance);
  const behind = kind === "footy" && !makes && roll2 < 0.5;
  // A miss goes wide (a behind just wide of the big posts), long, or into the net.
  const wide = behind ? 2.4 : 3.2;
  const to: [number, number, number] = makes ? [target[0], target[1], target[2]] : [target[0] + wide, Math.max(0.12, target[1] - 0.4), target[2] + 0.6];
  const points = makes ? (kind === "footy" ? 6 : 1) : behind ? 1 : 0;
  const label = makes
    ? kind === "tennis" ? "ACE! +1" : kind === "footy" ? "GOAL! +6" : "GOAL! +1"
    : behind ? "Behind! +1" : kind === "tennis" ? "Out!" : "So close!";
  return { from, to, makes: makes || behind, points, duration: 0.6 + distance * 0.045, sport: kind, label };
}
/** Where the ball is part-way through a sport shot: kicks fly lower than lobs. */
export function sportBallAt(shot: SportShot, t: number): [number, number, number] {
  const [x, y, z] = ballAt(shot, t);
  if (shot.sport === "netball") return [x, y, z];
  const k = Math.max(0, Math.min(1, t));
  const peak = 1.6 + Math.hypot(shot.to[0] - shot.from[0], shot.to[2] - shot.from[2]) * 0.18;
  const lower = shot.sport === "tennis" ? 0.35 : 0.55;
  return [x, y - 4 * peak * k * (1 - k) * (1 - lower), z];
}

/** Picks what to aim at: the nearest goal or ring, but in tennis the court on the far side of the net. */
export function chooseTarget(kind: SportKind, x: number, z: number, targets: readonly Target[]) {
  let best: Target | null = null, bestDistance = kind === "tennis" ? -Infinity : Infinity;
  for (const target of targets) {
    const distance = Math.hypot(target[0] - x, target[2] - z);
    if (kind === "tennis" ? distance > bestDistance : distance < bestDistance) { best = target; bestDistance = distance; }
  }
  return best;
}

/** A placed court's targets in world space, around its centre and turned by its rotation. */
export function sportInWorld(kind: SportKind, level: PremiumHomeLevel, centre: readonly [number, number], rotation: number, plot: readonly [number, number]) {
  const a = (rotation * Math.PI) / 180, cos = Math.cos(a), sin = Math.sin(a);
  const toWorld = ([tx, ty, tz]: Target): [number, number, number] => [centre[0] + tx * cos + tz * sin, ty, centre[1] - tx * sin + tz * cos];
  return { x: centre[0], z: centre[1], targets: SPORT_TARGETS[kind][level].map(toWorld), reach: Math.hypot(plot[0], plot[1]) / 2 + 1 };
}
