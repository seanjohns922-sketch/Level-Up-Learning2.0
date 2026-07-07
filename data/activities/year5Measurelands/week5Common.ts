import type { PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 5 · Week 5 — shared helpers (Area or Perimeter?) ─────
// AC9M5M02: decide whether a situation needs area, perimeter or both, then solve.
// Reuses toolChoice ("Measurement Choice"), metricUnit sort-bins and the Area
// Builder investigate scene — no new mechanic.

export function randInt(n: number): number {
  return Math.floor(Math.random() * n);
}
export function randRange(min: number, max: number): number {
  return min + randInt(max - min + 1);
}
export function choose<T>(items: T[]): T {
  return items[randInt(items.length)]!;
}
export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1);
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

type ToolTask = Extract<PracticeTask, { kind: "toolChoice" }>;
type MetricTask = Extract<PracticeTask, { kind: "metricUnit" }>;

export type Need = "area" | "perimeter" | "both";
export type Scenario = { emoji: string; text: string; short: string; need: Need; why: string };

// Around-the-outside (perimeter) vs cover-the-inside (area) situations.
export const BINARY: Scenario[] = [
  { emoji: "🌱", text: "A gardener wants grass inside a garden", short: "grass", need: "area", why: "Grass covers the space inside — that's area." },
  { emoji: "🚧", text: "A farmer wants to fence a paddock", short: "fence", need: "perimeter", why: "A fence goes around the outside — that's perimeter." },
  { emoji: "🏫", text: "A classroom needs new carpet", short: "carpet", need: "area", why: "Carpet covers the floor inside — that's area." },
  { emoji: "🎨", text: "You want to paint a wall", short: "paint", need: "area", why: "Paint covers the whole surface — that's area." },
  { emoji: "🎀", text: "You want ribbon around a box lid", short: "ribbon", need: "perimeter", why: "Ribbon goes around the edge — that's perimeter." },
  { emoji: "🖼️", text: "You want a frame around a picture", short: "frame", need: "perimeter", why: "A frame goes around the edge — that's perimeter." },
  { emoji: "🧱", text: "You want tiles to cover a courtyard", short: "tiles", need: "area", why: "Tiles cover the space inside — that's area." },
  { emoji: "🌷", text: "You want edging around a garden bed", short: "edging", need: "perimeter", why: "Edging goes around the border — that's perimeter." },
  { emoji: "🏀", text: "A sports court needs its surface resealed", short: "resurface", need: "area", why: "Sealing covers the whole surface — that's area." },
  { emoji: "🏊", text: "You want a safety fence around a pool", short: "pool fence", need: "perimeter", why: "The fence goes around the pool — that's perimeter." },
];

// Situations that genuinely need BOTH.
export const BOTH: Scenario[] = [
  { emoji: "🥕", text: "A vegetable garden needs turf inside AND a fence around it", short: "turf + fence", need: "both", why: "Turf is area, the fence is perimeter — you need both!" },
  { emoji: "🏡", text: "A backyard needs grass laid AND a fence built", short: "grass + fence", need: "both", why: "Grass is area, the fence is perimeter — both!" },
  { emoji: "⚽", text: "A field needs new grass AND a boundary fence", short: "grass + fence", need: "both", why: "Grass inside is area, the fence around is perimeter — both!" },
  { emoji: "🏰", text: "A courtyard needs paving AND a low wall around it", short: "paving + wall", need: "both", why: "Paving is area, the wall around is perimeter — both!" },
];

const AREA_TOOL = { id: "area", label: "Area", iconKey: "m-area", focus: "the space inside" };
const PERI_TOOL = { id: "perimeter", label: "Perimeter", iconKey: "m-perimeter", focus: "the distance around" };
const BOTH_TOOL = { id: "both", label: "Both", iconKey: "m-both", focus: "around AND inside" };

/** A "Measurement Choice" decision (reuses toolChoice). */
export function decisionTask(s: Scenario, withBoth: boolean): ToolTask {
  const tools = shuffle(withBoth ? [AREA_TOOL, PERI_TOOL, BOTH_TOOL] : [AREA_TOOL, PERI_TOOL]);
  return {
    kind: "toolChoice",
    scene: "best",
    prompt: `${s.emoji} ${s.text}. Which measurement is needed?`,
    speakText: `${s.text}. Which measurement is needed — area, perimeter${withBoth ? " or both" : ""}?`,
    badgeLabel: "Measurement Choice",
    tools,
    correctToolId: s.need,
    feedback: { correct: s.why, wrong: "Ask: is it covering the inside (area) or going around the outside (perimeter)?" },
  };
}

/** A sort-into-bins task (reuses metricUnit sortBins). area / perimeter only. */
export function sortTask(): MetricTask {
  const picks = shuffle(BINARY).slice(0, 4);
  return {
    kind: "metricUnit",
    scene: "sortBins",
    attribute: "length",
    prompt: "Sort each job into the measurement it needs.",
    speakText: "Tap a job, then tap the measurement it needs — area or perimeter.",
    badgeLabel: "Sort the Jobs",
    bins: [
      { unit: "perimeter", label: "measure around" },
      { unit: "area", label: "cover inside" },
    ],
    metricItems: shuffle(picks.map((s, i) => ({ id: `s${i}`, label: s.short, emoji: s.emoji, unit: s.need }))),
    feedback: { correct: "Sorted — you matched every job to its measurement!", wrong: "Around the outside is perimeter; covering the inside is area." },
  };
}

// ── Rectangle pair helpers for the L2 investigation ──
function factorPairs(area: number, maxDim = 9): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let w = 2; w * w <= area; w += 1) {
    if (area % w === 0) { const h = area / w; if (h <= maxDim && w <= maxDim) out.push([w, h]); }
  }
  return out;
}

/** Two rectangles with the SAME area but DIFFERENT perimeter. */
export function sameAreaPair(): [[number, number], [number, number]] {
  const areas = shuffle([12, 16, 18, 20, 24]);
  for (const a of areas) {
    const pairs = factorPairs(a);
    const distinct = pairs.filter((p, i) => pairs.findIndex((q) => q[0] + q[1] === p[0] + p[1]) === i);
    if (distinct.length >= 2) {
      const two = shuffle(distinct).slice(0, 2);
      return [two[0]!, two[1]!];
    }
  }
  return [[2, 6], [3, 4]];
}

/** Two rectangles with the SAME perimeter but DIFFERENT area. */
export function samePerimeterPair(): [[number, number], [number, number]] {
  const s = randRange(7, 11); // half-perimeter (w + h)
  const pairs: Array<[number, number]> = [];
  for (let w = 2; w <= s - 2; w += 1) { const h = s - w; if (w <= h && h <= 9) pairs.push([w, h]); }
  const byArea = shuffle(pairs);
  const a = byArea[0]!;
  const b = byArea.find((p) => p[0] * p[1] !== a[0] * a[1]);
  if (b) return [a, b];
  return [[3, 5], [4, 4]];
}

export function rectCells(w: number, h: number): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < h; r += 1) for (let c = 0; c < w; c += 1) cells.push([c, r]);
  return cells;
}
