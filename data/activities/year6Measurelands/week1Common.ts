import type { PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 6 · Week 1 — shared helpers ("Area Formula") ──────────
// AC9M6M02: establish the formula for the area of a rectangle and use it to solve
// practical problems. Rectangles & squares only, whole numbers, no composite.
// Reuses the existing `area` task kind + Area Builder (ArrayGrid / DimRect).

type AreaTask = Extract<PracticeTask, { kind: "area" }>;

export function randInt(n: number): number { return Math.floor(Math.random() * n); }
export function between(lo: number, hi: number): number { return lo + randInt(hi - lo + 1); }
export function choose<T>(items: T[]): T { return items[randInt(items.length)]!; }
export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) { const j = randInt(i + 1); [next[i], next[j]] = [next[j]!, next[i]!]; }
  return next;
}

// Contexts (emoji matches the label). cm² = small handheld; m² = real spaces.
const CM_CONTEXTS = [
  { label: "book cover", emoji: "📕" },
  { label: "tablet screen", emoji: "📱" },
  { label: "photo frame", emoji: "🖼️" },
  { label: "floor tile", emoji: "⬜" },
];
const M_CONTEXTS = [
  { label: "garden bed", emoji: "🌱" },
  { label: "picnic rug", emoji: "🧺" },
  { label: "bedroom floor", emoji: "🛏️" },
  { label: "sun shade", emoji: "⛱️" },
];
export const L3_CONTEXTS = [
  { label: "school hall", emoji: "🏫" },
  { label: "basketball court", emoji: "🏀" },
  { label: "classroom", emoji: "🎒" },
  { label: "playground", emoji: "🛝" },
  { label: "car park", emoji: "🅿️" },
  { label: "vegetable garden", emoji: "🥕" },
  { label: "courtyard", emoji: "🏛️" },
];

// Distractors for "choose the area": perimeter, added sides, and one wrong-multiply.
function areaOptions(length: number, width: number): { options: number[]; correct: number } {
  const correct = length * width;
  const cands = [2 * (length + width), length + width, length * length, width * width, (length + 1) * width, length * (width + 1)];
  const opts = [correct];
  for (const v of shuffle(cands)) { if (opts.length < 3 && v > 0 && !opts.includes(v)) opts.push(v); }
  let bump = 2;
  while (opts.length < 3) { const v = correct + bump; if (!opts.includes(v)) opts.push(v); bump += 3; }
  return { options: shuffle(opts), correct };
}

// ── Lesson 1: discover (rows → columns → predict → formula) ────────────────────
function smallDims(): { length: number; width: number } {
  return { length: between(3, 8), width: between(2, 6) };
}

export function rowsTask(): AreaTask {
  const { length, width } = smallDims();
  return {
    kind: "area", scene: "rows", gridW: length, gridH: width,
    prompt: "Count the rows.",
    speakText: "For years you've counted every square. Let's find a faster way. Tap each row to count how many rows this rectangle has.",
    badgeLabel: "Count the Rows",
    feedback: { correct: "That's the width — the number of rows.", wrong: "Tap every row." },
  };
}

export function columnsTask(): AreaTask {
  const { length, width } = smallDims();
  return {
    kind: "area", scene: "columns", gridW: length, gridH: width,
    prompt: "Count the columns.",
    speakText: "Now tap each column to count how many columns this rectangle has.",
    badgeLabel: "Count the Columns",
    feedback: { correct: "That's the length — the number of columns.", wrong: "Tap every column." },
  };
}

export function predictTask(): AreaTask {
  const { length, width } = smallDims();
  return {
    kind: "area", scene: "predictArray", gridW: length, gridH: width, answerValue: length * width,
    prompt: "Predict: how many square units?",
    speakText: `This rectangle has ${width} rows and ${length} columns. Predict how many square units there are, then reveal to check.`,
    badgeLabel: "Discover the Pattern",
    feedback: { correct: "You predicted it!", wrong: "Rows × columns — try again." },
  };
}

export function formulaRevealTask(): AreaTask {
  const { length, width } = { length: between(5, 7), width: between(3, 5) };
  return {
    kind: "area", scene: "formulaReveal", gridW: length, gridH: width,
    prompt: "You found the shortcut!",
    speakText: "You discovered the pattern. Every row holds the same number of squares, so rows times columns counts them all. That is the area formula: area equals length times width.",
    badgeLabel: "You Discovered It!",
    feedback: { correct: "Area = length × width!", wrong: "Area = length × width!" },
  };
}

// Determinate MCQ for the weekly quiz (how many squares = rows × columns).
export function arrayMcqTask(): AreaTask {
  const { length, width } = smallDims();
  const correct = length * width;
  const opts = [correct];
  for (const v of shuffle([length + width, 2 * (length + width), correct + length, correct - width])) {
    if (opts.length < 3 && v > 0 && !opts.includes(v)) opts.push(v);
  }
  while (opts.length < 3) opts.push(correct + opts.length);
  return {
    kind: "area", scene: "arrayArea", gridW: length, gridH: width,
    options: shuffle(opts), correctNumber: correct,
    prompt: "How many square units?",
    speakText: "Use rows times columns. How many square units are there?",
    badgeLabel: "Rows × Columns",
    feedback: { correct: `Yes — ${width} × ${length} = ${correct}.`, wrong: `Rows × columns = ${correct}.` },
  };
}

