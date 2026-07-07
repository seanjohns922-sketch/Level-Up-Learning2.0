// ── Measurelands · Level 5 · Week 3 — shared helpers (Perimeter Pro) ──────────
// AC9M5M02: solve practical perimeter problems for regular and irregular shapes.
// Reuses the Level 4 Perimeter Trace (Surveyor) card + shape builders — now with
// efficient strategies, irregular (L / step) shapes and Level-5 survey contexts.

import {
  makeRect, makeSquare, makeL, perimeterOptions, randInt, randRange, choose, shuffle,
  type Shape, type Unit, type Theme,
} from "@/data/activities/year4Measurelands/week4Common";

export { perimeterOptions, randInt, randRange, choose, shuffle };
export type { Shape, Unit };

// Level 5 survey contexts. theme drives the land fill; name drives the centre
// icon (see NAME_ICON in the Surveyor card) and the label.
const L5_CONTEXTS: Array<{ theme: Theme; name: string }> = [
  { theme: "paddock", name: "paddock" },
  { theme: "paddock", name: "farm field" },
  { theme: "playground", name: "sports oval" },
  { theme: "park", name: "school oval" },
  { theme: "playground", name: "playground" },
  { theme: "garden", name: "vegetable garden" },
  { theme: "park", name: "dog park" },
  { theme: "park", name: "animal enclosure" },
  { theme: "paddock", name: "castle wall" },
  { theme: "park", name: "walking track" },
];

function withContext(s: Shape): Shape {
  const c = choose(L5_CONTEXTS);
  return { ...s, theme: c.theme, shapeName: c.name };
}

// Keep the bounding box within a pleasant aspect ratio so shapes read clearly.
function balancedWH(min: number, max: number): [number, number] {
  for (let i = 0; i < 12; i += 1) {
    const w = randRange(min, max), h = randRange(min, max);
    if (Math.max(w, h) / Math.min(w, h) <= 1.7) return [w, h];
  }
  const s = randRange(min, max);
  return [s, s];
}

/** A regular shape (rectangle or square) with an L5 survey context. */
export function regularShape(min = 8, max = 18): Shape {
  if (randInt(3) === 0) return withContext(makeSquare(randRange(min, max), "m"));
  const [w, h0] = balancedWH(min, max);
  const h = w === h0 ? (h0 + 1 <= max ? h0 + 1 : h0 - 1) : h0;
  return withContext(makeRect(w, h, "m"));
}

/** A non-square rectangle (for "measure once, use twice"). */
export function rectShape(min = 8, max = 16): Shape {
  const [w, h0] = balancedWH(min, max);
  const h = w === h0 ? (h0 + 1 <= max ? h0 + 1 : h0 - 1) : h0;
  return withContext(makeRect(w, h, "m"));
}

/** An L-shape (6 sides, all a good size) with the notch bitten from any corner
 *  — proportionate and clean, so every side is easy to read. */
export function irregularShape(min = 12, max = 18): Shape {
  const [W, H] = balancedWH(min, max);
  const a = randRange(3, Math.min(7, W - 4));
  const b = randRange(3, Math.min(7, H - 4));
  const base = makeL(W, H, a, b, "m");
  // Mirror into one of four corner orientations (edge lengths are unchanged).
  const flipX = randInt(2) === 0, flipY = randInt(2) === 0;
  const poly = base.poly.map(([x, y]) => [flipX ? W - x : x, flipY ? H - y : y] as [number, number]);
  return withContext({ ...base, poly });
}
