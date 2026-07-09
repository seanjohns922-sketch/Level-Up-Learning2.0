import type { PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 6 · Week 3 — "Volume Vault" (AC9M6M03) ───────────────
// Volume of rectangular prisms by building/counting cubic units and layers. No
// formula named (that is Year 7). Whole numbers, prisms only. Volume Builder.

type VolumeTask = Extract<PracticeTask, { kind: "volume" }>;
type Dims = { l: number; w: number; h: number };

export function randInt(n: number): number { return Math.floor(Math.random() * n); }
export function between(lo: number, hi: number): number { return lo + randInt(hi - lo + 1); }
export function choose<T>(items: T[]): T { return items[randInt(items.length)]!; }
export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) { const j = randInt(i + 1); [next[i], next[j]] = [next[j]!, next[i]!]; }
  return next;
}
const vol = (d: Dims) => d.l * d.w * d.h;

// Small prism for building/counting (keeps taps and cube counts sensible).
function buildDims(): Dims { return { l: between(2, 4), w: between(2, 3), h: between(2, 3) }; }
function calcDims(): Dims { return { l: between(2, 5), w: between(2, 4), h: between(2, 4) }; }

function pick3(correct: number, cands: number[]): number[] {
  const opts = [correct];
  for (const v of shuffle(cands)) { if (opts.length < 3 && v > 0 && !opts.includes(v)) opts.push(v); }
  let bump = 1;
  while (opts.length < 3) { const v = correct + bump; if (!opts.includes(v)) opts.push(v); bump += 1; }
  return shuffle(opts);
}

export const L3_CONTEXTS = [
  { label: "shipping crate", emoji: "📦" },
  { label: "toy box", emoji: "🧸" },
  { label: "warehouse", emoji: "🏭" },
  { label: "aquarium", emoji: "🐠" },
  { label: "storage shed", emoji: "🏚️" },
  { label: "treasure chest", emoji: "🧰" },
];

// ── Intro ─────────────────────────────────────────────────────────────────────
export function introTask(): VolumeTask {
  return {
    kind: "volume", scene: "intro", dims: { l: 3, w: 2, h: 2 },
    prompt: "Area covers a surface. Volume fills a space.",
    speakText: "Professor Gauge says: area covers a surface, but volume fills a space. We measure volume with cubic units — little cubes that fill the shape, including the ones you cannot see.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's build!", wrong: "Let's build!" },
  };
}

// ── Lesson 1: build / count / complete ────────────────────────────────────────
export function buildTask(predict = false): VolumeTask {
  const dims = buildDims();
  return {
    kind: "volume", scene: "build", dims, predict, answerValue: vol(dims),
    prompt: "Build the prism, one cube at a time.",
    speakText: "Fill the prism with cubes. Tap the glowing squares to place a cube. Finish each layer, then build the next.",
    badgeLabel: "Build the Prism",
    feedback: { correct: `A ${dims.l} × ${dims.w} × ${dims.h} prism — ${vol(dims)} cubic units!`, wrong: "Keep placing cubes." },
  };
}

export function completeTask(): VolumeTask {
  const dims = buildDims();
  return {
    kind: "volume", scene: "build", dims, prefill: Math.max(1, dims.h - 1), answerValue: vol(dims),
    prompt: "Finish building the prism.",
    speakText: "This prism is nearly done. Tap the glowing squares to finish the top layer.",
    badgeLabel: "Complete the Structure",
    feedback: { correct: `Done — ${vol(dims)} cubic units!`, wrong: "Finish the top layer." },
  };
}

export function countTask(): VolumeTask {
  const dims = buildDims();
  const total = vol(dims), per = dims.l * dims.w;
  return {
    kind: "volume", scene: "count", dims,
    options: pick3(total, [total - per, per, total + per, total - 1]), correctNumber: total,
    prompt: "How many cubes make this prism?",
    speakText: "Count every cube in this prism — including the ones you cannot see. Use the layers to help.",
    badgeLabel: "How Many Cubes?",
    feedback: { correct: `Yes — ${total} cubes.`, wrong: `Don't forget the hidden cubes — it's ${total}.` },
  };
}

