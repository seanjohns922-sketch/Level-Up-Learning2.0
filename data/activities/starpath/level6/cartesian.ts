// Four-quadrant Cartesian geometry for Starpath Level 6 (Weeks 3-4, AC9M6SP02).
// Year 6 extends coordinates to all four quadrants with signed values on the
// standard 8x8 grid: x and y run from -4 to 4, origin at the centre.

import { coordLabel, type Point } from "@/data/activities/starpath/level5/coordinates";

export { coordLabel };
export type { Point };

export const CARTESIAN_RANGE = 4; // grid spans -4..4 on each axis (8x8)

export type Quadrant = 0 | 1 | 2 | 3 | 4; // 0 = on an axis

export function quadrant(p: Point): Quadrant {
  if (p.x > 0 && p.y > 0) return 1;
  if (p.x < 0 && p.y > 0) return 2;
  if (p.x < 0 && p.y < 0) return 3;
  if (p.x > 0 && p.y < 0) return 4;
  return 0;
}

export const QUADRANT_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: "Quadrant I", 2: "Quadrant II", 3: "Quadrant III", 4: "Quadrant IV",
};

// Signs that define each quadrant, for reasoning-without-plotting tasks.
export const QUADRANT_SIGNS: Record<1 | 2 | 3 | 4, string> = {
  1: "x positive, y positive", 2: "x negative, y positive", 3: "x negative, y negative", 4: "x positive, y negative",
};

export const inRange = (p: Point, r: number = CARTESIAN_RANGE) => Math.abs(p.x) <= r && Math.abs(p.y) <= r;

// A plain-language description of a single-axis move between two points.
export function moveDescription(from: Point, to: Point): string {
  const dx = to.x - from.x, dy = to.y - from.y;
  if (dx !== 0 && dy === 0) return `${Math.abs(dx)} ${dx > 0 ? "right" : "left"}`;
  if (dy !== 0 && dx === 0) return `${Math.abs(dy)} ${dy > 0 ? "up" : "down"}`;
  const h = dx !== 0 ? `${Math.abs(dx)} ${dx > 0 ? "right" : "left"}` : "";
  const v = dy !== 0 ? `${Math.abs(dy)} ${dy > 0 ? "up" : "down"}` : "";
  return [h, v].filter(Boolean).join(", ") || "no move";
}
