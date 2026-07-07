import type { PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 5 · Week 7 — shared helpers (Angle Masters) ──────────
// AC9M5M04: estimate, measure and construct angles with a protractor. Whole
// degrees, 0-180, no reflex. Reuses MeasurelandsAngle + the new protractor.

export function randInt(n: number): number {
  return Math.floor(Math.random() * n);
}
export function choose<T>(items: T[]): T {
  return items[randInt(items.length)]!;
}
export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1);
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

type ProtractorTask = Extract<PracticeTask, { kind: "protractor" }>;

export const CONTEXTS = [
  { label: "bridge truss", emoji: "🌉" },
  { label: "crane arm", emoji: "🏗️" },
  { label: "roof pitch", emoji: "🏠" },
  { label: "road junction", emoji: "🛣️" },
  { label: "skate ramp", emoji: "🛹" },
  { label: "ladder lean", emoji: "🪜" },
];

// Angles that read cleanly on a protractor (avoid ~90 so the opposite-scale trap
// stays distinct from the correct answer).
const READ_ANGLES = [30, 40, 45, 50, 55, 60, 65, 70, 110, 115, 120, 125, 130, 135, 140, 150];
const EST_ANGLES = [30, 35, 40, 45, 55, 60, 70, 75, 80, 100, 110, 120, 130, 135, 145, 150, 160];
const BUILD_ANGLES = [30, 45, 60, 75, 120, 135, 150];

function spreadOptions(correct: number, minGap = 25): number[] {
  const opts = [correct];
  let guard = 0;
  while (opts.length < 3 && guard++ < 60) {
    const v = Math.max(10, Math.min(170, correct + choose([-60, -50, -40, -30, 30, 40, 50, 60])));
    if (opts.every((o) => Math.abs(o - v) >= minGap)) opts.push(v);
  }
  while (opts.length < 3) opts.push(Math.max(10, Math.min(170, correct + opts.length * 30)));
  return shuffle(opts);
}

// Reading options: correct + the opposite-scale value (180 - angle) + one more.
function readOptions(angle: number): number[] {
  const trap = 180 - angle;
  const opts = [angle, trap];
  let guard = 0;
  while (opts.length < 3 && guard++ < 40) {
    const v = Math.max(10, Math.min(170, angle + choose([-40, -30, -20, 20, 30, 40])));
    if (opts.every((o) => Math.abs(o - v) >= 12)) opts.push(v);
  }
  while (opts.length < 3) opts.push(Math.max(10, Math.min(170, angle + 25 + opts.length * 10)));
  return shuffle(opts.slice(0, 3).includes(angle) ? opts.slice(0, 3) : [angle, trap, opts[2]!]);
}

// ── Lesson 1: estimate ────────────────────────────────────────────────────────
export function estimateTask(): ProtractorTask {
  const angle = choose(EST_ANGLES);
  const ctx = choose(CONTEXTS);
  return {
    kind: "protractor",
    scene: "estimate",
    angle,
    context: ctx,
    prompt: "Estimate the size of this angle.",
    speakText: "Compare it to a right angle. Estimate the size of this angle.",
    badgeLabel: "Estimate the Angle",
    options: spreadOptions(angle),
    correctOption: angle,
    feedback: { correct: `Yes — it's about ${angle}°.`, wrong: `Compare it to 90° — it's about ${angle}°.` },
  };
}

export function closestTask(): ProtractorTask {
  const angle = choose(EST_ANGLES);
  const ctx = choose(CONTEXTS);
  return {
    kind: "protractor",
    scene: "closest",
    angle,
    context: ctx,
    prompt: "Which estimate is closest?",
    speakText: "Which of these is the closest estimate for the angle?",
    badgeLabel: "Which Is Closest?",
    options: spreadOptions(angle, 30),
    correctOption: angle,
    feedback: { correct: `Yes — ${angle}° is closest.`, wrong: `Compare to 90° — ${angle}° is closest.` },
  };
}

export function guessTask(): ProtractorTask {
  const angle = choose(EST_ANGLES);
  const ctx = choose(CONTEXTS);
  const sensible = randInt(2) === 0;
  const guess = sensible
    ? Math.max(10, Math.min(170, angle + choose([-10, -5, 5, 10])))
    : Math.max(10, Math.min(170, angle + choose([-60, -50, 50, 60])));
  return {
    kind: "protractor",
    scene: "guess",
    angle,
    context: ctx,
    prompt: "Is Professor Gauge's estimate sensible?",
    speakText: `Professor Gauge estimates ${guess} degrees. Is that a sensible estimate?`,
    badgeLabel: "Professor Gauge's Guess",
    statement: `Gauge estimates ${guess}°`,
    guessValue: guess,
    sensible,
    feedback: { correct: sensible ? "Yes — that's a close, sensible estimate." : "Right — that estimate is way off.", wrong: sensible ? "It's actually close — that's sensible." : "Compare to 90° — that guess is too far off." },
  };
}

// ── Lesson 1 (game): estimate with a stepper — Alien-Angles style ──────────────
// Whole angles that read cleanly and give a satisfying spread of benchmarks.
const GAME_ANGLES = [20, 30, 35, 40, 45, 55, 60, 65, 70, 75, 80, 100, 110, 115, 120, 125, 130, 135, 145, 150, 160];

// Benchmark angles taught in the intro and used as reference throughout.
export function angleIntroTask(): ProtractorTask {
  return {
    kind: "protractor",
    scene: "intro",
    prompt: "Meet the benchmark angles.",
    speakText:
      "Professor Gauge says: engineers don't guess randomly. They compare new angles to familiar benchmark angles — 30, 45, 90, 135 and 180 degrees. Learn these, then estimate.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's estimate!", wrong: "Let's estimate!" },
  };
}

