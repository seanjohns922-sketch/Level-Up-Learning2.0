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

/** A 2-step staircase (top-right), 8 labelled sides, perimeter = 2·(W+H). */
export function makeStep(W: number, H: number, t: number, r: number, unit: Unit): Shape {
  return withContext({
    poly: [[0, 0], [W, 0], [W, H - 2 * r], [W - t, H - 2 * r], [W - t, H - r], [W - 2 * t, H - r], [W - 2 * t, H], [0, H]],
    sideLabels: [W, H - 2 * r, t, r, t, r, W - 2 * t, H],
    perimeter: 2 * (W + H),
    unit,
    theme: "garden",
    shapeName: "garden",
  });
}

/** A regular shape (rectangle or square) with an L5 survey context. */
export function regularShape(min = 6, max = 22): Shape {
  if (randInt(3) === 0) return withContext(makeSquare(randRange(min, max), "m"));
  let w = randRange(min, max), h = randRange(min, max);
  if (w === h) h = h + 1 <= max ? h + 1 : h - 1;
  return withContext(makeRect(w, h, "m"));
}

/** A non-square rectangle (for "measure once, use twice"). */
export function rectShape(min = 6, max = 20): Shape {
  let w = randRange(min, max), h = randRange(min, max);
  if (w === h) h = h + 1 <= max ? h + 1 : h - 1;
  return withContext(makeRect(w, h, "m"));
}

/** An irregular shape: an L-shape or a 2-step staircase, all sides labelled. */
export function irregularShape(min = 8, max = 20): Shape {
  if (randInt(2) === 0) {
    const W = randRange(min, max), H = randRange(min, max);
    const a = randRange(2, Math.max(2, Math.floor(W / 2)));
    const b = randRange(2, Math.max(2, Math.floor(H / 2)));
    return withContext(makeL(W, H, a, b, "m"));
  }
  const t = randRange(2, 4), r = randRange(2, 4);
  const W = randRange(2 * t + 3, max), H = randRange(2 * r + 3, max);
  return makeStep(W, H, t, r, "m");
}
