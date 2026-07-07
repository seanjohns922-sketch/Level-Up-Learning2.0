// ── Measurelands · Level 5 · Week 1 — shared helpers (Metric Mastery) ─────────
// AC9M5M01: choose the most appropriate metric unit; use smaller units for
// accuracy. Week 1 stays WHOLE-unit and decision-focused (decimals are Week 2).

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
/** Sample up to n distinct items. */
export function sample<T>(items: T[], n: number): T[] {
  return shuffle(items).slice(0, n);
}

export type Attr = "length" | "mass" | "capacity";

export type MetricObject = {
  label: string;
  emoji: string;
  attr: Attr;
  best: string;
  /** Chip options for chooseUnit — exactly one (best) is sensible. */
  options: string[];
  context?: string;
};

// Realistic Australian objects with ONE clearly-best unit. Emoji matches label.
export const OBJECTS: MetricObject[] = [
  // ── length ──
  { label: "ant", emoji: "🐜", attr: "length", best: "mm", options: ["mm", "cm", "m"], context: "in the garden" },
  { label: "ladybird", emoji: "🐞", attr: "length", best: "mm", options: ["mm", "cm", "m"], context: "on a leaf" },
  { label: "grain of rice", emoji: "🌾", attr: "length", best: "mm", options: ["mm", "cm", "m"], context: "in the kitchen" },
  { label: "pencil", emoji: "✏️", attr: "length", best: "cm", options: ["mm", "cm", "m"], context: "in a pencil case" },
  { label: "crayon", emoji: "🖍️", attr: "length", best: "cm", options: ["mm", "cm", "m"], context: "on the desk" },
  { label: "textbook", emoji: "📗", attr: "length", best: "cm", options: ["mm", "cm", "m"], context: "on the shelf" },
  { label: "smartphone", emoji: "📱", attr: "length", best: "cm", options: ["mm", "cm", "m"], context: "in your hand" },
  { label: "school desk", emoji: "🪑", attr: "length", best: "cm", options: ["mm", "cm", "m"], context: "in the classroom" },
  { label: "doorway", emoji: "🚪", attr: "length", best: "m", options: ["cm", "m", "km"], context: "into the room" },
  { label: "flagpole", emoji: "🚩", attr: "length", best: "m", options: ["cm", "m", "km"], context: "in the yard" },
  { label: "classroom", emoji: "🏫", attr: "length", best: "m", options: ["cm", "m", "km"], context: "wall to wall" },
  { label: "cricket pitch", emoji: "🏏", attr: "length", best: "m", options: ["cm", "m", "km"], context: "at the park" },
  { label: "hiking trail", emoji: "🥾", attr: "length", best: "km", options: ["cm", "m", "km"], context: "up the mountain" },
  { label: "highway", emoji: "🛣️", attr: "length", best: "km", options: ["m", "km"], context: "across the state" },
  { label: "river", emoji: "🏞️", attr: "length", best: "km", options: ["m", "km"], context: "through the valley" },
  // ── mass ──
  { label: "strawberry", emoji: "🍓", attr: "mass", best: "g", options: ["g", "kg"], context: "from the punnet" },
  { label: "grape", emoji: "🍇", attr: "mass", best: "g", options: ["g", "kg"], context: "on the vine" },
  { label: "egg", emoji: "🥚", attr: "mass", best: "g", options: ["g", "kg"], context: "in the carton" },
  { label: "chocolate bar", emoji: "🍫", attr: "mass", best: "g", options: ["g", "kg"], context: "in the tuckshop" },
  { label: "apple", emoji: "🍎", attr: "mass", best: "g", options: ["g", "kg"], context: "in your lunchbox" },
  { label: "backpack", emoji: "🎒", attr: "mass", best: "kg", options: ["g", "kg"], context: "full of books" },
  { label: "watermelon", emoji: "🍉", attr: "mass", best: "kg", options: ["g", "kg"], context: "from the market" },
  { label: "puppy", emoji: "🐕", attr: "mass", best: "kg", options: ["g", "kg"], context: "at the vet" },
  { label: "bag of potatoes", emoji: "🥔", attr: "mass", best: "kg", options: ["g", "kg"], context: "at the shops" },
  // ── capacity ──
  { label: "medicine spoon", emoji: "🥄", attr: "capacity", best: "mL", options: ["mL", "L"], context: "at the chemist" },
  { label: "juice box", emoji: "🧃", attr: "capacity", best: "mL", options: ["mL", "L"], context: "in your lunchbox" },
  { label: "can of drink", emoji: "🥤", attr: "capacity", best: "mL", options: ["mL", "L"], context: "from the fridge" },
  { label: "carton of milk", emoji: "🥛", attr: "capacity", best: "L", options: ["mL", "L"], context: "in the fridge" },
  { label: "bucket", emoji: "🪣", attr: "capacity", best: "L", options: ["mL", "L"], context: "of water" },
  { label: "fish tank", emoji: "🐠", attr: "capacity", best: "L", options: ["mL", "L"], context: "in the classroom" },
  { label: "swimming pool", emoji: "🏊", attr: "capacity", best: "L", options: ["mL", "L"], context: "at the pool" },
];