// Activity A — Estimate It: one angle, a stepper, reveal the difference.
export function estimateStepperTask(): ProtractorTask {
  const angle = choose(GAME_ANGLES);
  return {
    kind: "protractor",
    scene: "estimateStepper",
    angle,
    prompt: "What angle do you think this is?",
    speakText: "Estimate this angle. Compare it to a right angle — 90 degrees — then lock in your guess.",
    badgeLabel: "Estimate It",
    feedback: { correct: `It was ${angle}°.`, wrong: `It was ${angle}°.` },
  };
}

// Activity B — Bigger or Smaller?: judge against 90°, then estimate.
export function compareEstimateTask(): ProtractorTask {
  const angle = choose(GAME_ANGLES.filter((a) => Math.abs(a - 90) >= 15));
  return {
    kind: "protractor",
    scene: "compareEstimate",
    angle,
    benchmark: 90,
    prompt: "Smaller, equal, or larger than a right angle?",
    speakText: "Is this angle smaller than, equal to, or larger than a right angle — 90 degrees? Then estimate its size.",
    badgeLabel: "Bigger or Smaller?",
    feedback: { correct: `It was ${angle}°.`, wrong: `Compare it to the square corner — it's ${angle}°.` },
  };
}

// Activity C — Beat Your Best: 5 angles in a row, score by closeness.
export function streakTask(): ProtractorTask {
  return {
    kind: "protractor",
    scene: "streak",
    rounds: 5,
    angles: shuffle(GAME_ANGLES).slice(0, 5),
    prompt: "Beat your best — estimate 5 angles!",
    speakText: "Estimate five angles in a row. The closer you are, the more stars you earn. Try to beat your best average!",
    badgeLabel: "Beat Your Best",
    feedback: { correct: "Great estimating!", wrong: "Great estimating!" },
  };
}

// ── Meet the protractor (guided walkthrough) ──────────────────────────────────
export function learnTask(): ProtractorTask {
  const angle = choose([40, 60, 120, 130]);
  const side: "left" | "right" = randInt(2) === 0 ? "left" : "right";
  return {
    kind: "protractor",
    scene: "learn",
    angle,
    baselineSide: side,
    prompt: "How to use a protractor.",
    speakText: "Professor Gauge shows you how to use a protractor. Centre on the vertex, line the baseline up with zero, then read the scale that starts at zero.",
    badgeLabel: "Meet the Protractor",
    feedback: { correct: "Now you try!", wrong: "Now you try!" },
  };
}

// ── Lesson 1: measure ─────────────────────────────────────────────────────────
export function readTask(): ProtractorTask {
  const angle = choose(READ_ANGLES);
  const side: "left" | "right" = randInt(2) === 0 ? "left" : "right";
  return {
    kind: "protractor",
    scene: "read",
    angle,
    baselineSide: side,
    guidance: "full",
    prompt: "What is the angle on the protractor?",
    speakText: "Read the protractor. Start from the 0 on your baseline arm. What is the angle?",
    badgeLabel: "Read the Protractor",
    options: readOptions(angle),
    correctOption: angle,
    feedback: { correct: `Yes — ${angle}°.`, wrong: `Start from the 0 on your baseline and read that scale — ${angle}°.` },
  };
}

export function whichScaleTask(): ProtractorTask {
  const angle = choose(READ_ANGLES);
  const side: "left" | "right" = randInt(2) === 0 ? "left" : "right";
  return {
    kind: "protractor",
    scene: "whichScale",
    angle,
    baselineSide: side,
    guidance: "baseline",
    prompt: "Read from the glowing baseline. What is the angle?",
    speakText: "Start reading from the glowing baseline's zero. What is the angle?",
    badgeLabel: "Which Scale?",
    options: readOptions(angle),
    correctOption: angle,
    feedback: { correct: `Yes — ${angle}°.`, wrong: `The other option is the opposite scale — start from your baseline's 0. It's ${angle}°.` },
  };
}

export function mistakeTask(): ProtractorTask {
  const angle = choose(READ_ANGLES);
  const side: "left" | "right" = randInt(2) === 0 ? "left" : "right";
  const wrong = 180 - angle;
  return {
    kind: "protractor",
    scene: "mistake",
    angle,
    baselineSide: side,
    prompt: "What mistake did Professor Gauge make?",
    speakText: `Professor Gauge read ${wrong} degrees, but the angle is ${angle} degrees. What mistake did he make?`,
    badgeLabel: "Professor Gauge's Mistake",
    statement: `Gauge read ${wrong}° (it's really ${angle}°)`,
    reasonOptions: shuffle(["Started from the wrong zero", "Put the centre in the wrong place", "Counted backwards from 180"]),
    correctReason: "Started from the wrong zero",
    feedback: { correct: "Yes — he read the opposite scale, starting from the wrong zero.", wrong: `He used the wrong scale — start from the 0 on the baseline arm to get ${angle}°.` },
  };
}

// ── Lesson 3: construct ───────────────────────────────────────────────────────
export function constructTask(fixed?: number, context?: { label: string; emoji: string }): ProtractorTask {
  const target = fixed ?? choose(BUILD_ANGLES);
  const ctx = context ?? choose(CONTEXTS);
  return {
    kind: "protractor",
    scene: "construct",
    targetDeg: target,
    context: ctx,
    prompt: `Build a ${target}° angle for the ${ctx.label}.`,
    speakText: `Drag the arm to build a ${target} degree angle for the ${ctx.label}, then press Build.`,
    badgeLabel: "Engineer Challenge",
    feedback: { correct: `Yes — a perfect ${target}° angle!`, wrong: "Drag the arm to the target degree." },
  };
}
