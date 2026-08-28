import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import {
  shapeConcentratedTask,
  shapeSpreadTask,
  investigationTask,
} from "@/data/activities/statistica/level4";

// ── Statistica Level 5 (Year 5) — AC9M5ST01 (nominal/ordinal categorical +
// discrete numerical data; validate data; describe distributions by MODE and
// shape), AC9M5ST02 (LINE GRAPHS of change over time), AC9M5ST03 (plan and
// conduct an unbiased statistical investigation).
// Year 5's genuinely new content is the LINE GRAPH (change over time), the MODE
// (highest frequency), and the nominal-vs-ordinal categorical distinction —
// none of which exist in Levels 1-4. This level leads with those; it spirals
// distribution shape and the investigation cycle from Level 4.

type Gen = (round: number, target: number) => PracticeTask;

const C = { red: "#ef4444", amber: "#f59e0b", orange: "#fb923c", blue: "#3b82f6", green: "#22c55e", purple: "#a855f7", teal: "#14b8a6", pink: "#ec4899", indigo: "#6366f1" };
const pick = <T,>(arr: T[], i: number) => arr[((i % arr.length) + arr.length) % arr.length]!;
const order = <T,>(arr: T[], round: number) => (round % 2 ? [...arr].reverse() : arr);

// ── W1 Data types: nominal / ordinal / discrete numerical (AC9M5ST01) ────────
type DataTypeItem = { v: string; ex: string; type: "nominal" | "ordinal" | "numerical" };
const DATA_TYPES: DataTypeItem[] = [
  { v: "Favourite colour", ex: "Red, Blue, Green, Yellow", type: "nominal" },
  { v: "Type of pet", ex: "Dog, Cat, Fish, Bird", type: "nominal" },
  { v: "Way students travel to school", ex: "Walk, Car, Bus, Bike", type: "nominal" },
  { v: "Eye colour", ex: "Brown, Blue, Green, Hazel", type: "nominal" },
  { v: "Country of birth", ex: "Australia, India, Japan", type: "nominal" },
  { v: "Star rating", ex: "1★, 2★, 3★, 4★, 5★", type: "ordinal" },
  { v: "T-shirt size", ex: "Small, Medium, Large", type: "ordinal" },
  { v: "Race finish", ex: "1st, 2nd, 3rd, 4th", type: "ordinal" },
  { v: "Spice level", ex: "Mild, Medium, Hot", type: "ordinal" },
  { v: "Skill level", ex: "Beginner, Intermediate, Expert", type: "ordinal" },
  { v: "Number of siblings", ex: "0, 1, 2, 3", type: "numerical" },
  { v: "Goals scored each game", ex: "0, 1, 2, 3, 4", type: "numerical" },
  { v: "Books read this month", ex: "2, 5, 7, 10", type: "numerical" },
  { v: "Pets owned", ex: "0, 1, 2, 3", type: "numerical" },
];
export function dataTypeTask(round: number, target: number): PracticeTask {
  const item = pick(DATA_TYPES, round);
  const why = item.type === "nominal" ? "Named groups with no order — that's nominal."
    : item.type === "ordinal" ? "Named groups with a clear order — that's ordinal."
    : "Numbers we count — that's numerical.";
  return {
    kind: "statisticaClassify", target,
    prompt: "What type of data is this?",
    speakText: "Nominal is named groups with no order. Ordinal is groups with an order. Numerical is counts.",
    variable: item.v, examples: item.ex,
    options: order([
      { id: "nominal", label: "Nominal (named groups)" },
      { id: "ordinal", label: "Ordinal (ordered groups)" },
      { id: "numerical", label: "Numerical (counts)" },
    ], round),
    correctOptionIds: [item.type],
    feedback: { correct: `Yes — ${why}`, wrong: "Do the answers sort into named groups (and is there an order?), or are they counts?" },
  };
}

