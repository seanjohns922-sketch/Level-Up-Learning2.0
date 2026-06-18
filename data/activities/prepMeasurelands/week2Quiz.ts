import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildMeasurelandsWeek2Lesson2QuizTasks } from "./week2Lesson2";

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

type Thing = { id: string; label: string; icon: string; weight: number };

const HEAVY: Thing[] = [
  { id: "rock", label: "Rock", icon: "🪨", weight: 10 },
  { id: "truck", label: "Truck", icon: "🚚", weight: 10 },
  { id: "elephant", label: "Elephant", icon: "🐘", weight: 10 },
  { id: "treasure", label: "Treasure Chest", icon: "🧰", weight: 10 },
  { id: "boot", label: "Boot", icon: "🥾", weight: 7 },
  { id: "chair", label: "Chair", icon: "🪑", weight: 8 },
  { id: "basketball", label: "Basketball", icon: "🏀", weight: 8 },
  { id: "backpack", label: "Backpack", icon: "🎒", weight: 8 },
];

const LIGHT: Thing[] = [
  { id: "feather", label: "Feather", icon: "🪶", weight: 1 },
  { id: "leaf", label: "Leaf", icon: "🍃", weight: 1 },
  { id: "coin", label: "Coin", icon: "🪙", weight: 1 },
  { id: "spoon", label: "Spoon", icon: "🥄", weight: 2 },
  { id: "pencil", label: "Pencil", icon: "✏️", weight: 2 },
  { id: "apple", label: "Apple", icon: "🍎", weight: 3 },
  { id: "tennis", label: "Tennis Ball", icon: "🎾", weight: 3 },
  { id: "orange", label: "Orange", icon: "🍊", weight: 3 },
];

const TRIO_SETS: Array<Thing[]> = [
  [
    { id: "coin", label: "Coin", icon: "🪙", weight: 1 },
    { id: "apple", label: "Apple", icon: "🍎", weight: 3 },
    { id: "backpack", label: "Backpack", icon: "🎒", weight: 8 },
  ],
  [
    { id: "leaf", label: "Leaf", icon: "🍃", weight: 1 },
    { id: "boot", label: "Boot", icon: "🥾", weight: 7 },
    { id: "rock", label: "Rock", icon: "🪨", weight: 10 },
  ],
  [
    { id: "spoon", label: "Spoon", icon: "🥄", weight: 2 },
    { id: "bucket", label: "Bucket", icon: "🪣", weight: 6 },
    { id: "treasure", label: "Treasure Chest", icon: "🧰", weight: 10 },
  ],
  [
    { id: "mouse", label: "Mouse", icon: "🐭", weight: 2 },
    { id: "dog", label: "Dog", icon: "🐕", weight: 6 },
    { id: "elephant", label: "Elephant", icon: "🐘", weight: 10 },
  ],
  [
    { id: "coin", label: "Coin", icon: "🪙", weight: 1 },
    { id: "helmet", label: "Helmet", icon: "⛑️", weight: 5 },
    { id: "boulder", label: "Boulder", icon: "🪨", weight: 10 },
  ],
];

function toMassObj(thing: Thing, accent: Accent, suffix = ""): MObj {
  return {
    id: `${thing.id}${suffix}`,
    label: thing.label,
    icon: thing.icon,
    compareValue: thing.weight,
    axis: "mass",
    accent,
  };
}

function makeBalanceItem(thing: Thing, suffix = ""): BalanceItem {
  return {
    id: `${thing.id}${suffix}`,
    label: thing.label,
    icon: thing.icon,
    weight: thing.weight,
  };
}

