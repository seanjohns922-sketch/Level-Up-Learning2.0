import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Ground · Week 2 · Lesson 3 — "Balance the Scales" ──
// AC9MFM01 (Ground): discover equivalence — same weight → the scale balances.
// All activities are configs of the reusable balanceScale toy, mapped to a
// thinking progression so the lesson asks for MORE than "click until it works":
//   A · Tip Fixer        — EXPERIMENT  (pile: add smalls to fix a tilt)
//   B · Perfect Partner  — PREDICT     (shelf: pick the object that matches)
//   C · Balanced or Not? — RECOGNISE   (judge a pre-set scale)
//   D · Which Load?       — PROBLEM-SOLVE(shelf: pick the load that balances)
// Only Tip Fixer is open-ended (Stage-1 discovery); B/C/D are single-decision,
// so students must think, not spam. Weights are abstract whole units
// (small 1 / medium 2 / large 3), never shown. Everyday, instantly-known objects.

type BalanceTask = Extract<PracticeTask, { kind: "balanceScale" }>;
type Item = BalanceTask["leftItems"][number];

type LessonMemory = { introShown: boolean; cursor: number; lastKey: string | null };

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
const DIFFICULTY_CYCLE: Difficulty[] = ["easy", "medium", "hard"];

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

// Everyday, instantly-recognisable objects, grouped by mass tier.
const SMALL: Thing[] = [
  { id: "leaf", label: "Leaf", icon: "🍃" },
  { id: "pencil", label: "Pencil", icon: "✏️" },
  { id: "crayon", label: "Crayon", icon: "🖍️" },
  { id: "spoon", label: "Spoon", icon: "🥄" },
  { id: "tennisball", label: "Tennis Ball", icon: "🎾" },
  { id: "stick", label: "Stick", icon: "🪵" },
];
const MEDIUM: Thing[] = [
  { id: "apple", label: "Apple", icon: "🍎" },
  { id: "orange", label: "Orange", icon: "🍊" },
  { id: "banana", label: "Banana", icon: "🍌" },
  { id: "carrot", label: "Carrot", icon: "🥕" },
  { id: "mug", label: "Mug", icon: "☕" },
  { id: "book", label: "Book", icon: "📕" },
  { id: "soccer", label: "Soccer Ball", icon: "⚽" },
  { id: "shoe", label: "Shoe", icon: "👟" },
  { id: "teddy", label: "Teddy", icon: "🧸" },
];
const LARGE: Thing[] = [
  { id: "watermelon", label: "Watermelon", icon: "🍉" },
  { id: "pumpkin", label: "Pumpkin", icon: "🎃" },
  { id: "backpack", label: "Backpack", icon: "🎒" },
  { id: "basketball", label: "Basketball", icon: "🏀" },
  { id: "rock", label: "Rock", icon: "🪨" },
  { id: "boot", label: "Boot", icon: "🥾" },
];

const TIER = { 1: SMALL, 2: MEDIUM, 3: LARGE } as const;

function mk(thing: Thing, weight: number, suffix = ""): Item {
  return { id: `${thing.id}${suffix}`, label: thing.label, icon: thing.icon, weight };
}

