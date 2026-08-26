import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import {
  numColumnReadTask,
  numColumnBuildTask,
  catColumnReadTask,
  numTableTask,
  inferenceTask,
} from "@/data/activities/statistica/level3";

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
  // W3 Column Graphs — read, construct, interpret (bridge picto <-> columns)
  "y4-statistics-w3-l1": [numColumnReadTask, catColumnReadTask, inferenceTask],
  "y4-statistics-w3-l2": [numColumnBuildTask, numColumnReadTask, catColumnReadTask],
  "y4-statistics-w3-l3": [catColumnReadTask, inferenceTask, numColumnReadTask],
  // W4 Distribution Shape — where it concentrates, its shape, comparing shapes
  "y4-statistics-w4-l1": [shapeConcentratedTask, numColumnReadTask, shapeSpreadTask],
  "y4-statistics-w4-l2": [shapeSpreadTask, shapeConcentratedTask, inferenceTask],
  "y4-statistics-w4-l3": [shapeCompareTask, shapeConcentratedTask, numColumnReadTask],
  // W5 Variation — spread, more vs less variation, comparing data sets
  "y4-statistics-w5-l1": [shapeVariationTask, shapeConcentratedTask, numColumnReadTask],
  "y4-statistics-w5-l2": [shapeVariationTask, shapeCompareTask, inferenceTask],
  "y4-statistics-w5-l3": [shapeCompareTask, shapeVariationTask, shapeSpreadTask],
  // W6 Investigation — collect, represent, analyse and report
  "y4-statistics-w6-l1": [pictoReadTask, numTableTask, shapeConcentratedTask],
  "y4-statistics-w6-l2": [pictoBuildTask, numColumnBuildTask, shapeVariationTask],
  "y4-statistics-w6-l3": [shapeCompareTask, inferenceTask, pictoCompareTask],
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
