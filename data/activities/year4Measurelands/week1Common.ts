// Shared object pool + helpers for Measurelands Level 4 · Week 1 (Precision
// Measuring). Every object is drawn to scale (width = lengthCm) and its emoji
// MATCHES the label; whole-cm ranges keep sizes believable and readings land on
// a half centimetre (X.5). No "ruler" object — a 30 cm ruler exceeds the scale.

export type W1ObjectSpec = { label: string; icon: string; min: number; max: number };

export const W1_OBJECTS: W1ObjectSpec[] = [
  { label: "pencil", icon: "✏️", min: 14, max: 17 },
  { label: "crayon", icon: "🖍️", min: 7, max: 9 },
  { label: "marker", icon: "🖊️", min: 11, max: 13 },
  { label: "spoon", icon: "🥄", min: 11, max: 13 },
  { label: "toy car", icon: "🚗", min: 6, max: 8 },
  { label: "paintbrush", icon: "🖌️", min: 17, max: 19 },
  { label: "toothbrush", icon: "🪥", min: 16, max: 18 },
  { label: "scissors", icon: "✂️", min: 13, max: 15 },
  { label: "leaf", icon: "🍃", min: 7, max: 11 },
  { label: "feather", icon: "🪶", min: 9, max: 12 },
  { label: "key", icon: "🔑", min: 5, max: 6 },
  { label: "ribbon", icon: "🎀", min: 12, max: 15 },
];

export const W1_MAX_RULER = 20;

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

export type W1Object = { label: string; icon: string; lengthCm: number };

/** An object with a half-centimetre length (whole cm + 0.5) within [maxLen]. */
export function pickW1Object(opts?: { maxLen?: number; exclude?: string[] }): W1Object {
  const maxLen = opts?.maxLen ?? W1_MAX_RULER;
  const exclude = opts?.exclude ?? [];
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const spec = W1_OBJECTS[randInt(W1_OBJECTS.length)]!;
    const whole = spec.min + randInt(spec.max - spec.min + 1);
    const lengthCm = whole + 0.5;
    if (lengthCm <= maxLen && !exclude.includes(spec.label)) {
      return { label: spec.label, icon: spec.icon, lengthCm };
    }
  }
  const spec = W1_OBJECTS.find((s) => s.min + 0.5 <= maxLen && !exclude.includes(s.label)) ?? W1_OBJECTS[1]!;
  return { label: spec.label, icon: spec.icon, lengthCm: spec.min + 0.5 };
}

/** A ruler a little longer than the object, capped at 20 cm. */
export function rulerFor(lengthCm: number, margin = 3): number {
  return Math.min(W1_MAX_RULER, Math.ceil(lengthCm) + 1 + randInt(margin));
}
