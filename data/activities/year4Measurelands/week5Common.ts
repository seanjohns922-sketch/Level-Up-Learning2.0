// Shared helpers for Measurelands Level 4 · Week 5 (Area). Rectangles and squares
// only — measured by counting equal square units (no length × width formula, no
// composite shapes). Grids capped so tiles stay legible on one screen.

export type AreaShape = {
  cells: Array<[number, number]>;
  gridW: number;
  gridH: number;
  label: string;
  emoji: string;
  area: number;
};

export type Theme = { label: string; emoji: string };
export const THEMES: Theme[] = [
  { label: "garden", emoji: "🌱" },
  { label: "lawn", emoji: "🌿" },
  { label: "classroom", emoji: "🪑" },
  { label: "playground", emoji: "🛝" },
  { label: "picnic rug", emoji: "🧺" },
  { label: "veggie patch", emoji: "🥕" },
  { label: "sandpit", emoji: "🏖️" },
  { label: "dog park", emoji: "🐕" },
];

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

const MAX_SIDE = 6;
const MAX_AREA = 30;

export function makeRect(w: number, h: number, theme: Theme): AreaShape {
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < h; r += 1) for (let c = 0; c < w; c += 1) cells.push([c, r]);
  return { cells, gridW: w, gridH: h, label: theme.label, emoji: theme.emoji, area: w * h };
}

/** A random rectangle or square, area ≤ 30, side ≤ 6. */
export function pickShape(opts?: { min?: number; max?: number; maxArea?: number; square?: boolean; excludeLabels?: string[] }): AreaShape {
  const min = opts?.min ?? 2;
  const max = opts?.max ?? MAX_SIDE;
  const maxArea = opts?.maxArea ?? MAX_AREA;
  const exclude = opts?.excludeLabels ?? [];
  const themes = THEMES.filter((t) => !exclude.includes(t.label));
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const theme = choose(themes.length ? themes : THEMES);
    const w = randRange(min, max);
    const h = opts?.square ? w : randRange(min, max);
    if (w * h <= maxArea && w * h >= 4) return makeRect(w, h, theme);
  }
  return makeRect(3, 4, choose(themes.length ? themes : THEMES));
}

/** Another rectangle with the SAME area but different dimensions, if possible. */
export function sameAreaShape(area: number, avoid: { w: number; h: number }, theme: Theme): AreaShape | null {
  const dims: Array<[number, number]> = [];
  for (let w = 2; w <= MAX_SIDE; w += 1) {
    if (area % w !== 0) continue;
    const h = area / w;
    if (h < 2 || h > MAX_SIDE) continue;
    if ((w === avoid.w && h === avoid.h) || (w === avoid.h && h === avoid.w)) continue;
    dims.push([w, h]);
  }
  if (!dims.length) return null;
  const [w, h] = choose(dims);
  return makeRect(w, h, theme);
}

/** n rectangles with distinct labels AND distinct areas. */
export function pickDistinct(n: number, opts?: { min?: number; max?: number; maxArea?: number }): AreaShape[] {
  const chosen: AreaShape[] = [];
  for (let attempt = 0; attempt < 200 && chosen.length < n; attempt += 1) {
    const s = pickShape({ ...opts, excludeLabels: chosen.map((c) => c.label) });
    if (chosen.some((c) => c.area === s.area)) continue;
    chosen.push(s);
  }
  return chosen;
}

/** Count options: the true area + two distractors (one is the perimeter). */
export function countOptions(shape: AreaShape): { options: number[]; correct: number } {
  const area = shape.area;
  const perimeter = 2 * (shape.gridW + shape.gridH);
  const cands = new Set<number>();
  if (perimeter !== area && perimeter > 0) cands.add(perimeter); // area-vs-perimeter trap
  cands.add(area + shape.gridW); // one row/column too many
  cands.add(Math.max(1, area - shape.gridH));
  cands.add(area + 2);
  const distractors = shuffle([...cands].filter((n) => n > 0 && n !== area)).slice(0, 2);
  while (distractors.length < 2) distractors.push(area + distractors.length + 3);
  return { options: shuffle([area, ...distractors]), correct: area };
}