// The formula reveal — exposure, not a requirement (count layers OR use it).
export function formulaTask(): VolumeTask {
  const dims = { l: between(3, 5), w: between(2, 4), h: between(2, 3) };
  return {
    kind: "volume", scene: "formula", dims, answerValue: vol(dims),
    prompt: "The volume shortcut",
    speakText: "You've been counting cubes per layer, then multiplying by the number of layers. That's the same as length times width times height. Some builders use this formula — you can count layers or use it, both work.",
    badgeLabel: "The Volume Formula",
    feedback: { correct: "Now you know both ways!", wrong: "Now you know both ways!" },
  };
}

// ── Lesson 2: layers / cubes per layer / total ────────────────────────────────
export function layersTask(): VolumeTask {
  const dims = calcDims();
  return {
    kind: "volume", scene: "layers", dims,
    options: pick3(dims.h, [dims.h + 1, dims.h - 1, dims.l, dims.w]), correctNumber: dims.h,
    prompt: "How many layers is this prism?",
    speakText: "How many layers tall is this prism? Use the layer view to see.",
    badgeLabel: "How Many Layers?",
    feedback: { correct: `Yes — ${dims.h} layers.`, wrong: `Count the layers from bottom to top — ${dims.h}.` },
  };
}

export function perLayerTask(): VolumeTask {
  const dims = calcDims();
  const per = dims.l * dims.w;
  return {
    kind: "volume", scene: "perLayer", dims,
    options: pick3(per, [per + dims.l, per - dims.w, dims.l + dims.w, per + 2]), correctNumber: per,
    prompt: "How many cubes are in one layer?",
    speakText: "How many cubes are in a single layer of this prism?",
    badgeLabel: "Cubes Per Layer",
    feedback: { correct: `Yes — ${per} cubes per layer.`, wrong: `One layer is ${dims.l} × ${dims.w} = ${per}.` },
  };
}

export function totalTask(context?: { label: string; emoji: string }, unit?: "cm³" | "m³"): VolumeTask {
  const dims = calcDims();
  return {
    kind: "volume", scene: "total", dims, unit, context: context?.label, emoji: context?.emoji, answerValue: vol(dims),
    prompt: "What is the total volume?",
    speakText: "Find the total volume. Count the cubes in one layer, then multiply by the number of layers.",
    badgeLabel: "Total Volume",
    feedback: { correct: `Yes — ${dims.l * dims.w} × ${dims.h} = ${vol(dims)}.`, wrong: `Cubes per layer × layers = ${vol(dims)}.` },
  };
}

// ── Lesson 3: compare / packing / capacity ────────────────────────────────────
export function compareTask(): VolumeTask {
  const ctx = choose(L3_CONTEXTS);
  let a = buildDims(), b = buildDims();
  while (vol(a) === vol(b)) b = buildDims();
  return {
    kind: "volume", scene: "compare", dims: a, dimsB: b, context: ctx.label, emoji: ctx.emoji,
    prompt: "Which box holds more?",
    speakText: "Which of these two boxes holds more cubes? Work out the volume of each.",
    badgeLabel: "Which Holds More?",
    feedback: { correct: "Yes — that box has the greater volume.", wrong: "Work out cubes per layer × layers for each box." },
  };
}

export function packingTask(): VolumeTask {
  const ctx = choose(L3_CONTEXTS);
  return { ...totalTask(ctx), prompt: "How many cubes fit inside?", badgeLabel: "Packing Challenge" };
}

export function capacityTask(): VolumeTask {
  const dims = buildDims();
  const v = vol(dims);
  return {
    kind: "volume", scene: "capacity", dims, unit: "cm³",
    options: pick3(v, [v - dims.l * dims.w, v + dims.l * dims.w, dims.l * dims.w]), correctNumber: v,
    prompt: "How much water can it hold?",
    speakText: `This container is ${v} cubic centimetres. Every cubic centimetre holds one millilitre. How many millilitres of water does it hold?`,
    badgeLabel: "Volume & Capacity",
    feedback: { correct: `Yes — ${v} cm³ holds ${v} mL.`, wrong: `1 cm³ = 1 mL, so ${v} cm³ = ${v} mL.` },
  };
}
