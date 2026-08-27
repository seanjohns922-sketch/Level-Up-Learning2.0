import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";

// ── Statistica Level 4 (Year 4) — AC9M4ST01 (many-to-one data displays with a
// KEY; column graphs) + AC9M4ST02 (describe the DISTRIBUTION of data: where it
// is concentrated, its shape, and variation/spread) + AC9M4ST03 (investigation).
// Year 4's genuinely new content is the many-to-one pictograph (one symbol worth
// several data points, including half symbols) and reasoning about distribution
// shape — neither exists in Levels 1-3. This level leads with both and spirals
// the Year-3 column graphs / tables for review.

type Gen = (round: number, target: number) => PracticeTask;

const C = { red: "#ef4444", amber: "#f59e0b", orange: "#fb923c", blue: "#3b82f6", green: "#22c55e", purple: "#a855f7", teal: "#14b8a6", pink: "#ec4899", indigo: "#6366f1" };
const pick = <T,>(arr: T[], i: number) => arr[((i % arr.length) + arr.length) % arr.length]!;
const order = <T,>(arr: T[], round: number) => (round % 2 ? [...arr].reverse() : arr);

// Number-option builder stepping by the key so distractors are believable
// pictograph mistakes (one symbol too many/few), always including the answer.
function unitOptions(correct: number, key: number, round: number) {
  const cands = [correct, correct + key, Math.max(1, correct - key), correct + 2 * key];
  const seen = new Set<number>();
  const uniq = cands.filter((n) => (seen.has(n) ? false : (seen.add(n), true)));
  const three = [correct, ...uniq.filter((n) => n !== correct)].slice(0, 3);
  return order(three.map((n) => ({ id: `n${n}`, label: String(n) })), round);
}

// ── Many-to-one pictograph data (one symbol = keyUnits data points) ──────────
type PictoTheme = { symbol: string; unit: string; q: string; rows: string[] };
const PICTO_THEMES: PictoTheme[] = [
  { symbol: "apple", unit: "apples", q: "Apples sold at each shop", rows: ["Shop A", "Shop B", "Shop C", "Shop D"] },
  { symbol: "teddy", unit: "teddies", q: "Teddies made by each class", rows: ["Class 1", "Class 2", "Class 3", "Class 4"] },
  { symbol: "kite", unit: "kites", q: "Kites flown at each park", rows: ["River", "Hill", "Bay", "Town"] },
  { symbol: "car", unit: "cars", q: "Cars parked on each level", rows: ["Level 1", "Level 2", "Level 3", "Level 4"] },
  { symbol: "fish", unit: "fish", q: "Fish caught by each boat", rows: ["Boat 1", "Boat 2", "Boat 3", "Boat 4"] },
  { symbol: "ball", unit: "balls", q: "Balls in each sports crate", rows: ["Crate 1", "Crate 2", "Crate 3", "Crate 4"] },
];
const ROW_COLORS = [C.red, C.blue, C.green, C.amber];
const KEYS = [2, 5, 10];
// Whole-symbol counts per row (distinct within each set, so most/least differ).
const SYM_SETS = [[3, 5, 2, 4], [4, 2, 6, 3], [6, 3, 5, 2], [2, 6, 4, 5], [5, 4, 2, 6], [3, 6, 4, 2]];

type PictoCat = { id: string; label: string; color: string; count: number };
function pictoData(round: number, opts: { half?: boolean } = {}) {
  const theme = pick(PICTO_THEMES, round);
  const key = pick(KEYS, round);
  const syms = pick(SYM_SETS, round);
  // A single half symbol (only for even keys, so half a symbol is a whole number
  // of units) teaches reading partial symbols.
  const halfRow = opts.half && key % 2 === 0 ? round % 4 : -1;
  const categories: PictoCat[] = theme.rows.map((label, i) => ({
    id: `r${i}`, label, color: ROW_COLORS[i]!, count: syms[i]! * key + (i === halfRow ? key / 2 : 0),
  }));
  return { theme, key, categories };
}

