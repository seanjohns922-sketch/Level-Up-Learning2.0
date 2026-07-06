// Shared pools + helpers for Measurelands Level 4 · Week 2 (Mass & Capacity).
// Every object has ONE believable measurement that lands exactly on a
// graduation: grams on 50 g marks, kilograms on 0.5 kg marks, millilitres on
// 250 mL marks, litres on 0.5 L marks. Emoji MATCHES the label.

export type MassItem = { label: string; emoji: string; mass: number; unit: "g" | "kg" };
export type CapItem = { label: string; emoji: string; value: number; unit: "mL" | "L" };

// Grams (analog dial reads to 50 g; values ≤ 950 g stay off the 0/top point).
export const MASS_G: MassItem[] = [
  { label: "lemon", emoji: "🍋", mass: 150, unit: "g" },
  { label: "apple", emoji: "🍎", mass: 250, unit: "g" },
  { label: "orange", emoji: "🍊", mass: 350, unit: "g" },
  { label: "tomato", emoji: "🍅", mass: 150, unit: "g" },
  { label: "potato", emoji: "🥔", mass: 450, unit: "g" },
  { label: "banana", emoji: "🍌", mass: 150, unit: "g" },
  { label: "carrot", emoji: "🥕", mass: 100, unit: "g" },
  { label: "onion", emoji: "🧅", mass: 250, unit: "g" },
  { label: "mug", emoji: "☕", mass: 350, unit: "g" },
  { label: "chocolate block", emoji: "🍫", mass: 250, unit: "g" },
  { label: "pear", emoji: "🍐", mass: 250, unit: "g" },
  { label: "book", emoji: "📕", mass: 650, unit: "g" },
];

// Kilograms (analog dial reads to 0.5 kg; values 0.5–4.5 kg).
export const MASS_KG: MassItem[] = [
  { label: "pineapple", emoji: "🍍", mass: 1.5, unit: "kg" },
  { label: "watermelon", emoji: "🍉", mass: 3.5, unit: "kg" },
  { label: "cat", emoji: "🐱", mass: 4.5, unit: "kg" },
  { label: "bag of rice", emoji: "🍚", mass: 1.5, unit: "kg" },
  { label: "melon", emoji: "🍈", mass: 2.5, unit: "kg" },
  { label: "backpack", emoji: "🎒", mass: 3.5, unit: "kg" },
  { label: "brick", emoji: "🧱", mass: 2.5, unit: "kg" },
  { label: "puppy", emoji: "🐶", mass: 3.5, unit: "kg" },
  { label: "pumpkin", emoji: "🎃", mass: 2.5, unit: "kg" },
  { label: "laptop", emoji: "💻", mass: 1.5, unit: "kg" },
];

// Millilitres (jug reads to 250 mL; values ≤ 750 mL).
export const CAP_ML: CapItem[] = [
  { label: "cup", emoji: "☕", value: 250, unit: "mL" },
  { label: "glass", emoji: "🥛", value: 250, unit: "mL" },
  { label: "can", emoji: "🥫", value: 250, unit: "mL" },
  { label: "small bottle", emoji: "🧴", value: 500, unit: "mL" },
  { label: "yoghurt tub", emoji: "🍦", value: 500, unit: "mL" },
  { label: "bowl", emoji: "🥣", value: 750, unit: "mL" },
  { label: "juice box", emoji: "🧃", value: 250, unit: "mL" },
];

// Litres (jug reads to 0.5 L; values ≤ 2.5 L).
export const CAP_L: CapItem[] = [
  { label: "water bottle", emoji: "🍶", value: 1.5, unit: "L" },
  { label: "milk carton", emoji: "🥛", value: 1.5, unit: "L" },
  { label: "kettle", emoji: "🫖", value: 1.5, unit: "L" },
  { label: "watering can", emoji: "🪣", value: 2.5, unit: "L" },
  { label: "saucepan", emoji: "🍲", value: 2.5, unit: "L" },
  { label: "jug", emoji: "🏺", value: 2.5, unit: "L" },
];

export function randInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
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

export function fmtMass(mass: number, unit: "g" | "kg") {
  return `${Number(mass.toFixed(2))} ${unit}`;
}
export function fmtCap(value: number, unit: "mL" | "L") {
  return `${Number(value.toFixed(2))} ${unit}`;
}

const MASS_STEP = { g: 50, kg: 0.5 } as const;
const CAP_STEP = { mL: 250, L: 0.5 } as const;

/** Three mass readings bracketing the true value (below · true · above). */
export function massOptions(mass: number, unit: "g" | "kg"): { options: string[]; correct: string } {
  const step = MASS_STEP[unit];
  const lo = Math.max(step, mass - step);
  const raw = lo === mass ? [mass, mass + step, mass + 2 * step] : [lo, mass, mass + step];
  return { options: shuffle(raw).map((v) => fmtMass(v, unit)), correct: fmtMass(mass, unit) };
}

/** Three capacity readings bracketing the true value. */
export function capOptions(value: number, unit: "mL" | "L"): { options: number[]; correct: number } {
  const step = CAP_STEP[unit];
  const lo = Math.max(step, value - step);
  const raw = lo === value ? [value, value + step, value + 2 * step] : [lo, value, value + step];
  return { options: shuffle(raw), correct: value };
}

/** Pick n distinct items (by label) from a pool, optionally with distinct values. */
export function pickDistinct<T extends { label: string }>(pool: T[], n: number): T[] {
  return shuffle(pool).slice(0, n);
}
