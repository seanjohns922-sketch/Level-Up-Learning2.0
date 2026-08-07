// Transformation geometry for Starpath Level 5 (Weeks 6-7): translations,
// reflections and rotations on a first-quadrant grid (y up). Every transform
// preserves size and shape; only position and (for reflection/rotation)
// orientation change — the invariants children reason about.

import type { Point } from "./coordinates";

export type Shape = Point[];
export type MirrorLine = { axis: "vertical" | "horizontal"; at: number };

export const translatePoint = (p: Point, dx: number, dy: number): Point => ({ x: p.x + dx, y: p.y + dy });
export const translate = (shape: Shape, dx: number, dy: number): Shape => shape.map((p) => translatePoint(p, dx, dy));

export const reflectPoint = (p: Point, line: MirrorLine): Point =>
  line.axis === "vertical" ? { x: 2 * line.at - p.x, y: p.y } : { x: p.x, y: 2 * line.at - p.y };
export const reflect = (shape: Shape, line: MirrorLine): Shape => shape.map((p) => reflectPoint(p, line));

// A quarter turn is clockwise on screen (y up): (dx, dy) -> (dy, -dx).
export const rotatePoint = (p: Point, centre: Point, deg: 90 | 180): Point => {
  const dx = p.x - centre.x;
  const dy = p.y - centre.y;
  return deg === 180 ? { x: centre.x - dx, y: centre.y - dy } : { x: centre.x + dy, y: centre.y - dx };
};
export const rotate = (shape: Shape, centre: Point, deg: 90 | 180): Shape => shape.map((p) => rotatePoint(p, centre, deg));

export const inBounds = (shape: Shape, bounds: { x: number; y: number }) =>
  shape.every((p) => p.x >= 0 && p.y >= 0 && p.x <= bounds.x && p.y <= bounds.y);

const keyOf = (p: Point) => `${p.x}:${p.y}`;
export const sameShape = (a: Shape, b: Shape) => {
  if (a.length !== b.length) return false;
  const set = new Set(a.map(keyOf));
  return b.every((p) => set.has(keyOf(p)));
};

// Small figures, each a connected set of cells normalised near the origin.
export const SHAPES: Record<string, Shape> = {
  ell: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }],
  tee: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }],
  ess: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
  corner: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 } ],
  boot: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }],
};
export const SHAPE_IDS = Object.keys(SHAPES);

export const extent = (shape: Shape) => ({
  w: Math.max(...shape.map((p) => p.x)) - Math.min(...shape.map((p) => p.x)),
  h: Math.max(...shape.map((p) => p.y)) - Math.min(...shape.map((p) => p.y)),
});