// A bundled load of `count` identical smalls (one shelf option, no spam).
function load(unit: Thing, count: number): Item {
  return {
    id: `load-${unit.id}-${count}`,
    label: `${count} ${unit.label}${count > 1 ? "s" : ""}`,
    icon: unit.icon.repeat(count),
    weight: count,
  };
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

// A · Tip Fixer — EXPERIMENT (pile). Heavy object vs a few smalls; add to the
// light side until it balances. Open-ended discovery; low cognitive load.
function buildTipFixer(memory: LessonMemory, diff: Difficulty): BalanceTask {
  const heavyWeight = diff === "easy" ? 2 : 3;
  const heavy = mk(choose(TIER[heavyWeight as 2 | 3]), heavyWeight);
  const small = choose(SMALL);
  const start = 1 + randInt(heavyWeight - 1);
  const startItems = Array.from({ length: start }, (_, i) => mk(small, 1, `-base${i}`));
  const adds = heavyWeight - start;
  memory.lastKey = `A-${heavy.id}`;
  return {
    kind: "balanceScale",
    prompt: "Make the scale balance!",
    speakText: "One side is heavier. Add to the lighter side until the scale balances.",
    badgeLabel: "Tip Fixer",
    leftItems: [heavy],
    rightItems: startItems,
    target: "right",
    supply: { mode: "pile", items: [mk(small, 1)], maxAdds: diff === "hard" ? adds : adds + 2 },
    feedback: { correct: "You balanced it!", wrong: "Watch the beam and keep adding." },
  };
}

// B · Perfect Partner — PREDICT (shelf). Pick the ONE object that weighs the
// same, before touching the scale.
function buildPerfectPartner(memory: LessonMemory, diff: Difficulty): BalanceTask {
  const w = (diff === "easy" ? choose([1, 2]) : choose([2, 3])) as 1 | 2 | 3;
  const pool = TIER[w];
  const left = choose(pool);
  let partner = choose(pool);
  let guard = 0;
  while (partner.id === left.id && guard++ < 20) partner = choose(pool);
  memory.lastKey = `B-${left.id}`;

  const otherWeights = ([1, 2, 3] as Array<1 | 2 | 3>).filter((x) => x !== w);
  const distractors = otherWeights.map((dw) => mk(choose(TIER[dw]), dw, `-d${dw}`));
  const candidates = shuffle([mk(partner, w, "-ok"), ...distractors]);

  return {
    kind: "balanceScale",
    prompt: "Which one will balance the scale?",
    speakText: "Look first. Pick the object that weighs the same so the scale balances.",
    badgeLabel: "Perfect Partner",
    leftItems: [mk(left, w)],
    rightItems: [],
    target: "right",
    supply: { mode: "shelf", items: candidates },
    feedback: { correct: "Perfect match — it balances!", wrong: "Look at the beam — try one that weighs the same." },
  };
}

// C · Balanced or Not? — RECOGNISE (judge). A pre-set scale; is it balanced?
function buildJudge(memory: LessonMemory, diff: Difficulty): BalanceTask {
  const balanced = Math.random() < 0.5;
  const w = choose([1, 2, 3]) as 1 | 2 | 3;
  const leftObj = mk(choose(TIER[w]), w, "-L");

  let rightItems: Item[];
  if (balanced) {
    let partner = choose(TIER[w]);
    let guard = 0;
    while (partner.id === leftObj.id.replace("-L", "") && guard++ < 20) partner = choose(TIER[w]);
    rightItems = [mk(partner, w, "-R")];
  } else {
    const gap = diff === "easy" ? 2 : 1; // easy tilts are more obvious
    const otherW = Math.max(1, Math.min(3, w + (Math.random() < 0.5 ? gap : -gap))) as 1 | 2 | 3;
    const safeW = (otherW === w ? ((w === 1 ? 3 : 1) as 1 | 2 | 3) : otherW);
    rightItems = [mk(choose(TIER[safeW]), safeW, "-R")];
  }
  memory.lastKey = `C-${leftObj.id}-${balanced}`;

  return {
    kind: "balanceScale",
    judge: true,
    prompt: "Is this scale balanced?",
    speakText: "Look at the scale. Is it balanced, or not balanced?",
    badgeLabel: "Balanced or Not?",
    leftItems: [leftObj],
    rightItems,
    target: "right",
    supply: { mode: "shelf", items: [] },
    feedback: { correct: "Great looking!", wrong: "Look again — does it sit level?" },
  };
}

// D · Which Load? — PROBLEM-SOLVE (shelf). Pick the bundle of smalls that
// balances the heavy object. One reasoned choice, no spam.
function buildWhichLoad(memory: LessonMemory, diff: Difficulty): BalanceTask {
  const heavyWeight = diff === "easy" ? 2 : 3;
  const heavy = mk(choose(TIER[heavyWeight as 2 | 3]), heavyWeight);
  const unit = choose(SMALL);
  memory.lastKey = `D-${heavy.id}`;

  const counts = [heavyWeight, heavyWeight - 1, heavyWeight + 1].filter((c) => c >= 1);
  const candidates = shuffle(counts.map((c) => load(unit, c)));

  return {
    kind: "balanceScale",
    prompt: "Which load balances it?",
    speakText: "Pick the load that weighs the same, so the scale balances.",
    badgeLabel: "Which Load?",
    leftItems: [heavy],
    rightItems: [],
    target: "right",
    supply: { mode: "shelf", items: candidates },
    feedback: { correct: "You worked it out — balanced!", wrong: "Think how many it takes to match." },
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
  const diff = DIFFICULTY_CYCLE[memory.cursor % DIFFICULTY_CYCLE.length]!;
  memory.cursor += 1;

  if (rotation === "A") return buildTipFixer(memory, diff);
  if (rotation === "B") return buildPerfectPartner(memory, diff);
  if (rotation === "C") return buildJudge(memory, diff);
  return buildWhichLoad(memory, diff);
}

export function resetPrepMeasurelandsWeek2Lesson3TaskSessionState() {
  lessonMemory.clear();
}