export function objectsByAttr(attr: Attr): MetricObject[] {
  return OBJECTS.filter((o) => o.attr === attr);
}
export function objectsByUnit(unit: string): MetricObject[] {
  return OBJECTS.filter((o) => o.best === unit);
}

// Teaching ladders for the intro (small -> large).
export const LADDER = {
  length: [
    { unit: "mm", example: "an ant", emoji: "🐜" },
    { unit: "cm", example: "a pencil", emoji: "✏️" },
    { unit: "m", example: "a classroom", emoji: "🏫" },
    { unit: "km", example: "a highway", emoji: "🛣️" },
  ],
  mass: [
    { unit: "g", example: "a strawberry", emoji: "🍓" },
    { unit: "kg", example: "a backpack", emoji: "🎒" },
  ],
  capacity: [
    { unit: "mL", example: "a juice box", emoji: "🧃" },
    { unit: "L", example: "a bucket", emoji: "🪣" },
  ],
} as const;

// Silly-unit statements for "spot Professor Gauge's mistake". correctOption is
// the sensible unit; the statement names a wrong-scale unit.
export type SillyClaim = { label: string; emoji: string; attr: Attr; statement: string; options: string[]; correctOption: string };
export const SILLY: SillyClaim[] = [
  { label: "school oval", emoji: "🏟️", attr: "length", statement: "The school oval is 250 centimetres long.", options: ["cm", "m", "km"], correctOption: "m" },
  { label: "ant", emoji: "🐜", attr: "length", statement: "The ant is 2 metres long.", options: ["mm", "cm", "m"], correctOption: "mm" },
  { label: "pencil", emoji: "✏️", attr: "length", statement: "The pencil is 15 metres long.", options: ["mm", "cm", "m"], correctOption: "cm" },
  { label: "highway", emoji: "🛣️", attr: "length", statement: "The highway is 40 metres long.", options: ["m", "km"], correctOption: "km" },
  { label: "watermelon", emoji: "🍉", attr: "mass", statement: "The watermelon weighs 4 grams.", options: ["g", "kg"], correctOption: "kg" },
  { label: "strawberry", emoji: "🍓", attr: "mass", statement: "The strawberry weighs 5 kilograms.", options: ["g", "kg"], correctOption: "g" },
  { label: "backpack", emoji: "🎒", attr: "mass", statement: "The full backpack weighs 3 grams.", options: ["g", "kg"], correctOption: "kg" },
  { label: "swimming pool", emoji: "🏊", attr: "capacity", statement: "The swimming pool holds 800 millilitres.", options: ["mL", "L"], correctOption: "L" },
  { label: "medicine spoon", emoji: "🥄", attr: "capacity", statement: "The medicine spoon holds 5 litres.", options: ["mL", "L"], correctOption: "mL" },
];

export const ATTR_LABEL: Record<Attr, string> = { length: "length", mass: "mass", capacity: "capacity" };
export const UNIT_BIN_LABEL: Record<string, string> = {
  mm: "tiny things", cm: "small things", m: "big things", km: "very far",
  g: "light things", kg: "heavy things", mL: "small amounts", L: "large amounts",
};
