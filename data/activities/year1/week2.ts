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

export function resetWeek2TaskSessionState() {
  lessonBags.clear();
}

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

function makeMcq(prompt: string, options: number[], answer: number, d: Difficulty): PracticeTask {
  return {
    kind: "mcq",
    prompt,
    options: options.map(String),
    answer: String(answer),
    difficulty: d,
  };
}

function genAudioPick(d: Difficulty, min = 0, max = 120): PracticeTask {
  const [lo, hi] = diffRange(d, [0, 50], [0, 80], [min, max]);
  const target = randInt(lo, hi);
  const distractors = uniqueInts(5, lo, hi, [target]);
  const cards = shuffle([target, ...distractors]);
  return { kind: "audioPick", prompt: "Tap the speaker. Listen. Then tap the correct number.", targetNumber: target, cards, speechText: String(target), difficulty: d };
}

function genNumberHunt(d: Difficulty, min = 0, max = 120, tilesCount = 24): PracticeTask {
  const [lo, hi] = diffRange(d, [0, 50], [0, 80], [min, max]);
  const target = randInt(lo, hi);
  const distractors = uniqueInts(tilesCount - 1, lo, hi, [target]);
  const tiles = shuffle([target, ...distractors]);
  return { kind: "numberHunt", prompt: `Find ${target}.`, targetNumber: target, tiles, difficulty: d };
}

function genMatchPairs(d: Difficulty, min = 0, max = 120): PracticeTask {
  const [lo, hi] = diffRange(d, [0, 50], [0, 80], [min, max]);
  return { kind: "matchPairs", prompt: "Match the pairs.", config: { min: lo, max: hi, pairsCount: d === "easy" ? 4 : 6, rounds: 1, mode: "number-number" as const }, difficulty: d };
}

function genOrderCompare(d: Difficulty, min = 0, max = 120): PracticeTask {
  const [lo, hi] = diffRange(d, [0, 50], [0, 80], [min, max]);
  const count = d === "easy" ? 3 : Math.random() < 0.5 ? 3 : 4;
  const nums = uniqueInts(count, lo, hi);
  const direction = Math.random() < 0.5 ? "ASC" : "DESC";
  return { kind: "order3", prompt: direction === "ASC" ? "Put the numbers in order (smallest → largest)." : "Put the numbers in order (largest → smallest).", numbers: nums, direction, difficulty: d };
}

function genBeforeAfter(d: Difficulty, min = 0, max = 120): PracticeTask {
  const [lo, hi] = diffRange(d, [0, 50], [0, 80], [min, max]);
  const target = randInt(lo + 1, hi - 1);
  const askAfter = Math.random() < 0.5;
  const answer = askAfter ? target + 1 : target - 1;
  const distractors = uniqueInts(3, lo, hi, [answer]);
  const options = shuffle([answer, ...distractors]);
  return makeMcq(askAfter ? `What number comes after ${target}?` : `What number comes before ${target}?`, options, answer, d);
}

function genLargest(d: Difficulty, min = 0, max = 120): PracticeTask {
  const [lo, hi] = diffRange(d, [0, 50], [0, 80], [min, max]);
  const nums = uniqueInts(4, lo, hi);
  const answer = Math.max(...nums);
  return makeMcq("Which number is the largest?", shuffle(nums), answer, d);
}

function genNumberLadder(d: Difficulty, min = 0, max = 120): PracticeTask {
  const [lo, hi] = diffRange(d, [0, 50], [0, 80], [min, max]);
  const start = randInt(lo, hi - 6);
  const up = Math.random() < 0.5;
  const delta = randInt(2, d === "hard" ? 8 : d === "medium" ? 6 : 4);
  const target = up ? Math.min(start + delta, hi) : Math.max(start - delta, lo);
  return { kind: "numberLadder", prompt: "Number Ladder", start, target, min: lo, max: hi, difficulty: d };
}

function genTypeNumber(d: Difficulty, min = 0, max = 120): PracticeTask {
  const [lo, hi] = diffRange(d, [0, 50], [0, 80], [min, max]);
  const answer = randInt(lo, hi);
  return { kind: "typeNumber", prompt: "Write the number.", answer, min: lo, max: hi, difficulty: d };
}

function genNumberLineTap(d: Difficulty, min = 0, max = 120): PracticeTask {
  const [lo, hi] = diffRange(d, [0, 50], [0, 80], [min, max]);
  const target = randInt(lo, hi);
  return { kind: "numberLineTap", prompt: `Tap where ${target} belongs.`, min: lo, max: hi, target, difficulty: d };
}

function genNumberLineJump(d: Difficulty, min = 0, max = 120): PracticeTask {
  const [lo, hi] = diffRange(d, [0, 50], [0, 80], [min, max]);
  const start = randInt(lo, hi - 10);
  const up = Math.random() < 0.5;
  const step = d === "easy" ? 1 : Math.random() < 0.5 ? 1 : 10;
  const jumps = randInt(2, d === "hard" ? 6 : 4);
  const target = Math.min(hi, Math.max(lo, start + (up ? 1 : -1) * step * jumps));
  return { kind: "numberLineJump", prompt: `Jump ${up ? "forward" : "back"} ${step}s.`, min: lo, max: hi, start, target, steps: [step, -step], difficulty: d };
}

function genChartFill(d: Difficulty, min = 1, max = 120): PracticeTask {
  const [lo, hi] = diffRange(d, [1, 50], [1, 80], [min, max]);
  const count = d === "easy" ? 3 : d === "medium" ? 5 : 7;
  const missing = uniqueInts(count, lo, hi);
  return { kind: "chartFill", prompt: "Fill the missing numbers.", min: lo, max: hi, missing, difficulty: d };
}

export function generateWeek2Task(lessonId: string, d: Difficulty = "easy"): PracticeTask {
  if (lessonId === "y1-w2-l1") {
    const kinds = [
      () => genAudioPick(d, 0, 120),
      () => genNumberHunt(d, 0, 120, 24),
      () => genMatchPairs(d, 0, 120),
    ];
    return kinds[pickFromBag(lessonId, kinds.length)]();
  }
  if (lessonId === "y1-w2-l2") {
    const kinds = [
      () => genOrderCompare(d, 0, 120),
      () => genBeforeAfter(d, 0, 120),
      () => genLargest(d, 0, 120),
    ];
    return kinds[pickFromBag(lessonId, kinds.length)]();
  }
  const kinds = [
    () => genNumberLineTap(d, 0, 120),
    () => genNumberLineJump(d, 0, 120),
    () => genChartFill(d, 1, 120),
  ];
  return kinds[pickFromBag(lessonId, kinds.length)]();
}