// Sort survey cards into their data-type bin — a hands-on way to contrast all
// three types at once (far livelier than picking a type from a list).
const TYPE_BINS = [
  { id: "nominal", label: "Nominal", color: C.indigo },
  { id: "ordinal", label: "Ordinal", color: C.amber },
  { id: "numerical", label: "Numerical", color: C.teal },
];
// Pool sizes are co-prime (7, 8, 7) so the six-card mix has a long period and
// rarely repeats across a session.
const SORT_ITEMS: Record<"nominal" | "ordinal" | "numerical", string[]> = {
  nominal: ["Favourite colour", "Pet type", "Eye colour", "Way to school", "Favourite fruit", "Football team", "Music genre"],
  ordinal: ["Star rating", "T-shirt size", "Race place", "Spice level", "Skill level", "Medal won", "Year level", "Satisfaction"],
  numerical: ["Number of siblings", "Goals scored", "Books read", "Pets owned", "Cousins", "Cars in car park", "Apps opened"],
};
export function dataTypeSortTask(round: number, target: number): PracticeTask {
  // Two of each type so the three bins stay balanced; the pair chosen per type
  // rotates so the mix rarely repeats.
  const chosen: Array<{ label: string; category: "nominal" | "ordinal" | "numerical" }> = [];
  (["nominal", "ordinal", "numerical"] as const).forEach((type, k) => {
    const pool = SORT_ITEMS[type];
    chosen.push({ label: pick(pool, round + k), category: type });
    chosen.push({ label: pick(pool, round + k + 3), category: type });
  });
  const items = order(chosen, round).map((it, i) => ({ id: `it${i}`, label: it.label, category: it.category }));
  return {
    kind: "statisticaSort", target,
    prompt: "Sort each survey into its data type.",
    speakText: "Nominal is named groups with no order. Ordinal is groups with an order. Numerical is counts. Tap a card, then tap its bin.",
    items,
    categories: TYPE_BINS,
    feedback: { correct: "Sorted! Named groups are nominal, ordered groups are ordinal, counts are numerical.", wrong: "Check the red cards: named group, ordered group, or a count?" },
  };
}

// ── W2 Valid data: spot the out-of-range value (AC9M5ST01) ───────────────────
type SpotItem = { vals: number[]; rule: string; bad: number };
const SPOT_ERRORS: SpotItem[] = [
  { rule: "Star ratings must be 1 to 5", vals: [4, 2, 5, 8, 3], bad: 8 },
  { rule: "Ages must be 5 to 12", vals: [9, 10, 11, 3, 15], bad: 15 },
  { rule: "Test scores are out of 20", vals: [18, 12, 25, 9, 15], bad: 25 },
  { rule: "Months are numbered 1 to 12", vals: [3, 7, 13, 10, 1], bad: 13 },
  { rule: "A dice roll is 1 to 6", vals: [4, 6, 2, 9, 5], bad: 9 },
  { rule: "Percentages are 0 to 100", vals: [80, 45, 110, 60, 95], bad: 110 },
  { rule: "Ratings must be 1 to 5", vals: [2, 5, 1, 7, 4], bad: 7 },
  { rule: "Ages must be 5 to 12", vals: [8, 11, 2, 9, 12], bad: 2 },
  { rule: "Scores are out of 10", vals: [7, 9, 4, 14, 6], bad: 14 },
  { rule: "Class sizes are 20 to 30", vals: [24, 28, 22, 45, 26], bad: 45 },
  { rule: "A week has 7 days", vals: [3, 5, 7, 9, 2], bad: 9 },
  { rule: "Shoe sizes are 1 to 13", vals: [5, 8, 3, 20, 11], bad: 20 },
  { rule: "Temperatures were 15 to 30", vals: [22, 18, 35, 25, 20], bad: 35 },
  { rule: "Goals per game are 0 to 8", vals: [3, 5, 1, 12, 4], bad: 12 },
];
export function spotErrorTask(round: number, target: number): PracticeTask {
  const item = pick(SPOT_ERRORS, round);
  return {
    kind: "statisticaClassify", target,
    prompt: "Which value is a data-entry error?",
    speakText: "One value breaks the rule. Read the rule, then find the value that could not be right.",
    variable: item.vals.join(",  "), examples: item.rule,
    options: order(item.vals.map((v) => ({ id: `v${v}`, label: String(v) })), round),
    correctOptionIds: [`v${item.bad}`],
    feedback: { correct: `Yes — ${item.bad} breaks the rule: ${item.rule.toLowerCase()}.`, wrong: `Check each value against the rule: ${item.rule.toLowerCase()}.` },
  };
}

