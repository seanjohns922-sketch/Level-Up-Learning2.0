import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Ground · Week 2 · Lesson 3 — "Balance the Scales" ──
// AC9MFM01 (Ground): discover equivalence — when both sides weigh the same, the
// scale balances. Three activities, all configurations of the reusable
// balanceScale component:
//   Tip Fixer       — add smalls to the lighter side to fix a tilt
//   Perfect Partner — pick the one object that weighs the same (balances)
//   Match-Maker Cart— fill an empty pan with smalls to match a heavy object
// Weights are abstract whole units (never shown): small = 1, medium = 2,
// large = 3. Ground equivalence is capped at 2 smalls = 1 medium, 3 = 1 large.

type BalanceTask = Extract<PracticeTask, { kind: "balanceScale" }>;
type Item = BalanceTask["leftItems"][number];

type LessonMemory = { introShown: boolean; cursor: number; lastKey: string | null };

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastKey: null };
  lessonMemory.set(lessonId, created);
  return created;
}

function randInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}
function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}
function choose<T>(items: T[]): T {
  return items[randInt(items.length)]!;
}

type Thing = { id: string; label: string; icon: string };

// weight = tier (1 small, 2 medium, 3 large)
const SMALL: Thing[] = [
  { id: "apple", label: "Apple", icon: "🍎" },
  { id: "gem", label: "Gem", icon: "💎" },
  { id: "acorn", label: "Acorn", icon: "🌰" },
  { id: "star", label: "Star", icon: "⭐" },
  { id: "coin", label: "Coin", icon: "🪙" },
  { id: "strawberry", label: "Berry", icon: "🍓" },
];
const MEDIUM: Thing[] = [
  { id: "book", label: "Book", icon: "📕" },
  { id: "mug", label: "Mug", icon: "☕" },
  { id: "ball", label: "Ball", icon: "⚽" },
  { id: "shoe", label: "Shoe", icon: "👟" },
];
const LARGE: Thing[] = [
  { id: "watermelon", label: "Watermelon", icon: "🍉" },
  { id: "rock", label: "Rock", icon: "🪨" },
  { id: "brick", label: "Brick", icon: "🧱" },
  { id: "pumpkin", label: "Pumpkin", icon: "🎃" },
];

const TIER = { 1: SMALL, 2: MEDIUM, 3: LARGE } as const;

function mk(thing: Thing, weight: number, suffix = ""): Item {
  return { id: `${thing.id}${suffix}`, label: thing.label, icon: thing.icon, weight };
}

function buildIntroTask(): BalanceTask {
  return {
    kind: "balanceScale",
    demo: true,
    prompt: "Let’s balance the scales!",
    speakText:
      "These are the Balance Basin scales. When one side is heavier, it drops down. When both sides weigh the same, the scale balances and stays level. Let's make some balance!",
    badgeLabel: "Meazurex Mission",
    leftItems: [],
    rightItems: [],
    target: "right",
    supply: { mode: "pile", items: [mk(SMALL[0]!, 1)] },
    feedback: { correct: "Let's balance!", wrong: "Let's get ready." },
  };
}

// Activity — Tip Fixer: scale starts tilted (heavy object vs a few smalls);
// add smalls to the light side until it balances. (Heavy object so the child
// reads the beam rather than counting identical objects.)
function buildTipFixer(memory: LessonMemory): BalanceTask {
  const heavyWeight = choose([2, 3]);
  const heavy = mk(choose(TIER[heavyWeight as 2 | 3]), heavyWeight);
  const small = choose(SMALL);
  const start = 1 + randInt(heavyWeight - 1); // 1 … heavyWeight-1 (always tilted)
  const startItems = Array.from({ length: start }, (_, i) => mk(small, 1, `-base${i}`));
  memory.lastKey = `tip-${heavy.id}-${small.id}`;

  return {
    kind: "balanceScale",
    prompt: "Make the scale balance!",
    speakText: "One side is heavier. Add to the lighter side until the scale balances.",
    badgeLabel: "Tip Fixer",
    leftItems: [heavy],
    rightItems: startItems,
    target: "right",
    supply: { mode: "pile", items: [mk(small, 1)], maxAdds: heavyWeight + 1 },
    feedback: { correct: "You balanced it!", wrong: "Watch the beam and keep adding." },
  };
}

// Activity — Perfect Partner: one object on the left; pick the ONE object that
// weighs the same so the scale balances.
function buildPerfectPartner(memory: LessonMemory): BalanceTask {
  const w = choose([1, 2, 3]) as 1 | 2 | 3;
  const pool = TIER[w];
  const left = choose(pool);
  let partner = choose(pool);
  let guard = 0;
  while (partner.id === left.id && guard++ < 20) partner = choose(pool);
  memory.lastKey = `partner-${left.id}`;

  // Two distractors from the other two tiers (clearly different weights).
  const otherWeights = ([1, 2, 3] as Array<1 | 2 | 3>).filter((x) => x !== w);
  const distractors = otherWeights.map((dw) => mk(choose(TIER[dw]), dw, `-d${dw}`));

  const candidates = shuffle([mk(partner, w, "-ok"), ...distractors]);

  return {
    kind: "balanceScale",
    prompt: "Which one balances the scale?",
    speakText: "Pick the object that weighs the same, so the scale balances.",
    badgeLabel: "Perfect Partner",
    leftItems: [mk(left, w)],
    rightItems: [],
    target: "right",
    supply: { mode: "shelf", items: candidates },
    feedback: { correct: "Perfect match — it balances!", wrong: "Look at the beam — try one that weighs the same." },
  };
}

// Activity — Match-Maker Cart: empty pan vs a heavy object; fill with smalls
// until it balances (2 smalls = medium, 3 smalls = large).
function buildMatchMaker(memory: LessonMemory): BalanceTask {
  const heavyWeight = choose([2, 3]);
  const heavy = mk(choose(TIER[heavyWeight as 2 | 3]), heavyWeight);
  const small = choose(SMALL);
  memory.lastKey = `cart-${heavy.id}-${small.id}`;

  return {
    kind: "balanceScale",
    prompt: "Fill the cart until it balances!",
    speakText: "Add small objects until both sides weigh the same and the scale balances.",
    badgeLabel: "Match-Maker Cart",
    leftItems: [heavy],
    rightItems: [],
    target: "right",
    supply: { mode: "pile", items: [mk(small, 1)], maxAdds: heavyWeight + 1 },
    feedback: { correct: "Balanced — the cart rolls away!", wrong: "Keep adding until it's level." },
  };
}

export function generatePrepMeasurelandsWeek2Lesson3Task(
  lessonId: string,
  _difficulty: Difficulty,
): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }

  const rotation = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;

  if (rotation === "A") return buildTipFixer(memory);
  if (rotation === "B") return buildPerfectPartner(memory);
  return buildMatchMaker(memory);
}

export function resetPrepMeasurelandsWeek2Lesson3TaskSessionState() {
  lessonMemory.clear();
}
