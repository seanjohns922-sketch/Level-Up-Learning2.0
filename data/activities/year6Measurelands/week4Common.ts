import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { fmt, type Measure } from "@/data/activities/year6Measurelands/metricLadders";

// ── Measurelands · Level 6 · Week 4 — "Measurement Lab" (AC9M6M01) ────────────
// Convert between metric units of length, mass and capacity by USING instruments
// (jug / dial scale / tape) marked in the small unit, with tasks given in the
// large unit. Decimals in scope. No algebra.

type ConvertTask = Extract<PracticeTask, { kind: "metricConvert" }>;

export function randInt(n: number): number { return Math.floor(Math.random() * n); }
export function choose<T>(items: T[]): T { return items[randInt(items.length)]!; }
export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) { const j = randInt(i + 1); [next[i], next[j]] = [next[j]!, next[i]!]; }
  return next;
}
const r5 = (n: number) => Math.round(n * 100000) / 100000;

type Cfg = { small: string; big: string; factor: number; max: number; step: number; setBig: number[]; readSmall: number[]; readDec: number[]; compareBig: number[] };
const CFG: Record<Measure, Cfg> = {
  length: { small: "cm", big: "m", factor: 100, max: 200, step: 10, setBig: [0.5, 0.7, 1, 1.2, 1.5, 1.8, 2], readSmall: [50, 100, 150, 200], readDec: [70, 90, 120, 130, 180], compareBig: [1, 1.5, 2, 0.5, 1.2, 1.8] },
  mass: { small: "g", big: "kg", factor: 1000, max: 2000, step: 50, setBig: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75], readSmall: [250, 500, 750, 1000, 1250, 1500, 1750], readDec: [1075, 325, 1250, 750, 1875, 225], compareBig: [1, 1.5, 2, 0.5, 1.25, 0.75] },
  capacity: { small: "mL", big: "L", factor: 1000, max: 2000, step: 50, setBig: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75], readSmall: [250, 500, 750, 1000, 1250, 1500, 1750], readDec: [1075, 325, 1250, 750, 1875, 225], compareBig: [1, 1.5, 2, 0.5, 1.25, 0.75] },
};

export const L3_CONTEXTS: Record<Measure, { label: string; emoji: string }[]> = {
  length: [{ label: "rope to cut", emoji: "🪢" }, { label: "shelf plank", emoji: "🪵" }, { label: "ribbon", emoji: "🎀" }],
  mass: [{ label: "flour for a cake", emoji: "🎂" }, { label: "parcel", emoji: "📦" }, { label: "fruit haul", emoji: "🍎" }],
  capacity: [{ label: "juice for a party", emoji: "🧃" }, { label: "fish tank", emoji: "🐠" }, { label: "paint tin", emoji: "🪣" }],
};

function readOptions(answer: number): number[] {
  const opts = [answer];
  for (const v of [r5(answer * 10), r5(answer / 10), r5(answer * 100)]) { if (opts.length < 3 && v > 0 && !opts.some((o) => Math.abs(o - v) < 1e-9)) opts.push(v); }
  return shuffle(opts);
}

// ── Intro ─────────────────────────────────────────────────────────────────────
export function introTask(): ConvertTask {
  return {
    kind: "metricConvert", scene: "intro", measure: "capacity",
    prompt: "Welcome to the Measurement Lab!",
    speakText: "Welcome to the Measurement Lab. The same amount can be read in two units. This jug reads 1500 millilitres — the same as 1.5 litres. A smaller unit means a bigger number.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Enter the lab!", wrong: "Enter the lab!" },
  };
}

// ── Lab Set — drag the instrument to a target given in the big unit ──
export function labSetTask(measure: Measure, context?: { label: string; emoji: string }): ConvertTask {
  const c = CFG[measure];
  const big = choose(c.setBig);
  const target = r5(big * c.factor);
  return {
    kind: "metricConvert", scene: "labSet", measure,
    fromUnit: c.big, fromValue: big, scaleUnit: c.small, scaleMax: c.max, scaleStep: c.step, targetOnScale: target,
    context: context?.label, emoji: context?.emoji,
    prompt: `Set ${fmt(big)} ${c.big}.`,
    speakText: `Set ${fmt(big)} ${c.big} on the ${c.small} scale. First work out how many ${c.small} that is.`,
    badgeLabel: "Measurement Lab",
    feedback: { correct: `Yes — ${fmt(big)} ${c.big} = ${fmt(target)} ${c.small}.`, wrong: `${fmt(big)} ${c.big} = ${fmt(target)} ${c.small}.` },
  };
}

