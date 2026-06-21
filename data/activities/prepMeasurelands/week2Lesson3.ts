import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import {
  WEEK2_BALANCE_OBJECTS,
  WEEK2_MASS_OBJECTS,
  type Week2MassThing,
  toWeek2BalanceItem,
} from "./week2MassObjects";

// ── Measurelands · Ground · Week 2 · Lesson 3 — "Balance the Scales" ──
// AC9MFM01 (Ground): balanced / not balanced / same weight — using real-world
// intuition only. Balance ALWAYS comes from the SAME object on both sides
// (same object = same weight = balanced). No hidden cross-object equivalence
// (no "pumpkin = 3 leaves") — that belongs to later levels and breaks a
// Foundation child's real-world trust. Every distinct object has a distinct
// weight (never shown), so the only way to balance is to match identical
// objects. Three activities, all configs of the reusable balanceScale toy:
//   A · Find the Balanced Scale — RECOGNISE (tap the scale that matches)
//   B · Match the Object        — PREDICT   (pick the same object)
//   C · Fix the Scale           — PROBLEM-SOLVE (choose the fix)

type BalanceTask = Extract<PracticeTask, { kind: "balanceScale" }>;
type Item = BalanceTask["leftItems"][number];

type LessonMemory = { introShown: boolean; cursor: number; lastKey: string | null };

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C"];
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

// Everyday objects, each with a DISTINCT (hidden) weight roughly following
// real-world mass — so different objects never accidentally balance, and any
// tilt the child sees looks believable.
function pickDistinct(n: number): Week2MassThing[] {
  return shuffle(WEEK2_BALANCE_OBJECTS).slice(0, n);
}
function item(obj: Week2MassThing, suffix = ""): Item {
  return toWeek2BalanceItem(obj, suffix);
}

function buildIntroTask(): BalanceTask {
  return {
    kind: "balanceScale",
    demo: true,
    prompt: "Let’s balance the scales!",
    speakText:
      "These are the Balance Basin scales. When one side is heavier, it drops down. When both sides have the same thing, the scale balances and stays level. Let's find the balanced scales!",
    badgeLabel: "Meazurex Mission",
    leftItems: [],
    rightItems: [],
    target: "right",
    supply: { mode: "pile", items: [item(WEEK2_MASS_OBJECTS.leaf)] },
    feedback: { correct: "Let's balance!", wrong: "Let's get ready." },
  };
}

// A · Find the Balanced Scale — RECOGNISE. Several mini-scales; exactly one has
// the same object on both sides (balanced). Tap it.
function buildFind(memory: LessonMemory, diff: Difficulty): BalanceTask {
  const count = diff === "easy" ? 3 : 4;
  const objs = pickDistinct(count + 1); // 1 for the balanced pair + one per other scale
  const balancedObj = objs[0]!;

  const scales: NonNullable<BalanceTask["scales"]> = [];
  const balancedId = "scale-balanced";
  scales.push({ id: balancedId, left: [item(balancedObj, "-l")], right: [item(balancedObj, "-r")] });

  // Each other scale shows two DIFFERENT objects (always tilted, never balanced).
  for (let i = 1; i < count; i += 1) {
    const a = objs[i]!;
    const b = objs[(i % count) + 1] ?? objs[0]!;
    const left = a;
    const right = b.id === a.id ? balancedObj : b;
    scales.push({ id: `scale-${i}`, left: [item(left, `-l${i}`)], right: [item(right, `-r${i}`)] });
  }
  memory.lastKey = `A-${balancedObj.id}`;

  return {
    kind: "balanceScale",
    prompt: "Which scale is balanced?",
    speakText: "Find the scale that is balanced. Both sides must be the same.",
    badgeLabel: "Find the Balanced Scale",
    leftItems: [],
    rightItems: [],
    target: "right",
    supply: { mode: "shelf", items: [] },
    scales: shuffle(scales),
    correctScaleId: balancedId,
    feedback: { correct: "That one is balanced!", wrong: "Look for two that are the same." },
  };
}

// B · Match the Object — PREDICT. Left has an object; pick the SAME object so
// the scale balances. (Distractors are different objects → they tip.)
function buildMatch(memory: LessonMemory, _diff: Difficulty): BalanceTask {
  const [target, d1, d2] = pickDistinct(3);
  memory.lastKey = `B-${target!.id}`;
  const candidates = shuffle([item(target!, "-ok"), item(d1!, "-d1"), item(d2!, "-d2")]);

  return {
    kind: "balanceScale",
    prompt: "Which one balances the scale?",
    speakText: "Pick the object that is the same, so the scale balances.",
    badgeLabel: "Match the Object",
    leftItems: [item(target!, "-L")],
    rightItems: [],
    target: "right",
    supply: { mode: "shelf", items: candidates }, // shelf balances on equal weight = same object
    feedback: { correct: "Same object — it balances!", wrong: "Pick the one that is the same." },
  };
}

// C · Fix the Scale — PROBLEM-SOLVE. One side matches; the other has the same
// object PLUS an extra. Choose the action that balances it (take off the extra).
function buildFix(memory: LessonMemory, _diff: Difficulty): BalanceTask {
  const [base, extra, other] = pickDistinct(3);
  memory.lastKey = `C-${base!.id}-${extra!.id}`;

  const actions = shuffle([
    { id: "fix", label: `Take off`, icon: extra!.icon },        // remove the extra → balances
    { id: `add-${other!.id}`, label: `Add`, icon: other!.icon }, // add a different object → no
    { id: `add-${base!.id}`, label: `Add`, icon: base!.icon },   // add another base → no
  ]);

  return {
    kind: "balanceScale",
    prompt: "One side is too heavy. What will fix it?",
    speakText: "One side has something extra. Choose what will make it balance.",
    badgeLabel: "Fix the Scale",
    leftItems: [item(base!, "-L")],
    rightItems: [item(base!, "-Rbase"), item(extra!, "-Rextra")],
    target: "right",
    supply: { mode: "shelf", items: [] },
    fixActions: actions,
    correctFixId: "fix",
    feedback: { correct: "Balanced — you fixed it!", wrong: "Take off the one that doesn't match." },
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

  if (rotation === "A") return buildFind(memory, diff);
  if (rotation === "B") return buildMatch(memory, diff);
  return buildFix(memory, diff);
}

export function resetPrepMeasurelandsWeek2Lesson3TaskSessionState() {
  lessonMemory.clear();
}