export function pictoReadTask(round: number, target: number): PracticeTask {
  const { theme, key, categories } = pictoData(round, { half: true });
  const row = pick(categories, round);
  return {
    kind: "statisticaPictograph", mode: "read", target, keyUnits: key, unitNoun: theme.unit, symbolLabel: theme.symbol, categories,
    prompt: `${theme.q}. How many for ${row.label}?`,
    speakText: `Each ${theme.symbol} stands for ${key} ${theme.unit}. Count the symbols in the ${row.label} row, then multiply. Half a symbol is ${key / 2}.`,
    options: unitOptions(row.count, key, round), correctOptionIds: [`n${row.count}`],
    feedback: { correct: `Yes — ${row.label} shows ${row.count} ${theme.unit}.`, wrong: `Each symbol is worth ${key}. Count the symbols, then multiply.` },
  };
}
export function pictoCalcTask(round: number, target: number): PracticeTask {
  const { theme, key, categories } = pictoData(round + 1);
  const row = pick(categories, round);
  const symbols = row.count / key;
  return {
    kind: "statisticaPictograph", mode: "calc", target, keyUnits: key, unitNoun: theme.unit, symbolLabel: theme.symbol, categories,
    prompt: `${theme.q}. ${row.label} has ${symbols} symbols — how many ${theme.unit}?`,
    speakText: `${symbols} symbols, each worth ${key}. Work out ${symbols} times ${key}.`,
    options: unitOptions(row.count, key, round), correctOptionIds: [`n${row.count}`],
    feedback: { correct: `Right — ${symbols} times ${key} is ${row.count}.`, wrong: `Multiply the number of symbols by ${key}.` },
  };
}
export function pictoCompareTask(round: number, target: number): PracticeTask {
  const { theme, key, categories } = pictoData(round + 2);
  const sorted = [...categories].sort((a, b) => b.count - a.count);
  const hi = sorted[0]!, lo = sorted[sorted.length - 1]!;
  const diff = hi.count - lo.count;
  return {
    kind: "statisticaPictograph", mode: "compare", target, keyUnits: key, unitNoun: theme.unit, symbolLabel: theme.symbol, categories,
    prompt: `${theme.q}. How many MORE for ${hi.label} than ${lo.label}?`,
    speakText: "Work out each total using the key, then subtract.",
    options: unitOptions(diff, key, round), correctOptionIds: [`n${diff}`],
    feedback: { correct: `Yes — ${hi.count} minus ${lo.count} is ${diff}.`, wrong: "Find both totals with the key, then take the difference." },
  };
}
export function pictoBuildTask(round: number, target: number): PracticeTask {
  const { theme, key, categories } = pictoData(round);
  return {
    kind: "statisticaPictograph", mode: "build", target, keyUnits: key, unitNoun: theme.unit, symbolLabel: theme.symbol, categories,
    prompt: `${theme.q}. Build the pictograph so each row reaches its total.`,
    speakText: `Each symbol is worth ${key} ${theme.unit}. Add symbols until every row matches its aim.`,
    feedback: { correct: "Your pictograph matches every total.", wrong: `Each symbol is worth ${key}, so divide each total by ${key}.` },
  };
}

