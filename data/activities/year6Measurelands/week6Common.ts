import type { PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 6 · Week 6 — "Angle Reasoning" (enrichment / Year 7 AC9M7SP03) ──
// Find unknown angles using angles on a straight line (180°) and around a point
// (360°). Reason first; the protractor is a check tool. Whole-number angles.

type AngleTask = Extract<PracticeTask, { kind: "angleReason" }>;
type Sector = { deg: number; label: string; unknown?: boolean };

export function randInt(n: number): number { return Math.floor(Math.random() * n); }
export function choose<T>(items: T[]): T { return items[randInt(items.length)]!; }
export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) { const j = randInt(i + 1); [next[i], next[j]] = [next[j]!, next[i]!]; }
  return next;
}
// A "nice" angle: a multiple of 5 between lo and hi (inclusive, both multiples of 5).
function nice(lo: number, hi: number): number { return lo + randInt((hi - lo) / 5 + 1) * 5; }

const LINE_CTX = [
  { label: "ramp angle", emoji: "🛹" }, { label: "roof pitch", emoji: "🏠" },
  { label: "road junction", emoji: "🛣️" }, { label: "bridge support", emoji: "🌉" },
];
const POINT_CTX = [
  { label: "crane hub", emoji: "🏗️" }, { label: "wheel spokes", emoji: "☸️" },
  { label: "roundabout", emoji: "🔄" }, { label: "tower base", emoji: "🗼" },
];

// Build sectors (knowns + one unknown), placed in a random order around the figure.
function makeSectors(knowns: number[], missing: number): Sector[] {
  const list: Sector[] = knowns.map((k) => ({ deg: k, label: `${k}°` }));
  list.push({ deg: missing, label: "?", unknown: true });
  return shuffle(list);
}

function genLine(): { knowns: number[]; missing: number } {
  if (randInt(3) === 0) {
    const a = nice(35, 85), b = nice(30, Math.max(30, 150 - a - 20));
    if (a + b <= 155) return { knowns: [a, b], missing: 180 - a - b };
  }
  const a = nice(35, 150);
  return { knowns: [a], missing: 180 - a };
}
function genPoint(): { knowns: number[]; missing: number } {
  let knowns: number[] = [], missing = 0, guard = 0;
  do {
    const n = choose([2, 3]);
    knowns = Array.from({ length: n }, () => nice(50, 130));
    missing = 360 - knowns.reduce((s, k) => s + k, 0);
    guard += 1;
  } while ((missing < 40 || missing > 200) && guard < 40);
  if (missing < 40 || missing > 200) { knowns = [130, 90]; missing = 140; }
  return { knowns, missing };
}

// ── Intro ─────────────────────────────────────────────────────────────────────
export function introTask(): AngleTask {
  return {
    kind: "angleReason", scene: "intro",
    prompt: "Reason it out — don't always measure.",
    speakText: "Engineers don't always measure. If you know the total and all but one angle, you can reason out the last one. A straight line is 180 degrees; around a point is 360 degrees.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's reason!", wrong: "Let's reason!" },
  };
}

// ── Find (keypad) ─────────────────────────────────────────────────────────────
function findTask(type: "line" | "point", context?: { label: string; emoji: string }): AngleTask {
  const g = type === "line" ? genLine() : genPoint();
  const total = type === "line" ? 180 : 360;
  return {
    kind: "angleReason", scene: "find", diagram: { type, sectors: makeSectors(g.knowns, g.missing) },
    answerDeg: g.missing, total, allowCheck: g.missing <= 180, context: context?.label, emoji: context?.emoji,
    prompt: "What is the missing angle?",
    speakText: `The angles ${type === "line" ? "on this straight line add to 180" : "around this point add to 360"} degrees. What is the missing angle?`,
    badgeLabel: "Find the Missing Angle",
    feedback: { correct: `Yes — ${total} − ${total - g.missing} = ${g.missing}°.`, wrong: `Subtract from ${total}°: the missing angle is ${g.missing}°.` },
  };
}
export function lineFind(): AngleTask { return findTask("line"); }
export function pointFind(): AngleTask { return findTask("point"); }
export function investigateTask(): AngleTask {
  const type = choose(["line", "point"] as const);
  return findTask(type, choose(type === "line" ? LINE_CTX : POINT_CTX));
}

// ── Which is correct (MCQ) ────────────────────────────────────────────────────
function whichTask(type: "line" | "point"): AngleTask {
  const g = type === "line" ? genLine() : genPoint();
  const total = type === "line" ? 180 : 360, other = type === "line" ? 360 : 180;
  const knownSum = g.knowns.reduce((s, k) => s + k, 0);
  const cands = [other - knownSum, g.missing + 10, g.missing - 10, g.missing + 20];
  const opts = [g.missing];
  for (const c of shuffle(cands)) { if (opts.length < 3 && c > 0 && !opts.includes(c)) opts.push(c); }
  while (opts.length < 3) opts.push(g.missing + opts.length * 5);
  return {
    kind: "angleReason", scene: "which", diagram: { type, sectors: makeSectors(g.knowns, g.missing) },
    options: shuffle(opts), correctNumber: g.missing, total,
    prompt: "Which is the missing angle?",
    speakText: `Which of these is the missing angle? Remember the total is ${total} degrees.`,
    badgeLabel: "Which Answer Is Correct?",
    feedback: { correct: `Yes — ${g.missing}°.`, wrong: `Use ${total}°, not ${other}°. It's ${g.missing}°.` },
  };
}
export function lineWhich(): AngleTask { return whichTask("line"); }
export function pointWhich(): AngleTask { return whichTask("point"); }
export function anyWhich(): AngleTask { return whichTask(choose(["line", "point"] as const)); }

// ── Spot the mistake ──────────────────────────────────────────────────────────
function mistakeTask(type: "line" | "point"): AngleTask {
  const g = type === "line" ? genLine() : genPoint();
  const total = type === "line" ? 180 : 360;
  const wrong = Math.max(10, g.missing + choose([-30, -20, 20, 30]));
  return {
    kind: "angleReason", scene: "mistake", diagram: { type, sectors: makeSectors(g.knowns, g.missing) },
    statement: `Gauge says the missing angle is ${wrong}°.`,
    reasonOptions: shuffle([`The angles don't add to ${total}°`, "His angles add up correctly", "You must measure to know for sure"]),
    correctReason: `The angles don't add to ${total}°`,
    total,
    prompt: "What is wrong with Professor Gauge's answer?",
    speakText: `Gauge says the missing angle is ${wrong} degrees. What is wrong with that? The angles must add to ${total} degrees.`,
    badgeLabel: "Professor Gauge's Mistake",
    feedback: { correct: `Right — they must total ${total}°, so it's ${g.missing}°.`, wrong: `Add them up: they must make ${total}°, so the answer is ${g.missing}°.` },
  };
}
export function lineMistake(): AngleTask { return mistakeTask("line"); }
export function pointMistake(): AngleTask { return mistakeTask("point"); }
export function anyMistake(): AngleTask { return mistakeTask(choose(["line", "point"] as const)); }