// ── W3 Mode: the most frequent value (AC9M5ST01) ─────────────────────────────
const MODE_CTX = [
  { q: "Goals scored each game", color: C.green },
  { q: "Books read each week", color: C.blue },
  { q: "Pets per family", color: C.orange },
  { q: "Siblings per student", color: C.pink },
  { q: "Apps opened each day", color: C.teal },
  { q: "Trophies won each season", color: C.amber },
];
const MODE_VALS = ["0", "1", "2", "3", "4"];
// Single clear mode (one tallest column).
const MODE_SINGLE = [
  [2, 5, 10, 4, 2], [1, 3, 8, 5, 2], [3, 9, 4, 2, 1], [1, 2, 5, 11, 4],
  [2, 4, 6, 10, 3], [8, 5, 3, 2, 1], [1, 2, 4, 7, 11], [2, 6, 11, 5, 2],
];
// Two equal tallest columns (bimodal).
const MODE_BI = [
  [2, 8, 3, 8, 2], [1, 6, 2, 6, 3], [7, 3, 2, 3, 7], [2, 9, 4, 9, 1],
  [1, 5, 8, 5, 8], [6, 2, 6, 3, 1],
];
type ModeCat = { id: string; label: string; color: string; count: number };
function modeCats(freq: number[], color: string): ModeCat[] {
  return MODE_VALS.map((v, i) => ({ id: `v${i}`, label: v, color, count: freq[i]! }));
}
function argmax(freq: number[]) { return freq.reduce((best, v, i) => (v > freq[best]! ? i : best), 0); }
// Read the mode off a distribution — the value with the tallest column.
export function modeReadTask(round: number, target: number): PracticeTask {
  const ctx = pick(MODE_CTX, round);
  const freq = pick(MODE_SINGLE, round);
  const categories = modeCats(freq, ctx.color);
  const top = categories[argmax(freq)]!;
  return {
    kind: "statisticaGraph", mode: "read", target, display: "columns", categories,
    prompt: `${ctx.q}: what is the MODE (most common value)?`,
    speakText: "The mode is the value with the tallest column — it happened most often.",
    options: order(categories.map((c) => ({ id: c.id, label: c.label })), round),
    correctOptionIds: [top.id],
    feedback: { correct: `Yes — ${top.label} is the mode; it has the tallest column.`, wrong: "The mode is the value that happened most — the tallest column." },
  };
}
// Judge how many modes a distribution has (one vs two).
export function modeCountTask(round: number, target: number): PracticeTask {
  const ctx = pick(MODE_CTX, round + 1);
  const bimodal = round % 2 === 1;
  // Step the freq pool by half-round so consecutive same-parity rounds land on
  // consecutive (distinct) sets instead of repeating a stride.
  const freq = bimodal ? pick(MODE_BI, Math.floor(round / 2)) : pick(MODE_SINGLE, Math.floor(round / 2));
  const categories = modeCats(freq, ctx.color);
  return {
    kind: "statisticaInference", target, display: "columns", categories,
    prompt: `${ctx.q}: how many modes does this data have?`,
    speakText: "Count how many values share the tallest column. One tallest is one mode; two equal tallest is two modes.",
    options: order([
      { id: "one", label: "One mode" },
      { id: "two", label: "Two modes" },
      { id: "none", label: "No clear mode" },
    ], round),
    correctOptionIds: [bimodal ? "two" : "one"],
    feedback: { correct: bimodal ? "Yes — two values are equally the tallest, so there are two modes." : "Yes — one value stands tallest, so there is one mode.", wrong: "Look for how many columns share the greatest height." },
  };
}