// ── Year-4 column graphs (two-digit data on a by-10s scale) ──────────────────
// The genuine Year-4 step up from Level 3's "which bar is tallest": every value
// is two digits on a scale that counts in tens, so children read BETWEEN
// gridlines, and the questions demand calculation off the graph — totals,
// combined categories and scaled differences, not a single glance.
type ColSurvey = { q: string; unit: string; cats: Array<{ id: string; label: string; color: string }> };
const COL_COLORS = [C.pink, C.red, C.indigo, C.amber, C.teal];
const COL_SURVEYS: ColSurvey[] = [
  { q: "Books borrowed each day", unit: "books", cats: ["Mon", "Tue", "Wed", "Thu", "Fri"].map((l, i) => ({ id: `c${i}`, label: l, color: COL_COLORS[i]! })) },
  { q: "Cans collected by each class", unit: "cans", cats: ["3A", "3B", "4A", "4B", "5A"].map((l, i) => ({ id: `c${i}`, label: l, color: COL_COLORS[i]! })) },
  { q: "Tickets sold each show night", unit: "tickets", cats: ["Wed", "Thu", "Fri", "Sat", "Sun"].map((l, i) => ({ id: `c${i}`, label: l, color: COL_COLORS[i]! })) },
  { q: "Laps run by each house team", unit: "laps", cats: ["Red", "Blue", "Green", "Gold", "Teal"].map((l, i) => ({ id: `c${i}`, label: l, color: COL_COLORS[i]! })) },
  { q: "Visitors to the fair each hour", unit: "visitors", cats: ["9am", "10am", "11am", "12pm", "1pm"].map((l, i) => ({ id: `c${i}`, label: l, color: COL_COLORS[i]! })) },
  { q: "Cupcakes sold at each stall", unit: "cupcakes", cats: ["Stall 1", "Stall 2", "Stall 3", "Stall 4", "Stall 5"].map((l, i) => ({ id: `c${i}`, label: l, color: COL_COLORS[i]! })) },
];
// Distinct multiples of 5, most sitting between the by-10 gridlines (…25, 35, 45)
// so reading forces a "count on in fives" between the printed tens.
const COL_FREQ: number[][] = [
  [35, 20, 45, 30, 25],
  [40, 15, 30, 45, 20],
  [25, 45, 35, 15, 40],
  [30, 25, 45, 20, 35],
  [45, 30, 20, 40, 25],
  [20, 40, 25, 45, 30],
];
type ColCat = { id: string; label: string; color: string; count: number };
function colData(round: number): { survey: ColSurvey; categories: ColCat[] } {
  const survey = pick(COL_SURVEYS, round);
  const freq = pick(COL_FREQ, round);
  const categories = survey.cats.map((c, i) => ({ ...c, count: freq[i]! }));
  return { survey, categories };
}
// Two distinct categories, deterministic per round, with the taller one first.
function colPair(categories: ColCat[], round: number): { hi: ColCat; lo: ColCat } {
  const a = categories[round % categories.length]!;
  const b = categories[(round + 2) % categories.length]!;
  const [hi, lo] = a.count >= b.count ? [a, b] : [b, a];
  return { hi, lo };
}
// Three numeric answer options (correct + two plausible mistakes), as {id,label}.
function colNumOptions(correct: number, round: number, extras: number[] = []): Array<{ id: string; label: string }> {
  const cands = [correct + 10, correct - 10, correct + 5, correct - 5, ...extras].filter((n) => n > 0 && n !== correct);
  const seen = new Set<number>();
  const wrongs = cands.filter((n) => (seen.has(n) ? false : (seen.add(n), true))).slice(0, 2);
  return order([correct, ...wrongs].map((n) => ({ id: `n${n}`, label: String(n) })), round);
}

// Read one two-digit bar off the by-10s scale (answer equals that bar's height).
export function colReadTask(round: number, target: number): PracticeTask {
  const { survey, categories } = colData(round);
  const offGrid = categories.filter((c) => c.count % 10 !== 0);
  const cat = (offGrid.length ? offGrid : categories)[round % (offGrid.length || categories.length)]!;
  return {
    kind: "statisticaGraph", mode: "read", target, display: "columns", categories,
    prompt: `${survey.q}. How many ${survey.unit} for ${cat.label}?`,
    speakText: `Read up the ${cat.label} column. It sits between two lines, so count on in fives from the ten below.`,
    options: colNumOptions(cat.count, round), correctOptionIds: [`n${cat.count}`],
    feedback: { correct: `Yes — ${cat.label} shows ${cat.count} ${survey.unit}.`, wrong: `The ${cat.label} bar sits between two lines — read the tens, then count on in fives.` },
  };
}
// Add every bar for a whole-of-data total (two-step read + add).
export function colTotalTask(round: number, target: number): PracticeTask {
  const { survey, categories } = colData(round);
  const total = categories.reduce((s, c) => s + c.count, 0);
  return {
    kind: "statisticaInference", target, display: "columns", categories,
    prompt: `${survey.q}. How many ${survey.unit} altogether?`,
    speakText: `Read every column, then add them all together.`,
    options: colNumOptions(total, round), correctOptionIds: [`n${total}`],
    feedback: { correct: `Yes — all five columns add to ${total}.`, wrong: `Read each bar off the scale, then add all five.` },
  };
}
// Combine two categories (read two bars + add); a single bar is the trap.
export function colCombineTask(round: number, target: number): PracticeTask {
  const { survey, categories } = colData(round);
  const { hi, lo } = colPair(categories, round);
  const sum = hi.count + lo.count;
  return {
    kind: "statisticaInference", target, display: "columns", categories,
    prompt: `${survey.q}. How many ${survey.unit} for ${hi.label} and ${lo.label} together?`,
    speakText: `Read the ${hi.label} column and the ${lo.label} column, then add them.`,
    options: colNumOptions(sum, round, [hi.count, lo.count]), correctOptionIds: [`n${sum}`],
    feedback: { correct: `Yes — ${hi.count} and ${lo.count} make ${sum}.`, wrong: `Add the two columns together, not just one.` },
  };
}
// Scaled difference (how many more); the sum is the classic wrong answer.
export function colDiffTask(round: number, target: number): PracticeTask {
  const { survey, categories } = colData(round);
  const { hi, lo } = colPair(categories, round);
  const diff = hi.count - lo.count;
  return {
    kind: "statisticaInference", target, display: "columns", categories,
    prompt: `${survey.q}. How many more ${survey.unit} for ${hi.label} than ${lo.label}?`,
    speakText: `Find the gap between the ${hi.label} column and the ${lo.label} column.`,
    options: colNumOptions(diff, round, [hi.count + lo.count]), correctOptionIds: [`n${diff}`],
    feedback: { correct: `Yes — ${hi.count} take away ${lo.count} is ${diff}.`, wrong: `Subtract the shorter column from the taller one.` },
  };
}
// Quantified interpretation — a claim that only holds if you do the arithmetic.
export function colInferenceTask(round: number, target: number): PracticeTask {
  const { survey, categories } = colData(round);
  const { hi, lo } = colPair(categories, round);
  const diff = hi.count - lo.count;
  const options = order([
    { id: "c", label: `${hi.label} had ${diff} more ${survey.unit} than ${lo.label}.` },
    { id: "w1", label: `${lo.label} had more ${survey.unit} than ${hi.label}.` },
    { id: "w2", label: `${hi.label} had ${diff + 10} more ${survey.unit} than ${lo.label}.` },
  ], round);
  return {
    kind: "statisticaInference", target, display: "columns", categories,
    prompt: `${survey.q}. Which statement does the graph support?`,
    speakText: `Work out the difference between the columns, then pick the true statement.`,
    options, correctOptionIds: ["c"],
    feedback: { correct: `Right — ${hi.label} is ${diff} ahead of ${lo.label}.`, wrong: `Read both columns and work out the exact difference.` },
  };
}

