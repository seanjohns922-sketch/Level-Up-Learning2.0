import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import {
  shapeConcentratedTask,
  shapeSpreadTask,
  shapeCompareTask,
  shapeVariationTask,
  investigationTask,
} from "@/data/activities/statistica/level4";
import { modeReadTask } from "@/data/activities/statistica/level5";

// ── Statistica Level 6 (Year 6) — AC9M6ST01 (compare data sets by mode, RANGE
// and shape using side-by-side displays; nominal/ordinal + discrete/continuous
// data), AC9M6ST02 (CRITIQUE statistics in the media — misleading graphs and
// unfair claims), AC9M6ST03 (pose, refine and conduct an investigation).
// Year 6's genuinely new content is the RANGE (highest - lowest), SIDE-BY-SIDE
// comparison of two data sets, the discrete-vs-continuous distinction, and
// CRITIQUING misleading representations — none of which exist in Levels 1-5.

type Gen = (round: number, target: number) => PracticeTask;

const C = { red: "#ef4444", amber: "#f59e0b", orange: "#fb923c", blue: "#3b82f6", green: "#22c55e", purple: "#a855f7", teal: "#14b8a6", pink: "#ec4899", indigo: "#6366f1" };
const pick = <T,>(arr: T[], i: number) => arr[((i % arr.length) + arr.length) % arr.length]!;
const order = <T,>(arr: T[], round: number) => (round % 2 ? [...arr].reverse() : arr);
const range = (v: number[]) => Math.max(...v) - Math.min(...v);

// ── W1 Data types: nominal vs ordinal, discrete vs continuous (AC9M6ST01) ────
type CatItem = { v: string; ex: string; type: "nominal" | "ordinal" };
const NOMINAL_ORDINAL: CatItem[] = [
  { v: "Favourite colour", ex: "Red, Blue, Green", type: "nominal" },
  { v: "Type of pet", ex: "Dog, Cat, Fish", type: "nominal" },
  { v: "Eye colour", ex: "Brown, Blue, Green", type: "nominal" },
  { v: "Country of birth", ex: "Australia, India, Japan", type: "nominal" },
  { v: "Way to school", ex: "Walk, Car, Bus", type: "nominal" },
  { v: "Favourite fruit", ex: "Apple, Banana, Mango", type: "nominal" },
  { v: "Football team", ex: "Tigers, Swans, Blues", type: "nominal" },
  { v: "Star rating", ex: "1★, 2★, 3★, 4★, 5★", type: "ordinal" },
  { v: "T-shirt size", ex: "Small, Medium, Large", type: "ordinal" },
  { v: "Race finish", ex: "1st, 2nd, 3rd", type: "ordinal" },
  { v: "Spice level", ex: "Mild, Medium, Hot", type: "ordinal" },
  { v: "Skill level", ex: "Beginner, Intermediate, Expert", type: "ordinal" },
  { v: "Medal won", ex: "Bronze, Silver, Gold", type: "ordinal" },
  { v: "Satisfaction", ex: "Poor, OK, Great", type: "ordinal" },
];
export function nominalOrdinalTask(round: number, target: number): PracticeTask {
  const item = pick(NOMINAL_ORDINAL, round);
  return {
    kind: "statisticaClassify", target,
    prompt: "Is this categorical data nominal or ordinal?",
    speakText: "Nominal groups have no order. Ordinal groups have a clear order, like small to large.",
    variable: item.v, examples: item.ex,
    options: order([
      { id: "nominal", label: "Nominal (no order)" },
      { id: "ordinal", label: "Ordinal (ordered)" },
    ], round),
    correctOptionIds: [item.type],
    feedback: { correct: item.type === "ordinal" ? "Yes — these groups have a natural order, so it's ordinal." : "Yes — these groups have no order, so it's nominal.", wrong: "Is there a natural order to the groups (ordinal) or not (nominal)?" },
  };
}
type NumItem = { v: string; ex: string; type: "discrete" | "continuous" };
const DISCRETE_CONTINUOUS: NumItem[] = [
  { v: "Number of siblings", ex: "0, 1, 2, 3", type: "discrete" },
  { v: "Goals scored", ex: "0, 1, 2, 3", type: "discrete" },
  { v: "Books read", ex: "2, 5, 7, 10", type: "discrete" },
  { v: "Cars in the car park", ex: "12, 18, 25", type: "discrete" },
  { v: "Students in a class", ex: "24, 28, 30", type: "discrete" },
  { v: "Pets owned", ex: "0, 1, 2", type: "discrete" },
  { v: "Coins in a jar", ex: "40, 55, 63", type: "discrete" },
  { v: "Height", ex: "142.5 cm, 138 cm", type: "continuous" },
  { v: "Weight", ex: "35.2 kg, 41.8 kg", type: "continuous" },
  { v: "Temperature", ex: "18.4°C, 21.9°C", type: "continuous" },
  { v: "Time to run 100 m", ex: "14.3 s, 15.1 s", type: "continuous" },
  { v: "Length of a leaf", ex: "6.2 cm, 8.7 cm", type: "continuous" },
  { v: "Water in a bottle", ex: "0.75 L, 1.2 L", type: "continuous" },
  { v: "Distance to school", ex: "1.4 km, 2.8 km", type: "continuous" },
];
export function discreteContinuousTask(round: number, target: number): PracticeTask {
  const item = pick(DISCRETE_CONTINUOUS, round);
  return {
    kind: "statisticaClassify", target,
    prompt: "Is this numerical data discrete or continuous?",
    speakText: "Discrete data is counted in whole steps. Continuous data is measured and can fall between values.",
    variable: item.v, examples: item.ex,
    options: order([
      { id: "discrete", label: "Discrete (counted)" },
      { id: "continuous", label: "Continuous (measured)" },
    ], round),
    correctOptionIds: [item.type],
    feedback: { correct: item.type === "discrete" ? "Yes — counted in whole numbers, so it's discrete." : "Yes — measured and can fall between values, so it's continuous.", wrong: "Is it counted in whole steps (discrete) or measured (continuous)?" },
  };
}

