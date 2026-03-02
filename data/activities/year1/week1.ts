import type { PracticeTask, Difficulty } from "./practice-task";
import { diffRange } from "./practice-task";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const lessonBags = new Map<string, number[]>();

function pickFromBag(lessonId: string, count: number) {
  let bag = lessonBags.get(lessonId);
  if (!bag || bag.length === 0) {
    bag = shuffle(Array.from({ length: count }, (_, i) => i));
    lessonBags.set(lessonId, bag);
  }
  return bag.pop() as number;
}

function uniqueInts(n: number, min: number, max: number, avoid: number[] = []) {
  const set = new Set<number>();
  const avoidSet = new Set(avoid);
  while (set.size < n) {
    const x = randInt(min, max);
    if (!avoidSet.has(x)) set.add(x);
  }
  return Array.from(set);
}

export function genY1W1L1(d: Difficulty): PracticeTask {
  const [lo, hi] = diffRange(d, [0, 20], [0, 35], [0, 50]);
  const answer = randInt(lo, hi);
  const distractors = uniqueInts(3, lo, hi)
    .filter((x) => x !== answer)
    .slice(0, 3);
  const options = shuffle([String(answer), ...distractors.map(String)]);

  return {
    kind: "mcq",
    prompt: `Tap the number ${answer}.`,
    options,
    answer: String(answer),
    difficulty: d,
    feedback: {
      correct: "Nice!",
      wrong: "Try again — look carefully at the digits.",
    },
  };
}

export function genY1W1L1_AudioPick(d: Difficulty): PracticeTask {
  const [lo, hi] = diffRange(d, [0, 20], [0, 35], [0, 50]);
  const target = randInt(lo, hi);
  const distractors = uniqueInts(5, lo, hi, [target]);
  const cards = shuffle([target, ...distractors]);

  return {
    kind: "audioPick",
    prompt: "Tap the speaker. Listen. Then tap the correct number.",
    targetNumber: target,
    cards,
    speechText: String(target),
    difficulty: d,
  };
}

export function genY1W1L1_NumberHunt(d: Difficulty): PracticeTask {
  const [lo, hi] = diffRange(d, [0, 20], [0, 35], [0, 50]);
  const target = randInt(lo, hi);
  const tilesCount = 24;
  const distractors = uniqueInts(tilesCount - 1, lo, hi, [target]);
  const tiles = shuffle([target, ...distractors]);

  return {
    kind: "numberHunt",
    prompt: `Find ${target}.`,
    targetNumber: target,
    tiles,
    difficulty: d,
  };
}

export function genY1W1L3_Order(d: Difficulty): PracticeTask {
  const [lo, hi] = diffRange(d, [0, 15], [0, 30], [0, 50]);
  const count = d === "easy" ? 3 : Math.random() < 0.5 ? 3 : 4;
  const nums = uniqueInts(count, lo, hi);
  const direction = Math.random() < 0.5 ? "ASC" : "DESC";

  return {
    kind: "order3",
    prompt:
      direction === "ASC"
        ? "Put the numbers in order (smallest → largest)."
        : "Put the numbers in order (largest → smallest).",
    numbers: nums,
    direction,
    difficulty: d,
  };
}

export function genY1W1L3_TypeNumber(d: Difficulty): PracticeTask {
  const [lo, hi] = diffRange(d, [0, 15], [0, 30], [0, 50]);
  const answer = randInt(lo, hi);
  return {
    kind: "typeNumber",
    prompt: "Type this number.",
    answer,
    min: lo,
    max: hi,
    difficulty: d,
  };
}

export function genY1W1L3_NumberLadder(d: Difficulty): PracticeTask {
  const [lo, hi] = diffRange(d, [0, 15], [0, 30], [0, 50]);
  const start = randInt(lo, hi - 6);
  const up = Math.random() < 0.5;
  const delta = randInt(2, d === "hard" ? 8 : d === "medium" ? 6 : 4);
  const target = up ? Math.min(start + delta, hi) : Math.max(start - delta, lo);

  return {
    kind: "numberLadder",
    prompt: "Number Ladder",
    start,
    target,
    min: lo,
    max: hi,
    difficulty: d,
  };
}

