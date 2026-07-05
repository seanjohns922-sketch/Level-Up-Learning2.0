import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { SIMPLE_SHAPES, COMPLEX_SHAPES, ALL_SHAPES, type ShapeDef } from "@/data/activities/year3Measurelands/perimeterShapes";

type AreaTask = Extract<PracticeTask, { kind: "area" }>;

function randInt(n: number) { return Math.floor(Math.random() * n); }
function shuffle<T>(a: T[]): T[] { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; }
function pick(pool: ShapeDef[]): ShapeDef { return pool[randInt(pool.length)]!; }
function choose<T>(a: T[]): T { return a[randInt(a.length)]!; }
function area(s: ShapeDef) { return s.cells.length; }

/** n cells arranged w-wide, row by row (a compact composite shape). */
function makeCells(n: number, w: number): { cells: Array<[number, number]>; gridW: number; gridH: number } {
  const cells: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) cells.push([i % w, Math.floor(i / w)]);
  return { cells, gridW: Math.min(n, w), gridH: Math.ceil(n / w) };
}

export function buildIntro(): AreaTask {
  const s = SIMPLE_SHAPES[0]!;
  return { kind: "area", scene: "intro", prompt: "What is area?", speakText: "Professor Gauge says: imagine covering a garden with square tiles. The space you cover inside is called the area. Area is different from perimeter — perimeter is the outside edge, area is the inside space.", badgeLabel: "Meazurex Mission", cells: s.cells, gridW: s.gridW, gridH: s.gridH, label: s.label, emoji: s.emoji, feedback: { correct: "Let's build!", wrong: "Let's build!" } };
}

export function buildWhichPart(pool: ShapeDef[]): AreaTask {
  const s = pick(pool);
  const options = shuffle([{ id: "inside", fillType: "inside" as const }, { id: "edge", fillType: "edge" as const }, { id: "partial", fillType: "partial" as const }]);
  return {
    kind: "area", scene: "whichPart",
    prompt: `Which one shows the area of the ${s.label}?`,
    speakText: `Which one shows the area — the whole space inside the ${s.label}?`,
    badgeLabel: "Which Part Is the Area?",
    cells: s.cells, gridW: s.gridW, gridH: s.gridH, label: s.label, emoji: s.emoji,
    partOptions: options, correctPartId: "inside",
    feedback: { correct: "Yes — area fills the whole inside space.", wrong: "Area is the whole inside, not the edge or just part of it." },
  };
}

export function buildCover(pool: ShapeDef[]): AreaTask {
  const s = pick(pool);
  return {
    kind: "area", scene: "cover",
    prompt: `Cover the ${s.label} with square tiles.`,
    speakText: `Fill the whole ${s.label} with square tiles — no gaps, no overlaps.`,
    badgeLabel: "Cover the Shape",
    cells: s.cells, gridW: s.gridW, gridH: s.gridH, label: s.label, emoji: s.emoji,
    feedback: { correct: "Fully covered — that's the area!", wrong: "Fill every square." },
  };
}

export function buildCountSquares(pool: ShapeDef[]): AreaTask {
  const s = pick(pool);
  const n = area(s);
  const opts = new Set<number>([n]);
  while (opts.size < 4) { const d = n + (randInt(2) === 0 ? 1 : -1) * (1 + randInt(3)); if (d > 0) opts.add(d); }
  return {
    kind: "area", scene: "countSquares",
    prompt: `How many squares cover the ${s.label}?`,
    speakText: `Count the square units in the ${s.label}.`,
    badgeLabel: "Count the Squares",
    cells: s.cells, gridW: s.gridW, gridH: s.gridH, label: s.label, emoji: s.emoji,
    options: shuffle([...opts]), correctNumber: n,
    feedback: { correct: `Yes — ${n} square units.`, wrong: `Count each square once — there are ${n}.` },
  };
}

export function buildCompareArea(pool: ShapeDef[]): AreaTask {
  let a = pick(pool); let b = pick(pool);
  for (let k = 0; k < 30 && (a.label === b.label || area(a) === area(b)); k++) b = pick(pool);
  const bigger = area(a) >= area(b) ? a.label : b.label;
  return {
    kind: "area", scene: "compareArea",
    prompt: "Which shape has the greater area?",
    speakText: `Which covers more space, the ${a.label} or the ${b.label}? Count the squares.`,
    badgeLabel: "Which Has Greater Area?",
    compareShapes: { a: { cells: a.cells, label: a.label, emoji: a.emoji, gridW: a.gridW, gridH: a.gridH }, b: { cells: b.cells, label: b.label, emoji: b.emoji, gridW: b.gridW, gridH: b.gridH } },
    feedback: { correct: `Yes — the ${bigger} has the greater area.`, wrong: `Count the squares — the ${bigger} covers more space.` },
  };
}

export function buildOrderArea(pool: ShapeDef[]): AreaTask {
  let shapes = shuffle(pool).slice(0, 3);
  for (let k = 0; k < 30 && new Set(shapes.map(area)).size < 3; k++) shapes = shuffle(pool).slice(0, 3);
  return {
    kind: "area", scene: "orderArea",
    prompt: "Order the shapes from smallest to largest area.",
    speakText: "Count the squares and tap the shapes from the smallest area to the largest.",
    badgeLabel: "Order by Area",
    orderShapes: shapes.map((s) => ({ cells: s.cells, label: s.label, emoji: s.emoji, gridW: s.gridW, gridH: s.gridH })),
    feedback: { correct: "Good ordering — smallest to largest!", wrong: "Count the squares — start with the smallest area." },
  };
}

export function buildBuildArea(): AreaTask {
  const target = choose([4, 6, 8, 9, 10, 12]);
  return {
    kind: "area", scene: "buildArea",
    prompt: `Build an area of ${target} square units.`,
    speakText: `Tap squares to build an area of exactly ${target} square units. Any shape is fine.`,
    badgeLabel: "Build the Area",
    gridW: 5, gridH: 4, targetSquares: target,
    feedback: { correct: `${target} square units — nice building!`, wrong: `Make exactly ${target} squares.` },
  };
}

export function buildSameArea(pool: ShapeDef[]): AreaTask {
  const s = pick(pool);
  const n = area(s);
  const correct = makeCells(n, n >= 6 ? 3 : 2);
  const d1 = makeCells(n + 1 + randInt(2), 3);
  const d2 = makeCells(Math.max(1, n - 2 - randInt(2)), 4);
  const options = shuffle([{ id: "ok", ...correct }, { id: "d1", ...d1 }, { id: "d2", ...d2 }]);
  return {
    kind: "area", scene: "sameArea",
    prompt: `The ${s.label} has ${n} squares. Which shape has the same area?`,
    speakText: `The ${s.label} covers ${n} squares. Which other shape covers the same ${n} squares?`,
    badgeLabel: "Same Area, Different Shape",
    cells: s.cells, gridW: s.gridW, gridH: s.gridH, label: s.label, emoji: s.emoji,
    sameOptions: options, correctSameId: "ok",
    feedback: { correct: `Yes — same area (${n} squares), different shape!`, wrong: `Count the squares — find the one with ${n}.` },
  };
}

export const POOLS = { SIMPLE: SIMPLE_SHAPES, COMPLEX: COMPLEX_SHAPES, ALL: ALL_SHAPES };
