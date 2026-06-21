import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildMeasurelandsWeek2Lesson2QuizTasks } from "./week2Lesson2";
import {
  WEEK2_BALANCE_OBJECTS,
  WEEK2_HEAVY_OBJECTS,
  WEEK2_LIGHT_OBJECTS,
  WEEK2_MASS_OBJECTS,
  WEEK2_TRIO_SETS,
  type Week2MassThing,
  toWeek2BalanceItem,
  toWeek2MassCompareObject,
} from "./week2MassObjects";

// ── Measurelands · Ground · Week 2 Weekly Quiz — "Balance Basin" ──
// 15 questions total:
//   5 from Lesson 1 — heavy / light comparisons
//   5 from Lesson 2 — ordering by mass
//   5 from Lesson 3 — balanced / not balanced / same weight
// Built from the same measurementCompare and balanceScale task kinds used in
// the lessons so the quiz feels familiar while still being slightly tighter.

type CompareTask = Extract<PracticeTask, { kind: "measurementCompare" }>;
type BalanceTask = Extract<PracticeTask, { kind: "balanceScale" }>;
type MObj = CompareTask["objects"][number];
type Accent = MObj["accent"];
type BalanceItem = BalanceTask["leftItems"][number];

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

const ACCENTS: Accent[] = ["rose", "gold", "teal", "sky", "violet", "leaf"];

function makePairQuestion(targetMode: "heavier" | "lighter", heavy: Week2MassThing, light: Week2MassThing): CompareTask {
  const accents = shuffle(ACCENTS);
  const heavyObj = toWeek2MassCompareObject(heavy, accents[0]!);
  const lightObj = toWeek2MassCompareObject(light, accents[1]!);
  return {
    kind: "measurementCompare",
    scene: "pair",
    targetMode,
    prompt: targetMode === "heavier" ? "Which is heavier?" : "Which is lighter?",
    speakText: targetMode === "heavier" ? "Which is heavier?" : "Which is lighter?",
    badgeLabel: targetMode === "heavier" ? "Which Is Heavier?" : "Which Is Lighter?",
    objects: shuffle([heavyObj, lightObj]),
    correctOptionId: targetMode === "heavier" ? heavyObj.id : lightObj.id,
    feedback: {
      correct: targetMode === "heavier" ? "That is heavier!" : "That is lighter!",
      wrong: "Look carefully at the scale.",
    },
  };
}

function makeTrioQuestion(targetMode: "heaviest" | "lightest", things: Week2MassThing[]): CompareTask {
  const accents = shuffle(ACCENTS);
  const objects = things.map((thing, index) => toWeek2MassCompareObject(thing, accents[index]!));
  const ordered = [...objects].sort((a, b) => a.compareValue - b.compareValue);
  const correct = targetMode === "heaviest" ? ordered[ordered.length - 1]! : ordered[0]!;
  return {
    kind: "measurementCompare",
    scene: "trio",
    targetMode,
    prompt: targetMode === "heaviest" ? "Tap the heaviest." : "Tap the lightest.",
    speakText: targetMode === "heaviest" ? "Tap the heaviest object." : "Tap the lightest object.",
    badgeLabel: "Mass Quiz",
    objects: shuffle(objects),
    correctOptionId: correct.id,
    feedback: {
      correct: targetMode === "heaviest" ? "You found the heaviest object!" : "You found the lightest object!",
      wrong: "Look carefully at the weight bars.",
    },
  };
}

function pickDistinctBalanceThings(count: number): Week2MassThing[] {
  return shuffle(WEEK2_BALANCE_OBJECTS).slice(0, count);
}

function makeJudgeQuestion(left: Week2MassThing, right: Week2MassThing, balanced: boolean): BalanceTask {
  const rightThing = balanced ? right : { ...right, weight: right.weight + 2 };
  return {
    kind: "balanceScale",
    judge: true,
    prompt: "Will it balance?",
    speakText: "Look at the scale. Will it balance? Yes or no?",
    badgeLabel: "Will It Balance?",
    leftItems: [toWeek2BalanceItem(left, "-L")],
    rightItems: [toWeek2BalanceItem(rightThing, "-R")],
    target: "right",
    supply: { mode: "shelf", items: [] },
    feedback: { correct: "Yes, you spotted it!", wrong: "Look again. Do both sides match?" },
  };
}

function makePickSameObjectQuestion(target: Week2MassThing, distractorA: Week2MassThing, distractorB: Week2MassThing): BalanceTask {
  return {
    kind: "balanceScale",
    prompt: "Match the object.",
    speakText: "Pick the same object so the scale balances.",
    badgeLabel: "Match the Object",
    leftItems: [toWeek2BalanceItem(target, "-L")],
    rightItems: [],
    target: "right",
    supply: {
      mode: "shelf",
      items: shuffle([
        toWeek2BalanceItem(target, "-ok"),
        toWeek2BalanceItem(distractorA, "-d1"),
        toWeek2BalanceItem(distractorB, "-d2"),
      ]),
    },
    feedback: { correct: "Same object — it balances!", wrong: "Pick the one that matches." },
  };
}

