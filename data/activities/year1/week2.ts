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

function makeMcq(prompt: string, options: number[], answer: number): PracticeTask {
  return {
    kind: "mcq",
    prompt,
    options: options.map(String),
    answer: String(answer),
  };
}

function genAudioPick(min = 0, max = 120): PracticeTask {
  const target = randInt(min, max);
  const distractors = uniqueInts(5, min, max, [target]);
  const cards = shuffle([target, ...distractors]);
  return {
    kind: "audioPick",
    prompt: "Tap the speaker. Listen. Then tap the correct number.",
    targetNumber: target,
    cards,
    speechText: String(target),
  };
}

function genNumberHunt(min = 0, max = 120, tilesCount = 24): PracticeTask {
  const target = randInt(min, max);
  const distractors = uniqueInts(tilesCount - 1, min, max, [target]);
  const tiles = shuffle([target, ...distractors]);
  return {
    kind: "numberHunt",
    prompt: `Find ${target}.`,
    targetNumber: target,
    tiles,
  };
}

function genMatchPairs(min = 0, max = 120): PracticeTask {
  return {
    kind: "matchPairs",
    prompt: "Match the pairs.",
    config: { min, max, pairsCount: 6, rounds: 1, mode: "number-number" },
  };
}

function genOrderCompare(min = 0, max = 120): PracticeTask {
  const count = Math.random() < 0.5 ? 3 : 4;
  const nums = uniqueInts(count, min, max);
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

function genBeforeAfter(min = 0, max = 120): PracticeTask {
  const target = randInt(min + 1, max - 1);
  const askAfter = Math.random() < 0.5;
  const answer = askAfter ? target + 1 : target - 1;
  const distractors = uniqueInts(3, min, max, [answer]);
  const options = shuffle([answer, ...distractors]);
  return makeMcq(
    askAfter ? `What number comes after ${target}?` : `What number comes before ${target}?`,
    options,
    answer
  );
}

function genLargest(min = 0, max = 120): PracticeTask {
  const nums = uniqueInts(4, min, max);
  const answer = Math.max(...nums);
  return makeMcq("Which number is the largest?", shuffle(nums), answer);
}

function genNumberLadder(min = 0, max = 120): PracticeTask {
  const start = randInt(min, max - 6);
  const up = Math.random() < 0.5;
  const delta = randInt(2, 8);
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

function genTypeNumber(min = 0, max = 120): PracticeTask {
  const answer = randInt(min, max);
  return {
    kind: "typeNumber",
    prompt: "Write the number.",
    answer,
    min,
    max,
  };
}

function genNumberLineTap(min = 0, max = 120): PracticeTask {
  const target = randInt(min, max);
  return {
    kind: "numberLineTap",
    prompt: `Tap where ${target} belongs.`,
    min,
    max,
    target,
  };
}

function genNumberLineJump(min = 0, max = 120): PracticeTask {
  const start = randInt(min, max - 10);
  const up = Math.random() < 0.5;
  const step = Math.random() < 0.5 ? 1 : 10;
  const jumps = randInt(2, 6);
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

function genChartFill(min = 1, max = 120): PracticeTask {
  const missing = uniqueInts(6, min, max);
  return {
    kind: "chartFill",
    prompt: "Fill the missing numbers.",
    min,
    max,
    missing,
  };
}

export function generateWeek2Task(lessonId: string): PracticeTask {
  if (lessonId === "y1-w2-l1") {
    const kinds = [
      () => genAudioPick(0, 120),
      () => genNumberHunt(0, 120, 24),
      () => genMatchPairs(0, 120),
    ];
    return kinds[pickFromBag(lessonId, kinds.length)]();
  }
  if (lessonId === "y1-w2-l2") {
    const kinds = [
      () => genOrderCompare(0, 120),
      () => genBeforeAfter(0, 120),
      () => genLargest(0, 120),
    ];
    return kinds[pickFromBag(lessonId, kinds.length)]();
  }
  const kinds = [
    () => genNumberLineTap(0, 120),
    () => genNumberLineJump(0, 120),
    () => genChartFill(1, 120),
  ];
  return kinds[pickFromBag(lessonId, kinds.length)]();
}