// ── Lab Read — read the instrument, convert to the big unit ──
export function labReadTask(measure: Measure, decimals = false, context?: { label: string; emoji: string }): ConvertTask {
  const c = CFG[measure];
  const reading = choose(decimals ? c.readDec : c.readSmall);
  const answer = r5(reading / c.factor);
  return {
    kind: "metricConvert", scene: "labRead", measure,
    fromUnit: c.small, fromValue: reading, scaleUnit: c.small, scaleMax: c.max, scaleStep: c.step,
    toUnit: c.big, answerValue: answer, options: readOptions(answer),
    context: context?.label, emoji: context?.emoji,
    prompt: `How much is this in ${c.big}?`,
    speakText: `The instrument reads ${fmt(reading)} ${c.small}. How much is that in ${c.big}?`,
    badgeLabel: "Read the Instrument",
    feedback: { correct: `Yes — ${fmt(reading)} ${c.small} = ${fmt(answer)} ${c.big}.`, wrong: `Larger unit — divide by ${c.factor}. It's ${fmt(answer)} ${c.big}.` },
  };
}

// ── Compare — which is greater ──
export function compareTask(measure: Measure, context?: { label: string; emoji: string }): ConvertTask {
  const c = CFG[measure];
  let a: { value: number; unit: string }, b: { value: number; unit: string }, guard = 0;
  do {
    a = { value: choose(c.compareBig), unit: c.big };
    b = { value: choose(c.readSmall), unit: c.small };
    guard += 1;
  } while (r5(a.value * c.factor) === b.value && guard < 20);
  return {
    kind: "metricConvert", scene: "compare", measure, pairA: a, pairB: b, context: context?.label, emoji: context?.emoji,
    prompt: "Which is greater?",
    speakText: `Which is greater: ${fmt(a.value)} ${a.unit} or ${fmt(b.value)} ${b.unit}? Convert to the same unit first.`,
    badgeLabel: "Which Is Greater?",
    feedback: { correct: "Yes — convert to the same unit to compare.", wrong: "Convert both to the same unit, then compare." },
  };
}

// ── Spot the mistake ──
export function mistakeTask(measure: Measure): ConvertTask {
  const c = CFG[measure];
  if (randInt(2) === 0) {
    // Wrong power of 10 (used ÷10 of the real factor).
    const v = choose(c.setBig.filter((x) => x >= 0.5));
    const correct = r5(v * c.factor), wrong = r5(v * (c.factor / 10));
    return {
      kind: "metricConvert", scene: "mistake", measure,
      statement: `Gauge says ${fmt(v)} ${c.big} = ${fmt(wrong)} ${c.small}.`,
      reasonOptions: shuffle(["He used the wrong power of 10", "He converted correctly", "He rounded the wrong way"]),
      correctReason: "He used the wrong power of 10",
      prompt: "What did Professor Gauge do wrong?",
      speakText: `Gauge says ${fmt(v)} ${c.big} equals ${fmt(wrong)} ${c.small}. What did he do wrong? The real answer is ${fmt(correct)}.`,
      badgeLabel: "Professor Gauge's Mistake",
      feedback: { correct: `Right — it's ×${c.factor}, so ${fmt(v)} ${c.big} = ${fmt(correct)} ${c.small}.`, wrong: `${c.big} to ${c.small} is ×${c.factor}, so it's ${fmt(correct)} ${c.small}.` },
    };
  }
  // Wrong direction (multiplied instead of dividing).
  const v = choose(c.readSmall);
  const correct = r5(v / c.factor), wrong = r5(v * c.factor);
  return {
    kind: "metricConvert", scene: "mistake", measure,
    statement: `Gauge says ${fmt(v)} ${c.small} = ${fmt(wrong)} ${c.big}.`,
    reasonOptions: shuffle(["He multiplied instead of dividing", "He converted correctly", "He used the wrong units"]),
    correctReason: "He multiplied instead of dividing",
    prompt: "What did Professor Gauge do wrong?",
    speakText: `Gauge says ${fmt(v)} ${c.small} equals ${fmt(wrong)} ${c.big}. Going to a larger unit, you divide.`,
    badgeLabel: "Professor Gauge's Mistake",
    feedback: { correct: `Right — to a larger unit you divide: ${fmt(v)} ${c.small} = ${fmt(correct)} ${c.big}.`, wrong: `Larger unit → divide by ${c.factor}: ${fmt(correct)} ${c.big}.` },
  };
}

// Lesson 3 wrappers (decimals + contexts).
export function l3Read(): ConvertTask { const m = choose<Measure>(["length", "mass", "capacity"]); return labReadTask(m, true, choose(L3_CONTEXTS[m])); }
export function l3Compare(): ConvertTask { const m = choose<Measure>(["length", "mass", "capacity"]); return compareTask(m, choose(L3_CONTEXTS[m])); }
export function l3Mistake(): ConvertTask { return mistakeTask(choose<Measure>(["length", "mass", "capacity"])); }
