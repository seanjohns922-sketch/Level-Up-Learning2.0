// Shared shape builders + helpers for Measurelands Level 4 · Week 4 (Perimeter).
// Themed "land" shapes with labelled whole-number sides; perimeter = add the
// sides (no formula). Squares, rectangles and simple L-shapes.

export type Unit = "cm" | "m";
export type Theme = "garden" | "paddock" | "playground" | "pool" | "park";
export type Shape = {
  poly: Array<[number, number]>;
  sideLabels: number[];
  perimeter: number;
  unit: Unit;
  theme: Theme;
  shapeName: string;
};

export function randInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}
export function randRange(min: number, max: number) {
  return min + randInt(max - min + 1);
}
export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}
export function choose<T>(items: T[]): T {
  return items[randInt(items.length)]!;
}

const CM_THEMES: Array<{ theme: Theme; name: string }> = [
  { theme: "garden", name: "garden bed" },
  { theme: "pool", name: "fish pond" },
  { theme: "park", name: "picnic rug" },
];
const M_THEMES: Array<{ theme: Theme; name: string }> = [
  { theme: "garden", name: "garden" },
  { theme: "paddock", name: "paddock" },
  { theme: "playground", name: "playground" },
  { theme: "pool", name: "swimming pool" },
  { theme: "park", name: "dog park" },
];

function themeFor(unit: Unit): { theme: Theme; name: string } {
  return choose(unit === "cm" ? CM_THEMES : M_THEMES);
}

export function makeRect(w: number, h: number, unit: Unit): Shape {
  const t = themeFor(unit);
  return {
    poly: [[0, 0], [w, 0], [w, h], [0, h]],
    sideLabels: [w, h, w, h],
    perimeter: 2 * (w + h),
    unit,
    theme: t.theme,
    shapeName: t.name,
  };
}

export function makeSquare(s: number, unit: Unit): Shape {
  return makeRect(s, s, unit);
}

/** L-shape = W×H rectangle with an a×b bite out of the top-right corner. */
export function makeL(W: number, H: number, a: number, b: number, unit: Unit): Shape {
  const t = themeFor(unit);
  return {
    poly: [[0, 0], [W, 0], [W, H - b], [W - a, H - b], [W - a, H], [0, H]],
    sideLabels: [W, H - b, a, b, W - a, H],
    perimeter: 2 * (W + H),
    unit,
    theme: t.theme,
    shapeName: t.name,
  };
}

/** A random shape for the given unit and difficulty band. */
export function randomShape(unit: Unit, opts?: { allowL?: boolean; min?: number; max?: number }): Shape {
  const min = opts?.min ?? (unit === "cm" ? 3 : 5);
  const max = opts?.max ?? (unit === "cm" ? 9 : 22);
  const kind = randInt(opts?.allowL ? 3 : 2); // 0 rect, 1 square, 2 L
  if (kind === 1) return makeSquare(randRange(min, max), unit);
  if (kind === 2) {
    const W = randRange(min + 3, max);
    const H = randRange(min + 3, max);
    const a = randRange(2, Math.max(2, W - 2));
    const b = randRange(2, Math.max(2, H - 2));
    return makeL(W, H, a, b, unit);
  }
  let w = randRange(min, max);
  let h = randRange(min, max);
  if (w === h) h = h + 1 <= max ? h + 1 : h - 1;
  return makeRect(w, h, unit);
}

/** Three perimeter options: correct + two misconception distractors. */
export function perimeterOptions(shape: Shape): { options: number[]; correct: number } {
  const correct = shape.perimeter;
  const sides = shape.sideLabels;
  const smallest = Math.min(...sides);
  const cands = new Set<number>();
  cands.add(correct - smallest); // forgot a side
  // two-sides-only (rectangles): width + height
  if (sides.length === 4) cands.add(sides[0]! + sides[1]!);
  // area value (rectangles) — separates perimeter from area
  if (sides.length === 4) cands.add(sides[0]! * sides[1]!);
  cands.add(correct + choose(sides)); // added a side twice
  const distractors = shuffle([...cands].filter((n) => n > 0 && n !== correct)).slice(0, 2);
  while (distractors.length < 2) distractors.push(correct + distractors.length + 1);
  return { options: shuffle([correct, ...distractors]), correct };
}