// ── W4 Line graphs: change over time (AC9M5ST02) ─────────────────────────────
type LineCtx = { y: string; unit: string; x: string[]; color: string; series: number[][] };
const LINE_CTX: LineCtx[] = [
  { y: "Temperature", unit: "°C", x: ["6am", "9am", "12pm", "3pm", "6pm"], color: C.red,
    series: [[12, 18, 24, 22, 15], [10, 15, 21, 25, 18], [14, 19, 28, 23, 16]] },
  { y: "Visitors", unit: "people", x: ["9am", "10am", "11am", "12pm", "1pm"], color: C.indigo,
    series: [[10, 25, 40, 35, 20], [15, 30, 45, 50, 25], [20, 35, 30, 45, 15]] },
  { y: "Rainfall", unit: "mm", x: ["Mon", "Tue", "Wed", "Thu", "Fri"], color: C.teal,
    series: [[5, 12, 20, 8, 3], [8, 4, 15, 22, 10], [12, 18, 6, 2, 14]] },
  { y: "Plant height", unit: "cm", x: ["Wk1", "Wk2", "Wk3", "Wk4", "Wk5"], color: C.green,
    series: [[2, 5, 9, 14, 20], [3, 6, 10, 13, 18], [1, 4, 8, 15, 22]] },
  { y: "Website visits", unit: "hits", x: ["Jan", "Feb", "Mar", "Apr", "May"], color: C.pink,
    series: [[20, 35, 30, 45, 50], [40, 30, 25, 35, 20], [15, 25, 40, 30, 45]] },
  { y: "Temperature", unit: "°C", x: ["Mon", "Tue", "Wed", "Thu", "Fri"], color: C.amber,
    series: [[22, 25, 28, 24, 20], [18, 21, 16, 23, 26], [24, 22, 19, 25, 27]] },
];
// Flatten every context's series into one pool so consecutive rounds land on
// distinct (context, data) pairs — nesting made the series index repeat.
const LINE_SERIES = LINE_CTX.flatMap((ctx) => ctx.series.map((values) => ({ ctx, values })));
function lineData(round: number): { ctx: LineCtx; points: Array<{ label: string; value: number }> } {
  const { ctx, values } = pick(LINE_SERIES, round);
  return { ctx, points: ctx.x.map((label, i) => ({ label, value: values[i]! })) };
}
function lineNumOptions(correct: number, round: number, step: number): Array<{ id: string; label: string }> {
  const cands = [correct + step, correct - step, correct + 2 * step].filter((n) => n > 0 && n !== correct);
  const seen = new Set<number>();
  const wrongs = cands.filter((n) => (seen.has(n) ? false : (seen.add(n), true))).slice(0, 2);
  return order([correct, ...wrongs].map((n) => ({ id: `n${n}`, label: String(n) })), round);
}
function lineTask(mode: "read" | "trend" | "infer", ctx: LineCtx, points: Array<{ label: string; value: number }>, extra: Partial<PracticeTask> & { prompt: string; speakText: string; options: Array<{ id: string; label: string }>; correctOptionIds: string[]; feedback: { correct: string; wrong: string } }): PracticeTask {
  return {
    kind: "statisticaLineGraph", mode, target: 0, unit: ctx.unit, yLabel: ctx.y, color: ctx.color, points,
    ...extra,
  } as PracticeTask;
}
// Read one value off the line at a point in time.
export function lineReadTask(round: number, target: number): PracticeTask {
  const { ctx, points } = lineData(round);
  const i = round % points.length;
  const p = points[i]!;
  const step = ctx.unit === "°C" ? 2 : 5;
  return lineTask("read", ctx, points, {
    target,
    prompt: `${ctx.y}: what was the ${ctx.y.toLowerCase()} at ${p.label}?`,
    speakText: `Find ${p.label} on the bottom, go up to the line, then across to the scale.`,
    options: lineNumOptions(p.value, round, step),
    correctOptionIds: [`n${p.value}`],
    feedback: { correct: `Yes — at ${p.label} it was ${p.value} ${ctx.unit}.`, wrong: `Go up from ${p.label} to the line, then read across to the scale.` },
  });
}
// Describe the trend between two points — rose, fell or stayed the same.
export function lineTrendTask(round: number, target: number): PracticeTask {
  const { ctx, points } = lineData(round);
  const i = round % (points.length - 1);
  const a = points[i]!, b = points[i + 1]!;
  const dir = b.value > a.value ? "up" : b.value < a.value ? "down" : "same";
  return lineTask("trend", ctx, points, {
    target,
    prompt: `${ctx.y}: what happened between ${a.label} and ${b.label}?`,
    speakText: "Compare the two points. If the line goes up it rose, down it fell, flat it stayed the same.",
    options: order([
      { id: "up", label: "It went up" },
      { id: "down", label: "It went down" },
      { id: "same", label: "It stayed the same" },
    ], round),
    correctOptionIds: [dir],
    feedback: { correct: dir === "up" ? `Yes — it rose from ${a.value} to ${b.value}.` : dir === "down" ? `Yes — it fell from ${a.value} to ${b.value}.` : "Yes — it stayed the same.", wrong: `Compare ${a.label} (${a.value}) with ${b.label} (${b.value}).` },
  });
}
// Infer when the value peaked or bottomed out.
export function lineInferTask(round: number, target: number): PracticeTask {
  const { ctx, points } = lineData(round);
  const askHigh = round % 2 === 0;
  const idx = points.reduce((best, p, i) => (askHigh ? (p.value > points[best]!.value ? i : best) : (p.value < points[best]!.value ? i : best)), 0);
  const ans = points[idx]!;
  return lineTask("infer", ctx, points, {
    target,
    prompt: `${ctx.y}: when was the ${ctx.y.toLowerCase()} ${askHigh ? "HIGHEST" : "LOWEST"}?`,
    speakText: askHigh ? "Find the highest point on the line, then read the time below it." : "Find the lowest point on the line, then read the time below it.",
    options: order(points.map((p) => ({ id: p.label, label: p.label })), round),
    correctOptionIds: [ans.label],
    feedback: { correct: `Yes — the ${askHigh ? "highest" : "lowest"} point (${ans.value} ${ctx.unit}) was at ${ans.label}.`, wrong: `Look for the ${askHigh ? "highest" : "lowest"} point on the line.` },
  });
}

