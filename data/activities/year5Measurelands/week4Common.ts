// ── Measurelands · Level 5 · Week 4 — shared helpers (Area Architects) ────────
// AC9M5M02: solve practical area problems for rectangles using the array model
// (rows × columns square units). Rectangles/squares only, whole numbers. This is
// "rows × columns", NOT the l × w formula (that's Level 6).

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

export type Ctx = { label: string; emoji: string };

// Design spaces — tiled areas an architect plans. All measured in m².
export const CONTEXTS: Ctx[] = [
  { label: "classroom carpet", emoji: "🏫" },
  { label: "basketball court", emoji: "🏀" },
  { label: "vegetable garden", emoji: "🥕" },
  { label: "picnic area", emoji: "🧺" },
  { label: "castle courtyard", emoji: "🏰" },
  { label: "tiled courtyard", emoji: "🧱" },
  { label: "sports court", emoji: "🏐" },
  { label: "garden bed", emoji: "🌷" },
  { label: "playground", emoji: "🛝" },
];

/** Rectangle dimensions (rows = h, columns = w). Kept small so tiles stay legible. */
export function rectDims(min = 2, max = 8): { w: number; h: number } {
  return { w: randRange(min, max), h: randRange(min, max) };
}

/** Three area options: correct (w×h) + two misconception distractors. Always
 *  includes rows+columns (add-instead-of-multiply). */
export function areaOptions(w: number, h: number): { options: number[]; correct: number } {
  const correct = w * h;
  const add = w + h; // add instead of multiply — always offered as the key trap
  const others = shuffle(
    [2 * (w + h), correct + Math.max(w, h), correct - Math.min(w, h), correct + Math.min(w, h)]
      .filter((n) => n > 0 && n !== correct && n !== add),
  );
  let second = others[0] ?? correct + 1;
  if (second === add || second === correct) second = correct + 2;
  return { options: shuffle([correct, add, second]), correct };
}

/** Spot-the-mistake: Gauge adds rows + columns. Options include his wrong total. */
export function mistakeParts(w: number, h: number): { options: number[]; correct: number; wrong: number; statement: string } {
  const correct = w * h;
  const wrong = w + h;
  const cands = new Set<number>([wrong, correct + Math.max(w, h), 2 * (w + h)]);
  const distractors = shuffle([...cands].filter((n) => n > 0 && n !== correct && n !== wrong)).slice(0, 1);
  const options = shuffle([correct, wrong, ...distractors]).slice(0, 3);
  if (!options.includes(correct)) options[0] = correct;
  if (!options.includes(wrong)) options[1] = wrong;
  return { options: shuffle(options), correct, wrong, statement: `Professor Gauge added ${h} + ${w} = ${wrong}.` };
}