function makePickBalancedScaleQuestion(): BalanceTask {
  const [balancedObj, leftA, rightA, leftB, rightB] = pickDistinctBalanceThings(5);
  const balancedId = "scale-balanced";
  return {
    kind: "balanceScale",
    prompt: "Which scale is balanced?",
    speakText: "Find the scale that is balanced. Both sides must be the same.",
    badgeLabel: "Balanced Scale",
    leftItems: [],
    rightItems: [],
    target: "right",
    supply: { mode: "shelf", items: [] },
    scales: shuffle([
      {
        id: balancedId,
        left: [toWeek2BalanceItem(balancedObj!, "-l")],
        right: [toWeek2BalanceItem(balancedObj!, "-r")],
      },
      {
        id: "scale-1",
        left: [toWeek2BalanceItem(leftA!, "-l1")],
        right: [toWeek2BalanceItem(rightA!, "-r1")],
      },
      {
        id: "scale-2",
        left: [toWeek2BalanceItem(leftB!, "-l2")],
        right: [toWeek2BalanceItem(rightB!, "-r2")],
      },
    ]),
    correctScaleId: balancedId,
    feedback: { correct: "That scale is balanced!", wrong: "Look for the same object on both sides." },
  };
}

function makeFixScaleQuestion(base: Week2MassThing, extra: Week2MassThing, distractor: Week2MassThing): BalanceTask {
  return {
    kind: "balanceScale",
    prompt: "Fix the scale.",
    speakText: "One side has something extra. Choose what will fix the scale.",
    badgeLabel: "Fix the Scale",
    leftItems: [toWeek2BalanceItem(base, "-L")],
    rightItems: [toWeek2BalanceItem(base, "-Rbase"), toWeek2BalanceItem(extra, "-Rextra")],
    target: "right",
    supply: { mode: "shelf", items: [] },
    fixActions: shuffle([
      { id: "fix-remove", label: `Remove ${extra.label}`, icon: extra.icon },
      { id: "add-extra", label: `Add ${extra.label}`, icon: extra.icon },
      { id: "add-distractor", label: `Add ${distractor.label}`, icon: distractor.icon },
    ]),
    correctFixId: "fix-remove",
    feedback: { correct: "Balanced — you fixed it!", wrong: "Take away the extra object." },
  };
}

function makeFindMatchingScaleQuestion(): BalanceTask {
  const [balancedObj, leftA, rightA, leftB, rightB] = pickDistinctBalanceThings(5);
  const correctScaleId = "matching-scale";
  return {
    kind: "balanceScale",
    prompt: "Find the matching scale.",
    speakText: "Tap the scale with the same object on both sides.",
    badgeLabel: "Find the Match",
    leftItems: [],
    rightItems: [],
    target: "right",
    supply: { mode: "shelf", items: [] },
    scales: shuffle([
      {
        id: correctScaleId,
        left: [toWeek2BalanceItem(balancedObj!, "-same-l")],
        right: [toWeek2BalanceItem(balancedObj!, "-same-r")],
      },
      {
        id: "different-1",
        left: [toWeek2BalanceItem(leftA!, "-d1-l")],
        right: [toWeek2BalanceItem(rightA!, "-d1-r")],
      },
      {
        id: "different-2",
        left: [toWeek2BalanceItem(leftB!, "-d2-l")],
        right: [toWeek2BalanceItem(rightB!, "-d2-r")],
      },
    ]),
    correctScaleId,
    feedback: { correct: "Yes — those sides match!", wrong: "Look for the same object on both sides." },
  };
}

export function buildMeasurelandsWeek2QuizTasks(): PracticeTask[] {
  const lesson1: PracticeTask[] = [
    makePairQuestion("heavier", WEEK2_HEAVY_OBJECTS[0]!, WEEK2_LIGHT_OBJECTS[0]!),
    makePairQuestion("lighter", WEEK2_HEAVY_OBJECTS[1]!, WEEK2_LIGHT_OBJECTS[1]!),
    makeTrioQuestion("heaviest", WEEK2_TRIO_SETS[0]!.items),
    makeTrioQuestion("lightest", WEEK2_TRIO_SETS[1]!.items),
    {
      kind: "measurementCompare",
      scene: "sort",
      prompt: "Is it heavy or light?",
      speakText: "Is the apple heavy or light?",
      badgeLabel: "Heavy or Light Sort",
      objects: [toWeek2MassCompareObject(WEEK2_MASS_OBJECTS.apple, "rose")],
      bins: [
        { id: "heavy", label: "Heavy", icon: "🪨" },
        { id: "light", label: "Light", icon: "🪶" },
      ],
      correctOptionId: "light",
      feedback: { correct: "Yes — it is light!", wrong: "Think about whether it would push the scale down a lot." },
    },
  ];

  const lesson2 = buildMeasurelandsWeek2Lesson2QuizTasks();

  const lesson3Pool = pickDistinctBalanceThings(9);
  const judgeIsBalanced = randInt(2) === 0;
  const lesson3: PracticeTask[] = [
    makePickBalancedScaleQuestion(),
    makePickSameObjectQuestion(lesson3Pool[0]!, lesson3Pool[1]!, lesson3Pool[2]!),
    makeJudgeQuestion(
      lesson3Pool[3]!,
      judgeIsBalanced ? lesson3Pool[3]! : lesson3Pool[4]!,
      judgeIsBalanced,
    ),
    makeFixScaleQuestion(lesson3Pool[4]!, lesson3Pool[5]!, lesson3Pool[6]!),
    makeFindMatchingScaleQuestion(),
  ];

  return [...lesson1, ...lesson2, ...lesson3];
}