// Construct a column graph on a SCALE — each +/- tap is worth 5, so bars reach
// two-digit frequencies against a by-fives axis (Year-4 "build with a scale",
// not the one-square-per-tap Year-3 build). Every aim is a multiple of 5.
const COL_BUILD_FREQ: number[][] = [
  [15, 25, 10, 30, 20],
  [20, 10, 30, 15, 25],
  [30, 20, 15, 25, 10],
  [10, 30, 25, 20, 15],
  [25, 15, 20, 10, 30],
  [15, 30, 10, 25, 20],
];
export function colBuildTask(round: number, target: number): PracticeTask {
  const survey = pick(COL_SURVEYS, round);
  const freq = pick(COL_BUILD_FREQ, round);
  const categories = survey.cats.map((c, i) => ({ ...c, count: freq[i]! }));
  return {
    kind: "statisticaGraph", mode: "build", target, display: "columns", categories, buildStep: 5,
    prompt: `${survey.q}. Build the column graph to match the frequencies.`,
    speakText: `Each tap is worth 5. Count on in fives to reach each aim.`,
    feedback: { correct: "Every column matches its frequency.", wrong: "Each tap adds 5 — count on in fives to each aim." },
  };
}

// ── Distribution shape & variation (numerical, values 0-4) ───────────────────
const NUM_CTX = [
  { q: "Goals scored each game", color: C.green },
  { q: "Books read each week", color: C.blue },
  { q: "Pets per family", color: C.orange },
  { q: "Times absent each term", color: C.purple },
  { q: "Apps opened each day", color: C.teal },
];
const VALS = ["0", "1", "2", "3", "4"];
function makeCats(freq: number[], color: string): PictoCat[] {
  return VALS.map((v, i) => ({ id: `v${v}`, label: v, color, count: freq[i]! }));
}
function argmax(freq: number[]) { return freq.reduce((best, v, i) => (v > freq[best] ? i : best), 0); }
function bucket(idx: number): "low" | "middle" | "high" { return idx <= 1 ? "low" : idx === 2 ? "middle" : "high"; }
function variance(freq: number[]) {
  const n = freq.reduce((a, b) => a + b, 0);
  const mean = freq.reduce((s, f, i) => s + f * i, 0) / n;
  return freq.reduce((s, f, i) => s + f * (i - mean) ** 2, 0) / n;
}