// ── W5 Choosing displays: which display suits the data (AC9M5ST01) ───────────
type DisplayItem = { v: string; ex: string; best: "line" | "column" };
const DISPLAYS: DisplayItem[] = [
  { v: "Temperature every hour today", ex: "6am, 9am, 12pm, 3pm, 6pm", best: "line" },
  { v: "How a plant grew each week", ex: "Week 1 to Week 8", best: "line" },
  { v: "Website visits each month", ex: "Jan, Feb, Mar, Apr", best: "line" },
  { v: "A swimmer's time each race", ex: "Race 1 to Race 6", best: "line" },
  { v: "Rainfall each day this week", ex: "Mon to Sun", best: "line" },
  { v: "Your height on each birthday", ex: "age 5, 6, 7, 8", best: "line" },
  { v: "Favourite sport of the class", ex: "Soccer, Netball, Cricket", best: "column" },
  { v: "Number of each type of pet", ex: "Dog, Cat, Fish, Bird", best: "column" },
  { v: "Votes for class captain", ex: "Ana, Ben, Chloe", best: "column" },
  { v: "Favourite ice-cream flavour", ex: "Vanilla, Choc, Mango", best: "column" },
  { v: "How students travel to school", ex: "Walk, Car, Bus, Bike", best: "column" },
  { v: "Books borrowed by genre", ex: "Fantasy, Sport, History", best: "column" },
];
export function displayChoiceTask(round: number, target: number): PracticeTask {
  const item = pick(DISPLAYS, round);
  const why = item.best === "line" ? "It changes over time, so a line graph shows the trend best." : "It compares separate groups, so a column graph compares them best.";
  return {
    kind: "statisticaClassify", target,
    prompt: "Which display best shows this data?",
    speakText: "Data that changes over time suits a line graph. Data that compares groups suits a column graph.",
    variable: item.v, examples: item.ex,
    options: order([
      { id: "line", label: "Line graph" },
      { id: "column", label: "Column graph" },
      { id: "picto", label: "Pictograph" },
    ], round),
    correctOptionIds: [item.best],
    feedback: { correct: `Yes — ${why}`, wrong: "Does the data change over time (line graph) or compare groups (column graph)?" },
  };
}

