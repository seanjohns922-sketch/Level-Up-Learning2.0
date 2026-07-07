// ── Measurelands · Level 5 · Week 2 — shared helpers (Precision Measurement) ──
// AC9M5M01: use a COMBINATION of units (m+cm, kg+g, L+mL) for a more accurate
// measure. Reading + comparing mixed-unit values — no conversions. Values are
// stored in SMALL units (cm / g / mL).

export function randInt(n: number): number {
  return Math.floor(Math.random() * n);
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
export function rangeStep(min: number, max: number, step: number): number {
  const n = Math.floor((max - min) / step) + 1;
  return min + randInt(n) * step;
}

export type Attr = "length" | "mass" | "capacity";
export const UNITS: Record<Attr, { big: string; small: string; ratio: number; step: number; medium: number }> = {
  length: { big: "m", small: "cm", ratio: 100, step: 5, medium: 10 },
  mass: { big: "kg", small: "g", ratio: 1000, step: 50, medium: 100 },
  capacity: { big: "L", small: "mL", ratio: 1000, step: 50, medium: 100 },
};

export function fmtMixed(valueSmall: number, attr: Attr): string {
  const u = UNITS[attr];
  const whole = Math.floor(valueSmall / u.ratio);
  const sub = valueSmall % u.ratio;
  if (whole === 0) return `${sub} ${u.small}`;
  if (sub === 0) return `${whole} ${u.big}`;
  return `${whole} ${u.big} ${sub} ${u.small}`;
}

// Objects with a realistic SMALL-unit range and a mixed-unit value generator.
export type PObj = { label: string; emoji: string; attr: Attr; context: string; min: number; max: number };

export const OBJECTS: PObj[] = [
  // length (cm) — always mixed (100–290, sub non-zero)
  { label: "timber board", emoji: "🪵", attr: "length", context: "at the timber yard", min: 100, max: 290 },
  { label: "bookshelf", emoji: "📚", attr: "length", context: "in the study", min: 100, max: 240 },
  { label: "surfboard", emoji: "🏄", attr: "length", context: "at the beach", min: 150, max: 245 },
  { label: "person's height", emoji: "🧍", attr: "length", context: "at the doctor", min: 120, max: 195 },
  { label: "curtain", emoji: "🪟", attr: "length", context: "for the window", min: 140, max: 250 },
  { label: "ladder", emoji: "🪜", attr: "length", context: "in the shed", min: 150, max: 290 },
  // mass (g)
  { label: "parcel", emoji: "📦", attr: "mass", context: "at the post office", min: 1050, max: 2900 },
  { label: "bag of flour", emoji: "🌾", attr: "mass", context: "in the kitchen", min: 1050, max: 2500 },
  { label: "watermelon", emoji: "🍉", attr: "mass", context: "at the market", min: 2050, max: 2950 },
  { label: "kitten", emoji: "🐱", attr: "mass", context: "at the vet", min: 1050, max: 2500 },
  { label: "pumpkin", emoji: "🎃", attr: "mass", context: "in the garden", min: 1050, max: 2900 },
  // capacity (mL)
  { label: "drink bottle", emoji: "🍶", attr: "capacity", context: "from the fridge", min: 550, max: 1900 },
  { label: "measuring jug", emoji: "🥛", attr: "capacity", context: "for the recipe", min: 550, max: 1900 },
  { label: "watering can", emoji: "🚿", attr: "capacity", context: "in the garden", min: 1050, max: 1950 },
  { label: "juice carton", emoji: "🧃", attr: "capacity", context: "at the shop", min: 1050, max: 1950 },
];

export function objectsByAttr(attr: Attr): PObj[] {
  return OBJECTS.filter((o) => o.attr === attr);
}

/** A realistic mixed value (small units) for an object — sub-unit is non-zero. */
export function valueFor(o: PObj): number {
  const u = UNITS[o.attr];
  for (let i = 0; i < 20; i += 1) {
    const v = rangeStep(o.min, o.max, u.step);
    if (v % u.ratio !== 0) return v;
  }
  return o.min + u.step;
}

/** Three reading options for the instrument: correct + a one-tick miss + whole-only. */
export function readOptions(valueSmall: number, attr: Attr): { options: string[]; correct: string } {
  const u = UNITS[attr];
  const whole = Math.floor(valueSmall / u.ratio);
  const correct = fmtMixed(valueSmall, attr);
  const near = valueSmall + (randInt(2) === 0 ? u.medium : -u.medium);
  const nearSafe = near > whole * u.ratio && near < (whole + 1) * u.ratio ? near : valueSmall + u.medium;
  const opts = new Set<string>([correct, fmtMixed(nearSafe, attr), fmtMixed(whole * u.ratio, attr)]);
  while (opts.size < 3) opts.add(fmtMixed(valueSmall + opts.size * u.medium, attr));
  return { options: shuffle([...opts]).slice(0, 3), correct };
}

/** A compare pair — sometimes a cross-boundary trap. Returns small-unit values. */
export function comparePair(attr: Attr): { a: number; b: number } {
  const u = UNITS[attr];
  const w = attr === "length" ? 1 + randInt(2) : 1 + randInt(2);
  if (randInt(2) === 0) {
    // cross-boundary trap: a = w m 85–95, b = (w+1) m 5–20 → b is larger
    const a = w * u.ratio + rangeStep(u.ratio - 3 * u.medium, u.ratio - u.medium, u.step);
    const b = (w + 1) * u.ratio + rangeStep(u.step, 2 * u.medium, u.step);
    return { a, b };
  }
  // same whole, different sub
  const s1 = rangeStep(u.step, u.ratio - u.step, u.medium);
  let s2 = rangeStep(u.step, u.ratio - u.step, u.medium);
  if (s2 === s1) s2 = s1 + u.medium < u.ratio ? s1 + u.medium : s1 - u.medium;
  return { a: w * u.ratio + s1, b: w * u.ratio + s2 };
}

export const COMPARE_ITEMS: Record<Attr, { emoji: string; a: string; b: string; more: string }> = {
  length: { emoji: "🪵", a: "Plank A", b: "Plank B", more: "longer" },
  mass: { emoji: "📦", a: "Parcel A", b: "Parcel B", more: "heavier" },
  capacity: { emoji: "🍾", a: "Bottle A", b: "Bottle B", more: "holds more" },
};