// Instructional opener for Lessons 2 & 3 — teach Area = length × width first.
export function formulaIntroTask(): AreaTask {
  return {
    kind: "area", scene: "formulaIntro", gridW: 5, gridH: 3, areaUnit: "m²",
    prompt: "Area = length × width",
    speakText: "Here's the rule. The area of a rectangle is length times width. The length is how far across, the width is how far down. Multiply them to count every square at once. We measure area in square units, like square metres.",
    badgeLabel: "The Area Formula",
    feedback: { correct: "Let's calculate!", wrong: "Let's calculate!" },
  };
}

// ── Lessons 2 & 3: calculate / choose / spot-mistake from labelled dimensions ──
type Ctx = { label: string; emoji: string };

function calcDimsTask(length: number, width: number, unit: "cm²" | "m²", ctx?: Ctx): AreaTask {
  const lin = unit === "cm²" ? "cm" : "m";
  return {
    kind: "area", scene: "calcDims", gridW: length, gridH: width, areaUnit: unit, answerValue: length * width,
    context: ctx?.label, emoji: ctx?.emoji,
    prompt: "What is the area?",
    speakText: `The rectangle is ${length} ${lin} long and ${width} ${lin} wide. What is its area? Multiply length by width.`,
    badgeLabel: "Find the Area",
    feedback: { correct: `Yes — ${length} × ${width} = ${length * width} ${unit}.`, wrong: `Length × width = ${length} × ${width}.` },
  };
}

function chooseAreaTask(length: number, width: number, unit: "cm²" | "m²", ctx?: Ctx): AreaTask {
  const { options, correct } = areaOptions(length, width);
  return {
    kind: "area", scene: "chooseArea", gridW: length, gridH: width, areaUnit: unit,
    options, correctNumber: correct,
    context: ctx?.label, emoji: ctx?.emoji,
    prompt: "Which is the area?",
    speakText: "Choose the correct area. Remember: area is length times width, not the distance around.",
    badgeLabel: "Choose the Area",
    feedback: { correct: `Yes — ${length} × ${width} = ${correct} ${unit}.`, wrong: `Area is length × width = ${correct} ${unit}, not the perimeter.` },
  };
}

function mistakeDimsTask(length: number, width: number, unit: "cm²" | "m²", ctx?: Ctx): AreaTask {
  const added = length + width;
  const perim = 2 * (length + width);
  const useAdd = randInt(2) === 0;
  const statement = useAdd
    ? `Gauge says the area is ${added} ${unit} (he added the sides).`
    : `Gauge says the area is ${perim} ${unit} (he went around the edge).`;
  const correctReason = useAdd ? "He added instead of multiplying" : "He found the perimeter, not the area";
  const distractors = ["He multiplied correctly", "He used the wrong units", "He measured the wrong shape"];
  return {
    kind: "area", scene: "mistakeDims", gridW: length, gridH: width, areaUnit: unit,
    context: ctx?.label, emoji: ctx?.emoji, statement,
    reasonOptions: shuffle([correctReason, distractors[0]!, useAdd ? distractors[2]! : distractors[1]!]),
    correctReason,
    prompt: "What did Professor Gauge do wrong?",
    speakText: `${statement} What did he do wrong? The area should be length times width.`,
    badgeLabel: "Professor Gauge's Mistake",
    feedback: { correct: `Right — the area is ${length} × ${width} = ${length * width} ${unit}.`, wrong: `Area is length × width = ${length * width} ${unit}.` },
  };
}

// Lesson 2 — abstract labelled rectangles, mixed cm²/m², small numbers.
function l2Dims(): { length: number; width: number; unit: "cm²" | "m²"; ctx: Ctx } {
  if (randInt(2) === 0) return { length: between(3, 9), width: between(2, 7), unit: "cm²", ctx: choose(CM_CONTEXTS) };
  return { length: between(3, 12), width: between(2, 8), unit: "m²", ctx: choose(M_CONTEXTS) };
}
export function l2Calc(): AreaTask { const d = l2Dims(); return calcDimsTask(d.length, d.width, d.unit, d.ctx); }
export function l2Choose(): AreaTask { const d = l2Dims(); return chooseAreaTask(d.length, d.width, d.unit, d.ctx); }
export function l2Mistake(): AreaTask { const d = l2Dims(); return mistakeDimsTask(d.length, d.width, d.unit, d.ctx); }

// Lesson 3 — real spaces, always m², larger numbers.
function l3Dims(): { length: number; width: number; ctx: Ctx } {
  return { length: between(6, 24), width: between(4, 14), ctx: choose(L3_CONTEXTS) };
}
export function l3Calc(): AreaTask { const d = l3Dims(); return calcDimsTask(d.length, d.width, "m²", d.ctx); }
export function l3Choose(): AreaTask { const d = l3Dims(); return chooseAreaTask(d.length, d.width, "m²", d.ctx); }
export function l3Mistake(): AreaTask { const d = l3Dims(); return mistakeDimsTask(d.length, d.width, "m²", d.ctx); }
