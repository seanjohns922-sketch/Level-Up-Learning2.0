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
  | { kind: "squarestrip"; title: string; from: number; to: number; target: number }
  /** A factor tree: the root, its first split, and the branch still to break down marked "?". */
  | { kind: "tree"; title: string; root: number; left: number; right: number }
  /** Prime factors from the end of a factor tree, shown as counters. */
  | { kind: "primes"; title: string; primes: number[] }
  /** A power with its parts named: base (the repeated factor) and exponent (how many factors). */
  | { kind: "power"; title: string; base: number; exponent: number }
  /** Repeated splitting or doubling: the first stages drawn, the target stage marked "?". */
  | { kind: "doubling"; title: string; item: "branch" | "branch3" | "bacteria"; shown: number; target: string }
  /** Two repeating events on one time line, first few events only. */
  | { kind: "timeline"; title: string; every: [number, number]; unit: string }
  /** Two groups of counters to share into identical groups. */
  | { kind: "counters"; title: string; groups: { count: number; label: string; colour: "blue" | "gold" | "red" }[] }
  /** Powers of ten as a ladder of ×10 steps; values shown only up to `showUpTo`. */
  | { kind: "powerstrip"; title: string; from: number; to: number; showUpTo: number }
  /** A place-value chart; null digits are empty columns. */
  | { kind: "placevalue"; title: string; rows: { label: string; digits: (number | null)[] }[]; places: number }
  /** A bar split into equal parts with some shaded; `grid` draws a 10 × 10 hundred grid instead. */
  | { kind: "fractionbar"; title: string; parts: number; shaded: number; grid?: boolean; caption?: string; scale?: "percent" }
  /** A tank divided into equal fractions, some used. */
  | { kind: "tank"; title: string; capacity: string; parts: number; used: number }
  /** Lengths of rope or ribbon laid end to end. */
  | { kind: "lengths"; title: string; object: "rope" | "ribbon"; pieces: { length: number; label: string; cut?: boolean }[]; ask: string }
  /** A whole (100%) with part of it marked; the unknown is shown as "?". */
  | { kind: "percentbar"; title: string; whole: string; part: number; partLabel: string; of: number; ask: string };

const n = (s: string) => Number(s.replace(/,/g, ""));
const side = (area: number) => Math.sqrt(area);
const SUPER = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const sup = (s: string) => Number([...s].map((c) => SUPER.indexOf(c)).join(""));
const mixed = (s: string) => { const m = s.trim().match(/^(\d+)(?:\s+(\d+)\/(\d+))?$|^(\d+)\/(\d+)$|^(\d+(?:\.\d+)?)$/); if (!m) return NaN; if (m[4]) return Number(m[4]) / Number(m[5]); if (m[6]) return Number(m[6]); return Number(m[1]) + (m[2] ? Number(m[2]) / Number(m[3]) : 0); };
const smallestFactor = (x: number) => { for (let p = 2; p * p <= x; p++) if (x % p === 0) return p; return x; };
/** Digits of a whole number in `places` columns, most significant first; leading columns stay blank. */
const digits = (value: number, places: number): (number | null)[] => String(value).padStart(places, " ").split("").map((d) => (d === " " ? null : Number(d)));