// ── W2/W3 Range: highest minus lowest value in a set (AC9M6ST01) ─────────────
const RANGE_CTX = [
  { q: "Goals scored each game", labels: ["G1", "G2", "G3", "G4", "G5"] },
  { q: "Books read each week", labels: ["Wk1", "Wk2", "Wk3", "Wk4", "Wk5"] },
  { q: "Laps run each day", labels: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  { q: "Points scored each round", labels: ["R1", "R2", "R3", "R4", "R5"] },
  { q: "Cans collected each day", labels: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  { q: "Minutes read each night", labels: ["Sun", "Mon", "Tue", "Wed", "Thu"] },
];
const RANGE_SETS = [
  [8, 3, 12, 6, 9], [15, 7, 20, 11, 4], [10, 22, 6, 14, 18], [5, 9, 3, 12, 7],
  [18, 11, 25, 14, 8], [6, 13, 9, 4, 11], [20, 12, 26, 16, 9], [7, 15, 4, 11, 9],
];
type RangeCat = { id: string; label: string; color: string; count: number };
function rangeCats(labels: string[], vals: number[], color: string): RangeCat[] {
  return labels.map((label, i) => ({ id: `c${i}`, label, color, count: vals[i]! }));
}
function rangeNumOptions(correct: number, hi: number, round: number): Array<{ id: string; label: string }> {
  // hi (the highest value) is the classic "read the top, not the spread" trap.
  const cands = [hi, correct + 3, correct - 3, correct + 6].filter((n) => n > 0 && n !== correct);
  const seen = new Set<number>();
  const wrongs = cands.filter((n) => (seen.has(n) ? false : (seen.add(n), true))).slice(0, 2);
  return order([correct, ...wrongs].map((n) => ({ id: `n${n}`, label: String(n) })), round);
}
export function rangeTask(round: number, target: number): PracticeTask {
  const ctx = pick(RANGE_CTX, round);
  const vals = pick(RANGE_SETS, round * 3 + 1);
  const categories = rangeCats(ctx.labels, vals, C.indigo);
  const hi = Math.max(...vals), lo = Math.min(...vals), r = hi - lo;
  return {
    kind: "statisticaInference", target, display: "columns", categories,
    prompt: `${ctx.q}: what is the RANGE (highest − lowest)?`,
    speakText: "The range is the highest value take away the lowest value.",
    options: rangeNumOptions(r, hi, round),
    correctOptionIds: [`n${r}`],
    feedback: { correct: `Yes — ${hi} − ${lo} = ${r}.`, wrong: `Find the highest (${hi}) and lowest (${lo}) columns, then subtract.` },
  };
}
// Compare the range of two side-by-side data sets.
export function rangeCompareTask(round: number, target: number): PracticeTask {
  const ctx = pick(RANGE_CTX, round + 1);
  const a = pick(RANGE_SETS, round);
  let b = pick(RANGE_SETS, round * 3 + 2);
  let guard = 0;
  while (range(b) === range(a) && guard < RANGE_SETS.length) { b = pick(RANGE_SETS, round * 3 + 2 + ++guard); }
  const answer = range(a) > range(b) ? "a" : "b";
  return {
    kind: "statisticaShape", mode: "compare", target, display: "columns",
    categories: rangeCats(ctx.labels, a, C.teal), categoriesB: rangeCats(ctx.labels, b, C.pink),
    setLabelA: "Group A", setLabelB: "Group B",
    prompt: `${ctx.q}: which group has the BIGGER range (most spread out)?`,
    speakText: "Work out the range of each group — highest minus lowest — and compare them.",
    options: order([{ id: "a", label: "Group A has the bigger range" }, { id: "b", label: "Group B has the bigger range" }], round),
    correctOptionIds: [answer],
    feedback: { correct: `Yes — its highest and lowest values are furthest apart (range ${range(answer === "a" ? a : b)}).`, wrong: "Find the highest and lowest bar in each group; the bigger gap is the bigger range." },
  };
}

// ── W4 Statistics in the media: is the claim fair? (AC9M6ST02) ───────────────
type ClaimItem = { claim: string; evidence: string; verdict: "fair" | "misleading" | "insufficient" };
const CLAIMS: ClaimItem[] = [
  { claim: "9 out of 10 dentists recommend it!", evidence: "Only 10 dentists were asked.", verdict: "misleading" },
  { claim: "Most students love maths.", evidence: "Only the maths club was surveyed.", verdict: "misleading" },
  { claim: "Sales doubled this year!", evidence: "The graph's scale starts at 90, not 0.", verdict: "misleading" },
  { claim: "60% of students chose pizza.", evidence: "200 students were surveyed; 120 chose pizza.", verdict: "fair" },
  { claim: "Our team is the most popular.", evidence: "No survey data is given at all.", verdict: "insufficient" },
  { claim: "Crime is falling fast.", evidence: "Only 2 months of data are shown.", verdict: "insufficient" },
  { claim: "Everyone prefers our brand.", evidence: "The survey was run by the brand's own staff.", verdict: "misleading" },
  { claim: "Half the class walks to school.", evidence: "15 of 30 students walk to school.", verdict: "fair" },
  { claim: "This town is the sunniest.", evidence: "Only one sunny week was measured.", verdict: "insufficient" },
  { claim: "Most people agree with the plan.", evidence: "Only people who already support it were asked.", verdict: "misleading" },
  { claim: "The new bus is always on time.", evidence: "Records for every day this month show 96% on time.", verdict: "fair" },
  { claim: "Reading scores jumped up.", evidence: "The result is not compared to any other year.", verdict: "insufficient" },
];
export function mediaClaimTask(round: number, target: number): PracticeTask {
  const item = pick(CLAIMS, round);
  const why = item.verdict === "fair" ? "The evidence supports it." : item.verdict === "misleading" ? "The evidence does not really support it." : "There isn't enough data to decide.";
  return {
    kind: "statisticaClassify", target,
    prompt: "Does the evidence support the claim?",
    speakText: "Read the claim and the evidence. Decide whether the data really backs up the claim.",
    variable: `“${item.claim}”`, examples: item.evidence,
    options: order([
      { id: "fair", label: "Yes — the claim is fair" },
      { id: "misleading", label: "No — it's misleading" },
      { id: "insufficient", label: "Not enough data to tell" },
    ], round),
    correctOptionIds: [item.verdict],
    feedback: { correct: `Right — ${why}`, wrong: "Weigh the evidence: does it truly support the claim, oppose it, or is there too little to tell?" },
  };
}

// ── W5 Misleading statistics: name the flaw in the representation (ST02) ──────
type FlawItem = { desc: string; detail: string; flaw: "axis" | "scale" | "cherry" | "total" };
const FLAW_LABEL: Record<FlawItem["flaw"], string> = {
  axis: "Truncated axis (doesn't start at 0)",
  scale: "Pictures not drawn to scale",
  cherry: "Cherry-picked data (some left out)",
  total: "Parts don't add to the whole",
};
const FLAWS: FlawItem[] = [
  { desc: "A column graph's y-axis starts at 80, not 0", detail: "so a tiny difference looks huge", flaw: "axis" },
  { desc: "The 'more sales' picture is drawn twice as wide AND twice as tall", detail: "for only double the value", flaw: "scale" },
  { desc: "A line graph only shows Mon–Wed", detail: "hiding the big drop on Thursday", flaw: "cherry" },
  { desc: "A pie chart's slices add up to 130%", detail: "more than a whole", flaw: "total" },
  { desc: "A bar chart's scale jumps 0, 10, 50, 100", detail: "with uneven gaps", flaw: "axis" },
  { desc: "Only the 3 best months are shown", detail: "the poor months are removed", flaw: "cherry" },
  { desc: "The 'winner' symbol is a giant trophy", detail: "much bigger than its true value", flaw: "scale" },
  { desc: "A survey graph's slices total only 85%", detail: "some people are missing", flaw: "total" },
  { desc: "The temperature graph starts at 20°C, not 0", detail: "exaggerating the rise", flaw: "axis" },
  { desc: "A pictograph doubles the icon size for double value", detail: "so it looks four times bigger", flaw: "scale" },
  { desc: "Only weekends are graphed", detail: "the quiet weekdays are dropped", flaw: "cherry" },
  { desc: "A budget pie chart's parts sum to 110%", detail: "over a full whole", flaw: "total" },
];
export function misleadingTask(round: number, target: number): PracticeTask {
  const item = pick(FLAWS, round);
  const all: FlawItem["flaw"][] = ["axis", "scale", "cherry", "total"];
  const distractors = all.filter((f) => f !== item.flaw);
  const wrong2 = [pick(distractors, round), pick(distractors, round + 1)];
  const uniqueWrong = wrong2[0] === wrong2[1] ? [distractors[0]!, distractors[1]!] : wrong2;
  const opts = order([item.flaw, ...uniqueWrong].map((f) => ({ id: f, label: FLAW_LABEL[f] })), round);
  return {
    kind: "statisticaClassify", target,
    prompt: "What makes this representation misleading?",
    speakText: "Read what the graph does, then choose the trick that misleads the reader.",
    variable: item.desc, examples: item.detail,
    options: opts,
    correctOptionIds: [item.flaw],
    feedback: { correct: `Yes — ${FLAW_LABEL[item.flaw].toLowerCase()}.`, wrong: "Look at what the graph changes: the axis, the picture sizes, the data shown, or the totals." },
  };
}

// ── Lesson map (18 lessons, 6 weeks) ─────────────────────────────────────────
const LESSON_GENS: Record<string, [Gen, Gen, Gen]> = {
  // W1 Types of Data — nominal vs ordinal, discrete vs continuous
  "y6-statistics-w1-l1": [nominalOrdinalTask, nominalOrdinalTask, nominalOrdinalTask],
  "y6-statistics-w1-l2": [discreteContinuousTask, discreteContinuousTask, discreteContinuousTask],
  "y6-statistics-w1-l3": [nominalOrdinalTask, discreteContinuousTask, nominalOrdinalTask],
  // W2 Mode, Range & Shape
  "y6-statistics-w2-l1": [modeReadTask, rangeTask, modeReadTask],
  "y6-statistics-w2-l2": [rangeTask, modeReadTask, shapeConcentratedTask],
  "y6-statistics-w2-l3": [shapeConcentratedTask, shapeSpreadTask, rangeTask],
  // W3 Comparative Displays — side-by-side, compare groups, conclude
  "y6-statistics-w3-l1": [rangeCompareTask, shapeCompareTask, rangeTask],
  "y6-statistics-w3-l2": [shapeCompareTask, rangeCompareTask, shapeVariationTask],
  "y6-statistics-w3-l3": [rangeCompareTask, rangeTask, shapeCompareTask],
  // W4 Statistics in the Media — read the claim, check evidence, decide
  "y6-statistics-w4-l1": [mediaClaimTask, mediaClaimTask, mediaClaimTask],
  "y6-statistics-w4-l2": [mediaClaimTask, mediaClaimTask, mediaClaimTask],
  "y6-statistics-w4-l3": [mediaClaimTask, mediaClaimTask, mediaClaimTask],
  // W5 Misleading Statistics — broken axes, misleading graphics, critique
  "y6-statistics-w5-l1": [misleadingTask, misleadingTask, misleadingTask],
  "y6-statistics-w5-l2": [misleadingTask, misleadingTask, misleadingTask],
  "y6-statistics-w5-l3": [misleadingTask, misleadingTask, misleadingTask],
  // W6 Investigation — L1 & L2 run the full investigation; L3 is quick review
  "y6-statistics-w6-l1": [investigationTask, investigationTask, investigationTask],
  "y6-statistics-w6-l2": [investigationTask, investigationTask, investigationTask],
  "y6-statistics-w6-l3": [rangeTask, modeReadTask, misleadingTask],
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

export function getStatisticaLevel6TaskSet(lessonId: string): RealmLessonTaskSet | null {
  const gens = LESSON_GENS[lessonId];
  if (!gens) return null;
  const m = /-w(\d+)-l(\d+)$/.exec(lessonId);
  const week = m ? Number(m[1]) : 1;
  const lesson = m ? Number(m[2]) : 1;
  const seed = (week - 1) * 2 + (lesson - 1);
  return taskSet(gens, seed);
}

export const STATISTICA_LEVEL6_LESSON_IDS = Object.keys(LESSON_GENS);