// Clearly-peaked shapes so "where is it concentrated" has one honest answer.
const CONC_SHAPES = [[2, 5, 10, 6, 2], [11, 7, 4, 2, 1], [1, 3, 4, 7, 12], [3, 8, 12, 7, 3], [12, 8, 5, 3, 1], [1, 2, 5, 8, 11]];
export function shapeConcentratedTask(round: number, target: number): PracticeTask {
  const ctx = pick(NUM_CTX, round);
  const freq = pick(CONC_SHAPES, round);
  const where = bucket(argmax(freq));
  return {
    kind: "statisticaShape", mode: "concentrated", target, display: "columns", categories: makeCats(freq, ctx.color),
    prompt: `${ctx.q}: where is most of the data concentrated?`,
    speakText: "Find the tallest group of columns — that is where the data clusters.",
    options: order([
      { id: "low", label: "Concentrated at the low values" },
      { id: "middle", label: "Concentrated around the middle" },
      { id: "high", label: "Concentrated at the high values" },
    ], round),
    correctOptionIds: [where],
    feedback: { correct: "Yes — that's where the tallest columns are.", wrong: "The data is concentrated where the columns are tallest." },
  };
}

// Shapes including an even/uniform one for describing overall spread.
const SHAPE_LIB: Array<{ freq: number[]; id: string; label: string }> = [
  { freq: [2, 5, 11, 6, 2], id: "middle", label: "clustered around the middle" },
  { freq: [12, 7, 4, 2, 1], id: "low", label: "mostly at the low values" },
  { freq: [1, 2, 4, 7, 12], id: "high", label: "mostly at the high values" },
  { freq: [6, 5, 6, 5, 6], id: "even", label: "spread out fairly evenly" },
];
export function shapeSpreadTask(round: number, target: number): PracticeTask {
  const ctx = pick(NUM_CTX, round + 1);
  const shape = pick(SHAPE_LIB, round);
  return {
    kind: "statisticaShape", mode: "spread", target, display: "columns", categories: makeCats(shape.freq, ctx.color),
    prompt: `${ctx.q}: which best describes the shape of the data?`,
    speakText: "Look at where the columns are tall and short, then pick the sentence that fits.",
    options: order(SHAPE_LIB.map((s) => ({ id: s.id, label: `The data is ${s.label}.` })), round),
    correctOptionIds: [shape.id],
    feedback: { correct: "Yes — that matches the shape of the columns.", wrong: "Look again at where the data bunches up or spreads out." },
  };
}

// Pairs where one data set is clearly more spread out (higher variance).
const VAR_PAIRS = [
  [[1, 2, 14, 2, 1], [6, 5, 4, 5, 6]],
  [[2, 3, 12, 2, 1], [8, 3, 2, 3, 8]],
  [[1, 4, 13, 3, 1], [5, 5, 4, 5, 5]],
  [[3, 4, 10, 4, 2], [9, 2, 1, 2, 9]],
  [[1, 2, 15, 2, 1], [4, 6, 5, 6, 4]],
];
export function shapeVariationTask(round: number, target: number): PracticeTask {
  const ctx = pick(NUM_CTX, round + 2);
  const pair = pick(VAR_PAIRS, round);
  const swap = round % 2 === 1;
  const fa = swap ? pair[1]! : pair[0]!;
  const fb = swap ? pair[0]! : pair[1]!;
  const answer = variance(fa) > variance(fb) ? "a" : "b";
  return {
    kind: "statisticaShape", mode: "variation", target, display: "columns",
    categories: makeCats(fa, ctx.color), categoriesB: makeCats(fb, C.pink),
    setLabelA: "Class A", setLabelB: "Class B",
    prompt: `${ctx.q}: which class has MORE variation (more spread out)?`,
    speakText: "More variation means the data is spread across the values, not bunched on one column.",
    options: order([{ id: "a", label: "Class A has more variation" }, { id: "b", label: "Class B has more variation" }], round),
    correctOptionIds: [answer],
    feedback: { correct: "Yes — that data is more spread out.", wrong: "The class whose data is less bunched on one column has more variation." },
  };
}