/** Narrates only what the picture shows (never the answer). */
export function number7PictureSpeech(p: Number7Picture): string {
  switch (p.kind) {
    case "grow":
      return `${p.title}. A ${p.to} by ${p.to} grid of ${p.item} spaces. The original ${p.from} by ${p.from} block is filled in teal; the new spaces along two edges are orange.`;
    case "plots":
      return `${p.title}. ${p.plots.map((q, i) => `Shape ${i + 1}${q.centre ? `, labelled ${q.centre}` : ""}${q.bottom ? `, bottom side ${q.bottom}` : ""}${q.left ? `, left side ${q.left}` : ""}`.replace(/\?/g, "unknown")).join(". ")}.${p.note ? ` ${p.note}.` : ""}${p.ask ? ` Find: ${p.ask}.` : ""}`;
    case "squarestrip":
      return `${p.title}. Square numbers from ${p.from} squared to ${p.to} squared: ${Array.from({ length: p.to - p.from + 1 }, (_, i) => `${p.from + i} squared is ${(p.from + i) ** 2}`).join(", ")}. Compare them with ${p.target}.`;
    case "tree":
      return `${p.title}. ${p.root} splits into ${p.left} and ${p.right}. The branch ${p.right} still needs breaking down.`;
    case "primes":
      return `${p.title}. Prime factors: ${p.primes.join(", ")}.`;
    case "power":
      return `${p.title}. ${p.base} to the power ${p.exponent}. The base, ${p.base}, is the repeated factor. The exponent, ${p.exponent}, says how many factors there are.`;
    case "doubling":
      return `${p.title}. The first ${p.shown} stages are drawn; each stage doubles the one before. Find ${p.target}.`;
    case "timeline":
      return `${p.title}. One light flashes every ${p.every[0]} ${p.unit} and the other every ${p.every[1]} ${p.unit}. Both flash at 0. The first few flashes are marked.`;
    case "counters":
      return `${p.title}. ${p.groups.map((g) => `${g.count} ${g.label}`).join(" and ")}.`;
    case "powerstrip":
      return `${p.title}. Powers of ten from 10 to the ${p.from} to 10 to the ${p.to}, each one ten times the one before.`;
    case "placevalue":
      return `${p.title}. A place-value chart. ${p.rows.map((r) => `${r.label}: ${r.digits.every((d) => d === null) ? "empty" : r.digits.map((d) => (d === null ? "blank" : d)).join(", ")}`).join(". ")}.`;
    case "fractionbar":
      return `${p.title}. ${p.grid ? "A hundred grid" : `A bar split into ${p.parts} equal parts`} with ${p.shaded} shaded.${p.caption ? ` ${p.caption}` : ""}`;
    case "tank":
      return `${p.title}. A tank holding ${p.capacity}, split into ${p.parts} equal parts; ${p.used} parts are used.`;
    case "lengths":
      return `${p.title}. Pieces of ${p.object}: ${p.pieces.map((q) => `${q.label}${q.cut ? " cut off" : ""}`).join(", ")}. Find ${p.ask}.`;
    case "percentbar":
      return `${p.title}. A bar showing ${p.whole} as 100 percent, with ${p.partLabel} marked. Find the ${p.ask.replace("%", "percentage")}.`;
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

  // Week 2 Lesson 1
  [/prime factorisation of (\d+)\?/, (m) => { const r = n(m[1]), a = smallestFactor(r); return a === r ? undefined : { kind: "tree", title: `Start a factor tree for ${r}`, root: r, left: a, right: r / a }; }],
  [/factor tree for (\d+) ends with (\d+) factors of (\d+) and (\d+) factors of (\d+)/, (m) => ({ kind: "primes", title: `End of the factor tree for ${m[1]}`, primes: [...Array(n(m[2])).fill(n(m[3])), ...Array(n(m[4])).fill(n(m[5]))] })],
  [/rectangle has an area of (\d+) cm²\. Both side lengths are prime/, (m) => ({ kind: "plots", title: "Rectangle with prime sides", plots: [{ w: Math.max(...[smallestFactor(n(m[1])), n(m[1]) / smallestFactor(n(m[1]))]), h: Math.min(smallestFactor(n(m[1])), n(m[1]) / smallestFactor(n(m[1]))), material: "plain", centre: `${m[1]} cm²`, bottom: "prime ?", left: "prime ?" }], ask: "perimeter" })],
  [/Tiles come in boxes of (\d+)\. A designer wants one solid square made from full boxes/, (m) => ({ kind: "plots", title: "One box of tiles", plots: [{ w: 3, h: 2, material: "tiles", centre: `${m[1]} tiles` }], ask: "fewest full boxes that make a square" })],
  // Week 2 Lesson 2
  [/^Evaluate (\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)\.$/, (m) => ({ kind: "power", title: "Read the power", base: n(m[1]), exponent: sup(m[2]) })],
  [/student writes (\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+) = \d+\. Which calculation is correct/, (m) => ({ kind: "power", title: "Read the power", base: n(m[1]), exponent: sup(m[2]) })],
  [/Each branch splits into 2 branches\. After (\d+) splits/, (m) => ({ kind: "doubling", title: "Branches splitting", item: "branch", shown: 2, target: `the endpoints after ${m[1]} splits` })],
  [/Each branch splits into 3 branches\. After (\d+) splits/, (m) => ({ kind: "doubling", title: "Branches splitting in three", item: "branch3", shown: 2, target: `the endpoints after ${m[1]} splits` })],
  [/bacteria count doubles every hour, starting from 1\. After how many hours will there be (\d+)/, (m) => ({ kind: "doubling", title: "Bacteria doubling", item: "bacteria", shown: 3, target: `the hour with ${m[1]} bacteria` })],
  // Week 2 Lesson 3
  [/Two lights flash every (\d+) and (\d+) seconds/, (m) => ({ kind: "timeline", title: "Two flashing lights", every: [n(m[1]), n(m[2])], unit: "seconds" })],
  [/^(\d+) red beads and (\d+) blue beads are shared/, (m) => ({ kind: "counters", title: "Beads to share", groups: [{ count: n(m[1]), label: "red beads", colour: "red" }, { count: n(m[2]), label: "blue beads", colour: "blue" }] })],
  [/Share (\d+) blue and (\d+) gold crystals into as many identical packs/, (m) => ({ kind: "counters", title: "Crystals to pack", groups: [{ count: n(m[1]), label: "blue crystals", colour: "blue" }, { count: n(m[2]), label: "gold crystals", colour: "gold" }] })],

  // Week 3 Lesson 1
  [/^What is 10([⁰¹²³⁴⁵⁶⁷⁸⁹]+)\?$/, (m) => { const e = sup(m[1]); return { kind: "powerstrip", title: "Powers of ten", from: 1, to: e, showUpTo: Math.min(2, e - 1) }; }],
  [/student says 10([⁰¹²³⁴⁵⁶⁷⁸⁹]+) is \d+ times as large as 10([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/, (m) => ({ kind: "powerstrip", title: "Steps between the powers", from: sup(m[2]), to: sup(m[1]), showUpTo: 0 })],
  [/warehouse holds (\d) × 10([⁰¹²³⁴⁵⁶⁷⁸⁹]+) items and sends out (\d) × 10([⁰¹²³⁴⁵⁶⁷⁸⁹]+) items/, (m) => { const a = n(m[1]) * 10 ** sup(m[2]), b = n(m[3]) * 10 ** sup(m[4]), places = String(a).length; return { kind: "placevalue", title: "Warehouse stock", places, rows: [{ label: "Holds", digits: digits(a, places) }, { label: "Sends out", digits: digits(b, places) }, { label: "Remain", digits: Array(places).fill(null) }] }; }],
  [/stadium holds (\d) × 10([⁰¹²³⁴⁵⁶⁷⁸⁹]+) people\. How many stadiums of that size would hold (\d) × 10([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/, (m) => { const a = n(m[1]) * 10 ** sup(m[2]), b = n(m[3]) * 10 ** sup(m[4]), places = String(b).length; return { kind: "placevalue", title: "Stadium sizes", places, rows: [{ label: "One stadium", digits: digits(a, places) }, { label: "Crowd", digits: digits(b, places) }] }; }],
  // Week 3 Lesson 2
  [/Which expanded form equals ([\d,]+)\?/, (m) => { const v = n(m[1]); return { kind: "placevalue", title: "The number in a place-value chart", places: String(v).length, rows: [{ label: m[1], digits: digits(v, String(v).length) }] }; }],
  [/To write ([\d,]+) using powers of ten, a student wrote/, (m) => { const v = n(m[1]); return { kind: "placevalue", title: `${m[1]} in a place-value chart`, places: String(v).length, rows: [{ label: m[1], digits: digits(v, String(v).length) }] }; }],
  [/A number has (\d+) ten-thousands, (\d+) hundreds and (\d+) ones/, () => ({ kind: "placevalue", title: "Place-value chart", places: 5, rows: [{ label: "Number", digits: Array(5).fill(null) }] })],
  // Week 3 Lesson 3
  [/^Rebuild this number: (\d) × 10([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/, (m) => { const places = sup(m[2]) + 1; return { kind: "placevalue", title: "Place-value chart", places, rows: [{ label: "Number", digits: Array(places).fill(null) }] }; }],
  [/^In (\d+), the digit \d is moved from/, (m) => ({ kind: "placevalue", title: "The number in a place-value chart", places: m[1].length, rows: [{ label: m[1], digits: digits(n(m[1]), m[1].length) }] })],

  // Week 4 Lesson 1
  [/tank holds (\d+) L\. (\d+)\/(\d+) of its capacity is used/, (m) => ({ kind: "tank", title: "Water tank", capacity: `${m[1]} L`, parts: n(m[3]), used: n(m[2]) })],
  [/^(\d+) of every (\d+) students walk to school\. There are (\d+) students/, (m) => ({ kind: "fractionbar", title: `${m[1]} of every ${m[2]} students walk`, parts: n(m[2]), shaded: n(m[1]), caption: `Each group of ${m[2]} students: ${m[1]} walk. There are ${m[3]} students altogether.` })],
  // Week 4 Lesson 2
  [/^Write (\d+)\/(\d+) as a decimal\.$/, (m) => (n(m[2]) <= 25 ? { kind: "fractionbar", title: `${m[1]}/${m[2]} of a bar`, parts: n(m[2]), shaded: n(m[1]) } : undefined)],
  [/^Which calculation equals (\d+)\/(\d+)\?$/, (m) => (n(m[2]) <= 25 ? { kind: "fractionbar", title: `${m[1]}/${m[2]} of a bar`, parts: n(m[2]), shaded: n(m[1]) } : undefined)],
  [/rope is ([\d.]+) m long\. A piece of ([\d /]+) m is cut off/, (m) => { const total = n(m[1]), cut = mixed(m[2]); return Number.isFinite(cut) ? { kind: "lengths", title: "Rope", object: "rope", pieces: [{ length: cut, label: `${m[2].trim()} m`, cut: true }, { length: total - cut, label: "? m" }], ask: "the length left" } : undefined; }],
  [/Three ribbons are ([\d ./]+) m, ([\d ./]+) m and ([\d ./]+) m long/, (m) => { const xs = [m[1], m[2], m[3]].map(mixed); return xs.every(Number.isFinite) ? { kind: "lengths", title: "Three ribbons end to end", object: "ribbon", pieces: xs.map((v, i) => ({ length: v, label: `${[m[1], m[2], m[3]][i].trim()} m` })), ask: "the total length" } : undefined; }],
  // Week 4 Lesson 3
  [/What percentage is equivalent to (\d+)\/(\d+)\?/, (m) => (n(m[2]) <= 25 ? { kind: "fractionbar", title: `${m[1]}/${m[2]} of a bar`, parts: n(m[2]), shaded: n(m[1]), scale: "percent" } : undefined)],
  [/Which pair equals (\d+)%\?/, (m) => ({ kind: "fractionbar", title: `${m[1]}% of a hundred grid`, parts: 100, shaded: n(m[1]), grid: true })],
  [/^(\d+) of a club's (\d+) members attend/, (m) => ({ kind: "percentbar", title: "Club attendance", whole: `${m[2]} members`, part: n(m[1]), of: n(m[2]), partLabel: `${m[1]} attend`, ask: "% attend" })],
  [/A \$(\d+) jacket is reduced by (\d+)%/, (m) => ({ kind: "percentbar", title: "Jacket sale", whole: `$${m[1]}`, part: n(m[2]), of: 100, partLabel: `${m[2]}% off`, ask: "sale price" })],
];

export function number7Picture(prompt: string): Number7Picture | undefined {
  for (const [re, make] of RULES) { const m = prompt.match(re); if (m) return make(m); }
  return undefined;
}
