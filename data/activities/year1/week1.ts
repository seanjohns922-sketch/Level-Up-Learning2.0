import type { PracticeTask } from "./practice-task";

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

export function genY1W1L1(): PracticeTask {
  const answer = randInt(0, 50);
  const distractors = uniqueInts(3, 0, 50)
    .filter((x) => x !== answer)
    .slice(0, 3);
  const options = shuffle([String(answer), ...distractors.map(String)]);

  return {
    kind: "mcq",
    prompt: `Tap the number ${answer}.`,
    options,
    answer: String(answer),
    feedback: {
      correct: "Nice!",
      wrong: "Try again — look carefully at the digits.",
    },
  };
}

export function genY1W1L1_AudioPick(): PracticeTask {
  const target = randInt(0, 50);
  const distractors = uniqueInts(5, 0, 50, [target]);
  const cards = shuffle([target, ...distractors]);

  return {
    kind: "audioPick",
    prompt: "Tap the speaker. Listen. Then tap the correct number.",
    targetNumber: target,
    cards,
    speechText: String(target),
  };
}

export function genY1W1L1_NumberHunt(): PracticeTask {
  const target = randInt(0, 50);
  const tilesCount = 24;
  const distractors = uniqueInts(tilesCount - 1, 0, 50, [target]);
  const tiles = shuffle([target, ...distractors]);

  return {
    kind: "numberHunt",
    prompt: `Find ${target}.`,
    targetNumber: target,
    tiles,
  };
}

export function genY1W1L3_Order(): PracticeTask {
  const count = Math.random() < 0.5 ? 3 : 4;
  const nums = uniqueInts(count, 0, 30);
  const direction = Math.random() < 0.5 ? "ASC" : "DESC";

  return {
    kind: "order3",
    prompt:
      direction === "ASC"
        ? "Put the numbers in order (smallest → largest)."
        : "Put the numbers in order (largest → smallest).",
    numbers: nums,
    direction,
  };
}

export function genY1W1L3_TypeNumber(): PracticeTask {
  const answer = randInt(0, 30);
  return {
    kind: "typeNumber",
    prompt: "Type this number.",
    answer,
    min: 0,
    max: 30,
  };
}

export function genY1W1L3_NumberLadder(): PracticeTask {
  const min = 0;
  const max = 30;
  const start = randInt(min, max - 6);
  const up = Math.random() < 0.5;
  const delta = randInt(2, 6);
  const target = up ? Math.min(start + delta, max) : Math.max(start - delta, min);

  return {
    kind: "numberLadder",
    prompt: "Number Ladder",
    start,
    target,
    min,
    max,
  };
}

export function genY1W1L3_NumberLineTap(): PracticeTask {
  const min = 0;
  const max = 50;
  const target = randInt(min, max);
  return {
    kind: "numberLineTap",
    prompt: `Tap where ${target} belongs.`,
    min,
    max,
    target,
  };
}

export function genY1W1L3_NumberLineJump(): PracticeTask {
  const min = 0;
  const max = 50;
  const start = randInt(min, max - 5);
  const up = Math.random() < 0.5;
  const step = Math.random() < 0.5 ? 1 : 10;
  const jumps = randInt(2, 5);
  const target = Math.min(max, Math.max(min, start + (up ? 1 : -1) * step * jumps));
  return {
    kind: "numberLineJump",
    prompt: `Jump ${up ? "forward" : "back"} ${step}s.`,
    min,
    max,
    start,
    target,
    steps: [step, -step],
  };
}

export function genY1W1L3_ChartFill(): PracticeTask {
  const min = 1;
  const max = 100;
  const missing = uniqueInts(5, min, max);
  return {
    kind: "chartFill",
    prompt: "Fill the missing numbers.",
    min,
    max,
    missing,
  };
}

export function genY1W1L1_MatchPairs(): PracticeTask {
  return {
    kind: "matchPairs",
    prompt: "Match the pairs.",
    config: { min: 0, max: 50, pairsCount: 6, rounds: 1, mode: "number-number" },
  };
}

export function generateWeek1Task(lessonId: string): PracticeTask {
  if (lessonId === "y1-w1-l1") {
    const kinds = [
      genY1W1L1_AudioPick,
      genY1W1L1_NumberHunt,
      genY1W1L1_MatchPairs,
    ];
    const pick = kinds[pickFromBag(lessonId, kinds.length)];
    return pick();
  }
  if (lessonId === "y1-w1-l2") {
    const kinds = [genY1W1L2, genY1W1L2_FillTheJar, genY1W1L2_CountCircle];
    const pick = kinds[pickFromBag(lessonId, kinds.length)];
    return pick();
  }
  const kinds = [
    genY1W1L3_Order,
    genY1W1L3_TypeNumber,
    genY1W1L3_NumberLadder,
  ];
  const pick = kinds[pickFromBag(lessonId, kinds.length)];
  return pick();
}

export function genY1W1L2_FillTheJar(): PracticeTask {
  return {
    kind: "fillTheJar",
    prompt: "Fill the jar to the target.",
    config: { minTarget: 10, maxTarget: 50, rounds: 1, increments: [1, 2, 5, 10] },
  };
}

export function genY1W1L2(): PracticeTask {
  return {
    kind: "countObjects",
    prompt: "How many counters?",
    config: { min: 5, max: 50, rounds: 1, optionsCount: 4 },
  };
}

export function genY1W1L2_CountCircle(): PracticeTask {
  return {
    kind: "countCircle",
    prompt: "Circle the counters.",
    config: { minTarget: 5, maxTarget: 50, totalDots: 36, rounds: 1 },
  };
}