// Pairs with distinct peak positions for a comparative reading.
const COMPARE_PAIRS = [
  [[10, 6, 3, 2, 1], [1, 2, 3, 6, 10]],
  [[2, 10, 5, 2, 1], [1, 2, 5, 10, 2]],
  [[1, 3, 11, 3, 1], [9, 4, 2, 1, 1]],
  [[11, 4, 2, 2, 1], [1, 2, 4, 6, 11]],
  [[1, 2, 4, 11, 3], [3, 11, 4, 2, 1]],
];
export function shapeCompareTask(round: number, target: number): PracticeTask {
  const ctx = pick(NUM_CTX, round + 3);
  const pair = pick(COMPARE_PAIRS, round);
  const swap = round % 2 === 1;
  const fa = swap ? pair[1]! : pair[0]!;
  const fb = swap ? pair[0]! : pair[1]!;
  const pa = argmax(fa), pb = argmax(fb);
  const answer = pa > pb ? "a" : "b";
  return {
    kind: "statisticaShape", mode: "compare", target, display: "columns",
    categories: makeCats(fa, ctx.color), categoriesB: makeCats(fb, C.indigo),
    setLabelA: "Group A", setLabelB: "Group B",
    prompt: `${ctx.q}: which group's data peaks at a HIGHER value?`,
    speakText: "Find the tallest column in each group and compare which value it sits over.",
    options: order([{ id: "a", label: "Group A peaks at a higher value" }, { id: "b", label: "Group B peaks at a higher value" }], round),
    correctOptionIds: [answer],
    feedback: { correct: "Yes — its tallest column is over a higher value.", wrong: "Compare where each group's tallest column sits on the scale." },
  };
}

// ── Lesson map (18 lessons, 6 weeks) — leads with many-to-one + distribution ──
const LESSON_GENS: Record<string, [Gen, Gen, Gen]> = {
  // W1 Many-to-One Displays — the key, reading rows, calculating totals
  "y4-statistics-w1-l1": [pictoReadTask, pictoCalcTask, pictoCompareTask],
  "y4-statistics-w1-l2": [pictoCalcTask, pictoCompareTask, pictoReadTask],
  "y4-statistics-w1-l3": [pictoCompareTask, pictoCalcTask, pictoBuildTask],
  // W2 Build Many-to-One — interpret the key, build, read partial symbols
  "y4-statistics-w2-l1": [pictoBuildTask, pictoReadTask, pictoCalcTask],
  "y4-statistics-w2-l2": [pictoBuildTask, pictoCompareTask, pictoReadTask],
  "y4-statistics-w2-l3": [pictoReadTask, pictoBuildTask, pictoCalcTask],
  // W3 Column Graphs — read a by-10s scale, then calculate off it (Year-4 rigour:
  // totals, combined categories, scaled differences — not "which bar is tallest")
  "y4-statistics-w3-l1": [colReadTask, colCombineTask, colDiffTask],
  "y4-statistics-w3-l2": [colBuildTask, colReadTask, colTotalTask],
  "y4-statistics-w3-l3": [colInferenceTask, colReadTask, colDiffTask],
  // W4 Distribution Shape — where it concentrates, its shape, comparing shapes
  "y4-statistics-w4-l1": [shapeConcentratedTask, colReadTask, shapeSpreadTask],
  "y4-statistics-w4-l2": [shapeSpreadTask, shapeConcentratedTask, colInferenceTask],
  "y4-statistics-w4-l3": [shapeCompareTask, shapeConcentratedTask, colReadTask],
  // W5 Variation — spread, more vs less variation, comparing data sets
  "y4-statistics-w5-l1": [shapeVariationTask, shapeConcentratedTask, colReadTask],
  "y4-statistics-w5-l2": [shapeVariationTask, shapeCompareTask, colInferenceTask],
  "y4-statistics-w5-l3": [shapeCompareTask, shapeVariationTask, shapeSpreadTask],
  // W6 Investigation — collect, represent, analyse and report
  "y4-statistics-w6-l1": [pictoReadTask, colCombineTask, shapeConcentratedTask],
  "y4-statistics-w6-l2": [pictoBuildTask, colBuildTask, shapeVariationTask],
  "y4-statistics-w6-l3": [shapeCompareTask, colInferenceTask, pictoCompareTask],
};

function taskSet(gens: [Gen, Gen, Gen], seed: number): RealmLessonTaskSet {
  let t = 10;
  const rounds = [seed, seed + 1, seed + 2];
  return {
    teaching: () => gens[0](seed, ++t),
    activities: [
      () => gens[0](rounds[0]++, ++t),
      () => gens[1](rounds[1]++, ++t),
      () => gens[2](rounds[2]++, ++t),
    ],
  };
}

export function getStatisticaLevel4TaskSet(lessonId: string): RealmLessonTaskSet | null {
  const gens = LESSON_GENS[lessonId];
  if (!gens) return null;
  const m = /-w(\d+)-l(\d+)$/.exec(lessonId);
  const week = m ? Number(m[1]) : 1;
  const lesson = m ? Number(m[2]) : 1;
  const seed = (week - 1) * 2 + (lesson - 1);
  return taskSet(gens, seed);
}

export const STATISTICA_LEVEL4_LESSON_IDS = Object.keys(LESSON_GENS);
