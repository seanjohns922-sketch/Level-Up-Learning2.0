import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { convert, fmt, type Measure } from "@/data/activities/year6Measurelands/metricLadders";

// ── Measurelands · Level 6 · Week 4 — "Metric Conversions" (AC9M6M01) ─────────
// Convert between metric units of length, mass and capacity using powers of 10,
// with decimal representations. Metric Ladder mechanic. No algebra.

type ConvertTask = Extract<PracticeTask, { kind: "metricConvert" }>;

export function randInt(n: number): number { return Math.floor(Math.random() * n); }
export function choose<T>(items: T[]): T { return items[randInt(items.length)]!; }
export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) { const j = randInt(i + 1); [next[i], next[j]] = [next[j]!, next[i]!]; }
  return next;
}
const r5 = (n: number) => Math.round(n * 100000) / 100000;

// [larger unit, smaller unit, factor] pairs kept to ≤ ×1000 for clean answers.
type Pair = [string, string, number];
const PAIRS: Record<Measure, Pair[]> = {
  length: [["km", "m", 1000], ["m", "cm", 100], ["cm", "mm", 10], ["m", "mm", 1000]],
  mass: [["t", "kg", 1000], ["kg", "g", 1000]],
  capacity: [["L", "mL", 1000]],
};

// Decimals that stay whole when multiplied DOWN by the factor.
const DEC: Record<number, number[]> = {
  10: [1, 2, 3, 5, 7, 1.5, 2.5, 0.5, 7.5, 4.5],
  100: [1, 2, 3, 5, 1.5, 2.5, 0.5, 0.25, 0.75, 1.25, 3.25],
  1000: [1, 2, 3, 5, 1.5, 2.5, 0.5, 0.25, 0.75, 1.25, 1.075, 2.005, 0.125],
};
// Integers that give nice decimals when divided UP by the factor.
const INT: Record<number, number[]> = {
  10: [15, 25, 35, 5, 45, 120, 8],
  100: [150, 250, 325, 25, 175, 300, 90],
  1000: [1500, 2500, 250, 1075, 3000, 750, 2005, 125, 400],
};

type Conv = { from: string; to: string; fromValue: number; answer: number; factor: number; dir: "down" | "up" };
function pickConv(measure: Measure): Conv {
  const [big, small, f] = choose(PAIRS[measure]);
  if (randInt(2) === 0) {
    const v = choose(DEC[f]!);
    return { from: big, to: small, fromValue: v, answer: r5(v * f), factor: f, dir: "down" };
  }
  const v = choose(INT[f]!);
  return { from: small, to: big, fromValue: v, answer: r5(v / f), factor: f, dir: "up" };
}

export const L3_CONTEXTS: Record<Measure, { label: string; emoji: string }[]> = {
  length: [{ label: "hiking trail", emoji: "🥾" }, { label: "race track", emoji: "🏁" }, { label: "garden hose", emoji: "🚿" }],
  mass: [{ label: "flour bag", emoji: "🌾" }, { label: "backpack", emoji: "🎒" }, { label: "watermelon", emoji: "🍉" }],
  capacity: [{ label: "water bottle", emoji: "💧" }, { label: "fish tank", emoji: "🐠" }, { label: "juice carton", emoji: "🧃" }],
};

// ── Intro ─────────────────────────────────────────────────────────────────────
export function introTask(): ConvertTask {
  return {
    kind: "metricConvert", scene: "intro", measure: "length",
    prompt: "The metric system is built on powers of 10.",
    speakText: "Professor Gauge says: the metric system is built on powers of ten. Step down to a smaller unit and you multiply. Step up to a larger unit and you divide. Each step is ten, a hundred, or a thousand.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's convert!", wrong: "Let's convert!" },
  };
}

// ── Scene builders ────────────────────────────────────────────────────────────
export function climbTask(measure: Measure): ConvertTask {
  const c = pickConv(measure);
  return {
    kind: "metricConvert", scene: "climb", measure,
    fromUnit: c.from, toUnit: c.to, fromValue: c.fromValue, answerValue: c.answer,
    prompt: `Climb the ladder: ${fmt(c.fromValue)} ${c.from} = ? ${c.to}`,
    speakText: `Convert ${fmt(c.fromValue)} ${c.from} to ${c.to}. Use the up and down buttons to move to the goal unit.`,
    badgeLabel: "Climb the Ladder",
    feedback: { correct: `Yes — ${fmt(c.fromValue)} ${c.from} = ${fmt(c.answer)} ${c.to}.`, wrong: "Step to the goal unit." },
  };
}

