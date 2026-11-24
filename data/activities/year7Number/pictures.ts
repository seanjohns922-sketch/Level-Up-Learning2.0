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
  | { kind: "percentbar"; title: string; whole: string; part: number; partLabel: string; of: number; ask: string }
  /** A thermometer or sea-level scale with labelled readings; only the labelled values are shown. */
  | { kind: "vertical"; title: string; object: "thermometer" | "sea"; unit: string; readings: { value: number; label: string }[]; ask: string }
  /** Moves along a number line, drawn to scale; only zero and the start are labelled, so the end must be worked out. */
  | { kind: "moves"; title: string; start: number; startLabel: string; moves: number[]; moveLabels: string[]; ask: string }
  /** A receipt: given lines and the unknown total. */
  | { kind: "receipt"; title: string; lines: [string, string][]; ask: string }
  /** Measuring jugs; each holds a labelled amount out of `of` litres, drawn to scale. */
  | { kind: "jugs"; title: string; jugs: { amount: number; label: string; role?: "add" | "use" | "result" }[]; ask: string }
  /** A bar model for a fraction of a fraction: whole split into `a` parts, `b` taken, then that part split into `c`, `d` taken. */
  | { kind: "barmodel"; title: string; whole: string; a: number; b: number; c: number; d: number; first: string; second: string };

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
    case "vertical":
      return `${p.title}. A ${p.object === "sea" ? "sea-level scale with 0 at sea level" : "thermometer"}. ${p.readings.map((r) => r.label).join(". ")}. Find ${p.ask}.`;
    case "moves":
      return `${p.title}. A number line with 0 marked. Start at ${p.startLabel}. ${p.moveLabels.join(", then ")}. Find ${p.ask}.`;
    case "receipt":
      return `${p.title}. ${p.lines.map(([a, b]) => `${a}: ${b}`).join(". ")}. Find ${p.ask}.`;
    case "jugs":
      return `${p.title}. ${p.jugs.map((j) => j.label).join(". ")}. Find ${p.ask}.`;
    case "barmodel":
      return `${p.title}. A bar for ${p.whole}, split into ${p.a} equal parts with ${p.b} marked: ${p.first}. That part is split into ${p.c} equal parts with ${p.d} marked: ${p.second}.`;
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

  // Week 5 Lesson 1
  [/Four sites have elevations ([-−\d, ]+) m\./, (m) => { const vs = m[1].split(",").map((x) => Number(x.trim().replace("−", "-"))); return { kind: "vertical", title: "Site elevations", object: "sea", unit: "m", readings: vs.map((v) => ({ value: v, label: `${String(v).replace("-", "−")} m` })), ask: "the gap from lowest to highest" }; }],
  [/temperature was ([-−]?\d+) °C at (\d+ [ap]m) and ([-−]?\d+) °C at (\d+ [ap]m)/, (m) => ({ kind: "vertical", title: "Temperature", object: "thermometer", unit: "°C", readings: [{ value: Number(m[1].replace("−", "-")), label: `${m[2]}: ${m[1].replace("-", "−")} °C` }, { value: Number(m[3].replace("−", "-")), label: `${m[4]}: ${m[3].replace("-", "−")} °C` }], ask: "the rise" })],
  // Week 5 Lesson 2
  [/diver starts at ([-−]\d+) m relative to sea level, rises (\d+) m, then descends (\d+) m/, (m) => { const s0 = Number(m[1].replace("−", "-")); return { kind: "moves", title: "Diver's moves", start: s0, startLabel: `${m[1].replace("-", "−")} m`, moves: [n(m[2]), -n(m[3])], moveLabels: [`up ${m[2]} m`, `down ${m[3]} m`], ask: "the final position" }; }],
  [/bank balance is [-−]\$(\d+)\. How much must she deposit to have \$(\d+)/, (m) => ({ kind: "moves", title: "Bank balance", start: -n(m[1]), startLabel: `−$${m[1]}`, moves: [n(m[1]) + n(m[2])], moveLabels: [`deposit ? to reach $${m[2]}`], ask: "the deposit" })],
  // Week 5 Lesson 3
  [/account balance is [-−]\$(\d+)\. A charge of \$(\d+) is made, then a mistaken debit of \$(\d+) is reversed/, (m) => ({ kind: "moves", title: "Account balance", start: -n(m[1]), startLabel: `−$${m[1]}`, moves: [-n(m[2]), n(m[3])], moveLabels: [`charge $${m[2]}`, `$${m[3]} given back`], ask: "the final balance" })],
  [/Five daily temperature changes are ([+−\-\d, and]+) °C/, (m) => { const vs = m[1].replace(" and ", ", ").split(",").map((x) => Number(x.trim().replace("−", "-").replace("+", ""))); return { kind: "moves", title: "Five days of changes", start: 0, startLabel: "start", moves: vs, moveLabels: vs.map((v) => `${v > 0 ? "+" : "−"}${Math.abs(v)} °C`), ask: "the overall change" }; }],
  // Week 6 Lesson 3
  [/At dawn it is ([-−][\d ]+(?:\/\d+)?) °C\. At noon it is (\d+) °C/, (m) => { const dawn = -mixed(m[1].replace(/[-−]/, "")); return Number.isFinite(dawn) ? { kind: "vertical", title: "Temperature", object: "thermometer", unit: "°C", readings: [{ value: dawn, label: `Dawn: ${m[1].replace("-", "−").trim()} °C` }, { value: n(m[2]), label: `Noon: ${m[2]} °C` }], ask: "the rise" } : undefined; }],
  // Week 7 Lesson 1
  [/^Fabric: (\d+) m at \$([\d.]+) per metre/, (m) => ({ kind: "receipt", title: "Fabric order", lines: [["Fabric", `${m[1]} m`], ["Price per metre", `$${m[2]}`]], ask: "total, to the cent" })],
  [/^(\d+) friends share a \$([\d.]+) bill equally/, (m) => ({ kind: "receipt", title: "Shared bill", lines: [["Bill total", `$${m[2]}`], ["Friends sharing", m[1]]], ask: "each share, to the cent" })],
  // Week 7 Lesson 3
  [/Estimate the cost of (\d+) items at \$([\d.]+) each plus \$(\d+) delivery/, (m) => ({ kind: "receipt", title: "Order estimate", lines: [[`Items × ${m[1]}`, `$${m[2]} each`], ["Delivery", `$${m[3]}`]], ask: "estimated total" })],
  // Week 8 Lesson 1
  [/^A jug holds (\d+\/\d+) L\. (Add|Use) (\d+\/\d+) L/, (m) => ({ kind: "jugs", title: "Measuring jugs", jugs: [{ amount: mixed(m[1]), label: `In the jug: ${m[1]} L` }, { amount: mixed(m[3]), label: `${m[2] === "Add" ? "Added" : "Used"}: ${m[3]} L`, role: m[2] === "Add" ? "add" : "use" }], ask: m[2] === "Add" ? "litres now" : "litres left" })],
  [/One jug holds (\d+\/\d+) L of water and another holds (\d+\/\d+) L/, (m) => ({ kind: "jugs", title: "Two jugs poured together", jugs: [{ amount: mixed(m[1]), label: `Jug 1: ${m[1]} L` }, { amount: mixed(m[2]), label: `Jug 2: ${m[2]} L` }], ask: "litres in the third jug" })],
  // Week 8 Lesson 2
  [/tank holds (\d+) L\. First (\d+)\/(\d+) of the water is set aside\. Then (\d+)\/(\d+) of that amount is used/, (m) => ({ kind: "barmodel", title: "Bar model", whole: `${m[1]} L`, a: n(m[3]), b: n(m[2]), c: n(m[5]), d: n(m[4]), first: `${m[2]}/${m[3]} set aside`, second: `${m[4]}/${m[5]} of that used` })],
  [/class has (\d+) students\. (\d+)\/(\d+) of them play sport, and (\d+)\/(\d+) of those play netball/, (m) => ({ kind: "barmodel", title: "Bar model", whole: `${m[1]} students`, a: n(m[3]), b: n(m[2]), c: n(m[5]), d: n(m[4]), first: `${m[2]}/${m[3]} play sport`, second: `${m[4]}/${m[5]} of those play netball` })],
  // Week 8 Lesson 3
  [/You have (\d+\/\d+) L of juice\. Each bottle holds (\d+\/\d+) L/, (m) => ({ kind: "jugs", title: "Juice and bottles", jugs: [{ amount: mixed(m[1]), label: `Juice: ${m[1]} L` }, { amount: mixed(m[2]), label: `One bottle: ${m[2]} L`, role: "result" }], ask: "full bottles" })],
  [/A ribbon (\d+) m long is cut into pieces (\d+\/\d+) m long/, (m) => { const piece = mixed(m[2]), total = n(m[1]); return { kind: "lengths", title: "Cutting the ribbon", object: "ribbon", pieces: [{ length: piece, label: `${m[2]} m` }, { length: piece, label: `${m[2]} m` }, { length: total - 2 * piece, label: `… ${m[1]} m in all` }], ask: "complete pieces" }; }],
];

export function number7Picture(prompt: string): Number7Picture | undefined {
  for (const [re, make] of RULES) { const m = prompt.match(re); if (m) return make(m); }
  return undefined;
}
