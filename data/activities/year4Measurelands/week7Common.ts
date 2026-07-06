// Shared helpers for Measurelands Level 4 · Week 7 (Angles). Visual comparison
// only — no degrees, no protractors, no unknown-angle calculation. Arm lengths
// vary independently of the turn so students read the opening, not the lines.

export type AngleType = "acute" | "right" | "obtuse" | "straight" | "reflex" | "revolution";
export type Figure = { id: string; kind?: "angle" | "line" | "ray"; turn?: number; rot?: number; arm1?: number; arm2?: number; label?: string; emoji?: string };

export function randInt(maxExclusive: number) { return Math.floor(Math.random() * maxExclusive); }
export function randRange(min: number, max: number) { return min + randInt(max - min + 1); }
export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [next[i], next[j]] = [next[j]!, next[i]!]; }
  return next;
}
export function choose<T>(items: T[]): T { return items[randInt(items.length)]!; }

export const ANGLE_TYPES: AngleType[] = ["acute", "right", "obtuse", "straight", "reflex", "revolution"];

export function typeOf(turn: number): AngleType {
  if (turn >= 358) return "revolution";
  if (turn > 181) return "reflex";
  if (Math.abs(turn - 180) <= 1) return "straight";
  if (Math.abs(turn - 90) <= 1) return "right";
  if (turn > 91) return "obtuse";
  return "acute";
}

export function turnForType(type: AngleType): number {
  switch (type) {
    case "acute": return randRange(25, 80);
    case "right": return 90;
    case "obtuse": return randRange(100, 160);
    case "straight": return 180;
    case "reflex": return randRange(205, 320);
    case "revolution": return 359;
  }
}

/** Random arms (70–110) that differ, so the same angle can have unequal lines. */
function arms(): { arm1: number; arm2: number } {
  const a = randRange(70, 110);
  let b = randRange(70, 110);
  if (Math.abs(a - b) < 12) b = a > 90 ? a - 22 : a + 22;
  return { arm1: a, arm2: b };
}

let fid = 0;
export function angleFigure(type: AngleType, opts?: { rot?: number }): Figure {
  const turn = turnForType(type);
  const rot = opts?.rot ?? randRange(0, type === "straight" ? 12 : 22);
  return { id: `f${fid++}`, kind: "angle", turn, rot, ...arms() };
}

export function lineFigure(): Figure { return { id: `f${fid++}`, kind: "line", rot: randRange(0, 20), arm1: randRange(85, 110) }; }
export function rayFigure(): Figure { return { id: `f${fid++}`, kind: "ray", rot: randRange(15, 60), arm1: randRange(85, 110) }; }

// Real-world objects that contain an angle.
export const ANGLE_OBJECTS: Array<{ label: string; emoji: string; types: AngleType[] }> = [
  { label: "open door", emoji: "🚪", types: ["acute", "obtuse"] },
  { label: "scissors", emoji: "✂️", types: ["acute"] },
  { label: "ladder", emoji: "🪜", types: ["acute"] },
  { label: "open book", emoji: "📖", types: ["acute", "obtuse", "straight"] },
  { label: "clock hands", emoji: "🕐", types: ["acute", "right", "obtuse"] },
  { label: "signpost", emoji: "🪧", types: ["right", "obtuse"] },
  { label: "hills", emoji: "⛰️", types: ["obtuse"] },
  { label: "fan", emoji: "🪭", types: ["acute", "obtuse", "reflex"] },
  { label: "windmill", emoji: "🎡", types: ["right", "reflex"] },
  { label: "umbrella", emoji: "☂️", types: ["acute", "obtuse"] },
];

export function pickObjectForType(type: AngleType): { label: string; emoji: string } {
  const matches = ANGLE_OBJECTS.filter((o) => o.types.includes(type));
  const o = matches.length ? choose(matches) : choose(ANGLE_OBJECTS);
  return { label: o.label, emoji: o.emoji };
}
