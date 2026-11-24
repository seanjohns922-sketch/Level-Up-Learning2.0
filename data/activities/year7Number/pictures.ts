/**
 * Level 7 Number pictures, drawn from each question's own numbers (Level 8 style: each measurement
 * shown once, the unknown in orange, real materials for real places). A picture supports the
 * question without showing its answer. Rendered by components/lesson/level7/Number7Picture.tsx.
 */
export type Number7Material = "timber" | "grass" | "tiles" | "plain";
/** One rectangle in metres (or units). Labels: "?" is drawn as the orange unknown. */
export type Number7Plot = { w: number; h: number; material: Number7Material; centre?: string; bottom?: string; left?: string; strip?: boolean };
export type Number7Picture =
  | { kind: "grow"; title: string; from: number; to: number; item: "crystal" | "tile" }
  | { kind: "plots"; title: string; plots: Number7Plot[]; joined?: boolean; ask?: string; note?: string }
  | { kind: "squarestrip"; title: string; from: number; to: number; target: number };

const n = (s: string) => Number(s.replace(/,/g, ""));
const side = (area: number) => Math.sqrt(area);

/** Narrates only what the picture shows (never the answer). */
export function number7PictureSpeech(p: Number7Picture): string {
  switch (p.kind) {
    case "grow":
      return `${p.title}. A ${p.to} by ${p.to} grid of ${p.item} spaces. The original ${p.from} by ${p.from} block is filled in teal; the new spaces along two edges are orange.`;
    case "plots":
      return `${p.title}. ${p.plots.map((q, i) => `Shape ${i + 1}${q.centre ? `, labelled ${q.centre}` : ""}${q.bottom ? `, bottom side ${q.bottom}` : ""}${q.left ? `, left side ${q.left}` : ""}`.replace(/\?/g, "unknown")).join(". ")}.${p.note ? ` ${p.note}.` : ""}${p.ask ? ` Find: ${p.ask}.` : ""}`;
    case "squarestrip":
      return `${p.title}. Square numbers from ${p.from} squared to ${p.to} squared: ${Array.from({ length: p.to - p.from + 1 }, (_, i) => `${p.from + i} squared is ${(p.from + i) ** 2}`).join(", ")}. Compare them with ${p.target}.`;
  }
}

type Rule = [RegExp, (m: RegExpMatchArray) => Number7Picture | undefined];
/** Question forms that get a picture. Order matters: the first match wins. */
const RULES: Rule[] = [
  // Week 1 Lesson 1
  [/^What is (\d+)²\?$/, (m) => ({ kind: "plots", title: "A square", plots: [{ w: n(m[1]), h: n(m[1]), material: "plain", bottom: m[1], left: m[1], centre: "area ?" }] })],
  [/(\d+) by \1 square grows to (\d+) by \2/, (m) => ({ kind: "grow", title: "Tiles before and after", from: n(m[1]), to: n(m[2]), item: "tile" })],
  [/has (\d+) rows of \1 crystals\. It is enlarged to (\d+) rows of \2/, (m) => ({ kind: "grow", title: "Crystal display", from: n(m[1]), to: n(m[2]), item: "crystal" })],
  [/square patio uses (\d+) square tiles/, (m) => ({ kind: "plots", title: "Square patio", plots: [{ w: side(n(m[1])), h: side(n(m[1])), material: "tiles", centre: `${m[1]} tiles`, bottom: "?" }] })],
  // Week 1 Lesson 2
  [/^What is √(\d+)\?$/, (m) => ({ kind: "plots", title: "A square", plots: [{ w: side(n(m[1])), h: side(n(m[1])), material: "plain", centre: `area ${m[1]}`, bottom: "?" }] })],
  [/square of area (\d+) m² has each side doubled/, (m) => ({ kind: "plots", title: "Before and after doubling", plots: [{ w: side(n(m[1])), h: side(n(m[1])), material: "timber", centre: `${m[1]} m²` }, { w: 2 * side(n(m[1])), h: 2 * side(n(m[1])), material: "timber", centre: "area ?", bottom: "side × 2" }] })],
  [/square floor has area (\d+) m²\. One side length is extended by (\d+) m/, (m) => ({ kind: "plots", title: "Floor extension", joined: true, plots: [{ w: side(n(m[1])), h: side(n(m[1])), material: "timber", centre: `${m[1]} m²` }, { w: n(m[2]), h: side(n(m[1])), material: "timber", strip: true, bottom: `${m[2]} m` }], ask: "area of the whole rectangle" })],
  [/Two square rooms have areas (\d+) m² and (\d+) m²/, (m) => ({ kind: "plots", title: "Two square rooms", plots: [{ w: side(n(m[1])), h: side(n(m[1])), material: "timber", centre: `${m[1]} m²`, bottom: "side" }, { w: side(n(m[2])), h: side(n(m[2])), material: "timber", centre: `${m[2]} m²`, bottom: "side" }], ask: "how much longer the larger side is" })],
  // Week 1 Lesson 3
  [/whole number is immediately (?:below|above) √(\d+)/, (m) => { const t = n(m[1]), r = Math.floor(side(t)); return { kind: "squarestrip", title: "Square numbers near " + t, from: Math.max(1, r - 2), to: r + 2, target: t }; }],
  [/square has area (\d+) m²\. Which statement correctly locates its side length/, (m) => ({ kind: "plots", title: "A square plot", plots: [{ w: side(n(m[1])), h: side(n(m[1])), material: "grass", centre: `${m[1]} m²`, bottom: "?" }] })],
  [/square garden has area (\d+) m²\. What is its perimeter/, (m) => ({ kind: "plots", title: "Square garden", plots: [{ w: side(n(m[1])), h: side(n(m[1])), material: "grass", centre: `${m[1]} m²` }], ask: "perimeter" })],
  [/square field has a perimeter of (\d+) m\. What is its area/, (m) => ({ kind: "plots", title: "Square field", plots: [{ w: n(m[1]) / 4, h: n(m[1]) / 4, material: "grass", centre: "area ?" }], note: `Perimeter ${m[1]} m` })],
];

export function number7Picture(prompt: string): Number7Picture | undefined {
  for (const [re, make] of RULES) { const m = prompt.match(re); if (m) return make(m); }
  return undefined;
}