export function genY1W1L3_NumberLineTap(d: Difficulty): PracticeTask {
  const [lo, hi] = diffRange(d, [0, 20], [0, 35], [0, 50]);
  const target = randInt(lo, hi);
  return {
    kind: "numberLineTap",
    prompt: `Tap where ${target} belongs.`,
    min: lo,
    max: hi,
    target,
    difficulty: d,
  };
}

export function genY1W1L3_NumberLineJump(d: Difficulty): PracticeTask {
  const [lo, hi] = diffRange(d, [0, 20], [0, 35], [0, 50]);
  const start = randInt(lo, hi - 5);
  const up = Math.random() < 0.5;
  const step = d === "easy" ? 1 : Math.random() < 0.5 ? 1 : 10;
  const jumps = randInt(2, d === "hard" ? 5 : 3);
  const target = Math.min(hi, Math.max(lo, start + (up ? 1 : -1) * step * jumps));
  return {
    kind: "numberLineJump",
    prompt: `Jump ${up ? "forward" : "back"} ${step}s.`,
    min: lo,
    max: hi,
    start,
    target,
    steps: [step, -step],
    difficulty: d,
  };
}

export function genY1W1L3_ChartFill(d: Difficulty): PracticeTask {
  const [lo, hi] = diffRange(d, [1, 50], [1, 80], [1, 100]);
  const count = d === "easy" ? 3 : d === "medium" ? 5 : 7;
  const missing = uniqueInts(count, lo, hi);
  return {
    kind: "chartFill",
    prompt: "Fill the missing numbers.",
    min: lo,
    max: hi,
    missing,
    difficulty: d,
  };
}

export function genY1W1L1_MatchPairs(d: Difficulty): PracticeTask {
  const [lo, hi] = diffRange(d, [0, 20], [0, 35], [0, 50]);
  return {
    kind: "matchPairs",
    prompt: "Match the pairs.",
    config: { min: lo, max: hi, pairsCount: d === "easy" ? 4 : 6, rounds: 1, mode: "number-number" as const },
    difficulty: d,
  };
}

export function generateWeek1Task(lessonId: string, d: Difficulty = "easy"): PracticeTask {
  if (lessonId === "y1-w1-l1") {
    const kinds = [
      () => genY1W1L1_AudioPick(d),
      () => genY1W1L1_NumberHunt(d),
      () => genY1W1L1_MatchPairs(d),
    ];
    return kinds[pickFromBag(lessonId, kinds.length)]();
  }
  if (lessonId === "y1-w1-l2") {
    const kinds = [
      () => genY1W1L2(d),
      () => genY1W1L2_FillTheJar(d),
      () => genY1W1L2_CountCircle(d),
    ];
    return kinds[pickFromBag(lessonId, kinds.length)]();
  }
  const kinds = [
    () => genY1W1L3_Order(d),
    () => genY1W1L3_TypeNumber(d),
    () => genY1W1L3_NumberLadder(d),
  ];
  return kinds[pickFromBag(lessonId, kinds.length)]();
}

export function genY1W1L2_FillTheJar(d: Difficulty): PracticeTask {
  const [lo, hi] = diffRange(d, [5, 20], [10, 35], [10, 50]);
  return {
    kind: "fillTheJar",
    prompt: "Fill the jar to the target.",
    config: { minTarget: lo, maxTarget: hi, rounds: 1, increments: [1, 2, 5, 10] },
    difficulty: d,
  };
}

export function genY1W1L2(d: Difficulty): PracticeTask {
  const [lo, hi] = diffRange(d, [3, 15], [5, 30], [5, 50]);
  return {
    kind: "countObjects",
    prompt: "How many counters?",
    config: { min: lo, max: hi, rounds: 1, optionsCount: 4 },
    difficulty: d,
  };
}

export function genY1W1L2_CountCircle(d: Difficulty): PracticeTask {
  const [lo, hi] = diffRange(d, [3, 15], [5, 30], [5, 50]);
  return {
    kind: "countCircle",
    prompt: "Circle the counters.",
    config: { minTarget: lo, maxTarget: hi, totalDots: d === "easy" ? 20 : 36, rounds: 1 },
    difficulty: d,
  };
}