export function convertTask(measure: Measure, context?: { label: string; emoji: string }): ConvertTask {
  const c = pickConv(measure);
  return {
    kind: "metricConvert", scene: "convert", measure,
    fromUnit: c.from, toUnit: c.to, fromValue: c.fromValue, answerValue: c.answer,
    context: context?.label, emoji: context?.emoji,
    prompt: `Convert ${fmt(c.fromValue)} ${c.from} to ${c.to}.`,
    speakText: `Convert ${fmt(c.fromValue)} ${c.from} to ${c.to}. Use the ladder to check the direction and the power of 10.`,
    badgeLabel: "Convert It",
    feedback: { correct: `Yes — ${fmt(c.answer)} ${c.to}.`, wrong: `${c.dir === "down" ? "Smaller unit — multiply" : "Larger unit — divide"} by ${c.factor}. It's ${fmt(c.answer)} ${c.to}.` },
  };
}

export function compareTask(measure: Measure, context?: { label: string; emoji: string }): ConvertTask {
  const base = PAIRS[measure][0]!; // largest pair
  const bigU = base[0], smallU = base[1], f = base[2];
  let a: { value: number; unit: string }, b: { value: number; unit: string };
  let guard = 0;
  do {
    a = { value: choose([1, 2, 3, 1.5, 2.5, 0.5, 1.25, 0.75]), unit: bigU };
    b = { value: choose(INT[f]!), unit: smallU };
    guard += 1;
  } while (convert(measure, a.value, a.unit, smallU) === b.value && guard < 20);
  return {
    kind: "metricConvert", scene: "compare", measure, pairA: a, pairB: b, context: context?.label, emoji: context?.emoji,
    prompt: "Which is greater?",
    speakText: `Which is greater: ${fmt(a.value)} ${a.unit} or ${fmt(b.value)} ${b.unit}? Convert them to the same unit first.`,
    badgeLabel: "Which Is Greater?",
    feedback: { correct: "Yes — convert to the same unit to compare.", wrong: "Convert both to the same unit, then compare." },
  };
}

export function mistakeTask(measure: Measure): ConvertTask {
  // Wrong power of 10 (needs factor ≥ 100) or wrong direction.
  const bigPairs = PAIRS[measure].filter((p) => p[2] >= 100);
  const wrongPower = bigPairs.length > 0 && randInt(2) === 0;
  if (wrongPower) {
    const [big, small, f] = choose(bigPairs);
    const v = choose(DEC[f]!);
    const correct = r5(v * f), wrong = r5(v * (f / 10));
    return {
      kind: "metricConvert", scene: "mistake", measure,
      statement: `Gauge says ${fmt(v)} ${big} = ${fmt(wrong)} ${small}.`,
      reasonOptions: shuffle(["He used the wrong power of 10", "He converted correctly", "He rounded the wrong way"]),
      correctReason: "He used the wrong power of 10",
      prompt: "What did Professor Gauge do wrong?",
      speakText: `Gauge says ${fmt(v)} ${big} equals ${fmt(wrong)} ${small}. What did he do wrong? The real answer is ${fmt(correct)}.`,
      badgeLabel: "Professor Gauge's Mistake",
      feedback: { correct: `Right — it's ×${f}, so ${fmt(v)} ${big} = ${fmt(correct)} ${small}.`, wrong: `${big} to ${small} is ×${f}, so it's ${fmt(correct)} ${small}.` },
    };
  }
  // Wrong direction: multiplied instead of dividing (small → big).
  const [big, small, f] = choose(PAIRS[measure]);
  const v = choose(INT[f]!);
  const correct = r5(v / f), wrong = r5(v * f);
  return {
    kind: "metricConvert", scene: "mistake", measure,
    statement: `Gauge says ${fmt(v)} ${small} = ${fmt(wrong)} ${big}.`,
    reasonOptions: shuffle(["He multiplied instead of dividing", "He converted correctly", "He used the wrong units"]),
    correctReason: "He multiplied instead of dividing",
    prompt: "What did Professor Gauge do wrong?",
    speakText: `Gauge says ${fmt(v)} ${small} equals ${fmt(wrong)} ${big}. What did he do wrong? Going to a larger unit, you divide.`,
    badgeLabel: "Professor Gauge's Mistake",
    feedback: { correct: `Right — to a larger unit you divide: ${fmt(v)} ${small} = ${fmt(correct)} ${big}.`, wrong: `Larger unit → divide by ${f}: ${fmt(correct)} ${big}.` },
  };
}

// Lesson wrappers.
export function l3Convert(): ConvertTask { const m = choose<Measure>(["length", "mass", "capacity"]); return convertTask(m, choose(L3_CONTEXTS[m])); }
export function l3Compare(): ConvertTask { const m = choose<Measure>(["length", "mass", "capacity"]); return compareTask(m, choose(L3_CONTEXTS[m])); }
export function l3Mistake(): ConvertTask { return mistakeTask(choose<Measure>(["length", "mass", "capacity"])); }
