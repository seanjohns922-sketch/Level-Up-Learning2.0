import type { PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 6 · Week 7 — "Measurement Mastery" ───────────────────
// Choose the right strategy (no new concept). L1/L2 reuse the toolChoice card for
// strategy/tool/efficiency selection; L3 is a bespoke multi-part investigation
// combining strands. Analyse → Choose → Justify.

type ToolTask = Extract<PracticeTask, { kind: "toolChoice" }>;
type InvestigationTask = Extract<PracticeTask, { kind: "investigation" }>;

export function randInt(n: number): number { return Math.floor(Math.random() * n); }
export function choose<T>(items: T[]): T { return items[randInt(items.length)]!; }
export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) { const j = randInt(i + 1); [next[i], next[j]] = [next[j]!, next[i]!]; }
  return next;
}
function fmt12(min: number): string { const h24 = Math.floor(min / 60) % 24, m = ((min % 60) + 60) % 60, ap = h24 < 12 ? "am" : "pm"; let h = h24 % 12; if (h === 0) h = 12; return `${h}:${String(m).padStart(2, "0")} ${ap}`; }
function fmtDur(min: number): string { const h = Math.floor(min / 60), m = min % 60; if (h && m) return `${h} h ${m} min`; if (h) return `${h} h`; return `${m} min`; }

type Opt = { id: string; label: string; iconKey: string; imageSrc?: string; focus?: string };
const S: Record<string, Opt> = {
  perimeter: { id: "perimeter", label: "Perimeter", iconKey: "m-perimeter", focus: "distance around" },
  area: { id: "area", label: "Area", iconKey: "m-area", focus: "surface inside" },
  volume: { id: "volume", label: "Volume", iconKey: "m-volume", focus: "space inside" },
  length: { id: "length", label: "Length", iconKey: "m-length", focus: "how long" },
  mass: { id: "mass", label: "Mass", iconKey: "m-mass", focus: "how heavy" },
  capacity: { id: "capacity", label: "Capacity", iconKey: "m-capacity", focus: "how much it holds" },
  time: { id: "time", label: "Time", iconKey: "m-time", focus: "how long it takes" },
  angle: { id: "angle", label: "Angle", iconKey: "m-angle", focus: "the turn" },
  convert: { id: "convert", label: "Convert", iconKey: "m-convert", focus: "change units" },
};
const TOOL: Record<string, Opt> = {
  tape: { id: "tape", label: "Tape Measure", iconKey: "m-tape", focus: "lengths" },
  protractor: { id: "protractor", label: "Protractor", iconKey: "m-protractor", focus: "angles" },
  scale: { id: "scale", label: "Scales", iconKey: "m-mass", focus: "mass" },
  jug: { id: "jug", label: "Measuring Jug", iconKey: "m-capacity", focus: "capacity" },
};

