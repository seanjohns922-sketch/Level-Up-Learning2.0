// Measurelands · Level 6 · Week 4 — pure metric-ladder data + conversion helpers.
// Shared by the data builders and the Metric Ladder component. AC9M6M01.

export type Measure = "length" | "mass" | "capacity";
export type Rung = { u: string; f: number }; // f = multiply to step DOWN to the next rung

// Largest unit at the top (index 0) → smallest at the bottom.
export const LADDERS: Record<Measure, Rung[]> = {
  length: [{ u: "km", f: 1000 }, { u: "m", f: 100 }, { u: "cm", f: 10 }, { u: "mm", f: 0 }],
  mass: [{ u: "t", f: 1000 }, { u: "kg", f: 1000 }, { u: "g", f: 0 }],
  capacity: [{ u: "L", f: 1000 }, { u: "mL", f: 0 }],
};

export function unitIndex(m: Measure, u: string): number {
  return LADDERS[m].findIndex((r) => r.u === u);
}

// Multiply factor + direction to get from unit index i to j.
export function factorBetween(m: Measure, i: number, j: number): { mul: number; dir: "down" | "up" | "same" } {
  const rungs = LADDERS[m];
  if (j === i) return { mul: 1, dir: "same" };
  let f = 1;
  if (j > i) { for (let k = i; k < j; k++) f *= rungs[k]!.f; return { mul: f, dir: "down" }; }
  for (let k = j; k < i; k++) f *= rungs[k]!.f;
  return { mul: f, dir: "up" };
}

export function convert(m: Measure, value: number, fromU: string, toU: string): number {
  const { mul, dir } = factorBetween(m, unitIndex(m, fromU), unitIndex(m, toU));
  return dir === "down" ? value * mul : dir === "up" ? value / mul : value;
}

// Format a value, stripping floating-point dust and trailing zeros.
export function fmt(n: number): string {
  return (Math.round(n * 100000) / 100000).toString();
}

export function measureOf(unit: string): Measure {
  if (LADDERS.length.some((r) => r.u === unit)) return "length";
  if (LADDERS.mass.some((r) => r.u === unit)) return "mass";
  return "capacity";
}