// ── Lesson map (18 lessons, 6 weeks) ─────────────────────────────────────────
const LESSON_GENS: Record<string, [Gen, Gen, Gen]> = {
  // W1 Data Types — sort survey cards into type bins, then quick-check by naming
  "y5-statistics-w1-l1": [dataTypeSortTask, dataTypeTask, dataTypeSortTask],
  "y5-statistics-w1-l2": [dataTypeSortTask, dataTypeSortTask, dataTypeTask],
  "y5-statistics-w1-l3": [dataTypeSortTask, dataTypeTask, dataTypeSortTask],
  // W2 Valid Data — spot, validate, clean out-of-range values
  "y5-statistics-w2-l1": [spotErrorTask, spotErrorTask, spotErrorTask],
  "y5-statistics-w2-l2": [spotErrorTask, spotErrorTask, spotErrorTask],
  "y5-statistics-w2-l3": [spotErrorTask, spotErrorTask, spotErrorTask],
  // W3 Mode & Shape — find the mode, more than one mode, describe the shape
  "y5-statistics-w3-l1": [modeReadTask, shapeConcentratedTask, modeReadTask],
  "y5-statistics-w3-l2": [modeCountTask, modeReadTask, shapeSpreadTask],
  "y5-statistics-w3-l3": [shapeConcentratedTask, shapeSpreadTask, modeReadTask],
  // W4 Line Graphs — read, change over time, make inferences (Year-5 star)
  "y5-statistics-w4-l1": [lineReadTask, lineReadTask, lineTrendTask],
  "y5-statistics-w4-l2": [lineTrendTask, lineReadTask, lineTrendTask],
  "y5-statistics-w4-l3": [lineInferTask, lineTrendTask, lineReadTask],
  // W5 Choosing Displays — match, compare, justify the display choice
  "y5-statistics-w5-l1": [displayChoiceTask, displayChoiceTask, displayChoiceTask],
  "y5-statistics-w5-l2": [displayChoiceTask, displayChoiceTask, displayChoiceTask],
  "y5-statistics-w5-l3": [displayChoiceTask, displayChoiceTask, displayChoiceTask],
  // W6 Investigation — L1 & L2 run the full investigation; L3 is quick review
  "y5-statistics-w6-l1": [investigationTask, investigationTask, investigationTask],
  "y5-statistics-w6-l2": [investigationTask, investigationTask, investigationTask],
  "y5-statistics-w6-l3": [lineReadTask, modeReadTask, displayChoiceTask],
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

export function getStatisticaLevel5TaskSet(lessonId: string): RealmLessonTaskSet | null {
  const gens = LESSON_GENS[lessonId];
  if (!gens) return null;
  const m = /-w(\d+)-l(\d+)$/.exec(lessonId);
  const week = m ? Number(m[1]) : 1;
  const lesson = m ? Number(m[2]) : 1;
  const seed = (week - 1) * 2 + (lesson - 1);
  return taskSet(gens, seed);
}

export const STATISTICA_LEVEL5_LESSON_IDS = Object.keys(LESSON_GENS);