const STRAT_SCENARIOS = [
  { p: "A gardener wants to fence around a rectangular garden. What should they work out?", c: "perimeter", d: ["area", "volume"], why: "Fencing goes around the edge — that's perimeter, not the space inside." },
  { p: "You want new carpet to cover the classroom floor. What should you work out?", c: "area", d: ["perimeter", "length"], why: "Carpet covers a surface — that's area, not the distance around." },
  { p: "How much sand fills a rectangular sandpit box?", c: "volume", d: ["area", "perimeter"], why: "Filling a box is three-dimensional — that's volume, not a flat area." },
  { p: "How much water does the fish tank hold?", c: "capacity", d: ["mass", "area"], why: "How much liquid a container holds is capacity, not weight." },
  { p: "You're planning a bus trip. When will you arrive?", c: "time", d: ["length", "angle"], why: "Arrival is a time calculation, not a length." },
  { p: "What is the slope (pitch) of the roof?", c: "angle", d: ["length", "area"], why: "A slope is an angle, not a length." },
  { p: "The plan is in metres but your ruler shows centimetres. What must you do first?", c: "convert", d: ["area", "time"], why: "Different units must be converted before you calculate." },
  { p: "How heavy is the bag of soil?", c: "mass", d: ["capacity", "volume"], why: "Heaviness is mass, measured in kilograms." },
];
const TOOL_SCENARIOS = [
  { p: "You need to measure the length of the playground.", c: "tape", d: ["protractor", "jug"] },
  { p: "You need to measure the angle of a skate ramp.", c: "protractor", d: ["tape", "scale"] },
  { p: "You need to weigh a parcel.", c: "scale", d: ["jug", "protractor"] },
  { p: "You need to measure how much water fills a bucket.", c: "jug", d: ["scale", "tape"] },
];
const EFFICIENCY: Array<{ p: string; opts: Opt[]; c: string; why: string }> = [
  { p: "To find the area of a 12 m × 8 m hall, what's the smartest way?", opts: [{ id: "formula", label: "Length × width", iconKey: "m-area", focus: "12 × 8" }, { id: "count", label: "Count every square", iconKey: "m-volume", focus: "slow" }, { id: "tape", label: "Re-measure each tile", iconKey: "m-tape", focus: "slow" }], c: "formula", why: "Length × width gives it instantly — counting 96 squares is slow." },
  { p: "To find a missing angle on a straight line, what's smartest?", opts: [{ id: "reason", label: "Use 180°", iconKey: "m-angle", focus: "reason" }, { id: "protractor", label: "Measure it", iconKey: "m-protractor", focus: "slower" }, { id: "guess", label: "Estimate it", iconKey: "m-length", focus: "risky" }], c: "reason", why: "Know 180° and one angle? Just subtract — no measuring needed." },
  { p: "To find the perimeter of a square with side 9 m, what's smartest?", opts: [{ id: "mult", label: "4 × side", iconKey: "m-perimeter", focus: "4 × 9" }, { id: "add", label: "Add all four sides", iconKey: "m-length", focus: "longer" }, { id: "wheel", label: "Roll a trundle wheel", iconKey: "m-time", focus: "slow" }], c: "mult", why: "For a square, 4 × side is quickest." },
];

// ── L1/L2 strategy selection (toolChoice) ─────────────────────────────────────
function bestFrom(prompt: string, opts: Opt[], correctId: string, badge: string, speak: string): ToolTask {
  return {
    kind: "toolChoice", scene: "best", tools: shuffle(opts), correctToolId: correctId,
    prompt, speakText: speak, badgeLabel: badge,
    feedback: { correct: "Yes — that's the right strategy.", wrong: "Think about what's being measured." },
  };
}
export function strategyBest(): ToolTask {
  const s = choose(STRAT_SCENARIOS);
  return bestFrom(s.p, [S[s.c]!, S[s.d[0]!]!, S[s.d[1]!]!], s.c, "What Do You Need?", "Master mathematicians think before they calculate. What should you work out?");
}
export function toolBest(): ToolTask {
  const s = choose(TOOL_SCENARIOS);
  return bestFrom(s.p, [TOOL[s.c]!, TOOL[s.d[0]!]!, TOOL[s.d[1]!]!], s.c, "Choose the Tool", "Which is the right tool for the job?");
}
export function optimiseBest(): ToolTask {
  const e = choose(EFFICIENCY);
  return bestFrom(e.p, e.opts, e.c, "Most Efficient Method", "There is often more than one way. Which is the smartest?");
}
export function strategyWhyBad(): ToolTask {
  const s = choose(STRAT_SCENARIOS);
  const wrong = S[choose(s.d)]!;
  return {
    kind: "toolChoice", scene: "whyBad", wrongTool: { label: wrong.label, iconKey: wrong.iconKey, imageSrc: wrong.imageSrc },
    reasonOptions: shuffle([s.why, "It is actually the correct choice", "You can't decide without measuring"]),
    correctReason: s.why,
    prompt: `${s.p} Professor Gauge chose ${wrong.label}. Why is that wrong?`,
    speakText: `Professor Gauge chose ${wrong.label}. Why is that the wrong strategy?`,
    badgeLabel: "Professor Gauge's Choice",
    feedback: { correct: "Right — he measured the wrong thing.", wrong: "Think about what the problem actually needs." },
  };
}
export function optimiseWhyBad(): ToolTask {
  const e = choose(EFFICIENCY);
  const wrong = choose(e.opts.filter((o) => o.id !== e.c));
  return {
    kind: "toolChoice", scene: "whyBad", wrongTool: { label: wrong.label, iconKey: wrong.iconKey, imageSrc: wrong.imageSrc },
    reasonOptions: shuffle([e.why, "It is the fastest method", "Both methods take the same time"]),
    correctReason: e.why,
    prompt: `${e.p} Gauge chose "${wrong.label}". Why is that not the smartest way?`,
    speakText: `Gauge chose ${wrong.label}. Why is that not the most efficient method?`,
    badgeLabel: "Which Is Better?",
    feedback: { correct: "Right — there's a faster way.", wrong: "There's a quicker, simpler method." },
  };
}