function makePairQuestion(targetMode: "heavier" | "lighter", heavy: Thing, light: Thing): CompareTask {
  const accents = shuffle(ACCENTS);
  const heavyObj = toMassObj(heavy, accents[0]!);
  const lightObj = toMassObj(light, accents[1]!);
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

function makeTrioQuestion(targetMode: "heaviest" | "lightest", things: Thing[]): CompareTask {
  const accents = shuffle(ACCENTS);
  const objects = things.map((thing, index) => toMassObj(thing, accents[index]!));
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

const BALANCE_OBJECTS: Thing[] = [
  { id: "apple", label: "Apple", icon: "🍎", weight: 3 },
  { id: "banana", label: "Banana", icon: "🍌", weight: 4 },
  { id: "orange", label: "Orange", icon: "🍊", weight: 3 },
  { id: "watermelon", label: "Watermelon", icon: "🍉", weight: 9 },
  { id: "pencil", label: "Pencil", icon: "✏️", weight: 2 },
  { id: "book", label: "Book", icon: "📕", weight: 7 },
  { id: "backpack", label: "Backpack", icon: "🎒", weight: 9 },
  { id: "soccer", label: "Soccer Ball", icon: "⚽", weight: 6 },
  { id: "basketball", label: "Basketball", icon: "🏀", weight: 8 },
  { id: "tennis", label: "Tennis Ball", icon: "🎾", weight: 3 },
  { id: "shoe", label: "Shoe", icon: "👟", weight: 5 },
  { id: "spoon", label: "Spoon", icon: "🥄", weight: 2 },
  { id: "teddy", label: "Teddy Bear", icon: "🧸", weight: 6 },
  { id: "rock", label: "Rock", icon: "🪨", weight: 8 },
  { id: "leaf", label: "Leaf", icon: "🍃", weight: 1 },
];

function pickDistinctBalanceThings(count: number): Thing[] {
  return shuffle(BALANCE_OBJECTS).slice(0, count);
}

function makeJudgeQuestion(left: Thing, right: Thing, balanced: boolean): BalanceTask {
  const rightThing = balanced ? right : { ...right, weight: right.weight + 2 };
  return {
    kind: "balanceScale",
    judge: true,
    prompt: "Will it balance?",
    speakText: "Look at the scale. Will it balance? Yes or no?",
    badgeLabel: "Will It Balance?",
    leftItems: [makeBalanceItem(left, "-L")],
    rightItems: [makeBalanceItem(rightThing, "-R")],
    target: "right",
    supply: { mode: "shelf", items: [] },
    feedback: { correct: "Yes, you spotted it!", wrong: "Look again. Do both sides match?" },
  };
}

function makePickSameObjectQuestion(target: Thing, distractorA: Thing, distractorB: Thing): BalanceTask {
  return {
    kind: "balanceScale",
    prompt: "Match the object.",
    speakText: "Pick the same object so the scale balances.",
    badgeLabel: "Match the Object",
    leftItems: [makeBalanceItem(target, "-L")],
    rightItems: [],
    target: "right",
    supply: {
      mode: "shelf",
      items: shuffle([
        makeBalanceItem(target, "-ok"),
        makeBalanceItem(distractorA, "-d1"),
        makeBalanceItem(distractorB, "-d2"),
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
        left: [makeBalanceItem(balancedObj!, "-l")],
        right: [makeBalanceItem(balancedObj!, "-r")],
      },
      {
        id: "scale-1",
        left: [makeBalanceItem(leftA!, "-l1")],
        right: [makeBalanceItem(rightA!, "-r1")],
      },
      {
        id: "scale-2",
        left: [makeBalanceItem(leftB!, "-l2")],
        right: [makeBalanceItem(rightB!, "-r2")],
      },
    ]),
    correctScaleId: balancedId,
    feedback: { correct: "That scale is balanced!", wrong: "Look for the same object on both sides." },
  };
}

function makeFixScaleQuestion(base: Thing, extra: Thing, distractor: Thing): BalanceTask {
  return {
    kind: "balanceScale",
    prompt: "Fix the scale.",
    speakText: "One side has something extra. Choose what will fix the scale.",
    badgeLabel: "Fix the Scale",
    leftItems: [makeBalanceItem(base, "-L")],
    rightItems: [makeBalanceItem(base, "-Rbase"), makeBalanceItem(extra, "-Rextra")],
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
        left: [makeBalanceItem(balancedObj!, "-same-l")],
        right: [makeBalanceItem(balancedObj!, "-same-r")],
      },
      {
        id: "different-1",
        left: [makeBalanceItem(leftA!, "-d1-l")],
        right: [makeBalanceItem(rightA!, "-d1-r")],
      },
      {
        id: "different-2",
        left: [makeBalanceItem(leftB!, "-d2-l")],
        right: [makeBalanceItem(rightB!, "-d2-r")],
      },
    ]),
    correctScaleId,
    feedback: { correct: "Yes — those sides match!", wrong: "Look for the same object on both sides." },
  };
}

export function buildMeasurelandsWeek2QuizTasks(): PracticeTask[] {
  const lesson1: PracticeTask[] = [
    makePairQuestion("heavier", HEAVY[0]!, LIGHT[0]!),
    makePairQuestion("lighter", HEAVY[1]!, LIGHT[1]!),
    makeTrioQuestion("heaviest", TRIO_SETS[0]!),
    makeTrioQuestion("lightest", TRIO_SETS[1]!),
    {
      kind: "measurementCompare",
      scene: "sort",
      prompt: "Is it heavy or light?",
      speakText: "Is the apple heavy or light?",
      badgeLabel: "Heavy or Light Sort",
      objects: [toMassObj({ id: "apple", label: "Apple", icon: "🍎", weight: 3 }, "rose")],
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