// ── L3 bespoke investigations ─────────────────────────────────────────────────
export function playgroundInvestigation(): InvestigationTask {
  const L = choose([10, 12, 14]), W = choose([6, 8]), area = L * W, per = 2 * (L + W);
  const sh = choose([1, 2]), svol = 3 * 2 * sh;
  return {
    kind: "investigation", title: "Design the Community Playground", emoji: "🛝", badgeLabel: "Master Engineer Challenge",
    prompt: "Design the community playground.",
    facts: [`Play area: ${L} m × ${W} m rectangle`, `Sandpit box: 3 m × 2 m × ${sh} m`, "The play area needs a fence and soft-fall surface."],
    parts: [
      { q: "How much soft-fall covers the play area?", strategy: "Area", options: shuffle([`${area} m²`, `${per} m`, `${L + W} m`]), answer: `${area} m²` },
      { q: "How much fencing goes around the play area?", strategy: "Perimeter", options: shuffle([`${per} m`, `${area} m²`, `${L} m`]), answer: `${per} m` },
      { q: "How much sand fills the sandpit?", strategy: "Volume", options: shuffle([`${svol} m³`, `${3 * 2} m²`, `${svol + 2} m³`]), answer: `${svol} m³` },
    ],
    feedback: { correct: "Playground designed!", wrong: "Choose the right maths for each part." },
  };
}
export function campInvestigation(): InvestigationTask {
  const dep = 8 * 60 + choose([0, 30]), travel = choose([90, 120, 150]), arr = dep + travel;
  const bottles = choose([3, 4]), litres = bottles * 5, km = choose([3, 4, 5]), m = km * 1000;
  return {
    kind: "investigation", title: "Plan the School Camp", emoji: "🏕️", badgeLabel: "Master Engineer Challenge",
    prompt: "Plan the school camp.",
    facts: [`Bus departs ${fmt12(dep)}, travels ${fmtDur(travel)}`, `Each student: ${bottles} bottles of 5 L water`, `Bushwalk: ${km} km`],
    parts: [
      { q: "What time does the bus arrive at camp?", strategy: "Time", options: shuffle([fmt12(arr), fmt12(arr + 30), fmt12(dep + 60)]), answer: fmt12(arr) },
      { q: "How many litres of water does each student carry?", strategy: "Capacity", options: shuffle([`${litres} L`, `${bottles + 5} L`, `${litres * 2} L`]), answer: `${litres} L` },
      { q: `The bushwalk is ${km} km. How many metres is that?`, strategy: "Convert", options: shuffle([`${m} m`, `${km * 100} m`, `${m / 10} m`]), answer: `${m} m` },
    ],
    feedback: { correct: "Camp planned!", wrong: "Choose the right maths for each part." },
  };
}
export function towerInvestigation(): InvestigationTask {
  const base = choose([5, 6]), barea = base * base, known = choose([120, 130, 140]), missing = 180 - known, h = choose([3, 4]), vol = barea * h;
  return {
    kind: "investigation", title: "Build the Observation Tower", emoji: "🗼", badgeLabel: "Master Engineer Challenge",
    prompt: "Build the observation tower.",
    facts: [`Square base: ${base} m × ${base} m`, `A support brace and the deck meet on a straight line; one angle is ${known}°`, `The base block is ${h} m tall`],
    parts: [
      { q: "What is the area of the square base?", strategy: "Area", options: shuffle([`${barea} m²`, `${base * 4} m`, `${base * 2} m²`]), answer: `${barea} m²` },
      { q: "What is the missing angle of the brace?", strategy: "Angle", options: shuffle([`${missing}°`, `${360 - known}°`, `${known}°`]), answer: `${missing}°` },
      { q: "What is the volume of the base block?", strategy: "Volume", options: shuffle([`${vol} m³`, `${barea} m²`, `${vol + base} m³`]), answer: `${vol} m³` },
    ],
    feedback: { correct: "Tower complete — you're a Master of Measurelands!", wrong: "Choose the right maths for each part." },
  };
}
